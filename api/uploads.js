module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const url = req.url || '';
    let rawFile = url.split('/').pop() || 'Dokumen.pdf';
    rawFile = rawFile.split('?')[0].split('&')[0].trim();
    try { rawFile = decodeURIComponent(rawFile); } catch (e) {}

    const docHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Surat Pengesahan & Berkas Lampiran - ${rawFile}</title>
<style>
body { font-family: 'Times New Roman', serif; margin: 40px; color: #000; line-height: 1.6; }
.header { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; }
.header h3 { margin: 0; font-size: 14pt; font-weight: bold; }
.header h2 { margin: 0; font-size: 16pt; font-weight: bold; }
.title { text-align: center; margin: 20px 0; }
.title h4 { margin: 0; text-decoration: underline; text-transform: uppercase; }
.content { font-size: 12pt; text-align: justify; }
.stamp { border: 2px solid #198754; padding: 12px; display: inline-block; margin-top: 25px; color: #198754; font-weight: bold; border-radius: 6px; }
.signature { float: right; text-align: center; width: 260px; margin-top: 40px; }
</style>
</head>
<body>
<div class="header">
  <h3>PEMERINTAH KOTA PAREPARE</h3>
  <h2>KECAMATAN BACUKIKI - KELURAHAN LOMPOE</h2>
  <p>Alamat: Jl. Poros Lompoe, Kec. Bacukiki, Kota Parepare, Sulsel 91125</p>
</div>
<div class="title">
  <h4>SURAT PENGESAHAN & PRATINJAU BERKAS RESMI</h4>
  <p>Nama Berkas: <strong>${rawFile}</strong></p>
</div>
<div class="content">
  <p>Dengan ini menerangkan bahwa permohonan naskah surat dan berkas lampiran warga dengan nama dokumen <strong>${rawFile}</strong> telah selesai diverifikasi, disetujui, dan ditandatangani secara resmi oleh Lurah Lompoe.</p>
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
    return res.status(200).send(docHtml);
};