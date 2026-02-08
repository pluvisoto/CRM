import fs from 'fs';
import PizZip from 'pizzip';
import path from 'path';

const filePath = path.resolve('public/contrato_v4.docx');

try {
    const content = fs.readFileSync(filePath, 'binary');
    const zip = new PizZip(content);
    let xml = zip.files['word/document.xml'].asText();
    const text = xml.replace(/<[^>]+>/g, '');

    console.log("Analyzing V4 content around '}}'...");

    // Find all }} occurrences and context
    let regex = /\}\}/g;
    let match;
    let indices = [];
    while ((match = regex.exec(text)) !== null) {
        indices.push(match.index);
    }

    console.log(`Found ${indices.length} occurrences of '}}'.`);

    indices.forEach((index, i) => {
        // Show context around this }}
        const start = Math.max(0, index - 30);
        const end = Math.min(text.length, index + 30);
        const snippet = text.substring(start, end);
        console.log(`\nMatch #${i + 1} at index ${index}:`);
        console.log(`...${snippet.replace(/\n/g, '\\n')}...`);
    });

    // Check specifically for triple or quad curly braces
    console.log("\nChecking for }}}} or }}}");
    if (text.match(/\}\}\}/)) console.log("FOUND Triple Close Brace!");
    if (text.match(/\}\}\}\}/)) console.log("FOUND Quad Close Brace!");

    // Check for "duplicate close tags" error context passed in log: "MAIL}}"
    const mailIndex = text.indexOf('MAIL}}');
    if (mailIndex !== -1) {
        console.log("\nContext around MAIL}}:");
        console.log(text.substring(mailIndex - 20, mailIndex + 30));
    }


} catch (e) {
    console.error("Error:", e);
}
