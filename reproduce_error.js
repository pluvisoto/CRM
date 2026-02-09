import fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import path from 'path';

// Use the exact file we are serving
const filePath = path.resolve('public/contrato_v3.docx');

try {
    console.log(`Testing file: ${filePath}`);
    const content = fs.readFileSync(filePath, 'binary');
    const zip = new PizZip(content);

    // Exact config from contractService
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });

    const dataToRender = {
        RAZAO_SOCIAL: "Empresa Teste Ltda",
        CNPJ: "00.000.000/0001-99",
        ENDERECO: "Rua Teste, 123",
        REPRESENTANTE: "João da Silva",
        CPF_REPRESENTANTE: "123.456.789-00",
        EMAIL: "joao@teste.com",
        DATA_ATUAL: "07/02/2026",
        VALOR_MENSAL: "R$ 1.000,00"
    };

    doc.render(dataToRender);

    console.log("SUCCESS: Document rendered successfully!");

} catch (e) {
    console.error("FAILURE: Error rendering document.");
    if (e.properties && e.properties.errors) {
        e.properties.errors.forEach(err => {
            console.error(`- Error: ${err.message}`);
        });
    } else {
        console.error(e);
    }
}
