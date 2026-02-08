#!/usr/bin/env node
/**
 * Enhanced Financial Engine with Supabase Integration
 * Processes CRM sales and updates both schema JSON and Supabase database
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// Default admin ID for auditing (from check_user.js)
const ADMIN_ID = '9e56cc13-ba79-4ac5-8ef9-58306a9f4504';

class EnhancedEngineFinanceiro {
    // Business constants
    static RECEITA_FIXA_POR_VENDA = 597.00;
    static TAXA_IMPOSTO = 0.16; // 16%

    // Unit COGS per sale - NEW DISTRIBUTION
    static COGS = {
        'Servidor': 10.00,
        'Tokens GPT': 10.00,
        'API e Telefonia': 230.00  // Combined WhatsApp API + Telefone
    };

    constructor(schemaPath = 'schema_financeiro.json', logPath = 'transacoes.log') {
        this.schemaPath = schemaPath;
        this.logPath = logPath;
        this.schema = this.loadSchema();

        // Initialize Supabase client
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
            console.warn('⚠️  Supabase credentials not found. Running in schema-only mode.');
            this.supabase = null;
        } else {
            this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase client initialized');
        }
    }

    /**
     * Load financial schema from JSON file
     */
    loadSchema() {
        if (!fs.existsSync(this.schemaPath)) {
            throw new Error(`Schema file not found: ${this.schemaPath}`);
        }

        const data = fs.readFileSync(this.schemaPath, 'utf-8');
        return JSON.parse(data);
    }

    /**
     * Save updated schema back to JSON file
     */
    saveSchema() {
        fs.writeFileSync(
            this.schemaPath,
            JSON.stringify(this.schema, null, 2),
            'utf-8'
        );
    }

    /**
     * Get current month in YYYY-MM format
     */
    getCurrentMonth() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }

    /**
     * Get current date in YYYY-MM-DD format
     */
    getCurrentDate() {
        const now = new Date();
        return now.toISOString().split('T')[0];
    }

    /**
     * Find a category by label in a list
     */
    findCategory(categoryList, label) {
        return categoryList.find(item =>
            item.label.toLowerCase().includes(label.toLowerCase())
        );
    }

    /**
     * Create receivable entry in Supabase
     */
    async createReceivable(amount, description, status = 'received') {
        if (!this.supabase) {
            console.log('  ⏭️  Skipping Supabase receivable (no credentials)');
            return null;
        }

        try {
            const { data, error } = await this.supabase
                .from('accounts_receivable')
                .insert([{
                    description: description,
                    amount: amount,
                    due_date: this.getCurrentDate(),
                    status: status === 'PAGO' ? 'received' : 'pending',
                    category: 'Vendas',
                    created_by: ADMIN_ID
                }])
                .select()
                .single();

            if (error) throw error;
            console.log(`  ✅ Receivable created: ${description} - R$ ${amount.toFixed(2)} (${status})`);
            return data;
        } catch (error) {
            console.error(`  ❌ Error creating receivable:`, error.message);
            throw error;
        }
    }

    /**
     * Create payable entry in Supabase
     */
    async createPayable(amount, description, category = 'Operacional') {
        if (!this.supabase) {
            console.log(`  ⏭️  Skipping Supabase payable (no credentials)`);
            return null;
        }

        try {
            const { data, error } = await this.supabase
                .from('accounts_payable')
                .insert([{
                    description: description,
                    amount: amount,
                    due_date: this.getCurrentDate(),
                    status: 'paid',  // Already incurred cost
                    category: category,
                    created_by: ADMIN_ID
                }])
                .select()
                .single();

            if (error) throw error;
            console.log(`  ✅ Payable created: ${description} - R$ ${amount.toFixed(2)}`);
            return data;
        } catch (error) {
            console.error(`  ❌ Error creating payable:`, error.message);
            throw error;
        }
    }

    /**
     * Get projected balance for current month
     */
    async getProjectedBalance() {
        if (!this.supabase) {
            return { receivables: 0, payables: 0, balance: 0 };
        }

        try {
            const currentMonth = this.getCurrentMonth();
            const startDate = `${currentMonth}-01`;
            // Calculate last day of month properly
            const [year, month] = currentMonth.split('-');
            const lastDay = new Date(year, month, 0).getDate();
            const endDate = `${currentMonth}-${String(lastDay).padStart(2, '0')}`;

            // Get receivables for current month
            const { data: receivables, error: recError } = await this.supabase
                .from('accounts_receivable')
                .select('amount')
                .gte('due_date', startDate)
                .lte('due_date', endDate);

            if (recError) throw recError;

            // Get payables for current month
            const { data: payables, error: payError } = await this.supabase
                .from('accounts_payable')
                .select('amount')
                .gte('due_date', startDate)
                .lte('due_date', endDate);

            if (payError) throw payError;

            const totalReceivables = receivables.reduce((sum, r) => sum + Number(r.amount), 0);
            const totalPayables = payables.reduce((sum, p) => sum + Number(p.amount), 0);
            const balance = totalReceivables - totalPayables;

            return {
                receivables: totalReceivables,
                payables: totalPayables,
                balance: balance
            };
        } catch (error) {
            console.error('Error getting projected balance:', error.message);
            return { receivables: 0, payables: 0, balance: 0 };
        }
    }

    /**
     * Process a new sale transaction
     * @param {number} valorComissaoRecuperada - Variable commission amount
     * @param {string} statusPagamento - 'PAGO' or 'PENDENTE'
     * @param {string} dataVencimento - YYYY-MM-DD
     */
    async registrarNovaVenda(valorComissaoRecuperada, statusPagamento = 'PAGO', dataVencimento = null) {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`🔄 PROCESSANDO NOVA VENDA - Status: ${statusPagamento}`);
        console.log(`${'='.repeat(70)}`);

        // 1. Calculate totals (Gross)
        const receitaBruta = EnhancedEngineFinanceiro.RECEITA_FIXA_POR_VENDA + valorComissaoRecuperada;

        // 2. Strict Tax Calculation: 16% on Gross (Mensalidade + Comissão)
        const impostos = receitaBruta * EnhancedEngineFinanceiro.TAXA_IMPOSTO;

        // 3. Costs calculation
        const totalCogs = Object.values(EnhancedEngineFinanceiro.COGS).reduce((a, b) => a + b, 0);

        // Check delinquency
        const today = new Date().toISOString().split('T')[0];
        const isAtrasado = statusPagamento === 'PENDENTE' && dataVencimento && today > dataVencimento;

        let inadimplencia = 0;
        let receitaEfetiva = receitaBruta;

        if (isAtrasado) {
            inadimplencia = receitaBruta;
            receitaEfetiva = 0; // Not realized yet
            console.log(`⚠️  ALERTA DE INADIMPLÊNCIA: Venda pendente e atrasada detectada!`);
        }

        const saldoLiquido = receitaEfetiva - totalCogs - impostos;

        console.log(`\n📊 VALORES CALCULADOS:`);
        console.log(`  Receita Bruta: R$ ${receitaBruta.toFixed(2)}`);
        console.log(`  Comissão: R$ ${valorComissaoRecuperada.toFixed(2)}`);
        console.log(`  Impostos (16% sobre Bruto): R$ ${impostos.toFixed(2)}`);
        console.log(`  COGS: R$ ${totalCogs.toFixed(2)}`);
        if (isAtrasado) {
            console.log(`  ❌ Inadimplência: R$ ${inadimplencia.toFixed(2)}`);
        }

        // === UPDATE SCHEMA JSON ===
        console.log(`\n📝 ATUALIZANDO SCHEMA JSON...`);

        // Update Revenues for ALL sales (Receita Bruta/Vendido)
        const receitaFixa = this.findCategory(this.schema.receitas.fixa, 'Receita Fixa - Mensalidade');
        if (receitaFixa) receitaFixa.REAL_2026 += EnhancedEngineFinanceiro.RECEITA_FIXA_POR_VENDA;

        const receitaVariavel = this.findCategory(this.schema.receitas.variavel, 'Receita Variável - Comissão');
        if (receitaVariavel) receitaVariavel.REAL_2026 += valorComissaoRecuperada;

        // Trace Delinquency if late
        if (isAtrasado) {
            if (this.schema.inadimplencia_total === undefined) this.schema.inadimplencia_total = 0;
            this.schema.inadimplencia_total += inadimplencia;
        }

        // Update Taxes (Always incurred based on operation)
        const impostosItem = this.findCategory(this.schema.impostos, 'Impostos');
        if (impostosItem) impostosItem.REAL_2026 += impostos;

        // Update COGS
        for (const [cogsName, cogsValue] of Object.entries(EnhancedEngineFinanceiro.COGS)) {
            const cogsItem = this.findCategory(this.schema.despesas_variaveis, cogsName);
            if (cogsItem) cogsItem.REAL_2026 += cogsValue;
        }

        this.saveSchema();
        console.log(`  ✅ Schema JSON atualizado`);

        // === UPDATE SUPABASE TABLES ===
        if (this.supabase) {
            console.log(`\n💾 CRIANDO REGISTROS NO SUPABASE...`);

            try {
                // Create Receivable
                await this.createReceivable(
                    receitaBruta,
                    `Venda - ${statusPagamento}${isAtrasado ? ' (ATRASADO)' : ''} - (R$ ${EnhancedEngineFinanceiro.RECEITA_FIXA_POR_VENDA.toFixed(2)} + R$ ${valorComissaoRecuperada.toFixed(2)})`,
                    statusPagamento
                );

                // Create Payables (3 separate entries)
                for (const [cogsName, cogsValue] of Object.entries(EnhancedEngineFinanceiro.COGS)) {
                    await this.createPayable(
                        cogsValue,
                        `[COGS] ${cogsName} - Venda`,
                        'Operacional'
                    );
                }

                console.log(`  ✅ Todos os registros criados no Supabase`);
            } catch (error) {
                console.error(`  ❌ Erro ao criar registros no Supabase:`, error.message);
            }
        }

        // === LOG TRANSACTION ===
        this.logTransacao(receitaEfetiva, totalCogs, impostos, saldoLiquido, isAtrasado ? inadimplencia : 0);

        // === GET PROJECTED BALANCE ===
        console.log(`\n📈 SALDO PROJETADO (Mês Atual: ${this.getCurrentMonth()}):`);
        const projectedBalance = await this.getProjectedBalance();
        console.log(`  Total a Receber: R$ ${projectedBalance.receivables.toFixed(2)}`);
        console.log(`  Total a Pagar: R$ ${projectedBalance.payables.toFixed(2)}`);
        console.log(`  ${'─'.repeat(60)}`);
        console.log(`  SALDO PROJETADO: R$ ${projectedBalance.balance.toFixed(2)}`);

        // === SUMMARY ===
        console.log(`\n${'='.repeat(70)}`);
        console.log(`✅ VENDA REGISTRADA COM SUCESSO`);
        console.log(`${'='.repeat(70)}`);
        console.log(`Saldo Líquido da Operação: R$ ${saldoLiquido.toFixed(2)}`);
        if (isAtrasado) console.log(`Impacto Inadimplência: - R$ ${inadimplencia.toFixed(2)}`);
        console.log(`${'='.repeat(70)}\n`);

        return {
            receitaBruta,
            totalCogs,
            impostos,
            saldoLiquido,
            inadimplencia,
            projectedBalance
        };
    }

    /**
     * Log transaction to audit file
     */
    logTransacao(receitaEfetiva, totalCogs, impostos, saldoLiquido, inad = 0) {
        const timestamp = new Date().toLocaleString('pt-BR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        });

        const logLine =
            `${timestamp} | ` +
            `Efetivo: R$ ${receitaEfetiva.toFixed(2).padStart(8)} | ` +
            `COGS: R$ ${totalCogs.toFixed(2).padStart(6)} | ` +
            `Impostos: R$ ${impostos.toFixed(2).padStart(8)} | ` +
            `Inad: R$ ${inad.toFixed(2).padStart(6)} | ` +
            `Líquido: R$ ${saldoLiquido.toFixed(2).padStart(8)}\n`;

        fs.appendFileSync(this.logPath, logLine, 'utf-8');
    }

    /**
     * Get current total metrics from schema
     */
    getTotalMetrics() {
        const totalReceitaFixa = this.schema.receitas.fixa.reduce((sum, item) => sum + item.REAL_2026, 0);
        const totalReceitaVariavel = this.schema.receitas.variavel.reduce((sum, item) => sum + item.REAL_2026, 0);
        const totalImpostos = this.schema.impostos.reduce((sum, item) => sum + item.REAL_2026, 0);
        const totalCogs = this.schema.despesas_variaveis.reduce((sum, item) => sum + item.REAL_2026, 0);
        const inadimplencia = this.schema.inadimplencia_total || 0;

        // BP Values (Mental check for comparison)
        const bpTotalReceita = this.schema.receitas.fixa.reduce((sum, item) => sum + item.BP_2026, 0) +
            this.schema.receitas.variavel.reduce((sum, item) => sum + item.BP_2026, 0);
        const bpTotalCogs = this.schema.despesas_variaveis.reduce((sum, item) => sum + item.BP_2026, 0);
        const bpImpostos = this.schema.impostos.reduce((sum, item) => sum + item.BP_2026, 0);

        // Sum of all fixed expenses BP
        const bpFixas = this.schema.despesas_fixas.salarios.reduce((sum, item) => sum + item.BP_2026, 0) +
            this.schema.despesas_fixas.administrativo.reduce((sum, item) => sum + item.BP_2026, 0);

        const bpLucroLiquido = bpTotalReceita - bpTotalCogs - bpImpostos - bpFixas;

        const receitaTotal = totalReceitaFixa + totalReceitaVariavel;
        const resultadoBruto = receitaTotal - totalCogs;

        // Net Profit updated logic (simplified for comparison log)
        // Note: despesas_fixas are 0 in REAL currently
        const lucroLiquidoReal = receitaTotal - totalCogs - totalImpostos - 0;

        return {
            receitaTotal,
            impostos: totalImpostos,
            cogs: totalCogs,
            inadimplencia,
            lucroLiquidoReal,
            bpLucroLiquido,
            resultadoBruto
        };
    }
}

// ============================================================================
// TEST SIMULATION - 3 New Customers
// ============================================================================

async function runSimulation() {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🚀 SIMULAÇÃO DE VENDAS - ENHANCED ENGINE (Supabase Integration)`);
    console.log(`${'='.repeat(70)}`);

    // Initialize engine
    const engine = new EnhancedEngineFinanceiro();

    // Show initial state
    console.log(`\n📊 ESTADO INICIAL:`);
    let metrics = engine.getTotalMetrics();
    console.log(`Receita Total Atual: R$ ${metrics.receitaTotal.toFixed(2)}`);
    console.log(`COGS Total Atual: R$ ${metrics.cogs.toFixed(2)}`);
    console.log(`Lucro Líquido Real Atual: R$ ${metrics.lucroLiquidoReal.toFixed(2)}`);

    // Simulate customers with status and due dates
    const clientes = [
        { nome: 'Cliente A (Pago)', comissao: 150.00, status: 'PAGO', vencimento: '2026-02-10' },
        { nome: 'Cliente B (Atrasado)', comissao: 200.00, status: 'PENDENTE', vencimento: '2026-02-01' },
        { nome: 'Cliente C (Pendente Futuro)', comissao: 180.00, status: 'PENDENTE', vencimento: '2026-02-25' },
    ];

    console.log(`\n${'='.repeat(70)}`);
    console.log(`🎯 PROCESSANDO ${clientes.length} NOVAS VENDAS COM DELINQUENCY LOGIC`);
    console.log(`${'='.repeat(70)}`);

    for (const [idx, cliente] of clientes.entries()) {
        console.log(`\n[${idx + 1}/${clientes.length}] ${cliente.nome}`);
        await engine.registrarNovaVenda(cliente.comissao, cliente.status, cliente.vencimento);
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Show final state & Logic Comparison
    const finalMetrics = engine.getTotalMetrics();

    console.log(`\n${'='.repeat(70)}`);
    console.log(`📈 VALIDAÇÃO DE SAÍDA: BUSINESS PLAN VS REAL`);
    console.log(`${'='.repeat(70)}`);

    console.log(`\nLucro Líquido BP:        R$ ${finalMetrics.bpLucroLiquido.toFixed(2).padStart(12)}`);
    console.log(`Lucro Líquido Real:      R$ ${finalMetrics.lucroLiquidoReal.toFixed(2).padStart(12)}`);

    const gap = finalMetrics.bpLucroLiquido - finalMetrics.lucroLiquidoReal;
    const impactoInad = finalMetrics.inadimplencia;

    console.log(`                       ${'─'.repeat(30)}`);
    console.log(`GAP TOTAL:               R$ ${gap.toFixed(2).padStart(12)}`);
    console.log(`\nDETALHAMENTO DO GAP:`);
    console.log(`- Impacto Inadimplência: R$ ${impactoInad.toFixed(2).padStart(12)}`);
    console.log(`- Outras Variações:      R$ ${(gap - impactoInad).toFixed(2).padStart(12)}`);

    console.log(`\n${'='.repeat(70)}`);
    console.log(`✅ Simulação concluída!`);
    console.log(`   - Confira transacoes.log para auditoria`);
    console.log(`   - Verifique Supabase tables: accounts_receivable, accounts_payable`);
    console.log(`${'='.repeat(70)}\n`);
}

// Run simulation
runSimulation().catch(console.error);
