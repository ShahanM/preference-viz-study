import { useLocation, useNavigate } from "react-router-dom";
import { useStudy } from "../rssa-api/StudyProvider";
import { StudyPageProps } from "./StudyPage.types";
import { useEffect, useState } from "react";
import { CurrentStep, StudyStep } from "../rssa-api/RssaApi.types";
import { Container, Form, Row } from "react-bootstrap";
import Header from "../components/Header";
import Footer from "../components/Footer";

const FeedbackPage: React.FC<StudyPageProps> = ({
	next,
	checkpointUrl,
	participant,
	studyStep,
	updateCallback
}) => {

	const { studyApi } = useStudy();
	const navigate = useNavigate();
	const location = useLocation();

	// Convenient states to ensure state update and when to show the loader
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
		console.log("MovieRatingPage stepID", participant.current_step);
		studyApi.post<CurrentStep, StudyStep>('studystep/next', {
			current_step_id: participant.current_step
		}).then((nextStep) => {
			updateCallback(nextStep, next)
			setIsUpdated(true);
		});
	}

	useEffect(() => {
		if (isUpdated) {
			navigate(next);
		}
	}, [isUpdated, navigate, next]);


	return (
		<Container fluid>
			<Row>
				<Header title={studyStep?.name} content={studyStep?.description} />
			</Row>
			<Row>
				<p>Thank you for participating in our study! Please provide feedback on your experience.</p>
				<Form>
					<Form.Group className="mb-3" controlId="feedback">
						<Form.Label>Feedback</Form.Label>
						<Form.Control as="textarea" rows={4}/>
					</Form.Group>
				</Form>
			</Row>
			<Row>
				<Footer callback={handleNextBtn} />
			</Row>
		</Container>
	);
}

export default FeedbackPage;