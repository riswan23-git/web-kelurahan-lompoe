let saranaList = [
    { id: 1, nama_sarana: 'Kantor Kelurahan Lompoe', kategori: 'Pemerintahan', lokasi: 'Jl. Poros Lompoe', deskripsi: 'Pusat pelayanan administrasi publik dan pelayanan masyarakat.', foto: null },
    { id: 2, nama_sarana: 'Puskesmas Pembantu Bacukiki', kategori: 'Kesehatan', lokasi: 'Lompoe', deskripsi: 'Fasilitas pelayanan kesehatan dasar bagi warga.', foto: null }
];

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'POST') {
        const body = req.body || {};
        const newItem = {
            id: Date.now(),
            nama_sarana: body.nama_sarana || 'Sarana Baru',
            kategori: body.kategori || 'Umum',
            lokasi: body.lokasi || 'Lompoe',
            deskripsi: body.deskripsi || '',
            foto: null
        };
        saranaList.push(newItem);
        return res.status(200).json({ success: true, message: 'Sarana prasarana berhasil disimpan!' });
    }

    if (req.method === 'PUT') {
        const body = req.body || {};
        const urlParts = (req.url || '').split('/');
        const id = urlParts[urlParts.length - 1];
        const item = saranaList.find(s => s.id == id || s.id == body.id);
        if (item) Object.assign(item, body);
        return res.status(200).json({ success: true, message: 'Sarana prasarana berhasil diperbarui!' });
    }

    if (req.method === 'DELETE') {
        const urlParts = (req.url || '').split('/');
        const id = urlParts[urlParts.length - 1];
        saranaList = saranaList.filter(s => s.id != id);
        return res.status(200).json({ success: true, message: 'Sarana prasarana berhasil dihapus!' });
    }

    return res.status(200).json(saranaList);
};
