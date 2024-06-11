import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { useLocation, useNavigate } from "react-router-dom";
import {
	getNextStudyStep, sendLog, submitResponse, getSurveyPage
} from "../middleware/api";
import Header from "../layouts/components/Header";
import SurveyTemplate from "../layouts/templates/SurveyTemplate";
import Footer from "../layouts/components/Footer";

export default function Survey(props) {

	// TODO: Perhaps we can use a context to store the user data? Redux?
	const userdata = useLocation().state.user;
	const stepid = useLocation().state.studyStep;
	const [studyStep, setStudyStep] = useState({});

	// TODO: We should store pageid in the user data for progress tracking

	const navigate = useNavigate();

	const [pageData, setPageData] = useState({});
	const [nxtBtnDisabled, setNxtBtnDisabled] = useState(true);
	const [loading, setLoading] = useState(false);
	const [surveyAnswers, setSurveyAnswers] = useState({});
	const [serverValidation, setServerValidation] = useState({});

	const [showUnanswered, setShowUnanswered] = useState(false);

	const [starttime, setStarttime] = useState(new Date());
	const [pageStarttime, setPageStarttime] = useState(new Date());

	const loadSurveyPage = (studyid, stepid, pageid) => {
		getSurveyPage(studyid, stepid, pageid)
			// .then((response): Promise<page> => response.json())
			.then((page: page) => {
				setPageData(page);
				setPageStarttime(new Date());
				setShowUnanswered(false);

				const pagevalidation = {};
				pagevalidation[page.id] = false;

				setServerValidation({ ...serverValidation, ...pagevalidation });
				setNxtBtnDisabled(true);
			})
			.catch((error) => console.log(error));
	}


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

	useEffect(() => {
		getNextStudyStep(userdata.study_id, stepid)
			.then((value) => { setStudyStep(value) });
		setStarttime(new Date());
	}, []);

	useEffect(() => {
		if (Object.keys(surveyAnswers).length === 0 && Object.entries(studyStep).length !== 0) {
			loadSurveyPage(userdata.study_id, studyStep.id, null);
		}
	}, [studyStep]);

	useEffect(() => {
		if (pageData.id === null) {
			sendLog(userdata, studyStep.id, pageData.id, new Date() - starttime,
				'survey complete', 'submit', null, null);
			navigate(props.next, {
				state: { user: userdata, studyStep: studyStep.id }
			});
		} else { window.scrollTo(0, 0); }
		setLoading(false);
	}, [pageData, navigate, userdata, studyStep, props.next, starttime]);

	const next = () => {
		let timediff = 0;
		let behavior = 'buttonClick';
		let buttonAct = 'something went wrong: React App survey.jsx next()';
		if (nxtBtnDisabled) {
			setShowUnanswered(true);
			timediff = new Date() - pageStarttime;
			behavior = 'prematureNext';
			buttonAct = 'next';
		} else {
			setLoading(true);
			if (pageData.id !== null) {
				if (serverValidation[pageData.id] === false) {
					submitAndValidate();
					timediff = new Date() - pageStarttime;
					behavior = 'surveyResponse';
					buttonAct = 'next';
				} else {
					loadSurveyPage(userdata.study_id, studyStep.id, pageData.id);
				}
			}
		}
		sendLog(userdata, studyStep.id, pageData.id, timediff, behavior, buttonAct,
			null, null);
	}

	const submitHandler = (data) => {
		setSurveyAnswers(data);
		setNxtBtnDisabled(false);
	}

	const submitAndValidate = () => {
		const surveyResponse = Object.entries(surveyAnswers)
			.map(([key, value]) => {
				return { 'question_id': key, 'response': value }
			})
		submitResponse('likert', userdata, pageData.id, surveyResponse)
			.then((response): Promise<isvalidated> => response.json())
			.then((isvalidated: isvalidated) => {
				if (isvalidated === true) {
					setServerValidation({ ...serverValidation, [pageData.id]: true });
					loadSurveyPage(userdata.study_id, studyStep.id, pageData.id);
					setNxtBtnDisabled(true);
				} else { setLoading(false); }
			})
			.catch((error) => console.log(error));
	}

	const logHandler = (qid, val) => {
		sendLog(userdata, studyStep.id, pageData.id, new Date() - pageStarttime,
			'surveyResponse', pageData.page_name, qid, val);
	}

	return (
		<Container>
			<Row>
				<Header title={studyStep.step_name} content={studyStep.step_description} />
			</Row>
			<Row>
				{Object.entries(pageData).length !== 0 ?
					<SurveyTemplate surveyquestions={pageData.questions}
						surveyquestiongroup={pageData.page_name}
						showUnanswered={showUnanswered}
						submitCallback={submitHandler}
						logginCallback={logHandler} />
					: ''
				}
			</Row>
			<Row>
				{/* <div className="jumbotron jumbotron-footer">
					<NextButton disabled={false} variant={nextButtonDisabled ? 'ers-disabled' : 'ers'}
						loading={loading} onClick={() => next()} />
				</div> */}
				<Footer callback={next} disabled={setNxtBtnDisabled}
					text="Next" loading={loading} />
			</Row>
		</Container>
	)

}