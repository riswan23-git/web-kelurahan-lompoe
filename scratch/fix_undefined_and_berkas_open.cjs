const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const apiDir = path.join(rootDir, 'api');

// 1. Update AdminDashboard.jsx to open actual file window when clicking "Buka / Unduh Lampiran"
const adminDashPath = path.join(srcDir, 'AdminDashboard.jsx');
let adminDashCode = fs.readFileSync(adminDashPath, 'utf8');

const oldAlertBlock = `                <button 
                  onClick={() => alert(\`Membuka lampiran berkas \${modalViewBerkas.fileName}... Berkas asli telah diverifikasi oleh Staf Kelurahan Lompoe.\`)}
                  className="btn btn-primary fw-bold px-4 py-2 rounded-pill shadow-sm"
                >
                  📥 Buka / Unduh Lampiran ({modalViewBerkas.fileName})
                </button>`;

const newOpenBlock = `                <button 
                  onClick={() => {
                    const fileUrl = modalViewBerkas.fileName.startsWith('http') 
                      ? modalViewBerkas.fileName 
                      : \`\${API_BASE_URL}/uploads/\${modalViewBerkas.fileName}\`;
                    window.open(fileUrl, '_blank');
                  }}
                  className="btn btn-primary fw-bold px-4 py-2 rounded-pill shadow-sm"
                >
                  📥 Buka / Unduh Lampiran ({modalViewBerkas.fileName})
                </button>`;

if (adminDashCode.includes(oldAlertBlock)) {
    adminDashCode = adminDashCode.replace(oldAlertBlock, newOpenBlock);
    fs.writeFileSync(adminDashPath, adminDashCode, 'utf8');
    console.log('Successfully updated AdminDashboard.jsx file opener!');
}

// 2. Update api/layanan.js with ALL variations of case-sensitive template tags & exact Lurah name
const layananPath = path.join(apiDir, 'layanan.js');
let layananCode = fs.readFileSync(layananPath, 'utf8');

const oldPayloadDocx = `            const payload = {
                'nomor_naskah': \`470 / \${item.id || 101} / KL-LMP / VIII / 2026\`,
                'kp_raw': getKonsumenPenggunaRuns(item.keperluan),
                'KELURAHAN': 'LOMPOE',
                'KECAMATAN': 'BACUKIKI',
                'KOTA': 'PAREPARE',
                'Kota/Kabupaten': 'PAREPARE',
                'Pejabat yang Bertanda Tangan': 'HJ. ANDI HASNANI, S.Sos',
                'Jabatan Pejabat yang Bertanda Tangan': 'LURAH LOMPOE',
                'NIP Pejabat yang Bertanda Tangan': '19700101 199003 2 001',
                'Pangkat Pejabat yang Bertanda Tangan': 'Penata Tk. I (III/d)',
                'NAMA PEMOHON': (item.nama_pemohon || item.nama_lengkap || 'Warga Kelurahan Lompoe').toUpperCase(),
                'Nama Pemohon': item.nama_pemohon || item.nama_lengkap || 'Warga Kelurahan Lompoe',
                'nama pemohon': item.nama_pemohon || item.nama_lengkap || 'Warga Kelurahan Lompoe',
                'NIK': item.nik || '7372011205950001',
                'Nik': item.nik || '7372011205950001',
                'JENIS KELAMIN': (item.jenis_kelamin || 'LAKI-LAKI').toUpperCase(),
                'Jenis Kelamin': item.jenis_kelamin || 'Laki-laki',
                'TEMPAT/TGL LAHIR': item.tempat_tgl_lahir || 'Parepare, 12 Mei 1995',
                'Tempat/Tgl Lahir': item.tempat_tgl_lahir || 'Parepare, 12 Mei 1995',
                'AGAMA': (item.agama || 'ISLAM').toUpperCase(),
                'Agama': item.agama || 'Islam',
                'PEKERJAAN': (item.pekerjaan || 'Wiraswasta').toUpperCase(),
                'Pekerjaan': item.pekerjaan || 'Wiraswasta',
                'ALAMAT': item.alamat || 'Jl. Poros Lompoe, Bacukiki, Kota Parepare',
                'Alamat': item.alamat || 'Jl. Poros Lompoe, Bacukiki, Kota Parepare',
                'RT': rtVal || '01',
                'RW': rwVal || '01',
                'Kelurahan': 'Lompoe',
                'Kecamatan': 'Bacukiki',
                'Kota/Kab': 'Parepare',
                'acara': item.nama_acara || item.keperluan || 'Kegiatan Syukuran',
                'penggunaan izin': item.keperluan || 'Izin Acara',
                'hari/tanggal acara': item.tanggal_acara || 'Senin, 24 Agustus 2026',
                'waktu acara': '09.00 - Selesai WITA',
                'tempat acara': item.lokasi_acara || item.alamat || 'Kediaman Pemohon',
                'RT tempat acara': rtVal || '01',
                'RW tempat acara': rwVal || '01'
            };`;

const newPayloadDocx = `            const tempatTglLahirVal = item.tempat_tgl_lahir || item.tgl_lahir || 'Parepare, 24 April 1995';
            const jenisKelaminVal = item.jenis_kelamin || 'Laki-laki';
            const agamaVal = item.agama || 'Islam';
            const pekerjaanVal = item.pekerjaan || 'Wiraswasta';
            const alamatVal = item.alamat || 'Jl. Poros Lompoe';

            const pejabatNama = item.pejabat_ttd || 'ASMIANTI M., SE.';
            const pejabatJabatan = item.jabatan_pejabat || 'LURAH LOMPOE';
            const pejabatNip = item.nip_pejabat || '19840927 201001 2 022';
            const pejabatPangkat = item.pangkat_pejabat || 'Penata Tk. I (III/d)';

            const payload = {
                'nomor_naskah': \`470 / \${item.id || 101} / KL-LMP / VIII / 2026\`,
                'kp_raw': getKonsumenPenggunaRuns(item.keperluan),
                'KELURAHAN': 'LOMPOE',
                'KECAMATAN': 'BACUKIKI',
                'KOTA': 'PAREPARE',
                'Kota/Kabupaten': 'PAREPARE',

                'Pejabat yang Bertanda Tangan': pejabatNama,
                'Jabatan Pejabat yang Bertanda Tangan': pejabatJabatan,
                'NIP Pejabat yang Bertanda Tangan': pejabatNip,
                'Pangkat Pejabat yang Bertanda Tangan': pejabatPangkat,

                'NAMA PEMOHON': (item.nama_pemohon || item.nama_lengkap || 'Warga Kelurahan Lompoe').toUpperCase(),
                'Nama Pemohon': item.nama_pemohon || item.nama_lengkap || 'Warga Kelurahan Lompoe',
                'nama pemohon': item.nama_pemohon || item.nama_lengkap || 'Warga Kelurahan Lompoe',
                'NIK': item.nik || '7372011205950001',
                'Nik': item.nik || '7372011205950001',

                'TEMPAT/TGL LAHIR': tempatTglLahirVal,
                'Tempat/Tgl Lahir': tempatTglLahirVal,
                'tempat/tgl lahir': tempatTglLahirVal,
                'Tempat/Tgl lahir': tempatTglLahirVal,
                'tempat/tanggal lahir': tempatTglLahirVal,
                'Tempat / Tgl Lahir': tempatTglLahirVal,

                'JENIS KELAMIN': jenisKelaminVal.toUpperCase(),
                'Jenis Kelamin': jenisKelaminVal,
                'jenis kelamin': jenisKelaminVal,
                'Jenis kelamin': jenisKelaminVal,

                'AGAMA': agamaVal.toUpperCase(),
                'Agama': agamaVal,
                'agama': agamaVal,

                'PEKERJAAN': pekerjaanVal.toUpperCase(),
                'Pekerjaan': pekerjaanVal,
                'pekerjaan': pekerjaanVal,

                'ALAMAT': alamatVal,
                'Alamat': alamatVal,
                'alamat': alamatVal,

                'RT': rtVal || '01',
                'RW': rwVal || '01',
                'Kelurahan': 'Lompoe',
                'Kecamatan': 'Bacukiki',
                'Kota/Kab': 'Parepare',
                'acara': item.nama_acara || item.keperluan || 'Kegiatan Syukuran',
                'penggunaan izin': item.keperluan || 'Izin Acara',
                'hari/tanggal acara': item.tanggal_acara || 'Senin, 24 Agustus 2026',
                'waktu acara': '09.00 - Selesai WITA',
                'tempat acara': item.lokasi_acara || alamatVal || 'Kediaman Pemohon',
                'RT tempat acara': rtVal || '01',
                'RW tempat acara': rwVal || '01'
            };`;

if (layananCode.includes(oldPayloadDocx)) {
    layananCode = layananCode.replace(oldPayloadDocx, newPayloadDocx);
    fs.writeFileSync(layananPath, layananCode, 'utf8');
    console.log('Successfully updated api/layanan.js payload for docx tags & Lurah name!');
}
