import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);

async function run() {
    console.log('=== VERIFICAÇÃO DE DADOS CRÍTICOS ===\n');

    // Verificar subcategorias específicas
    const keys = ['2', '4', '5', '6', '7', '12', '40', '41', '42'];

    for (const k of keys) {
        const { data, error } = await supabase
            .from('financial_baseline')
            .select('categoria, subcategoria, competencia, valor_planejado')
            .eq('subcategoria', k)
            .limit(3);

        if (error) {
            console.error(`Erro ao buscar subcategoria ${k}:`, error);
            continue;
        }

        if (data && data.length > 0) {
            console.log(`[${k}] ${data[0].categoria}`);
            console.log(`  Registros: ${data.length > 0 ? 'OK' : 'VAZIO'}`);
            console.log(`  Exemplo: ${data[0].competencia} = ${data[0].valor_planejado}`);
        } else {
            console.log(`[${k}] NÃO ENCONTRADO NO BANCO`);
        }
        console.log('');
    }
}
run();
