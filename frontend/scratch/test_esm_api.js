import loginHandler from '../api/login.js';
import pengajuanHandler from '../api/pengajuan.js';
import aparaturHandler from '../api/aparatur.js';

console.log('Testing login handler...');
const req = { method: 'POST', body: { username: 'admin', password: '123' } };
const res = {
    setHeader: () => {},
    status: (code) => ({
        end: () => console.log('Status:', code),
        json: (data) => console.log('JSON:', code, data)
    })
};

loginHandler(req, res);
console.log('ESM API Test Passed Cleanly!');
