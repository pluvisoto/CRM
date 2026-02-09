
import https from 'https';

const API_KEY = 'um__bKMaV_bnHPJcM_gWrA4dZ2xMOZA-8dvTNxvfnrJJx6mNJqNbWYAWMjZkoAvT';
const ACCOUNT_ID = '101a4099944872b300c6ac802284';
const HOST = 'api.assinafy.com.br';
const PATH = `/v1/accounts/${ACCOUNT_ID}/documents`;

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';

function testConnection() {
    return new Promise((resolve) => {
        const options = {
            hostname: HOST,
            port: 443,
            path: PATH,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Accept': 'application/json'
            }
        };

        const body =
            `--${boundary}\r
Content-Disposition: form-data; name="file"; filename="test_final.txt"\r
Content-Type: text/plain\r
\r
dummy content for final test\r
--${boundary}\r
Content-Disposition: form-data; name="data"\r
\r
{"name":"Teste Final de Conexão","signers":[],"lang":"pt-BR"}\r
--${boundary}--\r
`;

        console.log(`Testing POST https://${HOST}${PATH}`);

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    body: data.substring(0, 300)
                });
            });
        });

        req.on('error', (e) => {
            resolve({ error: e.message });
        });

        req.write(body);
        req.end();
    });
}

async function run() {
    const result = await testConnection();
    console.log(`Status: ${result.status}`);
    console.log(`Body: ${result.body}`);
    if (result.status === 200 || result.status === 201) {
        console.log("✅ SUCCESS! The endpoint is correct.");
    } else {
        console.log("❌ FAILED. Check credentials or ID.");
    }
}

run();
