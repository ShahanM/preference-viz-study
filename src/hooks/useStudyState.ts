import { createContext, useContext, type Dispatch } from 'react';

export interface StudyState {
    isStepComplete: boolean;
    headerTitle: string;
    headerInstructions: string;
}

export const initialState: StudyState = {
    isStepComplete: false,
    headerTitle: '',
    headerInstructions: '',
};

type StudyAction =
    | { type: 'SET_COMPLETION'; payload: boolean }
    | { type: 'SET_HEADER_DATA'; payload: { title: string; instructions: string } }
    | { type: 'RESET_STATE' };

export const studyStateReducer = (state: StudyState, action: StudyAction): StudyState => {
    switch (action.type) {
        case 'SET_COMPLETION':
            return { ...state, isStepComplete: action.payload };
        case 'SET_HEADER_DATA':
            return {
                ...state,
                headerTitle: action.payload.title,
                headerInstructions: action.payload.instructions,
            };
        case 'RESET_STATE':
            return initialState;
        default:
            return state;
    }
};
interface StudyStateContextType {
    state: StudyState;
    dispatch: Dispatch<StudyAction>;
}

export const StudyStateContext = createContext<StudyStateContextType | undefined>(undefined);
export const useStudyState = () => {
    const context = useContext(StudyStateContext);
    if (context === undefined) {
        throw new Error('useStudyState must be used within a StudyStateProvider');
    }
    return context;
};
