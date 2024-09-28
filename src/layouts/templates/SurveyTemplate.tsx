import FormGroup from "react-bootstrap/FormGroup";
import Row from "react-bootstrap/Row";
import LikertBar from "../../components/LikertBar";
import { useEffect, useState, useRef } from "react";
import DOMPurify from "dompurify";
import parse from "html-react-parser";
import { SurveyPage } from "../../rssa-api/RssaApi.types";
import "./SurveyTemplate.css";


interface SurveyTemplateProps {
	surveyContent: SurveyPage;
	updateResponse: (qid: number, value: number) => void;
}


// export default function SurveyTemplate(props) {

const SurveyTemplate: React.FC<SurveyTemplateProps> = ({
	surveyContent,
	updateResponse,
}) => {

	const [response, setResponse] = useState<{ [key: string]: number }>({});
	const [resBoolSet, setResBoolSet] = useState(new Set());
	// const [showUnanswered, setShowUnanswered] = useState(false);
	// const [smallestUnanswered, setSmallestUnanswered] = useState(0);
	// const topUnanswered = useRef();

	// const scroll = () =>
	// topUnanswered?.current?.scrollIntoView({ behavior: "smooth" });

	// TODO: We will send the survey answers to the backend from this component.
	// TODO: We should also fetch the current survey answers from the backend.
	// TODO: Do we need to update the survey answer for each item or can we batch
	// the responses per construct?
	// TODO: Add logging for the survey answers.

	useEffect(() => {
		setResponse({});
		setResBoolSet(new Set());
		// setSmallestUnanswered(0);
	}, [surveyContent]);

	// useEffect(() => {
	// 	setShowUnanswered(props.showUnanswered);
	// }, [props.showUnanswered]);


	const parseHTML = (htmlstr: string) => {
		const clean = DOMPurify.sanitize(htmlstr);
		const parsed = parse(clean);
		return parsed;
	}

	// FIXME: this only works the first time. Since, showUnanswered is not 
	// updated, the useEffect is not called again. Fix this by using a
	// callback function.
	// useEffect(() => { showUnanswered && scroll(); }, [showUnanswered]);

	useEffect(() => {
		if (surveyContent.construct_items !== undefined) {
			if ((Object.keys(response).length === surveyContent.construct_items.length)
				&& (Object.values(response).every((x) => x !== undefined))) {
				// props.submitCallback(surveyAnswers);
			}
		}
	}, [response, surveyContent.construct_items,]);

	const valueSelectHandler = (itemId: string, value: number) => {
		let newResBoolSet = new Set(resBoolSet);
		newResBoolSet.add(itemId);

		// FIXME: This will be based on the order and not the id.
		// if (qid <= smallestUnanswered) {
		// 	for (let i = smallestUnanswered + 1; i < props.surveyquestions.length; i++) {
		// 		if (!newResBoolSet.has(i)) {
		// 			setSmallestUnanswered(i);
		// 			break;
		// 		}
		// 	}
		// }

		// props.logginCallback(qid, value);
		let newResponse = { ...response };
		// newAnswers[qid] = value;
		newResponse[itemId] = value;
		setResponse(newResponse);
		setResBoolSet(newResBoolSet);
	}

	return (
		<Row>
			{surveyContent.construct_items !== undefined &&
				surveyContent.construct_items.map((item, i) => {
					return (
						<FormGroup key={item.id + '_' + i}
							className={resBoolSet.has(i) ?
								"survey-question-block-responded"
								// : showUnanswered ?
								// "survey-question-block-unanswered"
								: "survey-question-block"}
						// ref={i === smallestUnanswered ? topUnanswered : null}
						>
							<div>
								<p className="surveyQuestionText">
									{parseHTML(item.text)}
								</p>
							</div>
							<LikertBar
								itemId={item.id}
								changeCallback={valueSelectHandler} />
						</FormGroup>
					)
				})}
		</Row>

	)
}

export default SurveyTemplate;