import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [showModalLupa, setShowModalLupa] = useState(false);
  const [formLupa, setFormLupa] = useState({ username: 'admin', pin_recovery: '', new_password: '' });
  const [pesanLupa, setPesanLupa] = useState('');
  const [errorLupa, setErrorLupa] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, { username, password });
      localStorage.setItem('admin_user', JSON.stringify(response.data.user));
      localStorage.setItem('isLoggedIn', 'true');
      navigate('/admin');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal login. Periksa username dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setPesanLupa('');
    setErrorLupa('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/admin/reset-password-pin`, formLupa);
      setPesanLupa(res.data.message);
      setTimeout(() => {
        setShowModalLupa(false);
        setPesanLupa('');
        setPassword('');
      }, 2000);
    } catch (err) {
      setErrorLupa(err.response?.data?.message || 'Gagal mereset password.');
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3 p-md-4" style={{ backgroundColor: '#071325' }}>
      
      {/* MODERN SPLIT CARD WITH KANTOR KELURAHAN LOMPOE PHOTO */}
      <div className="card border-0 shadow-2xl rounded-4 overflow-hidden bg-white d-flex flex-column flex-md-row" style={{ width: '880px', maxWidth: '100%' }}>
        
        {/* LEFT PANEL: PHOTO SHOWCASE WITH GRADIENT OVERLAY */}
        <div 
          className="col-md-6 p-4 p-md-5 text-white d-flex flex-column justify-content-between position-relative"
          style={{
            backgroundImage: `linear-gradient(to top, rgba(7, 19, 37, 0.95) 0%, rgba(15, 76, 117, 0.65) 50%, rgba(5, 19, 41, 0.75) 100%), url('/assets/foto_kantor_lompoe_login.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '380px'
          }}
        >
          {/* Top Tag */}
          <div>
            <div className="d-inline-flex align-items-center gap-2 bg-white bg-opacity-20 px-3 py-1.5 rounded-pill border border-white border-opacity-30 backdrop-blur">
              <span className="pulse-dot-green"></span>
              <small className="fw-extrabold text-white tracking-wider text-uppercase" style={{ fontSize: '0.72rem' }}>
                PAREPARE • BACUKIKI
              </small>
            </div>
          </div>

          {/* Bottom Office Info */}
          <div className="position-relative z-2">
            <h3 className="fw-extrabold text-white mb-1" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}>
              Kantor Kelurahan Lompoe
            </h3>
            <p className="text-light small opacity-90 mb-3 leading-relaxed" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}>
              Pusat Pelayanan Digital & Administrasi Terpadu Masyarakat Kelurahan Lompoe, Kota Parepare.
            </p>
            <div className="d-flex align-items-center gap-2 text-warning fw-bold small">
              <span>🏛️ Srikandi System Online</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: SECURE MINIMALIST LOGIN FORM */}
        <div className="col-md-6 p-4 p-md-5 bg-white d-flex flex-column justify-content-between">
          <div>
            
            {/* LOGO & TITLE HEADER */}
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="bg-white p-1 rounded-circle shadow-sm border border-2 border-warning shrink-0" style={{ width: '52px', height: '52px' }}>
                <img src="/assets/logo_kelurahan_lompoe.png" alt="Logo Kelurahan Lompoe" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
              </div>
              <div>
                <h5 className="fw-extrabold text-dark mb-0" style={{ color: '#0f4c75' }}>
                  Dasbor Staf Kelurahan
                </h5>
                <small className="text-muted d-block">Masuk dengan Akun Admin Resmi</small>
              </div>
            </div>

            {/* ERROR ALERT */}
            {errorMsg && (
              <div className="alert alert-danger rounded-3 small py-2 border-0 mb-3">{errorMsg}</div>
            )}

            {/* LOGIN FORM */}
            <form onSubmit={handleLogin}>
              
              {/* USERNAME */}
              <div className="mb-3">
                <label className="form-label fw-bold text-dark small mb-1">Username Admin *</label>
                <div className="input-group rounded-3 overflow-hidden border">
                  <span className="input-group-text bg-light border-0 text-muted px-3">👤</span>
                  <input 
                    type="text" 
                    className="form-control border-0 bg-light fs-6 fw-semibold"
                    placeholder="Masukkan username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              {/* PASSWORD WITH SHOW/HIDE TOGGLE */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label fw-bold text-dark small mb-0">Password *</label>
                  <button 
                    type="button" 
                    className="btn btn-link text-decoration-none p-0 border-0 small text-primary fw-semibold" 
                    style={{ fontSize: '12px' }}
                    onClick={() => setShowModalLupa(true)}
                  >
                    🔑 Lupa Password?
                  </button>
                </div>
                <div className="input-group rounded-3 overflow-hidden border">
                  <span className="input-group-text bg-light border-0 text-muted px-3">🔒</span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="form-control border-0 bg-light fs-6 fw-semibold"
                    placeholder="Masukkan password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    className="input-group-text bg-light border-0 text-muted px-3"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Sembunyikan" : "Tampilkan"}
                  >
                    {showPassword ? "👁️‍🗨️" : "👁️"}
                  </button>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button 
                type="submit" 
                className="btn btn-primary btn-lg w-100 fw-bold rounded-pill py-2.5 shadow-md mb-3" 
                disabled={loading}
                style={{ backgroundColor: '#0f4c75', borderColor: '#0f4c75' }}
              >
                {loading ? 'Memproses Login...' : '🔐 Masuk Dasbor Admin'}
              </button>
            </form>
          </div>

          {/* BACK TO HOMEPAGE LINK */}
          <div className="text-center pt-3 border-top border-slate-100">
            <Link to="/" className="text-decoration-none small text-muted hover-lift">
              ← Kembali ke Beranda Utama Warga
            </Link>
          </div>

        </div>
      </div>

      {/* MODAL LUPA PASSWORD (RECOVERY PIN) */}
      {showModalLupa && (
        <div className="modal show d-block bg-dark bg-opacity-75" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header text-white p-4" style={{ backgroundColor: '#0f4c75' }}>
                <h5 className="modal-title fw-bold text-white d-flex align-items-center gap-2">
                  <span>🔑 Pemulihan Password Admin</span>
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModalLupa(false)}></button>
              </div>
              <form onSubmit={handleResetPassword}>
                <div className="modal-body p-4 bg-white">
                  {pesanLupa && <div className="alert alert-success rounded-3">{pesanLupa}</div>}
                  {errorLupa && <div className="alert alert-danger rounded-3">{errorLupa}</div>}

                  <p className="small text-muted mb-3">
                    Masukkan PIN Pemulihan Rahasia (Default awal: <code>123456</code>) untuk mereset password.
                  </p>

                  <div className="mb-3">
                    <label className="form-label fw-bold small">Username Admin</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      required
                      value={formLupa.username}
                      onChange={(e) => setFormLupa({ ...formLupa, username: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold small">PIN Pemulihan Rahasia *</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder="Masukkan 6 angka PIN"
                      required
                      value={formLupa.pin_recovery}
                      onChange={(e) => setFormLupa({ ...formLupa, pin_recovery: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold small">Password Baru *</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder="Masukkan password baru"
                      required
                      value={formLupa.new_password}
                      onChange={(e) => setFormLupa({ ...formLupa, new_password: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light border-0 p-3">
                  <button type="button" className="btn btn-light border fw-semibold" onClick={() => setShowModalLupa(false)}>Batal</button>
                  <button type="submit" className="btn btn-danger text-white fw-bold px-4 rounded-pill shadow-sm">
                    🔄 Reset Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminLogin;