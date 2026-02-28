import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080/api' : 'http://localhost:8080/api';

const baseQuery = fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: async (headers) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQuery,
    tagTypes: ['User', 'Course', 'Progress', 'GlobalLibrary'],
    endpoints: (builder) => ({
        getUser: builder.query({
            query: () => '/user/me',
            providesTags: ['User'],
        }),
        getCourses: builder.query({
            query: () => '/courses/all',
            providesTags: ['Course'],
        }),
        getGlobalLibrary: builder.query({
            query: () => '/globallibrary/resources',
            providesTags: ['GlobalLibrary'],
        }),
        // Mutations will be added here
    }),
});

export const { useGetUserQuery, useGetCoursesQuery, useGetGlobalLibraryQuery } = apiSlice;
