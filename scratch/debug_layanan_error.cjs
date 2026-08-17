const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const apiDir = path.join(rootDir, 'api');
const layananPath = path.join(apiDir, 'layanan.js');

let layananCode = fs.readFileSync(layananPath, 'utf8');

// Wrap body of module.exports in try-catch to reveal exact error
const oldExportHead = `module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const url = req.url || '';`;

const newExportHead = `module.exports = (req, res) => {
    try {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        if (req.method === 'OPTIONS') return res.status(200).end();

        const url = req.url || '';`;

if (layananCode.includes(oldExportHead)) {
    layananCode = layananCode.replace(oldExportHead, newExportHead);
    // Add try block close
    layananCode = layananCode.replace(/return res.status\(200\).json\(store.pengajuanList\);\n\};$/, `return res.status(200).json(store.pengajuanList);
    } catch (err) {
        console.error('Layanan handler error:', err);
        return res.status(500).send('Error: ' + (err.stack || err.message));
    }
};`);
    fs.writeFileSync(layananPath, layananCode, 'utf8');
    console.log('Successfully added try-catch debug wrapper to api/layanan.js!');
}
