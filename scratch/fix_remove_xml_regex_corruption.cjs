const fs = require('fs');
const path = require('path');

const layananPath = path.join(__dirname, '..', 'api', 'layanan.js');
let layananCode = fs.readFileSync(layananPath, 'utf8');

const oldCorruptZipBlock = `            if (zip.files['word/document.xml']) {
                let xmlContent = zip.files['word/document.xml'].asText();
                xmlContent = xmlContent.replace(/\\{nomor_naskah\\s*\\}/g, '<<nomor_naskah>>')
                                       .replace(/\\{tanggal_naskah\\s*\\}/g, '<<tanggal_naskah>>')
                                       .replace(/\\{ttd_pengirim\\s*\\}/g, '<<ttd_pengirim>>');
                zip.file('word/document.xml', xmlContent);
            }`;

if (layananCode.includes(oldCorruptZipBlock)) {
    layananCode = layananCode.replace(oldCorruptZipBlock, '');
    fs.writeFileSync(layananPath, layananCode, 'utf8');
    console.log('Successfully removed corrupting XML regex from api/layanan.js!');
} else {
    console.log('Block not found or already removed.');
}
