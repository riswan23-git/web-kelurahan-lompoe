const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '..', 'frontend');

if (fs.existsSync(frontendDir)) {
    fs.rmSync(frontendDir, { recursive: true, force: true });
    console.log('Successfully removed redundant frontend directory!');
} else {
    console.log('frontend directory already removed.');
}
