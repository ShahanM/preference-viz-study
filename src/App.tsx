import {
	Suspense,
	useEffect,
	useState
} from 'react';
import { Button, Row, ThemeProvider } from 'react-bootstrap';
import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes
} from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import {
	Participant,
	StudyStep,
	emptyParticipant,
	emptyStep,
	isEmptyParticipant,
	isEmptyStep,
	useStudy
} from 'rssa-api';
import { WarningDialog } from './components/dialogs/warningDialog';
import DemographicsPage from './pages/demographicspage/DemographicsPage';
import FeedbackPage from './pages/feedbackpage/FeedbackPage';
import FinalPage from './pages/FinalPage';
import MovieRatingPage from './pages/MovieRatingPage';
import PreferenceVisualization from './pages/preferencevisualization/PreferenceVisualization';
import ScenarioPage from './pages/ScenarioPage';
import StudyMap from './pages/studymap';
import Survey from './pages/SurveyPage';
import Welcome from './pages/welcome';
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

function App() {

	const { studyApi } = useStudy();
	const [showWarning, setShowWarning] = useState<boolean>(false);
	const [participant, setParticipant] = useState<Participant>(emptyParticipant);
	const [studyStep, setStudyStep] = useState<StudyStep>(emptyStep);
	const [checkpointUrl, setCheckpointUrl] = useState<string>('/');
	const [studyError, setStudyError] = useState<boolean>(false);
	const [isLoading, setIsLoaiding] = useState<boolean>(true);

	const handleStepUpdate = (step: StudyStep, referrer: string) => {
		const newParticipant = { ...participant, current_step: step.id };
		try {

			studyApi.put('participant/', newParticipant).then(() => {
				localStorage.setItem('participant', JSON.stringify(newParticipant));
				localStorage.setItem('studyStep', JSON.stringify(step));
				localStorage.setItem('lastUrl', referrer);
			});
			setParticipant(newParticipant);
			setStudyStep(step);
			setCheckpointUrl(referrer);
		} catch (error) {
			console.error("Error updating participant", error);
			setStudyError(true);
		}
	}


	useEffect(() => {
		const loadCachedData = () => {
			const participantCache = localStorage.getItem('participant');
			const studyStepCache = localStorage.getItem('studyStep');
			const checkpointUrl = localStorage.getItem('lastUrl');

			if (participantCache && studyStepCache) {
				try {
					const cparticipant = JSON.parse(participantCache);
					const cstudyStep = JSON.parse(studyStepCache);

					if (!isEmptyParticipant(cparticipant)) {
						setParticipant(cparticipant);
					}
					if (!isEmptyStep(cstudyStep)) { setStudyStep(cstudyStep); }
					if (checkpointUrl) { setCheckpointUrl(checkpointUrl); }
					return true;
				} catch (error) {
					console.error("Error parsing cached data", error);

					localStorage.removeItem('participant');
					localStorage.removeItem('studyStep');
					localStorage.removeItem('lastUrl');
					return false;

				}
			}
			return false;
		};

		const fetchInitialData = async () => {
			setIsLoaiding(true);
			try {
				const studyStep = await studyApi.get<StudyStep>('studystep/first');
				setStudyStep(studyStep);
				setStudyError(false);
			} catch (error) {
				console.error("Error fetching initial study data:", error);
				setStudyError(true);
			} finally {
				setIsLoaiding(false);
			}
		};

		if (isEmptyParticipant(participant) && isEmptyStep(studyStep)) {
			if (!loadCachedData()) {
				fetchInitialData();
			} else {
				setIsLoaiding(false);
			}
		} else {
			setIsLoaiding(false);
		}
	}, [studyApi, participant, studyStep]);


	useEffect(() => {
		const handleResize = () => { setShowWarning(window.innerWidth < 1200); }
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	if (isLoading) {
		return <div>Loading...</div>
	}

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
				{studyError &&
					<WarningDialog
						show={studyError}
						title="Error"
						message={STRINGS.STUDY_ERROR} />
				}
				<Router basename='/preference-visualization'>
					<Suspense fallback={<div>Loading...</div>}>
						<Routes>
							{!studyStep && <Route path="*" element={<Navigate to="/" replace />} />}
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
									next="/scenario"
									checkpointUrl={checkpointUrl}
									participant={participant}
									studyStep={studyStep}
									updateCallback={handleStepUpdate}
									sizeWarning={showWarning}
								/>
							} />
							<Route path="/scenario" element={
								<ScenarioPage
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
								<RecoilRoot>
									<PreferenceVisualization
										next="/feedback"
										checkpointUrl={checkpointUrl}
										participant={participant}
										studyStep={studyStep}
										updateCallback={handleStepUpdate}
										sizeWarning={showWarning}
									/>
								</RecoilRoot>
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
