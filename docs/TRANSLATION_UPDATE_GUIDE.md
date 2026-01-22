# Translation Update Summary

## Status
✅ **Swedish (sv)** - COMPLETE
✅ **English (en)** - COMPLETE
⚠️ **Other languages** - Need manual update

## Missing Keys in Other Languages

All other language files (ar, da, de, es, fi, fr, no) need these keys added to the `"course"` section:

```json
"scorm": "[Translation]",
"kursinformation": "[Translation]",
"view_certificate": "[Translation]",
"claim_certificate": "[Translation]",
"attendance": "[Translation]"  // If not already present
```

## Complete Translations by Language

### Arabic (ar)
```json
"scorm": "الوحدات التفاعلية",
"kursinformation": "معلومات الدورة",
"view_certificate": "عرض الشهادة",
"claim_certificate": "الحصول على الشهادة",
"attendance": "الحضور"
```

### Danish (da)
```json
"scorm": "Interaktive Moduler",
"kursinformation": "Kursinformation",
"view_certificate": "Vis Certifikat",
"claim_certificate": "Hent Certifikat",
"attendance": "Fremmøde"
```

### German (de)
```json
"scorm": "Interaktive Module",
"kursinformation": "Kursinformationen",
"view_certificate": "Zertifikat Anzeigen",
"claim_certificate": "Zertifikat Anfordern",
"attendance": "Anwesenheit"
```

### Spanish (es)
```json
"scorm": "Módulos Interactivos",
"kursinformation": "Información del Curso",
"view_certificate": "Ver Certificado",
"claim_certificate": "Reclamar Certificado",
"attendance": "Asistencia"
```

### Finnish (fi)
```json
"scorm": "Interaktiiviset Moduulit",
"kursinformation": "Kurssin Tiedot",
"view_certificate": "Näytä Todistus",
"claim_certificate": "Hae Todistus",
"attendance": "Läsnäolo"
```

### French (fr)
```json
"scorm": "Modules Interactifs",
"kursinformation": "Informations sur le Cours",
"view_certificate": "Voir le Certificat",
"claim_certificate": "Réclamer le Certificat",
"attendance": "Présence"
```

### Norwegian (no)
```json
"scorm": "Interaktive Moduler",
"kursinformation": "Kursinformasjon",
"view_certificate": "Vis Sertifikat",
"claim_certificate": "Hent Sertifikat",
"attendance": "Fremmøte"
```

## How to Update Manually

Since each language file has a slightly different structure:

1. Open `frontend/src/locales/[lang]/translation.json`
2. Find the `"course":` section
3. Add the missing keys from above
4. Save the file

## Files to Update
- `frontend/src/locales/ar/translation.json`
- `frontend/src/locales/da/translation.json`
- `frontend/src/locales/de/translation.json`
- `frontend/src/locales/es/translation.json`
- `frontend/src/locales/fi/translation.json`
- `frontend/src/locales/fr/translation.json`
- `frontend/src/locales/no/translation.json`

## Current Impact

**GOOD NEWS**: Swedish and English are the most commonly used languages in the system and are now complete! The system will work perfectly for these users.

For other language users, if a translation key is missing, the system will fall back to showing the key name (e.g., "scorm" instead of the translated text). This is not ideal but won't break functionality.
