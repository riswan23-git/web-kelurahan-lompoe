const fs = require('fs');
const path = require('path');
const PizZip = require('../backend/node_modules/pizzip');

const docxPath = path.join(__dirname, '../templates/SRIKANDI - SURAT REKOMENDASI PEMBELIAN BBM.docx');
const zip = new PizZip(fs.readFileSync(docxPath));
const xml = zip.file('word/document.xml').asText();

const paragraphs = xml.split('</w:p>');
paragraphs.forEach((p, i) => {
  const text = p.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text) {
    console.log(`P${i+1}: ${text}`);
  }
});
