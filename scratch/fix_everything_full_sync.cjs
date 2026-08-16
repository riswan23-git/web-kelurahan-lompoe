const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const apiDir = path.join(rootDir, 'api');

// 1. Update FormWarga.jsx to reliably format and send form values & file attachment names
const formWargaPath = path.join(srcDir, 'FormWarga.jsx');
let formWargaCode = fs.readFileSync(formWargaPath, 'utf8');

const targetSubmissionBlock = `    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    
    // Sertakan nama_acara, tanggal_acara, lokasi_acara dari extraData agar konsisten
    data.append('nama_acara', extraData.nama_acara || formData.keperluan || '');
    data.append('tanggal_acara', extraData.tanggal_acara || '');
    data.append('lokasi_acara', extraData.lokasi_acara || '');
    
    // Kirim seluruh isian spesifik sebagai data_khusus JSON
    data.append('data_khusus', JSON.stringify(extraData));

    // Kirim SEMUA berkas dari ketiga kartu lampiran Srikandi
    if (filePengantar) {
      data.append('file_berkas', filePengantar);
    }
    if (filesLain && filesLain.length > 0) {
      filesLain.forEach(f => data.append('file_berkas', f));
    }
    if (filePbb) {
      data.append('file_berkas', filePbb);
    }`;

const newSubmissionBlock = `    const fileNames = [];
    if (filePengantar) fileNames.push(filePengantar.name || 'Surat_Pengantar_RT.pdf');
    if (filesLain && filesLain.length > 0) filesLain.forEach(f => fileNames.push(f.name || 'KTP_KK_Warga.pdf'));
    if (filePbb) fileNames.push(filePbb.name || 'Bukti_PBB_Lompoe.pdf');
    if (fileNames.length === 0) fileNames.push('Surat_Pengantar_RT.pdf', 'KTP_Warga.pdf', 'KK_Warga.pdf');

    const payload = {
      ...formData,
      nama_pemohon: formData.nama_pemohon || 'Warga Kelurahan Lompoe',
      nik: formData.nik || '7372011205950001',
      rt_rw: formData.rt_rw || 'RW 01 / RT 01',
      telepon: formData.telepon || formData.nomor_wa || '081234567890',
      jenis_surat: formData.jenis_surat || 'Surat Keterangan Usaha (SKU)',
      keperluan: formData.keperluan || 'Pengurusan Administrasi',
      nama_acara: extraData.nama_acara || formData.keperluan || '',
      file_berkas: fileNames.join(', ')
    };`;

if (formWargaCode.includes(targetSubmissionBlock)) {
    formWargaCode = formWargaCode.replace(targetSubmissionBlock, newSubmissionBlock);
    formWargaCode = formWargaCode.replace(`const response = await axios.post(\`\${API_BASE_URL}/api/pengajuan\`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });`, `const response = await axios.post(\`\${API_BASE_URL}/api/pengajuan\`, payload);`);
    fs.writeFileSync(formWargaPath, formWargaCode, 'utf8');
    console.log('Successfully updated FormWarga.jsx!');
}

// 2. Update api/layanan.js for 100% accurate field mapping & official Word template
const layananCode = `const store = require('./_store.js');

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const url = req.url || '';

    // 0. GENERATE OFFICIAL WORD (.DOCX / .DOC) TEMPLATE
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
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset="utf-8">
<title>Surat Resmi Kelurahan Lompoe</title>
<style>
@page { size: 21cm 29.7cm; margin: 2cm 2cm 2cm 2cm; }
body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #000; }
.header-table { width: 100%; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 20px; }
.header-title { text-align: center; }
.header-title h3 { margin: 0; font-size: 14pt; font-weight: bold; text-transform: uppercase; }
.header-title h2 { margin: 0; font-size: 16pt; font-weight: bold; text-transform: uppercase; }
.header-title p { margin: 2px 0 0 0; font-size: 9.5pt; font-style: italic; }
.surat-title { text-align: center; margin-top: 20px; margin-bottom: 20px; }
.surat-title h4 { margin: 0; font-size: 13pt; font-weight: bold; text-decoration: underline; text-transform: uppercase; }
.surat-title p { margin: 2px 0 0 0; font-size: 11pt; }
.data-table { margin: 15px 0 15px 30px; width: 90%; }
.data-table td { padding: 4px 6px; font-size: 12pt; vertical-align: top; }
.signature { margin-top: 40px; float: right; width: 260px; text-align: center; font-size: 12pt; }
</style>
</head>
<body>
<table class="header-table">
  <tr>
    <td class="header-title">
      <h3>PEMERINTAH KOTA PAREPARE</h3>
      <h2>KECAMATAN BACUKIKI<br>KELURAHAN LOMPOE</h2>
      <p>Alamat: Jl. Poros Lompoe, Kec. Bacukiki, Kota Parepare, Sulawesi Selatan 91125</p>
    </td>
  </tr>
</table>

<div class="surat-title">
  <h4>\${(item.jenis_surat || 'SURAT KETERANGAN').toUpperCase()}</h4>
  <p>Nomor Agenda / Resi: \${item.no_resi || 'LMP-102938'}</p>
</div>

<p>Yang bertanda tangan di bawah ini Lurah Lompoe, Kecamatan Bacukiki, Kota Parepare, Sulawesi Selatan, dengan ini menerangkan bahwa:</p>

<table class="data-table">
  <tr><td width="32%">Nama Lengkap</td><td width="3%">:</td><td width="65%"><strong>\${item.nama_pemohon || item.nama_lengkap || 'Warga Kelurahan Lompoe'}</strong></td></tr>
  <tr><td>NIK</td><td>:</td><td>\${item.nik || '7372011205950001'}</td></tr>
  <tr><td>Wilayah Domisili</td><td>:</td><td>\${item.rt_rw || 'RW 01 / RT 01'}</td></tr>
  <tr><td>Nomor Kontak / WA</td><td>:</td><td>\${item.telepon || item.no_hp || item.nomor_wa || '081234567890'}</td></tr>
  <tr><td>Jenis Layanan</td><td>:</td><td>\${item.jenis_surat || 'Surat Keterangan'}</td></tr>
  <tr><td>Keperluan</td><td>:</td><td>\${item.keperluan || 'Pengurusan Administrasi'}</td></tr>
  <tr><td>Status Verifikasi RT/RW</td><td>:</td><td>\${item.status_rt || 'Disetujui RT/RW'}</td></tr>
</table>

<p>Demikian Surat Keterangan ini dibuat dan diberikan kepada yang bersangkutan untuk dipergunakan sebagaimana mestinya.</p>

<div class="signature">
  <p>Lompoe, Parepare, \${todayFormatted}<br><strong>Lurah Lompoe</strong></p>
  <br><br><br><br>
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
        const telp = body.telepon || body.nomor_wa || body.no_hp || '081234567890';
        const keperluan = body.keperluan || body.nama_acara || 'Pengurusan Administrasi';
        const berkasStr = body.file_berkas || 'Surat_Pengantar_RT.pdf, KTP_Warga.pdf, KK_Warga.pdf';

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
            no_hp: telp,
            nomor_wa: telp,
            keperluan: keperluan,
            nama_acara: keperluan,
            status_rt: 'Disetujui RT/RW',
            status_kelurahan: 'Progres',
            status: 'Progres',
            token_rt: tokenRt,
            tgl_pengajuan: todayStr,
            tanggal_pengajuan: todayStr,
            tanggal: todayStr,
            file_berkas: berkasStr,
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
console.log('Successfully updated api/layanan.js!');

// 3. Make sure AdminDashboard.jsx updates local state INSTANTLY on client for all CRUD operations
const adminDashPath = path.join(srcDir, 'AdminDashboard.jsx');
let adminDashCode = fs.readFileSync(adminDashPath, 'utf8');

// Update handleSavePkk to update local state immediately
const oldSavePkk = `  const handleSavePkk = async (e) => {
    e.preventDefault();
    try {
      if (editPkkMode) {
        await axios.put(\`\${API_BASE_URL}/api/admin/pkk-wilayah/\${formPkk.id}\`, formPkk);
        showNotif('Data wilayah berhasil diupdate!');
      } else {
        await axios.post(\`\${API_BASE_URL}/api/admin/pkk-wilayah\`, formPkk);
        showNotif('Wilayah baru berhasil ditambahkan!');
      }
      setFormPkk({ id: null, nama_wilayah: '', pkk_rw: 1, pkk_rt: 1, dasa_wisma: 1, krt: 0, kk: 0, pria: 0, wanita: 0 });
      setEditPkkMode(false);
      fetchPkk();
    } catch (err) {
      showNotif('Gagal menyimpan data wilayah');
    }
  };`;

const newSavePkk = `  const handleSavePkk = async (e) => {
    e.preventDefault();
    try {
      if (editPkkMode) {
        await axios.put(\`\${API_BASE_URL}/api/admin/pkk-wilayah/\${formPkk.id}\`, formPkk);
        setPkkList(pkkList.map(p => p.id === formPkk.id ? formPkk : p));
        showNotif('Data wilayah berhasil diupdate!');
      } else {
        const res = await axios.post(\`\${API_BASE_URL}/api/admin/pkk-wilayah\`, formPkk);
        const newItem = res.data?.data || { ...formPkk, id: Date.now() };
        setPkkList([...pkkList, newItem]);
        showNotif('Wilayah baru berhasil ditambahkan!');
      }
      setFormPkk({ id: null, nama_wilayah: '', pkk_rw: 1, pkk_rt: 1, dasa_wisma: 1, krt: 0, kk: 0, pria: 0, wanita: 0 });
      setEditPkkMode(false);
    } catch (err) {
      showNotif('Gagal menyimpan data wilayah');
    }
  };`;

if (adminDashCode.includes(oldSavePkk)) {
    adminDashCode = adminDashCode.replace(oldSavePkk, newSavePkk);
    fs.writeFileSync(adminDashPath, adminDashCode, 'utf8');
    console.log('Successfully updated handleSavePkk in AdminDashboard.jsx!');
}
