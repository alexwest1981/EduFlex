# 🚀 EduFlex Roadmap: Vision 2026

**Mål:** Transformera EduFlex från ett administrativt LMS till ett "Intelligent Learning Ecosystem" som är agent-redo, adaptivt och integrerat i arbetsflödet.

---

## 🧠 Kategori 1: AI & Agentisk Arkitektur
*Marknaden 2026 kräver att AI inte bara är en "add-on" utan motorn i systemet.*

| Funktion | Beskrivning | Status |
| :--- | :--- | :--- |
| **Generativt Författande (Quiz)** | Skapa quiz från PDF/Text. | ✅ **Klar** |
| **Generativt Författande (Kurser)** | "One-click course creation". Ladda upp PDF/PPT/Video och låt systemet generera kursstruktur, sammanfattningar och quiz automatiskt. | ✅ **Stabil** (V1) |
| **AI-Tutor & Copilot** | En inbyggd chattbot som svarar på elevers frågor baserat enbart på kursmaterialet (RAG). Rollspelspartner för träning. | ✅ **Klar** (V1) |
| **MCP-Server** | Gör EduFlex tillgängligt för externa AI-agenter (Model Context Protocol). | ✅ **Klar** (V1) |
| **Prediktiv Personalisering** | Analyserar beteendedata för att identifiera "at-risk"-studenter och rekommenderar stödmaterial (Gemini-integration). | ✅ **Klar** (V1) |

---

## 🔗 Kategori 2: Integration & Ekosystem
*Systemet får inte vara en isolerad ö. Det måste fungera där användaren är.*

| Funktion | Beskrivning | Status |
| :--- | :--- | :--- |
| **LTI 1.3 Core** | Grundläggande launch-stöd för externa verktyg. | ✅ **Klar** |
| **LTI 1.3 Advantage** | Stöd för AGS (Betyg) och NRPS (Roller/Namn). | ✅ **Stabil / Verifierad** |
| **xAPI & cmi5** | Modern spårning (LRS) för mobilt lärande och simuleringar. | ✅ **Verifierad** |
| **Workflow Integration** | Utbildning direkt i Slack/Teams/Salesforce ("Headless LMS"). | 📅 **Planerad** |

---

## 👥 Kategori 3: Användarupplevelse & Engagemang
*Fokus på "Learning Experience" (LXP) snarare än administration.*

| Funktion | Beskrivning | Status |
| :--- | :--- | :--- |
| **Socialt Lärande (Basic)** | Community Hub / Marketplace. | ✅ **Klar** |
| **Socialt Lärande (Avancerat)** | P2P-delning, kommentarer i kurser, "YouTube for Learning". | 📅 **Planerad** |
| **Gamification (Basic)** | XP, Levlar, Badges, Streaks. | ✅ **Klar** |
| **EduGame Expansion** | Shop för profil-teman, Sociala Streaks, "Buddy"-system. | ✅ **Stabil** (V1) |
| **Mobil-först** | Responsiv webbdesign. | ✅ **Klar** |
| **Media Streaming** | Stabil synkroniserad ljudboksuppspelning med Range-stöd. | ✅ **Klar** |
| **Offline-läge / PWA** | Installera som app, ladda ner kurser för offline-bruk. | 📅 **Planerad** |

---

## 📊 Kategori 4: Analys & Affärsnytta
*Från att mäta "Completion" till att mäta "ROI".*

| Funktion | Beskrivning | Status |
| :--- | :--- | :--- |
| **Kursutvärdering & Insikter** | Komplett system för kurskvalitet, automatiserade studentnotiser och AI-analys av fritextsvar. | ✅ **Klar** |
| **Skills Gap Analysis** | Visualisera kompetensluckor baserat på quiz/profiler. | 📅 **Planerad** |
| **ROI-rapportering** | Koppla utbildning till affärsdata (t.ex. säljsiffror). | 📅 **Planerad** |

---

## 🛡️ Kategori 5: Infrastruktur & Säkerhet
*Teknisk ryggrad och skydd av användardata.*

| Funktion | Beskrivning | Status |
| :--- | :--- | :--- |
| **Advanced Security** | Domän-låsning, AES-256 GCM kryptering (PII) och Rate-limiting. | ✅ **Klar** |
| **Unified Storage** | MinIO-integration för alla tillgångar (Löste split-brain bugg). | ✅ **Klar** |
| **CI/CD Pipeline** | Fullt automatiserade tester och deployment. | 📅 **Planerad** |
| **Kubernetes Migration** | Helm-charts för skalbarhet. | 📅 **Planerad** |

---

## 📝 Change Log

### [v0.9.10] - 2026-02-08
- **Gamification 2.0**: Full launch of Shop, Inventory, Profile Themes, and Social Streaks.
- **Admin**: New "Gamification Management" workspace for creating items and uploading assets.
- **Ebook**: Fixed "Split-brain" storage bug causing 404s. Backend now forces usage of correct MinIO bucket.
- **Ebook**: Implemented **Automated Cover Extraction** for PDFs/EPUBs upon upload.
- **Ebook**: Fixed `about:srcdoc` sandbox error in EpubViewer.
- **System**: Added automated Database Backups in Docker with download capability.

### [v0.9.9] - 2026-02-07
- **LTI**: Successfully verified LTI 1.3 Advantage E2E flow with account provisioning and course enrollment.
- **LTI**: Fixed circular dependency in `LtiService` using `@Lazy` injection.
- **LTI**: Resolved `@EntityGraph` filtering issue by ensuring teacher assignments for courses.
- **Infra**: Switched Docker DB mapping to port 5433 to resolve conflicts with local PostgreSQL processes.
- **xAPI**: Implemented LRS proxy endpoints for cmi5 status updates and statement propagation.

### [v0.9.8] - 2026-02-06
- **Media**: Implemented HTTP Range support in `StorageController` for seamless audio streaming.
- **Media**: Refactored `FloatingAudioPlayer` to use a unified persistent `<audio>` element, fixing AbortErrors during minimization.
- **UX**: Added manual audio regeneration flow for missing assets.
- **Stability**: Fixed "Rules of Hooks" violation and improved player error handling.

### [v0.9.7] - 2026-02-04
- **New Feature**: Restored and renamed **Quiz Generator** for random question bank selection.
- **UX**: Complete redesign of **Community Publishing Modal** with 4 entry types.
- **UI**: Fixed responsiveness and layout regressions in the Quiz Module.
- **Fix**: Enhanced lesson discovery by aggregating standard and AI-generated lessons.
- **Hotfix**: Improved Jitsi stability by disabling P2P and forcing WebSockets.

### [v0.9.6] - 2026-02-03
- **Security**: Implemented **Advanced License Protection** (Domain binding & Heartbeat).
- **Security**: Implemented **Database Encryption** for SSN, phone, and address (AES-GCM).
- **Security**: Added **Rate Limiting** to auth endpoints for brute-force prevention.
- **Infrastructure**: Migrated sensitive keys from `.env` to secure database records.
