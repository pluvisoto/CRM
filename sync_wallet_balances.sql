-- Function to update wallet balance on transaction changes
CREATE OR REPLACE FUNCTION public.update_wallet_balance()
RETURNS TRIGGER AS $$
DECLARE
  diff numeric;
BEGIN
  -- Handle DELETES
  IF (TG_OP = 'DELETE') THEN
    IF OLD.status IN ('received', 'paid') AND OLD.wallet_id IS NOT NULL THEN
      -- Reverse the effect: Subtract if it was income, Add if it was expense
      IF TG_TABLE_NAME = 'accounts_receivable' THEN
        UPDATE public.wallets SET balance = balance - OLD.amount WHERE id = OLD.wallet_id;
      ELSIF TG_TABLE_NAME = 'accounts_payable' THEN
        UPDATE public.wallets SET balance = balance + OLD.amount WHERE id = OLD.wallet_id;
      END IF;
    END IF;
    RETURN OLD;
  END IF;

  -- Handle INSERTS
  IF (TG_OP = 'INSERT') THEN
    IF NEW.status IN ('received', 'paid') AND NEW.wallet_id IS NOT NULL THEN
      IF TG_TABLE_NAME = 'accounts_receivable' THEN
        UPDATE public.wallets SET balance = balance + NEW.amount WHERE id = NEW.wallet_id;
      ELSIF TG_TABLE_NAME = 'accounts_payable' THEN
        UPDATE public.wallets SET balance = balance - NEW.amount WHERE id = NEW.wallet_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  -- Handle UPDATES
  IF (TG_OP = 'UPDATE') THEN
    -- 1. Revert OLD amount/status if it contributed to balance
    IF OLD.status IN ('received', 'paid') AND OLD.wallet_id IS NOT NULL THEN
       IF TG_TABLE_NAME = 'accounts_receivable' THEN
         UPDATE public.wallets SET balance = balance - OLD.amount WHERE id = OLD.wallet_id;
       ELSIF TG_TABLE_NAME = 'accounts_payable' THEN
         UPDATE public.wallets SET balance = balance + OLD.amount WHERE id = OLD.wallet_id;
       END IF;
    END IF;

    -- 2. Apply NEW amount/status if it contributes to balance
    IF NEW.status IN ('received', 'paid') AND NEW.wallet_id IS NOT NULL THEN
       IF TG_TABLE_NAME = 'accounts_receivable' THEN
         UPDATE public.wallets SET balance = balance + NEW.amount WHERE id = NEW.wallet_id;
       ELSIF TG_TABLE_NAME = 'accounts_payable' THEN
         UPDATE public.wallets SET balance = balance - NEW.amount WHERE id = NEW.wallet_id;
       END IF;
    END IF;
    
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply Triggers
DROP TRIGGER IF EXISTS trg_update_wallet_balance_receivable ON public.accounts_receivable;
CREATE TRIGGER trg_update_wallet_balance_receivable
AFTER INSERT OR UPDATE OR DELETE ON public.accounts_receivable
FOR EACH ROW EXECUTE FUNCTION public.update_wallet_balance();

DROP TRIGGER IF EXISTS trg_update_wallet_balance_payable ON public.accounts_payable;
CREATE TRIGGER trg_update_wallet_balance_payable
AFTER INSERT OR UPDATE OR DELETE ON public.accounts_payable
FOR EACH ROW EXECUTE FUNCTION public.update_wallet_balance();
