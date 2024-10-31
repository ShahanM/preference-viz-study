import { Container, Form, Row } from 'react-bootstrap';
import { TextConstruct, TextItemResponse } from 'rssa-api';
import './LeftPanel.css';


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
	console.log("prompts", prompts);

	return (
		<Container className="leftpanel">
			<Row>
				<h3>
					Please write a short or medium length answer to the
					following questions.
				</h3>
			</Row>
			<hr />
			{prompts && prompts.length > 0 ? prompts.map((prompt, idx) => (
				<Row key={`prompt-row-${idx}`}>
					<h4>{prompt.items.text}</h4>
					<p>
						Hint: Movie(s) you like that others dislike or you
						dislike that others like.
					</p>
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