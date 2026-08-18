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

  doc.render({
    'Pejabat yang Bertanda Tangan': 'ASMIANTI M., SE.',
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

  const buf = doc.getZip().generate({ type: 'nodebuffer' });
  fs.writeFileSync('scratch/output_test_raw.docx', buf);
  console.log('RAW SUCCESS! Size:', buf.length, 'bytes');
} catch(err) {
  console.error('RAW ERROR:', err);
}
