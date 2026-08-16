import { API_BASE_URL } from './apiConfig';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';

function ChatWarga() {
  const [searchParams] = useSearchParams();
  const resiQuery = searchParams.get('resi') || localStorage.getItem('last_resi') || '';
  
  const [roomResi, setRoomResi] = useState(resiQuery);
  const [namaPengirim, setNamaPengirim] = useState(localStorage.getItem('user_nama') || 'Warga Lompoe');
  const [messages, setMessages] = useState([]);
  const [fileHasilRoom, setFileHasilRoom] = useState(null);
  const [inputPesan, setInputPesan] = useState('');
  const [inRoom, setInRoom] = useState(false);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (resiCode) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/chat/${resiCode}`);
      setMessages(response.data);
      
      // Fetch resi status info to check if file_hasil is ready
      try {
        const resInfo = await axios.get(`http://localhost:5000/api/cek-resi/${resiCode}`);
        if (resInfo.data && resInfo.data.file_hasil) {
          setFileHasilRoom(resInfo.data.file_hasil);
        }
      } catch (e) {}

      scrollToBottom();
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    }
  };

  const handleMasukRoom = (e) => {
    if (e) e.preventDefault();
    if (!roomResi.trim()) return;
    setInRoom(true);
    fetchMessages(roomResi.trim());
  };

  useEffect(() => {
    if (resiQuery) {
      setRoomResi(resiQuery);
      setInRoom(true);
      fetchMessages(resiQuery);
    }
  }, [resiQuery]);

  // Interval Auto-Polling chat every 3 seconds if in room
  useEffect(() => {
    let interval = null;
    if (inRoom && roomResi) {
      interval = setInterval(() => {
        fetchMessages(roomResi);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [inRoom, roomResi]);

  const handleKirimPesan = async (e) => {
    e.preventDefault();
    if (!inputPesan.trim()) return;

    const pesanBaru = inputPesan.trim();
    setInputPesan('');

    try {
      await axios.post(`${API_BASE_URL}/api/chat`, {
        room_resi: roomResi,
        sender_type: 'warga',
        nama_pengirim: namaPengirim || 'Warga',
        pesan: pesanBaru
      });
      fetchMessages(roomResi);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#f4f7f6' }}>
      <Navbar />

      <div className="bg-primary text-white py-4 shadow-sm" style={{ backgroundColor: '#0f4c75' }}>
        <div className="container">
          <h2 className="fw-bold text-white mb-1">💬 Live Chat & Koordinasi Warga</h2>
          <p className="mb-0 opacity-75">Konsultasi langsung dengan Staf Kelurahan mengenai persetujuan dokumen & keberadaan staf</p>
        </div>
      </div>

      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">

            {!inRoom ? (
              <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white text-center">
                <div className="fs-1 text-primary mb-3">💬</div>
                <h4 className="fw-bold mb-2">Masuk ke Ruang Chat Koordinasi</h4>
                <p className="text-muted mb-4">Masukkan Nomor Resi pengajuan Anda atau buat ID percakapan baru untuk memulai obrolan dengan Staf Kelurahan.</p>

                <form onSubmit={handleMasukRoom} className="text-start mx-auto" style={{ maxWidth: '450px' }}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Nama Anda *</label>
                    <input 
                      type="text" 
                      className="form-control form-control-lg"
                      placeholder="Masukkan nama Anda"
                      required
                      value={namaPengirim}
                      onChange={(e) => setNamaPengirim(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Nomor Resi / Kode Chat *</label>
                    <input 
                      type="text" 
                      className="form-control form-control-lg"
                      placeholder="Contoh: LMP-839201"
                      required
                      value={roomResi}
                      onChange={(e) => setRoomResi(e.target.value)}
                    />
                    <small className="text-muted">Jika belum punya resi, Anda bisa mengarang kode misal: CHAT-123</small>
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold">
                    🚀 Masuk Ruang Chat
                  </button>
                </form>
              </div>
            ) : (
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="card-header bg-dark text-white p-3 d-flex justify-content-between align-items-center">
                  <div>
                    <span className="badge bg-success me-2">● Online</span>
                    <strong className="fs-6">Chat Room: {roomResi}</strong>
                  </div>
                  <button className="btn btn-sm btn-outline-light" onClick={() => setInRoom(false)}>
                    Ganti Resi / Keluar Chat
                  </button>
                </div>
                {/* Banner Download File Hasil Jika Tersedia */}
                {fileHasilRoom && (
                  <div className="bg-success text-white p-3 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 border-bottom">
                    <div>
                      <strong className="d-block text-white">🎉 Surat Hasil TTD Lurah (SRIKANDI) Siap Download!</strong>
                      <small className="opacity-90">Dokumen resmi bertanda tangan digital Pak Lurah sudah tersedia.</small>
                    </div>
                    <a 
                      href={`http://localhost:5000/uploads/${fileHasilRoom}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn btn-light text-success fw-bold px-3 py-1 btn-sm rounded-pill shadow-sm"
                    >
                      📥 Download PDF
                    </a>
                  </div>
                )}

                {/* Body Pesan */}
                <div className="card-body p-4 bg-light overflow-auto" style={{ height: '420px' }}>
                  {messages.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      Belum ada pesan. Ketik pesan Anda di bawah untuk memulai obrolan dengan Staf Kelurahan.
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isWarga = msg.sender_type === 'warga';
                      return (
                        <div key={msg.id} className={`d-flex mb-3 ${isWarga ? 'justify-content-end' : 'justify-content-start'}`}>
                          <div className={isWarga ? 'chat-bubble-warga shadow-sm' : 'chat-bubble-admin shadow-sm'}>
                            <div className="d-flex justify-content-between gap-3 mb-1">
                              <small className="fw-bold opacity-75">{msg.nama_pengirim}</small>
                              <small className="opacity-50" style={{ fontSize: '0.7rem' }}>
                                {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </small>
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.pesan}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Pesan */}
                <div className="card-footer bg-white p-3 border-0">
                  <form onSubmit={handleKirimPesan} className="d-flex gap-2">
                    <input 
                      type="text" 
                      className="form-control form-control-lg"
                      placeholder="Ketik pesan Anda untuk staf kelurahan..."
                      value={inputPesan}
                      onChange={(e) => setInputPesan(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary px-4 fw-bold">
                      Kirim
                    </button>
                  </form>
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

export default ChatWarga;
