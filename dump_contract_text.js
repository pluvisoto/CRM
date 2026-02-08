import fs from 'fs';
import PizZip from 'pizzip';
import path from 'path';

const filePath = path.resolve('public/contrato_v3.docx');

try {
    const content = fs.readFileSync(filePath, 'binary');
    const zip = new PizZip(content);
    const xml = zip.files['word/document.xml'].asText();
    // Simple regex strip to get text
    // We want to preserve paragraphs roughly
    const text = xml.replace(/<w:p[^>]*>/g, '\n').replace(/<[^>]+>/g, '');

    console.log(text);
    fs.writeFileSync('contract_full_text.txt', text);

} catch (e) {
    console.error("Error:", e);
}
