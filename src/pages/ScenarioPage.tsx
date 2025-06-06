import { useCallback, useEffect } from "react";
import { Container, Row } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { CurrentStep, Participant, StudyStep, useStudy } from "rssa-api";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { participantState, studyStepState } from "../state/studyState";
import { StudyPageProps } from "./StudyPage.types";



const ScenarioPage: React.FC<StudyPageProps> = ({
	next,
	checkpointUrl,
	onStepUpdate
}) => {

	const participant: Participant | null = useRecoilValue(participantState);
	const studyStep: StudyStep | null = useRecoilValue(studyStepState);

	const { studyApi } = useStudy();
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		if (checkpointUrl !== '/' && checkpointUrl !== location.pathname) {
			navigate(checkpointUrl);
		}
	}, [checkpointUrl, location.pathname, navigate]);

	const handleNextBtn = useCallback(async () => {
		if (!participant || !studyStep) {
			console.error("Participant or study step is not defined.");
			return;
		}

		try {
			const nextRouteStep: StudyStep = await studyApi.post<CurrentStep, StudyStep>('study/step/next', {
				current_step_id: participant.current_step
			});
			onStepUpdate(nextRouteStep, participant, next);
			navigate(next);
		} catch (error) {
			console.error("Error getting next step:", error);
		}
	}, [studyApi, participant, onStepUpdate, next, navigate, studyStep]);

	return (
		<Container>
			<Row>
				<Header title={studyStep?.name} content={studyStep?.description} />
			</Row>
			<Row style={{ textAlign: "left" }}>
				<h3>Your task</h3>
				<p>
					Imagine you are in a movie critiquing class. One of your
					assignments is to reflect on your movie preferences and
					write an essay about your movie preferences and what you
					learned through reflecting on your movie preferences.
					The task of this study is to write personal reflection
					notes to help you write the essay. You will use a
					<span
						style={{
							fontWeight: "bold",
							marginLeft: "0.3rem",
							marginRight: "0.3rem"
						}}>
						“preference visualization system”
					</span>
					to help you reflect on
					your movie preferences; the tool visualizes your movie
					preferences and juxtaposes them against people who are
					similar to you.
				</p>
				<h4>
					Why should I care about understanding and developing my preferences?
				</h4>
				<p>
					We usually have a baseline understanding of movies that we
					like and dislike. Our movie-watching behavior tends to be
					motivated by our movie likes and dislikes. However, it is
					likely that we are yet to realize the nuances and the range
					of our movie preferences.
				</p>
				<p>
					Understanding your preferences can help you learn about the
					nuances of your movie preferences. It can also help you
					learn about the range of your movie preferences.
					Furthermore, understanding your preferences opens avenues
					for you to explore new movies that you have not considered
					before. This could help extend your preferences.
					Alternatively, exploring new movies can help you realize
					that you are not interested and help you refine your likes
					and dislikes.
				</p>

			</Row>
			<Row>
				<Footer callback={handleNextBtn} disabled={false}
					text="I read and understood the scenario." />
			</Row>
		</Container>
	)
}


export default ScenarioPage;