import * as d3 from 'd3';
import { useEffect, useMemo, useRef } from 'react';
import type {
    DataAugmentedItem,
    PreferenceVizComponentProps,
    PreferenceVizRecommendedItem,
} from '../../types/preferenceVisualization.types';
import { POSTER_HEIGHT, POSTER_WIDTH } from '../../utils/vizConstants';
import {
    appendStyledPoster,
    attachFisheyeBehavior,
    attachNodeInteractions,
    PADDING,
    renderVizGrid,
    X_AXIS_LABEL_ONE,
    Y_AXIS_LABEL_ONE,
} from '../../utils/vizUtils';

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

        // Render Grid and Axes
        // ContinuousCoupled uses 2D grid
        const { xLines, yLines, xTicks, yTicks } = renderVizGrid(
            g,
            { xScale, yScale },
            { innerWidth, innerHeight },
            { drawYGridLines: true, drawYAxis: true }
        );

        // X-axis label (Bottom) -> Corresponds to "Community Score" (from everyone else)
        g.append('text')
            .attr('class', 'axis-label')
            .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom - 10})`)
            .style('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .text(Y_AXIS_LABEL_ONE);

        // Y-axis label (Left) -> Corresponds to "User Score" (predicted for you)
        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left + 15) // Adjusted position
            .attr('x', 0 - innerHeight / 2)
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .text(X_AXIS_LABEL_ONE);

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

        if (isFisheye) {
            attachFisheyeBehavior(
                svg,
                { xLines, yLines, xTicks, yTicks, nodes },
                {
                    scales: { xScale, yScale },
                    dimensions: { innerWidth, innerHeight, margin },
                    isFisheye,
                    getX: (d: DataAugmentedItem) => d.community_score,
                    getY: (d: DataAugmentedItem) => d.user_score,
                    mode: '2D',
                }
            );
        }
    }, [dataValues, svgRef, width, height, isFisheye]);

    return <svg ref={svgRef} width={width} height={height}></svg>;
};

export default ContinuousCoupled;
