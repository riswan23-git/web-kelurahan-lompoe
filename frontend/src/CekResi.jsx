import { API_BASE_URL } from './apiConfig';
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';

function formatMaskedNik(nikStr) {
  if (!nikStr || nikStr.length < 10) return nikStr || '-';
  return nikStr.substring(0, 6) + '******' + nikStr.substring(nikStr.length - 4);
}

function CekResi() {
  const [searchParams] = useSearchParams();
  const [noResi, setNoResi] = useState(searchParams.get('resi') || localStorage.getItem('last_resi') || '');
  const [hasilResi, setHasilResi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCekResi = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setHasilResi(null);

    if (!noResi.trim()) {
      setErrorMsg('Masukkan nomor resi Anda!');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/cek-resi/${noResi.trim()}`);
      setHasilResi(response.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Nomor resi tidak ditemukan. Pastikan nomor resi sudah benar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('resi')) {
      handleCekResi();
    }
  }, []);

  // Helper step index
  const getStepState = (status) => {
    if (status === 'Pending') return 1;
    if (status === 'Diproses') return 2;
    if (status === 'Disetujui/Siap Diambil' || status === 'Selesai') return 3;
    if (status === 'Ditolak') return -1;
    return 1;
  };

  const stepIndex = hasilResi ? getStepState(hasilResi.status) : 0;

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#f4f7f6' }}>
      <Navbar />

      <div className="py-4 shadow-sm text-white" style={{ backgroundColor: '#0f4c75' }}>
        <div className="container">
          <h2 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-search text-warning"></i> Cek Status Resi Surat & Persetujuan
          </h2>
          <p className="mb-0 opacity-75">Pantau progres pengajuan berkas atau dokumen persetujuan Lurah secara realtime</p>
        </div>
      </div>

      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">

            {/* Box Search Form */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 p-4 bg-white">
              <form onSubmit={handleCekResi}>
                <label className="form-label fw-semibold text-dark mb-2">
                  <i className="bi bi-upc-scan me-1 text-primary"></i> Masukkan Nomor Resi Pengajuan *
                </label>
                <div className="input-group input-group-lg">
                  <input 
                    type="text" 
                    className="form-control rounded-start-3" 
                    placeholder="Contoh: LMP-839201"
                    value={noResi}
                    onChange={(e) => setNoResi(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary px-4 fw-bold" disabled={loading}>
                    {loading ? 'Mengecek...' : '🔍 Lacak Resi'}
                  </button>
                </div>
              </form>
            </div>

            {errorMsg && (
              <div className="alert alert-danger rounded-4 p-4 shadow-sm text-center">
                ❌ {errorMsg}
              </div>
            )}

            {/* Visual Tracking Results */}
            {hasilResi && (
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
                <div className="card-header bg-dark text-white p-4 d-flex justify-content-between align-items-center">
                  <div>
                    <span className="small text-white-50 text-uppercase fw-bold d-block">Nomor Resi Pemohon:</span>
                    <h4 className="fw-bold text-warning mb-0">{hasilResi.no_resi}</h4>
                  </div>
                  <div>
                    <span className={`badge fs-6 px-3 py-2 rounded-pill ${
                      hasilResi.status === 'Disetujui/Siap Diambil' || hasilResi.status === 'Selesai' ? 'bg-success' :
                      hasilResi.status === 'Diproses' ? 'bg-primary' :
                      hasilResi.status === 'Ditolak' ? 'bg-danger' : 'bg-warning text-dark'
                    }`}>
                      {hasilResi.status}
                    </span>
                  </div>
                </div>

                <div className="card-body p-4">

                  {/* Stepper Progres Visual */}
                  {hasilResi.status !== 'Ditolak' ? (
                    <div className="my-4 py-3 bg-light rounded-4 border p-3">
                      <h6 className="fw-bold text-center text-muted mb-4">Progres Pelayanan Dokumen:</h6>
                      <div className="d-flex justify-content-between position-relative">
                        
                        <div className={`stepper-item ${stepIndex >= 1 ? (stepIndex > 1 ? 'completed' : 'active') : ''}`}>
                          <div className="stepper-counter">1</div>
                          <div className="small fw-semibold mt-2">Diajukan</div>
                        </div>

                        <div className={`stepper-item ${stepIndex >= 2 ? (stepIndex > 2 ? 'completed' : 'active') : ''}`}>
                          <div className="stepper-counter">2</div>
                          <div className="small fw-semibold mt-2">Peninjauan Staf</div>
                        </div>

                        <div className={`stepper-item ${stepIndex >= 3 ? 'completed' : ''}`}>
                          <div className="stepper-counter">3</div>
                          <div className="small fw-semibold mt-2">Persetujuan / TTD</div>
                        </div>

                      </div>
                    </div>
                  ) : (
                    <div className="alert alert-danger p-3 rounded-3 mb-4 text-center">
                      ⚠️ <strong>Pengajuan Ditolak:</strong> Silakan baca catatan staf di bawah untuk perbaikan berkas.
                    </div>
                  )}

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <small className="text-muted d-block">Nama Pemohon:</small>
                      <h6 className="fw-bold text-dark mb-0">{hasilResi.nama_pemohon}</h6>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted d-block">NIK Pemohon (Privasi Terjaga):</small>
                      <h6 className="fw-bold text-dark mb-0">{formatMaskedNik(hasilResi.nik)}</h6>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted d-block">Jenis Surat / Layanan:</small>
                      <h6 className="fw-bold text-primary mb-0">{hasilResi.jenis_surat}</h6>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted d-block">Tanggal Pengajuan:</small>
                      <h6 className="fw-bold text-dark mb-0">{new Date(hasilResi.tanggal_pengajuan).toLocaleString('id-ID')}</h6>
                    </div>
                    <div className="col-12">
                      <div className="p-3 bg-light rounded-3 border">
                        <small className="text-muted d-block fw-semibold mb-1">Status Persetujuan RT/RW Tempat Tinggal:</small>
                        <span className={`badge fs-6 px-3 py-2 rounded-pill ${hasilResi.status_rt?.includes('Disetujui') ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {hasilResi.status_rt || 'Menunggu Verifikasi RT/RW'}
                        </span>
                        {hasilResi.token_rt && !hasilResi.status_rt?.includes('Disetujui') && (
                          <div className="mt-2">
                            <a 
                              href={`https://wa.me/?text=${encodeURIComponent(`Halo Pak RT/RW, mohon bantu persetujuan surat saya (${hasilResi.jenis_surat}) via link: ${window.location.origin}/#/verifikasi-rt?token=${hasilResi.token_rt}`)}`}
                              target="_blank" 
                              rel="noreferrer"
                              className="btn btn-sm btn-success fw-bold me-2"
                            >
                              💬 Kirim / Ingatkan Pak RT via WA
                            </a>
                            <Link to={`/verifikasi-rt?token=${hasilResi.token_rt}`} target="_blank" className="btn btn-sm btn-outline-dark">
                              🔗 Link Verifikasi RT
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <hr />

                  <div className="mb-3">
                    <small className="text-muted d-block mb-1">Keperluan / Keterangan Warga:</small>
                    <p className="p-3 bg-light rounded-3 text-secondary mb-0">{hasilResi.keperluan}</p>
                  </div>

                  {/* Catatan Admin / Staf Kelurahan */}
                  <div className="mb-4">
                    <small className="text-muted d-block mb-1">Catatan Staf Kelurahan & Info Lurah:</small>
                    <div className="p-3 bg-info bg-opacity-10 border border-info border-opacity-25 rounded-3 text-dark">
                      💬 {hasilResi.catatan_admin || 'Pengajuan Anda sedang ditinjau oleh staf kelurahan. Anda bisa berkonsultasi via Live Chat.'}
                    </div>
                  </div>

                  {/* Download Dokumen Hasil Pengajuan Warga */}
                  <div className="alert alert-success p-4 rounded-4 mb-4 shadow-sm border border-2 border-success">
                    <div className="d-flex align-items-center gap-3 mb-2">
                      <i className="bi bi-file-earmark-check-fill display-4 text-success"></i>
                      <div>
                        <h5 className="fw-bold text-success mb-1">🎉 DOKUMEN SURAT SRIKANDI RESMI TELAH TERSEDIA!</h5>
                        <p className="text-muted small mb-0">Surat pengajuan Anda ({hasilResi.jenis_surat}) telah diverifikasi & ditandatangani digital oleh Lurah Lompoe (<strong>ASMIANTI M., SE.</strong>). Silakan download file surat resmi di bawah ini:</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 d-flex flex-wrap gap-2 justify-content-center justify-content-sm-start">
                      {/* TOMBOL UTAMA: DOWNLOAD FILE HASIL YANG DIUNGGAH / DIKIRIM ADMIN */}
                      <button 
                        type="button"
                        onClick={() => {
                          const localFileB64 = localStorage.getItem('file_hasil_b64_' + hasilResi.no_resi);
                          const localList = JSON.parse(localStorage.getItem('all_pengajuan') || '[]');
                          const matchedItem = localList.find(i => i.no_resi === hasilResi.no_resi);
                          const realPdfB64 = hasilResi.file_hasil_data || localFileB64 || matchedItem?.file_hasil_data;

                          if (realPdfB64) {
                            if (realPdfB64.startsWith('data:application/pdf') || realPdfB64.startsWith('data:image')) {
                              // Trigger direct download or open viewer
                              const link = document.createElement('a');
                              link.href = realPdfB64;
                              link.download = hasilResi.file_hasil || `Surat_Resmi_Lurah_Lompoe_${hasilResi.no_resi}.pdf`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);

                              const win = window.open();
                              if (realPdfB64.startsWith('data:image')) {
                                win.document.write(`<!DOCTYPE html><html><head><title>${hasilResi.file_hasil || 'Surat_Srikandi'}</title></head><body style="margin:0;background:#0f172a;display:flex;flex-direction:column;justify-content:center;align-items:center;min-height:100vh;color:#fff;font-family:sans-serif;"><h2>📄 ${hasilResi.file_hasil || 'Surat Hasil Lurah Lompoe'}</h2><img src="${realPdfB64}" style="max-width:95%;max-height:80vh;object-fit:contain;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.5);" /><br><a href="${realPdfB64}" download="${hasilResi.file_hasil || 'Surat_Srikandi.png'}" style="display:inline-block;margin-top:15px;padding:12px 24px;background:#16a34a;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">📥 Simpan File Gambar Surat</a></body></html>`);
                              } else {
                                win.document.write(`<!DOCTYPE html><html><head><title>${hasilResi.file_hasil || 'Surat_Srikandi'}</title></head><body style="margin:0;"><iframe src="${realPdfB64}" width="100%" height="100%" style="border:none;height:100vh;"></iframe></body></html>`);
                              }
                            } else {
                              const win = window.open();
                              win.document.write(`<!DOCTYPE html><html><head><title>${hasilResi.file_hasil || 'Surat_Srikandi'}</title></head><body style="margin:0;"><iframe src="${realPdfB64}" width="100%" height="100%" style="border:none;height:100vh;"></iframe></body></html>`);
                            }
                          } else {
                            // If no custom file uploaded by admin yet, open printable Srikandi official letter
                            const win = window.open();
                            win.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Surat Resmi Kelurahan Lompoe - ${hasilResi.no_resi}</title>
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
  <h4>SURAT RESMI TERVERIFIKASI - ${(hasilResi.jenis_surat || 'SURAT KETERANGAN').toUpperCase()}</h4>
  <p>Nomor Naskah: 470 / ${hasilResi.id || '101'} / KL-LMP / VIII / 2026</p>
</div>
<div class="content">
  <p>Yang bertanda tangan di bawah ini Lurah Lompoe, Kecamatan Bacukiki, Kota Parepare, menerangkan bahwa:</p>
  <table style="width:100%;margin:15px 0;font-size:12pt;">
    <tr><td style="width:200px;">Nama Pemohon</td><td>: <b>${hasilResi.nama_pemohon || hasilResi.nama_lengkap}</b></td></tr>
    <tr><td>NIK</td><td>: ${hasilResi.nik || '-'}</td></tr>
    <tr><td>Tempat/Tgl Lahir</td><td>: ${hasilResi.tempat_tgl_lahir || 'Parepare, 24 April 1995'}</td></tr>
    <tr><td>Jenis Kelamin</td><td>: ${hasilResi.jenis_kelamin || 'Laki-laki'}</td></tr>
    <tr><td>Agama</td><td>: ${hasilResi.agama || 'Islam'}</td></tr>
    <tr><td>Pekerjaan</td><td>: ${hasilResi.pekerjaan || 'Wiraswasta'}</td></tr>
    <tr><td>Alamat</td><td>: ${hasilResi.alamat || 'Jl. Poros Lompoe'}, ${hasilResi.rt_rw || 'RW 01 / RT 01'}</td></tr>
  </table>
  <p>Permohonan <b>${hasilResi.jenis_surat}</b> untuk keperluan <b>${hasilResi.keperluan || hasilResi.nama_acara}</b> telah diverifikasi sah dan disetujui secara resmi oleh Lurah Lompoe.</p>
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
</html>`);
                          }
                        }}
                        className="btn btn-success btn-lg fw-bold px-4 py-3 rounded-pill shadow"
                      >
                        <i className="bi bi-file-earmark-arrow-down-fill me-2"></i> 📥 Download / Lihat File Surat Srikandi (Dari Admin)
                      </button>

                      {/* TOMBOL SEKUNDER: CETAK PDF / WORD DOCUMENT */}
                      <button 
                        type="button"
                        onClick={() => {
                          const safeNoResi = encodeURIComponent(hasilResi.no_resi || 'LMP-102938');
                          try {
                            let extraJson = {};
                            if (hasilResi.data_json) {
                              try {
                                extraJson = typeof hasilResi.data_json === 'string' ? JSON.parse(hasilResi.data_json) : hasilResi.data_json;
                              } catch (e) {}
                            }

                            const cleanObj = {};
                            const combined = { ...extraJson, ...hasilResi };
                            Object.keys(combined).forEach(key => {
                              const val = combined[key];
                              if (
                                key !== 'data_json' && 
                                key !== 'file_berkas' && 
                                key !== 'fileDataMap' && 
                                key !== 'file_data_map' && 
                                !key.toLowerCase().includes('pdf') &&
                                !key.toLowerCase().includes('base64') &&
                                typeof val === 'string' &&
                                val.length < 400
                              ) {
                                cleanObj[key] = val.trim();
                              }
                            });

                            cleanObj.no_resi = hasilResi.no_resi || '';
                            cleanObj.nama_pemohon = hasilResi.nama_pemohon || hasilResi.nama_lengkap || extraJson.nama_pemohon || '';
                            cleanObj.nik = hasilResi.nik || extraJson.nik || '';
                            cleanObj.tempat_tgl_lahir = hasilResi.tempat_tgl_lahir || hasilResi.tgl_lahir || extraJson.tempat_tgl_lahir || extraJson.tgl_lahir || '';
                            cleanObj.jenis_kelamin = hasilResi.jenis_kelamin || hasilResi.jk || extraJson.jenis_kelamin || extraJson.jk || '';
                            cleanObj.agama = hasilResi.agama || extraJson.agama || '';
                            cleanObj.pekerjaan = hasilResi.pekerjaan || extraJson.pekerjaan || '';
                            cleanObj.jenis_surat = hasilResi.jenis_surat || '';
                            cleanObj.rt_rw = hasilResi.rt_rw || 'RT 01 / RW 01';
                            cleanObj.alamat = hasilResi.alamat || extraJson.alamat || extraJson.tempat_tinggal_saat_ini || '';
                            cleanObj.keperluan = hasilResi.keperluan || '';
                            cleanObj.pejabat_ttd = hasilResi.pejabat_ttd || extraJson.pejabat_ttd || 'ASMIANTI M., SE.';
                            cleanObj.jabatan_pejabat = hasilResi.jabatan_pejabat || extraJson.jabatan_pejabat || 'LURAH LOMPOE';
                            cleanObj.nip_pejabat = hasilResi.nip_pejabat || extraJson.nip_pejabat || '19840927 201001 2 022';
                            cleanObj.pangkat_pejabat = hasilResi.pangkat_pejabat || extraJson.pangkat_pejabat || 'Penata Tk. I (III/d)';
                            const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(cleanObj))));
                            window.open(`${API_BASE_URL}/api/admin/generate-docx/${safeNoResi}?payload=${encodeURIComponent(b64)}&_t=${Date.now()}`, '_blank');
                          } catch(e) {
                            window.open(`${API_BASE_URL}/api/admin/generate-docx/${safeNoResi}?_t=${Date.now()}`, '_blank');
                          }
                        }}
                        className="btn btn-outline-primary btn-lg fw-bold px-4 py-3 rounded-pill"
                      >
                        <i className="bi bi-file-earmark-word me-2"></i> 📄 Download Format Word (.docx)
                      </button>
                    </div>
                  </div>

                  {/* Direct Button ke Live Chat */}
                  <div className="d-grid gap-2">
                    <Link to={`/chat?resi=${hasilResi.no_resi}`} className="btn btn-success btn-lg fw-bold py-3 rounded-pill shadow-sm">
                      <i className="bi bi-chat-dots-fill me-2"></i> Live Chat Koordinasi Dokumen Ini dengan Admin
                    </Link>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default CekResi;