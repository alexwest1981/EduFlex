import NetInfo from '@react-native-community/netinfo';
import { enqueueAction } from './offlineQueueSlice';

const rawBaseQuery = fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: async (headers) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

const baseQueryWithOffline = async (args, api, extraOptions) => {
    const currentState = await NetInfo.fetch();
    const isOffline = !currentState.isConnected || !currentState.isInternetReachable;

    // For mutations (POST/PUT/DELETE), if offline, enqueue and return a mock success
    if (isOffline && typeof args !== 'string' && args.method && args.method !== 'GET') {
        console.log(`[Offline] Enqueueing mutation: ${args.method} ${args.url}`);
        api.dispatch(enqueueAction({
            url: args.url,
            method: args.method,
            body: args.body,
            headers: args.headers
        }));

        // Return a mock success so the UI doesn't break
        return { data: { offline: true, message: 'Action queued for sync' } };
    }

    const result = await rawBaseQuery(args, api, extraOptions);
    return result;
};

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithOffline,
    tagTypes: ['User', 'Course', 'Progress', 'GlobalLibrary', 'Material'],
    endpoints: (builder) => ({
        getUser: builder.query({
            query: () => '/users/me',
            providesTags: ['User'],
        }),
        getPoints: builder.query({
            query: () => '/gamification/points/my',
            providesTags: ['User'],
        }),
        getAiInsight: builder.query({
            query: () => '/ai-coach/student',
        }),
        getGlobalLibrary: builder.query({
            query: () => '/global-library',
            providesTags: ['GlobalLibrary'],
        }),
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
        getQuizById: builder.query({
            query: (id) => `/quizzes/${id}`,
        }),
        getQuizzesByCourse: builder.query({
            query: (courseId) => `/quizzes/course/${courseId}`,
        }),
        getSystemHealth: builder.query({
            query: () => '/actuator/health',
        }),
        getDataIntegrity: builder.query({
            query: () => '/admin/health/data-integrity',
        }),
        updateLessonProgress: builder.mutation({
            query: ({ materialId, status }) => ({
                url: `/progress/material/${materialId}`,
                method: 'POST',
                body: { status },
            }),
            invalidatesTags: ['Progress'],
        }),
        getDueFlashcards: builder.query({
            query: () => '/eduai/review/due',
            providesTags: ['Flashcard'],
        }),
        submitFlashcardReview: builder.mutation({
            query: (data) => ({
                url: '/eduai/review/submit',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Flashcard'],
        }),
        askAiTutor: builder.mutation({
            query: (data) => ({
                url: '/ai-tutor/chat',
                method: 'POST',
                body: data,
            }),
        }),
        getHealthMetrics: builder.query({
            query: () => '/elevhalsa/metrics',
        }),
        getHealthBookings: builder.query({
            query: () => '/elevhalsa/bookings/my',
        }),
        getEbookById: builder.query({
            query: (id) => `/ebooks/${id}`,
        }),
        getEbookProgress: builder.query({
            query: (id) => `/ebooks/${id}/progress`,
        }),
        saveEbookProgress: builder.mutation({
            query: ({ id, data }) => ({
                url: `/ebooks/${id}/progress`,
                method: 'POST',
                body: data,
            }),
        }),
        getAllUsers: builder.query({
            query: () => '/users',
            transformResponse: (response) => response.content || response,
            providesTags: ['User'],
        }),
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `/users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['User'],
        }),
        updatePushToken: builder.mutation({
            query: (token) => ({
                url: '/users/update-push-token',
                method: 'POST',
                body: { token },
            }),
        }),
    }),
});

export const {
    useGetUserQuery,
    useGetPointsQuery,
    useGetAiInsightQuery,
    useGetCoursesQuery,
    useGetGlobalLibraryQuery,
    useGetCourseByIdQuery,
    useGetCourseMaterialsQuery,
    useGetQuizByIdQuery,
    useGetQuizzesByCourseQuery,
    useUpdateLessonProgressMutation,
    useGetSystemHealthQuery,
    useGetDataIntegrityQuery,
    useGetDueFlashcardsQuery,
    useSubmitFlashcardReviewMutation,
    useAskAiTutorMutation,
    useGetHealthMetricsQuery,
    useGetHealthBookingsQuery,
    useGetEbookByIdQuery,
    useGetEbookProgressQuery,
    useSaveEbookProgressMutation,
    useGetAllUsersQuery,
    useDeleteUserMutation,
    useUpdatePushTokenMutation,
} = apiSlice;
