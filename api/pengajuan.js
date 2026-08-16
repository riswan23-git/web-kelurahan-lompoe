let pengajuanList = [];

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'POST') {
        const body = req.body || {};
        const resi = 'LMP-' + Date.now().toString().slice(-6);
        const newItem = {
            id: Date.now(),
            nomor_resi: resi,
            nama_lengkap: body.nama_lengkap || body.nama || 'Warga Lompoe',
            nik: body.nik || '-',
            jenis_surat: body.jenis_surat || 'Surat Keterangan',
            nomor_wa: body.nomor_wa || body.telepon || '-',
            status: 'Progres',
            tanggal: new Date().toISOString().split('T')[0]
        };
        pengajuanList.unshift(newItem);
        return res.status(200).json({
            success: true,
            message: 'Pengajuan surat berhasil dikirim! Silakan catat nomor resi Anda.',
            nomor_resi: resi
        });
    }

    if (req.method === 'PUT') {
        const body = req.body || {};
        const { id, status } = body;
        const item = pengajuanList.find(p => p.id == id);
        if (item) item.status = status || item.status;
        return res.status(200).json({ success: true, message: 'Status pengajuan berhasil diperbarui!' });
    }

    return res.status(200).json(pengajuanList);
};
