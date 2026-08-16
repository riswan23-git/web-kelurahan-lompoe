let beritaList = [
    { id: 1, judul: 'Kegiatan Penguatan Ketahanan Pangan & Gotong Royong Warga Lompoe', ringkasan: 'Warga Kelurahan Lompoe bersama aparatur kelurahan dan TP PKK melaksanakan kegiatan kebersihan lingkungan dan penanaman bibit tanaman pangan.', isi: 'Kegiatan gotong royong rutin dilaksanakan di seluruh wilayah RW Kelurahan Lompoe untuk menjaga kebersihan dan kekeluargaan antar warga.', tanggal: '2026-08-10', gambar: null }
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
            judul: body.judul || 'Berita Kelurahan Baru',
            ringkasan: body.ringkasan || '',
            isi: body.isi || '',
            tanggal: new Date().toISOString().split('T')[0],
            gambar: null
        };
        beritaList.unshift(newItem);
        return res.status(200).json({ success: true, message: 'Berita berhasil disimpan!' });
    }

    if (req.method === 'PUT') {
        const body = req.body || {};
        const urlParts = (req.url || '').split('/');
        const id = urlParts[urlParts.length - 1];
        const item = beritaList.find(b => b.id == id || b.id == body.id);
        if (item) Object.assign(item, body);
        return res.status(200).json({ success: true, message: 'Berita berhasil diperbarui!' });
    }

    if (req.method === 'DELETE') {
        const urlParts = (req.url || '').split('/');
        const id = urlParts[urlParts.length - 1];
        beritaList = beritaList.filter(b => b.id != id);
        return res.status(200).json({ success: true, message: 'Berita berhasil dihapus!' });
    }

    return res.status(200).json(beritaList);
};
