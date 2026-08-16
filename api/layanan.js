const store = require('./_store.js');

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
        const found = store.pengajuanList.find(p => p.no_resi == noResi || p.nomor_resi == noResi);
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
            store.chatMessages.push(newMessage);
            return res.status(200).json({ success: true, message: 'Pesan berhasil terkirim!', data: newMessage });
        }
        return res.status(200).json(store.chatMessages);
    }

    // 3. PENGAJUAN SURAT (GET / POST / PUT / DELETE)
    if (req.method === 'POST') {
        const body = req.body || {};
        const resi = 'LMP-' + Math.floor(100000 + Math.random() * 900000);
        const tokenRt = 'tok_rt_' + Math.floor(100000 + Math.random() * 900000);
        const todayStr = new Date().toISOString().split('T')[0];
        
        const namaPemohon = body.nama_pemohon || body.nama_lengkap || body.nama || 'Warga Kelurahan Lompoe';
        const nikPemohon = body.nik || '7372011205950001';
        const jenisSurat = body.jenis_surat || 'Surat Keterangan Usaha (SKU)';
        const rtRw = body.rt_rw || 'RW 01 / RT 01';
        const telp = body.telepon || body.nomor_wa || '081234567890';
        const keperluan = body.keperluan || 'Pengurusan Administrasi';
        const berkasStr = body.file_berkas ? (typeof body.file_berkas === 'string' ? body.file_berkas : 'Dokumen_Lampiran_Warga.pdf') : 'KTP_KK_Pengantar_RT.pdf';

        const newItem = {
            id: Date.now(),
            no_resi: resi,
            nomor_resi: resi,
            nama_pemohon: namaPemohon,
            nama_lengkap: namaPemohon,
            nik: nikPemohon,
            jenis_surat: jenisSurat,
            rt_rw: rtRw,
            telepon: telp,
            nomor_wa: telp,
            keperluan: keperluan,
            status_rt: 'Disetujui RT/RW',
            status_kelurahan: 'Progres',
            status: 'Progres',
            token_rt: tokenRt,
            tgl_pengajuan: todayStr,
            tanggal: todayStr,
            berkas_warga: berkasStr
        };

        store.pengajuanList.unshift(newItem);

        return res.status(200).json({
            success: true,
            message: 'Pengajuan surat berhasil dikirim! Silakan catat nomor resi Anda.',
            no_resi: resi,
            nomor_resi: resi,
            token_rt: tokenRt,
            status_rt: 'Disetujui RT/RW',
            data: newItem
        });
    }

    if (req.method === 'PUT') {
        const urlParts = url.split('/');
        const resiFromUrl = urlParts[urlParts.length - 1];
        const body = req.body || {};
        const item = store.pengajuanList.find(p => p.no_resi == resiFromUrl || p.id == body.id || p.id == resiFromUrl);
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
        store.pengajuanList = store.pengajuanList.filter(p => p.no_resi != resiFromUrl && p.id != resiFromUrl);
        return res.status(200).json({ success: true, message: 'Pengajuan berhasil dihapus!' });
    }

    return res.status(200).json(store.pengajuanList);
};