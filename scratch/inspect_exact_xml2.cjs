const PizZip = require('pizzip');
const fs = require('fs');

const zip = new PizZip(fs.readFileSync('./templates/SRIKANDI - SURAT KETERANGAN PENGHASILAN ORANG TUA.docx'));
const xml = zip.file('word/document.xml').asText();
const pos = xml.indexOf('Yang bertanda tangan');
const pos2 = xml.indexOf('Menerangkan dengan sesungguhnya');
console.log('XML snippet 2:');
console.log(xml.substring(pos, pos2));
