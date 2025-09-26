import * as d3 from 'd3';
import { useEffect, useMemo, useRef } from 'react';
import type { DataAugmentedItem, PreferenceVizComponentProps } from '../../types/preferenceVisualization.types';

const posterWidth = 54;
const posterHeight = 81;

const X_AXIS_LABEL_ONE = "The system's predicted movie rating for you";
const X_AXIS_LABEL_TWO = 'Ratings from everyone else in the system';

const ContinuousDecoupled: React.FC<PreferenceVizComponentProps> = ({ width, height, data, onHover }) => {
    const svgRefs = useRef<(SVGSVGElement | null)[]>([]);

    const simNodeData = useMemo(() => {
        if (!data) return data;
        const myPrefOrder: DataAugmentedItem[] = [];
        const commPrefOrder: DataAugmentedItem[] = [];
        for (const d of Object.values(data)) {
            myPrefOrder.push({ ...d, x: d.user_score });
            commPrefOrder.push({ ...d, x: d.community_score });
        }
        return { myPrefs: myPrefOrder, commPrefs: commPrefOrder };
    }, [data]);

    useEffect(() => {
        if (!simNodeData || width === 0 || height === 0) return;

        const svgHeight = height / 4;
        const margin = { top: 20, right: 60, bottom: 60, left: 60 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = svgHeight - margin.top - margin.bottom;
        const xScale = d3.scaleLinear().domain([0, 5]).range([0, innerWidth]);
        const yScale = d3.scaleLinear().domain([0, 5]).range([innerHeight, 0]);

        const dataArrays = [simNodeData.myPrefs, simNodeData.commPrefs];

        svgRefs.current.forEach((svgRef, i) => {
            if (!svgRef) return;

            const svg = d3.select(svgRef).attr('width', width).attr('height', svgHeight);
            svg.selectAll('*').remove();

            const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
            const label = i === 0 ? X_AXIS_LABEL_ONE : X_AXIS_LABEL_TWO;

            g.append('g')
                .attr('class', 'grid')
                .attr('transform', `translate(0,${innerHeight})`)
                .call(
                    d3
                        .axisBottom(xScale)
                        .ticks(50)
                        .tickSize(-innerHeight)
                        .tickFormat(() => '')
                );
            g.append('g')
                .attr('class', 'grid')
                .call(
                    d3
                        .axisLeft(yScale)
                        .ticks(25)
                        .tickSize(-innerWidth)
                        .tickFormat(() => '')
                );
            g.append('g').attr('transform', `translate(0, ${innerHeight})`).call(d3.axisBottom(xScale));
            svg.append('text')
                .attr('x', innerWidth / 2 + margin.left)
                .attr('y', svgHeight - 5)
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .text(label);
            svg.append('style').text(
                `.grid line { stroke: #ccccccff; stroke-opacity: 0.7; shape-rendering: crispEdges; }`
            );

            g.selectAll<SVGImageElement, DataAugmentedItem>('image')
                .data(dataArrays[i], (d: DataAugmentedItem) => d.id)
                .join('image')
                .attr('class', (d) => `poster-image poster-id-${d.id}`)
                .attr('xlink:href', (d) => d.tmdb_poster)
                .attr('width', posterWidth)
                .attr('height', posterHeight)
                .attr('preserveAspectRatio', 'xMinYMin slice')
                .attr('x', (d) => xScale(d.x!) - posterWidth / 2)
                .attr('y', (innerHeight - posterHeight) / 2)
                .style('cursor', 'pointer')
                .on('mouseenter', function (_, d) {
                    d3.select(this).raise();
                    d3.selectAll(`.poster-id-${d.id}`)
                        .transition()
                        .duration(150)
                        .attr('width', posterWidth * 1.5)
                        .attr('height', posterHeight * 1.5)
                        .attr(
                            'x',
                            (d_in_selection) =>
                                xScale((d_in_selection as DataAugmentedItem).x!) - (posterWidth * 1.5) / 2
                        )
                        .attr('y', (innerHeight - posterHeight * 1.5) / 2);

                    if (onHover) onHover(d.id);
                })
                .on('mouseleave', function (_, d) {
                    d3.selectAll(`.poster-id-${d.id}`)
                        .transition()
                        .duration(150)
                        .attr('width', posterWidth)
                        .attr('height', posterHeight)
                        .attr(
                            'x',
                            (d_in_selection) => xScale((d_in_selection as DataAugmentedItem).x!) - posterWidth / 2
                        )
                        .attr('y', (innerHeight - posterHeight) / 2);

                    if (onHover) onHover('');
                });
        });
    }, [simNodeData, width, height, onHover]);

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
