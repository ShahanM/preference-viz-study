import { useMemo, useState } from "react";
import { FormLabel } from "react-bootstrap";
import { SurveyConstructScaleLevel } from "../layouts/templates/SurveyTemplate";


interface LikertBarProps {
	itemId: string
	scaleLevels: SurveyConstructScaleLevel[];
	changeCallback: (itemdid: string, scalestr: string) => void;
}

const LikertBar: React.FC<LikertBarProps> = ({
	itemId,
	scaleLevels,
	changeCallback
}) => {

	const [selectedValue, setSelectedValue] = useState<number>(0);

	const handleRadioChange = (val: number, scalestr: string) => {
		setSelectedValue(val);
		changeCallback(itemId, scalestr);
	}

	const scaleLevelsSorted = useMemo(() => {
		return scaleLevels.sort((a, b) => a.order_position - b.order_position);
	}, [scaleLevels]);

	return (
		<div className="checkboxGroup">
			{scaleLevelsSorted.map((scaleLevel) => {
				const inputId = `${itemId}_${scaleLevel.value}`;
				return (
					<FormLabel htmlFor={inputId}
						key={inputId}
						className={selectedValue === scaleLevel.value ? "checkboxBtn checkboxBtnChecked" : "checkboxBtn"}>

						<p className="checkboxLbl">{scaleLevel.label}</p>

						<input
							className="radio-margin"
							type="radio"
							name={itemId}
							value={scaleLevel.value}
							id={inputId}
							checked={selectedValue === scaleLevel.value}
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