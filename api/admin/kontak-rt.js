let kontakList = [
    { id: 1, rt_rw: 'RW 01 / RT 01', nama_rt_rw: 'Ketua RW 01', nama_ketua: 'Bpk. H. Ahmad', nama_pejabat: 'Bpk. H. Ahmad', no_wa: '081234567890' },
    { id: 2, rt_rw: 'RW 01 / RT 02', nama_rt_rw: 'Ketua RW 02', nama_ketua: 'Bpk. Syafruddin', nama_pejabat: 'Bpk. Syafruddin', no_wa: '081298765432' }
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
            rt_rw: body.rt_rw || body.nama_rt_rw || 'RT 01 / RW 01',
            nama_rt_rw: body.nama_rt_rw || 'Ketua RT/RW',
            nama_ketua: body.nama_ketua || body.nama_pejabat || '-',
            nama_pejabat: body.nama_ketua || body.nama_pejabat || '-',
            no_wa: body.no_wa || body.nomor_wa || '-'
        };
        kontakList.push(newItem);
        return res.status(200).json({ success: true, message: 'Kontak RT/RW berhasil disimpan!' });
    }

    if (req.method === 'PUT') {
        const body = req.body || {};
        const urlParts = (req.url || '').split('/');
        const id = urlParts[urlParts.length - 1];
        const item = kontakList.find(k => k.id == id || k.id == body.id);
        if (item) Object.assign(item, body);
        return res.status(200).json({ success: true, message: 'Kontak RT/RW berhasil diperbarui!' });
    }

    if (req.method === 'DELETE') {
        const urlParts = (req.url || '').split('/');
        const id = urlParts[urlParts.length - 1];
        kontakList = kontakList.filter(k => k.id != id);
        return res.status(200).json({ success: true, message: 'Kontak RT/RW berhasil dihapus!' });
    }

    return res.status(200).json(kontakList);
};
