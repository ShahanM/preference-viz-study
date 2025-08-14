
interface BaseStudyPageProps {
	next: string;
}

export interface StudyPageProps extends BaseStudyPageProps {
	navigateToNextStep: (next: string) => void;
}


// export interface InitStudyPageProps extends BaseStudyPageProps {
	// onStepUpdate: (nextStep: StudyStep, UpdatedParticipant: Participant, referrer: string) => void;
	// navigateToNextStep: (next: string) => void;
// }


export interface FinalStudyPageProps extends BaseStudyPageProps {
	onStudyDone: () => void;
}