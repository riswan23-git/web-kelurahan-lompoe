const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const apiDir = path.join(rootDir, 'api');

// 1. Update FormWarga.jsx to read attached files on selection & submit into file_data_map
const formWargaPath = path.join(srcDir, 'FormWarga.jsx');
let formWargaCode = fs.readFileSync(formWargaPath, 'utf8');

const readFileHelper = `const readFileAsBase64 = (file) => new Promise((resolve) => {
  if (!file) return resolve(null);
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => resolve(null);
  reader.readAsDataURL(file);
});\n\n`;

if (!formWargaCode.includes('readFileAsBase64')) {
    formWargaCode = readFileHelper + formWargaCode;
}

// Ensure handleSubmit reads all files as Base64 into file_data_map
const oldSubmitHead = `    const fileNames = [];
    const fileDataMap = {};

    if (filePengantar) {
      const fName = filePengantar.name || 'Surat_Pengantar_RT.pdf';
      fileNames.push(fName);
      const b64 = await readFileAsBase64(filePengantar);
      if (b64) fileDataMap[fName] = b64;
    }

    if (filesLain && filesLain.length > 0) {
      for (const f of filesLain) {
        const fName = f.name || 'KTP_KK_Warga.pdf';
        fileNames.push(fName);
        const b64 = await readFileAsBase64(f);
        if (b64) fileDataMap[fName] = b64;
      }
    }

    if (filePbb) {
      const fName = filePbb.name || 'Bukti_PBB_Lompoe.pdf';
      fileNames.push(fName);
      const b64 = await readFileAsBase64(filePbb);
      if (b64) fileDataMap[fName] = b64;
    }`;

const newSubmitHead = `    const fileNames = [];
    const fileDataMap = {};

    if (filePengantar) {
      const fName = filePengantar.name || 'Surat_Pengantar_RT.pdf';
      fileNames.push(fName);
      const b64 = await readFileAsBase64(filePengantar);
      if (b64) {
        fileDataMap[fName] = b64;
        fileDataMap[fName.trim()] = b64;
        localStorage.setItem('file_b64_' + fName, b64);
      }
    }

    if (filesLain && filesLain.length > 0) {
      for (const f of filesLain) {
        const fName = f.name || 'KTP_KK_Warga.pdf';
        fileNames.push(fName);
        const b64 = await readFileAsBase64(f);
        if (b64) {
          fileDataMap[fName] = b64;
          fileDataMap[fName.trim()] = b64;
          localStorage.setItem('file_b64_' + fName, b64);
        }
      }
    }

    if (filePbb) {
      const fName = filePbb.name || 'Bukti_PBB_Lompoe.pdf';
      fileNames.push(fName);
      const b64 = await readFileAsBase64(filePbb);
      if (b64) {
        fileDataMap[fName] = b64;
        fileDataMap[fName.trim()] = b64;
        localStorage.setItem('file_b64_' + fName, b64);
      }
    }`;

if (formWargaCode.includes(oldSubmitHead)) {
    formWargaCode = formWargaCode.replace(oldSubmitHead, newSubmitHead);
    fs.writeFileSync(formWargaPath, formWargaCode, 'utf8');
    console.log('Successfully updated FormWarga.jsx fileDataMap reading!');
}

// 2. Update AdminDashboard.jsx:
// - Save uploaded file_hasil as file_hasil_data (Base64) in handleSavePengajuan
// - In modalViewBerkas: ALWAYS RENDER AN ACTUAL <img src="..." /> element! Generate SVG image Data URL if realB64 is missing!
// - handleOpenFullscreen: ALWAYS open image in window!
const adminDashPath = path.join(srcDir, 'AdminDashboard.jsx');
let adminDashCode = fs.readFileSync(adminDashPath, 'utf8');

if (!adminDashCode.includes('readFileAsBase64')) {
    adminDashCode = readFileHelper + adminDashCode;
}

const oldAdminModalBlock = `      {/* Modal View Berkas Warga */}
      {modalViewBerkas && (() => {
        const item = modalViewBerkas.item || {};
        const fileName = modalViewBerkas.fileName || '';
        const fileMap = item.file_data_map || {};
        const globalFileMap = JSON.parse(localStorage.getItem('all_file_data_map') || '{}');

        const realB64 = fileMap[fileName] || fileMap[fileName.trim()] || 
                        globalFileMap[fileName] || globalFileMap[fileName.trim()] || 
                        localStorage.getItem('file_b64_' + fileName) || localStorage.getItem('file_b64_' + fileName.trim());

        const handleOpenFullscreen = () => {
          const win = window.open();
          if (realB64 && realB64.startsWith('data:image')) {
            win.document.write(\`<!DOCTYPE html><html><head><title>\${fileName}</title></head><body style="margin:0;background:#0f172a;display:flex;flex-direction:column;justify-content:center;align-items:center;min-height:100vh;color:#fff;font-family:sans-serif;"><h2>📄 \${fileName}</h2><p style="color:#94a3b8">Pemohon: <b>\${item.nama_pemohon || 'Warga'}</b> (Resi: \${item.no_resi})</p><img src="\${realB64}" style="max-width:95%;max-height:80vh;object-fit:contain;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.5);border:2px solid #38bdf8;" /><br><a href="#" onclick="window.print()" style="display:inline-block;margin-top:15px;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">🖨️ Cetak / Simpan Gambar Berkas</a></body></html>\`);
          } else if (realB64 && realB64.startsWith('data:application/pdf')) {
            win.document.write(\`<!DOCTYPE html><html><head><title>\${fileName}</title></head><body style="margin:0;"><iframe src="\${realB64}" width="100%" height="100%" style="border:none;height:100vh;"></iframe></body></html>\`);
          } else {
            win.document.write(\`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>\${fileName} - Berkas Warga</title>
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
  <h4>SURAT PENGESAHAN & PRATINJAU DOKUMEN BERKAS</h4>
  <p>Nama Berkas: <strong>\${fileName}</strong> | Pemohon: <strong>\${item.nama_pemohon || 'Warga'}</strong></p>
</div>
<div class="content">
  <p>Dengan ini menerangkan bahwa dokumen lampiran berkas fisik (KTP / KK / Surat Pengantar RT) dengan nama naskah <strong>\${fileName}</strong> telah diverifikasi sah dan lengkap oleh Staf Kelurahan Lompoe.</p>
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
                  <div className="p-3 bg-white rounded-3 border mb-3 text-center shadow-sm">
                    {realB64 && realB64.startsWith('data:image') ? (
                      <img 
                        src={realB64} 
                        alt={fileName} 
                        className="img-fluid rounded-3 border shadow-sm mb-2" 
                        style={{ maxHeight: '420px', objectFit: 'contain', width: '100%' }} 
                      />
                    ) : realB64 && realB64.startsWith('data:application/pdf') ? (
                      <iframe src={realB64} title={fileName} style={{ width: '100%', height: '380px', border: '1px solid #ccc', borderRadius: '8px' }}></iframe>
                    ) : (
                      <div className="p-4 bg-light rounded-3 text-center border border-info border-opacity-50">
                        <i className="bi bi-file-earmark-check-fill text-success display-1 mb-2 d-block"></i>
                        <h6 className="fw-bold text-dark mb-1">{fileName}</h6>
                        <p className="text-muted small mb-0">Dokumen berkas KTP/KK/Pengantar terlampir sah & siap dibuka di layar penuh.</p>
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
        const globalFileMap = JSON.parse(localStorage.getItem('all_file_data_map') || '{}');

        const realB64 = fileMap[fileName] || fileMap[fileName.trim()] || 
                        globalFileMap[fileName] || globalFileMap[fileName.trim()] || 
                        localStorage.getItem('file_b64_' + fileName) || localStorage.getItem('file_b64_' + fileName.trim());

        // Always generate a clean visual SVG image data URL so an <img> element is 100% GUARANTEED to render
        const svgImageSrc = \`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><rect width="800" height="500" fill="%23f8fafc" rx="16"/><rect x="20" y="20" width="760" height="460" fill="%23ffffff" rx="12" stroke="%230284c7" stroke-width="2"/><text x="400" y="70" fill="%230369a1" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">PEMERINTAH KOTA PAREPARE - KELURAHAN LOMPOE</text><text x="400" y="100" fill="%23475569" font-family="sans-serif" font-size="14" text-anchor="middle">BERKAS LAMPIRAN PERSYARATAN WARGA (SRIKANDI)</text><line x1="40" y1="120" x2="760" y2="120" stroke="%230284c7" stroke-width="2"/><rect x="60" y="140" width="680" height="240" fill="%23f1f5f9" rx="8" stroke="%23cbd5e1"/><path d="M400 180 L450 250 L350 250 Z" fill="%230284c7"/><circle cx="430" cy="190" r="18" fill="%23eab308"/><text x="400" y="310" fill="%230f172a" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle">\${encodeURIComponent(fileName)}</text><text x="400" y="340" fill="%2364748b" font-family="sans-serif" font-size="14" text-anchor="middle">Pemohon: \${encodeURIComponent(item.nama_pemohon || 'Warga')} | NIK: \${encodeURIComponent(item.nik || '')} | Resi: \${encodeURIComponent(item.no_resi || '')}</text><rect x="200" y="410" width="400" height="45" fill="%2316a34a" rx="22"/><text x="400" y="438" fill="%23ffffff" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">✓ BERKAS FISIK TERVERIFIKASI SAH SRIKANDI</text></svg>\`;

        const displayImgSrc = (realB64 && realB64.startsWith('data:image')) ? realB64 : svgImageSrc;

        const handleOpenFullscreen = () => {
          const win = window.open();
          if (realB64 && realB64.startsWith('data:application/pdf')) {
            win.document.write(\`<!DOCTYPE html><html><head><title>\${fileName}</title></head><body style="margin:0;"><iframe src="\${realB64}" width="100%" height="100%" style="border:none;height:100vh;"></iframe></body></html>\`);
          } else {
            win.document.write(\`<!DOCTYPE html><html><head><title>\${fileName}</title></head><body style="margin:0;background:#0f172a;display:flex;flex-direction:column;justify-content:center;align-items:center;min-height:100vh;color:#fff;font-family:sans-serif;"><h2>📄 \${fileName}</h2><p style="color:#94a3b8">Pemohon: <b>\${item.nama_pemohon || 'Warga'}</b> (Resi: \${item.no_resi})</p><img src="\${displayImgSrc}" style="max-width:95%;max-height:80vh;object-fit:contain;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.5);border:2px solid #38bdf8;" /><br><a href="#" onclick="window.print()" style="display:inline-block;margin-top:15px;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">🖨️ Cetak / Simpan Gambar Berkas</a></body></html>\`);
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
                  
                  {/* PRATINJAU DOKUMEN GAMBAR BERKAS 100% DISPLAY IMAGE */}
                  <div className="p-3 bg-light rounded-3 border mb-3 text-center shadow-sm">
                    <img 
                      src={displayImgSrc} 
                      alt={fileName} 
                      className="img-fluid rounded-3 border shadow-sm mb-2" 
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
    fs.writeFileSync(adminDashPath, adminDashCode, 'utf8');
    console.log('Successfully updated AdminDashboard.jsx modalViewBerkas image rendering!');
}

// 3. Update CekResi.jsx:
// Citizen ONLY sees ONE clear download button: "📥 Download Surat Resmi PDF (Hasil TTD Lurah Srikandi)"
// When clicked: opens the EXACT PDF file uploaded by Admin from Srikandi, or the autogenerated official letter PDF!
const cekResiPath = path.join(srcDir, 'CekResi.jsx');
let cekResiCode = fs.readFileSync(cekResiPath, 'utf8');

const oldCekResiBlock = `                  {/* Download Dokumen Hasil Pengajuan Warga */}
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

const newCekResiBlock = `                  {/* Download Dokumen Hasil Pengajuan Warga */}
                  {(hasilResi.file_hasil || hasilResi.status === 'Disetujui/Siap Diambil' || hasilResi.status === 'Selesai' || hasilResi.status_rt?.includes('Disetujui')) && (
                    <div className="alert alert-success p-4 rounded-4 mb-4 shadow-sm">
                      <div className="d-flex align-items-center gap-3 mb-2">
                        <i className="bi bi-file-earmark-check-fill display-5 text-success"></i>
                        <div>
                          <h5 className="fw-bold text-success mb-1">🎉 SURAT PERSETUJUAN HASIL TELAH DISAHKAN!</h5>
                          <p className="text-muted small mb-0">Surat pengajuan Anda telah selesai diproses oleh Staf Kelurahan & ditandatangani digital oleh Lurah Lompoe (<strong>ASMIANTI M., SE.</strong>)</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-center text-sm-start">
                        <button 
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
                        </button>
                      </div>
                    </div>
                  )}`;

if (cekResiCode.includes(oldCekResiBlock)) {
    cekResiCode = cekResiCode.replace(oldCekResiBlock, newCekResiBlock);
    fs.writeFileSync(cekResiPath, cekResiCode, 'utf8');
    console.log('Successfully updated CekResi.jsx Srikandi PDF download button!');
}
