import { Image, Row } from "react-bootstrap";
import { VisualizationProps } from "./VisualizationTypes.types";

const posterWidth = 81;
const posterHeight = 81;

const Baseline: React.FC<VisualizationProps> = ({
	width,
	height,
	data,
	xCol,
	yCol,
	onHover
}) => {

	const numColumns = Math.min(data.size, 10); // Example: max 4 columns
	const gridStyle = {
		display: 'grid',
		margin: '0 auto',
		gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
		gap: '1px', // Adjust gap as needed
	};

	console.log("Baseline data: ", data);
	return (
		<Row className="m-3 gap-1" style={{ maxHeight: "900px", overflowX: "scroll" }}>
			{[...data].map(([k, item]) =>
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