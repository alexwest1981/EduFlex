const API_BASE = 'http://127.0.0.1:8080/api';

const getHeaders = (contentType = 'application/json') => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    if (contentType) headers['Content-Type'] = contentType;
    return headers;
};

const handleResponse = async (res) => {
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP Error: ${res.status}`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
};

export const api = {
    auth: {
        login: (credentials) => fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) }).then(handleResponse),
    },

    forum: {
        getCategories: (courseId) => fetch(`${API_BASE}/forum/course/${courseId}/categories`, { headers: getHeaders() }).then(handleResponse),

        // --- DENNA SAKNADES ---
        createCategory: (courseId, data) => fetch(`${API_BASE}/forum/course/${courseId}/categories`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse),
        // ----------------------

        getThreads: (categoryId) => fetch(`${API_BASE}/forum/category/${categoryId}/threads`, { headers: getHeaders() }).then(handleResponse),
        getRecentActivity: (userId) => fetch(`${API_BASE}/forum/recent/${userId}`, { headers: getHeaders() }).then(handleResponse).catch(() => []),
        createThread: (categoryId, userId, title, content) => fetch(`${API_BASE}/forum/category/${categoryId}/thread`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ userId, title, content })
        }).then(handleResponse),
        reply: (threadId, userId, content) => fetch(`${API_BASE}/forum/thread/${threadId}/reply`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ userId, content })
        }).then(handleResponse),
    },

    messages: {
        getRecentContacts: (userId) => fetch(`${API_BASE}/messages/contacts/${userId}`, { headers: getHeaders() }).then(handleResponse).catch(() => []),
        getHistory: (userId, otherId) => fetch(`${API_BASE}/messages/${userId}/${otherId}`, { headers: getHeaders() }).then(handleResponse),
    },

    users: {
        getAll: () => fetch(`${API_BASE}/users`, { headers: getHeaders() }).then(handleResponse),
        getById: (id) => fetch(`${API_BASE}/users/${id}`, { headers: getHeaders() }).then(handleResponse),
        register: (data) => fetch(`${API_BASE}/users/register`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
        generateUsernames: (data) => fetch(`${API_BASE}/users/generate-usernames`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse),
        delete: (id) => fetch(`${API_BASE}/users/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
    },
    courses: {
        getAll: () => fetch(`${API_BASE}/courses`, { headers: getHeaders() }).then(handleResponse),
        getOne: (id) => fetch(`${API_BASE}/courses/${id}`, { headers: getHeaders() }).then(handleResponse),
        getAvailable: (userId) => fetch(`${API_BASE}/courses/available/${userId}`, { headers: getHeaders() }).then(handleResponse),
        create: (data, teacherId) => fetch(`${API_BASE}/courses?teacherId=${teacherId}`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
        update: (id, data) => fetch(`${API_BASE}/courses/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
        delete: (id) => fetch(`${API_BASE}/courses/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
        toggleStatus: (id) => fetch(`${API_BASE}/courses/${id}/toggle-status`, { method: 'PUT', headers: getHeaders() }).then(handleResponse),
        enroll: (courseId, studentId) => fetch(`${API_BASE}/courses/${courseId}/enroll/${studentId}`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
    },
    documents: {
        getAll: () => fetch(`${API_BASE}/documents/all`, { headers: getHeaders() }).then(handleResponse),
        upload: (userId, formData) => fetch(`${API_BASE}/documents/user/${userId}`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: formData }).then(handleResponse),
        delete: (id) => fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
        getUserDocs: (userId) => fetch(`${API_BASE}/documents/user/${userId}`, { headers: getHeaders() }).then(handleResponse),
    },
    settings: {
        getAll: () => fetch(`${API_BASE}/settings`, { headers: getHeaders() }).then(handleResponse),
        update: (key, value) => fetch(`${API_BASE}/settings/${key}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify({ value }) }).then(handleResponse),
    },
    notifications: {
        getUserNotifs: (userId) => fetch(`${API_BASE}/notifications/user/${userId}`, { headers: getHeaders() }).then(handleResponse),
        markRead: (id) => fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT', headers: getHeaders() }),
    },
    assignments: {
        getByCourse: (courseId) => fetch(`${API_BASE}/courses/${courseId}/assignments`, { headers: getHeaders() }).then(handleResponse),
        create: (courseId, data) => fetch(`${API_BASE}/courses/${courseId}/assignments`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
        submit: (assignmentId, studentId, formData) => fetch(`${API_BASE}/assignments/${assignmentId}/submit/${studentId}`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: formData }).then(handleResponse),
        getSubmissions: (assignmentId) => fetch(`${API_BASE}/assignments/${assignmentId}/submissions`, { headers: getHeaders() }).then(handleResponse),
        grade: (subId, grade, feedback) => fetch(`${API_BASE}/submissions/${subId}/grade?grade=${grade}&feedback=${feedback || ''}`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
    },
    quiz: {
        getByCourse: (courseId) => fetch(`${API_BASE}/quizzes/course/${courseId}`, { headers: getHeaders() }).then(handleResponse),
        create: (courseId, quizData) => fetch(`${API_BASE}/quizzes/course/${courseId}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(quizData)
        }).then(handleResponse),
        update: (id, quizData) => fetch(`${API_BASE}/quizzes/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(quizData)
        }).then(handleResponse),
        submit: (quizId, resultData) => fetch(`${API_BASE}/quizzes/${quizId}/submit`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(resultData)
        }).then(handleResponse),
        delete: (id) => fetch(`${API_BASE}/quizzes/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
    },
    system: {
        checkLicense: () => fetch(`${API_BASE}/system/license/status`).then(handleResponse),
        activateLicense: (key) => fetch(`${API_BASE}/system/license/activate`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({key}) }).then(handleResponse)
    }
};