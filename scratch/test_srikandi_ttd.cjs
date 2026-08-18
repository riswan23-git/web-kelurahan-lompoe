const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');

const content = fs.readFileSync('./templates/SRIKANDI - SURAT KETERANGAN PENGHASILAN ORANG TUA.docx');
const zip = new PizZip(content);

const pejabatNama = 'ASMIANTI M., SE.';
const pejabatJabatan = 'LURAH LOMPOE';
const pejabatNip = '19840927 201001 2 022';
const pejabatPangkat = 'Penata Tk. I (III/d)';
const resiNo = '627498';
const todayLongStr = '18 Agustus 2026';
const naskahNo = `470 / ${resiNo} / KL-LMP / VIII / 2026`;

const payload = {
    'nomor_naskah': naskahNo,
    'nomor naskah': naskahNo,
    'tanggal_naskah': todayLongStr,
    'tanggal naskah': todayLongStr,
    'ttd_pengirim': '${ttd_pengirim}', // Keep literal ${ttd_pengirim} for Srikandi app!

    'Penghasilan Rata-rata per bulan': 'Rp 1.500.000',
    'Jumlah Anak yg Jadi Tanggungan': '3 Orang',
    'Nama Anak': 'Huhu',
    'NIK Anak': '883662738377383',
    'Tempat/Tgl Lahir Anak': 'Parepare, 30 April 2006',
    'Sekolah/Kampus': 'Universitas Negeri Parepare',
    'Tempat Tinggal Saat Ini': 'Jl. Poros Lompoe No. 45',
    'RT Tempat Tinggal Saat Ini': '02',
    'RW Tempat Tinggal Saat Ini': '03',

    'Pejabat yang Bertanda Tangan': pejabatNama,
    'Jabatan Pejabat yang Bertanda Tangan': pejabatJabatan,
    'NIP Pejabat yang Bertanda Tangan': pejabatNip,
    'Pangkat Pejabat yang Bertanda Tangan': pejabatPangkat,

    'NAMA PEMOHON': 'GSHSH',
    'Nama Pemohon': 'Gshsh',
    'NIK': '76127738399392',
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

// 1. Convert all &lt;&lt;Key&gt;&gt; and <<Key>> tags
Object.keys(payload).forEach(k => {
    const val = String(payload[k]);
    renderedXml = renderedXml.replaceAll(`&lt;&lt;${k}&gt;&gt;`, val);
    renderedXml = renderedXml.replaceAll(`<<${k}>>`, val);
});

// 2. Fuzzy Pejabat tag replacer for Pejabat section
renderedXml = renderedXml.replace(/(&lt;&lt;|&lt;&lt;|<<)[\s\S]*?Pejabat yang Bertanda Tangan[\s\S]*?(&gt;&gt;|&gt;&gt;|>>)/g, pejabatNama);
renderedXml = renderedXml.replace(/(&lt;&lt;|&lt;&lt;|<<)[\s\S]*?Jabatan Pejabat yang Bertanda Tangan[\s\S]*?(&gt;&gt;|&gt;&gt;|>>)/g, pejabatJabatan);
renderedXml = renderedXml.replace(/(&lt;&lt;|&lt;&lt;|<<)[\s\S]*?NIP Pejabat yang Bertanda Tangan[\s\S]*?(&gt;&gt;|&gt;&gt;|>>)/g, pejabatNip);
renderedXml = renderedXml.replace(/(&lt;&lt;|&lt;&lt;|<<)[\s\S]*?Pangkat Pejabat yang Bertanda Tangan[\s\S]*?(&gt;&gt;|&gt;&gt;|>>)/g, pejabatPangkat);

// 3. Keep ${ttd_pengirim} intact for Srikandi app compatibility!
// Replace ${nomor_naskah} and ${tanggal_naskah} with real values, BUT PRESERVE ${ttd_pengirim}!
renderedXml = renderedXml.replace(/\$\{nomor_naskah[^}]*\}/g, naskahNo);
renderedXml = renderedXml.replace(/\$\{tanggal_naskah[^}]*\}/g, todayLongStr);

// Keep ${ttd_pengirim} intact!
renderedXml = renderedXml.replace(/\$\{nomor_naskah/g, naskahNo);
renderedXml = renderedXml.replace(/\$\{tanggal_naskah/g, todayLongStr);

generatedZip.file('word/document.xml', renderedXml);
const buf = generatedZip.generate({ type: 'nodebuffer' });
fs.writeFileSync('scratch/output_srikandi_preserved.docx', buf);

const textResult = renderedXml.replace(/<[^>]+>/g, '');
console.log('--- OUTPUT TEXT INSPECTION ---');
const idx = textResult.indexOf('Yang bertanda tangan');
console.log(textResult.substring(idx, idx + 700));

console.log('\n--- BOTTOM SIGNATURE INSPECTION ---');
const idxEnd = textResult.indexOf('Parepare, 18 Agustus 2026');
if (idxEnd >= 0) console.log(textResult.substring(idxEnd, idxEnd + 300));
else console.log(textResult.substring(textResult.length - 400));
