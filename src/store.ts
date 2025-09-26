import { configureStore } from '@reduxjs/toolkit';
import { localStorageMiddleware, loadParticipantFromStorage } from './middleware/localStorageMiddleware';
import rootReducer from './store/rootReducer';

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(localStorageMiddleware),
});

store.dispatch(loadParticipantFromStorage() as any);

export type AppDispatch = typeof store.dispatch;
