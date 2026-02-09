import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function audit() {
    console.log("📊 AUDITORIA DE ESTRUTURA (Visão 5 Anos)");

    const { data, error } = await supabase
        .from('financial_baseline')
        .select('categoria, subcategoria, competencia, valor_planejado')
        .gte('competencia', '2026-01-01')
        .lte('competencia', '2030-12-31')
        .order('subcategoria', { ascending: true })
        .limit(5000);

    if (error) {
        console.error("Erro:", error);
        return;
    }

    console.log(`Total de registros: ${data.length}`);

    const uniqueSubcats = [...new Set(data.map(d => d.subcategoria))].sort((a, b) => parseInt(a) - parseInt(b));
    console.log("\nÍndices de linha encontrados:");
    uniqueSubcats.forEach(sc => {
        const sample = data.find(d => d.subcategoria === sc);
        const count = data.filter(d => d.subcategoria === sc).length;
        console.log(`Linha ${sc.padEnd(4)} | ${sample.categoria.padEnd(40)} | Registros: ${count}`);
    });
}

audit();
