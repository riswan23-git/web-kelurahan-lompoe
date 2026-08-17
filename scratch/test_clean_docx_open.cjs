const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

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

    return `${rHeader}${rMikro}${rSep1}${rTani}${rSep2}${rIkan}${rSep3}${rUmum}`;
}

const templatePath = path.join(__dirname, '..', 'templates', 'SRIKANDI - SURAT REKOMENDASI PEMBELIAN BBM.docx');
const content = fs.readFileSync(templatePath);
const zip = new PizZip(content);

const todayLongStr = '17 Agustus 2026';
const item = {
  id: 102,
  nama_pemohon: 'HADJI',
  nik: '7372012404950001',
  alamat: 'Jl. Poros Lompoe No. 45, Parepare, RT 02 / RW 03',
  jenis_usaha: 'Usaha Mikro / Pertanian Padi',
  jenis_alat: 'Mesin Pompa Air Traktor',
  jumlah_alat: '1 Unit',
  fungsi_alat: 'Pengolahan Lahan Pertanian',
  jenis_bbm: 'Solar (BBM Bersubsidi)',
  kebutuhan_bbm: '2 Liter / Hari',
  jam_operasi: '8 Jam / Hari',
  jumlah_liter: '60 Liter / Bulan'
};

const payload = {
  'nomor_naskah': '470 / 102 / KL-LMP / VIII / 2026',
  'nomor_naskah ': '470 / 102 / KL-LMP / VIII / 2026',
  'tanggal_naskah': todayLongStr,
  'kp_raw': getKonsumenPenggunaRuns(item.keperluan),
  'NAMA PEMOHON': 'HADJI',
  'Nama Pemohon': 'HADJI',
  'NIK': '7372012404950001',
  'Nik': '7372012404950001',
  'Alamat': 'Jl. Poros Lompoe No. 45, Parepare',
  'RT': '02',
  'RW': '03',
  'Alamat Usaha': 'Jl. Poros Lompoe No. 45, Parepare, RT 02 / RW 03',
  'Konsumen Pengguna': 'Usaha Mikro / Pertanian',
  'Jenis Usaha': 'Usaha Mikro / Pertanian Padi',
  'Jenis Alat': 'Mesin Pompa Air Traktor',
  'Jumlah Alat': '1 Unit',
  'Fungsi Alat': 'Pengolahan Lahan Pertanian',
  'Jenis BBM': 'Solar (BBM Bersubsidi)',
  'Kebutuhan BBM': '2 Liter / Hari',
  'Jam Operasi': '8 Jam / Hari',
  'Liter': '60 Liter / Bulan',
  'Pejabat yang Bertanda Tangan': 'ASMIANTI M., SE.',
  'Jabatan Pejabat yang Bertanda Tangan': 'LURAH LOMPOE',
  'NIP Pejabat yang Bertanda Tangan': '19840927 201001 2 022',
  'Pangkat Pejabat yang Bertanda Tangan': 'Penata Tk. I (III/d)'
};

// DO NOT TOUCH document.xml WITH REGEX!
const doc = new Docxtemplater(zip, {
  delimiters: { start: '<<', end: '>>' },
  paragraphLoop: true,
  linebreaks: true,
  nullGetter: function(tag) {
    const tagKey = tag.name ? tag.name.trim() : '';
    if (tagKey.includes('nomor_naskah')) return '470 / 102 / KL-LMP / VIII / 2026';
    if (tagKey.includes('tanggal_naskah')) return todayLongStr;
    return payload[tagKey] || item[tagKey] || '-';
  }
});

doc.render(payload);
const buf = doc.getZip().generate({ type: 'nodebuffer' });
const outputPath = path.join(__dirname, 'clean_bbm_output.docx');
fs.writeFileSync(outputPath, buf);

console.log('Successfully generated CLEAN test Word file at', outputPath);
