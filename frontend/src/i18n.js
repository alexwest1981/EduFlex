import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

/**
 * EDUFLEX LOCALIZATION ENGINE
 * 
 * This file dynamically loads all translation files from across the project.
 * It handles both:
 * 1. Base translations:  src/locales/{lang}/translation.json
 * 2. Module/Feature:    src/(modules|features)/{name}/locales/{lang}.json
 */

const supportedLngs = ['sv', 'en', 'fr', 'de', 'es', 'ar', 'no', 'da', 'fi'];

// --- 1. Load all JSON files dynamically via Vite glob ---
const baseFiles = import.meta.glob('./locales/**/*.json', { eager: true });
const moduleFiles = import.meta.glob(['./modules/**/locales/*.json', './features/**/locales/*.json'], { eager: true });

const resources = {};

// Initialize resources object for all supported languages
supportedLngs.forEach(lang => {
    resources[lang] = { translation: {} };
});

// --- 2. Process Base Translations ---
// Path pattern: ./locales/{lang}/translation.json
Object.keys(baseFiles).forEach(path => {
    const match = path.match(/\.\/locales\/([^/]+)\/translation\.json/);
    if (match) {
        const lang = match[1];
        if (resources[lang]) {
            resources[lang].translation = { ...resources[lang].translation, ...baseFiles[path].default };
        }
    }
});

// --- 3. Process Module/Feature Translations ---
// Path pattern: ./[modules|features]/{moduleName}/locales/{lang}.json
Object.keys(moduleFiles).forEach(path => {
    const match = path.match(/\.\/(modules|features)\/([^/]+)\/locales\/([^/]+)\.json/);
    if (match) {
        const moduleName = match[2];
        const lang = match[3];

        if (resources[lang]) {
            // We nest these under their module name (e.g., t('quiz.title'))
            resources[lang].translation[moduleName] = {
                ...resources[lang].translation[moduleName],
                ...moduleFiles[path].default
            };
        }
    }
});

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        supportedLngs,
        fallbackLng: 'sv',
        debug: false,
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'cookie', 'navigator'],
            caches: ['localStorage', 'cookie'],
        }
    });

export default i18n;
