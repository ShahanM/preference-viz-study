import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import type { DataAugmentedItem, PreferenceVizComponentProps } from '../../types/preferenceVisualization.types';

const posterWidth = 54;
const posterHeight = 81;

const X_AXIS_LABEL = "The system's predicted movie rating for you";
const Y_AXIS_LABEL = 'Ratings from everyone else in the system';

const ContinuousCoupled: React.FC<PreferenceVizComponentProps> = ({ width, height, data, xCol, yCol, onHover }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!data || !svgRef.current || width === 0 || height === 0) {
            return;
        }
        const margin = { top: 20, right: 60, bottom: 60, left: 60 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const xScale = d3.scaleLinear().domain([0, 5]).range([0, innerWidth]);
        const yScale = d3.scaleLinear().domain([0, 5]).range([innerHeight, 0]); // Note: range is inverted for y-axis

        const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);

        svg.selectAll('*').remove();
        const g = svg.append<SVGGElement>('g').attr('transform', `translate(${margin.left},${margin.top})`);

        // Grid lines (x-axis)
        g.append('g')
            .attr('class', 'grid')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(
                d3
                    .axisBottom(xScale)
                    .ticks(50)
                    .tickSize(-innerHeight)
                    .tickFormat(() => '')
            ); // Extend grid lines

        // Grid lines (y-axis)
        g.append('g')
            .attr('class', 'grid')
            .call(
                d3
                    .axisLeft(yScale)
                    .ticks(50)
                    .tickSize(-innerWidth)
                    .tickFormat(() => '')
            );

        // Axes (drawn on top of grid lines)
        g.append('g').attr('transform', `translate(0, ${innerHeight})`).call(d3.axisBottom(xScale));

        g.append('g').call(d3.axisLeft(yScale));

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

        // CSS for grid lines
        svg.append('style').text(`
				.grid line {
				stroke: #ccc; /* Light gray */
				stroke-opacity: 0.7; /* Slightly transparent */
				shape-rendering: crispEdges; /* Make lines sharp */
				}
			`);

        const dataValues: DataAugmentedItem[] = Object.values(data);

        // Images
        g.selectAll<SVGImageElement, DataAugmentedItem>('image')
            .data(dataValues)
            .enter()
            .append('image')
            .attr('xlink:href', (d) => d.tmdb_poster)
            .attr('x', (d) => xScale(d.community_score) - posterWidth / 2)
            .attr('y', (d) => yScale(d.user_score) - posterHeight / 2)
            .attr('width', posterWidth)
            .attr('height', posterHeight)
            .attr('preserveAspectRatio', 'xMinYMin slice')
            .on('mouseover', (event, d: DataAugmentedItem) => {
                d3.select(event.currentTarget)
                    .style('cursor', 'pointer')
                    .raise()
                    .attr('x', xScale(d.community_score) - posterWidth)
                    .attr('y', yScale(d.user_score) - posterHeight)
                    .attr('width', posterWidth * 2)
                    .attr('height', posterHeight * 2)
                    .classed('image-with-border', true);

                if (onHover) {
                    onHover(d.id);
                }
            })
            .on('mouseout', (event, d: DataAugmentedItem) => {
                d3.select(event.currentTarget)
                    .attr('x', xScale(d.community_score) - posterWidth / 2)
                    .attr('y', yScale(d.user_score) - posterHeight / 2)
                    .attr('width', posterWidth)
                    .attr('height', posterHeight)
                    .classed('image-with-border', false);
                if (onHover) {
                    onHover('');
                }
            });
    }, [data, svgRef, width, height, xCol, yCol, onHover]);

    return <svg ref={svgRef} width={width} height={height}></svg>;
};

export default ContinuousCoupled;
