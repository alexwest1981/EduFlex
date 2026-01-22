# Load Test Report - EduFlex Kubernetes Migration

**Date:** 2026-01-15
**Environment:** Kubernetes (Docker Desktop / Local)
**Tool:** k6 (running as K8s Job)

## 1. Executive Summary

Load testing was conducted to validate the stability and performance of the EduFlex application after migrating to Kubernetes. Tests focused on the backend API's ability to handle concurrent users, authentication flows, and common user journeys.

**Result:** ✅ **PASSED** (Smoke Test) / 🔄 **IN PROGRESS** (Stress Test)

## 2. Test Scenarios

### 2.1 Smoke Test
- **Purpose:** Verify basic connectivity and functionality under light load.
- **Configuration:** 10 concurrent users, 1-minute duration.
- **Findings:**
    - Initial issues with Rate Limiting (blocked after 5 logins/min).
    - **Fix:** Increased backend rate limit to 1000 requests/minute.
    - **Fix:** Updated `AuthController` to correctly look up Roles from DB during registration.
    - **Outcome:** **SUCCESS**. 100% success rate on Login, Get User, Get Courses.

### 2.2 Stress Test (Completed)
- **Purpose:** Validate performance under sustained load (Simulated "Classroom" scenario).
- **Configuration:**
    - Ramp up to 50 concurrent users.
    - Duration: ~4 minutes.
    - Actions: Register, Login, Get User, Get Courses, Get Events.
- **Observations:**
    - **Stability:** System remained stable with no crashes.
    - **Errors:** **0.00%** (Excellent reliability).
    - **Latency:** **High**. p95 response times reached ~4.0s. This indicates the backend (limited to 1 CPU) became saturated.

## 3. Performance Metrics

| Metric | Smoke Test | Stress Test | Target |
|--------|------------|-------------|--------|
| **Avg Latency** | ~4ms | ~3500ms | < 200ms |
| **P95 Latency** | ~14ms | ~4000ms | < 1000ms |
| **Error Rate** | 0.00% | 0.00% | < 1% |
| **Throughput** | ~26 RPS | ~29 RPS | N/A |

## 4. Identified Issues & Fixes

1.  **Rate Limiting:**
    - *Issue:* Default bucket size (5) was too low for load testing.
    - *Fix:* Increased to 1000 in `RateLimitingService.java`.

2.  **Registration Role Mapping:**
    - *Issue:* `AuthController` failed to map "STUDENT" string to Role entity, causing 400 Bad Request.
    - *Fix:* Injected `RoleRepository` and added manual lookup in `registerUser`.

3.  **Health Check URL:**
    - *Issue:* Middleware/Test script assumed `/api/actuator/health` but Actuator is at `/actuator/health`.
    - *Fix:* Updated test script to strip `/api` prefix for health checks.

4.  **CPU Saturation (Bottleneck):**
    - *Issue:* Backend pod (1 replica, 1 CPU limit) could not handle 50 concurrent users efficiently, leading to high latency (~4s).
    - *Recommendation:* Increase `minReplicas` to 3 for production load, or enable HPA with lower CPU threshold (current: 80%).

## 5. Next Steps

- **Scale Up:** Increase backend replicas to handle the 50+ user concurrency.
- **Database Tuning:** Verify if connection pool (HikariCP) is sufficient (default 10).
- **Caching:** Ensure Redis is being hit for `Get Courses` to reduce DB load.


## 5. Recommendations

- **Production:** Revert Rate Limit to safe values (e.g. 20-50 per min) or implement per-user limits instead of per-IP.
- **Monitoring:** Set up Prometheus alerts for high 5xx rates.
- **Scaling:** Verify HPA (Horizontal Pod Autoscaler) triggers if CPU usage spikes (hard to trigger with 50 users on local machine, but configured).

