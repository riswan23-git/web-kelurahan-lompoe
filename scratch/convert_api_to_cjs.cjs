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
            if (content.includes('export default function handler(req, res)')) {
                content = content.replace(/export default function handler\(req,\s*res\)/g, 'module.exports = (req, res) =>');
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Converted to CommonJS: ${fullPath}`);
            } else if (content.includes('export default')) {
                content = content.replace(/export default /g, 'module.exports = ');
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Converted to CommonJS: ${fullPath}`);
            }
        }
    });
}

convertDirectory(path.join(rootDir, 'api'));
console.log('All API handlers converted to CommonJS module.exports format!');
