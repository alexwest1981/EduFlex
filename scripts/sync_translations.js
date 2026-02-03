const fs = require('fs');
const path = require('path');

// Try to load DeepL if available
let deepl = null;
try {
    deepl = require('deepl-node');
} catch (e) {
    // deepl-node not installed locally in script dir, try frontend dir
    try {
        deepl = require(path.join(__dirname, '../frontend/node_modules/deepl-node'));
    } catch (e2) {
        console.log("DeepL library not found. Will use [MISSING] placeholders.");
    }
}

const LOCALES_DIR = path.join(__dirname, '../frontend/src/locales');
const SOURCE_LANG = 'sv'; // Source of truth
const API_KEY = process.env.DEEPL_API_KEY; // Get key from env

let translator = null;
if (deepl && API_KEY) {
    translator = new deepl.Translator(API_KEY);
    console.log("DeepL Translator Initialized.");
} else if (!API_KEY) {
    console.log("Tips: Set DEEPL_API_KEY environment variable to enable auto-translation.");
}

// Map frontend locale codes to DeepL codes
const LANGUAGE_MAP = {
    'en': 'en-GB', // Prefer British English
    'da': 'da',
    'no': 'nb', // Norwegian Bokmål
    'fi': 'fi',
    'de': 'de',
    'fr': 'fr',
    'es': 'es',
    'sv': null // source
    // Add ar if supported by DeepL (yes it is)
};

async function syncKeys(source, target, languageCode) {
    const output = { ...target };
    let hasChanges = false;

    // We collect all texts to translate in a batch to save API calls? 
    // For simplicity V1: Translate one by one (slower but safer)
    // Actually, let's just mark missing first, then translate in a second pass or inline.

    for (const key in source) {
        if (typeof source[key] === 'object' && source[key] !== null) {
            output[key] = await syncKeys(source[key], target[key] || {}, languageCode);
        } else {
            if (!target[key] || target[key].startsWith('[MISSING]')) {
                // It's missing or previously marked as missing
                const sourceText = source[key];

                if (translator && LANGUAGE_MAP[languageCode]) {
                    try {
                        const result = await translator.translateText(sourceText, 'sv', LANGUAGE_MAP[languageCode]);
                        output[key] = result.text;
                        console.log(`[${languageCode}] Translated: "${sourceText}" -> "${result.text}"`);
                        hasChanges = true;
                    } catch (error) {
                        console.error(`[${languageCode}] Translation failed for "${key}": ${error.message}`);
                        output[key] = `[MISSING] ${sourceText}`;
                    }
                } else {
                    if (!target[key]) {
                        console.log(`[${languageCode}] Missing: ${key}`);
                        output[key] = `[MISSING] ${sourceText}`;
                        hasChanges = true;
                    }
                }
            }
        }
    }
    return output;
}

async function run() {
    console.log(`Syncing translations from source: ${SOURCE_LANG}`);

    const sourcePath = path.join(LOCALES_DIR, SOURCE_LANG, 'translation.json');
    if (!fs.existsSync(sourcePath)) {
        console.error(`Source file not found: ${sourcePath}`);
        process.exit(1);
    }

    const sourceContent = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    const languages = fs.readdirSync(LOCALES_DIR).filter(f => fs.statSync(path.join(LOCALES_DIR, f)).isDirectory());

    for (const lang of languages) {
        if (lang === SOURCE_LANG) continue;

        const targetPath = path.join(LOCALES_DIR, lang, 'translation.json');
        let targetContent = {};

        if (fs.existsSync(targetPath)) {
            targetContent = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
        }

        console.log(`Processing ${lang}...`);
        const syncedContent = await syncKeys(sourceContent, targetContent, lang);

        fs.writeFileSync(targetPath, JSON.stringify(syncedContent, null, 2), 'utf8');
    }

    console.log('Done!');
}

run();
