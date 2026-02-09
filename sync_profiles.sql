-- Sync all users from auth.users to public.profiles
-- This fixes the "foreign key constraint" error when saving financial records

insert into public.profiles (id, email, role, status)
select 
  id, 
  email, 
  'admin', -- default role for recovered users
  'active' -- default status
from auth.users
on conflict (id) do nothing;

-- Verify the result
select count(*) as total_profiles from public.profiles;
