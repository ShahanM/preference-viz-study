import { useEffect, useState } from 'react';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import {
	CurrentStep, NewParticipant, Participant, StudyStep,
	useStudy
} from 'rssa-api';
import InformedConsentModal from '../components/dialogs/InformedConsent';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { studyStepState } from '../state/studyState';
import { InitStudyPageProps } from './StudyPage.types';


const Welcome: React.FC<InitStudyPageProps> = ({
	next,
	checkpointUrl,
	setNewParticipant,
	onStepUpdate }) => {

	const studyStep: StudyStep | null = useRecoilValue(studyStepState);
	const [show, setShowInformedConsent] = useState<boolean>(false);

	const { studyApi } = useStudy();
	const navigate = useNavigate();
	const location = useLocation();

	const showInformedConsent = () => { setShowInformedConsent(!show); }

	useEffect(() => {
		if (checkpointUrl !== '/' && checkpointUrl !== location.pathname) {
			navigate(checkpointUrl);
		}
	}, [checkpointUrl, location.pathname, navigate]);

	const consentCallbackHandler = async (consent: boolean) => {
		if (consent && studyStep) {
			try {
				const response = await studyApi.post<NewParticipant, Participant>('participants/', {
					study_id: studyStep.study_id,
					external_id: 'test_user', // FIXME: change to actual platform id
					participant_type: '149078d0-cece-4b2c-81cd-a7df4f76d15a', // FIXME: use this as part of the environment variables and apiConfig
					current_step: studyStep.id,
					current_page: null
				});
				console.log("Participant created successfully:", response);
				setNewParticipant(response);
				const nextStep: StudyStep = await studyApi.post<CurrentStep, StudyStep>('studies/steps/next', {
					current_step_id: response.current_step
				});
				onStepUpdate(nextStep, response, next);
				navigate(next);
			} catch (error) {
				console.error("Error creating participant or updating step", error);
			}
		}
		setShowInformedConsent(false);
	}

	return (
		<Container>
			<Row>
				<Header title="Welcome"
					content="Welcome to the study on movie recommendation." />
			</Row>

			<Row>
				<Card bg="light">
					<Card.Body className="instructionblurb">
						<Card.Title>What can you expect?</Card.Title>
						<p>
							In this study you will test a new recommender system
							for movies.
						</p>
						<p>
							There are four steps to the study:
						</p>
						<ol>
							<li>
								Complete a pre-survey.
							</li>
							<li>
								Rate a few movies you are familiar with to let
								recommender system know about your movie
								preferences.
							</li>
							<li>
								Interact with the movie recommender system.
							</li>
							<li>Complete a post-survey.</li>
						</ol>
						<p>
							Thanks,<br />
							Research Team
						</p>
					</Card.Body>
				</Card>
			</Row>

			<InformedConsentModal
				show={show}
				consentCallback={consentCallbackHandler}
				onClose={setShowInformedConsent}
			/>
			<Row>
				<Footer callback={showInformedConsent} text={"Get Started"}
					disabled={!studyStep} />
			</Row>
		</Container>
	)
}

export default Welcome;