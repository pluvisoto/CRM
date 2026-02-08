import fs from 'fs';
import PizZip from 'pizzip';
import path from 'path';
import { DOMParser } from '@xmldom/xmldom';

const filePath = path.resolve('public/contrato_v3.docx');

try {
    const content = fs.readFileSync(filePath, 'binary');
    const zip = new PizZip(content);

    // 1. Check Settings for Track Revisions
    if (zip.files['word/settings.xml']) {
        const settingsXml = zip.files['word/settings.xml'].asText();
        console.log("\n--- Settings XML (Snippet) ---");
        console.log(settingsXml.substring(0, 1000));

        if (settingsXml.includes('trackRevisions')) {
            console.log("\n[WARNING] Track Revisions is ENABLED!");
        } else {
            console.log("\n[OK] Track Revisions not found.");
        }
    } else {
        console.log("word/settings.xml not found.");
    }

    // 2. Check Document for Margins
    const docXml = zip.files['word/document.xml'].asText();
    const doc = new DOMParser().parseFromString(docXml, 'text/xml');

    const sectPrs = doc.getElementsByTagName('w:sectPr');
    console.log(`\nFound ${sectPrs.length} section properties.`);

    for (let i = 0; i < sectPrs.length; i++) {
        const pgMar = sectPrs[i].getElementsByTagName('w:pgMar')[0];
        if (pgMar) {
            console.log(`\nSection #${i} Margins:`);
            console.log(`Left: ${pgMar.getAttribute('w:left')}`);
            console.log(`Right: ${pgMar.getAttribute('w:right')}`);
            console.log(`Top: ${pgMar.getAttribute('w:top')}`);
            console.log(`Bottom: ${pgMar.getAttribute('w:bottom')}`);
            console.log(`Gutter: ${pgMar.getAttribute('w:gutter')}`);
        }
    }

} catch (e) {
    console.error("Error:", e);
}
