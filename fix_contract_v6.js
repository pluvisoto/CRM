import fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import path from 'path';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

const inputPath = path.resolve('public/contrato_v4.docx');
const outputPath = path.resolve('public/contrato_v6.docx');

try {
    const content = fs.readFileSync(inputPath, 'binary');
    const zip = new PizZip(content);
    const xml = zip.files['word/document.xml'].asText();

    console.log("Parsing XML...");
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const textNodes = doc.getElementsByTagName('w:t');

    // 1. Build Virtual Text and Map
    let virtualText = "";
    const map = []; // index -> { node, offset }

    for (let i = 0; i < textNodes.length; i++) {
        const node = textNodes[i];
        const str = node.textContent;
        for (let j = 0; j < str.length; j++) {
            map.push({ node: node, offset: j });
        }
        virtualText += str;
    }

    console.log(`Virtual Text Length: ${virtualText.length}`);

    // 2. Identify Braces
    const opens = [];
    const closes = [];

    // Find {{
    let regex = /\{\{/g;
    let match;
    while ((match = regex.exec(virtualText)) !== null) {
        opens.push(match.index);
    }

    // Find }}
    regex = /\}\}/g;
    while ((match = regex.exec(virtualText)) !== null) {
        closes.push(match.index);
    }

    console.log(`Found ${opens.length} '{{' and ${closes.length} '}}'.`);

    // 3. Logic to determine anomalies
    // Expect strictly: Open, Close, Open, Close...

    const toDelete = new Set(); // Indices of characters to delete

    let allTokens = [
        ...opens.map(i => ({ type: 'OPEN', index: i })),
        ...closes.map(i => ({ type: 'CLOSE', index: i }))
    ].sort((a, b) => a.index - b.index);

    let state = 'WAIT_OPEN'; // expect OPEN

    allTokens.forEach(token => {
        if (state === 'WAIT_OPEN') {
            if (token.type === 'OPEN') {
                state = 'WAIT_CLOSE'; // Good
            } else {
                // Found CLOSE when expecting OPEN -> Orphan }}
                console.log(`Found orphan }} at ${token.index}. Deleting.`);
                toDelete.add(token.index);
                toDelete.add(token.index + 1);
            }
        } else if (state === 'WAIT_CLOSE') {
            if (token.type === 'CLOSE') {
                state = 'WAIT_OPEN'; // Good
            } else {
                // Found OPEN when expecting CLOSE -> Nested {{
                // docxtemplater fails on nested. We should delete the NEW one?
                // Or assume the previous one was orphaned? 
                // Context: {{ ... {{ ... }}
                // Usually means previous {{ was abandoned.
                // Let's delete the PREVIOUS one? 
                // But we already processed it.
                // Let's delete this NEW one to be safe, treat it as text inside tag.
                // OR: assume user typed {{ {{TAG}}. Both are Starts.
                // The one closer to the tag is likely the real one.
                // Impl: Delete the FIRST one (which implies we reset state).
                // Actually easier: Just delete this one and stay in WAIT_CLOSE.
                // "Found {{ inside a tag".
                console.log(`Found nested/duplicate {{ at ${token.index}. Deleting.`);
                toDelete.add(token.index);
                toDelete.add(token.index + 1);
            }
        }
    });

    // 4. Execute Deletions
    // We must group by node to modify textContent correctly
    // And handle shifts? No, we just map index -> node/char.
    // We can just mark the specific node charecters as "removed".

    // Map of node -> set of offsets to remove
    const nodeDeletions = new Map();

    toDelete.forEach(globalIndex => {
        const mapping = map[globalIndex];
        if (!mapping) return;
        if (!nodeDeletions.has(mapping.node)) {
            nodeDeletions.set(mapping.node, new Set());
        }
        nodeDeletions.get(mapping.node).add(mapping.offset);
    });

    let deletionCount = 0;
    nodeDeletions.forEach((offsets, node) => {
        let chars = node.textContent.split('');
        // Filter out indices in offsets
        let newText = chars.filter((_, idx) => !offsets.has(idx)).join('');
        if (node.textContent !== newText) {
            node.textContent = newText;
            deletionCount++;
        }
    });

    console.log(`Modified ${deletionCount} nodes. Deleted ${toDelete.size} characters.`);

    const serializer = new XMLSerializer();
    const newXml = serializer.serializeToString(doc);

    zip.file('word/document.xml', newXml);

    const buffer = zip.generate({ type: 'nodebuffer' });
    fs.writeFileSync(outputPath, buffer);
    console.log("Saved V6 fix to:", outputPath);

    // Verify
    const verifyZip = new PizZip(buffer);
    const templater = new Docxtemplater(verifyZip, { paragraphLoop: true, linebreaks: true });
    templater.compile();
    console.log("Verification SUCCESS!");

} catch (e) {
    console.error("Error:", e);
    if (e.properties && e.properties.errors) console.error(e.properties.errors);
}
