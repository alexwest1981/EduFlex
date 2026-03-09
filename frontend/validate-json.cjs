const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

const srcDir = path.join(__dirname, 'src');

console.log('--- JSON VALIDATION START ---');
walk(srcDir, (filePath) => {
    if (filePath.endsWith('.json')) {
        let content = fs.readFileSync(filePath, 'utf8');
        try {
            JSON.parse(content);
        } catch (e) {
            console.log(`INVALID: ${filePath}`);
            console.log(`ERROR: ${e.message}`);
            // Report a snippet of the end of the file
            const lines = content.split('\n');
            const lastLines = lines.slice(-5).join('\n');
            console.log(`END OF FILE:\n${lastLines}\n---`);
        }
    }
});
console.log('--- JSON VALIDATION END ---');
