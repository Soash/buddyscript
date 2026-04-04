import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';
import { updateProfile } from './profileSlice';
import { jwtDecode } from "jwt-decode";

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const response = await api.post('auth/login/', credentials);
        const { access, refresh } = response.data;
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        const decoded = jwtDecode(access);
        decoded.id = decoded.user_id;
        return decoded;
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
    try {
        const response = await api.post('auth/register/', userData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

// ⭐ NEW: This function asks Django for the full user profile!
// Note: Adjust 'users/me/' to whatever your Django URL is for getting the current logged-in user.
export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('users/me/'); 
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

const getInitialUser = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    try {
        const decoded = jwtDecode(token);
        decoded.id = decoded.user_id;
        return decoded;
    } catch {
        return null;
    }
};

const initialState = {
    user: getInitialUser(),
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            state.user = null;
            window.location.href = '/login';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload; // This is just the basic token data
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // ⭐ NEW: Handle the full data arriving from Django
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                if (state.user) {
                    // This combines the token data with the new database data (including the image URL!)
                    state.user = { ...state.user, ...action.payload };
                }
            })

            .addCase(updateProfile.fulfilled, (state, action) => {
                if (state.user) {
                    state.user = { ...state.user, ...action.payload };
                    localStorage.setItem('user', JSON.stringify(state.user));
                }
            });
    }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;