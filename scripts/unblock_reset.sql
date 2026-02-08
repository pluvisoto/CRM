-- TEMPORARY POLICY TO ALLOW HARD RESET VIA ANON KEY
-- USE WITH CAUTION ONLY DURING TEST SESSIONS

-- Enable ALL for central_vendas
DROP POLICY IF EXISTS "Enable all for reset" ON public.central_vendas;
CREATE POLICY "Enable all for reset" ON public.central_vendas FOR ALL TO anon USING (true);

-- Enable ALL for wallets
DROP POLICY IF EXISTS "Enable all for reset" ON public.wallets;
CREATE POLICY "Enable all for reset" ON public.wallets FOR ALL TO anon USING (true);

-- Enable ALL for dashboard_snapshots
DROP POLICY IF EXISTS "Enable all for reset" ON public.dashboard_snapshots;
CREATE POLICY "Enable all for reset" ON public.dashboard_snapshots FOR ALL TO anon USING (true);

-- Enable ALL for deals
DROP POLICY IF EXISTS "Enable all for reset" ON public.deals;
CREATE POLICY "Enable all for reset" ON public.deals FOR ALL TO anon USING (true);

-- Enable ALL for deal_notes
DROP POLICY IF EXISTS "Enable all for reset" ON public.deal_notes;
CREATE POLICY "Enable all for reset" ON public.deal_notes FOR ALL TO anon USING (true);

-- Enable ALL for deal_tasks
DROP POLICY IF EXISTS "Enable all for reset" ON public.deal_tasks;
CREATE POLICY "Enable all for reset" ON public.deal_tasks FOR ALL TO anon USING (true);

-- Enable ALL for accounts_receivable (already had one but unified names)
DROP POLICY IF EXISTS "Enable all for reset" ON public.accounts_receivable;
CREATE POLICY "Enable all for reset" ON public.accounts_receivable FOR ALL TO anon USING (true);

-- Enable ALL for accounts_payable
DROP POLICY IF EXISTS "Enable all for reset" ON public.accounts_payable;
CREATE POLICY "Enable all for reset" ON public.accounts_payable FOR ALL TO anon USING (true);
