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

module.exports = (req, res) => {
    syncCmsDiskStore();
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
};