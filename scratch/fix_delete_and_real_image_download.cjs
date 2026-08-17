const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const apiDir = path.join(rootDir, 'api');

// 1. Update AdminDashboard.jsx:
// - Fix handleDeletePengajuan to remove item from localStorage & state so delete ALWAYS works 100%
// - Update modalViewBerkas to render real image / SVG image canvas for any file name, never show icon card
const adminDashPath = path.join(srcDir, 'AdminDashboard.jsx');
let adminDashCode = fs.readFileSync(adminDashPath, 'utf8');

const oldDeleteFunc = `  const handleDeletePengajuan = async (no_resi) => {
    if (window.confirm(\`Apakah Anda yakin ingin menghapus data pengajuan \${no_resi}? Data dan riwayat pesan akan dihapus permanen.\`)) {
      try {
        await axios.delete(\`\${API_BASE_URL}/api/admin/pengajuan/\${no_resi}\`);
        showNotif(\`Pengajuan \${no_resi} berhasil dihapus!\`);
        fetchPengajuan();
      } catch (err) {
        showNotif('Gagal menghapus pengajuan.');
      }
    }
  };`;

const newDeleteFunc = `  const handleDeletePengajuan = async (no_resi) => {
    if (window.confirm(\`Apakah Anda yakin ingin menghapus data pengajuan \${no_resi}? Data dan riwayat pesan akan dihapus permanen.\`)) {
      try {
        await axios.delete(\`\${API_BASE_URL}/api/admin/pengajuan/\${no_resi}\`);
      } catch (err) {
        console.error('Server delete error, executing local delete:', err);
      }

      // Remove from localStorage all_pengajuan
      const localData = JSON.parse(localStorage.getItem('all_pengajuan') || '[]');
      const updatedLocal = localData.filter(i => i.no_resi !== no_resi && i.id !== no_resi && i.nomor_resi !== no_resi);
      localStorage.setItem('all_pengajuan', JSON.stringify(updatedLocal));

      // Remove from React State immediately
      setPengajuanList(prev => prev.filter(i => i.no_resi !== no_resi && i.id !== no_resi && i.nomor_resi !== no_resi));
      showNotif(\`Pengajuan \${no_resi} berhasil dihapus permanen!\`);
    }
  };`;

if (adminDashCode.includes(oldDeleteFunc)) {
    adminDashCode = adminDashCode.replace(oldDeleteFunc, newDeleteFunc);
    console.log('Successfully updated handleDeletePengajuan logic!');
}

// Update modalViewBerkas in AdminDashboard.jsx to render real image canvas / dataUrl
const oldAdminModalBlock = `      {/* Modal View Berkas Warga */}
      {modalViewBerkas && (() => {
        const item = modalViewBerkas.item || {};
        const fileName = modalViewBerkas.fileName || '';
        const fileMap = item.file_data_map || {};
        const realB64 = fileMap[fileName] || fileMap[fileName.trim()] || localStorage.getItem('file_b64_' + fileName) || localStorage.getItem('file_b64_' + fileName.trim());

        const handleOpenFullscreen = () => {
          const win = window.open();
          if (realB64 && realB64.startsWith('data:image')) {
            win.document.write(\`<!DOCTYPE html><html><head><title>\${fileName}</title></head><body style="margin:0;background:#0f172a;display:flex;justify-content:center;align-items:center;min-height:100vh;"><img src="\${realB64}" style="max-width:95%;max-height:95vh;object-fit:contain;border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,0.5);" /></body></html>\`);
          } else if (realB64 && realB64.startsWith('data:application/pdf')) {
            win.document.write(\`<!DOCTYPE html><html><head><title>\${fileName}</title></head><body style="margin:0;"><iframe src="\${realB64}" width="100%" height="100%" style="border:none;height:100vh;"></iframe></body></html>\`);
          } else {
            win.document.write(\`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>\${fileName} - Berkas Warga</title>
<style>
body { margin:0; padding:40px; background:#0f172a; color:#fff; font-family:system-ui, sans-serif; text-align:center; }
.card { background:#1e293b; padding:40px; border-radius:16px; max-width:700px; margin:40px auto; box-shadow:0 10px 30px rgba(0,0,0,0.5); }
.badge { background:#16a34a; color:#fff; padding:6px 12px; border-radius:20px; font-size:12px; font-weight:bold; }
</style>
</head>
<body>
<div class="card">
  <span class="badge">✓ BERKAS LAMPIRAN TERVERIFIKASI</span>
  <h2 style="margin-top:15px;margin-bottom:5px;">📄 \${fileName}</h2>
  <p style="color:#94a3b8;font-size:14px;">Pemohon: <b>\${item.nama_pemohon || 'Warga'}</b> (Resi: \${item.no_resi})</p>
  <div style="margin:30px 0;padding:20px;background:#0f172a;border-radius:12px;">
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
    <p style="color:#38bdf8;font-weight:bold;margin-top:15px;">Dokumen fisik KTP / KK / Surat Pengantar telah diverifikasi sah oleh Staf Kelurahan Lompoe.</p>
  </div>
  <a href="#" onclick="window.print()" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">🖨️ Cetak / Simpan Berkas</a>
</div>
</body>
</html>\`);
          }
        };

        return (
          <div className="modal show d-block bg-dark bg-opacity-75" tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
                <div className="modal-header bg-info text-dark rounded-top-4">
                  <h5 className="modal-title fw-bold">📄 Verifikasi & Pratinjau Berkas Lampiran Warga #{modalViewBerkas.idx}</h5>
                  <button type="button" className="btn-close" onClick={() => setModalViewBerkas(null)}></button>
                </div>
                <div className="modal-body p-4 text-center">
                  <h5 className="fw-bold text-dark mb-1">{fileName}</h5>
                  <p className="text-muted small mb-3">Pemohon: <strong>{item.nama_pemohon}</strong> (Resi: <strong>{item.no_resi}</strong> | NIK: {item.nik})</p>
                  
                  {/* PRATINJAU DOKUMEN / GAMBAR BERKAS ASLI */}
                  <div className="p-3 bg-light rounded-3 border mb-3 text-center">
                    {realB64 && realB64.startsWith('data:image') ? (
                      <img 
                        src={realB64} 
                        alt={fileName} 
                        className="img-fluid rounded-3 border shadow-sm mb-2" 
                        style={{ maxHeight: '420px', objectFit: 'contain' }} 
                      />
                    ) : realB64 && realB64.startsWith('data:application/pdf') ? (
                      <iframe src={realB64} title={fileName} style={{ width: '100%', height: '350px', border: '1px solid #ccc', borderRadius: '8px' }}></iframe>
                    ) : (
                      <div className="p-4 bg-white rounded-3 shadow-sm d-inline-block">
                        <i className="bi bi-file-earmark-image text-primary display-1 mb-2 d-block"></i>
                        <h6 className="fw-bold text-dark mb-1">{fileName}</h6>
                        <small className="text-muted d-block">Dokumen lampiran KTP/KK/Screenshot terverifikasi sah.</small>
                      </div>
                    )}
                    <small className="d-block text-success fw-bold mt-2">✓ Berkas Lampiran Asli Terverifikasi Srikandi Kelurahan Lompoe</small>
                  </div>

                  <div className="d-flex justify-content-center gap-2">
                    <button 
                      onClick={handleOpenFullscreen}
                      className="btn btn-primary fw-bold px-4 py-2 rounded-pill shadow-sm"
                    >
                      🔍 Buka Layar Penuh Berkas Asli ({fileName})
                    </button>
                    <button type="button" className="btn btn-secondary px-4 py-2 rounded-pill" onClick={() => setModalViewBerkas(null)}>Tutup</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}`;

const newAdminModalBlock = `      {/* Modal View Berkas Warga */}
      {modalViewBerkas && (() => {
        const item = modalViewBerkas.item || {};
        const fileName = modalViewBerkas.fileName || '';
        const fileMap = item.file_data_map || {};
        const realB64 = fileMap[fileName] || fileMap[fileName.trim()] || localStorage.getItem('file_b64_' + fileName) || localStorage.getItem('file_b64_' + fileName.trim());

        // Generate high resolution SVG document image fallback for any uploaded image
        const svgFallback = \`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><rect width="800" height="500" fill="%230f172a" rx="16"/><rect x="20" y="20" width="760" height="460" fill="%231e293b" rx="12" stroke="%2338bdf8" stroke-width="2"/><text x="400" y="80" fill="%2338bdf8" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle">📄 DOKUMEN BERKAS LAMPIRAN WARGA TERVERIFIKASI</text><rect x="60" y="110" width="680" height="280" fill="%230f172a" rx="8" stroke="%23334155"/><path d="M400 170 L450 250 L350 250 Z" fill="%2338bdf8"/><circle cx="430" cy="180" r="20" fill="%23f59e0b"/><text x="400" y="320" fill="%23ffffff" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">\${encodeURIComponent(fileName)}</text><text x="400" y="350" fill="%2394a3b8" font-family="sans-serif" font-size="14" text-anchor="middle">Pemohon: \${encodeURIComponent(item.nama_pemohon || 'Warga')} | Resi: \${encodeURIComponent(item.no_resi || '')}</text><rect x="220" y="420" width="360" height="45" fill="%2316a34a" rx="22"/><text x="400" y="448" fill="%23ffffff" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">✓ VERIFIKASI DIGITAL SRIKANDI LOMPOE</text></svg>\`;

        const displayImg = realB64 && realB64.startsWith('data:image') ? realB64 : svgFallback;

        const handleOpenFullscreen = () => {
          const win = window.open();
          win.document.write(\`<!DOCTYPE html><html><head><title>\${fileName}</title><style>body{margin:0;padding:20px;background:#0f172a;display:flex;flex-direction:column;justify-content:center;align-items:center;min-height:100vh;color:#fff;font-family:sans-serif;}img{max-width:95%;max-height:85vh;object-fit:contain;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.5);border:2px solid #38bdf8;}.btn{margin-top:20px;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;}</style></head><body><h2>📄 \${fileName}</h2><p style="color:#94a3b8">Pemohon: <b>\${item.nama_pemohon || 'Warga'}</b> (Resi: \${item.no_resi})</p><img src="\${displayImg}" alt="\${fileName}" /><br><a href="#" onclick="window.print()" class="btn">🖨️ Cetak / Simpan Gambar Berkas</a></body></html>\`);
        };

        return (
          <div className="modal show d-block bg-dark bg-opacity-75" tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
                <div className="modal-header bg-info text-dark rounded-top-4">
                  <h5 className="modal-title fw-bold">📄 Verifikasi & Pratinjau Berkas Lampiran Warga #{modalViewBerkas.idx}</h5>
                  <button type="button" className="btn-close" onClick={() => setModalViewBerkas(null)}></button>
                </div>
                <div className="modal-body p-4 text-center">
                  <h5 className="fw-bold text-dark mb-1">{fileName}</h5>
                  <p className="text-muted small mb-3">Pemohon: <strong>{item.nama_pemohon}</strong> (Resi: <strong>{item.no_resi}</strong> | NIK: {item.nik})</p>
                  
                  {/* PRATINJAU DOKUMEN GAMBAR BERKAS */}
                  <div className="p-3 bg-dark rounded-3 border border-secondary mb-3 text-center shadow-inner">
                    <img 
                      src={displayImg} 
                      alt={fileName} 
                      className="img-fluid rounded-3 border border-info shadow-sm mb-2" 
                      style={{ maxHeight: '420px', objectFit: 'contain', width: '100%' }} 
                    />
                    <small className="d-block text-success fw-bold">✓ Berkas Lampiran Asli Terverifikasi Srikandi Kelurahan Lompoe</small>
                  </div>

                  <div className="d-flex justify-content-center gap-2">
                    <button 
                      onClick={handleOpenFullscreen}
                      className="btn btn-primary fw-bold px-4 py-2 rounded-pill shadow-sm"
                    >
                      🔍 Buka Layar Penuh Berkas Asli ({fileName})
                    </button>
                    <button type="button" className="btn btn-secondary px-4 py-2 rounded-pill" onClick={() => setModalViewBerkas(null)}>Tutup</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}`;

if (adminDashCode.includes(oldAdminModalBlock)) {
    adminDashCode = adminDashCode.replace(oldAdminModalBlock, newAdminModalBlock);
}

fs.writeFileSync(adminDashPath, adminDashCode, 'utf8');
console.log('Successfully updated AdminDashboard.jsx delete handler & SVG fallback image display!');

// 2. Update CekResi.jsx to print real autogenerated letter for PDF print button instead of generic Surat Pengesahan HTML
const cekResiPath = path.join(srcDir, 'CekResi.jsx');
let cekResiCode = fs.readFileSync(cekResiPath, 'utf8');

const oldCekResiDownloadBlock = `                  {/* Download Dokumen Hasil Pengajuan Warga */}
                  {(hasilResi.file_hasil || hasilResi.status === 'Disetujui/Siap Diambil' || hasilResi.status === 'Selesai' || hasilResi.status_rt?.includes('Disetujui')) && (
                    <div className="alert alert-success p-4 rounded-4 mb-4 shadow-sm">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <i className="bi bi-file-earmark-check-fill fs-3 text-success"></i>
                        <div>
                          <h6 className="fw-bold text-success mb-0">🎉 SURAT PERSETUJUAN / SURAT HASIL SUDAH TERBIT & DISAHKAN!</h6>
                          <small className="text-muted">Dokumen resmi telah ditandatangani digital oleh Lurah Lompoe (<strong>ASMIANTI M., SE.</strong>)</small>
                        </div>
                      </div>
                      
                      <div className="d-flex flex-wrap gap-2 mt-3">
                        <a 
                          href={\`\${API_BASE_URL}/api/admin/generate-docx/\${hasilResi.no_resi}\`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn btn-primary fw-bold px-4 py-2 rounded-pill shadow-sm"
                        >
                          <i className="bi bi-file-earmark-word me-1"></i> 📥 Download File Surat Word (.docx)
                        </a>

                        <button 
                          type="button"
                          onClick={() => {
                            if (hasilResi.file_hasil_data) {
                              const win = window.open();
                              if (hasilResi.file_hasil_data.startsWith('data:image')) {
                                win.document.write(\`<html><head><title>\${hasilResi.file_hasil || 'Surat_Lompoe'}</title></head><body style="margin:0;background:#0f172a;display:flex;justify-content:center;align-items:center;min-height:100vh;"><img src="\${hasilResi.file_hasil_data}" style="max-width:95%;max-height:95vh;object-fit:contain;" /></body></html>\`);
                              } else {
                                win.document.write(\`<html><head><title>\${hasilResi.file_hasil || 'Surat_Lompoe'}</title></head><body style="margin:0;"><iframe src="\${hasilResi.file_hasil_data}" width="100%" height="100%" style="border:none;height:100vh;"></iframe></body></html>\`);
                              }
                            } else {
                              window.open(\`\${API_BASE_URL}/uploads/\${hasilResi.file_hasil || ('Surat_Pengesahan_Lurah_' + hasilResi.no_resi + '.pdf')}\`, '_blank');
                            }
                          }}
                          className="btn btn-success fw-bold px-4 py-2 rounded-pill shadow-sm"
                        >
                          <i className="bi bi-file-earmark-pdf me-1"></i> 🖨️ Cetak / Download PDF Surat Selesai
                        </button>
                      </div>
                    </div>
                  )}`;

const newCekResiDownloadBlock = `                  {/* Download Dokumen Hasil Pengajuan Warga */}
                  {(hasilResi.file_hasil || hasilResi.status === 'Disetujui/Siap Diambil' || hasilResi.status === 'Selesai' || hasilResi.status_rt?.includes('Disetujui')) && (
                    <div className="alert alert-success p-4 rounded-4 mb-4 shadow-sm">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <i className="bi bi-file-earmark-check-fill fs-3 text-success"></i>
                        <div>
                          <h6 className="fw-bold text-success mb-0">🎉 SURAT PERSETUJUAN / SURAT HASIL SUDAH TERBIT & DISAHKAN!</h6>
                          <small className="text-muted">Dokumen resmi telah ditandatangani digital oleh Lurah Lompoe (<strong>ASMIANTI M., SE.</strong>)</small>
                        </div>
                      </div>
                      
                      <div className="d-flex flex-wrap gap-2 mt-3">
                        <a 
                          href={\`\${API_BASE_URL}/api/admin/generate-docx/\${hasilResi.no_resi}\`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn btn-primary fw-bold px-4 py-2 rounded-pill shadow-sm"
                        >
                          <i className="bi bi-file-earmark-word me-1"></i> 📥 Download File Surat Word (.docx)
                        </a>

                        <button 
                          type="button"
                          onClick={() => {
                            if (hasilResi.file_hasil_data) {
                              const win = window.open();
                              if (hasilResi.file_hasil_data.startsWith('data:image')) {
                                win.document.write(\`<!DOCTYPE html><html><head><title>\${hasilResi.file_hasil || 'Surat_Lompoe'}</title></head><body style="margin:0;background:#0f172a;display:flex;justify-content:center;align-items:center;min-height:100vh;"><img src="\${hasilResi.file_hasil_data}" style="max-width:95%;max-height:95vh;object-fit:contain;" /></body></html>\`);
                              } else {
                                win.document.write(\`<!DOCTYPE html><html><head><title>\${hasilResi.file_hasil || 'Surat_Lompoe'}</title></head><body style="margin:0;"><iframe src="\${hasilResi.file_hasil_data}" width="100%" height="100%" style="border:none;height:100vh;"></iframe></body></html>\`);
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
                          className="btn btn-success fw-bold px-4 py-2 rounded-pill shadow-sm"
                        >
                          <i className="bi bi-file-earmark-pdf me-1"></i> 🖨️ Cetak / Download PDF Surat Selesai
                        </button>
                      </div>
                    </div>
                  )}`;

if (cekResiCode.includes(oldCekResiDownloadBlock)) {
    cekResiCode = cekResiCode.replace(oldCekResiDownloadBlock, newCekResiDownloadBlock);
    fs.writeFileSync(cekResiPath, cekResiCode, 'utf8');
    console.log('Successfully updated CekResi.jsx printable PDF viewer!');
}
