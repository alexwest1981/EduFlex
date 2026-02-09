// Use relative URL to leverage Vite's proxy for LAN access
export const API_BASE = '/api';

export const getTenantFromUrl = () => {
    const hostname = window.location.hostname;

    // 1. Prioritera manuell override (bra för testning)
    const forcedTenant = localStorage.getItem('force_tenant');
    if (forcedTenant === 'public') return null;
    if (forcedTenant) return forcedTenant;

    // 2. Hantera localhost subdomäner (t.ex. acme.localhost)
    if (hostname.endsWith('.localhost') && hostname !== 'localhost') {
        return hostname.split('.')[0];
    }

    // 3. Ignorera IP-adresser (t.ex. 192.168.x.x)
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
        return null;
    }

    // 4. Ignorera temporära tunneling-domäner (inte produktionsdomäner via Cloudflare Tunnel)
    if (hostname.includes('ngrok') || hostname.includes('loca.lt') || hostname.includes('trycloudflare.com')) {
        // console.log('[TENANT DEBUG] Ignoring temporary tunnel domain:', hostname);
        return null;
    }

    // 5. Hantera produktionsdomäner (t.ex. acme.eduflex.se eller acme.eduflex.local)
    // Antar att huvuddomänen är de två sista delarna (eduflex.se)
    const parts = hostname.split('.');
    if (parts.length > 2) {
        const subdomain = parts[0];
        // Ignorera 'www', 'api' och andra system-subdomäner
        if (['www', 'api', 'eduflexlms'].includes(subdomain)) {
            return null;
        }
        // Returnera första delen (subdomänen)
        return subdomain;
    }

    return null; // Ingen tenant (Public / Default)
};

const getHeaders = (contentType = 'application/json') => {
    const token = localStorage.getItem('token');
    const headers = {};

    // 1. Lägg bara till token om den faktiskt finns och är giltig
    if (token && token !== 'null' && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // 2. Lägg till Tenant ID om det finns (Kritiskt för Multi-tenancy!)
    const tenantId = getTenantFromUrl();
    if (tenantId) {
        headers['X-Tenant-ID'] = tenantId;
    }

    // 3. Sätt Content-Type (om det inte är en filuppladdning)
    if (contentType) {
        headers['Content-Type'] = contentType;
    }

    // console.log('[API DEBUG] Request Headers:', headers, 'Token:', token);
    return headers;
};

const handleResponse = async (res) => {
    // Debug helper
    if (localStorage.getItem('debug_api')) {
        console.log('[API DEBUG]', res.status, res.url);
    }

    if (!res.ok) {
        if (res.status === 402) {
            window.dispatchEvent(new Event('license-lock'));
            throw new Error("LICENSE_REQUIRED");
        }
        if (res.status === 401) {
            if (res.url.includes('/api/') && !res.url.includes('/auth/login')) {
                console.warn('[API] Unauthorised (401). Signalling logout.');
                localStorage.setItem('eduflex_logout_signal', Date.now().toString());
                window.dispatchEvent(new Event('session-expired'));
            }
            throw new Error("UNAUTHORIZED");
        }

        // CLONE the response before reading body to avoid "stream already read"
        let errorText = "";
        try {
            const clonedRes = res.clone();
            const text = await clonedRes.text();

            try {
                const data = JSON.parse(text);
                errorText = (data && data.message) ? data.message : JSON.stringify(data);
            } catch (e) {
                errorText = text;
            }
        } catch (e) {
            console.error('[API] Failed to read error body', e);
        }

        console.error('[API ERROR]', res.status, errorText.substring(0, 200));
        throw new Error(errorText || `HTTP Error: ${res.status}`);
    }

    if (res.status === 204) return null;

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return res.json();
    }

    // Fallback for non-JSON success responses (rare but possible)
    return res.text();
};

export const api = {
    get: (url) => fetch(`${API_BASE}${url}`, { headers: getHeaders() }).then(handleResponse),
    post: (url, body) => {
        const isFormData = body instanceof FormData;
        return fetch(`${API_BASE}${url}`, {
            method: 'POST',
            headers: getHeaders(isFormData ? null : 'application/json'),
            body: isFormData ? body : JSON.stringify(body)
        }).then(handleResponse);
    },
    put: (url, body) => {
        const isFormData = body instanceof FormData;
        return fetch(`${API_BASE}${url}`, {
            method: 'PUT',
            headers: getHeaders(isFormData ? null : 'application/json'),
            body: isFormData ? body : JSON.stringify(body)
        }).then(handleResponse);
    },
    delete: (url) => fetch(`${API_BASE}${url}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
    patch: (url, body) => {
        const isFormData = body instanceof FormData;
        return fetch(`${API_BASE}${url}`, {
            method: 'PATCH',
            headers: getHeaders(isFormData ? null : 'application/json'),
            body: isFormData ? body : JSON.stringify(body)
        }).then(handleResponse);
    },

    auth: {
        login: (credentials) => api.post('/auth/login', credentials),
        register: (data) => api.post('/auth/register', data),
    },

    // --- GLOBAL SÖK ---
    search: {
        global: (query) => api.get(`/search/global?q=${encodeURIComponent(query)}`),
    },

    // --- MODULHANTERING ---
    modules: {
        getAll: () => api.get('/modules'),
        toggle: (key, active) => api.put(`/modules/${key}/toggle`, { active }),
        init: () => api.post('/modules/init'),
    },

    // --- FORUM ---
    forum: {
        getCategories: (courseId) => api.get(`/forum/course/${courseId}/categories`),
        createCategory: (courseId, data) => api.post(`/forum/course/${courseId}/categories`, data),
        getThreads: (categoryId, page = 0, size = 10) => api.get(`/forum/category/${categoryId}/threads?page=${page}&size=${size}`),
        createThread: (categoryId, userId, title, content) => api.post(`/forum/category/${categoryId}/thread`, { userId, title, content }),
        reply: (threadId, userId, content) => api.post(`/forum/thread/${threadId}/reply`, { userId, content }),
        deleteThread: (threadId) => api.delete(`/forum/thread/${threadId}`),
        deletePost: (postId) => api.delete(`/forum/post/${postId}`),
        toggleLockThread: (threadId, isLocked) => api.put(`/forum/thread/${threadId}/lock`, { locked: isLocked }),
    },

    analytics: {
        getOverview: () => api.get('/analytics/overview'),
        getStudentProgress: (studentId) => api.get(`/analytics/student/${studentId}`),
        // NEW DASHBOARD ENDPOINTS
        getActivityTrend: (range) => api.get(`/analytics/activity-trend?range=${range || '30d'}`),
        getCoursePerformance: () => api.get('/analytics/course-performance'),
        getAtRiskStudents: () => api.get('/analytics/at-risk-students'),
        getAtRiskAiSummary: (userId) => api.get(`/analytics/at-risk/${userId}/ai-summary`),
        getHeatmap: (userId) => api.get(`/analytics/heatmap${userId ? `?userId=${userId}` : ''}`),
        getDropOff: (courseId) => api.get(`/analytics/drop-off/${courseId}`),
    },

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

    adaptiveLearning: {
        getMyRecommendations: () => api.get('/adaptive-learning/recommendations'),
        markAsViewed: (id) => api.put(`/adaptive-learning/recommendations/${id}/view`),
        triggerAnalysis: () => api.post('/adaptive-learning/trigger')
    },

    messages: {
        getInbox: () => api.get('/messages/inbox'),
        getFolder: (slug) => api.get(`/messages/folder/${slug}`),
        getSent: () => api.get('/messages/sent'),
        getFolders: () => api.get('/messages/folders'),
        createFolder: (name) => api.post('/messages/folders', { name }),
        moveMessage: (messageId, folderId) => api.put(`/messages/${messageId}/move`, { folderId }),
        getUnreadCount: () => api.get('/messages/unread'),
        markAsRead: (messageId) => api.put(`/messages/${messageId}/read`),
        getThread: (messageId) => api.get(`/messages/thread/${messageId}`),
        send: (formData) => api.post('/messages/send', formData),
        getRecentContacts: (userId) => api.get(`/messages/contacts/${userId}`).catch(() => []),
        getContacts: () => api.get('/messages/contacts'),
    },



    tenants: {
        getAll: () => api.get('/tenants'),
        create: (data) => api.post('/tenants', data),
        update: (id, data) => api.put(`/tenants/${id}`, data),
        delete: (id) => api.delete(`/tenants/${id}`),
        initSchema: (id) => api.post(`/tenants/${id}/init-schema`),
    },

    roles: {
        getAll: () => api.get('/roles'),
        getPermissions: () => api.get('/roles/permissions'),
        create: (data) => api.post('/roles', data),
        update: (id, data) => api.put(`/roles/${id}`, data),
        delete: (id) => api.delete(`/roles/${id}`),
    },

    connections: {
        request: (receiverId) => api.post(`/connections/request/${receiverId}`),
        accept: (connectionId) => api.post(`/connections/accept/${connectionId}`),
        reject: (connectionId) => api.post(`/connections/reject/${connectionId}`),
        getRequests: () => api.get('/connections/requests'),
        getStatus: (otherUserId) => api.get(`/connections/status/${otherUserId}`),
        remove: (targetUserId) => api.delete(`/connections/${targetUserId}`),
        block: (targetUserId) => api.post(`/connections/block/${targetUserId}`),
        unblock: (targetUserId) => api.post(`/connections/unblock/${targetUserId}`),
    },

    users: {
        getAll: (page = 0, size = 20) => api.get(`/users?page=${page}&size=${size}`),
        getRelated: () => api.get('/users/related'),
        search: (query) => api.get(`/users/search?query=${encodeURIComponent(query)}`),
        getById: (id) => api.get(`/users/${id}?t=${new Date().getTime()}`),
        register: (data) => api.post('/users/register', data),
        generateUsernames: (data) => api.post('/users/generate-usernames', data),
        delete: (id) => api.delete(`/users/${id}`),
        update: (id, data) => api.put(`/users/${id}`, data),
        exportData: () => api.get('/users/me/export'),
        ping: () => api.post('/users/ping'),
    },

    courses: {
        getAll: () => api.get('/courses'),
        getOne: (id) => api.get(`/courses/${id}`),
        getMyCourses: (studentId) => api.get(`/courses/student/${studentId}`),
        create: (data, teacherId) => api.post('/courses', { ...data, teacherId: teacherId || 1 }),
        enroll: (cid, uid) => api.post(`/courses/${cid}/enroll/${uid}`),
        delete: (id) => api.delete(`/courses/${id}`),
        update: (id, data) => api.put(`/courses/${id}`, data),
        // Ansökan
        apply: (courseId, studentId) => api.post(`/courses/${courseId}/apply/${studentId}`),
        getApplications: (teacherId) => api.get(`/courses/applications/teacher/${teacherId}`),
        handleApplication: (appId, status) => api.post(`/courses/applications/${appId}/${status}`),

        // Resultat & Certifikat
        checkCompletion: (id, studentId) => api.get(`/courses/${id}/check-completion/${studentId}`),
        claimCertificate: (id, studentId) => api.post(`/courses/${id}/claim-certificate/${studentId}`),
        setResult: (courseId, studentId, status) => api.post(`/courses/${courseId}/result/${studentId}`, { status }),
        getResult: (courseId, studentId) => api.get(`/courses/${courseId}/result/${studentId}`),
        getMyResults: (studentId) => api.get(`/courses/results/student/${studentId}`),
        getOptions: (userId, role) => api.get(`/courses/options?userId=${userId}&role=${role}`),
    },

    shop: {
        getItems: () => api.get('/edugame/shop/items'),
        buyItem: (itemId) => api.post(`/edugame/shop/buy/${itemId}`, {}),
        equipItem: (itemId) => api.post(`/edugame/shop/equip/${itemId}`, {}),
        unequipItem: (type) => api.post(`/edugame/shop/unequip/${type}`, {}),
        getInventory: () => api.get('/edugame/shop/inventory'),
    },

    // --- LEKTIONER / MATERIAL (FIXAD KOPPLING) ---
    lessons: {
        getByCourse: (courseId) => api.get(`/courses/${courseId}/materials`),
        create: (courseId, userId, formData) => api.post(`/courses/${courseId}/materials?userId=${userId}`, formData),
        createGlobal: (userId, formData) => api.post(`/lessons/create?userId=${userId}`, formData),
        getMy: (userId) => api.get(`/lessons/my?userId=${userId}`),
        getOne: (id) => api.get(`/courses/materials/${id}`),
        update: (id, formData) => api.put(`/courses/materials/${id}`, formData),
        delete: (id) => api.delete(`/courses/materials/${id}`),
    },

    documents: {
        getAll: () => api.get('/documents/all'),
        upload: (userId, formData, onProgress) => {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', `${API_BASE}/documents/user/${userId}`);

                // Add headers
                const token = localStorage.getItem('token');
                if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                const tenantId = getTenantFromUrl();
                if (tenantId) xhr.setRequestHeader('X-Tenant-ID', tenantId);

                // Progress event
                if (onProgress) {
                    xhr.upload.onprogress = (event) => {
                        if (event.lengthComputable) {
                            const percent = Math.round((event.loaded / event.total) * 100);
                            onProgress(percent);
                        }
                    };
                }

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            resolve(JSON.parse(xhr.responseText));
                        } catch (e) {
                            resolve(xhr.responseText);
                        }
                    } else {
                        reject(new Error(xhr.statusText || 'Upload failed'));
                    }
                };

                xhr.onerror = () => reject(new Error('Network error'));
                xhr.send(formData);
            });
        },
        delete: (id) => api.delete(`/documents/${id}`),
        getUserDocs: (userId) => api.get(`/documents/user/${userId}`),
        getFolderDocs: (folderId, userId) => api.get(`/documents/folder/${folderId}?userId=${userId}`),
        getRootDocs: (userId) => api.get(`/documents/user/${userId}/root`),
        share: (docId, userId) => api.post(`/documents/${docId}/share?userId=${userId}`),
        getUsage: (userId) => api.get(`/documents/usage/${userId}`),
        getAdminStats: () => api.get('/admin/storage-stats'),
        getMerits: (userId) => api.get(`/documents/merits/${userId}`),
        getSystemDocs: () => api.get('/documents/system'),
        getConsolidatedGradesUrl: (studentId) => `${API_BASE}/documents/grades/consolidated/${studentId}`,
    },

    folders: {
        create: (userId, name, parentId) => api.post(`/folders/user/${userId}`, { name, parentId }),
        getRoot: (userId) => api.get(`/folders/user/${userId}/root`),
        getContent: (folderId, userId) => api.get(`/folders/${folderId}/content?userId=${userId}`),
        delete: (id) => api.delete(`/folders/${id}`),
        rename: (id, name) => api.put(`/folders/${id}/rename`, { name }),
    },

    shares: {
        create: (docId, sharedById, data) => api.post(`/shares/file/${docId}?sharedById=${sharedById}`, data),
        createPublicLink: (docId, sharedById, expiresAt) => api.post(`/shares/file/${docId}/public?sharedById=${sharedById}${expiresAt ? `&expiresAt=${expiresAt}` : ''}`),
        getTargetShares: (type, id) => api.get(`/shares/target/${type}/${id}`),
        revoke: (id) => api.delete(`/shares/${id}`),
    },

    system: {
        getModules: () => api.get('/modules'),
        updateSetting: (key, value) => api.put(`/settings/${key}`, { value }),
        getSettings: () => api.get('/settings'),
        checkLicense: () => api.get('/system/license/status'),
        activateLicense: (key) => api.post('/system/license/activate', { key })
    },

    onlyoffice: {
        checkHealth: () => api.get('/onlyoffice/health'),
    },

    admin: {
        listBackups: () => api.get('/admin/backups'),
        getBackupStatus: () => api.get('/admin/backups/status'),
        createBackup: () => api.post('/admin/backups/create'),
        restoreBackup: (backupId) => api.post(`/admin/backups/restore/${backupId}`),
        deleteBackup: (backupId) => api.delete(`/admin/backups/${backupId}`),
        downloadBackup: (backupId) => `${API_BASE}/admin/backups/download/${backupId}`,
        getDatabaseConnections: () => api.get('/admin/database/connections'),
        switchDatabase: (connectionId, adminPassword) => api.post(`/admin/database/switch/${connectionId}`, { adminPassword }),
        addDatabase: (data) => api.post('/admin/database/add', data),
        importUsers: (formData) => api.post('/admin/import/users', formData),
        getAuditLogs: (params = {}) => {
            const searchParams = new URLSearchParams();
            if (params.user) searchParams.set('user', params.user);
            if (params.action) searchParams.set('action', params.action);
            if (params.entity) searchParams.set('entity', params.entity);
            return api.get(`/admin/audit?${searchParams}`);
        },
        getAuditLog: (id) => api.get(`/admin/audit/${id}`),
    },

    license: {
        getStatus: () => api.get('/system/license/status'),
        activate: (key) => api.post('/system/license/activate', { key }),
    },

    settings: {
        getAll: () => api.get('/settings').then(data => {
            if (Array.isArray(data)) {
                return data.reduce((acc, curr) => {
                    acc[curr.key] = curr.value;
                    return acc;
                }, {});
            }
            return data;
        }),
        update: (key, value) => api.put(`/settings/${key}`, { value }),
    },

    notifications: {
        getUserNotifs: (userId) => api.get(`/notifications/user/${userId}`),
        markRead: (id) => api.put(`/notifications/${id}/read`),
        getUnreadCount: (userId) => api.get(`/notifications/user/${userId}/unread-count`),
        markAllAsRead: (userId) => api.put(`/notifications/user/${userId}/mark-all-read`),
    },

    assignments: {
        getByCourse: (courseId) => api.get(`/courses/${courseId}/assignments`),
        getOne: (id) => api.get(`/assignments/${id}`),
        create: (courseId, userId, data) => api.post(`/courses/${courseId}/assignments?userId=${userId}`, data),
        createGlobal: (userId, data) => api.post(`/assignments/create?userId=${userId}`, data),
        update: (id, data) => api.put(`/assignments/${id}`, data),
        delete: (id) => api.delete(`/assignments/${id}`),
        getMy: (userId) => api.get(`/assignments/my?userId=${userId}`),
        submit: (assignmentId, studentId, formData) => api.post(`/assignments/${assignmentId}/submit/${studentId}`, formData),
        getSubmissions: (assignmentId) => api.get(`/assignments/${assignmentId}/submissions`),
        getMySubmission: (assignmentId, studentId) => api.get(`/assignments/${assignmentId}/my-submission/${studentId}`),
        grade: (subId, grade, feedback) => api.post(`/submissions/${subId}/grade?grade=${grade}&feedback=${feedback || ''}`),
        addAttachmentFile: (assignmentId, formData) => api.post(`/assignments/${assignmentId}/attachments/file`, formData),
        addAttachmentLink: (assignmentId, data) => api.post(`/assignments/${assignmentId}/attachments/link`, data),
        removeAttachment: (assignmentId, attachmentId) => api.delete(`/assignments/${assignmentId}/attachments/${attachmentId}`),
    },

    events: {
        getAll: () => api.get('/events'),
        getDashboardSummary: () => api.get('/events/dashboard-summary'),
        getByCourse: (courseId) => api.get(`/events/course/${courseId}`),
        create: (data) => api.post('/events', data),
    },

    attendance: {
        getByEvent: (eventId) => api.get(`/attendance/event/${eventId}`),
        mark: (eventId, data) => api.post(`/attendance/event/${eventId}/mark`, data),
    },

    quiz: {
        getByCourse: (courseId) => api.get(`/quizzes/course/${courseId}`),
        create: (courseId, userId, quizData) => api.post(`/quizzes/course/${courseId}?userId=${userId}`, quizData),
        createGlobal: (userId, quizData) => api.post(`/quizzes/create?userId=${userId}`, quizData),
        getMy: (userId) => api.get(`/quizzes/my?userId=${userId}`),
        update: (id, quizData) => api.put(`/quizzes/${id}`, quizData),
        submit: (quizId, resultData) => api.post(`/quizzes/${quizId}/submit`, resultData),
        delete: (id) => api.delete(`/quizzes/${id}`),
        generate: (data) => api.post('/quizzes/generate', data),
    },

    questionBank: {
        getMy: (userId) => api.get(`/question-bank/my?userId=${userId}`),
        add: (userId, item) => api.post(`/question-bank/add?userId=${userId}`, item),
        import: (userId, items) => api.post(`/question-bank/import?userId=${userId}`, items),
        getCategories: (userId) => api.get(`/question-bank/categories?userId=${userId}`),
        delete: (id) => api.delete(`/question-bank/${id}`),
    },

    scorm: {
        upload: (courseId, formData) => api.post(`/scorm/upload/${courseId}`, formData),
        getPackages: (courseId) => api.get(`/scorm/course/${courseId}`),
        getByCourse: (courseId) => api.get(`/scorm/course/${courseId}`),
        getOne: (id) => api.get(`/scorm/${id}`),
        update: (id, data) => api.put(`/scorm/${id}`, data),
        delete: (id) => api.delete(`/scorm/${id}`)
    },

    cmi5: {
        upload: (courseId, formData) => api.post(`/cmi5/upload/${courseId}`, formData),
        getPackages: (courseId) => api.get(`/cmi5/course/${courseId}`),
        getByCourse: (courseId) => api.get(`/cmi5/course/${courseId}`),
        getOne: (id) => api.get(`/cmi5/${id}`),
        update: (id, data) => api.put(`/cmi5/${id}`, data),
        delete: (id) => api.delete(`/cmi5/${id}`)
    },

    teacher: {
        getCourseAnalytics: (courseId) => api.get(`/teacher/analytics/course/${courseId}`),
    },

    activity: {
        log: (data) => api.post('/activity/log', data),
        getCourseLogs: (courseId) => api.get(`/activity/course/${courseId}`),
        getStudentLogs: (courseId, userId) => api.get(`/activity/course/${courseId}/student/${userId}`),
        getGlobalStudentLogs: (userId) => api.get(`/activity/student/${userId}`)
    },

    logs: {
        getFiles: () => api.get('/logs/files'),
        getContent: (filename, lines) => api.get(`/logs/content?filename=${filename || ''}&lines=${lines || 100}`),
        reportError: (errorData) => api.post('/logs/client', errorData),
    },

    branding: {
        get: (organizationKey = 'default') => api.get(`/branding?organizationKey=${organizationKey}`),
        getAll: () => api.get('/branding/all'),
        update: (updates, organizationKey = 'default') => api.put(`/branding?organizationKey=${organizationKey}`, updates),
        uploadLogo: (formData, organizationKey = 'default') => api.post(`/branding/logo?organizationKey=${organizationKey}`, formData),
        uploadFavicon: (formData, organizationKey = 'default') => api.post(`/branding/favicon?organizationKey=${organizationKey}`, formData),
        uploadLoginBackground: (formData, organizationKey = 'default') => api.post(`/branding/login-background?organizationKey=${organizationKey}`, formData),
        reset: (organizationKey = 'default') => api.post(`/branding/reset?organizationKey=${organizationKey}`),
        checkAccess: () => api.get('/branding/access'),
    },

    gamification: {
        getConfig: () => api.get('/gamification/config/system'),
        updateConfig: (data) => api.put('/gamification/config/system', data),
        getDailyChallenges: (userId) => api.get(`/gamification/challenges/daily/${userId}`),
        claimChallenge: (challengeId) => api.post(`/gamification/challenges/${challengeId}/claim`),
        getStreak: (userId) => api.get(`/gamification/streak/login/${userId}`),
        getMyStreak: () => api.get('/gamification/streak'),
        getMyAchievements: () => api.get('/gamification/achievements/my'),
        getQuests: (type = 'daily') => api.get(`/gamification/quests/${type}`),
        social: {
            getFriends: () => api.get('/gamification/social/friends'),
            sendRequest: (targetUserId) => api.post(`/gamification/social/request/${targetUserId}`, {}),
            getPendingRequests: () => api.get('/gamification/social/requests/pending'),
            acceptRequest: (requestId) => api.post(`/gamification/social/request/${requestId}/accept`, {}),
        }
    },

    evaluations: {
        getMyActive: () => api.get('/evaluations/my-active'),
        submit: (instanceId, answers) => api.post(`/evaluations/instance/${instanceId}/submit`, answers),
    },

    support: {
        createTicket: (data) => api.post('/support/tickets', data),
        getMyTickets: (userId) => api.get(`/support/tickets/my?userId=${userId}`),
        getAllTickets: () => api.get('/support/tickets'),
        updateStatus: (id, status) => api.patch(`/support/tickets/${id}/status?status=${status}`),
        respond: (id, response, severity) => api.post(`/support/tickets/${id}/respond?response=${encodeURIComponent(response)}&severity=${severity}`)
    },

    lti: {
        getAll: () => api.get('/lti/platforms'),
        save: (data) => api.post('/lti/platforms', data),
        delete: (id) => api.delete(`/lti/platforms/${id}`)
    },

    ai: {
        generatePractice: (data) => api.post('/ai/quiz/practice/generate', data),
        status: () => api.get('/ai/quiz/status'),
        generateFromText: (data) => api.post('/ai/quiz/generate-from-text', data),
        save: (data) => api.post('/ai/quiz/save', data),
        completePractice: (data) => api.post('/ai/quiz/practice/complete', data),
        tutor: {
            chat: (courseId, question) => api.post('/ai-tutor/chat', { courseId, question }),
            ingest: (courseId, documentId) => api.post('/ai-tutor/ingest', { courseId, documentId }),
            ingestCourse: (courseId) => api.post('/ai-tutor/ingest-course', { courseId }),
        },
        resources: {
            generate: (userId, type, prompt, context) => {
                const params = new URLSearchParams({ userId: userId.toString(), type, prompt });
                if (context) params.append('context', context);
                return api.post(`/ai/resources/generate?${params}`);
            }
        }
    },

    resources: {
        getMy: (userId, type) => {
            const params = new URLSearchParams({ userId: userId.toString() });
            if (type) params.append('type', type);
            return api.get(`/resources/my?${params}`);
        },
        getCommunity: () => api.get('/resources/community'),
        getOne: (id) => api.get(`/resources/${id}`),
        create: (userId, resource) => api.post(`/resources?userId=${userId}`, resource),
        update: (id, resource) => api.put(`/resources/${id}`, resource),
        delete: (id) => api.delete(`/resources/${id}`),
        updateVisibility: (id, visibility) => api.patch(`/resources/${id}/visibility?visibility=${visibility}`)
    },

    community: {
        browse: (params = {}) => {
            const searchParams = new URLSearchParams();
            if (params.subject) searchParams.set('subject', params.subject);
            if (params.type) searchParams.set('type', params.type);
            if (params.sort) searchParams.set('sort', params.sort);
            if (params.page !== undefined) searchParams.set('page', params.page);
            if (params.size) searchParams.set('size', params.size);
            return api.get(`/community/browse?${searchParams}`);
        },
        search: (query, page = 0, size = 20) => api.get(`/community/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`),
        getSubjects: () => api.get('/community/subjects'),
        getItem: (itemId) => api.get(`/community/items/${itemId}`),
        publishQuiz: (quizId, data) => api.post(`/community/publish/quiz/${quizId}`, data),
        publishAssignment: (assignmentId, data) => api.post(`/community/publish/assignment/${assignmentId}`, data),
        publishLesson: (lessonId, data) => api.post(`/community/publish/lesson/${lessonId}`, data),
        install: (itemId, courseId = null) => api.post(`/community/items/${itemId}/install${courseId ? `?courseId=${courseId}` : ''}`),
        rate: (itemId, rating, comment) => api.post(`/community/items/${itemId}/rate`, { rating, comment }),
        getMyPublished: () => api.get('/community/my-published'),
        getAuthorProfile: (userId) => api.get('/community/authors/${userId}'),
        getLeaderboard: () => api.get('/community/leaderboard'),
        admin: {
            getPending: (page = 0, size = 20) => api.get(`/community/admin/pending?page=${page}&size=${size}`),
            getPendingCount: () => api.get('/community/admin/pending/count'),
            approve: (itemId) => api.post(`/community/admin/approve/${itemId}`),
            reject: (itemId, reason) => api.post(`/community/admin/reject/${itemId}`, { reason })
        }
    },

    personalization: {
        getMyAnalysis: () => api.get('/personalization/analyze'),
        getUserAnalysis: (userId) => api.get(`/personalization/analyze/${userId}`)
    },

    principal: {
        // --- School Structure ---
        structure: {
            getDepartments: () => api.get('/admin/structure/departments'),
            createDepartment: (repo) => api.post('/admin/structure/departments', repo),
            deleteDepartment: (id) => api.delete(`/admin/structure/departments/${id}`),
            getPrograms: (deptId) => api.get(`/admin/structure/programs?departmentId=${deptId}`),
            createProgram: (repo) => api.post('/admin/structure/programs', repo),
            deleteProgram: (id) => api.delete(`/admin/structure/programs/${id}`),
            getClasses: (progId) => api.get(`/admin/structure/classes?programId=${progId}`),
            createClass: (repo) => api.post('/admin/structure/classes', repo),
            deleteClass: (id) => api.delete(`/admin/structure/classes/${id}`),
        },
        // --- Academic Governance ---
        governance: {
            getTerms: () => api.get('/admin/governance/terms'),
            createTerm: (data) => api.post('/admin/governance/terms', data),
            lockTerm: (id, locked) => api.patch(`/admin/governance/terms/${id}/lock?locked=${locked}`),
            getPolicies: () => api.get('/admin/governance/policies'),
            createPolicy: (data) => api.post('/admin/governance/policies', data),
            acceptPolicy: (id) => api.post(`/admin/governance/policies/${id}/accept`),
            checkPolicy: (id) => api.get(`/admin/governance/policies/${id}/check`),
        },
        // --- Dashboard & Metrics ---
        dashboard: {
            getMetrics: () => api.get('/principal/dashboard/metrics'),
        },
        // --- Quality & Safety ---
        quality: {
            getIncidents: () => api.get('/principal/incidents'),
            createIncident: (data) => api.post('/principal/incidents', data),
            updateIncident: (id, data) => api.put(`/principal/incidents/${id}`, data),
            getIncident: (id) => api.get(`/principal/incidents/${id}`),
            recordObservation: (data) => api.post('/admin/quality/observations', data),
            getObservationsByTeacher: (teacherId) => api.get(`/admin/quality/observations/teacher/${teacherId}`),
        },
        // --- Staffing & Substitutes ---
        staffing: {
            getSickLeave: () => api.get('/principal/staffing/sick-leave'),
            reportSickLeave: (data) => api.post('/principal/staffing/sick-leave', data),
            getSubstitutes: () => api.get('/principal/staffing/substitutes'),
            bookSubstitute: (data) => api.post('/principal/staffing/substitutes/book', data),
        },
        // --- Report Library ---
        reports: {
            getAll: () => api.get('/principal/reports'),
            generate: (type) => api.post(`/principal/reports/generate?type=${type}`),
            download: (id) => `${API_BASE}/principal/reports/${id}/download`,
        }
    }
};

/**
 * Helper to ensure URLs are safe for the current environment (Local, LAN, or Public)
 * @param {string} url - The URL to sanitise
 * @returns {string} - The corrected URL
 */
export const getSafeUrl = (url) => {
    if (!url) return null;
    let finalUrl = url;
    const origin = window.location.origin;

    // 1. Handle MinIO internal host reference
    if (finalUrl.includes('minio:9000')) {
        // Replace minio:9000 with current origin + /api/files
        finalUrl = finalUrl.replace(/http:\/\/minio:9000/g, origin + '/api/files');
    }

    // 2. Handle /api/storage legacy paths
    if (finalUrl.includes('/api/storage/')) {
        finalUrl = finalUrl.replace('/api/storage/', '/api/files/');
    }

    // 3. Handle root-relative paths by prepending origin (Vite proxy handles the rest)
    if (finalUrl.startsWith('/')) {
        return `${origin}${finalUrl}`;
    }

    // 4. Handle any MinIO localhost/IP/Internal references (9000 is MinIO port)
    if (finalUrl.includes(':9000')) {
        return finalUrl.replace(/^http:\/\/[^/]+:9000/g, origin + '/api/files');
    }

    return finalUrl;
};
