import { API_BASE_URL } from './apiConfig';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';

const getImageSrc = (foto, apiBaseUrl = API_BASE_URL) => {
  if (!foto) return null;
  if (typeof foto === 'string' && (foto.startsWith('data:') || foto.startsWith('http://') || foto.startsWith('https://') || foto.startsWith('/assets/'))) {
    return foto;
  }
  return `${apiBaseUrl}/uploads/${foto}`;
};

const DEFAULT_PKK = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  nama_wilayah: `RW 0${i + 1}`,
  pkk_rw: i + 1,
  pkk_rt: i === 0 ? 3 : i === 1 ? 3 : 2,
  dasa_wisma: 4 + (i % 3),
  krt: 250 + i * 15,
  kk: 300 + i * 20,
  pria: 600 + i * 25,
  wanita: 590 + i * 25
}));

function Profil() {
  const [aparaturList, setAparaturList] = useState(() => {
    try {
      const local = JSON.parse(localStorage.getItem('store_aparatur') || 'null');
      return Array.isArray(local) && local.length > 0 ? local : [];
    } catch (e) { return []; }
  });
  const [info, setInfo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('store_info') || '{}');
    } catch (e) { return {}; }
  });
  const [pkkWilayah, setPkkWilayah] = useState(() => {
    try {
      const local = JSON.parse(localStorage.getItem('store_pkk') || 'null');
      return Array.isArray(local) && local.length > 0 ? local : DEFAULT_PKK;
    } catch (e) { return DEFAULT_PKK; }
  });
  const [loading, setLoading] = useState(false);

  const reloadFromLocal = useCallback(() => {
    try {
      const localAparatur = JSON.parse(localStorage.getItem('store_aparatur') || 'null');
      if (Array.isArray(localAparatur) && localAparatur.length > 0) setAparaturList(localAparatur);
      const localInfo = JSON.parse(localStorage.getItem('store_info') || 'null');
      if (localInfo && Object.keys(localInfo).length > 0) setInfo(localInfo);
      const localPkk = JSON.parse(localStorage.getItem('store_pkk') || 'null');
      if (Array.isArray(localPkk) && localPkk.length > 0) setPkkWilayah(localPkk);
    } catch (e) {}
  }, []);

  useEffect(() => {
    reloadFromLocal();

    // Listen to changes from Admin in other tabs / same window
    const handleStorage = () => reloadFromLocal();
    const handleCustomStore = (e) => {
      if (e?.detail?.key === 'aparatur' && Array.isArray(e.detail.data)) setAparaturList(e.detail.data);
      if (e?.detail?.key === 'info' && e.detail.data) setInfo(e.detail.data);
      if (e?.detail?.key === 'pkk' && Array.isArray(e.detail.data)) setPkkWilayah(e.detail.data);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('lompoe_store_update', handleCustomStore);

    const fetchData = async () => {
      try {
        const [resAparatur, resInfo, resPkk] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/aparatur?_t=${Date.now()}`).catch(() => null),
          axios.get(`${API_BASE_URL}/api/info-kelurahan?_t=${Date.now()}`).catch(() => null),
          axios.get(`${API_BASE_URL}/api/pkk-wilayah?_t=${Date.now()}`).catch(() => null)
        ]);

        if (resAparatur?.data && Array.isArray(resAparatur.data) && resAparatur.data.length > 0) {
          setAparaturList(resAparatur.data);
          localStorage.setItem('store_aparatur', JSON.stringify(resAparatur.data));
        }

        if (resInfo?.data && Object.keys(resInfo.data).length > 0) {
          setInfo(resInfo.data);
          localStorage.setItem('store_info', JSON.stringify(resInfo.data));
        }

        if (resPkk?.data && Array.isArray(resPkk.data) && resPkk.data.length > 0) {
          setPkkWilayah(resPkk.data);
          localStorage.setItem('store_pkk', JSON.stringify(resPkk.data));
        }
      } catch (err) {
        console.error('Error fetching profil:', err);
      }
    };
    fetchData();

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('lompoe_store_update', handleCustomStore);
    };
  }, [reloadFromLocal]);

  const lurah = aparaturList.find(a => a.is_lurah === 1 || a.is_lurah === '1' || (a.jabatan && a.jabatan.toLowerCase().includes('lurah'))) || aparaturList[0];
  const stafList = lurah ? aparaturList.filter(a => String(a.id) !== String(lurah.id)) : aparaturList;

  // Totals for PKK table
  const totalKRT = pkkWilayah.reduce((acc, curr) => acc + (parseInt(curr.krt) || 0), 0);
  const totalKK = pkkWilayah.reduce((acc, curr) => acc + (parseInt(curr.kk) || 0), 0);
  const totalPria = pkkWilayah.reduce((acc, curr) => acc + (parseInt(curr.pria) || 0), 0);
  const totalWanita = pkkWilayah.reduce((acc, curr) => acc + (parseInt(curr.wanita) || 0), 0);
  const totalJiwa = totalPria + totalWanita;

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#f4f7f6' }}>
      <Navbar />

      {/* Header Banner */}
      <div className="bg-primary text-white py-4 shadow-sm" style={{ backgroundColor: '#0f4c75' }}>
        <div className="container">
          <h2 className="fw-bold text-white mb-1">Profil, Data Wilayah & Struktur Organisasi</h2>
          <p className="mb-0 opacity-75">Kelurahan Lompoe, Kecamatan Bacukiki, Kota Parepare</p>
        </div>
      </div>

      <div className="container my-5">
        <div className="row g-4">

          {/* Profil & Sambutan Lurah */}
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
              <div className="card-body p-4 p-md-5">
                <div className="row align-items-center g-4">
                  <div className="col-md-4 text-center">
                    {getImageSrc(lurah?.foto) ? (
                      <img 
                        src={getImageSrc(lurah?.foto)} 
                        alt={lurah.nama} 
                        className="rounded-circle border border-4 border-primary shadow"
                        style={{ width: '170px', height: '170px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="bg-light rounded-circle border border-4 border-primary shadow d-flex align-items-center justify-content-center mx-auto" style={{ width: '170px', height: '170px', fontSize: '4.5rem' }}>
                        🧑🏻‍💼
                      </div>
                    )}
                    <h5 className="fw-bold mt-3 mb-0" style={{ color: '#0f4c75' }}>{lurah?.nama || 'Lurah Lompoe'}</h5>
                    <span className="badge bg-primary px-3 py-1 mb-2 rounded-pill mt-1">{lurah?.jabatan || 'Lurah'}</span>
                    <small className="text-muted d-block">NIP: {lurah?.nip || '-'}</small>
                  </div>
                  <div className="col-md-8">
                    <h4 className="fw-bold mb-3" style={{ color: '#0f4c75' }}>Sambutan Lurah Lompoe</h4>
                    <p className="text-secondary leading-relaxed mb-4">
                      "{lurah?.sambutan || 'Selamat datang di Website Resmi Kelurahan Lompoe. Portal ini hadir untuk memberikan kemudahan pelayanan administrasi digital dan transparansi informasi bagi seluruh warga Kelurahan Lompoe, Kecamatan Bacukiki, Kota Parepare.'}"
                    </p>
                    <hr />
                    <h6 className="fw-bold text-dark">Deskripsi Kelurahan Lompoe:</h6>
                    <p className="text-muted small mb-0">
                      {info.deskripsi_profil || 'Kelurahan Lompoe adalah salah satu kelurahan yang terletak di Kecamatan Bacukiki, Kota Parepare, Sulawesi Selatan. Memiliki 10 Wilayah RW dan 26 RT yang berkembang sebagai pusat permukiman warga berbasis pelayanan publik digital.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TABEL DATA UMUM WILAYAH & PENDUDUK (Sesuai Papan Resmi TP PKK) */}
          <div className="col-12 mt-5">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
              <div className="card-header text-white p-4 border-0 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#0f4c75' }}>
                <div>
                  <h4 className="fw-bold text-white mb-1">📊 Data Umum Penduduk & Wilayah RW (TP PKK)</h4>
                  <p className="mb-0 text-white-50 small">Rekapitulasi Data KRT, KK, dan Jumlah Jiwa per Wilayah Kelurahan Lompoe</p>
                </div>
                <span className="badge bg-warning text-dark px-3 py-2 fw-bold fs-6">Terupdate Dynamic</span>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-bordered table-hover align-middle mb-0 text-center">
                    <thead className="table-dark small text-uppercase">
                      <tr>
                        <th rowSpan="2" className="align-middle">No</th>
                        <th rowSpan="2" className="align-middle">Nama Wilayah</th>
                        <th colSpan="3" className="align-middle bg-primary">Jumlah Kelompok</th>
                        <th rowSpan="2" className="align-middle">KRT</th>
                        <th rowSpan="2" className="align-middle">KK</th>
                        <th colSpan="2" className="align-middle bg-success">Jumlah Jiwa</th>
                        <th rowSpan="2" className="align-middle bg-info text-white">Total Jiwa</th>
                      </tr>
                      <tr>
                        <th className="bg-primary opacity-90">PKK RW</th>
                        <th className="bg-primary opacity-90">PKK RT</th>
                        <th className="bg-primary opacity-90">Dasa Wisma</th>
                        <th className="bg-success opacity-90">Laki-laki (L)</th>
                        <th className="bg-success opacity-90">Perempuan (P)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pkkWilayah.length === 0 ? (
                        <tr><td colSpan="10" className="py-4 text-muted">Belum ada data wilayah.</td></tr>
                      ) : (
                        pkkWilayah.map((w, idx) => (
                          <tr key={w.id}>
                            <td className="fw-bold">{idx + 1}</td>
                            <td className="fw-bold text-start ps-3 text-primary">{w.nama_wilayah}</td>
                            <td>{w.pkk_rw}</td>
                            <td>{w.pkk_rt}</td>
                            <td>{w.dasa_wisma}</td>
                            <td>{w.krt.toLocaleString('id-ID')}</td>
                            <td><strong className="text-dark">{w.kk.toLocaleString('id-ID')}</strong></td>
                            <td className="text-primary fw-semibold">{w.pria.toLocaleString('id-ID')}</td>
                            <td className="text-danger fw-semibold">{w.wanita.toLocaleString('id-ID')}</td>
                            <td className="fw-bold bg-light">{(w.pria + w.wanita).toLocaleString('id-ID')} Jiwa</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="table-dark font-bold fs-6">
                      <tr>
                        <td colSpan="2" className="text-center fw-bold">JUMLAH TOTAL</td>
                        <td>10</td>
                        <td>26</td>
                        <td>10</td>
                        <td>{totalKRT.toLocaleString('id-ID')}</td>
                        <td>{totalKK.toLocaleString('id-ID')}</td>
                        <td>{totalPria.toLocaleString('id-ID')}</td>
                        <td>{totalWanita.toLocaleString('id-ID')}</td>
                        <td className="text-warning fw-extrabold">{totalJiwa.toLocaleString('id-ID')} Jiwa</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Bagan Struktur Organisasi */}
          <div className="col-12 mt-5">
            <div className="text-center mb-4">
              <h3 className="fw-bold" style={{ color: '#0f4c75' }}>🏛️ Susunan Aparatur & Struktur Organisasi</h3>
              <p className="text-muted">Pegawai & Staf Pengelola Kelurahan Lompoe</p>
            </div>

            {loading ? (
              <div className="text-center py-4">Memuat struktur organisasi...</div>
            ) : (
              <div className="row g-4 justify-content-center">
                {lurah && (
                  <div className="col-12 text-center mb-2">
                    <div className="card border-0 shadow-sm rounded-4 d-inline-block p-4 mx-auto bg-white" style={{ borderTop: '4px solid #0f4c75', minWidth: '280px', maxWidth: '380px' }}>
                      <div className="bg-primary text-white rounded-pill px-3 py-1 d-inline-block small fw-bold mb-2">Pimpinan Kelurahan</div>
                      <h5 className="fw-bold mb-1">{lurah.nama}</h5>
                      <p className="text-primary fw-semibold mb-1">{lurah.jabatan}</p>
                      <small className="text-muted">NIP: {lurah.nip || '-'}</small>
                    </div>
                  </div>
                )}

                {stafList.map((staf) => (
                  <div key={staf.id} className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100 text-center p-4 bg-white card-hover">
                      {getImageSrc(staf.foto) ? (
                        <img 
                          src={getImageSrc(staf.foto)} 
                          alt={staf.nama}
                          className="rounded-circle border mb-3 mx-auto shadow-sm"
                          style={{ width: '90px', height: '90px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="bg-light text-primary rounded-circle border mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '90px', height: '90px', fontSize: '2.5rem' }}>
                          👔
                        </div>
                      )}
                      <h6 className="fw-bold mb-1">{staf.nama}</h6>
                      <p className="text-primary small fw-semibold mb-1">{staf.jabatan}</p>
                      <small className="text-muted">NIP: {staf.nip || '-'}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Peta Administrasi & Batas Wilayah RW */}
          <div className="col-12 mt-5">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
              <div className="card-header bg-white pt-4 pb-2 border-0">
                <h4 className="fw-bold mb-0" style={{ color: '#0f4c75' }}>🗺️ Peta Administrasi & Batas Wilayah</h4>
              </div>
              <div className="card-body">
                <div className="row g-4">
                  <div className="col-md-6">
                    <h6 className="fw-bold mb-3">Batas-Batas Wilayah Kelurahan:</h6>
                    <div className="table-responsive">
                      <table className="table table-bordered align-middle">
                        <tbody>
                          <tr>
                            <td className="bg-light fw-bold" style={{ width: '30%' }}>Sebelah Utara</td>
                            <td>{info.batas_utara || 'Kelurahan Galung Maloang'}</td>
                          </tr>
                          <tr>
                            <td className="bg-light fw-bold">Sebelah Selatan</td>
                            <td>{info.batas_selatan || 'Kelurahan Lemoe'}</td>
                          </tr>
                          <tr>
                            <td className="bg-light fw-bold">Sebelah Timur</td>
                            <td>{info.batas_timur || 'Kecamatan Bacukiki Barat'}</td>
                          </tr>
                          <tr>
                            <td className="bg-light fw-bold">Sebelah Barat</td>
                            <td>{info.batas_barat || 'Kelurahan Watang Bacukiki'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="alert alert-info mt-3 small">
                      📍 Kelurahan Lompoe terbagi menjadi <strong>10 Wilayah RW</strong> dan <strong>26 RT</strong> dengan Luas Wilayah 30.9 Ha.
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                      <h6 className="fw-bold mb-0">Peta Digital Google Maps:</h6>
                      <a 
                        href={info.embed_map_url || "https://maps.app.goo.gl/zdHwb9f13x8q8K1U8"} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold"
                      >
                        <i className="bi bi-box-arrow-up-right me-1"></i> Buka Aplikasi Maps ↗
                      </a>
                    </div>

                    <div className="ratio ratio-16x9 rounded-4 overflow-hidden border shadow-sm">
                      <iframe 
                        src={
                          !info.embed_map_url || info.embed_map_url.includes('maps.app.goo.gl') || !info.embed_map_url.includes('embed')
                            ? "https://maps.google.com/maps?q=Kantor+Kelurahan+Lompoe+Bacukiki+Parepare&t=&z=15&ie=UTF8&iwloc=&output=embed"
                            : info.embed_map_url
                        } 
                        title="Peta Digital Kelurahan Lompoe Parepare" 
                        allowFullScreen="" 
                        loading="lazy"
                        style={{ border: 0 }}
                      >
                      </iframe>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Profil;
