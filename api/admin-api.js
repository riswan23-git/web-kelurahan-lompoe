const store = require('./_store.js');
const fs = require('fs');
const path = require('path');
const os = require('os');

const cmsTmpFilePath = path.join(os.tmpdir(), 'lompoe_cms_store.json');

function syncCmsDiskStore() {
    try {
        if (fs.existsSync(cmsTmpFilePath)) {
            const raw = fs.readFileSync(cmsTmpFilePath, 'utf8');
            const data = JSON.parse(raw);
            if (data) {
                if (Array.isArray(data.aparatur)) store.aparatur = data.aparatur;
                if (Array.isArray(data.pkk)) store.pkk = data.pkk;
                if (Array.isArray(data.berita)) store.berita = data.berita;
                if (Array.isArray(data.sarana)) store.sarana = data.sarana;
                if (Array.isArray(data.nomor_darurat)) store.nomor_darurat = data.nomor_darurat;
                if (Array.isArray(data.kontak_rt)) store.kontak_rt = data.kontak_rt;
                if (data.statistik) store.statistik = data.statistik;
                if (data.info) store.info = data.info;
            }
        }
    } catch (e) {}
}

function saveCmsDiskStore() {
    try {
        const payload = {
            aparatur: store.aparatur,
            pkk: store.pkk,
            berita: store.berita,
            sarana: store.sarana,
            nomor_darurat: store.nomor_darurat,
            kontak_rt: store.kontak_rt,
            statistik: store.statistik,
            info: store.info
        };
        fs.writeFileSync(cmsTmpFilePath, JSON.stringify(payload), 'utf8');
    } catch (e) {}
}

function extractId(url, body) {
    const rawUrl = url || '';
    let target = body && body.id ? body.id : null;
    if (rawUrl.includes('/')) {
        const cleanUrl = rawUrl.split('?')[0];
        const parts = cleanUrl.split('/').filter(Boolean);
        const lastPart = parts[parts.length - 1];
        if (lastPart && lastPart !== 'admin-api' && lastPart !== 'admin' && !isNaN(Number(lastPart))) {
            target = lastPart;
        }
    }
    return target;
}

module.exports = (req, res) => {
    syncCmsDiskStore();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const url = req.url || '';
    const body = req.body || {};
    const method = req.method || 'GET';

    // 1. APARATUR & STRUKTUR
    if (url.includes('aparatur')) {
        if (method === 'POST') {
            const newItem = { id: Date.now(), nama: body.nama || 'Aparatur Baru', nip: body.nip || '-', jabatan: body.jabatan || 'Staf Kelurahan', is_lurah: body.is_lurah ? 1 : 0, sambutan: body.sambutan || '', urutan: body.urutan || store.aparatur.length + 1, foto: body.foto || null };
            if (newItem.is_lurah) {
                store.aparatur.forEach(a => a.is_lurah = 0);
            }
            store.aparatur.push(newItem);
            saveCmsDiskStore();
            return res.status(200).json({ success: true, message: 'Data aparatur berhasil disimpan!', data: newItem, list: store.aparatur });
        }
        if (method === 'PUT') {
            const targetId = extractId(url, body);
            let item = store.aparatur.find(a => a.id == targetId || a.id == body.id);
            if (!item && (body.is_lurah || (body.jabatan && body.jabatan.toLowerCase().includes('lurah')))) {
                item = store.aparatur.find(a => a.is_lurah == 1);
            }
            if (item) {
                Object.assign(item, body);
                if (body.is_lurah) {
                    store.aparatur.forEach(a => { if (a.id !== item.id) a.is_lurah = 0; });
                }
            } else if (body.nama) {
                const newItem = { id: body.id || Date.now(), ...body };
                store.aparatur.push(newItem);
                item = newItem;
            }
            saveCmsDiskStore();
            return res.status(200).json({ success: true, message: 'Data aparatur berhasil diperbarui!', data: item, list: store.aparatur });
        }
        if (method === 'DELETE') {
            const targetId = extractId(url, body);
            store.aparatur = store.aparatur.filter(a => a.id != targetId && a.id != body.id);
            saveCmsDiskStore();
            return res.status(200).json({ success: true, message: 'Aparatur berhasil dihapus!', list: store.aparatur });
        }
        return res.status(200).json(store.aparatur);
    }

    // 2. PKK WILAYAH / DATA WILAYAH
    if (url.includes('pkk-wilayah') || url.includes('pkk')) {
        if (method === 'POST') {
            const newItem = { id: Date.now(), nama_wilayah: body.nama_wilayah || `RW 0${store.pkk.length + 1}`, pkk_rw: body.pkk_rw || store.pkk.length + 1, pkk_rt: body.pkk_rt || 2, dasa_wisma: body.dasa_wisma || 5, krt: body.krt || 250, kk: body.kk || 300, pria: body.pria || 600, wanita: body.wanita || 600 };
            store.pkk.push(newItem);
            saveCmsDiskStore();
            return res.status(200).json({ success: true, message: 'Data wilayah PKK berhasil disimpan!', data: newItem, list: store.pkk });
        }
        if (method === 'PUT') {
            const targetId = extractId(url, body);
            const item = store.pkk.find(p => p.id == targetId || p.id == body.id);
            if (item) Object.assign(item, body);
            saveCmsDiskStore();
            return res.status(200).json({ success: true, message: 'Data wilayah PKK berhasil diperbarui!', data: item, list: store.pkk });
        }
        if (method === 'DELETE') {
            const targetId = extractId(url, body);
            store.pkk = store.pkk.filter(p => p.id != targetId && p.id != body.id);
            saveCmsDiskStore();
            return res.status(200).json({ success: true, message: 'Data wilayah PKK berhasil dihapus!', list: store.pkk });
        }
        return res.status(200).json(store.pkk);
    }

    // 3. BERITA / KABAR KELURAHAN
    if (url.includes('berita')) {
        if (method === 'POST') {
            const newItem = { id: Date.now(), judul: body.judul || 'Berita Kelurahan Baru', kategori: body.kategori || 'Pengumuman', ringkasan: body.ringkasan || '', isi: body.isi || '', tanggal: new Date().toISOString().split('T')[0], gambar: body.gambar || null };
            store.berita.unshift(newItem);
            saveCmsDiskStore();
            return res.status(200).json({ success: true, message: 'Berita berhasil disimpan!', data: newItem, list: store.berita });
        }
        if (method === 'PUT') {
            const targetId = extractId(url, body);
            const item = store.berita.find(b => b.id == targetId || b.id == body.id);
            if (item) Object.assign(item, body);
            saveCmsDiskStore();
            return res.status(200).json({ success: true, message: 'Berita berhasil diperbarui!', data: item, list: store.berita });
        }
        if (method === 'DELETE') {
            const targetId = extractId(url, body);
            store.berita = store.berita.filter(b => b.id != targetId && b.id != body.id);
            saveCmsDiskStore();
            return res.status(200).json({ success: true, message: 'Berita berhasil dihapus!', list: store.berita });
        }
        return res.status(200).json(store.berita);
    }

    // 4. SARANA & PRASARANA
    if (url.includes('sarana')) {
        if (method === 'POST') {
            const newItem = { id: Date.now(), nama_sarana: body.nama_sarana || 'Sarana Baru', kategori: body.kategori || 'Umum', lokasi: body.lokasi || 'Lompoe', deskripsi: body.deskripsi || '', kondisi: body.kondisi || 'Baik', foto: body.foto || null };
            store.sarana.push(newItem);
            saveCmsDiskStore();
            return res.status(200).json({ success: true, message: 'Sarana prasarana berhasil disimpan!', data: newItem, list: store.sarana });
        }
        if (method === 'PUT') {
            const targetId = extractId(url, body);
            const item = store.sarana.find(s => s.id == targetId || s.id == body.id);
            if (item) Object.assign(item, body);
            saveCmsDiskStore();
            return res.status(200).json({ success: true, message: 'Sarana prasarana berhasil diperbarui!', data: item, list: store.sarana });
        }
        if (method === 'DELETE') {
            const targetId = extractId(url, body);
            store.sarana = store.sarana.filter(s => s.id != targetId && s.id != body.id);
            saveCmsDiskStore();
            return res.status(200).json({ success: true, message: 'Sarana prasarana berhasil dihapus!', list: store.sarana });
        }
        return res.status(200).json(store.sarana);
    }

    // 5. NOMOR DARURAT
    if (url.includes('nomor-darurat') || url.includes('darurat')) {
        if (method === 'POST') {
            const newItem = { id: Date.now(), nama_instansi: body.nama_instansi || 'Instansi Resmi', nomor_telepon: body.nomor_telepon || '-', kategori: body.kategori || 'Darurat', icon: body.icon || '📞' };
            store.nomor_darurat.unshift(newItem);
            saveCmsDiskStore();
            return res.status(200).json({ success: true, message: 'Nomor darurat berhasil disimpan!', data: newItem, list: store.nomor_darurat });
        }
        if (method === 'PUT') {
            const targetId = extractId(url, body);
            const item = store.nomor_darurat.find(n => n.id == targetId || n.id == body.id);
            if (item) Object.assign(item, body);
            saveCmsDiskStore();
            return res.status(200).json({ success: true, message: 'Nomor darurat berhasil diperbarui!', data: item, list: store.nomor_darurat });
        }
        if (method === 'DELETE') {
            const targetId = extractId(url, body);
            store.nomor_darurat = store.nomor_darurat.filter(n => n.id != targetId && n.id != body.id);
            saveCmsDiskStore();
            return res.status(200).json({ success: true, message: 'Nomor darurat berhasil dihapus!', list: store.nomor_darurat });
        }
        return res.status(200).json(store.nomor_darurat);
    }

    // 6. KONTAK RT / RW
    if (url.includes('kontak-rt') || url.includes('kontak')) {
        if (method === 'POST') {
            const newItem = { id: Date.now(), rt_rw: body.rt_rw || body.nama_rt_rw || 'RT 01 / RW 01', nama_rt_rw: body.nama_rt_rw || 'Ketua RT/RW', nama_ketua: body.nama_ketua || body.nama_pejabat || '-', nama_pejabat: body.nama_ketua || body.nama_pejabat || '-', no_wa: body.no_wa || body.nomor_wa || '-' };
            store.kontak_rt.push(newItem);
            saveCmsDiskStore();
            return res.status(200).json({ success: true, message: 'Kontak RT/RW berhasil disimpan!', data: newItem, list: store.kontak_rt });
        }
        if (method === 'PUT') {
            const targetId = extractId(url, body);
            const item = store.kontak_rt.find(k => k.id == targetId || k.id == body.id);
            if (item) Object.assign(item, body);
            saveCmsDiskStore();
            return res.status(200).json({ success: true, message: 'Kontak RT/RW berhasil diperbarui!', data: item, list: store.kontak_rt });
        }
        if (method === 'DELETE') {
            const targetId = extractId(url, body);
            store.kontak_rt = store.kontak_rt.filter(k => k.id != targetId && k.id != body.id);
            saveCmsDiskStore();
            return res.status(200).json({ success: true, message: 'Kontak RT/RW berhasil dihapus!', list: store.kontak_rt });
        }
        return res.status(200).json(store.kontak_rt);
    }

    // 7. STATISTIK PENDUDUK
    if (url.includes('statistik')) {
        if (method === 'POST' || method === 'PUT') {
            Object.assign(store.statistik, body);
            saveCmsDiskStore();
            return res.status(200).json({ success: true, message: 'Statistik berhasil diperbarui!', data: store.statistik });
        }
        return res.status(200).json(store.statistik);
    }

    // 8. INFO KELURAHAN & BATAS WILAYAH
    if (url.includes('info')) {
        if (method === 'POST' || method === 'PUT') {
            Object.assign(store.info, body);
            saveCmsDiskStore();
            return res.status(200).json({ success: true, message: 'Informasi kelurahan berhasil diperbarui!', data: store.info });
        }
        return res.status(200).json(store.info);
    }

    return res.status(200).json({ success: true, message: 'Operasi admin berhasil diproses!' });
};