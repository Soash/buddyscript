import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchYouMightLike = createAsyncThunk(
    'youMightLike/fetchYouMightLike',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const excludeId = state?.youMightLike?.person?.id;
            const response = await api.get('users/you-might-like/', {
                params: excludeId ? { exclude_id: excludeId } : undefined,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const youMightLikeSlice = createSlice({
    name: 'youMightLike',
    initialState: {
        person: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearYouMightLikeError: (state) => {
            state.error = null;
        },
        clearYouMightLike: (state) => {
            state.person = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchYouMightLike.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchYouMightLike.fulfilled, (state, action) => {
                state.loading = false;
                state.person = action.payload || null;
            })
            .addCase(fetchYouMightLike.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearYouMightLikeError, clearYouMightLike } = youMightLikeSlice.actions;
export default youMightLikeSlice.reducer;
