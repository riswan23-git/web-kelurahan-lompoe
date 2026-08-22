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

    // Sync from Firebase DB on request
    const fbData = await fetchFromFirebase();
    if (fbData && typeof fbData === 'object') {
        currentStore = { ...currentStore, ...fbData };
        if (fbData.pengajuanList && Array.isArray(fbData.pengajuanList)) {
            currentStore.pengajuan = fbData.pengajuanList;
        } else if (fbData.pengajuan && Array.isArray(fbData.pengajuan)) {
            currentStore.pengajuanList = fbData.pengajuan;
        }
        global.__LOMPOE_CLOUD_STORE__ = currentStore;
    }

    if (!Array.isArray(currentStore.deleted_pengajuan_resis)) {
        currentStore.deleted_pengajuan_resis = [];
    }

    if (req.method === 'GET') {
        let rawList = Array.isArray(currentStore.pengajuan) ? currentStore.pengajuan : (Array.isArray(currentStore.pengajuanList) ? currentStore.pengajuanList : []);
        let cleanPengajuan = rawList;
        if (currentStore.deleted_pengajuan_resis.length > 0) {
            cleanPengajuan = cleanPengajuan.filter(p => p && !currentStore.deleted_pengajuan_resis.includes(String(p.no_resi)));
        }

        currentStore.pengajuan = cleanPengajuan;
        currentStore.pengajuanList = cleanPengajuan;

        return res.status(200).json({
            success: true,
            data: { ...currentStore, pengajuan: cleanPengajuan, pengajuanList: cleanPengajuan },
            aparatur: currentStore.aparatur || [],
            pkk: currentStore.pkk || [],
            berita: currentStore.berita || [],
            sarana: currentStore.sarana || [],
            pengajuan: cleanPengajuan,
            pengajuanList: cleanPengajuan,
            nomor_darurat: currentStore.nomor_darurat || [],
            kontak_rt: currentStore.kontak_rt || [],
            statistik: currentStore.statistik || {},
            info: currentStore.info || {}
        });
    }

    if (req.method === 'POST') {
        const body = req.body || {};

        if (body.deleted_pengajuan_resis && Array.isArray(body.deleted_pengajuan_resis)) {
            currentStore.deleted_pengajuan_resis = Array.from(new Set([...currentStore.deleted_pengajuan_resis, ...body.deleted_pengajuan_resis]));
        }

        if (body.aparatur && Array.isArray(body.aparatur)) currentStore.aparatur = body.aparatur;
        if (body.pkk && Array.isArray(body.pkk)) currentStore.pkk = body.pkk;
        if (body.berita && Array.isArray(body.berita)) currentStore.berita = body.berita;
        if (body.sarana && Array.isArray(body.sarana)) currentStore.sarana = body.sarana;

        const incomingPengajuan = body.pengajuan || body.pengajuanList;
        if (incomingPengajuan && Array.isArray(incomingPengajuan)) {
            const combinedMap = new Map();
            const existingRaw = currentStore.pengajuan || currentStore.pengajuanList || [];
            existingRaw.forEach(p => {
                if (p && p.no_resi) combinedMap.set(p.no_resi, p);
            });
            incomingPengajuan.forEach(p => {
                if (p && p.no_resi) {
                    const existing = combinedMap.get(p.no_resi);
                    if (existing) {
                        const finalNama = (existing.nama_pemohon && existing.nama_pemohon !== 'Pemohon RT/RW') ? existing.nama_pemohon : (p.nama_pemohon || existing.nama_pemohon);
                        combinedMap.set(p.no_resi, { ...existing, ...p, nama_pemohon: finalNama });
                    } else {
                        combinedMap.set(p.no_resi, p);
                    }
                }
            });

            let mergedList = Array.from(combinedMap.values());
            if (currentStore.deleted_pengajuan_resis.length > 0) {
                mergedList = mergedList.filter(p => p && !currentStore.deleted_pengajuan_resis.includes(String(p.no_resi)));
            }
            currentStore.pengajuan = mergedList;
            currentStore.pengajuanList = mergedList;
        }

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
            pengajuan: currentStore.pengajuan || [],
            pengajuanList: currentStore.pengajuanList || []
        });
    }

    return res.status(405).json({ error: 'Method not allowed' });
};
