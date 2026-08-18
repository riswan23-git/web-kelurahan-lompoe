const PizZip = require('pizzip');
const fs = require('fs');

const zip = new PizZip(fs.readFileSync('./templates/SRIKANDI - SURAT KETERANGAN PENGHASILAN ORANG TUA.docx'));
const xml = zip.file('word/document.xml').asText();
const idx = xml.indexOf('Yang bertanda tangan');
console.log(xml.substring(idx, idx + 2500));
