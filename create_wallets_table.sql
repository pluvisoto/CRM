-- ==============================================
-- WALLETS / CARDS TABLE
-- ==============================================

create table if not exists public.wallets (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Card Details
  holder_name text not null,
  provider text not null, -- VISA, MASTERCARD, NUBANK, etc
  last4 text not null,
  expiry_date text not null, -- MM/YY
  
  -- Financials
  balance numeric not null default 0,
  limit_amount numeric not null default 0,
  
  -- Visuals & Type
  type text not null, -- Credit, Debit, Investment, etc
  gradient text not null, -- CSS gradient string for UI
  
  -- Relations
  created_by uuid not null references public.profiles(id)
);

-- Indexes
create index if not exists idx_wallets_created_by on public.wallets(created_by);

-- RLS Policies
alter table public.wallets enable row level security;

drop policy if exists "Users manage own wallets" on public.wallets;
create policy "Users manage own wallets" on public.wallets
  for all using (auth.uid() = created_by);

-- Auto-update updated_at
drop trigger if exists update_wallets_timestamp on public.wallets;
create trigger update_wallets_timestamp
  before update on public.wallets
  for each row execute function update_payable_timestamp(); -- Reusing existing timestamp function
