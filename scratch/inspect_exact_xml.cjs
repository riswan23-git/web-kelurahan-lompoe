const PizZip = require('pizzip');
const fs = require('fs');

const zip = new PizZip(fs.readFileSync('./templates/SRIKANDI - SURAT KETERANGAN PENGHASILAN ORANG TUA.docx'));
const xml = zip.file('word/document.xml').asText();

const pos = xml.indexOf('Yang bertanda tangan');
console.log('XML snippet 1:');
console.log(xml.substring(pos, pos + 1500));
