const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');

const content = fs.readFileSync('./templates/SRIKANDI - SURAT KETERANGAN PENGHASILAN ORANG TUA.docx');
const zip = new PizZip(content);

try {
  const doc = new Docxtemplater(zip, {
    delimiters: { start: '<<', end: '>>' },
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => '-'
  });

  const todayLongStr = '18 Agustus 2026';
  const pejabatNama = 'ASMIANTI M., SE.';
  const resiNo = 'LMP-500536';

  doc.render({
    'Pejabat yang Bertanda Tangan': pejabatNama,
    'Jabatan Pejabat yang Bertanda Tangan': 'LURAH LOMPOE',
    'NIP Pejabat yang Bertanda Tangan': '19840927 201001 2 022',
    'Nama Pemohon': 'Adil',
    'NIK': '7378020667865',
    'Tempat/Tgl Lahir': 'Parepare, 24 April 1995',
    'Jenis Kelamin': 'Laki-laki',
    'Agama': 'Islam',
    'Pekerjaan': 'Wiraswasta',
    'Alamat': 'Jl. Poros Lompoe No. 45',
    'RT': '02',
    'RW': '03',
    'Kelurahan': 'Lompoe',
    'Kecamatan': 'Bacukiki',
    'Kota/Kabupaten': 'PAREPARE',
    'Tempat Tinggal Saat Ini': 'Jl. Poros Lompoe',
    'RT Tempat Tinggal Saat Ini': '02',
    'RW Tempat Tinggal Saat Ini': '03',
    'Penghasilan Rata-rata per bulan': 'Rp 1.500.000',
    'Jumlah Anak yg Jadi Tanggungan': '3',
    'Nama Anak': 'Adil Junior',
    'NIK Anak': '7378020667865',
    'Tempat/Tgl Lahir Anak': 'Parepare, 12 Maret 2008',
    'Sekolah/Kampus': 'Universitas Negeri Parepare'
  });

  let generatedZip = doc.getZip();
  let renderedXml = generatedZip.file('word/document.xml').asText();

  // Post-render text replacement for ${nomor_naskah}, ${tanggal_naskah}, ${ttd_pengirim}
  renderedXml = renderedXml.replace(/\$\{nomor_naskah[^}]*\}/g, `470 / ${resiNo} / KL-LMP / VIII / 2026`);
  renderedXml = renderedXml.replace(/\$\{tanggal_naskah[^}]*\}/g, todayLongStr);
  renderedXml = renderedXml.replace(/\$\{ttd_pengirim[^}]*\}/g, pejabatNama);

  // In case Word split ${nomor_naskah across tags:
  renderedXml = renderedXml.replace(/\$\{nomor_naskah/g, `470 / ${resiNo} / KL-LMP / VIII / 2026`);
  renderedXml = renderedXml.replace(/\$\{tanggal_naskah/g, todayLongStr);
  renderedXml = renderedXml.replace(/\$\{ttd_pengirim/g, pejabatNama);
  renderedXml = renderedXml.replace(/<w:t[^>]*>\}<\/w:t>/g, '<w:t></w:t>');

  generatedZip.file('word/document.xml', renderedXml);

  const finalBuf = generatedZip.generate({ type: 'nodebuffer' });
  fs.writeFileSync('scratch/output_post_render.docx', finalBuf);
  console.log('POST RENDER SUCCESS! Buffer size:', finalBuf.length, 'bytes');

} catch(err) {
  console.error('POST RENDER ERROR:', err);
}
