const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const apiDir = path.join(rootDir, 'api');

// 1. Update vercel.json rewrites so /api/admin/generate-docx maps to /api/layanan
const vercelJsonPath = path.join(rootDir, 'vercel.json');
const vercelConfig = {
  "rewrites": [
    { "source": "/api/admin/generate-docx/:path*", "destination": "/api/layanan" },
    { "source": "/api/admin/generate-docx", "destination": "/api/layanan" },
    { "source": "/api/admin/pengajuan/:path*", "destination": "/api/layanan" },
    { "source": "/api/admin/pengajuan", "destination": "/api/layanan" },
    { "source": "/api/admin/:path*", "destination": "/api/admin-api" },
    { "source": "/api/admin", "destination": "/api/admin-api" },
    { "source": "/api/login", "destination": "/api/auth" },
    { "source": "/api/verifikasi-rt/:path*", "destination": "/api/auth" },
    { "source": "/api/verifikasi-rt", "destination": "/api/auth" },
    { "source": "/api/pengajuan/:path*", "destination": "/api/layanan" },
    { "source": "/api/pengajuan", "destination": "/api/layanan" },
    { "source": "/api/cek-resi/:path*", "destination": "/api/layanan" },
    { "source": "/api/cek-resi", "destination": "/api/layanan" },
    { "source": "/api/chat/:path*", "destination": "/api/layanan" },
    { "source": "/api/chat", "destination": "/api/layanan" },
    { "source": "/api/:path*", "destination": "/api/public" },
    { "source": "/:path*", "destination": "/index.html" }
  ]
};

fs.writeFileSync(vercelJsonPath, JSON.stringify(vercelConfig, null, 2), 'utf8');

// 2. Update api/layanan.js to include word document generator
const layananCode = `const store = require('./_store.js');

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const url = req.url || '';

    // 0. GENERATE WORD (.DOCX / .DOC)
    if (url.includes('generate-docx')) {
        const urlParts = url.split('/');
        const noResi = urlParts[urlParts.length - 1];
        const item = store.pengajuanList.find(p => p.no_resi == noResi || p.nomor_resi == noResi) || {
            no_resi: noResi || 'LMP-102938',
            nama_pemohon: 'Warga Kelurahan Lompoe',
            nik: '7372011205950001',
            jenis_surat: 'Surat Keterangan Usaha (SKU)',
            rt_rw: 'RW 01 / RT 01',
            keperluan: 'Pengurusan Administrasi'
        };

        const todayFormatted = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

        const docHtml = \`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Surat Keterangan Kelurahan Lompoe</title>
<style>
body { font-family: 'Times New Roman', serif; margin: 40px; color: #000; line-height: 1.6; }
.header { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; }
.header h3 { margin: 0; font-size: 16pt; font-weight: bold; text-transform: uppercase; }
.header h2 { margin: 0; font-size: 18pt; font-weight: bold; text-transform: uppercase; }
.header p { margin: 0; font-size: 10pt; font-style: italic; }
.title { text-align: center; margin-top: 20px; margin-bottom: 20px; }
.title h4 { margin: 0; font-size: 14pt; text-decoration: underline; text-transform: uppercase; }
.title p { margin: 0; font-size: 11pt; }
.content { font-size: 12pt; text-align: justify; }
.table-data { margin-left: 30px; margin-top: 15px; margin-bottom: 15px; }
.table-data td { padding: 4px 10px; font-size: 12pt; }
.footer { margin-top: 50px; float: right; width: 250px; text-align: center; font-size: 12pt; }
</style>
</head>
<body>
<div class="header">
  <h3>PEMERINTAH KOTA PAREPARE</h3>
  <h2>KECAMATAN BACUKIKI<br>KELURAHAN LOMPOE</h2>
  <p>Alamat: Jl. Poros Lompoe, Kec. Bacukiki, Kota Parepare, Sulawesi Selatan</p>
</div>
<div class="title">
  <h4>\${(item.jenis_surat || 'SURAT KETERANGAN').toUpperCase()}</h4>
  <p>Nomor Resi / Agenda: \${item.no_resi || 'LMP-102938'}</p>
</div>
<div class="content">
  <p>Yang bertanda tangan di bawah ini Lurah Lompoe, Kecamatan Bacukiki, Kota Parepare, dengan ini menerangkan bahwa:</p>
  <table class="table-data">
    <tr><td>Nama Lengkap</td><td>: <strong>\${item.nama_pemohon || item.nama_lengkap || 'Warga Kelurahan Lompoe'}</strong></td></tr>
    <tr><td>NIK</td><td>: \${item.nik || '7372011205950001'}</td></tr>
    <tr><td>Wilayah Domisili</td><td>: \${item.rt_rw || 'RW 01 / RT 01'}</td></tr>
    <tr><td>Jenis Layanan</td><td>: \${item.jenis_surat || 'Surat Keterangan'}</td></tr>
    <tr><td>Keperluan</td><td>: \${item.keperluan || 'Pengurusan Administrasi'}</td></tr>
    <tr><td>Status RT/RW</td><td>: \${item.status_rt || 'Disetujui RT/RW'}</td></tr>
  </table>
  <p>Demikian Surat Keterangan ini dibuat dan diberikan kepada yang bersangkutan untuk dipergunakan sebagaimana mestinya.</p>
</div>
<div class="footer">
  <p>Parepare, \${todayFormatted}<br><strong>Lurah Lompoe</strong></p>
  <br><br><br>
  <p><strong><u>HJ. ANDI HASNANI, S.Sos</u></strong><br>NIP. 19700101 199003 2 001</p>
</div>
</body>
</html>\`;

        res.setHeader('Content-Type', 'application/msword');
        res.setHeader('Content-Disposition', \`attachment; filename="Surat_Kelurahan_Lompoe_\${noResi}.doc"\`);
        return res.status(200).send(docHtml);
    }

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
};`;

fs.writeFileSync(path.join(apiDir, 'layanan.js'), layananCode, 'utf8');
console.log('Successfully updated Word Generator in api/layanan.js and vercel.json!');
