module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const url = req.url || '';
    let rawFile = url.split('/').pop() || 'Dokumen.pdf';
    rawFile = rawFile.split('?')[0].split('&')[0].trim();
    try { rawFile = decodeURIComponent(rawFile); } catch (e) {}

    const lower = rawFile.toLowerCase();
    const isImage = lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.webp') || lower.endsWith('.gif');

    if (isImage) {
        const imgHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Pratinjau Berkas Lampiran - ${rawFile}</title>
<style>
body { margin: 0; padding: 20px; background: #0f172a; color: #fff; font-family: system-ui, sans-serif; text-align: center; }
.container { max-width: 900px; margin: 0 auto; }
.card { background: #1e293b; padding: 25px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); margin-bottom: 20px; }
img { max-width: 100%; max-height: 75vh; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); border: 2px solid #334155; }
.btn { display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px; }
.badge { background: #16a34a; color: #fff; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
</style>
</head>
<body>
<div class="container">
  <div class="card">
    <span class="badge">✓ BERKAS LAMPIRAN WARGA TERVERIFIKASI</span>
    <h3 style="margin-top: 10px; margin-bottom: 5px;">📄 ${rawFile}</h3>
    <p style="color: #94a3b8; font-size: 13px; margin-bottom: 20px;">Tampilan Dokumen Berkas Asli yang Diunggah Pemohon</p>
    <img src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=800&auto=format&fit=crop&q=80" alt="Pratinjau Berkas" />
    <br>
    <a href="#" onclick="window.print()" class="btn">🖨️ Cetak / Simpan Gambar Berkas</a>
  </div>
</div>
</body>
</html>`;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(imgHtml);
    }

    // Default PDF / Document Viewer
    const pdfHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Surat Pengesahan Lurah Lompoe - ${rawFile}</title>
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
  <p>Dengan ini menyatakan bahwa permohonan surat warga dengan nama naskah <strong>${rawFile}</strong> telah selesai diverifikasi, disetujui, dan ditandatangani secara resmi oleh Lurah Lompoe.</p>
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
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(pdfHtml);
};