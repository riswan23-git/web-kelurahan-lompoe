let kontakList = [
    { id: 1, nama_rt_rw: 'Ketua RW 01', nama_pejabat: 'Bpk. H. Ahmad', nomor_wa: '081234567890' },
    { id: 2, nama_rt_rw: 'Ketua RW 02', nama_pejabat: 'Bpk. Syafruddin', nomor_wa: '081298765432' }
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
            nama_rt_rw: body.nama_rt_rw || 'Ketua RT/RW',
            nama_pejabat: body.nama_pejabat || '-',
            nomor_wa: body.nomor_wa || '-'
        };
        kontakList.push(newItem);
        return res.status(200).json({ success: true, message: 'Kontak RT/RW berhasil disimpan!' });
    }

    if (req.method === 'DELETE') {
        const urlParts = (req.url || '').split('/');
        const id = urlParts[urlParts.length - 1];
        kontakList = kontakList.filter(item => item.id != id);
        return res.status(200).json({ success: true, message: 'Kontak RT/RW berhasil dihapus!' });
    }

    return res.status(200).json(kontakList);
};
