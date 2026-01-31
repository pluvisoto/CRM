-- FIX RLS FOR CRM TABLES
-- Allow Admins and Supervisors full access to all deals

-- 1. CENTRAL VENDAS
ALTER TABLE public.central_vendas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage all central_vendas" ON public.central_vendas;
CREATE POLICY "Admins manage all central_vendas" ON public.central_vendas
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Supervisors manage all central_vendas" ON public.central_vendas;
CREATE POLICY "Supervisors manage all central_vendas" ON public.central_vendas
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'supervisor')
  );

DROP POLICY IF EXISTS "Users manage own central_vendas" ON public.central_vendas;
CREATE POLICY "Users manage own central_vendas" ON public.central_vendas
  FOR ALL USING (auth.uid() = created_by);

-- 2. PIPELINE STAGES
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage all stages" ON public.pipeline_stages;
CREATE POLICY "Admins manage all stages" ON public.pipeline_stages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Everyone can view stages" ON public.pipeline_stages;
CREATE POLICY "Everyone can view stages" ON public.pipeline_stages
  FOR SELECT USING (true);
