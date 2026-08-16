let statistikData = { id: 1, total_pria: 6285, total_wanita: 6185, total_kk: 3772, total_rt: 26, total_rw: 10, luas_wilayah: '30.9 Ha' };

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'POST' || req.method === 'PUT') {
        const body = req.body || {};
        Object.assign(statistikData, body);
        return res.status(200).json({ success: true, message: 'Statistik berhasil diperbarui!' });
    }

    return res.status(200).json(statistikData);
};
