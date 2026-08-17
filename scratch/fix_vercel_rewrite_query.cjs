const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const apiDir = path.join(rootDir, 'api');

// 1. Update vercel.json rewrites with explicit query parameter
const vercelJsonPath = path.join(rootDir, 'vercel.json');
const vercelConfig = {
  "rewrites": [
    { "source": "/uploads/:path*", "destination": "/api/layanan?file_action=uploads&file_name=:path*" },
    { "source": "/uploads", "destination": "/api/layanan?file_action=uploads" },
    { "source": "/api/uploads/:path*", "destination": "/api/layanan?file_action=uploads&file_name=:path*" },
    { "source": "/api/uploads", "destination": "/api/layanan?file_action=uploads" },
    { "source": "/api/download-surat-selesai/:path*", "destination": "/api/layanan?file_action=download&file_name=:path*" },
    { "source": "/api/download-surat-selesai", "destination": "/api/layanan?file_action=download" },
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
console.log('Successfully updated vercel.json rewrites!');

// 2. Update api/layanan.js to check file_action query parameter
const layananPath = path.join(apiDir, 'layanan.js');
let layananCode = fs.readFileSync(layananPath, 'utf8');

const oldCheckSnippet = `    if (url.includes('uploads') || url.includes('download-surat-selesai')) {
        const urlParts = url.split('/');
        let rawFile = urlParts[urlParts.length - 1] || '';
        rawFile = rawFile.split('?')[0].trim();
        try { rawFile = decodeURIComponent(rawFile); } catch (e) {}`;

const newCheckSnippet = `    if (url.includes('uploads') || url.includes('download-surat-selesai') || (req.query && req.query.file_action)) {
        let rawFile = req.query?.file_name || url.split('/').pop() || '';
        rawFile = rawFile.split('?')[0].trim();
        try { rawFile = decodeURIComponent(rawFile); } catch (e) {}`;

if (layananCode.includes(oldCheckSnippet)) {
    layananCode = layananCode.replace(oldCheckSnippet, newCheckSnippet);
    fs.writeFileSync(layananPath, layananCode, 'utf8');
    console.log('Successfully updated api/layanan.js check snippet!');
}
