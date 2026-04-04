import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../api/axios';
import {
    cancelFriendRequest,
    clearFriendRequestSentToUser,
    sendFriendRequest,
    toggleFollow,
} from './socialSlice';

export const fetchIncomingFriendRequests = createAsyncThunk(
    'connections/fetchIncomingFriendRequests',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('users/friend-requests/incoming/');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchSentFriendRequests = createAsyncThunk(
    'connections/fetchSentFriendRequests',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('users/friend-requests/sent/');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchFollowing = createAsyncThunk(
    'connections/fetchFollowing',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('users/following/');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const declineIncomingFriendRequest = createAsyncThunk(
    'connections/declineIncomingFriendRequest',
    async (requestId, { rejectWithValue }) => {
        try {
            await api.post(`users/friend-requests/${requestId}/decline/`);
            return { requestId };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const acceptIncomingFriendRequest = createAsyncThunk(
    'connections/acceptIncomingFriendRequest',
    async (requestId, { rejectWithValue }) => {
        try {
            await api.post(`users/friend-requests/${requestId}/accept/`);
            return { requestId };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const cancelSentFriendRequest = createAsyncThunk(
    'connections/cancelSentFriendRequest',
    async ({ requestId, userId }, { dispatch, rejectWithValue }) => {
        try {
            await api.post(`users/friend-requests/${requestId}/cancel/`);
            if (userId != null) {
                dispatch(clearFriendRequestSentToUser(userId));
            }
            return { requestId, userId };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const unfollowUser = createAsyncThunk(
    'connections/unfollowUser',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await api.post(`users/follow/${userId}/`);
            return { userId, ...response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
    incoming: [],
    sent: [],
    following: [],
    loading: {
        incoming: false,
        sent: false,
        following: false,
    },
    pending: {},
    error: null,
};

const connectionsSlice = createSlice({
    name: 'connections',
    initialState,
    reducers: {
        clearConnectionsError: (state) => {
            state.error = null;
        },
        upsertFollowingUser: (state, action) => {
            const user = action.payload;
            const userId = user?.id;
            if (userId == null) return;

            const exists = state.following.some((u) => u?.id === userId);
            if (exists) {
                state.following = state.following.map((u) => (u?.id === userId ? { ...u, ...user } : u));
                return;
            }
            state.following = [user, ...state.following];
        },
        removeFollowingUser: (state, action) => {
            const userId = action.payload;
            if (userId == null) return;
            state.following = state.following.filter((u) => u?.id !== userId);
        },
    },
    extraReducers: (builder) => {
        builder
            // Keep Sent Requests tab in sync with actions triggered outside this slice
            // (e.g., sending/canceling from Suggested People in LeftSidebar).
            .addCase(sendFriendRequest.fulfilled, (state, action) => {
                const request = action.payload?.request;
                if (!request?.id) return;
                const exists = state.sent.some((r) => r.id === request.id);
                if (!exists) {
                    state.sent = [request, ...state.sent];
                }
            })
            .addCase(cancelFriendRequest.fulfilled, (state, action) => {
                const requestId = action.payload?.requestId;
                if (!requestId) return;
                state.sent = state.sent.filter((r) => r.id !== requestId);
            })
            .addCase(toggleFollow.fulfilled, (state, action) => {
                const userId = action.payload?.userId;
                const status = action.payload?.status;
                if (!userId) return;
                if (status === 'unfollowed') {
                    state.following = state.following.filter((u) => u.id !== userId);
                }
            })
            .addCase(fetchIncomingFriendRequests.pending, (state) => {
                state.loading.incoming = true;
                state.error = null;
            })
            .addCase(fetchIncomingFriendRequests.fulfilled, (state, action) => {
                state.loading.incoming = false;
                state.incoming = action.payload || [];
            })
            .addCase(fetchIncomingFriendRequests.rejected, (state, action) => {
                state.loading.incoming = false;
                state.error = action.payload;
            })

            .addCase(fetchSentFriendRequests.pending, (state) => {
                state.loading.sent = true;
                state.error = null;
            })
            .addCase(fetchSentFriendRequests.fulfilled, (state, action) => {
                state.loading.sent = false;
                state.sent = action.payload || [];
            })
            .addCase(fetchSentFriendRequests.rejected, (state, action) => {
                state.loading.sent = false;
                state.error = action.payload;
            })

            .addCase(fetchFollowing.pending, (state) => {
                state.loading.following = true;
                state.error = null;
            })
            .addCase(fetchFollowing.fulfilled, (state, action) => {
                state.loading.following = false;
                state.following = action.payload || [];
            })
            .addCase(fetchFollowing.rejected, (state, action) => {
                state.loading.following = false;
                state.error = action.payload;
            })

            .addCase(declineIncomingFriendRequest.pending, (state, action) => {
                state.pending[`decline:${action.meta.arg}`] = true;
                state.error = null;
            })
            .addCase(declineIncomingFriendRequest.fulfilled, (state, action) => {
                state.pending[`decline:${action.payload.requestId}`] = false;
                state.incoming = state.incoming.filter((r) => r.id !== action.payload.requestId);
            })
            .addCase(declineIncomingFriendRequest.rejected, (state, action) => {
                state.pending[`decline:${action.meta.arg}`] = false;
                state.error = action.payload;
            })

            .addCase(acceptIncomingFriendRequest.pending, (state, action) => {
                state.pending[`accept:${action.meta.arg}`] = true;
                state.error = null;
            })
            .addCase(acceptIncomingFriendRequest.fulfilled, (state, action) => {
                state.pending[`accept:${action.payload.requestId}`] = false;
                state.incoming = state.incoming.filter((r) => r.id !== action.payload.requestId);
            })
            .addCase(acceptIncomingFriendRequest.rejected, (state, action) => {
                state.pending[`accept:${action.meta.arg}`] = false;
                state.error = action.payload;
            })

            .addCase(cancelSentFriendRequest.pending, (state, action) => {
                const requestId = action.meta.arg?.requestId;
                state.pending[`cancel:${requestId}`] = true;
                state.error = null;
            })
            .addCase(cancelSentFriendRequest.fulfilled, (state, action) => {
                state.pending[`cancel:${action.payload.requestId}`] = false;
                state.sent = state.sent.filter((r) => r.id !== action.payload.requestId);
            })
            .addCase(cancelSentFriendRequest.rejected, (state, action) => {
                const requestId = action.meta.arg?.requestId;
                state.pending[`cancel:${requestId}`] = false;
                state.error = action.payload;
            })

            .addCase(unfollowUser.pending, (state, action) => {
                state.pending[`unfollow:${action.meta.arg}`] = true;
                state.error = null;
            })
            .addCase(unfollowUser.fulfilled, (state, action) => {
                state.pending[`unfollow:${action.payload.userId}`] = false;
                // Follow toggle returns either 'followed' or 'unfollowed'.
                if (action.payload.status === 'unfollowed') {
                    state.following = state.following.filter((u) => u.id !== action.payload.userId);
                }
            })
            .addCase(unfollowUser.rejected, (state, action) => {
                state.pending[`unfollow:${action.meta.arg}`] = false;
                state.error = action.payload;
            });
    },
});

export const { clearConnectionsError, upsertFollowingUser, removeFollowingUser } = connectionsSlice.actions;
export default connectionsSlice.reducer;
