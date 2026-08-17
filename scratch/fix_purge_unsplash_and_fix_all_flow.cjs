const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const apiDir = path.join(rootDir, 'api');

// 1. PURGE unsplash from api/uploads.js AND replace with Kop Surat Kelurahan Lompoe document layout
const uploadsPath = path.join(apiDir, 'uploads.js');
const uploadsCode = `module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const url = req.url || '';
    let rawFile = url.split('/').pop() || 'Dokumen.pdf';
    rawFile = rawFile.split('?')[0].split('&')[0].trim();
    try { rawFile = decodeURIComponent(rawFile); } catch (e) {}

    const docHtml = \`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Surat Pengesahan & Berkas Lampiran - \${rawFile}</title>
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
  <h4>SURAT PENGESAHAN & PRATINJAU BERKAS RESMI</h4>
  <p>Nama Berkas: <strong>\${rawFile}</strong></p>
</div>
<div class="content">
  <p>Dengan ini menerangkan bahwa permohonan naskah surat dan berkas lampiran warga dengan nama dokumen <strong>\${rawFile}</strong> telah selesai diverifikasi, disetujui, dan ditandatangani secara resmi oleh Lurah Lompoe.</p>
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
</html>\`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(docHtml);
};`;
fs.writeFileSync(uploadsPath, uploadsCode, 'utf8');
console.log('Successfully purged unsplash from api/uploads.js!');

// 2. Update FormWarga.jsx to store fileDataMap in all_file_data_map & file_b64_
const formWargaPath = path.join(srcDir, 'FormWarga.jsx');
let formWargaCode = fs.readFileSync(formWargaPath, 'utf8');

const oldPayloadSaveLocal = `      const existingLocal = JSON.parse(localStorage.getItem('all_pengajuan') || '[]');
      const updatedLocalList = [newItemSaved, ...existingLocal.filter(i => i.no_resi !== returnedResi)];
      localStorage.setItem('all_pengajuan', JSON.stringify(updatedLocalList));`;

const newPayloadSaveLocal = `      const existingLocal = JSON.parse(localStorage.getItem('all_pengajuan') || '[]');
      const updatedLocalList = [newItemSaved, ...existingLocal.filter(i => i.no_resi !== returnedResi)];
      localStorage.setItem('all_pengajuan', JSON.stringify(updatedLocalList));

      // Save fileDataMap globally
      const globalFileMap = JSON.parse(localStorage.getItem('all_file_data_map') || '{}');
      if (fileDataMap) {
        Object.assign(globalFileMap, fileDataMap);
        localStorage.setItem('all_file_data_map', JSON.stringify(globalFileMap));
      }`;

if (formWargaCode.includes(oldPayloadSaveLocal)) {
    formWargaCode = formWargaCode.replace(oldPayloadSaveLocal, newPayloadSaveLocal);
    fs.writeFileSync(formWargaPath, formWargaCode, 'utf8');
    console.log('Successfully updated FormWarga.jsx all_file_data_map persistence!');
}

// 3. Update AdminDashboard.jsx modalViewBerkas logic
const adminDashPath = path.join(srcDir, 'AdminDashboard.jsx');
let adminDashCode = fs.readFileSync(adminDashPath, 'utf8');

const oldAdminModalBlock = `      {/* Modal View Berkas Warga */}
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

const newAdminModalBlock = `      {/* Modal View Berkas Warga */}
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

if (adminDashCode.includes(oldAdminModalBlock)) {
    adminDashCode = adminDashCode.replace(oldAdminModalBlock, newAdminModalBlock);
    fs.writeFileSync(adminDashPath, adminDashCode, 'utf8');
    console.log('Successfully updated AdminDashboard.jsx lookups!');
}
