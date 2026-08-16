let chatMessages = [
    { id: 1, sender: 'Warga', message: 'Halo admin, mau tanya jam operasional loket?', time: '09:00' },
    { id: 2, sender: 'Staf Kelurahan', message: 'Halo! Jam pelayanan loket kami dari pukul 08.00 - 16.00 WITA.', time: '09:02' }
];

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'POST') {
        const body = req.body || {};
        const newMessage = {
            id: Date.now(),
            sender: body.sender || 'Warga',
            message: body.message || body.pesan || '',
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        };
        chatMessages.push(newMessage);
        return res.status(200).json({ success: true, message: 'Pesan berhasil terkirim!', data: newMessage });
    }

    return res.status(200).json(chatMessages);
};
