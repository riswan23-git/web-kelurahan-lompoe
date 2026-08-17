const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const apiDir = path.join(rootDir, 'api');

// 1. Update api/layanan.js PUT handler to store file_hasil_data in memory store
const layananPath = path.join(apiDir, 'layanan.js');
let layananCode = fs.readFileSync(layananPath, 'utf8');

const oldPutBlock = `        if (item) {
            if (body.status_kelurahan) item.status_kelurahan = body.status_kelurahan;
            if (body.status_rt) item.status_rt = body.status_rt;
            if (body.status) item.status = body.status;
            if (body.catatan_admin) item.catatan_admin = body.catatan_admin;
            if (body.file_hasil) item.file_hasil = body.file_hasil;
            else if (body.status === 'Disetujui/Siap Diambil' || body.status === 'Selesai') {
                item.file_hasil = \`Surat_Pengesahan_Lurah_\${item.no_resi}.pdf\`;
            }
        }`;

const newPutBlock = `        if (item) {
            if (body.status_kelurahan) item.status_kelurahan = body.status_kelurahan;
            if (body.status_rt) item.status_rt = body.status_rt;
            if (body.status) item.status = body.status;
            if (body.catatan_admin) item.catatan_admin = body.catatan_admin;
            if (body.file_hasil) item.file_hasil = body.file_hasil;
            if (body.file_hasil_data) item.file_hasil_data = body.file_hasil_data;
            else if (body.status === 'Disetujui/Siap Diambil' || body.status === 'Selesai') {
                item.file_hasil = \`Surat_Pengesahan_Lurah_\${item.no_resi}.pdf\`;
            }
        }`;

if (layananCode.includes(oldPutBlock)) {
    layananCode = layananCode.replace(oldPutBlock, newPutBlock);
    fs.writeFileSync(layananPath, layananCode, 'utf8');
    console.log('Successfully updated api/layanan.js PUT handler!');
}

// 2. Update AdminDashboard.jsx handleSavePengajuan to update localStorage all_pengajuan & file_hasil_b64_
const adminDashPath = path.join(srcDir, 'AdminDashboard.jsx');
let adminDashCode = fs.readFileSync(adminDashPath, 'utf8');

const oldAdminSaveFunc = `      await axios.put(\`\${API_BASE_URL}/api/admin/pengajuan/\${modalUpdate.no_resi}\`, {
        status: statusBaru,
        status_kelurahan: statusBaru,
        catatan_admin: catatanAdmin,
        file_hasil: fileNameToSave,
        file_hasil_data: fileHasilB64
      });

      setPengajuanList(pengajuanList.map(p => p.no_resi === modalUpdate.no_resi ? {
        ...p,
        status: statusBaru,
        status_kelurahan: statusBaru,
        catatan_admin: catatanAdmin,
        file_hasil: fileNameToSave
      } : p));`;

const newAdminSaveFunc = `      await axios.put(\`\${API_BASE_URL}/api/admin/pengajuan/\${modalUpdate.no_resi}\`, {
        status: statusBaru,
        status_kelurahan: statusBaru,
        catatan_admin: catatanAdmin,
        file_hasil: fileNameToSave,
        file_hasil_data: fileHasilB64
      });

      if (fileHasilB64) {
        localStorage.setItem('file_hasil_b64_' + modalUpdate.no_resi, fileHasilB64);
      }

      const updatedListState = pengajuanList.map(p => p.no_resi === modalUpdate.no_resi ? {
        ...p,
        status: statusBaru,
        status_kelurahan: statusBaru,
        catatan_admin: catatanAdmin,
        file_hasil: fileNameToSave,
        file_hasil_data: fileHasilB64 || p.file_hasil_data
      } : p);

      setPengajuanList(updatedListState);
      localStorage.setItem('all_pengajuan', JSON.stringify(updatedListState));`;

if (adminDashCode.includes(oldAdminSaveFunc)) {
    adminDashCode = adminDashCode.replace(oldAdminSaveFunc, newAdminSaveFunc);
    fs.writeFileSync(adminDashPath, adminDashCode, 'utf8');
    console.log('Successfully updated AdminDashboard.jsx handleSavePengajuan persistence!');
}

// 3. Update CekResi.jsx to lookup file_hasil_data from item, localStorage file_hasil_b64_, and all_pengajuan
const cekResiPath = path.join(srcDir, 'CekResi.jsx');
let cekResiCode = fs.readFileSync(cekResiPath, 'utf8');

const oldCekResiDownloadBlock = `                        <button 
                          type="button"
                          onClick={() => {
                            if (hasilResi.file_hasil_data) {
                              const win = window.open();
                              if (hasilResi.file_hasil_data.startsWith('data:image')) {
                                win.document.write(\`<!DOCTYPE html><html><head><title>\${hasilResi.file_hasil || 'Surat_Resmi_Lompoe'}</title></head><body style="margin:0;background:#0f172a;display:flex;flex-direction:column;justify-content:center;align-items:center;min-height:100vh;color:#fff;font-family:sans-serif;"><h2>📄 \${hasilResi.file_hasil || 'Surat Hasil Lurah Lompoe'}</h2><img src="\${hasilResi.file_hasil_data}" style="max-width:95%;max-height:80vh;object-fit:contain;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.5);" /><br><a href="#" onclick="window.print()" style="display:inline-block;margin-top:15px;padding:12px 24px;background:#16a34a;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">🖨️ Cetak / Simpan PDF Surat</a></body></html>\`);
                              } else {
                                win.document.write(\`<!DOCTYPE html><html><head><title>\${hasilResi.file_hasil || 'Surat_Resmi_Lompoe'}</title></head><body style="margin:0;"><iframe src="\${hasilResi.file_hasil_data}" width="100%" height="100%" style="border:none;height:100vh;"></iframe></body></html>\`);
                              }
                            } else {
                              const win = window.open();
                              win.document.write(\`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Surat Resmi Kelurahan Lompoe - \${hasilResi.no_resi}</title>
<style>
body { font-family: 'Times New Roman', serif; margin: 40px; color: #000; line-height: 1.6; }
.header { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; }
.header h3 { margin: 0; font-size: 14pt; font-weight: bold; }
.header h2 { margin: 0; font-size: 16pt; font-weight: bold; }
.title { text-align: center; margin: 20px 0; }
.title h4 { margin: 0; text-decoration: underline; text-transform: uppercase; }
.content { font-size: 12pt; text-align: justify; }
.stamp { border: 2px solid #198754; padding: 12px; display: inline-block; margin-top: 25px; color: #198754; font-weight: bold; border-radius: 6px; }
.signature { float: right; text-align: center; width: 260px; margin-top: 40px; }
</style>
</head>
<body>
<div class="header">
  <h3>PEMERINTAH KOTA PAREPARE</h3>
  <h2>KECAMATAN BACUKIKI - KELURAHAN LOMPOE</h2>
  <p>Alamat: Jl. Poros Lompoe, Kec. Bacukiki, Kota Parepare, Sulsel 91125</p>
</div>
<div class="title">
  <h4>SURAT RESMI TERVERIFIKASI - \${(hasilResi.jenis_surat || 'SURAT KETERANGAN').toUpperCase()}</h4>
  <p>Nomor Naskah: 470 / \${hasilResi.id || '101'} / KL-LMP / VIII / 2026</p>
</div>
<div class="content">
  <p>Yang bertanda tangan di bawah ini Lurah Lompoe, Kecamatan Bacukiki, Kota Parepare, menerangkan bahwa:</p>
  <table style="width:100%;margin:15px 0;font-size:12pt;">
    <tr><td style="width:200px;">Nama Pemohon</td><td>: <b>\${hasilResi.nama_pemohon || hasilResi.nama_lengkap}</b></td></tr>
    <tr><td>NIK</td><td>: \${hasilResi.nik || '-'}</td></tr>
    <tr><td>Tempat/Tgl Lahir</td><td>: \${hasilResi.tempat_tgl_lahir || 'Parepare, 24 April 1995'}</td></tr>
    <tr><td>Jenis Kelamin</td><td>: \${hasilResi.jenis_kelamin || 'Laki-laki'}</td></tr>
    <tr><td>Agama</td><td>: \${hasilResi.agama || 'Islam'}</td></tr>
    <tr><td>Pekerjaan</td><td>: \${hasilResi.pekerjaan || 'Wiraswasta'}</td></tr>
    <tr><td>Alamat</td><td>: \${hasilResi.alamat || 'Jl. Poros Lompoe'}, \${hasilResi.rt_rw || 'RW 01 / RT 01'}</td></tr>
  </table>
  <p>Permohonan <b>\${hasilResi.jenis_surat}</b> untuk keperluan <b>\${hasilResi.keperluan || hasilResi.nama_acara}</b> telah diverifikasi sah dan disetujui secara resmi oleh Lurah Lompoe.</p>
</div>
<div class="stamp">
  ✓ TERVERIFIKASI & DISAHKAN DIGITAL E-SIGN SRIKANDI PAREPARE
</div>
<div class="signature">
  <p>Lompoe, Parepare<br><strong>Lurah Lompoe</strong></p>
  <br><br><br>
  <p><strong><u>ASMIANTI M., SE.</u></strong><br>NIP. 19840927 201001 2 022</p>
</div>
<script>
window.onload = function() { window.print(); };
</script>
</body>
</html>\`);
                            }
                          }}
                          className="btn btn-success btn-lg fw-bold px-5 py-3 rounded-pill shadow"
                        >
                          <i className="bi bi-download me-2"></i> 📥 Download / Cetak Surat Resmi PDF (Hasil TTD Lurah Srikandi)
                        </button>`;

const newCekResiDownloadBlock = `                        <button 
                          type="button"
                          onClick={() => {
                            const localFileB64 = localStorage.getItem('file_hasil_b64_' + hasilResi.no_resi);
                            const localList = JSON.parse(localStorage.getItem('all_pengajuan') || '[]');
                            const matchedItem = localList.find(i => i.no_resi === hasilResi.no_resi);
                            const realPdfB64 = hasilResi.file_hasil_data || localFileB64 || matchedItem?.file_hasil_data;

                            if (realPdfB64) {
                              const win = window.open();
                              if (realPdfB64.startsWith('data:image')) {
                                win.document.write(\`<!DOCTYPE html><html><head><title>\${hasilResi.file_hasil || 'Surat_Srikandi'}</title></head><body style="margin:0;background:#0f172a;display:flex;flex-direction:column;justify-content:center;align-items:center;min-height:100vh;color:#fff;font-family:sans-serif;"><h2>📄 \${hasilResi.file_hasil || 'Surat Hasil Lurah Lompoe'}</h2><img src="\${realPdfB64}" style="max-width:95%;max-height:80vh;object-fit:contain;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.5);" /><br><a href="#" onclick="window.print()" style="display:inline-block;margin-top:15px;padding:12px 24px;background:#16a34a;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">🖨️ Cetak / Simpan PDF Surat Srikandi</a></body></html>\`);
                              } else {
                                win.document.write(\`<!DOCTYPE html><html><head><title>\${hasilResi.file_hasil || 'Surat_Srikandi'}</title></head><body style="margin:0;"><iframe src="\${realPdfB64}" width="100%" height="100%" style="border:none;height:100vh;"></iframe></body></html>\`);
                              }
                            } else {
                              const win = window.open();
                              win.document.write(\`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Surat Resmi Kelurahan Lompoe - \${hasilResi.no_resi}</title>
<style>
body { font-family: 'Times New Roman', serif; margin: 40px; color: #000; line-height: 1.6; }
.header { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; }
.header h3 { margin: 0; font-size: 14pt; font-weight: bold; }
.header h2 { margin: 0; font-size: 16pt; font-weight: bold; }
.title { text-align: center; margin: 20px 0; }
.title h4 { margin: 0; text-decoration: underline; text-transform: uppercase; }
.content { font-size: 12pt; text-align: justify; }
.stamp { border: 2px solid #198754; padding: 12px; display: inline-block; margin-top: 25px; color: #198754; font-weight: bold; border-radius: 6px; }
.signature { float: right; text-align: center; width: 260px; margin-top: 40px; }
</style>
</head>
<body>
<div class="header">
  <h3>PEMERINTAH KOTA PAREPARE</h3>
  <h2>KECAMATAN BACUKIKI - KELURAHAN LOMPOE</h2>
  <p>Alamat: Jl. Poros Lompoe, Kec. Bacukiki, Kota Parepare, Sulsel 91125</p>
</div>
<div class="title">
  <h4>SURAT RESMI TERVERIFIKASI - \${(hasilResi.jenis_surat || 'SURAT KETERANGAN').toUpperCase()}</h4>
  <p>Nomor Naskah: 470 / \${hasilResi.id || '101'} / KL-LMP / VIII / 2026</p>
</div>
<div class="content">
  <p>Yang bertanda tangan di bawah ini Lurah Lompoe, Kecamatan Bacukiki, Kota Parepare, menerangkan bahwa:</p>
  <table style="width:100%;margin:15px 0;font-size:12pt;">
    <tr><td style="width:200px;">Nama Pemohon</td><td>: <b>\${hasilResi.nama_pemohon || hasilResi.nama_lengkap}</b></td></tr>
    <tr><td>NIK</td><td>: \${hasilResi.nik || '-'}</td></tr>
    <tr><td>Tempat/Tgl Lahir</td><td>: \${hasilResi.tempat_tgl_lahir || 'Parepare, 24 April 1995'}</td></tr>
    <tr><td>Jenis Kelamin</td><td>: \${hasilResi.jenis_kelamin || 'Laki-laki'}</td></tr>
    <tr><td>Agama</td><td>: \${hasilResi.agama || 'Islam'}</td></tr>
    <tr><td>Pekerjaan</td><td>: \${hasilResi.pekerjaan || 'Wiraswasta'}</td></tr>
    <tr><td>Alamat</td><td>: \${hasilResi.alamat || 'Jl. Poros Lompoe'}, \${hasilResi.rt_rw || 'RW 01 / RT 01'}</td></tr>
  </table>
  <p>Permohonan <b>\${hasilResi.jenis_surat}</b> untuk keperluan <b>\${hasilResi.keperluan || hasilResi.nama_acara}</b> telah diverifikasi sah dan disetujui secara resmi oleh Lurah Lompoe.</p>
</div>
<div class="stamp">
  ✓ TERVERIFIKASI & DISAHKAN DIGITAL E-SIGN SRIKANDI PAREPARE
</div>
<div class="signature">
  <p>Lompoe, Parepare<br><strong>Lurah Lompoe</strong></p>
  <br><br><br>
  <p><strong><u>ASMIANTI M., SE.</u></strong><br>NIP. 19840927 201001 2 022</p>
</div>
<script>
window.onload = function() { window.print(); };
</script>
</body>
</html>\`);
                            }
                          }}
                          className="btn btn-success btn-lg fw-bold px-5 py-3 rounded-pill shadow"
                        >
                          <i className="bi bi-download me-2"></i> 📥 Download / Cetak Surat Resmi PDF (Hasil TTD Lurah Srikandi)
                        </button>`;

if (cekResiCode.includes(oldCekResiDownloadBlock)) {
    cekResiCode = cekResiCode.replace(oldCekResiDownloadBlock, newCekResiDownloadBlock);
    fs.writeFileSync(cekResiPath, cekResiCode, 'utf8');
    console.log('Successfully updated CekResi.jsx exact file_hasil_data lookup!');
}
