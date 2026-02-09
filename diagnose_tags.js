import fs from 'fs';
import PizZip from 'pizzip';
import path from 'path';

// Check the file currently in public (what the user is downloading)
const publicPath = path.resolve('public/contrato_clean.docx');
// And the source
const srcPath = path.resolve('src/assets/docs/modelo_contrato_final.docx');

function analyzeFile(filePath, label) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`[${label}] File NOT found at: ${filePath}`);
            return;
        }
        console.log(`\n--- Analyzing [${label}] ---`);
        const content = fs.readFileSync(filePath, 'binary');
        const zip = new PizZip(content);
        const xml = zip.files['word/document.xml'].asText();
        const text = xml.replace(/<[^>]+>/g, '');

        // Find things that look like tags
        const regex = /\{\{(.*?)\}\}/g;
        let match;
        const found = [];
        while ((match = regex.exec(text)) !== null) {
            found.push(match[0]);
        }

        console.log(`Found ${found.length} tags:`);
        found.forEach(t => console.log(` - ${t}`));

        // Check for broken ones (single braces or split)
        // Count total '{'
        const opens = (text.match(/\{/g) || []).length;
        const closes = (text.match(/\}/g) || []).length;
        console.log(`Total '{' chars: ${opens}`);
        console.log(`Total '}' chars: ${closes}`);

        if (opens !== closes) {
            console.log("⚠️  MISMATCH detected! This causes 'Duplicate open tag' errors.");
        }

    } catch (e) {
        console.error(`Error reading ${label}:`, e);
    }
}

analyzeFile(srcPath, 'Source (Fixed)');
analyzeFile(publicPath, 'Public (Served)');
