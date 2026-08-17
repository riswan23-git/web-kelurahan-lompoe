const fs = require('fs');
const path = require('path');

const adminDashPath = path.join(__dirname, '..', 'src', 'AdminDashboard.jsx');
let adminDashCode = fs.readFileSync(adminDashPath, 'utf8');

// Add getCleanDocxUrl helper at top of AdminDashboard
const oldHelperPoint = `function AdminDashboard() {`;

const helperFunc = `const getCleanDocxUrl = (item, apiBaseUrl) => {
  if (!item) return '#';
  try {
    const cleanObj = {
      id: item.id,
      no_resi: item.no_resi,
      nama_pemohon: item.nama_pemohon || item.nama_lengkap || 'Warga',
      nik: item.nik || '',
      jenis_surat: item.jenis_surat || '',
      rt_rw: item.rt_rw || 'RT 01 / RW 01',
      alamat: item.alamat || '',
      keperluan: item.keperluan || '',
      jenis_usaha: item.jenis_usaha || '',
      jenis_alat: item.jenis_alat || '',
      jumlah_alat: item.jumlah_alat || '',
      fungsi_alat: item.fungsi_alat || '',
      jenis_bbm: item.jenis_bbm || '',
      kebutuhan_bbm: item.kebutuhan_bbm || '',
      jam_operasi: item.jam_operasi || '',
      jumlah_liter: item.jumlah_liter || item.volume_bbm || '',
      volume_bbm: item.volume_bbm || item.jumlah_liter || '',
      konsumen_pengguna: item.konsumen_pengguna || '',
      data_json: item.data_json || '',
      pejabat_ttd: item.pejabat_ttd || '',
      jabatan_pejabat: item.jabatan_pejabat || '',
      nip_pejabat: item.nip_pejabat || '',
      pangkat_pejabat: item.pangkat_pejabat || ''
    };
    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(cleanObj))));
    return \`\${apiBaseUrl}/api/admin/generate-docx/\${item.no_resi}?payload=\${encodeURIComponent(b64)}\`;
  } catch(e) {
    return \`\${apiBaseUrl}/api/admin/generate-docx/\${item.no_resi}\`;
  }
};

function AdminDashboard() {`;

if (!adminDashCode.includes('getCleanDocxUrl')) {
  adminDashCode = adminDashCode.replace(oldHelperPoint, helperFunc);
}

// Replace the long inline href in AdminDashboard table
const oldHrefLine = `href={\`\${API_BASE_URL}/api/admin/generate-docx/\${item.no_resi}?payload=\${encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(item)))))\`}`;

const newHrefLine = `href={getCleanDocxUrl(item, API_BASE_URL)}`;

if (adminDashCode.includes(oldHrefLine)) {
  adminDashCode = adminDashCode.replace(oldHrefLine, newHrefLine);
}

fs.writeFileSync(adminDashPath, adminDashCode, 'utf8');
console.log('Successfully updated AdminDashboard.jsx clean docx payload URL generator!');
