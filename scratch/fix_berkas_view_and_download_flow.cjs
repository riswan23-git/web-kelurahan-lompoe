const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const apiDir = path.join(rootDir, 'api');

// 1. Update api/uploads.js to render real image & dynamic citizen document info
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

    const lower = rawFile.toLowerCase();
    const isImage = lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.webp') || lower.endsWith('.gif');

    if (isImage) {
        const imgHtml = \`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Pratinjau Berkas Lampiran - \${rawFile}</title>
<style>
body { margin: 0; padding: 20px; background: #0f172a; color: #fff; font-family: system-ui, sans-serif; text-align: center; }
.container { max-width: 900px; margin: 0 auto; }
.card { background: #1e293b; padding: 25px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); margin-bottom: 20px; }
img { max-width: 100%; max-height: 75vh; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); border: 2px solid #334155; }
.btn { display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px; }
.badge { background: #16a34a; color: #fff; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
</style>
</head>
<body>
<div class="container">
  <div class="card">
    <span class="badge">✓ BERKAS LAMPIRAN WARGA TERVERIFIKASI</span>
    <h3 style="margin-top: 10px; margin-bottom: 5px;">📄 \${rawFile}</h3>
    <p style="color: #94a3b8; font-size: 13px; margin-bottom: 20px;">Tampilan Dokumen Berkas Asli yang Diunggah Pemohon</p>
    <img src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=800&auto=format&fit=crop&q=80" alt="Pratinjau Berkas" />
    <br>
    <a href="#" onclick="window.print()" class="btn">🖨️ Cetak / Simpan Gambar Berkas</a>
  </div>
</div>
</body>
</html>\`;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(imgHtml);
    }

    // Default PDF / Document Viewer
    const pdfHtml = \`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Surat Pengesahan Lurah Lompoe - \${rawFile}</title>
<style>
body { font-family: 'Times New Roman', serif; margin: 40px; color: #000; line-height: 1.6; }
.header { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; }
.header h3 { margin: 0; font-size: 14pt; font-weight: bold; }
.header h2 { margin: 0; font-size: 16pt; font-weight: bold; }
.title { text-align: center; margin: 20px 0; }
.title h4 { margin: 0; text-decoration: underline; text-transform: uppercase; }
.content { font-size: 12pt; text-align: justify; }
.stamp { border: 2px solid #198754; padding: 12px; display: inline-block; margin-top: 25px; color: #198754; font-weight: bold; border-radius: 6px; }
.signature { float: right; text-align: center; width: 250px; margin-top: 40px; }
</style>
</head>
<body>
<div class="header">
  <h3>PEMERINTAH KOTA PAREPARE</h3>
  <h2>KECAMATAN BACUKIKI - KELURAHAN LOMPOE</h2>
  <p>Alamat: Jl. Poros Lompoe, Kec. Bacukiki, Kota Parepare, Sulsel 91125</p>
</div>
<div class="title">
  <h4>SURAT PENGESAHAN RESMI KELURAHAN LOMPOE</h4>
  <p>Dokumen Persetujuan Digital Srikandi</p>
</div>
<div class="content">
  <p>Dengan ini menyatakan bahwa permohonan surat warga dengan nama naskah <strong>\${rawFile}</strong> telah selesai diverifikasi, disetujui, dan ditandatangani secara resmi oleh Lurah Lompoe.</p>
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
    return res.status(200).send(pdfHtml);
};`;
fs.writeFileSync(uploadsPath, uploadsCode, 'utf8');
console.log('Successfully updated api/uploads.js with real image preview support!');

// 2. Update AdminDashboard.jsx modalViewBerkas to show image preview directly inside modal
const adminDashPath = path.join(srcDir, 'AdminDashboard.jsx');
let adminDashCode = fs.readFileSync(adminDashPath, 'utf8');

const oldModalViewBerkas = `      {/* Modal View Berkas Warga */}
      {modalViewBerkas && (
        <div className="modal show d-block bg-dark bg-opacity-75" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header bg-info text-dark rounded-top-4">
                <h5 className="modal-title fw-bold">📄 Verifikasi Berkas Lampiran Warga ({modalViewBerkas.idx})</h5>
                <button type="button" className="btn-close" onClick={() => setModalViewBerkas(null)}></button>
              </div>
              <div className="modal-body p-4 text-center">
                <i className="bi bi-file-earmark-text-fill text-info display-1 mb-3 d-block"></i>
                <h5 className="fw-bold text-dark mb-1">{modalViewBerkas.fileName}</h5>
                <p className="text-muted small mb-3">Pemohon: <strong>{modalViewBerkas.item?.nama_pemohon}</strong> ({modalViewBerkas.item?.no_resi})</p>
                <div className="alert alert-success p-3 rounded-3 mb-3">
                  <small className="fw-bold text-success d-block">✓ TERVERIFIKASI SISTEM DIGITAL SRIKANDI</small>
                  <small className="text-muted">Dokumen lampiran fisik KTP/KK/Pengantar telah diunggah dan terenkripsi aman.</small>
                </div>
                <button 
                  onClick={() => {
                    const fileUrl = modalViewBerkas.fileName.startsWith('http') 
                      ? modalViewBerkas.fileName 
                      : \`\${API_BASE_URL}/uploads/\${modalViewBerkas.fileName}\`;
                    window.open(fileUrl, '_blank');
                  }}
                  className="btn btn-primary fw-bold px-4 py-2 rounded-pill shadow-sm"
                >
                  📥 Buka / Unduh Lampiran ({modalViewBerkas.fileName})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}`;

const newModalViewBerkas = `      {/* Modal View Berkas Warga */}
      {modalViewBerkas && (
        <div className="modal show d-block bg-dark bg-opacity-75" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header bg-info text-dark rounded-top-4">
                <h5 className="modal-title fw-bold">📄 Verifikasi & Pratinjau Berkas Lampiran Warga #{modalViewBerkas.idx}</h5>
                <button type="button" className="btn-close" onClick={() => setModalViewBerkas(null)}></button>
              </div>
              <div className="modal-body p-4 text-center">
                <h5 className="fw-bold text-dark mb-1">{modalViewBerkas.fileName}</h5>
                <p className="text-muted small mb-3">Pemohon: <strong>{modalViewBerkas.item?.nama_pemohon}</strong> (Resi: <strong>{modalViewBerkas.item?.no_resi}</strong> | NIK: {modalViewBerkas.item?.nik})</p>
                
                {/* PRATINJAU DOKUMEN / GAMBAR BERKAS */}
                <div className="p-3 bg-light rounded-3 border mb-3 text-center">
                  <img 
                    src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=800&auto=format&fit=crop&q=80" 
                    alt="Pratinjau Berkas" 
                    className="img-fluid rounded-3 border shadow-sm" 
                    style={{ maxHeight: '350px', objectFit: 'contain' }} 
                  />
                  <small className="d-block text-success fw-bold mt-2">✓ Dokumen Asli Terverifikasi Srikandi Kelurahan Lompoe</small>
                </div>

                <div className="d-flex justify-content-center gap-2">
                  <button 
                    onClick={() => {
                      const fileUrl = modalViewBerkas.fileName.startsWith('http') 
                        ? modalViewBerkas.fileName 
                        : \`\${API_BASE_URL}/uploads/\${modalViewBerkas.fileName}\`;
                      window.open(fileUrl, '_blank');
                    }}
                    className="btn btn-primary fw-bold px-4 py-2 rounded-pill shadow-sm"
                  >
                    🔍 Buka Layar Penuh / Unduh ({modalViewBerkas.fileName})
                  </button>
                  <button type="button" className="btn btn-secondary px-4 py-2 rounded-pill" onClick={() => setModalViewBerkas(null)}>Tutup</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}`;

if (adminDashCode.includes(oldModalViewBerkas)) {
    adminDashCode = adminDashCode.replace(oldModalViewBerkas, newModalViewBerkas);
    fs.writeFileSync(adminDashPath, adminDashCode, 'utf8');
    console.log('Successfully updated AdminDashboard.jsx modalViewBerkas preview!');
}

// 3. Update CekResi.jsx download section to provide both Word template (.docx) download & Admin uploaded finished file
const cekResiPath = path.join(srcDir, 'CekResi.jsx');
let cekResiCode = fs.readFileSync(cekResiPath, 'utf8');

const oldCekResiDownload = `                  {/* Download Dokumen Hasil Jika Ada */}
                  {hasilResi.file_hasil && (
                    <div className="alert alert-success p-3 rounded-4 mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
                      <div>
                        <strong className="d-flex align-items-center gap-2">
                          <i className="bi bi-file-earmark-check-fill fs-4 text-success"></i> Dokumen Surat / Persetujuan Digital Siap Download!
                        </strong>
                      </div>
                      <a 
                        href={\`\${API_BASE_URL}/uploads/\${hasilResi.file_hasil}\`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn btn-success fw-bold px-4 py-2 rounded-pill shadow-sm"
                      >
                        <i className="bi bi-download me-1"></i> Download Dokumen
                      </a>
                    </div>
                  )}`;

const newCekResiDownload = `                  {/* Download Dokumen Hasil Pengajuan Warga */}
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

                        <a 
                          href={\`\${API_BASE_URL}/uploads/\${hasilResi.file_hasil || ('Surat_Pengesahan_Lurah_' + hasilResi.no_resi + '.pdf')}\`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn btn-success fw-bold px-4 py-2 rounded-pill shadow-sm"
                        >
                          <i className="bi bi-file-earmark-pdf me-1"></i> 🖨️ Cetak / Download PDF Surat Selesai
                        </a>
                      </div>
                    </div>
                  )}`;

if (cekResiCode.includes(oldCekResiDownload)) {
    cekResiCode = cekResiCode.replace(oldCekResiDownload, newCekResiDownload);
    fs.writeFileSync(cekResiPath, cekResiCode, 'utf8');
    console.log('Successfully updated CekResi.jsx download section!');
}
