import { Image, Row } from "react-bootstrap";
import type { PreferenceVizComponentProps, PreferenceVizRecommendedItem } from "../../types/preferenceVisualization.types";

const posterWidth = 81;
const posterHeight = 81;

const Baseline: React.FC<PreferenceVizComponentProps> = ({
	width,
	height,
	data,
	xCol,
	yCol,
	onHover
}) => {

	const numColumns = Math.min(Object.keys(data).length, 10); // Example: max 4 columns
	const gridStyle = {
		display: 'grid',
		margin: '0 auto',
		gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
		gap: '1px', // Adjust gap as needed
	};

	console.log("Baseline data: ", data);
	return (
		<Row className="m-3 gap-1 overflow-x-auto" style={{ maxHeight: "900px" }}>
			{Object(data).map((k: string, item: PreferenceVizRecommendedItem) =>
				<div key={`{rec}-movies-${k}`} className="baseline-item-div d-flex shadow-sm p-1" onMouseOver={() => onHover(item.id)}>
					<Image
						className="baseline-image"
						src={item.poster}
						height={posterHeight}
						alt={item.title}

					/>
					<p className="fw-medium ms-3">{item.title}</p>
				</div>


			)}
		</Row>
	)
}

export default Baseline;