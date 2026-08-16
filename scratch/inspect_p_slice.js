const fs = require('fs');
const path = require('path');
const PizZip = require('../backend/node_modules/pizzip');

const origPath = path.join(__dirname, '../templates/SRIKANDI - SURAT REKOMENDASI PEMBELIAN BBM.docx');
const zip = new PizZip(fs.readFileSync(origPath));
const xml = zip.file('word/document.xml').asText();

const alamatIdx = xml.indexOf('Alamat Usaha');
const pBetweenStart = xml.indexOf('<w:p ', alamatIdx);
const pBetweenEnd = xml.indexOf('</w:p>', pBetweenStart) + 6;

console.log('SLICED PARAGRAPH IS:');
console.log(xml.slice(pBetweenStart, pBetweenEnd));
