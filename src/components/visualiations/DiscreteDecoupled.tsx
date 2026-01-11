import * as d3 from 'd3';
import { useEffect, useMemo, useRef } from 'react';
import type {
    DataAugmentedItem,
    PreferenceVizComponentProps,
    PreferenceVizRecommendedItem,
} from '../../types/preferenceVisualization.types';
import { DISLIKE_CUTOFF, LIKE_CUTOFF } from '../../utils/constants';

const posterWidth = 45;
const posterHeight = 72;

const likeCuttoff = LIKE_CUTOFF;
const dislikeCuttoff = DISLIKE_CUTOFF;
const margin = { top: 20, right: 20, bottom: 30, left: 40 }; // Define margins
const rowHeaderWidth = 100;
const colHeaderHeight = 100;
const numRows = 2;
const numCols = 2;
interface DiscreteData {
    myLikes: PreferenceVizRecommendedItem[];
    myDislikes: PreferenceVizRecommendedItem[];
    commLikes: PreferenceVizRecommendedItem[];
    commDislikes: PreferenceVizRecommendedItem[];
}

const DiscreteDecoupled: React.FC<PreferenceVizComponentProps<PreferenceVizRecommendedItem>> = ({
    width,
    height,
    data,
    onHover,
}) => {
    const svgRefs = useRef<Map<keyof DiscreteData, SVGSVGElement>>(new Map());

    const simulationRefs = useRef<Map<keyof DiscreteData, d3.Simulation<DataAugmentedItem, undefined>>>(new Map());

    const filteredData = useMemo(() => {
        if (!data) return data;
        const dataArr = Object.values(data);
        return {
            myLikes: dataArr.filter((d) => d.user_score >= likeCuttoff),
            myDislikes: dataArr.filter((d) => d.user_score < dislikeCuttoff),
            commLikes: dataArr.filter((d) => d.community_score >= likeCuttoff),
            commDislikes: dataArr.filter((d) => d.community_score < dislikeCuttoff),
        } as DiscreteData;
    }, [data]);

    useEffect(() => {
        if (!filteredData || width === 0 || height === 0) return;

        const innerWidth = width - rowHeaderWidth - margin.left - margin.right;
        const innerHeight = height - colHeaderHeight - margin.top - margin.bottom;
        const svgWidth = innerWidth / numCols;
        const svgHeight = innerHeight / numRows;

        const newSimulations: Map<keyof DiscreteData, d3.Simulation<DataAugmentedItem, undefined>> = new Map();

        svgRefs.current.forEach((svgRef, svgKey) => {
            if (!svgRef) return;

            const svg = d3.select(svgRef).attr('width', svgWidth).attr('height', svgHeight);
            svg.selectAll('*').remove();

            const g = svg.append<SVGGElement>('g').attr('transform', `translate(${margin.left},${margin.top})`);

            const ctxData = filteredData[svgKey];

            g.selectAll<SVGImageElement, DataAugmentedItem>('image')
                .data(ctxData, (d: DataAugmentedItem) => d.id)
                .join('image')
                .attr('class', (d) => `poster-image poster-id-${d.id}`)
                .attr('data-id', (d) => d.id)
                .attr('xlink:href', (d) => d.tmdb_poster)
                .attr('width', posterWidth)
                .attr('height', posterHeight)
                .attr('preserveAspectRatio', 'xMinYMin slice')
                .attr('x', posterWidth / 2)
                .attr('y', posterHeight / 2)
                .style('cursor', 'pointer')
                .on('mouseenter', function (_, d) {
                    d3.select(this).raise();
                    d3.selectAll(`.poster-id-${d.id}`)
                        .transition()
                        .duration(150)
                        .attr('width', posterWidth * 2)
                        .attr('height', posterHeight * 2);
                    if (onHover) onHover(d.id);
                })
                .on('mouseleave', function (_, d: DataAugmentedItem) {
                    d3.selectAll(`.poster-id-${d.id}`)
                        .transition()
                        .duration(150)
                        .attr('width', posterWidth)
                        .attr('height', posterHeight);

                    if (onHover) onHover('');
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

            newSimulations.set(svgKey, simulation);
        });

        simulationRefs.current = newSimulations;
        const currentSvgRefs = svgRefs.current;

        return () => {
            simulationRefs.current.forEach((simulation) => simulation.stop());
            currentSvgRefs.forEach((svgRef) => {
                if (svgRef) {
                    d3.select(svgRef).selectAll('*').remove();
                }
            });
        };
        // }
    }, [width, height, filteredData, onHover]);

    const setSvgRef = (key: keyof DiscreteData) => (element: SVGSVGElement | null) => {
        svgRefs.current.set(key, element!);
    };

    return (
        <div className="grid grid-rows-2 gap-5 font-medium">
            <div>
                <div className="grid grid-cols-2 gap-0">
                    <div className="border rounded-tl-md border-amber-300">
                        <svg ref={setSvgRef('myDislikes')} width={width / 2} height={height / 2}></svg>
                        <div className="mt-3 bg-gray-300">Dislikes</div>
                    </div>
                    <div className="border rounded-tr-md border-amber-300">
                        <svg ref={setSvgRef('myLikes')} width={width / 2} height={height / 2}></svg>
                        <div className="mt-3 bg-gray-300">Likes</div>
                    </div>
                </div>
                <p className="pt-3 bg-amber-300 rounded-b-md">The system's predicted movie rating for you</p>
            </div>

            <div>
                <div className="grid grid-cols-2 gap-0">
                    <div className="border rounded-tl-md border-amber-300">
                        <svg ref={setSvgRef('commDislikes')} width={width / 2} height={height / 2}></svg>
                        <div className="mt-3 bg-gray-300">Dislikes</div>
                    </div>
                    <div className="border rounded-tr-md border-amber-300">
                        <svg ref={setSvgRef('commLikes')} width={width / 2} height={height / 2}></svg>
                        <div className="mt-3 bg-gray-300">Likes</div>
                    </div>
                </div>
                <p className="pt-3 bg-amber-300 rounded-b-md">Ratings from everyone else in the system</p>
            </div>
        </div>
    );
};

export default DiscreteDecoupled;
