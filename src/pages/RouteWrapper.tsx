import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import {
	Navigate,
	redirect,
	Route,
	Routes,
	useLocation,
	useNavigate
} from 'react-router-dom';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';
import {
	Participant,
	StudyStep,
	useStudy
} from 'rssa-api';
import ConfirmationDialog from '../components/dialogs/ConfirmationDialog';
import StudyLayout from '../layouts/StudyLayout';
import { participantState } from '../states/participantState';
import { studyStepState } from '../states/studyState';
import { urlCacheState } from '../states/urlCacheState';
import '../styles/_custom-bootstrap.scss';
import '../styles/App.css';
import '../styles/components.css';
import { clearStorage } from '../utils/localStorageUtils';
import DemographicsPage from './demographicspage/DemographicsPage';
import FeedbackPage from './feedbackpage/FeedbackPage';
import FinalPage from './FinalPage';
import MovieRatingPage from './MovieRatingPage';
import PreferenceVisualization from './preferencevisualization/PreferenceVisualization';
import ScenarioPage from './ScenarioPage';
import StudyMap from './Studymap';
import Survey from './SurveyPage';
import Welcome from './Welcome';


const RouteWrapper: React.FC = () => {

	const location = useLocation();
	const navigate = useNavigate();
	const { studyApi } = useStudy();
	const isInternalNavigationRef = useRef(false);

	const participant: Participant | null = useRecoilValue(participantState);
	const studyStep: StudyStep | null = useRecoilValue(studyStepState);
	const [currentUrl, setCurrentUrl] = useRecoilState(urlCacheState);
	const [showStudyRestartDialog, setShowStudyRestartDialog] = useState<boolean>(false);

	const navigateToNextStep = useCallback((path: string) => {
		isInternalNavigationRef.current = true;
		setCurrentUrl(path);
		navigate(path);
	}, [navigate, setCurrentUrl]);

	const handleStudyRestart = useRecoilCallback(({ snapshot, set }) => async () => {
		set(participantState, null);
		set(studyStepState, null);
		set(urlCacheState, '/');
		clearStorage();
		isInternalNavigationRef.current = true;
		navigate('/');
		setShowStudyRestartDialog(false);
	});

	/*
	 * UseEffect to set the participant ID in the study API.
	 * Trigger conditions:
	 *  - When the first participant is created upon accepting the informed consent.
	 */
	useEffect(() => {
		if (participant && !studyApi.getParticipantId()) {
			studyApi.setParticipantId(participant.id);
		}
	}, [participant, studyApi]);


	/*
	 * UseEffect to redirect to the current URL if it is not the root path.
	 * Trigger conditions:
	 *  - When the current URL on the browser does not match the current URL in the cached state.
	 */
	useEffect(() => {
		if (isInternalNavigationRef.current) {
			isInternalNavigationRef.current = false;
			return;
		}
		const isStudyInProgress = currentUrl && currentUrl !== '/';

		if (location.pathname === '/' && isStudyInProgress) {
			setShowStudyRestartDialog(true);
		} else if (currentUrl && currentUrl !== location.pathname) {
			navigateToNextStep(currentUrl);
		}
	}, [currentUrl, location.pathname, navigate, navigateToNextStep]);

	return (
		<Suspense fallback={<div>Loading...</div>}> {/* FIXME: Make this a proper loader */}
			{showStudyRestartDialog &&
				<ConfirmationDialog
					show={showStudyRestartDialog}
					title="Study in progress"
					message={"You already have a study in progress. Are you sure you want to restart?"}
					cancelText={"Go back to my current progress"}
					confirmText={"Restart study"}
					onConfirm={handleStudyRestart}
					onCancel={() => {
						setShowStudyRestartDialog(false);
						navigate(currentUrl);
					}}
				/>
			}
			<Routes>
				<Route path="/" element={<StudyLayout />} >
					{(!studyStep) && <Route path="*" element={<Navigate to="/" replace />} />}
					<Route index element={<Welcome next="/studyoverview" navigateToNextStep={navigateToNextStep} />} />
					<Route path="/studyoverview" element={<StudyMap next="/presurvey" navigateToNextStep={navigateToNextStep} />} />
					<Route path="/presurvey" element={<Survey next="/scenario" navigateToNextStep={navigateToNextStep} />} />
					<Route path="/scenario" element={<ScenarioPage next="/ratemovies" navigateToNextStep={navigateToNextStep} />} />
					<Route path="/ratemovies" element={<MovieRatingPage next="/recommendations" navigateToNextStep={navigateToNextStep} />} />

					{/* TODO: Add an intermediary loading page to prepare recommendations */}
					<Route path="/recommendations" element={<PreferenceVisualization next="/feedback" navigateToNextStep={navigateToNextStep} />} />
					<Route path="/feedback" element={<FeedbackPage next="/postsurvey" navigateToNextStep={navigateToNextStep} />} />
					<Route path="/postsurvey" element={<Survey next="/demographics" navigateToNextStep={navigateToNextStep} />} />
					<Route path="/demographics" element={<DemographicsPage next="/endstudy" navigateToNextStep={navigateToNextStep} />} />
					<Route path="/endstudy" element={<FinalPage next="/" onStudyDone={() => { redirect('/'); }} />} />
				</Route>
			</Routes>
		</Suspense >
	)
};

export default RouteWrapper;