import { useEffect, useMemo, useState } from "react";
import Row from "react-bootstrap/Row";
import ToggleButton from "react-bootstrap/ToggleButton";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import { imgurl } from "../middleware/requests";

const posterWidth = 54;
// const posterWidth = 27;
const posterHeight = 81;
// const posterHeight = 36;

const svgFontHeight = 12;

const svgDrawingBaseline = posterHeight;

const ticksCount = 6;
const svgTicksColor = "rgb(0, 0, 0)";
const svgGridColor = "rgb(180, 117, 54)";
const tickHeight = 10;

const xAxisOffset = posterWidth;
const yAxisOffset = posterHeight / 2;

const navDotRadius = 5;

const navDotColorArray = [`#003f5c`, `#2f4b7c`, `#665191`, `#a05195`, `#d45087`, `#f95d6a`, `#ff7c43`, `#ffa600`];

export default function CartesianGraph({ graphID, width, height, data, xCol, yCol, ...props }) {

	const [collision, setCollision] = useState(false);
	const [navLanes, setNavLanes] = useState(8);

	const [vizVariant, setVizVariant] = useState(props.variant);
	const [showToggle, setShowToggle] = useState(false);


	useEffect(() => {
		if (collision) {
			setNavLanes(navLanes + 1);
			setCollision(false);
		}
	}, [collision, navLanes]);



	const xSubdivWidth = useMemo(() => {
		return (width - xAxisOffset - svgFontHeight) / (ticksCount - 1);
	}, [width]);

	const ySubdivHeight = useMemo(() => {
		return (height - svgDrawingBaseline) / (ticksCount - 1);
	}, [height]);

	const hoverHandler = (evt, effect) => {
		let target = evt.target;
		const item_id = target.getAttribute("item_id");
		imgHoverEffect(target, effect);
		console.log("Hovering over item", item_id);
		if (props.onItemHover) { props.onItemHover(parseInt(item_id)); }
	}

	const imgHoverEffect = (target, effect) => {
		const itemX = target.getAttribute("x_val");
		const itemY = target.getAttribute("y_val");
		const parent = target.parentNode;
		// const siblings = Array.from(parent.children).filter(child => child !== target);

		switch (effect) {
			case "out":
				// Restore the original size and position of the target
				target = transformImg(target, posterWidth, posterHeight,
					(itemX) * xSubdivWidth + xAxisOffset,
					height - (itemY) * ySubdivHeight - posterHeight - 2 * svgFontHeight - tickHeight);
				target.removeAttribute("filter");

				// Restore the original positions of the surrounding objects
				// siblings.forEach(sibling => {
				// 	const siblingX = parseFloat(sibling.getAttribute("x_val"));
				// 	const siblingY = parseFloat(sibling.getAttribute("y_val"));
				// 	transformImg(sibling, posterWidth, posterHeight,
				// 		(siblingX) * xSubdivWidth + xAxisOffset,
				// 		height - (siblingY) * ySubdivHeight - posterHeight - 2 * svgFontHeight - tickHeight);
				// });
				break;
			case "in":
				// const parent = target.parentNode;
				// Enlarge the target and move it to the front
				target = transformImg(target, posterWidth * 2, posterHeight * 2,
					target.getAttribute("x") - posterWidth / 2,
					target.getAttribute("y") - posterHeight / 2);
				target.setAttribute("filter", "url(#drop-shadow");
				parent.appendChild(target);

				// // Spread out the surrounding objects
				// siblings.forEach(sibling => {
				// 	const siblingX = parseFloat(sibling.getAttribute("x_val"));
				// 	const siblingY = parseFloat(sibling.getAttribute("y_val"));
				// 	const dx = siblingX - itemX;
				// 	const dy = siblingY - itemY;
				// 	const distance = Math.sqrt(dx * dx + dy * dy);
				// 	const spreadFactor = 1.5; // Spread factor to control the spread distance

				// 	if (distance < 0.5) { // Only spread out the objects that are close to the target
				// 		const newX = siblingX + dx * spreadFactor;
				// 		// const newX = siblingX + dx;
				// 		const newY = siblingY + dy * spreadFactor;
				// 		// const newY = siblingY + posterHeight * 2;
				// 		transformImg(sibling, posterWidth, posterHeight,
				// 			(newX) * xSubdivWidth + xAxisOffset,
				// 			height - (newY) * ySubdivHeight - posterHeight - 2 * svgFontHeight - tickHeight);
				// 	}
				// })
				break;
			default:
				break;
		}
	}

	const transformImg = (target, w, h, x, y) => {
		target.setAttribute("width", w);
		target.setAttribute("height", h);
		target.setAttribute("x", x);
		target.setAttribute("y", y);

		return target;
	}

	return (
		<>
			{showToggle &&
				<Row style={{ margin: "2em", padding: "0.5em" }}>
					<ToggleButtonGroup type="radio" name="options" defaultValue={1}
						onChange={(val) => setVizVariant(val)}>
						<ToggleButton id="tbg-radio-1" value={1}>
							Posters
						</ToggleButton>
						<ToggleButton id="tbg-radio-2" value={2}>
							Dots
						</ToggleButton>
					</ToggleButtonGroup>
				</Row>
			}
			{vizVariant === 1 ?
				<ImageGraph data={data} graphID={graphID} width={width} height={height}
					xSubdivWidth={xSubdivWidth} ySubdivHeight={ySubdivHeight}
					xCol={xCol} yCol={yCol} hoverCallback={hoverHandler} />
				:
				<DotGraph data={data} graphID={graphID} width={width} height={height}
					xSubdivWidth={xSubdivWidth} ySubdivHeight={ySubdivHeight}
					xCol={xCol} yCol={yCol} hoverCallback={hoverHandler} />
			}
		</>
	)
}


const DropShadowFilter = () => (
	<defs>
		<filter id="drop-shadow" x="-50%" y="-50%" width="200%" height="200%">
			<feOffset result="offOut" in="SourceAlpha" dx="9" dy="9" />
			<feGaussianBlur result="blurOut" in="offOut" stdDeviation="9" />
			<feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
		</filter>
	</defs>
);
// id={`img-${graphID}-cc-${item.movie_id}`}
// key={`img-${graphID}-cc-${item.movie_id}`}
function ImageGraph({ data, graphID, width, height, xCol, yCol, xSubdivWidth, ySubdivHeight, hoverCallback }) {
	const dataArray = Array.from(data.values());
	return (
		<svg key={`${graphID}-cc`} id={graphID} width={width} height={height + svgFontHeight}>
			<DropShadowFilter />
			<Grid width={width} height={height} xSubdivWidth={xSubdivWidth} ySubdivHeight={ySubdivHeight} />
			{dataArray.map((item) =>
				<g key={`img-${graphID}-cc-${item.movie_id}`}>
					{/* <mask id={`img-${graphID}-cc-${item.movie_id}`}>
						<circle
							cx={(item[xCol]) * xSubdivWidth + xAxisOffset + posterWidth / 2}
							cy={height - (item[yCol]) * ySubdivHeight - posterHeight - 2 * svgFontHeight - tickHeight + posterHeight / 2}
							r={posterHeight/4}
							fill={"white"}
						/>
					</mask> */}
					<image
						width={posterWidth}
						height={posterHeight}
						x={(item[xCol]) * xSubdivWidth + xAxisOffset}
						y={height - (item[yCol]) * ySubdivHeight - posterHeight - 2 * svgFontHeight - tickHeight}
						xlinkHref={item.poster}
						cursor={"pointer"}
						item_id={item.movie_id} x_val={item[xCol]} y_val={item[yCol]}
						item_type={"img"}
						// mask={`url(#img-${graphID}-cc-${item.movie_id})`}
						onMouseEnter={evt => hoverCallback(evt, "in")}
						onMouseLeave={evt => hoverCallback(evt, "out")}
					/>
				</g>
			)}
			<XAxis graphID={graphID} width={width} height={height} xSubdivWidth={xSubdivWidth} />
			<YAxis graphID={graphID} width={width} height={height} ySubdivHeight={ySubdivHeight} />
			<defs className="itemImg"></defs>
		</svg >
	)
}

function DotGraph({ data, graphID, width, height, xCol, yCol, xSubdivWidth, ySubdivHeight, hoverCallback }) {
	const dataArray = Array.from(data.values());
	return (
		<svg key={`${graphID}-cc`} id={graphID} width={width} height={height}>
			<Grid width={width} height={height} xSubdivWidth={xSubdivWidth} ySubdivHeight={ySubdivHeight} />
			{dataArray.map((item) =>
				<circle key={`circle-${graphID}-cc-${item.movie_id}`}
					id={`circle-${graphID}-cc-${item.movie_id}`}
					cx={(item[xCol] - 1) * xSubdivWidth + xAxisOffset + posterWidth / 2}
					cy={height - (item[yCol] - 1) * ySubdivHeight - posterHeight - 2 * svgFontHeight - tickHeight + posterHeight / 2}
					r={navDotRadius} fill={navDotColorArray[parseInt(item.cluster) % 8]}
					cursor={"pointer"}
					item_id={item.movie_id} item_score={item.score}
					item_type={"img"}
					onMouseEnter={evt => hoverCallback(evt, "in")}
					onMouseLeave={evt => hoverCallback(evt, "out")} />
			)}
			<XAxis graphID={graphID} width={width} height={height} xSubdivWidth={xSubdivWidth} />
			<YAxis graphID={graphID} width={width} height={height} ySubdivHeight={ySubdivHeight} />
			<defs className="itemImg"></defs>
		</svg >
	)
}

function XAxis({ graphID, width, height, xSubdivWidth }) {
	width = width - svgFontHeight;
	return (
		<>
			{/* X-axis line */}
			<line key={`${graphID}-cc-xAxis`}
				x1={xAxisOffset} y1={height - svgFontHeight * 2}
				x2={width} y2={height - svgFontHeight * 2}
				style={{ stroke: svgTicksColor, strokeWidth: "2" }} />

			{/* X-axis ticks */}
			{[...Array(ticksCount).keys()].map(i =>
				<line key={`xAxis-${graphID}-cc-${i}`}
					x1={(i) * xSubdivWidth + xAxisOffset}
					y1={height - svgFontHeight * 2}
					x2={(i) * xSubdivWidth + xAxisOffset}
					y2={height - tickHeight - svgFontHeight * 2}
					style={{
						stroke: svgTicksColor, strokeWidth: "2"
					}} />
			)}

			{/* X-axis tick labels */}
			{[...Array(ticksCount).keys()].map(i =>
				<text key={`xAxisLabel-${graphID}-cc-${i}`}
					x={(i) * xSubdivWidth + xAxisOffset}
					y={height - svgFontHeight}
					textAnchor="middle" fill={svgTicksColor}
					fontSize={svgFontHeight}>
					{i}
				</text>

			)}

			{/* X-axis label */}
			<text x={(3 * width) / 7} y={height + svgFontHeight / 2} fontSize={svgFontHeight * 1.5}>
				Community ratings
			</text>
		</>
	)
}

function YAxis({ graphID, height, ySubdivHeight }) {
	return (
		<>
			<line key={`${graphID}-cc-yAxis`}
				x1={parseInt(xAxisOffset - svgFontHeight)}
				y1={height - svgFontHeight * 2 - tickHeight - 2}
				x2={parseInt(xAxisOffset - svgFontHeight)}
				y2={(svgFontHeight + tickHeight) * 2}
				style={{ stroke: svgTicksColor, strokeWidth: "2" }} />
			{[...Array(ticksCount).keys()].map(i =>
				<line key={`yAxis-${graphID}-cc-${i}`}
					x1={parseInt(xAxisOffset - svgFontHeight)}
					y1={height - (i) * ySubdivHeight - 3 * svgFontHeight - 1}
					x2={parseInt(xAxisOffset - svgFontHeight) + tickHeight}
					y2={height - (i) * ySubdivHeight - 3 * svgFontHeight - 1}
					style={{
						stroke: svgTicksColor, strokeWidth: "2"
					}} />
			)}
			{[...Array(ticksCount).keys()].map(i =>
				<text key={`yAxisLabel-${graphID}-cc-${i}`}
					x={parseInt(xAxisOffset - svgFontHeight) - tickHeight}
					y={height - (i) * ySubdivHeight - 3 * svgFontHeight}
					textAnchor="middle" fill={svgTicksColor}
					fontSize={svgFontHeight}>
					{i}
				</text>
			)}
			<text x={-svgFontHeight} y={(height) / 2 + svgFontHeight} fontSize={svgFontHeight * 1.5} transform={`rotate(-90, ${svgFontHeight}, ${height / 2})`}>
				Your ratings
			</text>
		</>
	)
}

function Grid({ width, height, xSubdivWidth, ySubdivHeight }) {
	width = width - svgFontHeight;
	return (
		<>
			{[...Array((ticksCount * 8) + 3).keys()].map(i =>
				<line key={`xGrid-${i}`}
					x1={xAxisOffset + (i * xSubdivWidth / 10)}
					y1={(svgFontHeight + tickHeight) * 2}
					x2={xAxisOffset + (i * xSubdivWidth / 10)}
					y2={height - svgFontHeight * 2 - tickHeight - 2}
					style={{
						stroke: svgGridColor, strokeWidth: "0.2"
					}} />
			)}
			{[...Array((ticksCount * 8) + 3).keys()].map(i =>
				<line key={`yGrid-${i}`}
					x1={xAxisOffset}
					y1={(svgFontHeight + tickHeight) * 2 + (i * ySubdivHeight / 10)}
					x2={width}
					y2={(svgFontHeight + tickHeight) * 2 + (i * ySubdivHeight / 10)}
					style={{
						stroke: svgGridColor, strokeWidth: "0.2"
					}} />
			)}
		</>
	)
}

