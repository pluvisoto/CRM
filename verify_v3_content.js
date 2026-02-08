import fs from 'fs';
import PizZip from 'pizzip';
import path from 'path';

const filePath = path.resolve('public/contrato_v3.docx');

try {
    const content = fs.readFileSync(filePath, 'binary');
    const zip = new PizZip(content);
    const xml = zip.files['word/document.xml'].asText();
    const text = xml.replace(/<[^>]+>/g, '');

    console.log("Checking V3 for placeholders...");

    const openCount = (text.match(/____OPEN____/g) || []).length;
    const closeCount = (text.match(/____CLOSE____/g) || []).length;

    console.log(`Found ${openCount} ____OPEN____`);
    console.log(`Found ${closeCount} ____CLOSE____`);

    if (openCount > 0 && openCount === closeCount) {
        console.log("SUCCESS: V3 has valid placeholders!");
    } else {
        console.log("FAILURE: V3 placeholders are missing or unbalanced.");
    }

} catch (e) {
    console.error("Error:", e);
}
