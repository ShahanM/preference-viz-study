import type { Middleware } from '@reduxjs/toolkit';
import { getItem, removeItem, setItem } from '../utils/localStorageUtils';
import { setParticipant } from '../slices/participantSlice';
import type { RootState } from '../store/rootReducer';

export const localStorageMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
    const result = next(action);

    if (setParticipant.match(action)) {
        const participant = (store.getState() as RootState).participant.participant;
        if (participant) {
            setItem('participant', participant);
        } else {
            removeItem('participant');
        }
    }
    return result;
};

export const loadParticipantFromStorage = () => (dispatch: any) => {
    const storedData = getItem('participant');
    if (storedData) {
        try {
            dispatch(setParticipant(storedData));
        } catch (e) {
            console.error('Error parsing participant data from localStorage, clearing data:', e);
            removeItem('participant');
            dispatch(setParticipant(null));
        }
    }
};
