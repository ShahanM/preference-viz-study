import { useEffect } from "react";
import { Container, Row } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { useRecoilValue, useResetRecoilState } from "recoil";
import { StudyStep } from "rssa-api";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { participantState, studyStepState } from "../state/studyState";
import { FinalStudyPageProps } from "./StudyPage.types";


const FinalPage: React.FC<FinalStudyPageProps> = ({
	next,
	checkpointUrl,
	onStudyDone
}) => {
	const studyStep: StudyStep | null = useRecoilValue(studyStepState);

	const resetParticipant = useResetRecoilState(participantState);
	const resetStudyStep = useResetRecoilState(studyStepState);

	const navigate = useNavigate();
	const location = useLocation();

	// Allowing for some simple checkpoint saving so the participant
	// can return to the page in case of a browser/system crash
	useEffect(() => {
		if (checkpointUrl !== '/' && checkpointUrl !== location.pathname) {
			navigate(checkpointUrl);
		}
	}, [checkpointUrl, location.pathname, navigate]);

	const handleNextBtn = () => {
		localStorage.clear();
		resetParticipant();
		resetStudyStep();
		navigate(next);

	}

	return (
		<Container>
			<Row>
				<Header title={studyStep?.name} content={studyStep?.description} />
			</Row>
			<Row style={{ textAlign: "left" }}>
				<p>
					You should be automatically redirected back to the Prolific
					page. If not, please click the link below.
				</p>
				<a href="#" style={{ textAlign: "center" }}>Some redirect url.</a>
				<p>
					Currently, this is a placeholder for testing. Please click
					the Done button below to finish the study.
				</p>
				<p>
					Note: If you do not click the Done button, you will not be
					able to run the study again on this browser without clearing
					browser data/cache.
				</p>
			</Row>
			<Row>
				<Footer callback={handleNextBtn} text={"Done"} />
			</Row>
		</Container>
	)
}

export default FinalPage;