const store = require('./_store.js');

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const url = req.url || '';

    if (url.includes('aparatur')) return res.status(200).json(store.aparatur);
    if (url.includes('pkk-wilayah')) return res.status(200).json(store.pkk);
    if (url.includes('berita')) return res.status(200).json(store.berita);
    if (url.includes('sarana')) return res.status(200).json(store.sarana);
    if (url.includes('nomor-darurat')) return res.status(200).json(store.nomor_darurat);
    if (url.includes('kontak-rt')) return res.status(200).json(store.kontak_rt);
    if (url.includes('statistik')) return res.status(200).json(store.statistik);
    if (url.includes('info')) return res.status(200).json(store.info);

    return res.status(200).json({ success: true, data: store });
};