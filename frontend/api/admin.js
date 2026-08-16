let adminState = {
    aparatur: [
        { id: 1, nama: 'Hj. Andi Hasnani, S.Sos', nip: '19700101 199003 2 001', jabatan: 'Lurah Lompoe', foto: null, is_lurah: 1, sambutan: 'Selamat Datang di Website Resmi Kelurahan Lompoe, Kecamatan Bacukiki, Kota Parepare. Website ini hadir sebagai wujud transparansi publik dan kemudahan pelayanan administrasi bagi seluruh warga.', urutan: 1 },
        { id: 2, nama: 'Muhammad Amir, S.STP', nip: '19850512 200801 1 002', jabatan: 'Sekretaris Kelurahan', foto: null, is_lurah: 0, sambutan: '', urutan: 2 },
        { id: 3, nama: 'Siti Rahmah, S.E', nip: '19880920 201101 2 003', jabatan: 'Kasi Pelayanan Umum & Kesejahteraan', foto: null, is_lurah: 0, sambutan: '', urutan: 3 },
        { id: 4, nama: 'Ahmad Fauzi, S.Kom', nip: '19920315 201502 1 004', jabatan: 'Staf Administrasi & IT', foto: null, is_lurah: 0, sambutan: '', urutan: 4 }
    ],
    pkk: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        nama_wilayah: `RW 0${i + 1}`,
        pkk_rw: i + 1,
        pkk_rt: i === 0 ? 3 : i === 1 ? 3 : 2,
        dasa_wisma: 4 + (i % 3),
        krt: 250 + i * 15,
        kk: 300 + i * 20,
        pria: 600 + i * 25,
        wanita: 590 + i * 25
    })),
    berita: [
        { id: 1, judul: 'Kegiatan Penguatan Ketahanan Pangan & Gotong Royong Warga Lompoe', ringkasan: 'Warga Kelurahan Lompoe bersama aparatur kelurahan dan TP PKK melaksanakan kegiatan kebersihan lingkungan dan penanaman bibit tanaman pangan.', isi: 'Kegiatan gotong royong rutin dilaksanakan di seluruh wilayah RW Kelurahan Lompoe untuk menjaga kebersihan dan kekeluargaan antar warga.', tanggal: '2026-08-10', gambar: null }
    ],
    sarana: [
        { id: 1, nama_sarana: 'Kantor Kelurahan Lompoe', kategori: 'Pemerintahan', lokasi: 'Jl. Poros Lompoe', deskripsi: 'Pusat pelayanan administrasi publik dan pelayanan masyarakat.', foto: null },
        { id: 2, nama_sarana: 'Puskesmas Pembantu Bacukiki', kategori: 'Kesehatan', lokasi: 'Lompoe', deskripsi: 'Fasilitas pelayanan kesehatan dasar bagi warga.', foto: null }
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
    }
};

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const url = req.url || '';
    const body = req.body || {};

    // 1. APARATUR
    if (url.includes('aparatur')) {
        if (req.method === 'POST') {
            const newItem = {
                id: Date.now(),
                nama: body.nama || 'Aparatur Baru',
                nip: body.nip || '-',
                jabatan: body.jabatan || 'Staf',
                is_lurah: body.is_lurah ? 1 : 0,
                sambutan: body.sambutan || '',
                urutan: body.urutan || 5,
                foto: null
            };
            adminState.aparatur.push(newItem);
            return res.status(200).json({ success: true, message: 'Data aparatur berhasil disimpan!' });
        }
        if (req.method === 'PUT') {
            const urlParts = url.split('/');
            const id = urlParts[urlParts.length - 1];
            const item = adminState.aparatur.find(a => a.id == id || a.id == body.id);
            if (item) Object.assign(item, body);
            return res.status(200).json({ success: true, message: 'Data aparatur berhasil diperbarui!' });
        }
        if (req.method === 'DELETE') {
            const urlParts = url.split('/');
            const id = urlParts[urlParts.length - 1];
            adminState.aparatur = adminState.aparatur.filter(a => a.id != id);
            return res.status(200).json({ success: true, message: 'Aparatur berhasil dihapus!' });
        }
        return res.status(200).json(adminState.aparatur);
    }

    // 2. PKK WILAYAH
    if (url.includes('pkk-wilayah')) {
        if (req.method === 'POST') {
            const newItem = {
                id: Date.now(),
                nama_wilayah: body.nama_wilayah || `RW 0${adminState.pkk.length + 1}`,
                pkk_rw: body.pkk_rw || adminState.pkk.length + 1,
                pkk_rt: body.pkk_rt || 2,
                dasa_wisma: body.dasa_wisma || 5,
                krt: body.krt || 250,
                kk: body.kk || 300,
                pria: body.pria || 600,
                wanita: body.wanita || 600
            };
            adminState.pkk.push(newItem);
            return res.status(200).json({ success: true, message: 'Data wilayah PKK berhasil disimpan!' });
        }
        if (req.method === 'PUT') {
            const urlParts = url.split('/');
            const id = urlParts[urlParts.length - 1];
            const item = adminState.pkk.find(p => p.id == id || p.id == body.id);
            if (item) Object.assign(item, body);
            return res.status(200).json({ success: true, message: 'Data wilayah PKK berhasil diperbarui!' });
        }
        if (req.method === 'DELETE') {
            const urlParts = url.split('/');
            const id = urlParts[urlParts.length - 1];
            adminState.pkk = adminState.pkk.filter(p => p.id != id);
            return res.status(200).json({ success: true, message: 'Data wilayah PKK berhasil dihapus!' });
        }
        return res.status(200).json(adminState.pkk);
    }

    // 3. BERITA
    if (url.includes('berita')) {
        if (req.method === 'POST') {
            const newItem = {
                id: Date.now(),
                judul: body.judul || 'Berita Kelurahan Baru',
                ringkasan: body.ringkasan || '',
                isi: body.isi || '',
                tanggal: new Date().toISOString().split('T')[0],
                gambar: null
            };
            adminState.berita.unshift(newItem);
            return res.status(200).json({ success: true, message: 'Berita berhasil disimpan!' });
        }
        if (req.method === 'PUT') {
            const urlParts = url.split('/');
            const id = urlParts[urlParts.length - 1];
            const item = adminState.berita.find(b => b.id == id || b.id == body.id);
            if (item) Object.assign(item, body);
            return res.status(200).json({ success: true, message: 'Berita berhasil diperbarui!' });
        }
        if (req.method === 'DELETE') {
            const urlParts = url.split('/');
            const id = urlParts[urlParts.length - 1];
            adminState.berita = adminState.berita.filter(b => b.id != id);
            return res.status(200).json({ success: true, message: 'Berita berhasil dihapus!' });
        }
        return res.status(200).json(adminState.berita);
    }

    // 4. SARANA
    if (url.includes('sarana')) {
        if (req.method === 'POST') {
            const newItem = {
                id: Date.now(),
                nama_sarana: body.nama_sarana || 'Sarana Baru',
                kategori: body.kategori || 'Umum',
                lokasi: body.lokasi || 'Lompoe',
                deskripsi: body.deskripsi || '',
                foto: null
            };
            adminState.sarana.push(newItem);
            return res.status(200).json({ success: true, message: 'Sarana prasarana berhasil disimpan!' });
        }
        if (req.method === 'PUT') {
            const urlParts = url.split('/');
            const id = urlParts[urlParts.length - 1];
            const item = adminState.sarana.find(s => s.id == id || s.id == body.id);
            if (item) Object.assign(item, body);
            return res.status(200).json({ success: true, message: 'Sarana prasarana berhasil diperbarui!' });
        }
        if (req.method === 'DELETE') {
            const urlParts = url.split('/');
            const id = urlParts[urlParts.length - 1];
            adminState.sarana = adminState.sarana.filter(s => s.id != id);
            return res.status(200).json({ success: true, message: 'Sarana prasarana berhasil dihapus!' });
        }
        return res.status(200).json(adminState.sarana);
    }

    // 5. NOMOR DARURAT
    if (url.includes('nomor-darurat')) {
        if (req.method === 'POST') {
            const newItem = {
                id: Date.now(),
                nama_instansi: body.nama_instansi || 'Instansi Resmi',
                nomor_telepon: body.nomor_telepon || '-',
                kategori: body.kategori || 'Darurat',
                icon: body.icon || '📞'
            };
            adminState.nomor_darurat.unshift(newItem);
            return res.status(200).json({ success: true, message: 'Nomor darurat berhasil disimpan!' });
        }
        if (req.method === 'PUT') {
            const urlParts = url.split('/');
            const id = urlParts[urlParts.length - 1];
            const item = adminState.nomor_darurat.find(n => n.id == id || n.id == body.id);
            if (item) Object.assign(item, body);
            return res.status(200).json({ success: true, message: 'Nomor darurat berhasil diperbarui!' });
        }
        if (req.method === 'DELETE') {
            const urlParts = url.split('/');
            const id = urlParts[urlParts.length - 1];
            adminState.nomor_darurat = adminState.nomor_darurat.filter(n => n.id != id);
            return res.status(200).json({ success: true, message: 'Nomor darurat berhasil dihapus!' });
        }
        return res.status(200).json(adminState.nomor_darurat);
    }

    // 6. KONTAK RT/RW
    if (url.includes('kontak-rt')) {
        if (req.method === 'POST') {
            const newItem = {
                id: Date.now(),
                rt_rw: body.rt_rw || body.nama_rt_rw || 'RT 01 / RW 01',
                nama_rt_rw: body.nama_rt_rw || 'Ketua RT/RW',
                nama_ketua: body.nama_ketua || body.nama_pejabat || '-',
                nama_pejabat: body.nama_ketua || body.nama_pejabat || '-',
                no_wa: body.no_wa || body.nomor_wa || '-'
            };
            adminState.kontak_rt.push(newItem);
            return res.status(200).json({ success: true, message: 'Kontak RT/RW berhasil disimpan!' });
        }
        if (req.method === 'PUT') {
            const urlParts = url.split('/');
            const id = urlParts[urlParts.length - 1];
            const item = adminState.kontak_rt.find(k => k.id == id || k.id == body.id);
            if (item) Object.assign(item, body);
            return res.status(200).json({ success: true, message: 'Kontak RT/RW berhasil diperbarui!' });
        }
        if (req.method === 'DELETE') {
            const urlParts = url.split('/');
            const id = urlParts[urlParts.length - 1];
            adminState.kontak_rt = adminState.kontak_rt.filter(k => k.id != id);
            return res.status(200).json({ success: true, message: 'Kontak RT/RW berhasil dihapus!' });
        }
        return res.status(200).json(adminState.kontak_rt);
    }

    // 7. STATISTIK
    if (url.includes('statistik')) {
        if (req.method === 'POST' || req.method === 'PUT') {
            Object.assign(adminState.statistik, body);
            return res.status(200).json({ success: true, message: 'Statistik berhasil diperbarui!' });
        }
        return res.status(200).json(adminState.statistik);
    }

    // 8. INFO KELURAHAN
    if (url.includes('info')) {
        if (req.method === 'POST' || req.method === 'PUT') {
            Object.assign(adminState.info, body);
            return res.status(200).json({ success: true, message: 'Informasi kelurahan berhasil diperbarui!' });
        }
        return res.status(200).json(adminState.info);
    }

    // Default Fallback Response
    return res.status(200).json({ success: true, message: 'Operasi admin berhasil diproses!' });
};
