const fs = require('fs');
const path = require('path');
const PizZip = require('../backend/node_modules/pizzip');

const docxPath = path.join(__dirname, '../templates/SRIKANDI - SURAT REKOMENDASI PEMBELIAN BBM.docx');
const content = fs.readFileSync(docxPath);
const zip = new PizZip(content);

let xml = zip.file('word/document.xml').asText();

// 1. Fix P7 (Dasar Hukum 03)
const p7Text = '03. Perpres Nomor 15 tahun 2012 tentang harga Jual Eceran dan Konsumen Pengguna Jenis Bahan Bakar Minyak Tertentu';
xml = xml.replace('&lt;&lt;@kp_raw&gt;&gt;', `<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">${p7Text}</w:t></w:r>`);

// 2. Fix P12 (Konsumen Pengguna with dynamic tags: <<kp_mikro>>, <<kp_tani>>, <<kp_ikan>>, <<kp_umum>>)
// Instead of raw XML which broke, we can use simple docxtemplater tags or raw XML tag <<@kp_raw>> wrapped properly!
// Let's create the P12 paragraph with <<@kp_raw>>
const p12Xml = `<w:r><w:t>&lt;&lt;@kp_raw&gt;&gt;</w:t></w:r>`;
xml = xml.replace('&lt;&lt;@kp_raw&gt;&gt;', p12Xml);

// 3. Fix P13 (Jenis Usaha/Kegiatan)
const p13Xml = `<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">Jenis Usaha/Kegiatan</w:t><w:tab/><w:t xml:space="preserve">:</w:t><w:tab/><w:t xml:space="preserve">&lt;&lt;Jenis Usaha&gt;&gt;</w:t></w:r>`;
xml = xml.replace('&lt;&lt;@kp_raw&gt;&gt;', p13Xml);

zip.file('word/document.xml', xml);
const newBuffer = zip.generate({ type: 'nodebuffer' });

fs.writeFileSync(docxPath, newBuffer);
fs.writeFileSync(path.join(__dirname, '../templates/SRIKANDI - SURAT REKOMENDASI PEMBELIAN BBM_V2.docx'), newBuffer);

console.log('RECONSTRUCTED BBM TEMPLATES SUCCESSFULLY!');
