import { useCallback, useEffect, useRef, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import ConfirmationDialog from "../../components/dialogs/ConfirmationDialog";
import { WarningDialog } from "../../components/dialogs/warningDialog";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import LoadingScreen from "../../components/loadingscreen/LoadingScreen";
import { post } from "../../middleware/requests";
import { CurrentStep, GroupedTextResponse, isEmptyStep, PageContent, PrefVizRequestObject, StudyStep, TextItemResponse } from "../../rssa-api/RssaApi.types";
import { useStudy } from "../../rssa-api/StudyProvider";
import { DISLIKE_CUTOFF, LIKE_CUTOFF } from "../../utils/constants";
import { mapKeyContainsAll } from "../../utils/helper";
import Continuouscoupled from "../../widgets/ContinuousCoupled";
import LeftPanel from "../../widgets/leftpanel/LeftPanel";
import { Movie, MovieRating } from "../../widgets/moviegrid/moviegriditem/MovieGridItem.types";
import RightPanel from "../../widgets/rightpanel/RightPanel";
import { StudyPageProps } from "../StudyPage.types";
import "./PreferenceVisualization.css";


type PrefVizRecItem = {
	item_id: number;
	community_score: number;
	user_score: number;
	community_label: number;
	user_label: number;
	cluster: number;
}

type PrefVizMetadata = {
	algo: string;
	randomize: boolean;
	init_sample_size: number;
	min_rating_count: number;
	num_rec: number;
}

type PrefVizItem = {
	metadata: PrefVizMetadata;
	recommendations: PrefVizRecItem[];
}

interface PrefVizRecItemDetail extends Movie, PrefVizRecItem { }


const PreferenceVisualization: React.FC<StudyPageProps> = ({
	next,
	checkpointUrl,
	participant,
	studyStep,
	updateCallback,
	sizeWarning
}) => {

	const { studyApi } = useStudy();
	const navigate = useNavigate();
	const location = useLocation();

	// We are grabbing the rated movies from the preference elicitation step
	const stateData = location.state as any;
	const ratedMovies = useRef<Map<number, MovieRating>>(stateData?.ratedMovies || new Map<number, MovieRating>());

	console.log("PreferenceVisualization ratedMovies", ratedMovies.current);

	// Convenient states to ensure state update and when to show the loader
	const [isUpdated, setIsUpdated] = useState<boolean>(false);
	const [pageContent, setPageContent] = useState<PageContent>();
	const [loading, setLoading] = useState<boolean>(false);
	const [activeItem, setActiveItem] = useState<string>();
	const [currentPageIdx, setCurrentPageIdx] = useState(0);
	const [nextButtonDisabled, setNextButtonDisabled] = useState<boolean>(true);
	const [dataSubmitted, setDataSubmitted] = useState<boolean>(false);
	const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

	// State to hold the recommendations
	const [prefItemDetails, setPrefItemDetails] =
		useState<Map<string, PrefVizRecItemDetail>>(
			new Map<string, PrefVizRecItemDetail>());

	const [promptResponses, setPromptResponses] =
		useState<Map<string, TextItemResponse>>(
			new Map<string, TextItemResponse>());

	const [width, setWidth] = useState(window.innerWidth);

	useEffect(() => {
		const handleResize = () => {
			setWidth(window.innerWidth);
		}
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);


	useEffect(() => {

		if (ratedMovies.current === undefined) {
			const storedRatedMovies = localStorage.getItem('ratedMoviesData');
			if (storedRatedMovies) {
				ratedMovies.current = JSON.parse(storedRatedMovies);
			}
		}
	}, [ratedMovies]);


	useEffect(() => {
		if (promptResponses.size === pageContent?.constructs.length) {
			let allResponded = new Map<string, boolean>();
			for (let key of promptResponses.keys()) {
				const promptResponse = promptResponses.get(key);
				if (promptResponse === undefined ||
					promptResponse.response.length < 20) {
					return;
				} else {
					allResponded.set(key, true);
				}
			}
			if ([...allResponded.values()].every((x: boolean) => x)) {
				setNextButtonDisabled(false);
			} else {
				setNextButtonDisabled(true);
			}
		}
	}, [promptResponses, pageContent?.constructs.length]);

	// Allowing for some simple checkpoint saving so the participant
	// can return to the page in case of a browser/system crash
	useEffect(() => {
		if (checkpointUrl !== '/' && checkpointUrl !== location.pathname) {
			navigate(checkpointUrl);
		}
	}, [checkpointUrl, location.pathname, navigate]);

	const handleNextBtn = useCallback(() => {
		studyApi.post<CurrentStep, StudyStep>('studystep/next', {
			current_step_id: participant.current_step
		}).then((nextStep) => {
			updateCallback(nextStep, next)
			setIsUpdated(true);
		});
	}, [studyApi, participant, updateCallback, next])


	const handleSubmit = useCallback(() => {
		if (!dataSubmitted) {
			const responses = Array.from(promptResponses.values());
			setLoading(true);
			localStorage.setItem('prefviz', JSON.stringify(responses));
			studyApi.post<GroupedTextResponse, boolean>(
				`participant/${participant.id}/textresponse/`,
				{
					participant_id: participant.id,
					page_id: studyStep.pages[currentPageIdx].id,
					responses: responses
				}).then((success: boolean) => {
					if (success) {
						setDataSubmitted(true);
						setShowConfirmation(false);
					}
				}).catch((error) => console.log(error));
		}
	}, [studyApi, participant, studyStep, currentPageIdx, promptResponses,
		dataSubmitted]);

	useEffect(() => {
		if (dataSubmitted) {
			setLoading(false);
		}
	}, [dataSubmitted]);


	useEffect(() => {
		if (!isEmptyStep(studyStep)) {
			if (studyStep.pages && studyStep.pages.length > 0) {
				if (currentPageIdx < studyStep.pages.length) {
					studyApi.get<PageContent>(
						`page/${studyStep.pages[currentPageIdx].id}`)
						.then((pageContent) => {
							setPageContent(pageContent);
						})
				} else {
					handleNextBtn();
				}
			}
		}
	}, [studyApi, studyStep, currentPageIdx, handleNextBtn]);

	console.log("ACTIVE", activeItem);

	// Fetch the recommendations from the server
	// FIXME: abstract this into the studyApi
	useEffect(() => {
		const getRecommendations = async () => {
			setLoading(true);
			const requestObj = {
				user_id: participant.id,
				user_condition: participant.condition_id,
				ratings: [...ratedMovies.current.values()].map(rating => {
					return {
						movie_id: rating.movielens_id,
						rating: rating.rating
					}
				})
			}
			console.log("PreferenceVisualization getRecommendations", requestObj, participant);
			studyApi.post<PrefVizRequestObject, PrefVizRecItemDetail[]>("prefviz/recommendation/", {
				user_id: participant.id,
				user_condition: participant.condition_id,
				ratings: [...ratedMovies.current.values()].map(rating => {
					return {
						movie_id: rating.movielens_id,
						rating: rating.rating
					}
				})
			}).then((responseItems: PrefVizRecItemDetail[]) => {
				console.log("PreferenceVisualization newstuff", responseItems);
				let itemMap = new Map<string, PrefVizRecItemDetail>();
				for (let item of responseItems) {
					itemMap.set(item.id, item);
				}
				setPrefItemDetails(itemMap);
				setLoading(false);
			}).catch((err) => {
				console.log("VisualizationLayout Error", err);
			});
		}

		if (prefItemDetails.size === 0 && participant.id !== '' && participant.condition_id !== '') {
			getRecommendations();
		}

	}, [ratedMovies, prefItemDetails, studyApi, participant]);

	const promptsUpdateHandler = (response: TextItemResponse) => {
		console.log("PreferenceVisualization promptsUpdateHandler", promptResponses);
		const newResponses = new Map(promptResponses);
		newResponses.set(response.item_id, response);
		setPromptResponses(newResponses);
	}

	useEffect(() => {
		if (isUpdated) {
			navigate(next);
		}
	}, [isUpdated, navigate, next]);

	return (
		<Container className="prefviz" fluid={width < 2000}>
			<Row>
				<Header title={studyStep?.name}
					content={studyStep?.description} />
			</Row>
			<WarningDialog show={dataSubmitted} title="Success"
				message={`Your responses have been submitted. 
					You may now click the next button to proceed.`} />
			<ConfirmationDialog show={showConfirmation} title="Confirmation"
				message={`Are you sure you want to submit your responses?`}
				onConfirm={handleSubmit}
				onCancel={() => setShowConfirmation(false)} />
			{sizeWarning ? <Row className="size-error-overlay">
				Nothing to display
			</Row> :
				<Row>
					<Col xxxl={2} xxl={3} xl={2} md={3} className="me-0 pe-0">
						{pageContent ?
							<LeftPanel prompts={pageContent?.constructs}
								lockFields={dataSubmitted}
								promptsUpdateCallback={promptsUpdateHandler} />
							: <></>
						}
					</Col>
					<Col xxxl={8} xxl={6} xl={8} md={6} className="m-0 p-0">
						{!loading && prefItemDetails !== undefined
							&& !(prefItemDetails.size > 0) ?
							<LoadingScreen loading={loading}
								message="Loading Recommendations" />
							:
							<Continuouscoupled itemdata={prefItemDetails}
								activeItemCallback={setActiveItem} />
						}
					</Col>
					<Col xxxl={2} xxl={3} xl={2} md={3} className="ms-0 ps-0">
						{activeItem ?
							<RightPanel movie={prefItemDetails?.get(activeItem)}
								likeCuttoff={LIKE_CUTOFF}
								dislikeCuttoff={DISLIKE_CUTOFF} />
							: <></>
						}
					</Col>
				</Row>
			}
			<Row>
				<Footer callback={dataSubmitted ? handleNextBtn
					: () => setShowConfirmation(true)}
					disabled={nextButtonDisabled}
					text={!dataSubmitted ? "Submit" : "Next"}
				/>
			</Row>
		</Container>
	);
}

export default PreferenceVisualization;