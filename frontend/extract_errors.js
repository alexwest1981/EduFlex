import fs from 'fs';
const data = JSON.parse(fs.readFileSync('lint_utf8.json', 'utf8'));
const errors = data.filter(file => file.errorCount > 0).map(file => ({
    filePath: file.filePath,
    errors: file.messages.filter(m => m.severity === 2)
}));
console.log(JSON.stringify(errors, null, 2));
