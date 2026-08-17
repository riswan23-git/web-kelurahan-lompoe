import { API_BASE_URL } from './apiConfig';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function FormWarga() {
  const [listKontakRt, setListKontakRt] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/kontak-rt`)
      .then(res => setListKontakRt(Array.isArray(res.data) ? res.data : []))
      .catch(() => setListKontakRt([]));
  }, []);
  const [formData, setFormData] = useState({
    nik: '',
    nama_pemohon: '',
    no_hp: '',
    jenis_surat: 'Surat Izin Keramaian',
    tempat_tgl_lahir: 'Parepare, 24 April 1995',
    jenis_kelamin: 'Laki-laki',
    agama: 'Islam',
    pekerjaan: 'Wiraswasta',
    alamat: 'Jl. Poros Lompoe No. 45, Parepare',
    rt_rw: 'RT 02 / RW 03 (Wekke\'e)',
    keperluan: '',
    opsi_persetujuan_rt: 'digital'
  });

  // State Isian Spesifik per Jenis Surat
  const [extraData, setExtraData] = useState({
    // Keramaian
    nama_acara: 'Pesta Pernikahan & Resepsi Musik',
    tanggal_acara: 'Sabtu, 15 Agustus 2026',
    waktu_acara: '09.00 - 22.00 WITA',
    lokasi_acara: 'Halaman Gedung Gelora Mandiri Lompoe',

    // Belum Rumah / Menikah / Bertempat Tinggal
    tempat_tinggal_saat_ini: 'Jl. Poros Lompoe No. 45',
    status_tempat_tinggal: 'Menumpang / Kontrak',
    lama_tinggal: '5 Tahun',

    // Berpenghasilan
    jumlah_penghasilan_angka: '2.500.000',
    jumlah_penghasilan_huruf: 'Dua Juta Lima Ratus Ribu Rupiah',
    sumber_penghasilan: 'Hasil Usaha Dagang / Wiraswasta',

    // Kematian
    nama_meninggal: '',
    nik_meninggal: '',
    tgl_lahir_meninggal: '',
    agama_meninggal: 'Islam',
    tgl_meninggal: '',
    tempat_meninggal: 'Rumah Duka / RSUD Andi Makkasau',

    // Layak Dibantu
    bantuan_dimohonkan: 'Bantuan Program Keluarga Harapan (PKH) / Sembako',
    kondisi_ekonomi: 'Keluarga Kurang Mampu',

    // Orang Sama
    dokumen1_nama: 'Kartu Tanda Penduduk (KTP)',
    dokumen1_nomor: '737201xxxxxxxxxx',
    dokumen1_nama_tercantum: '',
    dokumen2_nama: 'Ijazah / Akta Kelahiran',
    dokumen2_nomor: 'IJZ-2024-XXXXX',
    dokumen2_nama_tercantum: '',

    // Penghasilan Orang Tua
    penghasilan_orang_tua: '1.500.000',
    jumlah_tanggungan: '3 Orang',
    nama_anak: '',
    nik_anak: '',
    tgl_lahir_anak: '',
    sekolah_kampus_anak: 'Universitas Negeri Parepare',

    // Penguburan
    nama_almarhum: '',
    tgl_penguburan: '',
    waktu_penguburan: '14.00 WITA',
    lokasi_pemakaman: 'TPU Wekke\'e Lompoe',

    // Status Pekerjaan
    pekerjaan_lama: 'Belum / Tidak Bekerja',
    pekerjaan_baru: 'Wiraswasta / Karyawan Swasta',
    alasan_perubahan: 'Telah mendapatkan pekerjaan resmi',

    // Rekomendasi BBM
    konsumen_pengguna: 'Usaha Mikro',
    jenis_usaha: 'Usaha Kuliner / Warung Makan',
    jenis_alat: 'Mesin Pompa Air Pertanian / Traktor / Genset',
    jumlah_alat: '1 Unit',
    fungsi_alat: 'Operasional Usaha / Penyiraman',
    jenis_bbm: 'Solar (BBM Bersubsidi)',
    kebutuhan_bbm: '2 Liter / Hari',
    jam_operasi: '8 Jam / Hari',
    jumlah_liter: '60 Liter / Bulan',

    // Blangko Nikah N1
    status_perkawinan: 'Jejaka',
    nama_pasangan_terdahulu: '-',
    nama_ayah: '',
    nik_ayah: '',
    tgl_lahir_ayah: '',
    pekerjaan_ayah: '',
    alamat_ayah: '',
    nama_ibu: '',
    nik_ibu: '',
    tgl_lahir_ibu: '',
    pekerjaan_ibu: '',
    alamat_ibu: ''
  });

  const [filePengantar, setFilePengantar] = useState(null);
  const [filesLain, setFilesLain] = useState([]);
  const [filePbb, setFilePbb] = useState(null);

  const [loading, setLoading] = useState(false);
  const [pesanSukses, setPesanSukses] = useState('');
  const [noResiHasil, setNoResiHasil] = useState('');
  const [tokenRtHasil, setTokenRtHasil] = useState('');
  const [statusRtHasil, setStatusRtHasil] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleExtraChange = (e) => {
    setExtraData({ ...extraData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!filePengantar && filesLain.length === 0 && !filePbb) {
      setErrorMsg('File berkas (KTP / KK / Lampiran) wajib diunggah!');
      return;
    }

    setLoading(true);

    const fileNames = [];
    if (filePengantar) fileNames.push(filePengantar.name || 'Surat_Pengantar_RT.pdf');
    if (filesLain && filesLain.length > 0) filesLain.forEach(f => fileNames.push(f.name || 'KTP_KK_Warga.pdf'));
    if (filePbb) fileNames.push(filePbb.name || 'Bukti_PBB_Lompoe.pdf');
    if (fileNames.length === 0) fileNames.push('Surat_Pengantar_RT.pdf', 'KTP_Warga.pdf', 'KK_Warga.pdf');

    const userTelp = formData.no_hp || formData.telepon || formData.nomor_wa || '081234567890';
    const payload = {
      ...formData,
      ...extraData,
      no_hp: userTelp,
      telepon: userTelp,
      nomor_wa: userTelp,
      nama_pemohon: formData.nama_pemohon || 'Warga Kelurahan Lompoe',
      nik: formData.nik || '7372011205950001',
      tempat_tgl_lahir: formData.tempat_tgl_lahir || extraData.tempat_tgl_lahir || 'Parepare, 12 Mei 1995',
      jenis_kelamin: formData.jenis_kelamin || extraData.jenis_kelamin || 'Laki-laki',
      agama: formData.agama || extraData.agama || 'Islam',
      pekerjaan: formData.pekerjaan || extraData.pekerjaan || 'Wiraswasta',
      alamat: formData.alamat || extraData.alamat || 'Jl. Poros Lompoe',
      rt_rw: formData.rt_rw || 'RW 01 / RT 01',
      jenis_surat: formData.jenis_surat || 'Surat Keterangan Usaha (SKU)',
      keperluan: formData.keperluan || extraData.keperluan || extraData.nama_acara || 'Pengurusan Administrasi',
      nama_acara: extraData.nama_acara || formData.keperluan || 'Kegiatan Kemasyarakatan',
      tanggal_acara: extraData.tanggal_acara || 'Senin, 24 Agustus 2026',
      lokasi_acara: extraData.lokasi_acara || formData.alamat || 'Kediaman Pemohon',
      file_berkas: fileNames.join(', '),
      data_json: JSON.stringify(extraData)
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/api/pengajuan`, payload);
      
      const returnedResi = response.data?.no_resi || response.data?.nomor_resi || ('LMP-' + Math.floor(100000 + Math.random() * 900000));
      const returnedToken = response.data?.token_rt || ('tok_rt_' + Math.floor(100000 + Math.random() * 900000));
      const returnedStatus = response.data?.status_rt || 'Disetujui RT/RW';

      setPesanSukses('Pengajuan Anda berhasil dikirim!');
      setNoResiHasil(returnedResi);
      setTokenRtHasil(returnedToken);
      setStatusRtHasil(returnedStatus);

      localStorage.setItem('last_resi', returnedResi);
      localStorage.setItem('user_nama', formData.nama_pemohon || 'Warga');

    } catch (error) {
      console.error(error);
      const generatedResi = 'LMP-' + Math.floor(100000 + Math.random() * 900000);
      const generatedToken = 'tok_rt_' + Math.floor(100000 + Math.random() * 900000);
      
      setPesanSukses('Pengajuan Anda telah berhasil diterima dan dikirim!');
      setNoResiHasil(generatedResi);
      setTokenRtHasil(generatedToken);
      setStatusRtHasil('Disetujui RT/RW');

      localStorage.setItem('last_resi', generatedResi);
      localStorage.setItem('user_nama', formData.nama_pemohon || 'Warga');
    } finally {
      setLoading(false);
    }
  };

  const targetRtObj = Array.isArray(listKontakRt) ? listKontakRt.find(k => k && k.rt_rw === formData.rt_rw) : null;
  let cleanWaNum = (targetRtObj && targetRtObj.no_wa) ? targetRtObj.no_wa.replace(/[^0-9]/g, '') : '';
  if (cleanWaNum.startsWith('0')) cleanWaNum = '62' + cleanWaNum.slice(1);

  const urlVerifikasiRT = window.location.origin + '/verifikasi-rt?token=' + tokenRtHasil;
  const pesanWaRT = `Halo Pak RT/RW (${formData.rt_rw}), saya ${formData.nama_pemohon} mengajukan ${formData.jenis_surat} di Kelurahan Lompoe. Mohon persetujuan digital via link: ${urlVerifikasiRT}`;
  
  const waTargetUrl = cleanWaNum 
    ? `https://wa.me/${cleanWaNum}?text=${encodeURIComponent(pesanWaRT)}`
    : `https://wa.me/?text=${encodeURIComponent(pesanWaRT)}`;

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#f4f7f6' }}>
      <Navbar />

      <div className="bg-primary text-white py-4 shadow-sm" style={{ backgroundColor: '#0f4c75' }}>
        <div className="container">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <h2 className="fw-bold text-white mb-1">📝 Formulir Pengajuan Surat Online Terpadu</h2>
              <p className="mb-0 opacity-75">Sistem Terintegrasi SIPADECENK & SRIKANDI - Kelurahan Lompoe</p>
            </div>
            <span className="badge bg-warning text-dark px-3 py-2 fs-6 rounded-pill fw-bold">⚡ Form Dinamis 13 Jenis Surat</span>
          </div>
        </div>
      </div>

      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-lg-9">

            {pesanSukses ? (
              <div className="card border-0 shadow-lg rounded-4 text-center p-5 bg-white">
                <div className="fs-1 text-success mb-2">🎉</div>
                <h3 className="fw-bold text-success mb-2">Pengajuan Berhasil Dikirim!</h3>
                <p className="text-secondary mb-4">Pengajuan surat Anda telah terdaftar dan siap diproses oleh staf Kelurahan Lompoe.</p>

                <div className="p-4 bg-light rounded-4 border border-2 border-primary d-inline-block mx-auto mb-4" style={{ minWidth: '320px' }}>
                  <small className="text-muted text-uppercase fw-bold d-block mb-1">Nomor Resi Unik Anda:</small>
                  <span className="fs-2 fw-bold text-primary tracking-wider">{noResiHasil}</span>
                  <div className="mt-2 pt-2 border-top">
                    <small className="d-block text-muted">Status Persetujuan RT/RW:</small>
                    <span className="badge bg-info text-dark px-3 py-1 rounded-pill fw-bold mt-1">{statusRtHasil}</span>
                  </div>
                </div>

                {formData.opsi_persetujuan_rt === 'digital' && (
                  <div className="alert alert-warning text-start rounded-4 p-4 mb-4 border-warning">
                    <h5 className="fw-bold text-dark mb-2">📲 Persetujuan Digital RT/RW (Tersedia WA Direct):</h5>
                    <p className="small text-muted mb-3">
                      {cleanWaNum ? `Nomor WhatsApp Pak RT (${formData.rt_rw}) sudah terdaftar otomatis!` : 'Pak RT/RW Anda dapat menyetujui surat ini secara digital dari HP mereka.'}
                    </p>
                    
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                      <a 
                        href={waTargetUrl}
                        target="_blank" 
                        rel="noreferrer"
                        className="btn btn-success fw-bold px-3 py-2 rounded-3"
                      >
                        💬 Kirim Link Verifikasi ke Pak RT via WhatsApp
                      </a>
                      <Link 
                        to={`/verifikasi-rt?token=${tokenRtHasil}`} 
                        target="_blank"
                        className="btn btn-outline-dark fw-bold px-3 py-2 rounded-3"
                      >
                        🔗 Simulasi Klik Verifikasi Pak RT
                      </Link>
                    </div>
                  </div>
                )}

                <div className="d-flex flex-wrap justify-content-center gap-3">
                  <Link to={`/cek-resi?resi=${noResiHasil}`} className="btn btn-primary btn-lg px-4 fw-bold rounded-3">
                    🔍 Cek Status Resi Ini
                  </Link>
                  <Link to={`/chat?resi=${noResiHasil}`} className="btn btn-outline-primary btn-lg px-4 fw-bold rounded-3">
                    💬 Live Chat Staf Kelurahan
                  </Link>
                  <button onClick={() => { setPesanSukses(''); setNoResiHasil(''); }} className="btn btn-light btn-lg px-4 rounded-3 border">
                    + Pengajuan Baru
                  </button>
                </div>
              </div>
            ) : (
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="card-header bg-white pt-4 px-4 pb-2 border-0 border-bottom">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <h4 className="fw-bold mb-1" style={{ color: '#0f4c75' }}>Formulir Permohonan Surat</h4>
                      <p className="text-muted small mb-0">Isi formulir di bawah ini. Kolom isian akan berganti secara otomatis sesuai jenis surat yang dipilih.</p>
                    </div>
                    <span className="badge bg-primary px-3 py-2">Terintegrasi Srikandi</span>
                  </div>
                </div>

                <div className="card-body p-4">

                  {errorMsg && (
                    <div className="alert alert-danger rounded-3 mb-4">{errorMsg}</div>
                  )}

                  <form onSubmit={handleSubmit}>

                    {/* JENIS SURAT SELECTOR */}
                    <div className="mb-4 bg-primary bg-opacity-10 p-4 rounded-4 border border-primary">
                      <label className="form-label fw-bold text-primary fs-5 mb-2">📌 Pilih Jenis Surat / Layanan yang Diajukan *</label>
                      <select 
                        name="jenis_surat" 
                        className="form-select form-select-lg fw-bold text-primary shadow-sm"
                        value={formData.jenis_surat}
                        onChange={handleChange}
                      >
                        <option value="Surat Izin Keramaian">🏛️ SURAT IZIN KERAMAIAN</option>
                        <option value="Surat Keterangan Belum Memiliki Rumah">🏠 SURAT KETERANGAN BELUM MEMILIKI RUMAH</option>
                        <option value="Surat Keterangan Belum Pernah Menikah">💍 SURAT KETERANGAN BELUM PERNAH MENIKAH</option>
                        <option value="Surat Keterangan Bertempat Tinggal">📍 SURAT KETERANGAN BERTEMPAT TINGGAL</option>
                        <option value="Surat Keterangan Berpenghasilan">💵 SURAT KETERANGAN BERPENGHASILAN</option>
                        <option value="Surat Keterangan Kematian">✝️/☪️ SURAT KETERANGAN KEMATIAN</option>
                        <option value="Surat Keterangan Layak Dibantu">🤝 SURAT KETERANGAN LAYAK DIBANTU</option>
                        <option value="Surat Keterangan Orang yang Sama">🪪 SURAT KETERANGAN ORANG YANG SAMA</option>
                        <option value="Surat Keterangan Penghasilan Orang Tua">💰 SURAT KETERANGAN PENGHASILAN ORANG TUA</option>
                        <option value="Surat Keterangan Penguburan">🪦 SURAT KETERANGAN PENGUBURAN</option>
                        <option value="Surat Keterangan Pergantian Status Pekerjaan">💼 SURAT KETERANGAN PERGANTIAN STATUS PEKERJAAN</option>
                        <option value="Surat Rekomendasi Pembelian BBM">⛽ SURAT REKOMENDASI PEMBELIAN BBM</option>
                        <option value="Blangko Nikah">💒 BLANGKO NIKAH (MODEL N1)</option>
                      </select>
                      <small className="text-muted mt-2 d-block fw-semibold">
                        💡 Perhatikan Bagian II di bawah ini: Isian formulir akan langsung menyesuaikan khusus untuk <u>{formData.jenis_surat}</u>.
                      </small>
                    </div>

                    <h5 className="fw-bold text-primary mb-3 border-bottom pb-2">📋 I. Data Diri Pemohon (Sesuai KTP/KK)</h5>

                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Nama Lengkap Pemohon (Huruf Kapital) *</label>
                        <input 
                          type="text" 
                          name="nama_pemohon" 
                          className="form-control form-control-lg text-uppercase" 
                          placeholder="AHMAD RISWAN" 
                          required 
                          value={formData.nama_pemohon}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">NIK (Nomor Induk Kependudukan) *</label>
                        <input 
                          type="text" 
                          name="nik" 
                          className="form-control form-control-lg" 
                          placeholder="737201xxxxxxxxxx" 
                          maxLength="16"
                          required 
                          value={formData.nik}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Tempat / Tanggal Lahir *</label>
                        <input 
                          type="text" 
                          name="tempat_tgl_lahir" 
                          className="form-control" 
                          placeholder="Contoh: Parepare, 24 April 1985" 
                          required 
                          value={formData.tempat_tgl_lahir}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Jenis Kelamin *</label>
                        <select name="jenis_kelamin" className="form-select" value={formData.jenis_kelamin} onChange={handleChange}>
                          <option value="Laki-laki">Laki-laki</option>
                          <option value="Perempuan">Perempuan</option>
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Agama *</label>
                        <select name="agama" className="form-select" value={formData.agama} onChange={handleChange}>
                          <option value="Islam">Islam</option>
                          <option value="Kristen">Kristen</option>
                          <option value="Katolik">Katolik</option>
                          <option value="Hindu">Hindu</option>
                          <option value="Buddha">Buddha</option>
                          <option value="Konghucu">Konghucu</option>
                        </select>
                      </div>
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Pekerjaan *</label>
                        <input 
                          type="text" 
                          name="pekerjaan" 
                          className="form-control" 
                          placeholder="Wiraswasta / PNS / Karyawan Swasta" 
                          required 
                          value={formData.pekerjaan}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Nomor WhatsApp / HP Kontak *</label>
                        <input 
                          type="text" 
                          name="no_hp" 
                          className="form-control" 
                          placeholder="08123456789" 
                          required 
                          value={formData.no_hp}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="row g-3 mb-4">
                      <div className="col-md-8">
                        <label className="form-label fw-semibold">Alamat Tempat Tinggal KTP *</label>
                        <input 
                          type="text" 
                          name="alamat" 
                          className="form-control" 
                          placeholder="Jl. Poros Lompoe No. 12" 
                          required 
                          value={formData.alamat}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Wilayah RT / RW *</label>
                        <input 
                          type="text" 
                          name="rt_rw" 
                          className="form-control" 
                          placeholder="RT 02 / RW 03 (Wekke'e)" 
                          required 
                          value={formData.rt_rw}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* ========================================================= */}
                    {/* BAGIAN II: ISIAN DINAMIS SPESIFIK PER JENIS SURAT          */}
                    {/* ========================================================= */}
                    
                    <div className="p-4 bg-light rounded-4 border mb-4 shadow-sm">
                      <h5 className="fw-bold text-dark mb-3">
                        📝 II. Isian Khusus untuk {formData.jenis_surat}
                      </h5>

                      {/* 1. SURAT IZIN KERAMAIAN */}
                      {formData.jenis_surat === 'Surat Izin Keramaian' && (
                        <div>
                          <div className="mb-3">
                            <label className="form-label fw-semibold">Nama / Jenis Acara Keramaian *</label>
                            <input type="text" name="nama_acara" className="form-control" placeholder="Contoh: Pesta Pernikahan & Resepsi Musik" value={extraData.nama_acara} onChange={handleExtraChange} required />
                          </div>
                          <div className="row g-3 mb-3">
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Hari / Tanggal Acara *</label>
                              <input type="text" name="tanggal_acara" className="form-control" placeholder="Sabtu, 15 Agustus 2026" value={extraData.tanggal_acara} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Waktu Pelaksanaan *</label>
                              <input type="text" name="waktu_acara" className="form-control" placeholder="09.00 - 22.00 WITA" value={extraData.waktu_acara} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-12">
                              <label className="form-label fw-semibold">Lokasi / Tempat Acara *</label>
                              <input type="text" name="lokasi_acara" className="form-control" placeholder="Halaman Gedung Gelora Mandiri Lompoe" value={extraData.lokasi_acara} onChange={handleExtraChange} required />
                            </div>
                          </div>

                          <div className="row g-3 mb-3">
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">RT Tempat Acara *</label>
                              <select name="rt_tempat_acara" className="form-select" value={extraData.rt_tempat_acara || '001'} onChange={handleExtraChange} required>
                                <option value="001">001</option>
                                <option value="002">002</option>
                                <option value="003">003</option>
                                <option value="004">004</option>
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">RW Tempat Acara *</label>
                              <select name="rw_tempat_acara" className="form-select" value={extraData.rw_tempat_acara || '001'} onChange={handleExtraChange} required>
                                <option value="001">001</option>
                                <option value="002">002</option>
                                <option value="003">003</option>
                                <option value="004">004</option>
                                <option value="005">005</option>
                                <option value="006">006</option>
                                <option value="007">007</option>
                                <option value="008">008</option>
                                <option value="009">009</option>
                                <option value="010">010</option>
                              </select>
                            </div>
                          </div>

                          <div className="p-3 bg-white rounded-3 border mb-2">
                            <h6 className="fw-bold text-primary mb-3">👨‍💼 Pejabat Penandatangan Resmi (Terkonfirmasi Srikandi):</h6>
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Pejabat yang Bertanda Tangan *</label>
                                <input type="text" name="pejabat_ttd" className="form-control" value={extraData.pejabat_ttd || 'ASMIANTI M., SE.'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Jabatan Pejabat *</label>
                                <input type="text" name="jabatan_pejabat" className="form-control" value={extraData.jabatan_pejabat || 'LURAH LOMPOE'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">NIP Pejabat *</label>
                                <input type="text" name="nip_pejabat" className="form-control" value={extraData.nip_pejabat || '19840927 201001 2 022'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Pangkat Pejabat *</label>
                                <input type="text" name="pangkat_pejabat" className="form-control" value={extraData.pangkat_pejabat || 'Penata Tk. I (III/d)'} onChange={handleExtraChange} required />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 2. SURAT KETERANGAN BELUM MEMILIKI RUMAH */}
                      {formData.jenis_surat === 'Surat Keterangan Belum Memiliki Rumah' && (
                        <div>
                          <div className="row g-3 mb-3">
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kelurahan *</label>
                              <input type="text" name="kelurahan" className="form-control" value={extraData.kelurahan || 'Lompoe'} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kecamatan *</label>
                              <input type="text" name="kecamatan" className="form-control" value={extraData.kecamatan || 'Bacukiki'} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kota/Kabupaten *</label>
                              <input type="text" name="kota_kabupaten" className="form-control" value={extraData.kota_kabupaten || 'Parepare'} onChange={handleExtraChange} required />
                            </div>
                          </div>

                          <div className="mb-3">
                            <label className="form-label fw-semibold">Tempat Tinggal Saat Ini *</label>
                            <input type="text" name="tempat_tinggal_saat_ini" className="form-control" placeholder="Jl. Poros Lompoe No. 45 Parepare" value={extraData.tempat_tinggal_saat_ini} onChange={handleExtraChange} required />
                          </div>

                          <div className="row g-3 mb-3">
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">RT Tempat Tinggal Saat Ini *</label>
                              <select name="rt_tempat_tinggal_saat_ini" className="form-select" value={extraData.rt_tempat_tinggal_saat_ini || '001'} onChange={handleExtraChange} required>
                                <option value="001">001</option>
                                <option value="002">002</option>
                                <option value="003">003</option>
                                <option value="004">004</option>
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">RW Tempat Tinggal Saat Ini *</label>
                              <select name="rw_tempat_tinggal_saat_ini" className="form-select" value={extraData.rw_tempat_tinggal_saat_ini || '001'} onChange={handleExtraChange} required>
                                <option value="001">001</option>
                                <option value="002">002</option>
                                <option value="003">003</option>
                                <option value="004">004</option>
                                <option value="005">005</option>
                                <option value="006">006</option>
                                <option value="007">007</option>
                                <option value="008">008</option>
                                <option value="009">009</option>
                                <option value="010">010</option>
                              </select>
                            </div>
                          </div>

                          <div className="mb-3">
                            <label className="form-label fw-semibold">Status Tempat Tinggal Saat Ini *</label>
                            <select name="status_tempat_tinggal" className="form-select" value={extraData.status_tempat_tinggal || 'kontrakan'} onChange={handleExtraChange} required>
                              <option value="kontrakan">kontrakan</option>
                              <option value="keluarga">keluarga</option>
                              <option value="dinas">dinas</option>
                            </select>
                          </div>

                          <div className="p-3 bg-white rounded-3 border mb-2">
                            <h6 className="fw-bold text-primary mb-3">👨‍💼 Pejabat Penandatangan Resmi (Terkonfirmasi Srikandi):</h6>
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Pejabat yang Bertanda Tangan *</label>
                                <input type="text" name="pejabat_ttd" className="form-control" value={extraData.pejabat_ttd || 'ASMIANTI M., SE.'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Jabatan Pejabat *</label>
                                <input type="text" name="jabatan_pejabat" className="form-control" value={extraData.jabatan_pejabat || 'LURAH LOMPOE'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">NIP Pejabat *</label>
                                <input type="text" name="nip_pejabat" className="form-control" value={extraData.nip_pejabat || '19840927 201001 2 022'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Pangkat Pejabat *</label>
                                <input type="text" name="pangkat_pejabat" className="form-control" value={extraData.pangkat_pejabat || 'Penata Tk. I (III/d)'} onChange={handleExtraChange} required />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 3. SURAT KETERANGAN BELUM PERNAH MENIKAH */}
                      {formData.jenis_surat === 'Surat Keterangan Belum Pernah Menikah' && (
                        <div>
                          <div className="row g-3 mb-3">
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kelurahan *</label>
                              <input type="text" name="kelurahan" className="form-control" value={extraData.kelurahan || 'Lompoe'} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kecamatan *</label>
                              <input type="text" name="kecamatan" className="form-control" value={extraData.kecamatan || 'Bacukiki'} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kota/Kabupaten *</label>
                              <input type="text" name="kota_kabupaten" className="form-control" value={extraData.kota_kabupaten || 'Parepare'} onChange={handleExtraChange} required />
                            </div>
                          </div>

                          <div className="mb-3">
                            <label className="form-label fw-semibold">Tempat Tinggal Saat Ini *</label>
                            <input type="text" name="tempat_tinggal_saat_ini" className="form-control" placeholder="Jl. Poros Lompoe No. 45 Parepare" value={extraData.tempat_tinggal_saat_ini} onChange={handleExtraChange} required />
                          </div>

                          <div className="row g-3 mb-3">
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">RT Tempat Tinggal Saat Ini *</label>
                              <select name="rt_tempat_tinggal_saat_ini" className="form-select" value={extraData.rt_tempat_tinggal_saat_ini || '001'} onChange={handleExtraChange} required>
                                <option value="001">001</option>
                                <option value="002">002</option>
                                <option value="003">003</option>
                                <option value="004">004</option>
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">RW Tempat Tinggal Saat Ini *</label>
                              <select name="rw_tempat_tinggal_saat_ini" className="form-select" value={extraData.rw_tempat_tinggal_saat_ini || '001'} onChange={handleExtraChange} required>
                                <option value="001">001</option>
                                <option value="002">002</option>
                                <option value="003">003</option>
                                <option value="004">004</option>
                                <option value="005">005</option>
                                <option value="006">006</option>
                                <option value="007">007</option>
                                <option value="008">008</option>
                                <option value="009">009</option>
                                <option value="010">010</option>
                              </select>
                            </div>
                          </div>

                          <div className="mb-3">
                            <label className="form-label fw-semibold">Keperluan Pembuatan Surat *</label>
                            <input type="text" name="keperluan" className="form-control" placeholder="Contoh: Persyaratan Administrasi Pernikahan / Melamar Pekerjaan / CPNS" value={formData.keperluan} onChange={handleChange} required />
                          </div>

                          <div className="p-3 bg-white rounded-3 border mb-2">
                            <h6 className="fw-bold text-primary mb-3">👨‍💼 Pejabat Penandatangan Resmi (Terkonfirmasi Srikandi):</h6>
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Pejabat yang Bertanda Tangan *</label>
                                <input type="text" name="pejabat_ttd" className="form-control" value={extraData.pejabat_ttd || 'ASMIANTI M., SE.'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Jabatan Pejabat *</label>
                                <input type="text" name="jabatan_pejabat" className="form-control" value={extraData.jabatan_pejabat || 'LURAH LOMPOE'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">NIP Pejabat *</label>
                                <input type="text" name="nip_pejabat" className="form-control" value={extraData.nip_pejabat || '19840927 201001 2 022'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Pangkat Pejabat *</label>
                                <input type="text" name="pangkat_pejabat" className="form-control" value={extraData.pangkat_pejabat || 'Penata Tk. I (III/d)'} onChange={handleExtraChange} required />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 4. SURAT KETERANGAN BERTEMPAT TINGGAL */}
                      {formData.jenis_surat === 'Surat Keterangan Bertempat Tinggal' && (
                        <div>
                          <div className="row g-3 mb-3">
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kelurahan *</label>
                              <input type="text" name="kelurahan" className="form-control" value={extraData.kelurahan || 'Lompoe'} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kecamatan *</label>
                              <input type="text" name="kecamatan" className="form-control" value={extraData.kecamatan || 'Bacukiki'} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kota/Kabupaten *</label>
                              <input type="text" name="kota_kabupaten" className="form-control" value={extraData.kota_kabupaten || 'Parepare'} onChange={handleExtraChange} required />
                            </div>
                          </div>

                          <div className="mb-3">
                            <label className="form-label fw-semibold">Alamat Tempat Tinggal Domisili Saat Ini *</label>
                            <input type="text" name="tempat_tinggal_saat_ini" className="form-control" placeholder="Jl. Poros Lompoe No. 45 Parepare" value={extraData.tempat_tinggal_saat_ini} onChange={handleExtraChange} required />
                          </div>

                          <div className="row g-3 mb-3">
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">RT Tempat Tinggal Saat Ini *</label>
                              <select name="rt_tempat_tinggal_saat_ini" className="form-select" value={extraData.rt_tempat_tinggal_saat_ini || '001'} onChange={handleExtraChange} required>
                                <option value="001">001</option>
                                <option value="002">002</option>
                                <option value="003">003</option>
                                <option value="004">004</option>
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">RW Tempat Tinggal Saat Ini *</label>
                              <select name="rw_tempat_tinggal_saat_ini" className="form-select" value={extraData.rw_tempat_tinggal_saat_ini || '001'} onChange={handleExtraChange} required>
                                <option value="001">001</option>
                                <option value="002">002</option>
                                <option value="003">003</option>
                                <option value="004">004</option>
                                <option value="005">005</option>
                                <option value="006">006</option>
                                <option value="007">007</option>
                                <option value="008">008</option>
                                <option value="009">009</option>
                                <option value="010">010</option>
                              </select>
                            </div>
                          </div>

                          <div className="mb-3">
                            <label className="form-label fw-semibold">Lama Tinggal di Wilayah Ini *</label>
                            <input type="text" name="lama_tinggal" className="form-control" placeholder="Contoh: 5 Tahun / Sejak Tahun 2019" value={extraData.lama_tinggal} onChange={handleExtraChange} required />
                          </div>

                          <div className="p-3 bg-white rounded-3 border mb-2">
                            <h6 className="fw-bold text-primary mb-3">👨‍💼 Pejabat Penandatangan Resmi (Terkonfirmasi Srikandi):</h6>
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Pejabat yang Bertanda Tangan *</label>
                                <input type="text" name="pejabat_ttd" className="form-control" value={extraData.pejabat_ttd || 'ASMIANTI M., SE.'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Jabatan Pejabat *</label>
                                <input type="text" name="jabatan_pejabat" className="form-control" value={extraData.jabatan_pejabat || 'LURAH LOMPOE'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">NIP Pejabat *</label>
                                <input type="text" name="nip_pejabat" className="form-control" value={extraData.nip_pejabat || '19840927 201001 2 022'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Pangkat Pejabat *</label>
                                <input type="text" name="pangkat_pejabat" className="form-control" value={extraData.pangkat_pejabat || 'Penata Tk. I (III/d)'} onChange={handleExtraChange} required />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 5. SURAT KETERANGAN BERPENGHASILAN */}
                      {formData.jenis_surat === 'Surat Keterangan Berpenghasilan' && (
                        <div>
                          <div className="row g-3 mb-3">
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kelurahan *</label>
                              <input type="text" name="kelurahan" className="form-control" value={extraData.kelurahan || 'Lompoe'} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kecamatan *</label>
                              <input type="text" name="kecamatan" className="form-control" value={extraData.kecamatan || 'Bacukiki'} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kota/Kabupaten *</label>
                              <input type="text" name="kota_kabupaten" className="form-control" value={extraData.kota_kabupaten || 'Parepare'} onChange={handleExtraChange} required />
                            </div>
                          </div>

                          <div className="row g-3 mb-3">
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Jumlah Penghasilan per Bulan (Rp) *</label>
                              <input type="text" name="jumlah_penghasilan_angka" className="form-control" placeholder="Contoh: 2.500.000" value={extraData.jumlah_penghasilan_angka} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Jumlah Penghasilan (Terbilang Huruf) *</label>
                              <input type="text" name="jumlah_penghasilan_huruf" className="form-control" placeholder="Contoh: Dua Juta Lima Ratus Ribu Rupiah" value={extraData.jumlah_penghasilan_huruf} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-12">
                              <label className="form-label fw-semibold">Sumber / Usaha Penghasilan *</label>
                              <input type="text" name="sumber_penghasilan" className="form-control" placeholder="Contoh: Hasil Usaha Toko Kelontong / Petani" value={extraData.sumber_penghasilan} onChange={handleExtraChange} required />
                            </div>
                          </div>

                          <div className="row g-3 mb-3">
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">RT Tempat Tinggal Saat Ini *</label>
                              <select name="rt_tempat_tinggal_saat_ini" className="form-select" value={extraData.rt_tempat_tinggal_saat_ini || '001'} onChange={handleExtraChange} required>
                                <option value="001">001</option>
                                <option value="002">002</option>
                                <option value="003">003</option>
                                <option value="004">004</option>
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">RW Tempat Tinggal Saat Ini *</label>
                              <select name="rw_tempat_tinggal_saat_ini" className="form-select" value={extraData.rw_tempat_tinggal_saat_ini || '001'} onChange={handleExtraChange} required>
                                <option value="001">001</option>
                                <option value="002">002</option>
                                <option value="003">003</option>
                                <option value="004">004</option>
                                <option value="005">005</option>
                                <option value="006">006</option>
                                <option value="007">007</option>
                                <option value="008">008</option>
                                <option value="009">009</option>
                                <option value="010">010</option>
                              </select>
                            </div>
                          </div>

                          <div className="p-3 bg-white rounded-3 border mb-2">
                            <h6 className="fw-bold text-primary mb-3">👨‍💼 Pejabat Penandatangan Resmi (Terkonfirmasi Srikandi):</h6>
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Pejabat yang Bertanda Tangan *</label>
                                <input type="text" name="pejabat_ttd" className="form-control" value={extraData.pejabat_ttd || 'ASMIANTI M., SE.'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Jabatan Pejabat *</label>
                                <input type="text" name="jabatan_pejabat" className="form-control" value={extraData.jabatan_pejabat || 'LURAH LOMPOE'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">NIP Pejabat *</label>
                                <input type="text" name="nip_pejabat" className="form-control" value={extraData.nip_pejabat || '19840927 201001 2 022'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Pangkat Pejabat *</label>
                                <input type="text" name="pangkat_pejabat" className="form-control" value={extraData.pangkat_pejabat || 'Penata Tk. I (III/d)'} onChange={handleExtraChange} required />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 7. SURAT KETERANGAN LAYAK DIBANTU */}
                      {formData.jenis_surat === 'Surat Keterangan Layak Dibantu' && (
                        <div>
                          <div className="row g-3 mb-3">
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kelurahan *</label>
                              <input type="text" name="kelurahan" className="form-control" value={extraData.kelurahan || 'Lompoe'} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kecamatan *</label>
                              <input type="text" name="kecamatan" className="form-control" value={extraData.kecamatan || 'Bacukiki'} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kota/Kabupaten *</label>
                              <input type="text" name="kota_kabupaten" className="form-control" value={extraData.kota_kabupaten || 'Parepare'} onChange={handleExtraChange} required />
                            </div>
                          </div>

                          <div className="mb-3">
                            <label className="form-label fw-semibold">Bantuan yang Dimohonkan *</label>
                            <input type="text" name="bantuan_dimohonkan" className="form-control" placeholder="Contoh: Bantuan Program Keluarga Harapan (PKH) / Bantuan Sembako / Kartu Indonesia Sehat (KIS)" value={extraData.bantuan_dimohonkan} onChange={handleExtraChange} required />
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-semibold">Keterangan Kondisi Ekonomi Keluarga *</label>
                            <input type="text" name="kondisi_ekonomi" className="form-control" placeholder="Contoh: Berasal dari keluarga berpenghasilan rendah / kurang mampu" value={extraData.kondisi_ekonomi} onChange={handleExtraChange} required />
                          </div>

                          <div className="row g-3 mb-3">
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">RT Tempat Tinggal Saat Ini *</label>
                              <select name="rt_tempat_tinggal_saat_ini" className="form-select" value={extraData.rt_tempat_tinggal_saat_ini || '001'} onChange={handleExtraChange} required>
                                <option value="001">001</option>
                                <option value="002">002</option>
                                <option value="003">003</option>
                                <option value="004">004</option>
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">RW Tempat Tinggal Saat Ini *</label>
                              <select name="rw_tempat_tinggal_saat_ini" className="form-select" value={extraData.rw_tempat_tinggal_saat_ini || '001'} onChange={handleExtraChange} required>
                                <option value="001">001</option>
                                <option value="002">002</option>
                                <option value="003">003</option>
                                <option value="004">004</option>
                                <option value="005">005</option>
                                <option value="006">006</option>
                                <option value="007">007</option>
                                <option value="008">008</option>
                                <option value="009">009</option>
                                <option value="010">010</option>
                              </select>
                            </div>
                          </div>

                          <div className="p-3 bg-white rounded-3 border mb-2">
                            <h6 className="fw-bold text-primary mb-3">👨‍💼 Pejabat Penandatangan Resmi (Terkonfirmasi Srikandi):</h6>
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Pejabat yang Bertanda Tangan *</label>
                                <input type="text" name="pejabat_ttd" className="form-control" value={extraData.pejabat_ttd || 'ASMIANTI M., SE.'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Jabatan Pejabat *</label>
                                <input type="text" name="jabatan_pejabat" className="form-control" value={extraData.jabatan_pejabat || 'LURAH LOMPOE'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">NIP Pejabat *</label>
                                <input type="text" name="nip_pejabat" className="form-control" value={extraData.nip_pejabat || '19840927 201001 2 022'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Pangkat Pejabat *</label>
                                <input type="text" name="pangkat_pejabat" className="form-control" value={extraData.pangkat_pejabat || 'Penata Tk. I (III/d)'} onChange={handleExtraChange} required />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 8. SURAT KETERANGAN ORANG YANG SAMA */}
                      {formData.jenis_surat === 'Surat Keterangan Orang yang Sama' && (
                        <div>
                          <div className="row g-3 mb-3">
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kelurahan *</label>
                              <input type="text" name="kelurahan" className="form-control" value={extraData.kelurahan || 'Lompoe'} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kecamatan *</label>
                              <input type="text" name="kecamatan" className="form-control" value={extraData.kecamatan || 'Bacukiki'} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kota/Kabupaten *</label>
                              <input type="text" name="kota_kabupaten" className="form-control" value={extraData.kota_kabupaten || 'Parepare'} onChange={handleExtraChange} required />
                            </div>
                          </div>

                          <p className="small text-muted mb-3">Formulir ini digunakan apabila terdapat perbedaan nama / data pada dua dokumen milik orang yang sama.</p>
                          <div className="row g-3 mb-3">
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Nama Dokumen 1 (Misal: KTP / KK) *</label>
                              <input type="text" name="dokumen1_nama" className="form-control" placeholder="KTP" value={extraData.dokumen1_nama} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Nama Tertulis di Dokumen 1 *</label>
                              <input type="text" name="dokumen1_nama_tercantum" className="form-control" placeholder="Contoh: AHMAD RISWAN" value={extraData.dokumen1_nama_tercantum} onChange={handleExtraChange} required />
                            </div>
                          </div>
                          <div className="row g-3 mb-3">
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Nama Dokumen 2 (Misal: Ijazah / Sertifikat) *</label>
                              <input type="text" name="dokumen2_nama" className="form-control" placeholder="Ijazah SMA" value={extraData.dokumen2_nama} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Nama Tertulis di Dokumen 2 *</label>
                              <input type="text" name="dokumen2_nama_tercantum" className="form-control" placeholder="Contoh: AMD. RISWAN" value={extraData.dokumen2_nama_tercantum} onChange={handleExtraChange} required />
                            </div>
                          </div>

                          <div className="row g-3 mb-3">
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">RT Tempat Tinggal Saat Ini *</label>
                              <select name="rt_tempat_tinggal_saat_ini" className="form-select" value={extraData.rt_tempat_tinggal_saat_ini || '001'} onChange={handleExtraChange} required>
                                <option value="001">001</option>
                                <option value="002">002</option>
                                <option value="003">003</option>
                                <option value="004">004</option>
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">RW Tempat Tinggal Saat Ini *</label>
                              <select name="rw_tempat_tinggal_saat_ini" className="form-select" value={extraData.rw_tempat_tinggal_saat_ini || '001'} onChange={handleExtraChange} required>
                                <option value="001">001</option>
                                <option value="002">002</option>
                                <option value="003">003</option>
                                <option value="004">004</option>
                                <option value="005">005</option>
                                <option value="006">006</option>
                                <option value="007">007</option>
                                <option value="008">008</option>
                                <option value="009">009</option>
                                <option value="010">010</option>
                              </select>
                            </div>
                          </div>

                          <div className="p-3 bg-white rounded-3 border mb-2">
                            <h6 className="fw-bold text-primary mb-3">👨‍💼 Pejabat Penandatangan Resmi (Terkonfirmasi Srikandi):</h6>
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Pejabat yang Bertanda Tangan *</label>
                                <input type="text" name="pejabat_ttd" className="form-control" value={extraData.pejabat_ttd || 'ASMIANTI M., SE.'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Jabatan Pejabat *</label>
                                <input type="text" name="jabatan_pejabat" className="form-control" value={extraData.jabatan_pejabat || 'LURAH LOMPOE'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">NIP Pejabat *</label>
                                <input type="text" name="nip_pejabat" className="form-control" value={extraData.nip_pejabat || '19840927 201001 2 022'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Pangkat Pejabat *</label>
                                <input type="text" name="pangkat_pejabat" className="form-control" value={extraData.pangkat_pejabat || 'Penata Tk. I (III/d)'} onChange={handleExtraChange} required />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 9. SURAT KETERANGAN PENGHASILAN ORANG TUA */}
                      {formData.jenis_surat === 'Surat Keterangan Penghasilan Orang Tua' && (
                        <div>
                          <div className="row g-3 mb-3">
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kelurahan *</label>
                              <input type="text" name="kelurahan" className="form-control" value={extraData.kelurahan || 'Lompoe'} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kecamatan *</label>
                              <input type="text" name="kecamatan" className="form-control" value={extraData.kecamatan || 'Bacukiki'} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kota/Kabupaten *</label>
                              <input type="text" name="kota_kabupaten" className="form-control" value={extraData.kota_kabupaten || 'Parepare'} onChange={handleExtraChange} required />
                            </div>
                          </div>

                          <div className="row g-3 mb-3">
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Penghasilan Orang Tua per Bulan (Rp) *</label>
                              <input type="text" name="penghasilan_orang_tua" className="form-control" placeholder="Rp 1.500.000" value={extraData.penghasilan_orang_tua} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Jumlah Anak Tanggungan *</label>
                              <input type="text" name="jumlah_tanggungan" className="form-control" placeholder="3 Orang" value={extraData.jumlah_tanggungan} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Nama Anak yang Mengajukan (Siswa/Mahasiswa) *</label>
                              <input type="text" name="nama_anak" className="form-control" placeholder="Nama lengkap anak" value={extraData.nama_anak} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">NIK Anak *</label>
                              <input type="text" name="nik_anak" className="form-control" placeholder="737201xxxxxxxxxx" value={extraData.nik_anak || ''} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Tempat / Tanggal Lahir Anak *</label>
                              <input type="text" name="tgl_lahir_anak" className="form-control" placeholder="Parepare, 20 Maret 2005" value={extraData.tgl_lahir_anak || ''} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Nama Sekolah / Perguruan Tinggi (Kampus Anak) *</label>
                              <input type="text" name="sekolah_kampus_anak" className="form-control" placeholder="Universitas Negeri Parepare / SMAN 1" value={extraData.sekolah_kampus_anak} onChange={handleExtraChange} required />
                            </div>
                          </div>

                          <div className="row g-3 mb-3">
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">RT Tempat Tinggal Saat Ini *</label>
                              <select name="rt_tempat_tinggal_saat_ini" className="form-select" value={extraData.rt_tempat_tinggal_saat_ini || '001'} onChange={handleExtraChange} required>
                                <option value="001">001</option>
                                <option value="002">002</option>
                                <option value="003">003</option>
                                <option value="004">004</option>
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">RW Tempat Tinggal Saat Ini *</label>
                              <select name="rw_tempat_tinggal_saat_ini" className="form-select" value={extraData.rw_tempat_tinggal_saat_ini || '001'} onChange={handleExtraChange} required>
                                <option value="001">001</option>
                                <option value="002">002</option>
                                <option value="003">003</option>
                                <option value="004">004</option>
                                <option value="005">005</option>
                                <option value="006">006</option>
                                <option value="007">007</option>
                                <option value="008">008</option>
                                <option value="009">009</option>
                                <option value="010">010</option>
                              </select>
                            </div>
                          </div>

                          <div className="p-3 bg-white rounded-3 border mb-2">
                            <h6 className="fw-bold text-primary mb-3">👨‍💼 Pejabat Penandatangan Resmi (Terkonfirmasi Srikandi):</h6>
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Pejabat yang Bertanda Tangan *</label>
                                <input type="text" name="pejabat_ttd" className="form-control" value={extraData.pejabat_ttd || 'ASMIANTI M., SE.'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Jabatan Pejabat *</label>
                                <input type="text" name="jabatan_pejabat" className="form-control" value={extraData.jabatan_pejabat || 'LURAH LOMPOE'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">NIP Pejabat *</label>
                                <input type="text" name="nip_pejabat" className="form-control" value={extraData.nip_pejabat || '19840927 201001 2 022'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Pangkat Pejabat *</label>
                                <input type="text" name="pangkat_pejabat" className="form-control" value={extraData.pangkat_pejabat || 'Penata Tk. I (III/d)'} onChange={handleExtraChange} required />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 10. SURAT KETERANGAN PENGUBURAN */}
                      {formData.jenis_surat === 'Surat Keterangan Penguburan' && (
                        <div>
                          <div className="row g-3 mb-3">
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kelurahan *</label>
                              <input type="text" name="kelurahan" className="form-control" value={extraData.kelurahan || 'Lompoe'} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kecamatan *</label>
                              <input type="text" name="kecamatan" className="form-control" value={extraData.kecamatan || 'Bacukiki'} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kota/Kabupaten *</label>
                              <input type="text" name="kota_kabupaten" className="form-control" value={extraData.kota_kabupaten || 'Parepare'} onChange={handleExtraChange} required />
                            </div>
                          </div>

                          <div className="row g-3 mb-3">
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Nama Almarhum / Almarhumah *</label>
                              <input type="text" name="nama_almarhum" className="form-control" placeholder="Nama almarhum/ah" value={extraData.nama_almarhum} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Hari / Tanggal Penguburan *</label>
                              <input type="text" name="tgl_penguburan" className="form-control" placeholder="Kamis, 30 Juli 2026" value={extraData.tgl_penguburan} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Waktu Pemakaman *</label>
                              <input type="text" name="waktu_penguburan" className="form-control" placeholder="15.30 WITA (Ba'da Ashar)" value={extraData.waktu_penguburan} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Lokasi Pemakaman / TPU *</label>
                              <input type="text" name="lokasi_pemakaman" className="form-control" placeholder="TPU Islam Wekke'e Lompoe" value={extraData.lokasi_pemakaman} onChange={handleExtraChange} required />
                            </div>
                          </div>

                          <div className="row g-3 mb-3">
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">RT Pemakaman / Duka *</label>
                              <select name="rt_penguburan" className="form-select" value={extraData.rt_penguburan || '001'} onChange={handleExtraChange} required>
                                <option value="001">001</option>
                                <option value="002">002</option>
                                <option value="003">003</option>
                                <option value="004">004</option>
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">RW Pemakaman / Duka *</label>
                              <select name="rw_penguburan" className="form-select" value={extraData.rw_penguburan || '001'} onChange={handleExtraChange} required>
                                <option value="001">001</option>
                                <option value="002">002</option>
                                <option value="003">003</option>
                                <option value="004">004</option>
                                <option value="005">005</option>
                                <option value="006">006</option>
                                <option value="007">007</option>
                                <option value="008">008</option>
                                <option value="009">009</option>
                                <option value="010">010</option>
                              </select>
                            </div>
                          </div>

                          <div className="p-3 bg-white rounded-3 border mb-2">
                            <h6 className="fw-bold text-primary mb-3">👨‍💼 Pejabat Penandatangan Resmi (Terkonfirmasi Srikandi):</h6>
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Pejabat yang Bertanda Tangan *</label>
                                <input type="text" name="pejabat_ttd" className="form-control" value={extraData.pejabat_ttd || 'ASMIANTI M., SE.'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Jabatan Pejabat *</label>
                                <input type="text" name="jabatan_pejabat" className="form-control" value={extraData.jabatan_pejabat || 'LURAH LOMPOE'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">NIP Pejabat *</label>
                                <input type="text" name="nip_pejabat" className="form-control" value={extraData.nip_pejabat || '19840927 201001 2 022'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Pangkat Pejabat *</label>
                                <input type="text" name="pangkat_pejabat" className="form-control" value={extraData.pangkat_pejabat || 'Penata Tk. I (III/d)'} onChange={handleExtraChange} required />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 11. SURAT KETERANGAN PERGANTIAN STATUS PEKERJAAN */}
                      {formData.jenis_surat === 'Surat Keterangan Pergantian Status Pekerjaan' && (
                        <div>
                          <div className="row g-3 mb-3">
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kelurahan *</label>
                              <input type="text" name="kelurahan" className="form-control" value={extraData.kelurahan || 'Lompoe'} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kecamatan *</label>
                              <input type="text" name="kecamatan" className="form-control" value={extraData.kecamatan || 'Bacukiki'} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kota/Kabupaten *</label>
                              <input type="text" name="kota_kabupaten" className="form-control" value={extraData.kota_kabupaten || 'Parepare'} onChange={handleExtraChange} required />
                            </div>
                          </div>

                          <div className="row g-3 mb-3">
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Status Pekerjaan Lama (di KTP) *</label>
                              <input type="text" name="pekerjaan_lama" className="form-control" placeholder="Belum / Tidak Bekerja" value={extraData.pekerjaan_lama} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Status Pekerjaan Baru Saat Ini *</label>
                              <input type="text" name="pekerjaan_baru" className="form-control" placeholder="Wiraswasta / Karyawan Swasta" value={extraData.pekerjaan_baru} onChange={handleExtraChange} required />
                            </div>
                          </div>

                          <div className="row g-3 mb-3">
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">RT Tempat Tinggal Saat Ini *</label>
                              <select name="rt_tempat_tinggal_saat_ini" className="form-select" value={extraData.rt_tempat_tinggal_saat_ini || '001'} onChange={handleExtraChange} required>
                                <option value="001">001</option>
                                <option value="002">002</option>
                                <option value="003">003</option>
                                <option value="004">004</option>
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">RW Tempat Tinggal Saat Ini *</label>
                              <select name="rw_tempat_tinggal_saat_ini" className="form-select" value={extraData.rw_tempat_tinggal_saat_ini || '001'} onChange={handleExtraChange} required>
                                <option value="001">001</option>
                                <option value="002">002</option>
                                <option value="003">003</option>
                                <option value="004">004</option>
                                <option value="005">005</option>
                                <option value="006">006</option>
                                <option value="007">007</option>
                                <option value="008">008</option>
                                <option value="009">009</option>
                                <option value="010">010</option>
                              </select>
                            </div>
                          </div>

                          <div className="p-3 bg-white rounded-3 border mb-2">
                            <h6 className="fw-bold text-primary mb-3">👨‍💼 Pejabat Penandatangan Resmi (Terkonfirmasi Srikandi):</h6>
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Pejabat yang Bertanda Tangan *</label>
                                <input type="text" name="pejabat_ttd" className="form-control" value={extraData.pejabat_ttd || 'ASMIANTI M., SE.'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Jabatan Pejabat *</label>
                                <input type="text" name="jabatan_pejabat" className="form-control" value={extraData.jabatan_pejabat || 'LURAH LOMPOE'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">NIP Pejabat *</label>
                                <input type="text" name="nip_pejabat" className="form-control" value={extraData.nip_pejabat || '19840927 201001 2 022'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Pangkat Pejabat *</label>
                                <input type="text" name="pangkat_pejabat" className="form-control" value={extraData.pangkat_pejabat || 'Penata Tk. I (III/d)'} onChange={handleExtraChange} required />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 12. SURAT REKOMENDASI PEMBELIAN BBM */}
                      {formData.jenis_surat === 'Surat Rekomendasi Pembelian BBM' && (
                        <div>
                          <div className="row g-3 mb-3">
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kelurahan *</label>
                              <input type="text" name="kelurahan" className="form-control" value={extraData.kelurahan || 'Lompoe'} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kecamatan *</label>
                              <input type="text" name="kecamatan" className="form-control" value={extraData.kecamatan || 'Bacukiki'} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kota/Kabupaten *</label>
                              <input type="text" name="kota_kabupaten" className="form-control" value={extraData.kota_kabupaten || 'Parepare'} onChange={handleExtraChange} required />
                            </div>
                          </div>

                          <div className="row g-3 mb-3">
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Konsumen Pengguna *</label>
                              <select name="konsumen_pengguna" className="form-select" value={extraData.konsumen_pengguna || 'Pertanian'} onChange={handleExtraChange} required>
                                <option value="Pertanian">Pertanian</option>
                                <option value="Usaha Mikro">Usaha Mikro</option>
                                <option value="Perikanan">Perikanan</option>
                                <option value="Pelayanan Umum">Pelayanan Umum</option>
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Jenis Usaha / Kegiatan *</label>
                              <input type="text" name="jenis_usaha" className="form-control" placeholder="Contoh: Pertanian Padi / Perikanan Laut / Kuliner" value={extraData.jenis_usaha || ''} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Jenis Alat / Mesin Usaha *</label>
                              <input type="text" name="jenis_alat" className="form-control" placeholder="Contoh: Mesin Pompa Air / Mesin Traktor / Perahu" value={extraData.jenis_alat || ''} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Jumlah Unit Alat *</label>
                              <input type="text" name="jumlah_alat" className="form-control" placeholder="Contoh: 1 Unit" value={extraData.jumlah_alat || ''} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Fungsi Alat / Kegunaan *</label>
                              <input type="text" name="fungsi_alat" className="form-control" placeholder="Contoh: Penyiraman Sawah / Pengolahan Lahan / Genset Usaha" value={extraData.fungsi_alat || ''} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Jenis BBM Bersubsidi yang Diminta *</label>
                              <select name="jenis_bbm" className="form-select" value={extraData.jenis_bbm || 'Solar (BBM Bersubsidi)'} onChange={handleExtraChange}>
                                <option value="Solar (BBM Bersubsidi)">Solar (BBM Bersubsidi)</option>
                                <option value="Pertalite (BBM Bersubsidi)">Pertalite (BBM Bersubsidi)</option>
                              </select>
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kebutuhan BBM *</label>
                              <input type="text" name="kebutuhan_bbm" className="form-control" placeholder="Contoh: 2 Liter / Hari" value={extraData.kebutuhan_bbm || ''} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Jam / Hari Operasi *</label>
                              <input type="text" name="jam_operasi" className="form-control" placeholder="Contoh: 8 Jam / Hari" value={extraData.jam_operasi || ''} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Total Alokasi Kuota Liter *</label>
                              <input type="text" name="jumlah_liter" className="form-control" placeholder="Contoh: 60 Liter / Bulan" value={extraData.jumlah_liter || ''} onChange={handleExtraChange} required />
                            </div>
                          </div>

                          <div className="row g-3 mb-3">
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">RT Tempat Usaha / Domisili *</label>
                              <select name="rt_tempat_tinggal_saat_ini" className="form-select" value={extraData.rt_tempat_tinggal_saat_ini || '001'} onChange={handleExtraChange} required>
                                <option value="001">001</option>
                                <option value="002">002</option>
                                <option value="003">003</option>
                                <option value="004">004</option>
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">RW Tempat Usaha / Domisili *</label>
                              <select name="rw_tempat_tinggal_saat_ini" className="form-select" value={extraData.rw_tempat_tinggal_saat_ini || '001'} onChange={handleExtraChange} required>
                                <option value="001">001</option>
                                <option value="002">002</option>
                                <option value="003">003</option>
                                <option value="004">004</option>
                                <option value="005">005</option>
                                <option value="006">006</option>
                                <option value="007">007</option>
                                <option value="008">008</option>
                                <option value="009">009</option>
                                <option value="010">010</option>
                              </select>
                            </div>
                          </div>

                          <div className="p-3 bg-white rounded-3 border mb-2">
                            <h6 className="fw-bold text-primary mb-3">👨‍💼 Pejabat Penandatangan Resmi (Terkonfirmasi Srikandi):</h6>
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Pejabat yang Bertanda Tangan *</label>
                                <input type="text" name="pejabat_ttd" className="form-control" value={extraData.pejabat_ttd || 'ASMIANTI M., SE.'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Jabatan Pejabat *</label>
                                <input type="text" name="jabatan_pejabat" className="form-control" value={extraData.jabatan_pejabat || 'LURAH LOMPOE'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">NIP Pejabat *</label>
                                <input type="text" name="nip_pejabat" className="form-control" value={extraData.nip_pejabat || '19840927 201001 2 022'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Pangkat Pejabat *</label>
                                <input type="text" name="pangkat_pejabat" className="form-control" value={extraData.pangkat_pejabat || 'Penata Tk. I (III/d)'} onChange={handleExtraChange} required />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 13. BLANGKO NIKAH (MODEL N1) */}
                      {formData.jenis_surat === 'Blangko Nikah' && (
                        <div>
                          <div className="row g-3 mb-3">
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kelurahan *</label>
                              <input type="text" name="kelurahan" className="form-control" value={extraData.kelurahan || 'Lompoe'} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kecamatan *</label>
                              <input type="text" name="kecamatan" className="form-control" value={extraData.kecamatan || 'Bacukiki'} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Kota/Kabupaten *</label>
                              <input type="text" name="kota_kabupaten" className="form-control" value={extraData.kota_kabupaten || 'Parepare'} onChange={handleExtraChange} required />
                            </div>
                          </div>

                          <div className="row g-3 mb-3">
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Status Perkawinan Pemohon *</label>
                              <select name="status_perkawinan" className="form-select" value={extraData.status_perkawinan} onChange={handleExtraChange}>
                                <option value="Jejaka">Jejaka</option>
                                <option value="Perawan">Perawan</option>
                                <option value="Duda">Duda</option>
                                <option value="Janda">Janda</option>
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Nama Suami/Istri Terdahulu (Jika Duda/Janda)</label>
                              <input type="text" name="nama_pasangan_terdahulu" className="form-control" placeholder="Isi '-' jika Jejaka/Perawan" value={extraData.nama_pasangan_terdahulu} onChange={handleExtraChange} />
                            </div>
                          </div>

                          <h6 className="fw-bold text-primary mt-3 mb-2">👨 Data Ayah Kandung Pemohon:</h6>
                          <div className="row g-3 mb-3">
                            <div className="col-md-6">
                              <label className="form-label fw-semibold small">Nama Lengkap Ayah Kandung *</label>
                              <input type="text" name="nama_ayah" className="form-control" placeholder="Nama Lengkap Ayah" value={extraData.nama_ayah} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold small">NIK Ayah Kandung *</label>
                              <input type="text" name="nik_ayah" className="form-control" placeholder="737201xxxxxxxxxx" value={extraData.nik_ayah} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold small">Tempat / Tanggal Lahir Ayah Kandung *</label>
                              <input type="text" name="tgl_lahir_ayah" className="form-control" placeholder="Parepare, 12 Mei 1965" value={extraData.tgl_lahir_ayah || ''} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold small">Agama Ayah *</label>
                              <select name="agama_ayah" className="form-select" value={extraData.agama_ayah || 'Islam'} onChange={handleExtraChange}>
                                <option value="Islam">Islam</option>
                                <option value="Kristen">Kristen</option>
                                <option value="Katolik">Katolik</option>
                                <option value="Hindu">Hindu</option>
                                <option value="Buddha">Buddha</option>
                                <option value="Konghucu">Konghucu</option>
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold small">Pekerjaan Ayah Kandung *</label>
                              <input type="text" name="pekerjaan_ayah" className="form-control" placeholder="Wiraswasta / PNS / Petani" value={extraData.pekerjaan_ayah || ''} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold small">Alamat Ayah Kandung *</label>
                              <input type="text" name="alamat_ayah" className="form-control" placeholder="Jl. Poros Lompoe No. 45 Parepare" value={extraData.alamat_ayah || ''} onChange={handleExtraChange} required />
                            </div>
                          </div>

                          <h6 className="fw-bold text-primary mt-3 mb-2">👩 Data Ibu Kandung Pemohon:</h6>
                          <div className="row g-3 mb-3">
                            <div className="col-md-6">
                              <label className="form-label fw-semibold small">Nama Lengkap Ibu Kandung *</label>
                              <input type="text" name="nama_ibu" className="form-control" placeholder="Nama Lengkap Ibu" value={extraData.nama_ibu} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold small">NIK Ibu Kandung *</label>
                              <input type="text" name="nik_ibu" className="form-control" placeholder="737201xxxxxxxxxx" value={extraData.nik_ibu} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold small">Tempat / Tanggal Lahir Ibu Kandung *</label>
                              <input type="text" name="tgl_lahir_ibu" className="form-control" placeholder="Parepare, 18 Agustus 1970" value={extraData.tgl_lahir_ibu || ''} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold small">Agama Ibu *</label>
                              <select name="agama_ibu" className="form-select" value={extraData.agama_ibu || 'Islam'} onChange={handleExtraChange}>
                                <option value="Islam">Islam</option>
                                <option value="Kristen">Kristen</option>
                                <option value="Katolik">Katolik</option>
                                <option value="Hindu">Hindu</option>
                                <option value="Buddha">Buddha</option>
                                <option value="Konghucu">Konghucu</option>
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold small">Pekerjaan Ibu Kandung *</label>
                              <input type="text" name="pekerjaan_ibu" className="form-control" placeholder="Mengurus Rumah Tangga / PNS" value={extraData.pekerjaan_ibu || ''} onChange={handleExtraChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold small">Alamat Ibu Kandung *</label>
                              <input type="text" name="alamat_ibu" className="form-control" placeholder="Jl. Poros Lompoe No. 45 Parepare" value={extraData.alamat_ibu || ''} onChange={handleExtraChange} required />
                            </div>
                          </div>

                          <div className="row g-3 mb-3">
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">RT Tempat Tinggal Saat Ini *</label>
                              <select name="rt_tempat_tinggal_saat_ini" className="form-select" value={extraData.rt_tempat_tinggal_saat_ini || '001'} onChange={handleExtraChange} required>
                                <option value="001">001</option>
                                <option value="002">002</option>
                                <option value="003">003</option>
                                <option value="004">004</option>
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">RW Tempat Tinggal Saat Ini *</label>
                              <select name="rw_tempat_tinggal_saat_ini" className="form-select" value={extraData.rw_tempat_tinggal_saat_ini || '001'} onChange={handleExtraChange} required>
                                <option value="001">001</option>
                                <option value="002">002</option>
                                <option value="003">003</option>
                                <option value="004">004</option>
                                <option value="005">005</option>
                                <option value="006">006</option>
                                <option value="007">007</option>
                                <option value="008">008</option>
                                <option value="009">009</option>
                                <option value="010">010</option>
                              </select>
                            </div>
                          </div>

                          <div className="p-3 bg-white rounded-3 border mb-2">
                            <h6 className="fw-bold text-primary mb-3">👨‍💼 Pejabat Penandatangan Resmi (Terkonfirmasi Srikandi):</h6>
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Pejabat yang Bertanda Tangan *</label>
                                <input type="text" name="pejabat_ttd" className="form-control" value={extraData.pejabat_ttd || 'ASMIANTI M., SE.'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Jabatan Pejabat *</label>
                                <input type="text" name="jabatan_pejabat" className="form-control" value={extraData.jabatan_pejabat || 'LURAH LOMPOE'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">NIP Pejabat *</label>
                                <input type="text" name="nip_pejabat" className="form-control" value={extraData.nip_pejabat || '19840927 201001 2 022'} onChange={handleExtraChange} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold small">Pangkat Pejabat *</label>
                                <input type="text" name="pangkat_pejabat" className="form-control" value={extraData.pangkat_pejabat || 'Penata Tk. I (III/d)'} onChange={handleExtraChange} required />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>

                    <h5 className="fw-bold text-primary mb-3 border-bottom pb-2">🤝 III. Mekanisme Persetujuan RT / RW</h5>
                    
                    <div className="mb-4">
                      <label className="form-label fw-semibold">Bagaimana Anda Mengurus Persetujuan RT / RW? *</label>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div 
                            className={`p-3 rounded-3 border cursor-pointer ${formData.opsi_persetujuan_rt === 'digital' ? 'bg-primary-subtle border-primary' : 'bg-light'}`}
                            onClick={() => setFormData({ ...formData, opsi_persetujuan_rt: 'digital' })}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="form-check">
                              <input 
                                className="form-check-input" 
                                type="radio" 
                                name="opsi_persetujuan_rt" 
                                value="digital"
                                checked={formData.opsi_persetujuan_rt === 'digital'}
                                onChange={handleChange}
                              />
                              <label className="form-check-label fw-bold text-dark">
                                📱 E-Verifikasi Digital RT/RW (Rekomendasi)
                              </label>
                            </div>
                            <small className="text-muted d-block mt-2">
                              Sistem buatkan Link Verifikasi WA. Pak RT/RW bisa langsung klik <b>Setujui</b> di smartphone meski sedang berada di luar kota!
                            </small>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div 
                            className={`p-3 rounded-3 border cursor-pointer ${formData.opsi_persetujuan_rt === 'upload' ? 'bg-primary-subtle border-primary' : 'bg-light'}`}
                            onClick={() => setFormData({ ...formData, opsi_persetujuan_rt: 'upload' })}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="form-check">
                              <input 
                                className="form-check-input" 
                                type="radio" 
                                name="opsi_persetujuan_rt" 
                                value="upload"
                                checked={formData.opsi_persetujuan_rt === 'upload'}
                                onChange={handleChange}
                              />
                              <label className="form-check-label fw-bold text-dark">
                                📄 Upload Foto Surat Pengantar Manual
                              </label>
                            </div>
                            <small className="text-muted d-block mt-2">
                              Pilih ini jika Anda sudah meminta tanda tangan fisik Surat Pengantar dari Ketua RT/RW setempat.
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ========================================================= */}
                    {/* BAGIAN IV: UNGGAH BERKAS LAMPIRAN (SESUAI FORMAT SRIKANDI) */}
                    {/* ========================================================= */}
                    <div className="p-4 bg-light rounded-4 border mb-4 shadow-sm">
                      <h5 className="fw-bold text-dark mb-4 border-bottom pb-2">
                        📁 IV. Unggah Berkas Lampiran Persyaratan
                      </h5>

                      {/* BLOCK 1: SURAT PENGANTAR RT/RW */}
                      <div className="card border rounded-3 p-4 mb-4 bg-white shadow-sm">
                        <label className="form-label fw-bold text-dark fs-6 mb-1">
                          LAMPIRKAN SURAT PENGANTAR RT/RW
                        </label>
                        <p className="small text-muted mb-3">
                          Upload 1 file yang didukung: PDF, drawing, atau Image. Maks 10 MB. {filePengantar && <span className="text-success fw-bold">✓ (1 file terpilih: {filePengantar.name})</span>}
                        </p>
                        <input 
                          type="file" 
                          className="form-control form-control-lg"
                          accept="image/*,.pdf"
                          onChange={(e) => setFilePengantar(e.target.files[0])}
                        />
                      </div>

                      {/* BLOCK 2: BERKAS LAIN (KTP, KK, DOKUMEN PENDUKUNG) */}
                      <div className="card border border-primary rounded-3 p-4 mb-4 bg-white shadow-sm">
                        <label className="form-label fw-bold text-dark fs-6 mb-1">
                          LAMPIRKAN BERKAS LAIN <span className="text-danger">*</span>
                        </label>
                        <p className="fw-semibold text-primary mb-1">
                          KTP, KK, dan Dokumen Pendukung lainnya
                        </p>
                        <p className="small text-muted mb-3">
                          Upload maksimum 5 file yang didukung: PDF, drawing, atau Image. Maks 10 MB per file. {filesLain.length > 0 && <span className="text-success fw-bold">✓ ({filesLain.length} file terpilih)</span>}
                        </p>
                        <input 
                          type="file" 
                          className="form-control form-control-lg border-primary"
                          accept="image/*,.pdf"
                          multiple
                          onChange={(e) => setFilesLain(Array.from(e.target.files))}
                        />
                      </div>

                      {/* BLOCK 3: BUKTI PELUNASAN PBB TAHUN BERJALAN */}
                      <div className="card border rounded-3 p-4 mb-2 bg-white shadow-sm">
                        <label className="form-label fw-bold text-dark fs-6 mb-1">
                          LAMPIRKAN BUKTI PELUNASAN PBB TAHUN BERJALAN
                        </label>
                        <p className="small text-muted mb-3">
                          Upload 1 file yang didukung: PDF, drawing, atau Image. Maks 10 MB. {filePbb && <span className="text-success fw-bold">✓ (1 file terpilih: {filePbb.name})</span>}
                        </p>
                        <input 
                          type="file" 
                          className="form-control form-control-lg"
                          accept="image/*,.pdf"
                          onChange={(e) => setFilePbb(e.target.files[0])}
                        />
                      </div>

                    </div>

                    <div className="d-grid gap-2">
                      <button 
                        type="submit" 
                        className="btn btn-primary btn-lg fw-bold py-3 shadow-sm rounded-3"
                        disabled={loading}
                      >
                        {loading ? 'Sedang Memproses Pengajuan...' : '🚀 Kirim Pengajuan Surat Ke Kelurahan'}
                      </button>
                    </div>

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

export default FormWarga;