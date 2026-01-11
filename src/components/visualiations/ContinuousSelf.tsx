import * as d3 from 'd3';
import { useEffect, useMemo, useRef } from 'react';
import type {
    DataAugmentedItem,
    PreferenceVizComponentProps,
    PreferenceVizRecommendedItem,
} from '../../types/preferenceVisualization.types';
import { DEFAULT_MOVIE_ICON, MARGIN, POSTER_HEIGHT, POSTER_WIDTH } from '../../utils/vizConstants';

const X_AXIS_LABEL = "The system's predicted movie rating for you";

const ContinuousSelf: React.FC<PreferenceVizComponentProps<PreferenceVizRecommendedItem>> = ({
    width,
    height,
    data,
    xCol,
    yCol,
    onHover,
}) => {
    const svgHeight = height / 4;
    const innerWidth = width - MARGIN.left - MARGIN.right;
    const innerHeight = svgHeight - MARGIN.top - MARGIN.bottom;

    const svgRef = useRef<SVGSVGElement>(null);
    const simNodeData = useMemo(
        () =>
            data
                ? Object.values(data).map((d) => ({
                      ...d,
                      x: d.user_score,
                      y: innerHeight / 2,
                  }))
                : [],
        [data, innerHeight]
    );

    useEffect(() => {
        if (!simNodeData) return;
        const currentSvgRef = svgRef.current;

        function renderViz(svgRef: SVGSVGElement, ctxData: DataAugmentedItem[], label: string) {
            const xScale = d3.scaleLinear().domain([0, 5]).range([0, innerWidth]);
            const yScale = d3.scaleLinear().domain([0, 5]).range([innerHeight, 0]); // Note: range is inverted for y-axis
            const svg = d3.select(svgRef).attr('width', width).attr('height', svgHeight);
            svg.selectAll('*').remove();
            const g = svg.append<SVGGElement>('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

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

            // Images
            g.selectAll<SVGImageElement, DataAugmentedItem>('image')
                .data(ctxData)
                .enter()
                .append('image')
                .attr('data-id', (d) => d.id)
                .attr('xlink:href', DEFAULT_MOVIE_ICON)
                .each(function (d: DataAugmentedItem) {
                    // Use .each for individual element handling
                    const image = d3.select(this);
                    const img = new Image();
                    img.src = d.poster;
                    img.onload = () => {
                        image.attr('href', d.poster);
                    };
                    img.onerror = () => {
                        image.attr('href', DEFAULT_MOVIE_ICON);
                    };
                })
                .attr('x', (d) => xScale(d.x!) - POSTER_WIDTH / 2)
                .attr('y', innerHeight / 2)
                .attr('width', POSTER_WIDTH)
                .attr('height', POSTER_HEIGHT)

                .attr('preserveAspectRatio', 'xMinYMin slice')
                .on('mouseover', (_event, d: DataAugmentedItem) => {
                    d3.selectAll('image')
                        .filter(function () {
                            return d3.select(this).attr('data-id') === d.id;
                        })
                        .style('cursor', 'pointer')
                        .raise()
                        .attr('x', (d) => xScale((d as DataAugmentedItem).x!) - POSTER_WIDTH / 2)
                        .attr('y', innerHeight / 2 - POSTER_HEIGHT)
                        .attr('width', POSTER_WIDTH * 2) // Increase width by 20%
                        .attr('height', POSTER_HEIGHT * 2)
                        .classed('image-with-border', true);

                    if (onHover) {
                        onHover(d.id); // Call the onHover callback
                    }
                })
                .on('mouseout', (_event, d: DataAugmentedItem) => {
                    d3.selectAll('image')
                        .filter(function () {
                            return d3.select(this).attr('data-id') === d.id;
                        })
                        .attr('x', (d) => xScale((d as DataAugmentedItem).x!) - POSTER_WIDTH / 2)
                        .attr('y', innerHeight / 2)
                        .attr('width', POSTER_WIDTH) // Reset to original width
                        .attr('height', POSTER_HEIGHT) // Reset to original height
                        .classed('image-with-border', false); // Reset to original height
                    if (onHover) {
                        onHover('');
                    }
                });

            svg.append('text')
                .attr('x', innerWidth / 2 + MARGIN.left)

                .attr('y', svgHeight - 5) // Position below the chart
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .text(label);
        }

        if (currentSvgRef) {
            const ctxData = simNodeData;
            const label = X_AXIS_LABEL;
            renderViz(currentSvgRef, ctxData, label);
        }
    }, [simNodeData, svgRef, innerWidth, innerHeight, xCol, yCol, onHover, width, svgHeight]);

    const setSvgRef = () => (element: SVGSVGElement | null) => {
        svgRef.current = element!;
    };

    return (
        <div style={{ marginTop: '9vh' }}>
            <svg ref={setSvgRef()} width={width} height={height / 2}></svg>
        </div>
    );
};

export default ContinuousSelf;
