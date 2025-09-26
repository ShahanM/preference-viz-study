import { combineReducers } from '@reduxjs/toolkit';
import participantReducer from '../slices/participantSlice';
import studyReducer from '../slices/studySlice';
import studyStepReducer from '../slices/studyStepSlice';
import navigationReducer from '../slices/navigationSlice';

const rootReducer = combineReducers({
    participant: participantReducer,
    study: studyReducer,
    step: studyStepReducer,
    urlCache: navigationReducer,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
