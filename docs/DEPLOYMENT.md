# EduFlex Deployment Guide

This guide covers how to deploy, manage, and scale EduFlex using Docker.

## 1. Prerequisites

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Git**

## 2. Quick Start

Run the entire stack (Database, Backend, Frontend, Cache, Storage, Monitoring):

```bash
docker compose up -d --build
```

Access the services:
- **LMS Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:8080/api`
- **MinIO Console:** `http://localhost:9001` (User: `minioadmin` / Pass: `minioadmin`)
- **Grafana:** `http://localhost:3000` (User: `admin` / Pass: `admin`)
- **Prometheus:** `http://localhost:9090`

## 3. Environment Variables

The system is pre-configured via `docker-compose.yml`. For production, override these in a `.env` file or CI/CD secrets.

### Backend (`eduflex-backend`)
| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_DATASOURCE_URL` | JDBC Connection string | `jdbc:postgresql://db:5432/eduflex` |
| `SPRING_DATASOURCE_PASSWORD` | DB Password | `gotland81` |
| `SPRING_DATA_REDIS_HOST` | Redis Host | `redis` |
| `MINIO_URL` | Object Storage URL | `http://minio:9000` |
| `MINIO_ACCESS_KEY` | Storage Access Key | `minioadmin` |
| `MINIO_SECRET_KEY` | Storage Secret Key | `minioadmin` |

### Frontend (`eduflex-frontend`)
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | URL to Backend API | `http://localhost:8080/api` |

## 4. Operations

### Backups
Backups run automatically daily at 03:00 (via `db-backup` container).
- **Location:** `./backups/daily/`
- **Manual Backup:** `docker compose exec db-backup /backup.sh`

### Viewing Logs
```bash
# All logs
docker compose logs -f

# Backend only
docker compose logs -f backend

# Frontend only
docker compose logs -f frontend
```

### Updates
To update the application code:
```bash
git pull origin master
docker compose up -d --build
```

## 5. Troubleshooting

**Common Issues:**

1. **"Connection Refused" to Backend:**
   - Wait 30s. The backend takes time to initialize JPA and connect to Redis.
   - Check logs: `docker compose logs backend`

2. **SCORM Upload Failed:**
   - Ensure the `./uploads` folder is writable.
   - Check if the zip file is corrupted.

3. **License Error (402/403):**
   - Ensure `eduflex.license` is present in the root.
   - If missing, rapid-gen a dev license (see internal docs).
