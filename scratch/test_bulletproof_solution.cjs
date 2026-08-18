const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');

const content = fs.readFileSync('./templates/SRIKANDI - SURAT KETERANGAN PENGHASILAN ORANG TUA.docx');
const zip = new PizZip(content);

let xml = zip.file('word/document.xml').asText();

// 1. Convert all XML escaped &lt;&lt; and &gt;&gt; into raw << and >> for Docxtemplater
xml = xml.replace(/&lt;&lt;/g, '<<').replace(/&gt;&gt;/g, '>>');
zip.file('word/document.xml', xml);

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
    'ttd_pengirim': '${ttd_pengirim}', // Keep literal ${ttd_pengirim} intact for Srikandi app!

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
    nullGetter: function(tag) {
        if (!tag || !tag.name) return '-';
        const tagKey = tag.name.trim();
        if (tagKey.includes('nomor_naskah') || tagKey.includes('nomor naskah')) return naskahNo;
        if (tagKey.includes('tanggal_naskah') || tagKey.includes('tanggal naskah')) return todayLongStr;
        if (payload && payload[tagKey] !== undefined && payload[tagKey] !== null) return payload[tagKey];
        if (payload && payload[tag.name] !== undefined && payload[tag.name] !== null) return payload[tag.name];
        return '-';
    }
});

doc.render(payload);

let generatedZip = doc.getZip();
let renderedXml = generatedZip.file('word/document.xml').asText();

// Replace ${nomor_naskah} and ${tanggal_naskah}, but KEEP ${ttd_pengirim} INTACT for Srikandi!
renderedXml = renderedXml.replace(/\$\{nomor_naskah[^}]*\}/g, naskahNo);
renderedXml = renderedXml.replace(/\$\{tanggal_naskah[^}]*\}/g, todayLongStr);

renderedXml = renderedXml.replace(/\$\{nomor_naskah/g, naskahNo);
renderedXml = renderedXml.replace(/\$\{tanggal_naskah/g, todayLongStr);

generatedZip.file('word/document.xml', renderedXml);
const buf = generatedZip.generate({ type: 'nodebuffer' });
fs.writeFileSync('scratch/output_bulletproof_test.docx', buf);

const textResult = renderedXml.replace(/<[^>]+>/g, '');
console.log('=== UPPER SECTION (Yang bertanda tangan di bawah ini) ===');
const idx = textResult.indexOf('Yang bertanda tangan');
console.log(textResult.substring(idx, idx + 450));

console.log('\n=== LOWER SECTION (Signature & ${ttd_pengirim}) ===');
const idxLow = textResult.indexOf('Parepare, 18 Agustus 2026');
console.log(textResult.substring(idxLow, idxLow + 300));
