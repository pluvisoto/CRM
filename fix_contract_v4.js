import fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import path from 'path';

const inputPath = path.resolve('public/contrato_v3.docx');
const outputPath = path.resolve('public/contrato_v4.docx');

try {
    const content = fs.readFileSync(inputPath, 'binary');
    const zip = new PizZip(content);
    let xml = zip.files['word/document.xml'].asText();

    console.log("Original XML length:", xml.length);

    // Revert the placeholders back to {{ }}
    // The previous script replaced {{ with ____OPEN____ and }} with ____CLOSE____

    let fixedCount = 0;
    xml = xml.replace(/____OPEN____/g, () => {
        fixedCount++;
        return '{{';
    });

    xml = xml.replace(/____CLOSE____/g, () => {
        fixedCount++;
        return '}}';
    });

    console.log(`Reverted ${fixedCount} delimiters.`);

    zip.file('word/document.xml', xml);

    const buffer = zip.generate({ type: 'nodebuffer' });
    fs.writeFileSync(outputPath, buffer);
    console.log("Saved V4 fix to:", outputPath);

    // Verify immediately
    const doc = new Docxtemplater(new PizZip(buffer), { paragraphLoop: true, linebreaks: true });

    // Helper to check text
    const text = doc.getFullText();
    console.log("Preview text snippet:");
    console.log(text.substring(0, 500));

    console.log("Verified: No Parse Errors!");

} catch (e) {
    console.error("Error:", e);
    if (e.properties && e.properties.errors) console.error(e.properties.errors);
}
