import { useState } from "react";
import { FormLabel } from "react-bootstrap";


interface LikertBarProps {
	itemId: string
	changeCallback: (itemdId: string, val: number) => void;
}


// export default function LikertBar(props) {
const LikertBar: React.FC<LikertBarProps> = ({
	itemId,
	changeCallback
}) => {

	const likert = [
		{ id: 1, label: 'Strongly Disagree' },
		{ id: 2, label: 'Disagree' },
		{ id: 3, label: 'Neutral' },
		{ id: 4, label: 'Agree' },
		{ id: 5, label: 'Strongly Agree' }];

	// const qgroup = props.surveyquestiongroup;
	// const qid = props.qid
	const [selectedValue, setSelectedValue] = useState<number>(0);

	const handleRadioChange = (val: number) => {
		setSelectedValue(val);
		changeCallback(itemId, val);
	}

	return (
		<div className="checkboxGroup">
			{likert.map((likertval) => {
				const inputId = `${itemId}_${likertval.id}`;
				return (
					<FormLabel htmlFor={inputId}
						key={inputId}
						className={selectedValue === likertval.id ? "checkboxBtn checkboxBtnChecked" : "checkboxBtn"}>

						<p className="checkboxLbl">{likertval.label}</p>

						<input
							className="radio-margin"
							type="radio"
							name={itemId}
							value={likertval.id}
							id={inputId}
							checked={selectedValue === likertval.id}
							onChange={(evt) => handleRadioChange(parseInt(evt.target.value))}
							title={likertval.label}
						/>
					</FormLabel>
				);
			}
			)}
		</div>
	)
}

export default LikertBar;