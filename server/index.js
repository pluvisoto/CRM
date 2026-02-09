import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const SCHEMA_PATH = path.join(__dirname, '..', 'schema_financeiro.json');

app.use(cors({
    origin: '*', // Allow all origins to handle dynamic Vite ports (5173, 5174, etc.)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Endpoint to get KPIs from schema_financeiro.json
app.get('/api/kpis', (req, res) => {
    try {
        if (!fs.existsSync(SCHEMA_PATH)) {
            return res.status(404).json({ error: 'Schema file not found' });
        }
        const data = fs.readFileSync(SCHEMA_PATH, 'utf-8');
        const schema = JSON.parse(data);
        res.json(schema);
    } catch (error) {
        console.error('Error reading schema:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to update KPIs in schema_financeiro.json
app.post('/api/kpis', (req, res) => {
    try {
        const newSchema = req.body;

        if (!newSchema || typeof newSchema !== 'object') {
            return res.status(400).json({ error: 'Invalid schema data' });
        }

        // Basic validation (optional but recommended)
        if (!newSchema.metas_comerciais || !newSchema.receitas) {
            return res.status(400).json({ error: 'Schema missing required sections' });
        }

        newSchema.last_update = new Date().toISOString();

        fs.writeFileSync(SCHEMA_PATH, JSON.stringify(newSchema, null, 4));
        console.log('✅ [API] Schema updated successfully via /api/kpis');
        res.json({ success: true, message: 'Schema updated' });

    } catch (error) {
        console.error('Error updating schema:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// CONSTANTS (Mirroring Finance Engine)
const FINANCE_CONSTANTS = {
    RECEITA_FIXA_POR_VENDA: 597,
    TAXA_IMPOSTO: 0.16,
    COGS: {
        'Servidor': 10,
        'Tokens GPT': 10,
        'API e Telefonia': 230
    }
};

// Endpoint to register a sale in schema_financeiro.json (Real-time sync)
app.post('/api/sales/register', (req, res) => {
    try {
        const { commission = 0 } = req.body;

        if (!fs.existsSync(SCHEMA_PATH)) {
            return res.status(404).json({ error: 'Schema file not found' });
        }

        const data = fs.readFileSync(SCHEMA_PATH, 'utf-8');
        const schema = JSON.parse(data);

        // 1. Calculate Values
        const grossRevenue = FINANCE_CONSTANTS.RECEITA_FIXA_POR_VENDA + Number(commission);
        const taxes = grossRevenue * FINANCE_CONSTANTS.TAXA_IMPOSTO;

        // 2. Recursive Update Helper
        const updateCategory = (categories, name, value) => {
            for (let cat of categories) {
                if (cat.name === name) {
                    cat.REAL_2026 = (cat.REAL_2026 || 0) + value;
                    return true;
                }
                if (cat.subcategorias && updateCategory(cat.subcategorias, name, value)) return true;
                if (cat.itens && updateCategory(cat.itens, name, value)) return true;
            }
            return false;
        };

        // 3. Update Revenues
        updateCategory(schema.receitas.fixa, 'Receita Fixa - Mensalidade', FINANCE_CONSTANTS.RECEITA_FIXA_POR_VENDA);
        updateCategory(schema.receitas.variavel, 'Receita Variável - Comissão', Number(commission));

        // 4. Update Taxes
        updateCategory(schema.impostos, 'Impostos', taxes);

        // 5. Update COGS
        for (const [name, value] of Object.entries(FINANCE_CONSTANTS.COGS)) {
            updateCategory(schema.despesas_variaveis, name, value);
        }

        // 6. Save back to file
        fs.writeFileSync(SCHEMA_PATH, JSON.stringify(schema, null, 4));

        console.log(`✅ [API] Sale registered: +R$ ${grossRevenue.toFixed(2)} (Comm: ${commission})`);
        res.json({ success: true, revenue: grossRevenue });

    } catch (error) {
        console.error('Error registering sale:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.listen(PORT, () => {
    console.log(`🚀 KPI API Server running on http://localhost:${PORT}`);
    console.log(`📂 Reading targets from: ${SCHEMA_PATH}`);
});
