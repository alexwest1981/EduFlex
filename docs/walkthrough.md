# Walkthrough: SYV Hub & Studieplaner (ISP) - v3.2.5

Jag har genomfört en omfattande refaktorisering av SYV-upplevelsen för att prioritera den Individuella Studieplanen (ISP) och säkerställa att den följer Komvux regler för poäng och nivåer.

## 1. Åtgärdat: SYV Inloggningsproblem
Användaren `bengt` (SYV) kan nu logga in utan problem. Felet berodde på en korrupt lösenordshash i den lokala databasen, vilket nu är synkroniserat.

## 2. Refaktorisering av SYV-panelen & Sidebar
SYV-användare landar nu direkt i **Studieplaner (ISP)** genom den primära "Översikt"-länken. Sidomenyn har städats upp för att ge en renare arbetsmiljö för Bengt.

- **Dashboard Integration**: `Dashboard.jsx` mappar rollen `SYV` direkt till `IspDashboard`.
- **Sidebar Cleanup**: 
  - Tog bort redundant "Studieplaner (ISP)" länk då "Översikt" nu fyller denna funktion.
  - Fixade dubbla "Meddelanden"-länkar.
  - Dolde "Butik" och "E-hälsa" då dessa inte är relevanta för SYV-rollen.
- **Live Data**: ISP-vyn hämtar nu studentlista och planer direkt från backend utan mock-data.

## 3. Komvux Compliance i ISP
Eftersom Komvux kräver specifika data för gymnasiala studier har följande lagts till:

### Backend-uppdateringar
- **Databas**: Nya kolumner för `examensmål` och `krav_poäng` i tabellen `individual_study_plans`.
- **Kurshantering**: Lagt till `poäng` (points) och `nivå` (level, t.ex. Gymnasial/Grundläggande) för alla planerade kurser.
- **Service**: `IspService` hanterar nu korrekt mappning av dessa fält vid skapande och uppdatering av planer.

### Frontend-uppdateringar
- **Skapa/Redigera ISP**:
  - Nytt fält för **Examensmål** (t.ex. "Högskoleförberedande examen").
  - Nytt fält för **Krav på poäng** (standard 2500 poäng).
  - Möjlighet att ange **Poäng** och **Nivå** för varje enskild kurs.
- **Detaljvy**:
  - Automatisk beräkning av totalt antal planerade poäng.
  - Tydlig visning av om studenten når upp till poängkravet.

## 4. Verifiering

### Genomförda tester:
1. **Inloggning**: Inloggning som `bengt` ger direkt tillgång till ISP-hubben.
2. **Skapa ISP**: Skapat en test-ISP med gymnasiala kurser (100 po per kurs).
3. **Sidebar**: Verifierat att Bengts sidomeny är ren och fri från redundans.
4. **Data**: Verifierat att backend sparar och returnerar `examensmal` och `points`.

![ISP Dashboard integration](file:///C:/Users/alxpa/.gemini/antigravity/brain/e0c48126-bba2-4281-abbf-1d59e3bc8ab4/media__1771946821838.png)

## Nästa Steg
- Fortsatt testning av kvitteringsflödet (studentens bekräftelse).
- Verifiering av CSN-rapporter för SYV (planerat i nästa sprint).
