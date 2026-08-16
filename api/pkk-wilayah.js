let pkkList = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    nama_wilayah: `RW 0${i + 1}`,
    pkk_rw: i + 1,
    pkk_rt: i === 0 ? 3 : i === 1 ? 3 : 2,
    dasa_wisma: 4 + (i % 3),
    krt: 250 + i * 15,
    kk: 300 + i * 20,
    pria: 600 + i * 25,
    wanita: 590 + i * 25
}));

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'POST') {
        const body = req.body || {};
        const newItem = {
            id: Date.now(),
            nama_wilayah: body.nama_wilayah || `RW 0${pkkList.length + 1}`,
            pkk_rw: body.pkk_rw || pkkList.length + 1,
            pkk_rt: body.pkk_rt || 2,
            dasa_wisma: body.dasa_wisma || 5,
            krt: body.krt || 250,
            kk: body.kk || 300,
            pria: body.pria || 600,
            wanita: body.wanita || 600
        };
        pkkList.push(newItem);
        return res.status(200).json({ success: true, message: 'Data wilayah PKK berhasil disimpan!' });
    }

    if (req.method === 'PUT') {
        const body = req.body || {};
        const { id } = body;
        const item = pkkList.find(p => p.id == id);
        if (item) {
            Object.assign(item, body);
        }
        return res.status(200).json({ success: true, message: 'Data wilayah PKK berhasil diperbarui!' });
    }

    if (req.method === 'DELETE') {
        const urlParts = (req.url || '').split('/');
        const id = urlParts[urlParts.length - 1];
        pkkList = pkkList.filter(item => item.id != id);
        return res.status(200).json({ success: true, message: 'Data wilayah PKK berhasil dihapus!' });
    }

    return res.status(200).json(pkkList);
};
