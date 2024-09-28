import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import SurveyTemplate from "../layouts/templates/SurveyTemplate";
import { CurrentStep, isEmptyStep, StudyStep, SurveyPage } from "../rssa-api/RssaApi.types";
import { useStudy } from "../rssa-api/StudyProvider";
import { StudyPageProps } from "./StudyPage.types";


const Survey: React.FC<StudyPageProps> = ({
	next,
	checkpointUrl,
	participant,
	studyStep,
	updateCallback
}) => {

	const [isUpdated, setIsUpdated] = useState<boolean>(false);
	const [pageContent, setPageContent] = useState<SurveyPage>();

	const { studyApi } = useStudy();
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		if (checkpointUrl !== '/' && checkpointUrl !== location.pathname) {
			navigate(checkpointUrl);
		}
	}, [checkpointUrl, location.pathname, navigate]);

	useEffect(() => {
		if (!isEmptyStep(studyStep)) {
			studyApi.get<SurveyPage>(`survey/${studyStep.id}/first`).then((pageContent) => {
				console.log("Survey useEffect", pageContent);
				setPageContent(pageContent);
			})
		}
	}, [studyApi, studyStep]);

	const handleNextBtn = () => {
		studyApi.post<CurrentStep, StudyStep>('studystep/next', {
			current_step_id: participant.current_step
		}).then((nextStep) => {
			updateCallback(nextStep, next);
			setIsUpdated(true);
		});
	}

	useEffect(() => {
		if (isUpdated) {
			navigate(next);
		}
	}, [isUpdated, navigate, next]);

	// useEffect(() => {
	// 	console.log("Survey useEffect", participant);
	// 	if (studyStep === undefined) {
	// 		console.log("Survey useEffect empty", participant.current_step, studyStep);
	// 		studyApi.post<CurrentStep, StudyStep>('studystep/next', {
	// 			current_step_id: participant.current_step
	// 		}).then((value) => {
	// 			console.log("studystep", value);
	// 			setStudyStep(value);
	// 		});
	// 	} else {
	// 		if (participant.current_step !== studyStep.id) {
	// 			updateCallback({ ...participant, current_step: studyStep.id });
	// 		} else {
	// 			if (pageContent === undefined) {
	// 				studyApi.get<SurveyPage>(`survey/${studyStep.id}/first`).then((pageContent) => {
	// 					setPageContent(pageContent);
	// 				})
	// 			} else {
	// 				if (participant.current_page !== pageContent.page_id) {
	// 					updateCallback({ ...participant, current_page: pageContent.page_id });
	// 				}
	// 			}
	// 		}
	// 	}
	// }, [studyApi, participant, studyStep, updateParticipantCallback, pageContent]);



	const [nxtBtnDisabled, setNxtBtnDisabled] = useState(true);
	const [loading, setLoading] = useState(false);
	const [surveyAnswers, setSurveyAnswers] = useState({});
	const [serverValidation, setServerValidation] = useState({});

	const [showUnanswered, setShowUnanswered] = useState(false);

	// const [starttime, setStarttime] = useState(new Date());
	// const [pageStarttime, setPageStarttime] = useState(new Date());

	// const loadSurveyPage = (studyid, stepid, pageid) => {
	// 	getSurveyPage(studyid, stepid, pageid)
	// 		// .then((response): Promise<page> => response.json())
	// 		.then((page: page) => {
	// 			setPageData(page);
	// 			// setPageStarttime(new Date());
	// 			setShowUnanswered(false);

	// 			const pagevalidation = {};
	// 			// pagevalidation[page.id] = false;

	// 			setServerValidation({ ...serverValidation, ...pagevalidation });
	// 			setNxtBtnDisabled(true);
	// 		})
	// 		.catch((error) => console.log(error));
	// }


	// 	let path = '';
	// 	if (pageid !== null) {
	// 		path = 'study/' + studyid + '/step/' + stepid + '/page/' + pageid + '/next';
	// 	} else {
	// 		path = 'study/' + studyid + '/step/' + stepid + '/page/first/';
	// 	}
	// 	get(path)
	// 		.then((response): Promise<page> => response.json())
	// 		.then((page: page) => {
	// 			setPageData(page);
	// 			setPageStarttime(new Date());
	// 			setShowUnanswered(false);

	// 			const pagevalidation = {};
	// 			pagevalidation[page.id] = false;

	// 			setServerValidation({ ...serverValidation, ...pagevalidation });
	// 			setNxtBtnDisabled(true);
	// 		})
	// 		.catch((error) => console.log(error));
	// }

	// useEffect(() => {
	// 	getNextStudyStep(userdata.study_id, stepid)
	// 		.then((value) => { setStudyStep(value) });
	// 	setStarttime(new Date());
	// }, []);

	// useEffect(() => {
	// 	if (Object.keys(surveyAnswers).length === 0 && Object.entries(studyStep).length !== 0) {
	// 		loadSurveyPage(userdata.study_id, studyStep.id, null);
	// 	}
	// }, [studyStep]);

	// useEffect(() => {
	// 	if (pageData.id === null) {
	// 		sendLog(userdata, studyStep.id, pageData.id, new Date() - starttime,
	// 			'survey complete', 'submit', null, null);
	// 		navigate(props.next, {
	// 			state: { user: userdata, studyStep: studyStep.id }
	// 		});
	// 	} else { window.scrollTo(0, 0); }
	// 	setLoading(false);
	// }, [pageData, navigate, userdata, studyStep, props.next, starttime]);

	// const next = () => {
	// 	let timediff = 0;
	// 	let behavior = 'buttonClick';
	// 	let buttonAct = 'something went wrong: React App survey.jsx next()';
	// 	if (nxtBtnDisabled) {
	// 		setShowUnanswered(true);
	// 		timediff = new Date() - pageStarttime;
	// 		behavior = 'prematureNext';
	// 		buttonAct = 'next';
	// 	} else {
	// 		setLoading(true);
	// 		if (pageData.id !== null) {
	// 			if (serverValidation[pageData.id] === false) {
	// 				submitAndValidate();
	// 				timediff = new Date() - pageStarttime;
	// 				behavior = 'surveyResponse';
	// 				buttonAct = 'next';
	// 			} else {
	// 				loadSurveyPage(userdata.study_id, studyStep.id, pageData.id);
	// 			}
	// 		}
	// 	}
	// 	sendLog(userdata, studyStep.id, pageData.id, timediff, behavior, buttonAct,
	// 		null, null);
	// }

	// const submitHandler = (data) => {
	// 	setSurveyAnswers(data);
	// 	setNxtBtnDisabled(false);
	// }

	// const submitAndValidate = () => {
	// 	const surveyResponse = Object.entries(surveyAnswers)
	// 		.map(([key, value]) => {
	// 			return { 'question_id': key, 'response': value }
	// 		})
	// 	submitResponse('likert', userdata, pageData.id, surveyResponse)
	// 		.then((response): Promise<isvalidated> => response.json())
	// 		.then((isvalidated: isvalidated) => {
	// 			if (isvalidated === true) {
	// 				setServerValidation({ ...serverValidation, [pageData.id]: true });
	// 				loadSurveyPage(userdata.study_id, studyStep.id, pageData.id);
	// 				setNxtBtnDisabled(true);
	// 			} else { setLoading(false); }
	// 		})
	// 		.catch((error) => console.log(error));
	// }

	// const logHandler = (qid, val) => {
	// 	sendLog(userdata, studyStep.id, pageData.id, new Date() - pageStarttime,
	// 		'surveyResponse', pageData.page_name, qid, val);
	// }

	return (
		<Container>
			<Row>
				<Header title={studyStep?.name} content={studyStep?.description} />
			</Row>
			<Row>
				{pageContent !== undefined &&
					<SurveyTemplate
						surveyContent={pageContent}
						updateResponse={() => { }} />
				}
			</Row>
			<Row>
				<Footer callback={handleNextBtn}
					text="Next" loading={loading} />
			</Row>
		</Container>
	)

}

export default Survey;