import { Container, Form, Row } from 'react-bootstrap';
import './LeftPanel.css';
import { SurveyConstruct, TextConstruct } from '../../rssa-api/RssaApi.types';


interface LeftPanelProps {
	prompts: TextConstruct[];
}

const LeftPanel: React.FC<LeftPanelProps> = ({
	prompts
}) => {

	return (
		<Container className="leftpanel">
			<Row>
				<h3>Please write a short or medium length answer to the following questions.</h3>
			</Row>
			<hr />
			{prompts && prompts.length > 0 ? prompts.map((prompt, idx) => (
				<Row>
					<h4>{prompt.items.text}</h4>
					<p>Hint: Movie(s) you like that others dislike or you dislike that others like.</p>
					<Form>
						<Form.Group className="mb-3" controlId="uniquePreferences">
							<Form.Control as="textarea" rows={4} />
						</Form.Group>
					</Form>
				</Row>
			))
				: <></>

			}
			{/* <Row>
				<h4>What is unique about your movie preferences?</h4>
				<p>Hint: Movie(s) you like that others dislike or you dislike that others like.</p>
				<Form>
					<Form.Group className="mb-3" controlId="uniquePreferences">
						<Form.Control as="textarea" rows={4} />
					</Form.Group>
				</Form>
			</Row>
			<Row>
				<h4>What movie preferences are you uncertain about?</h4>
				<p>Hint: Movie(s) you haven't explored much or you are ambivalent about.</p>
				<Form>
					<Form.Group className="mb-3" controlId="uncertainPreferences">
						<Form.Control as="textarea" rows={4} />
					</Form.Group>
				</Form>
			</Row>
			<Row>
				<h4>What are your action plan to extend preferences?</h4>
				<p>Hint: Movie(s) you are familiar with but interested in explaining more or are new to you and could become a potential new interested.</p>
				<Form>
					<Form.Group className="mb-3" controlId="extendPreferences">
						<Form.Control as="textarea" rows={4} />
					</Form.Group>
				</Form>
			</Row> */}
		</Container>
	);
}

export default LeftPanel;