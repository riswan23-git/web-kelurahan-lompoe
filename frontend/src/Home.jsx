import { API_BASE_URL } from './apiConfig';
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
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

const DEFAULT_DARURAT = [
  { id: 1, nama_instansi: 'Call Center Parepare', nomor_telepon: '112', icon: '🚨' },
  { id: 2, nama_instansi: 'Polsek Bacukiki', nomor_telepon: '(0421) 12345', icon: '🚓' },
  { id: 3, nama_instansi: 'Pemadam Kebakaran', nomor_telepon: '113', icon: '🚒' },
  { id: 4, nama_instansi: 'Puskesmas Bacukiki', nomor_telepon: '(0421) 21118', icon: '🏥' }
];

function Home() {
  const [lurah, setLurah] = useState(() => {
    try {
      const local = JSON.parse(localStorage.getItem('store_aparatur') || 'null');
      if (Array.isArray(local) && local.length > 0) {
        return local.find(a => a.is_lurah === 1 || a.is_lurah === '1' || (a.jabatan && a.jabatan.toLowerCase().includes('lurah'))) || local[0];
      }
      return null;
    } catch (e) { return null; }
  });

  const [stats, setStats] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('store_stats') || 'null') || { total_pria: 6285, total_wanita: 6185, total_kk: 3772, total_rt: 26, total_rw: 10, luas_wilayah: '30.9 Ha' };
    } catch (e) { return { total_pria: 6285, total_wanita: 6185, total_kk: 3772, total_rt: 26, total_rw: 10, luas_wilayah: '30.9 Ha' }; }
  });

  const [beritaList, setBeritaList] = useState(() => {
    try {
      const local = JSON.parse(localStorage.getItem('store_berita') || 'null');
      return Array.isArray(local) && local.length > 0 ? local : [];
    } catch (e) { return []; }
  });

  const [saranaList, setSaranaList] = useState(() => {
    try {
      const local = JSON.parse(localStorage.getItem('store_sarana') || 'null');
      return Array.isArray(local) && local.length > 0 ? local : [];
    } catch (e) { return []; }
  });

  const [nomorDaruratList, setNomorDaruratList] = useState(() => {
    try {
      const local = JSON.parse(localStorage.getItem('store_nomor_darurat') || 'null');
      return Array.isArray(local) && local.length > 0 ? local : DEFAULT_DARURAT;
    } catch (e) { return DEFAULT_DARURAT; }
  });

  const [loading, setLoading] = useState(false);

  const reloadFromLocal = useCallback(() => {
    try {
      const localAparatur = JSON.parse(localStorage.getItem('store_aparatur') || 'null');
      if (Array.isArray(localAparatur) && localAparatur.length > 0) {
        setLurah(localAparatur.find(a => a.is_lurah === 1 || a.is_lurah === '1' || (a.jabatan && a.jabatan.toLowerCase().includes('lurah'))) || localAparatur[0]);
      }
      const localStats = JSON.parse(localStorage.getItem('store_stats') || 'null');
      if (localStats) setStats(localStats);
      const localBerita = JSON.parse(localStorage.getItem('store_berita') || 'null');
      if (Array.isArray(localBerita)) setBeritaList(localBerita);
      const localSarana = JSON.parse(localStorage.getItem('store_sarana') || 'null');
      if (Array.isArray(localSarana)) setSaranaList(localSarana);
      const localDarurat = JSON.parse(localStorage.getItem('store_nomor_darurat') || 'null');
      if (Array.isArray(localDarurat) && localDarurat.length > 0) setNomorDaruratList(localDarurat);
    } catch (e) {}
  }, []);

  useEffect(() => {
    reloadFromLocal();

    const handleStorage = () => reloadFromLocal();
    const handleCustomStore = (e) => {
      if (e?.detail?.key === 'aparatur' && Array.isArray(e.detail.data)) {
        setLurah(e.detail.data.find(a => a.is_lurah === 1 || a.is_lurah === '1' || (a.jabatan && a.jabatan.toLowerCase().includes('lurah'))) || e.detail.data[0]);
      }
      if (e?.detail?.key === 'statistik' && e.detail.data) setStats(e.detail.data);
      if (e?.detail?.key === 'berita' && Array.isArray(e.detail.data)) setBeritaList(e.detail.data);
      if (e?.detail?.key === 'sarana' && Array.isArray(e.detail.data)) setSaranaList(e.detail.data);
      if (e?.detail?.key === 'nomor_darurat' && Array.isArray(e.detail.data)) setNomorDaruratList(e.detail.data);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('lompoe_store_update', handleCustomStore);

    // Fetch API in background with direct cloud-store priority
    Promise.all([
      axios.get(`${API_BASE_URL}/api/aparatur?_t=${Date.now()}`).catch(() => null),
      axios.get(`${API_BASE_URL}/api/cloud-store?_t=${Date.now()}`).catch(() => null)
    ]).then(([resApi, resCloud]) => {
      const cloudAparatur = resCloud?.data?.aparatur;
      const serverAparatur = resApi?.data && Array.isArray(resApi.data) ? resApi.data : [];
      const localAparatur = JSON.parse(localStorage.getItem('store_aparatur') || '[]');
      const deletedIds = JSON.parse(localStorage.getItem('deleted_aparatur_ids') || '[]');

      let targetAparatur = [];
      if (Array.isArray(cloudAparatur) && cloudAparatur.length > 0) {
        targetAparatur = cloudAparatur;
      } else if (Array.isArray(serverAparatur) && serverAparatur.length > 0) {
        targetAparatur = serverAparatur;
      } else if (Array.isArray(localAparatur) && localAparatur.length > 0) {
        targetAparatur = localAparatur;
      }

      const filteredList = targetAparatur.filter(item => item && item.id && !deletedIds.includes(String(item.id)));
      if (filteredList.length > 0) {
        const apiLurah = filteredList.find(a => a.is_lurah === 1 || a.is_lurah === '1' || (a.jabatan && a.jabatan.toLowerCase().includes('lurah'))) || filteredList[0];
        setLurah(apiLurah || null);
        localStorage.setItem('store_aparatur', JSON.stringify(filteredList));
      }
    }).catch(() => {});

    axios.get(`${API_BASE_URL}/api/statistik?_t=${Date.now()}`)
      .then(res => {
        if (res.data && Object.keys(res.data).length > 0) {
          setStats(res.data);
          localStorage.setItem('store_stats', JSON.stringify(res.data));
        }
      }).catch(() => {});

    Promise.all([
      axios.get(`${API_BASE_URL}/api/berita?_t=${Date.now()}`).catch(() => null),
      axios.get(`${API_BASE_URL}/api/cloud-store?_t=${Date.now()}`).catch(() => null)
    ]).then(([resApi, resCloud]) => {
      const cloudBerita = resCloud?.data?.berita;
      const serverBerita = resApi?.data && Array.isArray(resApi.data) ? resApi.data : [];
      const localBerita = JSON.parse(localStorage.getItem('store_berita') || '[]');
      const deletedIds = JSON.parse(localStorage.getItem('deleted_berita_ids') || '[]');

      let targetBerita = [];
      if (Array.isArray(cloudBerita) && cloudBerita.length > 0) {
        targetBerita = cloudBerita;
      } else if (Array.isArray(serverBerita) && serverBerita.length > 0) {
        targetBerita = serverBerita;
      } else if (Array.isArray(localBerita) && localBerita.length > 0) {
        targetBerita = localBerita;
      }

      const filteredList = targetBerita.filter(item => item && item.id && !deletedIds.includes(String(item.id)));
      if (filteredList.length > 0) {
        setBeritaList(filteredList);
        localStorage.setItem('store_berita', JSON.stringify(filteredList));
      }
    }).catch(() => {});

    Promise.all([
      axios.get(`${API_BASE_URL}/api/sarana?_t=${Date.now()}`).catch(() => null),
      axios.get(`${API_BASE_URL}/api/cloud-store?_t=${Date.now()}`).catch(() => null)
    ]).then(([resApi, resCloud]) => {
      const cloudSarana = resCloud?.data?.sarana;
      const serverSarana = resApi?.data && Array.isArray(resApi.data) ? resApi.data : [];
      const localSarana = JSON.parse(localStorage.getItem('store_sarana') || '[]');
      const deletedIds = JSON.parse(localStorage.getItem('deleted_sarana_ids') || '[]');

      let targetSarana = [];
      if (Array.isArray(cloudSarana) && cloudSarana.length > 0) {
        targetSarana = cloudSarana;
      } else if (Array.isArray(serverSarana) && serverSarana.length > 0) {
        targetSarana = serverSarana;
      } else if (Array.isArray(localSarana) && localSarana.length > 0) {
        targetSarana = localSarana;
      }

      const filteredList = targetSarana.filter(item => item && item.id && !deletedIds.includes(String(item.id)));
      if (filteredList.length > 0) {
        setSaranaList(filteredList);
        localStorage.setItem('store_sarana', JSON.stringify(filteredList));
      }
    }).catch(() => {});

    Promise.all([
      axios.get(`${API_BASE_URL}/api/nomor-darurat?_t=${Date.now()}`).catch(() => null),
      axios.get(`${API_BASE_URL}/api/cloud-store?_t=${Date.now()}`).catch(() => null)
    ]).then(([resApi, resCloud]) => {
      const cloudDarurat = resCloud?.data?.nomor_darurat;
      const serverDarurat = resApi?.data && Array.isArray(resApi.data) ? resApi.data : [];
      const localDarurat = JSON.parse(localStorage.getItem('store_nomor_darurat') || '[]');
      const deletedIds = JSON.parse(localStorage.getItem('deleted_darurat_ids') || '[]');

      let targetDarurat = [];
      if (Array.isArray(cloudDarurat) && cloudDarurat.length > 0) {
        targetDarurat = cloudDarurat;
      } else if (Array.isArray(serverDarurat) && serverDarurat.length > 0) {
        targetDarurat = serverDarurat;
      } else if (Array.isArray(localDarurat) && localDarurat.length > 0) {
        targetDarurat = localDarurat;
      }

      const filteredList = targetDarurat.filter(item => item && item.id && !deletedIds.includes(String(item.id)));
      if (filteredList.length > 0) {
        setNomorDaruratList(filteredList);
        localStorage.setItem('store_nomor_darurat', JSON.stringify(filteredList));
      }
    }).catch(() => {});

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('lompoe_store_update', handleCustomStore);
    };
  }, [reloadFromLocal]);

  const totalPenduduk = (stats.total_pria || 0) + (stats.total_wanita || 0);

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#f8fafc' }}>
      <Navbar />

      {/* HERO BANNER CINEMATIC (REAL PHOTO KANTOR KELURAHAN LOMPOE) */}
      <div className="container-fluid px-2 px-md-4 mt-3">
        <div
          className="hero-wrapper-modern p-4 p-md-5 text-white shadow-lg rounded-4 overflow-hidden position-relative"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(7, 19, 37, 0.90) 0%, rgba(15, 76, 117, 0.82) 50%, rgba(30, 58, 138, 0.88) 100%), url('/assets/kantor_kelurahan_lompoe.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="row align-items-center g-4 position-relative z-2">
            <div className="col-lg-7">
              <div className="d-inline-flex align-items-center gap-2 bg-white bg-opacity-20 px-3.5 py-1.5 rounded-pill mb-3 border border-light border-opacity-30 shadow-sm backdrop-blur">
                <span className="pulse-dot-green"></span>
                <small className="fw-bold text-white tracking-wide text-uppercase" style={{ fontSize: '0.8rem' }}>
                  PEMERINTAH KOTA PAREPARE • KECAMATAN BACUKIKI
                </small>
              </div>

              <h1 className="hero-title-modern mb-3 text-white">
                Portal Pelayanan Digital & Informasi Warga Kelurahan Lompoe
              </h1>

              <p className="hero-sub-modern mb-4 opacity-95">
                Kemudahan pengurusan 13 jenis surat online Srikandi, permohonan persetujuan Lurah, status resi realtime, serta koordinasi live chat warga yang transparan dan efisien.
              </p>

              <div className="d-flex flex-wrap gap-3">
                <Link to="/ajukan-surat" className="btn btn-warning btn-lg px-4 py-3 fw-bold rounded-pill shadow-lg text-dark">
                  <i className="bi bi-file-earmark-plus-fill me-2"></i> Buat Pengajuan Surat
                </Link>
                <Link to="/cek-resi" className="btn btn-light btn-lg px-4 py-3 fw-bold rounded-pill text-primary shadow">
                  <i className="bi bi-search me-2 text-primary"></i> Lacak Status Resi
                </Link>
                <Link to="/chat" className="btn btn-success btn-lg px-4 py-3 fw-bold rounded-pill shadow">
                  <i className="bi bi-chat-dots-fill me-2"></i> Live Chat Staf
                </Link>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="glass-card-modern p-4 rounded-4 text-dark shadow-lg">
                <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
                  <h6 className="fw-bold mb-0 text-primary fs-5">
                    <i className="bi bi-shield-check text-success me-2"></i> Layanan Terpadu Warga
                  </h6>
                  <span className="badge bg-success text-white px-3 py-1.5 rounded-pill fw-bold">Online 24 Jam</span>
                </div>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3 text-center border">
                      <div className="fs-2 text-primary mb-1"><i className="bi bi-file-earmark-check"></i></div>
                      <div className="fw-bold text-dark fs-4">13 Surat</div>
                      <small className="text-secondary fw-semibold">Format Srikandi</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3 text-center border">
                      <div className="fs-2 text-success mb-1"><i className="bi bi-clock-history"></i></div>
                      <div className="fw-bold text-dark fs-4">Realtime</div>
                      <small className="text-secondary fw-semibold">Tracking Resi</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3 text-center border">
                      <div className="fs-2 text-warning mb-1"><i className="bi bi-chat-text-fill"></i></div>
                      <div className="fw-bold text-dark fs-4">WA Direct</div>
                      <small className="text-secondary fw-semibold">ACC RT/RW</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3 text-center border">
                      <div className="fs-2 text-info mb-1"><i className="bi bi-geo-alt-fill"></i></div>
                      <div className="fw-bold text-dark fs-4">{stats.total_rw || 10} RW</div>
                      <small className="text-secondary fw-semibold">26 RT Wilayah</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="container my-5">
        <div className="row g-4">

          {/* KOLOM KIRI: Sambutan Lurah, Akses Layanan & Berita */}
          <div className="col-lg-8">

            {/* Sambutan Lurah Card */}
            {lurah && (
              <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden hover-lift bg-white" style={{ borderLeft: '6px solid #0f4c75' }}>
                <div className="card-body p-4 p-md-5">
                  <div className="row align-items-center g-4">
                    <div className="col-md-4 text-center">
                      <div className="position-relative d-inline-block">
                        {getImageSrc(lurah.foto) ? (
                          <img
                            src={getImageSrc(lurah.foto)}
                            alt={lurah.nama}
                            className="rounded-circle border border-4 border-primary shadow-sm"
                            style={{ width: '125px', height: '125px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="bg-light text-primary rounded-circle border border-4 border-primary shadow-sm d-flex align-items-center justify-content-center mx-auto" style={{ width: '125px', height: '125px', fontSize: '3.5rem' }}>
                            <i className="bi bi-person-badge"></i>
                          </div>
                        )}
                        <span className="position-absolute bottom-0 end-0 bg-success text-white p-1 rounded-circle border border-white shadow-sm" title="Official Verified Lurah">
                          <i className="bi bi-check-circle-fill"></i>
                        </span>
                      </div>
                      <h6 className="fw-bold mt-3 mb-0 text-dark">{lurah.nama}</h6>
                      <span className="badge bg-primary px-3 py-1 rounded-pill mt-1">{lurah.jabatan}</span>
                      <small className="text-muted d-block mt-1">NIP: {lurah.nip || '-'}</small>
                    </div>
                    <div className="col-md-8">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <i className="bi bi-quote fs-1 text-primary opacity-50"></i>
                        <h5 className="section-header-title mb-0" style={{ color: '#0f4c75' }}>Sambutan Resmi Lurah Lompoe</h5>
                      </div>
                      <p className="fst-italic text-secondary leading-relaxed mb-3 mt-2" style={{ fontSize: '0.98rem' }}>
                        "{lurah.sambutan || 'Selamat datang di portal pelayanan digital Kelurahan Lompoe. Kami berkomitmen memberikan pelayanan administrasi yang inklusif, transparan, dan efisien bagi seluruh masyarakat.'}"
                      </p>
                      <Link to="/profil" className="btn btn-sm btn-outline-primary fw-bold rounded-pill px-3.5 py-2">
                        <i className="bi bi-arrow-right-circle-fill me-1.5"></i> Lihat Profil & Data Wilayah Selengkapnya
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Digital Service Grid */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
              <div className="card-header bg-white pt-4 pb-2 border-0">
                <h5 className="section-header-title mb-0" style={{ color: '#0f4c75' }}>
                  Akses Layanan Publik Digital
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="p-4 border rounded-4 h-100 bg-light hover-lift d-flex flex-column justify-content-between">
                      <div>
                        <div className="icon-badge bg-primary bg-opacity-10 text-primary mb-3">
                          <i className="bi bi-file-earmark-text-fill"></i>
                        </div>
                        <h6 className="fw-bold text-dark mb-1">Pengajuan Surat Online</h6>
                        <p className="text-muted small">Urus SKU, SKTM, Domisili, Keramaian, Rekomendasi BBM, & permohonan TTD Lurah tanpa perlu antre.</p>
                      </div>
                      <Link to="/ajukan-surat" className="btn btn-sm btn-primary fw-bold rounded-pill mt-3 py-2">
                        Ajukan Surat Sekarang →
                      </Link>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-4 border rounded-4 h-100 bg-light hover-lift d-flex flex-column justify-content-between">
                      <div>
                        <div className="icon-badge bg-warning bg-opacity-10 text-warning mb-3">
                          <i className="bi bi-search"></i>
                        </div>
                        <h6 className="fw-bold text-dark mb-1">Lacak Status Surat (Resi)</h6>
                        <p className="text-muted small">Pantau apakah dokumen Anda sudah disetujui atau siap diambil di kantor.</p>
                      </div>
                      <Link to="/cek-resi" className="btn btn-sm btn-outline-dark fw-bold rounded-pill mt-3 py-2">
                        Cek Resi Pengajuan →
                      </Link>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-4 border rounded-4 h-100 bg-light hover-lift d-flex flex-column justify-content-between">
                      <div>
                        <div className="icon-badge bg-success bg-opacity-10 text-success mb-3">
                          <i className="bi bi-chat-dots-fill"></i>
                        </div>
                        <h6 className="fw-bold text-dark mb-1">Live Chat Staf Kelurahan</h6>
                        <p className="text-muted small">Konsultasi syarat atau tanyakan keberadaan pegawai secara langsung.</p>
                      </div>
                      <Link to="/chat" className="btn btn-sm btn-success fw-bold rounded-pill mt-3 py-2">
                        Buka Ruang Chat →
                      </Link>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-4 border rounded-4 h-100 bg-light hover-lift d-flex flex-column justify-content-between">
                      <div>
                        <div className="icon-badge bg-info bg-opacity-10 text-info mb-3">
                          <i className="bi bi-building-check"></i>
                        </div>
                        <h6 className="fw-bold text-dark mb-1">Sarana & Prasarana</h6>
                        <p className="text-muted small">Informasi fasilitas umum, tempat ibadah, puskesmas, & posyandu wilayah.</p>
                      </div>
                      <Link to="/sarana" className="btn btn-sm btn-info text-white fw-bold rounded-pill mt-3 py-2">
                        Lihat Fasilitas Umum →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Kabar & Pengumuman Kelurahan */}
            <div className="card border-0 shadow-sm rounded-4 bg-white">
              <div className="card-header bg-white pt-4 pb-2 border-0 d-flex justify-content-between align-items-center">
                <h5 className="section-header-title mb-0" style={{ color: '#0f4c75' }}>
                  Kabar & Pengumuman Terkini
                </h5>
                <Link to="/berita" className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold">
                  Lihat Semua Berita
                </Link>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-4 text-muted">Memuat kabar kelurahan...</div>
                ) : beritaList.length === 0 ? (
                  <div className="text-center py-4 text-muted">Belum ada pengumuman terbaru.</div>
                ) : (
                  beritaList.slice(0, 3).map((item) => (
                    <div key={item.id} className="d-flex flex-column flex-sm-row gap-3 mb-4 pb-3 border-bottom align-items-start hover-lift p-2 rounded-3">
                      {getImageSrc(item.gambar) ? (
                        <img
                          src={getImageSrc(item.gambar)}
                          alt={item.judul}
                          className="rounded-3 shadow-sm"
                          style={{ width: '130px', height: '90px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="bg-secondary bg-opacity-10 text-secondary rounded-3 d-flex align-items-center justify-content-center" style={{ width: '130px', height: '90px', fontSize: '2rem' }}>
                          <i className="bi bi-newspaper"></i>
                        </div>
                      )}
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="badge bg-primary px-3 py-1 rounded-pill">{item.kategori || 'Informasi'}</span>
                          <small className="text-muted">📅 {new Date(item.created_at).toLocaleDateString('id-ID')}</small>
                        </div>
                        <h6 className="fw-bold text-dark mb-1">{item.judul}</h6>
                        <p className="text-muted small mb-0">
                          {item.isi.length > 130 ? item.isi.substring(0, 130) + '...' : item.isi}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* KOLOM KANAN: Statistik, Emergency Contacts, & Info Wilayah */}
          <div className="col-lg-4">

            {/* Widget Statistik Penduduk */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden bg-white">
              <div className="card-header text-white fw-bold py-3" style={{ backgroundColor: '#0f4c75' }}>
                <i className="bi bi-bar-chart-line-fill me-2"></i> Data Penduduk Resmi 2024
              </div>
              <div className="card-body p-0">
                <ul className="list-group list-group-flush small">
                  <li className="list-group-item d-flex justify-content-between align-items-center py-3 px-4">
                    <span className="d-flex align-items-center gap-2">
                      <span className="p-1.5 bg-primary bg-opacity-10 text-primary rounded-circle"><i className="bi bi-gender-male"></i></span>
                      Laki-laki
                    </span>
                    <span className="badge bg-primary rounded-pill px-3 py-2 fs-6">{(stats.total_pria || 6285).toLocaleString('id-ID')}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center py-3 px-4">
                    <span className="d-flex align-items-center gap-2">
                      <span className="p-1.5 bg-danger bg-opacity-10 text-danger rounded-circle"><i className="bi bi-gender-female"></i></span>
                      Perempuan
                    </span>
                    <span className="badge bg-danger rounded-pill px-3 py-2 fs-6">{(stats.total_wanita || 6185).toLocaleString('id-ID')}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center py-3 px-4 bg-light fw-bold">
                    <span className="d-flex align-items-center gap-2">
                      <span className="p-1.5 bg-success bg-opacity-10 text-success rounded-circle"><i className="bi bi-people-fill"></i></span>
                      Total Jiwa
                    </span>
                    <span className="text-primary fs-6 font-extrabold">{totalPenduduk.toLocaleString('id-ID')} Jiwa</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center py-3 px-4">
                    <span>🏠 Jumlah KK</span>
                    <span className="badge bg-success rounded-pill px-3 py-2 fs-6">{(stats.total_kk || 3772).toLocaleString('id-ID')} KK</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center py-3 px-4">
                    <span>📍 Wilayah RW / RT</span>
                    <span className="badge bg-dark rounded-pill px-3 py-2 fs-6">{stats.total_rw || 10} RW / {stats.total_rt || 26} RT</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center py-3 px-4">
                    <span>📐 Luas Wilayah</span>
                    <span className="fw-semibold text-secondary">{stats.luas_wilayah || '30.9 Ha'}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Emergency Contacts Widget */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white p-4">
              <h6 className="fw-bold mb-3 text-danger d-flex align-items-center">
                <i className="bi bi-telephone-outbound-fill me-2"></i> Nomor Darurat Parepare
              </h6>
              <div className="d-grid gap-2 small">
                {nomorDaruratList.length === 0 ? (
                  <div className="text-muted small">Memuat nomor darurat...</div>
                ) : (
                  nomorDaruratList.map((item) => (
                    <div key={item.id} className="d-flex justify-content-between align-items-center p-2.5 bg-light rounded-3 border">
                      <span className="fw-semibold">{item.icon || '🚨'} {item.nama_instansi}</span>
                      <a href={`tel:${item.nomor_telepon}`} className="btn btn-sm btn-danger fw-bold rounded-pill px-3">
                        {item.nomor_telepon}
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Link Struktur Organisasi */}
            <div className="card border-0 shadow-sm rounded-4 text-center p-4 bg-white">
              <div className="icon-badge bg-primary bg-opacity-10 text-primary mx-auto mb-2">
                <i className="bi bi-diagram-3-fill"></i>
              </div>
              <h5 className="fw-bold mb-1" style={{ color: '#0f4c75' }}>Data Wilayah & Struktur</h5>
              <p className="text-muted small mb-3">Tabel Rekapitulasi Data Warga 10 Wilayah RW, TP PKK, & Peta Digital Parepare.</p>
              <Link to="/profil" className="btn btn-outline-primary fw-bold rounded-pill py-2">
                Lihat Data Profil & Wilayah
              </Link>
            </div>

          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Home;