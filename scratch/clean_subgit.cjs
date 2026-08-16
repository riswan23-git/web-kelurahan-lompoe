const fs = require('fs');
const path = require('path');

const subGit = path.join(__dirname, '..', 'frontend', '.git');
if (fs.existsSync(subGit)) {
    fs.rmSync(subGit, { recursive: true, force: true });
    console.log('Removed sub .git from frontend folder');
}
