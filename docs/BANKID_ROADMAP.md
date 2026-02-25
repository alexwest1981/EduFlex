# BankID Integration Roadmap & ISP Finalization

Detta dokument sammanfattar status för ISP-modulen och sätter planen för nästa stora miljö-uppgradering: **BankID**.

## 1. ✅ ISP Status: MISSION ACCOMPLISHED
ISP-modulen är nu komplett och enterprise-redo:
- **AI-stöd**: Gemini föreslår kurser baserat på examensmål.
- **Efterlevnad**: PDF-export följer Skollagen 20:11.
- **UX**: Visuell poäng-progression (Klara vs Planerade vs Mål).
- **SYV-Hub**: Dedikerad dashboard med filtrerad studentlista.

## 2. 🔐 Keycloak Status
Systemet körs i `hybrid`-läge. 
- **Internal DB**: Hanterar admin och snabba pilottester.
- **Keycloak OIDC**: Fullt integrerat och redo att agera brygga för externa IdPs.

## 3. 🏦 BankID Integration Plan
För att behålla EduFlex höga arkitektoniska standard rekommenderar jag följande väg för BankID:

### Steg 1: Keycloak som Identity Broker
Istället för att skriva BankID-specifik kod i backend, lägger vi till BankID som en **Identity Provider (IdP)** i Keycloak.
- **Fördel**: Applikationen ser BankID som vilken OIDC-inloggning som helst.
- **Säkerhet**: BankID:s krav på signerade anrop hanteras säkert i Keycloak.

### Steg 2: Val av Broker
BankID kräver ofta ett avtal med en certifierad partner för att få tillgång till deras API.
- **Alternativ A**: GrandID (Populärt i Sverige, bra Keycloak-stöd).
- **Alternativ B**: Criipto (Väldigt bra dokumentation för OIDC).

### Steg 3: Implementation (Proposed)
1. **Konfigurera Keycloak**: Lägg till ny OIDC Provider.
2. **Backend**: Uppdatera `User`-modellen för att spara personnummer (hashat) om det behövs för koppling till ISP.
3. **Frontend**: Lägg till "Logga in med BankID"-knapp på inloggningssidan som pekar mot Keycloak.

---
**Nästa åtgärd:** Skapa en dedikerad gren för BankID-research och börja titta på test-certifikat.
