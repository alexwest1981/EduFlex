import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiSlice } from './slices/apiSlice';
import offlineQueueReducer from './slices/offlineQueueSlice';

// Combine reducers
const rootReducer = combineReducers({
    [apiSlice.reducerPath]: apiSlice.reducer,
    offlineQueue: offlineQueueReducer,
});

// Setup Redux Persist config
const persistConfig = {
    key: 'root',
    version: 1,
    storage: AsyncStorage,
    // We don't want to persist the entire apiSlice cache identically, 
    // RTK Query handles its own cache optionally, but we can persist it all for offline capability
    whitelist: [apiSlice.reducerPath, 'offlineQueue'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat(apiSlice.middleware),
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);
