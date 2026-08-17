const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const apiDir = path.join(rootDir, 'api');

// 1. Update api/layanan.js generate-docx endpoint to parse ?payload= Base64 JSON item
const layananPath = path.join(apiDir, 'layanan.js');
let layananCode = fs.readFileSync(layananPath, 'utf8');

const oldGenerateDocxBlock = `        // Exact match search from store
        const item = store.pengajuanList.find(p => 
            (p.no_resi && p.no_resi.trim() === noResi) || 
            (p.nomor_resi && p.nomor_resi.trim() === noResi)
        ) || store.pengajuanList[0] || {
            id: 101,
            no_resi: noResi || 'LMP-102938',
            nama_pemohon: 'Warga Kelurahan Lompoe',
            nik: '7372011205950001',
            jenis_surat: 'Surat Izin Keramaian',
            rt_rw: 'RW 01 / RT 01',
            keperluan: 'Pengurusan Administrasi'
        };`;

const newGenerateDocxBlock = `        let itemFromQuery = null;
        if (req.query && req.query.payload) {
            try {
                const jsonStr = Buffer.from(req.query.payload, 'base64').toString('utf8');
                itemFromQuery = JSON.parse(jsonStr);
            } catch(e) {}
        } else if (url.includes('payload=')) {
            try {
                const rawPayload = url.split('payload=')[1].split('&')[0];
                const jsonStr = Buffer.from(decodeURIComponent(rawPayload), 'base64').toString('utf8');
                itemFromQuery = JSON.parse(jsonStr);
            } catch(e) {}
        }

        const foundInStore = store.pengajuanList.find(p => 
            (p.no_resi && p.no_resi.trim() === noResi) || 
            (p.nomor_resi && p.nomor_resi.trim() === noResi)
        );

        const item = itemFromQuery || foundInStore || store.pengajuanList[0] || {
            id: 101,
            no_resi: noResi || 'LMP-102938',
            nama_pemohon: 'JUMBO',
            nik: '7372012404950001',
            jenis_surat: 'Surat Rekomendasi Pembelian BBM',
            rt_rw: 'RW 03 / RT 02',
            alamat: 'Jl. Poros Lompoe No. 45, Parepare, RT 02 / RW 03',
            keperluan: 'Usaha Mikro / pertanian / perikanan / pelayanan umum',
            jenis_usaha: 'Usaha Mikro / Pertanian Padi',
            jenis_alat: 'Mesin Pompa Air / Traktor',
            jumlah_alat: '1 Unit',
            fungsi_alat: 'Pengolahan Lahan Pertanian',
            jenis_bbm: 'Solar (BBM Bersubsidi)',
            kebutuhan_bbm: '2 Liter / Hari',
            jam_operasi: '8 Jam / Hari',
            jumlah_liter: '60 Liter / Bulan',
            volume_bbm: '60 Liter / Bulan'
        };`;

if (layananCode.includes(oldGenerateDocxBlock)) {
    layananCode = layananCode.replace(oldGenerateDocxBlock, newGenerateDocxBlock);
}

// Update nullGetter in api/layanan.js to return '-' instead of undefined
const oldNullGetter = `nullGetter: function(tag) {
                    const tagKey = tag.name ? tag.name.trim() : '';
                    if (tagKey === 'nomor_naskah' || tagKey === 'nomor naskah') return \`470 / \${item.id || 101} / KL-LMP / VIII / 2026\`;
                    if (tagKey === 'tanggal_naskah' || tagKey === 'tanggal naskah') return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                    return item[tagKey] || extraJson[tagKey] || '-';
                }`;

const newNullGetter = `nullGetter: function(tag) {
                    const tagKey = tag.name ? tag.name.trim() : '';
                    if (tagKey === 'nomor_naskah' || tagKey === 'nomor naskah') return \`470 / \${item.id || 101} / KL-LMP / VIII / 2026\`;
                    if (tagKey === 'tanggal_naskah' || tagKey === 'tanggal naskah') return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                    const val = item[tagKey] || extraJson[tagKey];
                    return (val !== undefined && val !== null && val !== '') ? val : '-';
                }`;

if (layananCode.includes(oldNullGetter)) {
    layananCode = layananCode.replace(oldNullGetter, newNullGetter);
}

fs.writeFileSync(layananPath, layananCode, 'utf8');
console.log('Successfully updated api/layanan.js generate-docx payload query parser!');

// 2. Update AdminDashboard.jsx to append ?payload= to generate-docx URL
const adminDashPath = path.join(srcDir, 'AdminDashboard.jsx');
let adminDashCode = fs.readFileSync(adminDashPath, 'utf8');

const oldAdminDocxLink = `href={\`\${API_BASE_URL}/api/admin/generate-docx/\${p.no_resi}\`}`;

const newAdminDocxLink = `href={\`\${API_BASE_URL}/api/admin/generate-docx/\${p.no_resi}?payload=\${encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(p)))))\`}`;

if (adminDashCode.includes(oldAdminDocxLink)) {
    adminDashCode = adminDashCode.replace(oldAdminDocxLink, newAdminDocxLink);
    fs.writeFileSync(adminDashPath, adminDashCode, 'utf8');
    console.log('Successfully updated AdminDashboard.jsx generate-docx link with payload query!');
}
