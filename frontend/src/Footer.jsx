import { API_BASE_URL } from './apiConfig';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Footer() {
  const [info, setInfo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('store_info') || '{}') || {
        alamat_kantor: 'Jl. Poros Lompoe, Kec. Bacukiki, Kota Parepare, Sulsel',
        email_resmi: 'kelurahan.lompoe@pareparekota.go.id',
        telepon_kantor: '(0421) 12345',
        jam_pelayanan: 'Senin - Jumat (08.00 - 16.00 WITA)'
      };
    } catch (e) {
      return {
        alamat_kantor: 'Jl. Poros Lompoe, Kec. Bacukiki, Kota Parepare, Sulsel',
        email_resmi: 'kelurahan.lompoe@pareparekota.go.id',
        telepon_kantor: '(0421) 12345',
        jam_pelayanan: 'Senin - Jumat (08.00 - 16.00 WITA)'
      };
    }
  });

  useEffect(() => {
    const reloadLocal = () => {
      try {
        const localInfo = JSON.parse(localStorage.getItem('store_info') || 'null');
        if (localInfo && Object.keys(localInfo).length > 0) setInfo(localInfo);
      } catch (e) {}
    };
    reloadLocal();

    const handleStorage = () => reloadLocal();
    const handleCustomStore = (e) => {
      if (e?.detail?.key === 'info' && e.detail.data) setInfo(e.detail.data);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('lompoe_store_update', handleCustomStore);

    Promise.all([
      axios.get(`${API_BASE_URL}/api/info-kelurahan?_t=${Date.now()}`).catch(() => null),
      axios.get(`${API_BASE_URL}/api/cloud-store?_t=${Date.now()}`).catch(() => null)
    ]).then(([resApi, resCloud]) => {
      const cloudStoreObj = resCloud?.data?.data || resCloud?.data || {};
      const cloudInfo = cloudStoreObj.info || resCloud?.data?.info;
      const targetInfo = (cloudInfo && Object.keys(cloudInfo).length > 0) ? cloudInfo : resApi?.data;
      if (targetInfo && Object.keys(targetInfo).length > 0) {
        setInfo(targetInfo);
        localStorage.setItem('store_info', JSON.stringify(targetInfo));
      }
    }).catch(() => {});

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('lompoe_store_update', handleCustomStore);
    };
  }, []);

  const igValue = info.instagram || '@kelurahan_lompoe';
  const igUrl = igValue.startsWith('http') ? igValue : `https://instagram.com/${igValue.replace('@', '').trim()}`;
  const igLabel = igValue.includes('instagram.com') ? '@' + igValue.split('instagram.com/')[1].replace('/', '') : (igValue.startsWith('@') ? igValue : '@' + igValue);

  return (
    <footer className="text-white pt-5 pb-4 mt-auto" style={{ backgroundColor: '#1b262c' }}>
      <div className="container">
        <div className="row g-4">
          <div className="col-md-5">
            <h5 className="fw-bold mb-3 d-flex align-items-center">
              <span className="me-2">🏛️</span> Kelurahan Lompoe
            </h5>
            <p className="small text-white-50 leading-relaxed">
              Portal resmi pelayanan publik dan transparansi informasi masyarakat Kelurahan Lompoe, Kecamatan Bacukiki, Kota Parepare. Menyediakan pengajuan surat online, koordinasi live chat warga, serta data statistik dan profil kelurahan.
            </p>
          </div>
          <div className="col-md-4">
            <h5 className="fw-bold mb-3">Kontak & Lokasi Kantor</h5>
            <ul className="list-unstyled small text-white-50">
              <li className="mb-2">📍 {info.alamat_kantor || 'Jl. Poros Lompoe, Kec. Bacukiki, Kota Parepare, Sulsel'}</li>
              <li className="mb-2">📧 {info.email_resmi || 'kelurahan.lompoe@pareparekota.go.id'}</li>
              <li className="mb-2">📞 {info.telepon_kantor || '(0421) 12345'}</li>
              <li className="mb-2">
                📷 <a href={igUrl} target="_blank" rel="noopener noreferrer" className="text-warning fw-semibold text-decoration-none">
                  Instagram: {igLabel} ↗
                </a>
              </li>
              <li className="mb-2">🕒 Jam Pelayanan: {info.jam_pelayanan || 'Senin - Jumat (08.00 - 16.00 WITA)'}</li>
            </ul>
          </div>
          <div className="col-md-3">
            <h5 className="fw-bold mb-3">Akses Khusus</h5>
            <p className="small text-white-50 mb-3">Portal login pegawai dan staf kantor kelurahan.</p>
            <Link to="/login" className="btn btn-sm btn-outline-light px-3 py-2 fw-semibold">
              🔐 Login Dasbor Admin
            </Link>
          </div>
        </div>
        <hr className="border-secondary my-4" />
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center small text-white-50">
          <div>&copy; 2026 Kelurahan Lompoe, Kota Parepare. All Rights Reserved.</div>
          <div className="mt-2 mt-md-0">Sistem Informasi & Layanan Digital Kelurahan</div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
