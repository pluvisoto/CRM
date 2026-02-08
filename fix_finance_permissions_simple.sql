-- Allow any authenticated user to Insert/Update/Sales on financial tables for now
-- This unblocks the "Error saving" issue caused by missing 'admin' profile roles

-- Accounts Payable
alter table public.accounts_payable enable row level security;

drop policy if exists "Enable access for authenticated users payable" on public.accounts_payable;
create policy "Enable access for authenticated users payable"
  on public.accounts_payable
  for all
  to authenticated
  using (true)
  with check (true);

-- Accounts Receivable
alter table public.accounts_receivable enable row level security;

drop policy if exists "Enable access for authenticated users receivable" on public.accounts_receivable;
create policy "Enable access for authenticated users receivable"
  on public.accounts_receivable
  for all
  to authenticated
  using (true)
  with check (true);
