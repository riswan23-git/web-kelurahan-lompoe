const store = require('./_store.js');

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
            const newItem = { id: Date.now(), nama_wilayah: body.nama_wilayah || `RW 0${store.pkk.length + 1}`, pkk_rw: body.pkk_rw || store.pkk.length + 1, pkk_rt: body.pkk_rt || 2, dasa_wisma: body.dasa_wisma || 5, krt: body.krt || 250, kk: body.kk || 300, pria: body.pria || 600, wanita: body.wanita || 600 };
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
};