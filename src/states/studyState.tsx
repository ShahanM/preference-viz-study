import { atom } from 'recoil';
import { StudyStep } from 'rssa-api';
import { setItem, removeItem, getItem } from '../utils/localStorageUtils';

export const studyStepState = atom<StudyStep | null>({
	key: 'studyStepState',
	default: null,

	effects: [
		({ setSelf, onSet }) => {
			const storedData: StudyStep = getItem('studyStep');
			if (storedData) {
				try {
					// const parsedData: StudyStep = JSON.parse(storedData);
					setSelf(storedData);
				} catch (e) {
					console.error("Error parsing study step data from localStorage, clearing data:", e);
					removeItem('studyStep'); // Clear bad data
					setSelf(null);
				}
			}

			onSet(newValue => {
				if (newValue) {
					setItem('studyStep', newValue);
				} else {
					removeItem('studyStep');
				}
			});
		}
	],
});