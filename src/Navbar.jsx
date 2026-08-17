import { API_BASE_URL } from './apiConfig';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [info, setInfo] = useState({
    telepon_kantor: '(0421) 12345',
    teks_marquee: '🏛️ SELAMAT DATANG DI PORTAL DIGITAL KELURAHAN LOMPOE, KECAMATAN BACUKIKI, KOTA PAREPARE • 🕒 JAM PELAYANAN KANTOR LOKET: SENIN - JUMAT 08.00 - 16.00 WITA • 📝 LAYANAN PENGAJUAN SURAT & PERSETUJUAN LURAH BISA DILAKUKAN ONLINE 24 JAM'
  });

  useEffect(() => {
    const localInfo = JSON.parse(localStorage.getItem('store_info') || 'null');
    if (localInfo) setInfo(localInfo);
    axios.get(`${API_BASE_URL}/api/info-kelurahan`)
      .then(res => {
        if (res.data && !localInfo) setInfo(res.data);
      })
      .catch(() => {});
  }, []);

  const handleNavClick = () => {
    setIsNavCollapsed(true);
  };

  return (
    <>
      {/* Top Emergency & Announcement Marquee Bar */}
      <div className="bg-dark text-white py-2 border-bottom border-secondary border-opacity-25" style={{ backgroundColor: '#071325', fontSize: '0.83rem' }}>
        <div className="container-fluid px-md-4 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2 text-warning fw-extrabold shrink-0 me-3">
            <span className="pulse-dot-green"></span>
            <span className="d-none d-sm-inline tracking-wider">INFORMASI RESMI:</span>
          </div>
          <marquee className="fw-semibold small" scrollamount="5" style={{ color: '#ffffff' }}>
            {info.teks_marquee || '🏛️ SELAMAT DATANG DI PORTAL DIGITAL KELURAHAN LOMPOE, KECAMATAN BACUKIKI, KOTA PAREPARE • 🕒 JAM PELAYANAN KANTOR LOKET: SENIN - JUMAT 08.00 - 16.00 WITA • 📝 LAYANAN PENGAJUAN SURAT & PERSETUJUAN LURAH BISA DILAKUKAN ONLINE 24 JAM'}
          </marquee>
          <div className="d-none d-lg-flex align-items-center gap-3 text-white ms-3 small shrink-0">
            <span style={{ color: '#ffffff' }}><i className="bi bi-geo-alt-fill text-warning me-1"></i> Bacukiki, Parepare</span>
            <span style={{ color: '#ffffff' }}><i className="bi bi-telephone-fill text-success me-1"></i> {info.telepon_kantor || '(0421) 123456'}</span>
          </div>
        </div>
      </div>

      {/* Main Glass Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark shadow-sm sticky-top glass-nav" style={{ backgroundColor: '#0f4c75' }}>
        <div className="container">
          <Link to="/" onClick={handleNavClick} className="navbar-brand fw-bold d-flex align-items-center">
            <div className="bg-white p-1 rounded-circle d-flex align-items-center justify-content-center shadow-sm border border-2 border-warning shrink-0" style={{ width: '48px', height: '48px', marginRight: '14px' }}>
              <img 
                src="/assets/logo_kelurahan_lompoe.png" 
                alt="Logo Kelurahan Lompoe" 
                style={{ width: '40px', height: '40px', objectFit: 'contain' }} 
              />
            </div>
            <div>
              <div className="fs-5 lh-1 fw-extrabold tracking-wide text-white">KELURAHAN LOMPOE</div>
              <small className="fs-6 fw-normal text-white opacity-85">Kecamatan Bacukiki, Kota Parepare</small>
            </div>
          </Link>

          <button 
            className="navbar-toggler border-0 shadow-none" 
            type="button" 
            onClick={() => setIsNavCollapsed(!isNavCollapsed)}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={`collapse navbar-collapse ${!isNavCollapsed ? 'show bg-dark bg-opacity-95 p-3 rounded-3 mt-2 shadow-lg' : ''}`} id="navbarNav">
            <ul className="navbar-nav ms-auto fw-semibold align-items-lg-center gap-lg-1">
              <li className="nav-item">
                <Link onClick={handleNavClick} className={`nav-link px-3 text-white ${currentPath === '/' ? 'active fw-extrabold border-bottom border-warning border-3' : ''}`} to="/">
                  <i className="bi bi-house-door-fill me-1"></i> Beranda
                </Link>
              </li>
              <li className="nav-item">
                <Link onClick={handleNavClick} className={`nav-link px-3 text-white ${currentPath === '/profil' ? 'active fw-extrabold border-bottom border-warning border-3' : ''}`} to="/profil">
                  <i className="bi bi-diagram-3-fill me-1"></i> Profil & Aparatur
                </Link>
              </li>
              <li className="nav-item">
                <Link onClick={handleNavClick} className={`nav-link px-3 text-white ${currentPath === '/berita' ? 'active fw-extrabold border-bottom border-warning border-3' : ''}`} to="/berita">
                  <i className="bi bi-newspaper me-1"></i> Kabar Kelurahan
                </Link>
              </li>
              <li className="nav-item">
                <Link onClick={handleNavClick} className={`nav-link px-3 text-white ${currentPath === '/sarana' ? 'active fw-extrabold border-bottom border-warning border-3' : ''}`} to="/sarana">
                  <i className="bi bi-building-fill me-1"></i> Sarana Prasarana
                </Link>
              </li>
              <li className="nav-item">
                <Link onClick={handleNavClick} className={`nav-link px-3 text-white ${currentPath === '/cek-resi' ? 'active fw-extrabold border-bottom border-warning border-3' : ''}`} to="/cek-resi">
                  <i className="bi bi-search me-1 text-warning"></i> Cek Resi Surat
                </Link>
              </li>
              <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                <Link onClick={handleNavClick} className="btn btn-sm btn-outline-light px-3 py-2 rounded-pill fw-bold text-white shadow-sm" to="/chat">
                  <i className="bi bi-chat-dots-fill text-success me-1"></i> Live Chat Staf
                </Link>
              </li>
              <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                <Link onClick={handleNavClick} className="btn btn-sm btn-warning text-dark px-3 py-2 rounded-pill fw-extrabold shadow" to="/isi-data">
                  <i className="bi bi-file-earmark-plus-fill me-1"></i> Layanan Surat
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
