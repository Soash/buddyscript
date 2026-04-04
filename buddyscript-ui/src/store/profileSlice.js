import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchUserProfile = createAsyncThunk('profile/fetchUserProfile', async (userId, { rejectWithValue }) => {
    try {
        const response = await api.get(`users/${userId}/`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

export const updateProfile = createAsyncThunk('profile/updateProfile', async (formData, { rejectWithValue }) => {
    try {
        const response = await api.patch(`users/me/`, formData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

const profileSlice = createSlice({
    name: 'profile',
    initialState: {
        activeProfile: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserProfile.pending, (state) => {
                state.loading = true;
                state.activeProfile = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.activeProfile = action.payload;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default profileSlice.reducer;
