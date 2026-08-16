let nomorDaruratList = [
    { id: 1, nama_instansi: 'Call Center Parepare', nomor_telepon: '112', kategori: '🚨 Darurat', icon: '🚨' },
    { id: 2, nama_instansi: 'Polsek Bacukiki', nomor_telepon: '(0421) 12345', kategori: 'Police', icon: '🚓' },
    { id: 3, nama_instansi: 'Pemadam Kebakaran', nomor_telepon: '113', kategori: 'Fire', icon: '🚒' },
    { id: 4, nama_instansi: 'Puskesmas Bacukiki', nomor_telepon: '(0421) 21118', kategori: 'Health', icon: '🏥' }
];

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'POST') {
        const body = req.body || {};
        const newItem = {
            id: Date.now(),
            nama_instansi: body.nama_instansi || 'Instansi Resmi',
            nomor_telepon: body.nomor_telepon || '-',
            kategori: body.kategori || 'Darurat',
            icon: body.icon || '📞'
        };
        nomorDaruratList.unshift(newItem);
        return res.status(200).json({ success: true, message: 'Nomor darurat berhasil disimpan!' });
    }

    if (req.method === 'DELETE') {
        const urlParts = (req.url || '').split('/');
        const id = urlParts[urlParts.length - 1];
        nomorDaruratList = nomorDaruratList.filter(item => item.id != id);
        return res.status(200).json({ success: true, message: 'Nomor darurat berhasil dihapus!' });
    }

    return res.status(200).json(nomorDaruratList);
};
