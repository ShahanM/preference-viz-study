import React from "react";
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { StudyProvider } from './rssa-api/StudyProvider';

const REACT_APP_RSSA_API_DEV = process.env.REACT_APP_RSSA_API_DEV!;
const REACT_APP_RSSA_API = process.env.REACT_APP_RSSA_API!;
const REACT_APP_RSSA_STUDY_ID = process.env.REACT_APP_RSSA_STUDY_ID!;

const api_url_base = process.env.NODE_ENV === 'development' ?
	REACT_APP_RSSA_API_DEV : REACT_APP_RSSA_API;

const providerConfig = {
	api_url_base: api_url_base,
	study_id: REACT_APP_RSSA_STUDY_ID
};

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
	<React.StrictMode>
		<StudyProvider
			config={providerConfig}>
			<App />
		</StudyProvider>,
	</React.StrictMode>
);

reportWebVitals(console.log);