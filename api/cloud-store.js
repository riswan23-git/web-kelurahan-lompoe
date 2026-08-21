const store = require('./_store.js');
const https = require('https');

const FIREBASE_DB_URL = 'https://web-kelurahan-lompoe-ca95c-default-rtdb.asia-southeast1.firebasedatabase.app/store.json';

// Initialize global store if not already set
if (!global.__LOMPOE_CLOUD_STORE__) {
    global.__LOMPOE_CLOUD_STORE__ = store;
}

function fetchFromFirebase() {
    return new Promise((resolve) => {
        const req = https.request(FIREBASE_DB_URL, { method: 'GET' }, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    if (data && typeof data === 'object') {
                        resolve(data);
                        return;
                    }
                } catch (e) {}
                resolve(null);
            });
        });
        req.on('error', () => resolve(null));
        req.end();
    });
}

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

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    let currentStore = global.__LOMPOE_CLOUD_STORE__ || store;

    // Sync from Firebase DB on GET
    if (req.method === 'GET') {
        const fbData = await fetchFromFirebase();
        if (fbData && typeof fbData === 'object') {
            currentStore = { ...currentStore, ...fbData };
            global.__LOMPOE_CLOUD_STORE__ = currentStore;
        }
        return res.status(200).json({
            success: true,
            data: currentStore,
            aparatur: currentStore.aparatur || [],
            pkk: currentStore.pkk || [],
            berita: currentStore.berita || [],
            sarana: currentStore.sarana || [],
            pengajuan: currentStore.pengajuan || [],
            nomor_darurat: currentStore.nomor_darurat || [],
            kontak_rt: currentStore.kontak_rt || [],
            statistik: currentStore.statistik || {},
            info: currentStore.info || {}
        });
    }

    if (req.method === 'POST') {
        const body = req.body || {};
        
        if (body.aparatur && Array.isArray(body.aparatur)) currentStore.aparatur = body.aparatur;
        if (body.pkk && Array.isArray(body.pkk)) currentStore.pkk = body.pkk;
        if (body.berita && Array.isArray(body.berita)) currentStore.berita = body.berita;
        if (body.sarana && Array.isArray(body.sarana)) currentStore.sarana = body.sarana;
        if (body.pengajuan && Array.isArray(body.pengajuan)) currentStore.pengajuan = body.pengajuan;
        if (body.nomor_darurat && Array.isArray(body.nomor_darurat)) currentStore.nomor_darurat = body.nomor_darurat;
        if (body.kontak_rt && Array.isArray(body.kontak_rt)) currentStore.kontak_rt = body.kontak_rt;
        if (body.statistik) currentStore.statistik = body.statistik;
        if (body.info) currentStore.info = body.info;

        currentStore.updated_at = new Date().toISOString();
        global.__LOMPOE_CLOUD_STORE__ = currentStore;

        // Persist to Firebase Realtime DB
        await saveToFirebase(currentStore);

        return res.status(200).json({
            success: true,
            message: 'Cloud store updated successfully via Firebase!',
            data: currentStore,
            aparatur: currentStore.aparatur || [],
            pkk: currentStore.pkk || [],
            berita: currentStore.berita || [],
            sarana: currentStore.sarana || [],
            pengajuan: currentStore.pengajuan || []
        });
    }

    return res.status(405).json({ error: 'Method not allowed' });
};
