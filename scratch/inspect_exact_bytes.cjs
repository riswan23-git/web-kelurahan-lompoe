const PizZip = require('pizzip');
const fs = require('fs');

const zip = new PizZip(fs.readFileSync('./templates/SRIKANDI - SURAT KETERANGAN PENGHASILAN ORANG TUA.docx'));
const xml = zip.file('word/document.xml').asText();

const pos = xml.indexOf('Yang bertanda tangan');
const posEnd = xml.indexOf('Menerangkan dengan sesungguhnya');

const section = xml.substring(pos, posEnd);
console.log('RAW SECTION LENGTH:', section.length);
console.log('RAW SECTION XML:');
console.log(section);
