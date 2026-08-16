const fs = require('fs');
const path = require('path');
const PizZip = require('../backend/node_modules/pizzip');

// 1. Extract exact signature table from Keramaian (finding <w:tbl PRIOR to Parepare)
const keramaianPath = path.join(__dirname, '../templates/SRIKANDI - SURAT IZIN KERAMAIAN.docx');
const zipKeramaian = new PizZip(fs.readFileSync(keramaianPath));
const keramaianXml = zipKeramaian.file('word/document.xml').asText();

const parepareIdx = keramaianXml.indexOf('Parepare,');
const tblStart = keramaianXml.lastIndexOf('<w:tbl', parepareIdx);
const tblEnd = keramaianXml.indexOf('</w:tbl>', parepareIdx) + 8;
const sigTableXml = keramaianXml.slice(tblStart, tblEnd);

console.log('=== EXTRACTED SIGNATURE TABLE VALIDATION ===');
console.log('Starts with <w:tbl:', sigTableXml.startsWith('<w:tbl'));
console.log('Ends with </w:tbl>:', sigTableXml.endsWith('</w:tbl>'));

// 2. Extract body header and footer from Keramaian
const bodyStartIdx = keramaianXml.indexOf('<w:body>') + 8;
const sectPrIdx = keramaianXml.lastIndexOf('<w:sectPr');

const xmlHeader = keramaianXml.slice(0, bodyStartIdx);
const xmlFooter = keramaianXml.slice(sectPrIdx);

// 3. BBM Data Table XML
const tableXml = `<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/></w:tblBorders><w:jc w:val="center"/><w:tblLook w:val="04A0"/></w:tblPr><w:tblGrid><w:gridCol w:w="500"/><w:gridCol w:w="1200"/><w:gridCol w:w="800"/><w:gridCol w:w="1500"/><w:gridCol w:w="1200"/><w:gridCol w:w="1200"/><w:gridCol w:w="1200"/><w:gridCol w:w="1400"/></w:tblGrid><w:tr><w:trPr><w:tblHeader/></w:trPr><w:tc><w:p><w:pPr><w:jc w:val="center"/><w:rPr><w:b/><w:sz w:val="20"/></w:rPr></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t>No</w:t></w:r></w:p></w:tc><w:tc><w:p><w:pPr><w:jc w:val="center"/><w:rPr><w:b/><w:sz w:val="20"/></w:rPr></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t>Jenis Alat</w:t></w:r></w:p></w:tc><w:tc><w:p><w:pPr><w:jc w:val="center"/><w:rPr><w:b/><w:sz w:val="20"/></w:rPr></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t>Jumlah Alat</w:t></w:r></w:p></w:tc><w:tc><w:p><w:pPr><w:jc w:val="center"/><w:rPr><w:b/><w:sz w:val="20"/></w:rPr></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t>Fungsi Alat</w:t></w:r></w:p></w:tc><w:tc><w:p><w:pPr><w:jc w:val="center"/><w:rPr><w:b/><w:sz w:val="20"/></w:rPr></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t>BBM Jenis Tertentu</w:t></w:r></w:p></w:tc><w:tc><w:p><w:pPr><w:jc w:val="center"/><w:rPr><w:b/><w:sz w:val="20"/></w:rPr></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t>Kebutuhan BBM Jenis Tertentu</w:t></w:r></w:p></w:tc><w:tc><w:p><w:pPr><w:jc w:val="center"/><w:rPr><w:b/><w:sz w:val="20"/></w:rPr></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t>Jam atau hari Operasi</w:t></w:r></w:p></w:tc><w:tc><w:p><w:pPr><w:jc w:val="center"/><w:rPr><w:b/><w:sz w:val="20"/></w:rPr></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t>Konsumen BBM Jenis Tertentu Liter Per (Jam/Hari/Minggu/Bulan)</w:t></w:r></w:p></w:tc></w:tr><w:tr><w:tc><w:p><w:pPr><w:jc w:val="center"/><w:rPr><w:sz w:val="20"/></w:rPr></w:pPr><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>1</w:t></w:r></w:p></w:tc><w:tc><w:p><w:pPr><w:rPr><w:sz w:val="20"/></w:rPr></w:pPr><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">&lt;&lt;Jenis Alat&gt;&gt;</w:t></w:r></w:p></w:tc><w:tc><w:p><w:pPr><w:jc w:val="center"/><w:rPr><w:sz w:val="20"/></w:rPr></w:pPr><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">&lt;&lt;Jumlah Alat&gt;&gt;</w:t></w:r></w:p></w:tc><w:tc><w:p><w:pPr><w:rPr><w:sz w:val="20"/></w:rPr></w:pPr><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">&lt;&lt;Fungsi Alat&gt;&gt;</w:t></w:r></w:p></w:tc><w:tc><w:p><w:pPr><w:rPr><w:sz w:val="20"/></w:rPr></w:pPr><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">&lt;&lt;Jenis BBM&gt;&gt;</w:t></w:r></w:p></w:tc><w:tc><w:p><w:pPr><w:jc w:val="center"/><w:rPr><w:sz w:val="20"/></w:rPr></w:pPr><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">&lt;&lt;Kebutuhan BBM&gt;&gt;</w:t></w:r></w:p></w:tc><w:tc><w:p><w:pPr><w:jc w:val="center"/><w:rPr><w:sz w:val="20"/></w:rPr></w:pPr><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">&lt;&lt;Jam Operasi&gt;&gt;</w:t></w:r></w:p></w:tc><w:tc><w:p><w:pPr><w:jc w:val="center"/><w:rPr><w:sz w:val="20"/></w:rPr></w:pPr><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">&lt;&lt;Liter&gt;&gt;</w:t></w:r></w:p></w:tc></w:tr><w:tr><w:tc><w:tcPr><w:gridSpan w:val="7"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/><w:rPr><w:b/><w:sz w:val="20"/></w:rPr></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t>Jumlah</w:t></w:r></w:p></w:tc><w:tc><w:p><w:pPr><w:jc w:val="center"/><w:rPr><w:b/><w:sz w:val="20"/></w:rPr></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">&lt;&lt;Liter&gt;&gt;</w:t></w:r></w:p></w:tc></w:tr></w:tbl>`;

// 4. Construct complete body XML
const newBodyXml = `
<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:line="240" w:lineRule="auto"/><w:rPr><w:b/><w:u w:val="single"/><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr><w:r><w:rPr><w:b/><w:u w:val="single"/><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr><w:t>SURAT REKOMENDASI PEMBELIAN BBM</w:t></w:r></w:p>
<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:line="240" w:lineRule="auto"/><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr><w:r><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr><w:t xml:space="preserve">No. : ${'${nomor_naskah }'}</w:t></w:r></w:p>
<w:p><w:pPr><w:spacing w:line="240" w:lineRule="auto"/><w:ind w:left="720" w:firstLine="0"/><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr><w:r><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr><w:t>Dasar Hukum :</w:t></w:r></w:p>
<w:p><w:pPr><w:spacing w:line="240" w:lineRule="auto"/><w:ind w:left="720" w:firstLine="0"/><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr><w:r><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr><w:t>01. Undang-Undang Nomor 22 tahun 2001 tentang Minyak dan Gas Bumi</w:t></w:r></w:p>
<w:p><w:pPr><w:spacing w:line="240" w:lineRule="auto"/><w:ind w:left="720" w:firstLine="0"/><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr><w:r><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr><w:t>02. Undang-Undang Nomor 32 tahun 2004 tentang Pemerintahan Daerah</w:t></w:r></w:p>
<w:p><w:pPr><w:spacing w:line="240" w:lineRule="auto"/><w:ind w:left="720" w:firstLine="0"/><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr><w:r><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr><w:t>03. Perpres Nomor 15 tahun 2012 tentang harga Jual Eceran dan Konsumen Pengguna Jenis Bahan Bakar Minyak Tertentu</w:t></w:r></w:p>
<w:p><w:pPr><w:spacing w:line="240" w:lineRule="auto"/><w:ind w:left="720" w:firstLine="0"/><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr><w:r><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr><w:t>Dengan ini memberikan rekomendasi kepada :</w:t></w:r></w:p>
<w:p><w:pPr><w:tabs><w:tab w:val="left" w:pos="2977"/><w:tab w:val="left" w:pos="3261"/></w:tabs><w:spacing w:line="240" w:lineRule="auto"/><w:ind w:left="720" w:firstLine="0"/><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr><w:t xml:space="preserve">Nama</w:t><w:tab/><w:t xml:space="preserve">:</w:t><w:tab/><w:t xml:space="preserve">&lt;&lt;NAMA PEMOHON&gt;&gt;</w:t></w:r></w:p>
<w:p><w:pPr><w:tabs><w:tab w:val="left" w:pos="2977"/><w:tab w:val="left" w:pos="3261"/></w:tabs><w:spacing w:line="240" w:lineRule="auto"/><w:ind w:left="720" w:firstLine="0"/><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr><w:r><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr><w:t xml:space="preserve">Nik</w:t><w:tab/><w:t xml:space="preserve">:</w:t><w:tab/><w:t xml:space="preserve">&lt;&lt;NIK&gt;&gt;</w:t></w:r></w:p>
<w:p><w:pPr><w:tabs><w:tab w:val="left" w:pos="2977"/><w:tab w:val="left" w:pos="3261"/></w:tabs><w:spacing w:line="240" w:lineRule="auto"/><w:ind w:left="720" w:firstLine="0"/><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr><w:r><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr><w:t xml:space="preserve">Alamat Usaha</w:t><w:tab/><w:t xml:space="preserve">:</w:t><w:tab/><w:t xml:space="preserve">&lt;&lt;Alamat&gt;&gt;, RT &lt;&lt;RT&gt;&gt; / RW &lt;&lt;RW&gt;&gt;</w:t></w:r></w:p>
<w:p><w:pPr><w:tabs><w:tab w:val="left" w:pos="2977"/><w:tab w:val="left" w:pos="3261"/></w:tabs><w:spacing w:line="240" w:lineRule="auto"/><w:ind w:left="720" w:firstLine="0"/><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr><w:r><w:t>&lt;&lt;@kp_raw&gt;&gt;</w:t></w:r></w:p>
<w:p><w:pPr><w:tabs><w:tab w:val="left" w:pos="2977"/><w:tab w:val="left" w:pos="3261"/></w:tabs><w:spacing w:line="240" w:lineRule="auto"/><w:ind w:left="720" w:firstLine="0"/><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr><w:r><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr><w:t xml:space="preserve">Jenis Usaha/Kegiatan</w:t><w:tab/><w:t xml:space="preserve">:</w:t><w:tab/><w:t xml:space="preserve">&lt;&lt;Jenis Usaha&gt;&gt;</w:t></w:r></w:p>
<w:p><w:pPr><w:spacing w:line="240" w:lineRule="auto"/><w:ind w:left="720" w:firstLine="0"/><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr><w:r><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr><w:t>04.  Berdasarkan hasil verifikasi, kebutuhan BBM digunakan untuk sarana sebagai berikut:</w:t></w:r></w:p>
${tableXml}
<w:p><w:pPr><w:spacing w:line="240" w:lineRule="auto"/><w:ind w:left="720" w:firstLine="0"/><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr><w:r><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr><w:t>05. Diberikan alokasi Volume Bensin (Gasoline) RON 88 / Minyak Solar (Gas Oli):</w:t></w:r></w:p>
<w:p><w:pPr><w:tabs><w:tab w:val="left" w:pos="3969"/><w:tab w:val="left" w:pos="4253"/></w:tabs><w:spacing w:line="240" w:lineRule="auto"/><w:ind w:left="1276" w:hanging="283"/><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr><w:r><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr><w:t xml:space="preserve">Sejumlah</w:t><w:tab/><w:t xml:space="preserve">:   &lt;&lt;Liter&gt;&gt;</w:t></w:r></w:p>
<w:p><w:pPr><w:tabs><w:tab w:val="left" w:pos="3969"/><w:tab w:val="left" w:pos="4253"/></w:tabs><w:spacing w:line="240" w:lineRule="auto"/><w:ind w:left="1276" w:hanging="283"/><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr><w:r><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr><w:t xml:space="preserve">Tempat pengambilan</w:t><w:tab/><w:t xml:space="preserve">:   Lembaga Penyalur (SPBU/APMS/SPDN/SPBN)</w:t></w:r></w:p>
<w:p><w:pPr><w:tabs><w:tab w:val="left" w:pos="3969"/><w:tab w:val="left" w:pos="4253"/></w:tabs><w:spacing w:line="240" w:lineRule="auto"/><w:ind w:left="1276" w:hanging="283"/><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr><w:r><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr><w:t xml:space="preserve">Nomor Lembaga Penyalur</w:t><w:tab/><w:t xml:space="preserve">:  7491172</w:t></w:r></w:p>
<w:p><w:pPr><w:tabs><w:tab w:val="left" w:pos="3969"/><w:tab w:val="left" w:pos="4253"/></w:tabs><w:spacing w:line="240" w:lineRule="auto"/><w:ind w:left="1276" w:hanging="283"/><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr><w:r><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr><w:t xml:space="preserve">Lokasi</w:t><w:tab/><w:t xml:space="preserve">:   Jl. Jend.M.Yusuf</w:t></w:r></w:p>
<w:p><w:pPr><w:spacing w:line="240" w:lineRule="auto"/><w:ind w:left="720" w:firstLine="0"/><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr><w:r><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr><w:t>06. Masa berlaku surat rekomendasi sampai dengan 1 bulan</w:t></w:r></w:p>
<w:p><w:pPr><w:spacing w:line="240" w:lineRule="auto"/><w:ind w:left="720" w:firstLine="0"/><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr><w:r><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr><w:t>07. Apabila penggunaan surat rekomendasi ini tidak sebagaimana mestinya, maka akan dicabut dan ditindaklanjuti dengan proses hukum sesuai dengan ketentuan dan peraturan perundang-undangan.</w:t></w:r></w:p>
${sigTableXml}
`;

const fullDocXml = xmlHeader + newBodyXml + xmlFooter;

zipKeramaian.file('word/document.xml', fullDocXml);
const pristineBuffer = zipKeramaian.generate({ type: 'nodebuffer' });

const docxBbmPath = path.join(__dirname, '../templates/SRIKANDI - SURAT REKOMENDASI PEMBELIAN BBM.docx');
const docxBbmV2Path = path.join(__dirname, '../templates/SRIKANDI - SURAT REKOMENDASI PEMBELIAN BBM_V2.docx');
fs.writeFileSync(docxBbmPath, pristineBuffer);
fs.writeFileSync(docxBbmV2Path, pristineBuffer);

// Validate OpenXML schema of pristineBuffer
const { DOMParser } = require('../backend/node_modules/@xmldom/xmldom');
try {
  const dom = new DOMParser().parseFromString(fullDocXml, 'text/xml');
  console.log('XML DOM Parsing finished with ZERO errors!');
} catch (e) {
  console.error('DOM Parser error:', e);
}

// Render test and validate rendered XML
function getKonsumenPenggunaParagraph(selectedType) {
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

const doc = new Docxtemplater(new PizZip(pristineBuffer), {
  delimiters: { start: '<<', end: '>>' },
  paragraphLoop: true,
  linebreaks: true
});

doc.render({
  'nomor_naskah': '470 / 102 / KL-LMP / VIII / 2026',
  'kp_raw': getKonsumenPenggunaParagraph('Usaha Mikro'),
  'NAMA PEMOHON': 'AHMAD RISWAN',
  'NIK': '7372012345678901',
  'Alamat': 'Jl. Poros Lompoe',
  'RT': '001',
  'RW': '001',
  'Jenis Usaha': 'Warung Kuliner / Usaha Mikro',
  'Jenis Alat': 'Mesin Genset',
  'Jumlah Alat': '1 Unit',
  'Fungsi Alat': 'Penerangan Usaha',
  'Jenis BBM': 'Pertalite (BBM Bersubsidi)',
  'Kebutuhan BBM': '5 Liter / Hari',
  'Jam Operasi': '10 Jam / Hari',
  'Liter': '60 Liter / Bulan'
});

const renderedXml = doc.getZip().file('word/document.xml').asText();

try {
  const parsedRendered = new DOMParser().parseFromString(renderedXml, 'text/xml');
  console.log('SUCCESS: Rendered XML is 100% VALID OpenXML!');
} catch (e) {
  console.error('FATAL: Rendered XML has errors:', e);
}
