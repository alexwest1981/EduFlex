# EduFlex Load Testing

Load testing suite for EduFlex LMS API using k6.

## Prerequisites

- Docker and Docker Compose
- EduFlex backend running on `http://localhost:8080`

## Test Scenarios

### 1. Smoke Test (`smoke-test.js`)
**Purpose:** Verify basic API functionality with minimal load

- **Users:** 10 concurrent
- **Duration:** ~1 minute
- **Endpoints:** Health, Login, User profile, Courses
- **Thresholds:**
  - p95 response time < 500ms
  - Error rate < 10%

**Run:**
```bash
docker run --rm -i --network eduflex_default -v ${PWD}/load-tests:/scripts grafana/k6 run /scripts/smoke-test.js
```

### 2. Stress Test (`stress-test.js`)
**Purpose:** Find system breaking point with high load

- **Users:** 100 → 500 → 1000 (ramp up)
- **Duration:** ~10 minutes
- **Endpoints:** All major API endpoints + write operations
- **Thresholds:**
  - p95 response time < 1000ms
  - p99 response time < 2000ms
  - Error rate < 1%

**Run:**
```bash
docker run --rm -i --network eduflex_default -v ${PWD}/load-tests:/scripts grafana/k6 run /scripts/stress-test.js
```

### 3. User Journey Test (`user-journey.js`)
**Purpose:** Simulate realistic user behavior

- **Users:** 100 → 300 → 500 (ramp up)
- **Duration:** ~17 minutes
- **Flow:**
  1. Login
  2. View Dashboard
  3. Browse Courses
  4. View Calendar
  5. Role-specific actions (create meeting/view assignments)
  6. Logout
- **Thresholds:**
  - p95 response time < 800ms
  - p99 response time < 1500ms
  - Full journey < 15s for 95% of users
  - Error rate < 2%

**Run:**
```bash
docker run --rm -i --network eduflex_default -v ${PWD}/load-tests:/scripts grafana/k6 run /scripts/user-journey.js
```

## Running Tests

### Quick Start (Windows PowerShell)
```powershell
# Navigate to project root
cd E:\Projekt\EduFlex

# Run smoke test
docker run --rm -i --network eduflex_default -v ${PWD}/load-tests:/scripts grafana/k6 run /scripts/smoke-test.js

# Run stress test (WARNING: High load!)
docker run --rm -i --network eduflex_default -v ${PWD}/load-tests:/scripts grafana/k6 run /scripts/stress-test.js

# Run user journey test
docker run --rm -i --network eduflex_default -v ${PWD}/load-tests:/scripts grafana/k6 run /scripts/user-journey.js
```

### With HTML Report
```powershell
# Install k6 HTML report extension (one-time)
docker pull grafana/k6

# Run with HTML output
docker run --rm -i --network eduflex_default -v ${PWD}/load-tests:/scripts -v ${PWD}/load-tests/reports:/reports grafana/k6 run --out json=/reports/results.json /scripts/stress-test.js
```

## Test Data Requirements

The tests expect the following users to exist in the database:

- **Admin:** `admin` / `admin123`
- **Teacher:** `teacher1` / `teacher123`
- **Student:** `student1` / `student123`

Create these users via the EduFlex UI or database seeding before running tests.

## Interpreting Results

### Key Metrics

**Response Time:**
- `http_req_duration` - Total request duration
- `p(95)` - 95th percentile (95% of requests faster than this)
- `p(99)` - 99th percentile (99% of requests faster than this)

**Throughput:**
- `http_reqs` - Total number of requests
- `http_reqs/s` - Requests per second

**Errors:**
- `http_req_failed` - Percentage of failed requests
- `errors` - Custom error rate

### Success Criteria

✅ **PASS** if:
- p95 response time < 1000ms
- Error rate < 1%
- No crashes or memory leaks
- System handles 1000+ concurrent users

⚠️ **WARNING** if:
- p95 response time 1000-2000ms
- Error rate 1-5%
- Some endpoints slow but functional

❌ **FAIL** if:
- p95 response time > 2000ms
- Error rate > 5%
- System crashes or becomes unresponsive

## Common Issues

### Connection Refused
**Problem:** k6 can't reach backend
**Solution:** Ensure backend is running and k6 uses `--network eduflex_default`

### High Error Rate
**Problem:** Many 401/500 errors
**Solution:** Check test users exist and backend logs for errors

### Slow Response Times
**Problem:** p95 > 2000ms
**Solution:** Check database connections, Redis cache, and Hibernate queries

## Bottleneck Analysis

Expected bottlenecks to investigate:

1. **Database Connection Pool** - PostgreSQL max connections
2. **Redis Cache** - Cache hit ratio and memory
3. **JWT Validation** - CPU usage during token validation
4. **Hibernate N+1 Queries** - Lazy loading issues
5. **Docker Resource Limits** - CPU/Memory constraints

## Next Steps

After running tests:

1. Review `summary.json` output
2. Identify bottlenecks from metrics
3. Update `LOAD_TEST_REPORT.md` with findings
4. Implement optimizations
5. Re-run tests to verify improvements

---

**Developed by Alex Weström / Fenrir Studio**  
**© 2026 EduFlex™**
