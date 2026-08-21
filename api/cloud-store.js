const store = require('./_store.js');
const https = require('https');

const CRUD_URL = 'https://crudcrud.com/api/654bc1c4f69b4b1aa3bf7395667c852b/cms_store/6a87f9c0310bbb03e8acb621';

// Memory cache in serverless lambda container
let inMemoryCloudData = null;
let lastFetchTime = 0;

function fetchFromExternalCloud() {
    return new Promise((resolve) => {
        // Cache for 3 seconds to ensure high performance
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

function saveToExternalCloud(data) {
    return new Promise((resolve) => {
        inMemoryCloudData = data;
        lastFetchTime = Date.now();
        const payload = JSON.stringify({ store_name: 'LompoeCMS', ...data });
        const req = https.request(CRUD_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0',
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

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'GET') {
        const cloudData = await fetchFromExternalCloud();
        const mergedStore = {
            aparatur: (cloudData && Array.isArray(cloudData.aparatur) && cloudData.aparatur.length > 0) ? cloudData.aparatur : store.aparatur,
            pkk: (cloudData && Array.isArray(cloudData.pkk) && cloudData.pkk.length > 0) ? cloudData.pkk : store.pkk,
            berita: (cloudData && Array.isArray(cloudData.berita) && cloudData.berita.length > 0) ? cloudData.berita : store.berita,
            sarana: (cloudData && Array.isArray(cloudData.sarana) && cloudData.sarana.length > 0) ? cloudData.sarana : store.sarana,
            nomor_darurat: (cloudData && Array.isArray(cloudData.nomor_darurat) && cloudData.nomor_darurat.length > 0) ? cloudData.nomor_darurat : store.nomor_darurat,
            kontak_rt: (cloudData && Array.isArray(cloudData.kontak_rt) && cloudData.kontak_rt.length > 0) ? cloudData.kontak_rt : store.kontak_rt,
            statistik: (cloudData && cloudData.statistik) ? cloudData.statistik : store.statistik,
            info: (cloudData && cloudData.info) ? cloudData.info : store.info
        };
        return res.status(200).json(mergedStore);
    }

    if (req.method === 'POST' || req.method === 'PUT') {
        let body = {};
        try {
            if (req.body && typeof req.body === 'object') body = req.body;
            else if (req.body && typeof req.body === 'string') body = JSON.parse(req.body);
        } catch (e) {}

        const currentCloud = (await fetchFromExternalCloud()) || { ...store };
        const updatedStore = {
            ...currentCloud,
            ...body
        };

        // Update local store reference as well
        if (body.aparatur && Array.isArray(body.aparatur)) store.aparatur = body.aparatur;
        if (body.pkk && Array.isArray(body.pkk)) store.pkk = body.pkk;
        if (body.berita && Array.isArray(body.berita)) store.berita = body.berita;
        if (body.sarana && Array.isArray(body.sarana)) store.sarana = body.sarana;
        if (body.nomor_darurat && Array.isArray(body.nomor_darurat)) store.nomor_darurat = body.nomor_darurat;
        if (body.kontak_rt && Array.isArray(body.kontak_rt)) store.kontak_rt = body.kontak_rt;
        if (body.statistik) store.statistik = body.statistik;
        if (body.info) store.info = body.info;

        await saveToExternalCloud(updatedStore);
        return res.status(200).json({ success: true, message: 'Cloud store updated successfully!', data: updatedStore });
    }

    return res.status(405).json({ error: 'Method not allowed' });
};
