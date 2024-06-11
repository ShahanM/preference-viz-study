import 'bootstrap/dist/css/bootstrap.min.css';
import { Suspense, useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import './css/components.css';
// import DemographyPage from './pages/demographyPage';
// import EmotionPreferences from './pages/emotionPrefs';
// import FeedbackPage from './pages/feedbackPage';
// import { FinalPage } from './pages/finalPage';
// import RateMovies from './pages/rateMovies';
import Survey from './pages/survey';
import StudyMap from './pages/studymap';
import Welcome from './pages/welcome';
import { STRINGS } from './utils/constants';
import { WarningDialog } from './widgets/dialogs/warningDialog';

function App() {

	const [showWarning, setShowWarning] = useState(false);

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
						<Route path="/" element={<Welcome next="/studyoverview" />} />
						<Route path="/studyoverview" element={<StudyMap next="/presurvey" />} />
						<Route path="/presurvey" element={<Survey next="/ratemovies" />} />
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
