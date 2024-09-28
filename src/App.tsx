import 'bootstrap/dist/css/bootstrap.min.css';
import { Suspense, useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import { WarningDialog } from './components/dialogs/warningDialog';
import './css/components.css';
import DemographicsPage from './pages/DemographicsPage';
import FeedbackPage from './pages/FeedbackPage';
import MovieRatingPage from './pages/MovieRatingPage';
import PreferenceVisualization from './pages/preferencevisualization/PreferenceVisualization';
import StudyMap from './pages/studymap';
import Survey from './pages/survey';
import Welcome from './pages/welcome';
import { Participant, StudyStep, emptyParticipant, emptyStep, isEmptyParticipant, isEmptyStep } from './rssa-api/RssaApi.types';
import { useStudy } from './rssa-api/StudyProvider';
import { STRINGS } from './utils/constants';
import FinalPage from './pages/FinalPage';

function App() {

	const { studyApi } = useStudy();
	const [showWarning, setShowWarning] = useState<boolean>(false);
	const [participant, setParticipant] = useState<Participant>(emptyParticipant);
	const [studyStep, setStudyStep] = useState<StudyStep>(emptyStep);
	const [checkpointUrl, setCheckpointUrl] = useState<string>('/');

	const handleStepUpdate = (step: StudyStep, referrer: string) => {
		console.log("App handleStepUpdate", step);
		const newParticipant = { ...participant, current_step: step.id };
		studyApi.put('participant/', newParticipant).then(() => {
			// Store the updated participant state as a cookie
			// document.cookie = `studyStep=${JSON.stringify(step)}; path=/`;

			// document.cookie = `participant:${JSON.stringify(newParticipant)}; path=/'; `;
			// document.cookie = `studyStep:${JSON.stringify(step)}; path=/'; `;
			// console.log("App writing cookie", newParticipant, step);
			// let participantCookie = `participant=${JSON.stringify(newParticipant)}; path=/'; `;
			// let studyStepCookie = `studyStep=${JSON.stringify(step)}; path=/'; `;
			// document.cookie = `participant=${JSON.stringify(newParticipant)}; path=/';`;
			localStorage.setItem('participant', JSON.stringify(newParticipant));
			localStorage.setItem('studyStep', JSON.stringify(step));
			localStorage.setItem('lastUrl', referrer);
			// document.cookie = `studyStep=${JSON.stringify(step)}; path=/';`;
		});
		setParticipant(newParticipant);
		setStudyStep(step);
		setCheckpointUrl(referrer);
	}

	console.log("App.tsx", participant, studyStep);
	useEffect(() => {
		// const cookieItems = document.cookie.split('; ');
		// const participantCookie = cookieItems.find(row => row.startsWith('participant'));
		// const studyStepCookie = cookieItems.find(row => row.startsWith('studyStep'));
		const participantCache = localStorage.getItem('participant');
		const studyStepCache = localStorage.getItem('studyStep');
		const checkpointUrl = localStorage.getItem('lastUrl');
		console.log("App useEffect", participantCache, studyStepCache);
		if (participantCache && studyStepCache) {
			console.log("We have participant cookie", participantCache);
			const cparticipant = JSON.parse(participantCache);
			if (!isEmptyParticipant(cparticipant)) {
				setParticipant(cparticipant);
			}
			console.log("We have studyStep cookie", studyStepCache);
			const cstudyStep = JSON.parse(studyStepCache);
			if (!isEmptyStep(cstudyStep)) {
				setStudyStep(cstudyStep);
			}

			console.log("We have a checkpoint", checkpointUrl);
			if (checkpointUrl) {
				setCheckpointUrl(checkpointUrl);
			}
		} else {
			studyApi.get<StudyStep>('studystep/first').then((studyStep) => {
				document.cookie = `studyStep:${JSON.stringify(studyStep)}; path=/'; `;
				setStudyStep(studyStep);
			});
		}
		// FIXME: This is a temporary fix to get the first step of the study
		// studyApi.get<StudyStep>('studystep/first').then((studyStep) => {
		// 	document.cookie = `studyStep:${JSON.stringify(studyStep)}; path=/'; `;
		// 	setStudyStep(studyStep);
		// })
		// console.log("We are here");
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
						{/* <Route path="/studyoverview" element={<StudyMap next="/presurvey" />} /> */}
						{/* <Route path="/presurvey" element={<Survey next="/ratemovies" />} />
						{/* <Route path="/ratemovies" element={<RateMovies next="/recommendations" />} /> */}
						{/* <Route path="/recommendations" element={<EmotionPreferences next="/feedback" />} /> */}
						{/* <Route path="/feedback" element={<FeedbackPage next="/postsurvey" />} /> */}
						{/* <Route path="/postsurvey" element={<Survey next="/demography" />} /> */}
						{/* <Route path="/demography" element={<DemographyPage next="/quit" />} /> */}
						{/* <Route path="/quit" element={<FinalPage />} /> */}
					</Routes>
				</Suspense>
			</Router>
		</div>
	);
}

export default App;
