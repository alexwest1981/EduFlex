# EduFlex – Systemdokumentation (v2.0)

---

## 1. Systemöversikt

EduFlex är en modulär och skalbar **LMS-plattform** (Learning Management System) byggd för att vara flexibel och anpassningsbar.  
Systemet skiljer sig från traditionella LMS genom sin **"App Store"-arkitektur**, där funktionalitet kan aktiveras eller inaktiveras dynamiskt utan att källkoden behöver ändras. [conversation_history:1]

---

## 2. Teknisk stack

### Frontend

- **Ramverk:** React (Vite)
- **Styling:** Tailwind CSS (stöd för Dark Mode & responsiv design)
- **State Management:** React Context API
    - `AppContext` för global data
    - `ModuleContext` för funktionsstyrning
- **Routing:** React Router DOM (med skyddade rutter baserade på roller & licens)
- **Kommunikation:** REST API (Fetch) + WebSockets (SockJS/STOMP) för realtid
- **Ikoner:** Lucide React  
  [conversation_history:1]

### Backend

- **Ramverk:** Java Spring Boot
- **Databaslager:** JPA / Hibernate
- **Säkerhet:** Spring Security + JWT (JSON Web Tokens)
- **Realtid:** Spring WebSocket (Message Broker)
- **Arkitektur:** Service-orienterad med DTO:er (Data Transfer Objects)  
  [conversation_history:1]

---

## 3. Arkitektur & kärnkomponenter

### A. Modulsystemet ("App Store")

Detta är systemets hjärta, där inställningar separeras från funktionalitet för att möjliggöra skalbarhet. [conversation_history:1]

#### SystemSettings (`system_settings`)

- Hanterar enkla nyckel–värde-par för branding och konfiguration.
- Exempel: sidans namn (`site_name`), support‑e‑post, registrering öppen/stängd.
- Frontend: uppdaterar webbläsarflik och logotyp i realtid via `AppContext`.  
  [conversation_history:1]

#### SystemModules (`system_modules`)

- Hanterar *feature flags* för större funktioner.
- Innehåller metadata: version, beskrivning, licenskrav (`requiresLicense`) och status (`isActive`).
- Exempel: Chat, Gamification, QuizRunner Pro.
- Frontend: `ModuleContext` laddar dessa vid start och styr vilka komponenter som renderas i UI:t.  
  [conversation_history:1]

### B. Behörighetsstyrning (RBAC)

Systemet har tre primära roller: [conversation_history:1]

- **STUDENT:** Ser sina kurser, gamification‑data, kan svara på quiz och ladda upp uppgifter.
- **TEACHER:** Kan skapa kurser, rätta uppgifter, skapa quiz, hantera forum och se deltagare.
- **ADMIN:** Har tillgång till AnalyticsDashboard, systeminställningar, användarhantering och licensiering.

---

## 4. Implementerade moduler

| Modul              | Beskrivning                                                                                               | Status  |
|--------------------|-----------------------------------------------------------------------------------------------------------|---------|
| Dark Mode Core     | Globalt mörkt tema för hela applikationen.                                                               | ✅ Klar |
| EduChat Pro        | Realtidskommunikation (WebSockets), flytande overlay som följer användaren, stöd för bilder.            | ✅ Klar |
| Gamification Engine| XP‑system, levlar och badges, visuella widgets på Student Dashboard.                                     | ✅ Klar |
| QuizRunner Pro     | Skapare (Builder) och spelare (Runner) för diagnostiska prov, automatisk rättning.                       | ✅ Klar |
| Inlämningar        | Filuppladdning för studenter, gränssnitt för lärare att ladda ner, betygsätta (IG/G/VG) och ge feedback. | ✅ Klar |
| EduForum           | Diskussionsforum per kurs, stöd för kategorier, trådar, låsning av trådar och "Lärare"-badges.          | ✅ Klar |
| Kursinnehåll       | Hantering av lektioner med text, inbäddad video (YouTube) och filbilagor.                                | ✅ Klar |
[conversation_history:1]

---

## 5. Dashboards & vyer

### Admin Dashboard

- **Översikt:** Live‑statistik (användare, kurser, filer).
- **Analys:** Grafer och djupare data via AnalyticsDashboard.
- **Inställningar:** Gränssnitt för att byta sidnamn och toggla moduler.
- **Meddelanden:** Central inkorg för systemmeddelanden.  
  [conversation_history:1]

### Student Dashboard

- **Gamification:** Level‑kort och badge‑samling (döljs om modulen är avstängd).
- **Kommande:** Widget för närmaste deadlines.
- **Kurser:** Kortvy över aktiva kurser.  
  [conversation_history:1]

### Lärare Dashboard

- **Översikt:** Kurser och inlämningar som behöver rättas.
- **Snabblänkar:** För att skapa innehåll och hantera kursmaterial.  
  [conversation_history:1]

---

## 🚀 Roadmap: Mot Enterprise & fullskalighet

Plan för att ta EduFlex från nuvarande version (v2.0) till v5.0 (Enterprise). [conversation_history:1]

### Fas 1: Stabilisering & databas
*Kort sikt: 1–2 månader*

**Mål:** Säkerställa att systemet klarar riktig trafik och persistens. [conversation_history:1]

- Migrering till **PostgreSQL**: Byt ut H2/MySQL (dev) mot PostgreSQL för produktionsmiljö.
- Filhantering **S3**: Implementera stöd för AWS S3 eller MinIO för dokument/bilder istället för lokal lagring.
- Validering: Lägg till striktare validering (Hibernate Validator) på alla DTO:er.
- Felhantering: Global Exception Handler i Spring Boot för snyggare felmeddelanden till frontend.  
  [conversation_history:1]

### Fas 2: Prestanda & skalbarhet
*Medellång sikt: 3–6 månader*

**Mål:** Kunna hantera tusentals samtidiga användare. [conversation_history:1]

- **Redis caching:** Cacha tunga databasanrop (kurslistor, moduler) och ev. WebSocket‑sessioner vid multi‑node.
- **Pagination:** Infinite scroll eller paginering på forum, chatt‑historik och användarlistor.
- **Docker & CI/CD:** Dockerfile + `docker-compose.yml` och GitHub Actions för automatiska tester.  
  [conversation_history:1]

### Fas 3: Enterprise features
*Lång sikt: 6–12 månader*

**Mål:** Sälja in systemet till stora organisationer. [conversation_history:1]

- **SCORM / xAPI-stöd:** Import av färdiga utbildningspaket från andra system.
- **SSO (Single Sign-On):** Azure AD / Google Workspace / SAML.
- **Payment gateway:** Stripe/Klarna för att sälja kurser direkt i katalogen.
- **Multi-tenancy:** Schema-baserad multi‑tenant‑arkitektur för flera skolor med strikt separerad data.  
  [conversation_history:1]

### Fas 4: AI & framtid
*Visionärt*

**Mål:** Ligga i framkant. [conversation_history:1]

- **AI‑Tutor:** Bot (t.ex. via ChatGPT API) som har tillgång till kursmaterialet och svarar på studenternas frågor dygnet runt.
- **Automatisk quiz‑generering:** Lärare laddar upp en PDF, AI skapar ett quiz automatiskt.
- **Prediktiv analys:** Varnar lärare om en elev riskerar att underkännas baserat på inloggningsmönster och inlämningar.  
  [conversation_history:1]
