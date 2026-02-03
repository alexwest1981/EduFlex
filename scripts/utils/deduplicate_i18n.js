const fs = require('fs');
const path = require('path');

/**
 * Deduplicates keys in a translation JSON file while preserving structure.
 * It reads the file, parses it, and writes it back formatted.
 * Since it's a JS object, duplicate keys in the source will naturally be resolved
 * by the parser (last one wins).
 */
function deduplicate(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        // The JSON.parse naturally resolves duplicates by taking the last occurrence
        const parsed = JSON.parse(content);
        const formatted = JSON.stringify(parsed, null, 2);
        fs.writeFileSync(filePath, formatted);
        console.log(`Successfully deduplicated: ${filePath}`);
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
    }
}

const svPath = path.resolve(__dirname, '../../frontend/src/locales/sv/translation.json');
const enPath = path.resolve(__dirname, '../../frontend/src/locales/en/translation.json');

deduplicate(svPath);
deduplicate(enPath);
