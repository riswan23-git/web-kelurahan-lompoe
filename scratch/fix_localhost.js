const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'frontend', 'src');
const files = fs.readdirSync(srcDir);

let totalReplaced = 0;

files.forEach(file => {
    if (file.endsWith('.jsx') || file.endsWith('.js')) {
        const filePath = path.join(srcDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('http://localhost:5000')) {
            // Count occurrences
            const occurrences = (content.match(/http:\/\/localhost:5000/g) || []).length;
            content = content.replace(/http:\/\/localhost:5000/g, '${API_BASE_URL}');
            
            // Ensure API_BASE_URL is imported if needed
            if (!content.includes('import { API_BASE_URL }') && !content.includes('API_BASE_URL =')) {
                content = "import { API_BASE_URL } from './apiConfig';\n" + content;
            }
            
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Replaced ${occurrences} occurrences in ${file}`);
            totalReplaced += occurrences;
        }
    }
});

console.log(`Total replaced: ${totalReplaced}`);
