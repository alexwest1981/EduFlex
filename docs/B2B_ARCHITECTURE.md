# B2B Extended Enterprise Architecture (EduFlex LLP)

Denna dokumentation beskriver hur EduFlex plattformen hanterar B2B-försäljning (Företagsköp av kurser) i vår unika Multi-Tenant-miljö, känt som "Extended Enterprise".

## Utmaningen i traditionella LMS
I traditionella LMS bygger man ofta upp isolerade instanser (portaler) för varje kundföretag. När företag A vill köpa en kurs, skapar administratören en bokstavlig kopia (SCORM-filer, videor etc.) av Master-kursen och publicerar den i Företag A:s portal. 
Problem: Om ett fel upptäcks i ett quiz, måste administratören manuellt leta upp och uppdatera kopian i hundratals olika portaler.

## EduFlex "Single Source of Truth" & Pointer-Principen
Vi utnyttjar vår Schema-per-Tenant-arkitektur.
Originalkursen publiceras en enda gång i databasens `public`-schema, med visibilitetsflaggan `GLOBAL_LIBRARY`.

När Företag A köper kursen kopieras inte en enda fil. Istället upprättas en **Pointer** (genom entiteten `CourseLicense`).
Pointern sparas i Företag A:s isolerade schema, och refererar till Master-kursen.

### Mekanimen bakom Pointers (CourseLicenses)
Entiteten `CourseLicense` fungerar som vår "Seat License":
- `course_id`: ID till Master-kursen i public.
- `total_seats`: Hur många anställda som företaget köpt tillgång för.
- `used_seats`: Hur många anställda som blivit enrollade.
- `expires_at`: Utgångsdatum för B2B-licensen (T.ex. 12 månader).

När en anställd på Företag A loggar in kommer vår Enrollment-logik i `CourseService` att scanna `course_licenses` i Företag A:s metadata. Hittas en giltig licens med lediga platser, visas kursen öppen för anmälan. När den anställde trycker på "Påbörja" förbrukas 1 plats, och Eleven kopplas till kursen.

### Datasäkerhet och Isolering (Vattentäta Skott)
När den anställde därefter genomför kursen, tittar de på material som streamas från Master-kursen (`GLOBAL_LIBRARY`). Men alla deras framsteg, videokoll, quiz-resultat och inlämningar hamnar i **deras egna inloggade Session Context**, vilket via Hibernate Multi-Tenancy routes till Företag A:s isolerade schema.
Resultatet: Super-enkel centraliserad kursuppdatering ("Single Source of Truth") kombinerat med absolut och säker Data Privacy ("Schema Isolation").

## Modulen: Reseller System 1.2
Hela denna e-handelsmotor och sälj-dashboard, inklusive rabattkods-hantering och licensgenerering, är innesluten i modulen `RESELLER_SYSTEM`. Denna modul är dynamisk och enbart tillgänglig för Tenants med `ENTERPRISE`-licens.

---
**Sammanfattning**: Byggt för obegränsad skalbarhet utan administrativ mardröm. En B2B SaaS i världsklass.
