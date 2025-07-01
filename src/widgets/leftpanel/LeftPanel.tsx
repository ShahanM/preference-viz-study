import Parse from 'html-react-parser';
import { Button, Container, Form, Row } from 'react-bootstrap';
import './LeftPanel.css';
import { participantState, studyStepState } from '../../state/studyState';
import { useRecoilValue } from 'recoil';
import { Participant, StudyStep, useStudy } from 'rssa-api';
import { useCallback, useState } from 'react';
import LoadingText from '../../components/LoadingText';
import { WarningDialog } from '../../components/dialogs/warningDialog';
import ConfirmationDialog from '../../components/dialogs/ConfirmationDialog';


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
		text: "<p><strong>Which one of the movies on the visualization is unfamiliar to you?</strong></p>",
	},
	{
		context_tag: "2",
		text: `<p><strong>Please tell us how you think you could use this visualization to:</strong>
				<ul style="margin: 0.5rem">
					<li style="list-style: none; margin: 0 1em 1em 1em;">Expand your preference/Explore new interests. 
						For example, I have watched most popular movies in a genre but I haven't gone into the
						depth/haven't gone into the niche.</li>
					<li style="list-style: none; margin: 0 1em 1em 1em;">Widening an existing interest: Expanding beyond your niche.</li>
					<li style="list-style: none; margin: 0 1em 1em 1em;">Deepening an interest: Going down the niche rabbit hole.</li>
				</ul>
			</p>`,
	},
	{
		context_tag: "3",
		text: `<p><strong>What are your action plan to extend preferences?</strong></p>`,
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
				<h3>
					Please answer the following questions.
				</h3>
				<p>Answers must be 50 words or more.</p>
			</Row>
			<hr />
			{PROMPTS && PROMPTS.length > 0 ? PROMPTS.map((prompt, idx) => (
				<Row key={`prompt-row-${idx}`} style={{ textAlign: "left", padding: "0.5rem" }}>
					{Parse(prompt.text)}
					{/* <p>
						Hint: Movie(s) you like that others dislike or you
						dislike that others like.
					</p> */}
					<Form>
						<Form.Group className="mb-3" controlId="uniquePreferences">
							<Form.Control as="textarea" rows={4}
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
			<Row>
				<Button variant={'ers'} size="lg" className="layout-footer-btn"
					onClick={handleSubmit} disabled={submitButtonDisabled || loading || dataSubmitted}>
					{!loading ? "Submit" : <LoadingText text={"Loading..."} />}
				</Button>
			</Row>
		</Container>
	);
}

export default LeftPanel;