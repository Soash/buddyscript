import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchFriends = createAsyncThunk(
    'friends/fetchFriends',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('users/friends/');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const unfriendUser = createAsyncThunk(
    'friends/unfriendUser',
    async (userId, { rejectWithValue }) => {
        try {
            await api.post(`users/unfriend/${userId}/`);
            return { userId };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const friendsSlice = createSlice({
    name: 'friends',
    initialState: {
        items: [],
        loading: false,
        pending: {},
        error: null,
    },
    reducers: {
        clearFriendsError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFriends.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFriends.fulfilled, (state, action) => {
                state.loading = false;
                state.items = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchFriends.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(unfriendUser.pending, (state, action) => {
                state.pending[`unfriend:${action.meta.arg}`] = true;
                state.error = null;
            })
            .addCase(unfriendUser.fulfilled, (state, action) => {
                const userId = action.payload?.userId;
                state.pending[`unfriend:${userId}`] = false;
                if (userId != null) {
                    state.items = (state.items || []).filter((u) => u?.id !== userId);
                }
            })
            .addCase(unfriendUser.rejected, (state, action) => {
                state.pending[`unfriend:${action.meta.arg}`] = false;
                state.error = action.payload;
            });
    },
});

export const { clearFriendsError } = friendsSlice.actions;
export default friendsSlice.reducer;
