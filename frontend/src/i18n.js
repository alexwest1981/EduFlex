import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { api } from './services/api';

/**
 * EDUFLEX LOCALIZATION ENGINE v3.9.0 (Dynamic)
 * 
 * This file dynamically loads all translation files from across the project.
 * It also fetches newly added languages from the backend API.
 */

// --- 1. Load all BUNDLED JSON files dynamically via Vite glob ---
const baseFiles = import.meta.glob('./locales/**/*.json', { eager: true });
const moduleFiles = import.meta.glob([
    './modules/**/locales/*.json',
    './features/**/locales/*.json',
    './features/dashboard/locales/*.json',
    './features/auth/locales/*.json'
], { eager: true });

const resources = {};
const bundledLangs = new Set(['sv', 'en', 'fr', 'de', 'es', 'ar', 'no', 'da', 'fi']);

// --- 2. Process Bundled Base Translations ---
Object.keys(baseFiles).forEach(path => {
    const match = path.match(/\.\/locales\/([^/]+)\/translation\.json/);
    if (match) {
        const lang = match[1];
        if (!resources[lang]) {
            resources[lang] = { translation: {} };
        }
        const content = baseFiles[path].default || baseFiles[path];
        resources[lang].translation = { ...resources[lang].translation, ...content };
    }
});

// --- 3. Process Bundled Module/Feature Translations ---
const moduleNameMapping = {
    'quiz-runner': 'quiz',
    'feedback': 'evaluation'
};

const cleanCode = (code) => code ? code.split('-')[0].split('_')[0].toLowerCase() : 'sv';

Object.keys(moduleFiles).forEach(path => {
    // Match ./modules/name/locales/lang.json or ./features/name/locales/lang.json
    const match = path.match(/\.\/(modules|features)\/([^/]+)\/locales\/([^/]+)\.json/);
    if (match) {
        let moduleName = match[2];
        const lang = match[3]; // Use verbatim lang name from file

        if (moduleNameMapping[moduleName]) {
            moduleName = moduleNameMapping[moduleName];
        }

        if (!resources[lang]) {
            resources[lang] = { translation: {} };
        }

        const content = moduleFiles[path].default || moduleFiles[path];
        resources[lang].translation[moduleName] = {
            ...resources[lang].translation[moduleName],
            ...content
        };
    }
});

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'sv', // Default to sv
        debug: false,
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'cookie', 'navigator'],
            lookupLocalStorage: 'i18nextLng',
            caches: ['localStorage', 'cookie'],
        }
    });

export const initDynamicLanguages = async () => {
    // Disabled as per user request to use static names and no live-sync
    console.log('EDUFLEX: Static Multi-language mode active (proper keys).');
};

export default i18n;
