# EduFlex Projektöversikt - Komplett Statusdokumentation

**Skapad:** 2026-01-20  
**Version:** EduFlex 2.0.1-Beta  
**Status:** Enterprise-Ready (95% komplett)

---

## 1. Projektets Struktur och Kataloger

### Rotstruktur
```
E:\Projekt\EduFlex\
├── eduflex/                    # Backend (Spring Boot)
├── frontend/                   # Frontend (React/Vite)
├── mobile/                     # Mobilapp (React Native/Expo)
├── docs/                       # Dokumentation
├── helm/                       # Kubernetes Helm charts
├── k8s/                        # Kubernetes manifests
├── keycloak/                   # SSO-konfiguration
├── grafana/                    # Monitoring dashboards
├── scripts/                    # Bygg- och deployment-skript
├── tools/                      # Verktyg (license generator)
├── uploads/                    # Användaruppladdade filer
├── backups/                    # Databasbackuper
├── assets/                     # Statiska resurser
└── data/                       # Datafiler
```

### Backend-struktur (`eduflex/`)
```
eduflex/
├── src/main/java/com/eduflex/backend/
│   ├── config/                 # Konfigurationer
│   │   ├── tenant/            # Multi-tenancy konfiguration
│   │   ├── SecurityConfig.java
│   │   ├── WebSocketConfig.java
│   │   └── OpenAPIConfig.java
│   ├── controller/             # REST API controllers
│   ├── service/                # Business logic
│   ├── repository/            # Data access layer
│   ├── model/                 # JPA entiteter
│   ├── dto/                   # Data transfer objects
│   └── security/              # Authentication & authorization
├── src/main/resources/
│   ├── application.properties
│   └── db/migration/          # Flyway migrations
└── src/test/                  # Unit tests
```

### Frontend-struktur (`frontend/`)
```
frontend/
├── src/
│   ├── components/            # React komponenter
│   │   ├── common/           # Gemensamma komponenter
│   │   ├── dashboard/        # Dashboard widgets
│   │   ├── gamification/     # Spelfiering
│   │   ├── layouts/          # Layout templates
│   │   └── MobileThemes/     # Mobilteman
│   ├── features/             # Feature-moduler
│   │   ├── auth/
│   │   ├── courses/
│   │   ├── dashboard/
│   │   └── admin/
│   ├── context/              # React Context providers
│   ├── constants/            # Konstanter
│   └── assets/               # Bilder, fonts
├── public/                   # Statiska filer
└── dist/                     # Build output
```

---

## 2. Alla Filer och Deras Syfte

### Backend-filer
- **`pom.xml`** - Maven dependencies och build configuration
- **`application.properties`** - Spring Boot konfiguration
- **`Dockerfile`** - Container build instructions
- **Controllers** - REST API endpoints (Auth, Course, User, etc.)
- **Services** - Business logic implementation
- **Models** - JPA entiteter (User, Course, Tenant, etc.)
- **Repositories** - Spring Data JPA interfaces

### Frontend-filer
- **`package.json`** - NPM dependencies och scripts
- **`vite.config.js`** - Vite build configuration
- **`tailwind.config.js`** - Tailwind CSS konfiguration
- **`App.jsx`** - Main React application component
- **`index.html`** - HTML entry point
- **Components** - Reusable UI components
- **Context providers** - Global state management

### Mobilapp-filer
- **`app.json`** - Expo configuration
- **`App.tsx`** - React Native entry point
- **`package.json`** - Mobile dependencies

### Infrastructure-filer
- **`docker-compose.yml`** - Container orchestration
- **Helm charts** - Kubernetes deployment templates
- **K8s manifests** - Kubernetes resource definitions
- **`prometheus.yml`** - Monitoring configuration

---

## 3. Teknisk Stack

### Backend (Spring Boot 3.2.3)
- **Core:** Java 21, Spring Boot 3.2.3
- **Database:** PostgreSQL 15, Spring Data JPA, Hibernate 6.4
- **Security:** Spring Security 6, JWT, OAuth2, Keycloak integration
- **Caching:** Redis 7, Spring Data Redis
- **Storage:** MinIO (S3-compatible), OpenPDF
- **Real-time:** WebSocket (STOMP/SockJS)
- **API Documentation:** Swagger/OpenAPI 3.0
- **Monitoring:** Micrometer, Actuator, Prometheus
- **Multi-tenancy:** Schema-based isolation
- **Build:** Maven 3.13.0

### Frontend (React 19)
- **Core:** React 19, Vite 5.1.6
- **Styling:** Tailwind CSS v4, CSS Variables
- **State:** Zustand, React Context
- **Routing:** React Router DOM 6.22.3
- **Real-time:** SockJS, STOMP.js
- **Rich Text:** React-Quill-new
- **Charts:** Recharts
- **Icons:** Lucide React
- **i18n:** i18next (9 språk)
- **Build:** Vite, ESLint

### Mobilapp (React Native/Expo)
- **Core:** React Native 0.81.5, Expo 54
- **Navigation:** React Navigation 7.x
- **State:** Zustand, React Query
- **Storage:** AsyncStorage, SecureStore
- **UI:** Reanimated, Gesture Handler, SVG

### Infrastructure
- **Containerization:** Docker 24+, Docker Compose
- **Orchestration:** Kubernetes, Helm
- **Database:** PostgreSQL 15 (Alpine)
- **Cache:** Redis 7 (Alpine)
- **Storage:** MinIO (S3-compatible)
- **SSO:** Keycloak 24
- **Monitoring:** Prometheus, Grafana
- **Proxy:** Nginx (recommended for production)

---

## 4. Konfigurationsfiler

### Backend Configuration
```properties
# application.properties
spring.application.name=eduflex
server.port=8080
spring.datasource.url=jdbc:postgresql://localhost:5433/eduflex
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.multiTenancy=SCHEMA
eduflex.auth.mode=internal
minio.url=http://localhost:9000
spring.data.redis.host=localhost
```

### Frontend Configuration
```javascript
// vite.config.js
export default {
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist'
  }
}
```

### Docker Configuration
```yaml
# docker-compose.yml (excerpt)
services:
  backend:
    build: ./eduflex
    ports: ["8080:8080"]
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/eduflex
      - EDUFLEX_AUTH_MODE=internal
```

---

## 5. Bygg- och Utvecklingsskript

### Backend Scripts
```bash
# Development
cd eduflex
mvn spring-boot:run

# Build
mvn clean package

# Docker build
docker build -t eduflex-backend .
```

### Frontend Scripts
```bash
# Development
cd frontend
npm run dev

# Build
npm run build

# Lint
npm run lint
```

### Mobile Scripts
```bash
# Development
cd mobile
expo start

# Platform-specific
expo start --android
expo start --ios
```

### Infrastructure Scripts
```bash
# Full stack
docker compose up --build -d

# Kubernetes
helm install eduflex ./helm/eduflex -n eduflex
```

---

## 6. Teststruktur

### Backend Tests
- **Location:** `eduflex/src/test/`
- **Framework:** JUnit 5, Spring Boot Test
- **Coverage:** Unit tests for services, integration tests for controllers
- **Test Data:** `test-data.sql` for test database setup

### Frontend Tests
- **Framework:** ESLint for code quality
- **Manual Testing:** Browser-based testing
- **Load Testing:** k6 scripts in `load-tests/`

### Mobile Tests
- **Framework:** Jest for React Native
- **Manual Testing:** Expo Go testing

---

## 7. Dokumentation

### Core Documentation
- **`README.md`** - Projektöversikt och snabbstart
- **`docs/ARCHITECTURE.md`** - Systemarkitektur
- **`docs/API.md`** - API-referens
- **`docs/TENANT_ADMIN_GUIDE.md`** - Multi-tenancy guide
- **`docs/DEPLOYMENT.md`** - Kubernetes deployment
- **`HELM_README.md`** - Helm deployment
- **`ROADMAP.md`** - Utvecklingsroadmap
- **`THEME_CREATION_RULES.md`** - Temautvecklingsregler

### API Documentation
- **Swagger UI:** http://localhost:8080/swagger-ui/index.html
- **OpenAPI Spec:** http://localhost:8080/v3/api-docs
- **Postman Collection:** Importable from OpenAPI spec

---

## 8. Databas/Modell-struktur

### Core Entities
- **User** - Användare med roller, gamification, analytics
- **Course** - Kurser med lärare, studenter, material
- **Tenant** - Multi-tenancy organisationer
- **Role** - RBAC roller (ADMIN, TEACHER, STUDENT, etc.)
- **Assignment** - Uppgifter med inlämning och betyg
- **Quiz** - Quiz med frågor och resultat
- **Notification** - Systemnotifikationer

### Gamification Models
- **Achievement** - Prestationer och badges
- **UserAchievement** - Användarens upplåsta prest.
- **DailyChallenge** - Dagliga utmaningar
- **UserStreak** - Konsekutiva inloggningar

### Multi-tenancy Structure
```
PostgreSQL Database
├── public schema (tenants metadata)
├── tenant_acme schema (isolated data)
├── tenant_school2 schema (isolated data)
└── ...
```

---

## 9. API-endpoints

### Authentication
- `POST /api/auth/login` - JWT inloggning
- `POST /api/auth/register` - Användarregistrering
- `POST /api/tenants` - Skapa ny tenant

### Core Features
- `GET /api/courses` - Kurslista
- `GET /api/users/me` - Användarprofil
- `GET /api/assignments` - Uppgifter
- `GET /api/quizzes` - Quiz

### Gamification
- `GET /api/gamification/achievements` - Prestationer
- `GET /api/gamification/streak` - Streak info
- `GET /api/gamification/challenges/daily` - Dagliga utmaningar

### Administration
- `GET /api/modules` - Systemmoduler
- `PUT /api/modules/{key}/toggle` - Aktivera modul
- `GET /api/dashboard/*` - Dashboard data

### WebSocket
- `ws://localhost:8080/ws-log` - Live log streaming
- `ws://localhost:8080/ws/chat` - Chat/messaging

---

## 10. Frontend-komponenter

### Layout Components
- **`Layout.jsx`** - Huvudlayout med navigation
- **`layouts/*`** - Specialiserade layouter (Ember, Horizon, etc.)

### Feature Components
- **`Dashboard.jsx`** - Rollbaserat dashboard
- **`CourseDetail.jsx`** - Kursdetaljvy
- **`Login.jsx`** - Inloggningssida
- **`LandingPage.jsx`** - Landningssida

### Gamification Components
- **`AchievementToast.jsx`** - Prestation-popup
- **`DailyChallengesWidget.jsx`** - Dagliga utmaningar
- **`XPBoostIndicator.jsx`** - XP boost indikator

### Mobile Themes
- **`MobileThemes/*`** - Mobilteman med intern SPA-arkitektur
- **`MobileThemeResolver.jsx`** - Tema-resolver

### Common Components
- **`ErrorBoundary.jsx`** - Felhantering
- **`UserAvatar.jsx`** - Användaravatar
- **`GlobalSearch.jsx`** - Global sökning

---

## Projektets Nuvarande Status

### Mognadsnivå: Enterprise-Ready (95% komplett)

#### ✅ Implementerade funktioner
- **Multi-tenancy:** Schema-baserad med full dataisolering
- **Kubernetes deployment:** Helm charts med monitoring
- **Gamification engine:** XP, badges, streaks, challenges
- **Real-time notifications:** WebSocket med notification bell
- **SSO integration:** Keycloak med hybrid-läge
- **White-label theming:** 8 designsystem + mobil-teman
- **File storage:** MinIO S3-kompatibel lagring
- **Monitoring:** Prometheus + Grafana dashboards
- **API documentation:** OpenAPI 3.0 med Swagger UI
- **Load testing:** k6 infrastructure
- **CI/CD:** GitHub Actions
- **i18n:** 9 språk med language switcher

#### 🔜 Planerade funktioner (Q2-Q4 2026)
- **Microservices split:** Video/PDF processing
- **Event bus:** Kafka/RabbitMQ integration
- **AI-powered quiz generation:** GPT integration
- **Mobile app:** React Native med push notifications
- **Advanced analytics:** AI-driven risk analysis

### Teknisk Skuld
- **Test coverage:** Kan utökas (backend + frontend)
- **Error handling:** Förbättras i mobil-teman
- **Performance:** Load testing behöver valideras
- **Documentation:** API docs behöver uppdateras kontinuerligt

### Production Readiness
Systemet är **produktionsklart** för:
- **Enterprise pilots:** 100-500 användare
- **SaaS deployment:** Multi-tenant arkitektur
- **Compliance:** GDPR-förberedd med audit logs
- **Scalability:** Kubernetes med auto-scaling
- **Monitoring:** Full observability stack

---

## Kvalitetssäkring

### CI/CD
- **GitHub Actions:** Automatisk build och test
- **Docker Registry:** Container builds
- **Helm Releases:** Kubernetes deployment

### Säkerhet
- **Authentication:** JWT + OAuth2 + Keycloak
- **Authorization:** RBAC med roller och permissions
- **Data Isolation:** Schema-baserad multi-tenancy
- **Audit Logging:** EntityListeners för alla ändringar
- **Encryption:** RSA-signed license keys

### Prestanda
- **Database:** PostgreSQL med connection pooling
- **Cache:** Redis för sessions och data
- **Storage:** MinIO S3-kompatibel objektlagring
- **Load Balancing:** Docker Swarm/Kubernetes ready
- **CDN:** Statiska assets via Nginx

---

## Snabbstart

### För utvecklare
```bash
# 1. Starta full stack
docker compose up --build -d

# 2. Access applikationer
# Frontend: http://localhost:5173
# Backend API: http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui/index.html
# Grafana: http://localhost:3001 (admin/admin)

# 3. Skapa tenant
curl -X POST http://localhost:8080/api/tenants \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo Org","domain":"demo","adminEmail":"admin@demo.com"}'
```

### För produktion
```bash
# 1. Kubernetes deployment
kubectl create namespace eduflex
helm install eduflex ./helm/eduflex -n eduflex

# 2. Konfigurera Ingress
# Se k8s/ingress.yaml för exempel
```

---

## Support och Underhåll

### Monitoring
- **Prometheus:** http://localhost:9090
- **Grafana:** http://localhost:3001
- **Health checks:** `/actuator/health`

### Logging
- **Application logs:** Docker logs
- **Live streaming:** WebSocket `/ws-log`
- **Debug terminal:** Frontend admin panel

### Backup
- **Database:** Automatiska PostgreSQL backuper
- **Files:** MinIO med versionering
- **Config:** Git-tracked konfiguration

---

**Utvecklad av:** Alex Weström / Fenrir Studio  
**Version:** EduFlex 2.0.1-Beta  
**Senast uppdaterad:** 2026-01-20  
**Licens:** Proprietary (EduFlex™)

---

*Denna dokumentation utgör en komplett översikt av EduFlex-projektets nuvarande status och kan användas som grund för vidare utveckling, deployment och underhåll.*