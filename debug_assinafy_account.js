
import https from 'https';

const API_KEY = 'um__bKMaV_bnHPJcM_gWrA4dZ2xMOZA-8dvTNxvfnrJJx6mNJqNbWYAWMjZkoAvT';
const HOST = 'api.assinafy.com.br';

const paths = [
    '/v1/me',
    '/v1/users/me',
    '/v1/user',
    '/v1/workspaces',
    '/v1/accounts',
    '/v1/account'
];

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
                    body: data.substring(0, 300)
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
    console.log(`Scanning for Account/Workspace ID on ${HOST}...`);

    for (const p of paths) {
        const r = await request(p);
        console.log(`GET ${p} -> ${r.status} ${r.body.replace(/\n/g, '')}`);
    }
}

run();
