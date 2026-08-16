const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'frontend', 'src');

fs.readdirSync(srcDir).forEach(file => {
  if (file.endsWith('.jsx')) {
    const filePath = path.join(srcDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('http://localhost:5000')) {
      if (!content.includes('import { API_BASE_URL }')) {
        content = "import { API_BASE_URL } from './apiConfig';\n" + content;
      }
      
      content = content.replace(/['"]http:\/\/localhost:5000([^'"]*)['"]/g, (match, pathStr) => {
        return '`${API_BASE_URL}' + pathStr + '`';
      });
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Successfully updated:', file);
    }
  }
});
