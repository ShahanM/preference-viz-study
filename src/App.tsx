import 'bootstrap/dist/css/bootstrap.min.css';
import { Suspense, useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import { WarningDialog } from './components/dialogs/warningDialog';
import './css/components.css';
import DemographicsPage from './pages/DemographicsPage';
import FeedbackPage from './pages/FeedbackPage';
import FinalPage from './pages/FinalPage';
import MovieRatingPage from './pages/MovieRatingPage';
import PreferenceVisualization from './pages/preferencevisualization/PreferenceVisualization';
import StudyMap from './pages/studymap';
import Survey from './pages/SurveyPage';
import Welcome from './pages/welcome';
import { Participant, StudyStep, emptyParticipant, emptyStep, isEmptyParticipant, isEmptyStep } from './rssa-api/RssaApi.types';
import { useStudy } from './rssa-api/StudyProvider';
import { STRINGS } from './utils/constants';

function App() {

	const { studyApi } = useStudy();
	const [showWarning, setShowWarning] = useState<boolean>(false);
	const [participant, setParticipant] = useState<Participant>(emptyParticipant);
	const [studyStep, setStudyStep] = useState<StudyStep>(emptyStep);
	const [checkpointUrl, setCheckpointUrl] = useState<string>('/');

	const handleStepUpdate = (step: StudyStep, referrer: string) => {
		const newParticipant = { ...participant, current_step: step.id };
		studyApi.put('participant/', newParticipant).then(() => {
			localStorage.setItem('participant', JSON.stringify(newParticipant));
			localStorage.setItem('studyStep', JSON.stringify(step));
			localStorage.setItem('lastUrl', referrer);
		});
		setParticipant(newParticipant);
		setStudyStep(step);
		setCheckpointUrl(referrer);
	}

	useEffect(() => {
		const participantCache = localStorage.getItem('participant');
		const studyStepCache = localStorage.getItem('studyStep');
		const checkpointUrl = localStorage.getItem('lastUrl');
		if (participantCache && studyStepCache) {
			const cparticipant = JSON.parse(participantCache);
			if (!isEmptyParticipant(cparticipant)) {
				setParticipant(cparticipant);
			}
			const cstudyStep = JSON.parse(studyStepCache);
			if (!isEmptyStep(cstudyStep)) {
				setStudyStep(cstudyStep);
			}

			if (checkpointUrl) {
				setCheckpointUrl(checkpointUrl);
			}
		} else {
			studyApi.get<StudyStep>('studystep/first').then((studyStep) => {
				document.cookie = `studyStep:${JSON.stringify(studyStep)}; path=/'; `;
				setStudyStep(studyStep);
			});
		}
	}, [studyApi]);


	useEffect(() => {
		const handleResize = () => { setShowWarning(window.innerWidth < 1000); }
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);


	return (
		<div className="App">
			{showWarning && <WarningDialog show={showWarning} title="Warning"
				message={STRINGS.WINDOW_TOO_SMALL} disableHide={true} />
			}
			<Router basename='/preference-visualization'>
				<Suspense fallback={<h1>Loading</h1>}>
					<Routes>
						<Route path="/" element={
							<Welcome
								next="/studyoverview"
								checkpointUrl={checkpointUrl}
								studyStep={studyStep}
								setNewParticipant={setParticipant}
								updateCallback={handleStepUpdate}
							/>
						} />
						<Route path="/studyoverview" element={
							<StudyMap
								next="/presurvey"
								checkpointUrl={checkpointUrl}
								participant={participant}
								studyStep={studyStep}
								updateCallback={handleStepUpdate}
							/>
						} />
						<Route path="/presurvey" element={
							<Survey
								next="/ratemovies"
								checkpointUrl={checkpointUrl}
								participant={participant}
								studyStep={studyStep}
								updateCallback={handleStepUpdate}
							/>
						} />
						<Route path="/ratemovies" element={
							<MovieRatingPage
								next="/recommendations"
								checkpointUrl={checkpointUrl}
								participant={participant}
								studyStep={studyStep}
								updateCallback={handleStepUpdate}
							/>
						} />
						{/* TODO: Add an intermediary loading page to prepare recommendations */}
						<Route path="/recommendations" element={
							<PreferenceVisualization
								next="/feedback"
								checkpointUrl={checkpointUrl}
								participant={participant}
								studyStep={studyStep}
								updateCallback={handleStepUpdate}
							/>
						} />
						<Route path="/feedback" element={
							<FeedbackPage
								next="/postsurvey"
								checkpointUrl={checkpointUrl}
								participant={participant}
								studyStep={studyStep}
								updateCallback={handleStepUpdate}
							/>
						} />
						<Route path="/postsurvey" element={
							<Survey
								next="/demographics"
								checkpointUrl={checkpointUrl}
								participant={participant}
								studyStep={studyStep}
								updateCallback={handleStepUpdate}
							/>
						} />
						<Route path="/demographics" element={
							<DemographicsPage
								next="/endstudy"
								checkpointUrl={checkpointUrl}
								participant={participant}
								studyStep={studyStep}
								updateCallback={handleStepUpdate}
							/>
						} />
						<Route path="/endstudy" element={
							<FinalPage
								next="/"
								checkpointUrl={checkpointUrl}
								participant={participant}
								studyStep={studyStep}
								updateCallback={handleStepUpdate}
							/>
						} />
					</Routes>
				</Suspense>
			</Router>
		</div>
	);
}

export default App;
