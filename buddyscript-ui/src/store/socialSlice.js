import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../api/axios';

export const toggleFollow = createAsyncThunk(
    'social/toggleFollow',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await api.post(`users/follow/${userId}/`);
            return { userId, ...response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const sendFriendRequest = createAsyncThunk(
    'social/sendFriendRequest',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await api.post(`users/friend-requests/send/${userId}/`);
            return { userId, request: response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const cancelFriendRequest = createAsyncThunk(
    'social/cancelFriendRequest',
    async ({ userId, requestId }, { rejectWithValue }) => {
        try {
            await api.post(`users/friend-requests/${requestId}/cancel/`);
            return { userId, requestId };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const acceptFriendRequest = createAsyncThunk(
    'social/acceptFriendRequest',
    async ({ userId, requestId }, { rejectWithValue }) => {
        try {
            await api.post(`users/friend-requests/${requestId}/accept/`);
            return { userId, requestId };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const declineFriendRequest = createAsyncThunk(
    'social/declineFriendRequest',
    async ({ userId, requestId }, { rejectWithValue }) => {
        try {
            await api.post(`users/friend-requests/${requestId}/decline/`);
            return { userId, requestId };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const unfriend = createAsyncThunk(
    'social/unfriend',
    async (userId, { rejectWithValue }) => {
        try {
            await api.post(`users/unfriend/${userId}/`);
            return { userId };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
    pending: {},
    followStatusByUserId: {},
    friendRequestSentTo: {},
    error: null,
};

const socialSlice = createSlice({
    name: 'social',
    initialState,
    reducers: {
        clearSocialError: (state) => {
            state.error = null;
        },
        clearFriendRequestSentToUser: (state, action) => {
            const userId = action.payload;
            if (userId == null) return;
            delete state.friendRequestSentTo[userId];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(toggleFollow.pending, (state, action) => {
                state.pending[`follow:${action.meta.arg}`] = true;
                state.error = null;
            })
            .addCase(toggleFollow.fulfilled, (state, action) => {
                state.pending[`follow:${action.payload.userId}`] = false;
                if (action.payload?.userId != null) {
                    state.followStatusByUserId[action.payload.userId] = action.payload.status;
                }
            })
            .addCase(toggleFollow.rejected, (state, action) => {
                state.pending[`follow:${action.meta.arg}`] = false;
                state.error = action.payload;
            })
            .addCase(sendFriendRequest.pending, (state, action) => {
                state.pending[`friendRequest:${action.meta.arg}`] = true;
                state.error = null;
            })
            .addCase(sendFriendRequest.fulfilled, (state, action) => {
                state.pending[`friendRequest:${action.payload.userId}`] = false;
                if (action.payload?.userId != null) {
                    const requestId = action.payload?.request?.id;
                    state.friendRequestSentTo[action.payload.userId] = requestId || true;
                }
            })
            .addCase(sendFriendRequest.rejected, (state, action) => {
                state.pending[`friendRequest:${action.meta.arg}`] = false;
                state.error = action.payload;
            })
            .addCase(cancelFriendRequest.pending, (state, action) => {
                const { userId } = action.meta.arg || {};
                state.pending[`cancelFriendRequest:${userId}`] = true;
                state.error = null;
            })
            .addCase(cancelFriendRequest.fulfilled, (state, action) => {
                const { userId } = action.payload || {};
                state.pending[`cancelFriendRequest:${userId}`] = false;
                if (userId != null) {
                    delete state.friendRequestSentTo[userId];
                }
            })
            .addCase(cancelFriendRequest.rejected, (state, action) => {
                const { userId } = action.meta.arg || {};
                state.pending[`cancelFriendRequest:${userId}`] = false;
                state.error = action.payload;
            })
            .addCase(acceptFriendRequest.pending, (state, action) => {
                const { requestId } = action.meta.arg || {};
                state.pending[`acceptFriendRequest:${requestId}`] = true;
                state.error = null;
            })
            .addCase(acceptFriendRequest.fulfilled, (state, action) => {
                const { requestId } = action.payload || {};
                state.pending[`acceptFriendRequest:${requestId}`] = false;
            })
            .addCase(acceptFriendRequest.rejected, (state, action) => {
                const { requestId } = action.meta.arg || {};
                state.pending[`acceptFriendRequest:${requestId}`] = false;
                state.error = action.payload;
            })
            .addCase(declineFriendRequest.pending, (state, action) => {
                const { requestId } = action.meta.arg || {};
                state.pending[`declineFriendRequest:${requestId}`] = true;
                state.error = null;
            })
            .addCase(declineFriendRequest.fulfilled, (state, action) => {
                const { requestId } = action.payload || {};
                state.pending[`declineFriendRequest:${requestId}`] = false;
            })
            .addCase(declineFriendRequest.rejected, (state, action) => {
                const { requestId } = action.meta.arg || {};
                state.pending[`declineFriendRequest:${requestId}`] = false;
                state.error = action.payload;
            })
            .addCase(unfriend.pending, (state, action) => {
                state.pending[`unfriend:${action.meta.arg}`] = true;
                state.error = null;
            })
            .addCase(unfriend.fulfilled, (state, action) => {
                state.pending[`unfriend:${action.payload.userId}`] = false;
            })
            .addCase(unfriend.rejected, (state, action) => {
                state.pending[`unfriend:${action.meta.arg}`] = false;
                state.error = action.payload;
            });
    },
});

export const { clearSocialError, clearFriendRequestSentToUser } = socialSlice.actions;
export default socialSlice.reducer;
