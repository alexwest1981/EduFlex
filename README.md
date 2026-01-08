<p align="center">
  <img src="docs/images/EduFlex.png" width="900" alt="Fenrir Studio Logo" />
</p>

<h1 align="center">🎓 EduFlex LMS</h1>

<p align="center">
  <em>Developed & maintained by <strong>Alex Weström / Fenrir Studio</strong></em>
</p>

---

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white"/>
  <img src="https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen?style=for-the-badge&logo=springboot"/>
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwindcss"/>
  <img src="https://img.shields.io/badge/WebSocket-STOMP/SockJS-orange?style=for-the-badge&logo=socketdotio&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL/H2-336791?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Docker-Production%20Ready-blue?style=for-the-badge&logo=docker&logoColor=white"/>
  <img src="https://img.shields.io/badge/OpenPDF-Certificates-ff6b6b?style=for-the-badge&logo=pdf&logoColor=white"/>
  <img src="https://img.shields.io/badge/License-Private-red?style=for-the-badge&logo=lock"/>
  <img src="https://img.shields.io/badge/Status-Fas%202%20Onboarding-blue?style=for-the-badge"/>
</p>


---

## 🏫 Om Projektet

**EduFlex** är ett modernt, rollbaserat och modulärt **Learning Management System (LMS)** för skolor, utbildningsföretag och intern utbildning.  
Systemet kombinerar **realtidskommunikation**, **dokumenthantering**, **gamification**, **PDF‑certifikat** och ett växande **analytics- & modulsystem** – byggt med fokus på säkerhet, skalbarhet och en exceptionell användarupplevelse.

![EduFlex Dashboard Screenshot](docs/images/Student_overview.png)

### 🆕 Nytt i senaste versionen

- **Investor Analytics Module:** Djupgående analysmotor med "Real Data" (inga mockups) för användartillväxt, intäkter (MRR) och studentengagemang.
- **CSV Export:** Möjlighet att exportera studentinsikter och risk-analyser direkt till Excel/CSV.
- **Internationalisering (I18n):** Fullt stöd för 6 språk i samtliga vyer, inklusive den nya analys-dashboarden.
- Kursansökningssystem med godkänn/avslå-flöde.
- Max antal studenter per kurs med automatisk enforcement.
- Förbättrade Teacher/Admin/Student-dashboards för ansökningar och kursstatus.
- Justerad SecurityConfig för korrekta rollbaserade endpoints.
- Verifierad Docker-setup med fungerande fullstack-flöde.

---

## 🚀 Kärnfunktioner

### 🛡️ Admin & System

- **AnalyticsDashboard (Investor Insights):** Realtidsgrafer över systemhälsa och tillväxt. Inkluderar "Risk Factor"-analys för att identifiera inaktiva studenter.
- **SystemModules** – dedikerat modulsystem separat från **SystemSettings**.
- **Dynamisk branding** – sidans namn, logotyp/branding och metadata styrs via databasen.
- **”App Store”-lik modulhantering** – aktivera/avaktivera moduler (Chat, Gamification, Forum, Certificates, Calendar m.fl.) direkt från admin.
- Licens- och versionsinformation tydligt separerad från enkla inställningar (t.ex. `site_name`).

### 🍎 Lärare

- **TeacherDashboard 2.0** med fördjupad kursöversikt (progress, aktivitet, deadlines).
- Snabb **elevmodal** från dashboarden för att se elevens status, närvaro och resultat utan att lämna vyn.
- Kursvy med dynamiska flikar beroende på vilka moduler som är aktiva (Assignments, Quiz, Forum, Documents, Gamification etc.).
- Rättning, feedback och uppföljning integrerade i dashboards & course views.
- **Översiktswidgets:** KPI:er, schema och genvägar återställda och förbättrade.
- **Applications‑tabb:** Ny flik för att hantera kursansökningar (approve/reject) per kurs.
- **Max Students:** Skapa/ändra kurs med fält för max antal studenter direkt i modalerna.
- **Materialredigering:** Endpoint & UI‑stöd för att uppdatera kursmaterial (LESSON m.m.).

### 🎓 Studenter

- **Gamification-UI** med level‑kort, badges och poängräknare direkt i studentens dashboard.
- Widget för **kommande inlämningar och deadlines** med länkar direkt till uppgifter/kurs.
- Kursvy som automatiskt anpassas efter aktiverade moduler (t.ex. döljer Forum/Chat om de stängts av i SystemModules).
- Förbättrat flöde vid inloggning – fullständig användarprofil och gamification-data laddas direkt.
- **Stabil åtkomst:** 403‑problemen lösta genom uppdaterad `SecurityConfig` och justerade API‑anrop för studentvyer.
- **Course Catalog:** Visar antal inskrivna vs max (`current/max`) samt status om kursen är full.
- **Apply‑flöde:** Tydlig "Apply"-knapp med visuell feedback (lyckad ansökan / fel) och integration mot backendens ansökningslogik.

  ### 📚 Kurser & ansökningar

- **Kursansökningar:** Studenter kan ansöka till kurser via Course Catalog, och lärare/admin kan godkänna eller neka via en dedikerad Applications‑vy.
- **Max antal studenter:** Varje kurs kan konfigureras med `maxStudents`, och backend logiken säkerställer att gränsen inte överskrids.
- **Tillgängliga platser:** Kurskatalogen visar live‑status, t.ex. `5/30 students`, baserat på aktuella inskrivningar.
- **Rollsäkerhet:** Endast autentiserade användare kan ansöka, och endpoints är skyddade via finjusterad `SecurityConfig`.
- **Kursmaterial:** Stöd för materialtypen `LESSON` i CourseMaterial + endpoint för att uppdatera innehåll (`updateMaterial`).

### 🔐 Backend & Säkerhet

- Uppdaterad **JwtResponse** och **AuthController** för att skicka med:
  - fullständiga användaruppgifter
  - rollinformation
  - gamification‑data (level, XP, badges) vid inloggning.
- Tydlig arkitektonisk separation:
  - **SystemSettings** för enkla inställningar (t.ex. `site_name`, språk, standardtema)
  - **SystemModules** för komplexa moduler (version, licensstatus, aktiv/inaktiv).
- Förberett för vidare fas 2-utbyggnad (Analytics, PWA, integrationer).

### 🔐 Security & API-access

- **SecurityConfig:**
  - Tillåter `POST /api/courses/*/apply/*` för alla autentiserade användare.
  - Tillåter `/api/courses/student/**` för studenters kurs- och dashboard‑data.
- **JWT-respons:** Fortsätter att exponera fullständiga användaruppgifter och rollinformation så att rätt vyer laddas direkt vid inloggning.


---

## 🧩 Gamification Engine

EduFlex inkluderar en dedikerad **Gamification Engine** som ökar engagemanget genom poäng, märken och nivåer.

**Funktioner:**
- Backend-entiteter för poäng, badges och levels  
- Dynamisk poängberäkning via tjänster  
- Interaktiva widgets i Dashboard och CourseDetail  
- Modulstyrning via System Settings  

---

## 📜 PDF-certifikat

Certifikat genereras dynamiskt med **OpenPDF**:
- Innehåller elevnamn, kurs, datum och skolnamn  
- Backendgenerering baserad på System Settings  
- Nedladdningsbart från dashboard eller kursvy  
- Används för kursavslut och gamification-belöningar  

---

## 💬 Kommunikation

### 💭 Realtidschatt
- WebSocket (SockJS/STOMP)  
- Historik, användarlistor och bildstöd  
- Modulbaserad aktivering  

### 💬 Kursforum
- Kategorier och trådar per kurs  
- Full JSON-säkerhet utan recursion-problem  

---

## 🧪 Rich Text Editor

- **react-quill-new** (React 19-kompatibel)  
- Egen `RichTextEditor`-komponent med memoiserad config  
- Används i material, uppgifter och forum  

---

## 🐳 Docker & Deployment

- Fullt kursflöde (ansökningar, maxStudents, dashboards) är verifierat inom Docker-nätverket.
- Backend och frontend kommunicerar internt via container‑nätverk utan extra port-hackar.
- Säkerhetsrelaterade rättighetsproblem i Docker‑miljön är åtgärdade (permissions fixade).
  
---

## 📸 Skärmdumpar

### Rollbaserade Dashboards
| Student | Teacher | Admin |
|:--:|:--:|:--:|
| ![Student](docs/images/Student_overview.png) | ![Teacher](docs/images/Teacher_Overview.png) | ![Admin](docs/images/Admin_Overview.png) |

### Primära vyer
| Kalender | Internmail | Dokument |
|:--:|:--:|:--:|
| ![Student](docs/images/Calender_View.png) | ![Teacher](docs/images/Communication.png) | ![Admin](docs/images/Documents.png) |

| Kalender | Internmail | Dokument |
|:--:|:--:|:--:|
| ![Student](docs/images/Calender_View.png) | ![Teacher](docs/images/Communication.png) | ![Admin](docs/images/Documents.png) |

| Provhantering | Studenthantering | Kurshantering |
|:--:|:--:|:--:|
| ![Student](docs/images/TestManagement.png) | ![Teacher](docs/images/Students.png) | ![Admin](docs/images/Teacher_courses.png) |

### Gamification & Certifikat
| Widgets | Certifikat | CourseDetail |
|:--:|:--:|:--:|
| ![Gamification](docs/images/gamification-widgets.png) | ![Certificate](docs/images/certificate-sample.png) | ![CourseDetail](docs/images/course-detail.png) |



---

## 🛠️ Teknisk Stack

### Frontend
- React 19 + Vite + Tailwind CSS v4  
- WebSocket (SockJS/STOMP)  
- React-Quill-new, Lucide React  
- Modulär Dashboard och CourseDetail  
- **Recharts** för datavisualisering (Analytics)

### Backend
- Spring Boot 3.x (Java LTS)  
- Spring Security (JWT + WebSocket)  
- Spring Data JPA / Hibernate (@EntityGraph mot N+1)  
- OpenPDF för certifikat  
- SystemSettings-modul för dynamiska inställningar  
- Databas: PostgreSQL (prod) / H2 (dev) 

### Prestanda & Kvalitet
- Eliminering av N+1-problem  
- JSON-recursion fixad  
- Full dependency injection  
- I18n och språkstöd  

---

## 🧩 Systemarkitektur

```plaintext
┌─────────────────────────────┐
│           Frontend          │
│    React 19 + Vite          │
├─────────────────────────────┤
│ Modular Dashboard (Role)    │
│ CourseDetail (5 modules)    │
│ Gamification Widgets        │
│ ChatOverlay / Certificates  │
└─────────────┬───────────────┘
              │ REST + WebSocket
              ▼
     ┌──────────────────────────────┐
     │        Spring Boot API       │
     ├──────────────────────────────┤
     │ Auth / License / Courses     │
     │ Quiz / Forum / Gamification  │
     │ Certificate / Settings       │
     └─────────────┬───────────────┘
                   │ JPA / Hibernate
                   ▼
             ┌──────────────┐
             │  MySQL / H2  │
             └──────────────┘
### Modulkommunikation
| Modul          | Syfte                               | Kommunikation        | Beroenden                 |
| -------------- | ----------------------------------- | -------------------- | ------------------------- |
| Auth           | JWT-autentisering                   | REST                 | UserRepository            |
| License        | Licensvalidering                    | REST                 | LicenseEntity             |
| Dashboard      | Rollspecifika vyer, gamification    | REST + WS            | User, Course              |
| CourseDetail   | Kurskomponenter (5)                 | REST                 | CourseRepository          |
| Gamification   | Poäng, badges, levels               | REST                 | GamificationService, User |
| Certificate    | PDF-generering                      | REST (file download) | OpenPDF, CourseCompletion |
| Chat           | Realtidschatt                       | WebSocket            | UserSession               |
| SystemSettings | Dynamiska moduler och inställningar | REST                 | SettingsRepository        |
```

### Installation och Setup
# Krav
- Node.js 20+ & npm

- Java LTS & Maven

- MySQL 8.x / H2 (dev)

# Frontend
``` bash
git clone https://github.com/alexwest1981/eduflex-frontend.git</br>
cd eduflex-frontend</br>
npm install --legacy-peer-deps</br>
npm run dev   # http://localhost:5173</br>
```

# Backend
``` bash
mvn spring-boot:run   # http://127.0.0.1:8080/api
```

## 📆 Roadmap – Fas 2 (Pågår)

- ✅ AnalyticsDashboard för administratörer (MVP klar) – **Real Data & Export**.
- ✅ SystemModules – arkitektonisk uppdelning från SystemSettings.
- ✅ Branding via databasen (site name, profil, modulbaserad UI).
- ✅ Utökade Teacher/Student‑dashboards med gamification‑data.
- 🔄 Fördjupad analytics (exporter, rapporter, dashboards per modul).
- 🔄 E-postnotifieringar & PWA.
- 🔄 Integrationer (LTI, SSO, HR/ERP).


### 🚀 Nästa steg

- E-postnotifieringar & PWA

- Mobilapp (React Native)

- Öppen licens (v3.0)

---
## ⚖️ Licens & Äganderätt
### EduFlex™ © 2026 Alex Weström / Fenrir Studio
Privat licens — kontakta för samarbetsmöjligheter.
### 📧 alexwestrom81@gmail.com
<p align="center"> <img src="docs/images/fenrir.png" width="80" alt="Fenrir Studio Logo"/><br/> <strong>Made with ❤️ by Fenrir Studio</strong><br/> <sub>Where innovation meets precision.</sub> </p> 
