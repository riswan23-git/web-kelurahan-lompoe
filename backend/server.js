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
        const {
            nik, nama_pemohon, no_hp, jenis_surat, keperluan,
            tempat_tgl_lahir, jenis_kelamin, agama, pekerjaan, alamat, rt_rw,
            nama_acara, tanggal_acara, lokasi_acara, opsi_persetujuan_rt,
            data_khusus // JSON string data isian spesifik
        } = req.body;

        const files = req.files || [];
        const fileNames = files.map(f => f.filename);
        const primaryFile = fileNames[0] || 'default.pdf';

        if (!nik || !nama_pemohon || !jenis_surat) {
            return res.status(400).json({ message: 'Data pengajuan belum lengkap!' });
        }
        if (files.length === 0) {
            return res.status(400).json({ message: 'Minimal 1 file berkas lampiran (KTP/KK) wajib diunggah!' });
        }

        const no_resi = 'LMP-' + Math.floor(100000 + Math.random() * 900000);
        const token_rt = 'RT-' + Date.now() + '-' + Math.floor(Math.random() * 10000);

        const initialStatusRt = (opsi_persetujuan_rt === 'upload') ? 'Disetujui via Surat Pengantar (Fisik)' : 'Menunggu E-Verifikasi RT/RW';

        // Masukkan daftar file lampiran ke data_json
        let parsedData = {};
        try {
            if (data_khusus) parsedData = JSON.parse(data_khusus);
        } catch (e) { }
        parsedData.daftar_lampiran_files = fileNames;

        const query = `
            INSERT INTO pengajuan_surat 
            (no_resi, nik, nama_pemohon, no_hp, jenis_surat, keperluan, file_berkas, 
             tempat_tgl_lahir, jenis_kelamin, agama, pekerjaan, alamat, rt_rw, 
             nama_acara, tanggal_acara, lokasi_acara, status_rt, token_rt, data_json) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await dbQuery(query, [
            no_resi, nik, nama_pemohon, no_hp, jenis_surat, keperluan || `Permohonan ${jenis_surat}`, fileNames.join(','),
            tempat_tgl_lahir || '', jenis_kelamin || '', agama || '', pekerjaan || '', alamat || '', rt_rw || '',
            nama_acara || '', tanggal_acara || '', lokasi_acara || '', initialStatusRt, token_rt, JSON.stringify(parsedData)
        ]);

        // Kirim pesan otomatis pembuka chat room
        await dbQuery('INSERT INTO chat_messages (room_resi, sender_type, nama_pengirim, pesan) VALUES (?, ?, ?, ?)', [
            no_resi, 'warga', nama_pemohon, `Halo Admin Kelurahan, saya telah mengajukan ${jenis_surat} (No Resi: ${no_resi}). Mohon diproses.`
        ]);

        res.status(200).json({
            message: 'Pengajuan surat berhasil dikirim!',
            no_resi: no_resi,
            token_rt: token_rt,
            status_rt: initialStatusRt
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Gagal memproses pengajuan surat.' });
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
        const results = await dbQuery('SELECT * FROM pengajuan_surat WHERE no_resi = ?', [req.params.no_resi]);
        if (results.length === 0) {
            return res.status(404).json({ message: 'Data pengajuan surat tidak ditemukan!' });
        }

        const row = results[0];
        const templateFile = TEMPLATE_MAP[row.jenis_surat] || 'SRIKANDI - SURAT IZIN KERAMAIAN.docx';
        const templatePath = path.join(__dirname, '..', 'templates', templateFile);

        if (!fs.existsSync(templatePath)) {
            return res.status(404).json({ message: `File template ${templateFile} tidak ditemukan di server!` });
        }

        let extraData = {};
        try {
            if (row.data_json) extraData = JSON.parse(row.data_json);
        } catch (e) { }

        const content = fs.readFileSync(templatePath);
        const zip = new PizZip(content);

        const doc = new Docxtemplater(zip, {
            delimiters: { start: '<<', end: '>>' },
            paragraphLoop: true,
            linebreaks: true,
        });

        // Gabungkan seluruh payload variabel template Srikandi
        const [rtVal, rwVal] = (row.rt_rw || 'RT 01 / RW 01').split('/').map(s => s.replace(/[^0-9]/g, '').trim() || '01');

        const payload = {
            'nomor_naskah': `470 / ${row.id} / KL-LMP / VIII / 2026`,
            'kp_raw': getKonsumenPenggunaRuns(extraData.konsumen_pengguna),
            'KELURAHAN': 'LOMPOE',
            'KECAMATAN': 'BACUKIKI',
            'KOTA': 'PAREPARE',
            'Kota/Kabupaten': 'PAREPARE',
            'Pejabat yang Bertanda Tangan': extraData.pejabat_ttd || 'ASMIANTI M., SE.',
            'Jabatan Pejabat yang Bertanda Tangan': extraData.jabatan_pejabat || 'LURAH LOMPOE',
            'NIP Pejabat yang Bertanda Tangan': extraData.nip_pejabat || '19840927 201001 2 022',
            'Pangkat Pejabat yang Bertanda Tangan': extraData.pangkat_pejabat || 'Penata Tk. I (III/d)',

            // Data Pemohon (Versi Kapital & Biasa)
            'NAMA PEMOHON': (row.nama_pemohon || '').toUpperCase(),
            'Nama Pemohon': row.nama_pemohon || '',
            'nama pemohon': row.nama_pemohon || '',
            'NIK': row.nik || '',
            'Nik': row.nik || '',
            'JENIS KELAMIN': (row.jenis_kelamin || '').toUpperCase(),
            'Jenis Kelamin': row.jenis_kelamin || '',
            'jenis kelamin': row.jenis_kelamin || '',
            'TEMPAT/TGL LAHIR': row.tempat_tgl_lahir || '',
            'Tempat/Tgl Lahir': row.tempat_tgl_lahir || '',
            'tempat/tgl lahir': row.tempat_tgl_lahir || '',
            'AGAMA': (row.agama || '').toUpperCase(),
            'Agama': row.agama || '',
            'agama': row.agama || '',
            'PEKERJAAN': (row.pekerjaan || '').toUpperCase(),
            'Pekerjaan': row.pekerjaan || '',
            'pekerjaan': row.pekerjaan || '',
            'ALAMAT': row.alamat || '',
            'Alamat': row.alamat || '',
            'alamat': row.alamat || '',
            'RT': rtVal || '01',
            'RW': rwVal || '01',
            'Kelurahan': 'Lompoe',
            'Kecamatan': 'Bacukiki',
            'Kota/Kab': 'Parepare',

            // Keramaian
            'acara': row.nama_acara || row.keperluan || '',
            'penggunaan izin': row.keperluan || 'Izin Acara',
            'hari/tanggal acara': row.tanggal_acara || '-',
            'waktu acara': extraData.waktu_acara || '09.00 - Selesai',
            'tempat acara': row.lokasi_acara || '-',
            'RT tempat acara': extraData.rt_tempat_acara || rtVal || '001',
            'RW tempat acara': extraData.rw_tempat_acara || rwVal || '001',

            // Data Ayah Kandung (Blangko Nikah Model N1)
            'NAMA AYAH KANDUNG': (extraData.nama_ayah || '').toUpperCase(),
            'Nama Ayah Kandung': extraData.nama_ayah || '',
            'NIK AYAH KANDUNG': extraData.nik_ayah || '',
            'TEMPAT/TGL LAHIR AYAH KANDUNG': extraData.tgl_lahir_ayah || '',
            'Tempat/Tgl Lahir Ayah Kandung': extraData.tgl_lahir_ayah || '',
            'AGAMA AYAH KANDUNG': (extraData.agama_ayah || 'Islam').toUpperCase(),
            'PEKERJAAN AYAH KANDUNG': (extraData.pekerjaan_ayah || '').toUpperCase(),
            'ALAMAT AYAH KANDUNG': extraData.alamat_ayah || '',

            // Data Ibu Kandung (Blangko Nikah Model N1)
            'NAMA IBU KANDUNG': (extraData.nama_ibu || '').toUpperCase(),
            'Nama Ibu Kandung': extraData.nama_ibu || '',
            'NIK IBU KANDUNG': extraData.nik_ibu || '',
            'TEMPAT/TGL LAHIR IBU KANDUNG': extraData.tgl_lahir_ibu || '',
            'Tempat/Tgl Lahir Ibu Kandung': extraData.tgl_lahir_ibu || '',
            'AGAMA IBU KANDUNG': (extraData.agama_ibu || 'Islam').toUpperCase(),
            // Data Anak (Surat Keterangan Penghasilan Orang Tua)
            'NAMA ANAK': (extraData.nama_anak || '').toUpperCase(),
            'Nama Anak': extraData.nama_anak || '',
            'NIK ANAK': extraData.nik_anak || '',
            'Nik Anak': extraData.nik_anak || '',
            'TEMPAT/TGL LAHIR ANAK': extraData.tgl_lahir_anak || '',
            'Tempat/Tgl Lahir Anak': extraData.tgl_lahir_anak || '',

            // Surat Rekomendasi Pembelian BBM
            'Konsumen Pengguna': extraData.konsumen_pengguna || 'Pertanian',
            'Jenis Usaha': extraData.jenis_usaha || 'Pertanian',
            'Jenis Alat': extraData.jenis_alat || '',
            'Jumlah Alat': extraData.jumlah_alat || '',
            'Fungsi Alat': extraData.fungsi_alat || '',
            'Jenis BBM': extraData.jenis_bbm || '',
            'jenis_bbm': extraData.jenis_bbm || '',
            'BBM Jenis Tertentu': extraData.jenis_bbm || '',
            'Kebutuhan BBM': extraData.kebutuhan_bbm || extraData.jumlah_liter || '',
            'kebutuhan_bbm': extraData.kebutuhan_bbm || extraData.jumlah_liter || '',
            'Kebutuhan BBM Jenis Tertentu': extraData.kebutuhan_bbm || extraData.jumlah_liter || '',
            'Jam Operasi': extraData.jam_operasi || '8 Jam / Hari',
            'jam_operasi': extraData.jam_operasi || '8 Jam / Hari',
            'Jam atau hari Operasi': extraData.jam_operasi || '8 Jam / Hari',
            'Liter': extraData.jumlah_liter || extraData.liter || '',
            'jumlah_liter': extraData.jumlah_liter || extraData.liter || '',
            'volume_bbm': extraData.jumlah_liter || extraData.liter || '',
            'Konsumen BBM Jenis Tertentu Liter Per (Jam/Hari/Minggu/Bulan)': extraData.jumlah_liter || extraData.liter || '',

            // Surat Keterangan Penghasilan Orang Tua
            'Penghasilan Rata-rata per bulan': extraData.penghasilan_orang_tua || '',
            'Jumlah Anak yg Jadi Tanggungan': extraData.jumlah_tanggungan || '',
            'Sekolah/Kampus': extraData.sekolah_kampus_anak || '',

            // Surat Keterangan Penguburan & Kematian
            'Nama Warga yang Meninggal': extraData.nama_almarhum || extraData.nama_warga_meninggal || row.nama_pemohon || '',
            'Nama Almarhum': extraData.nama_almarhum || '',
            'Hari/Tanggal Penguburan': extraData.tgl_penguburan || '',
            'Waktu Penguburan': extraData.waktu_penguburan || '',
            'Lokasi/Alamat Penguburan': extraData.lokasi_pemakaman || '',
            'Lokasi Meninggal': extraData.tempat_meninggal || extraData.lokasi_meninggal || 'Parepare',
            'Hari/Tanggal Meninggal': extraData.tgl_meninggal || extraData.tanggal_meninggal || '-',
            'Tanggal Meninggal': extraData.tgl_meninggal || extraData.tanggal_meninggal || '-',
            'Tempat Meninggal': extraData.tempat_meninggal || extraData.lokasi_meninggal || '-',

            // Surat Keterangan Orang yang Sama
            'Dokumen 1': extraData.dokumen1_nama || '',
            'Nama yang Tercantum di Dokumen 1': extraData.dokumen1_nama_tercantum || '',
            'Dokumen 2': extraData.dokumen2_nama || '',
            'Nama yang Tercantum di Dokumen 2': extraData.dokumen2_nama_tercantum || '',

            // Surat Keterangan Pergantian Status Pekerjaan
            'Status Pekerjaan Saat Ini': extraData.pekerjaan_baru || '',

            // Surat Keterangan Belum Memiliki Rumah
            'Status Tempat Tinggal Saat Ini': extraData.status_rumah || 'Kontrakan',

            // Surat Keterangan Berpenghasilan
            'Jumlah Penghasilan dalam Angka': extraData.jumlah_penghasilan || '',
            'Jumlah Penghasilan dalam Huruf': extraData.penghasilan_terbilang || '',

            // Surat Keterangan Layak Dibantu
            'Bantuan yang Dimohonkan': extraData.jenis_bantuan || row.keperluan || '',

            // Blangko Nikah (Model N1)
            'STATUS PERKAWINAN UNTUK LAKI-LAKI': extraData.status_perkawinan || 'Jejaka',
            'STATUS PERKAWINAN UNTUK PEREMPUAN': extraData.status_perkawinan || 'Perawan',
            'NAMA ISTRI/SUAMI TERDAHULU': extraData.nama_pasangan_terdahulu || '-',
            'NAMA AYAH': extraData.nama_ayah || '',
            'NIK AYAH': extraData.nik_ayah || '',
            'TEMPAT/TGL LAHIR AYAH': extraData.tgl_lahir_ayah || '',
            'PEKERJAAN AYAH': extraData.pekerjaan_ayah || '',
            'ALAMAT AYAH': extraData.alamat_ayah || '',
            'NAMA IBU': extraData.nama_ibu || '',
            'NIK IBU': extraData.nik_ibu || '',
            'TEMPAT/TGL LAHIR IBU': extraData.tgl_lahir_ibu || '',
            'PEKERJAAN IBU': extraData.pekerjaan_ibu || '',
            'ALAMAT IBU': extraData.alamat_ibu || '',

            // Data Khusus Tambahan dari JSON
            ...extraData
        };

        doc.render(payload);
        const buf = doc.getZip().generate({ type: 'nodebuffer' });

        const filenameDownload = `${row.jenis_surat} - ${row.nama_pemohon}.docx`;
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
        const { username, password } = req.body;
        const results = await dbQuery('SELECT id, username, password, nama_lengkap, jabatan, pin_recovery FROM admin WHERE username = ?', [username]);
        if (results.length > 0) {
            const user = results[0];
            let isValid = false;

            if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
                isValid = bcrypt.compareSync(password, user.password);
            } else {
                isValid = (password === user.password);
                if (isValid) {
                    // Auto upgrade plain text to bcrypt hash
                    const hashed = bcrypt.hashSync(password, 10);
                    await dbQuery('UPDATE admin SET password = ? WHERE id = ?', [hashed, user.id]);
                }
            }

            if (isValid) {
                const { password: pass, ...userData } = user;
                return res.status(200).json({ message: 'Login Berhasil!', user: userData });
            } else {
                return res.status(401).json({ message: 'Username atau Password salah!' });
            }
        } else {
            return res.status(401).json({ message: 'Username atau Password salah!' });
        }
    } catch (err) {
        console.error('Login Error Detail:', err);
        res.status(500).json({ message: 'Kesalahan pada server saat login.' });
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
        const results = await dbQuery('SELECT * FROM pengajuan_surat ORDER BY tanggal_pengajuan DESC');
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data pengajuan.' });
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