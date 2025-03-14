import { useCallback, useEffect, useState, useRef } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
	CurrentStep,
	GroupedTextResponse,
	isEmptyParticipant,
	isEmptyStep,
	PageContent,
	Participant,
	PrefVizRequestObject, StudyStep, TextItemResponse,
	useStudy
} from "rssa-api";
import ConfirmationDialog from "../../components/dialogs/ConfirmationDialog";
import { WarningDialog } from "../../components/dialogs/warningDialog";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import LoadingScreen from "../../components/loadingscreen/LoadingScreen";
import { DISLIKE_CUTOFF, LIKE_CUTOFF } from "../../utils/constants";
import LeftPanel from "../../widgets/leftpanel/LeftPanel";
import { Movie, MovieRating } from "../../widgets/moviegrid/moviegriditem/MovieGridItem.types";
import RightPanel from "../../widgets/rightpanel/RightPanel";
import { StudyPageProps } from "../StudyPage.types";
import ConditionView from "./ConditionView";
import "./PreferenceVisualization.css";
import { PrefVizRecItemDetail } from "./VisualizationTypes.types";
import { atom } from 'recoil';


// Recoil state for the active item to avoid re-rendering entire page
export const activeItemState = atom<Movie>({
	key: 'activeItem',
	default: undefined
});


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
	// const ratedMovies = useRef<Map<number, MovieRating>>(new Map<number, MovieRating>());
	const [ratedMovies, setRatedMovies] = useState(new Map<number, MovieRating>());

	// Convenient states to ensure state update and when to show the loader
	const [isUpdated, setIsUpdated] = useState<boolean>(false);
	const [pageContent, setPageContent] = useState<PageContent>();
	const [loading, setLoading] = useState<boolean>(false);
	const [currentPageIdx, setCurrentPageIdx] = useState(0);
	const [nextButtonDisabled, setNextButtonDisabled] = useState<boolean>(true);
	const [dataSubmitted, setDataSubmitted] = useState<boolean>(false);
	const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

	// Temporary state to get condition from URL for development testing
	const [searchParams, setSearchParams] = useSearchParams();

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

	const getRecommendations = useCallback((ratings: Map<number, MovieRating>, participant: Participant) => {
		setLoading(true);
		studyApi.post<PrefVizRequestObject, PrefVizRecItemDetail[]>(
			"prefviz/recommendation/", {
			user_id: participant.id,
			user_condition: participant.condition_id,
			ratings: [...ratings.values()].map(rating => {
				return { item_id: rating.movielens_id, rating: rating.rating }
			})
		}).then((responseItems: PrefVizRecItemDetail[]) => {
			let itemMap = new Map<string, PrefVizRecItemDetail>();
			for (let item of responseItems) { itemMap.set(item.id, item); }
			setPrefItemDetails(itemMap);
			setLoading(false);
		}).catch((err: any) => {
			console.error("VisualizationLayout Error", err);
		});
	}, [studyApi]);


	// useEffect(() => {
	// }, []);


	useEffect(() => {
		if (ratedMovies === undefined || ratedMovies.size === 0) {
			if (stateData && stateData.ratedMovies) {
				const ratedMoviesData = stateData.ratedMovies as Map<number, MovieRating>;
				setRatedMovies(ratedMoviesData);
			} else {
				const storedRatedMovies = localStorage.getItem('ratedMoviesData');
				if (storedRatedMovies) {
					const ratedMovieCache = JSON.parse(storedRatedMovies);
					const ratedMovieData = new Map<number, MovieRating>();
					for (let key in ratedMovieCache) {
						ratedMovieData.set(parseInt(key), ratedMovieCache[key]);
					}
					setRatedMovies(ratedMovieData);
				} else {
					console.error("Something went wrong with the rated movies");
					// TODO: Clear stored local data and redirect to start of study
				}
			}
		}
		if (prefItemDetails.size === 0 &&
			!isEmptyParticipant(participant) &&
			ratedMovies.size > 0) {
			getRecommendations(ratedMovies, participant);
		}
	}, [ratedMovies, stateData, getRecommendations, prefItemDetails, participant]);

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
		}).then((nextStep: StudyStep) => {
			updateCallback(nextStep, next)
			setIsUpdated(true);
		});
	}, [studyApi, participant, updateCallback, next])


	const handleSubmit = useCallback(() => {
		if (!dataSubmitted) {
			const responses = Array.from(promptResponses.values());
			setLoading(true);
			localStorage.setItem('prefviz', JSON.stringify(responses));
			console.log("Submitting responses", studyStep, currentPageIdx);
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
				}).catch((error: any) => console.error(error));
		}
	}, [studyApi, participant, studyStep, currentPageIdx, promptResponses,
		dataSubmitted]);

	useEffect(() => {
		if (dataSubmitted) { setLoading(false); }
	}, [dataSubmitted]);

	useEffect(() => {
		if (!isEmptyStep(studyStep)) {
			if (studyStep.pages && studyStep.pages.length > 0) {
				if (currentPageIdx < studyStep.pages.length) {
					studyApi.get<PageContent>(
						`page/${studyStep.pages[currentPageIdx].id}`)
						.then((pageContent: PageContent) => {
							setPageContent(pageContent);
						})
				} else {
					handleNextBtn();
				}
			}
		}
	}, [studyApi, studyStep, currentPageIdx, handleNextBtn]);


	const promptsUpdateHandler = (response: TextItemResponse) => {
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
							: <ConditionView
								condition={parseInt(searchParams.get('cond') || '1')}
								prefItemDetails={prefItemDetails} />

						}
					</Col>
					<Col xxxl={2} xxl={3} xl={2} md={3} className="ms-0 ps-0">
						<RightPanel likeCuttoff={LIKE_CUTOFF}
							dislikeCuttoff={DISLIKE_CUTOFF} />
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