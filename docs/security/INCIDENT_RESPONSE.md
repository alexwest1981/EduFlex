# Incident Response Plan (IRP) - EduFlex LLP

Detta dokument beskriver EduFlex riktlinjer, procedurer och ansvarsområden i händelse av en IT- eller informationssäkerhetsincident (t.ex. dataintrång, ransomware, DDoS-attack, eller oavsiktlig dataläcka). Planen är utformad för att uppfylla de rigorösa krav som ställs vid offentliga upphandlingar (t.ex. kommuner och myndigheter).

## 1. Syfte och Omfattning
Syftet med denna IRP är att minimera skada, återställa normal drift så snabbt som möjligt, skydda personuppgifter och affärskritisk information, samt säkerställa att berörda parter och myndigheter informeras i enlighet med gällande lagstiftning (t.ex. GDPR). Omfattningen inkluderar all infrastruktur, data, anställda och underleverantörer kopplade till EduFlex-plattformen.

## 2. Incidentroller och Ansvarsområden
- **Incident Commander (IC):** Ansvarig för att leda och koordinera insatsen, fatta avgörande beslut och agera primär kontaktpunkt. (Bör vara Teknisk Chef / CTO).
- **Communication Lead:** Ansvarig för all intern och extern kommunikation, inklusive kontakt med Datainspektionen (IMY), kunder och media.
- **Technical Lead:** Ledsagar det tekniska teamet i arbetet med att innesluta och åtgärda incidenten.
- **Legal/Compliance:** Säkerställer att alla åtgärder följer legala krav (t.ex. GDPR, NIS-direktivet).

## 3. Faser i Incidenthanteringen

### Fas 1: Förberedelse (Preparation)
- **Backup & Återställning:** MinIO och PostgreSQL ska ha schemalagda offline-backuper med versionering aktiverat för att motverka ransomware ("WORM" - Write Once Read Many).
- **Loggning & Övervakning:** Aktiv övervakning av infrastrukturen och kontinuerlig granskning av `read_audit_logs` och intrångsförsök.
- **Utbildning:** Kvartalsvis genomgång av detta dokument med nyckelpersonal.

### Fas 2: Identifiering och Bedömning (Identification & Triage)
- Upptäckt kan ske via övervakningslarm (t.ex. hög CPU, oväntad databastrafik, varna vid flera misslyckade MFA-inloggningar), interna rapporter eller via kund/partner.
- IC bedömer incidentens allvarlighetsgrad (Låg, Medel, Hög, Kritisk) baserat på påverkan på tjänsten och potentiell dataläcka.

### Fas 3: Inneslutning (Containment)
- Målet är att stoppa spridningen innan ytterligare skada sker.
- **Initiala åtgärder:** Isolera drabbade nätverkssegment, stäng av komprometterade konton (disable app_users), blockera IP-adresser, nollställa lösenord.
- Vid misstanke om ransomware: Koppla omedelbart bort databasservrar från det externa nätverket, stäng asynkrona backuptransaktioner för att skydda den primära backupen.

### Fas 4: Åtgärd och Utrotning (Eradication)
- Eliminera grundorsaken. Ta bort skadlig kod, tillämpa säkerhetspatchar, inaktivera bakdörrar.
- Forensisk analys: Spara kopior av drabbade system/loggar innan omformatering för bevisföring och framtida analys.

### Fas 5: Återställning (Recovery)
- Återställ drabbade system och data från rena och testade backuper (MinIO snapshots / pg_dump).
- Validera att systemet är rent och fullt fungerande innan det ansluts till produktion.
- Övervaka plattformen noggrant efter återställning för att försäkra att angriparen inte är kvar (Zero-Trust policy aktiverad).

### Fas 6: Lärdomar (Lessons Learned)
- Inom 48 timmar efter avslutad incident (vid *Kritisk* eller *Hög* allvarlighet) ska IC sammankalla till ett "Post-Mortem"-möte.
- Analysera *vad* som hände, *varför* det hände, och dokumentera hur man kan förbättra förberedelse- och inneslutningsfaserna till nästa gång.

## 4. Riktlinjer för Kommunikation (Dataläcka & GDPR)
Enligt GDPR artikel 33 måste en personuppgiftsincident anmälas till Integritetsskyddsmyndigheten (IMY) inom 72 timmar från upptäckt om den medför en risk för de registrerades fri- och rättigheter.
1. Identifiering av huruvida Protected Identity-användare (`is_protected_identity = true`) drabbats har högsta prioritet.
2. Kommunikation med kunder ska ske proaktivt men med verifierad fakta.
3. Ingen tekniker får uttala sig operativt till externa utan godkännande av Communication Lead.

## Dokumentrevision
- **Datum:** 2026-03-09
- **Författare:** EduFlex Security Team
- **Version:** 1.0 (Enterprise Compliance Update)
