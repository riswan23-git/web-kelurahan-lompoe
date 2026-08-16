const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  const newPassword = process.argv[2] || 'admin123';
  console.log(`\n==========================================`);
  console.log(`🔐 SKRIP EMERGENCY RESET PASSWORD ADMIN`);
  console.log(`==========================================`);
  console.log(`Target Password Baru: "${newPassword}"`);

  try {
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '',
      database: 'db_lompoe'
    });

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    const [result] = await conn.execute(
      'UPDATE admin SET password = ?, pin_recovery = "123456" WHERE username = "admin" OR id = 1',
      [hashedPassword]
    );

    if (result.affectedRows > 0) {
      console.log(`✅ BERHASIL! Password Admin telah direset dengan enkripsi Bcrypt.`);
      console.log(`   Username        : admin`);
      console.log(`   Password Baru   : ${newPassword}`);
      console.log(`   PIN Pemulihan   : 123456`);
      console.log(`Silakan login kembali di browser Anda!\n`);
    } else {
      console.log(`⚠️ User admin tidak ditemukan. Membuat akun admin default baru...`);
      await conn.execute(
        'INSERT INTO admin (username, password, nama_lengkap, jabatan, pin_recovery) VALUES (?, ?, ?, ?, ?)',
        ['admin', hashedPassword, 'Administrator Kelurahan', 'Staf IT & Admin', '123456']
      );
      console.log(`✅ Akun Admin berhasil dibuat ulang! Username: admin, Password: ${newPassword}`);
    }

    await conn.end();
  } catch (err) {
    console.error(`❌ Gagal reset password:`, err.message);
  }
}

resetPassword();
