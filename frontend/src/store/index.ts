import { configureStore } from '@reduxjs/toolkit';
import boardReducer from './boardSlice';
import { api } from '../api/api';

export const store = configureStore({
    reducer: {
        board: boardReducer,
        [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
