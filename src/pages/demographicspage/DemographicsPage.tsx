import { useCallback, useEffect, useState } from "react";
import { Button, Container, Form, Row } from "react-bootstrap";
import { CountryDropdown, RegionDropdown } from "react-country-region-selector";
import { useLocation, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { CurrentStep, Participant, StudyStep, useStudy } from "rssa-api";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { participantState, studyStepState } from "../../state/studyState";
import { StudyPageProps } from "../StudyPage.types";
import './DemographicsPage.css';



const AGE_OPTIONS = [
	'18 - 24 years old',
	'25 - 29 years old',
	'30 - 34 years old',
	'35 - 39 years old',
	'40 - 44 years old',
	'45 - 49 years old',
	'50 - 54 years old',
	'55+',
	'Prefer not to say'
]

export const GENDER_OPTIONS = [
	'Woman',
	'Man',
	'Non-binary',
	'Prefer not to disclose',
	'Prefer to self-describe'
]

export const RACE_OPTIONS = [
	'White',
	'Black or African American',
	'Asian',
	'Native Hawaiian or Pacific Islander',
	'Hispanic',
	'Two or more races',
	'Prefer not to answer',
	'Not listed (Please specify)'
]

export const EDUCATION_OPTIONS = [
	'Some high school',
	'High school',
	'Some college',
	'Trade, technical or vocational training',
	'Associate\'s degree',
	'Bachelor\'s degree',
	'Master\'s degree',
	'Professional degree',
	'Doctorate',
	'Prefer not to say'
]

export type Demographic = {
	participant_id: string;
	age_range: string;
	gender: string;
	gender_other: string;
	race: string[];
	race_other: string;
	education: string;
	country: string;
	state_region: string;
};

const DemographicsPage: React.FC<StudyPageProps> = ({
	next,
	checkpointUrl,
	onStepUpdate
}) => {

	const participant: Participant | null = useRecoilValue(participantState);
	const studyStep: StudyStep | null = useRecoilValue(studyStepState);

	const { studyApi } = useStudy();
	const navigate = useNavigate();
	const location = useLocation();

	const [loading, setLoading] = useState<boolean>(false);
	const [submitButtonDisabled, setSubmitButtonDisabled] = useState<boolean>(false);
	const [nextButtonDisabled, setNextButtonDisabled] = useState<boolean>(true);

	const [age, setAge] = useState<string>('');
	const [gender, setGender] = useState<string>('');
	const [genderText, setGenderText] = useState<string>('');
	const [race, setRace] = useState<string[]>([]);
	const [racText, setRacText] = useState<string>('');
	const [country, setCountry] = useState<string>('');
	const [region, setRegion] = useState<string>('');
	const [education, setEducation] = useState<string>('');


	const insertRace = (event: React.ChangeEvent<HTMLInputElement>) => {
		/* Handle 3 cases:
		*	1. If the user selects 'Prefer not to answer' and there are other selected options => Clear them.
		*	2. If the user selects 'Prefer not to answer' and there are no other selected options => Add it.
		*	3. If the user selects any other option and 'Prefer not to answer' is selected => Remove 'Prefer not to 
		*      answer' and add the new option.
		*/
		if (event.target.checked) {
			if (event.target.value === 'Prefer not to answer') {
				setRace([event.target.value]);
				setRacText('');
			} else {
				if (race.indexOf('Prefer not to answer') > -1) {
					setRace([event.target.value]);
				} else {
					setRace([...race, event.target.value]);
				}
			}
		} else {
			setRace([...race.filter((val) => val !== event.target.value)]);
		}
	}

	const [hiddenGender, setHiddenGender] = useState<string>('hidden');
	const [hiddenRace, setHiddenRace] = useState<string>('hidden');

	useEffect(() => {
		if (checkpointUrl !== '/' && checkpointUrl !== location.pathname) {
			navigate(checkpointUrl);
		}
	}, [checkpointUrl, location.pathname, navigate]);

	useEffect(() => {
		if (gender === 'Prefer to self-describe') {
			setHiddenGender('text');
		} else {
			setHiddenGender('hidden');
			if (genderText !== '') setGenderText('');
		}

		if (race.indexOf('Not listed (Please specify)') > -1) {
			setHiddenRace('text');
		} else {
			setHiddenRace('hidden');
		}
	}, [gender, genderText, race])


	const submitResponse = useCallback(async () => {
		const validateForm = () => {
			return !(
				(age === "" || education === "" || gender === "" || country === "" || race.length === 0)
				|| (race.indexOf('Not listed (Please specify)') > -1 && racText === '')
				|| (gender === 'Prefer to self-describe' && genderText === ''))
		}
		if (!participant || !studyStep) {
			console.error("Participant or study step is not defined.");
			return;
		}
		if (!validateForm()) {
			alert("Please fill in all the required fields.");
			return;
		} else {
			try {
				await studyApi.post<Demographic, null>(
					`participant/demographics`, {
					participant_id: participant.id,
					age_range: age,
					gender: gender,
					gender_other: genderText,
					race: race,
					race_other: racText,
					education: education,
					country: country,
					state_region: region
				});
				setSubmitButtonDisabled(true);
				setNextButtonDisabled(false);
			} catch (error) {
				console.error("Error submitting demographics:", error);
			} finally {
				setLoading(false);
			}
		}
	}, [studyApi, participant, studyStep, age, education, country, region, gender, genderText, race, racText]);

	const handleNextBtn = useCallback(async () => {
		if (!participant || !studyStep) {
			console.error("Participant or study step is not defined.");
			return;
		}
		try {
			const nextRouteStep = await studyApi.post<CurrentStep, StudyStep>('study/step/next', {
				current_step_id: participant.current_step
			});
			onStepUpdate(nextRouteStep, participant, next);
			navigate(next);
		} catch (error) {
			console.error("Error fetching next step:", error);
			// Handle error, e.g., show a message to the user
		}
	}, [onStepUpdate, studyApi, participant, next, navigate, studyStep]);

	return (
		<Container>
			<Row>
				<Header title={studyStep?.name}
					content={studyStep?.description} />
			</Row>
			<Row className="demo-form">
				<Form.Group className="mb-3" style={{ textAlign: "left" }}>
					<Form.Label>What is your age?</Form.Label>
					<Form.Select disabled={submitButtonDisabled}
						title="Dropdown"
						onChange={(evt) => setAge(evt.target.value)}
						value={age}>
						<option value="">Please choose an option</option>
						{AGE_OPTIONS.map((agegroup, idx) => {
							return <option key={'age_' + idx} value={agegroup}>
								{agegroup}
							</option>
						})}
					</Form.Select>
					<br />
					<Form.Label>What is your gender?</Form.Label>
					<Form.Select disabled={submitButtonDisabled}
						title="Dropdown"
						onChange={(evt) => setGender(evt.target.value)}
						value={gender}>
						<option value="">Please choose an option</option>
						{GENDER_OPTIONS.map((gendercat, idx) => {
							return <option key={'gender_' + idx}
								value={gendercat}>
								{gendercat}
							</option>
						})}
					</Form.Select>
					<Form.Control type={hiddenGender} disabled={submitButtonDisabled}
						style={{ marginTop: "9px" }}
						placeholder="Please specify" value={genderText}
						onChange={(evt) => setGenderText(evt.target.value)} />
					<br />
					<Form.Label>
						Choose one or more races that you identify with:
					</Form.Label>
					{RACE_OPTIONS.map((raceval, idx) => (
						<div key={"race-chck-" + idx}>
							<Form.Check type="checkbox" id={"race-chck-" + idx}
								disabled={submitButtonDisabled}
								label={raceval}
								value={raceval}
								checked={race.indexOf(raceval) > -1}
								onChange={insertRace} />
						</div>
					))}
					<Form.Control type={hiddenRace} style={{ marginTop: "9px" }}
						disabled={submitButtonDisabled}
						placeholder="Please specify" value={racText}
						onChange={(evt) => setRacText(evt.target.value)} />
					<br />
					<Form.Label>
						What is the highest degree or level of education you
						have completed?
					</Form.Label>
					<Form.Select disabled={submitButtonDisabled}
						title="Dropdown"
						onChange={(evt) => setEducation(evt.target.value)}
						value={education}>
						<option value="">Please choose an option</option>
						{EDUCATION_OPTIONS.map((educationgroup, idx) => {
							return <option key={'education_' + idx}
								value={educationgroup}>
								{educationgroup}
							</option>
						})}
					</Form.Select>
					<br />
					<CountryDropdown
						disabled={submitButtonDisabled}
						value={country}
						onChange={(evt) => setCountry(evt)}
						classes={"form-select"} />
					<br />
					<RegionDropdown
						disabled={submitButtonDisabled || country === ''}
						country={country}
						value={region}
						onChange={(evt) => setRegion(evt)}
						classes={"form-select"} />
					<Button style={{ marginTop: "1em" }} variant="ers" onClick={submitResponse}
						disabled={submitButtonDisabled || loading}>
						Submit
					</Button>
				</Form.Group>
			</Row>
			<Row>
				<Footer callback={handleNextBtn} loading={loading} disabled={nextButtonDisabled} />
			</Row>
		</Container>
	)
}

export default DemographicsPage;