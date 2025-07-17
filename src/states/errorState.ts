import { atom } from "recoil";

export const fetchErrorState = atom<boolean>({
	key: 'fetchErrorState',
	default: false,
});

export const studyErrorState = atom<boolean>({
	key: 'studyErrorState',
	default: false,
});

export const retryAttemptState = atom<number>({
	key: 'retryAttemptState',
	default: 0,
});


export const triggerFetchState = atom<number>({
	key: 'triggerFetchState',
	default: 0,
});