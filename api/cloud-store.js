const store = require('./_store.js');
const https = require('https');

// Global memory persistence across lambda container invocations
if (!global.__LOMPOE_CLOUD_STORE__) {
    global.__LOMPOE_CLOUD_STORE__ = store;
}

function updateGithubStoreFile(token, newStoreData) {
    return new Promise((resolve) => {
        const path = 'api/_store.js';
        const repo = 'riswan23-git/web-kelurahan-lompoe';
        const fileContent = `// Global shared memory store for Vercel Serverless Functions\nconst globalStore = global.__LOMPOE_STORE__ || ${JSON.stringify(newStoreData, null, 4)};\n\nmodule.exports = globalStore;\n`;
        const base64Content = Buffer.from(fileContent).toString('base64');

        // First GET current sha
        const getReq = https.request(`https://api.github.com/repos/${repo}/contents/${path}`, {
            method: 'GET',
            headers: {
                'User-Agent': 'LompoeCMS-AutoSync',
                'Authorization': `Bearer ${token}`
            }
        }, (getRes) => {
            let body = '';
            getRes.on('data', c => body += c);
            getRes.on('end', () => {
                let sha = null;
                try {
                    const parsed = JSON.parse(body);
                    sha = parsed.sha;
                } catch (e) {}

                if (!sha) return resolve(false);

                // PUT updated content
                const putPayload = JSON.stringify({
                    message: 'Auto-sync CMS store update via Admin Dashboard',
                    content: base64Content,
                    sha: sha,
                    branch: 'main'
                });

                const putReq = https.request(`https://api.github.com/repos/${repo}/contents/${path}`, {
                    method: 'PUT',
                    headers: {
                        'User-Agent': 'LompoeCMS-AutoSync',
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(putPayload)
                    }
                }, (putRes) => {
                    resolve(putRes.statusCode === 200 || putRes.statusCode === 201);
                });
                putReq.on('error', () => resolve(false));
                putReq.write(putPayload);
                putReq.end();
            });
        });
        getReq.on('error', () => resolve(false));
        getReq.end();
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

    const currentStore = global.__LOMPOE_CLOUD_STORE__;

    if (req.method === 'GET') {
        return res.status(200).json(currentStore);
    }

    if (req.method === 'POST' || req.method === 'PUT') {
        let body = {};
        try {
            if (req.body && typeof req.body === 'object') body = req.body;
            else if (req.body && typeof req.body === 'string') body = JSON.parse(req.body);
        } catch (e) {}

        if (body.aparatur && Array.isArray(body.aparatur)) currentStore.aparatur = body.aparatur;
        if (body.pkk && Array.isArray(body.pkk)) currentStore.pkk = body.pkk;
        if (body.berita && Array.isArray(body.berita)) currentStore.berita = body.berita;
        if (body.sarana && Array.isArray(body.sarana)) currentStore.sarana = body.sarana;
        if (body.pengajuan && Array.isArray(body.pengajuan)) currentStore.pengajuan = body.pengajuan;
        if (body.nomor_darurat && Array.isArray(body.nomor_darurat)) currentStore.nomor_darurat = body.nomor_darurat;
        if (body.kontak_rt && Array.isArray(body.kontak_rt)) currentStore.kontak_rt = body.kontak_rt;
        if (body.statistik) currentStore.statistik = body.statistik;
        if (body.info) currentStore.info = body.info;

        global.__LOMPOE_CLOUD_STORE__ = currentStore;

        const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
        if (githubToken) {
            updateGithubStoreFile(githubToken, currentStore).catch(() => {});
        }

        return res.status(200).json({ success: true, message: 'Cloud store updated successfully!', data: currentStore });
    }

    return res.status(405).json({ error: 'Method not allowed' });
};
