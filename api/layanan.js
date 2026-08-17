const store = require('./_store.js');
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

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
    return `<w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000">${pPr}${rHeader}${rMikro}${rSep1}${rTani}${rSep2}${rIkan}${rSep3}${rUmum}</w:p>`;
}

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const url = req.url || '';

    // 0. GENERATE REAL DOCX FROM SRIKANDI TEMPLATES IN /templates FOLDER
    if (url.includes('generate-docx')) {
        let noResi = url.split('generate-docx/')[1] || '';
        noResi = noResi.split('?')[0].trim();

        // Exact match search from store
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
        };

        const templateFile = TEMPLATE_MAP[item.jenis_surat] || 'SRIKANDI - SURAT IZIN KERAMAIAN.docx';
        const templatePath = path.join(process.cwd(), 'templates', templateFile);

        if (!fs.existsSync(templatePath)) {
            console.error(`Template not found at ${templatePath}`);
            res.setHeader('Content-Type', 'text/plain');
            return res.status(404).send(`File template ${templateFile} tidak ditemukan!`);
        }

        try {
            const content = fs.readFileSync(templatePath);
            const zip = new PizZip(content);
            const doc = new Docxtemplater(zip, {
                delimiters: { start: '<<', end: '>>' },
                paragraphLoop: true,
                linebreaks: true,
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

            const payload = {
                'nomor_naskah': `470 / ${item.id || 101} / KL-LMP / VIII / 2026`,
                'kp_raw': getKonsumenPenggunaRuns(item.keperluan),
                'KELURAHAN': 'LOMPOE',
                'KECAMATAN': 'BACUKIKI',
                'KOTA': 'PAREPARE',
                'Kota/Kabupaten': 'PAREPARE',

                'Pejabat yang Bertanda Tangan': pejabatNama,
                'Jabatan Pejabat yang Bertanda Tangan': pejabatJabatan,
                'NIP Pejabat yang Bertanda Tangan': pejabatNip,
                'Pangkat Pejabat yang Bertanda Tangan': pejabatPangkat,

                'NAMA PEMOHON': (item.nama_pemohon || item.nama_lengkap || 'Warga Kelurahan Lompoe').toUpperCase(),
                'Nama Pemohon': item.nama_pemohon || item.nama_lengkap || 'Warga Kelurahan Lompoe',
                'nama pemohon': item.nama_pemohon || item.nama_lengkap || 'Warga Kelurahan Lompoe',
                'NIK': item.nik || '7372011205950001',
                'Nik': item.nik || '7372011205950001',

                'TEMPAT/TGL LAHIR': tempatTglLahirVal,
                'Tempat/Tgl Lahir': tempatTglLahirVal,
                'tempat/tgl lahir': tempatTglLahirVal,
                'Tempat/Tgl lahir': tempatTglLahirVal,
                'tempat/tanggal lahir': tempatTglLahirVal,
                'Tempat / Tgl Lahir': tempatTglLahirVal,

                'JENIS KELAMIN': jenisKelaminVal.toUpperCase(),
                'Jenis Kelamin': jenisKelaminVal,
                'jenis kelamin': jenisKelaminVal,
                'Jenis kelamin': jenisKelaminVal,

                'AGAMA': agamaVal.toUpperCase(),
                'Agama': agamaVal,
                'agama': agamaVal,

                'PEKERJAAN': pekerjaanVal.toUpperCase(),
                'Pekerjaan': pekerjaanVal,
                'pekerjaan': pekerjaanVal,

                'ALAMAT': alamatVal,
                'Alamat': alamatVal,
                'alamat': alamatVal,

                'RT': rtVal || '01',
                'RW': rwVal || '01',
                'Kelurahan': 'Lompoe',
                'Kecamatan': 'Bacukiki',
                'Kota/Kab': 'Parepare',
                'acara': item.nama_acara || item.keperluan || 'Kegiatan Syukuran',
                'penggunaan izin': item.keperluan || 'Izin Acara',
                'hari/tanggal acara': item.tanggal_acara || 'Senin, 24 Agustus 2026',
                'waktu acara': '09.00 - Selesai WITA',
                'tempat acara': item.lokasi_acara || alamatVal || 'Kediaman Pemohon',
                'RT tempat acara': rtVal || '01',
                'RW tempat acara': rwVal || '01'
            };

            doc.render(payload);
            const buf = doc.getZip().generate({ type: 'nodebuffer' });

            const safeFilename = encodeURIComponent(`${item.jenis_surat || 'Surat'}_${item.no_resi || noResi}.docx`);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
            return res.status(200).send(buf);

        } catch (err) {
            console.error('Docx generation error:', err);
            return res.status(500).send('Gagal memproses template surat Word.');
        }
    }

    // 1. CEK RESI
    if (url.includes('cek-resi')) {
        let noResi = url.split('cek-resi/')[1] || '';
        noResi = noResi.split('?')[0].trim();

        const found = store.pengajuanList.find(p => (p.no_resi && p.no_resi.trim() === noResi) || (p.nomor_resi && p.nomor_resi.trim() === noResi));
        if (found) return res.status(200).json(found);

        return res.status(200).json({
            id: 1,
            no_resi: noResi || 'LMP-102938',
            nomor_resi: noResi || 'LMP-102938',
            nama_pemohon: 'Pemohon Resi Lompoe',
            nik: '7372011205950001',
            jenis_surat: 'Surat Keterangan Usaha (SKU)',
            rt_rw: 'RW 01 / RT 02',
            telepon: '081234567890',
            no_hp: '081234567890',
            status_rt: 'Disetujui RT/RW',
            status_kelurahan: 'Disetujui/Siap Diambil',
            status: 'Disetujui/Siap Diambil',
            catatan_admin: 'Surat telah selesai diproses dan siap diunduh.',
            file_hasil: `Surat_Pengesahan_Lurah_${noResi || 'LMP-102938'}.pdf`,
            tgl_pengajuan: new Date().toISOString().split('T')[0]
        });
    }

    // 2. CHAT
    if (url.includes('chat')) {
        if (req.method === 'POST') {
            const body = req.body || {};
            const newMessage = {
                id: Date.now(),
                sender: body.sender || 'Warga',
                message: body.message || body.pesan || '',
                time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            };
            store.chatMessages.push(newMessage);
            return res.status(200).json({ success: true, message: 'Pesan berhasil terkirim!', data: newMessage });
        }
        return res.status(200).json(store.chatMessages);
    }

    // 3. PENGAJUAN SURAT (GET / POST / PUT / DELETE)
    if (req.method === 'POST') {
        const body = req.body || {};
        const resi = 'LMP-' + Math.floor(100000 + Math.random() * 900000);
        const tokenRt = 'tok_rt_' + Math.floor(100000 + Math.random() * 900000);
        const todayStr = new Date().toISOString().split('T')[0];
        
        const namaPemohon = body.nama_pemohon || body.nama_lengkap || body.nama || 'Warga Kelurahan Lompoe';
        const nikPemohon = body.nik || '7372011205950001';
        const jenisSurat = body.jenis_surat || 'Surat Keterangan Usaha (SKU)';
        const rtRw = body.rt_rw || 'RW 01 / RT 01';
        const telp = body.no_hp || body.telepon || body.nomor_wa || '081234567890';
        const keperluan = body.keperluan || body.nama_acara || 'Pengurusan Administrasi';
        const berkasStr = body.file_berkas || 'Surat_Pengantar_RT.pdf, KTP_Warga.pdf, KK_Warga.pdf';

        const newItem = {
            id: Date.now(),
            no_resi: resi,
            nomor_resi: resi,
            nama_pemohon: namaPemohon,
            nama_lengkap: namaPemohon,
            nik: nikPemohon,
            tempat_tgl_lahir: body.tempat_tgl_lahir || 'Parepare, 12 Mei 1995',
            jenis_kelamin: body.jenis_kelamin || 'Laki-laki',
            agama: body.agama || 'Islam',
            pekerjaan: body.pekerjaan || 'Wiraswasta',
            alamat: body.alamat || 'Jl. Poros Lompoe',
            jenis_surat: jenisSurat,
            rt_rw: rtRw,
            telepon: telp,
            no_hp: telp,
            nomor_wa: telp,
            keperluan: keperluan,
            nama_acara: body.nama_acara || keperluan,
            tanggal_acara: body.tanggal_acara || 'Senin, 24 Agustus 2026',
            lokasi_acara: body.lokasi_acara || body.alamat || 'Kediaman Pemohon',
            status_rt: 'Disetujui RT/RW',
            status_kelurahan: 'Progres',
            status: 'Progres',
            token_rt: tokenRt,
            tgl_pengajuan: todayStr,
            tanggal_pengajuan: todayStr,
            tanggal: todayStr,
            file_berkas: berkasStr,
            berkas_warga: berkasStr,
            data_json: body.data_json || ''
        };

        store.pengajuanList.unshift(newItem);

        return res.status(200).json({
            success: true,
            message: 'Pengajuan surat berhasil dikirim! Silakan catat nomor resi Anda.',
            no_resi: resi,
            nomor_resi: resi,
            token_rt: tokenRt,
            status_rt: 'Disetujui RT/RW',
            data: newItem
        });
    }

    if (req.method === 'PUT') {
        let resiFromUrl = url.split('pengajuan/')[1] || '';
        resiFromUrl = resiFromUrl.split('?')[0].trim();
        const body = req.body || {};

        const item = store.pengajuanList.find(p => p.no_resi == resiFromUrl || p.id == body.id || p.id == resiFromUrl);
        if (item) {
            if (body.status_kelurahan) item.status_kelurahan = body.status_kelurahan;
            if (body.status_rt) item.status_rt = body.status_rt;
            if (body.status) item.status = body.status;
            if (body.catatan_admin) item.catatan_admin = body.catatan_admin;
            if (body.file_hasil) item.file_hasil = body.file_hasil;
            else if (body.status === 'Disetujui/Siap Diambil' || body.status === 'Selesai') {
                item.file_hasil = `Surat_Pengesahan_Lurah_${item.no_resi}.pdf`;
            }
        }
        return res.status(200).json({ success: true, message: 'Status pengajuan berhasil diperbarui!', data: item });
    }

    if (req.method === 'DELETE') {
        let resiFromUrl = url.split('pengajuan/')[1] || '';
        resiFromUrl = resiFromUrl.split('?')[0].trim();
        store.pengajuanList = store.pengajuanList.filter(p => p.no_resi != resiFromUrl && p.id != resiFromUrl);
        return res.status(200).json({ success: true, message: 'Pengajuan berhasil dihapus!' });
    }

    return res.status(200).json(store.pengajuanList);
};