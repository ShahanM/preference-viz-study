import * as d3 from 'd3';
import { useEffect, useRef, useMemo } from 'react';
import type {
    DataAugmentedItem,
    PreferenceVizComponentProps,
    PreferenceVizRecommendedItem,
} from '../../types/preferenceVisualization.types';

const posterWidth = 54;
const posterHeight = 81;

const X_AXIS_LABEL_ONE = "The system's predicted movie rating for you";
const X_AXIS_LABEL_TWO = 'Ratings from everyone else in the system';

const ContinuousDecoupled: React.FC<PreferenceVizComponentProps<PreferenceVizRecommendedItem>> = ({
    width,
    height,
    data,
    onHover,
    isFisheye = false,
}) => {
    const svgRefs = useRef<(SVGSVGElement | null)[]>([]);

    const simNodeData = useMemo(() => {
        if (!data) return data;
        const myPrefOrder: DataAugmentedItem[] = [];
        const commPrefOrder: DataAugmentedItem[] = [];
        Object.values(data).forEach((d) => {
            myPrefOrder.push({ ...d, x: d.user_score });
            commPrefOrder.push({ ...d, x: d.community_score });
        });
        return { myPrefs: myPrefOrder, commPrefs: commPrefOrder };
    }, [data]);

    const onHoverRef = useRef(onHover);
    useEffect(() => {
        onHoverRef.current = onHover;
    }, [onHover]);

    useEffect(() => {
        if (!simNodeData || width === 0 || height === 0) return;

        const svgHeight = height / 4;
        const margin = { top: 20, right: 15, bottom: 60, left: 10 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = svgHeight - margin.top - margin.bottom;

        // Scale 1-5, with padding to keep posters (centers) inside
        const xRangePadding = posterWidth / 2;
        const xScale = d3
            .scaleLinear()
            .domain([1, 5])
            .range([xRangePadding, innerWidth - xRangePadding]);

        const yScale = d3.scaleLinear().domain([0, 5]).range([innerHeight, 0]);

        const dataArrays = [simNodeData.myPrefs, simNodeData.commPrefs];

        // Fisheye Distortion Logic
        const fisheye = (x: number, focus: number, distortionFactor: number) => {
            const min = 0;
            const max = innerWidth;

            // Normalize x to [0, 1] relative to focus
            const leftDist = focus - min;
            const rightDist = max - focus;

            if (x < focus) {
                if (leftDist === 0) return x;
                const t = (focus - x) / leftDist;
                const d = distortionFactor;
                const t_distorted = ((d + 1) * t) / (d * t + 1);
                return focus - t_distorted * leftDist;
            } else {
                if (rightDist === 0) return x;
                const t = (x - focus) / rightDist;
                const d = distortionFactor;
                const t_distorted = ((d + 1) * t) / (d * t + 1);
                return focus + t_distorted * rightDist;
            }
        };

        svgRefs.current.forEach((svgRef, i) => {
            if (!svgRef) return;

            const svg = d3.select(svgRef).attr('width', width).attr('height', svgHeight);
            svg.selectAll('*').remove();
            // Background rect to capture mouse events across the full area
            svg.append('rect').attr('width', width).attr('height', svgHeight).attr('fill', 'transparent');

            const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
            const label = i === 0 ? X_AXIS_LABEL_ONE : X_AXIS_LABEL_TWO;

            g.append('style').text(
                `.grid line { stroke: #ccccccff; stroke-opacity: 0.7; shape-rendering: crispEdges; }`
            );

            // Explicitly draw the right-side boundary line to close the chart
            g.append('line')
                .attr('x1', innerWidth)
                .attr('y1', 0)
                .attr('x2', innerWidth)
                .attr('y2', innerHeight)
                .attr('stroke', '#000000') // Match axis color (usually black or dark grey)
                .attr('shape-rendering', 'crispEdges');

            const tickValues = d3.range(1, 5.1, 0.5);

            // Grid Lines (Vertical)
            const gridGroup = g.append('g').attr('class', 'grid').attr('transform', `translate(0,${innerHeight})`);

            // We draw manually to allow easy updates
            const gridLines = gridGroup
                .selectAll('.grid-line')
                .data(tickValues)
                .join('line')
                .attr('class', 'grid-line')
                .attr('x1', (d) => xScale(d))
                .attr('x2', (d) => xScale(d))
                .attr('y1', 0)
                .attr('y2', -innerHeight)
                .attr('stroke', '#cccccc')
                .attr('stroke-opacity', 0.7);

            // Bottom Axis Domain
            gridGroup
                .append('path')
                .attr('class', 'domain')
                .attr('d', `M0.5,0.5H${innerWidth}`)
                .attr('stroke', 'currentColor');

            // Left Axis
            g.append('g')
                .attr('class', 'grid')
                .call(
                    d3
                        .axisLeft(yScale)
                        .ticks(25)
                        .tickSize(-innerWidth)
                        .tickFormat(() => '')
                );

            // Bottom Axis Ticks (Manually managed for distortion)
            const axisGroup = g.append('g').attr('transform', `translate(0, ${innerHeight})`);

            axisGroup
                .append('path')
                .attr('class', 'domain')
                .attr('d', `M0.5,0.5H${innerWidth}`)
                .attr('stroke', 'currentColor');

            const ticks = axisGroup
                .selectAll('.tick-mark')
                .data(tickValues)
                .join('g')
                .attr('class', 'tick-mark')
                .attr('transform', (d) => `translate(${xScale(d)}, 0)`);

            ticks.append('line').attr('y2', 6).attr('stroke', 'currentColor');

            ticks
                .append('text')
                .attr('dy', '0.71em')
                .attr('y', 9)
                .attr('text-anchor', 'middle')
                .attr('fill', 'currentColor')
                .style('font-size', '10px')
                .text((d) => (d % 1 === 0 ? d.toFixed(0) : d.toFixed(1)));

            svg.append('text')
                .attr('x', innerWidth / 2 + margin.left)
                .attr('y', svgHeight - 5)
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .text(label);

            const images = g
                .selectAll<SVGImageElement, DataAugmentedItem>('image')
                .data(dataArrays[i], (d: DataAugmentedItem) => d.id)
                .join('image')
                .attr('class', (d) => `poster-image poster-id-${d.id}`)
                .attr('xlink:href', (d) => d.tmdb_poster)
                .attr('width', posterWidth)
                .attr('height', posterHeight)
                .attr('preserveAspectRatio', 'xMinYMin slice')
                .attr('data-ox', (d) => xScale(d.x!) - posterWidth / 2) // Original linear pos
                .attr('data-oy', (innerHeight - posterHeight) / 2)
                .attr('box-x', (d) => xScale(d.x!)) // Center X for calculation
                .attr('x', (d) => xScale(d.x!) - posterWidth / 2)
                .attr('y', (innerHeight - posterHeight) / 2)
                .style('cursor', 'pointer')
                .on('mouseenter', function (_, d) {
                    d3.selectAll(`.poster-id-${d.id}`)
                        .raise()
                        .transition()
                        .duration(150)
                        .attr('width', posterWidth * 1.5)
                        .attr('height', posterHeight * 1.5)
                        // Expand relative to CURRENT center of EACH specific element
                        .attr('x', function () {
                            // If this element has a 'current-x' (distorted), use it.
                            // Otherwise use 'data-ox' (undistorted/original).
                            const cxAttr = d3.select(this).attr('current-x');
                            const center = cxAttr ? parseFloat(cxAttr) : parseFloat(d3.select(this).attr('data-ox'));

                            // We want the new X to be centered around this point with the NEW width
                            // x = center - (newWidth/2)
                            // wait, center is top-left in the stored attrs?
                            // No, data-ox is x-pos (left edge).
                            // We need to recover the CENTER of the poster for stable expansion.
                            // Center = current_left_edge + (current_width / 2)
                            // Actually, let's look at how we calculate things.
                            // newX = distortedCenter - posterWidth/2. So newX is the LEFT edge.

                            // So the center relative to the axis is X + posterWidth/2.
                            // We want the new LEFT edge (X') such that X' + newWidth/2 == Center.
                            // X' = Center - newWidth/2
                            // X' = (X + oldWidth/2) - newWidth/2
                            // X' = X - (newWidth - oldWidth) / 2

                            return center - (posterWidth * 1.5 - posterWidth) / 2;
                        })
                        .attr('y', (innerHeight - posterHeight * 1.5) / 2);

                    if (onHoverRef.current) onHoverRef.current(d.id);
                })
                .on('mouseleave', function (_, d) {
                    // Return to current distorted position (from attribute)
                    d3.selectAll(`.poster-id-${d.id}`)
                        .transition()
                        .duration(150)
                        .attr('width', posterWidth)
                        .attr('height', posterHeight)
                        .attr('x', function () {
                            const currentX = d3.select(this).attr('current-x');
                            return currentX ? parseFloat(currentX) : parseFloat(d3.select(this).attr('data-ox'));
                        })
                        .attr('y', function () {
                            return parseFloat(d3.select(this).attr('data-oy'));
                        });

                    if (onHoverRef.current) onHoverRef.current('');
                });

            // Interaction Handlers on SVG
            svg.on('mousemove', (event) => {
                const [mx] = d3.pointer(event);
                const focus = mx - margin.left; // Adjust to graph coordinates

                // Only distort if within graph bounds
                if (focus < 0 || focus > innerWidth) return;

                // Toggle distortion based on prop
                const dynamicFactor = isFisheye ? 3.0 : 0;

                // Update Grid Lines
                gridLines
                    .attr('x1', (d) => fisheye(xScale(d), focus, dynamicFactor))
                    .attr('x2', (d) => fisheye(xScale(d), focus, dynamicFactor));

                // Update Ticks
                ticks.attr('transform', (d) => `translate(${fisheye(xScale(d), focus, dynamicFactor)}, 0)`);

                // Update Images
                images.attr('x', function (d) {
                    const originalCenter = xScale(d.x!);
                    const distortedCenter = fisheye(originalCenter, focus, dynamicFactor);
                    const newX = distortedCenter - posterWidth / 2;
                    d3.select(this).attr('current-x', newX); // Store for hover logic

                    // If currently hovering this specific image (width is expanded), adjust center
                    const w = parseFloat(d3.select(this).attr('width'));
                    if (w > posterWidth) {
                        return distortedCenter - w / 2;
                    }
                    return newX;
                });
            });

            svg.on('mouseleave', () => {
                // Reset to linear
                gridLines.attr('x1', (d) => xScale(d)).attr('x2', (d) => xScale(d));

                ticks.attr('transform', (d) => `translate(${xScale(d)}, 0)`);

                images.attr('x', function () {
                    d3.select(this).attr('current-x', null);
                    const w = parseFloat(d3.select(this).attr('width'));
                    const ox = parseFloat(d3.select(this).attr('data-ox'));
                    const center = ox + posterWidth / 2;
                    if (w > posterWidth) return center - w / 2;
                    return ox;
                });
            });
        });
    }, [simNodeData, width, height]);

    const setSvgRef = (index: number) => (element: SVGSVGElement | null) => {
        svgRefs.current[index] = element;
    };

    return (
        <>
            <svg ref={setSvgRef(0)}></svg>
            <svg ref={setSvgRef(1)}></svg>
        </>
    );
};

export default ContinuousDecoupled;
