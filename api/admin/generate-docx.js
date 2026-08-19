const store = require('../_store.js');
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

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

function safeStr(val, defaultVal = '') {
    if (val === undefined || val === null) return defaultVal;
    return String(val);
}

function safeUpper(val, defaultVal = '') {
    return safeStr(val, defaultVal).toUpperCase();
}

function getKonsumenPenggunaRuns(selectedType) {
    const type = safeStr(selectedType).toLowerCase();
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

    const pPr = `<w:pPr><w:tabs><w:tab w:val="left" w:pos="2977"/><w:tab w:val="left" w:pos="3261"/></w:tabs><w:spacing w:line="240" w:lineRule="auto"/><w:ind w:left="720" w:firstLine="0"/><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr>`;
    const runs = rHeader + rMikro + rSep1 + rTani + rSep2 + rIkan + rSep3 + rUmum;
    return `<w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000">${pPr}${runs}</w:p>`;
}

module.exports = (req, res) => {
    try {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        if (req.method === 'OPTIONS') return res.status(200).end();

        const url = req.url || '';
        let noResi = url.split('generate-docx/')[1] || url.split('generate-docx')[1] || '';
        noResi = noResi.split('?')[0].replace(/^\//, '').trim();

        let itemFromQuery = null;
        if (req.query && req.query.payload) {
            try {
                const jsonStr = Buffer.from(req.query.payload, 'base64').toString('utf8');
                itemFromQuery = JSON.parse(jsonStr);
            } catch(e) {}
        } else if (url.includes('payload=')) {
            try {
                const rawPayload = url.split('payload=')[1].split('&')[0];
                const jsonStr = Buffer.from(decodeURIComponent(rawPayload), 'base64').toString('utf8');
                itemFromQuery = JSON.parse(jsonStr);
            } catch(e) {}
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

        const templateFile = TEMPLATE_MAP[item.jenis_surat] || TEMPLATE_MAP[Object.keys(TEMPLATE_MAP).find(k => item.jenis_surat && item.jenis_surat.toLowerCase().includes(k.toLowerCase()))] || 'SRIKANDI - SURAT REKOMENDASI PEMBELIAN BBM.docx';
        
        let templatePath = path.join(process.cwd(), 'templates', templateFile);
        if (!fs.existsSync(templatePath)) {
            const fallback1 = path.join(__dirname, '..', '..', 'templates', templateFile);
            const fallback2 = path.join(__dirname, '..', 'templates', templateFile);
            if (fs.existsSync(fallback1)) templatePath = fallback1;
            else if (fs.existsSync(fallback2)) templatePath = fallback2;
        }

        if (!fs.existsSync(templatePath)) {
            console.error(`Template not found at ${templatePath}`);
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.status(200).send(`<h3>Berkas template ${templateFile} tidak ditemukan di server.</h3>`);
        }

        let extraJson = {};
        try {
            if (item.data_json) extraJson = typeof item.data_json === 'string' ? JSON.parse(item.data_json) : item.data_json;
        } catch(e) {}

        const content = fs.readFileSync(templatePath);
        const zip = new PizZip(content);

        const [rtVal, rwVal] = safeStr(item.rt_rw || 'RT 01 / RW 01').split('/').map(s => s.replace(/[^0-9]/g, '').trim() || '01');

        const getNonEmpty = (...vals) => {
            for (let v of vals) {
                if (v !== undefined && v !== null && String(v).trim() !== '' && String(v).trim() !== '-') return String(v).trim();
            }
            return null;
        };

        const namaPemohonVal = getNonEmpty(item.nama_pemohon, item.nama_lengkap, extraJson.nama_pemohon, extraJson.nama_lengkap, extraJson['nama_pemohon'], extraJson['nama pemohon']) || 'Warga Kelurahan Lompoe';
        const nikVal = getNonEmpty(item.nik, extraJson.nik, extraJson['nik'], extraJson['NIK']) || '7372011205950001';
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

        const payload = {
            'nomor_naskah': `470 / ${item.id || 101} / KL-LMP / VIII / 2026`,
            'nomor naskah': `470 / ${item.id || 101} / KL-LMP / VIII / 2026`,
            'tanggal_naskah': todayLongStr,
            'tanggal naskah': todayLongStr,
            'ttd_pengirim': pejabatNama,
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
            'acara': safeStr(item.nama_acara || extraJson.nama_acara || extraJson.acara || item.keperluan || extraJson.keperluan, 'Syukuran & Pesta Pernikahan'),
            'Acara': safeStr(item.nama_acara || extraJson.nama_acara || extraJson.acara || item.keperluan || extraJson.keperluan, 'Syukuran & Pesta Pernikahan'),
            'nama_acara': safeStr(item.nama_acara || extraJson.nama_acara || extraJson.acara || item.keperluan || extraJson.keperluan, 'Syukuran & Pesta Pernikahan'),

            'penggunaan izin': safeStr(extraJson.penggunaan_izin || extraJson['penggunaan izin'] || extraJson.hiburan || extraJson.alat_musik, 'Musik Elekton / Sound System'),
            'Penggunaan Izin': safeStr(extraJson.penggunaan_izin || extraJson['penggunaan izin'] || extraJson.hiburan || extraJson.alat_musik, 'Musik Elekton / Sound System'),
            'penggunaan_izin': safeStr(extraJson.penggunaan_izin || extraJson['penggunaan izin'] || extraJson.hiburan || extraJson.alat_musik, 'Musik Elekton / Sound System'),

            'hari/tanggal acara': safeStr(item.tanggal_acara || extraJson.tanggal_acara || extraJson['hari/tanggal acara'] || extraJson.hari_tanggal_acara, 'Senin, 24 Agustus 2026'),
            'Hari/Tanggal Acara': safeStr(item.tanggal_acara || extraJson.tanggal_acara || extraJson['hari/tanggal acara'] || extraJson.hari_tanggal_acara, 'Senin, 24 Agustus 2026'),
            'tanggal_acara': safeStr(item.tanggal_acara || extraJson.tanggal_acara || extraJson['hari/tanggal acara'] || extraJson.hari_tanggal_acara, 'Senin, 24 Agustus 2026'),

            'waktu acara': safeStr(extraJson.waktu_acara || extraJson['waktu acara'] || extraJson.waktu, '09.00 WITA s/d Selesai'),
            'Waktu Acara': safeStr(extraJson.waktu_acara || extraJson['waktu acara'] || extraJson.waktu, '09.00 WITA s/d Selesai'),
            'waktu_acara': safeStr(extraJson.waktu_acara || extraJson['waktu acara'] || extraJson.waktu, '09.00 WITA s/d Selesai'),

            'tempat acara': safeStr(item.lokasi_acara || extraJson.lokasi_acara || extraJson['tempat acara'] || extraJson.tempat_acara || alamatVal, 'Gedung Gelora Lompoe'),
            'Tempat Acara': safeStr(item.lokasi_acara || extraJson.lokasi_acara || extraJson['tempat acara'] || extraJson.tempat_acara || alamatVal, 'Gedung Gelora Lompoe'),
            'lokasi_acara': safeStr(item.lokasi_acara || extraJson.lokasi_acara || extraJson['tempat acara'] || extraJson.tempat_acara || alamatVal, 'Gedung Gelora Lompoe'),

            'RT tempat acara': rtVal || '01',
            'RW tempat acara': rwVal || '01',
            ...extraJson,

            'Pejabat yang Bertanda Tangan': pejabatNama,
            'Jabatan Pejabat yang Bertanda Tangan': pejabatJabatan,
            'NIP Pejabat yang Bertanda Tangan': pejabatNip,
            'Pangkat Pejabat yang Bertanda Tangan': pejabatPangkat,
            'pejabat_ttd': pejabatNama,
            'jabatan_pejabat': pejabatJabatan,
            'nip_pejabat': pejabatNip,
            'pangkat_pejabat': pejabatPangkat,
            'ttd_pengirim': pejabatNama
        };

        const doc = new Docxtemplater(zip, {
            delimiters: { start: '<<', end: '>>' },
            paragraphLoop: true,
            linebreaks: true,
            nullGetter: function(tag) {
                const tagName = (tag && (tag.value || tag.name)) ? String(tag.value || tag.name).trim() : '';
                if (!tagName) return '-';
                if (tagName === 'pejabat_ttd' || tagName === 'Pejabat yang Bertanda Tangan') return pejabatNama;
                if (tagName === 'jabatan_pejabat' || tagName === 'Jabatan Pejabat yang Bertanda Tangan') return pejabatJabatan;
                if (tagName === 'nip_pejabat' || tagName === 'NIP Pejabat yang Bertanda Tangan') return pejabatNip;
                if (tagName === 'pangkat_pejabat' || tagName === 'Pangkat Pejabat yang Bertanda Tangan') return pejabatPangkat;
                if (tagName === 'ttd_pengirim') return pejabatNama;
                if (tagName.includes('nomor_naskah') || tagName.includes('nomor naskah')) return `470 / ${item.id || 101} / KL-LMP / VIII / 2026`;
                if (tagName.includes('tanggal_naskah') || tagName.includes('tanggal naskah')) return todayLongStr;
                if (payload && payload[tagName] !== undefined && payload[tagName] !== null && payload[tagName] !== '') return payload[tagName];
                const val = item[tagName] || extraJson[tagName] || item[tagName.toLowerCase()] || extraJson[tagName.toLowerCase()];
                return (val !== undefined && val !== null && val !== '') ? val : '-';
            }
        });

        doc.render(payload);

        // Post-render text replacement for ${nomor_naskah}, ${tanggal_naskah}, ${ttd_pengirim} and &lt;&lt;...&gt;&gt; tags
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

        // Clean authentic naskah number based on Resi or official field (no random timestamp numbers)
        const cleanResiNo = (item.no_resi || noResi || '500536').replace(/[^0-9]/g, '') || '500536';
        const naskahNo = item.nomor_naskah || extraJson.nomor_naskah || item.nomor_surat || `470 / ${cleanResiNo} / KL-LMP / VIII / 2026`;

        renderedXml = renderedXml.replace(/\$\{nomor_naskah[^}]*\}/g, naskahNo);
        renderedXml = renderedXml.replace(/\$\{tanggal_naskah[^}]*\}/g, todayLongStr);
        renderedXml = renderedXml.replace(/\$\{ttd_pengirim[^}]*\}/g, pejabatNama);

        renderedXml = renderedXml.replace(/\$\{nomor_naskah/g, naskahNo);
        renderedXml = renderedXml.replace(/\$\{tanggal_naskah/g, todayLongStr);
        renderedXml = renderedXml.replace(/\$\{ttd_pengirim/g, pejabatNama);

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
        console.error('Docx generation error in dedicated endpoint:', err);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(`
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"><title>Info Berkas Surat</title></head>
            <body style="font-family: sans-serif; padding: 40px; text-align: center; background: #0f172a; color: #fff;">
                <h2>📄 Unduh Dokumen Word Surat</h2>
                <p>Status: Template sedang diproses.</p>
                <p style="color: #94a3b8; font-size: 14px;">Gagal memproses file template Word: ${err.message || err}</p>
            </body>
            </html>
        `);
    }
};
