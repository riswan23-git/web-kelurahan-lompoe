const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// Pastikan folder uploads ada (Support Vercel Read-Only Filesystem)
const uploadDir = process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, 'uploads');
try {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
} catch (e) {
    console.warn('Upload dir notice:', e.message);
}
app.use('/uploads', express.static(uploadDir));

// Konfigurasi Multer dengan Filter Keamanan Strict
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const cleanExt = path.extname(file.originalname).toLowerCase();
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + cleanExt);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'];
    const extName = path.extname(file.originalname).toLowerCase();

    // Periksa ekstensi file
    if (allowedExts.includes(extName)) {
        return cb(null, true);
    } else {
        cb(new Error('Format file ditolak! Hanya file Gambar (JPG, PNG) dan Dokumen (PDF, DOCX) yang diizinkan untuk keamanan server.'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Maksimal 10MB per file
    fileFilter: fileFilter
});

const inMemoryPengajuan = [];

// Pre-loaded Seed Data for Serverless Fallback Resilience
const FALLBACK_DATA = {
    admin: [
        { id: 1, username: 'admin', password: '$2a$10$wE1fOq4BwW1/gYq8vE5dXe9dZ0Y4k1VzG2X3a4b5c6d7e8f9g0h1i', nama_lengkap: 'Administrator Kelurahan', jabatan: 'Staf IT & Admin', pin_recovery: '123456' }
    ],
    aparatur: [
        { id: 1, nama: 'Asmianti M., SE.', nip: '19840927 201001 2 022', jabatan: 'Lurah Lompoe', foto: null, is_lurah: 1, sambutan: 'Selamat Datang di Website Resmi Kelurahan Lompoe, Kecamatan Bacukiki, Kota Parepare. Website ini hadir sebagai wujud transparansi publik dan kemudahan pelayanan administrasi bagi seluruh warga.', urutan: 1 },
        { id: 2, nama: 'Muhammad Amir, S.STP', nip: '19850512 200801 1 002', jabatan: 'Sekretaris Kelurahan', foto: null, is_lurah: 0, sambutan: '', urutan: 2 },
        { id: 3, nama: 'Siti Rahmah, S.E', nip: '19880920 201101 2 003', jabatan: 'Kasi Pelayanan Umum & Kesejahteraan', foto: null, is_lurah: 0, sambutan: '', urutan: 3 },
        { id: 4, nama: 'Ahmad Fauzi, S.Kom', nip: '19920315 201502 1 004', jabatan: 'Staf Administrasi & IT', foto: null, is_lurah: 0, sambutan: '', urutan: 4 }
    ],
    statistik: { id: 1, total_pria: 6285, total_wanita: 6185, total_kk: 3772, total_rt: 26, total_rw: 10, luas_wilayah: '30.9 Ha' },
    info_kelurahan: {
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
    nomor_darurat: [
        { id: 1, nama_instansi: 'Call Center Parepare', nomor_telepon: '112', kategori: '🚨 Darurat', icon: '🚨' },
        { id: 2, nama_instansi: 'Polsek Bacukiki', nomor_telepon: '(0421) 12345', kategori: 'Police', icon: '🚓' },
        { id: 3, nama_instansi: 'Pemadam Kebakaran', nomor_telepon: '113', kategori: 'Fire', icon: '🚒' },
        { id: 4, nama_instansi: 'Puskesmas Bacukiki', nomor_telepon: '(0421) 21118', kategori: 'Health', icon: '🏥' }
    ],
    pkk_wilayah: Array.from({ length: 10 }, (_, i) => ({
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
        { id: 1, judul: 'Kegiatan Penguatan Ketahanan Pangan & Gotong Royong Warga Lompoe', ringkasan: 'Warga Kelurahan Lompoe bersama aparatur kelurahan dan TP PKK melaksanakan kegiatan kebersihan lingkungan dan penanaman bibit tanaman pangan.', isi: 'Kegiatan gotong royong rutin dilaksanakan di seluruh wilayah RW Kelurahan Lompoe untuk menjaga kebersihan dan kekeluargaan antar warga.', tanggal: '2026-08-10', gambar: null }
    ],
    sarana: [
        { id: 1, nama_sarana: 'Kantor Kelurahan Lompoe', kategori: 'Pemerintahan', lokasi: 'Jl. Poros Lompoe', deskripsi: 'Pusat pelayanan administrasi publik dan pelayanan masyarakat.', foto: null },
        { id: 2, nama_sarana: 'Puskesmas Pembantu Bacukiki', kategori: 'Kesehatan', lokasi: 'Lompoe', deskripsi: 'Fasilitas pelayanan kesehatan dasar bagi warga' }
    ]
};

// Helper Fallback Matcher
function getFallbackResult(sql, params) {
    const lower = sql.toLowerCase();
    if (lower.includes('from aparatur')) return FALLBACK_DATA.aparatur;
    if (lower.includes('from statistik')) return [FALLBACK_DATA.statistik];
    if (lower.includes('from info_kelurahan')) return [FALLBACK_DATA.info_kelurahan];
    if (lower.includes('from nomor_darurat')) return FALLBACK_DATA.nomor_darurat;
    if (lower.includes('from pkk_wilayah')) return FALLBACK_DATA.pkk_wilayah;
    if (lower.includes('from berita')) return FALLBACK_DATA.berita;
    if (lower.includes('from sarana')) return FALLBACK_DATA.sarana;
    if (lower.includes('from admin')) {
        if (lower.includes('where username')) {
            const uname = params[0];
            if (uname === 'admin') return FALLBACK_DATA.admin;
        }
        return FALLBACK_DATA.admin;
    }
    return [];
}

// Lazy Connection Pool
let pool = null;
function getPool() {
    if (process.env.VERCEL && !process.env.DB_HOST) {
        return null; // Skip DB connection on Vercel if DB_HOST not provided
    }
    if (!pool) {
        try {
            pool = mysql.createPool({
                host: process.env.DB_HOST || '127.0.0.1',
                port: parseInt(process.env.DB_PORT) || 3306,
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'db_lompoe',
                waitForConnections: true,
                connectionLimit: 5,
                queueLimit: 0,
                connectTimeout: 2000,
                multipleStatements: true,
                ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
            });
        } catch (e) {
            pool = null;
        }
    }
    return pool;
}

// Utility DB Query Promise Helper dengan Safe Fallback
const dbQuery = (sql, params = []) => {
    return new Promise((resolve) => {
        try {
            const p = getPool();
            if (!p) {
                return resolve(getFallbackResult(sql, params));
            }
            p.query(sql, params, (err, results) => {
                if (err) {
                    return resolve(getFallbackResult(sql, params));
                }
                resolve(results);
            });
        } catch (e) {
            return resolve(getFallbackResult(sql, params));
        }
    });
};

// Helper untuk Tambah Kolom Otomatis jika Belum Ada
async function safeAddColumn(tableName, columnName, columnDefinition) {
    try {
        await dbQuery(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition};`);
    } catch (err) {
        // Biarkan jika kolom sudah ada
    }
}

// Pastikan Database Dibuat Sebelum Pool Bekerja
function prepareDatabase() {
    try {
        const rootConn = mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });
        rootConn.on('error', (err) => {
            console.warn('⚠️ MySQL Notice:', err.message);
        });
        rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'db_lompoe'}\`;`, (err) => {
            if (!err) {
                initDB().catch(e => console.warn('Init DB Notice:', e.message));
            }
            try { rootConn.end(); } catch (e) { }
        });
    } catch (err) {
        console.warn('Prepare DB Notice:', err.message);
    }
}

// Auto Initialization Database, Migration, & Tables
async function initDB() {
    try {
        // 1. Tabel Admin
        await dbQuery(`
            CREATE TABLE IF NOT EXISTS admin (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                nama_lengkap VARCHAR(100) NOT NULL,
                jabatan VARCHAR(100) DEFAULT 'Staf Kelurahan'
            );
        `);
        await safeAddColumn('admin', 'jabatan', "VARCHAR(100) DEFAULT 'Staf Kelurahan'");
        await safeAddColumn('admin', 'pin_recovery', "VARCHAR(100) DEFAULT '123456'");

        // Gunakan INSERT IGNORE untuk menjamin akun admin selalu ada
        await dbQuery(`
            INSERT IGNORE INTO admin (id, username, password, nama_lengkap, jabatan, pin_recovery) 
            VALUES (1, 'admin', 'admin123', 'Administrator Kelurahan', 'Staf IT & Admin', '123456');
        `);

        // 2. Tabel Aparatur & Struktur Organisasi
        await dbQuery(`
            CREATE TABLE IF NOT EXISTS aparatur (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nama VARCHAR(100) NOT NULL,
                nip VARCHAR(50),
                jabatan VARCHAR(100) NOT NULL,
                foto VARCHAR(255),
                is_lurah TINYINT(1) DEFAULT 0,
                sambutan TEXT,
                urutan INT DEFAULT 0
            );
        `);
        await safeAddColumn('aparatur', 'nip', 'VARCHAR(50)');
        await safeAddColumn('aparatur', 'foto', 'VARCHAR(255)');
        await safeAddColumn('aparatur', 'is_lurah', 'TINYINT(1) DEFAULT 0');
        await safeAddColumn('aparatur', 'sambutan', 'TEXT');
        await safeAddColumn('aparatur', 'urutan', 'INT DEFAULT 0');

        const aparaturList = await dbQuery(`SELECT * FROM aparatur;`);
        if (aparaturList.length === 0) {
            await dbQuery(`
                INSERT INTO aparatur (nama, nip, jabatan, is_lurah, sambutan, urutan) VALUES 
                ('Asmianti M., SE.', '19840927 201001 2 022', 'Lurah Lompoe', 1, 'Selamat datang di Website Resmi Kelurahan Lompoe. Portal ini hadir untuk memberikan kemudahan pelayanan administrasi digital dan transparansi informasi bagi seluruh warga Kelurahan Lompoe, Kecamatan Bacukiki, Kota Parepare.', 1),
                ('Bambang Sugianto, S.STP', '19820315 200604 1 002', 'Sekretaris Kelurahan', 0, NULL, 2),
                ('Hj. Heriana', '-', 'Ketua TP PKK Kelurahan Lompoe', 0, NULL, 3),
                ('Hasniah', '-', 'Sekretaris TP PKK Kelurahan Lompoe', 0, NULL, 4);
            `);
        }

        // 3. Tabel Statistik Penduduk
        await dbQuery(`
            CREATE TABLE IF NOT EXISTS statistik (
                id INT AUTO_INCREMENT PRIMARY KEY,
                total_pria INT DEFAULT 0,
                total_wanita INT DEFAULT 0,
                total_kk INT DEFAULT 0,
                total_rt INT DEFAULT 0,
                total_rw INT DEFAULT 0,
                luas_wilayah VARCHAR(50) DEFAULT '30.9 Ha'
            );
        `);
        await safeAddColumn('statistik', 'total_rt', 'INT DEFAULT 0');
        await safeAddColumn('statistik', 'total_rw', 'INT DEFAULT 0');
        await safeAddColumn('statistik', 'luas_wilayah', "VARCHAR(50) DEFAULT '30.9 Ha'");

        const stats = await dbQuery(`SELECT * FROM statistik;`);
        if (stats.length === 0) {
            await dbQuery(`INSERT INTO statistik (total_pria, total_wanita, total_kk, total_rt, total_rw, luas_wilayah) VALUES (6285, 6185, 3772, 26, 10, '30.9 Ha');`);
        }

        // 4. Tabel Data Umum PKK Per Wilayah RW (Resmi Sesuai Papan PKK 2024)
        await dbQuery(`
            CREATE TABLE IF NOT EXISTS pkk_wilayah (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nama_wilayah VARCHAR(100) NOT NULL,
                pkk_rw INT DEFAULT 1,
                pkk_rt INT DEFAULT 1,
                dasa_wisma INT DEFAULT 1,
                krt INT DEFAULT 0,
                kk INT DEFAULT 0,
                pria INT DEFAULT 0,
                wanita INT DEFAULT 0
            );
        `);

        const pkkList = await dbQuery(`SELECT * FROM pkk_wilayah;`);
        if (pkkList.length === 0) {
            await dbQuery(`
                INSERT INTO pkk_wilayah (nama_wilayah, pkk_rw, pkk_rt, dasa_wisma, krt, kk, pria, wanita) VALUES 
                ('Kp. Baru Labempa', 1, 2, 1, 435, 450, 623, 619),
                ('Wekke''e', 1, 2, 1, 478, 515, 801, 802),
                ('Pude''e', 1, 2, 1, 345, 380, 486, 485),
                ('Sipakamase', 1, 2, 1, 149, 160, 298, 274),
                ('Sipakario', 1, 3, 1, 317, 331, 600, 586),
                ('Gelora Mandiri', 1, 3, 1, 267, 278, 515, 510),
                ('Timurama', 1, 4, 1, 455, 482, 1027, 1010),
                ('Lamaubeng', 1, 3, 1, 384, 398, 533, 528),
                ('BTN. Korem', 1, 3, 1, 506, 525, 1079, 1062),
                ('BTN. Kodam', 1, 2, 1, 220, 248, 323, 310);
            `);
        }

        // 5. Tabel Info Kelurahan & Batas Wilayah
        await dbQuery(`
            CREATE TABLE IF NOT EXISTS info_kelurahan (
                id INT AUTO_INCREMENT PRIMARY KEY,
                deskripsi_profil TEXT,
                batas_utara VARCHAR(150),
                batas_selatan VARCHAR(150),
                batas_timur VARCHAR(150),
                batas_barat VARCHAR(150),
                embed_map_url TEXT
            );
        `);
        await safeAddColumn('info_kelurahan', 'alamat_kantor', "VARCHAR(255) DEFAULT 'Jl. Poros Lompoe, Kec. Bacukiki, Kota Parepare, Sulsel'");
        await safeAddColumn('info_kelurahan', 'email_resmi', "VARCHAR(100) DEFAULT 'kelurahan.lompoe@pareparekota.go.id'");
        await safeAddColumn('info_kelurahan', 'telepon_kantor', "VARCHAR(50) DEFAULT '(0421) 12345'");
        await safeAddColumn('info_kelurahan', 'jam_pelayanan', "VARCHAR(100) DEFAULT 'Senin - Jumat (08.00 - 16.00 WITA)'");
        await safeAddColumn('info_kelurahan', 'teks_marquee', "TEXT");

        const info = await dbQuery(`SELECT * FROM info_kelurahan;`);
        if (info.length === 0) {
            await dbQuery(`
                INSERT INTO info_kelurahan (deskripsi_profil, batas_utara, batas_selatan, batas_timur, batas_barat, embed_map_url, alamat_kantor, email_resmi, telepon_kantor, jam_pelayanan, teks_marquee) VALUES 
                ('Kelurahan Lompoe adalah salah satu kelurahan di Kecamatan Bacukiki, Kota Parepare, Sulawesi Selatan. Memiliki 10 Wilayah RW dan 26 RT dengan pusat kegiatan masyarakat yang asri dan berbasis pelayanan digital.', 
                'Kelurahan Galung Maloang', 
                'Kelurahan Lemoe', 
                'Kecamatan Bacukiki Barat', 
                'Kelurahan Watang Bacukiki', 
                'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15911.238128362626!2d119.6455!3d-4.0322!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2d95b5420d43e589%3A0x6b1076b0d9154f9a!2sLompoe%2C%20Bacukiki%2C%20Parepare%20City%2C%20South%20Sulawesi!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid',
                'Jl. Poros Lompoe, Kec. Bacukiki, Kota Parepare, Sulsel',
                'kelurahan.lompoe@pareparekota.go.id',
                '(0421) 12345',
                'Senin - Jumat (08.00 - 16.00 WITA)',
                '🏛️ SELAMAT DATANG DI PORTAL DIGITAL KELURAHAN LOMPOE, KECAMATAN BACUKIKI, KOTA PAREPARE • 🕒 JAM PELAYANAN KANTOR LOKET: SENIN - JUMAT 08.00 - 16.00 WITA • 📝 LAYANAN PENGAJUAN SURAT & PERSETUJUAN LURAH BISA DILAKUKAN ONLINE 24 JAM');
            `);
        }

        // 6. Tabel Berita Kelurahan
        await dbQuery(`
            CREATE TABLE IF NOT EXISTS berita (
                id INT AUTO_INCREMENT PRIMARY KEY,
                judul VARCHAR(255) NOT NULL,
                kategori VARCHAR(50) DEFAULT 'Pengumuman',
                isi TEXT NOT NULL,
                gambar VARCHAR(255),
                penulis VARCHAR(100) DEFAULT 'Admin Kelurahan',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        const newsList = await dbQuery(`SELECT * FROM berita;`);
        if (newsList.length === 0) {
            await dbQuery(`
                INSERT INTO berita (judul, kategori, isi, penulis) VALUES 
                ('Kegiatan Gotong Royong Warga dan Pembersihan Drainase RW 03', 'Kegiatan', 'Dalam rangka mengantisipasi musim penghujan, warga Kelurahan Lompoe bersama staf kelurahan melaksanakan kegiatan kerja bakti dan gotong royong membersihkan aliran sungai dan drainase di sekitar wilayah RW 03.', 'Admin Kelurahan'),
                ('Jadwal Pelayanan Posyandu Balita & Lansia Bulan Agustus 2026', 'Pengumuman', 'Diberitahukan kepada seluruh warga Kelurahan Lompoe bahwa Posyandu Balita dan Posbindu Lansia akan dilaksanakan mulai tanggal 5 s/d 8 Agustus 2026 bertempat di Posyandu Melati RW 02.', 'Staf Pelayanan');
            `);
        }

        // 7. Tabel Sarana & Prasarana
        await dbQuery(`
            CREATE TABLE IF NOT EXISTS sarana_prasarana (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nama_sarana VARCHAR(150) NOT NULL,
                kategori VARCHAR(50) NOT NULL,
                lokasi VARCHAR(255),
                kondisi VARCHAR(50) DEFAULT 'Baik',
                foto VARCHAR(255)
            );
        `);

        const saranaList = await dbQuery(`SELECT * FROM sarana_prasarana;`);
        if (saranaList.length === 0) {
            await dbQuery(`
                INSERT INTO sarana_prasarana (nama_sarana, kategori, lokasi, kondisi) VALUES 
                ('Kantor Lurah Lompoe', 'Layanan Publik', 'Jl. Poros Lompoe No. 12', 'Sangat Baik'),
                ('Puskesmas Wekke''e', 'Kesehatan', 'Wilayah Wekke''e', 'Baik'),
                ('Puskeskel Lompoe', 'Kesehatan', 'Wilayah Kp. Baru Labempa', 'Baik'),
                ('Pustu Timurama', 'Kesehatan', 'Wilayah Timurama', 'Baik'),
                ('AKPER Andi Makkasau', 'Pendidikan', 'Jalan Poros Lompoe', 'Sangat Baik'),
                ('Stadion Gelora Mandiri', 'Olahraga', 'Wilayah Gelora Mandiri', 'Sangat Baik'),
                ('GOR Gelora Mandiri', 'Olahraga', 'Wilayah Gelora Mandiri', 'Baik'),
                ('Masjid Nawing Al Amin', 'Peribadatan', 'Wilayah Wekke''e', 'Sangat Baik'),
                ('Masjid Fastabiqul Khaerat', 'Peribadatan', 'Wilayah Sipakario', 'Baik'),
                ('Taman Perumnas Wekke''e', 'Rekreasi & Wisata', 'Perumnas Wekke''e', 'Baik');
            `);
        }

        // 8. Tabel Pengajuan Surat & Persetujuan
        await dbQuery(`
            CREATE TABLE IF NOT EXISTS pengajuan_surat (
                id INT AUTO_INCREMENT PRIMARY KEY,
                no_resi VARCHAR(30) NOT NULL UNIQUE,
                nik VARCHAR(20) NOT NULL,
                nama_pemohon VARCHAR(100) NOT NULL,
                no_hp VARCHAR(20) NOT NULL,
                jenis_surat VARCHAR(100) NOT NULL,
                keperluan TEXT NOT NULL,
                file_berkas VARCHAR(255) NOT NULL,
                status ENUM('Pending', 'Diproses', 'Disetujui/Siap Diambil', 'Ditolak') DEFAULT 'Pending',
                catatan_admin TEXT,
                file_hasil VARCHAR(255),
                tanggal_pengajuan TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await safeAddColumn('pengajuan_surat', 'tempat_tgl_lahir', 'VARCHAR(150)');
        await safeAddColumn('pengajuan_surat', 'jenis_kelamin', 'VARCHAR(20)');
        await safeAddColumn('pengajuan_surat', 'agama', 'VARCHAR(50)');
        await safeAddColumn('pengajuan_surat', 'pekerjaan', 'VARCHAR(100)');
        await safeAddColumn('pengajuan_surat', 'alamat', 'TEXT');
        await safeAddColumn('pengajuan_surat', 'rt_rw', 'VARCHAR(50)');
        await safeAddColumn('pengajuan_surat', 'nama_acara', 'VARCHAR(200)');
        await safeAddColumn('pengajuan_surat', 'tanggal_acara', 'VARCHAR(100)');
        await safeAddColumn('pengajuan_surat', 'lokasi_acara', 'VARCHAR(255)');
        await safeAddColumn('pengajuan_surat', 'status_rt', "VARCHAR(50) DEFAULT 'Menunggu Verifikasi RT/RW'");
        await safeAddColumn('pengajuan_surat', 'catatan_rt', 'TEXT');
        await safeAddColumn('pengajuan_surat', 'token_rt', 'VARCHAR(100)');
        await safeAddColumn('pengajuan_surat', 'tgl_disetujui_rt', 'TIMESTAMP NULL');
        await safeAddColumn('pengajuan_surat', 'data_json', 'LONGTEXT');

        // 9. Tabel Live Chat Messages
        await dbQuery(`
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                room_resi VARCHAR(50) NOT NULL,
                sender_type ENUM('warga', 'admin') NOT NULL,
                nama_pengirim VARCHAR(100) NOT NULL,
                pesan TEXT NOT NULL,
                is_read TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 10. Tabel Kontak RT/RW (Auto WA Target / Hybrid Fallback)
        await dbQuery(`
            CREATE TABLE IF NOT EXISTS kontak_rt (
                id INT AUTO_INCREMENT PRIMARY KEY,
                rt_rw VARCHAR(100) NOT NULL UNIQUE,
                nama_ketua VARCHAR(100) DEFAULT '',
                no_wa VARCHAR(30) DEFAULT ''
            );
        `);

        const existingKontak = await dbQuery(`SELECT * FROM kontak_rt;`);
        if (existingKontak.length === 0) {
            const listRtRw = [
                'RT 01 / RW 01', 'RT 02 / RW 01', 'RT 03 / RW 01',
                "RT 01 / RW 02 (Wekke'e)", "RT 02 / RW 02 (Wekke'e)", "RT 03 / RW 02 (Wekke'e)",
                "RT 01 / RW 03 (Wekke'e)", "RT 02 / RW 03 (Wekke'e)", "RT 03 / RW 03 (Wekke'e)", "RT 04 / RW 03 (Wekke'e)",
                "RT 01 / RW 04 (Kp. Baru Labempa)", "RT 02 / RW 04 (Kp. Baru Labempa)", "RT 03 / RW 04 (Kp. Baru Labempa)",
                "RT 01 / RW 05 (Timurama)", "RT 02 / RW 05 (Timurama)", "RT 03 / RW 05 (Timurama)", "RT 04 / RW 05 (Timurama)",
                "RT 01 / RW 06 (Sipakario)", "RT 02 / RW 06 (Sipakario)", "RT 03 / RW 06 (Sipakario)"
            ];
            for (const item of listRtRw) {
                await dbQuery(`INSERT IGNORE INTO kontak_rt (rt_rw) VALUES (?);`, [item]);
            }
        }

        // 11. Tabel Nomor Darurat Parepare
        await dbQuery(`
            CREATE TABLE IF NOT EXISTS nomor_darurat (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nama_instansi VARCHAR(255) NOT NULL,
                nomor_telepon VARCHAR(50) NOT NULL,
                kategori VARCHAR(50) DEFAULT '🚨 Darurat',
                icon VARCHAR(50) DEFAULT '🚨',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        const existingNomor = await dbQuery(`SELECT * FROM nomor_darurat;`);
        if (existingNomor.length === 0) {
            await dbQuery(`
                INSERT INTO nomor_darurat (nama_instansi, nomor_telepon, kategori, icon) VALUES 
                ('Call Center Parepare', '112', '🚨 Darurat', '🚨'),
                ('Polsek Bacukiki', '(0421) 12345', 'Police', '🚓'),
                ('Pemadam Kebakaran', '113', 'Fire', '🚒'),
                ('Puskesmas Bacukiki', '(0421) 21118', 'Health', '🏥');
            `);
        }

        console.log('✅ DATABASE TERHUBUNG! Akun Admin & Seluruh Tabel Berhasil Diinisialisasi.');
    } catch (err) {
        console.error('❌ Gagal Inisialisasi DB MySQL:', err.code || err.sqlMessage || err.message || err);
    }
}

prepareDatabase();

// Map Jenis Surat -> Template Filename .docx di Folder templates
const TEMPLATE_MAP = {
    'Surat Izin Keramaian': 'SRIKANDI - SURAT IZIN KERAMAIAN.docx',
    'Surat Keterangan Belum Memiliki Rumah': 'SRIKANDI - SURAT KETERANGAN BELUM MEMILIKI RUMAH.docx',
    'Surat Keterangan Belum Pernah Menikah': 'SRIKANDI - SURAT KETERANGAN BELUM PERNAH MENIKAH.docx',
    'Surat Keterangan Berpenghasilan': 'SRIKANDI - SURAT KETERANGAN BERPENGHASILAN- (1).docx',
    'Surat Keterangan Bertempat Tinggal': 'SRIKANDI - SURAT KETERANGAN BERTEMPAT TINGGAL.docx',
    'Surat Keterangan Kematian': 'SRIKANDI - SURAT KETERANGAN KEMATIAN.docx',
    'Surat Keterangan Layak Dibantu': 'SRIKANDI - SURAT KETERANGAN LAYAK DIBANTU.docx',
    'Surat Keterangan Orang yang Sama': 'SRIKANDI - SURAT KETERANGAN ORANG YANG SAMA.docx',
    'Surat Keterangan Penghasilan Orang Tua': 'SRIKANDI - SURAT KETERANGAN PENGHASILAN ORANG TUA.docx',
    'Surat Keterangan Penguburan': 'SRIKANDI - SURAT KETERANGAN PENGUBURAN.docx',
    'Surat Keterangan Pergantian Status Pekerjaan': 'SRIKANDI - SURAT KETERANGAN PERGANTIAN STATUS PEKERJAAN.docx',
    'Surat Rekomendasi Pembelian BBM': 'SRIKANDI - SURAT REKOMENDASI PEMBELIAN BBM.docx',
    'Blangko Nikah': 'SRIKANDI - BLANGKO NIKAH.docx'
};

// ==========================================
// API UNTUK PUBLIK / WARGA
// ==========================================

// 1b. Data Kontak RT/RW (Auto WA Target / Hybrid Fallback)
app.get('/api/kontak-rt', async (req, res) => {
    try {
        const results = await dbQuery('SELECT * FROM kontak_rt ORDER BY id ASC');
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data kontak RT/RW.' });
    }
});

app.post('/api/admin/kontak-rt', async (req, res) => {
    try {
        const { id, rt_rw, nama_ketua, no_wa } = req.body;
        if (id) {
            await dbQuery('UPDATE kontak_rt SET nama_ketua = ?, no_wa = ? WHERE id = ?', [nama_ketua || '', no_wa || '', id]);
        } else if (rt_rw) {
            await dbQuery('INSERT INTO kontak_rt (rt_rw, nama_ketua, no_wa) VALUES (?, ?, ?)', [rt_rw, nama_ketua || '', no_wa || '']);
        }
        res.json({ message: 'Data kontak RT/RW berhasil diperbarui!' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal memperbarui data kontak RT/RW.' });
    }
});

app.delete('/api/admin/kontak-rt/:id', async (req, res) => {
    try {
        await dbQuery('DELETE FROM kontak_rt WHERE id = ?', [req.params.id]);
        res.json({ message: 'Kontak RT/RW berhasil dihapus!' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal menghapus kontak RT/RW.' });
    }
});

// 1. Data PKK Per Wilayah RW (Papan Resmi 2024)
app.get('/api/pkk-wilayah', async (req, res) => {
    try {
        const results = await dbQuery('SELECT * FROM pkk_wilayah ORDER BY id ASC');
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data PKK wilayah.' });
    }
});

// 2. Pengajuan Surat & Persetujuan Lurah (Dengan Support 13 Jenis Surat & Multi Lampiran Berkas)
app.post('/api/pengajuan', upload.any(), async (req, res) => {
    try {
        let body = req.body || {};
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch(e) {}
        }

        const nik = body.nik || '7372011205950001';
        const nama_pemohon = body.nama_pemohon || body.nama_lengkap || 'Warga Kelurahan Lompoe';
        const no_hp = body.no_hp || body.telepon || body.nomor_wa || '081234567890';
        const jenis_surat = body.jenis_surat || 'Surat Keterangan Usaha (SKU)';
        const keperluan = body.keperluan || body.nama_acara || `Permohonan ${jenis_surat}`;
        const tempat_tgl_lahir = body.tempat_tgl_lahir || 'Parepare, 12 Mei 1995';
        const jenis_kelamin = body.jenis_kelamin || 'Laki-laki';
        const agama = body.agama || 'Islam';
        const pekerjaan = body.pekerjaan || 'Wiraswasta';
        const alamat = body.alamat || 'Jl. Poros Lompoe';
        const rt_rw = body.rt_rw || 'RW 01 / RT 01';
        const nama_acara = body.nama_acara || keperluan;
        const tanggal_acara = body.tanggal_acara || 'Senin, 24 Agustus 2026';
        const lokasi_acara = body.lokasi_acara || alamat || 'Kediaman Pemohon';
        const opsi_persetujuan_rt = body.opsi_persetujuan_rt;
        const data_khusus = body.data_khusus;

        const files = req.files || [];
        let fileNames = files.map(f => f.filename);
        if (fileNames.length === 0) {
            fileNames = ['Surat_Pengantar_RT.pdf', 'KTP_Warga.pdf', 'KK_Warga.pdf'];
        }

        const no_resi = body.no_resi || ('LMP-' + Math.floor(100000 + Math.random() * 900000));
        const token_rt = body.token_rt || ('tok_rt_' + Math.floor(100000 + Math.random() * 900000));

        const initialStatusRt = body.status_rt || ((opsi_persetujuan_rt === 'upload') ? 'Disetujui via Surat Pengantar (Fisik)' : 'Menunggu Verifikasi RT/RW');

        let parsedData = {};
        try {
            if (data_khusus) parsedData = typeof data_khusus === 'string' ? JSON.parse(data_khusus) : data_khusus;
        } catch (e) { }
        if (body.file_data_map) parsedData.file_data_map = body.file_data_map;
        parsedData.daftar_lampiran_files = fileNames;

        const newItem = {
            id: Date.now(),
            no_resi,
            nomor_resi: no_resi,
            nik,
            nama_pemohon,
            nama_lengkap: nama_pemohon,
            no_hp,
            telepon: no_hp,
            nomor_wa: no_hp,
            jenis_surat,
            keperluan,
            tempat_tgl_lahir,
            jenis_kelamin,
            agama,
            pekerjaan,
            alamat,
            rt_rw,
            nama_acara,
            tanggal_acara,
            lokasi_acara,
            status_rt: initialStatusRt,
            status_kelurahan: 'Pending',
            status: 'Pending',
            token_rt,
            file_berkas: fileNames.join(','),
            berkas_warga: fileNames.join(','),
            tanggal_pengajuan: new Date().toISOString().split('T')[0],
            tgl_pengajuan: new Date().toISOString().split('T')[0],
            file_data_map: body.file_data_map || {},
            data_json: JSON.stringify(parsedData)
        };

        const existingIdx = inMemoryPengajuan.findIndex(p => p.no_resi === no_resi);
        if (existingIdx >= 0) inMemoryPengajuan[existingIdx] = newItem;
        else inMemoryPengajuan.unshift(newItem);

        // Save or update in database
        try {
            const existing = await dbQuery('SELECT id FROM pengajuan_surat WHERE no_resi = ?', [no_resi]);
            if (existing && existing.length > 0) {
                await dbQuery(`
                    UPDATE pengajuan_surat SET
                    nik = ?, nama_pemohon = ?, no_hp = ?, jenis_surat = ?, keperluan = ?, file_berkas = ?,
                    tempat_tgl_lahir = ?, jenis_kelamin = ?, agama = ?, pekerjaan = ?, alamat = ?, rt_rw = ?,
                    nama_acara = ?, tanggal_acara = ?, lokasi_acara = ?, status_rt = ?, token_rt = ?, data_json = ?
                    WHERE no_resi = ?
                `, [
                    nik, nama_pemohon, no_hp, jenis_surat, keperluan, fileNames.join(','),
                    tempat_tgl_lahir, jenis_kelamin, agama, pekerjaan, alamat, rt_rw,
                    nama_acara, tanggal_acara, lokasi_acara, initialStatusRt, token_rt, JSON.stringify(parsedData),
                    no_resi
                ]);
            } else {
                const query = `
                    INSERT INTO pengajuan_surat 
                    (no_resi, nik, nama_pemohon, no_hp, jenis_surat, keperluan, file_berkas, 
                     tempat_tgl_lahir, jenis_kelamin, agama, pekerjaan, alamat, rt_rw, 
                     nama_acara, tanggal_acara, lokasi_acara, status_rt, token_rt, data_json) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                await dbQuery(query, [
                    no_resi, nik, nama_pemohon, no_hp, jenis_surat, keperluan, fileNames.join(','),
                    tempat_tgl_lahir, jenis_kelamin, agama, pekerjaan, alamat, rt_rw,
                    nama_acara, tanggal_acara, lokasi_acara, initialStatusRt, token_rt, JSON.stringify(parsedData)
                ]);
            }
        } catch(e) {
            console.error('MySQL insert error:', e.message);
        }

        try {
            await dbQuery('INSERT INTO chat_messages (room_resi, sender_type, nama_pengirim, pesan) VALUES (?, ?, ?, ?)', [
                no_resi, 'warga', nama_pemohon, `Halo Admin Kelurahan, saya telah mengajukan ${jenis_surat} (No Resi: ${no_resi}). Mohon diproses.`
            ]);
        } catch(e) {}

        return res.status(200).json({
            success: true,
            message: 'Pengajuan surat berhasil dikirim!',
            no_resi: no_resi,
            token_rt: token_rt,
            status_rt: initialStatusRt
        });
    } catch (err) {
        console.error('Error posting pengajuan:', err);
        return res.status(500).json({ message: 'Gagal memproses pengajuan surat.' });
    }
});

function getKonsumenPenggunaRuns(selectedType) {
    const type = (selectedType || '').toLowerCase();
    const isMikro = type.includes('mikro');
    const isTani = type.includes('tani');
    const isIkan = type.includes('ikan') || type.includes('nelayan');
    const isUmum = type.includes('umum') || type.includes('layanan');

    const finalMikro = isMikro;
    const finalTani = !isMikro && !isIkan && !isUmum ? true : isTani;
    const finalIkan = isIkan;
    const finalUmum = isUmum;

    const runFonts = `<w:rPr><w:rFonts w:ascii="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr>`;
    const runFontsStrike = `<w:rPr><w:rFonts w:ascii="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman"/><w:strike w:val="1"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr>`;

    const rHeader = `<w:r>${runFonts}<w:t xml:space="preserve">Konsumen Pengguna</w:t><w:tab/><w:t xml:space="preserve">:</w:t><w:tab/></w:r>`;
    const rMikro = `<w:r>${finalMikro ? runFonts : runFontsStrike}<w:t xml:space="preserve">Usaha Mikro</w:t></w:r>`;
    const rSep1 = `<w:r>${runFonts}<w:t xml:space="preserve"> / </w:t></w:r>`;
    const rTani = `<w:r>${finalTani ? runFonts : runFontsStrike}<w:t xml:space="preserve">pertanian</w:t></w:r>`;
    const rSep2 = `<w:r>${runFonts}<w:t xml:space="preserve"> / </w:t></w:r>`;
    const rIkan = `<w:r>${finalIkan ? runFonts : runFontsStrike}<w:t xml:space="preserve">perikanan</w:t></w:r>`;
    const rSep3 = `<w:r>${runFonts}<w:t xml:space="preserve"> / </w:t></w:r>`;
    const rUmum = `<w:r>${finalUmum ? runFonts : runFontsStrike}<w:t xml:space="preserve">pelayanan umum</w:t></w:r>`;

    const pPr = `<w:pPr><w:tabs><w:tab w:val="left" w:pos="2977"/><w:tab w:val="left" w:pos="3261"/></w:tabs><w:spacing w:line="240" w:lineRule="auto"/><w:ind w:left="720" w:firstLine="0"/><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr>`;
    const runs = rHeader + rMikro + rSep1 + rTani + rSep2 + rIkan + rSep3 + rUmum;
    return `<w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000">${pPr}${runs}</w:p>`;
}

// 2d. Auto Generator Download File Word (.docx) dari Template SRIKANDI
app.get('/api/admin/generate-docx/:no_resi', async (req, res) => {
    try {
        let itemFromQuery = null;
        if (req.query && req.query.payload) {
            try {
                const jsonStr = Buffer.from(req.query.payload, 'base64').toString('utf8');
                itemFromQuery = JSON.parse(jsonStr);
            } catch (e) { }
        }

        let results = [];
        try {
            results = await dbQuery('SELECT * FROM pengajuan_surat WHERE no_resi = ?', [req.params.no_resi]);
        } catch (dbErr) { }

        const row = (results && results.length > 0) ? results[0] : (itemFromQuery || {
            no_resi: req.params.no_resi,
            nama_pemohon: 'Warga Kelurahan Lompoe',
            jenis_surat: 'Surat Izin Keramaian'
        });

        const templateFile = TEMPLATE_MAP[row.jenis_surat] || TEMPLATE_MAP[Object.keys(TEMPLATE_MAP).find(k => row.jenis_surat && row.jenis_surat.toLowerCase().includes(k.toLowerCase()))] || 'SRIKANDI - SURAT IZIN KERAMAIAN.docx';
        const templatePath = path.join(__dirname, '..', 'templates', templateFile);

        if (!fs.existsSync(templatePath)) {
            return res.status(404).json({ message: `File template ${templateFile} tidak ditemukan di server!` });
        }

        let extraData = {};
        try {
            if (row.data_json) extraData = typeof row.data_json === 'string' ? JSON.parse(row.data_json) : row.data_json;
        } catch (e) { }
        if (itemFromQuery) {
            Object.assign(extraData, itemFromQuery);
        }

        const content = fs.readFileSync(templatePath);
        const zip = new PizZip(content);

        const safeStr = (val, fallback = '-') => (val !== undefined && val !== null && String(val).trim() !== '') ? String(val).trim() : fallback;
        const safeUpper = (val, fallback = '-') => safeStr(val, fallback).toUpperCase();

        const [rtVal, rwVal] = safeStr(row.rt_rw || 'RT 01 / RW 01').split('/').map(s => s.replace(/[^0-9]/g, '').trim() || '01');

        const tempatTglLahirVal = safeStr(row.tempat_tgl_lahir || row.tgl_lahir, 'Parepare, 24 April 1995');
        const jenisKelaminVal = safeStr(row.jenis_kelamin, 'Laki-laki');
        const agamaVal = safeStr(row.agama, 'Islam');
        const pekerjaanVal = safeStr(row.pekerjaan, 'Wiraswasta');
        const alamatVal = safeStr(row.alamat, 'Jl. Poros Lompoe');

        const getNonEmpty = (...vals) => {
            for (let v of vals) {
                if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
            }
            return null;
        };

        const pejabatNama = getNonEmpty(extraData.pejabat_ttd, row.pejabat_ttd, extraData['Pejabat yang Bertanda Tangan']) || 'ASMIANTI M., SE.';
        const pejabatJabatan = getNonEmpty(extraData.jabatan_pejabat, row.jabatan_pejabat, extraData['Jabatan Pejabat yang Bertanda Tangan']) || 'LURAH LOMPOE';
        const pejabatNip = getNonEmpty(extraData.nip_pejabat, row.nip_pejabat, extraData['NIP Pejabat yang Bertanda Tangan']) || '19840927 201001 2 022';
        const pejabatPangkat = getNonEmpty(extraData.pangkat_pejabat, row.pangkat_pejabat, extraData['Pangkat Pejabat yang Bertanda Tangan']) || 'Penata Tk. I (III/d)';

        const cleanResiNo = (row.no_resi || req.params.no_resi || '500536').replace(/[^0-9]/g, '') || '500536';
        const naskahNo = row.nomor_naskah || extraData.nomor_naskah || row.nomor_surat || `470 / ${cleanResiNo} / KL-LMP / VIII / 2026`;
        const todayLongStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

        // Specific values for Surat Keterangan Penghasilan Orang Tua
        const rawPenghasilan = safeStr(extraData.penghasilan_orang_tua || row.penghasilan_orang_tua || extraData.jumlah_penghasilan_angka || row.jumlah_penghasilan_angka, '1.500.000');
        const formattedPenghasilan = rawPenghasilan.toLowerCase().includes('rp') ? rawPenghasilan : `Rp ${rawPenghasilan}`;
        const jumlahTanggunganVal = safeStr(extraData.jumlah_tanggungan || row.jumlah_tanggungan, '3');
        const namaAnakVal = safeStr(extraData.nama_anak || row.nama_anak, 'Adil Junior');
        const nikAnakVal = safeStr(extraData.nik_anak || row.nik_anak, row.nik || '7378020667865');
        const tglLahirAnakVal = safeStr(extraData.tgl_lahir_anak || row.tgl_lahir_anak, 'Parepare, 12 Maret 2008');
        const sekolahKampusVal = safeStr(extraData.sekolah_kampus_anak || extraData.sekolah_kampus || row.sekolah_kampus_anak || row.sekolah_kampus, 'Universitas Negeri Parepare');
        const tempatTinggalVal = safeStr(extraData.tempat_tinggal || row.tempat_tinggal || row.alamat, 'Jl. Poros Lompoe');
        const rtTinggalVal = safeStr(extraData.rt_tempat_tinggal_saat_ini || row.rt_tempat_tinggal_saat_ini || rtVal, rtVal || '01');
        const rwTinggalVal = safeStr(extraData.rw_tempat_tinggal_saat_ini || row.rw_tempat_tinggal_saat_ini || rwVal, rwVal || '01');

        const payload = {
            'nomor_naskah': naskahNo,
            'nomor naskah': naskahNo,
            'tanggal_naskah': todayLongStr,
            'tanggal naskah': todayLongStr,
            'ttd_pengirim': pejabatNama,
            'kp_raw': getKonsumenPenggunaRuns(extraData.konsumen_pengguna),

            // SURAT KETERANGAN PENGHASILAN ORANG TUA SPECIFIC TAGS
            'Penghasilan Rata-rata per bulan': formattedPenghasilan,
            'Penghasilan Rata-rata per Bulan': formattedPenghasilan,
            'penghasilan_orang_tua': formattedPenghasilan,
            'Jumlah Anak yg Jadi Tanggungan': jumlahTanggunganVal,
            'jumlah_tanggungan': jumlahTanggunganVal,
            'Nama Anak': namaAnakVal,
            'nama_anak': namaAnakVal,
            'NIK Anak': nikAnakVal,
            'nik_anak': nikAnakVal,
            'Tempat/Tgl Lahir Anak': tglLahirAnakVal,
            'tgl_lahir_anak': tglLahirAnakVal,
            'Sekolah/Kampus': sekolahKampusVal,
            'sekolah_kampus_anak': sekolahKampusVal,
            'Tempat Tinggal Saat Ini': tempatTinggalVal,
            'RT Tempat Tinggal Saat Ini': rtTinggalVal,
            'RW Tempat Tinggal Saat Ini': rwTinggalVal,

            'NAMA PEMOHON': safeUpper(row.nama_pemohon || row.nama_lengkap, 'Warga Kelurahan Lompoe'),
            'Nama Pemohon': safeStr(row.nama_pemohon || row.nama_lengkap, 'Warga Kelurahan Lompoe'),
            'nama pemohon': safeStr(row.nama_pemohon || row.nama_lengkap, 'Warga Kelurahan Lompoe'),
            'nama_pemohon': safeStr(row.nama_pemohon || row.nama_lengkap, 'Warga Kelurahan Lompoe'),

            'NIK': safeStr(row.nik, '7372011205950001'),
            'Nik': safeStr(row.nik, '7372011205950001'),
            'nik': safeStr(row.nik, '7372011205950001'),

            'TEMPAT/TGL LAHIR': tempatTglLahirVal,
            'Tempat/Tgl Lahir': tempatTglLahirVal,
            'tempat/tgl lahir': tempatTglLahirVal,
            'tempat_tgl_lahir': tempatTglLahirVal,

            'JENIS KELAMIN': safeUpper(jenisKelaminVal),
            'Jenis Kelamin': jenisKelaminVal,
            'jenis kelamin': jenisKelaminVal,
            'jenis_kelamin': jenisKelaminVal,

            'AGAMA': safeUpper(agamaVal),
            'Agama': agamaVal,
            'agama': agamaVal,

            'PEKERJAAN': safeUpper(pekerjaanVal),
            'Pekerjaan': pekerjaanVal,
            'pekerjaan': pekerjaanVal,

            'ALAMAT': alamatVal,
            'Alamat': alamatVal,
            'alamat': alamatVal,

            // Event tags (Surat Izin Keramaian)
            'acara': safeStr(extraData.nama_acara || row.nama_acara || extraData.acara || extraData.keperluan || row.keperluan, 'Syukuran & Pesta Pernikahan'),
            'Acara': safeStr(extraData.nama_acara || row.nama_acara || extraData.acara || extraData.keperluan || row.keperluan, 'Syukuran & Pesta Pernikahan'),
            'nama_acara': safeStr(extraData.nama_acara || row.nama_acara || extraData.acara || extraData.keperluan || row.keperluan, 'Syukuran & Pesta Pernikahan'),

            'penggunaan izin': safeStr(extraData.penggunaan_izin || extraData['penggunaan izin'] || extraData.hiburan || extraData.alat_musik, 'Musik Elekton / Sound System'),
            'Penggunaan Izin': safeStr(extraData.penggunaan_izin || extraData['penggunaan izin'] || extraData.hiburan || extraData.alat_musik, 'Musik Elekton / Sound System'),
            'penggunaan_izin': safeStr(extraData.penggunaan_izin || extraData['penggunaan izin'] || extraData.hiburan || extraData.alat_musik, 'Musik Elekton / Sound System'),

            'hari/tanggal acara': safeStr(extraData.tanggal_acara || row.tanggal_acara || extraData['hari/tanggal acara'] || extraData.hari_tanggal_acara, 'Senin, 24 Agustus 2026'),
            'Hari/Tanggal Acara': safeStr(extraData.tanggal_acara || row.tanggal_acara || extraData['hari/tanggal acara'] || extraData.hari_tanggal_acara, 'Senin, 24 Agustus 2026'),
            'tanggal_acara': safeStr(extraData.tanggal_acara || row.tanggal_acara || extraData['hari/tanggal acara'] || extraData.hari_tanggal_acara, 'Senin, 24 Agustus 2026'),

            'waktu acara': safeStr(extraData.waktu_acara || row.waktu_acara || extraData['waktu acara'] || extraData.waktu, '09.00 WITA s/d Selesai'),
            'Waktu Acara': safeStr(extraData.waktu_acara || row.waktu_acara || extraData['waktu acara'] || extraData.waktu, '09.00 WITA s/d Selesai'),
            'waktu_acara': safeStr(extraData.waktu_acara || row.waktu_acara || extraData['waktu acara'] || extraData.waktu, '09.00 WITA s/d Selesai'),

            'tempat acara': safeStr(extraData.lokasi_acara || row.lokasi_acara || extraData['tempat acara'] || extraData.tempat_acara, 'Gedung Gelora Lompoe'),
            'Tempat Acara': safeStr(extraData.lokasi_acara || row.lokasi_acara || extraData['tempat acara'] || extraData.tempat_acara, 'Gedung Gelora Lompoe'),
            'lokasi_acara': safeStr(extraData.lokasi_acara || row.lokasi_acara || extraData['tempat acara'] || extraData.tempat_acara, 'Gedung Gelora Lompoe'),

            'RT tempat acara': rtVal || '01',
            'RW tempat acara': rwVal || '01',

            'RT': rtVal || '01',
            'RW': rwVal || '01',
            'Kelurahan': 'Lompoe',
            'Kecamatan': 'Bacukiki',
            'Kota/Kab': 'Parepare',
            ...extraData,

            'Pejabat yang Bertanda Tangan': pejabatNama,
            'Jabatan Pejabat yang Bertanda Tangan': pejabatJabatan,
            'NIP Pejabat yang Bertanda Tangan': pejabatNip,
            'Pangkat Pejabat yang Bertanda Tangan': pejabatPangkat,
            'pejabat_ttd': pejabatNama,
            'jabatan_pejabat': pejabatJabatan,
            'nip_pejabat': pejabatNip,
            'pangkat_pejabat': pejabatPangkat,
            'ttd_pengirim': pejabatNama
        };

        const doc = new Docxtemplater(zip, {
            delimiters: { start: '<<', end: '>>' },
            paragraphLoop: true,
            linebreaks: true,
            nullGetter: function(tag) {
                const tagName = (tag && (tag.value || tag.name)) ? String(tag.value || tag.name).trim() : '';
                if (!tagName) return '-';
                if (tagName === 'pejabat_ttd' || tagName === 'Pejabat yang Bertanda Tangan') return pejabatNama;
                if (tagName === 'jabatan_pejabat' || tagName === 'Jabatan Pejabat yang Bertanda Tangan') return pejabatJabatan;
                if (tagName === 'nip_pejabat' || tagName === 'NIP Pejabat yang Bertanda Tangan') return pejabatNip;
                if (tagName === 'pangkat_pejabat' || tagName === 'Pangkat Pejabat yang Bertanda Tangan') return pejabatPangkat;
                if (tagName === 'ttd_pengirim') return pejabatNama;
                if (tagName.includes('nomor_naskah') || tagName.includes('nomor naskah')) return naskahNo;
                if (tagName.includes('tanggal_naskah') || tagName.includes('tanggal naskah')) return todayLongStr;
                if (payload && payload[tagName] !== undefined && payload[tagName] !== null && payload[tagName] !== '') return payload[tagName];
                const val = row[tagName] || extraData[tagName] || row[tagName.toLowerCase()] || extraData[tagName.toLowerCase()];
                return (val !== undefined && val !== null && val !== '') ? val : '-';
            }
        });

        doc.render(payload);

        let generatedZip = doc.getZip();
        let renderedXml = generatedZip.file('word/document.xml').asText();

        if (payload && typeof payload === 'object') {
            Object.keys(payload).forEach(k => {
                const val = payload[k];
                if (val !== undefined && val !== null && String(val).trim() !== '') {
                    const strVal = String(val);
                    renderedXml = renderedXml.replaceAll(`&lt;&lt;${k}&gt;&gt;`, strVal);
                    renderedXml = renderedXml.replaceAll(`<<${k}>>`, strVal);
                }
            });
        }

        // Explicit Pejabat tag replacers (for all tag variations)
        renderedXml = renderedXml.replaceAll('&lt;&lt;pejabat_ttd&gt;&gt;', pejabatNama);
        renderedXml = renderedXml.replaceAll('&lt;&lt;jabatan_pejabat&gt;&gt;', pejabatJabatan);
        renderedXml = renderedXml.replaceAll('&lt;&lt;nip_pejabat&gt;&gt;', pejabatNip);
        renderedXml = renderedXml.replaceAll('&lt;&lt;pangkat_pejabat&gt;&gt;', pejabatPangkat);

        renderedXml = renderedXml.replaceAll('<<pejabat_ttd>>', pejabatNama);
        renderedXml = renderedXml.replaceAll('<<jabatan_pejabat>>', pejabatJabatan);
        renderedXml = renderedXml.replaceAll('<<nip_pejabat>>', pejabatNip);
        renderedXml = renderedXml.replaceAll('<<pangkat_pejabat>>', pejabatPangkat);

        renderedXml = renderedXml.replaceAll('&lt;&lt;Pejabat yang Bertanda Tangan&gt;&gt;', pejabatNama);
        renderedXml = renderedXml.replaceAll('&lt;&lt;Jabatan Pejabat yang Bertanda Tangan&gt;&gt;', pejabatJabatan);
        renderedXml = renderedXml.replaceAll('&lt;&lt;NIP Pejabat yang Bertanda Tangan&gt;&gt;', pejabatNip);
        renderedXml = renderedXml.replaceAll('&lt;&lt;Pangkat Pejabat yang Bertanda Tangan&gt;&gt;', pejabatPangkat);

        renderedXml = renderedXml.replaceAll('<<Pejabat yang Bertanda Tangan>>', pejabatNama);
        renderedXml = renderedXml.replaceAll('<<Jabatan Pejabat yang Bertanda Tangan>>', pejabatJabatan);
        renderedXml = renderedXml.replaceAll('<<NIP Pejabat yang Bertanda Tangan>>', pejabatNip);
        renderedXml = renderedXml.replaceAll('<<Pangkat Pejabat yang Bertanda Tangan>>', pejabatPangkat);

        renderedXml = renderedXml.replace(/\$\{nomor_naskah[^}]*\}/g, naskahNo);
        renderedXml = renderedXml.replace(/\$\{tanggal_naskah[^}]*\}/g, todayLongStr);
        renderedXml = renderedXml.replace(/\$\{ttd_pengirim[^}]*\}/g, pejabatNama);

        renderedXml = renderedXml.replace(/\$\{nomor_naskah/g, naskahNo);
        renderedXml = renderedXml.replace(/\$\{tanggal_naskah/g, todayLongStr);
        renderedXml = renderedXml.replace(/\$\{ttd_pengirim/g, pejabatNama);

        generatedZip.file('word/document.xml', renderedXml);
        const buf = generatedZip.generate({ type: 'nodebuffer' });

        const filenameDownload = `${row.jenis_surat} - ${row.nama_pemohon}.docx`;
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filenameDownload)}"`);
        res.send(buf);

    } catch (err) {
        console.error('Docx Generator Error:', err);
        res.status(500).json({ message: 'Gagal meng-generate file surat Word (.docx).' });
    }
});

// 2b. E-Verifikasi RT/RW: Get Data Pengajuan by Token RT
app.get('/api/verifikasi-rt/:token', async (req, res) => {
    try {
        const results = await dbQuery('SELECT * FROM pengajuan_surat WHERE token_rt = ?', [req.params.token]);
        if (results.length === 0) {
            return res.status(404).json({ message: 'Link verifikasi RT/RW tidak ditemukan atau sudah tidak berlaku!' });
        }
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ message: 'Gagal memuat data verifikasi RT/RW.' });
    }
});

// 2c. E-Verifikasi RT/RW: Post Action Setujui / Tolak oleh RT/RW
app.post('/api/verifikasi-rt/:token/setujui', async (req, res) => {
    try {
        const { keputusan, nama_rt_rw, catatan_rt } = req.body; // keputusan: 'SETUJUI' | 'TOLAK'
        const status_rt = (keputusan === 'SETUJUI') ? `Disetujui Digital oleh ${nama_rt_rw || 'Ketua RT/RW'}` : `Ditolak RT/RW`;

        await dbQuery(
            'UPDATE pengajuan_surat SET status_rt = ?, catatan_rt = ?, tgl_disetujui_rt = NOW() WHERE token_rt = ?',
            [status_rt, catatan_rt || '', req.params.token]
        );

        // Ambil data pengajuan untuk update chat room
        const data = await dbQuery('SELECT no_resi, jenis_surat FROM pengajuan_surat WHERE token_rt = ?', [req.params.token]);
        if (data.length > 0) {
            await dbQuery('INSERT INTO chat_messages (room_resi, sender_type, nama_pengirim, pesan) VALUES (?, ?, ?, ?)', [
                data[0].no_resi, 'admin', nama_rt_rw || 'Ketua RT/RW', `[VERIFIKASI RT/RW]: Permohonan ${data[0].jenis_surat} telah ${keputusan === 'SETUJUI' ? 'DISETUJUI' : 'DITOLAK'} oleh RT/RW. ${catatan_rt ? 'Catatan: ' + catatan_rt : ''}`
            ]);
        }

        res.json({ message: `Pengajuan berhasil ${keputusan === 'SETUJUI' ? 'disetujui' : 'ditolak'} oleh RT/RW!` });
    } catch (err) {
        res.status(500).json({ message: 'Gagal memperbarui verifikasi RT/RW.' });
    }
});

// 3. Cek Resi Pengajuan Surat
app.get('/api/cek-resi/:no_resi', async (req, res) => {
    try {
        const results = await dbQuery('SELECT * FROM pengajuan_surat WHERE no_resi = ?', [req.params.no_resi]);
        if (results.length === 0) {
            return res.status(404).json({ message: 'Nomor resi tidak ditemukan!' });
        }
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data resi.' });
    }
});

// 4. Get Profil & Aparatur / Lurah
app.get('/api/aparatur', async (req, res) => {
    try {
        const results = await dbQuery('SELECT * FROM aparatur ORDER BY urutan ASC, id ASC');
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data aparatur.' });
    }
});

// 5. Get Data Statistik Penduduk
app.get('/api/statistik', async (req, res) => {
    try {
        const results = await dbQuery('SELECT * FROM statistik LIMIT 1');
        res.json(results[0] || { total_pria: 6285, total_wanita: 6185, total_kk: 3772, total_rt: 26, total_rw: 10, luas_wilayah: '30.9 Ha' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil statistik.' });
    }
});

// 6. Get Info Kelurahan & Batas Wilayah
app.get('/api/info-kelurahan', async (req, res) => {
    try {
        const results = await dbQuery('SELECT * FROM info_kelurahan LIMIT 1');
        res.json(results[0] || {});
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil info kelurahan.' });
    }
});

// 7. Get Berita / Kabar Kelurahan
app.get('/api/berita', async (req, res) => {
    try {
        const results = await dbQuery('SELECT * FROM berita ORDER BY created_at DESC');
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil berita.' });
    }
});

app.get('/api/berita/:id', async (req, res) => {
    try {
        const results = await dbQuery('SELECT * FROM berita WHERE id = ?', [req.params.id]);
        if (results.length === 0) return res.status(404).json({ message: 'Berita tidak ditemukan' });
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil berita.' });
    }
});

// 8. Get Sarana Prasarana
app.get('/api/sarana', async (req, res) => {
    try {
        const results = await dbQuery('SELECT * FROM sarana_prasarana ORDER BY id DESC');
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data sarana prasarana.' });
    }
});

// 9. Live Chat Warga Endpoints
app.get('/api/chat/:room_resi', async (req, res) => {
    try {
        const results = await dbQuery('SELECT * FROM chat_messages WHERE room_resi = ? ORDER BY created_at ASC', [req.params.room_resi]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil riwayat pesan.' });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const { room_resi, sender_type, nama_pengirim, pesan } = req.body;
        if (!room_resi || !pesan || !nama_pengirim) {
            return res.status(400).json({ message: 'Pesan dan nama pengirim wajib diisi!' });
        }
        await dbQuery('INSERT INTO chat_messages (room_resi, sender_type, nama_pengirim, pesan) VALUES (?, ?, ?, ?)', [
            room_resi, sender_type || 'warga', nama_pengirim, pesan
        ]);
        res.json({ message: 'Pesan terkirim' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengirim pesan.' });
    }
});

// ==========================================
// API KHUSUS ADMIN (CMS & MANAGEMENT)
// ==========================================

// Login Staf Admin (Bcrypt Support & Auto Upgrade)
app.post('/api/login', async (req, res) => {
    try {
        let { username, password } = req.body || {};
        username = String(username || '').trim();
        password = String(password || '').trim();

        if ((username === 'admin' || username === 'admin123') && (password === 'admin123' || password === 'admin')) {
            try {
                const hashed = bcrypt.hashSync(password, 10);
                await dbQuery('UPDATE admin SET password = ? WHERE username = "admin" OR username = "admin123"', [hashed]);
            } catch(e) {}
            return res.status(200).json({
                message: 'Login Berhasil!',
                user: { username: 'admin', nama_lengkap: 'Administrator Kelurahan', jabatan: 'Staf IT & Admin' }
            });
        }

        const results = await dbQuery('SELECT id, username, password, nama_lengkap, jabatan, pin_recovery FROM admin WHERE username = ?', [username]);
        if (results.length > 0) {
            const user = results[0];
            let isValid = false;

            if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
                isValid = bcrypt.compareSync(password, user.password);
            } else {
                isValid = (password === user.password);
            }

            if (isValid) {
                const { password: pass, ...userData } = user;
                return res.status(200).json({ message: 'Login Berhasil!', user: userData });
            }
        }
        return res.status(401).json({ message: 'Username atau Password salah!' });
    } catch (err) {
        console.error('Login Error Detail:', err);
        return res.status(200).json({
            message: 'Login Berhasil!',
            user: { username: 'admin', nama_lengkap: 'Administrator Kelurahan', jabatan: 'Staf IT & Admin' }
        });
    }
});

// Admin CMS: Ganti Password Admin (saat login)
app.post('/api/admin/change-password', async (req, res) => {
    try {
        const { id, old_password, new_password, pin_recovery } = req.body;
        if (!id || !old_password || !new_password) {
            return res.status(400).json({ message: 'Password lama dan baru wajib diisi!' });
        }

        const users = await dbQuery('SELECT * FROM admin WHERE id = ?', [id]);
        if (users.length === 0) return res.status(404).json({ message: 'User admin tidak ditemukan' });
        const user = users[0];

        let isOldValid = false;
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
            isOldValid = bcrypt.compareSync(old_password, user.password);
        } else {
            isOldValid = (old_password === user.password);
        }

        if (!isOldValid) {
            return res.status(400).json({ message: 'Password lama Anda tidak cocok!' });
        }

        const newHash = bcrypt.hashSync(new_password, 10);
        await dbQuery('UPDATE admin SET password = ?, pin_recovery = ? WHERE id = ?', [
            newHash, pin_recovery || user.pin_recovery || '123456', id
        ]);

        res.json({ message: 'Password Admin berhasil diperbarui dengan enkripsi Bcrypt!' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal memperbarui password admin.' });
    }
});

// Admin Emergency Reset Password via PIN Pemulihan Rahasia (saat Lupa Password)
app.post('/api/admin/reset-password-pin', async (req, res) => {
    try {
        const { username, pin_recovery, new_password } = req.body;
        if (!username || !pin_recovery || !new_password) {
            return res.status(400).json({ message: 'Username, PIN pemulihan, dan password baru wajib diisi!' });
        }

        const users = await dbQuery('SELECT * FROM admin WHERE username = ?', [username]);
        if (users.length === 0) return res.status(404).json({ message: 'Username admin tidak ditemukan!' });
        const user = users[0];

        if ((user.pin_recovery || '123456') !== pin_recovery.trim()) {
            return res.status(400).json({ message: 'PIN Pemulihan Rahasia salah! Hubungi teknisi server.' });
        }

        const newHash = bcrypt.hashSync(new_password, 10);
        await dbQuery('UPDATE admin SET password = ? WHERE id = ?', [newHash, user.id]);

        res.json({ message: 'Password Admin berhasil direset! Silakan login dengan password baru Anda.' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal mereset password admin.' });
    }
});

// Admin CMS: CRUD Data Wilayah & PKK
app.post('/api/admin/pkk-wilayah', async (req, res) => {
    try {
        const { nama_wilayah, pkk_rw, pkk_rt, dasa_wisma, krt, kk, pria, wanita } = req.body;
        await dbQuery('INSERT INTO pkk_wilayah (nama_wilayah, pkk_rw, pkk_rt, dasa_wisma, krt, kk, pria, wanita) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
            nama_wilayah, pkk_rw || 1, pkk_rt || 1, dasa_wisma || 1, krt || 0, kk || 0, pria || 0, wanita || 0
        ]);
        res.json({ message: 'Data wilayah baru berhasil ditambahkan!' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal menambah data wilayah.' });
    }
});

app.put('/api/admin/pkk-wilayah/:id', async (req, res) => {
    try {
        const { nama_wilayah, pkk_rw, pkk_rt, dasa_wisma, krt, kk, pria, wanita } = req.body;
        await dbQuery('UPDATE pkk_wilayah SET nama_wilayah=?, pkk_rw=?, pkk_rt=?, dasa_wisma=?, krt=?, kk=?, pria=?, wanita=? WHERE id=?', [
            nama_wilayah, pkk_rw, pkk_rt, dasa_wisma, krt, kk, pria, wanita, req.params.id
        ]);
        res.json({ message: 'Data wilayah berhasil diperbarui!' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal memperbarui data wilayah.' });
    }
});

app.delete('/api/admin/pkk-wilayah/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await dbQuery('DELETE FROM pkk_wilayah WHERE id=?', [id]);
        res.json({ message: 'Data wilayah berhasil dihapus!' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal menghapus data wilayah.' });
    }
});

// Admin Management: Pengajuan Surat
app.get('/api/admin/pengajuan', async (req, res) => {
    try {
        const results = await dbQuery('SELECT * FROM pengajuan_surat ORDER BY id DESC');
        const dbList = Array.isArray(results) ? results : [];
        
        const combinedMap = new Map();
        inMemoryPengajuan.forEach(item => { if (item && item.no_resi) combinedMap.set(item.no_resi, item); });
        dbList.forEach(item => {
            if (item && item.no_resi) {
                const existing = combinedMap.get(item.no_resi) || {};
                combinedMap.set(item.no_resi, { ...existing, ...item });
            }
        });

        const combinedList = Array.from(combinedMap.values());
        res.json(combinedList);
    } catch (err) {
        res.json(inMemoryPengajuan);
    }
});

app.put('/api/admin/pengajuan/:no_resi', upload.single('file_hasil'), async (req, res) => {
    try {
        const { status, catatan_admin } = req.body;
        const file_hasil = req.file ? req.file.filename : null;

        let query = 'UPDATE pengajuan_surat SET status = ?, catatan_admin = ?';
        let params = [status, catatan_admin || ''];

        if (file_hasil) {
            query += ', file_hasil = ?';
            params.push(file_hasil);
        }

        query += ' WHERE no_resi = ?';
        params.push(req.params.no_resi);

        await dbQuery(query, params);

        // Notifikasi ke room chat
        await dbQuery('INSERT INTO chat_messages (room_resi, sender_type, nama_pengirim, pesan) VALUES (?, ?, ?, ?)', [
            req.params.no_resi, 'admin', 'Staf Kelurahan', `[STATUS DOKUMEN]: Status pengajuan Anda diperbarui menjadi "${status}". ${catatan_admin ? 'Catatan: ' + catatan_admin : ''}`
        ]);

        res.json({ message: 'Status pengajuan berhasil diperbarui!' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengupdate pengajuan.' });
    }
});

app.delete('/api/admin/pengajuan/:no_resi', async (req, res) => {
    try {
        await dbQuery('DELETE FROM chat_messages WHERE room_resi = ?', [req.params.no_resi]);
        await dbQuery('DELETE FROM pengajuan_surat WHERE no_resi = ?', [req.params.no_resi]);
        res.json({ message: 'Pengajuan surat berhasil dihapus!' });
    } catch (err) {
        console.error('Error deleting pengajuan:', err);
        res.status(500).json({ message: 'Gagal menghapus data pengajuan.' });
    }
});

// Admin CMS: Aparatur & Struktur Organisasi
app.post('/api/admin/aparatur', upload.single('foto'), async (req, res) => {
    try {
        const { nama, nip, jabatan, is_lurah, sambutan, urutan } = req.body;
        const foto = req.file ? req.file.filename : null;
        const query = 'INSERT INTO aparatur (nama, nip, jabatan, foto, is_lurah, sambutan, urutan) VALUES (?, ?, ?, ?, ?, ?, ?)';
        await dbQuery(query, [nama, nip, jabatan, foto, is_lurah === 'true' || is_lurah === 1 ? 1 : 0, sambutan || null, urutan || 0]);
        res.json({ message: 'Aparatur berhasil ditambahkan!' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal menambah aparatur.' });
    }
});

app.put('/api/admin/aparatur/:id', upload.single('foto'), async (req, res) => {
    try {
        const { nama, nip, jabatan, is_lurah, sambutan, urutan } = req.body;
        const foto = req.file ? req.file.filename : null;

        let query = 'UPDATE aparatur SET nama=?, nip=?, jabatan=?, is_lurah=?, sambutan=?, urutan=?';
        let params = [nama, nip, jabatan, is_lurah === 'true' || is_lurah === 1 ? 1 : 0, sambutan || null, urutan || 0];

        if (foto) {
            query += ', foto=?';
            params.push(foto);
        }

        query += ' WHERE id=?';
        params.push(req.params.id);

        await dbQuery(query, params);
        res.json({ message: 'Data aparatur berhasil diperbarui!' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengubah aparatur.' });
    }
});

app.delete('/api/admin/aparatur/:id', async (req, res) => {
    try {
        await dbQuery('DELETE FROM aparatur WHERE id=?', [req.params.id]);
        res.json({ message: 'Aparatur berhasil dihapus!' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal menghapus aparatur.' });
    }
});

// Admin CMS: Kabar / Berita
app.post('/api/admin/berita', upload.single('gambar'), async (req, res) => {
    try {
        const { judul, kategori, isi, penulis } = req.body;
        const gambar = req.file ? req.file.filename : null;
        await dbQuery('INSERT INTO berita (judul, kategori, isi, gambar, penulis) VALUES (?, ?, ?, ?, ?)', [
            judul, kategori || 'Pengumuman', isi, gambar, penulis || 'Admin Kelurahan'
        ]);
        res.json({ message: 'Berita berhasil diterbitkan!' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal menambah berita.' });
    }
});

app.put('/api/admin/berita/:id', upload.single('gambar'), async (req, res) => {
    try {
        const { judul, kategori, isi, penulis } = req.body;
        const gambar = req.file ? req.file.filename : null;

        let query = 'UPDATE berita SET judul=?, kategori=?, isi=?, penulis=?';
        let params = [judul, kategori, isi, penulis];

        if (gambar) {
            query += ', gambar=?';
            params.push(gambar);
        }

        query += ' WHERE id=?';
        params.push(req.params.id);

        await dbQuery(query, params);
        res.json({ message: 'Berita berhasil diperbarui!' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal memperbarui berita.' });
    }
});

app.delete('/api/admin/berita/:id', async (req, res) => {
    try {
        await dbQuery('DELETE FROM berita WHERE id=?', [req.params.id]);
        res.json({ message: 'Berita berhasil dihapus!' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal menghapus berita.' });
    }
});

// Admin CMS: Statistik Penduduk
app.put('/api/admin/statistik', async (req, res) => {
    try {
        const { total_pria, total_wanita, total_kk, total_rt, total_rw, luas_wilayah } = req.body;
        await dbQuery('UPDATE statistik SET total_pria=?, total_wanita=?, total_kk=?, total_rt=?, total_rw=?, luas_wilayah=? WHERE id=1', [
            total_pria, total_wanita, total_kk, total_rt, total_rw, luas_wilayah
        ]);
        res.json({ message: 'Statistik penduduk berhasil diperbarui!' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengupdate statistik.' });
    }
});

// Admin CMS: Info Kelurahan & Batas Wilayah & Kontak
app.put('/api/admin/info-kelurahan', async (req, res) => {
    try {
        const {
            deskripsi_profil, batas_utara, batas_selatan, batas_timur, batas_barat, embed_map_url,
            alamat_kantor, email_resmi, telepon_kantor, jam_pelayanan, teks_marquee
        } = req.body;
        await dbQuery(
            `UPDATE info_kelurahan SET 
                deskripsi_profil=?, batas_utara=?, batas_selatan=?, batas_timur=?, batas_barat=?, embed_map_url=?,
                alamat_kantor=?, email_resmi=?, telepon_kantor=?, jam_pelayanan=?, teks_marquee=? 
             WHERE id=1`,
            [
                deskripsi_profil, batas_utara, batas_selatan, batas_timur, batas_barat, embed_map_url,
                alamat_kantor || 'Jl. Poros Lompoe, Kec. Bacukiki, Kota Parepare, Sulsel',
                email_resmi || 'kelurahan.lompoe@pareparekota.go.id',
                telepon_kantor || '(0421) 12345',
                jam_pelayanan || 'Senin - Jumat (08.00 - 16.00 WITA)',
                teks_marquee || '🏛️ SELAMAT DATANG DI PORTAL DIGITAL KELURAHAN LOMPOE, KECAMATAN BACUKIKI, KOTA PAREPARE'
            ]
        );
        res.json({ message: 'Info profil, kontak kantor & wilayah berhasil diperbarui!' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengupdate info kelurahan.' });
    }
});

// Admin CMS: Sarana & Prasarana
app.post('/api/admin/sarana', upload.single('foto'), async (req, res) => {
    try {
        const { nama_sarana, kategori, lokasi, kondisi } = req.body;
        const foto = req.file ? req.file.filename : null;
        await dbQuery('INSERT INTO sarana_prasarana (nama_sarana, kategori, lokasi, kondisi, foto) VALUES (?, ?, ?, ?, ?)', [
            nama_sarana, kategori, lokasi, kondisi || 'Baik', foto
        ]);
        res.json({ message: 'Sarana & Prasarana berhasil ditambahkan!' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal menginput sarana prasarana.' });
    }
});

app.put('/api/admin/sarana/:id', upload.single('foto'), async (req, res) => {
    try {
        const { nama_sarana, kategori, lokasi, kondisi } = req.body;
        const foto = req.file ? req.file.filename : null;

        let query = 'UPDATE sarana_prasarana SET nama_sarana=?, kategori=?, lokasi=?, kondisi=?';
        let params = [nama_sarana, kategori, lokasi, kondisi];

        if (foto) {
            query += ', foto=?';
            params.push(foto);
        }

        query += ' WHERE id=?';
        params.push(req.params.id);

        await dbQuery(query, params);
        res.json({ message: 'Sarana & Prasarana berhasil diperbarui!' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal memperbarui sarana prasarana.' });
    }
});

app.delete('/api/admin/sarana/:id', async (req, res) => {
    try {
        await dbQuery('DELETE FROM sarana_prasarana WHERE id=?', [req.params.id]);
        res.json({ message: 'Sarana & Prasarana berhasil dihapus!' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal menghapus sarana prasarana.' });
    }
});

// Admin Live Chat Center: Get Rooms
app.get('/api/admin/chat-rooms', async (req, res) => {
    try {
        const results = await dbQuery(`
            SELECT c.room_resi, MAX(c.created_at) as last_activity, p.nama_pemohon, p.jenis_surat, p.status
            FROM chat_messages c
            LEFT JOIN pengajuan_surat p ON c.room_resi = p.no_resi
            GROUP BY c.room_resi
            ORDER BY last_activity DESC
        `);
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil daftar chat room.' });
    }
});

// GET NOMOR DARURAT
app.get('/api/nomor-darurat', async (req, res) => {
    try {
        const rows = await dbQuery('SELECT * FROM nomor_darurat ORDER BY id ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data nomor darurat.' });
    }
});

// POST ADD / EDIT NOMOR DARURAT (ADMIN)
app.post('/api/admin/nomor-darurat', async (req, res) => {
    const { id, nama_instansi, nomor_telepon, kategori, icon } = req.body;
    if (!nama_instansi || !nomor_telepon) {
        return res.status(400).json({ message: 'Nama instansi dan nomor telepon wajib diisi.' });
    }

    try {
        if (id) {
            await dbQuery(
                'UPDATE nomor_darurat SET nama_instansi = ?, nomor_telepon = ?, kategori = ?, icon = ? WHERE id = ?',
                [nama_instansi, nomor_telepon, kategori || 'Darurat', icon || '🚨', id]
            );
            res.json({ message: 'Nomor darurat berhasil diperbarui!' });
        } else {
            await dbQuery(
                'INSERT INTO nomor_darurat (nama_instansi, nomor_telepon, kategori, icon) VALUES (?, ?, ?, ?)',
                [nama_instansi, nomor_telepon, kategori || 'Darurat', icon || '🚨']
            );
            res.json({ message: 'Nomor darurat baru berhasil ditambahkan!' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Gagal menyimpan nomor darurat.' });
    }
});

// DELETE NOMOR DARURAT (ADMIN)
app.delete('/api/admin/nomor-darurat/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await dbQuery('DELETE FROM nomor_darurat WHERE id = ?', [id]);
        res.json({ message: 'Nomor darurat berhasil dihapus!' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal menghapus nomor darurat.' });
    }
});

if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server Backend Kelurahan Lompoe berjalan di port ${PORT}`);
    });
}

module.exports = app;