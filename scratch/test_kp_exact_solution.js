const fs = require('fs');
const path = require('path');
const PizZip = require('../backend/node_modules/pizzip');
const Docxtemplater = require('../backend/node_modules/docxtemplater');

function getKonsumenPenggunaRuns(selectedType) {
  const type = (selectedType || '').toLowerCase();
  const isMikro = type.includes('mikro');
  const isTani = type.includes('tani');
  const isIkan = type.includes('ikan') || type.includes('nelayan');
  const isUmum = type.includes('umum') || type.includes('layanan');

  const finalMikro = isMikro;
  const finalTani = !isMikro && !isIkan && !isUmum ? true : isTani;
  const finalIkan = isIkan;
  const finalUmum = isUmum;

  const runFonts = `<w:rPr><w:rFonts w:ascii="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr>`;
  const runFontsStrike = `<w:rPr><w:rFonts w:ascii="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman"/><w:strike w:val="1"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr>`;

  const rHeader = `<w:r>${runFonts}<w:t xml:space="preserve">Konsumen Pengguna</w:t><w:tab/><w:t xml:space="preserve">:</w:t><w:tab/></w:r>`;
  const rMikro = `<w:r>${finalMikro ? runFonts : runFontsStrike}<w:t xml:space="preserve">Usaha Mikro</w:t></w:r>`;
  const rSep1 = `<w:r>${runFonts}<w:t xml:space="preserve"> / </w:t></w:r>`;
  const rTani = `<w:r>${finalTani ? runFonts : runFontsStrike}<w:t xml:space="preserve">pertanian</w:t></w:r>`;
  const rSep2 = `<w:r>${runFonts}<w:t xml:space="preserve"> / </w:t></w:r>`;
  const rIkan = `<w:r>${finalIkan ? runFonts : runFontsStrike}<w:t xml:space="preserve">perikanan</w:t></w:r>`;
  const rSep3 = `<w:r>${runFonts}<w:t xml:space="preserve"> / </w:t></w:r>`;
  const rUmum = `<w:r>${finalUmum ? runFonts : runFontsStrike}<w:t xml:space="preserve">pelayanan umum</w:t></w:r>`;

  return rHeader + rMikro + rSep1 + rTani + rSep2 + rIkan + rSep3 + rUmum;
}

const origPath = path.join(__dirname, '../templates/SRIKANDI - SURAT REKOMENDASI PEMBELIAN BBM.docx');
const zip = new PizZip(fs.readFileSync(origPath));
let xml = zip.file('word/document.xml').asText();

// Fix Line 4: Change &lt;&lt;@kp_raw&gt;&gt; to <w:r><w:t>&lt;&lt;@kp_raw&gt;&gt;</w:t></w:r>
xml = xml.replace('&lt;&lt;@kp_raw&gt;&gt;', '<w:r><w:t>&lt;&lt;@kp_raw&gt;&gt;</w:t></w:r>');

zip.file('word/document.xml', xml);
const newBuffer = zip.generate({ type: 'nodebuffer' });

fs.writeFileSync(origPath, newBuffer);
fs.writeFileSync(path.join(__dirname, '../templates/SRIKANDI - SURAT REKOMENDASI PEMBELIAN BBM_V2.docx'), newBuffer);

// Test rendering
const zipTest = new PizZip(newBuffer);
const doc = new Docxtemplater(zipTest, {
  delimiters: { start: '<<', end: '>>' },
  paragraphLoop: true,
  linebreaks: true
});

doc.render({
  'nomor_naskah': '470 / 102 / KL-LMP / VIII / 2026',
  'kp_raw': getKonsumenPenggunaRuns('Usaha Mikro'),
  'NAMA PEMOHON': 'AHMAD RISWAN',
  'NIK': '7372012345678901',
  'Alamat': 'Jl. Poros Lompoe',
  'RT': '001',
  'RW': '001',
  'Jenis Usaha': 'Warung Kuliner / Usaha Mikro',
  'Jenis Alat': 'Mesin Genset',
  'Jumlah Alat': '1 Unit',
  'Fungsi Alat': 'Penerangan Usaha',
  'Jenis BBM': 'Pertalite (BBM Bersubsidi)',
  'Kebutuhan BBM': '5 Liter / Hari',
  'Jam Operasi': '10 Jam / Hari',
  'Liter': '60 Liter / Bulan'
});

const renderedXml = doc.getZip().file('word/document.xml').asText();

const alamatIdx = renderedXml.indexOf('Alamat Usaha');
const jenisUsahaIdx = renderedXml.indexOf('Jenis Usaha/Kegiatan');

console.log('=== RENDERED XML BETWEEN ALAMAT USAHA AND JENIS USAHA ===');
console.log(renderedXml.slice(alamatIdx - 20, jenisUsahaIdx + 150));
