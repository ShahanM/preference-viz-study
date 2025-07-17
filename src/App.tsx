import { useEffect, useState } from 'react';
import { ThemeProvider, Toast, ToastContainer } from 'react-bootstrap';
import {
	BrowserRouter as Router
} from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { WarningDialog } from './components/dialogs/warningDialog';
import RouteWrapper from './pages/RouteWrapper';
import { retryAttemptState, studyErrorState } from './states/errorState';
import './styles/_custom-bootstrap.scss';
import './styles/App.css';
import './styles/components.css';
import { customBreakpoints, RETRY_DELAYS_MS, STRINGS } from './utils/constants';


function App() {

	const [showWarning, setShowWarning] = useState<boolean>(false);
	const studyError: boolean = useRecoilValue(studyErrorState);
	const retryAttempt: number = useRecoilValue(retryAttemptState);

	useEffect(() => {
		const handleResize = () => { setShowWarning(window.innerWidth < 1200); }
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

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
