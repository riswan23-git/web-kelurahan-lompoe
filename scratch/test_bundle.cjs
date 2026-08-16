const https = require('https');

function get(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
        }).on('error', reject);
    });
}

async function test() {
    console.log('Fetching homepage HTML...');
    const htmlRes = await get('https://web-kelurahan-lompoe.vercel.app/');
    console.log('HTML Status:', htmlRes.status);
    
    // Find JS asset link in HTML
    const jsMatch = htmlRes.data.match(/src="(\/assets\/[^"]+\.js)"/);
    const cssMatch = htmlRes.data.match(/href="(\/assets\/[^"]+\.css)"/);
    
    if (jsMatch) {
        const jsUrl = 'https://web-kelurahan-lompoe.vercel.app' + jsMatch[1];
        console.log('Fetching JS Asset:', jsUrl);
        const jsRes = await get(jsUrl);
        console.log('JS Status:', jsRes.status, 'JS Length:', jsRes.data.length);
    } else {
        console.log('No JS match found in HTML:', htmlRes.data.slice(0, 300));
    }

    if (cssMatch) {
        const cssUrl = 'https://web-kelurahan-lompoe.vercel.app' + cssMatch[1];
        console.log('Fetching CSS Asset:', cssUrl);
        const cssRes = await get(cssUrl);
        console.log('CSS Status:', cssRes.status, 'CSS Length:', cssRes.data.length);
    }
}

test();
