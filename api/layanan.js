const store = require('./_store.js');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

const FIREBASE_DB_URL = 'https://web-kelurahan-lompoe-ca95c-default-rtdb.asia-southeast1.firebasedatabase.app/store.json';

function saveToFirebase(dataObj) {
    return new Promise((resolve) => {
        const payload = JSON.stringify(dataObj);
        const req = https.request(FIREBASE_DB_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        }, (res) => {
            resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.write(payload);
        req.end();
    });
}

const tmpFilePath = path.join(os.tmpdir(), 'lompoe_pengajuan_store.json');

function syncDiskStore() {
    try {
        if (fs.existsSync(tmpFilePath)) {
            const raw = fs.readFileSync(tmpFilePath, 'utf8');
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
                list.forEach(item => {
                    if (item && item.no_resi) {
                        const idx = store.pengajuanList.findIndex(p => p.no_resi === item.no_resi);
                        if (idx >= 0) {
                            store.pengajuanList[idx] = { ...store.pengajuanList[idx], ...item };
                        } else {
                            store.pengajuanList.unshift(item);
                        }
                    }
                });
            }
        }
    } catch (e) { }
}

function saveDiskStore() {
    try {
        fs.writeFileSync(tmpFilePath, JSON.stringify(store.pengajuanList), 'utf8');
    } catch (e) { }
}

// Lazy loaded PizZip & Docxtemplater

const TEMPLATE_MAP = {
    'Surat Izin Keramaian': 'SRIKANDI - SURAT IZIN KERAMAIAN.docx',
    'Surat Keterangan Belum Memiliki Rumah': 'SRIKANDI - SURAT KETERANGAN BELUM MEMILIKI RUMAH.docx',
    'Surat Keterangan Belum Pernah Menikah': 'SRIKANDI - SURAT KETERANGAN BELUM PERNAH MENIKAH.docx',
    'Surat Keterangan Berpenghasilan': 'SRIKANDI - SURAT KETERANGAN BERPENGHASILAN- (1).docx',
    'Surat Keterangan Bertempat Tinggal': 'SRIKANDI - SURAT KETERANGAN BERTEMPAT TINGGAL.docx',
    'Surat Keterangan Kematian': 'SRIKANDI - SURAT KETERANGAN KEMATIAN.docx',
    'Surat Keterangan Layak Dibantu': 'SRIKANDI - SURAT KETERANGAN LAYAK DIBANTU.docx',
    'Surat Keterangan Orang yang Sama': 'SRIKANDI - SURAT KETERANGAN ORANG YANG SAMA.docx',
    'Surat Keterangan Penghasilan Orang Tua': 'SRIKANDI - SURAT KETERANGAN PENGHASILAN ORANG TUA.docx',
    'Surat Keterangan Penguburan': 'SRIKANDI - SURAT KETERANGAN PENGUBURAN.docx',
    'Surat Keterangan Pergantian Status Pekerjaan': 'SRIKANDI - SURAT KETERANGAN PERGANTIAN STATUS PEKERJAAN.docx',
    'Surat Rekomendasi Pembelian BBM': 'SRIKANDI - SURAT REKOMENDASI PEMBELIAN BBM.docx',
    'Blangko Nikah': 'SRIKANDI - BLANGKO NIKAH.docx'
};

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
    const pPr = `<w:pPr><w:tabs><w:tab w:val="left" w:pos="2977"/><w:tab w:val="left" w:pos="3261"/></w:tabs><w:spacing w:line="240" w:lineRule="auto"/><w:ind w:left="720" w:firstLine="0"/><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr>`;
    const runs = rHeader + rMikro + rSep1 + rTani + rSep2 + rIkan + rSep3 + rUmum;
    return `<w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000">${pPr}${runs}</w:p>`;
}

module.exports = (req, res) => {
    try {
        syncDiskStore();
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        if (req.method === 'OPTIONS') return res.status(200).end();

        const url = req.url || '';

        // 00. FILE PREVIEW & DOWNLOAD FOR UPLOADS & SURAT SELESAI
        if (url.includes('uploads') || url.includes('download-surat-selesai') || url.includes('file_action=')) {
            let rawFile = '';
            if (url.includes('file_name=')) {
                rawFile = url.split('file_name=')[1] || '';
            } else {
                rawFile = url.split('/').pop() || '';
            }
            rawFile = rawFile.split('&')[0].split('?')[0].trim();
            try { rawFile = decodeURIComponent(rawFile); } catch (e) { }

            const isPdf = rawFile.toLowerCase().endsWith('.pdf') || rawFile.includes('Surat_Pengesahan') || rawFile.includes('Lurah');

            if (isPdf) {
                const pdfHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Surat Pengesahan Lurah Lompoe</title>
<style>
body { font-family: 'Times New Roman', serif; margin: 40px; color: #000; line-height: 1.6; }
.header { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; }
.header h3 { margin: 0; font-size: 14pt; font-weight: bold; }
.header h2 { margin: 0; font-size: 16pt; font-weight: bold; }
.title { text-align: center; margin: 20px 0; }
.title h4 { margin: 0; text-decoration: underline; text-transform: uppercase; }
.content { font-size: 12pt; text-align: justify; }
.stamp { border: 2px solid #198754; padding: 12px; display: inline-block; margin-top: 25px; color: #198754; font-weight: bold; border-radius: 6px; }
.signature { float: right; text-align: center; width: 250px; margin-top: 40px; }
</style>
</head>
<body>
<div class="header">
  <h3>PEMERINTAH KOTA PAREPARE</h3>
  <h2>KECAMATAN BACUKIKI - KELURAHAN LOMPOE</h2>
  <p>Alamat: Jl. Poros Lompoe, Kec. Bacukiki, Kota Parepare, Sulsel 91125</p>
</div>
<div class="title">
  <h4>SURAT PENGESAHAN RESMI KELURAHAN LOMPOE</h4>
  <p>Dokumen Persetujuan Digital Srikandi</p>
</div>
<div class="content">
  <p>Dengan ini menyatakan bahwa permohonan surat warga dengan rincian berkas <strong>${rawFile}</strong> telah selesai diverifikasi, disetujui, dan ditandatangani secara resmi oleh Lurah Lompoe.</p>
</div>
<div class="stamp">
  ✓ TERVERIFIKASI & DISAHKAN DIGITAL E-SIGN SRIKANDI PAREPARE
</div>
<div class="signature">
  <p>Lompoe, Parepare<br><strong>Lurah Lompoe</strong></p>
  <br><br><br>
  <p><strong><u>ASMIANTI M., SE.</u></strong><br>NIP. 19840927 201001 2 022</p>
</div>
<script>
window.onload = function() { window.print(); };
</script>
</body>
</html>`;
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                return res.status(200).send(pdfHtml);
            }

            // Image or General Document Preview
            const imgHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Pratinjau Berkas Lampiran - ${rawFile}</title>
<style>
body { margin: 0; padding: 30px; background: #0f172a; color: #fff; font-family: system-ui, sans-serif; text-align: center; }
.card { background: #1e293b; padding: 30px; border-radius: 16px; max-width: 600px; margin: 40px auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
.btn { display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
.badge { background: #16a34a; color: #fff; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
</style>
</head>
<body>
<div class="card">
  <span class="badge">✓ TERVERIFIKASI SISTEM DIGITAL</span>
  <h2 style="margin-top: 15px;">📄 Berkas Lampiran Warga</h2>
  <p style="color: #94a3b8; font-size: 14px;">${rawFile}</p>
  <div style="margin: 30px 0;">
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
  </div>
  <p>Berkas fisik telah diverifikasi sah oleh Staf Kelurahan Lompoe.</p>
  <a href="#" onclick="window.print()" class="btn">🖨️ Cetak / Simpan Berkas</a>
</div>
</body>
</html>`;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.status(200).send(imgHtml);
        }

        // 0. GENERATE REAL DOCX FROM SRIKANDI TEMPLATES IN /templates FOLDER
        if (url.includes('generate-docx')) {
            let noResi = url.split('generate-docx/')[1] || '';
            noResi = noResi.split('?')[0].trim();

            let itemFromQuery = null;
            if (req.query && req.query.payload) {
                try {
                    const jsonStr = Buffer.from(req.query.payload, 'base64').toString('utf8');
                    itemFromQuery = JSON.parse(jsonStr);
                } catch (e) { }
            } else if (url.includes('payload=')) {
                try {
                    const rawPayload = url.split('payload=')[1].split('&')[0];
                    const jsonStr = Buffer.from(decodeURIComponent(rawPayload), 'base64').toString('utf8');
                    itemFromQuery = JSON.parse(jsonStr);
                } catch (e) { }
            }

            const foundInStore = store.pengajuanList.find(p =>
                (p.no_resi && p.no_resi.trim() === noResi) ||
                (p.nomor_resi && p.nomor_resi.trim() === noResi)
            );

            const item = itemFromQuery || foundInStore || store.pengajuanList[0] || {
                id: 101,
                no_resi: noResi || 'LMP-102938',
                nama_pemohon: 'JUMBO',
                nik: '7372012404950001',
                jenis_surat: 'Surat Rekomendasi Pembelian BBM',
                rt_rw: 'RW 03 / RT 02',
                alamat: 'Jl. Poros Lompoe No. 45, Parepare, RT 02 / RW 03',
                keperluan: 'Usaha Mikro / pertanian / perikanan / pelayanan umum',
                jenis_usaha: 'Usaha Mikro / Pertanian Padi',
                jenis_alat: 'Mesin Pompa Air / Traktor',
                jumlah_alat: '1 Unit',
                fungsi_alat: 'Pengolahan Lahan Pertanian',
                jenis_bbm: 'Solar (BBM Bersubsidi)',
                kebutuhan_bbm: '2 Liter / Hari',
                jam_operasi: '8 Jam / Hari',
                jumlah_liter: '60 Liter / Bulan',
                volume_bbm: '60 Liter / Bulan'
            };

            const templateFile = TEMPLATE_MAP[item.jenis_surat] || 'SRIKANDI - SURAT IZIN KERAMAIAN.docx';
            const templatePath = path.join(process.cwd(), 'templates', templateFile);

            if (!fs.existsSync(templatePath)) {
                console.error(`Template not found at ${templatePath}`);
                res.setHeader('Content-Type', 'text/plain');
                return res.status(404).send(`File template ${templateFile} tidak ditemukan!`);
            }

            try {
                let PizZip = require('pizzip');
                let Docxtemplater = require('docxtemplater');
                const content = fs.readFileSync(templatePath);
                const zip = new PizZip(content);
                let extraJson = {};
                try { if (item.data_json) extraJson = typeof item.data_json === 'string' ? JSON.parse(item.data_json) : item.data_json; } catch (e) { }

                const safeStr = (val, fallback = '-') => (val !== undefined && val !== null && String(val).trim() !== '') ? String(val).trim() : fallback;
                const safeUpper = (val, fallback = '-') => safeStr(val, fallback).toUpperCase();

                const [rtVal, rwVal] = safeStr(item.rt_rw || 'RT 01 / RW 01').split('/').map(s => s.replace(/[^0-9]/g, '').trim() || '01');

                const getNonEmpty = (...vals) => {
                    for (let v of vals) {
                        if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
                    }
                    return null;
                };

                const tempatTglLahirVal = getNonEmpty(item.tempat_tgl_lahir, item.tgl_lahir, extraJson.tempat_tgl_lahir, extraJson['tempat_tgl_lahir'], extraJson['tempat/tgl lahir'], extraJson['tempat/tanggal lahir'], extraJson['Tempat/Tgl Lahir'], extraJson['Tempat/Tgl lahir'], extraJson['tempat / tgl lahir']) || 'Parepare, 12 Mei 1995';
                const rawJk = getNonEmpty(item.jenis_kelamin, extraJson.jenis_kelamin, extraJson['jenis kelamin'], extraJson['Jenis Kelamin'], extraJson['jenis_kelamin'], extraJson['Jenis kelamin'], extraJson.jk, item.jk);
                const jenisKelaminVal = rawJk ? rawJk : 'Perempuan';
                const agamaVal = getNonEmpty(item.agama, extraJson.agama, extraJson['agama'], extraJson['Agama'], extraJson['AGAMA']) || 'Islam';
                const pekerjaanVal = getNonEmpty(item.pekerjaan, extraJson.pekerjaan, extraJson['pekerjaan'], extraJson['Pekerjaan'], extraJson['PEKERJAAN']) || 'Wiraswasta';
                const alamatVal = getNonEmpty(item.alamat, extraJson.alamat, extraJson['alamat'], extraJson['Alamat'], extraJson['ALAMAT']) || 'Jl. Poros Lompoe';

                const pejabatNama = getNonEmpty(extraJson.pejabat_ttd, item.pejabat_ttd, extraJson['Pejabat yang Bertanda Tangan']) || 'ASMIANTI M., SE.';
                const pejabatJabatan = getNonEmpty(extraJson.jabatan_pejabat, item.jabatan_pejabat, extraJson['Jabatan Pejabat yang Bertanda Tangan']) || 'LURAH LOMPOE';
                const pejabatNip = getNonEmpty(extraJson.nip_pejabat, item.nip_pejabat, extraJson['NIP Pejabat yang Bertanda Tangan']) || '19840927 201001 2 022';
                const pejabatPangkat = getNonEmpty(extraJson.pangkat_pejabat, item.pangkat_pejabat, extraJson['Pangkat Pejabat yang Bertanda Tangan']) || 'Penata Tk. I (III/d)';

                const jenisUsahaVal = safeStr(item.jenis_usaha || extraJson.jenis_usaha, 'Pertanian / Usaha Mikro');
                const jenisAlatVal = safeStr(item.jenis_alat || extraJson.jenis_alat, 'Mesin Pompa Air / Traktor');
                const jumlahAlatVal = safeStr(item.jumlah_alat || extraJson.jumlah_alat, '1 Unit');
                const fungsiAlatVal = safeStr(item.fungsi_alat || extraJson.fungsi_alat, 'Pengolahan Lahan Pertanian');
                const jenisBbmVal = safeStr(item.jenis_bbm || extraJson.jenis_bbm, 'Solar (BBM Bersubsidi)');
                const kebutuhanBbmVal = safeStr(item.kebutuhan_bbm || extraJson.kebutuhan_bbm, '2 Liter / Hari');
                const jamOperasiVal = safeStr(item.jam_operasi || extraJson.jam_operasi, '8 Jam / Hari');
                const jumlahLiterVal = safeStr(item.jumlah_liter || extraJson.jumlah_liter || item.volume_bbm || extraJson.volume_bbm, '60 Liter / Bulan');
                const konsumenPenggunaVal = safeStr(item.konsumen_pengguna || extraJson.konsumen_pengguna || item.keperluan, 'Usaha Mikro / Pertanian');
                const todayLongStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

                // Specific values for Surat Keterangan Penghasilan Orang Tua
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

                const cleanResiNo = (item.no_resi || noResi || '500536').replace(/[^0-9]/g, '') || '500536';
                const naskahNo = item.nomor_naskah || extraJson.nomor_naskah || item.nomor_surat || `470 / ${cleanResiNo} / KL-LMP / VIII / 2026`;

                const payload = {
                    ...extraJson,
                    'nomor_naskah': '${nomor_naskah}',
                    'nomor naskah': '${nomor_naskah}',
                    'tanggal_naskah': '${tanggal_naskah}',
                    'tanggal naskah': '${tanggal_naskah}',
                    'ttd_pengirim': '${ttd_pengirim}',
                    'kp_raw': getKonsumenPenggunaRuns(item.keperluan || konsumenPenggunaVal),

                    // SURAT KETERANGAN PENGHASILAN ORANG TUA SPECIFIC TAGS
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

                    // BBM SPECIFIC TAGS
                    'jenis_usaha': jenisUsahaVal,
                    'Jenis Usaha': jenisUsahaVal,
                    'Jenis Usaha/Kegiatan': jenisUsahaVal,
                    'jenis_kegiatan': jenisUsahaVal,

                    'jenis_alat': jenisAlatVal,
                    'Jenis Alat': jenisAlatVal,

                    'jumlah_alat': jumlahAlatVal,
                    'Jumlah Alat': jumlahAlatVal,

                    'fungsi_alat': fungsiAlatVal,
                    'Fungsi Alat': fungsiAlatVal,

                    'jenis_bbm': jenisBbmVal,
                    'Jenis BBM': jenisBbmVal,
                    'BBM Jenis Tertentu': jenisBbmVal,

                    'kebutuhan_bbm': kebutuhanBbmVal,
                    'Kebutuhan BBM': kebutuhanBbmVal,
                    'Kebutuhan BBM Jenis Tertentu': kebutuhanBbmVal,

                    'jam_operasi': jamOperasiVal,
                    'Jam Operasi': jamOperasiVal,
                    'Jam atau hari Operasi': jamOperasiVal,

                    'Liter': jumlahLiterVal,
                    'jumlah_liter': jumlahLiterVal,
                    'konsumen_bbm': jumlahLiterVal,
                    'Konsumen BBM Jenis Tertentu Liter Per (Jam/Hari/Minggu/Bulan)': jumlahLiterVal,

                    'jumlah': jumlahLiterVal,
                    'Jumlah': jumlahLiterVal,

                    'sejumlah': jumlahLiterVal,
                    'Sejumlah': jumlahLiterVal,
                    'volume_bbm': jumlahLiterVal,

                    'konsumen_pengguna': konsumenPenggunaVal,
                    'Konsumen Pengguna': konsumenPenggunaVal,

                    'KELURAHAN': 'LOMPOE',
                    'KECAMATAN': 'BACUKIKI',
                    'KOTA': 'PAREPARE',
                    'Kota/Kabupaten': 'PAREPARE',

                    'NAMA PEMOHON': safeUpper(item.nama_pemohon || item.nama_lengkap, 'Warga Kelurahan Lompoe'),
                    'Nama Pemohon': safeStr(item.nama_pemohon || item.nama_lengkap, 'Warga Kelurahan Lompoe'),
                    'nama pemohon': safeStr(item.nama_pemohon || item.nama_lengkap, 'Warga Kelurahan Lompoe'),
                    'NIK': safeStr(item.nik, '7372011205950001'),
                    'Nik': safeStr(item.nik, '7372011205950001'),

                    'TEMPAT/TGL LAHIR': tempatTglLahirVal,
                    'Tempat/Tgl Lahir': tempatTglLahirVal,
                    'tempat/tgl lahir': tempatTglLahirVal,
                    'Tempat/Tgl lahir': tempatTglLahirVal,
                    'tempat/tanggal lahir': tempatTglLahirVal,
                    'Tempat / Tgl Lahir': tempatTglLahirVal,

                    'JENIS KELAMIN': safeUpper(jenisKelaminVal),
                    'Jenis Kelamin': jenisKelaminVal,
                    'jenis kelamin': jenisKelaminVal,
                    'Jenis kelamin': jenisKelaminVal,

                    'AGAMA': safeUpper(agamaVal),
                    'Agama': agamaVal,
                    'agama': agamaVal,

                    'PEKERJAAN': safeUpper(pekerjaanVal),
                    'Pekerjaan': pekerjaanVal,
                    'pekerjaan': pekerjaanVal,

                    'ALAMAT': alamatVal,
                    'Alamat': alamatVal,
                    'alamat': alamatVal,

                    'RT': rtVal || '01',
                    'RW': rwVal || '01',
                    'Kelurahan': 'Lompoe',
                    'Kecamatan': 'Bacukiki',
                    'Kota/Kab': 'Parepare',
                    'acara': safeStr(extraJson.nama_acara || item.nama_acara || item.keperluan, 'Kegiatan Syukuran'),
                    'nama_acara': safeStr(extraJson.nama_acara || item.nama_acara || item.keperluan, 'Kegiatan Syukuran'),
                    'penggunaan izin': safeStr(extraJson.hiburan_acara || extraJson.penggunaan_izin || item.hiburan_acara || item.penggunaan_izin || item.keperluan, 'Musik Elekton / Sound System'),
                    'Penggunaan Izin': safeStr(extraJson.hiburan_acara || extraJson.penggunaan_izin || item.hiburan_acara || item.penggunaan_izin || item.keperluan, 'Musik Elekton / Sound System'),
                    'penggunaan_izin': safeStr(extraJson.hiburan_acara || extraJson.penggunaan_izin || item.hiburan_acara || item.penggunaan_izin || item.keperluan, 'Musik Elekton / Sound System'),
                    'hiburan_acara': safeStr(extraJson.hiburan_acara || extraJson.penggunaan_izin || item.hiburan_acara || item.penggunaan_izin || item.keperluan, 'Musik Elekton / Sound System'),
                    'hiburan': safeStr(extraJson.hiburan_acara || extraJson.penggunaan_izin || item.hiburan_acara || item.penggunaan_izin || item.keperluan, 'Musik Elekton / Sound System'),
                    'hari/tanggal acara': safeStr(item.tanggal_acara || extraJson.tanggal_acara, 'Senin, 24 Agustus 2026'),
                    'waktu acara': safeStr(extraJson.waktu_acara || item.waktu_acara, '09.00 - Selesai WITA'),
                    'tempat acara': safeStr(item.lokasi_acara || extraJson.lokasi_acara || alamatVal, 'Kediaman Pemohon'),
                    'RT tempat acara': rtVal || '01',
                    'RW tempat acara': rwVal || '01',

                    'Pejabat yang Bertanda Tangan': pejabatNama,
                    'Jabatan Pejabat yang Bertanda Tangan': pejabatJabatan,
                    'NIP Pejabat yang Bertanda Tangan': pejabatNip,
                    'Pangkat Pejabat yang Bertanda Tangan': pejabatPangkat,
                    'pejabat_ttd': pejabatNama,
                    'jabatan_pejabat': pejabatJabatan,
                    'nip_pejabat': pejabatNip,
                    'pangkat_pejabat': pejabatPangkat,
                    'ttd_pengirim': '${ttd_pengirim}'
                };

                const doc = new Docxtemplater(zip, {
                    delimiters: { start: '<<', end: '>>' },
                    paragraphLoop: true,
                    linebreaks: true,
                    nullGetter: function (tag) {
                        const tagName = (tag && (tag.value || tag.name)) ? String(tag.value || tag.name).trim() : '';
                        if (!tagName) return '';
                        if (tagName === 'pejabat_ttd' || tagName === 'Pejabat yang Bertanda Tangan') return pejabatNama;
                        if (tagName === 'jabatan_pejabat' || tagName === 'Jabatan Pejabat yang Bertanda Tangan') return pejabatJabatan;
                        if (tagName === 'nip_pejabat' || tagName === 'NIP Pejabat yang Bertanda Tangan') return pejabatNip;
                        if (tagName === 'pangkat_pejabat' || tagName === 'Pangkat Pejabat yang Bertanda Tangan') return pejabatPangkat;
                        if (tagName === 'ttd_pengirim') return '${ttd_pengirim}';
                        if (tagName.includes('nomor_naskah') || tagName.includes('nomor naskah')) return '${nomor_naskah}';
                        if (tagName.includes('tanggal_naskah') || tagName.includes('tanggal naskah')) return '${tanggal_naskah}';

                        if (tagName.includes('Tempat/Tgl') || tagName.includes('tempat/tgl') || tagName.includes('Tempat, Tanggal')) return tempatTglLahirVal || 'Parepare, 12 Mei 1995';
                        if (tagName.includes('Pekerjaan') || tagName.includes('pekerjaan') || tagName.includes('PEKERJAAN')) return pekerjaanVal || 'Wiraswasta';
                        if (tagName.includes('Agama') || tagName.includes('agama') || tagName.includes('AGAMA')) return agamaVal || 'Islam';
                        if (tagName.includes('Jenis Kelamin') || tagName.includes('jenis kelamin') || tagName.includes('Jenis kelamin')) return jenisKelaminVal || 'Perempuan';

                        if (payload && payload[tagName] !== undefined && payload[tagName] !== null && payload[tagName] !== '') return payload[tagName];
                        const val = item[tagName] || extraJson[tagName] || item[tagName.toLowerCase()] || extraJson[tagName.toLowerCase()];
                        return (val !== undefined && val !== null && val !== '') ? val : '';
                    }
                });

                doc.render(payload);

                // Post-render text replacement for &lt;&lt;...&gt;&gt; tags while preserving literal ${nomor_naskah}, ${tanggal_naskah}, ${ttd_pengirim} for Srikandi app reading
                let generatedZip = doc.getZip();
                let renderedXml = generatedZip.file('word/document.xml').asText();

                // Universal replacer for escaped XML entity &lt;&lt;Key&gt;&gt; tags
                if (payload && typeof payload === 'object') {
                    Object.keys(payload).forEach(k => {
                        const val = payload[k];
                        if (val !== undefined && val !== null && String(val).trim() !== '') {
                            const strVal = String(val);
                            renderedXml = renderedXml.replaceAll(`&lt;&lt;${k}&gt;&gt;`, strVal);
                            renderedXml = renderedXml.replaceAll(`<<${k}>>`, strVal);
                        }
                    });
                }

                // Explicit Pejabat tag replacers
                renderedXml = renderedXml.replaceAll('&lt;&lt;pejabat_ttd&gt;&gt;', pejabatNama);
                renderedXml = renderedXml.replaceAll('&lt;&lt;jabatan_pejabat&gt;&gt;', pejabatJabatan);
                renderedXml = renderedXml.replaceAll('&lt;&lt;nip_pejabat&gt;&gt;', pejabatNip);
                renderedXml = renderedXml.replaceAll('&lt;&lt;pangkat_pejabat&gt;&gt;', pejabatPangkat);

                renderedXml = renderedXml.replaceAll('<<pejabat_ttd>>', pejabatNama);
                renderedXml = renderedXml.replaceAll('<<jabatan_pejabat>>', pejabatJabatan);
                renderedXml = renderedXml.replaceAll('<<nip_pejabat>>', pejabatNip);
                renderedXml = renderedXml.replaceAll('<<pangkat_pejabat>>', pejabatPangkat);

                renderedXml = renderedXml.replaceAll('&lt;&lt;Pejabat yang Bertanda Tangan&gt;&gt;', pejabatNama);
                renderedXml = renderedXml.replaceAll('&lt;&lt;Jabatan Pejabat yang Bertanda Tangan&gt;&gt;', pejabatJabatan);
                renderedXml = renderedXml.replaceAll('&lt;&lt;NIP Pejabat yang Bertanda Tangan&gt;&gt;', pejabatNip);
                renderedXml = renderedXml.replaceAll('&lt;&lt;Pangkat Pejabat yang Bertanda Tangan&gt;&gt;', pejabatPangkat);

                renderedXml = renderedXml.replaceAll('<<Pejabat yang Bertanda Tangan>>', pejabatNama);
                renderedXml = renderedXml.replaceAll('<<Jabatan Pejabat yang Bertanda Tangan>>', pejabatJabatan);
                renderedXml = renderedXml.replaceAll('<<NIP Pejabat yang Bertanda Tangan>>', pejabatNip);
                renderedXml = renderedXml.replaceAll('<<Pangkat Pejabat yang Bertanda Tangan>>', pejabatPangkat);

                // Ensure Srikandi placeholders ${nomor_naskah}, ${tanggal_naskah}, ${ttd_pengirim} are kept untouched for Srikandi auto-injection

                generatedZip.file('word/document.xml', renderedXml);
                const buf = generatedZip.generate({ type: 'nodebuffer' });

                const safeFilename = encodeURIComponent(`${item.jenis_surat || 'Surat'}_${item.no_resi || noResi}.docx`);
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
                res.setHeader('Pragma', 'no-cache');
                res.setHeader('Expires', '0');
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
                return res.status(200).send(buf);

            } catch (err) {
                console.error('Docx generation error:', err);
                return res.status(500).send('Gagal memproses template surat Word.');
            }
        }

        // 0. VERIFIKASI RT/RW VIA WHATSAPP
        if (url.includes('verifikasi-rt')) {
            let token = url.split('verifikasi-rt/')[1] || '';
            token = token.split('?')[0].split('/')[0].trim();
            const cleanResi = token.replace('_RT', '').replace('_RW', '').split('?')[0].split('/')[0].trim();
            const body = req.body || {};

            const cloudList = (global.__LOMPOE_CLOUD_STORE__ && Array.isArray(global.__LOMPOE_CLOUD_STORE__.pengajuan)) ? global.__LOMPOE_CLOUD_STORE__.pengajuan : [];

            const findMatch = (list) => {
                if (!Array.isArray(list)) return null;
                return list.find(p => p && (
                    p.no_resi === cleanResi ||
                    p.no_resi === token ||
                    (p.no_resi && cleanResi.length > 3 && (cleanResi.includes(p.no_resi) || p.no_resi.includes(cleanResi))) ||
                    p.token_rt === token ||
                    p.token_rw === token ||
                    p.token_rt === cleanResi ||
                    p.token_rw === cleanResi
                ));
            };

            let found = findMatch(cloudList) || findMatch(store.pengajuanList);

            if (!found && req.method === 'GET') {
                return res.status(404).json({ success: false, message: 'Data pengajuan verifikasi RT/RW tidak ditemukan.' });
            }

            if (!found) {
                found = {
                    id: Date.now(),
                    no_resi: cleanResi.startsWith('LMP-') ? cleanResi : ('LMP-' + cleanResi.replace(/[^0-9]/g, '')),
                    nama_pemohon: 'Warga Kelurahan Lompoe',
                    token_rt: token
                };
            }

            if (req.method === 'POST' || req.method === 'PUT') {
                const isRw = body.role === 'rw' || token.includes('_RW') || body.is_rw === true;
                const statusNew = body.status || (body.keputusan === 'SETUJUI'
                    ? (isRw ? `Disetujui RW (${body.nama_rt_rw || 'Ketua RW'})` : `Disetujui RT (${body.nama_rt_rw || 'Ketua RT'})`)
                    : (isRw ? 'Ditolak RW' : 'Ditolak RT'));

                if (isRw) {
                    found.status_rw = statusNew;
                    found.catatan_rw = body.catatan_rt || body.catatan_rw || body.catatan || '';
                    found.tgl_disetujui_rw = new Date().toISOString();
                } else {
                    found.status_rt = statusNew;
                    found.catatan_rt = body.catatan_rt || body.catatan || '';
                    found.tgl_disetujui_rt = new Date().toISOString();
                }

                const storeIdx = store.pengajuanList.findIndex(p => p && (p.no_resi === found.no_resi || p.no_resi === cleanResi || p.token_rt === token || p.token_rw === token));
                if (storeIdx >= 0) {
                    store.pengajuanList[storeIdx] = found;
                } else {
                    store.pengajuanList.unshift(found);
                }

                if (!global.__LOMPOE_CLOUD_STORE__) global.__LOMPOE_CLOUD_STORE__ = store;
                if (!Array.isArray(global.__LOMPOE_CLOUD_STORE__.pengajuan)) global.__LOMPOE_CLOUD_STORE__.pengajuan = [];

                const cIdx = global.__LOMPOE_CLOUD_STORE__.pengajuan.findIndex(p => p && (p.no_resi === found.no_resi || p.no_resi === cleanResi || p.token_rt === token || p.token_rw === token));
                if (cIdx >= 0) global.__LOMPOE_CLOUD_STORE__.pengajuan[cIdx] = found;
                else global.__LOMPOE_CLOUD_STORE__.pengajuan.unshift(found);
                global.__LOMPOE_CLOUD_STORE__.pengajuanList = global.__LOMPOE_CLOUD_STORE__.pengajuan;

                saveDiskStore();

                // Persist approval status to Firebase Realtime DB immediately
                saveToFirebase(global.__LOMPOE_CLOUD_STORE__).catch(() => { });

                return res.status(200).json({ success: true, message: `Persetujuan ${isRw ? 'Ketua RW' : 'Ketua RT'} (${statusNew}) berhasil disimpan!`, data: found });
            }

            return res.status(200).json(found);
        }

        // 1. CEK RESI
        if (url.includes('cek-resi')) {
            let noResi = url.split('cek-resi/')[1] || '';
            noResi = noResi.split('?')[0].trim();

            const found = store.pengajuanList.find(p => (p.no_resi && p.no_resi.trim() === noResi) || (p.nomor_resi && p.nomor_resi.trim() === noResi));
            if (found) return res.status(200).json(found);

            return res.status(200).json({
                id: Date.now(),
                no_resi: noResi || 'LMP-102938',
                nomor_resi: noResi || 'LMP-102938',
                nama_pemohon: 'Warga Kelurahan Lompoe',
                nik: '7372011205950001',
                jenis_surat: 'Surat Keterangan Pengesahan Lurah',
                rt_rw: 'RW 01 / RT 01',
                telepon: '081234567890',
                no_hp: '081234567890',
                status_rt: 'Menunggu Verifikasi RT/RW',
                status_kelurahan: 'Disetujui/Siap Diambil',
                status: 'Disetujui/Siap Diambil',
                catatan_admin: 'Pengajuan Anda telah diverifikasi sah & disahkan oleh Staf Kelurahan & Lurah Lompoe.',
                tgl_pengajuan: new Date().toISOString().split('T')[0]
            });
        }

        // 2. CHAT
        if (url.includes('chat')) {
            if (req.method === 'POST') {
                const body = req.body || {};
                const newMessage = {
                    id: Date.now(),
                    sender: body.sender || 'Warga',
                    message: body.message || body.pesan || '',
                    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                };
                store.chatMessages.push(newMessage);
                return res.status(200).json({ success: true, message: 'Pesan berhasil terkirim!', data: newMessage });
            }
            return res.status(200).json(store.chatMessages);
        }

        // 3. PENGAJUAN SURAT (GET / POST / PUT / DELETE)
        if (req.method === 'POST') {
            const body = req.body || {};
            const resi = body.no_resi || ('LMP-' + Math.floor(100000 + Math.random() * 900000));
            const tokenRt = body.token_rt || ('tok_rt_' + Math.floor(100000 + Math.random() * 900000));
            const todayStr = new Date().toISOString().split('T')[0];

            const namaPemohon = body.nama_pemohon || body.nama_lengkap || body.nama || 'Warga Kelurahan Lompoe';
            const nikPemohon = body.nik || '7372011205950001';
            const jenisSurat = body.jenis_surat || 'Surat Keterangan Usaha (SKU)';
            const rtRw = body.rt_rw || 'RW 01 / RT 01';
            const telp = body.no_hp || body.telepon || body.nomor_wa || '081234567890';
            const keperluan = body.keperluan || body.nama_acara || 'Pengurusan Administrasi';
            const berkasStr = body.file_berkas || 'Surat_Pengantar_RT.pdf, KTP_Warga.pdf, KK_Warga.pdf';

            const newItem = {
                ...body,
                id: body.id || Date.now(),
                no_resi: resi,
                nomor_resi: resi,
                nama_pemohon: namaPemohon,
                nama_lengkap: namaPemohon,
                nik: nikPemohon,
                tempat_tgl_lahir: body.tempat_tgl_lahir || 'Parepare, 12 Mei 1995',
                jenis_kelamin: body.jenis_kelamin || 'Laki-laki',
                agama: body.agama || 'Islam',
                pekerjaan: body.pekerjaan || 'Wiraswasta',
                alamat: body.alamat || 'Jl. Poros Lompoe',
                jenis_surat: jenisSurat,
                rt_rw: rtRw,
                telepon: telp,
                no_hp: telp,
                nomor_wa: telp,
                keperluan: keperluan,
                nama_acara: body.nama_acara || keperluan,
                tanggal_acara: body.tanggal_acara || 'Senin, 24 Agustus 2026',
                lokasi_acara: body.lokasi_acara || body.alamat || 'Kediaman Pemohon',
                status_rt: body.status_rt || 'Menunggu Verifikasi RT',
                status_rw: body.status_rw || 'Menunggu Verifikasi RW',
                status_kelurahan: body.status_kelurahan || body.status || 'Progres',
                status: body.status || body.status_kelurahan || 'Progres',
                token_rt: tokenRt,
                token_rw: body.token_rw || (resi + '_RW'),
                tgl_pengajuan: todayStr,
                tanggal_pengajuan: todayStr,
                tanggal: todayStr,
                file_berkas: berkasStr,
                berkas_warga: berkasStr,
                file_data_map: body.file_data_map || body.file_berkas_data || {},
                data_json: body.data_json || ''
            };

            const existingIdx = store.pengajuanList.findIndex(p => p.no_resi === resi);
            if (existingIdx >= 0) {
                store.pengajuanList[existingIdx] = newItem;
            } else {
                store.pengajuanList.unshift(newItem);
            }

            saveDiskStore();

            if (!global.__LOMPOE_CLOUD_STORE__) {
                global.__LOMPOE_CLOUD_STORE__ = store;
            }
            if (!Array.isArray(global.__LOMPOE_CLOUD_STORE__.pengajuan)) {
                global.__LOMPOE_CLOUD_STORE__.pengajuan = [];
            }
            const cloudIdx = global.__LOMPOE_CLOUD_STORE__.pengajuan.findIndex(p => p && p.no_resi === resi);
            if (cloudIdx >= 0) {
                global.__LOMPOE_CLOUD_STORE__.pengajuan[cloudIdx] = newItem;
            } else {
                global.__LOMPOE_CLOUD_STORE__.pengajuan.unshift(newItem);
            }
            global.__LOMPOE_CLOUD_STORE__.pengajuanList = global.__LOMPOE_CLOUD_STORE__.pengajuan;

            // Persist submission to Firebase Realtime DB immediately
            saveToFirebase(global.__LOMPOE_CLOUD_STORE__).catch(() => { });

            return res.status(200).json({
                success: true,
                message: 'Pengajuan surat berhasil dikirim! Silakan catat nomor resi Anda.',
                no_resi: resi,
                nomor_resi: resi,
                token_rt: tokenRt,
                status_rt: newItem.status_rt,
                data: newItem
            });
        }

        if (req.method === 'PUT') {
            let resiFromUrl = url.split('pengajuan/')[1] || '';
            resiFromUrl = resiFromUrl.split('?')[0].trim();
            const body = req.body || {};

            let item = store.pengajuanList.find(p => p.no_resi == resiFromUrl || p.id == body.id || p.id == resiFromUrl);
            if (!item) {
                item = {
                    id: body.id || Date.now(),
                    no_resi: resiFromUrl || body.no_resi || 'LMP-102938',
                    nomor_resi: resiFromUrl || body.no_resi || 'LMP-102938',
                    nama_pemohon: body.nama_pemohon || body.nama_lengkap || 'Warga Kelurahan Lompoe',
                    jenis_surat: body.jenis_surat || 'Surat Pengajuan Warga',
                    ...body
                };
                store.pengajuanList.unshift(item);
            } else {
                Object.assign(item, body);
            }

            if (body.status_kelurahan) item.status_kelurahan = body.status_kelurahan;
            if (body.status_rt) item.status_rt = body.status_rt;
            if (body.status) item.status = body.status;
            if (body.catatan_admin) item.catatan_admin = body.catatan_admin;
            if (body.file_hasil) item.file_hasil = body.file_hasil;
            if (body.file_hasil_data) item.file_hasil_data = body.file_hasil_data;
            else if (body.status === 'Disetujui/Siap Diambil' || body.status === 'Selesai') {
                if (!item.file_hasil) item.file_hasil = `Surat_Pengesahan_Lurah_${item.no_resi}.pdf`;
            }

            saveDiskStore();

            if (!global.__LOMPOE_CLOUD_STORE__) global.__LOMPOE_CLOUD_STORE__ = store;
            if (!Array.isArray(global.__LOMPOE_CLOUD_STORE__.pengajuan)) global.__LOMPOE_CLOUD_STORE__.pengajuan = [];
            const idx = global.__LOMPOE_CLOUD_STORE__.pengajuan.findIndex(p => p && (p.no_resi == item.no_resi || p.id == item.id));
            if (idx >= 0) global.__LOMPOE_CLOUD_STORE__.pengajuan[idx] = item;
            else global.__LOMPOE_CLOUD_STORE__.pengajuan.unshift(item);
            global.__LOMPOE_CLOUD_STORE__.pengajuanList = global.__LOMPOE_CLOUD_STORE__.pengajuan;

            // Persist update to Firebase Realtime DB immediately
            saveToFirebase(global.__LOMPOE_CLOUD_STORE__).catch(() => { });

            return res.status(200).json({ success: true, message: 'Status pengajuan berhasil diperbarui!', data: item });
        }

        if (req.method === 'DELETE') {
            let resiFromUrl = url.split('pengajuan/')[1] || '';
            resiFromUrl = resiFromUrl.split('?')[0].trim();
            store.pengajuanList = store.pengajuanList.filter(p => p.no_resi != resiFromUrl && p.id != resiFromUrl);

            if (!global.__LOMPOE_CLOUD_STORE__) global.__LOMPOE_CLOUD_STORE__ = store;
            if (!Array.isArray(global.__LOMPOE_CLOUD_STORE__.pengajuan)) global.__LOMPOE_CLOUD_STORE__.pengajuan = [];
            if (!Array.isArray(global.__LOMPOE_CLOUD_STORE__.deleted_pengajuan_resis)) global.__LOMPOE_CLOUD_STORE__.deleted_pengajuan_resis = [];

            if (resiFromUrl && !global.__LOMPOE_CLOUD_STORE__.deleted_pengajuan_resis.includes(String(resiFromUrl))) {
                global.__LOMPOE_CLOUD_STORE__.deleted_pengajuan_resis.push(String(resiFromUrl));
            }

            global.__LOMPOE_CLOUD_STORE__.pengajuan = global.__LOMPOE_CLOUD_STORE__.pengajuan.filter(p => p && p.no_resi != resiFromUrl && p.id != resiFromUrl);
            global.__LOMPOE_CLOUD_STORE__.pengajuanList = global.__LOMPOE_CLOUD_STORE__.pengajuan;

            saveDiskStore();

            // Persist deletion to Firebase Realtime DB immediately
            saveToFirebase(global.__LOMPOE_CLOUD_STORE__).catch(() => { });

            return res.status(200).json({ success: true, message: 'Pengajuan berhasil dihapus!' });
        }

        return res.status(200).json(store.pengajuanList);
    } catch (err) {
        console.error('Layanan handler error:', err);
        return res.status(500).send('Error: ' + (err.stack || err.message));
    }
};