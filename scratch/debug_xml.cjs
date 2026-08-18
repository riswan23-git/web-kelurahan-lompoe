const PizZip = require('pizzip');
const fs = require('fs');

const content = fs.readFileSync('./templates/SRIKANDI - SURAT KETERANGAN PENGHASILAN ORANG TUA.docx');
const zip = new PizZip(content);

let xml = zip.file('word/document.xml').asText();
console.log('Original XML around offset 2932:');
console.log(xml.substring(2800, 3100));
