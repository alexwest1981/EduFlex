import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import { dequeueAction, setSyncing } from '../store/slices/offlineQueueSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { API_URL } from '../api/apiClient';

const SyncManager = () => {
    const dispatch = useDispatch();
    const offlineQueue = useSelector((state) => state?.offlineQueue);
    if (!offlineQueue) {
        console.warn('SyncManager: offlineQueue is undefined in global state.');
        return null;
    }
    const { queue, isSyncing } = offlineQueue;

    useEffect(() => {
        const processQueue = async () => {
            if (isSyncing || queue.length === 0) return;

            dispatch(setSyncing(true));
            const token = await AsyncStorage.getItem('userToken');

            for (const req of queue) {
                try {
                    console.log(`Syncing offline action: ${req.method} ${req.url}`);
                    const response = await fetch(`${API_URL}${req.url}`, {
                        method: req.method,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                            ...(req.headers || {})
                        },
                        body: req.body ? JSON.stringify(req.body) : undefined
                    });

                    if (response.ok) {
                        dispatch(dequeueAction(req.id));
                    } else if (response.status === 401) {
                        console.warn(`Unauthorized (401) syncing ${req.url}. Pausing sync to allow re-auth.`);
                        break; // Stop loop and wait for next trigger (e.g. after login/refresh)
                    } else if (response.status >= 400 && response.status < 500) {
                        console.error(`Client error (${response.status}) syncing ${req.url}, removing to prevent block.`);
                        dispatch(dequeueAction(req.id));
                    }
                } catch (error) {
                    console.error(`Failed to sync action to ${req.url}`, error);
                    break; // Network error, stop syncing loop
                }
            }

            dispatch(setSyncing(false));
        };

        const unsubscribe = NetInfo.addEventListener(state => {
            if (state.isConnected && state.isInternetReachable) {
                processQueue();
            }
        });

        return () => unsubscribe();
    }, [queue, isSyncing, dispatch]);

    return null;
};

export default SyncManager;
