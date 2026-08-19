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

const https = require('https');

function syncCmsRemoteStore() {
    return new Promise((resolve) => {
        try {
            const req = https.get('https://crudcrud.com/api/2b04437260f041bbae94b6f3ea97418a/cms_data', {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            }, (res) => {
                let body = '';
                res.on('data', c => body += c);
                res.on('end', () => {
                    try {
                        const list = JSON.parse(body);
                        if (Array.isArray(list) && list.length > 0) {
                            const latest = list[list.length - 1];
                            if (latest) {
                                if (Array.isArray(latest.aparatur) && latest.aparatur.length > 0) store.aparatur = latest.aparatur;
                                if (Array.isArray(latest.pkk) && latest.pkk.length > 0) store.pkk = latest.pkk;
                                if (Array.isArray(latest.berita) && latest.berita.length > 0) store.berita = latest.berita;
                                if (Array.isArray(latest.sarana) && latest.sarana.length > 0) store.sarana = latest.sarana;
                                if (Array.isArray(latest.nomor_darurat) && latest.nomor_darurat.length > 0) store.nomor_darurat = latest.nomor_darurat;
                                if (Array.isArray(latest.kontak_rt) && latest.kontak_rt.length > 0) store.kontak_rt = latest.kontak_rt;
                                if (latest.statistik) store.statistik = latest.statistik;
                                if (latest.info) store.info = latest.info;
                            }
                        }
                    } catch(e) {}
                    resolve();
                });
            });
            req.on('error', () => resolve());
            req.setTimeout(2500, () => { req.destroy(); resolve(); });
        } catch(e) { resolve(); }
    });
}

module.exports = async (req, res) => {
    syncCmsDiskStore();
    await syncCmsRemoteStore();
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