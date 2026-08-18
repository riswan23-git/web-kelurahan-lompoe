const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');

const content = fs.readFileSync('./templates/SRIKANDI - SURAT KETERANGAN PENGHASILAN ORANG TUA.docx');
const zip = new PizZip(content);

const safeStr = (val, fallback = '-') => (val !== undefined && val !== null && String(val).trim() !== '') ? String(val).trim() : fallback;
const safeUpper = (val, fallback = '-') => safeStr(val, fallback).toUpperCase();

const item = {
  id: 627498,
  no_resi: '627498',
  nama_pemohon: 'Gshsh',
  nik: '76127738399392',
  jenis_surat: 'Surat Keterangan Penghasilan Orang Tua',
  tempat_tgl_lahir: 'Parepare, 24 April 1995',
  jenis_kelamin: 'Laki-laki',
  agama: 'Islam',
  pekerjaan: 'Wiraswasta',
  alamat: 'Jl. Poros Lompoe No. 45, Parepare, RT 02 / RW 03',
  rt_rw: 'RT 02 / RW 03',
  penghasilan_orang_tua: '1.500.000',
  jumlah_tanggungan: '3 Orang',
  nama_anak: 'Huhu',
  nik_anak: '883662738377383',
  tgl_lahir_anak: 'Parepare, 30 april 2006',
  sekolah_kampus: 'Universitas Negeri Parepare'
};

const extraJson = {};

const [rtVal, rwVal] = safeStr(item.rt_rw || 'RT 01 / RW 01').split('/').map(s => s.replace(/[^0-9]/g, '').trim() || '01');

const tempatTglLahirVal = safeStr(item.tempat_tgl_lahir || item.tgl_lahir, 'Parepare, 24 April 1995');
const jenisKelaminVal = safeStr(item.jenis_kelamin, 'Laki-laki');
const agamaVal = safeStr(item.agama, 'Islam');
const pekerjaanVal = safeStr(item.pekerjaan, 'Wiraswasta');
const alamatVal = safeStr(item.alamat, 'Jl. Poros Lompoe');

const pejabatNama = safeStr(extraJson.pejabat_ttd || item.pejabat_ttd, 'ASMIANTI M., SE.');
const pejabatJabatan = safeStr(extraJson.jabatan_pejabat || item.jabatan_pejabat, 'LURAH LOMPOE');
const pejabatNip = safeStr(extraJson.nip_pejabat || item.nip_pejabat, '19840927 201001 2 022');
const pejabatPangkat = safeStr(extraJson.pangkat_pejabat || item.pangkat_pejabat, 'Penata Tk. I (III/d)');

const rawPenghasilan = safeStr(extraJson.penghasilan_orang_tua || item.penghasilan_orang_tua || extraJson.jumlah_penghasilan_angka || item.jumlah_penghasilan_angka, '1.500.000');
const formattedPenghasilan = rawPenghasilan.toLowerCase().includes('rp') ? rawPenghasilan : `Rp ${rawPenghasilan}`;
const jumlahTanggunganVal = safeStr(extraJson.jumlah_tanggungan || item.jumlah_tanggungan, '3');
const namaAnakVal = safeStr(extraJson.nama_anak || item.nama_anak, 'Adil Junior');
const nikAnakVal = safeStr(extraJson.nik_anak || item.nik_anak, item.nik || '7378020667865');
const tglLahirAnakVal = safeStr(extraJson.tgl_lahir_anak || item.tgl_lahir_anak, 'Parepare, 12 Maret 2008');
const sekolahKampusVal = safeStr(extraJson.sekolah_kampus_anak || extraJson.sekolah_kampus || item.sekolah_kampus_anak || item.sekolah_kampus, 'Universitas Negeri Parepare');
const tempatTinggalVal = safeStr(extraJson.tempat_tinggal || item.tempat_tinggal || item.alamat, 'Jl. Poros Lompoe');
const rtTinggalVal = safeStr(extraJson.rt_tempat_tinggal_saat_ini || item.rt_tempat_tinggal_saat_ini || rtVal, rtVal || '01');
const rwTinggalVal = safeStr(extraJson.rw_tempat_tinggal_saat_ini || item.rw_tempat_tinggal_saat_ini || rwVal, rwVal || '01');

const cleanResiNo = (item.no_resi || '500536').replace(/[^0-9]/g, '') || '500536';
const naskahNo = item.nomor_naskah || extraJson.nomor_naskah || item.nomor_surat || `470 / ${cleanResiNo} / KL-LMP / VIII / 2026`;
const todayLongStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

const payload = {
    'nomor_naskah': naskahNo,
    'nomor naskah': naskahNo,
    'tanggal_naskah': todayLongStr,
    'tanggal naskah': todayLongStr,
    'ttd_pengirim': pejabatNama,
    'Penghasilan Rata-rata per bulan': formattedPenghasilan,
    'Penghasilan Rata-rata per Bulan': formattedPenghasilan,
    'penghasilan_orang_tua': formattedPenghasilan,
    'Jumlah Anak yg Jadi Tanggungan': jumlahTanggunganVal,
    'jumlah_tanggungan': jumlahTanggunganVal,
    'Nama Anak': namaAnakVal,
    'nama_anak': namaAnakVal,
    'NIK Anak': nikAnakVal,
    'nik_anak': nikAnakVal,
    'Tempat/Tgl Lahir Anak': tglLahirAnakVal,
    'tgl_lahir_anak': tglLahirAnakVal,
    'Sekolah/Kampus': sekolahKampusVal,
    'sekolah_kampus_anak': sekolahKampusVal,
    'Tempat Tinggal Saat Ini': tempatTinggalVal,
    'RT Tempat Tinggal Saat Ini': rtTinggalVal,
    'RW Tempat Tinggal Saat Ini': rwTinggalVal,
    'Pejabat yang Bertanda Tangan': pejabatNama,
    'Jabatan Pejabat yang Bertanda Tangan': pejabatJabatan,
    'NIP Pejabat yang Bertanda Tangan': pejabatNip,
    'Pangkat Pejabat yang Bertanda Tangan': pejabatPangkat,
    'NAMA PEMOHON': safeUpper(item.nama_pemohon || item.nama_lengkap, 'Warga Kelurahan Lompoe'),
    'Nama Pemohon': safeStr(item.nama_pemohon || item.nama_lengkap, 'Warga Kelurahan Lompoe'),
    'nama pemohon': safeStr(item.nama_pemohon || item.nama_lengkap, 'Warga Kelurahan Lompoe'),
    'NIK': safeStr(item.nik, '7372011205950001'),
    'Nik': safeStr(item.nik, '7372011205950001'),
    'TEMPAT/TGL LAHIR': tempatTglLahirVal,
    'Tempat/Tgl Lahir': tempatTglLahirVal,
    'JENIS KELAMIN': safeUpper(jenisKelaminVal),
    'Jenis Kelamin': jenisKelaminVal,
    'AGAMA': safeUpper(agamaVal),
    'Agama': agamaVal,
    'PEKERJAAN': safeUpper(pekerjaanVal),
    'Pekerjaan': pekerjaanVal,
    'ALAMAT': alamatVal,
    'Alamat': alamatVal,
    'RT': rtVal || '01',
    'RW': rwVal || '01',
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
        const val = item[tagKey] || extraJson[tagKey] || item[tagKey.toLowerCase()] || extraJson[tagKey.toLowerCase()];
        return (val !== undefined && val !== null && val !== '') ? val : '-';
    }
});

doc.render(payload);

let generatedZip = doc.getZip();
let renderedXml = generatedZip.file('word/document.xml').asText();

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

renderedXml = renderedXml.replace(/(&lt;&lt;|&lt;&lt;|<<)[\s\S]*?Pejabat yang Bertanda Tangan[\s\S]*?(&gt;&gt;|&gt;&gt;|>>)/g, pejabatNama);
renderedXml = renderedXml.replace(/(&lt;&lt;|&lt;&lt;|<<)[\s\S]*?Jabatan Pejabat yang Bertanda Tangan[\s\S]*?(&gt;&gt;|&gt;&gt;|>>)/g, pejabatJabatan);
renderedXml = renderedXml.replace(/(&lt;&lt;|&lt;&lt;|<<)[\s\S]*?NIP Pejabat yang Bertanda Tangan[\s\S]*?(&gt;&gt;|&gt;&gt;|>>)/g, pejabatNip);
renderedXml = renderedXml.replace(/(&lt;&lt;|&lt;&lt;|<<)[\s\S]*?Pangkat Pejabat yang Bertanda Tangan[\s\S]*?(&gt;&gt;|&gt;&gt;|>>)/g, pejabatPangkat);

renderedXml = renderedXml.replace(/\$\{nomor_naskah[^}]*\}/g, naskahNo);
renderedXml = renderedXml.replace(/\$\{tanggal_naskah[^}]*\}/g, todayLongStr);
renderedXml = renderedXml.replace(/\$\{ttd_pengirim[^}]*\}/g, pejabatNama);

renderedXml = renderedXml.replace(/\$\{nomor_naskah/g, naskahNo);
renderedXml = renderedXml.replace(/\$\{tanggal_naskah/g, todayLongStr);
renderedXml = renderedXml.replace(/\$\{ttd_pengirim/g, pejabatNama);
renderedXml = renderedXml.replace(/<w:t[^>]*>\}<\/w:t>/g, '<w:t></w:t>');

generatedZip.file('word/document.xml', renderedXml);
const buf = generatedZip.generate({ type: 'nodebuffer' });
fs.writeFileSync('scratch/test_verify_user_case.docx', buf);

const textResult = renderedXml.replace(/<[^>]+>/g, '');
console.log('--- RESULTING TEXT ---');
const idx = textResult.indexOf('Yang bertanda tangan');
console.log(textResult.substring(idx, idx + 500));
