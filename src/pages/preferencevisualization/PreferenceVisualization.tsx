import { useCallback, useEffect, useState } from "react";
import { Col, Container, FormSelect, InputGroup, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
	CurrentStep,
	Participant,
	StudyStep,
	useStudy,
} from "rssa-api";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import LoadingScreen from "../../components/loadingscreen/LoadingScreen";
import { participantState } from "../../states/participantState";
import { ratedMoviesState } from "../../states/ratedMovieState";
import { studyStepState } from "../../states/studyState";
import { urlCacheState } from "../../states/urlCacheState";
import { DISLIKE_CUTOFF, LIKE_CUTOFF } from "../../utils/constants";
import LeftPanel from "../../widgets/leftpanel/LeftPanel";
import { MovieRating } from "../../widgets/moviegrid/moviegriditem/MovieGridItem.types";
import RightPanel from "../../widgets/rightpanel/RightPanel";
import ConditionView from "./ConditionView";
import "./PreferenceVisualization.css";
import { PrefVizRecItemDetail } from "./VisualizationTypes.types";
import { StudyPageProps } from "../StudyPage.types";


type PrefVizRequestObject = {
	user_id: string;
	user_condition: string;
	rec_type: 'baseline' | 'diverse' | 'reference';
	ratings: { item_id: number, rating: number }[];
};


const PreferenceVisualization: React.FC<StudyPageProps> = ({ next, navigateToNextStep}) => {
	const [participant, setParticipant] = useRecoilState(participantState);
	const [studyStep, setStudyStep] = useRecoilState(studyStepState);
	const setNextUrl = useSetRecoilState(urlCacheState);

	const { studyApi } = useStudy();
	const navigate = useNavigate();
	const ratedMovies: Map<string, MovieRating> = useRecoilValue(ratedMoviesState);

	const [loading, setLoading] = useState<boolean>(false);
	const [nextButtonDisabled, setNextButtonDisabled] = useState<boolean>(true);

	// FIXME:
	// Temporary state to get condition from URL for development testing
	// NOTE: Condition 5 is Baseline in the test study, so we will get TopN
	const [selectedCondition, setSelectedCondition] = useState<number>(1);

	const [prefItemDetails, setPrefItemDetails] =
		useState<Map<string, PrefVizRecItemDetail>>(
			new Map<string, PrefVizRecItemDetail>());

	const [width, setWidth] = useState(window.innerWidth);

	useEffect(() => {
		const handleResize = () => {
			setWidth(window.innerWidth);
		}
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const getRecommendations = useCallback(async () => {
		if (!participant || !studyStep) {
			console.warn("SurveyPage or participant is undefined in getRecommendations.");
			return null;
		}
		setLoading(true);
		let recType: 'baseline' | 'diverse' | 'reference' = "baseline";
		switch (selectedCondition) {
			case 4:
			case 52:
			case 62:
				recType = "baseline";
				break;
			case 1:
			case 2:
			case 3:
			case 5:
			case 6:
				recType = "diverse";
				break;
			case 11:
			case 21:
			case 31:
			case 51:
			case 61:
				recType = "reference";
				break;
			default:
				recType = "baseline";
				break
		}
		try {
			const responseItems: PrefVizRecItemDetail[] = await studyApi.post<PrefVizRequestObject, PrefVizRecItemDetail[]>(
				"recommendation/prefviz/", {
				user_id: participant.id,
				user_condition: participant.condition_id,
				// FIXME: Remember this should be based on the participant condition, not searchParams for production
				rec_type: recType,
				ratings: [...ratedMovies.values()].map(rating => {
					return { item_id: rating.movielens_id, rating: rating.rating };
				})
			});
			let itemMap = new Map<string, PrefVizRecItemDetail>();
			for (let item of responseItems) { itemMap.set(item.id, item); }
			setPrefItemDetails(itemMap);
		} catch (err: any) {
			console.error("VisualizationLayout Error", err);
			// Handle error state, e.g., show an error message to the user
		} finally {
			setLoading(false);
		}
	}, [studyApi, selectedCondition, participant, studyStep, setPrefItemDetails, ratedMovies]);

	useEffect(() => { getRecommendations(); }, [getRecommendations]);

	const handleNextBtn = useCallback(async () => {
		if (!studyStep || !participant) {
			console.error("Study step or participant is not defined.");
			return;
		}

		try {
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
			console.error("Error submitting responses:", error);
			// Handle submission error, e.g., show a message
		} finally {
			setLoading(false);
		}
	}, [studyStep, participant, studyApi, next, navigate, setStudyStep, setParticipant, setNextUrl]);

	if (!participant || !studyStep) {
		return <LoadingScreen loading={true} message="Initializing study data..." />;
	}
	return (
		<Container className="prefviz" fluid={width < 2000}>
			<Header title={studyStep?.name} content={studyStep?.description} />
			<Row className="mt-3 mb-3 ms-1 rounded w-25 p-3 bg-dark-subtle">
				<InputGroup>
					<InputGroup.Text id="experiment-condition-select">Experiment condition: </InputGroup.Text>
					<FormSelect aria-label="Select a experiment condition to view"
						aria-describedby="experiment-condition-select"
						value={selectedCondition}
						onChange={(e) => { setSelectedCondition(parseInt(e.target.value)) }}
					>
						<optgroup label="Diverse N Recommendations">
							<option value="1">Continuous Coupled</option>
							<option value="2">Continuous Decoupled</option>
							<option value="3">Discrete Decoupled</option>
							<option value="5">Continuous Decoupled - Self</option>
							<option value="6">Discrete Decoupled - Self</option>
						</optgroup>
						<optgroup label="Top N Recommendations">
							<option value="4">Baseline</option>
							<option value="52">Continuous Decoupled - Self</option>
							<option value="62">Discrete Decoupled - Self</option>
						</optgroup>
						<optgroup label="Referenced N Recommendations">
							<option value="11">Continuous Coupled</option>
							<option value="21">Continuous Decoupled</option>
							<option value="31">Discrete Decoupled</option>
							<option value="51">Continuous Decoupled - Self</option>
							<option value="61">Discrete Decoupled - Self</option>
						</optgroup>
					</FormSelect>
				</InputGroup>
			</Row>
			<Row>
				<Col xxxl={3} xxl={3} xl={2} md={3} className="me-0 pe-0">
					<LeftPanel nextButtonDisabledCallback={setNextButtonDisabled} />
				</Col>
				<Col xxxl={6} xxl={6} xl={8} md={6} className="m-0 p-0">
					{!loading && prefItemDetails !== undefined
						&& !(prefItemDetails.size > 0) ?
						<LoadingScreen loading={loading}
							message="Loading Recommendations" />
						: <ConditionView
							condition={selectedCondition}
							prefItemDetails={prefItemDetails} />
					}
				</Col>
				<Col xxxl={3} xxl={3} xl={2} md={3} className="ms-0 ps-0">
					<RightPanel likeCuttoff={LIKE_CUTOFF}
						showLikeDislikeByLine={[4, 5, 6, 41, 51, 61].indexOf(selectedCondition) === -1}
						dislikeCuttoff={DISLIKE_CUTOFF} />
				</Col>
			</Row>
			<Footer callback={handleNextBtn} disabled={nextButtonDisabled} text={"Next"} />
		</Container>
	);
}



export default PreferenceVisualization;