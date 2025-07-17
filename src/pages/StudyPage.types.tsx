import { Participant, StudyStep } from 'rssa-api';

interface BaseStudyPageProps {
	next: string;
}

export interface StudyPageProps extends BaseStudyPageProps {
	// onStepUpdate: (nextStep: StudyStep, UpdatedParticipant: Participant, referrer: string) => void;
}


export interface InitStudyPageProps extends BaseStudyPageProps {
	// onStepUpdate: (nextStep: StudyStep, UpdatedParticipant: Participant, referrer: string) => void;
}


export interface FinalStudyPageProps extends BaseStudyPageProps {
	onStudyDone: () => void;
}