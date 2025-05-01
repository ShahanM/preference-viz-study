import { Image } from "react-bootstrap";
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
		<div>
			<p>Baseline</p>
			<div style={gridStyle}>
				{[...data].map(([k, item]) =>
					<div key={`{rec}-movies-${k}`} className="baseline-item-div">
						<Image
							className="baseline-image"
							src={item.poster}
							alt={item.title}
							onMouseOver={() => onHover(item.id)}
						/>
						<p>{item.title}</p>
					</div>


				)}
			</div>
		</div>
	)
}

export default Baseline;