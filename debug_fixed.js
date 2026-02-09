import fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import path from 'path';

const filePath = path.resolve('src/assets/docs/modelo_contrato_fixed.docx');

try {
    if (!fs.existsSync(filePath)) {
        console.error("Fixed file not found!");
        process.exit(1);
    }

    const content = fs.readFileSync(filePath, 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });

    const text = doc.getFullText();
    console.log("Fixed File - Content Preview:");
    console.log(text.substring(0, 500));
    console.log("\nSUCCESS: File parsed correctly. No TemplateError.");

} catch (e) {
    console.error("FAILED: Fixed file is still broken.", e);
}
