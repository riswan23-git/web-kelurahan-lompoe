import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Global React Error Catch:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    window.location.href = '/#/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark text-white p-4">
          <div className="card bg-secondary text-white p-4 rounded-4 shadow-lg text-center" style={{ maxWidth: '480px' }}>
            <h3 className="fw-bold mb-3">🏛️ Portal Kelurahan Lompoe</h3>
            <p className="text-light small mb-4">
              Terjadi pembaruan sistem di layar Anda. Silakan klik tombol di bawah ini untuk memuat ulang dengan bersih.
            </p>
            <button onClick={this.handleReset} className="btn btn-warning fw-bold rounded-pill py-2 px-4">
              🔄 Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>,
)