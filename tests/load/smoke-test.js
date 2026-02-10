import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ============================================================
// EduFlex LMS - Smoke & Load Test med Ramp-Up
// Syfte: Hitta systemets gränser genom gradvis ökning av last
// Target: https://www.eduflexlms.se
// ============================================================

// --- KONFIGURATION ---
const BASE_URL = __ENV.BASE_URL || 'https://www.eduflexlms.se';
const USERNAME = __ENV.K6_USERNAME || 'testuser';
const PASSWORD = __ENV.K6_PASSWORD || 'testpass';

// --- CUSTOM METRICS ---
const loginDuration = new Trend('login_duration', true);
const courseListDuration = new Trend('course_list_duration', true);
const aiTutorDuration = new Trend('ai_tutor_duration', true);
const errorRate = new Rate('errors');

// --- RAMP-UP STAGES ---
export const options = {
    stages: [
        { duration: '30s', target: 1 },    // Stage 1: Smoke (funkar det?)
        { duration: '1m', target: 5 },      // Stage 2: Baseline
        { duration: '2m', target: 15 },     // Stage 3: Normal load
        { duration: '2m', target: 30 },     // Stage 4: Peak load
        { duration: '2m', target: 50 },     // Stage 5: Stress
        { duration: '2m', target: 75 },     // Stage 6: Breaking point?
        { duration: '1m', target: 100 },    // Stage 7: Max stress
        { duration: '30s', target: 0 },     // Stage 8: Cooldown
    ],
    thresholds: {
        http_req_failed: ['rate<0.05'],             // < 5% HTTP errors
        http_req_duration: ['p(95)<2000'],           // p95 < 2s
        'http_req_duration{scenario:default}': ['p(99)<5000'],  // p99 < 5s
        errors: ['rate<0.1'],                        // Custom error rate < 10%
        login_duration: ['p(95)<3000'],              // Login p95 < 3s
        course_list_duration: ['p(95)<2000'],        // Course list p95 < 2s
        ai_tutor_duration: ['p(95)<15000'],          // AI tutor p95 < 15s (AI is slow)
    },
};

// --- HJÄLPFUNKTIONER ---
const headers = {
    'Content-Type': 'application/json',
};

function authHeaders(token) {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
}

function login() {
    const res = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
        username: USERNAME,
        password: PASSWORD,
    }), { headers, tags: { name: 'login' } });

    loginDuration.add(res.timings.duration);

    const success = check(res, {
        'login: status 200': (r) => r.status === 200,
        'login: has token': (r) => {
            try {
                return JSON.parse(r.body).token !== undefined;
            } catch {
                return false;
            }
        },
    });

    if (!success) {
        errorRate.add(1);
        console.error(`Login failed: ${res.status} - ${res.body}`);
        return null;
    }

    errorRate.add(0);
    const body = JSON.parse(res.body);
    return {
        token: body.token,
        userId: body.id,
        role: body.role,
    };
}

// --- SCENARIO 1: Student Learning Flow (60%) ---
function studentLearningFlow(auth) {
    group('Student Learning Flow', () => {
        // 1. Hämta mina kurser
        let res = http.get(`${BASE_URL}/api/courses/my-courses`, {
            headers: authHeaders(auth.token),
            tags: { name: 'my-courses' },
        });
        courseListDuration.add(res.timings.duration);
        const coursesOk = check(res, {
            'my-courses: status 200': (r) => r.status === 200,
        });
        if (!coursesOk) { errorRate.add(1); return; }
        errorRate.add(0);

        let courses = [];
        try { courses = JSON.parse(res.body); } catch { /* ignore */ }

        sleep(1);

        // 2. Öppna en kurs (om det finns kurser)
        if (courses.length > 0) {
            const courseId = courses[0].id || courses[0].courseId;
            if (courseId) {
                res = http.get(`${BASE_URL}/api/courses/${courseId}`, {
                    headers: authHeaders(auth.token),
                    tags: { name: 'course-detail' },
                });
                check(res, { 'course-detail: status 200': (r) => r.status === 200 });
                errorRate.add(res.status !== 200 ? 1 : 0);

                sleep(0.5);

                // 3. Hämta kursmaterial
                res = http.get(`${BASE_URL}/api/courses/${courseId}/materials`, {
                    headers: authHeaders(auth.token),
                    tags: { name: 'course-materials' },
                });
                check(res, { 'materials: status 200': (r) => r.status === 200 });
                errorRate.add(res.status !== 200 ? 1 : 0);
            }
        }

        sleep(0.5);

        // 4. Kolla notifikationer
        res = http.get(`${BASE_URL}/api/notifications/user/${auth.userId}/unread-count`, {
            headers: authHeaders(auth.token),
            tags: { name: 'notifications-count' },
        });
        check(res, { 'notifications: status 200': (r) => r.status === 200 });
        errorRate.add(res.status !== 200 ? 1 : 0);

        // 5. Activity ping
        res = http.post(`${BASE_URL}/api/users/ping`, null, {
            headers: authHeaders(auth.token),
            tags: { name: 'user-ping' },
        });

        sleep(1);
    });
}

// --- SCENARIO 2: AI Tutor Chat (15%) ---
function aiTutorFlow(auth) {
    group('AI Tutor Chat', () => {
        // 1. Hämta kurser
        let res = http.get(`${BASE_URL}/api/courses/my-courses`, {
            headers: authHeaders(auth.token),
            tags: { name: 'ai-my-courses' },
        });

        let courses = [];
        try { courses = JSON.parse(res.body); } catch { /* ignore */ }
        if (courses.length === 0) return;

        const courseId = courses[0].id || courses[0].courseId;
        if (!courseId) return;

        sleep(1);

        // 2. Ställ en fråga till AI-tutorn
        const questions = [
            'Kan du sammanfatta det viktigaste i den här kursen?',
            'Vad är de centrala begreppen jag bör förstå?',
            'Kan du förklara huvudtemat i kursmaterialet?',
            'Ge mig en kort översikt av kursinnehållet.',
        ];
        const question = questions[Math.floor(Math.random() * questions.length)];

        res = http.post(`${BASE_URL}/api/ai-tutor/chat`, JSON.stringify({
            courseId: courseId,
            question: question,
        }), {
            headers: authHeaders(auth.token),
            tags: { name: 'ai-tutor-chat' },
            timeout: '30s',
        });

        aiTutorDuration.add(res.timings.duration);
        const aiOk = check(res, {
            'ai-tutor: status 200': (r) => r.status === 200,
            'ai-tutor: has answer': (r) => {
                try { return JSON.parse(r.body).answer !== undefined; } catch { return false; }
            },
        });
        errorRate.add(aiOk ? 0 : 1);

        sleep(2);
    });
}

// --- SCENARIO 3: Meddelanden (15%) ---
function messagesFlow(auth) {
    group('Messages Flow', () => {
        // 1. Inbox
        let res = http.get(`${BASE_URL}/api/messages/inbox`, {
            headers: authHeaders(auth.token),
            tags: { name: 'messages-inbox' },
        });
        check(res, { 'inbox: status 200': (r) => r.status === 200 });
        errorRate.add(res.status !== 200 ? 1 : 0);

        sleep(0.5);

        // 2. Olästa meddelanden
        res = http.get(`${BASE_URL}/api/messages/unread`, {
            headers: authHeaders(auth.token),
            tags: { name: 'messages-unread' },
        });
        check(res, { 'unread: status 200': (r) => r.status === 200 });
        errorRate.add(res.status !== 200 ? 1 : 0);

        sleep(0.5);

        // 3. Kontakter
        res = http.get(`${BASE_URL}/api/messages/contacts`, {
            headers: authHeaders(auth.token),
            tags: { name: 'messages-contacts' },
        });
        check(res, { 'contacts: status 200': (r) => r.status === 200 });
        errorRate.add(res.status !== 200 ? 1 : 0);

        sleep(1);
    });
}

// --- SCENARIO 4: Health / Public (10%) ---
function publicFlow() {
    group('Public Endpoints', () => {
        // 1. Health check
        let res = http.get(`${BASE_URL}/actuator/health`, {
            tags: { name: 'health' },
        });
        check(res, {
            'health: status 200': (r) => r.status === 200,
            'health: status UP': (r) => {
                try { return JSON.parse(r.body).status === 'UP'; } catch { return false; }
            },
        });
        errorRate.add(res.status !== 200 ? 1 : 0);

        sleep(0.5);

        // 2. Branding
        res = http.get(`${BASE_URL}/api/branding`, {
            headers,
            tags: { name: 'branding' },
        });
        check(res, { 'branding: status 2xx': (r) => r.status >= 200 && r.status < 300 });

        sleep(0.5);

        // 3. Gamification config
        res = http.get(`${BASE_URL}/api/gamification/config/system`, {
            headers,
            tags: { name: 'gamification-config' },
        });

        sleep(1);
    });
}

// --- HUVUDLOOP ---
export default function () {
    // Slumpa scenario baserat på viktning
    const roll = Math.random();

    if (roll < 0.10) {
        // 10% - Public/Health (ingen auth behövs)
        publicFlow();
    } else {
        // 90% - Kräver auth
        const auth = login();
        if (!auth) {
            sleep(2);
            return;
        }

        if (roll < 0.25) {
            // 15% - Meddelanden
            messagesFlow(auth);
        } else if (roll < 0.40) {
            // 15% - AI Tutor
            aiTutorFlow(auth);
        } else {
            // 60% - Student Learning Flow
            studentLearningFlow(auth);
        }
    }

    sleep(1 + Math.random() * 2); // 1-3s think time
}

// --- SAMMANFATTNING ---
export function handleSummary(data) {
    const lines = [
        '\n' + '='.repeat(60),
        '  EDUFLEX LMS - LASTTEST RESULTAT',
        '='.repeat(60),
        '',
        `  Target:     ${BASE_URL}`,
        `  Max VUs:    ${data.metrics.vus_max ? data.metrics.vus_max.values.max : 'N/A'}`,
        `  Requests:   ${data.metrics.http_reqs ? data.metrics.http_reqs.values.count : 0}`,
        `  Duration:   ${data.metrics.iteration_duration ? (data.metrics.iteration_duration.values.avg / 1000).toFixed(1) + 's avg' : 'N/A'}`,
        '',
        '  RESPONSE TIMES:',
        `    p50:  ${data.metrics.http_req_duration ? data.metrics.http_req_duration.values['p(50)'].toFixed(0) : 'N/A'}ms`,
        `    p95:  ${data.metrics.http_req_duration ? data.metrics.http_req_duration.values['p(95)'].toFixed(0) : 'N/A'}ms`,
        `    p99:  ${data.metrics.http_req_duration ? data.metrics.http_req_duration.values['p(99)'].toFixed(0) : 'N/A'}ms`,
        `    max:  ${data.metrics.http_req_duration ? data.metrics.http_req_duration.values.max.toFixed(0) : 'N/A'}ms`,
        '',
        `  ERROR RATE: ${data.metrics.http_req_failed ? (data.metrics.http_req_failed.values.rate * 100).toFixed(2) : 0}%`,
        '',
    ];

    // Check thresholds
    const thresholdResults = data.root_group ? '' : '';
    if (data.metrics.http_req_duration) {
        const p95 = data.metrics.http_req_duration.values['p(95)'];
        lines.push(p95 < 2000
            ? '  ✓ p95 response time UNDER 2s threshold'
            : `  ✗ p95 response time OVER 2s threshold (${p95.toFixed(0)}ms)`);
    }
    if (data.metrics.http_req_failed) {
        const failRate = data.metrics.http_req_failed.values.rate;
        lines.push(failRate < 0.05
            ? '  ✓ Error rate UNDER 5% threshold'
            : `  ✗ Error rate OVER 5% threshold (${(failRate * 100).toFixed(2)}%)`);
    }

    lines.push('', '='.repeat(60), '');

    console.log(lines.join('\n'));

    return {
        stdout: lines.join('\n'),
    };
}
