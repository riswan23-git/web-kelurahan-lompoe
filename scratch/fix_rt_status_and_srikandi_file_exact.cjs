const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const apiDir = path.join(rootDir, 'api');

// 1. Update api/layanan.js:
// - Fix default fallback in cek-resi to return Pending, NOT approved
// - Fix status_rt in POST /api/pengajuan to set 'Menunggu Verifikasi RT/RW' for digital, NOT approved
const layananPath = path.join(apiDir, 'layanan.js');
let layananCode = fs.readFileSync(layananPath, 'utf8');

const oldCekResiFallback = `        return res.status(200).json({
            id: 1,
            no_resi: noResi || 'LMP-102938',
            nomor_resi: noResi || 'LMP-102938',
            nama_pemohon: 'Pemohon Resi Lompoe',
            nik: '7372011205950001',
            jenis_surat: 'Surat Keterangan Usaha (SKU)',
            rt_rw: 'RW 01 / RT 02',
            telepon: '081234567890',
            no_hp: '081234567890',
            status_rt: 'Disetujui RT/RW',
            status_kelurahan: 'Disetujui/Siap Diambil',
            status: 'Disetujui/Siap Diambil',
            catatan_admin: 'Surat telah selesai diproses dan siap diunduh.',
            file_hasil: \`Surat_Pengesahan_Lurah_\${noResi || 'LMP-102938'}.pdf\`,
            tgl_pengajuan: new Date().toISOString().split('T')[0]
        });`;

const newCekResiFallback = `        return res.status(200).json({
            id: Date.now(),
            no_resi: noResi || 'LMP-102938',
            nomor_resi: noResi || 'LMP-102938',
            nama_pemohon: 'Pemohon Resi Lompoe',
            nik: '7372011205950001',
            jenis_surat: 'Surat Pengajuan Warga',
            rt_rw: 'RW 01 / RT 01',
            telepon: '081234567890',
            no_hp: '081234567890',
            status_rt: 'Menunggu Verifikasi RT/RW',
            status_kelurahan: 'Pending',
            status: 'Pending',
            catatan_admin: 'Pengajuan Anda sedang ditinjau oleh Staf Kelurahan & Ketua RT/RW.',
            tgl_pengajuan: new Date().toISOString().split('T')[0]
        });`;

if (layananCode.includes(oldCekResiFallback)) {
    layananCode = layananCode.replace(oldCekResiFallback, newCekResiFallback);
}

const oldPostNewItem = `            status_rt: 'Disetujui RT/RW',
            status_kelurahan: 'Progres',
            status: 'Progres',`;

const newPostNewItem = `            status_rt: body.opsi_persetujuan_rt === 'upload' ? 'Disetujui Manual (Surat Pengantar RT)' : 'Menunggu Verifikasi RT/RW',
            status_kelurahan: 'Pending',
            status: 'Pending',`;

if (layananCode.includes(oldPostNewItem)) {
    layananCode = layananCode.replace(oldPostNewItem, newPostNewItem);
}

fs.writeFileSync(layananPath, layananCode, 'utf8');
console.log('Successfully updated api/layanan.js status_rt & fallback!');

// 2. Update AdminDashboard.jsx:
// - Read fileHasil as Base64 on onChange in Kelola Status modal & store in localStorage
// - Fix default status_rt for new items
const adminDashPath = path.join(srcDir, 'AdminDashboard.jsx');
let adminDashCode = fs.readFileSync(adminDashPath, 'utf8');

const oldFileInputBlock = `<input type="file" className="form-control" accept="image/*,.pdf,.docx" onChange={(e) => setFileHasil(e.target.files[0])} />`;

const newFileInputBlock = `<input 
                      type="file" 
                      className="form-control border-success" 
                      accept="image/*,.pdf,.docx" 
                      onChange={async (e) => {
                        const f = e.target.files[0];
                        setFileHasil(f);
                        if (f && modalUpdate) {
                          const b64 = await readFileAsBase64(f);
                          if (b64) {
                            localStorage.setItem('file_hasil_b64_' + modalUpdate.no_resi, b64);
                            if (modalUpdate.nama_pemohon) {
                              localStorage.setItem('file_hasil_b64_' + modalUpdate.nama_pemohon.toLowerCase().trim(), b64);
                            }
                          }
                        }
                      }} 
                    />`;

if (adminDashCode.includes(oldFileInputBlock)) {
    adminDashCode = adminDashCode.replace(oldFileInputBlock, newFileInputBlock);
    fs.writeFileSync(adminDashPath, adminDashCode, 'utf8');
    console.log('Successfully updated AdminDashboard.jsx file input onChange persistence!');
}

// 3. Update CekResi.jsx:
// - Check all localStorage keys for file_hasil_b64_
// - If no Srikandi file uploaded by admin, alert citizen gracefully instead of opening HTML template
const cekResiPath = path.join(srcDir, 'CekResi.jsx');
let cekResiCode = fs.readFileSync(cekResiPath, 'utf8');

const oldCekResiDownloadBtn = `                        <button 
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
                                win.document.write(\`<!DOCTYPE html><html><head><title>\${hasilResi.file_hasil || 'Surat_Srikandi'}</title></head><body style="margin:0;"><iframe src="\${hasilResi.file_hasil_data || realPdfB64}" width="100%" height="100%" style="border:none;height:100vh;"></iframe></body></html>\`);
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

const newCekResiDownloadBtn = `                        <button 
                          type="button"
                          onClick={() => {
                            const resiKey = 'file_hasil_b64_' + hasilResi.no_resi;
                            const nameKey = 'file_hasil_b64_' + (hasilResi.nama_pemohon || '').toLowerCase().trim();
                            const localFileB64 = localStorage.getItem(resiKey) || localStorage.getItem(nameKey);
                            const localList = JSON.parse(localStorage.getItem('all_pengajuan') || '[]');
                            const matchedItem = localList.find(i => i.no_resi === hasilResi.no_resi || i.nama_pemohon === hasilResi.nama_pemohon);
                            const realPdfB64 = hasilResi.file_hasil_data || localFileB64 || matchedItem?.file_hasil_data;

                            if (realPdfB64) {
                              const win = window.open();
                              if (realPdfB64.startsWith('data:image')) {
                                win.document.write(\`<!DOCTYPE html><html><head><title>\${hasilResi.file_hasil || 'Surat_Srikandi'}</title></head><body style="margin:0;background:#0f172a;display:flex;flex-direction:column;justify-content:center;align-items:center;min-height:100vh;color:#fff;font-family:sans-serif;"><h2>📄 \${hasilResi.file_hasil || 'Surat Hasil Lurah Lompoe'}</h2><img src="\${realPdfB64}" style="max-width:95%;max-height:80vh;object-fit:contain;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.5);" /><br><a href="#" onclick="window.print()" style="display:inline-block;margin-top:15px;padding:12px 24px;background:#16a34a;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">🖨️ Cetak / Simpan PDF Surat Srikandi</a></body></html>\`);
                              } else {
                                win.document.write(\`<!DOCTYPE html><html><head><title>\${hasilResi.file_hasil || 'Surat_Srikandi'}</title></head><body style="margin:0;"><iframe src="\${realPdfB64}" width="100%" height="100%" style="border:none;height:100vh;"></iframe></body></html>\`);
                              }
                            } else {
                              alert('📌 File PDF Surat Hasil dari aplikasi Srikandi belum diunggah oleh Staf Kelurahan untuk pengajuan ini. Silakan hubungi loket kelurahan atau tunggu status disetujui!');
                            }
                          }}
                          className="btn btn-success btn-lg fw-bold px-5 py-3 rounded-pill shadow"
                        >
                          <i className="bi bi-download me-2"></i> 📥 Download / Cetak Surat Resmi PDF (Hasil TTD Lurah Srikandi)
                        </button>`;

if (cekResiCode.includes(oldCekResiDownloadBtn)) {
    cekResiCode = cekResiCode.replace(oldCekResiDownloadBtn, newCekResiDownloadBtn);
    fs.writeFileSync(cekResiPath, cekResiCode, 'utf8');
    console.log('Successfully updated CekResi.jsx Srikandi file alert & lookup!');
}
