const fs = require('fs');
const path = require('path');

const formWargaPath = path.join(__dirname, '..', 'src', 'FormWarga.jsx');
let formWargaCode = fs.readFileSync(formWargaPath, 'utf8');

const oldPayloadDef = `    const payload = {
      ...formData,
      ...extraData,
      no_hp: userTelp,
      telepon: userTelp,
      nomor_wa: userTelp,
      nama_pemohon: formData.nama_pemohon || 'Warga Kelurahan Lompoe',
      nik: formData.nik || '7372011205950001',
      tempat_tgl_lahir: formData.tempat_tgl_lahir || extraData.tempat_tgl_lahir || 'Parepare, 12 Mei 1995',
      jenis_kelamin: formData.jenis_kelamin || extraData.jenis_kelamin || 'Laki-laki',
      agama: formData.agama || extraData.agama || 'Islam',
      pekerjaan: formData.pekerjaan || extraData.pekerjaan || 'Wiraswasta',
      alamat: formData.alamat || extraData.alamat || 'Jl. Poros Lompoe',
      rt_rw: formData.rt_rw || 'RW 01 / RT 01',
      jenis_surat: formData.jenis_surat || 'Surat Keterangan Usaha (SKU)',
      keperluan: formData.keperluan || extraData.keperluan || extraData.nama_acara || 'Pengurusan Administrasi',
      nama_acara: extraData.nama_acara || formData.keperluan || 'Kegiatan Kemasyarakatan',
      tanggal_acara: extraData.tanggal_acara || 'Senin, 24 Agustus 2026',
      lokasi_acara: extraData.lokasi_acara || formData.alamat || 'Kediaman Pemohon',
      file_berkas: fileNames.join(', '),
      file_data_map: fileDataMap,
      data_json: JSON.stringify(extraData)
    };`;

const newPayloadDef = `    const payload = {
      ...formData,
      ...extraData,
      no_hp: userTelp,
      telepon: userTelp,
      nomor_wa: userTelp,
      nama_pemohon: formData.nama_pemohon || 'Warga Kelurahan Lompoe',
      nik: formData.nik || '7372011205950001',
      tempat_tgl_lahir: formData.tempat_tgl_lahir || extraData.tempat_tgl_lahir || 'Parepare, 12 Mei 1995',
      jenis_kelamin: formData.jenis_kelamin || extraData.jenis_kelamin || 'Laki-laki',
      agama: formData.agama || extraData.agama || 'Islam',
      pekerjaan: formData.pekerjaan || extraData.pekerjaan || 'Wiraswasta',
      alamat: formData.alamat || extraData.alamat || 'Jl. Poros Lompoe',
      rt_rw: formData.rt_rw || 'RW 01 / RT 01',
      jenis_surat: formData.jenis_surat || 'Surat Keterangan Usaha (SKU)',
      keperluan: formData.keperluan || extraData.keperluan || extraData.nama_acara || 'Pengurusan Administrasi',
      nama_acara: extraData.nama_acara || formData.keperluan || 'Kegiatan Kemasyarakatan',
      tanggal_acara: extraData.tanggal_acara || 'Senin, 24 Agustus 2026',
      lokasi_acara: extraData.lokasi_acara || formData.alamat || 'Kediaman Pemohon',
      file_berkas: fileNames.join(', '),
      data_json: JSON.stringify(extraData)
    };`;

if (formWargaCode.includes(oldPayloadDef)) {
    formWargaCode = formWargaCode.replace(oldPayloadDef, newPayloadDef);
    fs.writeFileSync(formWargaPath, formWargaCode, 'utf8');
    console.log('Successfully updated FormWarga.jsx HTTP payload optimization!');
}
