const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');

const templatesDir = './templates';
const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.docx'));

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
    'ttd_pengirim': '${ttd_pengirim}',

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
    'Alamat': 'Jl. Poros Lompoe No. 45',
    'RT': '02',
    'RW': '03',
    'Kelurahan': 'Lompoe',
    'Kecamatan': 'Bacukiki',
    'Kota/Kab': 'Parepare'
};

console.log('=== TESTING ALL 14 TEMPLATES WITH EXACT STRING REPLACEALL ===\n');

files.forEach((file, idx) => {
    try {
        const content = fs.readFileSync(path.join(templatesDir, file));
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            delimiters: { start: '<<', end: '>>' },
            paragraphLoop: true,
            linebreaks: true,
            nullGetter: () => '-'
        });
        doc.render(payload);

        let generatedZip = doc.getZip();
        let renderedXml = generatedZip.file('word/document.xml').asText();

        // 1. Universal replacer
        Object.keys(payload).forEach(k => {
            const val = String(payload[k]);
            renderedXml = renderedXml.replaceAll(`&lt;&lt;${k}&gt;&gt;`, val);
            renderedXml = renderedXml.replaceAll(`<<${k}>>`, val);
        });

        // 2. Explicit Pejabat tag replacers
        renderedXml = renderedXml.replaceAll('&lt;&lt;Pejabat yang Bertanda Tangan&gt;&gt;', pejabatNama);
        renderedXml = renderedXml.replaceAll('&lt;&lt;Jabatan Pejabat yang Bertanda Tangan&gt;&gt;', pejabatJabatan);
        renderedXml = renderedXml.replaceAll('&lt;&lt;NIP Pejabat yang Bertanda Tangan&gt;&gt;', pejabatNip);
        renderedXml = renderedXml.replaceAll('&lt;&lt;Pangkat Pejabat yang Bertanda Tangan&gt;&gt;', pejabatPangkat);

        renderedXml = renderedXml.replaceAll('<<Pejabat yang Bertanda Tangan>>', pejabatNama);
        renderedXml = renderedXml.replaceAll('<<Jabatan Pejabat yang Bertanda Tangan>>', pejabatJabatan);
        renderedXml = renderedXml.replaceAll('<<NIP Pejabat yang Bertanda Tangan>>', pejabatNip);
        renderedXml = renderedXml.replaceAll('<<Pangkat Pejabat yang Bertanda Tangan>>', pejabatPangkat);

        // 3. Keep ${ttd_pengirim} intact!
        renderedXml = renderedXml.replace(/\$\{nomor_naskah[^}]*\}/g, naskahNo);
        renderedXml = renderedXml.replace(/\$\{tanggal_naskah[^}]*\}/g, todayLongStr);

        const plainText = renderedXml.replace(/<[^>]+>/g, '');
        const hasNamaPopulated = plainText.includes('ASMIANTI M., SE.');
        const hasJabatanPopulated = plainText.includes('LURAH LOMPOE');
        const hasNipPopulated = plainText.includes('19840927 201001 2 022');

        console.log(`[${idx + 1}] ${file}:`);
        console.log(`    Nama: ${hasNamaPopulated ? 'OK' : 'MISSED'}, Jabatan: ${hasJabatanPopulated ? 'OK' : 'MISSED'}, NIP: ${hasNipPopulated ? 'OK' : 'MISSED'}`);
    } catch(err) {
        console.log(`[${idx + 1}] ${file}: ERROR ${err.message}`);
    }
});
