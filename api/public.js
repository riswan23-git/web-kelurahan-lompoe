const store = require('./_store.js');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

const cmsTmpFilePath = path.join(os.tmpdir(), 'lompoe_cms_store.json');
const CRUD_URL = 'https://crudcrud.com/api/654bc1c4f69b4b1aa3bf7395667c852b/cms_store/6a87f9c0310bbb03e8acb621';

let inMemoryCloudData = null;
let lastFetchTime = 0;

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

function fetchFromExternalCloud() {
    return new Promise((resolve) => {
        if (inMemoryCloudData && (Date.now() - lastFetchTime < 3000)) {
            return resolve(inMemoryCloudData);
        }
        const req = https.request(CRUD_URL, {
            method: 'GET',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        }, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                try {
                    if (res.statusCode === 200) {
                        const parsed = JSON.parse(body);
                        delete parsed._id;
                        delete parsed.store_name;
                        inMemoryCloudData = parsed;
                        lastFetchTime = Date.now();
                        resolve(parsed);
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        });
        req.on('error', () => resolve(null));
        req.end();
    });
}

module.exports = async (req, res) => {
    syncCmsDiskStore();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const cloudData = await fetchFromExternalCloud();
    if (cloudData) {
        if (Array.isArray(cloudData.aparatur) && cloudData.aparatur.length > 0) store.aparatur = cloudData.aparatur;
        if (Array.isArray(cloudData.pkk) && cloudData.pkk.length > 0) store.pkk = cloudData.pkk;
        if (Array.isArray(cloudData.berita) && cloudData.berita.length > 0) store.berita = cloudData.berita;
        if (Array.isArray(cloudData.sarana) && cloudData.sarana.length > 0) store.sarana = cloudData.sarana;
        if (Array.isArray(cloudData.nomor_darurat) && cloudData.nomor_darurat.length > 0) store.nomor_darurat = cloudData.nomor_darurat;
        if (Array.isArray(cloudData.kontak_rt) && cloudData.kontak_rt.length > 0) store.kontak_rt = cloudData.kontak_rt;
        if (cloudData.statistik) store.statistik = cloudData.statistik;
        if (cloudData.info) store.info = cloudData.info;
    }

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