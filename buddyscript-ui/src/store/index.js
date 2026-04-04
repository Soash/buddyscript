import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import feedReducer from './feedSlice';
import profileReducer from './profileSlice';
import suggestionsReducer from './suggestionsSlice';
import socialReducer from './socialSlice';
import connectionsReducer from './connectionsSlice';
import youMightLikeReducer from './youMightLikeSlice';
import friendsReducer from './friendsSlice';
import eventsReducer from './eventsSlice';
import peopleDirectoryReducer from './peopleDirectorySlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        feed: feedReducer,
        profile: profileReducer,
        suggestions: suggestionsReducer,
        social: socialReducer,
        connections: connectionsReducer,
        youMightLike: youMightLikeReducer,
        friends: friendsReducer,
        events: eventsReducer,
        peopleDirectory: peopleDirectoryReducer,
    },
});
