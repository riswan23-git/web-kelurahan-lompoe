const fs = require('fs');
const path = require('path');
const PizZip = require('../backend/node_modules/pizzip');
const Docxtemplater = require('../backend/node_modules/docxtemplater');

const docxPath = path.join(__dirname, '../templates/SRIKANDI - SURAT REKOMENDASI PEMBELIAN BBM.docx');
const zip = new PizZip(fs.readFileSync(docxPath));

try {
  const doc = new Docxtemplater(zip, {
    delimiters: { start: '<<', end: '>>' },
    paragraphLoop: true,
    linebreaks: true
  });
  console.log('Docxtemplater loaded template with ZERO errors!');
} catch (e) {
  console.error('Docxtemplater error:', e);
  if (e.properties) console.error(JSON.stringify(e.properties, null, 2));
}
