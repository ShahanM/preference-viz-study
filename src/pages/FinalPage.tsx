import { useEffect, useState } from "react";
import { Container, Row } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { CurrentStep, StudyStep } from "../rssa-api/RssaApi.types";
import { useStudy } from "../rssa-api/StudyProvider";
import { StudyPageProps } from "./StudyPage.types";


const FinalPage: React.FC<StudyPageProps> = ({
	next,
	checkpointUrl,
	participant,
	studyStep,
	updateCallback
}) => {

	const { studyApi } = useStudy();
	const navigate = useNavigate();
	const location = useLocation();

	const [isUpdated, setIsUpdated] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	// Allowing for some simple checkpoint saving so the participant
	// can return to the page in case of a browser/system crash
	useEffect(() => {
		if (checkpointUrl !== '/' && checkpointUrl !== location.pathname) {
			navigate(checkpointUrl);
		}
	}, [checkpointUrl, location.pathname, navigate]);

	const handleNextBtn = () => {
		// console.log("MovieRatingPage stepID", participant.current_step);
		// studyApi.post<CurrentStep, StudyStep>('studystep/next', {
		// 	current_step_id: participant.current_step
		// }).then((nextStep) => {
		// 	updateCallback(nextStep, next)
		// 	setIsUpdated(true);
		// });
		localStorage.clear();
		console.log("Local storage cleared");
		setIsUpdated(true);
	}

	useEffect(() => {
		if (isUpdated) {
			navigate(next);
		}
	}, [isUpdated, navigate, next]);

	return (
		<Container>
			<Row>
				<Header title={studyStep?.name} content={studyStep?.description} />
			</Row>
			<Row>
				<h1>Some reditect info.</h1>
			</Row>
			<Row>
				<Footer callback={handleNextBtn} text={"Done"}/>
			</Row>
		</Container>
	)
}

export default FinalPage;