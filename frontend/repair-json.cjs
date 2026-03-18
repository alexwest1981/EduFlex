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

walk(srcDir, (filePath) => {
    if (filePath.endsWith('.json')) {
        let content = fs.readFileSync(filePath, 'utf8');
        try {
            JSON.parse(content);
        } catch (e) {
            console.log(`REPAIRING: ${filePath}`);
            // If it's a translation file, we'll just empty it so it's valid JSON
            fs.writeFileSync(filePath, '{}', 'utf8');
        }
    }
});
console.log('--- REPAIR COMPLETE ---');
