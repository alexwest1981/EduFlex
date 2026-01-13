const API_BASE = 'http://127.0.0.1:8080/api';

const getHeaders = (contentType = 'application/json') => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    if (contentType) headers['Content-Type'] = contentType;
    return headers;
};

const handleResponse = async (res) => {
    if (!res.ok) {
        if (res.status === 402) {
            window.dispatchEvent(new Event('license-lock'));
            throw new Error("LICENSE_REQUIRED");
        }
        const errorText = await res.text();
        throw new Error(errorText || `HTTP Error: ${res.status}`);
    }
    // Hantera tomma svar (t.ex. 204 No Content)
    if (res.status === 204) return null;

    const text = await res.text();
    try {
        return text ? JSON.parse(text) : null;
    } catch {
        return text;
    }
};

export const api = {
    get: (url) => fetch(`${API_BASE}${url}`, { headers: getHeaders() }).then(handleResponse),
    post: (url, body) => fetch(`${API_BASE}${url}`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
    put: (url, body) => fetch(`${API_BASE}${url}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
    delete: (url) => fetch(`${API_BASE}${url}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),

    auth: {
        login: (credentials) => fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) }).then(handleResponse),
        register: (data) => fetch(`${API_BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse),
    },

    // --- MODULHANTERING ---
    modules: {
        getAll: () => fetch(`${API_BASE}/modules`, { headers: getHeaders() }).then(handleResponse),
        toggle: (key, active) => fetch(`${API_BASE}/modules/${key}/toggle`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ active })
        }).then(handleResponse),
    },

    // --- FORUM ---
    forum: {
        getCategories: (courseId) => fetch(`${API_BASE}/forum/course/${courseId}/categories`, { headers: getHeaders() }).then(handleResponse),
        createCategory: (courseId, data) => fetch(`${API_BASE}/forum/course/${courseId}/categories`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse),
        getThreads: (categoryId, page = 0, size = 10) => fetch(`${API_BASE}/forum/category/${categoryId}/threads?page=${page}&size=${size}`, { headers: getHeaders() }).then(handleResponse),
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
        deleteThread: (threadId) => fetch(`${API_BASE}/forum/thread/${threadId}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
        deletePost: (postId) => fetch(`${API_BASE}/forum/post/${postId}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
        toggleLockThread: (threadId, isLocked) => fetch(`${API_BASE}/forum/thread/${threadId}/lock`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ locked: isLocked })
        }).then(handleResponse),
    },

    analytics: {
        getOverview: () => fetch(`${API_BASE}/analytics/overview`, { headers: getHeaders() }).then(handleResponse),
        getStudentProgress: (studentId) => fetch(`${API_BASE}/analytics/student/${studentId}`, { headers: getHeaders() }).then(handleResponse)
    },

    skolverket: {
        getCourses: () => fetch(`${API_BASE}/skolverket/courses`, { headers: getHeaders() }).then(handleResponse),
        search: (query) => fetch(`${API_BASE}/skolverket/courses/search?q=${query}`, { headers: getHeaders() }).then(handleResponse),
        getBySubject: (subject) => fetch(`${API_BASE}/skolverket/courses/subject/${subject}`, { headers: getHeaders() }).then(handleResponse),
        getSubjects: () => fetch(`${API_BASE}/skolverket/subjects`, { headers: getHeaders() }).then(handleResponse),
        getStats: () => fetch(`${API_BASE}/skolverket/stats`, { headers: getHeaders() }).then(handleResponse)
    },

    messages: {
        getInbox: () => fetch(`${API_BASE}/messages/inbox`, { headers: getHeaders() }).then(handleResponse),
        getSent: () => fetch(`${API_BASE}/messages/sent`, { headers: getHeaders() }).then(handleResponse),
        getUnreadCount: () => fetch(`${API_BASE}/messages/unread`, { headers: getHeaders() }).then(handleResponse),
        send: (data) => fetch(`${API_BASE}/messages/send`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
        getRecentContacts: (userId) => fetch(`${API_BASE}/messages/contacts/${userId}`, { headers: getHeaders() }).then(handleResponse).catch(() => []),
        getContacts: () => fetch(`${API_BASE}/messages/contacts`, { headers: getHeaders() }).then(handleResponse),
    },

    chat: {
        getHistory: (senderId, recipientId, page = 0, size = 20) => fetch(`${API_BASE}/messages/${senderId}/${recipientId}?page=${page}&size=${size}`, { headers: getHeaders() }).then(handleResponse)
    },

    roles: {
        getAll: () => fetch(`${API_BASE}/roles`, { headers: getHeaders() }).then(handleResponse),
        getPermissions: () => fetch(`${API_BASE}/roles/permissions`, { headers: getHeaders() }).then(handleResponse),
        create: (data) => fetch(`${API_BASE}/roles`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
        update: (id, data) => fetch(`${API_BASE}/roles/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
        delete: (id) => fetch(`${API_BASE}/roles/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
    },

    users: {
        getAll: (page = 0, size = 20) => fetch(`${API_BASE}/users?page=${page}&size=${size}`, { headers: getHeaders() }).then(handleResponse),
        getById: (id) => fetch(`${API_BASE}/users/${id}?t=${new Date().getTime()}`, { headers: getHeaders() }).then(handleResponse),
        register: (data) => fetch(`${API_BASE}/users/register`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
        generateUsernames: (data) => fetch(`${API_BASE}/users/generate-usernames`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse),
        delete: (id) => fetch(`${API_BASE}/users/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
        update: (id, data) => fetch(`${API_BASE}/users/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse),
        exportData: () => fetch(`${API_BASE}/users/me/export`, { headers: getHeaders() }).then(handleResponse),
    },

    courses: {
        getAll: () => fetch(`${API_BASE}/courses`, { headers: getHeaders() }).then(handleResponse),
        getOne: (id) => fetch(`${API_BASE}/courses/${id}`, { headers: getHeaders() }).then(handleResponse),
        getMyCourses: (studentId) => fetch(`${API_BASE}/courses/student/${studentId}`, { headers: getHeaders() }).then(handleResponse),
        create: (data, teacherId) => fetch(`${API_BASE}/courses`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ ...data, teacherId: teacherId || 1 })
        }).then(handleResponse),
        enroll: (cid, uid) => fetch(`${API_BASE}/courses/${cid}/enroll/${uid}`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
        delete: (id) => fetch(`${API_BASE}/courses/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
        update: (id, data) => fetch(`${API_BASE}/courses/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse),
        // Ansökan
        apply: (courseId, studentId) => fetch(`${API_BASE}/courses/${courseId}/apply/${studentId}`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
        getApplications: (teacherId) => fetch(`${API_BASE}/courses/applications/teacher/${teacherId}`, { headers: getHeaders() }).then(handleResponse),
        handleApplication: (appId, status) => fetch(`${API_BASE}/courses/applications/${appId}/${status}`, { method: 'POST', headers: getHeaders() }).then(handleResponse),

        // Resultat & Certifikat
        checkCompletion: (id, studentId) => fetch(`${API_BASE}/courses/${id}/check-completion/${studentId}`, { headers: getHeaders() }).then(handleResponse),
        claimCertificate: (id, studentId) => fetch(`${API_BASE}/courses/${id}/claim-certificate/${studentId}`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
        setResult: (courseId, studentId, status) => fetch(`${API_BASE}/courses/${courseId}/result/${studentId}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ status })
        }).then(handleResponse),
        getResult: (courseId, studentId) => fetch(`${API_BASE}/courses/${courseId}/result/${studentId}`, { headers: getHeaders() }).then(handleResponse),
        getOptions: (userId, role) => fetch(`${API_BASE}/courses/options?userId=${userId}&role=${role}`, { headers: getHeaders() }).then(handleResponse),
    },

    // --- LEKTIONER / MATERIAL (FIXAD KOPPLING) ---
    lessons: {
        getByCourse: (courseId) => fetch(`${API_BASE}/courses/${courseId}/materials`, { headers: getHeaders() }).then(handleResponse),
        create: (courseId, userId, formData) => fetch(`${API_BASE}/courses/${courseId}/materials?userId=${userId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, // Ingen Content-Type vid FormData!
            body: formData
        }).then(handleResponse),
        createGlobal: (userId, formData) => fetch(`${API_BASE}/lessons/create?userId=${userId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        }).then(handleResponse),
        getMy: (userId) => fetch(`${API_BASE}/lessons/my?userId=${userId}`, { headers: getHeaders() }).then(handleResponse),
        update: (id, formData) => fetch(`${API_BASE}/courses/materials/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        }).then(handleResponse),
        delete: (id) => fetch(`${API_BASE}/courses/materials/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
    },

    documents: {
        getAll: () => fetch(`${API_BASE}/documents/all`, { headers: getHeaders() }).then(handleResponse),
        upload: (userId, formData) => fetch(`${API_BASE}/documents/user/${userId}`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: formData }).then(handleResponse),
        delete: (id) => fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
        getUserDocs: (userId) => fetch(`${API_BASE}/documents/user/${userId}`, { headers: getHeaders() }).then(handleResponse),
        share: (docId, userId) => fetch(`${API_BASE}/documents/${docId}/share?userId=${userId}`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
    },

    // --- RESTORED SECTIONS ---
    skolverket: {
        getCourses: () => api.get('/skolverket/courses'),
        search: (query) => api.get(`/skolverket/courses/search?q=${query}`),
        getBySubject: (subject) => api.get(`/skolverket/courses/subject/${subject}`),
        getSubjects: () => api.get('/skolverket/subjects'),
        getStats: () => api.get('/skolverket/stats'),
        getCriteria: (courseCode) => api.get(`/skolverket/courses/${courseCode}/criteria`),
        updateDetails: (courseCode, details) => api.put(`/skolverket/courses/${courseCode}/details`, details),
        saveCriteria: (courseCode, criteria) => api.post(`/skolverket/courses/${courseCode}/criteria`, criteria)
    },

    system: {
        getModules: () => api.get('/modules'),
        toggleModule: (key, active) => api.post(`/modules/${key}/toggle?active=${active}`),
        updateSetting: (key, value) => api.put(`/system-settings/${key}`, { value: value }),
        getSettings: () => api.get('/system-settings'),
        checkLicense: () => fetch(`${API_BASE}/system/license/status`).then(handleResponse),
        activateLicense: (key) => fetch(`${API_BASE}/system/license/activate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) }).then(handleResponse)
    },

    license: { // Keeping for backward compat if anyone calls it separately, but consolidated in system for UI
        getStatus: () => api.get('/system/license/status'),
        activate: (key) => api.post('/system/license/activate', { key }),
    },

    settings: {
        getAll: () => fetch(`${API_BASE}/settings`, { headers: getHeaders() })
            .then(handleResponse)
            .then(data => {
                // Transform Array [{key: 'k', value: 'v'}] to Object {k: 'v'}
                if (Array.isArray(data)) {
                    return data.reduce((acc, curr) => {
                        acc[curr.key] = curr.value;
                        return acc;
                    }, {});
                }
                return data;
            }),
        update: (key, value) => fetch(`${API_BASE}/settings/${key}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify({ value }) }).then(handleResponse),
    },

    notifications: {
        getUserNotifs: (userId) => fetch(`${API_BASE}/notifications/user/${userId}`, { headers: getHeaders() }).then(handleResponse),
        markRead: (id) => fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT', headers: getHeaders() }),
    },

    assignments: {
        getByCourse: (courseId) => fetch(`${API_BASE}/courses/${courseId}/assignments`, { headers: getHeaders() }).then(handleResponse),
        create: (courseId, userId, data) => fetch(`${API_BASE}/courses/${courseId}/assignments?userId=${userId}`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
        createGlobal: (userId, data) => fetch(`${API_BASE}/assignments/create?userId=${userId}`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
        getMy: (userId) => fetch(`${API_BASE}/assignments/my?userId=${userId}`, { headers: getHeaders() }).then(handleResponse),
        submit: (assignmentId, studentId, formData) => fetch(`${API_BASE}/assignments/${assignmentId}/submit/${studentId}`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: formData }).then(handleResponse),
        getSubmissions: (assignmentId) => fetch(`${API_BASE}/assignments/${assignmentId}/submissions`, { headers: getHeaders() }).then(handleResponse),
        getMySubmission: (assignmentId, studentId) => fetch(`${API_BASE}/assignments/${assignmentId}/my-submission/${studentId}`, { headers: getHeaders() }).then(handleResponse),
        grade: (subId, grade, feedback) => fetch(`${API_BASE}/submissions/${subId}/grade?grade=${grade}&feedback=${feedback || ''}`, { method: 'POST', headers: getHeaders() }).then(handleResponse),

        // Attachments
        addAttachmentFile: (assignmentId, formData) => fetch(`${API_BASE}/assignments/${assignmentId}/attachments/file`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: formData }).then(handleResponse),
        addAttachmentLink: (assignmentId, data) => fetch(`${API_BASE}/assignments/${assignmentId}/attachments/link`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
        removeAttachment: (assignmentId, attachmentId) => fetch(`${API_BASE}/assignments/${assignmentId}/attachments/${attachmentId}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
    },

    events: {
        getAll: () => fetch(`${API_BASE}/events`, { headers: getHeaders() }).then(handleResponse),
        create: (data) => fetch(`${API_BASE}/events`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse),
    },

    quiz: {
        getByCourse: (courseId) => fetch(`${API_BASE}/quizzes/course/${courseId}`, { headers: getHeaders() }).then(handleResponse),
        create: (courseId, userId, quizData) => fetch(`${API_BASE}/quizzes/course/${courseId}?userId=${userId}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(quizData)
        }).then(handleResponse),
        createGlobal: (userId, quizData) => fetch(`${API_BASE}/quizzes/create?userId=${userId}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(quizData)
        }).then(handleResponse),
        getMy: (userId) => fetch(`${API_BASE}/quizzes/my?userId=${userId}`, { headers: getHeaders() }).then(handleResponse),
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
        generate: (data) => fetch(`${API_BASE}/quizzes/generate`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse),
    },

    questionBank: {
        getMy: (userId) => fetch(`${API_BASE}/question-bank/my?userId=${userId}`, { headers: getHeaders() }).then(handleResponse),
        add: (userId, item) => fetch(`${API_BASE}/question-bank/add?userId=${userId}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(item)
        }).then(handleResponse),
        import: (userId, items) => fetch(`${API_BASE}/question-bank/import?userId=${userId}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(items)
        }).then(handleResponse),
        getCategories: (userId) => fetch(`${API_BASE}/question-bank/categories?userId=${userId}`, { headers: getHeaders() }).then(handleResponse),
        delete: (id) => fetch(`${API_BASE}/question-bank/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
    },

    scorm: {
        getByCourse: (courseId) => fetch(`${API_BASE}/scorm/course/${courseId}`, { headers: getHeaders() }).then(handleResponse),
        upload: (courseId, formData) => fetch(`${API_BASE}/scorm/upload/${courseId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, // Multipart handles content-type
            body: formData
        }).then(handleResponse)
    },

    activity: {
        log: (data) => fetch(`${API_BASE}/activity/log`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse),
        getCourseLogs: (courseId) => fetch(`${API_BASE}/activity/course/${courseId}`, { headers: getHeaders() }).then(handleResponse),
        getStudentLogs: (courseId, userId) => fetch(`${API_BASE}/activity/course/${courseId}/student/${userId}`, { headers: getHeaders() }).then(handleResponse)
    },

    logs: {
        getFiles: () => fetch(`${API_BASE}/logs/files`, { headers: getHeaders() }).then(handleResponse),
        getContent: (filename, lines) => fetch(`${API_BASE}/logs/content?filename=${filename || ''}&lines=${lines || 100}`, { headers: getHeaders() }).then(handleResponse),
        reportError: (errorData) => fetch(`${API_BASE}/logs/client`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(errorData)
        }),
    }
};