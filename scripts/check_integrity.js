import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);

async function run() {
    console.log('=== VERIFICAÇÃO DE INTEGRIDADE ===\n');

    // Buscar todas subcategorias únicas
    const { data: all } = await supabase
        .from('financial_baseline')
        .select('subcategoria, categoria')
        .order('subcategoria');

    const map = {};
    all.forEach(r => {
        if (!map[r.subcategoria]) map[r.subcategoria] = r.categoria;
    });

    const keys = Object.keys(map).map(k => parseInt(k)).sort((a, b) => a - b);

    console.log(`Total de subcategorias: ${keys.length}`);
    console.log(`Range: ${Math.min(...keys)} até ${Math.max(...keys)}\n`);

    // Verificar se linhas críticas existem
    const criticas = [2, 4, 5, 6, 7, 8, 9, 10, 12, 40, 41, 42];
    console.log('Linhas Críticas:');
    for (const c of criticas) {
        if (map[c]) {
            console.log(`✅ [${c.toString().padStart(2)}] ${map[c]}`);
        } else {
            console.log(`❌ [${c.toString().padStart(2)}] NÃO ENCONTRADA`);
        }
    }

    console.log('\n=== SAMPLE DE 2026-01 ===');
    for (const c of criticas) {
        const { data } = await supabase
            .from('financial_baseline')
            .select('valor_planejado')
            .eq('subcategoria', c.toString())
            .eq('competencia', '2026-01-01')
            .maybeSingle();

        if (data) {
            console.log(`[${c.toString().padStart(2)}] ${map[c]?.substring(0, 25).padEnd(25)} = ${data.valor_planejado}`);
        }
    }
}
run();
