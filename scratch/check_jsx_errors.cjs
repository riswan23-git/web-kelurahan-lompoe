const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function checkFile(filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    // Check for risky patterns like .map or .filter on uninitialized variables
    const matches = code.match(/([a-zA-Z0-9_]+)\.(map|filter|forEach|reduce|length)/g) || [];
    console.log(`${path.basename(filePath)} has ${matches.length} property accesses.`);
}

fs.readdirSync(srcDir).forEach(file => {
    if (file.endsWith('.jsx') || file.endsWith('.js')) {
        checkFile(path.join(srcDir, file));
    }
});
