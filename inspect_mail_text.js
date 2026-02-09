import fs from 'fs';
import PizZip from 'pizzip';
import path from 'path';
import { DOMParser } from '@xmldom/xmldom';

const filePath = path.resolve('public/contrato_v4.docx');

try {
    const content = fs.readFileSync(filePath, 'binary');
    const zip = new PizZip(content);
    const xml = zip.files['word/document.xml'].asText();

    console.log("Parsing XML...");
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const textNodes = doc.getElementsByTagName('w:t');

    for (let i = 0; i < textNodes.length; i++) {
        const node = textNodes[i];
        if (node.textContent.includes('MAIL')) {
            console.log(`\n--- Found MAIL at Node #${i} ---`);

            // Print previous
            for (let j = Math.max(0, i - 3); j < i; j++) {
                console.log(`Node #${j}: "${textNodes[j].textContent}"`);
            }

            // Print match
            console.log(`Node #${i} (MATCH): "${node.textContent}"`);

            // Print next
            for (let j = i + 1; j < Math.min(textNodes.length, i + 4); j++) {
                console.log(`Node #${j}: "${textNodes[j].textContent}"`);
            }
        }
    }

} catch (e) {
    console.error("Error:", e);
}
