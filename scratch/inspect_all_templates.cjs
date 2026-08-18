const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const templatesDir = './templates';
const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.docx'));

console.log(`Found ${files.length} docx templates in ${templatesDir}:\n`);

files.forEach((file, i) => {
  try {
    const content = fs.readFileSync(path.join(templatesDir, file));
    const zip = new PizZip(content);
    const xml = zip.file('word/document.xml').asText();
    const text = xml.replace(/<[^>]+>/g, ' ');
    
    // Find "Yang bertanda tangan" or "pejabat"
    const idx = text.indexOf('bertanda tangan');
    let snippet = 'NOT FOUND';
    if (idx >= 0) {
      snippet = text.substring(idx - 10, idx + 250).replace(/\s+/g, ' ');
    }
    
    console.log(`[${i + 1}] ${file}:`);
    console.log(`    Snippet: ${snippet}\n`);
  } catch(e) {
    console.log(`[${i + 1}] ${file}: ERROR ${e.message}`);
  }
});
