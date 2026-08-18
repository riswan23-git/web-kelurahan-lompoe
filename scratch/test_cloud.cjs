const https = require('https');

function testPost() {
    return new Promise((resolve, reject) => {
        const req = https.request('https://kvdb.io', { method: 'POST' }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data.trim()));
        });
        req.on('error', reject);
        req.end();
    });
}

testPost().then(console.log).catch(console.error);
