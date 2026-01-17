# EduFlex REST API Reference

> **Note:** We are moving towards Swagger (OpenAPI 3.0). Until then, this document serves as the reference.
> **Base URL:** `http://localhost:8080/api`

---

## 🔑 Multi-Tenancy Header

All API requests (except `/api/tenants`) **must include** the `X-Tenant-ID` header:

```http
X-Tenant-ID: your-tenant-id
```

This header routes the request to the correct tenant's isolated database schema.

---

## Authentication (`/api/auth`)

| Method | Endpoint | Description | Headers/Payload |
|:---:|---|---|---|
| `POST` | `/login` | Authenticate user & get JWT. | `X-Tenant-ID` + `{ "username": "...", "password": "..." }` |
| `POST` | `/register` | (Public) Create new student account. | `X-Tenant-ID` + `{ "email": "...", "password": "..." }` |

---

## Tenants (`/api/tenants`) 🆕

> **Note:** These endpoints do NOT require `X-Tenant-ID` header.

| Method | Endpoint | Description | Payload |
|:---:|---|---|---|
| `GET` | `/` | List all tenants. | – |
| `GET` | `/{id}` | Get tenant by ID. | – |
| `POST` | `/` | Create new tenant (with schema + admin user). | `{ "name", "domain", "dbSchema", "organizationKey", "adminEmail", "adminPassword", "adminFirstName", "adminLastName" }` |

**Example: Create Tenant**
```bash
curl -X POST http://localhost:8080/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme School",
    "domain": "acme.local",
    "dbSchema": "tenant_acme",
    "organizationKey": "acme",
    "adminEmail": "admin@acme.local",
    "adminPassword": "SecurePass123",
    "adminFirstName": "John",
    "adminLastName": "Admin"
  }'
```

## Courses (`/api/courses`)

| Method | Endpoint | Description | Roles |
|:---:|---|---|---|
| `GET` | `/` | List all visible courses. | All |
| `POST` | `/` | Create a new course. | Teacher, Admin |
| `GET` | `/{id}` | Get course details (modules, lessons). | All |
| `POST` | `/{id}/enroll/{uid}` | Enroll a student manually. | Teacher, Admin |

## Modules & SCORM (`/api/modules`, `/api/scorm`)

| Method | Endpoint | Description | Roles |
|:---:|---|---|---|
| `GET` | `/modules` | List all system modules (active/inactive). | All |
| `PUT` | `/modules/{key}/toggle` | Toggle module (e.g., 'SCORM') on/off. | Admin |
| `POST` | `/scorm/upload/{courseId}` | Upload SCORM .zip package. | Teacher, Admin |
| `GET` | `/scorm/course/{courseId}` | Get packages for a course. | All |

## Revenue (`/api/revenue`, `/api/invoices`)

| Method | Endpoint | Description | Roles |
|:---:|---|---|---|
| `GET` | `/revenue/analytics/mrr` | Get MRR (Monthly Recurring Revenue). | Admin |
| `GET` | `/invoices/my` | Get current user's invoices. | Student |
| `POST` | `/invoices/generate-monthly` | Trigger invoice generation cron. | Admin |

---

## Error Codes

| Code | Description |
|------|-------------|
| **400** | Bad Request – Invalid payload or validation error. |
| **401** | Unauthorized – Invalid or missing JWT token. |
| **402** | Payment Required – System locked (expired license). |
| **403** | Forbidden – Insufficient permissions. |
| **404** | Not Found – Resource does not exist. |
| **500** | Internal Server Error – Check `X-Tenant-ID` or server logs. |

---

*Updated: 2026-01-15*
