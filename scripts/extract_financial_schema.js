import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

function extractFinancialSchema() {
    try {
        // Read the Excel file
        const buf = fs.readFileSync('business_plan_corrigido.xlsx');
        const workbook = XLSX.read(buf, { type: 'buffer' });

        // Find the sheet
        let sheetName = workbook.SheetNames.find(name =>
            name.includes('Lucro') || name.includes('2026')
        ) || workbook.SheetNames[0];

        const sheet = workbook.Sheets[sheetName];
        console.log(`Analyzing sheet: ${sheetName}`);

        // Convert to JSON to read rows
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        console.log(`Total rows: ${data.length}\n`);

        const categories = {
            receitas: {
                fixa: [],
                variavel: []
            },
            impostos: [],
            despesas_variaveis: [],
            despesas_fixas: {
                salarios: [],
                administrativo: []
            }
        };

        // Process each row
        data.forEach((row, rowIndex) => {
            const value = row[0];

            // Skip if empty
            if (!value || value === null || value === '') return;

            const text = String(value).trim();

            // Skip numeric-only values and very short values
            if ((!isNaN(text) && text !== '') || text.length < 3) return;

            const textLower = text.toLowerCase();

            // Get the BP_2026 value (first numeric column)
            let bp2026Value = 0;
            for (let col = 1; col < row.length; col++) {
                const cellValue = row[col];
                if (cellValue && !isNaN(cellValue) && cellValue !== '') {
                    bp2026Value = Number(cellValue);
                    break;
                }
            }

            // Skip total/summary rows
            if (textLower.includes('total') ||
                textLower.includes('ebitda') ||
                textLower.includes('margem') ||
                textLower.includes('resultado') ||
                textLower.includes('receita líquida')) {
                return;
            }

            const item = {
                label: text,
                BP_2026: bp2026Value,
                REAL_2026: 0
            };

            // Categorize based on prefix patterns
            if (textLower.includes('receita fixa')) {
                categories.receitas.fixa.push(item);
                console.log(`✓ Receita Fixa: ${text}`);
            }
            else if (textLower.includes('receita variável')) {
                categories.receitas.variavel.push(item);
                console.log(`✓ Receita Variável: ${text}`);
            }
            else if (textLower.includes('imposto') || textLower.includes('tributo') || textLower.includes('taxa')) {
                // Only add if it's an actual tax item, not a platform fee
                if (!textLower.includes('checkout') && !textLower.includes('plataforma')) {
                    categories.impostos.push(item);
                    console.log(`✓ Imposto: ${text}`);
                }
            }
            else if (textLower.includes('taxas de checkout') ||
                textLower.includes('servidor') ||
                textLower.includes('whatsapp') ||
                textLower.includes('tokens gpt') ||
                textLower.includes('telefone') ||
                textLower.includes('despesas variáveis')) {
                categories.despesas_variaveis.push(item);
                console.log(`✓ Despesa Variável: ${text}`);
            }
            else if (textLower.includes('pro labore') ||
                textLower.includes('desenvolvedor') ||
                textLower.includes('gestor de tráfego') ||
                textLower.includes('designer') ||
                textLower.includes('customer success') ||
                textLower.includes('vendedores') ||
                textLower.includes('auxiliar')) {
                categories.despesas_fixas.salarios.push(item);
                console.log(`✓ Despesa Fixa - Salário: ${text}`);
            }
            else if (textLower.includes('crm') ||
                textLower.includes('internet') ||
                textLower.includes('contabilidade') ||
                textLower.includes('condominio') ||
                textLower.includes('energia') ||
                textLower.includes('aluguel') ||
                textLower.includes('google workspace') ||
                textLower.includes('notion') ||
                textLower.includes('treinamento') ||
                textLower.includes('jurídico') ||
                textLower.includes('anúncios')) {
                categories.despesas_fixas.administrativo.push(item);
                console.log(`✓ Despesa Fixa - Administrativo: ${text}`);
            }
        });

        // Save to JSON
        const outputPath = path.join(process.cwd(), 'schema_financeiro.json');
        fs.writeFileSync(outputPath, JSON.stringify(categories, null, 2), 'utf-8');

        console.log('\n=== EXTRACTION SUMMARY ===');
        console.log(`Receitas Fixas: ${categories.receitas.fixa.length} items`);
        console.log(`Receitas Variáveis: ${categories.receitas.variavel.length} items`);
        console.log(`Impostos: ${categories.impostos.length} items`);
        console.log(`Despesas Variáveis: ${categories.despesas_variaveis.length} items`);
        console.log(`Despesas Fixas - Salários: ${categories.despesas_fixas.salarios.length} items`);
        console.log(`Despesas Fixas - Administrativo: ${categories.despesas_fixas.administrativo.length} items`);
        console.log(`\n✅ JSON saved to: ${outputPath}`);

        return categories;
    } catch (error) {
        console.error('❌ Error extracting schema:', error);
        throw error;
    }
}

extractFinancialSchema();
