// Global shared memory store for Vercel Serverless Functions
const globalStore = global.__LOMPOE_STORE__ || {
    aparatur: [
        { id: 1, nama: 'Asmianti M., SE.', nip: '19840927 201001 2 022', jabatan: 'Lurah Lompoe', foto: null, is_lurah: 1, sambutan: 'Selamat Datang di Website Resmi Kelurahan Lompoe, Kecamatan Bacukiki, Kota Parepare. Website ini hadir sebagai wujud transparansi publik dan kemudahan pelayanan administrasi bagi seluruh warga.', urutan: 1 },
        { id: 2, nama: 'Muhammad Amir, S.STP', nip: '19850512 200801 1 002', jabatan: 'Sekretaris Kelurahan', foto: null, is_lurah: 0, sambutan: '', urutan: 2 },
        { id: 3, nama: 'Siti Rahmah, S.E', nip: '19880920 201101 2 003', jabatan: 'Kasi Pelayanan Umum & Kesejahteraan', foto: null, is_lurah: 0, sambutan: '', urutan: 3 },
        { id: 4, nama: 'Ahmad Fauzi, S.Kom', nip: '19920315 201502 1 004', jabatan: 'Staf Administrasi & IT', foto: null, is_lurah: 0, sambutan: '', urutan: 4 }
    ],
    pkk: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        nama_wilayah: `RW 0${i + 1}`,
        pkk_rw: i + 1,
        pkk_rt: i === 0 ? 3 : i === 1 ? 3 : 2,
        dasa_wisma: 4 + (i % 3),
        krt: 250 + i * 15,
        kk: 300 + i * 20,
        pria: 600 + i * 25,
        wanita: 590 + i * 25
    })),
    berita: [
        { id: 1, judul: 'Kegiatan Penguatan Ketahanan Pangan & Gotong Royong Warga Lompoe', kategori: 'Pengumuman', ringkasan: 'Warga Kelurahan Lompoe bersama aparatur kelurahan dan TP PKK melaksanakan kegiatan kebersihan lingkungan dan penanaman bibit tanaman pangan.', isi: 'Kegiatan gotong royong rutin dilaksanakan di seluruh wilayah RW Kelurahan Lompoe untuk menjaga kebersihan dan kekeluargaan antar warga.', tanggal: '2026-08-10', gambar: null }
    ],
    sarana: [
        { id: 1, nama_sarana: 'Kantor Kelurahan Lompoe', kategori: 'Pemerintahan', lokasi: 'Jl. Poros Lompoe', deskripsi: 'Pusat pelayanan administrasi publik dan pelayanan masyarakat.', kondisi: 'Baik', foto: null },
        { id: 2, nama_sarana: 'Puskesmas Pembantu Bacukiki', kategori: 'Kesehatan', lokasi: 'Lompoe', deskripsi: 'Fasilitas pelayanan kesehatan dasar bagi warga.', kondisi: 'Baik', foto: null }
    ],
    nomor_darurat: [
        { id: 1, nama_instansi: 'Call Center Parepare', nomor_telepon: '112', kategori: '🚨 Darurat', icon: '🚨' },
        { id: 2, nama_instansi: 'Polsek Bacukiki', nomor_telepon: '(0421) 12345', kategori: 'Police', icon: '🚓' },
        { id: 3, nama_instansi: 'Pemadam Kebakaran', nomor_telepon: '113', kategori: 'Fire', icon: '🚒' },
        { id: 4, nama_instansi: 'Puskesmas Bacukiki', nomor_telepon: '(0421) 21118', kategori: 'Health', icon: '🏥' }
    ],
    kontak_rt: [
        { id: 1, rt_rw: 'RW 01 / RT 01', nama_rt_rw: 'Ketua RW 01', nama_ketua: 'Bpk. H. Ahmad', nama_pejabat: 'Bpk. H. Ahmad', no_wa: '081234567890' },
        { id: 2, rt_rw: 'RW 01 / RT 02', nama_rt_rw: 'Ketua RW 02', nama_ketua: 'Bpk. Syafruddin', nama_pejabat: 'Bpk. Syafruddin', no_wa: '081298765432' }
    ],
    statistik: { id: 1, total_pria: 6285, total_wanita: 6185, total_kk: 3772, total_rt: 26, total_rw: 10, luas_wilayah: '30.9 Ha' },
    info: {
        id: 1,
        deskripsi_profil: 'Kelurahan Lompoe adalah salah satu kelurahan di Kecamatan Bacukiki, Kota Parepare, Sulawesi Selatan. Memiliki 10 Wilayah RW dan 26 RT dengan pusat kegiatan masyarakat yang asri dan berbasis pelayanan digital.',
        batas_utara: 'Kelurahan Galung Maloang',
        batas_selatan: 'Kelurahan Lemoe',
        batas_timur: 'Kecamatan Bacukiki Barat',
        batas_barat: 'Kelurahan Watang Bacukiki',
        embed_map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15911.238128362626!2d119.6455!3d-4.0322!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2d95b5420d43e589%3A0x6b1076b0d9154f9a!2sLompoe%2C%20Bacukiki%2C%20Parepare%20City%2C%20South%20Sulawesi!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid',
        alamat_kantor: 'Jl. Poros Lompoe, Kec. Bacukiki, Kota Parepare, Sulsel',
        email_resmi: 'kelurahan.lompoe@pareparekota.go.id',
        telepon_kantor: '(0421) 12345',
        jam_pelayanan: 'Senin - Jumat (08.00 - 16.00 WITA)',
        teks_marquee: '🏛️ SELAMAT DATANG DI PORTAL DIGITAL KELURAHAN LOMPOE, KECAMATAN BACUKIKI, KOTA PAREPARE • 🕒 JAM PELAYANAN KANTOR LOKET: SENIN - JUMAT 08.00 - 16.00 WITA • 📝 LAYANAN PENGAJUAN SURAT & PERSETUJUAN LURAH BISA DILAKUKAN ONLINE 24 JAM'
    },
    pengajuanList: [
        {
            id: 101,
            no_resi: 'LMP-891472',
            nomor_resi: 'LMP-891472',
            nama_pemohon: 'Riswan Fachrezy',
            nama_lengkap: 'Riswan Fachrezy',
            nik: '7372012404950001',
            tempat_tgl_lahir: 'Parepare, 24 April 1995',
            jenis_kelamin: 'Laki-laki',
            agama: 'Islam',
            pekerjaan: 'Wiraswasta',
            alamat: 'Jl. Poros Lompoe No. 88',
            jenis_surat: 'Surat Izin Keramaian',
            rt_rw: 'RW 02 / RT 03',
            telepon: '081234567890',
            no_hp: '081234567890',
            nomor_wa: '081234567890',
            keperluan: 'Pengurusan Administrasi Izin Keramaian',
            nama_acara: 'Syukuran & Pesta Pernikahan',
            tanggal_acara: 'Senin, 24 Agustus 2026',
            lokasi_acara: 'Gedung Gelora Lompoe',
            status_rt: 'Disetujui RT/RW',
            status_kelurahan: 'Progres',
            status: 'Progres',
            token_rt: 'tok_rt_891472',
            tgl_pengajuan: '2026-08-17',
            tanggal_pengajuan: '2026-08-17',
            tanggal: '2026-08-17',
            file_berkas: 'Surat_Pengantar_RT.pdf, KTP_Warga.pdf, KK_Warga.pdf',
            berkas_warga: 'Surat_Pengantar_RT.pdf, KTP_Warga.pdf, KK_Warga.pdf'
        },
        {
            id: 102,
            no_resi: 'LMP-102938',
            nomor_resi: 'LMP-102938',
            nama_pemohon: 'Andi M. Fajar',
            nama_lengkap: 'Andi M. Fajar',
            nik: '7372011205950001',
            tempat_tgl_lahir: 'Parepare, 12 Mei 1995',
            jenis_kelamin: 'Laki-laki',
            agama: 'Islam',
            pekerjaan: 'Wiraswasta',
            alamat: 'Jl. Poros Lompoe No. 12',
            jenis_surat: 'Surat Keterangan Usaha (SKU)',
            rt_rw: 'RW 01 / RT 02',
            telepon: '081234567890',
            no_hp: '081234567890',
            nomor_wa: '081234567890',
            keperluan: 'Persyaratan Pengajuan KUR Bank Dahulu',
            status_rt: 'Disetujui RT/RW',
            status_kelurahan: 'Progres',
            status: 'Progres',
            token_rt: 'tok_rt_102938',
            tgl_pengajuan: '2026-08-17',
            tanggal_pengajuan: '2026-08-17',
            tanggal: '2026-08-17',
            file_berkas: 'Surat_Pengantar_RT_KTP_KK.pdf',
            berkas_warga: 'Surat_Pengantar_RT_KTP_KK.pdf'
        }
    ],
    chatMessages: [
        { id: 1, sender: 'Warga', message: 'Halo admin, mau tanya jam operasional loket?', time: '09:00' },
        { id: 2, sender: 'Staf Kelurahan', message: 'Halo! Jam pelayanan loket kami dari pukul 08.00 - 16.00 WITA.', time: '09:02' }
    ]
};

global.__LOMPOE_STORE__ = globalStore;

module.exports = globalStore;