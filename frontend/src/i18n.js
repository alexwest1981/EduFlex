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
const moduleFiles = import.meta.glob(['./modules/**/locales/*.json', './features/**/locales/*.json'], { eager: true });

const resources = {};
const bundledLangs = new Set(['sv', 'en', 'fr', 'de', 'es', 'ar', 'no', 'da', 'fi']);

// Initialize resources
bundledLangs.forEach(lang => {
    resources[lang] = { translation: {} };
});

// --- 2. Process Bundled Base Translations ---
Object.keys(baseFiles).forEach(path => {
    const match = path.match(/\.\/locales\/([^/]+)\/translation\.json/);
    if (match) {
        const lang = match[1];
        if (resources[lang]) {
            resources[lang].translation = { ...resources[lang].translation, ...baseFiles[path].default };
        }
    }
});

// --- 3. Process Bundled Module/Feature Translations ---
const moduleNameMapping = {
    'quiz-runner': 'quiz',
    'feedback': 'evaluation'
};

const cleanCode = (code) => code ? code.split('-')[0].split('_')[0].toLowerCase() : 'sv';

Object.keys(moduleFiles).forEach(path => {
    const match = path.match(/\.\/(modules|features)\/([^/]+)\/locales\/([^/]+)\.json/);
    if (match) {
        let moduleName = match[2];
        const lang = cleanCode(match[3]);

        if (moduleNameMapping[moduleName]) {
            moduleName = moduleNameMapping[moduleName];
        }

        if (resources[lang]) {
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
        fallbackLng: 'sv',
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

// --- 4. ASYNC LOADING of Dynamic Languages ---
export const initDynamicLanguages = async () => {
    try {
        const languages = await api.get('/languages/enabled');
        if (!Array.isArray(languages)) return;

        for (const langObj of languages) {
            const code = cleanCode(langObj.code);
            // If it's a new language not in our bundle, we need to fetch its parts
            if (!bundledLangs.has(code)) {
                // Fetch base translation
                try {
                    const baseRes = await api.get(`/languages/${code}/translations/translation`);
                    if (baseRes) {
                        const data = typeof baseRes === 'string' ? JSON.parse(baseRes) : baseRes;
                        i18n.addResourceBundle(code, 'translation', data, true, true);
                    }
                } catch (e) { console.warn(`Base translations missing for ${code}`); }

                // Fetch important module translations
                const modulesToFetch = ['auth', 'dashboard', 'common'];
                for (const mod of modulesToFetch) {
                    try {
                        const modRes = await api.get(`/languages/${code}/translations/${mod}`);
                        if (modRes) {
                            const data = typeof modRes === 'string' ? JSON.parse(modRes) : modRes;
                            const current = i18n.getResourceBundle(code, 'translation') || {};
                            current[mod] = data;
                            i18n.addResourceBundle(code, 'translation', current, true, true);
                        }
                    } catch (e) { }
                }
            }
        }
    } catch (error) {
        console.error('Failed to load dynamic languages:', error);
    }
};

export default i18n;
