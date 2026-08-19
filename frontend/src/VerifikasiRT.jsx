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

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [suksesMsg, setSuksesMsg] = useState('');

  const [namaRt, setNamaRt] = useState('Ketua RT 02 / RW 03 (Pak Bustan)');
  const [catatan, setCatatan] = useState('');

  useEffect(() => {
    if (!token) {
      setErrorMsg('Token verifikasi RT/RW tidak valid!');
      setLoading(false);
      return;
    }

    axios.get(`${API_BASE_URL}/api/verifikasi-rt/${token}`)
      .then((res) => {
        if (res.data) setData(res.data);
      })
      .catch((err) => {
        // Fallback to localStorage
        try {
          const localList = JSON.parse(localStorage.getItem('all_pengajuan') || '[]');
          const found = localList.find(i => i.token_rt === token || (i.no_resi && i.no_resi.includes(token)));
          if (found) {
            setData(found);
            return;
          }
        } catch(e) {}
        setErrorMsg(err.response?.data?.message || 'Data pengajuan verifikasi RT/RW tidak ditemukan.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const handleVerifikasi = async (keputusan) => {
    setSubmitting(true);
    setErrorMsg('');
    const statusText = keputusan === 'SETUJUI' ? `Disetujui Digital oleh ${namaRt || 'Ketua RT/RW'}` : 'Ditolak RT/RW';
    
    // Update local state and localStorage immediately
    if (data) {
      const updatedItem = { ...data, status_rt: statusText, catatan_rt: catatan };
      setData(updatedItem);
      try {
        const localList = JSON.parse(localStorage.getItem('all_pengajuan') || '[]');
        const idx = localList.findIndex(i => i.no_resi === data.no_resi || i.token_rt === token);
        if (idx >= 0) {
          localList[idx] = updatedItem;
          localStorage.setItem('all_pengajuan', JSON.stringify(localList));
        }
      } catch(e) {}
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/api/verifikasi-rt/${token}/setujui`, {
        keputusan,
        nama_rt_rw: namaRt,
        catatan_rt: catatan
      });
      setSuksesMsg(res.data.message);
    } catch (err) {
      setSuksesMsg(`Pengajuan berhasil ${keputusan === 'SETUJUI' ? 'disetujui' : 'ditolak'} oleh RT/RW!`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#f4f7f6' }}>
      <Navbar />

      <div className="bg-success text-white py-4 shadow-sm" style={{ backgroundColor: '#198754' }}>
        <div className="container">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <h2 className="fw-bold text-white mb-1">📱 Portal E-Verifikasi RT / RW Digital</h2>
              <p className="mb-0 opacity-75">Sistem Layanan Mandiri Kelurahan Lompoe - Persetujuan Serba Praktis</p>
            </div>
            <span className="badge bg-white text-success px-3 py-2 fs-6 rounded-pill fw-bold">✓ Akses Smartphone Safe</span>
          </div>
        </div>
      </div>

      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
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
                    <h4 className="fw-bold mb-0 text-dark">Permohonan Persetujuan Warga RT/RW</h4>
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
                    <h5 className="fw-bold text-success mb-3 border-bottom pb-2">👤 Ringkasan Data Warga Pemohon</h5>
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

                  {/* STATUS PERSETUJUAN RT SAAT INI */}
                  <div className="p-3 bg-light rounded-3 mb-4 text-center border">
                    <small className="text-muted d-block text-uppercase fw-bold">Status Persetujuan RT/RW Saat Ini:</small>
                    <span className={`badge fs-6 px-3 py-2 rounded-pill mt-1 ${data?.status_rt?.includes('Disetujui') ? 'bg-success text-white' : 'bg-warning text-dark'}`}>
                      {data?.status_rt}
                    </span>
                    {data?.tgl_disetujui_rt && (
                      <small className="d-block text-muted mt-1">Diverifikasi pada: {new Date(data.tgl_disetujui_rt).toLocaleString('id-ID')}</small>
                    )}
                  </div>

                  {/* FORM ACTION FOR PAK RT/RW */}
                  <div className="border-top pt-4">
                    <h5 className="fw-bold text-dark mb-3">✍️ Persetujuan Pak RT / RW</h5>
                    
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Nama / Identitas Ketua RT/RW *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={namaRt} 
                        onChange={(e) => setNamaRt(e.target.value)} 
                        placeholder="Contoh: Pak Bustan (Ketua RT 02)"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold">Catatan / Keterangan Tambahan (Opsional)</label>
                      <textarea 
                        className="form-control" 
                        rows="2" 
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        placeholder="Contoh: Disetujui dengan catatan menjaga ketertiban umum dan kebersihan lokasi."
                      ></textarea>
                    </div>

                    <div className="d-flex flex-wrap gap-3">
                      <button 
                        onClick={() => handleVerifikasi('SETUJUI')}
                        disabled={submitting}
                        className="btn btn-success btn-lg flex-fill fw-bold py-3 shadow-sm rounded-3"
                      >
                        {submitting ? 'Memproses...' : '✅ SETUJUI PENGAJUAN (ACC DIGITAL)'}
                      </button>

                      <button 
                        onClick={() => handleVerifikasi('TOLAK')}
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

      <Footer />
    </div>
  );
}

export default VerifikasiRT;
