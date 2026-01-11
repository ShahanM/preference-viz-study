import * as d3 from 'd3';
import { useEffect, useMemo, useRef } from 'react';
import type {
    DataAugmentedItem,
    PreferenceVizComponentProps,
    PreferenceVizRecommendedItem,
} from '../../types/preferenceVisualization.types';
import { POSTER_HEIGHT, POSTER_WIDTH } from '../../utils/vizConstants';
import { fisheye } from '../../utils/vizUtils';

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

    // specific data transformation
    const dataValues = useMemo(() => (data ? Object.values(data) : []), [data]);

    useEffect(() => {
        if (!data || !svgRef.current || width === 0 || height === 0) {
            return;
        }
        const margin = { top: 20, right: 20, bottom: 60, left: 60 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

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
        const g = svg.append<SVGGElement>('g').attr('transform', `translate(${margin.left},${margin.top})`);

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

        // Images
        const images = g
            .selectAll<SVGImageElement, DataAugmentedItem>('image')
            .data(dataValues)
            .enter()
            .append('image')
            .attr('xlink:href', (d) => d.tmdb_poster)
            // Center the image on the data point
            .attr('x', (d) => xScale(d.community_score) - POSTER_WIDTH / 2)
            .attr('y', (d) => yScale(d.user_score) - POSTER_HEIGHT / 2)
            .attr('width', POSTER_WIDTH)
            .attr('height', POSTER_HEIGHT)
            .attr('preserveAspectRatio', 'xMinYMin slice')
            .attr('data-ox', (d) => xScale(d.community_score)) // Original X Center
            .attr('data-oy', (d) => yScale(d.user_score)) // Original Y Center
            .on('mouseover', (event, d: DataAugmentedItem) => {
                d3.select(event.currentTarget)
                    .style('cursor', 'pointer')
                    .raise()
                    // Expand from center
                    .attr('x', function () {
                        const cx = parseFloat(d3.select(this).attr('current-cx') || d3.select(this).attr('data-ox'));
                        return cx - POSTER_WIDTH;
                    })
                    .attr('y', function () {
                        const cy = parseFloat(d3.select(this).attr('current-cy') || d3.select(this).attr('data-oy'));
                        return cy - POSTER_HEIGHT;
                    })
                    .attr('width', POSTER_WIDTH * 2)
                    .attr('height', POSTER_HEIGHT * 2)
                    .classed('image-with-border', true);

                if (onHoverRef.current) {
                    onHoverRef.current(d.id);
                }
            })
            .on('mouseout', (event, _d: DataAugmentedItem) => {
                d3.select(event.currentTarget)
                    .attr('x', function () {
                        const cx = parseFloat(d3.select(this).attr('current-cx') || d3.select(this).attr('data-ox'));
                        return cx - POSTER_WIDTH / 2;
                    })
                    .attr('y', function () {
                        const cy = parseFloat(d3.select(this).attr('current-cy') || d3.select(this).attr('data-oy'));
                        return cy - POSTER_HEIGHT / 2;
                    })
                    .attr('width', POSTER_WIDTH)
                    .attr('height', POSTER_HEIGHT)
                    .classed('image-with-border', false);
                if (onHoverRef.current) {
                    onHoverRef.current('');
                }
            });

        const gridGroups = svg.selectAll('.grid');
        const xGridGroup = d3.select(gridGroups.nodes()[0] as SVGGElement);
        const yGridGroup = d3.select(gridGroups.nodes()[1] as SVGGElement);

        const xLines = xGridGroup.selectAll('line');
        const yLines = yGridGroup.selectAll('line');

        const allTicks = g.selectAll('.tick');

        const xTicks = allTicks.filter(function () {
            const t = d3.select(this).attr('transform');
            // Check if Y translation is roughly 0 (or exactly 0)
            // Or simpler: Check if it's NOT starting with translate(0,
            // Be careful about spacing. D3 usually output 'translate(0,y)' or 'translate(x,0)'.
            return !!(t && !t.includes('translate(0,'));
        });

        const yTicks = allTicks.filter(function () {
            const t = d3.select(this).attr('transform');
            return !!(t && t.includes('translate(0,'));
        });

        if (isFisheye) {
            svg.on('mousemove', (event) => {
                const [mx, my] = d3.pointer(event, g.node());
                // mx, my are relative to 'g' (content area).
                // Bounds
                if (mx < 0 || mx > innerWidth || my < 0 || my > innerHeight) return;

                const df = 3.0; // Distortion Factor

                xLines
                    .attr('x1', (d: any) => fisheye(xScale(d), mx, df, 0, innerWidth))
                    .attr('x2', (d: any) => fisheye(xScale(d), mx, df, 0, innerWidth));

                yLines
                    .attr('y1', (d: any) => fisheye(yScale(d), my, df, 0, innerHeight))
                    .attr('y2', (d: any) => fisheye(yScale(d), my, df, 0, innerHeight));

                xTicks.attr('transform', (d: any) => `translate(${fisheye(xScale(d), mx, df, 0, innerWidth)},0)`);
                yTicks.attr('transform', (d: any) => `translate(0,${fisheye(yScale(d), my, df, 0, innerHeight)})`);

                // Update Images
                images
                    .attr('x', function (d) {
                        const ox = xScale(d.community_score);
                        const oy = yScale(d.user_score);
                        const nx = fisheye(ox, mx, df, 0, innerWidth);
                        const ny = fisheye(oy, my, df, 0, innerHeight);

                        d3.select(this).attr('current-cx', nx).attr('current-cy', ny);

                        const w = parseFloat(d3.select(this).attr('width'));
                        return nx - w / 2;
                    })
                    .attr('y', function (d) {
                        const oy = yScale(d.user_score); // recalculate or use stored?
                        const ny = fisheye(oy, my, df, 0, innerHeight);
                        const h = parseFloat(d3.select(this).attr('height'));
                        return ny - h / 2;
                    });
            });

            svg.on('mouseleave', () => {
                // Reset All
                xLines.attr('x1', (d: any) => xScale(d)).attr('x2', (d: any) => xScale(d));
                yLines.attr('y1', (d: any) => yScale(d)).attr('y2', (d: any) => yScale(d));
                xTicks.attr('transform', (d: any) => `translate(${xScale(d)},0)`);
                yTicks.attr('transform', (d: any) => `translate(0,${yScale(d)})`);

                images
                    .attr('x', function (d) {
                        d3.select(this).attr('current-cx', null).attr('current-cy', null);
                        const w = parseFloat(d3.select(this).attr('width'));
                        return xScale(d.community_score) - w / 2;
                    })
                    .attr('y', function (d) {
                        const h = parseFloat(d3.select(this).attr('height'));
                        return yScale(d.user_score) - h / 2;
                    });
            });
        }
    }, [dataValues, svgRef, width, height, isFisheye]);

    return <svg ref={svgRef} width={width} height={height}></svg>;
};

export default ContinuousCoupled;
