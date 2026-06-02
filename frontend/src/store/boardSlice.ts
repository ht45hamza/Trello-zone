import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Board {
    _id: string;
    title: string;
    description?: string;
    background_color: string;
    background_image?: string;
    owner: string;
    members: string[];
    starredBy?: string[];
    createdAt: string;
    updatedAt: string;
}

interface BoardState {
    boards: Board[];
    currentBoard: Board | null;
    loading: boolean;
    error: string | null;
}

const initialState: BoardState = {
    boards: [],
    currentBoard: null,
    loading: false,
    error: null,
};

const boardSlice = createSlice({
    name: 'board',
    initialState,
    reducers: {
        setBoards: (state, action: PayloadAction<Board[]>) => {
            state.boards = action.payload;
            state.loading = false;
        },
        setCurrentBoard: (state, action: PayloadAction<Board | null>) => {
            state.currentBoard = action.payload;
            state.loading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
});

export const { setBoards, setCurrentBoard, setLoading, setError } = boardSlice.actions;
export default boardSlice.reducer;
