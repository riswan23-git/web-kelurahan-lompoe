export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { username, password } = req.body || {};
    if (username === 'admin' && (password === 'admin123' || password === 'admin')) {
        return res.status(200).json({ success: true, message: 'Login Berhasil!', admin: { username: 'admin', nama_lengkap: 'Administrator Kelurahan', jabatan: 'Staf IT & Admin' } });
    }
    return res.status(401).json({ success: false, message: 'Gagal login. Periksa username dan password Anda.' });
};
