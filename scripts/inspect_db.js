

import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';

// Manually load env
const envPath = path.resolve(process.cwd(), '.env');
let supabaseUrl = process.env.VITE_SUPABASE_URL;
let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

try {
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('VITE_SUPABASE_URL=')) {
                supabaseUrl = trimmed.split('=')[1].trim();
                // Remove quotes if present
                if (supabaseUrl.startsWith('"') || supabaseUrl.startsWith("'")) {
                    supabaseUrl = supabaseUrl.slice(1, -1);
                }
            }
            if (trimmed.startsWith('VITE_SUPABASE_ANON_KEY=')) {
                supabaseKey = trimmed.split('=')[1].trim();
                // Remove quotes if present
                if (supabaseKey.startsWith('"') || supabaseKey.startsWith("'")) {
                    supabaseKey = supabaseKey.slice(1, -1);
                }
            }
        });
    }
} catch (e) {
    console.error("Could not read .env file", e);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log("--- INSPECTING DB ---");

    // 1. Get 1 Deal for Examples
    const { data: dealSample, error: dError } = await supabase.from('central_vendas').select('*').limit(1);
    if (dError) console.error('Error fetching deal:', dError);
    else console.log("SAMPLE ROW KEYS:", Object.keys(dealSample[0]));

    // 2. Get Distinct Stages in Use
    const { data: uniqueStages, error: sError } = await supabase.rpc('get_distinct_stages'); // RPC might not exist, fallback to js

    // Fallback: fetch all stages (lightweight enough for this context)
    const { data: allDeals } = await supabase.from('central_vendas').select('stage, tipo_pipeline');

    // Count distinct
    const stageCounts = {};
    allDeals.forEach(d => {
        const key = `${d.stage} (${d.tipo_pipeline})`;
        stageCounts[key] = (stageCounts[key] || 0) + 1;
    });

    console.log("DISTINCT STAGES IN USE:", stageCounts);

    // 3. Get Stage Names
    const { data: stagesRef } = await supabase.from('pipeline_stages').select('id, name, pipeline_id, position');
    const stageMap = {};
    stagesRef.forEach(s => stageMap[s.id] = s.name);

    console.log("STAGE ID MAPPING:");
    Object.keys(stageCounts).forEach(key => {
        const id = key.split(' ')[0];
        console.log(`${key} -> NAME: ${stageMap[id] || 'UNKNOWN'}`);
    });

    // 4. Data Dictionary Generator
    if (dealSample.length > 0) {
        console.log("\n--- DATA DICTIONARY ---");
        const row = dealSample[0];
        Object.keys(row).forEach(key => {
            const val = row[key];
            const type = typeof val;
            let finalType = type;
            if (val instanceof Date) finalType = 'timestamp';
            if (!isNaN(Date.parse(val)) && isNaN(val)) finalType = 'timestamptz (iso string)';

            console.log(`COLUMN: ${key} | TYPE: ${finalType} | EXAMPLE: ${val}`);
        });
    }
}

inspect();
