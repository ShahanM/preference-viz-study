// import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/custom-bootstrap.scss';
import { Suspense, useEffect, useState } from 'react';
import { ThemeProvider } from 'react-bootstrap';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import { WarningDialog } from './components/dialogs/warningDialog';
import './css/components.css';
import DemographicsPage from './pages/demographicspage/DemographicsPage';
import FeedbackPage from './pages/feedbackpage/FeedbackPage';
import FinalPage from './pages/FinalPage';
import MovieRatingPage from './pages/MovieRatingPage';
import PreferenceVisualization from './pages/preferencevisualization/PreferenceVisualization';
import StudyMap from './pages/studymap';
import Survey from './pages/SurveyPage';
import Welcome from './pages/welcome';
import { Participant, StudyStep, emptyParticipant, emptyStep, isEmptyParticipant, isEmptyStep } from './rssa-api/RssaApi.types';
import { useStudy } from './rssa-api/StudyProvider';
import { STRINGS } from './utils/constants';


const customBreakpoints = {
	xl: 1200,
	xxl: 1400,
	xxxl: 1800, // Custom breakpoint for viewport size greater than 1800px
	xl4: 2000
};

function App() {

	const { studyApi } = useStudy();
	const [showWarning, setShowWarning] = useState<boolean>(false);
	const [participant, setParticipant] = useState<Participant>(emptyParticipant);
	const [studyStep, setStudyStep] = useState<StudyStep>(emptyStep);
	const [checkpointUrl, setCheckpointUrl] = useState<string>('/');
	const [studyError, setStudyError] = useState<boolean>(false);

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
				setStudyStep(studyStep);
				setStudyError(false);
			}).catch((error) => {
				setStudyError(true);
			});
		}
	}, [studyApi]);


	useEffect(() => {
		const handleResize = () => { setShowWarning(window.innerWidth < 1200); }
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);


	return (
		<ThemeProvider breakpoints={Object.keys(customBreakpoints)}>
			<div className="App">
				{showWarning && <WarningDialog show={showWarning} title="Warning"
					message={STRINGS.WINDOW_TOO_SMALL} disableHide={true} />
				}
				{
					studyError && <WarningDialog show={studyError} title="Error"
						message={STRINGS.STUDY_ERROR} />
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
									sizeWarning={showWarning}
								/>
							} />
							<Route path="/studyoverview" element={
								<StudyMap
									next="/presurvey"
									checkpointUrl={checkpointUrl}
									participant={participant}
									studyStep={studyStep}
									updateCallback={handleStepUpdate}
									sizeWarning={showWarning}
								/>
							} />
							<Route path="/presurvey" element={
								<Survey
									next="/ratemovies"
									checkpointUrl={checkpointUrl}
									participant={participant}
									studyStep={studyStep}
									updateCallback={handleStepUpdate}
									sizeWarning={showWarning}
								/>
							} />
							<Route path="/ratemovies" element={
								<MovieRatingPage
									next="/recommendations"
									checkpointUrl={checkpointUrl}
									participant={participant}
									studyStep={studyStep}
									updateCallback={handleStepUpdate}
									sizeWarning={showWarning}
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
									sizeWarning={showWarning}
								/>
							} />
							<Route path="/feedback" element={
								<FeedbackPage
									next="/postsurvey"
									checkpointUrl={checkpointUrl}
									participant={participant}
									studyStep={studyStep}
									updateCallback={handleStepUpdate}
									sizeWarning={showWarning}
								/>
							} />
							<Route path="/postsurvey" element={
								<Survey
									next="/demographics"
									checkpointUrl={checkpointUrl}
									participant={participant}
									studyStep={studyStep}
									updateCallback={handleStepUpdate}
									sizeWarning={showWarning}
								/>
							} />
							<Route path="/demographics" element={
								<DemographicsPage
									next="/endstudy"
									checkpointUrl={checkpointUrl}
									participant={participant}
									studyStep={studyStep}
									updateCallback={handleStepUpdate}
									sizeWarning={showWarning}
								/>
							} />
							<Route path="/endstudy" element={
								<FinalPage
									next="/"
									checkpointUrl={checkpointUrl}
									participant={participant}
									studyStep={studyStep}
									updateCallback={handleStepUpdate}
									sizeWarning={showWarning}
								/>
							} />
						</Routes>
					</Suspense>
				</Router>
			</div>
		</ThemeProvider>
	);
}

export default App;
