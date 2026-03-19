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
// We remove eager: true to prevent loading 1100+ files on the landing page
const baseFiles = import.meta.glob('./locales/**/*.json');
const moduleFiles = import.meta.glob([
    './modules/**/locales/*.json',
    './features/**/locales/*.json',
    './features/dashboard/locales/*.json',
    './features/auth/locales/*.json'
]);

const resources = {};
// We still define which languages are available
const bundledLangs = ['sv', 'en', 'fr', 'de', 'es', 'ar', 'no', 'da', 'fi'];

// --- 2. Custom Backend for i18next to load glob files on demand ---
const globBackend = {
    type: 'backend',
    read: async (language, namespace, callback) => {
        try {
            const langResources = {};
            
            // Load base translation
            const baseKey = `./locales/${language}/translation.json`;
            if (baseFiles[baseKey]) {
                const mod = await baseFiles[baseKey]();
                Object.assign(langResources, mod.default || mod);
            }

            // Load module/feature translations
            const moduleNameMapping = {
                'quiz-runner': 'quiz',
                'feedback': 'evaluation'
            };

            for (const [path, loader] of Object.entries(moduleFiles)) {
                // Match ./modules/name/locales/lang.json or ./features/name/locales/lang.json
                const match = path.match(/\.\/(modules|features)\/([^/]+)\/locales\/([^/]+)\.json/);
                if (match && match[3] === language) {
                    let moduleName = match[2];
                    if (moduleNameMapping[moduleName]) moduleName = moduleNameMapping[moduleName];
                    
                    const mod = await loader();
                    langResources[moduleName] = {
                        ...langResources[moduleName],
                        ...(mod.default || mod)
                    };
                }
            }
            
            callback(null, langResources);
        } catch (err) {
            callback(err, null);
        }
    }
};

i18n
    .use(globBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'sv',
        debug: false,
        returnObjects: true,
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
