import { LoadingScreenProps } from "./LoadingScreen.types";
import "./LoadingScreen.css";
import { Container, Row } from "react-bootstrap";


const LoadingScreen: React.FC<LoadingScreenProps> = ({
	loading,
	message,
	byline
}) => {

	return (
		<Container>
			{loading &&
				<Row style={{ margin: "0 0 0 0" }}>

					<div className="ls-container">
						<h2>
							{message}
							<div className="loaderStage">
								<div className="dot-floating"></div>
							</div>
						</h2>
						{byline && <p>{byline}</p>}
					</div>
				</Row>
			}
		</Container>
	)
}

export default LoadingScreen;