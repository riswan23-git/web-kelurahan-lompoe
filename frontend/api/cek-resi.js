export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const urlParts = (req.url || '').split('/');
    const noResi = urlParts[urlParts.length - 1];

    const mockItem = {
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
    };

    return res.status(200).json(mockItem);
};
