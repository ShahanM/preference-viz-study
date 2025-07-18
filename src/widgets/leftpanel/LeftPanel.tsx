import Parse from 'html-react-parser';
import { useCallback, useState } from 'react';
import { Button, Container, Form, Row } from 'react-bootstrap';
import { useRecoilValue } from 'recoil';
import { Participant, StudyStep, useStudy } from 'rssa-api';
import LoadingText from '../../components/LoadingText';
import ConfirmationDialog from '../../components/dialogs/ConfirmationDialog';
import { WarningDialog } from '../../components/dialogs/warningDialog';
import { participantState } from '../../states/participantState';
import { studyStepState } from '../../states/studyState';
import './LeftPanel.css';


type CustomFreeFormText = {
	context_tag: string;
	text: string;
}

interface LeftPanelProps {
	nextButtonDisabledCallback: (nextButtonDisabled: boolean) => void;
}

type FreeFormTextResponse = {
	context_tag: string;
	response: string;
}

type FreeFormTextResponseRequest = {
	participant_id: string;
	step_id: string;
	responses: FreeFormTextResponse[];
}


const PROMPTS: CustomFreeFormText[] = [
	{
		context_tag: "1",
		text: "<p>Which of the movies on the visualization are you unfamiliar with?</p>",
	},
	{
		context_tag: "2",
		text: `<p>Which of the movies in the visualization may help you:
				<ol type="a" style="margin: 0.5rem">
					<li style="margin: 0 1em 1em 1em;">
						explore a new interest (e.g. an unfamiliar genre, or pick up a new hobby)?
					</li>
					<li style="margin: 0 1em 1em 1em;">
						widen an existing interest (e.g. an unfamiliar direction within a familiar genre)?
					</li>
					<li style="margin: 0 1em 0.5em 1em;">
						deepen an existing interest (e.g. a specialization of a familiar genre)?
					</li>
				</ol>
			</p>`,
	},
	{
		context_tag: "3",
		text: `<p style="font-weight: 500">
			Use your answers above to explain the concrete steps you would take to expand your movie preferences.
		</p>`,
	}
]

const LeftPanel: React.FC<LeftPanelProps> = ({
	nextButtonDisabledCallback,
}) => {

	const participant: Participant | null = useRecoilValue(participantState);
	const studyStep: StudyStep | null = useRecoilValue(studyStepState);

	const { studyApi } = useStudy();

	const [textResponse, setTextResponse] =
		useState<Map<string, string>>(new Map<string, string>());

	const [submitButtonDisabled, setNextButtonDisabled] = useState<boolean>(true);
	const [loading, setLoading] = useState<boolean>(false);
	const [dataSubmitted, setDataSubmitted] = useState<boolean>(false);
	const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

	const handleSubmit = useCallback(async () => {
		if (!studyStep || !participant) {
			console.error("Study step or participant is not defined.");
			return;
		}

		try {
			await studyApi.post<FreeFormTextResponseRequest, boolean>('responses/text',
				{
					participant_id: participant.id,
					step_id: studyStep.id,
					responses: Array.from(textResponse.entries()).map(([context_tag, response]) => ({
						context_tag,
						response
					}))
				}
			);
			nextButtonDisabledCallback(false);
			setDataSubmitted(true);
		} catch (error) {
			console.error("Error submitting responses:", error);
			// Handle submission error, e.g., show a message
		} finally {
			setLoading(false);
		}
	}, [studyStep, participant, studyApi, textResponse, nextButtonDisabledCallback]);


	const updateTextResponse = useCallback((context_tag: string, response: string) => {
		setTextResponse(prevResponses => {
			const updatedResponses = new Map(prevResponses);
			updatedResponses.set(context_tag, response);
			// Check if all responses are at least 50 words
			const allResponded = [...updatedResponses.values()].every(res => res.length >= 50);
			setNextButtonDisabled(!allResponded);
			return updatedResponses;
		});
	}, []);

	return (
		<Container className="leftpanel">
			<WarningDialog show={dataSubmitted} title="Success"
				message={`Your responses have been submitted. 
								You may now click the next button to proceed.`} />
			<ConfirmationDialog show={showConfirmation} title="Confirmation"
				message={`Are you sure you want to submit your responses?`}
				onConfirm={handleSubmit}
				onCancel={() => setShowConfirmation(false)} />
			<Row>
				<p className="mt-3" style={{fontWeight: "500"}}>
					Please use this page to collect some notes for the essay that you will write
					in the next step of the study. To help you write the essay, here are some guiding
					prompts, and questions.
				</p>
			</Row>
			<hr />
			{PROMPTS && PROMPTS.length > 0 ? PROMPTS.map((prompt, idx) => (
				<Row key={`prompt-row-${idx}`} style={{ textAlign: "left", padding: "0 0.5rem" }}>
					{Parse(prompt.text)}
					{/* <p>
						Hint: Movie(s) you like that others dislike or you
						dislike that others like.
					</p> */}
					<Form>
						<Form.Group className="mb-1" controlId="uniquePreferences">
							<Form.Control as="textarea" rows={idx === 2? 9 : 3}
								disabled={dataSubmitted}
								onChange={(e) =>
									updateTextResponse(prompt.context_tag, e.target.value)}
							/>
						</Form.Group>
					</Form>
				</Row>
			))
				: <></>
			}
			<Row className="mt-1 p-3">
				<Button variant={'ers'} size="lg" className="layout-footer-btn"
					onClick={handleSubmit} disabled={submitButtonDisabled || loading || dataSubmitted}>
					{!loading ? "Submit" : <LoadingText text={"Loading..."} />}
				</Button>
			</Row>
		</Container>
	);
}

export default LeftPanel;