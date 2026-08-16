module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const url = req.url || '';

    if (url.includes('verifikasi-rt')) {
        if (req.method === 'POST') {
            return res.status(200).json({ success: true, message: 'Persetujuan RT/RW berhasil disimpan!' });
        }
        return res.status(200).json({
            success: true,
            data: {
                nama_pemohon: 'Warga Kelurahan Lompoe',
                nik: '7372011205950001',
                rt_rw: 'RW 01 / RT 01',
                jenis_surat: 'Surat Keterangan Usaha (SKU)',
                status_rt: 'Disetujui RT/RW'
            }
        });
    }

    const { username, password } = req.body || {};
    if (username === 'admin' && password === 'admin123') {
        return res.status(200).json({
            success: true,
            message: 'Login Berhasil!',
            user: { username: 'admin', role: 'Administrator Kelurahan Lompoe' }
        });
    }
    return res.status(401).json({ success: false, message: 'Gagal login. Periksa username dan password Anda.' });
};