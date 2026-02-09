-- Function to clone recurring transactions upon payment/receipt
CREATE OR REPLACE FUNCTION public.handle_recurring_transaction()
RETURNS TRIGGER AS $$
DECLARE
  next_due_date DATE;
  new_status TEXT;
BEGIN
  -- Check if:
  -- 1. It is a recurring transaction
  -- 2. It is being marked as Completed (paid/received) from a Pending state (or just being inserted as completed)
  -- 3. We want to avoid infinite loops if the new one is auto-inserted. Only Trigger on explicit updates usually.
  
  -- We trigger on UPDATE.
  -- IF OLD.status != 'paid' AND NEW.status = 'paid' (for payable) ... 
  -- Simplification: Just check if we are transitioning to a completed state.

  IF NEW.is_recurring = TRUE AND NEW.status IN ('paid', 'received') AND (OLD.status IS NULL OR OLD.status != NEW.status) THEN
    
    -- Calculate next due date (6 months later to maintain buffer)
    next_due_date := NEW.due_date + INTERVAL '6 months';
    
    -- Insert Clone
    IF TG_TABLE_NAME = 'accounts_receivable' THEN
      INSERT INTO public.accounts_receivable (
        description, amount, type, category, status, due_date, wallet_id, created_by, is_recurring
      ) VALUES (
        NEW.description, NEW.amount, NEW.type, NEW.category, 'pending', next_due_date, NEW.wallet_id, NEW.created_by, TRUE
      );
    ELSIF TG_TABLE_NAME = 'accounts_payable' THEN
      INSERT INTO public.accounts_payable (
        description, amount, type, category, status, due_date, wallet_id, created_by, is_recurring
      ) VALUES (
        NEW.description, NEW.amount, NEW.type, NEW.category, 'pending', next_due_date, NEW.wallet_id, NEW.created_by, TRUE
      );
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply Triggers
DROP TRIGGER IF EXISTS trg_recurring_receivable ON public.accounts_receivable;
CREATE TRIGGER trg_recurring_receivable
AFTER UPDATE ON public.accounts_receivable
FOR EACH ROW EXECUTE FUNCTION public.handle_recurring_transaction();

DROP TRIGGER IF EXISTS trg_recurring_payable ON public.accounts_payable;
CREATE TRIGGER trg_recurring_payable
AFTER UPDATE ON public.accounts_payable
FOR EACH ROW EXECUTE FUNCTION public.handle_recurring_transaction();
