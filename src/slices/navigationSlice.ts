import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const initialState = { urlCache: '/' };
export const navigationSlice = createSlice({
    name: 'navigation',
    initialState,
    reducers: {
        setUrlCache: (state, action: PayloadAction<string>) => {
            state.urlCache = action.payload;
        },
    },
});
export const { setUrlCache } = navigationSlice.actions;
export const cachedUrl = (state: { urlCache: { urlCache: string } }) => state.urlCache.urlCache;
export default navigationSlice.reducer;
