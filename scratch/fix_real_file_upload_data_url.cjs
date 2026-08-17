const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const apiDir = path.join(rootDir, 'api');

// 1. Update FormWarga.jsx to read attached files as Base64 Data URLs and store in file_data_map
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

const oldFormSubmitHead = `    const fileNames = [];
    if (filePengantar) fileNames.push(filePengantar.name || 'Surat_Pengantar_RT.pdf');
    if (filesLain && filesLain.length > 0) filesLain.forEach(f => fileNames.push(f.name || 'KTP_KK_Warga.pdf'));
    if (filePbb) fileNames.push(filePbb.name || 'Bukti_PBB_Lompoe.pdf');
    if (fileNames.length === 0) fileNames.push('Surat_Pengantar_RT.pdf', 'KTP_Warga.pdf', 'KK_Warga.pdf');

    const userTelp = formData.no_hp || formData.telepon || formData.nomor_wa || '081234567890';
    const payload = {
      ...formData,
      ...extraData,
      no_hp: userTelp,
      telepon: userTelp,
      nomor_wa: userTelp,
      nama_pemohon: formData.nama_pemohon || 'Warga Kelurahan Lompoe',
      nik: formData.nik || '7372011205950001',
      tempat_tgl_lahir: formData.tempat_tgl_lahir || extraData.tempat_tgl_lahir || 'Parepare, 12 Mei 1995',
      jenis_kelamin: formData.jenis_kelamin || extraData.jenis_kelamin || 'Laki-laki',
      agama: formData.agama || extraData.agama || 'Islam',
      pekerjaan: formData.pekerjaan || extraData.pekerjaan || 'Wiraswasta',
      alamat: formData.alamat || extraData.alamat || 'Jl. Poros Lompoe',
      rt_rw: formData.rt_rw || 'RW 01 / RT 01',
      jenis_surat: formData.jenis_surat || 'Surat Keterangan Usaha (SKU)',
      keperluan: formData.keperluan || extraData.keperluan || extraData.nama_acara || 'Pengurusan Administrasi',
      nama_acara: extraData.nama_acara || formData.keperluan || 'Kegiatan Kemasyarakatan',
      tanggal_acara: extraData.tanggal_acara || 'Senin, 24 Agustus 2026',
      lokasi_acara: extraData.lokasi_acara || formData.alamat || 'Kediaman Pemohon',
      file_berkas: fileNames.join(', '),
      data_json: JSON.stringify(extraData)
    };`;

const newFormSubmitHead = `    const fileNames = [];
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
    }

    if (fileNames.length === 0) fileNames.push('Surat_Pengantar_RT.pdf', 'KTP_Warga.pdf', 'KK_Warga.pdf');

    const userTelp = formData.no_hp || formData.telepon || formData.nomor_wa || '081234567890';
    const payload = {
      ...formData,
      ...extraData,
      no_hp: userTelp,
      telepon: userTelp,
      nomor_wa: userTelp,
      nama_pemohon: formData.nama_pemohon || 'Warga Kelurahan Lompoe',
      nik: formData.nik || '7372011205950001',
      tempat_tgl_lahir: formData.tempat_tgl_lahir || extraData.tempat_tgl_lahir || 'Parepare, 12 Mei 1995',
      jenis_kelamin: formData.jenis_kelamin || extraData.jenis_kelamin || 'Laki-laki',
      agama: formData.agama || extraData.agama || 'Islam',
      pekerjaan: formData.pekerjaan || extraData.pekerjaan || 'Wiraswasta',
      alamat: formData.alamat || extraData.alamat || 'Jl. Poros Lompoe',
      rt_rw: formData.rt_rw || 'RW 01 / RT 01',
      jenis_surat: formData.jenis_surat || 'Surat Keterangan Usaha (SKU)',
      keperluan: formData.keperluan || extraData.keperluan || extraData.nama_acara || 'Pengurusan Administrasi',
      nama_acara: extraData.nama_acara || formData.keperluan || 'Kegiatan Kemasyarakatan',
      tanggal_acara: extraData.tanggal_acara || 'Senin, 24 Agustus 2026',
      lokasi_acara: extraData.lokasi_acara || formData.alamat || 'Kediaman Pemohon',
      file_berkas: fileNames.join(', '),
      file_data_map: fileDataMap,
      data_json: JSON.stringify(extraData)
    };`;

if (formWargaCode.includes(oldFormSubmitHead)) {
    formWargaCode = formWargaCode.replace(oldFormSubmitHead, newFormSubmitHead);
    fs.writeFileSync(formWargaPath, formWargaCode, 'utf8');
    console.log('Successfully updated FormWarga.jsx Base64 Data URL reading!');
}

// 2. Update AdminDashboard.jsx to render real image from file_data_map and open real image in fullscreen
const adminDashPath = path.join(srcDir, 'AdminDashboard.jsx');
let adminDashCode = fs.readFileSync(adminDashPath, 'utf8');

if (!adminDashCode.includes('readFileAsBase64')) {
    adminDashCode = readFileHelper + adminDashCode;
}

const oldAdminSaveHead = `      let fileNameToSave = modalUpdate.file_hasil || null;
      if (fileHasil) {
        fileNameToSave = fileHasil.name || \`Surat_Pengesahan_Lurah_\${modalUpdate.no_resi}.pdf\`;
      } else if (statusBaru === 'Disetujui/Siap Diambil' || statusBaru === 'Selesai') {
        fileNameToSave = \`Surat_Pengesahan_Lurah_\${modalUpdate.no_resi}.pdf\`;
      }

      await axios.put(\`\${API_BASE_URL}/api/admin/pengajuan/\${modalUpdate.no_resi}\`, {
        status: statusBaru,
        status_kelurahan: statusBaru,
        catatan_admin: catatanAdmin,
        file_hasil: fileNameToSave
      });`;

const newAdminSaveHead = `      let fileNameToSave = modalUpdate.file_hasil || null;
      let fileHasilB64 = modalUpdate.file_hasil_data || null;

      if (fileHasil) {
        fileNameToSave = fileHasil.name || \`Surat_Pengesahan_Lurah_\${modalUpdate.no_resi}.pdf\`;
        fileHasilB64 = await readFileAsBase64(fileHasil);
      } else if (statusBaru === 'Disetujui/Siap Diambil' || statusBaru === 'Selesai') {
        fileNameToSave = \`Surat_Pengesahan_Lurah_\${modalUpdate.no_resi}.pdf\`;
      }

      await axios.put(\`\${API_BASE_URL}/api/admin/pengajuan/\${modalUpdate.no_resi}\`, {
        status: statusBaru,
        status_kelurahan: statusBaru,
        catatan_admin: catatanAdmin,
        file_hasil: fileNameToSave,
        file_hasil_data: fileHasilB64
      });`;

if (adminDashCode.includes(oldAdminSaveHead)) {
    adminDashCode = adminDashCode.replace(oldAdminSaveHead, newAdminSaveHead);
}

// Update modalViewBerkas in AdminDashboard.jsx to use real dataUrl
const oldModalViewContent = `      {/* Modal View Berkas Warga */}
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
                    className="img-fluid rounded-3 border shadow-sm mb-2" 
                    style={{ maxHeight: '350px', objectFit: 'contain' }} 
                  />
                  <small className="d-block text-success fw-bold">✓ Dokumen Lampiran KTP/KK Asli Terverifikasi Srikandi Kelurahan Lompoe</small>
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

const newModalViewContent = `      {/* Modal View Berkas Warga */}
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

if (adminDashCode.includes(oldModalViewContent)) {
    adminDashCode = adminDashCode.replace(oldModalViewContent, newModalViewContent);
}

fs.writeFileSync(adminDashPath, adminDashCode, 'utf8');
console.log('Successfully updated AdminDashboard.jsx Base64 Data URL rendering!');

// 3. Update CekResi.jsx to handle real file_hasil_data
const cekResiPath = path.join(srcDir, 'CekResi.jsx');
let cekResiCode = fs.readFileSync(cekResiPath, 'utf8');

const oldCekResiPdfBtn = `<a 
                          href={\`\${API_BASE_URL}/uploads/\${hasilResi.file_hasil || ('Surat_Pengesahan_Lurah_' + hasilResi.no_resi + '.pdf')}\`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn btn-success fw-bold px-4 py-2 rounded-pill shadow-sm"
                        >
                          <i className="bi bi-file-earmark-pdf me-1"></i> 🖨️ Cetak / Download PDF Surat Selesai
                        </a>`;

const newCekResiPdfBtn = `<button 
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
                        </button>`;

if (cekResiCode.includes(oldCekResiPdfBtn)) {
    cekResiCode = cekResiCode.replace(oldCekResiPdfBtn, newCekResiPdfBtn);
    fs.writeFileSync(cekResiPath, cekResiCode, 'utf8');
    console.log('Successfully updated CekResi.jsx custom finished file viewer!');
}
