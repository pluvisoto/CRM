-- ==============================================
-- SAMPLE DATA FOR TESTING FINANCIAL DASHBOARD
-- ==============================================
-- STEP 1: First, get your user ID by running this:

SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Copy your user ID (the UUID) and replace '9e56cc13-ba79-4ac5-8ef9-58306a9f4504' below

-- ==============================================
-- STEP 2: Replace 9e56cc13-ba79-4ac5-8ef9-58306a9f4504 with your actual UUID
-- ==============================================

-- Sample Receivables (3 accounts)
INSERT INTO public.accounts_receivable (
  description, category, amount, due_date, created_by, status
) VALUES 
(
  'Cliente ABC Ltda - Mensalidade Janeiro 2026',
  'Receita Fixa - Mensalidade',
  5000,
  current_date + interval '10 days',
  '9e56cc13-ba79-4ac5-8ef9-58306a9f4504'::uuid,  -- ← REPLACE THIS
  'pending'
),
(
  'Cliente XYZ Corp - Comissão Vendas Dezembro',
  'Receita Variável - Comissão sobre Vendas Recuperadas',
  3200,
  current_date + interval '5 days',
  '9e56cc13-ba79-4ac5-8ef9-58306a9f4504'::uuid,  -- ← REPLACE THIS
  'pending'
),
(
  'Cliente 123 ME - Mensalidade Dezembro (VENCIDA)',
  'Receita Fixa - Mensalidade',
  4500,
  current_date - interval '5 days', -- OVERDUE
  '9e56cc13-ba79-4ac5-8ef9-58306a9f4504'::uuid,  -- ← REPLACE THIS
  'overdue'
)
ON CONFLICT DO NOTHING;

-- Sample Payables (5 accounts)
INSERT INTO public.accounts_payable (
  description, category, amount, due_date, created_by, status
) VALUES 
(
  'Google Workspace - Janeiro 2026',
  'Google Workspace',
  150,
  current_date + interval '15 days',
  '9e56cc13-ba79-4ac5-8ef9-58306a9f4504'::uuid,  -- ← REPLACE THIS
  'pending'
),
(
  'Energia Elétrica - Dezembro (VENCIDA)',
  'Energia Elétrica',
  450,
  current_date - interval '3 days', -- OVERDUE
  '9e56cc13-ba79-4ac5-8ef9-58306a9f4504'::uuid,  -- ← REPLACE THIS
  'overdue'
),
(
  'Internet/Telefonia - Janeiro',
  'Internet / Telefonia',
  200,
  current_date + interval '20 days',
  '9e56cc13-ba79-4ac5-8ef9-58306a9f4504'::uuid,  -- ← REPLACE THIS
  'pending'
),
(
  'Servidor AWS - Janeiro',
  'Servidor',
  380,
  current_date + interval '8 days',
  '9e56cc13-ba79-4ac5-8ef9-58306a9f4504'::uuid,  -- ← REPLACE THIS
  'pending'
),
(
  'Tokens GPT - Dezembro (PAGO)',
  'Tokens GPT',
  250,
  current_date - interval '10 days',
  '9e56cc13-ba79-4ac5-8ef9-58306a9f4504'::uuid,  -- ← REPLACE THIS
  'paid'
) 
ON CONFLICT DO NOTHING;

-- Update the paid account with paid_date
UPDATE public.accounts_payable 
SET paid_date = current_date - interval '11 days',
    payment_method = 'pix'
WHERE description LIKE '%Tokens GPT%' 
  AND created_by = '9e56cc13-ba79-4ac5-8ef9-58306a9f4504'::uuid;  -- ← REPLACE THIS

-- ==============================================
-- STEP 3: Verify the data was inserted
-- ==============================================

SELECT 
  'RECEIVABLES' as type,
  description,
  amount,
  status,
  due_date
FROM public.accounts_receivable
WHERE created_by = '9e56cc13-ba79-4ac5-8ef9-58306a9f4504'::uuid  -- ← REPLACE THIS

UNION ALL

SELECT 
  'PAYABLES' as type,
  description,
  amount,
  status,
  due_date
FROM public.accounts_payable
WHERE created_by = '9e56cc13-ba79-4ac5-8ef9-58306a9f4504'::uuid  -- ← REPLACE THIS
ORDER BY status, due_date;
