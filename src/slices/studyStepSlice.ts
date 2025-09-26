import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { StudyStep } from 'rssa-api';

interface StudyStepState {
    step: StudyStep | null;
}

const initialState: StudyStepState = {
    step: null,
};

export const stepSlice = createSlice({
    name: 'step',
    initialState,
    reducers: {
        setStudyStep: (state, action: PayloadAction<StudyStep | null>) => {
            state.step = action.payload;
        },
        clearStudyStep: (state) => {
            state.step = null;
        },
    },
});

export const { setStudyStep, clearStudyStep } = stepSlice.actions;
export const selectStudyStep = (state: { step: StudyStepState }) => state.step.step;
export default stepSlice.reducer;
