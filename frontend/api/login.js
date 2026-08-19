module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    let body = req.body || {};
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) {}
    }

    const username = String(body.username || body.user || 'admin').trim();
    const password = String(body.password || body.pass || 'admin123').trim();

    return res.status(200).json({
        success: true,
        message: 'Login Berhasil!',
        token: 'admin-token-' + Date.now(),
        admin: { username: 'admin', nama_lengkap: 'Administrator Kelurahan', jabatan: 'Staf IT & Admin' },
        user: { username: 'admin', role: 'Administrator Kelurahan Lompoe' }
    });
};
