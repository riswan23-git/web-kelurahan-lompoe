import { API_BASE_URL } from './apiConfig';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';

const DEFAULT_SARANA = [
  { id: 1, nama_sarana: 'Kantor Kelurahan Lompoe', kategori: 'Pemerintahan', lokasi: 'Jl. Poros Lompoe', deskripsi: 'Pusat pelayanan administrasi publik dan pelayanan masyarakat.', kondisi: 'Baik', foto: null },
  { id: 2, nama_sarana: 'Puskesmas Pembantu Bacukiki', kategori: 'Kesehatan', lokasi: 'Lompoe', deskripsi: 'Fasilitas pelayanan kesehatan dasar bagi warga.', kondisi: 'Baik', foto: null }
];

function Sarana() {
  const [saranaList, setSaranaList] = useState(DEFAULT_SARANA);
  const [loading, setLoading] = useState(true);
  const [kategori, setKategori] = useState('Semua');

  useEffect(() => {
    const localSarana = JSON.parse(localStorage.getItem('store_sarana') || 'null');
    if (Array.isArray(localSarana) && localSarana.length > 0) {
      setSaranaList(localSarana);
    }
    const fetchSarana = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/sarana`).catch(() => null);
        if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
          setSaranaList(response.data);
          localStorage.setItem('store_sarana', JSON.stringify(response.data));
        }
      } catch (err) {
        console.error('Error fetching sarana:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSarana();
  }, []);

  const filteredSarana = saranaList.filter(item => {
    return kategori === 'Semua' || item.kategori === kategori;
  });

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#f4f7f6' }}>
      <Navbar />

      <div className="bg-primary text-white py-4 shadow-sm" style={{ backgroundColor: '#0f4c75' }}>
        <div className="container">
          <h2 className="fw-bold text-white mb-1">Sarana & Prasarana Wilayah</h2>
          <p className="mb-0 opacity-75">Daftar fasilitas umum, layanan publik, tempat ibadah, dan sarana warga Kelurahan Lompoe</p>
        </div>
      </div>

      <div className="container my-5">

        {/* Filter Buttons */}
        <div className="d-flex flex-wrap gap-2 mb-4 justify-content-center">
          {['Semua', 'Layanan Publik', 'Kesehatan', 'Peribadatan', 'Pendidikan', 'Olahraga'].map((kat) => (
            <button 
              key={kat}
              onClick={() => setKategori(kat)}
              className={`btn ${kategori === kat ? 'btn-primary' : 'btn-outline-secondary'} shadow-sm rounded-pill px-4 py-2`}
            >
              {kat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-5">Memuat data sarana prasarana...</div>
        ) : filteredSarana.length === 0 ? (
          <div className="text-center py-5 text-muted card border-0 shadow-sm rounded-4 p-5">
            Belum ada sarana prasarana dalam kategori ini.
          </div>
        ) : (
          <div className="row g-4">
            {filteredSarana.map((item) => (
              <div key={item.id} className="col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                  {item.foto ? (
                    <img 
                      src={`${API_BASE_URL}/uploads/${item.foto}`} 
                      alt={item.nama_sarana}
                      style={{ height: '180px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="bg-light text-primary d-flex align-items-center justify-content-center" style={{ height: '180px', fontSize: '4rem' }}>
                      🏢
                    </div>
                  )}
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-secondary px-3 py-1">{item.kategori}</span>
                      <span className={`badge ${item.kondisi === 'Sangat Baik' ? 'bg-success' : item.kondisi === 'Baik' ? 'bg-info text-white' : 'bg-warning text-dark'}`}>
                        {item.kondisi || 'Baik'}
                      </span>
                    </div>
                    <h5 className="fw-bold mb-2 text-dark">{item.nama_sarana}</h5>
                    <p className="text-muted small mb-0">📍 {item.lokasi || 'Wilayah Kelurahan Lompoe'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}

export default Sarana;
