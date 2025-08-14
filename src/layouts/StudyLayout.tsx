import { Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { StudyStep } from "rssa-api";
import Header from "../components/Header";
import { studyStepState } from "../states/studyState";


interface StudyLayoutProps {
}

const StudyLayout: React.FC<StudyLayoutProps> = ({
}) => {

	const studyStep: StudyStep | null = useRecoilValue(studyStepState);

	return (
		<Container>
			{studyStep && (
				<Header title={studyStep.title} content={studyStep.instructions} />
			)}
			{/* <Header title="Welcome" content="Welcome to the study on movie recommendation." /> */}
			<Outlet />
		</Container>
	)
}

export default StudyLayout;