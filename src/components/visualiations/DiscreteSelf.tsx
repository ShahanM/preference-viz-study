import * as d3 from 'd3';
import { useEffect, useMemo, useRef } from 'react';
import type { DataAugmentedItem, PreferenceVizComponentProps } from '../../types/preferenceVisualization.types';
import { DISLIKE_CUTOFF, LIKE_CUTOFF } from '../../utils/constants';

const posterWidth = 45;
const posterHeight = 72;

const likeCuttoff = LIKE_CUTOFF;
const dislikeCuttoff = DISLIKE_CUTOFF;
const margin = { top: 20, right: 20, bottom: 30, left: 40 }; // Define margins
const rowHeaderWidth = 100;
const colHeaderHeight = 100;

const defaultImage = 'https://rssa.recsys.dev/movie/poster/default_movie_icon.svg';

const DiscreteSelf: React.FC<PreferenceVizComponentProps> = ({ width, height, data, onHover }) => {
    const numRows = 2;
    const numCols = 2;

    width = width - rowHeaderWidth - margin.left - margin.right;
    height = height - colHeaderHeight - margin.top - margin.bottom;
    const svgWidth = width / numCols;
    const svgHeight = height / numRows;
    const svgRefs = useRef<SVGSVGElement[]>([]);
    const simulationRefs = useRef<d3.Simulation<DataAugmentedItem, undefined>[]>([]);

    const simNodeData = useMemo(
        () =>
            data
                ? Object.values(data).map((d) => ({
                    ...d,
                    x: svgWidth / 2,
                    y: svgHeight / 2,
                }))
                : [],
        [data, svgWidth, svgHeight]
    );

    const filteredData = useMemo(() => {
        return {
            myLikes: simNodeData.filter((d) => d.user_score >= likeCuttoff),
            myDislikes: simNodeData.filter((d) => d.user_score < dislikeCuttoff),
            // ,
            // commLikes: simNodeData.filter((d) =>
            // 	d.community_score >= likeCuttoff),
            // commDisikes: simNodeData.filter((d) =>
            // 	d.community_score < dislikeCuttoff)
        };
    }, [simNodeData]);

    useEffect(() => {
        const dataArrays = Object.values(filteredData);
        const currentSvgRefs = svgRefs.current.slice(); // Copy the refs array
        const currentSimulationRefs = simulationRefs.current.slice(); // Copy the simulation array
        if (currentSvgRefs.length === dataArrays.length && filteredData) {
            const newSimulations: d3.Simulation<DataAugmentedItem, undefined>[] = [];
            svgRefs.current.forEach((svgRef, i) => {

                const svg = d3
                    .select(svgRef)
                    .attr('width', width / numCols)
                    .attr('height', height / numRows);
                const g = svg.append<SVGGElement>('g').attr('transform', `translate(${margin.left},${margin.top})`);

                const ctxData = dataArrays[i];
                g.selectAll<SVGImageElement, DataAugmentedItem>('image')
                    .data(ctxData, (d: DataAugmentedItem) => d.id)
                    .enter()
                    .append('image')
                    .attr('data-id', (d) => d.id)
                    .attr('xlink:href', defaultImage)
                    .each(function (d: DataAugmentedItem) {
                        // Use .each for individual element handling
                        const image = d3.select(this);
                        const img = new Image();
                        img.src = d.poster;

                        img.onload = () => {
                            image.attr('href', d.poster);
                        };

                        img.onerror = () => {
                            image.attr('href', defaultImage);
                        };
                    })
                    .attr('x', -posterWidth / 2)
                    .attr('y', -posterHeight / 2)
                    .attr('width', posterWidth)
                    .attr('height', posterHeight)
                    .attr('preserveAspectRatio', 'xMinYMin slice')
                    .style('cursor', 'pointer')
                    .on('mouseover', (_event, d: DataAugmentedItem) => {
                        d3.selectAll('image')
                            .filter(function () {
                                return d3.select(this).attr('data-id') === d.id;
                            })
                            .raise()
                            .attr('width', posterWidth * 2) // Increase width by 20%
                            .attr('height', posterHeight * 2)
                            .classed('image-with-border', true);
                        if (onHover) {
                            onHover(d.id);
                        }
                    })
                    .on('mouseout', (_event, d: DataAugmentedItem) => {
                        d3.selectAll('image')
                            .filter(function () {
                                return d3.select(this).attr('data-id') === d.id;
                            })
                            .attr('width', posterWidth) // Reset to original width
                            .attr('height', posterHeight) // Reset to original height
                            .classed('image-with-border', false); // Reset to original height

                        if (onHover) {
                            onHover('');
                        }
                    });

                const simulation = d3
                    .forceSimulation<DataAugmentedItem>()
                    .force(
                        'center',
                        d3
                            .forceCenter<DataAugmentedItem>()
                            .x(svgWidth / 2)
                            .y(svgHeight / 2)
                    )
                    .force('charge', d3.forceManyBody<DataAugmentedItem>().strength(0.5))
                    .force('collide', d3.forceCollide<DataAugmentedItem>().strength(0.01).radius(45).iterations(5));

                simulation.nodes(ctxData);

                simulation.on('tick', function (this: d3.Simulation<DataAugmentedItem, undefined>) {
                    g.selectAll('image')
                        .attr('x', (d) => {
                            return (d as DataAugmentedItem).x! - posterWidth / 2;
                        })
                        .attr('y', (d) => {
                            return (d as DataAugmentedItem).y! - posterHeight / 2;
                        });
                });

                newSimulations.push(simulation);
            });

            simulationRefs.current = newSimulations;

            return () => {
                currentSimulationRefs.forEach((simulation) => simulation.stop());
                currentSvgRefs.forEach((svgRef) => {
                    if (svgRef) {
                        d3.select(svgRef).selectAll('*').remove();
                    }
                });
            };
        }
    }, [width, height, filteredData, svgWidth, svgHeight, onHover]);

    const setSvgRef = (index: number) => (element: SVGSVGElement | null) => {
        svgRefs.current[index] = element!;
    };

    return (
        <div className="mt-3 centered-content p-3">
            <div className="gap-3">
                <div className="border rounded">
                    <svg ref={setSvgRef(1)} width={width / 2} height={height / 2}></svg>
                </div>
                <div className="border rounded">
                    <svg ref={setSvgRef(0)} width={width / 2} height={height / 2}></svg>
                </div>
            </div>
            <div className="mt-lg-3">
                <div>Dislikes</div>
                <div>Likes</div>
            </div>
            <div>
                <p className="fw-medium">The system's predicted movie rating for you</p>
            </div>
        </div>
    );
};

export default DiscreteSelf;
