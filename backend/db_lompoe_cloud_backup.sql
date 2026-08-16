-- DB LOMPOE BACKUP FOR CLOUD DEPLOYMENT
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE `admin` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `jabatan` varchar(100) DEFAULT 'Staf Kelurahan',
  `pin_recovery` varchar(100) DEFAULT '123456',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `admin` (`id`, `username`, `password`, `nama_lengkap`, `jabatan`, `pin_recovery`) VALUES (1, 'admin', '$2b$10$e.G4xTmp9M3c6ea.uHTtuuFyUANEbQSl6KprRkNgzpQCIFJEaI6JS', 'Staf Kelurahan Lompoe', 'Staf Kelurahan', '123456');

CREATE TABLE `aparatur` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `jabatan` varchar(100) NOT NULL,
  `file_foto` varchar(255) NOT NULL,
  `nip` varchar(50) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `is_lurah` tinyint(1) DEFAULT 0,
  `sambutan` text DEFAULT NULL,
  `urutan` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `aparatur` (`id`, `nama`, `jabatan`, `file_foto`, `nip`, `foto`, `is_lurah`, `sambutan`, `urutan`) VALUES (1, 'H. Andi Ahmad, S.IP.', 'Lurah Lompoe', '', '19750812 200212 1 003', NULL, 1, 'Selamat datang di Website Resmi Kelurahan Lompoe. Portal ini hadir untuk memberikan kemudahan pelayanan administrasi digital dan transparansi informasi bagi seluruh warga Kelurahan Lompoe, Kecamatan Bacukiki, Kota Parepare.', 1);
INSERT INTO `aparatur` (`id`, `nama`, `jabatan`, `file_foto`, `nip`, `foto`, `is_lurah`, `sambutan`, `urutan`) VALUES (2, 'Bambang Sugianto, S.STP', 'Sekretaris Kelurahan', '', '19820315 200604 1 002', NULL, 0, NULL, 2);
INSERT INTO `aparatur` (`id`, `nama`, `jabatan`, `file_foto`, `nip`, `foto`, `is_lurah`, `sambutan`, `urutan`) VALUES (3, 'Siti Rahmah, S.E.', 'Kasi Pemerintahan & Ketertiban', '', '19881120 201101 2 005', NULL, 0, NULL, 3);
INSERT INTO `aparatur` (`id`, `nama`, `jabatan`, `file_foto`, `nip`, `foto`, `is_lurah`, `sambutan`, `urutan`) VALUES (4, 'Muhammad Rizky, A.Md', 'Kasi Pelayanan Umum & Kesejahteraan', '', '19920510 201503 1 008', NULL, 0, NULL, 4);

CREATE TABLE `berita` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `judul` varchar(255) NOT NULL,
  `isi` text NOT NULL,
  `file_gambar` varchar(255) NOT NULL,
  `tanggal` timestamp NOT NULL DEFAULT current_timestamp(),
  `kategori` varchar(50) DEFAULT 'Pengumuman',
  `gambar` varchar(255) DEFAULT NULL,
  `penulis` varchar(100) DEFAULT 'Admin Kelurahan',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `berita` (`id`, `judul`, `isi`, `file_gambar`, `tanggal`, `kategori`, `gambar`, `penulis`) VALUES (1, 'Kegiatan Gotong Royong Warga dan Pembersihan Drainase RW 03', 'Dalam rangka mengantisipasi musim penghujan, warga Kelurahan Lompoe bersama staf kelurahan melaksanakan kegiatan kerja bakti dan gotong royong membersihkan aliran sungai dan drainase di sekitar wilayah RW 03.', '', '2026-07-27 12:05:52', 'Kegiatan', NULL, 'Admin Kelurahan');
INSERT INTO `berita` (`id`, `judul`, `isi`, `file_gambar`, `tanggal`, `kategori`, `gambar`, `penulis`) VALUES (2, 'Jadwal Pelayanan Posyandu Balita & Lansia Bulan Agustus 2026', 'Diberitahukan kepada seluruh warga Kelurahan Lompoe bahwa Posyandu Balita dan Posbindu Lansia akan dilaksanakan mulai tanggal 5 s/d 8 Agustus 2026 bertempat di Posyandu Melati RW 02.', '', '2026-07-27 12:05:52', 'Pengumuman', NULL, 'Staf Pelayanan');

CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_resi` varchar(50) NOT NULL,
  `sender_type` enum('warga','admin') NOT NULL,
  `nama_pengirim` varchar(100) NOT NULL,
  `pesan` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `info_kelurahan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `deskripsi_profil` text DEFAULT NULL,
  `batas_utara` varchar(150) DEFAULT NULL,
  `batas_selatan` varchar(150) DEFAULT NULL,
  `batas_timur` varchar(150) DEFAULT NULL,
  `batas_barat` varchar(150) DEFAULT NULL,
  `embed_map_url` text DEFAULT NULL,
  `alamat_kantor` varchar(255) DEFAULT 'Jl. Poros Lompoe, Kec. Bacukiki, Kota Parepare, Sulsel',
  `email_resmi` varchar(100) DEFAULT 'kelurahan.lompoe@pareparekota.go.id',
  `telepon_kantor` varchar(50) DEFAULT '(0421) 12345',
  `jam_pelayanan` varchar(100) DEFAULT 'Senin - Jumat (08.00 - 16.00 WITA)',
  `teks_marquee` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `info_kelurahan` (`id`, `deskripsi_profil`, `batas_utara`, `batas_selatan`, `batas_timur`, `batas_barat`, `embed_map_url`, `alamat_kantor`, `email_resmi`, `telepon_kantor`, `jam_pelayanan`, `teks_marquee`) VALUES (1, 'Kelurahan Lompoe adalah salah satu kelurahan yang terletak di Kecamatan Bacukiki, Kota Parepare, Sulawesi Selatan. Kelurahan ini berkembang sebagai pusat permukiman warga yang ramah, asri, serta mengedepankan pelayanan publik digital.', 'Kelurahan Galung Maloang', 'Kelurahan Lemoe', 'Kecamatan Bacukiki Barat', 'Kelurahan Watang Bacukiki', 'https://maps.app.goo.gl/zdHwb9f13x8q8K1U8?g_st=iw', 'Jl. Poros Lompoe, Kec. Bacukiki, Kota Parepare, Sulsel', 'kelurahan.lompoe@pareparekota.go.id', '(0421) 12345', 'Senin - Jumat (08.00 - 16.00 WITA)', NULL);

CREATE TABLE `kontak_rt` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rt_rw` varchar(100) NOT NULL,
  `nama_ketua` varchar(100) DEFAULT '',
  `no_wa` varchar(30) DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `rt_rw` (`rt_rw`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `kontak_rt` (`id`, `rt_rw`, `nama_ketua`, `no_wa`) VALUES (1, 'RT 01 / RW 01', '', '');
INSERT INTO `kontak_rt` (`id`, `rt_rw`, `nama_ketua`, `no_wa`) VALUES (2, 'RT 02 / RW 01', '', '');
INSERT INTO `kontak_rt` (`id`, `rt_rw`, `nama_ketua`, `no_wa`) VALUES (3, 'RT 03 / RW 01', '', '');
INSERT INTO `kontak_rt` (`id`, `rt_rw`, `nama_ketua`, `no_wa`) VALUES (4, 'RT 01 / RW 02 (Wekke\'e)', '', '');
INSERT INTO `kontak_rt` (`id`, `rt_rw`, `nama_ketua`, `no_wa`) VALUES (5, 'RT 02 / RW 02 (Wekke\'e)', '', '');
INSERT INTO `kontak_rt` (`id`, `rt_rw`, `nama_ketua`, `no_wa`) VALUES (6, 'RT 03 / RW 02 (Wekke\'e)', '', '');
INSERT INTO `kontak_rt` (`id`, `rt_rw`, `nama_ketua`, `no_wa`) VALUES (7, 'RT 01 / RW 03 (Wekke\'e)', '', '');
INSERT INTO `kontak_rt` (`id`, `rt_rw`, `nama_ketua`, `no_wa`) VALUES (8, 'RT 02 / RW 03 (Wekke\'e)', '', '');
INSERT INTO `kontak_rt` (`id`, `rt_rw`, `nama_ketua`, `no_wa`) VALUES (9, 'RT 03 / RW 03 (Wekke\'e)', '', '');
INSERT INTO `kontak_rt` (`id`, `rt_rw`, `nama_ketua`, `no_wa`) VALUES (10, 'RT 04 / RW 03 (Wekke\'e)', '', '');
INSERT INTO `kontak_rt` (`id`, `rt_rw`, `nama_ketua`, `no_wa`) VALUES (11, 'RT 01 / RW 04 (Kp. Baru Labempa)', '', '');
INSERT INTO `kontak_rt` (`id`, `rt_rw`, `nama_ketua`, `no_wa`) VALUES (12, 'RT 02 / RW 04 (Kp. Baru Labempa)', '', '');
INSERT INTO `kontak_rt` (`id`, `rt_rw`, `nama_ketua`, `no_wa`) VALUES (13, 'RT 03 / RW 04 (Kp. Baru Labempa)', '', '');
INSERT INTO `kontak_rt` (`id`, `rt_rw`, `nama_ketua`, `no_wa`) VALUES (14, 'RT 01 / RW 05 (Timurama)', '', '');
INSERT INTO `kontak_rt` (`id`, `rt_rw`, `nama_ketua`, `no_wa`) VALUES (15, 'RT 02 / RW 05 (Timurama)', '', '');
INSERT INTO `kontak_rt` (`id`, `rt_rw`, `nama_ketua`, `no_wa`) VALUES (16, 'RT 03 / RW 05 (Timurama)', '', '');
INSERT INTO `kontak_rt` (`id`, `rt_rw`, `nama_ketua`, `no_wa`) VALUES (17, 'RT 04 / RW 05 (Timurama)', '', '');

CREATE TABLE `nomor_darurat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_instansi` varchar(255) NOT NULL,
  `nomor_telepon` varchar(50) NOT NULL,
  `kategori` varchar(50) DEFAULT '? Darurat',
  `icon` varchar(50) DEFAULT '?',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `nomor_darurat` (`id`, `nama_instansi`, `nomor_telepon`, `kategori`, `icon`, `created_at`) VALUES (1, 'Call Center Parepare', '112', '🚨 Darurat', '🚨', '2026-08-13 06:23:34');
INSERT INTO `nomor_darurat` (`id`, `nama_instansi`, `nomor_telepon`, `kategori`, `icon`, `created_at`) VALUES (2, 'Polsek Bacukiki', '(0421) 12345', 'Police', '🚓', '2026-08-13 06:23:34');
INSERT INTO `nomor_darurat` (`id`, `nama_instansi`, `nomor_telepon`, `kategori`, `icon`, `created_at`) VALUES (3, 'Pemadam Kebakaran', '113', 'Fire', '🚒', '2026-08-13 06:23:34');
INSERT INTO `nomor_darurat` (`id`, `nama_instansi`, `nomor_telepon`, `kategori`, `icon`, `created_at`) VALUES (4, 'Puskesmas Bacukiki', '(0421) 21118', 'Health', '🏥', '2026-08-13 06:23:34');

CREATE TABLE `pengajuan_surat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `no_resi` varchar(30) NOT NULL,
  `nik` varchar(16) NOT NULL,
  `nama_pemohon` varchar(100) NOT NULL,
  `no_hp` varchar(20) NOT NULL,
  `jenis_surat` varchar(100) NOT NULL,
  `keperluan` text NOT NULL,
  `file_berkas` varchar(255) NOT NULL,
  `status` enum('Menunggu','Diproses','Selesai') DEFAULT 'Menunggu',
  `tanggal_pengajuan` timestamp NOT NULL DEFAULT current_timestamp(),
  `catatan_admin` text DEFAULT NULL,
  `file_hasil` varchar(255) DEFAULT NULL,
  `tempat_tgl_lahir` varchar(150) DEFAULT NULL,
  `jenis_kelamin` varchar(20) DEFAULT NULL,
  `agama` varchar(50) DEFAULT NULL,
  `pekerjaan` varchar(100) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `rt_rw` varchar(50) DEFAULT NULL,
  `nama_acara` varchar(200) DEFAULT NULL,
  `tanggal_acara` varchar(100) DEFAULT NULL,
  `lokasi_acara` varchar(255) DEFAULT NULL,
  `status_rt` varchar(50) DEFAULT 'Menunggu Verifikasi RT/RW',
  `catatan_rt` text DEFAULT NULL,
  `token_rt` varchar(100) DEFAULT NULL,
  `tgl_disetujui_rt` timestamp NULL DEFAULT NULL,
  `data_json` longtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `no_resi` (`no_resi`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `pkk_wilayah` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_wilayah` varchar(100) NOT NULL,
  `pkk_rw` int(11) DEFAULT 1,
  `pkk_rt` int(11) DEFAULT 1,
  `dasa_wisma` int(11) DEFAULT 1,
  `krt` int(11) DEFAULT 0,
  `kk` int(11) DEFAULT 0,
  `pria` int(11) DEFAULT 0,
  `wanita` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `pkk_wilayah` (`id`, `nama_wilayah`, `pkk_rw`, `pkk_rt`, `dasa_wisma`, `krt`, `kk`, `pria`, `wanita`) VALUES (1, 'Kp. Baru Labempa', 1, 2, 1, 435, 450, 623, 619);
INSERT INTO `pkk_wilayah` (`id`, `nama_wilayah`, `pkk_rw`, `pkk_rt`, `dasa_wisma`, `krt`, `kk`, `pria`, `wanita`) VALUES (2, 'Wekke\'e', 1, 2, 1, 478, 515, 801, 802);
INSERT INTO `pkk_wilayah` (`id`, `nama_wilayah`, `pkk_rw`, `pkk_rt`, `dasa_wisma`, `krt`, `kk`, `pria`, `wanita`) VALUES (3, 'Pude\'e', 1, 2, 1, 345, 380, 486, 485);
INSERT INTO `pkk_wilayah` (`id`, `nama_wilayah`, `pkk_rw`, `pkk_rt`, `dasa_wisma`, `krt`, `kk`, `pria`, `wanita`) VALUES (4, 'Sipakamase', 1, 2, 1, 149, 160, 298, 274);
INSERT INTO `pkk_wilayah` (`id`, `nama_wilayah`, `pkk_rw`, `pkk_rt`, `dasa_wisma`, `krt`, `kk`, `pria`, `wanita`) VALUES (5, 'Sipakario', 1, 3, 1, 317, 331, 600, 586);
INSERT INTO `pkk_wilayah` (`id`, `nama_wilayah`, `pkk_rw`, `pkk_rt`, `dasa_wisma`, `krt`, `kk`, `pria`, `wanita`) VALUES (6, 'Gelora Mandiri', 1, 3, 1, 267, 278, 515, 510);
INSERT INTO `pkk_wilayah` (`id`, `nama_wilayah`, `pkk_rw`, `pkk_rt`, `dasa_wisma`, `krt`, `kk`, `pria`, `wanita`) VALUES (7, 'Timurama', 1, 4, 1, 455, 482, 1027, 1010);
INSERT INTO `pkk_wilayah` (`id`, `nama_wilayah`, `pkk_rw`, `pkk_rt`, `dasa_wisma`, `krt`, `kk`, `pria`, `wanita`) VALUES (8, 'Lamaubeng', 1, 3, 1, 384, 398, 533, 528);
INSERT INTO `pkk_wilayah` (`id`, `nama_wilayah`, `pkk_rw`, `pkk_rt`, `dasa_wisma`, `krt`, `kk`, `pria`, `wanita`) VALUES (9, 'BTN. Korem', 1, 3, 1, 506, 525, 1079, 1062);
INSERT INTO `pkk_wilayah` (`id`, `nama_wilayah`, `pkk_rw`, `pkk_rt`, `dasa_wisma`, `krt`, `kk`, `pria`, `wanita`) VALUES (10, 'BTN. Kodam', 1, 2, 1, 220, 248, 323, 310);

CREATE TABLE `sarana_prasarana` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_sarana` varchar(150) NOT NULL,
  `kategori` varchar(50) NOT NULL,
  `lokasi` varchar(255) DEFAULT NULL,
  `kondisi` varchar(50) DEFAULT 'Baik',
  `foto` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `sarana_prasarana` (`id`, `nama_sarana`, `kategori`, `lokasi`, `kondisi`, `foto`) VALUES (1, 'Kantor Kelurahan Lompoe', 'Layanan Publik', 'Jl. Poros Lompoe No. 12', 'Sangat Baik', NULL);
INSERT INTO `sarana_prasarana` (`id`, `nama_sarana`, `kategori`, `lokasi`, `kondisi`, `foto`) VALUES (2, 'Posyandu Melati RW 02', 'Kesehatan', 'Jalan Gelora Parepare', 'Baik', NULL);
INSERT INTO `sarana_prasarana` (`id`, `nama_sarana`, `kategori`, `lokasi`, `kondisi`, `foto`) VALUES (3, 'Masjid Nurul Huda Lompoe', 'Peribadatan', 'RW 01 Lompoe', 'Sangat Baik', NULL);
INSERT INTO `sarana_prasarana` (`id`, `nama_sarana`, `kategori`, `lokasi`, `kondisi`, `foto`) VALUES (4, 'SD Negeri 81 Parepare', 'Pendidikan', 'Jl. Poros Lompoe', 'Baik', NULL);
INSERT INTO `sarana_prasarana` (`id`, `nama_sarana`, `kategori`, `lokasi`, `kondisi`, `foto`) VALUES (5, 'Lapangan Olahraga Warga', 'Olahraga', 'RW 04 Lompoe', 'Baik', NULL);

CREATE TABLE `statistik` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `total_pria` int(11) DEFAULT 0,
  `total_wanita` int(11) DEFAULT 0,
  `total_kk` int(11) DEFAULT 0,
  `total_rt` int(11) DEFAULT 0,
  `total_rw` int(11) DEFAULT 0,
  `luas_wilayah` varchar(50) DEFAULT '4.25 km²',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `statistik` (`id`, `total_pria`, `total_wanita`, `total_kk`, `total_rt`, `total_rw`, `luas_wilayah`) VALUES (1, 6285, 6185, 3772, 26, 10, '30.9 Ha');

SET FOREIGN_KEY_CHECKS = 1;
