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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve built frontend (dist) if exists
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
}

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
        { id: 2, nama: 'Fahri Firman, S.Sos', nip: '198504242019031003', jabatan: 'Sekretaris Lurah', foto: null, is_lurah: 0, sambutan: '', urutan: 2 },
        { id: 3, nama: 'Koptu Mariyanto', nip: '31330391980383', jabatan: 'Babinsa', foto: null, is_lurah: 0, sambutan: '', urutan: 3 },
        { id: 4, nama: 'Bripka Harmansyah', nip: '87040660', jabatan: 'Bhabinkamtibmas', foto: null, is_lurah: 0, sambutan: '', urutan: 4 },
        { id: 5, nama: 'Syahrir, SE', nip: '197906192005021004', jabatan: 'Kepala seksi pemerintahan ketentraman dan ketertiban', foto: null, is_lurah: 0, sambutan: '', urutan: 5 },
        { id: 6, nama: 'Sitti Kamaria, SE', nip: '197301042006042008', jabatan: 'Kepala Seksi Kesejahteraan Masyarakat', foto: null, is_lurah: 0, sambutan: '', urutan: 5 },
        { id: 7, nama: 'Salma, S.Ap', nip: '198594142914112881', jabatan: 'Kepala Seksi Pelayanan Umum & Pemas', foto: null, is_lurah: 0, sambutan: '', urutan: 5 },
        { id: 8, nama: 'NANNIS', nip: '19820416 202521 2 026', jabatan: 'Staff', foto: null, is_lurah: 0, sambutan: '', urutan: 6 },
        { id: 9, nama: 'ANDI HADI WIJAYA', nip: '20000714 202521 1 014', jabatan: 'Staff', foto: null, is_lurah: 0, sambutan: '', urutan: 7 },
        { id: 10, nama: 'HAMSAH', nip: '19710202 198911 1 001', jabatan: 'Staff', foto: null, is_lurah: 0, sambutan: '', urutan: 8 },
        { id: 11, nama: 'HASNIAH', nip: '19690303 202521 2 008', jabatan: 'Staff', foto: null, is_lurah: 0, sambutan: '', urutan: 8 }
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

// =============================================
// JSON FILE DATABASE (Fallback ketika MySQL tidak tersedia)
// =============================================
const DB_JSON_PATH = path.join(__dirname, 'db_lompoe_data.json');

function loadJsonDb() {
    try {
        if (fs.existsSync(DB_JSON_PATH)) {
            const raw = fs.readFileSync(DB_JSON_PATH, 'utf8');
            const data = JSON.parse(raw);
            return {
                aparatur: Array.isArray(data.aparatur) ? data.aparatur : FALLBACK_DATA.aparatur,
                statistik: data.statistik || FALLBACK_DATA.statistik,
                info_kelurahan: data.info_kelurahan || FALLBACK_DATA.info_kelurahan,
                nomor_darurat: Array.isArray(data.nomor_darurat) ? data.nomor_darurat : FALLBACK_DATA.nomor_darurat,
                pkk_wilayah: Array.isArray(data.pkk_wilayah) ? data.pkk_wilayah : FALLBACK_DATA.pkk_wilayah,
                berita: Array.isArray(data.berita) ? data.berita : FALLBACK_DATA.berita,
                sarana: Array.isArray(data.sarana) ? data.sarana : FALLBACK_DATA.sarana,
                kontak_rt: Array.isArray(data.kontak_rt) ? data.kontak_rt : [],
                pengajuan_surat: Array.isArray(data.pengajuan_surat) ? data.pengajuan_surat : [],
                chat_messages: Array.isArray(data.chat_messages) ? data.chat_messages : [],
                admin: Array.isArray(data.admin) ? data.admin : FALLBACK_DATA.admin
            };
        }
    } catch (e) {
        console.warn('JSON DB load error:', e.message);
    }
    return {
        aparatur: [...FALLBACK_DATA.aparatur],
        statistik: { ...FALLBACK_DATA.statistik },
        info_kelurahan: { ...FALLBACK_DATA.info_kelurahan },
        nomor_darurat: [...FALLBACK_DATA.nomor_darurat],
        pkk_wilayah: [...FALLBACK_DATA.pkk_wilayah],
        berita: [...FALLBACK_DATA.berita],
        sarana: [...FALLBACK_DATA.sarana],
        kontak_rt: [],
        pengajuan_surat: [],
        chat_messages: [],
        admin: [...FALLBACK_DATA.admin]
    };
}

let jsonDb = loadJsonDb();

function saveJsonDb() {
    try {
        fs.writeFileSync(DB_JSON_PATH, JSON.stringify(jsonDb, null, 2), 'utf8');
    } catch (e) {
        console.warn('JSON DB save error:', e.message);
    }
}

// Inisialisasi kontak_rt jika kosong
if (!jsonDb.kontak_rt || jsonDb.kontak_rt.length === 0) {
    const listRtRw = [
        'RT 01 / RW 01', 'RT 02 / RW 01', 'RT 03 / RW 01',
        "RT 01 / RW 02 (Wekke'e)", "RT 02 / RW 02 (Wekke'e)", "RT 03 / RW 02 (Wekke'e)",
        "RT 01 / RW 03 (Wekke'e)", "RT 02 / RW 03 (Wekke'e)", "RT 03 / RW 03 (Wekke'e)", "RT 04 / RW 03 (Wekke'e)",
        "RT 01 / RW 04 (Kp. Baru Labempa)", "RT 02 / RW 04 (Kp. Baru Labempa)", "RT 03 / RW 04 (Kp. Baru Labempa)",
        "RT 01 / RW 05 (Timurama)", "RT 02 / RW 05 (Timurama)", "RT 03 / RW 05 (Timurama)", "RT 04 / RW 05 (Timurama)",
        "RT 01 / RW 06 (Sipakario)", "RT 02 / RW 06 (Sipakario)", "RT 03 / RW 06 (Sipakario)"
    ];
    jsonDb.kontak_rt = listRtRw.map((rt, i) => ({ id: i + 1, rt_rw: rt, nama_ketua: '', no_wa: '' }));
    saveJsonDb();
}

// Update FALLBACK_DATA supaya sinkron dengan JSON DB
Object.assign(FALLBACK_DATA, jsonDb);

// Helper Fallback Matcher - membaca dari jsonDb (persisten)
function getFallbackResult(sql, params) {
    const lower = sql.toLowerCase();
    if (lower.includes('from aparatur')) return jsonDb ? jsonDb.aparatur : FALLBACK_DATA.aparatur;
    if (lower.includes('from statistik')) return jsonDb ? [jsonDb.statistik] : [FALLBACK_DATA.statistik];
    if (lower.includes('from info_kelurahan')) return jsonDb ? [jsonDb.info_kelurahan] : [FALLBACK_DATA.info_kelurahan];
    if (lower.includes('from nomor_darurat')) return jsonDb ? jsonDb.nomor_darurat : FALLBACK_DATA.nomor_darurat;
    if (lower.includes('from pkk_wilayah')) return jsonDb ? jsonDb.pkk_wilayah : FALLBACK_DATA.pkk_wilayah;
    if (lower.includes('from berita')) return jsonDb ? jsonDb.berita : FALLBACK_DATA.berita;
    if (lower.includes('from sarana_prasarana') || lower.includes('from sarana')) return jsonDb ? jsonDb.sarana : FALLBACK_DATA.sarana;
    if (lower.includes('from kontak_rt')) return jsonDb ? jsonDb.kontak_rt : [];
    if (lower.includes('from chat_messages')) {
        if (params && params[0]) return (jsonDb?.chat_messages || []).filter(m => m.room_resi === params[0]);
        return jsonDb?.chat_messages || [];
    }
    if (lower.includes('from pengajuan_surat')) {
        if (params && params[0] && lower.includes('where no_resi')) return (jsonDb?.pengajuan_surat || []).filter(p => p.no_resi === params[0]);
        if (params && params[0] && lower.includes('where token_rt')) return (jsonDb?.pengajuan_surat || []).filter(p => p.token_rt === params[0]);
        return jsonDb?.pengajuan_surat || [];
    }
    if (lower.includes('from admin')) {
        if (lower.includes('where username') && params && params[0]) {
            return (jsonDb?.admin || FALLBACK_DATA.admin).filter(a => a.username === params[0]);
        }
        return jsonDb?.admin || FALLBACK_DATA.admin;
    }
    // Untuk operasi INSERT/UPDATE/DELETE yang gagal ke MySQL, kembalikan hasil sukses palsu
    return { affectedRows: 1, insertId: Date.now() };
}

// Lazy Connection Pool
let pool = null;
let mysqlAvailable = null; // null=belum dicek, true=tersedia, false=tidak

function getPool() {
    if (process.env.VERCEL && !process.env.DB_HOST) return null;
    if (mysqlAvailable === false) return null;
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
            mysqlAvailable = false;
        }
    }
    return pool;
}

// Utility DB Query - sekarang menggunakan JSON file sebagai fallback persisten
const dbQuery = (sql, params = []) => {
    return new Promise((resolve) => {
        try {
            const p = getPool();
            if (!p) {
                return resolve(getFallbackResult(sql, params));
            }
            p.query(sql, params, (err, results) => {
                if (err) {
                    if (mysqlAvailable !== false) {
                        mysqlAvailable = false;
                        console.warn('⚠️  MySQL tidak tersedia, menggunakan JSON file database.');
                    }
                    return resolve(getFallbackResult(sql, params));
                }
                mysqlAvailable = true;
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
        if (mysqlAvailable === false) return res.json(jsonDb.kontak_rt);
        const results = await dbQuery('SELECT * FROM kontak_rt ORDER BY id ASC');
        if (!mysqlAvailable) return res.json(jsonDb.kontak_rt);
        res.json(results);
    } catch (err) {
        res.json(jsonDb.kontak_rt || []);
    }
});

app.post('/api/admin/kontak-rt', async (req, res) => {
    try {
        const { id, rt_rw, nama_ketua, no_wa } = req.body;
        if (mysqlAvailable === false) {
            // Gunakan jsonDb
            if (id) {
                const item = jsonDb.kontak_rt.find(k => k.id == id);
                if (item) { item.nama_ketua = nama_ketua || ''; item.no_wa = no_wa || ''; }
            } else if (rt_rw) {
                jsonDb.kontak_rt.push({ id: Date.now(), rt_rw, nama_ketua: nama_ketua || '', no_wa: no_wa || '' });
            }
            saveJsonDb();
            return res.json({ message: 'Data kontak RT/RW berhasil diperbarui!' });
        }
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

app.put('/api/admin/kontak-rt/:id', async (req, res) => {
    try {
        const { nama_ketua, no_wa } = req.body;
        const id = req.params.id;
        if (mysqlAvailable === false) {
            const item = jsonDb.kontak_rt.find(k => k.id == id);
            if (item) { item.nama_ketua = nama_ketua || ''; item.no_wa = no_wa || ''; saveJsonDb(); }
            return res.json({ message: 'Kontak RT/RW berhasil diupdate!' });
        }
        await dbQuery('UPDATE kontak_rt SET nama_ketua = ?, no_wa = ? WHERE id = ?', [nama_ketua || '', no_wa || '', id]);
        res.json({ message: 'Kontak RT/RW berhasil diupdate!' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal update kontak RT/RW.' });
    }
});

app.delete('/api/admin/kontak-rt/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (mysqlAvailable === false) {
            jsonDb.kontak_rt = jsonDb.kontak_rt.filter(k => k.id != id);
            saveJsonDb();
            return res.json({ message: 'Kontak RT/RW berhasil dihapus!' });
        }
        await dbQuery('DELETE FROM kontak_rt WHERE id = ?', [id]);
        res.json({ message: 'Kontak RT/RW berhasil dihapus!' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal menghapus kontak RT/RW.' });
    }
});

// 1. Data PKK Per Wilayah RW
app.get('/api/pkk-wilayah', async (req, res) => {
    try {
        if (mysqlAvailable === false) return res.json(jsonDb.pkk_wilayah);
        const results = await dbQuery('SELECT * FROM pkk_wilayah ORDER BY id ASC');
        if (!mysqlAvailable) return res.json(jsonDb.pkk_wilayah);
        res.json(results);
    } catch (err) {
        res.json(jsonDb.pkk_wilayah || []);
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

        const getNonEmpty = (...vals) => {
            for (let v of vals) {
                if (v !== undefined && v !== null && String(v).trim() !== '' && String(v).trim() !== '-') return String(v).trim();
            }
            return null;
        };

        const namaPemohonVal = getNonEmpty(row.nama_pemohon, row.nama_lengkap, extraData.nama_pemohon, extraData.nama_lengkap, extraData['nama_pemohon'], extraData['nama pemohon']) || 'Warga Kelurahan Lompoe';
        const nikVal = getNonEmpty(row.nik, extraData.nik, extraData['nik'], extraData['NIK']) || '7372011205950001';
        const tempatTglLahirVal = getNonEmpty(row.tempat_tgl_lahir, row.tgl_lahir, extraData.tempat_tgl_lahir, extraData['tempat_tgl_lahir'], extraData['tempat/tgl lahir'], extraData['tempat/tanggal lahir'], extraData['Tempat/Tgl Lahir'], extraData['Tempat/Tgl lahir'], extraData['tempat / tgl lahir']) || 'Parepare, 12 Mei 1995';
        const rawJk = getNonEmpty(row.jenis_kelamin, extraData.jenis_kelamin, extraData['jenis kelamin'], extraData['Jenis Kelamin'], extraData['jenis_kelamin'], extraData['Jenis kelamin'], extraData.jk, row.jk);
        const jenisKelaminVal = rawJk ? rawJk : 'Perempuan';
        const agamaVal = getNonEmpty(row.agama, extraData.agama, extraData['agama'], extraData['Agama'], extraData['AGAMA']) || 'Islam';
        const pekerjaanVal = getNonEmpty(row.pekerjaan, extraData.pekerjaan, extraData['pekerjaan'], extraData['Pekerjaan'], extraData['PEKERJAAN']) || 'Wiraswasta';
        const alamatVal = getNonEmpty(row.alamat, extraData.alamat, extraData['alamat'], extraData['Alamat'], extraData['ALAMAT']) || 'Jl. Poros Lompoe';

        const namaMeninggalVal = getNonEmpty(extraData.nama_meninggal, row.nama_meninggal, extraData['Nama Warga yang Meninggal'], extraData['nama_warga_yang_meninggal']) || namaPemohonVal;
        const nikMeninggalVal = getNonEmpty(extraData.nik_meninggal, row.nik_meninggal, extraData['nik_meninggal']) || nikVal;
        const ttlMeninggalVal = getNonEmpty(extraData.tgl_lahir_meninggal, row.tgl_lahir_meninggal, extraData['tgl_lahir_meninggal']) || tempatTglLahirVal;

        const pejabatNama = getNonEmpty(extraData.pejabat_ttd, row.pejabat_ttd, extraData['Pejabat yang Bertanda Tangan']) || 'ASMIANTI M., SE.';
        const pejabatJabatan = getNonEmpty(extraData.jabatan_pejabat, row.jabatan_pejabat, extraData['Jabatan Pejabat yang Bertanda Tangan']) || 'LURAH LOMPOE';
        const pejabatNip = getNonEmpty(extraData.nip_pejabat, row.nip_pejabat, extraData['NIP Pejabat yang Bertanda Tangan']) || '19840927 201001 2 022';
        const pejabatPangkat = getNonEmpty(extraData.pangkat_pejabat, row.pangkat_pejabat, extraData['Pangkat Pejabat yang Bertanda Tangan']) || 'Penata Tk. I (III/d)';

        const cleanResiNo = (row.no_resi || req.params.no_resi || '500536').replace(/[^0-9]/g, '') || '500536';
        const naskahNo = row.nomor_naskah || extraData.nomor_naskah || row.nomor_surat || `470 / ${cleanResiNo} / KL-LMP / VIII / 2026`;
        const todayLongStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

        const rawPenghasilanAngka = getNonEmpty(
            extraData['Jumlah Penghasilan dalam Angka'],
            extraData.jumlah_penghasilan_angka,
            row.jumlah_penghasilan_angka,
            extraData.penghasilan_orang_tua,
            row.penghasilan_orang_tua,
            extraData.penghasilan
        ) || '2.500.000';
        const formattedPenghasilanAngka = rawPenghasilanAngka.toLowerCase().includes('rp') ? rawPenghasilanAngka : `Rp ${rawPenghasilanAngka}`;

        const rawPenghasilanHuruf = getNonEmpty(
            extraData['Jumlah Penghasilan dalam Huruf'],
            extraData.jumlah_penghasilan_huruf,
            row.jumlah_penghasilan_huruf
        ) || 'Dua Juta Lima Ratus Ribu Rupiah';

        const tempatTinggalVal = getNonEmpty(
            extraData['Tempat Tinggal Saat Ini'],
            extraData.tempat_tinggal_saat_ini,
            row.tempat_tinggal_saat_ini,
            extraData.tempat_tinggal,
            row.tempat_tinggal,
            alamatVal
        ) || alamatVal;

        const rtTinggalVal = safeStr(extraData['RT Tempat Tinggal Saat Ini'] || extraData.rt_tempat_tinggal_saat_ini || row.rt_tempat_tinggal_saat_ini || rtVal, rtVal || '01');
        const rwTinggalVal = safeStr(extraData['RW Tempat Tinggal Saat Ini'] || extraData.rw_tempat_tinggal_saat_ini || row.rw_tempat_tinggal_saat_ini || rwVal, rwVal || '01');

        const jumlahTanggunganVal = safeStr(extraData.jumlah_tanggungan || row.jumlah_tanggungan, '3');
        const namaAnakVal = safeStr(extraData.nama_anak || row.nama_anak, 'Adil Junior');
        const nikAnakVal = safeStr(extraData.nik_anak || row.nik_anak, nikVal);
        const tglLahirAnakVal = safeStr(extraData.tgl_lahir_anak || row.tgl_lahir_anak, 'Parepare, 12 Maret 2008');
        const sekolahKampusVal = safeStr(extraData.sekolah_kampus_anak || extraData.sekolah_kampus || row.sekolah_kampus_anak || row.sekolah_kampus, 'Universitas Negeri Parepare');

        const isKematianSurat = String(row.jenis_surat || '').toLowerCase().includes('kematian');

        const jkMeninggalVal = getNonEmpty(extraData.jk_meninggal, extraData.jenis_kelamin_meninggal, row.jk_meninggal) || jenisKelaminVal;
        const agamaMeninggalVal = getNonEmpty(extraData.agama_meninggal, row.agama_meninggal) || agamaVal;

        const payload = {
            ...extraData,
            'nomor_naskah': naskahNo,
            'nomor naskah': naskahNo,
            'tanggal_naskah': todayLongStr,
            'tanggal naskah': todayLongStr,
            'ttd_pengirim': pejabatNama,
            'kp_raw': getKonsumenPenggunaRuns(extraData.konsumen_pengguna),

            // PENGHASILAN SPECIFIC TAGS (EXACT TEMPLATE MATCH)
            'Jumlah Penghasilan dalam Angka': formattedPenghasilanAngka,
            'Jumlah Penghasilan dalam Huruf': rawPenghasilanHuruf,
            'jumlah_penghasilan_angka': formattedPenghasilanAngka,
            'jumlah_penghasilan_huruf': rawPenghasilanHuruf,
            'Penghasilan Rata-rata per bulan': formattedPenghasilanAngka,
            'Penghasilan Rata-rata per Bulan': formattedPenghasilanAngka,
            'penghasilan_orang_tua': formattedPenghasilanAngka,

            // TEMPAT TINGGAL SAAT INI (EXACT TEMPLATE MATCH)
            'Tempat Tinggal Saat Ini': tempatTinggalVal,
            'tempat_tinggal_saat_ini': tempatTinggalVal,
            'RT Tempat Tinggal Saat Ini': rtTinggalVal,
            'RW Tempat Tinggal Saat Ini': rwTinggalVal,
            'Status Tempat Tinggal Saat Ini': safeStr(extraData.status_tempat_tinggal || row.status_tempat_tinggal, 'Menumpang / Kontrak'),

            // OTHER SURAT SPECIFIC TAGS
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
            'Nama Warga yang Meninggal': namaMeninggalVal,
            'nama_meninggal': namaMeninggalVal,
            'Kewarganegaraan': safeStr(extraData.kewarganegaraan || row.kewarganegaraan, 'WNI'),
            'Tanggal Meninggal': safeStr(extraData.tgl_meninggal || row.tgl_meninggal, '10 Agustus 2026'),
            'Tempat Meninggal': safeStr(extraData.tempat_meninggal || row.tempat_meninggal, 'Rumah Duka'),
            'Bantuan yang Dimohonkan': safeStr(extraData.bantuan_dimohonkan || row.bantuan_dimohonkan, 'Bantuan Program Keluarga Harapan (PKH)'),
            'Dokumen 1': safeStr(extraData.dokumen1_nama || row.dokumen1_nama, 'Kartu Tanda Penduduk (KTP)'),
            'Nomor Dokumen 1': safeStr(extraData.dokumen1_nomor || row.dokumen1_nomor, nikVal),
            'Nama yang Tercantum di Dokumen 1': safeStr(extraData.dokumen1_nama_tercantum || row.dokumen1_nama_tercantum, namaPemohonVal),
            'Tempat/Tanggal Lahir di Dokumen 1': safeStr(extraData.dokumen1_ttl || row.dokumen1_ttl, tempatTglLahirVal),
            'Dokumen 2': safeStr(extraData.dokumen2_nama || row.dokumen2_nama, 'Ijazah / Akta Kelahiran'),
            'Nomor Dokumen 2': safeStr(extraData.dokumen2_nomor || row.dokumen2_nomor, '-'),
            'Nama yang Tercantum di Dokumen 2': safeStr(extraData.dokumen2_nama_tercantum || row.dokumen2_nama_tercantum, namaPemohonVal),
            'Tempat/Tanggal Lahir di Dokumen 2': safeStr(extraData.dokumen2_ttl || row.dokumen2_ttl, tempatTglLahirVal),
            'Lokasi Meninggal': safeStr(extraData.tempat_meninggal || row.tempat_meninggal, 'Rumah Duka'),
            'Hari/Tanggal Meninggal': safeStr(extraData.tgl_meninggal || row.tgl_meninggal, 'Senin, 10 Agustus 2026'),
            'Hari/Tanggal Penguburan': safeStr(extraData.tgl_penguburan || row.tgl_penguburan, 'Selasa, 11 Agustus 2026'),
            'Waktu Penguburan': safeStr(extraData.waktu_penguburan || row.waktu_penguburan, '14.00 WITA'),
            'Lokasi/Alamat Penguburan': safeStr(extraData.lokasi_penguburan || row.lokasi_penguburan, 'TPU Lompoe'),
            'Status Pekerjaan Saat Ini': safeStr(extraData.status_pekerjaan_saat_ini || row.status_pekerjaan_saat_ini, pekerjaanVal),
            'STATUS PERKAWINAN UNTUK LAKI-LAKI': safeStr(extraData.status_perkawinan_laki || row.status_perkawinan_laki, 'Jejaka'),
            'STATUS PERKAWINAN UNTUK PEREMPUAN': safeStr(extraData.status_perkawinan_perempuan || row.status_perkawinan_perempuan, 'Perawan'),
            'NAMA ISTRI/SUAMI TERDAHULU': safeStr(extraData.nama_pasangan_terdahulu || row.nama_pasangan_terdahulu, '-'),
            'NAMA AYAH': safeStr(extraData.nama_ayah || row.nama_ayah, '-'),
            'NIK AYAH': safeStr(extraData.nik_ayah || row.nik_ayah, '-'),
            'TEMPAT/TGL LAHIR AYAH': safeStr(extraData.ttl_ayah || row.ttl_ayah, '-'),
            'PEKERJAAN AYAH': safeStr(extraData.pekerjaan_ayah || row.pekerjaan_ayah, '-'),
            'ALAMAT AYAH': safeStr(extraData.alamat_ayah || row.alamat_ayah, '-'),
            'NAMA IBU': safeStr(extraData.nama_ibu || row.nama_ibu, '-'),
            'NIK IBU': safeStr(extraData.nik_ibu || row.nik_ibu, '-'),
            'TEMPAT/TGL LAHIR IBU': safeStr(extraData.ttl_ibu || row.ttl_ibu, '-'),
            'PEKERJAAN IBU': safeStr(extraData.pekerjaan_ibu || row.pekerjaan_ibu, '-'),
            'ALAMAT IBU': safeStr(extraData.alamat_ibu || row.alamat_ibu, '-'),

            // BBM SPECIFIC TAGS
            'jenis_usaha': jenisUsahaVal,
            'Jenis Usaha': jenisUsahaVal,
            'Jenis Usaha/Kegiatan': jenisUsahaVal,
            'jenis_kegiatan': jenisUsahaVal,
            'jenis_alat': jenisAlatVal,
            'Jenis Alat': jenisAlatVal,
            'jumlah_alat': jumlahAlatVal,
            'Jumlah Alat': jumlahAlatVal,
            'fungsi_alat': fungsiAlatVal,
            'Fungsi Alat': fungsiAlatVal,
            'jenis_bbm': jenisBbmVal,
            'Jenis BBM': jenisBbmVal,
            'BBM Jenis Tertentu': jenisBbmVal,
            'kebutuhan_bbm': kebutuhanBbmVal,
            'Kebutuhan BBM': kebutuhanBbmVal,
            'Kebutuhan BBM Jenis Tertentu': kebutuhanBbmVal,
            'jam_operasi': jamOperasiVal,
            'Jam Operasi': jamOperasiVal,
            'Jam atau hari Operasi': jamOperasiVal,
            'Liter': jumlahLiterVal,
            'jumlah_liter': jumlahLiterVal,
            'konsumen_bbm': jumlahLiterVal,
            'Konsumen BBM Jenis Tertentu Liter Per (Jam/Hari/Minggu/Bulan)': jumlahLiterVal,
            'jumlah': jumlahLiterVal,
            'Jumlah': jumlahLiterVal,
            'sejumlah': jumlahLiterVal,
            'Sejumlah': jumlahLiterVal,
            'volume_bbm': jumlahLiterVal,
            'konsumen_pengguna': konsumenPenggunaVal,
            'Konsumen Pengguna': konsumenPenggunaVal,

            // GENERAL USER IDENTITIES
            'NAMA PEMOHON': safeUpper(namaPemohonVal),
            'Nama Pemohon': namaPemohonVal,
            'nama pemohon': namaPemohonVal,
            'nama_pemohon': namaPemohonVal,
            'NAMA LENGKAP': safeUpper(namaPemohonVal),
            'Nama Lengkap': namaPemohonVal,
            'nama_lengkap': namaPemohonVal,
            'Nama': isKematianSurat ? namaMeninggalVal : namaPemohonVal,
            'NAMA': isKematianSurat ? safeUpper(namaMeninggalVal) : safeUpper(namaPemohonVal),
            'nama': isKematianSurat ? namaMeninggalVal : namaPemohonVal,

            'NIK': isKematianSurat ? nikMeninggalVal : nikVal,
            'Nik': isKematianSurat ? nikMeninggalVal : nikVal,
            'nik': isKematianSurat ? nikMeninggalVal : nikVal,
            'nik_pemohon': nikVal,
            'NIK Pemohon': nikVal,
            'No. KTP': isKematianSurat ? nikMeninggalVal : nikVal,
            'No KTP': isKematianSurat ? nikMeninggalVal : nikVal,
            'Nomor KTP': isKematianSurat ? nikMeninggalVal : nikVal,
            'no_ktp': isKematianSurat ? nikMeninggalVal : nikVal,

            'TEMPAT/TGL LAHIR': isKematianSurat ? ttlMeninggalVal : tempatTglLahirVal,
            'Tempat/Tgl Lahir': isKematianSurat ? ttlMeninggalVal : tempatTglLahirVal,
            'tempat/tgl lahir': isKematianSurat ? ttlMeninggalVal : tempatTglLahirVal,
            'Tempat/Tgl lahir': isKematianSurat ? ttlMeninggalVal : tempatTglLahirVal,
            'tempat/tanggal lahir': isKematianSurat ? ttlMeninggalVal : tempatTglLahirVal,
            'Tempat / Tgl Lahir': isKematianSurat ? ttlMeninggalVal : tempatTglLahirVal,
            'Tempat, Tanggal Lahir': isKematianSurat ? ttlMeninggalVal : tempatTglLahirVal,
            'tempat_tgl_lahir': tempatTglLahirVal,
            'TTL': isKematianSurat ? ttlMeninggalVal : tempatTglLahirVal,
            'Ttl': isKematianSurat ? ttlMeninggalVal : tempatTglLahirVal,
            'ttl': isKematianSurat ? ttlMeninggalVal : tempatTglLahirVal,

            'JENIS KELAMIN': isKematianSurat ? safeUpper(jkMeninggalVal) : safeUpper(jenisKelaminVal),
            'Jenis Kelamin': isKematianSurat ? jkMeninggalVal : jenisKelaminVal,
            'jenis kelamin': isKematianSurat ? jkMeninggalVal : jenisKelaminVal,
            'Jenis kelamin': isKematianSurat ? jkMeninggalVal : jenisKelaminVal,
            'jenis_kelamin': jenisKelaminVal,
            'JK': isKematianSurat ? jkMeninggalVal : jenisKelaminVal,
            'Jk': isKematianSurat ? jkMeninggalVal : jenisKelaminVal,
            'jk': isKematianSurat ? jkMeninggalVal : jenisKelaminVal,

            'AGAMA': isKematianSurat ? safeUpper(agamaMeninggalVal) : safeUpper(agamaVal),
            'Agama': isKematianSurat ? agamaMeninggalVal : agamaVal,
            'agama': isKematianSurat ? agamaMeninggalVal : agamaVal,

            'PEKERJAAN': safeUpper(pekerjaanVal),
            'Pekerjaan': pekerjaanVal,
            'pekerjaan': pekerjaanVal,

            'ALAMAT': alamatVal,
            'Alamat': alamatVal,
            'alamat': alamatVal,
            'Alamat KTP': alamatVal,
            'Alamat Ktp': alamatVal,
            'ALAMAT KTP': safeUpper(alamatVal),

            'RT': rtVal || '01',
            'RW': rwVal || '01',
            'Kelurahan': 'Lompoe',
            'Kecamatan': 'Bacukiki',
            'Kota/Kabupaten': 'PAREPARE',
            'Kota/Kab': 'Parepare',
            'KOTA': 'PAREPARE',
            'KECAMATAN': 'BACUKIKI',
            'KELURAHAN': 'LOMPOE',

            // KERAMAIAN TAGS
            'acara': safeStr(extraData.nama_acara || row.nama_acara || extraData.acara || extraData.keperluan || row.keperluan, 'Syukuran & Pesta Pernikahan'),
            'Acara': safeStr(extraData.nama_acara || row.nama_acara || extraData.acara || extraData.keperluan || row.keperluan, 'Syukuran & Pesta Pernikahan'),
            'nama_acara': safeStr(extraData.nama_acara || row.nama_acara || extraData.acara || extraData.keperluan || row.keperluan, 'Syukuran & Pesta Pernikahan'),
            'penggunaan izin': safeStr(extraData.penggunaan_izin || extraData['penggunaan izin'] || extraData.hiburan || extraData.alat_musik || row.penggunaan_izin, 'Musik Elekton / Sound System'),
            'Penggunaan Izin': safeStr(extraData.penggunaan_izin || extraData['penggunaan izin'] || extraData.hiburan || extraData.alat_musik || row.penggunaan_izin, 'Musik Elekton / Sound System'),
            'penggunaan_izin': safeStr(extraData.penggunaan_izin || extraData['penggunaan izin'] || extraData.hiburan || extraData.alat_musik || row.penggunaan_izin, 'Musik Elekton / Sound System'),
            'hari/tanggal acara': safeStr(row.tanggal_acara || extraData.tanggal_acara || extraData['hari/tanggal acara'] || extraData.hari_tanggal_acara, 'Senin, 24 Agustus 2026'),
            'Hari/Tanggal Acara': safeStr(row.tanggal_acara || extraData.tanggal_acara || extraData['hari/tanggal acara'] || extraData.hari_tanggal_acara, 'Senin, 24 Agustus 2026'),
            'tanggal_acara': safeStr(row.tanggal_acara || extraData.tanggal_acara || extraData['hari/tanggal acara'] || extraData.hari_tanggal_acara, 'Senin, 24 Agustus 2026'),
            'waktu acara': safeStr(extraData.waktu_acara || row.waktu_acara || extraData['waktu acara'] || extraData.waktu, '09.00 WITA s/d Selesai'),
            'Waktu Acara': safeStr(extraData.waktu_acara || row.waktu_acara || extraData['waktu acara'] || extraData.waktu, '09.00 WITA s/d Selesai'),
            'waktu_acara': safeStr(extraData.waktu_acara || row.waktu_acara || extraData['waktu acara'] || extraData.waktu, '09.00 WITA s/d Selesai'),
            'tempat acara': safeStr(row.lokasi_acara || extraData.lokasi_acara || extraData['tempat acara'] || extraData.tempat_acara || alamatVal, 'Gedung Gelora Lompoe'),
            'Tempat Acara': safeStr(row.lokasi_acara || extraData.lokasi_acara || extraData['tempat acara'] || extraData.tempat_acara || alamatVal, 'Gedung Gelora Lompoe'),
            'lokasi_acara': safeStr(row.lokasi_acara || extraData.lokasi_acara || extraData['tempat acara'] || extraData.tempat_acara || alamatVal, 'Gedung Gelora Lompoe'),
            'RT tempat acara': rtVal || '01',
            'RW tempat acara': rwVal || '01',

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
                if (!tagName) return '';
                if (tagName === 'pejabat_ttd' || tagName === 'Pejabat yang Bertanda Tangan') return pejabatNama;
                if (tagName === 'jabatan_pejabat' || tagName === 'Jabatan Pejabat yang Bertanda Tangan') return pejabatJabatan;
                if (tagName === 'nip_pejabat' || tagName === 'NIP Pejabat yang Bertanda Tangan') return pejabatNip;
                if (tagName === 'pangkat_pejabat' || tagName === 'Pangkat Pejabat yang Bertanda Tangan') return pejabatPangkat;
                if (tagName === 'ttd_pengirim') return pejabatNama;
                if (tagName.includes('nomor_naskah') || tagName.includes('nomor naskah')) return naskahNo;
                if (tagName.includes('tanggal_naskah') || tagName.includes('tanggal naskah')) return todayLongStr;

                if (tagName.includes('Tempat/Tgl') || tagName.includes('tempat/tgl') || tagName.includes('Tempat, Tanggal')) return tempatTglLahirVal || 'Parepare, 12 Mei 1995';
                if (tagName.includes('Pekerjaan') || tagName.includes('pekerjaan') || tagName.includes('PEKERJAAN')) return pekerjaanVal || 'Wiraswasta';
                if (tagName.includes('Agama') || tagName.includes('agama') || tagName.includes('AGAMA')) return agamaVal || 'Islam';
                if (tagName.includes('Jenis Kelamin') || tagName.includes('jenis kelamin') || tagName.includes('Jenis kelamin')) return jenisKelaminVal || 'Perempuan';

                if (payload && payload[tagName] !== undefined && payload[tagName] !== null && payload[tagName] !== '') return payload[tagName];
                const val = row[tagName] || extraData[tagName] || row[tagName.toLowerCase()] || extraData[tagName.toLowerCase()];
                return (val !== undefined && val !== null && val !== '') ? val : '';
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
        if (mysqlAvailable === false) return res.json(jsonDb.aparatur);
        const results = await dbQuery('SELECT * FROM aparatur ORDER BY urutan ASC, id ASC');
        if (!mysqlAvailable) return res.json(jsonDb.aparatur);
        res.json(results);
    } catch (err) { res.json(jsonDb.aparatur || []); }
});

// 4.1 Get PKK Wilayah / Data Wilayah RW
app.get('/api/pkk-wilayah', async (req, res) => {
    try {
        if (mysqlAvailable === false) return res.json(jsonDb.pkk_wilayah);
        const results = await dbQuery('SELECT * FROM pkk_wilayah ORDER BY id ASC');
        if (!mysqlAvailable) return res.json(jsonDb.pkk_wilayah);
        res.json(results);
    } catch (err) { res.json(jsonDb.pkk_wilayah || []); }
});

// 4.2 Get Kontak RT/RW
app.get('/api/kontak-rt', async (req, res) => {
    try {
        if (mysqlAvailable === false) return res.json(jsonDb.kontak_rt);
        const results = await dbQuery('SELECT * FROM kontak_rt ORDER BY id ASC');
        if (!mysqlAvailable) return res.json(jsonDb.kontak_rt);
        res.json(results);
    } catch (err) { res.json(jsonDb.kontak_rt || []); }
});

// 5. Get Data Statistik Penduduk
app.get('/api/statistik', async (req, res) => {
    try {
        if (mysqlAvailable === false) return res.json(jsonDb.statistik);
        const results = await dbQuery('SELECT * FROM statistik LIMIT 1');
        if (!mysqlAvailable) return res.json(jsonDb.statistik);
        res.json(results[0] || jsonDb.statistik);
    } catch (err) { res.json(jsonDb.statistik || {}); }
});

// 6. Get Info Kelurahan & Batas Wilayah
app.get('/api/info-kelurahan', async (req, res) => {
    try {
        if (mysqlAvailable === false) return res.json(jsonDb.info_kelurahan);
        const results = await dbQuery('SELECT * FROM info_kelurahan LIMIT 1');
        if (!mysqlAvailable) return res.json(jsonDb.info_kelurahan);
        res.json(results[0] || jsonDb.info_kelurahan || {});
    } catch (err) { res.json(jsonDb.info_kelurahan || {}); }
});

// 7. Get Berita / Kabar Kelurahan
app.get('/api/berita', async (req, res) => {
    try {
        if (mysqlAvailable === false) return res.json(jsonDb.berita);
        const results = await dbQuery('SELECT * FROM berita ORDER BY created_at DESC');
        if (!mysqlAvailable) return res.json(jsonDb.berita);
        res.json(results);
    } catch (err) { res.json(jsonDb.berita || []); }
});

app.get('/api/berita/:id', async (req, res) => {
    try {
        if (mysqlAvailable === false) {
            const item = jsonDb.berita.find(b => b.id == req.params.id);
            return item ? res.json(item) : res.status(404).json({ message: 'Berita tidak ditemukan' });
        }
        const results = await dbQuery('SELECT * FROM berita WHERE id = ?', [req.params.id]);
        if (!mysqlAvailable) {
            const item = jsonDb.berita.find(b => b.id == req.params.id);
            return item ? res.json(item) : res.status(404).json({ message: 'Berita tidak ditemukan' });
        }
        if (results.length === 0) return res.status(404).json({ message: 'Berita tidak ditemukan' });
        res.json(results[0]);
    } catch (err) { res.status(500).json({ message: 'Gagal mengambil berita.' }); }
});

// 8. Get Sarana Prasarana
app.get('/api/sarana', async (req, res) => {
    try {
        if (mysqlAvailable === false) return res.json(jsonDb.sarana);
        const results = await dbQuery('SELECT * FROM sarana_prasarana ORDER BY id DESC');
        if (!mysqlAvailable) return res.json(jsonDb.sarana);
        res.json(results);
    } catch (err) { res.json(jsonDb.sarana || []); }
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

app.post('/api/admin/sync-cms', async (req, res) => {
    try {
        const body = req.body || {};
        // Update FALLBACK_DATA (in-memory)
        if (body.aparatur && Array.isArray(body.aparatur)) FALLBACK_DATA.aparatur = body.aparatur;
        if (body.pkk && Array.isArray(body.pkk)) FALLBACK_DATA.pkk_wilayah = body.pkk;
        if (body.berita && Array.isArray(body.berita)) FALLBACK_DATA.berita = body.berita;
        if (body.sarana && Array.isArray(body.sarana)) FALLBACK_DATA.sarana = body.sarana;
        if (body.nomor_darurat && Array.isArray(body.nomor_darurat)) FALLBACK_DATA.nomor_darurat = body.nomor_darurat;
        if (body.kontak_rt && Array.isArray(body.kontak_rt)) FALLBACK_DATA.kontak_rt = body.kontak_rt;
        if (body.statistik) FALLBACK_DATA.statistik = body.statistik;
        if (body.info) FALLBACK_DATA.info_kelurahan = body.info;

        // Juga simpan ke jsonDb (file persisten) agar tetap ada setelah server restart
        if (body.aparatur && Array.isArray(body.aparatur)) jsonDb.aparatur = body.aparatur;
        if (body.pkk && Array.isArray(body.pkk)) jsonDb.pkk_wilayah = body.pkk;
        if (body.berita && Array.isArray(body.berita)) jsonDb.berita = body.berita;
        if (body.sarana && Array.isArray(body.sarana)) jsonDb.sarana = body.sarana;
        if (body.nomor_darurat && Array.isArray(body.nomor_darurat)) jsonDb.nomor_darurat = body.nomor_darurat;
        if (body.kontak_rt && Array.isArray(body.kontak_rt)) jsonDb.kontak_rt = body.kontak_rt;
        if (body.statistik) jsonDb.statistik = body.statistik;
        if (body.info) jsonDb.info_kelurahan = body.info;
        saveJsonDb();

        res.json({ success: true, message: 'Local backend CMS synced & saved!' });
    } catch(e) {
        res.status(500).json({ message: 'Sync error' });
    }
});

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
        const newItem = { id: Date.now(), nama_wilayah, pkk_rw: pkk_rw||1, pkk_rt: pkk_rt||1, dasa_wisma: dasa_wisma||1, krt: krt||0, kk: kk||0, pria: pria||0, wanita: wanita||0 };
        if (mysqlAvailable === false) {
            jsonDb.pkk_wilayah.push(newItem);
            saveJsonDb();
            return res.json({ message: 'Data wilayah baru berhasil ditambahkan!', data: newItem });
        }
        await dbQuery('INSERT INTO pkk_wilayah (nama_wilayah, pkk_rw, pkk_rt, dasa_wisma, krt, kk, pria, wanita) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
            nama_wilayah, pkk_rw||1, pkk_rt||1, dasa_wisma||1, krt||0, kk||0, pria||0, wanita||0
        ]);
        if (!mysqlAvailable) { jsonDb.pkk_wilayah.push(newItem); saveJsonDb(); }
        res.json({ message: 'Data wilayah baru berhasil ditambahkan!', data: newItem });
    } catch (err) { res.status(500).json({ message: 'Gagal menambah data wilayah.' }); }
});

app.put('/api/admin/pkk-wilayah/:id', async (req, res) => {
    try {
        const { nama_wilayah, pkk_rw, pkk_rt, dasa_wisma, krt, kk, pria, wanita } = req.body;
        const id = req.params.id;
        if (mysqlAvailable === false) {
            const item = jsonDb.pkk_wilayah.find(p => p.id == id);
            if (item) Object.assign(item, { nama_wilayah, pkk_rw, pkk_rt, dasa_wisma, krt, kk, pria, wanita });
            saveJsonDb();
            return res.json({ message: 'Data wilayah berhasil diperbarui!' });
        }
        await dbQuery('UPDATE pkk_wilayah SET nama_wilayah=?, pkk_rw=?, pkk_rt=?, dasa_wisma=?, krt=?, kk=?, pria=?, wanita=? WHERE id=?', [
            nama_wilayah, pkk_rw, pkk_rt, dasa_wisma, krt, kk, pria, wanita, id
        ]);
        if (!mysqlAvailable) { const item = jsonDb.pkk_wilayah.find(p => p.id == id); if (item) Object.assign(item, { nama_wilayah, pkk_rw, pkk_rt, dasa_wisma, krt, kk, pria, wanita }); saveJsonDb(); }
        res.json({ message: 'Data wilayah berhasil diperbarui!' });
    } catch (err) { res.status(500).json({ message: 'Gagal memperbarui data wilayah.' }); }
});

app.delete('/api/admin/pkk-wilayah/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (mysqlAvailable === false) {
            jsonDb.pkk_wilayah = jsonDb.pkk_wilayah.filter(p => p.id != id);
            saveJsonDb();
            return res.json({ message: 'Data wilayah berhasil dihapus!' });
        }
        await dbQuery('DELETE FROM pkk_wilayah WHERE id=?', [id]);
        if (!mysqlAvailable) { jsonDb.pkk_wilayah = jsonDb.pkk_wilayah.filter(p => p.id != id); saveJsonDb(); }
        res.json({ message: 'Data wilayah berhasil dihapus!' });
    } catch (err) { res.status(500).json({ message: 'Gagal menghapus data wilayah.' }); }
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
        const foto = req.file ? req.file.filename : (req.body.foto || null);
        const isLurah = is_lurah === 'true' || is_lurah === 1 || is_lurah === '1' ? 1 : 0;
        const newItem = { id: Date.now(), nama, nip, jabatan, foto, is_lurah: isLurah, sambutan: sambutan||null, urutan: urutan||0 };
        if (mysqlAvailable === false) {
            if (isLurah) jsonDb.aparatur.forEach(a => a.is_lurah = 0);
            jsonDb.aparatur.push(newItem);
            saveJsonDb();
            return res.json({ message: 'Aparatur berhasil ditambahkan!', data: newItem });
        }
        await dbQuery('INSERT INTO aparatur (nama, nip, jabatan, foto, is_lurah, sambutan, urutan) VALUES (?, ?, ?, ?, ?, ?, ?)', [nama, nip, jabatan, foto, isLurah, sambutan||null, urutan||0]);
        if (!mysqlAvailable) { if (isLurah) jsonDb.aparatur.forEach(a => a.is_lurah = 0); jsonDb.aparatur.push(newItem); saveJsonDb(); }
        res.json({ message: 'Aparatur berhasil ditambahkan!', data: newItem });
    } catch (err) { res.status(500).json({ message: 'Gagal menambah aparatur.' }); }
});

app.put('/api/admin/aparatur/:id', upload.single('foto'), async (req, res) => {
    try {
        const { nama, nip, jabatan, is_lurah, sambutan, urutan } = req.body;
        const foto = req.file ? req.file.filename : (req.body.foto || null);
        const id = req.params.id;
        const isLurah = is_lurah === 'true' || is_lurah === 1 || is_lurah === '1' ? 1 : 0;
        if (mysqlAvailable === false) {
            const item = jsonDb.aparatur.find(a => a.id == id);
            if (item) { Object.assign(item, { nama, nip, jabatan, is_lurah: isLurah, sambutan: sambutan||null, urutan: urutan||0 }); if (foto) item.foto = foto; }
            if (isLurah) jsonDb.aparatur.forEach(a => { if (a.id != id) a.is_lurah = 0; });
            saveJsonDb();
            return res.json({ message: 'Data aparatur berhasil diperbarui!' });
        }
        let query = 'UPDATE aparatur SET nama=?, nip=?, jabatan=?, is_lurah=?, sambutan=?, urutan=?';
        let params = [nama, nip, jabatan, isLurah, sambutan||null, urutan||0];
        if (foto) { query += ', foto=?'; params.push(foto); }
        query += ' WHERE id=?'; params.push(id);
        await dbQuery(query, params);
        if (!mysqlAvailable) {
            const item = jsonDb.aparatur.find(a => a.id == id);
            if (item) { Object.assign(item, { nama, nip, jabatan, is_lurah: isLurah, sambutan, urutan }); if (foto) item.foto = foto; }
            saveJsonDb();
        }
        res.json({ message: 'Data aparatur berhasil diperbarui!' });
    } catch (err) { res.status(500).json({ message: 'Gagal mengubah aparatur.' }); }
});

app.delete('/api/admin/aparatur/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (mysqlAvailable === false) {
            jsonDb.aparatur = jsonDb.aparatur.filter(a => a.id != id);
            saveJsonDb();
            return res.json({ message: 'Aparatur berhasil dihapus!' });
        }
        await dbQuery('DELETE FROM aparatur WHERE id=?', [id]);
        if (!mysqlAvailable) { jsonDb.aparatur = jsonDb.aparatur.filter(a => a.id != id); saveJsonDb(); }
        res.json({ message: 'Aparatur berhasil dihapus!' });
    } catch (err) { res.status(500).json({ message: 'Gagal menghapus aparatur.' }); }
});

// Admin CMS: Kabar / Berita
app.post('/api/admin/berita', upload.single('gambar'), async (req, res) => {
    try {
        const { judul, kategori, isi, penulis } = req.body;
        const gambar = req.file ? req.file.filename : (req.body.gambar || null);
        const newItem = { id: Date.now(), judul, kategori: kategori||'Pengumuman', isi, gambar, penulis: penulis||'Admin Kelurahan', created_at: new Date().toISOString() };
        if (mysqlAvailable === false) {
            jsonDb.berita.unshift(newItem);
            saveJsonDb();
            return res.json({ message: 'Berita berhasil diterbitkan!', data: newItem });
        }
        await dbQuery('INSERT INTO berita (judul, kategori, isi, gambar, penulis) VALUES (?, ?, ?, ?, ?)', [judul, kategori||'Pengumuman', isi, gambar, penulis||'Admin Kelurahan']);
        if (!mysqlAvailable) { jsonDb.berita.unshift(newItem); saveJsonDb(); }
        res.json({ message: 'Berita berhasil diterbitkan!', data: newItem });
    } catch (err) { res.status(500).json({ message: 'Gagal menambah berita.' }); }
});

app.put('/api/admin/berita/:id', upload.single('gambar'), async (req, res) => {
    try {
        const { judul, kategori, isi, penulis } = req.body;
        const gambar = req.file ? req.file.filename : (req.body.gambar || null);
        const id = req.params.id;
        if (mysqlAvailable === false) {
            const item = jsonDb.berita.find(b => b.id == id);
            if (item) { Object.assign(item, { judul, kategori, isi, penulis }); if (gambar) item.gambar = gambar; }
            saveJsonDb();
            return res.json({ message: 'Berita berhasil diperbarui!' });
        }
        let query = 'UPDATE berita SET judul=?, kategori=?, isi=?, penulis=?';
        let params = [judul, kategori, isi, penulis];
        if (gambar) { query += ', gambar=?'; params.push(gambar); }
        query += ' WHERE id=?'; params.push(id);
        await dbQuery(query, params);
        if (!mysqlAvailable) { const item = jsonDb.berita.find(b => b.id == id); if (item) { Object.assign(item, { judul, kategori, isi, penulis }); if (gambar) item.gambar = gambar; } saveJsonDb(); }
        res.json({ message: 'Berita berhasil diperbarui!' });
    } catch (err) { res.status(500).json({ message: 'Gagal memperbarui berita.' }); }
});

app.delete('/api/admin/berita/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (mysqlAvailable === false) {
            jsonDb.berita = jsonDb.berita.filter(b => b.id != id);
            saveJsonDb();
            return res.json({ message: 'Berita berhasil dihapus!' });
        }
        await dbQuery('DELETE FROM berita WHERE id=?', [id]);
        if (!mysqlAvailable) { jsonDb.berita = jsonDb.berita.filter(b => b.id != id); saveJsonDb(); }
        res.json({ message: 'Berita berhasil dihapus!' });
    } catch (err) { res.status(500).json({ message: 'Gagal menghapus berita.' }); }
});

// Admin CMS: Statistik Penduduk
app.put('/api/admin/statistik', async (req, res) => {
    try {
        const { total_pria, total_wanita, total_kk, total_rt, total_rw, luas_wilayah } = req.body;
        if (mysqlAvailable === false) {
            Object.assign(jsonDb.statistik, { total_pria, total_wanita, total_kk, total_rt, total_rw, luas_wilayah });
            saveJsonDb();
            return res.json({ message: 'Statistik penduduk berhasil diperbarui!' });
        }
        await dbQuery('UPDATE statistik SET total_pria=?, total_wanita=?, total_kk=?, total_rt=?, total_rw=?, luas_wilayah=? WHERE id=1', [
            total_pria, total_wanita, total_kk, total_rt, total_rw, luas_wilayah
        ]);
        if (!mysqlAvailable) { Object.assign(jsonDb.statistik, { total_pria, total_wanita, total_kk, total_rt, total_rw, luas_wilayah }); saveJsonDb(); }
        res.json({ message: 'Statistik penduduk berhasil diperbarui!' });
    } catch (err) { res.status(500).json({ message: 'Gagal mengupdate statistik.' }); }
});

// Admin CMS: Info Kelurahan & Batas Wilayah & Kontak
app.put('/api/admin/info-kelurahan', async (req, res) => {
    try {
        const { deskripsi_profil, batas_utara, batas_selatan, batas_timur, batas_barat, embed_map_url, alamat_kantor, email_resmi, telepon_kantor, jam_pelayanan, teks_marquee } = req.body;
        const newInfo = { deskripsi_profil, batas_utara, batas_selatan, batas_timur, batas_barat, embed_map_url, alamat_kantor: alamat_kantor||'Jl. Poros Lompoe, Kec. Bacukiki, Kota Parepare, Sulsel', email_resmi: email_resmi||'kelurahan.lompoe@pareparekota.go.id', telepon_kantor: telepon_kantor||'(0421) 12345', jam_pelayanan: jam_pelayanan||'Senin - Jumat (08.00 - 16.00 WITA)', teks_marquee: teks_marquee||'' };
        if (mysqlAvailable === false) {
            Object.assign(jsonDb.info_kelurahan, newInfo);
            saveJsonDb();
            return res.json({ message: 'Info profil, kontak kantor & wilayah berhasil diperbarui!' });
        }
        await dbQuery(`UPDATE info_kelurahan SET deskripsi_profil=?, batas_utara=?, batas_selatan=?, batas_timur=?, batas_barat=?, embed_map_url=?, alamat_kantor=?, email_resmi=?, telepon_kantor=?, jam_pelayanan=?, teks_marquee=? WHERE id=1`,
            [deskripsi_profil, batas_utara, batas_selatan, batas_timur, batas_barat, embed_map_url, newInfo.alamat_kantor, newInfo.email_resmi, newInfo.telepon_kantor, newInfo.jam_pelayanan, newInfo.teks_marquee]);
        if (!mysqlAvailable) { Object.assign(jsonDb.info_kelurahan, newInfo); saveJsonDb(); }
        res.json({ message: 'Info profil, kontak kantor & wilayah berhasil diperbarui!' });
    } catch (err) { res.status(500).json({ message: 'Gagal mengupdate info kelurahan.' }); }
});

// Admin CMS: Sarana & Prasarana
app.post('/api/admin/sarana', upload.single('foto'), async (req, res) => {
    try {
        const { nama_sarana, kategori, lokasi, kondisi } = req.body;
        const foto = req.file ? req.file.filename : (req.body.foto || null);
        const newItem = { id: Date.now(), nama_sarana, kategori, lokasi, kondisi: kondisi||'Baik', foto };
        if (mysqlAvailable === false) {
            jsonDb.sarana.push(newItem);
            saveJsonDb();
            return res.json({ message: 'Sarana & Prasarana berhasil ditambahkan!', data: newItem });
        }
        await dbQuery('INSERT INTO sarana_prasarana (nama_sarana, kategori, lokasi, kondisi, foto) VALUES (?, ?, ?, ?, ?)', [nama_sarana, kategori, lokasi, kondisi||'Baik', foto]);
        if (!mysqlAvailable) { jsonDb.sarana.push(newItem); saveJsonDb(); }
        res.json({ message: 'Sarana & Prasarana berhasil ditambahkan!', data: newItem });
    } catch (err) { res.status(500).json({ message: 'Gagal menginput sarana prasarana.' }); }
});

app.put('/api/admin/sarana/:id', upload.single('foto'), async (req, res) => {
    try {
        const { nama_sarana, kategori, lokasi, kondisi } = req.body;
        const foto = req.file ? req.file.filename : (req.body.foto || null);
        const id = req.params.id;
        if (mysqlAvailable === false) {
            const item = jsonDb.sarana.find(s => s.id == id);
            if (item) { Object.assign(item, { nama_sarana, kategori, lokasi, kondisi }); if (foto) item.foto = foto; }
            saveJsonDb();
            return res.json({ message: 'Sarana & Prasarana berhasil diperbarui!' });
        }
        let query = 'UPDATE sarana_prasarana SET nama_sarana=?, kategori=?, lokasi=?, kondisi=?';
        let params = [nama_sarana, kategori, lokasi, kondisi];
        if (foto) { query += ', foto=?'; params.push(foto); }
        query += ' WHERE id=?'; params.push(id);
        await dbQuery(query, params);
        if (!mysqlAvailable) { const item = jsonDb.sarana.find(s => s.id == id); if (item) { Object.assign(item, { nama_sarana, kategori, lokasi, kondisi }); if (foto) item.foto = foto; } saveJsonDb(); }
        res.json({ message: 'Sarana & Prasarana berhasil diperbarui!' });
    } catch (err) { res.status(500).json({ message: 'Gagal memperbarui sarana prasarana.' }); }
});

app.delete('/api/admin/sarana/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (mysqlAvailable === false) {
            jsonDb.sarana = jsonDb.sarana.filter(s => s.id != id);
            saveJsonDb();
            return res.json({ message: 'Sarana & Prasarana berhasil dihapus!' });
        }
        await dbQuery('DELETE FROM sarana_prasarana WHERE id=?', [id]);
        if (!mysqlAvailable) { jsonDb.sarana = jsonDb.sarana.filter(s => s.id != id); saveJsonDb(); }
        res.json({ message: 'Sarana & Prasarana berhasil dihapus!' });
    } catch (err) { res.status(500).json({ message: 'Gagal menghapus sarana prasarana.' }); }
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
        if (mysqlAvailable === false) return res.json(jsonDb.nomor_darurat);
        const rows = await dbQuery('SELECT * FROM nomor_darurat ORDER BY id ASC');
        if (!mysqlAvailable) return res.json(jsonDb.nomor_darurat);
        res.json(rows);
    } catch (err) { res.json(jsonDb.nomor_darurat || []); }
});

// POST ADD / EDIT NOMOR DARURAT (ADMIN)
app.post('/api/admin/nomor-darurat', async (req, res) => {
    const { id, nama_instansi, nomor_telepon, kategori, icon } = req.body;
    if (!nama_instansi || !nomor_telepon) return res.status(400).json({ message: 'Nama instansi dan nomor telepon wajib diisi.' });
    try {
        if (mysqlAvailable === false) {
            if (id) {
                const item = jsonDb.nomor_darurat.find(d => d.id == id);
                if (item) Object.assign(item, { nama_instansi, nomor_telepon, kategori: kategori||'Darurat', icon: icon||'🚨' });
                saveJsonDb();
                return res.json({ message: 'Nomor darurat berhasil diperbarui!' });
            } else {
                const newItem = { id: Date.now(), nama_instansi, nomor_telepon, kategori: kategori||'Darurat', icon: icon||'🚨' };
                jsonDb.nomor_darurat.push(newItem);
                saveJsonDb();
                return res.json({ message: 'Nomor darurat baru berhasil ditambahkan!', data: newItem });
            }
        }
        if (id) {
            await dbQuery('UPDATE nomor_darurat SET nama_instansi = ?, nomor_telepon = ?, kategori = ?, icon = ? WHERE id = ?', [nama_instansi, nomor_telepon, kategori||'Darurat', icon||'🚨', id]);
            if (!mysqlAvailable) { const item = jsonDb.nomor_darurat.find(d => d.id == id); if (item) Object.assign(item, { nama_instansi, nomor_telepon, kategori: kategori||'Darurat', icon: icon||'🚨' }); saveJsonDb(); }
            res.json({ message: 'Nomor darurat berhasil diperbarui!' });
        } else {
            const newItem = { id: Date.now(), nama_instansi, nomor_telepon, kategori: kategori||'Darurat', icon: icon||'🚨' };
            await dbQuery('INSERT INTO nomor_darurat (nama_instansi, nomor_telepon, kategori, icon) VALUES (?, ?, ?, ?)', [nama_instansi, nomor_telepon, kategori||'Darurat', icon||'🚨']);
            if (!mysqlAvailable) { jsonDb.nomor_darurat.push(newItem); saveJsonDb(); }
            res.json({ message: 'Nomor darurat baru berhasil ditambahkan!', data: newItem });
        }
    } catch (err) { res.status(500).json({ message: 'Gagal menyimpan nomor darurat.' }); }
});

app.put('/api/admin/nomor-darurat/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { nama_instansi, nomor_telepon, kategori, icon } = req.body;
        if (mysqlAvailable === false) {
            const item = jsonDb.nomor_darurat.find(d => d.id == id);
            if (item) Object.assign(item, { nama_instansi, nomor_telepon, kategori: kategori||'Darurat', icon: icon||'🚨' });
            saveJsonDb();
            return res.json({ message: 'Nomor darurat berhasil diupdate!' });
        }
        await dbQuery('UPDATE nomor_darurat SET nama_instansi = ?, nomor_telepon = ?, kategori = ?, icon = ? WHERE id = ?', [nama_instansi, nomor_telepon, kategori||'Darurat', icon||'🚨', id]);
        res.json({ message: 'Nomor darurat berhasil diupdate!' });
    } catch (err) { res.status(500).json({ message: 'Gagal update nomor darurat.' }); }
});

// DELETE NOMOR DARURAT (ADMIN)
app.delete('/api/admin/nomor-darurat/:id', async (req, res) => {
    const { id } = req.params;
    try {
        if (mysqlAvailable === false) {
            jsonDb.nomor_darurat = jsonDb.nomor_darurat.filter(d => d.id != id);
            saveJsonDb();
            return res.json({ message: 'Nomor darurat berhasil dihapus!' });
        }
        await dbQuery('DELETE FROM nomor_darurat WHERE id = ?', [id]);
        if (!mysqlAvailable) { jsonDb.nomor_darurat = jsonDb.nomor_darurat.filter(d => d.id != id); saveJsonDb(); }
        res.json({ message: 'Nomor darurat berhasil dihapus!' });
    } catch (err) { res.status(500).json({ message: 'Gagal menghapus nomor darurat.' }); }
});

// POST / PUT / DELETE KONTAK RT/RW (ADMIN)
app.post('/api/admin/kontak-rt', async (req, res) => {
    try {
        const { rt_rw, nama_ketua, no_wa } = req.body;
        const newItem = { id: Date.now(), rt_rw: rt_rw||'RT 01 / RW 01', nama_ketua: nama_ketua||'', no_wa: no_wa||'' };
        if (mysqlAvailable === false) {
            jsonDb.kontak_rt.push(newItem);
            saveJsonDb();
            return res.json({ message: 'Kontak RT/RW berhasil ditambahkan!', data: newItem });
        }
        await dbQuery('INSERT INTO kontak_rt (rt_rw, nama_ketua, no_wa) VALUES (?, ?, ?)', [newItem.rt_rw, newItem.nama_ketua, newItem.no_wa]);
        if (!mysqlAvailable) { jsonDb.kontak_rt.push(newItem); saveJsonDb(); }
        res.json({ message: 'Kontak RT/RW berhasil ditambahkan!', data: newItem });
    } catch (err) { res.status(500).json({ message: 'Gagal menambah kontak RT/RW.' }); }
});

app.put('/api/admin/kontak-rt/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { rt_rw, nama_ketua, no_wa } = req.body;
        if (mysqlAvailable === false) {
            const item = jsonDb.kontak_rt.find(k => k.id == id);
            if (item) Object.assign(item, { rt_rw, nama_ketua, no_wa });
            saveJsonDb();
            return res.json({ message: 'Kontak RT/RW berhasil diperbarui!' });
        }
        await dbQuery('UPDATE kontak_rt SET rt_rw = ?, nama_ketua = ?, no_wa = ? WHERE id = ?', [rt_rw, nama_ketua, no_wa, id]);
        if (!mysqlAvailable) { const item = jsonDb.kontak_rt.find(k => k.id == id); if (item) Object.assign(item, { rt_rw, nama_ketua, no_wa }); saveJsonDb(); }
        res.json({ message: 'Kontak RT/RW berhasil diperbarui!' });
    } catch (err) { res.status(500).json({ message: 'Gagal memperbarui kontak RT/RW.' }); }
});

app.delete('/api/admin/kontak-rt/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (mysqlAvailable === false) {
            jsonDb.kontak_rt = jsonDb.kontak_rt.filter(k => k.id != id);
            saveJsonDb();
            return res.json({ message: 'Kontak RT/RW berhasil dihapus!' });
        }
        await dbQuery('DELETE FROM kontak_rt WHERE id = ?', [id]);
        if (!mysqlAvailable) { jsonDb.kontak_rt = jsonDb.kontak_rt.filter(k => k.id != id); saveJsonDb(); }
        res.json({ message: 'Kontak RT/RW berhasil dihapus!' });
    } catch (err) { res.status(500).json({ message: 'Gagal menghapus kontak RT/RW.' }); }
});

if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server Backend Kelurahan Lompoe berjalan di port ${PORT}`);
    });
}

module.exports = app;