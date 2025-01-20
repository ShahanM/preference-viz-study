import { Participant, StudyStep } from 'rssa-api';


export interface StudyPageProps {
	next: string;
	checkpointUrl: string;
	participant: Participant;
	studyStep: StudyStep;
	updateCallback: (nextStep: StudyStep, referrer: string) => void;
	sizeWarning: boolean;
}


export interface InitStudyPageProps {
	next: string;
	checkpointUrl: string;
	studyStep: StudyStep;
	setNewParticipant: (newParticipant: Participant) => void;
	updateCallback: (nextStep: StudyStep, referrer: string) => void;
	sizeWarning: boolean;
}
