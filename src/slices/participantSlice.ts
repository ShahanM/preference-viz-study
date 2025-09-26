import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Participant } from 'rssa-api';

interface ParticipantState {
    participant: Participant | null;
}

const initialState: ParticipantState = {
    participant: null,
};

export const participantSlice = createSlice({
    name: 'participant',
    initialState,
    reducers: {
        setParticipant: (state, action: PayloadAction<Participant | null>) => {
            state.participant = action.payload;
        },
        clearParticipant: (state) => {
            state.participant = null;
        },
    },
});

export const { setParticipant, clearParticipant } = participantSlice.actions;
export const selectParticipant = (state: { participant: ParticipantState }) => state.participant.participant;
export default participantSlice.reducer;
