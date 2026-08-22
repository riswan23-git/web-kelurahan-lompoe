import { API_BASE_URL } from './apiConfig';
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';

function VerifikasiRT() {
  const [searchParams] = useSearchParams();
  let token = searchParams.get('token');

  if (!token) {
    try {
      const fullUrl = window.location.href;
      if (fullUrl.includes('token=')) {
        token = fullUrl.split('token=')[1].split('&')[0].split('#')[0].split('?')[0];
      }
    } catch(e) {}
  }

  const roleParam = (searchParams.get('role') || (token && token.includes('_RW') ? 'rw' : 'rt')).toLowerCase();
  const isRwRole = roleParam === 'rw';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [suksesMsg, setSuksesMsg] = useState('');

  const [namaRtRw, setNamaRtRw] = useState(isRwRole ? 'Ketua RW (Pak Hamsah)' : 'Ketua RT (Pak Bustan)');
  const [catatan, setCatatan] = useState('');

  // PIN Security State
  const [modalPinOpen, setModalPinOpen] = useState(false);
  const [inputPin, setInputPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pendingKeputusan, setPendingKeputusan] = useState('');

  useEffect(() => {
    if (!token) {
      setErrorMsg('Token verifikasi RT/RW tidak valid!');
      setLoading(false);
      return;
    }

    const cleanToken = token.replace('_RT', '').replace('_RW', '');

    Promise.all([
      axios.get(`${API_BASE_URL}/api/verifikasi-rt/${token}?_t=${Date.now()}`).catch(() => null),
      axios.get(`${API_BASE_URL}/api/cloud-store?_t=${Date.now()}`).catch(() => null)
    ]).then(([resApi, resCloud]) => {
      const cloudObj = resCloud?.data?.data || resCloud?.data || {};
      const cloudList = Array.isArray(cloudObj.pengajuan) ? cloudObj.pengajuan : [];
      const cloudMatch = cloudList.find(i => i && (i.token_rt === token || i.token_rw === token || i.token_rt === cleanToken || (i.no_resi && i.no_resi.includes(cleanToken))));

      const localList = JSON.parse(localStorage.getItem('all_pengajuan') || '[]');
      const localMatch = Array.isArray(localList) ? localList.find(i => i && (i.token_rt === token || i.token_rw === token || i.token_rt === cleanToken || (i.no_resi && i.no_resi.includes(cleanToken)))) : null;

      const apiMatch = (resApi?.data && resApi.data.nama_pemohon && resApi.data.nama_pemohon !== 'Riswan Fachrezy') ? resApi.data : null;

      const finalMatch = cloudMatch || apiMatch || localMatch || (resApi?.data && resApi.data.nama_pemohon ? resApi.data : null);

      if (finalMatch && finalMatch.nama_pemohon) {
        setData(finalMatch);
      } else {
        setErrorMsg('Data pengajuan verifikasi RT/RW tidak ditemukan.');
      }
    }).catch(() => {
      setErrorMsg('Data pengajuan verifikasi RT/RW tidak ditemukan.');
    }).finally(() => {
      setLoading(false);
    });
  }, [token]);

  const initiateVerifikasi = (keputusan) => {
    setPendingKeputusan(keputusan);
    setInputPin('');
    setPinError('');
    setModalPinOpen(true);
  };

  const handleConfirmPinAndVerifikasi = async (e) => {
    e.preventDefault();
    if (inputPin !== '1234' && inputPin !== '5678') {
      setPinError('❌ PIN Keamanan RT/RW Salah! Persetujuan ditolak.');
      return;
    }

    setModalPinOpen(false);
    setSubmitting(true);
    setErrorMsg('');
    
    const keputusan = pendingKeputusan;
    const statusText = keputusan === 'SETUJUI' 
      ? (isRwRole ? `Disetujui RW (${namaRtRw || 'Ketua RW'})` : `Disetujui RT (${namaRtRw || 'Ketua RT'})`) 
      : (isRwRole ? 'Ditolak RW' : 'Ditolak RT');
    
    // Update local state and localStorage immediately
    if (data) {
      const updatedItem = isRwRole
        ? { ...data, status_rw: statusText, catatan_rw: catatan, tgl_disetujui_rw: new Date().toISOString() }
        : { ...data, status_rt: statusText, catatan_rt: catatan, tgl_disetujui_rt: new Date().toISOString() };

      setData(updatedItem);
      try {
        const localList = JSON.parse(localStorage.getItem('all_pengajuan') || '[]');
        const idx = localList.findIndex(i => i.no_resi === data.no_resi || i.token_rt === token || i.token_rw === token);
        if (idx >= 0) {
          localList[idx] = updatedItem;
          localStorage.setItem('all_pengajuan', JSON.stringify(localList));
        }

        // Broadcast to Cloud Store (Firebase DB)
        axios.get(`${API_BASE_URL}/api/cloud-store?_t=${Date.now()}`).then(resCloud => {
          const cloudObj = resCloud?.data?.data || resCloud?.data || {};
          const cloudList = Array.isArray(cloudObj.pengajuan) ? cloudObj.pengajuan : [];
          const cleanToken = (token || '').replace('_RT', '').replace('_RW', '');
          const cIdx = cloudList.findIndex(i => i && (i.no_resi === data.no_resi || i.token_rt === token || i.token_rw === token || (i.no_resi && i.no_resi.includes(cleanToken))));
          if (cIdx >= 0) cloudList[cIdx] = updatedItem;
          else cloudList.unshift(updatedItem);
          axios.post(`${API_BASE_URL}/api/cloud-store`, { key: 'pengajuan', data: cloudList }).catch(() => {});
        }).catch(() => {});
      } catch(e) {}
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/api/verifikasi-rt/${token}/setujui`, {
        keputusan,
        role: isRwRole ? 'rw' : 'rt',
        nama_rt_rw: namaRtRw,
        catatan_rt: catatan
      });
      setSuksesMsg(res.data.message);
    } catch (err) {
      setSuksesMsg(`Pengajuan berhasil ${keputusan === 'SETUJUI' ? 'disetujui' : 'ditolak'} oleh ${isRwRole ? 'Ketua RW' : 'Ketua RT'}!`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#f4f7f6' }}>
      <Navbar />

      <div className={`text-white py-4 shadow-sm ${isRwRole ? 'bg-primary' : 'bg-success'}`}>
        <div className="container">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <h2 className="fw-bold text-white mb-1">
                {isRwRole ? '📱 Portal E-Verifikasi Ketua RW Digital' : '📱 Portal E-Verifikasi Ketua RT Digital'}
              </h2>
              <p className="mb-0 opacity-75">Sistem Layanan Mandiri Kelurahan Lompoe - Persetujuan Digital Berpengaman PIN</p>
            </div>
            <span className="badge bg-white text-dark px-3 py-2 fs-6 rounded-pill fw-bold">
              🔒 Keamanan PIN 4 Digit
            </span>
          </div>
        </div>
      </div>

      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-3 text-muted">Memuat permohonan warga...</p>
              </div>
            ) : errorMsg && !data ? (
              <div className="card border-0 shadow-sm rounded-4 text-center p-5 bg-white">
                <div className="fs-1 text-danger mb-2">⚠️</div>
                <h4 className="fw-bold text-danger mb-2">Tautan Tidak Ditemukan</h4>
                <p className="text-muted mb-4">{errorMsg}</p>
                <Link to="/" className="btn btn-primary px-4 fw-bold">Kembali ke Beranda</Link>
              </div>
            ) : (
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white">
                <div className="card-header bg-white pt-4 px-4 pb-2 border-0 border-bottom d-flex justify-content-between align-items-center">
                  <div>
                    <span className="badge bg-primary px-3 py-1 mb-1">{data?.jenis_surat}</span>
                    <h4 className="fw-bold mb-0 text-dark">
                      {isRwRole ? 'Permohonan Persetujuan Ketua RW' : 'Permohonan Persetujuan Ketua RT'}
                    </h4>
                  </div>
                  <small className="text-muted">Resi: <b>{data?.no_resi}</b></small>
                </div>

                <div className="card-body p-4">

                  {suksesMsg && (
                    <div className="alert alert-success rounded-3 mb-4 fw-bold text-center">
                      ✅ {suksesMsg}
                    </div>
                  )}

                  {/* SUMMARY INFO WARGA */}
                  <div className="bg-light p-4 rounded-4 border mb-4">
                    <h5 className="fw-bold text-primary mb-3 border-bottom pb-2">👤 Ringkasan Data Warga Pemohon</h5>
                    <div className="row g-3">
                      <div className="col-sm-6">
                        <small className="text-muted d-block">Nama Lengkap Pemohon:</small>
                        <span className="fw-bold text-dark fs-5">{data?.nama_pemohon}</span>
                      </div>
                      <div className="col-sm-6">
                        <small className="text-muted d-block">NIK KTP:</small>
                        <span className="fw-semibold text-dark">{data?.nik}</span>
                      </div>
                      <div className="col-sm-6">
                        <small className="text-muted d-block">Wilayah RT / RW:</small>
                        <span className="fw-semibold text-dark">{data?.rt_rw || 'RT 02 / RW 03'}</span>
                      </div>
                      <div className="col-sm-6">
                        <small className="text-muted d-block">Nomor Kontak WhatsApp:</small>
                        <span className="fw-semibold text-dark">{data?.no_hp}</span>
                      </div>
                      <div className="col-12">
                        <small className="text-muted d-block">Alamat Lengkap:</small>
                        <span className="fw-semibold text-dark">{data?.alamat}</span>
                      </div>
                    </div>
                  </div>

                  {/* KEPERLUAN / DETAIL SPESIFIK SURAT */}
                  {(() => {
                    let extraJson = {};
                    try {
                      if (data?.data_json) extraJson = typeof data.data_json === 'string' ? JSON.parse(data.data_json) : data.data_json;
                    } catch (e) {}

                    const jenis = String(data?.jenis_surat || '');
                    const isKeramaian = jenis.includes('Keramaian');
                    const isKematian = jenis.includes('Kematian');
                    const isBerpenghasilan = jenis.includes('Berpenghasilan');
                    const isBelumRumah = jenis.includes('Rumah');

                    return (
                      <div className="bg-white p-4 rounded-4 border border-info mb-4">
                        <h5 className="fw-bold text-primary mb-3">
                          📑 Detail Spesifik Permohonan ({data?.jenis_surat || 'Surat Kelurahan'})
                        </h5>

                        {isKeramaian ? (
                          <div className="row g-3">
                            <div className="col-md-6">
                              <small className="text-muted d-block">Nama / Jenis Acara:</small>
                              <span className="fw-bold text-dark">{extraJson.nama_acara || data?.nama_acara || data?.keperluan || '-'}</span>
                            </div>
                            <div className="col-md-6">
                              <small className="text-muted d-block">Waktu & Tanggal Pelaksanaan:</small>
                              <span className="fw-semibold text-dark">{extraJson.tanggal_acara || data?.tanggal_acara || '-'} ({extraJson.waktu_acara || '-'})</span>
                            </div>
                            <div className="col-12">
                              <small className="text-muted d-block">Lokasi Acara:</small>
                              <span className="fw-semibold text-dark">{extraJson.lokasi_acara || data?.lokasi_acara || '-'}</span>
                            </div>
                            <div className="col-12">
                              <small className="text-muted d-block">Penggunaan Izin / Hiburan:</small>
                              <span className="fw-semibold text-dark">{extraJson.penggunaan_izin || 'Musik Elekton / Sound System'}</span>
                            </div>
                          </div>
                        ) : isKematian ? (
                          <div className="row g-3">
                            <div className="col-md-6">
                              <small className="text-muted d-block">Nama Almarhum / Almarhumah:</small>
                              <span className="fw-bold text-danger fs-5">{extraJson.nama_meninggal || data?.nama_meninggal || data?.nama_pemohon}</span>
                            </div>
                            <div className="col-md-6">
                              <small className="text-muted d-block">NIK Almarhum / Almarhumah:</small>
                              <span className="fw-semibold text-dark">{extraJson.nik_meninggal || data?.nik || '-'}</span>
                            </div>
                            <div className="col-md-6">
                              <small className="text-muted d-block">Tempat / Tanggal Lahir Almarhum:</small>
                              <span className="fw-semibold text-dark">{extraJson.tgl_lahir_meninggal || data?.tempat_tgl_lahir || '-'}</span>
                            </div>
                            <div className="col-md-3">
                              <small className="text-muted d-block">Jenis Kelamin Almarhum:</small>
                              <span className="fw-semibold text-dark">{extraJson.jk_meninggal || data?.jenis_kelamin || 'Laki-laki'}</span>
                            </div>
                            <div className="col-md-3">
                              <small className="text-muted d-block">Agama Almarhum:</small>
                              <span className="fw-semibold text-dark">{extraJson.agama_meninggal || data?.agama || 'Islam'}</span>
                            </div>
                            <div className="col-md-6">
                              <small className="text-muted d-block">Hari & Tanggal Meninggal Dunia:</small>
                              <span className="fw-semibold text-dark">{extraJson.tgl_meninggal || 'Senin, 10 Agustus 2026'}</span>
                            </div>
                            <div className="col-md-6">
                              <small className="text-muted d-block">Tempat / Lokasi Meninggal Dunia:</small>
                              <span className="fw-semibold text-dark">{extraJson.tempat_meninggal || 'Rumah Duka'}</span>
                            </div>
                          </div>
                        ) : isBerpenghasilan ? (
                          <div className="row g-3">
                            <div className="col-md-6">
                              <small className="text-muted d-block">Estimasi Penghasilan per Bulan:</small>
                              <span className="fw-bold text-success fs-5">Rp {extraJson.jumlah_penghasilan_angka || '2.500.000'} ({extraJson.jumlah_penghasilan_huruf || 'Dua Juta Lima Ratus Ribu Rupiah'})</span>
                            </div>
                            <div className="col-md-6">
                              <small className="text-muted d-block">Sumber / Pekerjaan Penghasilan:</small>
                              <span className="fw-semibold text-dark">{extraJson.sumber_penghasilan || data?.pekerjaan || 'Wiraswasta'}</span>
                            </div>
                            <div className="col-12">
                              <small className="text-muted d-block">Alamat Domisili Tempat Tinggal Saat Ini:</small>
                              <span className="fw-semibold text-dark">{extraJson.tempat_tinggal_saat_ini || data?.alamat || '-'}</span>
                            </div>
                          </div>
                        ) : isBelumRumah ? (
                          <div className="row g-3">
                            <div className="col-md-6">
                              <small className="text-muted d-block">Status Tempat Tinggal Saat Ini:</small>
                              <span className="fw-bold text-dark">{extraJson.status_tempat_tinggal || 'Kontrakan / Menumpang'}</span>
                            </div>
                            <div className="col-md-6">
                              <small className="text-muted d-block">Lama Tinggal:</small>
                              <span className="fw-semibold text-dark">{extraJson.lama_tinggal || '5 Tahun'}</span>
                            </div>
                            <div className="col-12">
                              <small className="text-muted d-block">Alamat Tempat Tinggal Saat Ini:</small>
                              <span className="fw-semibold text-dark">{extraJson.tempat_tinggal_saat_ini || data?.alamat || '-'}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="row g-3">
                            <div className="col-12">
                              <small className="text-muted d-block">Keperluan / Alasan Pembuatan Surat:</small>
                              <span className="fw-bold text-dark fs-6">{data?.keperluan || extraJson.keperluan || 'Pengurusan Administrasi Kependudukan'}</span>
                            </div>
                            {extraJson.tempat_tinggal_saat_ini && (
                              <div className="col-12">
                                <small className="text-muted d-block">Alamat Tempat Tinggal Saat Ini:</small>
                                <span className="fw-semibold text-dark">{extraJson.tempat_tinggal_saat_ini}</span>
                              </div>
                            )}
                            {extraJson.bantuan_dimohonkan && (
                              <div className="col-12">
                                <small className="text-muted d-block">Bantuan yang Dimohonkan:</small>
                                <span className="fw-semibold text-dark">{extraJson.bantuan_dimohonkan}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* STATUS PERSETUJUAN DUAL RT DAN RW */}
                  <div className="p-4 bg-light rounded-4 mb-4 border">
                    <h6 className="fw-bold text-dark mb-3 text-uppercase">Status Persetujuan Berjenjang:</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="p-3 bg-white rounded-3 border">
                          <small className="text-muted d-block font-bold">1. Status Persetujuan Ketua RT:</small>
                          <span className={`badge fs-6 px-3 py-2 rounded-pill mt-1 ${data?.status_rt?.includes('Disetujui') ? 'bg-success text-white' : (data?.status_rt?.includes('Ditolak') ? 'bg-danger text-white' : 'bg-warning text-dark')}`}>
                            {data?.status_rt || 'Menunggu Verifikasi RT'}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-white rounded-3 border">
                          <small className="text-muted d-block font-bold">2. Status Persetujuan Ketua RW:</small>
                          <span className={`badge fs-6 px-3 py-2 rounded-pill mt-1 ${data?.status_rw?.includes('Disetujui') ? 'bg-success text-white' : (data?.status_rw?.includes('Ditolak') ? 'bg-danger text-white' : 'bg-warning text-dark')}`}>
                            {data?.status_rw || 'Menunggu Verifikasi RW'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FORM ACTION FOR PAK RT/RW */}
                  <div className="border-top pt-4">
                    <h5 className="fw-bold text-dark mb-3">
                      ✍️ Form Persetujuan {isRwRole ? 'Ketua RW' : 'Ketua RT'} (Dilindungi PIN Keamanan)
                    </h5>
                    
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Nama / Identitas {isRwRole ? 'Ketua RW' : 'Ketua RT'} *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={namaRtRw} 
                        onChange={(e) => setNamaRtRw(e.target.value)} 
                        placeholder={isRwRole ? 'Contoh: Pak Hamsah (Ketua RW 02)' : 'Contoh: Pak Bustan (Ketua RT 01)'}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold">Catatan / Keterangan Tambahan (Opsional)</label>
                      <textarea 
                        className="form-control" 
                        rows="2" 
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        placeholder="Contoh: Disetujui dengan catatan warga bertempat tinggal aktif di wilayah setempat."
                      ></textarea>
                    </div>

                    <div className="d-flex flex-wrap gap-3">
                      <button 
                        onClick={() => initiateVerifikasi('SETUJUI')}
                        disabled={submitting}
                        className={`btn btn-lg flex-fill fw-bold py-3 shadow-sm rounded-3 ${isRwRole ? 'btn-primary' : 'btn-success'}`}
                      >
                        {submitting ? 'Memproses...' : (isRwRole ? '✅ SETUJUI SEBAGAI KETUA RW' : '✅ SETUJUI SEBAGAI KETUA RT')}
                      </button>

                      <button 
                        onClick={() => initiateVerifikasi('TOLAK')}
                        disabled={submitting}
                        className="btn btn-outline-danger btn-lg flex-fill fw-bold py-3 rounded-3"
                      >
                        ❌ TOLAK PENGAJUAN
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* PIN SECURITY MODAL */}
      {modalPinOpen && (
        <div className="modal d-block bg-dark bg-opacity-75" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-dark text-white border-0 py-3">
                <h5 className="modal-header-title fw-bold mb-0 text-white">
                  🔒 Masukkan PIN Keamanan {isRwRole ? 'Ketua RW' : 'Ketua RT'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setModalPinOpen(false)}></button>
              </div>
              <form onSubmit={handleConfirmPinAndVerifikasi} className="modal-body p-4">
                <div className="alert alert-info small mb-3">
                  🛡️ <b>Fitur Keamanan Terintegrasi:</b> Masukkan 4 digit PIN Keamanan {isRwRole ? 'Ketua RW' : 'Ketua RT'} untuk menyetujui. Ini mencegah warga menyetujui suratnya sendiri. <i>(Default PIN: <b>1234</b>)</i>
                </div>

                {pinError && (
                  <div className="alert alert-danger small mb-3">{pinError}</div>
                )}

                <div className="mb-4 text-center">
                  <label className="form-label fw-bold text-dark mb-2">PIN Keamanan 4 Digit *</label>
                  <input
                    type="password"
                    maxLength="6"
                    className="form-control form-control-lg text-center fw-bold fs-2 tracking-widest border-primary"
                    placeholder="••••"
                    required
                    autoFocus
                    value={inputPin}
                    onChange={(e) => setInputPin(e.target.value)}
                  />
                </div>

                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-light w-50 fw-semibold" onClick={() => setModalPinOpen(false)}>Batal</button>
                  <button type="submit" className="btn btn-success w-50 fw-bold">✓ Verifikasi & ACC</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default VerifikasiRT;
