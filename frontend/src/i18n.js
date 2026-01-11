import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import Base Translations
import translationSV from './locales/sv/translation.json';
import translationEN from './locales/en/translation.json';
import translationFR from './locales/fr/translation.json';
import translationDE from './locales/de/translation.json';
import translationES from './locales/es/translation.json';
import translationAR from './locales/ar/translation.json';
import translationNO from './locales/no/translation.json';
import translationDA from './locales/da/translation.json';
import translationFI from './locales/fi/translation.json';

// Import Module Translations (Swedish only for now as refactor step)
// NOTE: Ideally this would be done dynamically, but explicit imports are safer for now.
import quizSV from './modules/quiz-runner/locales/sv.json';
import chatSV from './modules/chat/locales/sv.json';
import forumSV from './modules/forum/locales/sv.json';
import assSV from './modules/assignments/locales/sv.json'; // assignments
import gamSV from './modules/gamification/locales/sv.json';
import calSV from './features/calendar/locales/sv.json';
import docSV from './features/documents/locales/sv.json';
import catSV from './features/catalog/locales/sv.json';
import profSV from './features/profile/locales/sv.json';

// Helper to merge translations
const mergeTranslations = (base, ...modules) => {
    let merged = { ...base };

    // Modules: Map directly to top-level keys matching module names
    // Check if key exists in base to avoid overwrite if not intended, or overwrite if intended.
    // Based on my file creation:
    // quizSV -> "quiz" (implicit or explicit in file? In file I used flat keys usually)
    // Actually, the new files have keys like "title", "header" etc.
    // I need to nest them under their module name if the app expects `t('quiz.header')`.

    merged.quiz = quizSV;
    merged.chat = chatSV;
    merged.forum = forumSV;
    merged.assignments = assSV;
    merged.gamification = gamSV;
    merged.calendar = calSV;
    merged.docs = docSV;
    merged.catalog = catSV;
    merged.profile = profSV;

    return merged;
};

const resources = {
    sv: { translation: mergeTranslations(translationSV) },
    // For other languages, we keep using the big file until we split them too.
    en: { translation: translationEN },
    fr: { translation: translationFR },
    de: { translation: translationDE },
    es: { translation: translationES },
    ar: { translation: translationAR },
    no: { translation: translationNO },
    da: { translation: translationDA },
    fi: { translation: translationFI }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'sv',
        debug: false,
        interpolation: {
            escapeValue: false,
        }
    });

export default i18n;