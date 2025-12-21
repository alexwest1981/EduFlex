<p align="center">
  <img src="docs/images/fenrir.png" width="80" alt="Fenrir Studio Logo" />
</p>

<h1 align="center">🎓 EduFlex LMS</h1>

<p align="center">
  <em>Developed & maintained by <strong>Alex Weström / Fenrir Studio</strong></em>
</p>

---

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-Java%2025-success?style=for-the-badge&logo=springboot)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwindcss)
![WebSocket](https://img.shields.io/badge/WebSocket-STOMP/SockJS-orange?style=for-the-badge&logo=socketdotio)
![License](https://img.shields.io/badge/License-Private-red?style=for-the-badge&logo=lock)
![Status](https://img.shields.io/badge/Status-Active%20Development-blue?style=for-the-badge)

---

## 🏫 Om Projektet

**EduFlex** är ett avancerat, rollbaserat **Learning Management System (LMS)** med fokus på **säkerhet, realtidskommunikation och automatisk administration**.  
Systemet stödjer nu licenshantering, närvarospårning och chattfunktion i realtid — vilket gör det ännu mer komplett för både **utbildningsinstitut och företag**.

---

## 🚀 Nya Funktioner (v2.0)

### 🔑 Licenshantering
- Dynamisk **aktivering och validering** av licensnycklar.  
- Backend-validering av licensstatus med **begränsad åtkomst** vid ogiltig licens.  
- Visuell indikation i dashboard via **LicenseOverlay** och systemavisering.  

### 💬 Realtidschatt
- WebSocket-baserad kommunikation via **SockJS & STOMP**.  
- **ChatOverlay-komponent** med meddelandehistorik, användarlistor, bildstöd och notifieringar.  
- Backend-säkerhet uppdaterad i `SecurityConfig` för WS-trafik.  

### 🕒 Närvaro & Kursaktiviteter
- **AttendanceView** för visuell närvaroregistrering baserad på kursdatum.  
- Backend-modeller för **CourseEvent** och **AttendanceRecord**.  
- Möjlighet att följa närvaro- och aktivitetsmönster i varje kurs.  

### 🧮 Bedömning & Inlämningar
- **AssessmentView** samlar inlämningar, betyg och kommentarer i ett enda gränssnitt.  
- Förbättrad **React-Quill**-integration för rikt textinnehåll i uppgifter och kursbeskrivningar.  

### 🔔 Notifieringar
- Central **Notification Center** i `App.jsx` med aviseringar för chatt, inlämningar och rättningar.  
- Live-uppdateringar via WebSocket, samt fallback till traditionella API-anrop.  

---

## 🛠️ Teknisk Stack

### Frontend
- **Ramverk:** React 19  
- **Byggverktyg:** Vite  
- **Styling:** Tailwind CSS (v4)  
- **Ikoner:** Lucide React  
- **Rich Text:** React-Quill  
- **Kommunikation:** WebSockets (SockJS/Stomp)  
- **Routing:** Custom SPA-routing  

### Backend
- **Ramverk:** Java Spring Boot  
- **Säkerhet:** Spring Security + JWT + WS-auth  
- **Databas:** MySQL / H2 (dev)  
- **Kommunikation:** REST API + WebSockets  
- **Moduler:** User, Course, Material, License, Attendance, Chat, Notifications  

---

## ⚙️ Installation & Setup

### Förutsättningar
- Node.js (≥ 20) och npm installerat  
- Java 25 + Spring Boot 3.x  
- Backend igång på [http://127.0.0.1:8080/api](http://127.0.0.1:8080/api)

### Steg-för-steg

1. **Klona frontendrepot**

git clone https://github.com/alexwest1981/eduflex-frontend.git
cd eduflex-frontend


2. **Installera beroenden**
npm install --legacy-peer-deps


3. **Starta utvecklingsservern**
npm run dev


4. **Backend**
Starta Spring Boot-applikationen (se separat repo).  
Kontrollera att filvägar i `application.properties` är korrekt satta för uppladdningar och databas.  

---

## 📆 Roadmap

### ✅ Fas 1: Kärnfunktionalitet *(Klar)*
- JWT-autentisering och rollstyrning  
- Kurs-CRUD, material och inlämningar  
- Kursutvärderingar  

### ✅ Fas 2: UX & Dashboard *(Klar)*
- Kalender, avatar, kurskatalog, responsive widgets  

### 🚀 Fas 3: Expansion *(Ny)*
- [x] Realtidschatt och notifieringar  
- [x] Närvarohantering och kursaktiviteter  
- [x] Licenshantering  
- [ ] Statistikmodul (klassbetyg, närvaro, aktivitet)  
- [ ] Dark Mode och mobiloptimering  

---

## ⚖️ Juridisk Information och Licensvillkor

**EduFlex™** ägs och utvecklas av **Alex Weström / Fenrir Studio**.  
Systemets källkod och design är skyddade enligt **Lag (1960:729) om upphovsrätt till litterära och konstnärliga verk** samt internationella konventioner (Bernkonventionen, TRIPS).  

Projektet använder för närvarande en **privat licensmodell**, där all reproduktion, distribution eller modifiering utan skriftligt tillstånd är förbjuden.  
Otillåten användning kan medföra rättsliga åtgärder.  

### Förfrågningar
> **Alex Weström**  
> *Fenrir Studio*  
> 📧 [alexwestrom81@gmail.com](mailto:alexwestrom81@gmail.com)  
> 📍 Svenljunga, Sverige  

---

## 🕊️ Mot En Öppen Licens

Nästa version (v2.5) planeras med **öppen licens (Apache 2.0 / MIT)** när den publika releasefasen inleds.  
Tills dess gäller den privata licensen i sin helhet.  

---

<p align="center">
<img src="docs/images/fenrir.png" width="80" alt="Fenrir Studio Logo" /><br/>
Made with ❤️ by <strong>Fenrir Studio</strong><br/>
<sub>Where innovation meets precision.</sub>
</p>
