export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'POST') {
        return res.status(200).json({ success: true, message: 'Persetujuan RT/RW berhasil disimpan!' });
    }

    return res.status(200).json({
        success: true,
        data: {
            nama_pemohon: 'Warga Kelurahan Lompoe',
            nik: '7372011205950001',
            rt_rw: 'RW 01 / RT 01',
            jenis_surat: 'Surat Keterangan Usaha (SKU)',
            status_rt: 'Menunggu RT/RW'
        }
    });
};
