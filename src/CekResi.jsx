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
                              href={`https://wa.me/?text=${encodeURIComponent(`Halo Pak RT/RW, mohon bantu persetujuan surat saya (${hasilResi.jenis_surat}) via link: ${window.location.origin}/verifikasi-rt?token=${hasilResi.token_rt}`)}`}
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

                  {/* Download Dokumen Hasil Jika Ada */}
                  {hasilResi.file_hasil && (
                    <div className="alert alert-success p-3 rounded-4 mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
                      <div>
                        <strong className="d-flex align-items-center gap-2">
                          <i className="bi bi-file-earmark-check-fill fs-4 text-success"></i> Dokumen Surat / Persetujuan Digital Siap Download!
                        </strong>
                      </div>
                      <a 
                        href={`${API_BASE_URL}/uploads/${hasilResi.file_hasil}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn btn-success fw-bold px-4 py-2 rounded-pill shadow-sm"
                      >
                        <i className="bi bi-download me-1"></i> Download Dokumen
                      </a>
                    </div>
                  )}

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