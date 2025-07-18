import { Card, Col, Container, Image, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import { CurrentStep, Participant, StudyStep, useStudy } from "rssa-api";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { participantState } from "../states/participantState";
import { studyStepState } from "../states/studyState";
import { urlCacheState } from "../states/urlCacheState";
import { StudyPageProps } from "./StudyPage.types";


const StudyMap: React.FC<StudyPageProps> = ({ next, }) => {

	const { studyApi } = useStudy();
	const navigate = useNavigate();

	const rspref = require("../res/rate-prefs.png");
	const presurvey = require("../res/pre-survey.png");
	const rsinteract = require("../res/interact.png");
	const postsurvey = require("../res/post-survey.png")

	const [participant, setParticipant] = useRecoilState(participantState);
	const [studyStep, setStudyStep] = useRecoilState(studyStepState);
	const setNextUrl = useSetRecoilState(urlCacheState);

	const handleNextBtn = async () => {
		if (!participant || !studyStep) {
			console.error("Participant or study step is not defined.");
			return;
		}
		try {
			const nextStep: StudyStep = await studyApi.post<CurrentStep, StudyStep>('studies/steps/next', {
				current_step_id: participant.current_step
			});
			setStudyStep(nextStep);
			const updatedParticipant: Participant = {
				...participant,
				current_step: nextStep.id,
			};
			await studyApi.put('participants/', updatedParticipant);
			setParticipant(updatedParticipant);
			setNextUrl(next);

			navigate(next);
		} catch (error) {
			console.error("Error getting next to updating study progress", error);
		}
	}

	return (
		<Container>
			<Header title={studyStep?.name} content={studyStep?.description} />
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
			<Footer callback={handleNextBtn} />
		</Container>
	)
}

export default StudyMap;