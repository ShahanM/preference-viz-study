import { Suspense, useEffect, useState } from 'react';
import { ThemeProvider, Toast, ToastContainer } from 'react-bootstrap';
import {
	Navigate,
	redirect,
	Route,
	BrowserRouter as Router,
	Routes
} from 'react-router-dom';
import { useRecoilState } from 'recoil';
import {
	Participant,
	StudyStep,
	useStudy
} from 'rssa-api';
import { WarningDialog } from './components/dialogs/warningDialog';
import DemographicsPage from './pages/demographicspage/DemographicsPage';
import FeedbackPage from './pages/feedbackpage/FeedbackPage';
import FinalPage from './pages/FinalPage';
import MovieRatingPage from './pages/MovieRatingPage';
import PreferenceVisualization from './pages/preferencevisualization/PreferenceVisualization';
import ScenarioPage from './pages/ScenarioPage';
import StudyMap from './pages/Studymap';
import Survey from './pages/SurveyPage';
import Welcome from './pages/Welcome';
import { participantState, studyStepState } from './state/studyState';
import './styles/_custom-bootstrap.scss';
import './styles/App.css';
import './styles/components.css';
import { STRINGS } from './utils/constants';


const customBreakpoints = {
	xl: 1200,
	xxl: 1400,
	xxxl: 1800, // Custom breakpoint for viewport size greater than 1800px
	xl4: 2000
};

const RETRY_DELAYS_MS = [5000, 10000, 30000, 60000];

function App() {

	const { studyApi } = useStudy();
	const [showWarning, setShowWarning] = useState<boolean>(false);
	const [participant, setParticipant] = useRecoilState(participantState);
	const [studyStep, setStudyStep] = useRecoilState(studyStepState);
	const [checkpointUrl, setCheckpointUrl] = useState<string>('/');
	const [studyError, setStudyError] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const [fetchError, setFetchError] = useState<boolean>(false);
	const [retryAttempt, setRetryAttempt] = useState<number>(0);
	const [currentFetchTrigger, setCurrentFetchTrigger] = useState<number>(0);

	const handleStepUpdate = (step: StudyStep, currentParticipant: Participant, referrer: string) => {
		const newParticipant: Participant = {
			...currentParticipant,
			current_step: step.id,
		};
		try {
			studyApi.put('participants/', newParticipant).then(() => {
				localStorage.setItem('participant', JSON.stringify(newParticipant));
				localStorage.setItem('studyStep', JSON.stringify(step));
				localStorage.setItem('lastUrl', referrer);
			});
			setParticipant(newParticipant);
			setStudyStep(step);
			setCheckpointUrl(referrer);
			studyApi.setParticipantId(newParticipant.id);
		} catch (error) {
			console.error("Error updating participant", error);
			setFetchError(true);
			setStudyError(true);
		}
	}

	useEffect(() => {
		if (fetchError && !isLoading) {
			const nextDelay = RETRY_DELAYS_MS[retryAttempt];

			if (nextDelay !== undefined) {
				console.log(`Retrying fetch in ${nextDelay / 1000} seconds... (Attempt ${retryAttempt + 1})`);
				const timerId = setTimeout(() => {
					setRetryAttempt(prev => prev + 1);
					setCurrentFetchTrigger(prev => prev + 1);
				}, nextDelay);

				return () => clearTimeout(timerId);
			} else {
				console.warn("Max retry attempts reached. Please refresh to try again.");
			}
		}
	}, [fetchError, isLoading, retryAttempt]);


	useEffect(() => {
		const loadCachedData = () => {
			const participantCache = localStorage.getItem('participant');
			const studyStepCache = localStorage.getItem('studyStep');
			const checkpointUrl = localStorage.getItem('lastUrl');

			if (participantCache && studyStepCache) {
				try {
					const cparticipant = JSON.parse(participantCache);
					const cstudyStep = JSON.parse(studyStepCache);

					if (cparticipant) {
						setParticipant(cparticipant);
						studyApi.setParticipantId(cparticipant.id);
					}
					if (cstudyStep) { setStudyStep(cstudyStep); }
					if (checkpointUrl) { setCheckpointUrl(checkpointUrl); }
					return true;
				} catch (error) {
					console.error("Error parsing cached data", error);
					setFetchError(true);

					localStorage.removeItem('participant');
					localStorage.removeItem('studyStep');
					localStorage.removeItem('lastUrl');
					return false;
				}
			}
			return false;
		};

		const fetchInitialData = async () => {
			setIsLoading(true);
			try {
				const studyStep = await studyApi.get<StudyStep>('studies/steps/first');
				setStudyStep(studyStep);
				setStudyError(false);
			} catch (error) {
				console.error("Error fetching initial study data:", error);
				setStudyError(true);
				setFetchError(true);
			} finally {
				setIsLoading(false);
			}
		};

		if (!participant && !studyStep) {
			if (!loadCachedData()) {
				fetchInitialData();
			} else {
				setIsLoading(false);
			}
		} else {
			setIsLoading(false);
		}
	}, [studyApi, setParticipant, setStudyStep, participant, studyStep, isLoading, studyError, currentFetchTrigger]);

	useEffect(() => {
		const handleResize = () => { setShowWarning(window.innerWidth < 1200); }
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	if (isLoading) { return <div>Loading...</div> }

	return (
		<ThemeProvider breakpoints={Object.keys(customBreakpoints)}>
			<div className="App">
				{showWarning &&
					<WarningDialog
						show={showWarning}
						title="Warning"
						message={STRINGS.WINDOW_TOO_SMALL}
						disableHide={true} />
				}
				{studyError && (RETRY_DELAYS_MS[retryAttempt] === undefined ?
					<WarningDialog
						show={studyError}
						title="Error"
						message={STRINGS.STUDY_ERROR} />
					:
					<ToastContainer position="top-center" className="p-3">
						<Toast bg="danger" autohide={true} delay={RETRY_DELAYS_MS[retryAttempt]}>
							<Toast.Body className={"text-white"}>
								There was an error registering this study.
								Retrying in {RETRY_DELAYS_MS[retryAttempt] / 1000} seconds...
							</Toast.Body>
						</Toast>
					</ToastContainer>
				)
				}
				<Router basename='/preference-visualization'>
					<Suspense fallback={<div>Loading...</div>}>
						<Routes>
							{(!studyStep) && <Route path="*" element={<Navigate to="/" replace />} />}
							<Route path="/" element={
								<Welcome
									next="/studyoverview"
									checkpointUrl={checkpointUrl}
									setNewParticipant={setParticipant}
									onStepUpdate={handleStepUpdate}
									sizeWarning={showWarning}
								/>
							} />
							<Route path="/studyoverview" element={
								<StudyMap
									next="/presurvey"
									checkpointUrl={checkpointUrl}
									onStepUpdate={handleStepUpdate}
									sizeWarning={showWarning}
								/>
							} />
							<Route path="/presurvey" element={
								<Survey
									next="/scenario"
									checkpointUrl={checkpointUrl}
									onStepUpdate={handleStepUpdate}
									sizeWarning={showWarning}
								/>
							} />
							<Route path="/scenario" element={
								<ScenarioPage
									next="/ratemovies"
									checkpointUrl={checkpointUrl}
									onStepUpdate={handleStepUpdate}
									sizeWarning={showWarning}
								/>
							} />
							<Route path="/ratemovies" element={
								<MovieRatingPage
									next="/recommendations"
									checkpointUrl={checkpointUrl}
									onStepUpdate={handleStepUpdate}
									sizeWarning={showWarning}
								/>
							} />
							{/* TODO: Add an intermediary loading page to prepare recommendations */}
							<Route path="/recommendations" element={
								<PreferenceVisualization
									next="/feedback"
									checkpointUrl={checkpointUrl}
									onStepUpdate={handleStepUpdate}
									sizeWarning={showWarning}
								/>
							} />
							<Route path="/feedback" element={
								<FeedbackPage
									next="/postsurvey"
									checkpointUrl={checkpointUrl}
									onStepUpdate={handleStepUpdate}
									sizeWarning={showWarning}
								/>
							} />
							<Route path="/postsurvey" element={
								<Survey
									next="/demographics"
									checkpointUrl={checkpointUrl}
									onStepUpdate={handleStepUpdate}
									sizeWarning={showWarning}
								/>
							} />
							<Route path="/demographics" element={
								<DemographicsPage
									next="/endstudy"
									checkpointUrl={checkpointUrl}
									onStepUpdate={handleStepUpdate}
									sizeWarning={showWarning}
								/>
							} />
							<Route path="/endstudy" element={
								<FinalPage
									next="/"
									checkpointUrl={checkpointUrl}
									sizeWarning={showWarning}
									onStudyDone={() => { redirect('/'); }}
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
