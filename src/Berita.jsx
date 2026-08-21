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

const DEFAULT_BERITA = [
  {
    id: 1,
    judul: 'Kegiatan Penguatan Ketahanan Pangan & Gotong Royong Warga Lompoe',
    kategori: 'Pengumuman',
    ringkasan: 'Warga Kelurahan Lompoe bersama aparatur kelurahan dan TP PKK melaksanakan kegiatan kebersihan lingkungan dan penanaman bibit tanaman pangan.',
    isi: 'Kegiatan gotong royong rutin dilaksanakan di seluruh wilayah RW Kelurahan Lompoe untuk menjaga kebersihan dan kekeluargaan antar warga.',
    created_at: '2026-08-10',
    gambar: null
  }
];

function Berita() {
  const [beritaList, setBeritaList] = useState(() => {
    try {
      const local = JSON.parse(localStorage.getItem('store_berita') || 'null');
      return Array.isArray(local) && local.length > 0 ? local : DEFAULT_BERITA;
    } catch (e) { return DEFAULT_BERITA; }
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('Semua');
  const [selectedBerita, setSelectedBerita] = useState(null);

  const reloadFromLocal = useCallback(() => {
    try {
      const localBerita = JSON.parse(localStorage.getItem('store_berita') || 'null');
      if (Array.isArray(localBerita) && localBerita.length > 0) {
        setBeritaList(localBerita);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    reloadFromLocal();

    const handleStorage = () => reloadFromLocal();
    const handleCustomStore = (e) => {
      if (e?.detail?.key === 'berita' && Array.isArray(e.detail.data)) {
        setBeritaList(e.detail.data);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('lompoe_store_update', handleCustomStore);

    const fetchBerita = async () => {
      try {
        localStorage.removeItem('deleted_berita_ids');
        const [response, resCloud] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/berita?_t=${Date.now()}`).catch(() => null),
          axios.get(`${API_BASE_URL}/api/cloud-store?_t=${Date.now()}`).catch(() => null)
        ]);

        const serverBerita = response?.data && Array.isArray(response.data) ? response.data : [];
        const cloudBerita = resCloud?.data?.berita || [];
        const localBerita = JSON.parse(localStorage.getItem('store_berita') || '[]');

        const combinedMap = new Map();
        if (Array.isArray(localBerita)) {
          localBerita.forEach(item => {
            if (item && item.id) combinedMap.set(String(item.id), item);
          });
        }
        if (Array.isArray(cloudBerita)) {
          cloudBerita.forEach(item => {
            if (item && item.id) combinedMap.set(String(item.id), item);
          });
        }
        if (Array.isArray(serverBerita)) {
          serverBerita.forEach(item => {
            if (item && item.id && !combinedMap.has(String(item.id))) {
              combinedMap.set(String(item.id), item);
            }
          });
        }

        const mergedList = Array.from(combinedMap.values());
        if (mergedList.length > 0) {
          setBeritaList(mergedList);
          localStorage.setItem('store_berita', JSON.stringify(mergedList));
        }
      } catch (err) {
        console.error('Error fetching berita:', err);
      }
    };
    fetchBerita();

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('lompoe_store_update', handleCustomStore);
    };
  }, [reloadFromLocal]);

  const filteredBerita = beritaList.filter(item => {
    const matchSearch = item.judul.toLowerCase().includes(search.toLowerCase()) || item.isi.toLowerCase().includes(search.toLowerCase());
    const matchKategori = kategoriFilter === 'Semua' || item.kategori === kategoriFilter;
    return matchSearch && matchKategori;
  });

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#f4f7f6' }}>
      <Navbar />

      <div className="bg-primary text-white py-4 shadow-sm" style={{ backgroundColor: '#0f4c75' }}>
        <div className="container">
          <h2 className="fw-bold text-white mb-1">Kabar & Pengumuman Kelurahan</h2>
          <p className="mb-0 opacity-75">Informasi terbaru seputar kegiatan, himbauan, dan pengumuman warga</p>
        </div>
      </div>

      <div className="container my-5">
        
        {/* Search & Filter Bar */}
        <div className="row g-3 mb-4 align-items-center">
          <div className="col-md-6">
            <input 
              type="text" 
              className="form-control form-control-lg shadow-sm" 
              placeholder="🔍 Cari berita atau pengumuman..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-6 d-flex gap-2">
            {['Semua', 'Pengumuman', 'Kegiatan', 'Penting'].map((kat) => (
              <button 
                key={kat}
                onClick={() => setKategoriFilter(kat)}
                className={`btn ${kategoriFilter === kat ? 'btn-primary' : 'btn-outline-secondary'} shadow-sm rounded-pill px-3`}
              >
                {kat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">Memuat daftar berita...</div>
        ) : filteredBerita.length === 0 ? (
          <div className="text-center py-5 text-muted card border-0 shadow-sm rounded-4 p-5">
            Tidak ada kabar atau pengumuman yang sesuai dengan pencarian.
          </div>
        ) : (
          <div className="row g-4">
            {filteredBerita.map((item) => (
              <div key={item.id} className="col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden d-flex flex-column">
                  {getImageSrc(item.gambar) ? (
                    <img 
                      src={getImageSrc(item.gambar)} 
                      alt={item.judul}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="bg-secondary bg-opacity-10 text-muted d-flex align-items-center justify-content-center" style={{ height: '200px', fontSize: '4rem' }}>
                      📰
                    </div>
                  )}
                  <div className="card-body p-4 d-flex flex-column justify-between flex-grow-1">
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge bg-primary px-3 py-1">{item.kategori || 'Pengumuman'}</span>
                        <small className="text-muted">📅 {new Date(item.created_at).toLocaleDateString('id-ID')}</small>
                      </div>
                      <h5 className="fw-bold mb-2 text-dark" style={{ lineHeight: '1.4' }}>{item.judul}</h5>
                      <p className="text-muted small mb-3">
                        {item.isi.length > 140 ? item.isi.substring(0, 140) + '...' : item.isi}
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedBerita(item)} 
                      className="btn btn-outline-primary btn-sm w-100 fw-semibold mt-auto"
                    >
                      Baca Selengkapnya
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Modal Detail Berita */}
      {selectedBerita && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-0 pb-0">
                <span className="badge bg-primary px-3 py-1 me-2">{selectedBerita.kategori}</span>
                <small className="text-muted">📅 {new Date(selectedBerita.created_at).toLocaleDateString('id-ID')} | 👤 {selectedBerita.penulis}</small>
                <button type="button" className="btn-close ms-auto" onClick={() => setSelectedBerita(null)}></button>
              </div>
              <div className="modal-body p-4">
                <h4 className="fw-bold mb-3">{selectedBerita.judul}</h4>
                {getImageSrc(selectedBerita.gambar) && (
                  <img 
                    src={getImageSrc(selectedBerita.gambar)} 
                    alt={selectedBerita.judul}
                    className="img-fluid rounded-4 mb-4 shadow-sm w-100"
                    style={{ maxHeight: '350px', objectFit: 'cover' }}
                  />
                )}
                <div style={{ whiteSpace: 'pre-line', lineHeight: '1.7' }} className="text-secondary">
                  {selectedBerita.isi}
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-secondary px-4" onClick={() => setSelectedBerita(null)}>Tutup</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Berita;
