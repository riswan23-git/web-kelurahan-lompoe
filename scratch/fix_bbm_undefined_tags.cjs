const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const apiDir = path.join(rootDir, 'api');

// Update api/layanan.js to map all BBM fields and add docxtemplater nullGetter
const layananPath = path.join(apiDir, 'layanan.js');
let layananCode = fs.readFileSync(layananPath, 'utf8');

const oldDocxInit = `            const doc = new Docxtemplater(zip, {
                delimiters: { start: '<<', end: '>>' },
                paragraphLoop: true,
                linebreaks: true,
            });`;

const newDocxInit = `            let extraJson = {};
            try { if (item.data_json) extraJson = typeof item.data_json === 'string' ? JSON.parse(item.data_json) : item.data_json; } catch(e) {}

            const doc = new Docxtemplater(zip, {
                delimiters: { start: '<<', end: '>>' },
                paragraphLoop: true,
                linebreaks: true,
                nullGetter: function(tag) {
                    const tagKey = tag.name ? tag.name.trim() : '';
                    if (tagKey === 'nomor_naskah' || tagKey === 'nomor naskah') return \`470 / \${item.id || 101} / KL-LMP / VIII / 2026\`;
                    if (tagKey === 'tanggal_naskah' || tagKey === 'tanggal naskah') return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                    return item[tagKey] || extraJson[tagKey] || '-';
                }
            });`;

if (layananCode.includes(oldDocxInit)) {
    layananCode = layananCode.replace(oldDocxInit, newDocxInit);
}

const oldPayloadBlock = `            const payload = {
                'nomor_naskah': \`470 / \${item.id || 101} / KL-LMP / VIII / 2026\`,
                'kp_raw': getKonsumenPenggunaRuns(item.keperluan),
                'KELURAHAN': 'LOMPOE',
                'KECAMATAN': 'BACUKIKI',
                'KOTA': 'PAREPARE',
                'Kota/Kabupaten': 'PAREPARE',`;

const newPayloadBlock = `            const jenisUsahaVal = item.jenis_usaha || extraJson.jenis_usaha || 'Pertanian / Usaha Mikro';
            const jenisAlatVal = item.jenis_alat || extraJson.jenis_alat || 'Mesin Pompa Air / Traktor';
            const jumlahAlatVal = item.jumlah_alat || extraJson.jumlah_alat || '1 Unit';
            const fungsiAlatVal = item.fungsi_alat || extraJson.fungsi_alat || 'Pengolahan Lahan Pertanian';
            const jenisBbmVal = item.jenis_bbm || extraJson.jenis_bbm || 'Solar (BBM Bersubsidi)';
            const kebutuhanBbmVal = item.kebutuhan_bbm || extraJson.kebutuhan_bbm || '2 Liter / Hari';
            const jamOperasiVal = item.jam_operasi || extraJson.jam_operasi || '8 Jam / Hari';
            const jumlahLiterVal = item.jumlah_liter || extraJson.jumlah_liter || item.volume_bbm || extraJson.volume_bbm || '60 Liter / Bulan';
            const konsumenPenggunaVal = item.konsumen_pengguna || extraJson.konsumen_pengguna || item.keperluan || 'Usaha Mikro / Pertanian';
            const todayLongStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

            const payload = {
                'nomor_naskah': \`470 / \${item.id || 101} / KL-LMP / VIII / 2026\`,
                'nomor naskah': \`470 / \${item.id || 101} / KL-LMP / VIII / 2026\`,
                'tanggal_naskah': todayLongStr,
                'tanggal naskah': todayLongStr,
                'kp_raw': getKonsumenPenggunaRuns(item.keperluan),

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
                'BBM Jenis Tertentu': jenisBbmVal,

                'kebutuhan_bbm': kebutuhanBbmVal,
                'Kebutuhan BBM Jenis Tertentu': kebutuhanBbmVal,

                'jam_operasi': jamOperasiVal,
                'Jam atau hari Operasi': jamOperasiVal,

                'konsumen_bbm': jumlahLiterVal,
                'Konsumen BBM Jenis Tertentu Liter Per (Jam/Hari/Minggu/Bulan)': jumlahLiterVal,

                'jumlah': jumlahLiterVal,
                'Jumlah': jumlahLiterVal,

                'sejumlah': jumlahLiterVal,
                'Sejumlah': jumlahLiterVal,
                'volume_bbm': jumlahLiterVal,

                'konsumen_pengguna': konsumenPenggunaVal,
                'Konsumen Pengguna': konsumenPenggunaVal,

                'KELURAHAN': 'LOMPOE',
                'KECAMATAN': 'BACUKIKI',
                'KOTA': 'PAREPARE',
                'Kota/Kabupaten': 'PAREPARE',`;

if (layananCode.includes(oldPayloadBlock)) {
    layananCode = layananCode.replace(oldPayloadBlock, newPayloadBlock);
}

fs.writeFileSync(layananPath, layananCode, 'utf8');
console.log('Successfully updated api/layanan.js BBM tags & nullGetter!');
