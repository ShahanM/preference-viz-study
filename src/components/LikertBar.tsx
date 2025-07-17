import { useState } from "react";
import { FormLabel } from "react-bootstrap";
import { ScaleLevel } from "rssa-api";
import { SurveyConstructScaleLevel } from "../layouts/templates/SurveyTemplate";



interface LikertBarProps {
	itemId: string
	scaleLevels: SurveyConstructScaleLevel[];
	changeCallback: (itemdid: string, scalestr: string) => void;
}


// export default function LikertBar(props) {
const LikertBar: React.FC<LikertBarProps> = ({
	itemId,
	scaleLevels,
	changeCallback
}) => {

	// const likert = [
	// 	{ id: 1, label: 'Strongly Disagree' },
	// 	{ id: 2, label: 'Disagree' },
	// 	{ id: 3, label: 'Neutral' },
	// 	{ id: 4, label: 'Agree' },
	// 	{ id: 5, label: 'Strongly Agree' }];

	// const qgroup = props.surveyquestiongroup;
	// const qid = props.qid
	const [selectedValue, setSelectedValue] = useState<number>(0);

	const handleRadioChange = (val: number, scalestr: string) => {
		setSelectedValue(val);
		changeCallback(itemId, scalestr);
	}

	return (
		<div className="checkboxGroup">
			{scaleLevels.map((scaleLevel) => {
				const inputId = `${itemId}_${scaleLevel.level}`;
				return (
					<FormLabel htmlFor={inputId}
						key={inputId}
						className={selectedValue === scaleLevel.level ? "checkboxBtn checkboxBtnChecked" : "checkboxBtn"}>

						<p className="checkboxLbl">{scaleLevel.label}</p>

						<input
							className="radio-margin"
							type="radio"
							name={itemId}
							value={scaleLevel.level}
							id={inputId}
							checked={selectedValue === scaleLevel.level}
							onChange={(evt) => handleRadioChange(parseInt(evt.target.value), scaleLevel.id)}
							title={scaleLevel.label}
						/>
					</FormLabel>
				);
			}
			)}
		</div>
	)
}

export default LikertBar;