import * as d3 from 'd3';
import { useEffect, useMemo, useRef } from "react";
import { VisualizationProps, VizDataProps } from "./VisualizationTypes.types";


const posterWidth = 54;
const posterHeight = 81;

const margin = { top: 20, right: 60, bottom: 60, left: 60 }; // Define margins
const defaultImage = 'https://rssa.recsys.dev/movie/poster/default_movie_icon.svg';

const X_AXIS_LABEL_ONE = "The system's predicted movie rating for you";
const X_AXIS_LABEL_TWO = "Ratings from everyone else in the system"

const ContinuousDecoupled: React.FC<VisualizationProps> = ({
	width,
	height,
	data,
	xCol,
	yCol,
	onHover
}) => {
	const svgHeight = height / 4;
	const innerWidth = width - margin.left - margin.right;
	const innerHeight = svgHeight - margin.top - margin.bottom;

	const svgRefs = useRef<SVGSVGElement[]>([]);
	const simNodeData = useMemo(() => {
		const myPrefOrder: VizDataProps[] = [];
		const commPrefOrder: VizDataProps[] = [];

		if (data) {
			for (const d of data.values()) {
				myPrefOrder.push({
					...d,
					x: d.user_score,
					y: innerHeight / 2
				})

				commPrefOrder.push({
					...d,
					x: d.community_score,
					y: innerHeight / 2
				})
			}
		}
		return {
			myPrefs: myPrefOrder,
			commPrefs: commPrefOrder
		}
	}, [data, innerHeight]);

	useEffect(() => {
		if (!simNodeData) return;
		const currentSvgRefs = svgRefs.current.slice();

		function renderViz(svgRef: SVGSVGElement, ctxData: VizDataProps[], label: string) {

			const xScale = d3.scaleLinear().domain([0, 5]).range([0, innerWidth]);
			const yScale = d3.scaleLinear().domain([0, 5]).range([innerHeight, 0]); // Note: range is inverted for y-axis
			const svg = d3.select(svgRef)
				.attr("width", width)
				.attr("height", svgHeight);
			svg.selectAll("*").remove();
			const g = svg.append<SVGGElement>("g")
				.attr("transform", `translate(${margin.left},${margin.top})`);

			// Grid lines (x-axis)
			g.append("g")
				.attr("class", "grid")
				.attr("transform", `translate(0,${innerHeight})`)
				.call(d3.axisBottom(xScale)
					.ticks(50)
					.tickSize(-innerHeight)
					.tickFormat(() => "")); // Extend grid lines

			// Grid lines (y-axis)
			g.append("g")
				.attr("class", "grid")
				.call(d3.axisLeft(yScale)
					.ticks(25)
					.tickSize(-innerWidth)
					.tickFormat(() => "")); // Extend grid lines

			// Axes (drawn on top of grid lines)
			g.append("g")
				.attr("transform", `translate(0, ${innerHeight})`)
				.call(d3.axisBottom(xScale));

			// CSS for grid lines (add this to your CSS file or a <style> tag)
			svg.append("style").text(`
				.grid line {
				stroke: #ccc; /* Light gray */
				stroke-opacity: 0.7; /* Slightly transparent */
				shape-rendering: crispEdges; /* Make lines sharp */
				}
			`);

			// Images
			g.selectAll<SVGImageElement, VizDataProps>("image")
				.data(ctxData)
				.enter().append("image")
				.attr("data-id", (d) => d.id)
				.attr("xlink:href", defaultImage)
				.each(function (d: VizDataProps) { // Use .each for individual element handling
					const image = d3.select(this);
					const img = new Image();
					img.src = d.poster;
					img.onload = () => { image.attr("href", d.poster); };
					img.onerror = () => { image.attr("href", defaultImage); };
				})
				.attr("x", (d) => xScale(d.x!) - posterWidth / 2)
				.attr("y", innerHeight / 2)
				.attr("width", posterWidth)
				.attr("height", posterHeight)
				.attr("preserveAspectRatio", "xMinYMin slice")
				.on("mouseover", (event, d: VizDataProps) => {
					d3.selectAll("image")
						.filter(function () {
							return d3.select(this).attr("data-id") === d.id;
						})
						.style("cursor", "pointer")
						.raise()
						.attr("x", (d) => xScale((d as VizDataProps).x!) - posterWidth / 2)
						.attr("y", innerHeight / 2 - posterHeight)
						.attr("width", posterWidth * 2) // Increase width by 20%
						.attr("height", posterHeight * 2)
						.classed("image-with-border", true)

					if (onHover) {
						onHover(d.id); // Call the onHover callback
					}
				})
				.on("mouseout", (event, d: VizDataProps) => {
					d3.selectAll("image")
						.filter(function () {
							return d3.select(this).attr("data-id") === d.id;
						})
						.attr("x", (d) => xScale((d as VizDataProps).x!) - posterWidth / 2)
						.attr("y", innerHeight / 2)
						.attr("width", posterWidth) // Reset to original width
						.attr("height", posterHeight) // Reset to original height
						.classed("image-with-border", false); // Reset to original height
					if (onHover) {
						onHover("");
					}
				});

			svg.append("text")
				.attr("x", innerWidth / 2 + margin.left)
				.attr("y", svgHeight - 5) // Position below the chart
				.style("text-anchor", "middle")
				.style("font-weight", "bold")
				.text(label);
		}

		const dataArrays = Object.values(simNodeData);
		if (currentSvgRefs.length === dataArrays.length) {
			currentSvgRefs.forEach((svgRef, i) => {
				const ctxData = dataArrays[i];
				const label = i === 0 ? X_AXIS_LABEL_ONE : X_AXIS_LABEL_TWO;
				renderViz(svgRef, ctxData, label);
			});

		}
	}, [simNodeData, svgRefs, innerWidth, innerHeight, xCol, yCol, onHover, width, svgHeight]);

	const setSvgRef = (index: number) => (element: SVGSVGElement | null) => {
		svgRefs.current[index] = element!;
	};

	return (
		<div style={{marginTop: "9vh"}}>
			<svg ref={setSvgRef(0)} width={width} height={height / 4}></svg>
			<svg ref={setSvgRef(1)} width={width} height={height / 4}></svg>
		</div>
	);
}

export default ContinuousDecoupled;