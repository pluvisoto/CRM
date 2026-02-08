#!/usr/bin/env node
/**
 * Engine Financeiro - Core financial processing system
 * Processes CRM sales and updates financial schema with automatic cost allocation
 */

import fs from 'fs';
import path from 'path';

class EngineFinanceiro {
    // Business constants
    static RECEITA_FIXA_POR_VENDA = 597.00;
    static TAXA_IMPOSTO = 0.16; // 16%

    // Unit COGS per sale
    static COGS = {
        'Servidor': 10.00,
        'Tokens GPT': 10.00,
        'Telefone': 30.00,
        'API Oficial Whatsapp': 200.00
    };

    constructor(schemaPath = 'schema_financeiro.json', logPath = 'transacoes.log') {
        this.schemaPath = schemaPath;
        this.logPath = logPath;
        this.schema = this.loadSchema();
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
     * Find a category by label in a list
     */
    findCategory(categoryList, label) {
        return categoryList.find(item =>
            item.label.toLowerCase().includes(label.toLowerCase())
        );
    }

    /**
     * Process a new sale transaction
     * @param {number} valorComissaoRecuperada - Variable commission amount
     */
    registrarNovaVenda(valorComissaoRecuperada) {
        // Calculate totals
        const receitaTotal = EngineFinanceiro.RECEITA_FIXA_POR_VENDA + valorComissaoRecuperada;
        const totalCogs = Object.values(EngineFinanceiro.COGS).reduce((a, b) => a + b, 0);
        const impostos = receitaTotal * EngineFinanceiro.TAXA_IMPOSTO;
        const saldoLiquido = receitaTotal - totalCogs - impostos;

        // Update Fixed Revenue
        const receitaFixa = this.findCategory(
            this.schema.receitas.fixa,
            'Receita Fixa - Mensalidade'
        );
        if (receitaFixa) {
            receitaFixa.REAL_2026 += EngineFinanceiro.RECEITA_FIXA_POR_VENDA;
        }

        // Update Variable Revenue
        const receitaVariavel = this.findCategory(
            this.schema.receitas.variavel,
            'Receita Variável - Comissão'
        );
        if (receitaVariavel) {
            receitaVariavel.REAL_2026 += valorComissaoRecuperada;
        }

        // Update Taxes
        const impostosItem = this.findCategory(
            this.schema.impostos,
            'Impostos'
        );
        if (impostosItem) {
            impostosItem.REAL_2026 += impostos;
        }

        // Update COGS (Variable Expenses)
        for (const [cogsName, cogsValue] of Object.entries(EngineFinanceiro.COGS)) {
            const cogsItem = this.findCategory(
                this.schema.despesas_variaveis,
                cogsName
            );
            if (cogsItem) {
                cogsItem.REAL_2026 += cogsValue;
            }
        }

        // Save updated schema
        this.saveSchema();

        // Log transaction
        this.logTransacao(receitaTotal, totalCogs, impostos, saldoLiquido);

        // Print summary
        console.log(`\n${'='.repeat(70)}`);
        console.log(`✅ VENDA REGISTRADA`);
        console.log(`${'='.repeat(70)}`);
        console.log(`Receita Fixa:              R$ ${EngineFinanceiro.RECEITA_FIXA_POR_VENDA.toFixed(2).padStart(10)}`);
        console.log(`Receita Variável (Comissão): R$ ${valorComissaoRecuperada.toFixed(2).padStart(10)}`);
        console.log(`                           ${'─'.repeat(30)}`);
        console.log(`Receita Total:             R$ ${receitaTotal.toFixed(2).padStart(10)}`);
        console.log(`\nCustos Variáveis (COGS):`);
        for (const [cogsName, cogsValue] of Object.entries(EngineFinanceiro.COGS)) {
            console.log(`  - ${cogsName.padEnd(25)} R$ ${cogsValue.toFixed(2).padStart(10)}`);
        }
        console.log(`                           ${'─'.repeat(30)}`);
        console.log(`Total COGS:                R$ ${totalCogs.toFixed(2).padStart(10)}`);
        console.log(`Impostos (16%):            R$ ${impostos.toFixed(2).padStart(10)}`);
        console.log(`                           ${'─'.repeat(30)}`);
        console.log(`Resultado Bruto:           R$ ${(receitaTotal - totalCogs).toFixed(2).padStart(10)}`);
        console.log(`Saldo Líquido:             R$ ${saldoLiquido.toFixed(2).padStart(10)}`);
        console.log(`${'='.repeat(70)}\n`);

        return {
            receitaTotal,
            totalCogs,
            impostos,
            saldoLiquido
        };
    }

    /**
     * Log transaction to audit file
     */
    logTransacao(receitaTotal, totalCogs, impostos, saldoLiquido) {
        const timestamp = new Date().toLocaleString('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        const logLine =
            `${timestamp} | ` +
            `Venda: R$ ${receitaTotal.toFixed(2).padStart(8)} | ` +
            `COGS: R$ ${totalCogs.toFixed(2).padStart(6)} | ` +
            `Impostos: R$ ${impostos.toFixed(2).padStart(8)} | ` +
            `Líquido: R$ ${saldoLiquido.toFixed(2).padStart(8)}\n`;

        fs.appendFileSync(this.logPath, logLine, 'utf-8');
    }

    /**
     * Get current total metrics from schema
     */
    getTotalMetrics() {
        const totalReceitaFixa = this.schema.receitas.fixa.reduce(
            (sum, item) => sum + item.REAL_2026, 0
        );
        const totalReceitaVariavel = this.schema.receitas.variavel.reduce(
            (sum, item) => sum + item.REAL_2026, 0
        );
        const totalImpostos = this.schema.impostos.reduce(
            (sum, item) => sum + item.REAL_2026, 0
        );
        const totalCogs = this.schema.despesas_variaveis.reduce(
            (sum, item) => sum + item.REAL_2026, 0
        );

        const receitaTotal = totalReceitaFixa + totalReceitaVariavel;
        const resultadoBruto = receitaTotal - totalCogs;
        const lucroLiquido = receitaTotal - totalCogs - totalImpostos;

        return {
            receitaFixa: totalReceitaFixa,
            receitaVariavel: totalReceitaVariavel,
            receitaTotal,
            impostos: totalImpostos,
            cogs: totalCogs,
            resultadoBruto,
            lucroLiquido
        };
    }
}

// ============================================================================
// TEST SIMULATION - 5 New Customers
// ============================================================================

console.log(`\n${'='.repeat(70)}`);
console.log(`🚀 SIMULAÇÃO DE VENDAS - ENGINE FINANCEIRO`);
console.log(`${'='.repeat(70)}`);

// Initialize engine
const engine = new EngineFinanceiro();

// Show initial state
console.log(`\n📊 ESTADO INICIAL:`);
let metrics = engine.getTotalMetrics();
console.log(`Receita Total Atual: R$ ${metrics.receitaTotal.toFixed(2)}`);
console.log(`COGS Total Atual: R$ ${metrics.cogs.toFixed(2)}`);
console.log(`Lucro Líquido Atual: R$ ${metrics.lucroLiquido.toFixed(2)}`);

// Simulate 5 new customers with varying commission values
const clientes = [
    { nome: 'Cliente 1', comissao: 150.00 },
    { nome: 'Cliente 2', comissao: 200.00 },
    { nome: 'Cliente 3', comissao: 180.00 },
    { nome: 'Cliente 4', comissao: 220.00 },
    { nome: 'Cliente 5', comissao: 175.00 },
];

console.log(`\n${'='.repeat(70)}`);
console.log(`🎯 PROCESSANDO ${clientes.length} NOVOS CLIENTES`);
console.log(`${'='.repeat(70)}`);

clientes.forEach((cliente, idx) => {
    console.log(`\n[${idx + 1}/${clientes.length}] Processando ${cliente.nome}...`);
    engine.registrarNovaVenda(cliente.comissao);
});

// Show final state
console.log(`\n${'='.repeat(70)}`);
console.log(`📈 ESTADO FINAL:`);
console.log(`${'='.repeat(70)}`);

const finalMetrics = engine.getTotalMetrics();
console.log(`\nReceita Fixa Total:        R$ ${finalMetrics.receitaFixa.toFixed(2).padStart(10)}`);
console.log(`Receita Variável Total:    R$ ${finalMetrics.receitaVariavel.toFixed(2).padStart(10)}`);
console.log(`                           ${'─'.repeat(30)}`);
console.log(`Receita Total:             R$ ${finalMetrics.receitaTotal.toFixed(2).padStart(10)}`);
console.log(`\nCOGS Total:                R$ ${finalMetrics.cogs.toFixed(2).padStart(10)}`);
console.log(`Impostos Total:            R$ ${finalMetrics.impostos.toFixed(2).padStart(10)}`);
console.log(`                           ${'─'.repeat(30)}`);
console.log(`Resultado Bruto:           R$ ${finalMetrics.resultadoBruto.toFixed(2).padStart(10)}`);
console.log(`Lucro Líquido:             R$ ${finalMetrics.lucroLiquido.toFixed(2).padStart(10)}`);
console.log(`\n${'='.repeat(70)}`);
console.log(`✅ Simulação concluída! Confira transacoes.log para auditoria.`);
console.log(`${'='.repeat(70)}\n`);
