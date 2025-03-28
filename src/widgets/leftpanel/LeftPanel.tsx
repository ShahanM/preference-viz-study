import { Container, Form, Row } from 'react-bootstrap';
import { TextConstruct, TextItemResponse } from 'rssa-api';
import './LeftPanel.css';
import Parse from 'html-react-parser';

interface LeftPanelProps {
	prompts: TextConstruct[];
	lockFields: boolean;
	promptsUpdateCallback: (response: TextItemResponse) => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
	prompts,
	lockFields,
	promptsUpdateCallback
}) => {


	const handlePromptResponse = (construct_id: string, promptId: string,
		response: string) => {
		promptsUpdateCallback({
			construct_id: construct_id,
			item_id: promptId,
			response: response
		});
	}

	return (
		<Container className="leftpanel">
			<Row>
				<h3>
					Please answer the following questions.
				</h3>
				<p>Answers must be 50 words or more.</p>
			</Row>
			<hr />
			{prompts && prompts.length > 0 ? prompts.map((prompt, idx) => (
				<Row key={`prompt-row-${idx}`} style={{textAlign: "left", padding: "0.5rem"}}>
					{Parse(prompt.items.text)}
					{/* <p>
						Hint: Movie(s) you like that others dislike or you
						dislike that others like.
					</p> */}
					<Form>
						<Form.Group className="mb-3" controlId="uniquePreferences">
							<Form.Control as="textarea" rows={4}
								disabled={lockFields}
								onChange={(e) =>
									handlePromptResponse(prompt.id,
										prompt.items.id,
										e.target.value)}
							/>
						</Form.Group>
					</Form>
				</Row>
			))
				: <></>

			}
		</Container>
	);
}

export default LeftPanel;