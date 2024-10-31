import DOMPurify from "dompurify";
import parse from "html-react-parser";
import { useEffect, useState } from "react";
import FormGroup from "react-bootstrap/FormGroup";
import Row from "react-bootstrap/Row";
import LikertBar from "../../components/LikertBar";
import { SurveyPage } from "rssa-api";
import "./SurveyTemplate.css";


interface SurveyTemplateProps {
	surveyContent: SurveyPage;
	validationFlags: Map<string, boolean>;
	updateResponse: (itemid: string, responsestr: string) => void;
}


const SurveyTemplate: React.FC<SurveyTemplateProps> = ({
	surveyContent,
	validationFlags,
	updateResponse,
}) => {

	const [response, setResponse] = useState<Map<string, string>>(new Map<string, string>());

	useEffect(() => {
		setResponse(new Map<string, string>());
	}, [surveyContent]);

	const parseHTML = (htmlstr: string) => {
		const clean = DOMPurify.sanitize(htmlstr);
		const parsed = parse(clean);
		return parsed;
	}

	useEffect(() => {
		if (surveyContent.construct_items !== undefined) {
			if ((Object.keys(response).length === surveyContent.construct_items.length)
				&& (Object.values(response).every((x) => x !== undefined))) {
			}
		}
	}, [response, surveyContent.construct_items,]);

	const valueSelectHandler = (itemid: string, responsstr: string) => {
		updateResponse(itemid, responsstr);
	}

	return (
		<Row style={{maxWidth: "1320px", margin: "auto"}}>
			{surveyContent.construct_items !== undefined &&
				surveyContent.construct_items.map((item, i) => {
					return (
						<FormGroup key={item.id + '_' + i}
							className={
								validationFlags.has(item.id) ?
									validationFlags.get(item.id) ?
										"survey-question-block-responded"
										: "survey-question-block-unanswered"
									: "survey-question-block"
							}
						>
							<div>
								<p className="surveyQuestionText">
									{parseHTML(item.text)}
								</p>
							</div>
							<LikertBar
								itemId={item.id}
								scaleLevels={surveyContent.construct_scale}
								changeCallback={valueSelectHandler} />
						</FormGroup>
					)
				})}
		</Row>

	)
}

export default SurveyTemplate;