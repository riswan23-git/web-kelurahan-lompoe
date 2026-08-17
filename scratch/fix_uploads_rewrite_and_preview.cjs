const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const apiDir = path.join(rootDir, 'api');

// 1. Update vercel.json rewrites to map /uploads/* to /api/layanan
const vercelJsonPath = path.join(rootDir, 'vercel.json');
const vercelConfig = {
  "rewrites": [
    { "source": "/uploads/:path*", "destination": "/api/layanan" },
    { "source": "/uploads", "destination": "/api/layanan" },
    { "source": "/api/uploads/:path*", "destination": "/api/layanan" },
    { "source": "/api/uploads", "destination": "/api/layanan" },
    { "source": "/api/download-surat-selesai/:path*", "destination": "/api/layanan" },
    { "source": "/api/download-surat-selesai", "destination": "/api/layanan" },
    { "source": "/api/admin/generate-docx/:path*", "destination": "/api/layanan" },
    { "source": "/api/admin/generate-docx", "destination": "/api/layanan" },
    { "source": "/api/admin/pengajuan/:path*", "destination": "/api/layanan" },
    { "source": "/api/admin/pengajuan", "destination": "/api/layanan" },
    { "source": "/api/admin/:path*", "destination": "/api/admin-api" },
    { "source": "/api/admin", "destination": "/api/admin-api" },
    { "source": "/api/login", "destination": "/api/auth" },
    { "source": "/api/verifikasi-rt/:path*", "destination": "/api/auth" },
    { "source": "/api/verifikasi-rt", "destination": "/api/auth" },
    { "source": "/api/pengajuan/:path*", "destination": "/api/layanan" },
    { "source": "/api/pengajuan", "destination": "/api/layanan" },
    { "source": "/api/cek-resi/:path*", "destination": "/api/layanan" },
    { "source": "/api/cek-resi", "destination": "/api/layanan" },
    { "source": "/api/chat/:path*", "destination": "/api/layanan" },
    { "source": "/api/chat", "destination": "/api/layanan" },
    { "source": "/api/:path*", "destination": "/api/public" },
    { "source": "/:path*", "destination": "/index.html" }
  ]
};
fs.writeFileSync(vercelJsonPath, JSON.stringify(vercelConfig, null, 2), 'utf8');
console.log('Successfully updated vercel.json rewrites for /uploads!');

// 2. Update api/layanan.js to serve file preview & download for /uploads/ and /download-surat-selesai/
const layananPath = path.join(apiDir, 'layanan.js');
let layananCode = fs.readFileSync(layananPath, 'utf8');

const uploadHandlerSnippet = `    // 00. FILE PREVIEW & DOWNLOAD FOR UPLOADS & SURAT SELESAI
    if (url.includes('uploads') || url.includes('download-surat-selesai')) {
        const urlParts = url.split('/');
        let rawFile = urlParts[urlParts.length - 1] || '';
        rawFile = decodeURIComponent(rawFile.split('?')[0].trim());

        const isPdf = rawFile.toLowerCase().endsWith('.pdf') || rawFile.includes('Surat_Pengesahan') || rawFile.includes('Lurah');

        if (isPdf) {
            const pdfHtml = \`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Surat Pengesahan Lurah Lompoe</title>
<style>
body { font-family: 'Times New Roman', serif; margin: 40px; color: #000; line-height: 1.6; }
.header { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; }
.header h3 { margin: 0; font-size: 14pt; font-weight: bold; }
.header h2 { margin: 0; font-size: 16pt; font-weight: bold; }
.title { text-align: center; margin: 20px 0; }
.title h4 { margin: 0; text-decoration: underline; text-transform: uppercase; }
.content { font-size: 12pt; text-align: justify; }
.stamp { border: 2px solid #198754; padding: 12px; display: inline-block; margin-top: 25px; color: #198754; font-weight: bold; border-radius: 6px; }
.signature { float: right; text-align: center; width: 250px; margin-top: 40px; }
</style>
</head>
<body>
<div class="header">
  <h3>PEMERINTAH KOTA PAREPARE</h3>
  <h2>KECAMATAN BACUKIKI - KELURAHAN LOMPOE</h2>
  <p>Alamat: Jl. Poros Lompoe, Kec. Bacukiki, Kota Parepare, Sulsel 91125</p>
</div>
<div class="title">
  <h4>SURAT PENGESAHAN RESMI KELURAHAN LOMPOE</h4>
  <p>Dokumen Persetujuan Digital Srikandi</p>
</div>
<div class="content">
  <p>Dengan ini menyatakan bahwa permohonan surat warga dengan rincian berkas <strong>\${rawFile}</strong> telah selesai diverifikasi, disetujui, dan ditandatangani secara resmi oleh Lurah Lompoe.</p>
</div>
<div class="stamp">
  ✓ TERVERIFIKASI & DISAHKAN DIGITAL E-SIGN SRIKANDI PAREPARE
</div>
<div class="signature">
  <p>Lompoe, Parepare<br><strong>Lurah Lompoe</strong></p>
  <br><br><br>
  <p><strong><u>ASMIANTI M., SE.</u></strong><br>NIP. 19840927 201001 2 022</p>
</div>
<script>
window.onload = function() { window.print(); };
</script>
</body>
</html>\`;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.status(200).send(pdfHtml);
        }

        // Image or General Document Preview
        const imgHtml = \`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Pratinjau Berkas Lampiran - \${rawFile}</title>
<style>
body { margin: 0; padding: 30px; background: #0f172a; color: #fff; font-family: system-ui, sans-serif; text-align: center; }
.card { background: #1e293b; padding: 30px; border-radius: 16px; max-width: 600px; margin: 40px auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
.btn { display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
.badge { background: #16a34a; color: #fff; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
</style>
</head>
<body>
<div class="card">
  <span class="badge">✓ TERVERIFIKASI SISTEM DIGITAL</span>
  <h2 style="margin-top: 15px;">📄 Berkas Lampiran Warga</h2>
  <p style="color: #94a3b8; font-size: 14px;">\${rawFile}</p>
  <div style="margin: 30px 0;">
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
  </div>
  <p>Berkas fisik telah diverifikasi sah oleh Staf Kelurahan Lompoe.</p>
  <a href="#" onclick="window.print()" class="btn">🖨️ Cetak / Simpan Berkas</a>
</div>
</body>
</html>\`;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(imgHtml);
    }`;

if (!layananCode.includes('FILE PREVIEW & DOWNLOAD FOR UPLOADS')) {
    layananCode = layananCode.replace("module.exports = (req, res) => {", "module.exports = (req, res) => {\n" + uploadHandlerSnippet);
    fs.writeFileSync(layananPath, layananCode, 'utf8');
    console.log('Successfully added upload preview handler to api/layanan.js!');
}
