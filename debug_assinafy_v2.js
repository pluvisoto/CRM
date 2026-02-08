
import https from 'https';

const API_KEY = 'um__bKMaV_bnHPJcM_gWrA4dZ2xMOZA-8dvTNxvfnrJJx6mNJqNbWYAWMjZkoAvT';
const HOST = 'api.assinafy.com.br';

const paths = [
    '/api/v1/documents',
    '/v1/documents',
    '/api/v1/document',
    '/v1/document'
];

function request(method, path) {
    return new Promise((resolve) => {
        const options = {
            hostname: HOST,
            port: 443,
            path: path,
            method: method,
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
                    method,
                    path,
                    status: res.statusCode,
                    body: data.substring(0, 100)
                });
            });
        });

        req.on('error', (e) => {
            resolve({ method, path, error: e.message });
        });

        if (method === 'POST') {
            req.write('{}');
        }
        req.end();
    });
}

async function run() {
    console.log(`Scanning ${HOST}...`);

    // 1. Try GET (List Documents) - Easiest way to verify path
    console.log('\n--- TESTING GET (List) ---');
    for (const p of paths) {
        const r = await request('GET', p);
        console.log(`GET ${p} -> ${r.status} ${r.body.replace(/\n/g, '')}`);
    }

    // 2. Try POST with JSON (even if it fails, 400 is better than 404/405)
    console.log('\n--- TESTING POST (Create) ---');
    for (const p of paths) {
        const r = await request('POST', p);
        console.log(`POST ${p} -> ${r.status} ${r.body.replace(/\n/g, '')}`);
    }
}

run();
