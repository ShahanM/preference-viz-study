import { LoadingScreenProps } from "./LoadingScreen.types";
import "./LoadingScreen.css";


const LoadingScreen: React.FC<LoadingScreenProps> = ({
	loading,
	message,
	byline
}) => {

	return (
		<>
			{loading &&
				<div className="ls-container">
					<h2>
						{message}
						<div className="loaderStage">
							<div className="dot-floating"></div>
						</div>
					</h2>
					{byline && <p>{byline}</p>}
				</div>
			}
		</>
	)
}

export default LoadingScreen;