import * as d3 from 'd3';
import { useEffect, useMemo, useRef } from 'react';
import type {
    DataAugmentedItem,
    PreferenceVizComponentProps,
    PreferenceVizRecommendedItem,
} from '../../types/preferenceVisualization.types';
import { POSTER_HEIGHT, POSTER_WIDTH } from '../../utils/vizConstants';
import { appendStyledPoster, attachNodeInteractions, fisheye, PADDING } from '../../utils/vizUtils';

const X_AXIS_LABEL = "The system's predicted movie rating for you";
const Y_AXIS_LABEL = 'Ratings from everyone else in the system';

const ContinuousCoupled: React.FC<PreferenceVizComponentProps<PreferenceVizRecommendedItem>> = ({
    width,
    height,
    data,
    onHover,
    isFisheye = false,
}) => {
    const svgRef = useRef<SVGSVGElement>(null);

    const onHoverRef = useRef(onHover);
    useEffect(() => {
        onHoverRef.current = onHover;
    }, [onHover]);

    const stickyIdRef = useRef<string | null>(null);

    // specific data transformation
    const dataValues = useMemo(() => (data ? Object.values(data) : []), [data]);

    useEffect(() => {
        if (!data || !svgRef.current || width === 0 || height === 0) {
            return;
        }
        const margin = { top: 20, right: 20, bottom: 60, left: 60 };
        const availableWidth = width - margin.left - margin.right;
        const availableHeight = height - margin.top - margin.bottom;

        // Force square aspect ratio based on the smaller dimension
        const size = Math.min(availableWidth, availableHeight);
        const innerWidth = size;
        const innerHeight = size;

        // Center the visualization horizontally, but align top vertically
        const leftOffset = margin.left + (availableWidth - innerWidth) / 2;
        const topOffset = margin.top;

        // Poster padding logic to prevent clipping at edges (1.0 and 5.0)
        const xRangePadding = POSTER_WIDTH / 2;
        const yRangePadding = POSTER_HEIGHT / 2;

        const xScale = d3
            .scaleLinear()
            .domain([1, 5])
            .range([xRangePadding, innerWidth - xRangePadding]);

        const yScale = d3
            .scaleLinear()
            .domain([1, 5])
            .range([innerHeight - yRangePadding, yRangePadding]); // Inverted Y, properly padded

        const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);

        svg.selectAll('*').remove();
        const g = svg.append<SVGGElement>('g').attr('transform', `translate(${leftOffset},${topOffset})`);

        // Helper to reset visuals
        const resetNodeVisuals = (node: d3.Selection<any, DataAugmentedItem, any, any>) => {
            const content = node.select('.node-content');
            content.transition().duration(200).attr('transform', 'translate(0,0) scale(1)');
            content.select('rect').style('filter', 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))');
        };

        // Click on background to clear sticky state
        svg.on('click', () => {
            if (stickyIdRef.current) {
                // Reset visuals of the sticky node
                g.selectAll<SVGGElement, DataAugmentedItem>('.movie-node')
                    .filter((d: DataAugmentedItem) => d.id === stickyIdRef.current)
                    .each(function () {
                        resetNodeVisuals(d3.select(this));
                    });

                stickyIdRef.current = null;
                if (onHoverRef.current) {
                    onHoverRef.current('');
                }
            }
        });

        // Grid Ticks: 0.1 steps (1.0, 1.1, ...)
        // Use integer range to avoid floating point issues (e.g. 1.200000002)
        const gridTickValues = d3.range(10, 51).map((x) => x / 10);

        // Label Ticks: 0.5 steps (1.0, 1.5, ... 5.0)
        const labelTickValues = d3.range(10, 51, 5).map((x) => x / 10);

        // Grid lines (x-axis) - Use 0.1 density
        g.append('g')
            .attr('class', 'grid')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(
                d3
                    .axisBottom(xScale)
                    .tickValues(gridTickValues)
                    .tickSize(-innerHeight)
                    .tickFormat(() => '')
            )
            // Extend domain line to full width
            .select('.domain')
            .attr('d', `M0.5,0.5H${innerWidth}`);

        // Grid lines (y-axis) - Use 0.1 density
        g.append('g')
            .attr('class', 'grid')
            .call(
                d3
                    .axisLeft(yScale)
                    .tickValues(gridTickValues)
                    .tickSize(-innerWidth)
                    .tickFormat(() => '')
            )
            // Extend domain line to full height
            .select('.domain')
            .attr('d', `M0.5,0.5V${innerHeight}`);

        // Axes (drawn on top of grid lines) - Use 0.5 density for Labeling
        g.append('g')
            .attr('transform', `translate(0, ${innerHeight})`)
            .call(d3.axisBottom(xScale).tickValues(labelTickValues))
            .select('.domain')
            .attr('d', `M0.5,0.5H${innerWidth}`);

        g.append('g')
            .call(d3.axisLeft(yScale).tickValues(labelTickValues))
            .select('.domain')
            .attr('d', `M0.5,0.5V${innerHeight}`);

        // X-axis label
        g.append('text')
            .attr('class', 'axis-label')
            .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom - 10})`)
            .style('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .text(Y_AXIS_LABEL);

        // Y-axis label
        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left + 15) // Adjusted position
            .attr('x', 0 - innerHeight / 2)
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .text(X_AXIS_LABEL);

        // Right and Top borders to close the chart box
        g.append('line')
            .attr('x1', innerWidth)
            .attr('y1', 0)
            .attr('x2', innerWidth)
            .attr('y2', innerHeight)
            .attr('stroke', '#000000')
            .attr('shape-rendering', 'crispEdges');

        g.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', innerWidth)
            .attr('y2', 0)
            .attr('stroke', '#000000')
            .attr('shape-rendering', 'crispEdges');

        const totalW = POSTER_WIDTH + PADDING * 2;
        const totalH = POSTER_HEIGHT + PADDING * 2;

        // Nodes Group (Groups containing Hit Area + Content Group)
        const nodes = g
            .selectAll<SVGGElement, DataAugmentedItem>('.movie-node')
            .data(dataValues)
            .enter()
            .append('g')
            .attr('class', (d) => `movie-node node-id-${d.id}`)
            .attr('transform', (d) => {
                const cx = xScale(d.community_score);
                const cy = yScale(d.user_score);
                return `translate(${cx}, ${cy})`;
            })
            // Store original positions for fisheye reset
            .attr('data-ox', (d) => xScale(d.community_score))
            .attr('data-oy', (d) => yScale(d.user_score));

        // Attach reusable interaction handlers (hover, click, sticky, edge-shifting)
        attachNodeInteractions(nodes, {
            onHoverRef,
            stickyIdRef,
            posterWidth: POSTER_WIDTH,
            posterHeight: POSTER_HEIGHT,
            innerWidth,
            innerHeight,
            scaleFactor: 2.0, // Coupled uses 2.0 scale
        });

        // Invisible Hit Area (Stays centered at 0,0 of the group)
        nodes
            .append('rect')
            .attr('class', 'hit-area')
            .attr('width', totalW)
            .attr('height', totalH)
            .attr('x', -totalW / 2)
            .attr('y', -totalH / 2)
            .attr('fill', 'transparent'); // Invisible but catches events

        // Content Wrapper (Visuals)
        const content = nodes.append('g').attr('class', 'node-content');

        // Use shared styling
        const { image } = appendStyledPoster(content, POSTER_WIDTH, POSTER_HEIGHT);

        // Bind data-specific attributes to the image
        image.attr('xlink:href', (d: DataAugmentedItem) => d.tmdb_poster);

        const gridGroups = svg.selectAll('.grid');
        const xGridGroup = d3.select(gridGroups.nodes()[0] as SVGGElement);
        const yGridGroup = d3.select(gridGroups.nodes()[1] as SVGGElement);

        const xLines = xGridGroup.selectAll<SVGLineElement, number>('line');
        const yLines = yGridGroup.selectAll<SVGLineElement, number>('line');

        const allTicks = g.selectAll<SVGGElement, number>('.tick');

        const xTicks = allTicks.filter(function () {
            const t = d3.select(this).attr('transform');
            return !!(t && !t.includes('translate(0,'));
        });

        const yTicks = allTicks.filter(function () {
            const t = d3.select(this).attr('transform');
            return !!(t && t.includes('translate(0,'));
        });

        if (isFisheye) {
            svg.on('mousemove', (event) => {
                const [mx, my] = d3.pointer(event, g.node());
                if (mx < 0 || mx > innerWidth || my < 0 || my > innerHeight) return;

                const df = 3.0;

                xLines
                    .attr('x1', (d: number) => fisheye(xScale(d), mx, df, 0, innerWidth))
                    .attr('x2', (d: number) => fisheye(xScale(d), mx, df, 0, innerWidth));

                yLines
                    .attr('y1', (d: number) => fisheye(yScale(d), my, df, 0, innerHeight))
                    .attr('y2', (d: number) => fisheye(yScale(d), my, df, 0, innerHeight));

                xTicks.attr('transform', (d: number) => `translate(${fisheye(xScale(d), mx, df, 0, innerWidth)},0)`);
                yTicks.attr('transform', (d: number) => `translate(0,${fisheye(yScale(d), my, df, 0, innerHeight)})`);

                // Update Node Positions
                nodes.each(function (d) {
                    const ox = xScale(d.community_score);
                    const oy = yScale(d.user_score);
                    const nx = fisheye(ox, mx, df, 0, innerWidth);
                    const ny = fisheye(oy, my, df, 0, innerHeight);

                    const node = d3.select(this);

                    // Update stored current position
                    node.attr('data-cx', nx).attr('data-cy', ny);

                    node.attr('transform', `translate(${nx}, ${ny})`);
                });
            });

            svg.on('mouseleave', () => {
                // Reset Grid
                xLines.attr('x1', (d: number) => xScale(d)).attr('x2', (d: number) => xScale(d));
                yLines.attr('y1', (d: number) => yScale(d)).attr('y2', (d: number) => yScale(d));
                xTicks.attr('transform', (d: number) => `translate(${xScale(d)},0)`);
                yTicks.attr('transform', (d: number) => `translate(0,${yScale(d)})`);

                // Reset Nodes
                nodes.each(function (d) {
                    const cx = xScale(d.community_score);
                    const cy = yScale(d.user_score);
                    d3.select(this)
                        .attr('data-cx', null)
                        .attr('data-cy', null)
                        .attr('transform', `translate(${cx}, ${cy})`);
                });
            });
        }
    }, [dataValues, svgRef, width, height, isFisheye]);

    return <svg ref={svgRef} width={width} height={height}></svg>;
};

export default ContinuousCoupled;
