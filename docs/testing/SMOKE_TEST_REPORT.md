# EduFlex "Maxed Out" Smoke Test Report (v3.3.1)

Detta dokument dokumenterar systemets beteende under extrem belastning för att identifiera den exakta smärtgränsen visuellt och tekniskt.

## 1. 🚀 Belastning & Prestanda (1600+ req/s)
Testet genomfördes med 500 samtidiga anslutningar under 30 sekunder.

| Metric | Värde | Status |
| :--- | :--- | :--- |
| **Throughput** | ~1 650 requests/sek | ✅ Exceptionellt högt |
| **Totala anrop** | 51 000 | ✅ Stabil throughput |
| **Felmarginal** | < 1% (382 fel) | ⚠️ Breaking Point nådd |

## 2. 👁️ Visuell Verifiering (UX under tryck)
Vi navigerade i systemet *samtidigt* som 500 användare bombaderade servern.

**Resultat:**
- **UI Responsiveness**: Knappar och textfält fungerar fortfarande (man kan skriva i inloggningsfältet utan lagg).
- **Backend-kollaps**: Komplexa anrop (meddelanden, gamification, dashboards) börjar returnera **500 Internal Server Error**.
- **WebSockets**: Anslutningar till realtidstjänster misslyckas.

### Visuell Bevisning
![Dashboard under belastning](file:///C:/Users/alxpa/.gemini/antigravity/brain/e0c48126-bba2-4281-abbf-1d59e3bc8ab4/eduflex_landing_stress_test_1772024423856.png)
*Notera: Sidan laddas, men siffror och dynamisk data saknas på grund av 500-fel.*

![Inloggning under load](file:///C:/Users/alxpa/.gemini/antigravity/brain/e0c48126-bba2-4281-abbf-1d59e3bc8ab4/eduflex_login_typing_stress_1772024436549.png)
*Verifiering: Det går att interagera med UI:t trots att servern går på högvarv.*

## 3. 🏁 Smärtgränsen (The Breaking Point)
Smärtgränsen för en enskild lokal servernod ligger vid ca **500 samtidiga användare**. 
- Vid denna nivå börjar databasanslutningarna ta slut för komplexa frågor.
- Enkla frågor (/tenants) fortsätter fungera men hela applikationen blir instabil.

**Rekommendation för Enterprise:** Aktivera horisontell skalning och öka anslutningspoolen i `application.properties`.
