import * as d3 from 'd3';

export const PADDING = 3;
export const BORDER_RADIUS = 4;

/**
 * Appends the standard styled poster (background rect + image) to a selection.
 * Assumes the selection is a 'g' element that serves as the container.
 * The rect and image are centered at (0,0) of this container.
 */
export const appendStyledPoster = (
    selection: d3.Selection<SVGGElement, any, any, any>,
    posterWidth: number,
    posterHeight: number
) => {
    const totalW = posterWidth + PADDING * 2;
    const totalH = posterHeight + PADDING * 2;

    // Background/Border Rect
    const bgRect = selection
        .append('rect')
        .attr('class', 'poster-bg')
        .attr('width', totalW)
        .attr('height', totalH)
        .attr('x', -totalW / 2)
        .attr('y', -totalH / 2)
        .attr('rx', BORDER_RADIUS)
        .attr('ry', BORDER_RADIUS)
        .attr('fill', 'white')
        .attr('stroke', '#e5e7eb') // Light gray border
        .attr('stroke-width', 1)
        .style('filter', 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))'); // Soft shadow

    // Poster Image
    const image = selection
        .append('image')
        .attr('class', 'poster-img')
        .attr('width', posterWidth)
        .attr('height', posterHeight)
        .attr('x', -posterWidth / 2)
        .attr('y', -posterHeight / 2)
        .attr('preserveAspectRatio', 'xMinYMin slice')
        .attr('clip-path', 'inset(0px round 2px)');

    return { bgRect, image, totalW, totalH };
};

/**
 * Fisheye distortion function for 1D coordinates in a 2D space.
 * @param val The value to distort (coordinate).
 * @param focus The focus point (mouse position).
 * @param distortionFactor The strength of the distortion.
 * @param min The minimum value of the range (bounds).
 * @param max The maximum value of the range (bounds).
 * @returns The distorted value.
 */
export const fisheye = (val: number, focus: number, distortionFactor: number, min: number, max: number): number => {
    const leftDist = focus - min;
    const rightDist = max - focus;

    if (val < focus) {
        if (leftDist === 0) return val;
        const t = (focus - val) / leftDist;
        const d = distortionFactor;
        const t_distorted = ((d + 1) * t) / (d * t + 1);
        return focus - t_distorted * leftDist;
    } else {
        if (rightDist === 0) return val;
        const t = (val - focus) / rightDist;
        const d = distortionFactor;
        const t_distorted = ((d + 1) * t) / (d * t + 1);
        return focus + t_distorted * rightDist;
    }
};

/**
 * Attaches standard interaction handlers (hover, click, sticky) to movie nodes.
 * Assumes the generic structure:
 *  - Selection is a group 'g.movie-node'.
 *  - Content to scale is a child 'g.node-content'.
 *  - Parent transform provides current position (translate(cx, cy)).
 */
export const attachNodeInteractions = <T extends { id: string }>(
    nodes: d3.Selection<SVGGElement, T, any, any>,
    config: {
        onHoverRef: React.MutableRefObject<((id: string) => void) | undefined>;
        stickyIdRef: React.MutableRefObject<string | null>;
        posterWidth: number;
        posterHeight: number;
        innerWidth: number;
        innerHeight: number;
        scaleFactor?: number;
    }
) => {
    const { onHoverRef, stickyIdRef, posterWidth, posterHeight, innerWidth, innerHeight, scaleFactor = 1.5 } = config;
    const padding = PADDING;
    const totalW = posterWidth + padding * 2;
    const totalH = posterHeight + padding * 2;

    const resetNodeVisuals = (node: d3.Selection<d3.BaseType, unknown, any, any>) => {
        const content = node.select('.node-content');
        content.transition().duration(200).attr('transform', 'translate(0,0) scale(1)');
        content.select('rect').style('filter', 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))');
    };

    nodes
        .on('click', (event, d) => {
            event.stopPropagation();
            const currentSticky = stickyIdRef.current;

            if (currentSticky === d.id) {
                // Unlock
                stickyIdRef.current = null;
                // Visuals remain in hover state until mouse leaves
            } else {
                // Lock new item
                if (currentSticky) {
                    // Reset previous sticky
                    // Note: This matches ANY node with that ID (across charts)
                    d3.selectAll('.movie-node')
                        .filter((n: unknown) => (n as { id: string }).id === currentSticky)
                        .each(function () {
                            resetNodeVisuals(d3.select(this));
                        });
                }
                stickyIdRef.current = d.id;

                // Raise all nodes with this ID
                d3.selectAll(`.node-id-${d.id}`).raise();

                // Update selection
                if (onHoverRef.current) onHoverRef.current(d.id);
            }
        })
        .on('mouseenter', function (_, d) {
            // Select ALL nodes with this ID (for decoupled chart sync)
            const relevantNodes = d3.selectAll(`.node-id-${d.id}`);
            relevantNodes.raise();
            relevantNodes.style('cursor', 'pointer');

            // Animate .node-content
            relevantNodes
                .select('.node-content')
                .transition()
                .duration(200)
                .attr('transform', function () {
                    // Calculate Edge-Aware Shift
                    const parent = (this as Element).parentNode as Element;
                    const parentTransform = d3.select(parent).attr('transform');
                    let cx = 0,
                        cy = 0;
                    if (parentTransform) {
                        const match = /translate\(([^,]+),\s*([^)]+)\)/.exec(parentTransform);
                        if (match) {
                            cx = parseFloat(match[1]);
                            cy = parseFloat(match[2]);
                        }
                    }

                    // For 'ContinuousCoupled' which stores data-cx/cy, we might want to prefer that?
                    // But parsing transform is universal for both.

                    const expandedHalfW = (totalW * scaleFactor) / 2;
                    const expandedHalfH = (totalH * scaleFactor) / 2;
                    const safeMargin = 4;

                    let shiftX = 0;
                    if (cx < expandedHalfW) {
                        shiftX = expandedHalfW - cx + safeMargin;
                    } else if (cx > innerWidth - expandedHalfW) {
                        shiftX = innerWidth - expandedHalfW - safeMargin - cx;
                    }

                    let shiftY = 0;
                    if (cy < expandedHalfH) {
                        shiftY = expandedHalfH - cy + safeMargin;
                    } else if (cy > innerHeight - expandedHalfH) {
                        shiftY = innerHeight - expandedHalfH - safeMargin - cy;
                    }

                    return `translate(${shiftX}, ${shiftY}) scale(${scaleFactor})`;
                })
                .select('rect')
                .style('filter', 'drop-shadow(0px 8px 12px rgba(0,0,0,0.5))');

            if (onHoverRef.current && !stickyIdRef.current) {
                onHoverRef.current(d.id);
            }
        })
        .on('mouseleave', (_, d) => {
            if (stickyIdRef.current === d.id) return;

            const relevantNodes = d3.selectAll(`.node-id-${d.id}`);
            resetNodeVisuals(relevantNodes);

            if (onHoverRef.current && !stickyIdRef.current) {
                onHoverRef.current('');
            }
        });
};

// Shared Axis Labels
export const X_AXIS_LABEL_ONE = "The system's predicted movie rating for you";
export const Y_AXIS_LABEL_ONE = 'Ratings from everyone else in the system';

export type VizScales = {
    xScale: d3.ScaleLinear<number, number>;
    yScale: d3.ScaleLinear<number, number>;
};

/**
 * Renders the background grid and axes using the "manual line" approach to support Fisheye.
 * Returns selections for the dynamic elements (lines, ticks) that need updates during interaction.
 */
export const renderVizGrid = (
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    scales: VizScales,
    dimensions: { innerWidth: number; innerHeight: number },
    config: {
        drawYGridLines?: boolean;
        drawYAxis?: boolean;
        hideYAxisLabels?: boolean;
        xTickValues?: number[];
        yTickValues?: number[];
    } = {
        drawYGridLines: false,
        drawYAxis: false,
        hideYAxisLabels: false,
    }
) => {
    const { xScale, yScale } = scales;
    const { innerWidth, innerHeight } = dimensions;
    const {
        drawYGridLines = false,
        drawYAxis = false,
        hideYAxisLabels = false,
        xTickValues = d3.range(10, 51).map((x) => x / 10),
        yTickValues = d3.range(10, 51).map((x) => x / 10),
    } = config;

    // Use integer range for clarity, mapped to 0.1 steps
    const gridTickValues = xTickValues;
    const yGridTickValues = yTickValues;

    // Label Ticks: 0.5 steps
    const labelTickValues = d3.range(10, 51, 5).map((x) => x / 10);

    // Group for Grid Lines
    const gridGroup = g.append('g').attr('class', 'grid-group').attr('transform', `translate(0,${innerHeight})`);

    // Draw Vertical Lines (X-axis grid)
    // Note: These originate from bottom (y=0 in group) and go up (-innerHeight)
    const xLines = gridGroup
        .selectAll<SVGLineElement, number>('.grid-line-x')
        .data(gridTickValues)
        .join('line')
        .attr('class', 'grid-line-x')
        .attr('x1', (d) => xScale(d))
        .attr('x2', (d) => xScale(d))
        .attr('y1', 0)
        .attr('y2', -innerHeight)
        .attr('stroke', '#cccccc')
        .attr('stroke-opacity', 0.7)
        .attr('shape-rendering', 'crispEdges');

    let yLines: d3.Selection<SVGLineElement, number, SVGGElement, unknown> | undefined;

    if (drawYGridLines) {
        // Draw Horizontal Lines (Y-axis grid)
        // Draw Y lines directly on `g` (Top-Left) instead of `gridGroup` (Bottom).

        yLines = g
            .insert('g', '.grid-group') // Insert before x-grid
            .attr('class', 'grid-group-y')
            .selectAll<SVGLineElement, number>('.grid-line-y')
            .data(yGridTickValues)
            .join('line')
            .attr('class', 'grid-line-y')
            .attr('x1', 0)
            .attr('x2', innerWidth)
            .attr('y1', (d) => yScale(d))
            .attr('y2', (d) => yScale(d))
            .attr('stroke', '#cccccc')
            .attr('stroke-opacity', 0.7)
            .attr('shape-rendering', 'crispEdges');
    }

    // Bottom Axis Domain (Line)
    gridGroup.append('path').attr('class', 'domain').attr('d', `M0,0H${innerWidth}`).attr('stroke', 'currentColor');

    // Left Axis Tick Marks (if needed) or just the line
    if (drawYAxis) {
        g.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 0) // Domain line for Y
            .attr('y2', innerHeight)
            .attr('stroke', 'currentColor');
    }

    // Ticks (Labels)
    const axisGroup = g.append('g').attr('class', 'axis-group').attr('transform', `translate(0, ${innerHeight})`);

    // Bottom Axis Ticks (X)
    const xTicks = axisGroup
        .selectAll<SVGGElement, number>('.tick-mark-x')
        .data(labelTickValues)
        .join('g')
        .attr('class', 'tick-mark-x')
        .attr('transform', (d) => `translate(${xScale(d)}, 0)`);

    xTicks.append('line').attr('y2', 6).attr('stroke', 'currentColor');
    xTicks
        .append('text')
        .attr('dy', '0.71em')
        .attr('y', 9)
        .attr('text-anchor', 'middle')
        .attr('fill', 'currentColor')
        .style('font-size', '10px')
        .style('font-weight', 'bold') // Added to match
        .text((d) => (d % 1 === 0 ? d.toFixed(0) : d.toFixed(1)));

    let yTicks: d3.Selection<SVGGElement, number, SVGGElement, unknown> | undefined;

    if (drawYAxis && !hideYAxisLabels) {
        // Left Axis Ticks (Y)
        const yAxisGroup = g.append('g').attr('class', 'axis-group-y');

        yTicks = yAxisGroup
            .selectAll<SVGGElement, number>('.tick-mark-y')
            .data(labelTickValues)
            .join('g')
            .attr('class', 'tick-mark-y')
            .attr('transform', (d) => `translate(0, ${yScale(d)})`);

        yTicks.append('line').attr('x2', -6).attr('stroke', 'currentColor');
        yTicks
            .append('text')
            .attr('dy', '0.32em')
            .attr('x', -9)
            .attr('text-anchor', 'end')
            .attr('fill', 'currentColor')
            .style('font-size', '10px')
            .style('font-weight', 'bold')
            .text((d) => (d % 1 === 0 ? d.toFixed(0) : d.toFixed(1)));
    }

    return { xLines, yLines, xTicks, yTicks };
};

/**
 * Attaches Fisheye interaction behavior to a D3 selection.
 * Handles both 1D (x-axis only) and 2D (x and y axes) distortion.
 *
 * @param svg The SVG container selection to attach event listeners to.
 * @param elements Object containing selections for the grid lines, ticks, and nodes to update.
 * @param config Configuration object containing scales, dimensions, fisheye toggle, accessors, and mode.
 */
export const attachFisheyeBehavior = <T>(
    svg: d3.Selection<any, unknown, null, undefined>,
    // Elements to update
    elements: {
        xLines?: d3.Selection<SVGLineElement, number, any, any>;
        yLines?: d3.Selection<SVGLineElement, number, any, any>;
        xTicks?: d3.Selection<SVGGElement, number, any, any>;
        yTicks?: d3.Selection<SVGGElement, number, any, any>;
        nodes: d3.Selection<SVGGElement, T, any, any>;
    },
    // Configuration
    config: {
        scales: VizScales;
        dimensions: { innerWidth: number; innerHeight: number; margin: { left: number; top: number } };
        isFisheye: boolean;
        getX: (d: T) => number;
        getY: (d: T) => number;
        mode: '1D' | '2D';
    }
) => {
    const { xLines, yLines, xTicks, yTicks, nodes } = elements;
    const { scales, dimensions, isFisheye, getX, getY, mode } = config;
    const { xScale, yScale } = scales;
    const { innerWidth, innerHeight, margin } = dimensions;

    svg.on('mousemove.fisheye', (event) => {
        const [mx, my] = d3.pointer(event);
        // Mouse is relative to SVG
        const focusX = mx - margin.left;
        const focusY = my - margin.top;

        if (focusX < 0 || focusX > innerWidth || (mode === '2D' && (focusY < 0 || focusY > innerHeight))) return;

        const df = isFisheye ? 3.0 : 0;

        // X Updates
        if (xLines) {
            xLines
                .attr('x1', (d) => fisheye(xScale(d), focusX, df, 0, innerWidth))
                .attr('x2', (d) => fisheye(xScale(d), focusX, df, 0, innerWidth));
        }
        if (xTicks) {
            xTicks.attr('transform', (d) => `translate(${fisheye(xScale(d), focusX, df, 0, innerWidth)}, 0)`);
        }

        // Y Updates (only 2D)
        if (mode === '2D') {
            if (yLines) {
                yLines
                    .attr('y1', (d) => fisheye(yScale(d), focusY, df, 0, innerHeight))
                    .attr('y2', (d) => fisheye(yScale(d), focusY, df, 0, innerHeight));
            }
            if (yTicks) {
                yTicks.attr('transform', (d) => `translate(0, ${fisheye(yScale(d), focusY, df, 0, innerHeight)})`);
            }
        }

        // Node Updates
        nodes.attr('transform', (d) => {
            const ox = xScale(getX(d));
            const nx = fisheye(ox, focusX, df, 0, innerWidth);

            let ny = 0;
            if (mode === '2D') {
                const oy = yScale(getY(d));
                ny = fisheye(oy, focusY, df, 0, innerHeight);
            } else {
                // 1D Mode: Fixed Y or pre-calculated
                ny = getY(d);
            }
            return `translate(${nx}, ${ny})`;
        });
    });

    svg.on('mouseleave.fisheye', () => {
        // Reset X
        if (xLines) xLines.attr('x1', (d) => xScale(d)).attr('x2', (d) => xScale(d));
        if (xTicks) xTicks.attr('transform', (d) => `translate(${xScale(d)}, 0)`);

        // Reset Y
        if (mode === '2D') {
            if (yLines) yLines.attr('y1', (d) => yScale(d)).attr('y2', (d) => yScale(d));
            if (yTicks) yTicks.attr('transform', (d) => `translate(0, ${yScale(d)})`);
        }

        // Reset Nodes
        nodes.attr('transform', (d) => {
            const cx = xScale(getX(d));
            const cy = mode === '2D' ? yScale(getY(d)) : getY(d);
            return `translate(${cx}, ${cy})`;
        });
    });
};
