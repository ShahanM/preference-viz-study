import { Participant, StudyStep } from 'rssa-api';

interface BaseStudyPageProps {
	next: string;
	checkpointUrl: string;
	sizeWarning: boolean;
}

export interface StudyPageProps extends BaseStudyPageProps {
	onStepUpdate: (nextStep: StudyStep, UpdatedParticipant: Participant, referrer: string) => void;
}


export interface InitStudyPageProps extends BaseStudyPageProps {
	// next: string;
	// checkpointUrl: string;
	setNewParticipant: (newParticipant: Participant) => void;
	onStepUpdate: (nextStep: StudyStep, UpdatedParticipant: Participant, referrer: string) => void;
	// sizeWarning: boolean;
}


export interface FinalStudyPageProps extends BaseStudyPageProps {
	onStudyDone: () => void;
}