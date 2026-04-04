import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchEvents = createAsyncThunk('events/fetchEvents', async (_, thunkAPI) => {
    try {
        const res = await api.get('events/');
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
});

export const createEvent = createAsyncThunk('events/createEvent', async (payload, thunkAPI) => {
    try {
        const res = await api.post('events/', payload);
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
});

export const updateEvent = createAsyncThunk('events/updateEvent', async ({ eventId, payload }, thunkAPI) => {
    try {
        const res = await api.patch(`events/${eventId}/`, payload);
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
});

export const deleteEvent = createAsyncThunk('events/deleteEvent', async ({ eventId }, thunkAPI) => {
    try {
        await api.delete(`events/${eventId}/`);
        return { eventId };
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
});

export const setEventRsvp = createAsyncThunk('events/setEventRsvp', async ({ eventId, status }, thunkAPI) => {
    try {
        if (status === null) {
            await api.delete(`events/${eventId}/rsvp/`);
            return { eventId, status: null };
        }

        const res = await api.post(`events/${eventId}/rsvp/`, { status });
        return { eventId, status: res.data?.status ?? status };
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
});

const eventsSlice = createSlice({
    name: 'events',
    initialState: {
        items: [],
        loading: false,
        error: null,
        pending: {},
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchEvents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEvents.fulfilled, (state, action) => {
                state.loading = false;
                state.items = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchEvents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to load events';
            })

            .addCase(createEvent.pending, (state) => {
                state.pending['create'] = true;
                state.error = null;
            })
            .addCase(createEvent.fulfilled, (state, action) => {
                state.pending['create'] = false;
                if (action.payload) state.items = [action.payload, ...state.items];
            })
            .addCase(createEvent.rejected, (state, action) => {
                state.pending['create'] = false;
                state.error = action.payload || 'Failed to create event';
            })

            .addCase(updateEvent.pending, (state, action) => {
                const { eventId } = action.meta.arg;
                state.pending[`update:${eventId}`] = true;
                state.error = null;
            })
            .addCase(updateEvent.fulfilled, (state, action) => {
                const updated = action.payload;
                const updatedId = updated?.id;
                state.pending[`update:${updatedId}`] = false;
                const idx = state.items.findIndex((e) => Number(e?.id) === Number(updatedId));
                if (idx !== -1) state.items[idx] = updated;
            })
            .addCase(updateEvent.rejected, (state, action) => {
                const { eventId } = action.meta.arg;
                state.pending[`update:${eventId}`] = false;
                state.error = action.payload || 'Failed to update event';
            })

            .addCase(deleteEvent.pending, (state, action) => {
                const { eventId } = action.meta.arg;
                state.pending[`delete:${eventId}`] = true;
                state.error = null;
            })
            .addCase(deleteEvent.fulfilled, (state, action) => {
                const { eventId } = action.payload;
                state.pending[`delete:${eventId}`] = false;
                state.items = state.items.filter((e) => Number(e?.id) !== Number(eventId));
            })
            .addCase(deleteEvent.rejected, (state, action) => {
                const { eventId } = action.meta.arg;
                state.pending[`delete:${eventId}`] = false;
                state.error = action.payload || 'Failed to delete event';
            })

            .addCase(setEventRsvp.pending, (state, action) => {
                const { eventId } = action.meta.arg;
                state.pending[`rsvp:${eventId}`] = true;
                state.error = null;
            })
            .addCase(setEventRsvp.fulfilled, (state, action) => {
                const { eventId, status } = action.payload;
                state.pending[`rsvp:${eventId}`] = false;
                const event = state.items.find((e) => Number(e?.id) === Number(eventId));
                if (event) {
                    const prevStatus = event.my_rsvp_status;
                    event.my_rsvp_status = status;

                    const prevWasGoing = prevStatus === 'going';
                    const nextIsGoing = status === 'going';

                    if (prevWasGoing !== nextIsGoing) {
                        const currentCount = Number(event.going_count) || 0;
                        event.going_count = Math.max(0, currentCount + (nextIsGoing ? 1 : -1));
                    }
                }
            })
            .addCase(setEventRsvp.rejected, (state, action) => {
                const { eventId } = action.meta.arg;
                state.pending[`rsvp:${eventId}`] = false;
                state.error = action.payload || 'Failed to set RSVP';
            });
    },
});

export default eventsSlice.reducer;
