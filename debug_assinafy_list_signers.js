
import https from 'https';

const API_KEY = 'um__bKMaV_bnHPJcM_gWrA4dZ2xMOZA-8dvTNxvfnrJJx6mNJqNbWYAWMjZkoAvT';
const ACCOUNT_ID = '101a4099944872b300c6ac802284';
const HOST = 'api.assinafy.com.br';

function request(path) {
    return new Promise((resolve) => {
        const options = {
            hostname: HOST,
            port: 443,
            path: path,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                resolve({
                    path,
                    status: res.statusCode,
                    body: data.substring(0, 1000) // limit output
                });
            });
        });

        req.on('error', (e) => {
            resolve({ path, error: e.message });
        });

        req.end();
    });
}

async function run() {
    console.log(`Testing List Signers on ${HOST}...`);

    // 1. Try generic list
    const listRes = await request(`/v1/accounts/${ACCOUNT_ID}/signers`);
    console.log(`GET /signers -> ${listRes.status}`);
    console.log(listRes.body);

    // 2. Try search by email (guess)
    const email = 'pluvisoto@gmail.com';
    const searchRes = await request(`/v1/accounts/${ACCOUNT_ID}/signers?email=${email}`);
    console.log(`GET /signers?email=${email} -> ${searchRes.status}`);
    console.log(searchRes.body);
}

run();
