import React, { useEffect, useState } from "react";
import { Button, Container, Form, Row } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { CurrentStep, Feedback, Participant, StudyStep, useStudy } from "rssa-api";
import { WarningDialog } from "../../components/dialogs/warningDialog";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { participantState, studyStepState } from "../../state/studyState";
import { StudyPageProps } from "../StudyPage.types";
import "./FeedbackPage.css";

const FeedbackPage: React.FC<StudyPageProps> = ({
	next,
	checkpointUrl,
	// participant,
	// studyStep,
	updateCallback
}) => {

	const participant: Participant | null = useRecoilValue(participantState);
	const studyStep: StudyStep | null = useRecoilValue(studyStepState);

	const { studyApi } = useStudy();
	const navigate = useNavigate();
	const location = useLocation();

	// Convenient states to ensure state update and when to show the loader
	const [isUpdated, setIsUpdated] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [btnDisabled, setBtnDisabled] = useState<boolean>(true);
	const [feedback, setFeedback] = useState<string>('');
	const [showWarning, setShowWarning] = useState<boolean>(false);

	// Allowing for some simple checkpoint saving so the participant
	// can return to the page in case of a browser/system crash
	useEffect(() => {
		if (checkpointUrl !== '/' && checkpointUrl !== location.pathname) {
			navigate(checkpointUrl);
		}
	}, [checkpointUrl, location.pathname, navigate]);

	const submitFeedback = (evt: React.MouseEvent<HTMLElement>) => {
		if (!participant || !studyStep) {
			console.warn("SurveyPage or participant is undefined in transformedSurveyReponse.");
			return null;
		}
		if (feedback.length === 0) {
			setShowWarning(true);
			return;
		} else {
			setShowWarning(false);
			setLoading(true);
			setBtnDisabled(true);
			studyApi.post<Feedback, boolean>(`participant/${participant.id}/feedback/`, {
				participant_id: participant.id,
				feedback: feedback,
				feedback_type: 'study',
				feedback_category: 'participant general feedback'
			}).then((success: boolean) => {
				if (success) {
					setLoading(false);
					setBtnDisabled(false);
				}
			});
		}
	}

	const handleWarningConfirm = () => {
		setShowWarning(false);
		setBtnDisabled(false);
	}

	const handleNextBtn = () => {
		if (!participant || !studyStep) {
			console.error("Participant or study step is not defined.");
			return;
		}
		studyApi.post<CurrentStep, StudyStep>('studystep/next', {
			current_step_id: participant.current_step
		}).then((nextStep: StudyStep) => {
			updateCallback(nextStep, participant, next)
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
			{showWarning && <WarningDialog show={showWarning} confirmCallback={handleWarningConfirm}
				title="Empty feedback" message="<p>You hardly wrote anything.</p><p>Are you sure you are done?</p>"
				confirmText="Yes, I'm done"
			/>}
			<Row>
				<Header title={studyStep?.name} content={studyStep?.description} />
			</Row>
			<Row className="feedback-body">
				<Form>
					<Form.Group className="mb-3" controlId="feedback">
						<Form.Label>
							<p>Thank you for participating in our study!</p>
							<p>
								Tell us about your experience with the study.
								This is a research study and your feedback is
								not only important to us, but also greatly
								appreciated.
							</p>
						</Form.Label>
						<Form.Control as="textarea" rows={4} value={feedback} onChange={(evt) => setFeedback(evt.target.value)} />
					</Form.Group>
					<Button variant="ers" onClick={submitFeedback}>
						Submit
					</Button>
				</Form>
			</Row>
			<Row>
				<Footer callback={handleNextBtn} disabled={btnDisabled} />
			</Row>
		</Container>
	);
}

export default FeedbackPage;
// https://m.media-amazon.com/images/M/MV5BMjE4NTA1NzExN15BMl5BanBnXkFtZTYwNjc3MjM3._V1_.jpg