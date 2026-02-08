import fs from 'fs';
import PizZip from 'pizzip';
import path from 'path';

const filePath = path.resolve('src/assets/docs/modelo_contrato.docx');

try {
    const content = fs.readFileSync(filePath, 'binary');
    const zip = new PizZip(content);
    const xml = zip.files['word/document.xml'].asText();

    console.log("Analyzing XML around '{' characters...");

    let regex = /.{0,40}\{.{0,40}/g;
    let match;
    let count = 0;

    // Find first 20 occurrences of '{'
    while ((match = regex.exec(xml)) !== null && count < 20) {
        console.log(`\nMatch #${++count}:`);
        console.log(match[0]);
    }

    // Also look for "{{" specifically
    console.log("\n--- Checking specific {{ patterns ---");
    regex = /.{0,40}\{\{.{0,40}/g;
    while ((match = regex.exec(xml)) !== null && count < 30) {
        console.log(`\nDouble Brace Match:`);
        console.log(match[0]);
        count++;
    }

} catch (e) {
    console.error("Error reading file:", e);
}
