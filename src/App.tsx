// import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { ThemeProvider, Toast, ToastContainer } from 'react-bootstrap';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import { WarningDialog } from './components/dialogs/warningDialog';
import RouteWrapper from './pages/RouteWrapper';
// import './styles/App.css';
import { customBreakpoints, RETRY_DELAYS_MS, STRINGS } from './utils/constants';

function App() {
    const [retryAttempt, setRetryAttempt] = useState<number>(0);
    const [studyError, setStudyError] = useState<boolean>(false);
    const [showWarning, setShowWarning] = useState<boolean>(false);

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
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <ThemeProvider breakpoints={Object.keys(customBreakpoints)}>
            <div className="App">
                {showWarning && (
                    <WarningDialog
                        show={showWarning}
                        onClose={setShowWarning}
                        title="Warning"
                        message={STRINGS.WINDOW_TOO_SMALL}
                        disableHide={true}
                    />
                )}
                {studyError &&
                    (RETRY_DELAYS_MS[retryAttempt] === undefined ? (
                        <WarningDialog
                            show={studyError}
                            title="Error"
                            message={STRINGS.STUDY_ERROR}
                            onClose={setStudyError}
                        />
                    ) : (
                        <ToastContainer position="top-center" className="p-3">
                            <Toast bg="danger" autohide={true} delay={RETRY_DELAYS_MS[retryAttempt]}>
                                <Toast.Body className={'text-white'}>
                                    There was an error registering this study. Retrying in{' '}
                                    {RETRY_DELAYS_MS[retryAttempt] / 1000} seconds...
                                </Toast.Body>
                            </Toast>
                        </ToastContainer>
                    ))}
                <Router basename="/preference-visualization/">{<RouteWrapper />}</Router>
            </div>
        </ThemeProvider>
    );
}

App.whyDidYouRender = true;
export default App;
