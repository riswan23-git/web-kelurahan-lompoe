let pengajuanList = [
    {
        id: 1,
        no_resi: 'LMP-102938',
        nomor_resi: 'LMP-102938',
        nama_pemohon: 'Andi M. Fajar',
        nama_lengkap: 'Andi M. Fajar',
        nik: '7372011205950001',
        jenis_surat: 'Surat Keterangan Usaha (SKU)',
        rt_rw: 'RW 01 / RT 02',
        telepon: '081234567890',
        nomor_wa: '081234567890',
        keperluan: 'Persyaratan Pengajuan KUR Bank Dahulu',
        status_rt: 'Disetujui RT/RW',
        status_kelurahan: 'Progres',
        status: 'Progres',
        token_rt: 'tok_rt_102938',
        tgl_pengajuan: '2026-08-16',
        tanggal: '2026-08-16'
    }
];

let chatMessages = [
    { id: 1, sender: 'Warga', message: 'Halo admin, mau tanya jam operasional loket?', time: '09:00' },
    { id: 2, sender: 'Staf Kelurahan', message: 'Halo! Jam pelayanan loket kami dari pukul 08.00 - 16.00 WITA.', time: '09:02' }
];

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const url = req.url || '';

    // 1. CEK RESI
    if (url.includes('cek-resi')) {
        const urlParts = url.split('/');
        const noResi = urlParts[urlParts.length - 1];
        const found = pengajuanList.find(p => p.no_resi == noResi || p.nomor_resi == noResi);
        if (found) return res.status(200).json(found);
        return res.status(200).json({
            id: 1,
            no_resi: noResi || 'LMP-102938',
            nomor_resi: noResi || 'LMP-102938',
            nama_pemohon: 'Pemohon Resi Lompoe',
            nik: '7372011205950001',
            jenis_surat: 'Surat Keterangan Usaha (SKU)',
            rt_rw: 'RW 01 / RT 02',
            telepon: '081234567890',
            status_rt: 'Disetujui RT/RW',
            status_kelurahan: 'Disetujui Lurah (Selesai)',
            status: 'Disetujui Lurah (Selesai)',
            catatan_admin: 'Surat telah selesai diproses dan siap diunduh.',
            tgl_pengajuan: new Date().toISOString().split('T')[0]
        });
    }

    // 2. CHAT
    if (url.includes('chat')) {
        if (req.method === 'POST') {
            const body = req.body || {};
            const newMessage = {
                id: Date.now(),
                sender: body.sender || 'Warga',
                message: body.message || body.pesan || '',
                time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            };
            chatMessages.push(newMessage);
            return res.status(200).json({ success: true, message: 'Pesan berhasil terkirim!', data: newMessage });
        }
        return res.status(200).json(chatMessages);
    }

    // 3. PENGAJUAN SURAT
    if (req.method === 'POST') {
        const body = req.body || {};
        const resi = 'LMP-' + Math.floor(100000 + Math.random() * 900000);
        const tokenRt = 'tok_rt_' + Math.floor(100000 + Math.random() * 900000);
        const newItem = {
            id: Date.now(),
            no_resi: resi,
            nomor_resi: resi,
            nama_pemohon: body.nama_pemohon || body.nama_lengkap || body.nama || 'Warga Lompoe',
            nama_lengkap: body.nama_pemohon || body.nama_lengkap || body.nama || 'Warga Lompoe',
            nik: body.nik || '7372011205950001',
            jenis_surat: body.jenis_surat || 'Surat Keterangan',
            rt_rw: body.rt_rw || 'RW 01 / RT 01',
            telepon: body.telepon || body.nomor_wa || '081234567890',
            nomor_wa: body.telepon || body.nomor_wa || '081234567890',
            keperluan: body.keperluan || 'Pengurusan Administrasi',
            status_rt: 'Disetujui RT/RW',
            status_kelurahan: 'Progres',
            status: 'Progres',
            token_rt: tokenRt,
            tgl_pengajuan: new Date().toISOString().split('T')[0],
            tanggal: new Date().toISOString().split('T')[0]
        };
        pengajuanList.unshift(newItem);
        return res.status(200).json({
            success: true,
            message: 'Pengajuan surat berhasil dikirim! Silakan catat nomor resi Anda.',
            no_resi: resi,
            nomor_resi: resi,
            token_rt: tokenRt,
            status_rt: 'Disetujui RT/RW'
        });
    }

    if (req.method === 'PUT') {
        const urlParts = url.split('/');
        const resiFromUrl = urlParts[urlParts.length - 1];
        const body = req.body || {};
        const item = pengajuanList.find(p => p.no_resi == resiFromUrl || p.id == body.id);
        if (item) {
            if (body.status_kelurahan) item.status_kelurahan = body.status_kelurahan;
            if (body.status_rt) item.status_rt = body.status_rt;
            if (body.status) item.status = body.status;
            if (body.catatan_admin) item.catatan_admin = body.catatan_admin;
        }
        return res.status(200).json({ success: true, message: 'Status pengajuan berhasil diperbarui!' });
    }

    if (req.method === 'DELETE') {
        const urlParts = url.split('/');
        const resiFromUrl = urlParts[urlParts.length - 1];
        pengajuanList = pengajuanList.filter(p => p.no_resi != resiFromUrl && p.id != resiFromUrl);
        return res.status(200).json({ success: true, message: 'Pengajuan berhasil dihapus!' });
    }

    return res.status(200).json(pengajuanList);
};