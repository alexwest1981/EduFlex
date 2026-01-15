import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const userJourneyDuration = new Trend('user_journey_duration');
const completedJourneys = new Counter('completed_journeys');

// Test configuration - Realistic user behavior
export const options = {
    stages: [
        { duration: '2m', target: 100 },  // Ramp up to 100 users
        { duration: '3m', target: 300 },  // Ramp up to 300 users
        { duration: '5m', target: 500 },  // Ramp up to 500 users
        { duration: '5m', target: 500 },  // Stay at 500 users
        { duration: '2m', target: 0 },    // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<800', 'p(99)<1500'],
        http_req_failed: ['rate<0.02'],
        errors: ['rate<0.05'],
        user_journey_duration: ['p(95)<15000'], // Full journey < 15s for 95%
    },
};

const BASE_URL = 'http://backend:8080/api';

// Realistic user personas
const PERSONAS = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'teacher1', password: 'teacher123', role: 'teacher' },
    { username: 'student1', password: 'student123', role: 'student' },
];

export default function () {
    const journeyStart = new Date();

    // Select persona
    const persona = PERSONAS[Math.floor(Math.random() * PERSONAS.length)];

    // STEP 1: Login
    let loginRes = http.post(
        `${BASE_URL}/auth/login`,
        JSON.stringify(persona),
        { headers: { 'Content-Type': 'application/json' } }
    );

    const loginSuccess = check(loginRes, {
        'login successful': (r) => r.status === 200,
    });

    if (!loginSuccess) {
        errorRate.add(1);
        return;
    }

    const token = JSON.parse(loginRes.body).token;
    const authHeaders = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    };

    sleep(1); // User reads login confirmation

    // STEP 2: View Dashboard
    let dashboardRes = http.get(`${BASE_URL}/users/me`, authHeaders);
    check(dashboardRes, {
        'dashboard loaded': (r) => r.status === 200,
    }) || errorRate.add(1);

    sleep(2); // User reviews dashboard

    // STEP 3: Browse Courses
    let coursesRes = http.get(`${BASE_URL}/courses?page=0&size=20`, authHeaders);
    check(coursesRes, {
        'courses loaded': (r) => r.status === 200,
    }) || errorRate.add(1);

    sleep(3); // User browses course list

    // STEP 4: View Calendar
    let eventsRes = http.get(`${BASE_URL}/events`, authHeaders);
    check(eventsRes, {
        'calendar loaded': (r) => r.status === 200,
    }) || errorRate.add(1);

    sleep(2); // User checks calendar

    // STEP 5: Role-specific actions
    if (persona.role === 'teacher' || persona.role === 'admin') {
        // Teachers/Admins: Create a meeting
        const newEvent = {
            title: `Meeting ${Date.now()}`,
            description: 'User journey test meeting',
            start: new Date().toISOString(),
            end: new Date(Date.now() + 3600000).toISOString(),
            type: 'MEETING',
            ownerId: 1,
        };

        let createRes = http.post(
            `${BASE_URL}/events`,
            JSON.stringify(newEvent),
            authHeaders
        );
        check(createRes, {
            'event created': (r) => r.status === 200 || r.status === 201,
        }) || errorRate.add(1);

        sleep(1);

        // Check notifications
        let notifRes = http.get(`${BASE_URL}/notifications`, authHeaders);
        check(notifRes, {
            'notifications loaded': (r) => r.status === 200 || r.status === 404,
        }) || errorRate.add(1);

    } else if (persona.role === 'student') {
        // Students: View assignments
        let assignmentsRes = http.get(`${BASE_URL}/assignments`, authHeaders);
        check(assignmentsRes, {
            'assignments loaded': (r) => r.status === 200 || r.status === 404,
        }) || errorRate.add(1);

        sleep(2); // Student reviews assignments

        // View enrolled courses
        let myCoursesRes = http.get(`${BASE_URL}/courses/student/1`, authHeaders);
        check(myCoursesRes, {
            'my courses loaded': (r) => r.status === 200 || r.status === 404,
        }) || errorRate.add(1);
    }

    sleep(1);

    // STEP 6: Logout (implicit - just end session)
    const journeyEnd = new Date();
    userJourneyDuration.add(journeyEnd - journeyStart);
    completedJourneys.add(1);

    sleep(1); // Cooldown before next iteration
}

export function handleSummary(data) {
    const summary = {
        timestamp: new Date().toISOString(),
        test_type: 'User Journey Test',
        total_requests: data.metrics.http_reqs.values.count,
        failed_requests: data.metrics.http_req_failed.values.rate * 100,
        avg_response_time: data.metrics.http_req_duration.values.avg,
        p95_response_time: data.metrics.http_req_duration.values['p(95)'],
        p99_response_time: data.metrics.http_req_duration.values['p(99)'],
        completed_journeys: data.metrics.completed_journeys.values.count,
        avg_journey_duration: data.metrics.user_journey_duration.values.avg,
    };

    return {
        'user-journey-summary.json': JSON.stringify(summary, null, 2),
        stdout: `
========================================
User Journey Test Summary
========================================
Total Requests: ${summary.total_requests}
Failed Requests: ${summary.failed_requests.toFixed(2)}%
Avg Response Time: ${summary.avg_response_time.toFixed(2)}ms
p95 Response Time: ${summary.p95_response_time.toFixed(2)}ms
p99 Response Time: ${summary.p99_response_time.toFixed(2)}ms
Completed Journeys: ${summary.completed_journeys}
Avg Journey Duration: ${(summary.avg_journey_duration / 1000).toFixed(2)}s
========================================
`,
    };
}
