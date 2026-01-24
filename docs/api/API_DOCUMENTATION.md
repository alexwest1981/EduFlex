# EduFlex API Documentation

## OpenAPI 3.0 / Swagger UI

EduFlex backend provides complete API documentation using OpenAPI 3.0 specification with Swagger UI.

### Accessing the Documentation

**Swagger UI (Interactive):**
- URL: http://localhost:8080/swagger-ui/index.html
- Features:
  - Browse all API endpoints
  - View request/response schemas
  - Test endpoints directly in browser
  - JWT authentication support

**OpenAPI JSON Spec:**
- URL: http://localhost:8080/v3/api-docs
- Use this URL to import into Postman, Insomnia, or other API clients

**OpenAPI YAML Spec:**
- URL: http://localhost:8080/v3/api-docs.yaml

---

## Importing to Postman

### Method 1: Direct Import from URL

1. Open Postman
2. Click "Import" button
3. Select "Link" tab
4. Enter: `http://localhost:8080/v3/api-docs`
5. Click "Continue" → "Import"

### Method 2: Download and Import

1. Download the OpenAPI spec:
   ```bash
   curl http://localhost:8080/v3/api-docs > eduflex-api.json
   ```

2. In Postman:
   - Click "Import"
   - Drag and drop `eduflex-api.json`
   - Click "Import"

---

## Authentication in Swagger UI

### Using JWT Token

1. Obtain a JWT token:
   ```bash
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```

2. Copy the `token` from the response

3. In Swagger UI:
   - Click the "Authorize" button (🔒 icon)
   - Enter: `Bearer YOUR_TOKEN_HERE`
   - Click "Authorize"
   - Click "Close"

4. Now you can test all authenticated endpoints!

---

## API Overview

### Core Modules

**Authentication & Users**
- `/api/auth/*` - Login, register, password reset
- `/api/users/*` - User management, profiles, contacts

**Courses & Content**
- `/api/courses/*` - Course CRUD, enrollment, content
- `/api/assignments/*` - Assignment submission and grading
- `/api/quizzes/*` - Quiz creation and taking

**Calendar & Events**
- `/api/events/*` - Calendar events, bookings, approvals

**Communication**
- `/api/messages/*` - Internal messaging
- `/api/notifications/*` - System notifications

**Administration**
- `/api/settings/*` - System settings
- `/api/branding/*` - White-label customization
- `/api/logs/*` - System logs and debugging

**Analytics**
- `/api/dashboard/*` - Dashboard data
- `/api/reports/*` - Reporting and exports

---

## Response Formats

All API responses follow standard HTTP status codes:

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Standard Response Structure

**Success:**
```json
{
  "id": 123,
  "name": "Example",
  "createdAt": "2026-01-15T08:00:00Z"
}
```

**Error:**
```json
{
  "timestamp": "2026-01-15T08:00:00.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/users"
}
```

---

## Rate Limiting

API endpoints are rate-limited using Redis-backed token bucket:

- **Default:** 100 requests per minute per IP
- **Authenticated:** 500 requests per minute per user
- **Headers:**
  - `X-RateLimit-Limit` - Max requests allowed
  - `X-RateLimit-Remaining` - Requests remaining
  - `X-RateLimit-Reset` - Time until reset (seconds)

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page` - Page number (0-indexed, default: 0)
- `size` - Items per page (default: 20, max: 100)
- `sort` - Sort field and direction (e.g., `name,asc`)

**Example:**
```
GET /api/users?page=0&size=20&sort=createdAt,desc
```

**Response:**
```json
{
  "content": [...],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 150,
  "totalPages": 8,
  "last": false
}
```

---

## WebSocket Endpoints

Real-time features use WebSocket connections:

**Debug Terminal:**
- URL: `ws://localhost:8080/ws-log`
- Auth: JWT token in connection header

**Chat:**
- URL: `ws://localhost:8080/ws/chat`
- Auth: JWT token in connection header

---

## Development

### Updating API Documentation

The OpenAPI spec is auto-generated from Spring Boot controllers. To customize:

1. Edit `OpenAPIConfig.java` for global settings
2. Add annotations to controllers:
   ```java
   @Operation(summary = "Get user by ID", description = "Returns a single user")
   @ApiResponses(value = {
       @ApiResponse(responseCode = "200", description = "Success"),
       @ApiResponse(responseCode = "404", description = "User not found")
   })
   @GetMapping("/{id}")
   public User getUserById(@PathVariable Long id) { ... }
   ```

3. Rebuild backend to see changes

---

## Production Deployment

For production, update the server URL in `OpenAPIConfig.java`:

```java
.servers(List.of(
    new Server()
        .url("https://api.eduflex.se")
        .description("Production Server")
))
```

---

**Developed by Alex Weström / Fenrir Studio**  
**© 2026 EduFlex™**
