const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '..', 'api');

function checkFile(filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    console.log(`Checking ${filePath} (${code.length} bytes)...`);
    
    // Test parsing with Function constructor or eval in node
    try {
        new Function(code);
        console.log(`  -> Syntax OK!`);
    } catch (e) {
        console.error(`  -> SYNTAX ERROR in ${filePath}:`, e.message);
    }
}

function checkDir(dir) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(file => {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
            checkDir(full);
        } else if (file.endsWith('.js')) {
            checkFile(full);
        }
    });
}

checkDir(apiDir);
