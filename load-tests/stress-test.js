import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const apiDuration = new Trend('api_duration');

// Test configuration
export const options = {
    stages: [
        { duration: '30s', target: 20 },  // Ramp up to 20 users
        { duration: '1m', target: 50 },   // Ramp up to 50 users
        { duration: '2m', target: 50 },   // Stay at 50 users
        { duration: '30s', target: 0 },   // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<1000', 'p(99)<2000'],
        http_req_failed: ['rate<0.05'], // Allow 5% for now
        errors: ['rate<0.05'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://host.docker.internal:8080/api';

// Per-VU state
let token = null;
let currentUser = null;

export default function () {
    // 1. Setup/Login (Run once per VU)
    if (!token) {
        currentUser = {
            username: `stress_${__VU}`,
            password: 'password123',
            email: `stress_${__VU}@eduflex.se`,
            firstName: `Stress`,
            lastName: `User${__VU}`,
            role: { name: 'STUDENT' }
        };

        // Try register
        http.post(
            `${BASE_URL}/auth/register`,
            JSON.stringify(currentUser),
            { headers: { 'Content-Type': 'application/json' } }
        );

        // Login
        const loginStart = new Date();
        const loginRes = http.post(
            `${BASE_URL}/auth/login`,
            JSON.stringify({ username: currentUser.username, password: currentUser.password }),
            { headers: { 'Content-Type': 'application/json' } }
        );
        loginDuration.add(new Date() - loginStart);

        const loginSuccess = check(loginRes, {
            'login status is 200': (r) => r.status === 200,
            'login returns token': (r) => r.json('token') !== undefined,
        });

        if (!loginSuccess) {
            console.log(`Login failed for ${currentUser.username}: ${loginRes.status} ${loginRes.body}`);
            errorRate.add(1);
            sleep(5); // Wait before retrying next iteration
            return;
        }

        token = loginRes.json('token');
    }

    const authHeaders = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    };

    // 2. Main User Journey Loop

    // Get User
    const t1 = new Date();
    const headers = authHeaders;
    const userRes = http.get(`${BASE_URL}/users/me`, headers);
    apiDuration.add(new Date() - t1);
    check(userRes, { 'get user 200': (r) => r.status === 200 }) || errorRate.add(1);

    sleep(1);

    // Get Courses
    const t2 = new Date();
    const coursesRes = http.get(`${BASE_URL}/courses?page=0&size=20`, headers);
    apiDuration.add(new Date() - t2);
    check(coursesRes, { 'get courses 200': (r) => r.status === 200 }) || errorRate.add(1);

    sleep(1);

    // Get Events
    const t3 = new Date();
    const eventsRes = http.get(`${BASE_URL}/events`, headers);
    apiDuration.add(new Date() - t3);
    // Expect 200, but if internal auth mode bug exists, might issue 500?
    // We log error if it fails
    if (!check(eventsRes, { 'get events 200': (r) => r.status === 200 })) {
        errorRate.add(1);
        // console.log('Events failed: ' + eventsRes.status);
    }

    sleep(2);
}
