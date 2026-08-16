const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

function convertDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            convertDirectory(fullPath);
        } else if (file.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('module.exports =')) {
                content = content.replace(/module\.exports\s*=\s*\((req,\s*res)\)\s*=>/g, 'export default function handler($1)');
                content = content.replace(/module\.exports\s*=\s*/g, 'export default ');
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Converted to ESM: ${fullPath}`);
            }
        }
    });
}

convertDirectory(path.join(rootDir, 'api'));
convertDirectory(path.join(rootDir, 'frontend', 'api'));
console.log('All API handlers converted to ES module format!');
