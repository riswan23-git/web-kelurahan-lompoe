const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const apiDir = path.join(rootDir, 'api');

// 1. Create api/_store.js (Global shared state module)
const storeCode = `// Global shared memory store for Vercel Serverless Functions
const globalStore = global.__LOMPOE_STORE__ || {
    aparatur: [
        { id: 1, nama: 'Hj. Andi Hasnani, S.Sos', nip: '19700101 199003 2 001', jabatan: 'Lurah Lompoe', foto: null, is_lurah: 1, sambutan: 'Selamat Datang di Website Resmi Kelurahan Lompoe, Kecamatan Bacukiki, Kota Parepare.', urutan: 1 },
        { id: 2, nama: 'Muhammad Amir, S.STP', nip: '19850512 200801 1 002', jabatan: 'Sekretaris Kelurahan', foto: null, is_lurah: 0, sambutan: '', urutan: 2 },
        { id: 3, nama: 'Siti Rahmah, S.E', nip: '19880920 201101 2 003', jabatan: 'Kasi Pelayanan Umum & Kesejahteraan', foto: null, is_lurah: 0, sambutan: '', urutan: 3 },
        { id: 4, nama: 'Ahmad Fauzi, S.Kom', nip: '19920315 201502 1 004', jabatan: 'Staf Administrasi & IT', foto: null, is_lurah: 0, sambutan: '', urutan: 4 }
    ],
    pkk: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        nama_wilayah: \`RW 0\${i + 1}\`,
        pkk_rw: i + 1,
        pkk_rt: i === 0 ? 3 : i === 1 ? 3 : 2,
        dasa_wisma: 4 + (i % 3),
        krt: 250 + i * 15,
        kk: 300 + i * 20,
        pria: 600 + i * 25,
        wanita: 590 + i * 25
    })),
    berita: [
        { id: 1, judul: 'Kegiatan Penguatan Ketahanan Pangan & Gotong Royong Warga Lompoe', kategori: 'Pengumuman', ringkasan: 'Warga Kelurahan Lompoe bersama aparatur kelurahan dan TP PKK melaksanakan kegiatan kebersihan lingkungan dan penanaman bibit tanaman pangan.', isi: 'Kegiatan gotong royong rutin dilaksanakan di seluruh wilayah RW Kelurahan Lompoe untuk menjaga kebersihan dan kekeluargaan antar warga.', tanggal: '2026-08-10', gambar: null }
    ],
    sarana: [
        { id: 1, nama_sarana: 'Kantor Kelurahan Lompoe', kategori: 'Pemerintahan', lokasi: 'Jl. Poros Lompoe', deskripsi: 'Pusat pelayanan administrasi publik dan pelayanan masyarakat.', kondisi: 'Baik', foto: null },
        { id: 2, nama_sarana: 'Puskesmas Pembantu Bacukiki', kategori: 'Kesehatan', lokasi: 'Lompoe', deskripsi: 'Fasilitas pelayanan kesehatan dasar bagi warga.', kondisi: 'Baik', foto: null }
    ],
    nomor_darurat: [
        { id: 1, nama_instansi: 'Call Center Parepare', nomor_telepon: '112', kategori: '🚨 Darurat', icon: '🚨' },
        { id: 2, nama_instansi: 'Polsek Bacukiki', nomor_telepon: '(0421) 12345', kategori: 'Police', icon: '🚓' },
        { id: 3, nama_instansi: 'Pemadam Kebakaran', nomor_telepon: '113', kategori: 'Fire', icon: '🚒' },
        { id: 4, nama_instansi: 'Puskesmas Bacukiki', nomor_telepon: '(0421) 21118', kategori: 'Health', icon: '🏥' }
    ],
    kontak_rt: [
        { id: 1, rt_rw: 'RW 01 / RT 01', nama_rt_rw: 'Ketua RW 01', nama_ketua: 'Bpk. H. Ahmad', nama_pejabat: 'Bpk. H. Ahmad', no_wa: '081234567890' },
        { id: 2, rt_rw: 'RW 01 / RT 02', nama_rt_rw: 'Ketua RW 02', nama_ketua: 'Bpk. Syafruddin', nama_pejabat: 'Bpk. Syafruddin', no_wa: '081298765432' }
    ],
    statistik: { id: 1, total_pria: 6285, total_wanita: 6185, total_kk: 3772, total_rt: 26, total_rw: 10, luas_wilayah: '30.9 Ha' },
    info: {
        id: 1,
        deskripsi_profil: 'Kelurahan Lompoe adalah salah satu kelurahan di Kecamatan Bacukiki, Kota Parepare, Sulawesi Selatan. Memiliki 10 Wilayah RW dan 26 RT dengan pusat kegiatan masyarakat yang asri dan berbasis pelayanan digital.',
        batas_utara: 'Kelurahan Galung Maloang',
        batas_selatan: 'Kelurahan Lemoe',
        batas_timur: 'Kecamatan Bacukiki Barat',
        batas_barat: 'Kelurahan Watang Bacukiki',
        embed_map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15911.238128362626!2d119.6455!3d-4.0322!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2d95b5420d43e589%3A0x6b1076b0d9154f9a!2sLompoe%2C%20Bacukiki%2C%20Parepare%20City%2C%20South%20Sulawesi!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid',
        alamat_kantor: 'Jl. Poros Lompoe, Kec. Bacukiki, Kota Parepare, Sulsel',
        email_resmi: 'kelurahan.lompoe@pareparekota.go.id',
        telepon_kantor: '(0421) 12345',
        jam_pelayanan: 'Senin - Jumat (08.00 - 16.00 WITA)',
        teks_marquee: '🏛️ SELAMAT DATANG DI PORTAL DIGITAL KELURAHAN LOMPOE, KECAMATAN BACUKIKI, KOTA PAREPARE • 🕒 JAM PELAYANAN KANTOR LOKET: SENIN - JUMAT 08.00 - 16.00 WITA • 📝 LAYANAN PENGAJUAN SURAT & PERSETUJUAN LURAH BISA DILAKUKAN ONLINE 24 JAM'
    },
    pengajuanList: [
        {
            id: 1,
            no_resi: 'LMP-102938',
            nomor_resi: 'LMP-102938',
            nama_pemohon: 'Andi M. Fajar',
            nama_lengkap: 'Andi M. Fajar',
            nik: '7372011205950001',
            jenis_surat: 'Surat Keterangan Usaha (SKU)',
            rt_rw: 'RW 01 / RT 02',
            telepon: '081234567890',
            nomor_wa: '081234567890',
            keperluan: 'Persyaratan Pengajuan KUR Bank Dahulu',
            status_rt: 'Disetujui RT/RW',
            status_kelurahan: 'Progres',
            status: 'Progres',
            token_rt: 'tok_rt_102938',
            tgl_pengajuan: '2026-08-17',
            tanggal: '2026-08-17',
            berkas_warga: 'Surat_Pengantar_RT_KTP_KK.pdf'
        }
    ],
    chatMessages: [
        { id: 1, sender: 'Warga', message: 'Halo admin, mau tanya jam operasional loket?', time: '09:00' },
        { id: 2, sender: 'Staf Kelurahan', message: 'Halo! Jam pelayanan loket kami dari pukul 08.00 - 16.00 WITA.', time: '09:02' }
    ]
};

global.__LOMPOE_STORE__ = globalStore;

module.exports = globalStore;
`;

fs.writeFileSync(path.join(apiDir, '_store.js'), storeCode, 'utf8');
console.log('Created api/_store.js!');

// 2. Update api/public.js to use store
const publicCode = `const store = require('./_store.js');

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const url = req.url || '';

    if (url.includes('aparatur')) return res.status(200).json(store.aparatur);
    if (url.includes('pkk-wilayah')) return res.status(200).json(store.pkk);
    if (url.includes('berita')) return res.status(200).json(store.berita);
    if (url.includes('sarana')) return res.status(200).json(store.sarana);
    if (url.includes('nomor-darurat')) return res.status(200).json(store.nomor_darurat);
    if (url.includes('kontak-rt')) return res.status(200).json(store.kontak_rt);
    if (url.includes('statistik')) return res.status(200).json(store.statistik);
    if (url.includes('info')) return res.status(200).json(store.info);

    return res.status(200).json({ success: true, data: store });
};`;
fs.writeFileSync(path.join(apiDir, 'public.js'), publicCode, 'utf8');

// 3. Update api/layanan.js to use store and accurately parse submitted citizen forms
const layananCode = `const store = require('./_store.js');

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const url = req.url || '';

    // 1. CEK RESI
    if (url.includes('cek-resi')) {
        const urlParts = url.split('/');
        const noResi = urlParts[urlParts.length - 1];
        const found = store.pengajuanList.find(p => p.no_resi == noResi || p.nomor_resi == noResi);
        if (found) return res.status(200).json(found);
        return res.status(200).json({
            id: 1,
            no_resi: noResi || 'LMP-102938',
            nomor_resi: noResi || 'LMP-102938',
            nama_pemohon: 'Pemohon Resi Lompoe',
            nik: '7372011205950001',
            jenis_surat: 'Surat Keterangan Usaha (SKU)',
            rt_rw: 'RW 01 / RT 02',
            telepon: '081234567890',
            status_rt: 'Disetujui RT/RW',
            status_kelurahan: 'Disetujui Lurah (Selesai)',
            status: 'Disetujui Lurah (Selesai)',
            catatan_admin: 'Surat telah selesai diproses dan siap diunduh.',
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
        const resi = 'LMP-' + Math.floor(100000 + Math.random() * 900000);
        const tokenRt = 'tok_rt_' + Math.floor(100000 + Math.random() * 900000);
        const todayStr = new Date().toISOString().split('T')[0];
        
        const namaPemohon = body.nama_pemohon || body.nama_lengkap || body.nama || 'Warga Kelurahan Lompoe';
        const nikPemohon = body.nik || '7372011205950001';
        const jenisSurat = body.jenis_surat || 'Surat Keterangan Usaha (SKU)';
        const rtRw = body.rt_rw || 'RW 01 / RT 01';
        const telp = body.telepon || body.nomor_wa || '081234567890';
        const keperluan = body.keperluan || 'Pengurusan Administrasi';
        const berkasStr = body.file_berkas ? (typeof body.file_berkas === 'string' ? body.file_berkas : 'Dokumen_Lampiran_Warga.pdf') : 'KTP_KK_Pengantar_RT.pdf';

        const newItem = {
            id: Date.now(),
            no_resi: resi,
            nomor_resi: resi,
            nama_pemohon: namaPemohon,
            nama_lengkap: namaPemohon,
            nik: nikPemohon,
            jenis_surat: jenisSurat,
            rt_rw: rtRw,
            telepon: telp,
            nomor_wa: telp,
            keperluan: keperluan,
            status_rt: 'Disetujui RT/RW',
            status_kelurahan: 'Progres',
            status: 'Progres',
            token_rt: tokenRt,
            tgl_pengajuan: todayStr,
            tanggal: todayStr,
            berkas_warga: berkasStr
        };

        store.pengajuanList.unshift(newItem);

        return res.status(200).json({
            success: true,
            message: 'Pengajuan surat berhasil dikirim! Silakan catat nomor resi Anda.',
            no_resi: resi,
            nomor_resi: resi,
            token_rt: tokenRt,
            status_rt: 'Disetujui RT/RW',
            data: newItem
        });
    }

    if (req.method === 'PUT') {
        const urlParts = url.split('/');
        const resiFromUrl = urlParts[urlParts.length - 1];
        const body = req.body || {};
        const item = store.pengajuanList.find(p => p.no_resi == resiFromUrl || p.id == body.id || p.id == resiFromUrl);
        if (item) {
            if (body.status_kelurahan) item.status_kelurahan = body.status_kelurahan;
            if (body.status_rt) item.status_rt = body.status_rt;
            if (body.status) item.status = body.status;
            if (body.catatan_admin) item.catatan_admin = body.catatan_admin;
        }
        return res.status(200).json({ success: true, message: 'Status pengajuan berhasil diperbarui!' });
    }

    if (req.method === 'DELETE') {
        const urlParts = url.split('/');
        const resiFromUrl = urlParts[urlParts.length - 1];
        store.pengajuanList = store.pengajuanList.filter(p => p.no_resi != resiFromUrl && p.id != resiFromUrl);
        return res.status(200).json({ success: true, message: 'Pengajuan berhasil dihapus!' });
    }

    return res.status(200).json(store.pengajuanList);
};`;

fs.writeFileSync(path.join(apiDir, 'layanan.js'), layananCode, 'utf8');
console.log('Updated api/layanan.js!');

// 4. Update api/admin-api.js to use store for all CRUD operations
const adminApiCode = `const store = require('./_store.js');

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const url = req.url || '';
    const body = req.body || {};

    if (url.includes('aparatur')) {
        if (req.method === 'POST') {
            const newItem = { id: Date.now(), nama: body.nama || 'Aparatur Baru', nip: body.nip || '-', jabatan: body.jabatan || 'Staf Kelurahan', is_lurah: body.is_lurah ? 1 : 0, sambutan: body.sambutan || '', urutan: body.urutan || store.aparatur.length + 1, foto: null };
            store.aparatur.push(newItem);
            return res.status(200).json({ success: true, message: 'Data aparatur berhasil disimpan!', data: newItem });
        }
        if (req.method === 'PUT') {
            const urlParts = url.split('/');
            const id = urlParts[urlParts.length - 1];
            const item = store.aparatur.find(a => a.id == id || a.id == body.id);
            if (item) Object.assign(item, body);
            return res.status(200).json({ success: true, message: 'Data aparatur berhasil diperbarui!' });
        }
        if (req.method === 'DELETE') {
            const urlParts = url.split('/');
            const id = urlParts[urlParts.length - 1];
            store.aparatur = store.aparatur.filter(a => a.id != id);
            return res.status(200).json({ success: true, message: 'Aparatur berhasil dihapus!' });
        }
        return res.status(200).json(store.aparatur);
    }

    if (url.includes('pkk-wilayah')) {
        if (req.method === 'POST') {
            const newItem = { id: Date.now(), nama_wilayah: body.nama_wilayah || \`RW 0\${store.pkk.length + 1}\`, pkk_rw: body.pkk_rw || store.pkk.length + 1, pkk_rt: body.pkk_rt || 2, dasa_wisma: body.dasa_wisma || 5, krt: body.krt || 250, kk: body.kk || 300, pria: body.pria || 600, wanita: body.wanita || 600 };
            store.pkk.push(newItem);
            return res.status(200).json({ success: true, message: 'Data wilayah PKK berhasil disimpan!', data: newItem });
        }
        if (req.method === 'PUT') {
            const urlParts = url.split('/');
            const id = urlParts[urlParts.length - 1];
            const item = store.pkk.find(p => p.id == id || p.id == body.id);
            if (item) Object.assign(item, body);
            return res.status(200).json({ success: true, message: 'Data wilayah PKK berhasil diperbarui!' });
        }
        if (req.method === 'DELETE') {
            const urlParts = url.split('/');
            const id = urlParts[urlParts.length - 1];
            store.pkk = store.pkk.filter(p => p.id != id);
            return res.status(200).json({ success: true, message: 'Data wilayah PKK berhasil dihapus!' });
        }
        return res.status(200).json(store.pkk);
    }

    if (url.includes('berita')) {
        if (req.method === 'POST') {
            const newItem = { id: Date.now(), judul: body.judul || 'Berita Kelurahan Baru', kategori: body.kategori || 'Pengumuman', ringkasan: body.ringkasan || '', isi: body.isi || '', tanggal: new Date().toISOString().split('T')[0], gambar: null };
            store.berita.unshift(newItem);
            return res.status(200).json({ success: true, message: 'Berita berhasil disimpan!', data: newItem });
        }
        if (req.method === 'PUT') {
            const urlParts = url.split('/');
            const id = urlParts[urlParts.length - 1];
            const item = store.berita.find(b => b.id == id || b.id == body.id);
            if (item) Object.assign(item, body);
            return res.status(200).json({ success: true, message: 'Berita berhasil diperbarui!' });
        }
        if (req.method === 'DELETE') {
            const urlParts = url.split('/');
            const id = urlParts[urlParts.length - 1];
            store.berita = store.berita.filter(b => b.id != id);
            return res.status(200).json({ success: true, message: 'Berita berhasil dihapus!' });
        }
        return res.status(200).json(store.berita);
    }

    if (url.includes('sarana')) {
        if (req.method === 'POST') {
            const newItem = { id: Date.now(), nama_sarana: body.nama_sarana || 'Sarana Baru', kategori: body.kategori || 'Umum', lokasi: body.lokasi || 'Lompoe', deskripsi: body.deskripsi || '', kondisi: body.kondisi || 'Baik', foto: null };
            store.sarana.push(newItem);
            return res.status(200).json({ success: true, message: 'Sarana prasarana berhasil disimpan!', data: newItem });
        }
        if (req.method === 'PUT') {
            const urlParts = url.split('/');
            const id = urlParts[urlParts.length - 1];
            const item = store.sarana.find(s => s.id == id || s.id == body.id);
            if (item) Object.assign(item, body);
            return res.status(200).json({ success: true, message: 'Sarana prasarana berhasil diperbarui!' });
        }
        if (req.method === 'DELETE') {
            const urlParts = url.split('/');
            const id = urlParts[urlParts.length - 1];
            store.sarana = store.sarana.filter(s => s.id != id);
            return res.status(200).json({ success: true, message: 'Sarana prasarana berhasil dihapus!' });
        }
        return res.status(200).json(store.sarana);
    }

    if (url.includes('nomor-darurat')) {
        if (req.method === 'POST') {
            const newItem = { id: Date.now(), nama_instansi: body.nama_instansi || 'Instansi Resmi', nomor_telepon: body.nomor_telepon || '-', kategori: body.kategori || 'Darurat', icon: body.icon || '📞' };
            store.nomor_darurat.unshift(newItem);
            return res.status(200).json({ success: true, message: 'Nomor darurat berhasil disimpan!', data: newItem });
        }
        if (req.method === 'PUT') {
            const urlParts = url.split('/');
            const id = urlParts[urlParts.length - 1];
            const item = store.nomor_darurat.find(n => n.id == id || n.id == body.id);
            if (item) Object.assign(item, body);
            return res.status(200).json({ success: true, message: 'Nomor darurat berhasil diperbarui!' });
        }
        if (req.method === 'DELETE') {
            const urlParts = url.split('/');
            const id = urlParts[urlParts.length - 1];
            store.nomor_darurat = store.nomor_darurat.filter(n => n.id != id);
            return res.status(200).json({ success: true, message: 'Nomor darurat berhasil dihapus!' });
        }
        return res.status(200).json(store.nomor_darurat);
    }

    if (url.includes('kontak-rt')) {
        if (req.method === 'POST') {
            const newItem = { id: Date.now(), rt_rw: body.rt_rw || body.nama_rt_rw || 'RT 01 / RW 01', nama_rt_rw: body.nama_rt_rw || 'Ketua RT/RW', nama_ketua: body.nama_ketua || body.nama_pejabat || '-', nama_pejabat: body.nama_ketua || body.nama_pejabat || '-', no_wa: body.no_wa || body.nomor_wa || '-' };
            store.kontak_rt.push(newItem);
            return res.status(200).json({ success: true, message: 'Kontak RT/RW berhasil disimpan!', data: newItem });
        }
        if (req.method === 'PUT') {
            const urlParts = url.split('/');
            const id = urlParts[urlParts.length - 1];
            const item = store.kontak_rt.find(k => k.id == id || k.id == body.id);
            if (item) Object.assign(item, body);
            return res.status(200).json({ success: true, message: 'Kontak RT/RW berhasil diperbarui!' });
        }
        if (req.method === 'DELETE') {
            const urlParts = url.split('/');
            const id = urlParts[urlParts.length - 1];
            store.kontak_rt = store.kontak_rt.filter(k => k.id != id);
            return res.status(200).json({ success: true, message: 'Kontak RT/RW berhasil dihapus!' });
        }
        return res.status(200).json(store.kontak_rt);
    }

    if (url.includes('statistik')) {
        if (req.method === 'POST' || req.method === 'PUT') {
            Object.assign(store.statistik, body);
            return res.status(200).json({ success: true, message: 'Statistik berhasil diperbarui!', data: store.statistik });
        }
        return res.status(200).json(store.statistik);
    }

    if (url.includes('info')) {
        if (req.method === 'POST' || req.method === 'PUT') {
            Object.assign(store.info, body);
            return res.status(200).json({ success: true, message: 'Informasi kelurahan berhasil diperbarui!', data: store.info });
        }
        return res.status(200).json(store.info);
    }

    return res.status(200).json({ success: true, message: 'Operasi admin berhasil diproses!' });
};`;

fs.writeFileSync(path.join(apiDir, 'admin-api.js'), adminApiCode, 'utf8');
console.log('Updated api/admin-api.js!');
