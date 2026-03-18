# 🏢 EduFlex Tenant Administration Guide

> Komplett guide för hantering av multi-tenant-arkitekturen i EduFlex 2.0

---

## 📖 Innehåll

1. [Översikt](#-översikt)
2. [Skapa ny Tenant (Organisation)](#-skapa-ny-tenant-organisation)
3. [Åtkomst till Tenant-EduFlex](#-åtkomst-till-tenant-eduflex)
4. [Inloggning](#-inloggning)
5. [Keycloak Administration](#-keycloak-administration)
6. [Felsökning](#-felsökning)

---

## 🌐 Översikt

EduFlex använder **schema-baserad multi-tenancy** där varje organisation (tenant) har:
- Ett eget PostgreSQL-schema med isolerad data
- Ett unikt `X-Tenant-ID` för routing
- Valfritt: egen Keycloak realm för SSO

```
┌─────────────────────────────────────────────────────────────┐
│                     PostgreSQL Database                      │
├─────────────────┬─────────────────┬─────────────────────────┤
│  public schema  │  tenant_acme    │  tenant_school2        │
│  ───────────────│  ───────────────│  ───────────────────── │
│  • tenants      │  • app_users    │  • app_users           │
│  (alla tenants) │  • courses      │  • courses             │
│                 │  • roles        │  • roles               │
└─────────────────┴─────────────────┴─────────────────────────┘
```

---

## 🆕 Skapa ny Tenant (Organisation)

### Via Frontend (Rekommenderat)

1. Gå till **EduFlex registreringssida**:
   ```
   http://localhost:5173/register-organization
   ```

2. Fyll i formuläret:
   - **Organisationsnamn** – T.ex. "Stockholms Tekniska Gymnasium"
   - **Domän** – T.ex. "stg.local" (används för framtida subdomain-routing)
   - **Schema-namn** – T.ex. "tenant_stg" (databasschema)
   - **Org-nyckel** – T.ex. "stg" (kort unik identifierare)
   - **Admin E-post** – Admin-kontot för denna organisation
   - **Admin Lösenord** – Välj ett starkt lösenord
   - **Admin Förnamn/Efternamn**

3. Klicka **"Registrera Organisation"**

### Via API (Curl/Script)

```bash
curl -X POST http://localhost:8080/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Stockholms Tekniska Gymnasium",
    "domain": "stg.local",
    "dbSchema": "tenant_stg",
    "organizationKey": "stg",
    "adminEmail": "admin@stg.local",
    "adminPassword": "SecurePass123!",
    "adminFirstName": "Anna",
    "adminLastName": "Andersson"
  }'
```

**Svar vid framgång (200 OK):**
```json
{
  "id": "stg",
  "name": "Stockholms Tekniska Gymnasium",
  "dbSchema": "tenant_stg",
  "domain": "stg.local",
  "active": true
}
```

### Vad händer automatiskt?

Vid tenant-skapande:
1. ✅ Tenant-metadata sparas i `public.tenants`
2. ✅ PostgreSQL-schema `tenant_stg` skapas
3. ✅ Alla 40+ tabeller migreras via Flyway
4. ✅ ADMIN-roll skapas i det nya schemat
5. ✅ Admin-användare skapas med krypterat lösenord

---

## 🔗 Åtkomst till Tenant-EduFlex

### Steg 1: Välj Tenant vid Login

Frontend skickar automatiskt rätt `X-Tenant-ID` header baserat på:
- URL-subdomain (framtida implementation)
- Manuell tenant-väljare
- LocalStorage-cache

### Steg 2: Manuell Åtkomst

Om du vill testa manuellt, skicka header i varje request:

```bash
# Exempel: Hämta kurser för tenant "stg"
curl http://localhost:8080/api/courses \
  -H "X-Tenant-ID: stg" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Framtida: Subdomain-routing

I produktion kan varje tenant få en egen subdomain:
```
https://stg.eduflex.se     → X-Tenant-ID: stg
https://acme.eduflex.se    → X-Tenant-ID: acme
```

---

## 🔐 Inloggning

### Lokal Inloggning (Standard)

1. Gå till: `http://localhost:5173/login`
2. Välj tenant (om promptad)
3. Ange e-post och lösenord
4. System skickar `X-Tenant-ID` header automatiskt

**API-exempel:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: stg" \
  -d '{
    "username": "admin@stg.local",
    "password": "SecurePass123!"
  }'
```

**Svar vid framgång:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "admin@stg.local",
    "firstName": "Anna",
    "role": { "name": "ADMIN" }
  }
}
```

### SSO via Keycloak (Enterprise)

1. Klicka **"Logga in med SSO"** på login-sidan
2. Omdirigeras till Keycloak-inloggning
3. Efter godkänd inloggning: omdirigeras tillbaka med JWT

---

## 🛡️ Keycloak Administration

### Åtkomst till Keycloak Admin Console

| Miljö | URL | Standard-inloggning |
|-------|-----|---------------------|
| Lokal Docker | http://localhost:8180 | admin / admin |
| Kubernetes | http://keycloak.eduflex.local:8180 | admin / admin |

### Skapa ny Keycloak Realm för Tenant

1. Logga in på Keycloak Admin Console
2. Klicka på **"Create Realm"** (vänster dropdown)
3. Fyll i:
   - **Realm name:** `tenant-stg` (samma som tenant-id)
   - **Enabled:** ON
4. Klicka **"Create"**

### Skapa Client (Applikation)

1. I din realm, gå till **Clients** → **Create client**
2. Fyll i:
   - **Client ID:** `eduflex-app`
   - **Client type:** OpenID Connect
   - **Client authentication:** ON (för confidential client)
3. Nästa sida:
   - **Valid Redirect URIs:** 
     - `http://localhost:5173/*`
     - `http://localhost:8080/*`
   - **Web Origins:** `http://localhost:5173`
4. **Credentials-fliken:** Kopiera **Client Secret** (behövs i backend-config)

### Skapa Användare i Keycloak

1. Gå till **Users** → **Add user**
2. Fyll i:
   - **Email:** `larare@stg.local`
   - **Email verified:** ON
   - **First name:** Erik
   - **Last name:** Eriksson
3. Spara
4. Gå till **Credentials**-fliken → **Set password**
   - Ange lösenord
   - **Temporary:** OFF (så användaren inte tvingas byta)
5. Gå till **Role mappings** → Tilldela lämpliga roller

### Roller i Keycloak

Skapa applikationsroller under **Realm roles**:

| Roll | Beskrivning |
|------|-------------|
| `ADMIN` | Full åtkomst |
| `TEACHER` | Hantera kurser, betygsätta |
| `STUDENT` | Läsa kurser, lämna in uppgifter |
| `MENTOR` | Studentuppföljning |
| `PRINCIPAL` | Rektorsvy med analytics |

### Mappa Keycloak-roller till EduFlex

EduFlex läser roller från JWT-token. Säkerställ att Keycloak inkluderar roller i token:

1. Gå till **Client Scopes** → `roles`
2. **Mappers** → Lägg till mapper:
   - **Mapper type:** User Realm Role
   - **Token Claim Name:** `roles`
   - **Add to ID token:** ON
   - **Add to access token:** ON

### Konfigurera Backend för Keycloak

I `application.properties`:

```properties
# SSO Mode (internal, keycloak, hybrid)
eduflex.auth.mode=hybrid

# Keycloak Client
spring.security.oauth2.client.registration.keycloak.client-id=eduflex-app
spring.security.oauth2.client.registration.keycloak.client-secret=YOUR_CLIENT_SECRET
spring.security.oauth2.client.registration.keycloak.scope=openid,profile,email,roles

# Keycloak Provider (Byt localhost:8180 till din Keycloak-URL)
spring.security.oauth2.client.provider.keycloak.authorization-uri=http://localhost:8180/realms/eduflex/protocol/openid-connect/auth
spring.security.oauth2.client.provider.keycloak.token-uri=http://keycloak:8080/realms/eduflex/protocol/openid-connect/token
spring.security.oauth2.client.provider.keycloak.jwk-set-uri=http://keycloak:8080/realms/eduflex/protocol/openid-connect/certs
```

> ⚠️ **OBS:** `authorization-uri` måste vara webbläsaråtkomlig (localhost:8180), medan `token-uri` och `jwk-set-uri` nås från backend-containern (keycloak:8080).

---

## ⚡ Snabbkommandon

### Lista alla Tenants
```bash
curl http://localhost:8080/api/tenants
```

### Verifiera Tenant-schema i PostgreSQL
```bash
docker exec -it eduflex-db psql -U postgres -d eduflex -c "\dn"
```

### Visa tabeller i ett tenant-schema
```bash
docker exec -it eduflex-db psql -U postgres -d eduflex -c "\dt tenant_stg.*"
```

### Visa användare i ett tenant-schema
```bash
docker exec -it eduflex-db psql -U postgres -d eduflex -c "SELECT id, email, first_name FROM tenant_stg.app_users;"
```

---

## ❓ Felsökning

### Problem: "Tenant not found"

**Orsak:** `X-Tenant-ID` headern saknas eller är fel.

**Lösning:**
```bash
# Kontrollera att tenant finns
curl http://localhost:8080/api/tenants | jq

# Använd korrekt ID
curl -H "X-Tenant-ID: CORRECT_ID" http://localhost:8080/api/...
```

### Problem: "401 Unauthorized" vid login

**Orsak:** JWT-token saknas eller är ogiltigt.

**Lösning:**
1. Kontrollera att du skickar `X-Tenant-ID` header
2. Verifiera användaruppgifter
3. Kolla backend-loggar: `docker logs eduflex-backend --tail 100`

### Problem: Schema skapas inte

**Orsak:** Databasanslutning eller Flyway-fel.

**Lösning:**
```bash
# Kolla backend-loggar för Flyway-fel
docker logs eduflex-backend | grep -i "flyway\|schema\|error"

# Verifiera databasanslutning
docker exec -it eduflex-db psql -U postgres -d eduflex -c "SELECT 1"
```

### Problem: Keycloak-inloggning misslyckas

**Orsak:** Issuer mismatch eller nätverksfel.

**Lösning:**
1. Verifiera att Keycloak körs: `http://localhost:8180`
2. Kontrollera `KC_HOSTNAME` i docker-compose matchar `issuer-uri`
3. Kolla browser-konsolen för CORS-fel

---

## 📋 Checklista: Ny Tenant

- [ ] Skapa tenant via API eller frontend
- [ ] Verifiera schema i PostgreSQL
- [ ] Testa login med admin-användare
- [ ] (Valfritt) Skapa Keycloak realm
- [ ] (Valfritt) Konfigurera SSO-klienten
- [ ] Skapa ytterligare användare t.ex. lärare/elever
- [ ] Konfigurera organisationens branding

---

## 🔗 Relaterade Dokument

- [HELM_README.md](./HELM_README.md) – Kubernetes/Helm deployment
- [README.md](./README.md) – Allmän projektöversikt
- [docs/API.md](./docs/API.md) – API-dokumentation

---

*Dokument uppdaterat: 2026-01-15*
