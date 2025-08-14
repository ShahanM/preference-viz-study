import { useEffect, useState } from 'react';
import { ThemeProvider, Toast, ToastContainer } from 'react-bootstrap';
import {
	BrowserRouter as Router
} from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { StudyStep, useStudy } from 'rssa-api';
import { WarningDialog } from './components/dialogs/warningDialog';
import RouteWrapper from './pages/RouteWrapper';
import { studyStepState } from './states/studyState';
import './styles/_custom-bootstrap.scss';
import './styles/App.css';
import './styles/components.css';
import { customBreakpoints, RETRY_DELAYS_MS, STRINGS } from './utils/constants';


function App() {

	const { studyApi } = useStudy();

	const [studyStep, setStudyStep] = useRecoilState(studyStepState);

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [retryAttempt, setRetryAttempt] = useState<number>(0);
	const [fetchError, setFetchError] = useState<boolean>(false);
	const [studyError, setStudyError] = useState<boolean>(false);
	const [showWarning, setShowWarning] = useState<boolean>(false);
	const [currentFetchTrigger, setCurrentFetchTrigger] = useState<number>(0);

	/*
	 * UseEffect to handle window resize events.
	 * Trigger conditions:
	 * 	- On component mount but sets a listener on window resize.
	 */
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 1200) {
				setShowWarning(true);
			} else if (window.innerWidth >= 1200) {
				setShowWarning(false);
			}
		}
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	/* UseEffect to handle retry logic for fetching study data.
	 * Trigger conditions:
	 * 	- When there is a fetch error and the study is not loading.
	 */
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

	/*
	 * UseEffect to fetch the initial study step.
	 * Trigger conditions:
	 * 	- On component mount.
	 *  - On retry trigger in error state. See RETRY_DELAYS_MS for number of retries.
	 */
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

	if (isLoading) { return <div>Loading...</div> } // FIXME: Make this a proper loader

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
				{studyError && (
					RETRY_DELAYS_MS[retryAttempt] === undefined ?
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
					<RouteWrapper />
				</Router>
			</div>
		</ThemeProvider>
	);
}

export default App;
