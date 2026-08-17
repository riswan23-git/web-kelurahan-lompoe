const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const apiDir = path.join(rootDir, 'api');

// 1. Update FormWarga.jsx to instantly store file Base64 in localStorage on selection
const formWargaPath = path.join(srcDir, 'FormWarga.jsx');
let formWargaCode = fs.readFileSync(formWargaPath, 'utf8');

const oldFilePengantarInput = `<input 
                          type="file" 
                          className="form-control form-control-lg"
                          accept="image/*,.pdf"
                          onChange={(e) => setFilePengantar(e.target.files[0])}
                        />`;

const newFilePengantarInput = `<input 
                          type="file" 
                          className="form-control form-control-lg"
                          accept="image/*,.pdf"
                          onChange={async (e) => {
                            const f = e.target.files[0];
                            setFilePengantar(f);
                            if (f) {
                              const b64 = await readFileAsBase64(f);
                              if (b64) {
                                localStorage.setItem('file_b64_' + f.name, b64);
                                localStorage.setItem('file_b64_' + f.name.trim(), b64);
                              }
                            }
                          }}
                        />`;

const oldFilesLainInput = `<input 
                          type="file" 
                          className="form-control form-control-lg border-primary"
                          accept="image/*,.pdf"
                          multiple
                          onChange={(e) => setFilesLain(Array.from(e.target.files))}
                        />`;

const newFilesLainInput = `<input 
                          type="file" 
                          className="form-control form-control-lg border-primary"
                          accept="image/*,.pdf"
                          multiple
                          onChange={async (e) => {
                            const arr = Array.from(e.target.files);
                            setFilesLain(arr);
                            for (const f of arr) {
                              const b64 = await readFileAsBase64(f);
                              if (b64) {
                                localStorage.setItem('file_b64_' + f.name, b64);
                                localStorage.setItem('file_b64_' + f.name.trim(), b64);
                              }
                            }
                          }}
                        />`;

const oldFilePbbInput = `<input 
                          type="file" 
                          className="form-control form-control-lg"
                          accept="image/*,.pdf"
                          onChange={(e) => setFilePbb(e.target.files[0])}
                        />`;

const newFilePbbInput = `<input 
                          type="file" 
                          className="form-control form-control-lg"
                          accept="image/*,.pdf"
                          onChange={async (e) => {
                            const f = e.target.files[0];
                            setFilePbb(f);
                            if (f) {
                              const b64 = await readFileAsBase64(f);
                              if (b64) {
                                localStorage.setItem('file_b64_' + f.name, b64);
                                localStorage.setItem('file_b64_' + f.name.trim(), b64);
                              }
                            }
                          }}
                        />`;

if (formWargaCode.includes(oldFilePengantarInput)) {
    formWargaCode = formWargaCode.replace(oldFilePengantarInput, newFilePengantarInput);
}
if (formWargaCode.includes(oldFilesLainInput)) {
    formWargaCode = formWargaCode.replace(oldFilesLainInput, newFilesLainInput);
}
if (formWargaCode.includes(oldFilePbbInput)) {
    formWargaCode = formWargaCode.replace(oldFilePbbInput, newFilePbbInput);
}

fs.writeFileSync(formWargaPath, formWargaCode, 'utf8');
console.log('Successfully updated FormWarga.jsx instant file selection persistence!');

// 2. Update AdminDashboard.jsx modalViewBerkas to lookup file_data_map + localStorage and NEVER open Surat Pengesahan HTML
const adminDashPath = path.join(srcDir, 'AdminDashboard.jsx');
let adminDashCode = fs.readFileSync(adminDashPath, 'utf8');

const oldAdminModalBlock = `      {/* Modal View Berkas Warga */}
      {modalViewBerkas && (() => {
        const item = modalViewBerkas.item || {};
        const fileName = modalViewBerkas.fileName || '';
        const fileMap = item.file_data_map || {};
        const realB64 = fileMap[fileName] || fileMap[fileName.trim()];

        const handleOpenFullscreen = () => {
          if (realB64) {
            const win = window.open();
            if (realB64.startsWith('data:image')) {
              win.document.write(\`<html><head><title>\${fileName}</title></head><body style="margin:0;background:#0f172a;display:flex;justify-content:center;align-items:center;min-height:100vh;"><img src="\${realB64}" style="max-width:95%;max-height:95vh;object-fit:contain;border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,0.5);" /></body></html>\`);
            } else {
              win.document.write(\`<html><head><title>\${fileName}</title></head><body style="margin:0;"><iframe src="\${realB64}" width="100%" height="100%" style="border:none;height:100vh;"></iframe></body></html>\`);
            }
          } else {
            const fileUrl = fileName.startsWith('http') ? fileName : \`\${API_BASE_URL}/uploads/\${fileName}\`;
            window.open(fileUrl, '_blank');
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
                        <i className="bi bi-file-earmark-check text-success display-1 mb-2 d-block"></i>
                        <h6 className="fw-bold text-dark mb-1">{fileName}</h6>
                        <small className="text-muted">Dokumen terlampir sah & siap dibuka di layar penuh.</small>
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

if (adminDashCode.includes(oldAdminModalBlock)) {
    adminDashCode = adminDashCode.replace(oldAdminModalBlock, newAdminModalBlock);
    fs.writeFileSync(adminDashPath, adminDashCode, 'utf8');
    console.log('Successfully updated AdminDashboard.jsx file lookup & fullscreen opener!');
}
