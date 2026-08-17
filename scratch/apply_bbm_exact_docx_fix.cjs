const fs = require('fs');
const path = require('path');

const layananPath = path.join(__dirname, '..', 'api', 'layanan.js');
let layananCode = fs.readFileSync(layananPath, 'utf8');

// 1. Update getKonsumenPenggunaRuns to NOT include <w:p> wrapper
const oldGetRuns = `function getKonsumenPenggunaRuns(selectedType) {
    const type = (selectedType || '').toLowerCase();
    const isMikro = type.includes('mikro');
    const isTani = type.includes('tani');
    const isIkan = type.includes('ikan') || type.includes('nelayan');
    const isUmum = type.includes('umum') || type.includes('layanan');

    const finalMikro = isMikro;
    const finalTani = !isMikro && !isIkan && !isUmum ? true : isTani;
    const finalIkan = isIkan;
    const finalUmum = isUmum;

    const runFonts = \`<w:rPr><w:rFonts w:ascii="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr>\`;
    const runFontsStrike = \`<w:rPr><w:rFonts w:ascii="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman"/><w:strike w:val="1"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr>\`;

    const rHeader = \`<w:r>\${runFonts}<w:t xml:space="preserve">Konsumen Pengguna</w:t><w:tab/><w:t xml:space="preserve">:</w:t><w:tab/></w:r>\`;
    const rMikro = \`<w:r>\${finalMikro ? runFonts : runFontsStrike}<w:t xml:space="preserve">Usaha Mikro</w:t></w:r>\`;
    const rSep1 = \`<w:r>\${runFonts}<w:t xml:space="preserve"> / </w:t></w:r>\`;
    const rTani = \`<w:r>\${finalTani ? runFonts : runFontsStrike}<w:t xml:space="preserve">pertanian</w:t></w:r>\`;
    const rSep2 = \`<w:r>\${runFonts}<w:t xml:space="preserve"> / </w:t></w:r>\`;
    const rIkan = \`<w:r>\${finalIkan ? runFonts : runFontsStrike}<w:t xml:space="preserve">perikanan</w:t></w:r>\`;
    const rSep3 = \`<w:r>\${runFonts}<w:t xml:space="preserve"> / </w:t></w:r>\`;
    const rUmum = \`<w:r>\${finalUmum ? runFonts : runFontsStrike}<w:t xml:space="preserve">pelayanan umum</w:t></w:r>\`;

    const pPr = \`<w:pPr><w:tabs><w:tab w:val="left" w:pos="2977"/><w:tab w:val="left" w:pos="3261"/></w:tabs><w:spacing w:line="240" w:lineRule="auto"/><w:ind w:left="720" w:firstLine="0"/><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr>\`;
    return \`<w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000">\${pPr}\${rHeader}\${rMikro}\${rSep1}\${rTani}\${rSep2}\${rIkan}\${rSep3}\${rUmum}</w:p>\`;
}`;

const newGetRuns = `function getKonsumenPenggunaRuns(selectedType) {
    const type = (selectedType || '').toLowerCase();
    const isMikro = type.includes('mikro');
    const isTani = type.includes('tani');
    const isIkan = type.includes('ikan') || type.includes('nelayan');
    const isUmum = type.includes('umum') || type.includes('layanan');

    const finalMikro = isMikro;
    const finalTani = !isMikro && !isIkan && !isUmum ? true : isTani;
    const finalIkan = isIkan;
    const finalUmum = isUmum;

    const runFonts = \`<w:rPr><w:rFonts w:ascii="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr>\`;
    const runFontsStrike = \`<w:rPr><w:rFonts w:ascii="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman"/><w:strike w:val="1"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr>\`;

    const rHeader = \`<w:r>\${runFonts}<w:t xml:space="preserve">Konsumen Pengguna</w:t><w:tab/><w:t xml:space="preserve">:</w:t><w:tab/></w:r>\`;
    const rMikro = \`<w:r>\${finalMikro ? runFonts : runFontsStrike}<w:t xml:space="preserve">Usaha Mikro</w:t></w:r>\`;
    const rSep1 = \`<w:r>\${runFonts}<w:t xml:space="preserve"> / </w:t></w:r>\`;
    const rTani = \`<w:r>\${finalTani ? runFonts : runFontsStrike}<w:t xml:space="preserve">pertanian</w:t></w:r>\`;
    const rSep2 = \`<w:r>\${runFonts}<w:t xml:space="preserve"> / </w:t></w:r>\`;
    const rIkan = \`<w:r>\${finalIkan ? runFonts : runFontsStrike}<w:t xml:space="preserve">perikanan</w:t></w:r>\`;
    const rSep3 = \`<w:r>\${runFonts}<w:t xml:space="preserve"> / </w:t></w:r>\`;
    const rUmum = \`<w:r>\${finalUmum ? runFonts : runFontsStrike}<w:t xml:space="preserve">pelayanan umum</w:t></w:r>\`;

    return \`\${rHeader}\${rMikro}\${rSep1}\${rTani}\${rSep2}\${rIkan}\${rSep3}\${rUmum}\`;
}`;

if (layananCode.includes(oldGetRuns)) {
    layananCode = layananCode.replace(oldGetRuns, newGetRuns);
}

// 2. Update docxtemplater payload & nullGetter
const oldPayloadInit = `            const jenisUsahaVal = item.jenis_usaha || extraJson.jenis_usaha || 'Pertanian / Usaha Mikro';
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
                'Jenis BBM': jenisBbmVal,

                'kebutuhan_bbm': kebutuhanBbmVal,
                'Kebutuhan BBM': kebutuhanBbmVal,

                'jam_operasi': jamOperasiVal,
                'Jam Operasi': jamOperasiVal,

                'Liter': jumlahLiterVal,
                'liter': jumlahLiterVal,
                'volume_bbm': jumlahLiterVal,
                'jumlah_liter': jumlahLiterVal,
                'Jumlah': jumlahLiterVal,
                'Sejumlah': jumlahLiterVal,

                'konsumen_pengguna': konsumenPenggunaVal,
                'Konsumen Pengguna': konsumenPenggunaVal,`;

const newPayloadInit = `            const jenisUsahaVal = item.jenis_usaha || extraJson.jenis_usaha || 'Usaha Mikro / Pertanian Padi';
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

if (layananCode.includes(oldPayloadInit)) {
    layananCode = layananCode.replace(oldPayloadInit, newPayloadInit);
}

fs.writeFileSync(layananPath, layananCode, 'utf8');
console.log('Successfully updated api/layanan.js getKonsumenPenggunaRuns & BBM payload exact matching!');
