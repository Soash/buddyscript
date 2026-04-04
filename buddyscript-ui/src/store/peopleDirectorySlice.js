import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../api/axios';
import {
    acceptFriendRequest,
    cancelFriendRequest,
    declineFriendRequest,
    sendFriendRequest,
    toggleFollow,
    unfriend,
} from './socialSlice';

export const fetchPeopleDirectory = createAsyncThunk(
    'peopleDirectory/fetchPeopleDirectory',
    async ({ q } = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('users/directory/', {
                params: q ? { q } : undefined,
            });
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const patchUser = (state, userId, patch) => {
    if (!Array.isArray(state.items) || userId == null) return;
    const idx = state.items.findIndex((u) => Number(u?.id) === Number(userId));
    if (idx === -1) return;
    state.items[idx] = { ...state.items[idx], ...patch };
};

const peopleDirectorySlice = createSlice({
    name: 'peopleDirectory',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearPeopleDirectoryError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPeopleDirectory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPeopleDirectory.fulfilled, (state, action) => {
                state.loading = false;
                state.items = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchPeopleDirectory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(toggleFollow.fulfilled, (state, action) => {
                const userId = action.payload?.userId;
                const status = action.payload?.status;
                patchUser(state, userId, { is_following: status === 'followed' });
            })
            .addCase(sendFriendRequest.fulfilled, (state, action) => {
                const userId = action.payload?.userId;
                const requestId = action.payload?.request?.id || null;
                patchUser(state, userId, {
                    outgoing_request_id: requestId,
                    incoming_request_id: null,
                    is_friend: false,
                });
            })
            .addCase(cancelFriendRequest.fulfilled, (state, action) => {
                const userId = action.payload?.userId;
                patchUser(state, userId, { outgoing_request_id: null });
            })
            .addCase(acceptFriendRequest.fulfilled, (state, action) => {
                const userId = action.payload?.userId;
                patchUser(state, userId, {
                    is_friend: true,
                    incoming_request_id: null,
                    outgoing_request_id: null,
                });
            })
            .addCase(declineFriendRequest.fulfilled, (state, action) => {
                const userId = action.payload?.userId;
                patchUser(state, userId, { incoming_request_id: null });
            })
            .addCase(unfriend.fulfilled, (state, action) => {
                const userId = action.payload?.userId;
                patchUser(state, userId, {
                    is_friend: false,
                    incoming_request_id: null,
                    outgoing_request_id: null,
                });
            });
    },
});

export const { clearPeopleDirectoryError } = peopleDirectorySlice.actions;
export default peopleDirectorySlice.reducer;
