
-- LIBERAR ACESSO TOTAL PARA ATUALIZAÇÃO DE ETAPAS (Fix Global Color Problem)
-- Remove a política restritiva que exige 'admin' na tabela profiles

DROP POLICY IF EXISTS "Admins manage all stages" ON public.pipeline_stages;
DROP POLICY IF EXISTS "Authenticated users can update stages" ON public.pipeline_stages;

-- Criar política permissiva para usuários autenticados (Garante que a cor salve)
CREATE POLICY "Authenticated users can manage stages"
ON public.pipeline_stages
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Garantir que a tabela central_vendas também esteja acessível para o dono
-- caso o registro de profile falhe no banco
DROP POLICY IF EXISTS "Owner bypass for central_vendas" ON public.central_vendas;
CREATE POLICY "Owner bypass for central_vendas"
ON public.central_vendas
FOR ALL
TO authenticated
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'pluvisoto@gmail.com'
  OR auth.uid() = created_by
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'supervisor'))
);
