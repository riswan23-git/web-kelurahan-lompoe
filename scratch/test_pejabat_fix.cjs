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
  const pejabatJabatan = 'LURAH LOMPOE';
  const pejabatNip = '19840927 201001 2 022';
  const pejabatPangkat = 'Penata Tk. I (III/d)';
  const resiNo = 'LMP-500536';

  const payload = {
    'nomor_naskah': `470 / ${resiNo} / KL-LMP / VIII / 2026`,
    'nomor naskah': `470 / ${resiNo} / KL-LMP / VIII / 2026`,
    'tanggal_naskah': todayLongStr,
    'tanggal naskah': todayLongStr,
    'ttd_pengirim': pejabatNama,
    'Pejabat yang Bertanda Tangan': pejabatNama,
    'Jabatan Pejabat yang Bertanda Tangan': pejabatJabatan,
    'NIP Pejabat yang Bertanda Tangan': pejabatNip,
    'Pangkat Pejabat yang Bertanda Tangan': pejabatPangkat,
    'Nama Pemohon': 'Faris',
    'NIK': '7372030029277373',
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
    'Jumlah Anak yg Jadi Tanggungan': '3 Orang',
    'Nama Anak': 'Kosep',
    'NIK Anak': '78854379082233',
    'Tempat/Tgl Lahir Anak': 'Parepare, 20 Maret 2005',
    'Sekolah/Kampus': 'Universitas Negeri Parepare'
  };

  doc.render(payload);

  let generatedZip = doc.getZip();
  let renderedXml = generatedZip.file('word/document.xml').asText();

  // Universal replacer for escaped &lt;&lt;Key&gt;&gt; and raw <<Key>> tags
  Object.keys(payload).forEach(k => {
    const val = String(payload[k]);
    renderedXml = renderedXml.replaceAll(`&lt;&lt;${k}&gt;&gt;`, val);
    renderedXml = renderedXml.replaceAll(`<<${k}>>`, val);
  });

  const naskahNo = `470 / ${resiNo} / KL-LMP / VIII / 2026`;
  renderedXml = renderedXml.replace(/\$\{nomor_naskah[^}]*\}/g, naskahNo);
  renderedXml = renderedXml.replace(/\$\{tanggal_naskah[^}]*\}/g, todayLongStr);
  renderedXml = renderedXml.replace(/\$\{ttd_pengirim[^}]*\}/g, pejabatNama);

  renderedXml = renderedXml.replace(/\$\{nomor_naskah/g, naskahNo);
  renderedXml = renderedXml.replace(/\$\{tanggal_naskah/g, todayLongStr);
  renderedXml = renderedXml.replace(/\$\{ttd_pengirim/g, pejabatNama);
  renderedXml = renderedXml.replace(/<w:t[^>]*>\}<\/w:t>/g, '<w:t></w:t>');

  generatedZip.file('word/document.xml', renderedXml);

  const finalBuf = generatedZip.generate({ type: 'nodebuffer' });
  fs.writeFileSync('scratch/output_universal_fix.docx', finalBuf);
  console.log('UNIVERSAL FIX SUCCESS! Buffer size:', finalBuf.length, 'bytes');

  const plainText = renderedXml.replace(/<[^>]+>/g, '');
  console.log('Rendered snippet around Pejabat:');
  const idx = plainText.indexOf('Yang bertanda tangan');
  console.log(plainText.substring(idx, idx + 400));

} catch(err) {
  console.error('ERROR:', err);
}
