const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');

const templatePath = path.join(__dirname, '..', 'templates', 'SRIKANDI - SURAT REKOMENDASI PEMBELIAN BBM.docx');
const content = fs.readFileSync(templatePath);
const zip = new PizZip(content);
const xml = zip.files['word/document.xml'].asText();

console.log('--- SEARCHING FOR JENIS USAHA IN XML ---');
const idx = xml.indexOf('Jenis Usaha/Kegiatan');
if (idx !== -1) {
  console.log(xml.substring(idx - 50, idx + 300));
}
