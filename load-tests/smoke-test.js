import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
    stages: [
        { duration: '30s', target: 10 }, // Ramp up to 10 users
        { duration: '30s', target: 10 }, // Stay at 10 users
        { duration: '10s', target: 0 },  // Ramp down to 0
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
        errors: ['rate<0.1'],              // Error rate should be below 10%
    },
};

const BASE_URL = 'http://backend:8080/api';

// Test data
const TEST_USER = {
    username: 'admin',
    password: 'admin123',
};

export default function () {
    // Test 1: Health check
    let healthRes = http.get(`${BASE_URL}/actuator/health`);
    check(healthRes, {
        'health check status is 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    sleep(1);

    // Test 2: Login
    let loginRes = http.post(
        `${BASE_URL}/auth/login`,
        JSON.stringify(TEST_USER),
        {
            headers: { 'Content-Type': 'application/json' },
        }
    );

    const loginSuccess = check(loginRes, {
        'login status is 200': (r) => r.status === 200,
        'login returns token': (r) => {
            try {
                const body = JSON.parse(r.body);
                return body.token !== undefined;
            } catch (e) {
                return false;
            }
        },
    });

    if (!loginSuccess) {
        errorRate.add(1);
        return; // Stop if login fails
    }

    const token = JSON.parse(loginRes.body).token;
    const authHeaders = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    };

    sleep(1);

    // Test 3: Get current user
    let userRes = http.get(`${BASE_URL}/users/me`, authHeaders);
    check(userRes, {
        'get user status is 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    sleep(1);

    // Test 4: Get courses (with pagination)
    let coursesRes = http.get(`${BASE_URL}/courses?page=0&size=20`, authHeaders);
    check(coursesRes, {
        'get courses status is 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    sleep(1);
}
