const fs = require('fs');
const path = require('path');

const layananPath = path.join(__dirname, '..', 'api', 'layanan.js');
let layananCode = fs.readFileSync(layananPath, 'utf8');

const oldZipBlock = `            const content = fs.readFileSync(templatePath);
            const zip = new PizZip(content);
            let extraJson = {};
            try { if (item.data_json) extraJson = typeof item.data_json === 'string' ? JSON.parse(item.data_json) : item.data_json; } catch(e) {}

            const doc = new Docxtemplater(zip, {
                delimiters: { start: '<<', end: '>>' },
                paragraphLoop: true,
                linebreaks: true,
                nullGetter: function(tag) {
                    const tagKey = tag.name ? tag.name.trim() : '';
                    if (tagKey === 'nomor_naskah' || tagKey === 'nomor naskah') return \`470 / \${item.id || 101} / KL-LMP / VIII / 2026\`;
                    if (tagKey === 'tanggal_naskah' || tagKey === 'tanggal naskah') return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                    const val = item[tagKey] || extraJson[tagKey];
                    return (val !== undefined && val !== null && val !== '') ? val : '-';
                }
            });`;

const newZipBlock = `            const content = fs.readFileSync(templatePath);
            const zip = new PizZip(content);
            let extraJson = {};
            try { if (item.data_json) extraJson = typeof item.data_json === 'string' ? JSON.parse(item.data_json) : item.data_json; } catch(e) {}

            if (zip.files['word/document.xml']) {
                let xmlContent = zip.files['word/document.xml'].asText();
                xmlContent = xmlContent.replace(/\{nomor_naskah\s*\}/g, '<<nomor_naskah>>')
                                       .replace(/\{tanggal_naskah\s*\}/g, '<<tanggal_naskah>>')
                                       .replace(/\{ttd_pengirim\s*\}/g, '<<ttd_pengirim>>');
                zip.file('word/document.xml', xmlContent);
            }

            const doc = new Docxtemplater(zip, {
                delimiters: { start: '<<', end: '>>' },
                paragraphLoop: true,
                linebreaks: true,
                nullGetter: function(tag) {
                    const tagKey = tag.name ? tag.name.trim() : '';
                    if (tagKey.includes('nomor_naskah') || tagKey.includes('nomor naskah')) return \`470 / \${item.id || 101} / KL-LMP / VIII / 2026\`;
                    if (tagKey.includes('tanggal_naskah') || tagKey.includes('tanggal naskah')) return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                    if (typeof payload !== 'undefined' && payload && payload[tagKey]) return payload[tagKey];
                    const val = item[tagKey] || extraJson[tagKey] || item[tagKey.toLowerCase()] || extraJson[tagKey.toLowerCase()];
                    return (val !== undefined && val !== null && val !== '') ? val : '-';
                }
            });`;

if (layananCode.includes(oldZipBlock)) {
    layananCode = layananCode.replace(oldZipBlock, newZipBlock);
}

fs.writeFileSync(layananPath, layananCode, 'utf8');
console.log('Successfully updated api/layanan.js zip XML preprocessor & nullGetter!');
