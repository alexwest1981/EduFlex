const https = require('http'); // HTTP since backend is on 8080 local
const req = https.request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
}, (res) => {
    let rawData = '';
    res.on('data', (chunk) => rawData += chunk);
    res.on('end', () => {
        const loginData = JSON.parse(rawData);
        const gapReq = https.request({
            hostname: 'localhost',
            port: 8080,
            path: '/api/skills/gap',
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + loginData.token }
        }, (gapRes) => {
            let gapRaw = '';
            gapRes.on('data', (chunk) => gapRaw += chunk);
            gapRes.on('end', () => console.log(gapRaw));
        });
        gapReq.end();
    });
});
req.write(JSON.stringify({ username: 'nilnil', password: '123' }));
req.end();
