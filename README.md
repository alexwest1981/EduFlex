# 🎓 EduFlex LMS

![Java](https://img.shields.io/badge/Java-25-blue?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-success?style=for-the-badge&logo=springboot)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge&logo=postgresql)
![Build](https://img.shields.io/badge/Build-Maven-orange?style=for-the-badge&logo=apachemaven)
![License](https://img.shields.io/badge/License-Private-red?style=for-the-badge&logo=lock)

---

## 🏫 Översikt

**EduFlex** är ett modernt, modulärt och skalbart **Learning Management System (LMS)** utvecklat för att effektivisera **administration, undervisning och lärande** i både utbildnings- och företagsmiljöer.  
Projektet utvecklas av **Alex Weström / Fenrir Studio** med fokus på **säkerhet, användarvänlighet** och **robust datahantering**.

---

## 🚀 Teknisk Stack

### 🧩 Backend
- **Språk:** Java 25  
- **Ramverk:** Spring Boot 3.x  
- **Databas:** PostgreSQL (Hibernate/JPA)  
- **Säkerhet:** Spring Security + JWT (JSON Web Tokens) med BCrypt-hashning  
- **Byggverktyg:** Maven  

### 💻 Frontend
- **Språk:** JavaScript (ES6+) / React 18  
- **Styling:** Tailwind CSS (v4)  
- **Ikoner:** Lucide React  
- **Byggverktyg:** Vite  

---

## ✨ Nuvarande Funktioner

### 🔐 Autentisering & Säkerhet
- JWT-baserad inloggning för hög prestanda och stateless arkitektur  
- Rollbaserad åtkomstkontroll (RBAC):  
  - **ADMIN:** Systemkonfiguration, användarhantering och filarkiv  
  - **TEACHER:** Kurs- och uppgiftshantering  
  - **STUDENT:** Kursanmälan, inlämningar och materialåtkomst  
- Säker lösenordshantering med BCrypt  
- CORS-konfiguration mellan frontend och backend  

### 👥 Användarhantering (Admin)
- CRUD-funktionalitet för användare  
- Automatisk användarnamnsgenerator  
- Safe Delete – raderingsvarning vid kopplade resurser  
- Dokumentarkiv med global filöversikt  

### 📚 Kurshantering
- Kursadministration med schemaläggning och metadata  
- Kurskatalog med registrering (“Enrollment”)  
- Personlig kursdashboard  

### 📂 Material & Filer
- Stöd för 📄 filer, 🎥 videor, 🔗 länkar och 📝 textinnehåll  
- Privat dokumentlagring för studentprofiler  
- Säker filstruktur med UUID-baserade filnamn  

### 📝 Uppgifter & Examination
- Deadlines, filinlämningar och digital bedömning  
- Betygssättning (IG/G/VG)  
- Skriftlig feedback direkt i gränssnittet  

---

## 🗺️ Roadmap & Utvecklingsplan

### 🧭 Fas 1 – Elevupplevelse och Kommunikation
- [ ] Realtidsnotifieringar  
- [ ] Utökad profil med bild och kontaktuppgifter  
- [ ] Kursbaserad chatt  

### 📆 Fas 2 – Planering och Uppföljning
- [ ] Kalender med deadlines  
- [ ] Närvarohantering  
- [ ] Administrativ statistik  

### 🧱 Fas 3 – Infrastruktur och Skalbarhet
- [ ] Docker-containerisering  
- [ ] Molnlagring (AWS S3 / Azure Blob Storage)  
- [ ] CI/CD pipelines  

---

## 🛠️ Installation & Körning

### Förutsättningar
- **Java JDK 17+ (Java 25 rekommenderas)**  
- **Node.js & npm**  
- **PostgreSQL** aktiv och konfigurerad  

### 1. Databaskonfiguration
```
CREATE DATABASE eduflex;
```
Uppdatera `src/main/resources/application.properties` med användarnamn och lösenord.

### 2. Starta backend
```
cd backend
./mvnw spring-boot:run
```
Backend startar på **port 8080**.

### 3. Starta frontend
```
cd frontend
npm install
npm run dev
```
Frontend startar normalt på **port 5173**.

---

## 🤝 Bidra

EduFlex är under aktiv utveckling. Pull requests är välkomna, men kräver godkännande innan sammanslagning.  
För större ändringar, **öppna en issue** för att diskutera syfte, påverkan och genomförandeplan.

---

## ⚖️ Juridisk Information och Licensvillkor

### Äganderätt
**EduFlex™** och all tillhörande källkod, dokumentation, design, datamodellering samt grafiskt material tillhör **Alex Weström / Fenrir Studio**.  
All immateriell egendom kopplad till projektet omfattas av upphovsrätt och skyddas enligt svensk och internationell lagstiftning, inklusive men inte begränsat till **Lag (1960:729) om upphovsrätt till litterära och konstnärliga verk** och gällande EU-direktiv.

### Licensstatus
Detta projekt är **föremål för privat och restriktiv licensiering**.  
Ingen del av systemet får – utan uttryckligt skriftligt tillstånd från **Alex Weström / Fenrir Studio** –  
kopieras, reproduceras, distribueras, modifieras, säljas, publiceras, eller användas i kommersiellt eller icke-kommersiellt syfte.  

Otillåten användning av projektets komponenter betraktas som **intrång i upphovsrätt** och kan medföra civilrättsliga eller straffrättsliga åtgärder.

### Förfrågningar om licensiering eller samarbete
För all kommunikation gällande licens, demonstrationssyfte, partnerskap eller kommersiell användning, vänligen kontakta:

> **Alex Weström**  
> *Fenrir Studio*  
> 📧 **[alexwestrom81@gmail.com]**  
> 📍 Svenljunga, Sverige  

Alla licensförfrågningar prövas individuellt och kan medges under skriftligt avtal med tillhörande villkor.

---

## 🕊️ Framtida Licensmodell

Vid lansering av en stabil releaseversion planeras övergång till en etablerad öppen källkodslicens (exempelvis **MIT** eller **Apache 2.0**).  
Fram till dess gäller denna **privata, skyddade licensmodell** fullt ut.

---

© 2025 **Alex Weström / Fenrir Studio**. Alla rättigheter förbehållna.
```
