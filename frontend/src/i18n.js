import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importera alla språkfiler
import translationSV from './locales/sv/translation.json';
import translationEN from './locales/en/translation.json';
import translationFR from './locales/fr/translation.json';
import translationDE from './locales/de/translation.json';
import translationES from './locales/es/translation.json';
import translationAR from './locales/ar/translation.json';

const resources = {
    sv: { translation: translationSV },
    en: { translation: translationEN },
    fr: { translation: translationFR },
    de: { translation: translationDE },
    es: { translation: translationES },
    ar: { translation: translationAR }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'sv', // Fallback till svenska om språket saknas
        debug: false,
        interpolation: {
            escapeValue: false,
        }
    });

export default i18n;