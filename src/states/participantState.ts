import { atom } from "recoil";
import { Participant } from "rssa-api";
import { getItem, removeItem, setItem } from "../utils/localStorageUtils";


export const participantState = atom<Participant | null>({
	key: 'participantState',
	default: null,

	effects: [
		({ setSelf, onSet }) => {
			const storedData: Participant | null = getItem('participant');
			if (storedData) {
				try {
					setSelf(storedData);
				} catch (e) {
					console.error("Error parsing participant data from localStorage, clearing data:", e);
					removeItem('participant'); // Clear bad data
					setSelf(null);
				}
			}

			onSet(newValue => {
				if (newValue) {
					setItem('participant', newValue);
				} else {
					removeItem('participant');
				}
			});
		},
	],
});