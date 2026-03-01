# Compliance & Säkerhetsdokumentation: EduFlex LLP

EduFlex LLP är byggt för att möta de högsta kraven på säkerhet, integritet och tillgänglighet inom Enterprise och offentlig sektor. Denna dokumentation sammanfattar de tekniska och organisatoriska åtgärder som gör plattformen "Compliance Ready".

## 1. Dataskydd & GDPR
EduFlex tillämpar "Privacy by Design" genom hela arkitekturen.
- **Schema-per-Tenant Isolering**: Varje kund (tenant) har sitt eget isolerade databasschema. Detta eliminerar risken för "cross-tenant" dataläckage.
- **Data Residency**: All data lagras inom EU/EES (MinIO lokalt eller krypterad S3) för att möta kraven i Schrems II och GDPR.
- **Anonymisering**: Systemet stödjer rätten att bli bortglömd genom automatiserad anonymisering av användardata vid avslutad tjänst.

## 2. Säkerhetsarkitektur
- **Kryptering**: All data i vila (at rest) krypteras med AES-256. All trafik (in transit) sker via TLS 1.3 (HTTPS).
- **Identitetshantering**: Stöd för branschstandarder som OIDC (Keycloak), SAML 2.0 och BankID för säker autentisering (MFA).
- **AI Audit Log**: Varje interaktion med systemets AI-funktioner loggas och kan granskas för att säkerställa att inga känsliga uppgifter sprids.

## 3. Certifiering & Regelefterlevnad
Plattformen inkluderar en dedikerad **Compliance Center** som automatiserar:
- **Certifikatutgångar**: Systemet bevakar lagstadgade utbildningar (t.ex. HLR, brandskydd) och skickar automatiska påminnelser 30 dagar före utgångsdatum.
- **E-signering**: Genom SS 12000-logik säkerställs att betyg och kursintyg är oförfalskbara och spårbara.
- **Revisionsloggar**: Alla administrativa handlingar loggas för att kunna uppvisa en fullständig ändringshistorik vid revision.

## 4. Digital Tillgänglighet (WCAG 2.1)
EduFlex LLP följer DOS-lagen och WCAG 2.1 nivå AA.
- **Navigation**: Fullt stöd för tangentbordsnavigering.
- **Skärmläsare**: Semantisk HTML och ARIA-attribut används genomgående.
- **Kontrast**: Designsystemet är optimerat för god läsbarhet och hög kontrast.

## 5. Drift & Kontinuitet
- **High Availability**: Redundanta tjänster (Docker/WSL/Cloud) säkerställer en drifttid på >99.9%.
- **Disaster Recovery**: Dagliga backuper lagras i isolerade miljöer.
- **License Protection**: Proaktiv övervakning av tjänstestatus sker i realtid via EduFlex Control Center.

---
*Senast uppdaterad: 2026-03-01*
*Version: EduFlex LLP v3.0.0 (Enterprise Edition)*
