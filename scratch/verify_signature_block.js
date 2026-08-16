const fs = require('fs');
const path = require('path');
const PizZip = require('../backend/node_modules/pizzip');
const Docxtemplater = require('../backend/node_modules/docxtemplater');

function getKonsumenPenggunaParagraph(selectedType) {
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

  const pPr = `<w:pPr><w:tabs><w:tab w:val="left" w:pos="2977"/><w:tab w:val="left" w:pos="3261"/></w:tabs><w:spacing w:line="240" w:lineRule="auto"/><w:ind w:left="720" w:firstLine="0"/><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr>`;

  return `<w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000">${pPr}${rHeader}${rMikro}${rSep1}${rTani}${rSep2}${rIkan}${rSep3}${rUmum}</w:p>`;
}

const templatePath = path.join(__dirname, '../templates/SRIKANDI - SURAT REKOMENDASI PEMBELIAN BBM.docx');
const zip = new PizZip(fs.readFileSync(templatePath));

const doc = new Docxtemplater(zip, {
  delimiters: { start: '<<', end: '>>' },
  paragraphLoop: true,
  linebreaks: true
});

doc.render({
  'nomor_naskah': '470 / 102 / KL-LMP / VIII / 2026',
  'kp_raw': getKonsumenPenggunaParagraph('Usaha Mikro'),
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

const outBuf = doc.getZip().generate({ type: 'nodebuffer' });
fs.writeFileSync(path.join(__dirname, 'Surat_Rekomendasi_Pembelian_BBM_VERIFIED.docx'), outBuf);

const xmlOut = doc.getZip().file('word/document.xml').asText();
const sigIdx = xmlOut.indexOf('Parepare,');

console.log('=== RENDERED SIGNATURE BLOCK TEXT ===');
console.log(xmlOut.slice(sigIdx, sigIdx + 1500).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
