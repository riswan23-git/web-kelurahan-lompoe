const PizZip = require('pizzip');
const fs = require('fs');

const content = fs.readFileSync('./templates/SRIKANDI - SURAT KETERANGAN PENGHASILAN ORANG TUA.docx');
const zip = new PizZip(content);
let xml = zip.file('word/document.xml').asText();

console.log('Original XML length:', xml.length);

const pejabatNama = 'ASMIANTI M., SE.';
const pejabatJabatan = 'LURAH LOMPOE';
const pejabatNip = '19840927 201001 2 022';

// Run the flawed regex:
let badXml = xml;
badXml = badXml.replace(/(&lt;&lt;|&lt;&lt;|<<)[\s\S]*?Pejabat yang Bertanda Tangan[\s\S]*?(&gt;&gt;|&gt;&gt;|>>)/g, pejabatNama);

console.log('XML length AFTER flawed regex:', badXml.length);
console.log('Difference in characters deleted by flawed regex:', xml.length - badXml.length);
