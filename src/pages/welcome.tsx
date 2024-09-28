import { useEffect, useState } from 'react';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { useNavigate, useLocation } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { CurrentStep, isEmptyStep, NewParticipant, Participant, StudyStep } from '../rssa-api/RssaApi.types';
import { useStudy } from '../rssa-api/StudyProvider';
import InformedConsentModal from '../components/dialogs/InformedConsent';
import { InitStudyPageProps } from './StudyPage.types';


const Welcome: React.FC<InitStudyPageProps> = ({
	next,
	checkpointUrl,
	studyStep,
	setNewParticipant,
	updateCallback }) => {

	const [isUpdated, setIsUpdated] = useState<boolean>(false);
	const [participant, setParticipant] = useState<Participant>();
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

	const consentCallbackHandler = (consent: boolean) => {
		if (consent) {
			if (!isEmptyStep(studyStep))
				studyApi.post<NewParticipant, Participant>('participant/', {
					study_id: studyStep.study_id,
					external_id: 'test_user', // FIXME: change to actual platform id
					participant_type: '149078d0-cece-4b2c-81cd-a7df4f76d15a', // FIXME: use this as part of the environment variables and apiConfig
					current_step: studyStep.id,
					current_page: null
				}).then((response) => {
					console.log('Participant created: ', response);
					setNewParticipant(response);
					setParticipant(response);
				});
		}
	}

	useEffect(() => {
		console.log("Welcome useEffect", participant);
		if (participant) {
			console.log("Welcome useEffect: getting next step");
			studyApi.post<CurrentStep, StudyStep>('studystep/next', {
				current_step_id: participant.current_step
			}).then((nextStep) => {
				updateCallback(nextStep, next);
				setIsUpdated(true);
			});
		}
	}, [participant, studyApi, updateCallback, navigate, next]);

	useEffect(() => {
		if (isUpdated) {
			navigate(next);
		}
	}, [isUpdated, navigate, next]);

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

			<InformedConsentModal show={show}
				consentCallback={consentCallbackHandler} />
			<Row>
				<Footer callback={showInformedConsent} text={"Get Started"} disabled={isEmptyStep(studyStep)} />
			</Row>
		</Container>
	)
}

export default Welcome;