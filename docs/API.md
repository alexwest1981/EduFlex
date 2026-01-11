# EduFlex REST API Reference DEPRECATED (Use Swagger/OpenAPI in v2.1)

> **Note:** We are moving towards Swagger (OpenAPI 3.0). Until then, this document serves as the reference.
> **Base URL:** `http://localhost:8080/api`

## Authentication (`/api/auth`)

| Method | Endpoint | Description | Paylaod |
|:---:|---|---|---|
| `POST` | `/login` | Authenticate user & get JWT. | `{ "username": "...", "password": "..." }` |
| `POST` | `/register` | (Public) Create new student account. | `{ "email": "...", "password": "..." }` |

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

- **401 Unauthorized:** Invalid or missing JWT token.
- **402 Payment Required:** System is locked due to expired license or unpaid invoice.
- **403 Forbidden:** Correct token, but insufficient permissions (e.g. Student trying to delete course).
- **404 Not Found:** Resource does not exist.
