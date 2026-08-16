let aparaturList = [
    { id: 1, nama: 'Hj. Andi Hasnani, S.Sos', nip: '19700101 199003 2 001', jabatan: 'Lurah Lompoe', foto: null, is_lurah: 1, sambutan: 'Selamat Datang di Website Resmi Kelurahan Lompoe, Kecamatan Bacukiki, Kota Parepare. Website ini hadir sebagai wujud transparansi publik dan kemudahan pelayanan administrasi bagi seluruh warga.', urutan: 1 },
    { id: 2, nama: 'Muhammad Amir, S.STP', nip: '19850512 200801 1 002', jabatan: 'Sekretaris Kelurahan', foto: null, is_lurah: 0, sambutan: '', urutan: 2 },
    { id: 3, nama: 'Siti Rahmah, S.E', nip: '19880920 201101 2 003', jabatan: 'Kasi Pelayanan Umum & Kesejahteraan', foto: null, is_lurah: 0, sambutan: '', urutan: 3 },
    { id: 4, nama: 'Ahmad Fauzi, S.Kom', nip: '19920315 201502 1 004', jabatan: 'Staf Administrasi & IT', foto: null, is_lurah: 0, sambutan: '', urutan: 4 }
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
            nama: body.nama || 'Nama Aparatur',
            nip: body.nip || '-',
            jabatan: body.jabatan || 'Staf',
            foto: body.foto || null,
            is_lurah: body.is_lurah ? 1 : 0,
            sambutan: body.sambutan || '',
            urutan: body.urutan || 5
        };
        aparaturList.push(newItem);
        return res.status(200).json({ success: true, message: 'Data aparatur berhasil disimpan!' });
    }

    if (req.method === 'PUT') {
        const body = req.body || {};
        const { id, nama, nip, jabatan, is_lurah, sambutan } = body;
        const item = aparaturList.find(a => a.id == id);
        if (item) {
            if (nama) item.nama = nama;
            if (nip) item.nip = nip;
            if (jabatan) item.jabatan = jabatan;
            if (is_lurah !== undefined) item.is_lurah = is_lurah;
            if (sambutan !== undefined) item.sambutan = sambutan;
        }
        return res.status(200).json({ success: true, message: 'Data aparatur berhasil diperbarui!' });
    }

    if (req.method === 'DELETE') {
        const urlParts = (req.url || '').split('/');
        const id = urlParts[urlParts.length - 1];
        aparaturList = aparaturList.filter(item => item.id != id);
        return res.status(200).json({ success: true, message: 'Aparatur berhasil dihapus!' });
    }

    return res.status(200).json(aparaturList);
};
