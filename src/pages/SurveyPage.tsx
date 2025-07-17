import { useCallback, useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import { CurrentStep, Participant, StudyStep, useStudy } from "rssa-api";
import Footer from "../components/Footer";
import Header from "../components/Header";
import SurveyTemplate, { SurveyConstruct } from "../layouts/templates/SurveyTemplate";
import { participantState } from "../states/participantState";
import { studyStepState } from "../states/studyState";
import { urlCacheState } from "../states/urlCacheState";
import { StudyPageProps } from "./StudyPage.types";


type SurveyItemResponse = {
	item_id: string;
	response_id: string;
}

type SurveyConstructResponse = {
	content_id: string;
	items: SurveyItemResponse[];
}

type SurveyResponse = {
	participant_id: string;
	step_id: string;
	page_id: string;
	responses: SurveyConstructResponse[];
}

type SurveyPage = {
	id: string;
	description: string;
	order_position: number;
	page_contents: SurveyConstruct[];
	last_page: boolean;
}

const Survey: React.FC<StudyPageProps> = ({ next, }) => {

	const [surveyPage, setSurveyPage] = useState<SurveyPage>();
	const [validationFlags, setValidationFlags] = useState<Map<string, boolean>>(new Map<string, boolean>());
	const [surveyResponse, setSurveyResponse] = useState<Map<string, Map<string, string | null>>>(
		new Map<string, Map<string, string>>());

	const [isLoading, setIsLoading] = useState(false);

	const [participant, setParticipant] = useRecoilState(participantState);
	const [studyStep, setStudyStep] = useRecoilState(studyStepState);
	const setNextUrl = useSetRecoilState(urlCacheState);

	const { studyApi } = useStudy();
	const navigate = useNavigate();

	const initializeSurveyResponse = useCallback((surveyConstructs: SurveyConstruct[]) => {
		if (!surveyConstructs || surveyConstructs.length === 0) {
			console.warn("No survey constructs found in the page contents.");
			return;
		}
		const initialResponse = new Map<string, Map<string, string | null>>();
		for (const svyConstruct of surveyConstructs) {
			if (!svyConstruct.items || svyConstruct.items.length === 0) {
				console.warn(`No items found in construct with content_id: ${svyConstruct.content_id}`);
				continue;
			}
			const contentMap = new Map<string, string | null>();
			for (const item of svyConstruct.items) {
				contentMap.set(item.id, null);
			}
			initialResponse.set(svyConstruct.content_id, contentMap);
		}
		setSurveyResponse(initialResponse);
	}, [setSurveyResponse]);

	useEffect(() => {
		if (!studyStep) {
			console.log("Study step or pages not loaded yet.");
			return;
		}

		if (!surveyPage) {
			studyApi.get<SurveyPage>(`surveys/${studyStep.id}/first`)
				.then((surveyPage: SurveyPage) => {
					setSurveyPage(surveyPage);
					initializeSurveyResponse(surveyPage.page_contents);
					setValidationFlags(new Map<string, boolean>());
				})
				.catch(error => {
					console.error("Error fetching first survey page content:", error);
				});
			return;
		}
	}, [studyApi, studyStep, participant, surveyPage, initializeSurveyResponse]);

	const updateResponse = useCallback((constructId: string, itemId: string, responseId: string) => {
		setSurveyResponse(prevResponses => {
			const contentMap = prevResponses.get(constructId) || new Map<string, string | null>();
			contentMap.set(itemId, responseId);
			return new Map(prevResponses.set(constructId, contentMap));
		});
		setValidationFlags(prevFlags => new Map(prevFlags.set(itemId, true)));
	}, []);

	const transformedSurveyReponse = useCallback(() => {
		if (!surveyPage || !participant || !studyStep) {
			console.warn("SurveyPage or participant is undefined in transformedSurveyReponse.");
			return null;
		}
		const surveyConstructResponses: SurveyConstructResponse[] = [];

		for (const [construct_id, itemResponses] of surveyResponse.entries()) {
			const itemsArray: SurveyItemResponse[] = [];
			for (const [item_id, response] of itemResponses.entries()) {
				if (response !== null) {
					itemsArray.push({
						item_id: item_id,
						response_id: response
					});
				} else {
					console.warn(`Item ${item_id} in construct ${construct_id} has no response.`);
				}
			}
			if (itemsArray.length > 0) {
				surveyConstructResponses.push({
					content_id: construct_id,
					items: itemsArray
				});
			}
		}
		return {
			participant_id: participant.id,
			step_id: studyStep.id,
			page_id: surveyPage.id,
			responses: surveyConstructResponses
		};
	}, [surveyResponse, surveyPage, participant, studyStep]);

	const validateSurveyResponse = useCallback(() => {
		if (!surveyPage) {
			console.warn("SurveyPage is undefined in validateSurveyResponse.");
			return false;
		}

		if (surveyResponse.size === 0) {
			console.warn("No responses recorded for the survey page.");
			setValidationFlags(new Map<string, boolean>());
			return false;
		}

		if (surveyResponse.size !== surveyPage.page_contents.length) {
			const newFlags = new Map<string, boolean>(validationFlags);
			surveyPage.page_contents.forEach(construct => {
				construct.items.forEach(item => {
					if (!surveyResponse.has(construct.content_id) || !surveyResponse.get(construct.content_id)?.has(item.id)) {
						newFlags.set(item.id, false);
					} else {
						newFlags.set(item.id, true);
					}
				});
			});
			setValidationFlags(newFlags);
			return false;
		}

		if ([...surveyResponse.values()].some((response: Map<string, string | null>) => {
			return [...response.values()].some((resp: string | null) => resp === null);
		})) {
			const newFlags = new Map<string, boolean>(validationFlags);
			surveyPage.page_contents.forEach(construct => {
				construct.items.forEach(item => {
					if (!surveyResponse.has(construct.content_id) || !surveyResponse.get(construct.content_id)?.has(item.id)) {
						newFlags.set(item.id, false);
					} else {
						newFlags.set(item.id, true);
					}
				});
			});
			setValidationFlags(newFlags);
			return false;
		}
		return true;
	}, [surveyResponse, surveyPage, validationFlags, setValidationFlags]);

	const fetchNextSurveyPage = useCallback(async () => {
		if (!studyStep) {
			console.warn("Study step is undefined in fetchNextSurveyPage.");
			return;
		}

		studyApi.get<SurveyPage>(`surveys/${studyStep.id}/pages/${surveyPage?.id}/next`)
			.then((surveyPage: SurveyPage) => {
				setSurveyPage(surveyPage);
				// setSurveyResponse(new Map<string, SurveyItemResponse>());
				initializeSurveyResponse(surveyPage.page_contents);
				setValidationFlags(new Map<string, boolean>());
			})
			.catch(error => {
				console.error("Error fetching survey page content:", error);
				// TODO: Handle error appropriately, maybe show a message to the user
			});
	}, [initializeSurveyResponse, studyApi, studyStep, surveyPage]);

	const navigateToNextStep = useCallback(async () => {
		if (!participant || !studyStep) {
			console.warn("Participant or study step is undefined in navigateToNextStep.");
			return;
		}

		try {
			setIsLoading(true);
			const nextStep: StudyStep = await studyApi.post<CurrentStep, StudyStep>('studies/steps/next', {
				current_step_id: participant.current_step
			});
			setStudyStep(nextStep);
			const updatedParticipant: Participant = {
				...participant,
				current_step: nextStep.id,
			};
			await studyApi.put('participants/', updatedParticipant);
			setParticipant(updatedParticipant);
			setNextUrl(next);

			navigate(next);
		} catch (error) {
			console.error("Error getting next step:", error);
		} finally {
			setIsLoading(false);
		}
	}, [studyApi, participant, next, navigate, setStudyStep, setParticipant, setNextUrl, studyStep]);


	const dispatchSurveyResponseRequest = useCallback(async () => {
		const responseData = transformedSurveyReponse();
		if (responseData === null) {
			console.warn("Transformed survey response is null, cannot submit.");
			return;
		} else {
			try {
				setIsLoading(true);
				await studyApi.post<SurveyResponse, boolean>(`responses/survey`, responseData);
			} catch (error) {
				console.error("Error submitting survey response:", error);
				// TODO: Handle network or other errors during submission
			} finally {
				setIsLoading(false);
			}
		}
	}, [studyApi, setIsLoading, transformedSurveyReponse]);

	const submitResponse = useCallback(async () => {
		if (!surveyPage) {
			console.log("SurveyPage submitResponse: pageContent or participant is undefined");
			return;
		}

		if (!validateSurveyResponse()) {
			console.warn("Survey response validation failed. Cannot submit.");
			return;
		}

		dispatchSurveyResponseRequest();
		surveyPage.last_page ? navigateToNextStep() : fetchNextSurveyPage();
	}, [surveyPage, fetchNextSurveyPage, validateSurveyResponse, navigateToNextStep, dispatchSurveyResponseRequest]);

	const handleSurveyNext = useCallback(() => { submitResponse(); }, [submitResponse]);

	if (!studyStep || !participant || isLoading) {
		return <div>Loading Survey...</div>;
	}

	if (!surveyPage) {
		return <div>Loading survey page content...</div>;
	}

	return (
		<Container>
			<Row>
				<Header title={studyStep?.name} content={studyStep?.description} />
			</Row>
			<Row>
				{surveyPage !== undefined &&
					<SurveyTemplate
						pageContents={surveyPage.page_contents}
						validationFlags={validationFlags}
						updateResponse={updateResponse} />
				}
			</Row>
			<Row>
				<Footer callback={handleSurveyNext}
					text="Next" loading={isLoading} />
			</Row>
		</Container>
	)

}

export default Survey;