import { atom } from 'recoil';
import { Participant, StudyStep } from 'rssa-api';

export const participantState = atom<Participant | null>({
	key: 'participantState',
	default: null
});

export const studyStepState = atom<StudyStep | null>({
	key: 'studyStepState',
	default: null
});