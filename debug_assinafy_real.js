
import https from 'https';

const API_KEY = 'um__bKMaV_bnHPJcM_gWrA4dZ2xMOZA-8dvTNxvfnrJJx6mNJqNbWYAWMjZkoAvT';
const HOST = 'api.assinafy.com.br';

const pathsToTest = [
    '/v1/documents',
    '/v1/document',
    '/api/v1/documents',
    '/api/v1/document',
    '/api/documents',
    '/documents'
];

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';

function testPath(path) {
    return new Promise((resolve) => {
        const options = {
            hostname: HOST,
            port: 443,
            path: path,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Accept': 'application/json'
            }
        };

        // Construct a minimal valid body
        const body =
            `--${boundary}\r
Content-Disposition: form-data; name="file"; filename="test.txt"\r
Content-Type: text/plain\r
\r
dummy content\r
--${boundary}\r
Content-Disposition: form-data; name="data"\r
\r
{"name":"Test","signers":[],"lang":"pt-BR"}\r
--${boundary}--\r
`;

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                resolve({
                    path,
                    status: res.statusCode,
                    body: data.substring(0, 150)
                });
            });
        });

        req.on('error', (e) => {
            resolve({ path, error: e.message });
        });

        req.write(body);
        req.end();
    });
}

async function run() {
    console.log(`Scanning endpoints on ${HOST}...`);
    for (const path of pathsToTest) {
        const result = await testPath(path);
        console.log(`[${result.status}] ${result.path} -> ${result.body.replace(/\n/g, ' ')}`);
    }
}

run();
