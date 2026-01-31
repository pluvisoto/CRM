-- ==============================================
-- FINANCIAL MANAGEMENT TABLES
-- Accounts Payable (Contas a Pagar) & Receivable (Contas a Receber)
-- ==============================================

-- ==============================================
-- 1. ACCOUNTS RECEIVABLE (Contas a Receber)
-- ==============================================
create table if not exists public.accounts_receivable (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Core Fields
  description text not null,
  category text not null,
  amount numeric not null check (amount > 0),
  
  -- Dates
  due_date date not null,
  received_date date null,
  
  -- Status (auto-calculated based on dates)
  status text not null default 'pending' check (status in ('pending', 'received', 'overdue')),
  
  -- Payment Details
  payment_method text null, -- pix, transfer, card, cash, etc
  
  -- Relations
  deal_id uuid null references public.deals(id) on delete set null,
  created_by uuid not null references public.profiles(id),
  
  -- Additional Info
  notes text,
  attachment_url text null -- OPTIONAL: link to Supabase Storage
);

-- Indexes for performance
create index if not exists idx_receivable_status on public.accounts_receivable(status);
create index if not exists idx_receivable_due_date on public.accounts_receivable(due_date);
create index if not exists idx_receivable_created_by on public.accounts_receivable(created_by);
create index if not exists idx_receivable_deal on public.accounts_receivable(deal_id) where deal_id is not null;

-- RLS Policies
alter table public.accounts_receivable enable row level security;

drop policy if exists "Admins full access receivable" on public.accounts_receivable;
create policy "Admins full access receivable" on public.accounts_receivable
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists "Supervisors read receivable" on public.accounts_receivable;
create policy "Supervisors read receivable" on public.accounts_receivable
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'supervisor'))
  );

-- Auto-update updated_at
create or replace function update_receivable_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_receivable_timestamp on public.accounts_receivable;
create trigger update_receivable_timestamp
  before update on public.accounts_receivable
  for each row execute function update_receivable_timestamp();

-- ==============================================
-- 2. ACCOUNTS PAYABLE (Contas a Pagar)
-- ==============================================
create table if not exists public.accounts_payable (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Core Fields
  description text not null,
  category text not null,
  amount numeric not null check (amount > 0),
  
  -- Dates
  due_date date not null,
  paid_date date null,
  
  -- Status (auto-calculated based on dates)
  status text not null default 'pending' check (status in ('pending', 'paid', 'overdue')),
  
  -- Payment Details
  payment_method text null,
  
  -- Relations
  created_by uuid not null references public.profiles(id),
  
  -- Additional Info
  notes text,
  attachment_url text null -- OPTIONAL
);

-- Indexes
create index if not exists idx_payable_status on public.accounts_payable(status);
create index if not exists idx_payable_due_date on public.accounts_payable(due_date);
create index if not exists idx_payable_created_by on public.accounts_payable(created_by);
create index if not exists idx_payable_category on public.accounts_payable(category);

-- RLS Policies
alter table public.accounts_payable enable row level security;

drop policy if exists "Admins full access payable" on public.accounts_payable;
create policy "Admins full access payable" on public.accounts_payable
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists "Supervisors read payable" on public.accounts_payable;
create policy "Supervisors read payable" on public.accounts_payable
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'supervisor'))
  );

-- Auto-update updated_at
create or replace function update_payable_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_payable_timestamp on public.accounts_payable;
create trigger update_payable_timestamp
  before update on public.accounts_payable
  for each row execute function update_payable_timestamp();

-- ==============================================
-- 3. FINANCIAL CATEGORIES (Reference)
-- ==============================================
-- These are the valid categories from your spreadsheet

comment on column public.accounts_receivable.category is 
'Valid categories: Receita Fixa - Mensalidade, Receita Variável - Comissão sobre Vendas Recuperadas';

comment on column public.accounts_payable.category is 
'Valid categories:
CUSTO DAS VENDAS:
- Custos Gerais
- Taxas de Checkout
- Servidor
- API Oficial Whatsapp
- Tokens GPT
- Telefone
- Custos de Pessoal (Mão de Obra Direta)

DESPESA OPERACIONAL:
FOLHA DE PAGAMENTO:
- Pró Labore - CEO
- Pró Labore - Operacional
- Auxiliar de Serviços Gerais
- Desenvolvedor
- Gestor de Tráfego
- Designer / Editor de Vídeo
- Vendedores
- Customer Success

DESPESAS FIXAS:
- CRM
- Internet / Telefonia
- Contabilidade
- Condomínio
- Energia Elétrica
- Aluguel
- Google Workspace
- Notion
- Treinamentos Udemy
- Jurídico

DESPESAS VARIÁVEIS:
- Pagamento Multiplo Diego AM Engenharia
- Anúncios Online
- Dívida inadimplente
- Amortização do Ativo Circulante';

-- ==============================================
-- 4. HELPER FUNCTIONS
-- ==============================================

-- Function to auto-update status based on dates
create or replace function update_account_status()
returns trigger as $$
begin
  -- For receivables
  if tg_table_name = 'accounts_receivable' then
    if new.received_date is not null then
      new.status = 'received';
    elsif new.due_date < current_date then
      new.status = 'overdue';
    else
      new.status = 'pending';
    end if;
  end if;
  
  -- For payables
  if tg_table_name = 'accounts_payable' then
    if new.paid_date is not null then
      new.status = 'paid';
    elsif new.due_date < current_date then
      new.status = 'overdue';
    else
      new.status = 'pending';
    end if;
  end if;
  
  return new;
end;
$$ language plpgsql;

drop trigger if exists auto_update_receivable_status on public.accounts_receivable;
create trigger auto_update_receivable_status
  before insert or update on public.accounts_receivable
  for each row execute function update_account_status();

drop trigger if exists auto_update_payable_status on public.accounts_payable;
create trigger auto_update_payable_status
  before insert or update on public.accounts_payable
  for each row execute function update_account_status();

-- ==============================================
-- 5. SAMPLE DATA (for testing)
-- ==============================================
/*
-- Uncomment to insert sample data

-- Sample Receivable (R$ 5.000 vencendo daqui 10 dias)
insert into public.accounts_receivable (
  description, category, amount, due_date, created_by
) values (
  'Cliente ABC - Mensalidade Janeiro',
  'Receita Fixa - Mensalidade',
  5000,
  current_date + interval '10 days',
  auth.uid()
);

-- Sample Payable (R$ 2.000 vencido há 3 dias - OVERDUE)
insert into public.accounts_payable (
  description, category, amount, due_date, created_by
) values (
  'Google Workspace - Dezembro',
  'Google Workspace',
  200,
  current_date - interval '3 days',
  auth.uid()
);

-- Sample Paid Account (R$ 1.500 já pago)
insert into public.accounts_payable (
  description, category, amount, due_date, paid_date, payment_method, created_by
) values (
  'Energia Elétrica - Dezembro',
  'Energia Elétrica',
  350,
  current_date - interval '5 days',
  current_date - interval '6 days',
  'pix',
  auth.uid()
);
*/
