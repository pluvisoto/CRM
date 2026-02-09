import fs from 'fs';
import PizZip from 'pizzip';
import path from 'path';

// Try v6 first, then v5 if needed
const filePath = path.resolve('public/contrato_clean.docx');

try {
    console.log(`Reading ${filePath}...`);
    const content = fs.readFileSync(filePath, 'binary');
    const zip = new PizZip(content);
    const xml = zip.files['word/document.xml'].asText();
    // Simple regex to strip tags and see the text
    const text = xml.replace(/<w:p[^>]*>/g, '\n').replace(/<[^>]+>/g, '');

    console.log("--- START DOC CONTENT ---");
    // Print the last part where witnesses usually are
    console.log(text.slice(-2000));
    console.log("--- END DOC CONTENT ---");

} catch (e) {
    console.error("Error:", e);
}
