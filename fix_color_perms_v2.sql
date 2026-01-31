
-- CORREÇÃO DE EMERGÊNCIA: Restaurar Negócios e Permissões de Cores
-- O erro anterior aconteceu porque o Supabase proíbe ler a tabela 'auth.users' de dentro de uma política pública.

-- 1. Limpar as políticas problemáticas
DROP POLICY IF EXISTS "Owner bypass for central_vendas" ON public.central_vendas;
DROP POLICY IF EXISTS "Authenticated users can manage stages" ON public.pipeline_stages;

-- 2. Recriar a política de Negócios (central_vendas) usando o método SEGURO
CREATE POLICY "Owner bypass for central_vendas"
ON public.central_vendas
FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'email') = 'pluvisoto@gmail.com'
  OR auth.uid() = created_by
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'supervisor'))
);

-- 3. Recriar a política de Cores e Etapas (pipeline_stages)
CREATE POLICY "Authenticated users can manage stages"
ON public.pipeline_stages
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Garantir que você tenha acesso à tabela de perfis sem erros 406
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);
