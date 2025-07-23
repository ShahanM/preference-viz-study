import * as d3 from 'd3';
import { useEffect, useRef } from "react";
import { VizDataProps, VisualizationProps } from "./VisualizationTypes.types";

const posterWidth = 54;
const posterHeight = 81;

const X_AXIS_LABEL = "The system's predicted movie rating for you";
const Y_AXIS_LABEL = "Ratings from everyone else in the system"

const ContinuousCoupled: React.FC<VisualizationProps> = ({
	width,
	height,
	data,
	xCol,
	yCol,
	onHover
}) => {

	const svgRef = useRef<SVGSVGElement>(null);

	useEffect(() => {
		if (data && svgRef.current) {
			const margin = { top: 20, right: 60, bottom: 60, left: 60 }; // Adjust margins as needed
			const innerWidth = width - margin.left - margin.right;
			const innerHeight = height - margin.top - margin.bottom;

			const xScale = d3.scaleLinear().domain([0, 5]).range([0, innerWidth]);
			const yScale = d3.scaleLinear().domain([0, 5]).range([innerHeight, 0]); // Note: range is inverted for y-axis
			const svg = d3.select(svgRef.current)
				.attr("width", width)
				.attr("height", height);
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
					.ticks(50)
					.tickSize(-innerWidth)
					.tickFormat(() => "")); // Extend grid lines

			// Axes (drawn on top of grid lines)
			g.append("g")
				.attr("transform", `translate(0, ${innerHeight})`)
				.call(d3.axisBottom(xScale));

			g.append("g").call(d3.axisLeft(yScale));

			// X-axis label
			g.append("text")
				.attr("class", "axis-label")
				.attr("transform", `translate(${innerWidth / 2}, ${innerHeight + margin.bottom - 10})`)
				.style("text-anchor", "middle")
				.style("font-weight", "bold")
				.text(Y_AXIS_LABEL);

			// Y-axis label
			g.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 0 - margin.left + 15) // Adjusted position
				.attr("x", 0 - (innerHeight / 2))
				.attr("dy", "1em")
				.style("text-anchor", "middle")
				.style("font-weight", "bold")
				.text(X_AXIS_LABEL);

			// CSS for grid lines (add this to your CSS file or a <style> tag)
			svg.append("style").text(`
				.grid line {
				stroke: #ccc; /* Light gray */
				stroke-opacity: 0.7; /* Slightly transparent */
				shape-rendering: crispEdges; /* Make lines sharp */
				}
			`);

			const dataValues = Array.from(data.values()) as VizDataProps[];

			// Images
			g.selectAll<SVGImageElement, VizDataProps>("image")
				.data(dataValues)
				.enter().append("image")
				.attr("xlink:href", (d) => d.poster)
				.attr("x", (d) => xScale(d.community_score) - posterWidth / 2)
				.attr("y", (d) => yScale(d.user_score) - posterHeight / 2)
				.attr("width", posterWidth)
				.attr("height", posterHeight)
				.attr("preserveAspectRatio", "xMinYMin slice")
				.on("mouseover", (event, d: VizDataProps) => {
					d3.select(event.currentTarget)
						.style("cursor", "pointer")
						.raise()
						.attr("x", xScale(d.community_score) - posterWidth)
						.attr("y", yScale(d.user_score) - posterHeight)
						.attr("width", posterWidth * 2) // Increase width by 20%
						.attr("height", posterHeight * 2)
						.classed("image-with-border", true); // Increase height by 20%

					if (onHover) {
						onHover(d.id); // Call the onHover callback
					}
				})
				.on("mouseout", (event, d: VizDataProps) => {
					d3.select(event.currentTarget)
						.attr("x", xScale(d.community_score) - posterWidth / 2)
						.attr("y", yScale(d.user_score) - posterHeight / 2)
						.attr("width", posterWidth) // Reset to original width
						.attr("height", posterHeight) // Reset to original height
						.classed("image-with-border", false); // Reset to original height
					if (onHover) {
						onHover(""); // Call onHover with null when mouse leaves
					}
				});

		}
	}, [data, svgRef, width, height, xCol, yCol, onHover]);

	return (
		<div>
			<svg ref={svgRef} width={width} height={height}></svg>
		</div>
	);
}

export default ContinuousCoupled;