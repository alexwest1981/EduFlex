import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { API_URL } from '../../api/apiClient';

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
    tagTypes: ['User', 'Course', 'Progress', 'GlobalLibrary', 'Material'],
    endpoints: (builder) => ({
        getCourses: builder.query({
            query: () => '/courses/my',
            providesTags: ['Course'],
        }),
        getCourseById: builder.query({
            query: (id) => `/courses/${id}`,
            providesTags: (result, error, id) => [{ type: 'Course', id }],
        }),
        getCourseMaterials: builder.query({
            query: (courseId) => `/courses/${courseId}/materials`,
            providesTags: (result, error, courseId) =>
                result
                    ? [...result.map(({ id }) => ({ type: 'Material', id })), { type: 'Material', id: 'LIST' }]
                    : [{ type: 'Material', id: 'LIST' }],
        }),
        updateLessonProgress: builder.mutation({
            query: ({ materialId, status }) => ({
                url: `/progress/material/${materialId}`,
                method: 'POST',
                body: { status },
            }),
            invalidatesTags: ['Progress'],
        }),
        // Mutations will be added here
    }),
});

export const {
    useGetUserQuery,
    useGetCoursesQuery,
    useGetGlobalLibraryQuery,
    useGetCourseByIdQuery,
    useGetCourseMaterialsQuery,
    useUpdateLessonProgressMutation
} = apiSlice;
