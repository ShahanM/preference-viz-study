import { Container, Form, Row } from 'react-bootstrap';
import { TextConstruct, TextItemResponse } from 'rssa-api';
import './LeftPanel.css';
import Parse from 'html-react-parser';

interface LeftPanelProps {
	prompts: TextConstruct[];
	lockFields: boolean;
	promptsUpdateCallback: (response: TextItemResponse) => void;
}

const PROMPTS: TextConstruct[] = [
	{
		id: "1",
		items: {
			id: "1",
			construct_id: "1",
			text: "<p><strong>Which one of the movies on the visualization is unfamiliar to you?</strong></p>",
			order_position: 1,
			item_type: "text"
		}
	},
	{
		id: "2",
		items: {
			id: "2",
			construct_id: "2",
			text: `<p><strong>Please tell us how you think you could use this visualization to:</strong>
				<ul style="margin: 0.5rem">
					<li style="list-style: none; margin: 0 1em 1em 1em;">Expand your preference/Explore new interests. 
						For example, I have watched most popular movies in a genre but I haven't gone into the
						depth/haven't gone into the niche.</li>
					<li style="list-style: none; margin: 0 1em 1em 1em;">Widening an existing interest: Expanding beyond your niche.</li>
					<li style="list-style: none; margin: 0 1em 1em 1em;">Deepening an interest: Going down the niche rabbit hole.</li>
				</ul>
			</p>`,
			order_position: 2,
			item_type: "text"
		}
	},
	{
		id: "3",
		items: {
			id: "3",
			construct_id: "3",
			text: `<p><strong>What are your action plan to extend preferences?</strong></p>`,
			order_position: 3,
			item_type: "text"
		}
	}
]

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
			{PROMPTS && PROMPTS.length > 0 ? PROMPTS.map((prompt, idx) => (
				<Row key={`prompt-row-${idx}`} style={{ textAlign: "left", padding: "0.5rem" }}>
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