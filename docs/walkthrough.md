# Premium PWA Experience Implementation

I have upgraded the EduFlex Progressive Web App (PWA) experience to feel like a premium, native-app-like platform. 

### Key Features Implemented:

1.  **Dedicated Installation Prompt**:
    *   Added a modern, non-intrusive install banner that appears when the app is "Installable".
    *   Includes a "Hämta appen"-button that triggers the native browser installation flow.
    *   Automatically hides after installation or if the user dismisses it.

2.  **Automatic Image Resizing (Cloud-Scale Precision)**:
    *   **NO MORE MANUAL RESIZING**: You can now upload any square image (e.g., your high-res logo) and the dashboard will automatically **scale and crop** it to exactly **192x192** and **512x512** pixels right in your browser.
    *   This ensures 100% compatibility with Chrome/Android and preventing "incorrect size" warnings in the console.

3.  **Whitelabel Admin Control**:
    *   New settings in **Enterprise Whitelabel -> PWA (Mobilapp)** allow you to set:
        *   **Appnamn**: How the app appears on the home screen.
        *   **Kortnamn**: Used where space is limited.
        *   **Ikoner**: Dedicated uploaders for 192px and 512px icons (powered by the new auto-resizer).
        *   **Färger**: Theme and background colors for the splash screen.

4.  **Backend Robustness & Diagnostics**:
    *   Implemented a dynamic manifest generator that serves your custom assets.
    *   Added detailed diagnostic logging to track upload status and catch any asset-specific issues.
    *   Fixed a naming collision in the admin menu that was causing a dashboard crash.

### How to use:
1.  Go to **Enterprise Whitelabel -> PWA (Mobilapp)**.
2.  Ladda upp en bild (Auto-resizern fixar storleken!).
3.  Spara ändringar.
4.  Öppna EduFlex i Chrome på din telefon/dator - du bör nu se den nya installations-prompten och dina egna ikoner!

---

## PWA & Mobil-app Konsolidering

Vi har förenklat whitelabel-upplevelsen genom att slå ihop Mobil- och PWA-inställningar till en enda kraftfull flik.

### Genomförda förbättringar:
- [x] Slå ihop Mobil och PWA branding till en flik "PWA & Mobil-app"
- [x] Ta bort redundant `mobile/` mapp (React Native)
- [x] Synka PWA färg med mobil-tema färg automatiskt
- [x] Aktivera "Texter & Meddelanden" fliken och centralisera texter
- [x] Aktivera "Avancerad CSS" fliken med fungerande editor
- [x] Ta bort redundant text-input från "Allmänt"-fliken
- [x] Uppdatera versionsnummer till **v2.0.18** i samtliga vyer

---

### Senaste uppdateringar:
*   **v2.0.18 Release**: Synkroniserat versionsnummer i hela applikationen.
*   **Whitelabel 2.0 Rollout**: Fullt aktiverade flikar för Texter & Meddelanden samt Avancerad CSS.
*   **PWA Synergy**: Fixat manifest-konflikter och säkerställt stabil klientsidubearbetning av ikoner.
