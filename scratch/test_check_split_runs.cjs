const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const templatesDir = './templates';
const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.docx'));

console.log('--- CHECKING SPLIT RUNS IN ALL 14 TEMPLATES ---');
files.forEach(file => {
  const content = fs.readFileSync(path.join(templatesDir, file));
  const zip = new PizZip(content);
  const xml = zip.file('word/document.xml').asText();
  
  const hasNama = xml.includes('Pejabat yang Bertanda Tangan');
  const hasJabatan = xml.includes('Jabatan Pejabat yang Bertanda Tangan');
  const hasNip = xml.includes('NIP Pejabat yang Bertanda Tangan');
  const hasPangkat = xml.includes('Pangkat Pejabat yang Bertanda Tangan');
  
  console.log(`${file}:`);
  console.log(`   Nama exact match: ${hasNama}`);
  console.log(`   Jabatan exact match: ${hasJabatan}`);
  console.log(`   Nip exact match: ${hasNip}`);
  console.log(`   Pangkat exact match: ${hasPangkat}`);
});
