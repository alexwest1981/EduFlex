import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics to track breaking point
const errorRate = new Rate('errors');
const apiDuration = new Trend('api_duration');

export const options = {
    stages: [
        { duration: '30s', target: 50 },   // Start steady
        { duration: '1m', target: 100 },  // Increase
        { duration: '1m', target: 200 },  // Push harder
        { duration: '2m', target: 500 },  // RED ZONE - Breaking point search
        { duration: '10s', target: 0 },   // Cool down
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000'], // We want to see when it fails this
        http_req_failed: ['rate<0.10'],    // 10% failure threshold
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080/api';

export default function () {
    // Shared headers for all requests
    const params = {
        headers: {
            'Content-Type': 'application/json',
            // Note: Since we are testing the API's limit, we target public endpoints 
            // or use a pre-shared token if testing auth-protected logic.
        },
    };

    // JOURNEY: Heavy operations to stress DB and CPU

    // 1. Landing / Public Info
    const res1 = http.get(`${BASE_URL}/courses/public?page=0&size=50`, params);
    check(res1, { 'public courses 200': (r) => r.status === 200 }) || errorRate.add(1);
    apiDuration.add(res1.timings.duration);

    sleep(0.5);

    // 2. Health check (Actuator) - Checking if the system is still breathing
    const healthRes = http.get(BASE_URL.replace('/api', '/actuator/health'), params);
    check(healthRes, { 'system breathing': (r) => r.status === 200 }) || errorRate.add(1);

    sleep(0.5);

    // 3. Simulated heavy query (Search)
    const res2 = http.get(`${BASE_URL}/courses/search?query=math&page=0&size=20`, params);
    check(res2, { 'search results 200': (r) => r.status === 200 }) || errorRate.add(1);

    sleep(1);
}
