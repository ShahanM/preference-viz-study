import { Suspense, useEffect, useState } from 'react';
import {
	Navigate,
	redirect,
	Route,
	Routes,
	useLocation,
	useNavigate
} from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
	Participant,
	StudyStep,
	useStudy
} from 'rssa-api';
import { retryAttemptState, studyErrorState } from '../states/errorState';
import { participantState } from '../states/participantState';
import { studyStepState } from '../states/studyState';
import { urlCacheState } from '../states/urlCacheState';
import '../styles/_custom-bootstrap.scss';
import '../styles/App.css';
import '../styles/components.css';
import { RETRY_DELAYS_MS } from '../utils/constants';
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

	const participant: Participant | null = useRecoilValue(participantState);
	const [studyStep, setStudyStep] = useRecoilState(studyStepState);
	const setStudyError = useSetRecoilState(studyErrorState);
	const [retryAttempt, setRetryAttempt] = useRecoilState(retryAttemptState);

	const currentUrl: string = useRecoilValue(urlCacheState);

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [fetchError, setFetchError] = useState<boolean>(false);
	const [currentFetchTrigger, setCurrentFetchTrigger] = useState<number>(0);

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
	}, [fetchError, isLoading, retryAttempt, setRetryAttempt]);

	useEffect(() => {
		const fetchInitialData = async () => {
			try {
				setIsLoading(true);
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

		if (!studyStep) {
			fetchInitialData();
		} else {
			setIsLoading(false);
		}
	}, [studyApi, setStudyStep, studyStep, currentFetchTrigger, setStudyError]);

	useEffect(() => {
		if (participant && !studyApi.getParticipantId()) {
			studyApi.setParticipantId(participant.id);
		}
	}, [participant, studyApi]);

	useEffect(() => {
		if (currentUrl !== '/' && currentUrl !== location.pathname) {
			navigate(currentUrl);
		}
	}, [currentUrl, location.pathname, navigate]);

	if (isLoading) { return <div>Loading...</div> } // FIXME: Make this a proper loader

	return (
		<Suspense fallback={<div>Loading...</div>}> {/* FIXME: Make this a proper loader */}
			<Routes>
				{(!studyStep) && <Route path="*" element={<Navigate to="/" replace />} />}
				<Route path="/" element={<Welcome next="/studyoverview" />} />
				<Route path="/studyoverview" element={<StudyMap next="/presurvey" />} />
				<Route path="/presurvey" element={<Survey next="/scenario" />} />
				<Route path="/scenario" element={<ScenarioPage next="/ratemovies" />} />
				<Route path="/ratemovies" element={<MovieRatingPage next="/recommendations" />} />

				{/* TODO: Add an intermediary loading page to prepare recommendations */}
				<Route path="/recommendations" element={<PreferenceVisualization next="/feedback" />} />
				<Route path="/feedback" element={<FeedbackPage next="/postsurvey" />} />
				<Route path="/postsurvey" element={<Survey next="/demographics" />} />
				<Route path="/demographics" element={<DemographicsPage next="/endstudy" />} />
				<Route path="/endstudy" element={<FinalPage next="/" onStudyDone={() => { redirect('/'); }} />} />
			</Routes>
		</Suspense>
	)
};

export default RouteWrapper;