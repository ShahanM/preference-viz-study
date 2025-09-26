import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Study } from 'rssa-api';

interface StudyState {
    study: Study | null;
}

const initialState: StudyState = {
    study: null,
};

export const studySlice = createSlice({
    name: 'study',
    initialState,
    reducers: {
        setStudy: (state, action: PayloadAction<Study | null>) => {
            state.study = action.payload;
        },
        clearStudy: (state) => {
            state.study = null;
        },
    },
});

export const { setStudy, clearStudy } = studySlice.actions;
export const selectStudy = (state: { study: StudyState }) => state.study.study;
export default studySlice.reducer;
