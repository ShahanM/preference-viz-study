import DOMPurify from "dompurify";
import parse from "html-react-parser";
import { useEffect, useState } from "react";
import FormGroup from "react-bootstrap/FormGroup";
import Row from "react-bootstrap/Row";
import LikertBar from "../../components/LikertBar";
import { SurveyPage } from "rssa-api";
import "./SurveyTemplate.css";


type SurveyConstructItem = {
	id: string;
	text: string;
	order_position: number;
}

export type SurveyConstructScaleLevel = {
	id: string;
	label: string;
	level: number;
}

export type SurveyConstruct = {
	content_id: string;
	desc: string;
	name: string;
	items: SurveyConstructItem[];
	scale_levels: SurveyConstructScaleLevel[];

}

interface SurveyTemplateProps {
	pageContents: SurveyConstruct[];
	validationFlags: Map<string, boolean>;
	updateResponse: (constructId: string, itemid: string, responsestr: string) => void;
}


const SurveyTemplate: React.FC<SurveyTemplateProps> = ({
	pageContents,
	validationFlags,
	updateResponse,
}) => {

	// const [response, setResponse] = useState<Map<string, string>>(new Map<string, string>());

	// useEffect(() => {
	// 	setResponse(new Map<string, string>());
	// }, [pageContents]);



	// useEffect(() => {
	// 	if (pageContents.construct_items !== undefined) {
	// 		if ((Object.keys(response).length === surveyContent.construct_items.length)
	// 			&& (Object.values(response).every((x) => x !== undefined))) {
	// 		}
	// 	}
	// }, [response, surveyContent.construct_items,]);

	// const valueSelectHandler = (itemid: string, responsstr: string) => {
	// 	updateResponse(itemid, responsstr);
	// }

	return (
		<Row style={{ maxWidth: "1320px", margin: "auto" }}>
			{/* {surveyContent.construct_items !== undefined &&
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
				})} */}
			{
				pageContents.map((pageContent, index) =>
					<SurveyConstructBlock
						key={pageContent.content_id + '_' + index}
						constructId={pageContent.content_id}
						items={pageContent.items}
						scaleLevels={pageContent.scale_levels}
						onChange={updateResponse}
					/>
				)
			}
		</Row>

	)
}

interface SurveyConstructBlockProps {
	constructId: string;
	items: SurveyConstructItem[];
	scaleLevels: SurveyConstructScaleLevel[];
	onChange: (constructId: string, itemid: string, responsestr: string) => void;
}


const SurveyConstructBlock: React.FC<SurveyConstructBlockProps> = ({
	constructId,
	items,
	scaleLevels,
	onChange
}) => {

	const parseHTML = (htmlstr: string) => {
		const clean = DOMPurify.sanitize(htmlstr);
		const parsed = parse(clean);
		return parsed;
	}

	const handleChange = (itemId: string, response: string) => {
		onChange(constructId, itemId, response);
	}

	return (
		<div className="survey-construct-block">
			{items.map((item, index) => (
				<FormGroup key={item.id + '_' + index} className="survey-item">
					<div>
						<label className="survey-item-label">{parseHTML(item.text)}</label>
					</div>
					<LikertBar
						itemId={item.id}
						scaleLevels={scaleLevels}
						changeCallback={handleChange} />
				</FormGroup>
			))}
		</div>
	)
}

export default SurveyTemplate;