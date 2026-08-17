const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const apiDir = path.join(rootDir, 'api');
const layananPath = path.join(apiDir, 'layanan.js');

let layananCode = fs.readFileSync(layananPath, 'utf8');

// Replace top level requires with lazy requires
layananCode = layananCode.replace("const PizZip = require('pizzip');\nconst Docxtemplater = require('docxtemplater');", "// Lazy loaded PizZip & Docxtemplater");

const oldDocxBlockHead = `            const content = fs.readFileSync(templatePath);
            const zip = new PizZip(content);
            const doc = new Docxtemplater(zip, {`;

const newDocxBlockHead = `            let PizZip = require('pizzip');
            let Docxtemplater = require('docxtemplater');
            const content = fs.readFileSync(templatePath);
            const zip = new PizZip(content);
            const doc = new Docxtemplater(zip, {`;

if (layananCode.includes(oldDocxBlockHead)) {
    layananCode = layananCode.replace(oldDocxBlockHead, newDocxBlockHead);
}

fs.writeFileSync(layananPath, layananCode, 'utf8');
console.log('Successfully updated api/layanan.js lazy loading for PizZip!');
