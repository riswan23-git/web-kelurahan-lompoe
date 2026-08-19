import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './Home';
import Profil from './Profil';
import Berita from './Berita';
import Sarana from './Sarana';
import FormWarga from './FormWarga';
import CekResi from './CekResi';
import ChatWarga from './ChatWarga';
import VerifikasiRT from './VerifikasiRT';
import AdminDashboard from './AdminDashboard';
import AdminLogin from './AdminLogin';

function HashRouteRedirector() {
  useEffect(() => {
    try {
      const href = window.location.href;
      const origin = window.location.origin;
      const pathname = window.location.pathname;
      const hash = window.location.hash;
      const search = window.location.search;

      if (pathname.includes('verifikasi-rt') || href.includes('token=')) {
        let token = '';
        if (search.includes('token=')) {
          token = search.split('token=')[1].split('&')[0];
        } else if (href.includes('token=')) {
          token = href.split('token=')[1].split('&')[0].split('#')[0];
        }

        if (!hash.includes('/verifikasi-rt')) {
          const targetUrl = token 
            ? `${origin}/#/verifikasi-rt?token=${encodeURIComponent(token)}`
            : `${origin}/#/verifikasi-rt`;
          window.location.replace(targetUrl);
        }
      }
    } catch(e) {}
  }, []);

  return null;
}

function ProtectedRoute({ children }) {
  let isValid = false;
  try {
    const flag = localStorage.getItem('isLoggedIn');
    const userStr = localStorage.getItem('admin_user');
    if (flag === 'true' && userStr && userStr !== 'undefined') {
      const parsed = JSON.parse(userStr);
      if (parsed && typeof parsed === 'object') {
        isValid = true;
      }
    }
  } catch (e) {
    isValid = false;
  }

  if (!isValid) {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('admin_user');
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <>
      <HashRouteRedirector />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/berita" element={<Berita />} />
          <Route path="/sarana" element={<Sarana />} />
          <Route path="/isi-data" element={<FormWarga />} />
          <Route path="/ajukan-surat" element={<FormWarga />} />
          <Route path="/cek-resi" element={<CekResi />} />
          <Route path="/chat" element={<ChatWarga />} />
          <Route path="/verifikasi-rt" element={<VerifikasiRT />} />
          
          {/* Jalur Khusus Admin dengan Perlindungan Ketat */}
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } /> 
        </Routes>
      </Router>
    </>
  );
}

export default App;