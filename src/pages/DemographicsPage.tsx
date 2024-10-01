import { useEffect, useState } from "react";
import { Container, Form, Row } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { CurrentStep, StudyStep } from "../rssa-api/RssaApi.types";
import { useStudy } from "../rssa-api/StudyProvider";
import { StudyPageProps } from "./StudyPage.types";


const ageGroups = [
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

export const genderCats = [
	'Woman',
	'Man',
	'Non-binary',
	'Prefer not to disclose',
	'Prefer to self-describe'
]

export const educationGroups = [
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


const DemographicsPage: React.FC<StudyPageProps> = ({
	next,
	checkpointUrl,
	participant,
	studyStep,
	updateCallback
}) => {

	const { studyApi } = useStudy();
	const navigate = useNavigate();
	const location = useLocation();

	const [isUpdated, setIsUpdated] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	const [age, setAge] = useState<string>();
	const [gender, setGender] = useState<string>();
	const [genderText, setGenderText] = useState<string>('');
	const [education, setEducation] = useState<string>();

	const [hidden, setHidden] = useState<string>('hidden');

	// Allowing for some simple checkpoint saving so the participant
	// can return to the page in case of a browser/system crash
	useEffect(() => {
		if (checkpointUrl !== '/' && checkpointUrl !== location.pathname) {
			navigate(checkpointUrl);
		}
	}, [checkpointUrl, location.pathname, navigate]);


	useEffect(() => {
		console.log("DemographicsPage Age: ", age);
		console.log("DemographicsPage Gender: ", gender);
		console.log("DemographicsPage Education: ", education);
	}, [age, gender, education])


	const handleNextBtn = () => {
		console.log("MovieRatingPage stepID", participant.current_step);
		studyApi.post<CurrentStep, StudyStep>('studystep/next', {
			current_step_id: participant.current_step
		}).then((nextStep) => {
			updateCallback(nextStep, next)
			setIsUpdated(true);
		});
	}

	useEffect(() => {
		if (isUpdated) {
			navigate(next);
		}
	}, [isUpdated, navigate, next]);

	return (
		<Container>
			<Row>
				<Header title={studyStep?.name} content={studyStep?.description} />
			</Row>
			<Row>
				<Form.Group className="mb-3" style={{ textAlign: "left" }}>
					<Form.Label>What is your age?</Form.Label>
					<Form.Select
						title="Dropdown" id="input-group-dropdown-1"
						style={{ width: "400px" }}
						onChange={(evt) => setAge(evt.target.value)}
						value={age}>
						<option value="-1">Please choose an option</option>
						{ageGroups.map((agegroup, idx) => {
							return <option key={'age_' + idx} value={agegroup}>
								{agegroup}
							</option>
						})}
					</Form.Select>
					<br />
					<Form.Label>What is your gender?</Form.Label>
					<Form.Select
						title="Dropdown" id="input-group-dropdown-2"
						style={{ width: "400px" }}
						onChange={(evt) => setGender(evt.target.value)} value={gender}>
						<option value="-1">Please choose an option</option>
						{genderCats.map((gendercat, idx) => {
							return <option key={'gender_' + idx} value={gendercat}>
								{gendercat}
							</option>
						})}
					</Form.Select>
					<Form.Control type={hidden} style={{ marginTop: "9px" }}
						onChange={(evt) => setGenderText(evt.target.value)} />
					<br />
					<Form.Label>What is the highest degree or level of education you have completed?</Form.Label>
					<Form.Select
						title="Dropdown" id="input-group-dropdown-4"
						style={{ width: "400px" }}
						onChange={(evt) => setEducation(evt.target.value)} value={education}>
						<option value="-1">Please choose an option</option>
						{educationGroups.map((educationgroup, idx) => {
							return <option key={'education_' + idx} value={educationgroup}>
								{educationgroup}
							</option>
						})}
					</Form.Select>
				</Form.Group>
			</Row>
			<Row>
				<Footer callback={handleNextBtn} />
			</Row>
		</Container>
	)
}

export default DemographicsPage;