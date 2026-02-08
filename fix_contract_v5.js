import fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import path from 'path';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

const inputPath = path.resolve('public/contrato_v4.docx');
const outputPath = path.resolve('public/contrato_v5.docx');

try {
    const content = fs.readFileSync(inputPath, 'binary');
    const zip = new PizZip(content);
    const xml = zip.files['word/document.xml'].asText();

    console.log("Parsing XML with XMLDOM...");
    const doc = new DOMParser().parseFromString(xml, 'text/xml');

    // Find all <w:t> elements
    const textNodes = doc.getElementsByTagName('w:t');
    console.log(`Found ${textNodes.length} text nodes.`);

    let fixedCount = 0;

    for (let i = 0; i < textNodes.length; i++) {
        const node = textNodes[i];
        let text = node.textContent;
        let original = text;

        // Fix duplicate closing braces
        if (text.match(/\}\}\}+/)) {
            // Replace }}} or }}}} with }}
            text = text.replace(/(\}\})+/g, '}}');
        }
        // Also just look for }} followed by }} in the same node?
        // text.replace('}}}}', '}}');

        // Also fix {{
        if (text.match(/\{\{\{+/)) {
            text = text.replace(/(\{\{)+/g, '{{');
        }

        if (text !== original) {
            console.log(`Fixed node: "${original}" -> "${text}"`);
            node.textContent = text;
            fixedCount++;
        }
    }

    console.log(`Corrected ${fixedCount} text nodes.`);

    const serializer = new XMLSerializer();
    const newXml = serializer.serializeToString(doc);

    zip.file('word/document.xml', newXml);

    const buffer = zip.generate({ type: 'nodebuffer' });
    fs.writeFileSync(outputPath, buffer);
    console.log("Saved V5 fix to:", outputPath);

    // Verify
    const verifyZip = new PizZip(buffer);
    const templater = new Docxtemplater(verifyZip, { paragraphLoop: true, linebreaks: true });
    // Try to compile it (this throws if invalid)
    templater.compile();
    console.log("Verification SUCCESS: Document compiled without errors!");

} catch (e) {
    console.error("Error:", e);
    if (e.properties && e.properties.errors) console.error(e.properties.errors);
}
