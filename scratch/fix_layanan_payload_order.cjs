const fs = require('fs');
const path = require('path');

const layananPath = path.join(__dirname, '..', 'api', 'layanan.js');
let layananCode = fs.readFileSync(layananPath, 'utf8');

const oldTryBlock = `        try {
            let PizZip = require('pizzip');
            let Docxtemplater = require('docxtemplater');
            const content = fs.readFileSync(templatePath);
            const zip = new PizZip(content);
            let extraJson = {};
            try { if (item.data_json) extraJson = typeof item.data_json === 'string' ? JSON.parse(item.data_json) : item.data_json; } catch(e) {}

            if (zip.files['word/document.xml']) {
                let xmlContent = zip.files['word/document.xml'].asText();
                xmlContent = xmlContent.replace(/{nomor_naskahs*}/g, '<<nomor_naskah>>')
                                       .replace(/{tanggal_naskahs*}/g, '<<tanggal_naskah>>')
                                       .replace(/{ttd_pengirims*}/g, '<<ttd_pengirim>>');
                zip.file('word/document.xml', xmlContent);
            }

            const doc = new Docxtemplater(zip, {
                delimiters: { start: '<<', end: '>>' },
                paragraphLoop: true,
                linebreaks: true,
                nullGetter: function(tag) {
                    const tagKey = tag.name ? tag.name.trim() : '';
                    if (tagKey.includes('nomor_naskah') || tagKey.includes('nomor naskah')) return \`470 / \${item.id || 101} / KL-LMP / VIII / 2026\`;
                    if (tagKey.includes('tanggal_naskah') || tagKey.includes('tanggal naskah')) return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                    if (typeof payload !== 'undefined' && payload && payload[tagKey]) return payload[tagKey];
                    const val = item[tagKey] || extraJson[tagKey] || item[tagKey.toLowerCase()] || extraJson[tagKey.toLowerCase()];
                    return (val !== undefined && val !== null && val !== '') ? val : '-';
                }
            });

            const [rtVal, rwVal] = (item.rt_rw || 'RT 01 / RW 01').split('/').map(s => s.replace(/[^0-9]/g, '').trim() || '01');

            const tempatTglLahirVal = item.tempat_tgl_lahir || item.tgl_lahir || 'Parepare, 24 April 1995';
            const jenisKelaminVal = item.jenis_kelamin || 'Laki-laki';
            const agamaVal = item.agama || 'Islam';
            const pekerjaanVal = item.pekerjaan || 'Wiraswasta';
            const alamatVal = item.alamat || 'Jl. Poros Lompoe';

            const pejabatNama = item.pejabat_ttd || 'ASMIANTI M., SE.';
            const pejabatJabatan = item.jabatan_pejabat || 'LURAH LOMPOE';
            const pejabatNip = item.nip_pejabat || '19840927 201001 2 022';
            const pejabatPangkat = item.pangkat_pejabat || 'Penata Tk. I (III/d)';

            const jenisUsahaVal = item.jenis_usaha || extraJson.jenis_usaha || 'Usaha Mikro / Pertanian Padi';
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
                'nomor_naskah ': \`470 / \${item.id || 101} / KL-LMP / VIII / 2026\`,
                'nomor naskah': \`470 / \${item.id || 101} / KL-LMP / VIII / 2026\`,
                'tanggal_naskah': todayLongStr,
                'tanggal naskah': todayLongStr,
                'kp_raw': getKonsumenPenggunaRuns(item.keperluan || konsumenPenggunaVal),

                // BBM SPECIFIC TAGS EXACT MATCH WITH TEMPLATE XML
                'Jenis Usaha': jenisUsahaVal,
                'jenis_usaha': jenisUsahaVal,
                'Jenis Usaha/Kegiatan': jenisUsahaVal,
                'jenis_kegiatan': jenisUsahaVal,

                'Jenis Alat': jenisAlatVal,
                'jenis_alat': jenisAlatVal,

                'Jumlah Alat': jumlahAlatVal,
                'jumlah_alat': jumlahAlatVal,

                'Fungsi Alat': fungsiAlatVal,
                'fungsi_alat': fungsiAlatVal,

                'Jenis BBM': jenisBbmVal,
                'jenis_bbm': jenisBbmVal,

                'Kebutuhan BBM': kebutuhanBbmVal,
                'kebutuhan_bbm': kebutuhanBbmVal,

                'Jam Operasi': jamOperasiVal,
                'jam_operasi': jamOperasiVal,

                'Liter': jumlahLiterVal,
                'liter': jumlahLiterVal,
                'volume_bbm': jumlahLiterVal,
                'jumlah_liter': jumlahLiterVal,
                'Jumlah': jumlahLiterVal,
                'Sejumlah': jumlahLiterVal,

                'konsumen_pengguna': konsumenPenggunaVal,
                'Konsumen Pengguna': konsumenPenggunaVal,`;

const newTryBlock = `        try {
            let PizZip = require('pizzip');
            let Docxtemplater = require('docxtemplater');
            const content = fs.readFileSync(templatePath);
            const zip = new PizZip(content);
            let extraJson = {};
            try { if (item.data_json) extraJson = typeof item.data_json === 'string' ? JSON.parse(item.data_json) : item.data_json; } catch(e) {}

            const [rtVal, rwVal] = (item.rt_rw || 'RT 01 / RW 01').split('/').map(s => s.replace(/[^0-9]/g, '').trim() || '01');

            const tempatTglLahirVal = item.tempat_tgl_lahir || item.tgl_lahir || 'Parepare, 24 April 1995';
            const jenisKelaminVal = item.jenis_kelamin || 'Laki-laki';
            const agamaVal = item.agama || 'Islam';
            const pekerjaanVal = item.pekerjaan || 'Wiraswasta';
            const alamatVal = item.alamat || 'Jl. Poros Lompoe';

            const pejabatNama = item.pejabat_ttd || 'ASMIANTI M., SE.';
            const pejabatJabatan = item.jabatan_pejabat || 'LURAH LOMPOE';
            const pejabatNip = item.nip_pejabat || '19840927 201001 2 022';
            const pejabatPangkat = item.pangkat_pejabat || 'Penata Tk. I (III/d)';

            const jenisUsahaVal = item.jenis_usaha || extraJson.jenis_usaha || 'Usaha Mikro / Pertanian Padi';
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
                'nomor_naskah ': \`470 / \${item.id || 101} / KL-LMP / VIII / 2026\`,
                'nomor naskah': \`470 / \${item.id || 101} / KL-LMP / VIII / 2026\`,
                'tanggal_naskah': todayLongStr,
                'tanggal naskah': todayLongStr,
                'kp_raw': getKonsumenPenggunaRuns(item.keperluan || konsumenPenggunaVal),

                // BBM SPECIFIC TAGS EXACT MATCH WITH TEMPLATE XML
                'Jenis Usaha': jenisUsahaVal,
                'jenis_usaha': jenisUsahaVal,
                'Jenis Usaha/Kegiatan': jenisUsahaVal,
                'jenis_kegiatan': jenisUsahaVal,

                'Jenis Alat': jenisAlatVal,
                'jenis_alat': jenisAlatVal,

                'Jumlah Alat': jumlahAlatVal,
                'jumlah_alat': jumlahAlatVal,

                'Fungsi Alat': fungsiAlatVal,
                'fungsi_alat': fungsiAlatVal,

                'Jenis BBM': jenisBbmVal,
                'jenis_bbm': jenisBbmVal,

                'Kebutuhan BBM': kebutuhanBbmVal,
                'kebutuhan_bbm': kebutuhanBbmVal,

                'Jam Operasi': jamOperasiVal,
                'jam_operasi': jamOperasiVal,

                'Liter': jumlahLiterVal,
                'liter': jumlahLiterVal,
                'volume_bbm': jumlahLiterVal,
                'jumlah_liter': jumlahLiterVal,
                'Jumlah': jumlahLiterVal,
                'Sejumlah': jumlahLiterVal,

                'konsumen_pengguna': konsumenPenggunaVal,
                'Konsumen Pengguna': konsumenPenggunaVal,

                'Alamat Usaha': \`\${alamatVal}, RT \${rtVal} / RW \${rwVal}\`,`;

if (layananCode.includes(oldTryBlock)) {
    layananCode = layananCode.replace(oldTryBlock, newTryBlock);
}

// Update docxtemplater instantiation after payload is created
const oldDocInst = `            const doc = new Docxtemplater(zip, {
                delimiters: { start: '<<', end: '>>' },
                paragraphLoop: true,
                linebreaks: true,
                nullGetter: function(tag) {
                    const tagKey = tag.name ? tag.name.trim() : '';
                    if (tagKey.includes('nomor_naskah') || tagKey.includes('nomor naskah')) return \`470 / \${item.id || 101} / KL-LMP / VIII / 2026\`;
                    if (tagKey.includes('tanggal_naskah') || tagKey.includes('tanggal naskah')) return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                    if (typeof payload !== 'undefined' && payload && payload[tagKey]) return payload[tagKey];
                    const val = item[tagKey] || extraJson[tagKey] || item[tagKey.toLowerCase()] || extraJson[tagKey.toLowerCase()];
                    return (val !== undefined && val !== null && val !== '') ? val : '-';
                }
            });`;

// Find where payload ends and insert XML preprocessor & docxtemplater constructor
const oldPayloadEnd = `'RW tempat acara': rwVal || '01'
            };

            doc.render(payload);`;

const newPayloadEnd = `'RW tempat acara': rwVal || '01'
            };

            if (zip.files['word/document.xml']) {
                let xmlContent = zip.files['word/document.xml'].asText();
                xmlContent = xmlContent.replace(/\\{nomor_naskah\\s*\\}/g, '<<nomor_naskah>>')
                                       .replace(/\\{tanggal_naskah\\s*\\}/g, '<<tanggal_naskah>>')
                                       .replace(/\\{ttd_pengirim\\s*\\}/g, '<<ttd_pengirim>>');
                zip.file('word/document.xml', xmlContent);
            }

            const doc = new Docxtemplater(zip, {
                delimiters: { start: '<<', end: '>>' },
                paragraphLoop: true,
                linebreaks: true,
                nullGetter: function(tag) {
                    const tagKey = tag.name ? tag.name.trim() : '';
                    if (tagKey.includes('nomor_naskah') || tagKey.includes('nomor naskah')) return \`470 / \${item.id || 101} / KL-LMP / VIII / 2026\`;
                    if (tagKey.includes('tanggal_naskah') || tagKey.includes('tanggal naskah')) return todayLongStr;
                    if (payload && payload[tagKey] !== undefined) return payload[tagKey];
                    if (payload && payload[tag.name] !== undefined) return payload[tag.name];
                    const val = item[tagKey] || extraJson[tagKey] || item[tagKey.toLowerCase()] || extraJson[tagKey.toLowerCase()];
                    return (val !== undefined && val !== null && val !== '') ? val : '-';
                }
            });

            doc.render(payload);`;

if (layananCode.includes(oldPayloadEnd)) {
    layananCode = layananCode.replace(oldPayloadEnd, newPayloadEnd);
}

fs.writeFileSync(layananPath, layananCode, 'utf8');
console.log('Successfully re-ordered payload and docxtemplater instantiation in api/layanan.js!');
