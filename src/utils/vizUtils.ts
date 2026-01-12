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
export const attachNodeInteractions = (
    nodes: d3.Selection<SVGGElement, any, any, any>,
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

    const resetNodeVisuals = (node: d3.Selection<any, any, any, any>) => {
        const content = node.select('.node-content');
        content.transition().duration(200).attr('transform', 'translate(0,0) scale(1)');
        content.select('rect').style('filter', 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))');
    };

    nodes
        .on('click', (event, d: any) => {
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
                        .filter((n: any) => n.id === currentSticky)
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
        .on('mouseenter', function (_, d: any) {
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
        .on('mouseleave', (_, d: any) => {
            if (stickyIdRef.current === d.id) return;

            const relevantNodes = d3.selectAll(`.node-id-${d.id}`);
            resetNodeVisuals(relevantNodes);

            if (onHoverRef.current && !stickyIdRef.current) {
                onHoverRef.current('');
            }
        });
};
