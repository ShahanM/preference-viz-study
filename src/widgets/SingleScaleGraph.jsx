import { useEffect, useMemo, useState } from "react";
import { imgurl } from "../middleware/requests";

const posterWidth = 54;
const posterHeight = 81;

const svgFontHeight = 12;

const svgDrawingBaseline = posterHeight;

const ticksCount = 5;
const svgTicksColor = "rgb(0, 0, 0)";
const tickHeight = 10;

const xAxisOffset = posterWidth / 2;

const navDotRadius = 4;
const navDotColor = "rgb(144, 81, 207)"
const navDotXThreshold = navDotRadius;

// const navLanes = 8;
const navLaneHeight = 2 * navDotRadius + 3;


export default function SingleScaleGraph({ graphID, width, height, data, dataInfo, pairingID, ...props }) {

	const [collision, setCollision] = useState(false);
	const [navLanes, setNavLanes] = useState(8);

	const navLaneXDiv = 20; // We might want to make this dynamic with window size

	useEffect(() => {
		if (collision) {
			setNavLanes(navLanes + 1);
			setCollision(false);
		}
	}, [collision, navLanes]);

	const sortedData = useMemo(() => {
		return data.length > 0 ? data.sort((a, b) =>
			(a.score > b.score) ? 1 : -1) : [];
	}, [data]);

	const xSubdivWidth = useMemo(() => {
		return (width - 2 * xAxisOffset) / (ticksCount - 1);
	}, [width]);

	const navGridXMax = useMemo(() => {
		return (ticksCount - 1) * navLaneXDiv;
	}, [navLaneXDiv]);


	const yAugmentedData = useMemo(() => {
		if (sortedData.length > 0) {
			let augmentedData = [];
			// We keep track of the last x position of each lane
			// We will start at the top lane and move down the y axis
			let sweepingX = Array(navLanes).fill(xAxisOffset);
			const cy = svgDrawingBaseline + (5 * posterHeight / 4)
				+ (navLanes * navLaneHeight) / 2;

			sortedData.forEach((d, i) => {
				const cx = (d.score - 1) * xSubdivWidth + xAxisOffset;
				d.x = cx;
				d.y = cy;

				if (i === 0) {
					augmentedData.push(d);
					sweepingX[0] = cx + navDotXThreshold;
					return;
				}
				let maxDistance = { dist: 0, lane: 0 };
				let laneAlternator = 0;
				for (let j = 0; j < sweepingX.length; j++) {
					const dist = cx - sweepingX[j];
					let negMultiplier = Math.pow(-1, j);
					if (dist > navDotXThreshold) {
						sweepingX[j] = cx + navDotXThreshold;
						d.y = cy + ((j - laneAlternator) * navLaneHeight)
							* negMultiplier;
						break;
					} else {
						if (dist > maxDistance.dist) {
							maxDistance.dist = dist;
							maxDistance.lane = j;
						}
						if (j === sweepingX.length - 1) {
							console.log("We have a collision in all lanes");
							setCollision(true);
							// We have a collision in all lanes so we
							// need to add a new lane.
							// We add the navigation dot to the lane where the
							// distance is the largest
							sweepingX[maxDistance.lane] = cx + navDotXThreshold;
							d.y = cy + (maxDistance.lane * navLaneHeight)
								* Math.pow(-1, maxDistance.lane);
						}
					}
					laneAlternator += negMultiplier < 0 ? 1 : 0;
				}

				augmentedData.push(d);
			});
			return augmentedData;
		}
	}, [sortedData, xSubdivWidth, navLanes]);

	const onItemHover = (evt, effect) => {
		let target = evt.target;
		const item_id = target.getAttribute("item_id");
		if (target.getAttribute("item_type") === "nav") {
			target = document.getElementById(
				`img-${graphID}-${item_id}`);
		}

		imgHoverEffect(target, effect);

		if (pairingID) {
			const pairingTarget = document.getElementById(
				`img-${pairingID}-${item_id}`);
			imgHoverEffect(pairingTarget, effect);
		}

		if (props.onItemHover) { props.onItemHover(item_id); }
	}

	const imgHoverEffect = (target, effect) => {
		switch (effect) {
			case "out":
				const itemScore = target.getAttribute("item_score");
				target = transformImg(target, posterWidth, posterHeight,
					(itemScore - 1) * xSubdivWidth,
					svgDrawingBaseline);
				break;
			case "in":
				const parent = target.parentNode;
				target = transformImg(target, posterWidth * 2, posterHeight * 2,
					target.getAttribute("x") - posterWidth / 2,
					target.getAttribute("y") - posterHeight);
				parent.appendChild(target);
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

	const getNavGridYPos = (lane) => {
		return svgDrawingBaseline + (5 * posterHeight / 4) +
			(navLanes % 2 === 0 ?
				(lane * (navLaneHeight + navLaneHeight) / 2)
				: (lane * (navLaneHeight) + navLaneHeight / 2))
	}

	const getNavGridXPos = (subDivMark) => {
		return xAxisOffset + subDivMark * xSubdivWidth / navLaneXDiv;
	}

	return (
		<svg key={graphID} id={graphID} width={width} height={height}>
			{yAugmentedData.map((d, i) =>
				<circle key={`circle-${graphID}-${d.item_id}`}
					id={`circle-${d.item_id}`}
					cx={(d.score - 1) * xSubdivWidth + xAxisOffset}
					cy={d.y} r={navDotRadius} fill={navDotColor}
					cursor={"pointer"}
					item_id={d.item_id} item_score={d.score}
					item_type={"nav"}
					onMouseEnter={evt => onItemHover(evt, "in")}
					onMouseLeave={evt => onItemHover(evt, "out")} />
			)}
			{yAugmentedData.map((d, i) =>
				<image key={`img-${graphID}-${d.item_id}`}
					id={`img-${graphID}-${d.item_id}`}
					width={posterWidth} height={posterHeight}
					x={(d.score - 1) * xSubdivWidth}
					y={svgDrawingBaseline}
					xlinkHref={imgurl(dataInfo[d.item_id].poster_identifier)}
					cursor={"pointer"}
					item_id={d.item_id} item_score={d.score}
					item_type={"img"}
					onMouseEnter={evt => onItemHover(evt, "in")}
					onMouseLeave={evt => onItemHover(evt, "out")}
				/>
			)}
			<line key={graphID} x1={xAxisOffset} y1={height - svgFontHeight * 2}
				x2={width - xAxisOffset} y2={height - svgFontHeight * 2}
				style={{ stroke: svgTicksColor, strokeWidth: "2" }} />
			{
				[...Array(ticksCount).keys()].map(i =>
					<line key={`xAxis-${graphID}-${i}`}
						x1={(i) * xSubdivWidth + xAxisOffset}
						y1={height - svgFontHeight * 2}
						x2={(i) * xSubdivWidth + xAxisOffset}
						y2={height - tickHeight - svgFontHeight * 2}
						style={{
							stroke: svgTicksColor, strokeWidth: "2"
						}} />
				)}
			{[...Array(ticksCount).keys()].map(i =>
				<text key={`xAxisLabel-${graphID}-${i}`}
					x={(i) * xSubdivWidth + xAxisOffset}
					y={height - svgFontHeight}
					textAnchor="middle" fill={svgTicksColor}
					fontSize={svgFontHeight}>
					{i + 1}
				</text>
			)
			}
			{
				[...Array(navLanes).keys()].map(i =>
					<line key={`navLane-${graphID}-${i}`}
						x1={getNavGridXPos(0)} y1={getNavGridYPos(i)}
						x2={getNavGridXPos(navGridXMax)} y2={getNavGridYPos(i)}
						style={{ stroke: svgTicksColor, strokeWidth: "0.25" }} />
				)
			}
			{
				[...Array(navGridXMax + 1)
					.keys()].map(i =>
						<line key={`navLaneXDiv-${graphID}-${i}`}
							x1={getNavGridXPos(i)} y1={getNavGridYPos(0)}
							x2={getNavGridXPos(i)} y2={getNavGridYPos(navLanes - 1)}
							style={{ stroke: svgTicksColor, strokeWidth: "0.25" }} />
					)
			}
			<defs className="itemImg">
			</defs>
		</svg >
	)
}
