import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchSuggestedPeople = createAsyncThunk('suggestions/fetchSuggestedPeople', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('users/suggested/');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

const suggestionsSlice = createSlice({
    name: 'suggestions',
    initialState: {
        people: [],
        loading: false,
        error: null,
    },
    reducers: {
        removeSuggestedPerson: (state, action) => {
            const userId = action.payload;
            state.people = (state.people || []).filter((p) => p?.id !== userId);
        },
        clearSuggestionsError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSuggestedPeople.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSuggestedPeople.fulfilled, (state, action) => {
                state.loading = false;
                state.people = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchSuggestedPeople.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { removeSuggestedPerson, clearSuggestionsError } = suggestionsSlice.actions;
export default suggestionsSlice.reducer;
