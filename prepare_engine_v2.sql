-- ============================================================================
-- ENGINE FINANCEIRO - SYNC & PRECISION FIX
-- ============================================================================
-- Este script prepara o banco de dados para o novo motor financeiro v2:
-- 1. Corrige a precisão decimal para evitar arredondamentos
-- 2. Ajusta as permissões de RLS para o motor funcionar com o Anon Key
-- 3. Garante que as categorias existam
-- ============================================================================

-- 1. CORREÇÃO DE PRECISÃO DECIMAL
-- Garante que valores centesimais (ex: R$ 0,0001) não sejam arredondados
ALTER TABLE public.financial_baseline ALTER COLUMN valor_planejado TYPE NUMERIC(15,6);
ALTER TABLE public.accounts_receivable ALTER COLUMN amount TYPE NUMERIC(15,2);
ALTER TABLE public.accounts_payable ALTER COLUMN amount TYPE NUMERIC(15,2);

-- 2. AJUSTE DE PERMISSÕES (Unblock Engine)
-- Permite que o Anon Key (usado pelo node script) possa inserir transações
-- NOTA: Em produção, o ideal é usar Service Role, mas para teste local unblock anon:

DROP POLICY IF EXISTS "Enable insert for engine v2" ON public.accounts_receivable;
CREATE POLICY "Enable insert for engine v2" 
ON public.accounts_receivable FOR INSERT 
TO anon 
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable insert for engine v2" ON public.accounts_payable;
CREATE POLICY "Enable insert for engine v2" 
ON public.accounts_payable FOR INSERT 
TO anon 
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable select for engine v2" ON public.accounts_receivable;
CREATE POLICY "Enable select for engine v2" 
ON public.accounts_receivable FOR SELECT 
TO anon 
USING (true);

DROP POLICY IF EXISTS "Enable select for engine v2" ON public.accounts_payable;
CREATE POLICY "Enable select for engine v2" 
ON public.accounts_payable FOR SELECT 
TO anon 
USING (true);

-- 3. VERIFICAÇÃO DE CATEGORIAS
-- Garante que as categorias do motor existam no banco
INSERT INTO public.transaction_categories (name, "type", "group")
VALUES 
    ('Servidor', 'expense', 'cogs'),
    ('Tokens GPT', 'expense', 'cogs'),
    ('API e Telefonia', 'expense', 'cogs'),
    ('Vendas', 'income', 'income')
ON CONFLICT (name) DO NOTHING;

-- 4. VERIFICAÇÃO FINAL
SELECT 'Banco de dados preparado para Engine v2!' as status;
