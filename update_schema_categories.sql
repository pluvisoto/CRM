-- 1. Create Categories Table
create table if not exists public.transaction_categories (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null unique,
  type text not null, -- 'income' or 'expense'
  "group" text not null, -- 'revenue', 'cogs', 'opex', 'marketing'
  created_by uuid references public.profiles(id)
);

-- 2. Enable RLS
alter table public.transaction_categories enable row level security;

create policy "Enable read access for all users" on public.transaction_categories for select using (true);
create policy "Enable insert for authenticated users" on public.transaction_categories for insert with check (auth.role() = 'authenticated');
create policy "Enable update for authenticated users" on public.transaction_categories for update using (auth.role() = 'authenticated');
create policy "Enable delete for authenticated users" on public.transaction_categories for delete using (auth.role() = 'authenticated');

-- 3. Add FK to Transactions
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'accounts_payable' and column_name = 'category_id') then
        alter table public.accounts_payable add column category_id uuid references public.transaction_categories(id);
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'accounts_receivable' and column_name = 'category_id') then
        alter table public.accounts_receivable add column category_id uuid references public.transaction_categories(id);
    end if;
end $$;

-- 4. Seed Initial Categories (Optional but helpful)
insert into public.transaction_categories (name, type, "group") values
('Vendas de Serviços', 'income', 'revenue'),
('Vendas de Produtos', 'income', 'revenue'),
('Fornecedores', 'expense', 'cogs'),
('Matéria Prima', 'expense', 'cogs'),
('Marketing / Ads', 'expense', 'marketing'),
('Aluguel', 'expense', 'opex'),
('Salários', 'expense', 'opex'),
('Software / SaaS', 'expense', 'opex'),
('Impostos', 'expense', 'opex')
on conflict (name) do nothing;
