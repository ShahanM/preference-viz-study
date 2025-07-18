import React, { useCallback, useRef, useState } from "react";
import { Button, Container, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import { CurrentStep, Participant, StudyStep, useStudy } from "rssa-api";
import { WarningDialog } from "../../components/dialogs/warningDialog";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { participantState } from "../../states/participantState";
import { studyStepState } from "../../states/studyState";
import { urlCacheState } from "../../states/urlCacheState";
import { StudyPageProps } from "../StudyPage.types";
import "./FeedbackPage.css";


export type Feedback = {
	participant_id: string;
	feedback_text: string;
	feedback_type: string;
	feedback_category: string;
};


const FeedbackPage: React.FC<StudyPageProps> = ({ next, }) => {
	const [participant, setParticipant] = useRecoilState(participantState);
	const [studyStep, setStudyStep] = useRecoilState(studyStepState);
	const setNextUrl = useSetRecoilState(urlCacheState);

	const { studyApi } = useStudy();
	const navigate = useNavigate();

	const [loading, setLoading] = useState<boolean>(false);
	const [submitButtonDisabled, setSubmitButtonDisabled] = useState<boolean>(false);
	const [nextButtonDisabled, setNextButtonDisabled] = useState<boolean>(true);
	const [showWarning, setShowWarning] = useState<boolean>(false);
	const feedbackRef = useRef<HTMLTextAreaElement>(null);

	const submitFeedback = useCallback(async (event: React.MouseEvent<HTMLButtonElement>) => {
		if (!participant || !studyStep) {
			console.warn("SurveyPage or participant is undefined in submitFeedback.");
			return null;
		}
		event.preventDefault();
		if (feedbackRef.current) {
			const feedbackText = feedbackRef.current.value;
			if (feedbackText.length === 0) {
				setShowWarning(true);
				return;
			} else {
				setShowWarning(false);
				setLoading(true);
				try {
					await studyApi.post<Feedback, null>(`feedbacks`, {
						participant_id: participant.id,
						feedback_text: feedbackText,
						feedback_type: 'study',
						feedback_category: 'participant general feedback'
					});
					setSubmitButtonDisabled(true);
					setNextButtonDisabled(false);

				} catch (error) {
					console.error("Error submitting feedback:", error);
					setSubmitButtonDisabled(false);
					setNextButtonDisabled(true);
				} finally {
					setLoading(false);
				}
			}
		}
	}, [studyApi, participant, studyStep]);

	const handleWarningConfirm = () => {
		setShowWarning(false);
		setSubmitButtonDisabled(true);
		setNextButtonDisabled(false);
	}

	const handleNextBtn = useCallback(async () => {
		if (!participant || !studyStep) {
			console.error("Participant or study step is not defined.");
			return;
		}
		try {
			const nextStep = await studyApi.post<CurrentStep, StudyStep>('studies/steps/next', {
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
			console.error("Error fetching next step:", error);
			// Handle error, e.g., show a message to the user
		} finally {
			setLoading(false);
		}
	}, [studyApi, participant, next, navigate, studyStep, setStudyStep, setParticipant, setNextUrl]);


	return (
		<Container fluid>
			{showWarning && <WarningDialog show={showWarning} confirmCallback={handleWarningConfirm}
				title="Empty feedback" message="<p>You hardly wrote anything.</p><p>Are you sure you are done?</p>"
				confirmText="Yes, I'm done"
			/>}
			<Header title={studyStep?.name} content={studyStep?.description} />
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
						<Form.Control as="textarea" rows={4} ref={feedbackRef} disabled={submitButtonDisabled} />
					</Form.Group>
					<Button variant="ers" onClick={submitFeedback} disabled={submitButtonDisabled || loading}>
						Submit
					</Button>
				</Form>
			</Row>
			<Footer callback={handleNextBtn} disabled={nextButtonDisabled} />
		</Container>
	);
}

export default FeedbackPage;