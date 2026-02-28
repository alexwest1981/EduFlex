import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    queue: [], // Array of queued mutations { url, method, body, headers, id, timestamp }
    isSyncing: false,
};

export const offlineQueueSlice = createSlice({
    name: 'offlineQueue',
    initialState,
    reducers: {
        enqueueAction: (state, action) => {
            // action.payload should be the request object
            state.queue.push({
                ...action.payload,
                id: Date.now().toString(),
                timestamp: new Date().toISOString()
            });
        },
        dequeueAction: (state, action) => {
            // Remove action by id
            state.queue = state.queue.filter(req => req.id !== action.payload);
        },
        clearQueue: (state) => {
            state.queue = [];
        },
        setSyncing: (state, action) => {
            state.isSyncing = action.payload;
        }
    },
});

export const { enqueueAction, dequeueAction, clearQueue, setSyncing } = offlineQueueSlice.actions;

export default offlineQueueSlice.reducer;
