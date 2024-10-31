import { useCallback, useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { useLocation, useNavigate } from "react-router-dom";
import { CurrentStep, isEmptyStep, StudyStep, SurveyItemResponse, SurveyPage, SurveyResponse, useStudy } from "rssa-api";
import Footer from "../components/Footer";
import Header from "../components/Header";
import SurveyTemplate from "../layouts/templates/SurveyTemplate";
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
	const [currentPageIdx, setCurrentPageIdx] = useState(0);
	const [validationFlags, setValidationFlags] = useState<Map<string, boolean>>(new Map<string, boolean>());
	const [surveyResponse, setSurveyResponse] = useState<Map<string, SurveyItemResponse>>(
		new Map<string, SurveyItemResponse>());

	const [nxtBtnDisabled, setNxtBtnDisabled] = useState(true);
	const [loading, setLoading] = useState(false);

	const { studyApi } = useStudy();
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		if (checkpointUrl !== '/' && checkpointUrl !== location.pathname) {
			navigate(checkpointUrl);
		}
	}, [checkpointUrl, location.pathname, navigate]);

	const handleNextBtn = useCallback(() => {
		studyApi.post<CurrentStep, StudyStep>('studystep/next', {
			current_step_id: participant.current_step
		}).then((nextStep: StudyStep) => {
			updateCallback(nextStep, next);
			setIsUpdated(true);
		});
	}, [studyApi, participant, updateCallback, next]);


	useEffect(() => {
		if (!isEmptyStep(studyStep)) {
			if (studyStep.pages && studyStep.pages.length > 0) {
				if (currentPageIdx < studyStep.pages.length) {
					studyApi.get<SurveyPage>(`survey/${studyStep.pages[currentPageIdx].id}`)
						.then((pageContent: SurveyPage) => {
							setPageContent(pageContent);
						})
				} else {
					handleNextBtn();
				}
			}
		}
	}, [studyApi, studyStep, currentPageIdx, handleNextBtn]);

	const updateResponse = (itemid: string, responsestr: string) => {
		let newResponse = new Map<string, SurveyItemResponse>(surveyResponse);

		newResponse.set(itemid, {
			item_id: itemid,
			response: responsestr
		});
		setValidationFlags(new Map<string, boolean>(validationFlags.set(itemid, true)));
		setSurveyResponse(newResponse);
	}


	const submitResponse = () => {
		if (!pageContent) { console.log("SurveyPage submitResponse empty pageContent"); return; }
		if (surveyResponse.size === pageContent.construct_items.length) {
			studyApi.post<SurveyResponse, boolean>(`participant/${participant.id}/surveyresponse/`, {
				participant_id: participant.id,
				page_id: pageContent.page_id,
				responses: [...surveyResponse.values()]
			}).then((response: boolean) => {
				if (response) {
					setCurrentPageIdx(currentPageIdx + 1);
				}
			})
		}
	}


	const handleSurveyNext = () => {
		if (currentPageIdx < studyStep.pages.length) {
			if (surveyResponse.size === pageContent?.construct_items.length) {
				submitResponse();
			} else {
				pageContent?.construct_items.forEach((item) => {
					if (!surveyResponse.has(item.id)) {
						setValidationFlags(new Map<string, boolean>(validationFlags.set(item.id, false)));
					} else {
						setValidationFlags(new Map<string, boolean>(validationFlags.set(item.id, true)));
					}
				});
			}
		} else {
			handleNextBtn();
		}
	}

	useEffect(() => {
		if (isUpdated) {
			navigate(next);
		}
	}, [isUpdated, navigate, next]);

	return (
		<Container>
			<Row>
				<Header title={studyStep?.name} content={studyStep?.description} />
			</Row>
			<Row>
				{pageContent !== undefined &&
					<SurveyTemplate
						surveyContent={pageContent}
						validationFlags={validationFlags}
						updateResponse={updateResponse} />
				}
			</Row>
			<Row>
				<Footer callback={handleSurveyNext}
					text="Next" loading={loading} />
			</Row>
		</Container>
	)

}

export default Survey;