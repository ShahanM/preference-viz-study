import { useCallback, useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { CurrentStep, isEmptyStep, PageContent, StudyStep } from "../../rssa-api/RssaApi.types";
import { useStudy } from "../../rssa-api/StudyProvider";
import { Movie, MovieRating } from "../../widgets/moviegrid/moviegriditem/MovieGridItem.types";
import { StudyPageProps } from "../StudyPage.types";
import { post } from "../../middleware/requests";
import { mapKeyContainsAll } from "../../utils/helper";
import Continuouscoupled from "../../widgets/ContinuousCoupled";
import LoadingScreen from "../../components/loadingscreen/LoadingScreen";
import { DISLIKE_CUTOFF, LIKE_CUTOFF } from "../../utils/constants";
import RightPanel from "../../widgets/rightpanel/RightPanel";
import LeftPanel from "../../widgets/leftpanel/LeftPanel";


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
	updateCallback
}) => {

	const { studyApi } = useStudy();
	const navigate = useNavigate();
	const location = useLocation();

	// We are grabbing the rated movies from the preference elicitation step
	const stateData = location.state as any;
	const ratedMovies: Map<number, MovieRating> = stateData?.ratedMovies;

	// Convenient states to ensure state update and when to show the loader
	const [isUpdated, setIsUpdated] = useState<boolean>(false);
	const [pageContent, setPageContent] = useState<PageContent>();
	const [loading, setLoading] = useState<boolean>(false);
	const [activeItem, setActiveItem] = useState<number>();
	const [currentPageIdx, setCurrentPageIdx] = useState(0);
	// States to hold the recommendations
	const [prefItemMap, setPrefItemMap] =
		useState<Map<number, PrefVizRecItem>>(
			new Map<number, PrefVizRecItem>());
	const [movieMap, setMovieMap] =
		useState<Map<number, Movie>>(new Map<number, Movie>());
	const [prefItemDetails, setPrefItemDetails] =
		useState<Map<number, PrefVizRecItemDetail>>();

	// Do not need the metadata for the study, it was used to tune the hyperparameters
	const [recMetadata, setRecMetadata] = useState<PrefVizMetadata>();

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

	useEffect(() => {
		console.log("PreferenceVisualization page", currentPageIdx);
		console.log("PreferenceVisualization studyStep", studyStep);

		if (!isEmptyStep(studyStep)) {
			if (studyStep.pages && studyStep.pages.length > 0) {
				if (currentPageIdx < studyStep.pages.length) {
					studyApi.get<PageContent>(`page/${studyStep.pages[currentPageIdx].id}`)
						.then((pageContent) => {
							setPageContent(pageContent);
							console.log("PreferenceVisualization pageContent", pageContent);
						})
				} else {
					handleNextBtn();
				}
			}
		}
	}, [studyApi, studyStep, currentPageIdx, handleNextBtn]);

	// Fetch the recommendations from the server
	// FIXME: abstract this into the studyApi
	useEffect(() => {
		const getRecommendations = async () => {
			setLoading(true);
			post("prefviz/recommendation/", {
				user_id: 0, // TODO: change this to the actual user id
				user_condition: 0, // TODO: change this to the actual user condition
				ratings: [...ratedMovies.values()],
				num_rec: 40, // FIXME: hardcoded value
				algo: 'fishnet + single_linkage', // FIXME: hardcoded value
				randomize: false, // FIXME: hardcoded value
				init_sample_size: 500, // FIXME: hardcoded value
				min_rating_count: 50 // FIXME: hardcoded value
			}).then((response) => response.json())
				.then((responseItems: PrefVizItem) => {
					console.log("PreferenceVisualization responseItems", responseItems);
					const itemMap = new Map(responseItems.recommendations.map(
						(item: PrefVizRecItem) =>
							[
								parseInt(item.item_id.toString()),
								item] as [number, PrefVizRecItem

							]
					));
					setPrefItemMap(itemMap);
					setRecMetadata(responseItems.metadata);
					setLoading(false);
				}).catch((err) => {
					console.log("VisualizationLayout Error", err);
				});
		}

		if (prefItemMap.size === 0) {
			getRecommendations();
		}

	}, [ratedMovies, prefItemMap]);

	// Fetch the movie data for the recommendations
	useEffect(() => {
		console.log("PreferenceVisualization items", prefItemMap);
		console.log("PreferenceVisualization movieMap", movieMap);
		const getMoviesByIDs = async (ids: number[]) => {
			setLoading(true);
			post('api/v2/movie/ers', ids)
				.then((response): Promise<Movie[]> => response.json())
				.then((movies: Movie[]) => {
					const imap = new Map<number, Movie>(movieMap);
					for (let movie of movies) {
						imap.set(movie.movie_id, movie);
					}
					setMovieMap(imap);
				})
				.catch((error) => console.log(error));
		}

		// Creating a new map containing both scores and details for convenience
		const itemIds = [...prefItemMap.keys()];
		if (itemIds.length <= 0) { return }
		if (!mapKeyContainsAll(movieMap, itemIds)) {
			getMoviesByIDs(itemIds);
		} else {
			const itemdetails = new Map<number, PrefVizRecItemDetail>();
			for (let itemid of itemIds) {
				const item = prefItemMap.get(itemid);
				const movie = movieMap.get(itemid);
				if (item && movie) {
					itemdetails.set(itemid, {
						...movie,
						...item
					});
				}
			}
			setPrefItemDetails(itemdetails);
		}
	}, [prefItemMap, movieMap]);

	useEffect(() => {
		if (isUpdated) {
			navigate(next);
		}
	}, [isUpdated, navigate, next]);

	return (
		<Container fluid>
			<Row>
				<Header title={studyStep?.name} content={studyStep?.description} />
			</Row>
			<Row>
				{/* <> */}
				<Col md={3}>
					{pageContent ?
						<LeftPanel prompts={pageContent?.constructs} />
						: <></>
					}
				</Col>
				<Col md={6}>
					{
						!loading && prefItemDetails !== undefined && !(prefItemDetails.size > 0) ?
							<LoadingScreen loading={loading} message="Loading Recommendations" />
							:
							<Continuouscoupled itemdata={prefItemDetails} activeItemCallback={setActiveItem} />
					}
				</Col>
				<Col md={3}>
					{activeItem ?
						<RightPanel movie={prefItemDetails?.get(activeItem)}
							likeCuttoff={LIKE_CUTOFF} dislikeCuttoff={DISLIKE_CUTOFF} />
						: <></>
					}
				</Col>
				{/* </> */}
			</Row>
			<Row>
				<Footer callback={handleNextBtn} />
			</Row>
		</Container>
	);
}

export default PreferenceVisualization;