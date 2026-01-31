-- EMERGENCY UNLOCK
-- Disables all Row Level Security permissions so you can work freely.

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations DISABLE ROW LEVEL SECURITY;

-- Optional: Verify it's verified
select 'SEGURANÇA DESATIVADA COM SUCESSO' as status;
