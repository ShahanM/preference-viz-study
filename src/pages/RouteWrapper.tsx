import { Suspense, useEffect } from 'react';
import {
	Navigate,
	redirect,
	Route,
	Routes,
	useLocation,
	useNavigate
} from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import {
	Participant,
	StudyStep,
	useStudy
} from 'rssa-api';
import { participantState } from '../states/participantState';
import { studyStepState } from '../states/studyState';
import { urlCacheState } from '../states/urlCacheState';
import '../styles/_custom-bootstrap.scss';
import '../styles/App.css';
import '../styles/components.css';
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
	const studyStep: StudyStep | null = useRecoilValue(studyStepState);
	const currentUrl: string = useRecoilValue(urlCacheState);

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
		if (currentUrl !== '/' && currentUrl !== location.pathname) {
			navigate(currentUrl);
		}
	}, [currentUrl, location.pathname, navigate]);



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