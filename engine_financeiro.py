#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Engine Financeiro - Core financial processing system
Processes CRM sales and updates financial schema with automatic cost allocation
"""

import json
import os
from datetime import datetime
from typing import Dict, Any


class EngineFinanceiro:
    """Financial engine for processing sales transactions"""
    
    SCHEMA_PATH = 'schema_financeiro.json'
    LOG_PATH = 'transacoes.log'
    
    # Business constants
    RECEITA_FIXA_POR_VENDA = 597.00
    TAXA_IMPOSTO = 0.16  # 16%
    
    # Unit COGS per sale
    COGS = {
        'Servidor': 10.00,
        'Tokens GPT': 10.00,
        'Telefone': 30.00,
        'API Oficial Whatsapp': 200.00
    }
    
    def __init__(self):
        """Initialize the financial engine"""
        self.schema = self.load_schema()
    
    def load_schema(self) -> Dict[str, Any]:
        """Load financial schema from JSON file"""
        if not os.path.exists(self.SCHEMA_PATH):
            raise FileNotFoundError(f"Schema file not found: {self.SCHEMA_PATH}")
        
        with open(self.SCHEMA_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def save_schema(self):
        """Save updated schema back to JSON file"""
        with open(self.SCHEMA_PATH, 'w', encoding='utf-8') as f:
            json.dump(self.schema, f, indent=2, ensure_ascii=False)
    
    def find_category(self, category_list: list, label: str) -> Dict[str, Any]:
        """Find a category by label in a list"""
        for item in category_list:
            if label.lower() in item['label'].lower():
                return item
        return None
    
    def registrar_nova_venda(self, valor_comissao_recuperada: float):
        """
        Process a new sale transaction
        
        Args:
            valor_comissao_recuperada: Variable commission amount from recovered sales
        """
        # Calculate totals
        receita_total = self.RECEITA_FIXA_POR_VENDA + valor_comissao_recuperada
        total_cogs = sum(self.COGS.values())
        impostos = receita_total * self.TAXA_IMPOSTO
        saldo_liquido = receita_total - total_cogs - impostos
        
        # Update Fixed Revenue
        receita_fixa = self.find_category(
            self.schema['receitas']['fixa'], 
            'Receita Fixa - Mensalidade'
        )
        if receita_fixa:
            receita_fixa['REAL_2026'] += self.RECEITA_FIXA_POR_VENDA
        
        # Update Variable Revenue
        receita_variavel = self.find_category(
            self.schema['receitas']['variavel'],
            'Receita Variável - Comissão'
        )
        if receita_variavel:
            receita_variavel['REAL_2026'] += valor_comissao_recuperada
        
        # Update Taxes
        impostos_item = self.find_category(
            self.schema['impostos'],
            'Impostos'
        )
        if impostos_item:
            impostos_item['REAL_2026'] += impostos
        
        # Update COGS (Variable Expenses)
        for cogs_name, cogs_value in self.COGS.items():
            cogs_item = self.find_category(
                self.schema['despesas_variaveis'],
                cogs_name
            )
            if cogs_item:
                cogs_item['REAL_2026'] += cogs_value
        
        # Save updated schema
        self.save_schema()
        
        # Log transaction
        self.log_transacao(
            receita_total=receita_total,
            total_cogs=total_cogs,
            impostos=impostos,
            saldo_liquido=saldo_liquido
        )
        
        # Print summary
        print(f"\n{'='*70}")
        print(f"✅ VENDA REGISTRADA")
        print(f"{'='*70}")
        print(f"Receita Fixa:              R$ {self.RECEITA_FIXA_POR_VENDA:>10.2f}")
        print(f"Receita Variável (Comissão): R$ {valor_comissao_recuperada:>10.2f}")
        print(f"                           {'─'*30}")
        print(f"Receita Total:             R$ {receita_total:>10.2f}")
        print(f"\nCustos Variáveis (COGS):")
        for cogs_name, cogs_value in self.COGS.items():
            print(f"  - {cogs_name:<25} R$ {cogs_value:>10.2f}")
        print(f"                           {'─'*30}")
        print(f"Total COGS:                R$ {total_cogs:>10.2f}")
        print(f"Impostos (16%):            R$ {impostos:>10.2f}")
        print(f"                           {'─'*30}")
        print(f"Resultado Bruto:           R$ {receita_total - total_cogs:>10.2f}")
        print(f"Saldo Líquido:             R$ {saldo_liquido:>10.2f}")
        print(f"{'='*70}\n")
        
        return {
            'receita_total': receita_total,
            'total_cogs': total_cogs,
            'impostos': impostos,
            'saldo_liquido': saldo_liquido
        }
    
    def log_transacao(self, receita_total: float, total_cogs: float, 
                     impostos: float, saldo_liquido: float):
        """
        Log transaction to audit file
        
        Args:
            receita_total: Total revenue for this sale
            total_cogs: Total cost of goods sold
            impostos: Tax amount
            saldo_liquido: Net profit after costs and taxes
        """
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log_line = (
            f"{timestamp} | "
            f"Venda: R$ {receita_total:>8.2f} | "
            f"COGS: R$ {total_cogs:>6.2f} | "
            f"Impostos: R$ {impostos:>8.2f} | "
            f"Líquido: R$ {saldo_liquido:>8.2f}\n"
        )
        
        with open(self.LOG_PATH, 'a', encoding='utf-8') as f:
            f.write(log_line)
    
    def get_total_metrics(self) -> Dict[str, float]:
        """Get current total metrics from schema"""
        total_receita_fixa = sum(
            item['REAL_2026'] for item in self.schema['receitas']['fixa']
        )
        total_receita_variavel = sum(
            item['REAL_2026'] for item in self.schema['receitas']['variavel']
        )
        total_impostos = sum(
            item['REAL_2026'] for item in self.schema['impostos']
        )
        total_cogs = sum(
            item['REAL_2026'] for item in self.schema['despesas_variaveis']
        )
        
        return {
            'receita_fixa': total_receita_fixa,
            'receita_variavel': total_receita_variavel,
            'receita_total': total_receita_fixa + total_receita_variavel,
            'impostos': total_impostos,
            'cogs': total_cogs,
            'resultado_bruto': total_receita_fixa + total_receita_variavel - total_cogs,
            'lucro_liquido': total_receita_fixa + total_receita_variavel - total_cogs - total_impostos
        }


# ============================================================================
# TEST SIMULATION - 5 New Customers
# ============================================================================

if __name__ == "__main__":
    print("\n" + "="*70)
    print("🚀 SIMULAÇÃO DE VENDAS - ENGINE FINANCEIRO")
    print("="*70)
    
    # Initialize engine
    engine = EngineFinanceiro()
    
    # Show initial state
    print("\n📊 ESTADO INICIAL:")
    metrics = engine.get_total_metrics()
    print(f"Receita Total Atual: R$ {metrics['receita_total']:.2f}")
    print(f"COGS Total Atual: R$ {metrics['cogs']:.2f}")
    print(f"Lucro Líquido Atual: R$ {metrics['lucro_liquido']:.2f}")
    
    # Simulate 5 new customers with varying commission values
    clientes = [
        {'nome': 'Cliente 1', 'comissao': 150.00},
        {'nome': 'Cliente 2', 'comissao': 200.00},
        {'nome': 'Cliente 3', 'comissao': 180.00},
        {'nome': 'Cliente 4', 'comissao': 220.00},
        {'nome': 'Cliente 5', 'comissao': 175.00},
    ]
    
    print(f"\n{'='*70}")
    print(f"🎯 PROCESSANDO {len(clientes)} NOVOS CLIENTES")
    print(f"{'='*70}")
    
    for idx, cliente in enumerate(clientes, 1):
        print(f"\n[{idx}/{len(clientes)}] Processando {cliente['nome']}...")
        engine.registrar_nova_venda(cliente['comissao'])
    
    # Show final state
    print(f"\n{'='*70}")
    print("📈 ESTADO FINAL:")
    print(f"{'='*70}")
    
    final_metrics = engine.get_total_metrics()
    print(f"\nReceita Fixa Total:        R$ {final_metrics['receita_fixa']:>10.2f}")
    print(f"Receita Variável Total:    R$ {final_metrics['receita_variavel']:>10.2f}")
    print(f"                           {'─'*30}")
    print(f"Receita Total:             R$ {final_metrics['receita_total']:>10.2f}")
    print(f"\nCOGS Total:                R$ {final_metrics['cogs']:>10.2f}")
    print(f"Impostos Total:            R$ {final_metrics['impostos']:>10.2f}")
    print(f"                           {'─'*30}")
    print(f"Resultado Bruto:           R$ {final_metrics['resultado_bruto']:>10.2f}")
    print(f"Lucro Líquido:             R$ {final_metrics['lucro_liquido']:>10.2f}")
    print(f"\n{'='*70}")
    print(f"✅ Simulação concluída! Confira transacoes.log para auditoria.")
    print(f"{'='*70}\n")
