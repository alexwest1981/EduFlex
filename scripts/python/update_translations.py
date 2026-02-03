import json
import os

# Base translations to add
new_translations = {
    "course": {
        "scorm": {
            "sv": "Interaktiva Moduler",
            "en": "Interactive Modules",
            "ar": "الوحدات التفاعلية",
            "da": "Interaktive Mo duler",
            "de": "Interaktive Module",
            "es": "Módulos Interactivos",
            "fi": "Interaktiiviset Moduulit",
            "fr": "Modules Interactifs",
            "no": "Interaktive Moduler"
        },
        "kursinformation": {
            "sv": "Kursinformation",
            "en": "Course Information",
            "ar": "معلومات الدورة",
            "da": "Kursinformation",
            "de": "Kursinformationen",
            "es": "Información del Curso",
            "fi": "Kurssin Tiedot",
            "fr": "Informations sur le Cours",
            "no": "Kursinformasjon"
        },
        "view_certificate": {
            "sv": "Visa Certifikat",
            "en": "View Certificate",
            "ar": "عرض الشهادة",
            "da": "Vis Certifikat",
            "de": "Zertifikat Anzeigen",
            "es": "Ver Certificado",
            "fi": "Näytä Todistus",
            "fr": "Voir le Certificat",
            "no": "Vis Sertifikat"
        },
        "claim_certificate": {
            "sv": "Hämta Certifikat",
            "en": "Claim Certificate",
            "ar": "الحصول على الشهادة",
            "da": "Hent Certifikat",
            "de": "Zertifikat Anfordern",
            "es": "Reclamar Certificado",
            "fi": "Hae Todistus",
            "fr": "Réclamer le Certificat",
            "no": "Hent Sertifikat"
        }
    }
}

# Directory containing translation files
locales_dir = "e:/Projekt/EduFlex/frontend/src/locales"

# Languages to update
languages = ["sv", "en", "ar", "da", "de", "es", "fi", "fr", "no"]

for lang in languages:
    file_path = os.path.join(locales_dir, lang, "translation.json")
    
    try:
        # Read existing translation file
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Ensure 'course' section exists
        if 'course' not in data:
            data['course'] = {}
        
        # Add new translations
        for key, translations in new_translations['course'].items():
            if key not in data['course']:
                data['course'][key] = translations[lang]
        
        # Write back updated translations
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Updated {lang}/translation.json")
    
    except Exception as e:
        print(f"❌ Error updating {lang}: {e}")

print("\n🎉 All translation files updated!")
