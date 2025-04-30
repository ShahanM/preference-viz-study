import * as d3 from 'd3';
import { useEffect, useMemo, useRef } from "react";
import { Row } from 'react-bootstrap';
import { DISLIKE_CUTOFF, LIKE_CUTOFF } from "../../utils/constants";
import { VisualizationProps, VizDataProps } from "./VisualizationTypes.types";



const posterWidth = 45;
const posterHeight = 72;

const likeCuttoff = LIKE_CUTOFF;
const dislikeCuttoff = DISLIKE_CUTOFF;
const margin = { top: 20, right: 20, bottom: 30, left: 40 }; // Define margins
const rowHeaderWidth = 100;
const colHeaderHeight = 100;

const defaultImage = 'https://rssa.recsys.dev/movie/poster/default_movie_icon.svg';

const DiscreteSelf: React.FC<VisualizationProps> = ({
	width,
	height,
	data,
	xCol,
	yCol,
	onHover
}) => {
	const numRows = 2;
	const numCols = 2;

	width = width - rowHeaderWidth - margin.left - margin.right;
	height = height - colHeaderHeight - margin.top - margin.bottom;
	const svgWidth = width / numCols;
	const svgHeight = height / numRows;
	const svgRefs = useRef<SVGSVGElement[]>([]);
	const simulationRefs = useRef<d3.Simulation<VizDataProps, undefined>[]>([]);

	const simNodeData = useMemo(() => {
		const NewData: VizDataProps[] = [];
		if (data) {
			for (const d of data.values()) {
				NewData.push({
					...d,
					x: svgWidth / 2,
					y: svgHeight / 2
				})
			}
		}
		return NewData;
	}, [data, svgWidth, svgHeight]);

	const filteredData = useMemo(() => {
		return {
			myLikes: simNodeData.filter((d) =>
				d.user_score >= likeCuttoff),
			myDislikes: simNodeData.filter((d) =>
				d.user_score < dislikeCuttoff),
			commLikes: simNodeData.filter((d) =>
				d.community_score >= likeCuttoff),
			commDisikes: simNodeData.filter((d) =>
				d.community_score < dislikeCuttoff)
		}
	}, [simNodeData]);

	useEffect(() => {
		const dataArrays = Object.values(filteredData);
		const currentSvgRefs = svgRefs.current.slice(); // Copy the refs array
		const currentSimulationRefs = simulationRefs.current.slice(); // Copy the simulation array
		if (currentSvgRefs.length === dataArrays.length && filteredData) {
			const newSimulations: d3.Simulation<VizDataProps, undefined>[] = [];
			svgRefs.current.forEach((svgRef, i) => {
				console.log("DiscreteDecoupled useEffect: ", i, dataArrays[i]);
				const svg = d3.select(svgRef)
					.attr("width", width / numCols)
					.attr("height", height / numRows);
				const g = svg.append<SVGGElement>("g")
					.attr("transform", `translate(${margin.left},${margin.top})`);

				const ctxData = dataArrays[i];
				g.selectAll<SVGImageElement, VizDataProps>("image")
					.data(ctxData, (d: VizDataProps) => d.id)
					.enter().append("image")
					.attr("data-id", (d) => d.id)
					.attr("xlink:href", defaultImage)
					.each(function (d: VizDataProps) { // Use .each for individual element handling
						const image = d3.select(this);
						const img = new Image();
						img.src = d.poster;

						img.onload = () => {
							image.attr("href", d.poster);
						};

						img.onerror = () => {
							image.attr("href", defaultImage);
						};
					})
					.attr("x", -posterWidth / 2)
					.attr("y", -posterHeight / 2)
					.attr("width", posterWidth)
					.attr("height", posterHeight)
					.attr("preserveAspectRatio", "xMinYMin slice")
					.style("cursor", "pointer")
					.on("mouseover", (event, d: VizDataProps) => {
						d3.selectAll("image")
							.filter(function () {
								return d3.select(this).attr("data-id") === d.id;
							})
							.raise()
							.attr("width", posterWidth * 2) // Increase width by 20%
							.attr("height", posterHeight * 2)
							.classed("image-with-border", true);
						if (onHover) {
							onHover(d.id);
						}
					})
					.on("mouseout", (event, d: VizDataProps) => {
						d3.selectAll("image")
							.filter(function () {
								return d3.select(this).attr("data-id") === d.id;
							})
							.attr("width", posterWidth) // Reset to original width
							.attr("height", posterHeight) // Reset to original height
							.classed("image-with-border", false); // Reset to original height

						if (onHover) {
							onHover("");
						}
					});

				const simulation = d3.forceSimulation<VizDataProps>()
					.force("center", d3.forceCenter<VizDataProps>()
						.x(svgWidth / 2).y(svgHeight / 2))
					.force("charge", d3.forceManyBody<VizDataProps>()
						.strength(0.5))
					.force("collide", d3.forceCollide<VizDataProps>()
						.strength(0.01).radius(45).iterations(5));

				simulation.nodes(ctxData);

				simulation.on("tick", function (this: d3.Simulation<VizDataProps, undefined>) {
					g.selectAll("image")
						.attr("x", (d) => {
							return (d as VizDataProps).x! - posterWidth / 2;
						})
						.attr("y", (d) => {
							return (d as VizDataProps).y! - posterHeight / 2;
						})
				});

				newSimulations.push(simulation);

			});

			simulationRefs.current = newSimulations;

			return () => {
				currentSimulationRefs.forEach(simulation => simulation.stop());
				currentSvgRefs.forEach(svgRef => {
					if (svgRef) {
						d3.select(svgRef).selectAll("*").remove();
					}
				})
			};

		}
	}, [width, height, filteredData, svgWidth, svgHeight, onHover]);

	const setSvgRef = (index: number) => (element: SVGSVGElement | null) => {
		svgRefs.current[index] = element!;
	};

	return (
		<Row style={{ margin: "2em", padding: "0.5em" }}>
			<div className="discrete-viz-container"> {/* 2x3 Grid */}
				<div className="row-2-col-1 discrete-viz-label-container">
					Me
				</div>
				<div className="row-1-col-2 discrete-viz-label-container">
					Likes
				</div>
				<div className="row-1-col-3 discrete-viz-label-container">
					Dislikes
				</div>
				{/* Content Boxes */}
				<div className="row-2-col-2 discrete-viz-content-box">
					{/* Canvas 1: My Likes */}
					<svg ref={setSvgRef(0)}
						width={width / 2}
						height={height / 2}></svg>
				</div>
				<div className="row-2-col-3 discrete-viz-content-box">
					{/* Canvas 2: My Dislikes */}
					<svg ref={setSvgRef(1)}
						width={width / 2}
						height={height / 2}></svg>
				</div>
			</div>
		</Row>
	);
}

export default DiscreteSelf;