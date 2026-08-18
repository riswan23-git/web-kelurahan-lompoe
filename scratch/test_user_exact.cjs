const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');

const content = fs.readFileSync('./templates/SRIKANDI - SURAT KETERANGAN PENGHASILAN ORANG TUA.docx');
const zip = new PizZip(content);

const extraData = {
  pejabat_ttd: 'ASMIANTI M., SE.',
  jabatan_pejabat: 'LURAH LOMPOE',
  nip_pejabat: '19840927 201001 2 022',
  pangkat_pejabat: 'Penata Tk. I (III/d)'
};

const row = {
  id: 627498,
  no_resi: '627498',
  nama_pemohon: 'Gshsh',
  nik: '76127738399392',
  jenis_surat: 'Surat Keterangan Penghasilan Orang Tua',
  data_json: JSON.stringify(extraData)
};

const safeStr = (val, fallback = '-') => (val !== undefined && val !== null && String(val).trim() !== '') ? String(val).trim() : fallback;
const safeUpper = (val, fallback = '-') => safeStr(val, fallback).toUpperCase();

const pejabatNama = (row.pejabat_ttd || extraData.pejabat_ttd || '').trim() || 'ASMIANTI M., SE.';
const pejabatJabatan = (row.jabatan_pejabat || extraData.jabatan_pejabat || '').trim() || 'LURAH LOMPOE';
const pejabatNip = (row.nip_pejabat || extraData.nip_pejabat || '').trim() || '19840927 201001 2 022';
const pejabatPangkat = (row.pangkat_pejabat || extraData.pangkat_pejabat || '').trim() || 'Penata Tk. I (III/d)';

const cleanResiNo = (row.no_resi || '500536').replace(/[^0-9]/g, '') || '500536';
const naskahNo = row.nomor_naskah || extraData.nomor_naskah || row.nomor_surat || `470 / ${cleanResiNo} / KL-LMP / VIII / 2026`;
const todayLongStr = '18 Agustus 2026';

const payload = {
    'nomor_naskah': naskahNo,
    'nomor naskah': naskahNo,
    'tanggal_naskah': todayLongStr,
    'tanggal naskah': todayLongStr,
    'ttd_pengirim': '${ttd_pengirim}', // Keep literal ${ttd_pengirim} for Srikandi!

    'Penghasilan Rata-rata per bulan': 'Rp 1.500.000',
    'Jumlah Anak yg Jadi Tanggungan': '3 Orang',
    'Nama Anak': 'Huhu',
    'NIK Anak': '883662738377383',
    'Tempat/Tgl Lahir Anak': 'Parepare, 30 April 2006',
    'Sekolah/Kampus': 'Universitas Negeri Parepare',

    'Pejabat yang Bertanda Tangan': pejabatNama,
    'Jabatan Pejabat yang Bertanda Tangan': pejabatJabatan,
    'NIP Pejabat yang Bertanda Tangan': pejabatNip,
    'Pangkat Pejabat yang Bertanda Tangan': pejabatPangkat,

    'NAMA PEMOHON': safeUpper(row.nama_pemohon, 'Gshsh'),
    'Nama Pemohon': safeStr(row.nama_pemohon, 'Gshsh'),
    'NIK': safeStr(row.nik, '76127738399392'),
    'Tempat/Tgl Lahir': 'Parepare, 24 April 1995',
    'Jenis Kelamin': 'Laki-laki',
    'Agama': 'Islam',
    'Pekerjaan': 'Wiraswasta',
    'Alamat': 'Jl. Poros Lompoe No. 45, Parepare, RT 02 / RW 03',
    'RT': '02',
    'RW': '03',
    'Kelurahan': 'Lompoe',
    'Kecamatan': 'Bacukiki',
    'Kota/Kab': 'Parepare'
};

const doc = new Docxtemplater(zip, {
    delimiters: { start: '<<', end: '>>' },
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => '-'
});

doc.render(payload);

let generatedZip = doc.getZip();
let renderedXml = generatedZip.file('word/document.xml').asText();

// 1. Universal replacer for &lt;&lt;Key&gt;&gt; and <<Key>> tags
if (payload && typeof payload === 'object') {
    Object.keys(payload).forEach(k => {
        const val = payload[k];
        if (val !== undefined && val !== null) {
            const strVal = String(val);
            renderedXml = renderedXml.replaceAll(`&lt;&lt;${k}&gt;&gt;`, strVal);
            renderedXml = renderedXml.replaceAll(`<<${k}>>`, strVal);
        }
    });
}

// 2. Robust fuzzy Pejabat XML replacer
renderedXml = renderedXml.replace(/(&lt;&lt;|&lt;&lt;|<<)[\s\S]*?Pejabat yang Bertanda Tangan[\s\S]*?(&gt;&gt;|&gt;&gt;|>>)/g, pejabatNama);
renderedXml = renderedXml.replace(/(&lt;&lt;|&lt;&lt;|<<)[\s\S]*?Jabatan Pejabat yang Bertanda Tangan[\s\S]*?(&gt;&gt;|&gt;&gt;|>>)/g, pejabatJabatan);
renderedXml = renderedXml.replace(/(&lt;&lt;|&lt;&lt;|<<)[\s\S]*?NIP Pejabat yang Bertanda Tangan[\s\S]*?(&gt;&gt;|&gt;&gt;|>>)/g, pejabatNip);
renderedXml = renderedXml.replace(/(&lt;&lt;|&lt;&lt;|<<)[\s\S]*?Pangkat Pejabat yang Bertanda Tangan[\s\S]*?(&gt;&gt;|&gt;&gt;|>>)/g, pejabatPangkat);

// 3. Keep ${ttd_pengirim} INTACT for Srikandi!
renderedXml = renderedXml.replace(/\$\{nomor_naskah[^}]*\}/g, naskahNo);
renderedXml = renderedXml.replace(/\$\{tanggal_naskah[^}]*\}/g, todayLongStr);

// Clean unclosed tags if any, but KEEP ${ttd_pengirim}!
renderedXml = renderedXml.replace(/\$\{nomor_naskah/g, naskahNo);
renderedXml = renderedXml.replace(/\$\{tanggal_naskah/g, todayLongStr);

generatedZip.file('word/document.xml', renderedXml);
const buf = generatedZip.generate({ type: 'nodebuffer' });
fs.writeFileSync('scratch/output_exact_srikandi_verified.docx', buf);

const textResult = renderedXml.replace(/<[^>]+>/g, '');
console.log('--- UPPER SECTION TEXT ---');
const idx = textResult.indexOf('Yang bertanda tangan');
console.log(textResult.substring(idx, idx + 500));

console.log('\n--- LOWER SIGNATURE TEXT ---');
const idxLow = textResult.indexOf('Parepare, 18 Agustus 2026');
console.log(textResult.substring(idxLow, idxLow + 300));
