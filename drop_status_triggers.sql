-- Drop the auto-update status triggers
DROP TRIGGER IF EXISTS auto_update_receivable_status ON public.accounts_receivable;
DROP TRIGGER IF EXISTS auto_update_payable_status ON public.accounts_payable;

-- Drop the function as well to clean up (optional, but good practice if unused)
DROP FUNCTION IF EXISTS public.update_account_status();
