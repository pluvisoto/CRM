import fs from 'fs';
import PizZip from 'pizzip';
import path from 'path';

const filePath = path.resolve('public/contrato_v4.docx');

try {
    const content = fs.readFileSync(filePath, 'binary');
    const zip = new PizZip(content);
    const xml = zip.files['word/document.xml'].asText();
    const mailIndex = xml.indexOf('MAIL');

    if (mailIndex !== -1) {
        console.log(`Found MAIL at index ${mailIndex}`);
        const start = Math.max(0, mailIndex - 500);
        const end = Math.min(xml.length, mailIndex + 500);
        console.log("Snippet around MAIL:");
        console.log(xml.substring(start, end));
    } else {
        console.log("MAIL not found in XML!");
    }

} catch (e) {
    console.error("Error:", e);
}
