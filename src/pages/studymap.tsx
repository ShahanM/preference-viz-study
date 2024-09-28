import { useEffect, useState } from "react";
import { Card, Col, Container, Image, Row } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { CurrentStep, StudyStep } from "../rssa-api/RssaApi.types";
import { useStudy } from "../rssa-api/StudyProvider";
import { StudyPageProps } from "./StudyPage.types";


const StudyMap: React.FC<StudyPageProps> = ({
	next,
	checkpointUrl,
	participant,
	studyStep,
	updateCallback
}) => {

	const [isUpdated, setIsUpdated] = useState<boolean>(false);

	const { studyApi } = useStudy();
	const navigate = useNavigate();
	const location = useLocation();

	const rspref = require("../res/rate-prefs.png");
	const presurvey = require("../res/pre-survey.png");
	const rsinteract = require("../res/interact.png");
	const postsurvey = require("../res/post-survey.png")
	console.log("StudyMap", studyStep, participant);

	useEffect(() => {
		if (checkpointUrl !== '/' && checkpointUrl !== location.pathname) {
			navigate(checkpointUrl);
		}
	}, [checkpointUrl, location.pathname, navigate]);

	const handleNextBtn = () => {
		console.log("StudyMap stepID", participant.current_step);
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
		<Container>
			<Row>
				<Header title={studyStep?.name} content={studyStep?.description} />
			</Row>
			<Row>
				<Col>
					<Card className="overviewCard">
						<Card.Body>
							<Card.Title>Pre-survey</Card.Title>
							<Image src={presurvey} fluid />
						</Card.Body>
					</Card>
				</Col>
				<Col>
					<Card className="overviewCard">
						<Card.Body>
							<Card.Title>Indicate your preference</Card.Title>
							<Image src={rspref} fluid />
						</Card.Body>
					</Card>
				</Col>
				<Col>
					<Card className="overviewCard">
						<Card.Body>
							<Card.Title>Interact with the system</Card.Title>
							<Image src={rsinteract} fluid />
						</Card.Body>
					</Card>
				</Col>
				<Col>
					<Card className="overviewCard">
						<Card.Body>
							<Card.Title>Post-survey</Card.Title>
							<Image src={postsurvey} fluid />
						</Card.Body>
					</Card>
				</Col>
			</Row>
			<Row>
				<Footer callback={handleNextBtn} />
			</Row>
		</Container>
	)
}

export default StudyMap;