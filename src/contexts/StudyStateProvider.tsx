import { useReducer, type ReactNode } from 'react';
import { initialState, StudyStateContext, studyStateReducer } from '../hooks/useStudyState';

export const StudyStateProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(studyStateReducer, initialState);

    const value = { state, dispatch };

    return <StudyStateContext.Provider value={value}>{children}</StudyStateContext.Provider>;
};
