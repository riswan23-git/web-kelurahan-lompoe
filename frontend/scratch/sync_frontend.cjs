const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');

function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach(childItemName => {
            if (childItemName === 'node_modules' || childItemName === 'dist') return;
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

// Copy api to frontend/api
copyRecursiveSync(path.join(rootDir, 'api'), path.join(frontendDir, 'api'));
// Copy src to frontend/src
copyRecursiveSync(path.join(rootDir, 'src'), path.join(frontendDir, 'src'));
// Copy vercel.json
fs.copyFileSync(path.join(rootDir, 'vercel.json'), path.join(frontendDir, 'vercel.json'));

console.log('Successfully synced api, src, and vercel.json into frontend folder!');
