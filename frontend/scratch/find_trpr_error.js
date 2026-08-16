const fs = require('fs');
const path = require('path');

const xml = fs.readFileSync(path.join(__dirname, 'rendered_document.xml'), 'utf8');
const lines = xml.split('\n');

console.log('=== LINE 20 to LINE 30 OF RENDERED DOCUMENT XML ===');
lines.slice(15, 35).forEach((line, idx) => {
  console.log(`L${idx + 16}: ${line}`);
});
