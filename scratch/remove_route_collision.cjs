const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

const filesToRemove = [
    path.join(rootDir, 'api', 'admin.js'),
    path.join(rootDir, 'frontend', 'api', 'admin.js')
];

filesToRemove.forEach(file => {
    if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`Removed route collision file: ${file}`);
    }
});

console.log('Route collision cleanup complete!');
