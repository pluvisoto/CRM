-- MASTER FIX SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. FIX PERMISSIONS (RLS) - Define safe Admin check
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- 2. RESET PROFILE POLICIES
alter table public.profiles enable row level security;
drop policy if exists "Read All" on public.profiles;
drop policy if exists "Manage All" on public.profiles;
drop policy if exists "Allow Public Read" on public.profiles;
drop policy if exists "Allow Self Update" on public.profiles;
drop policy if exists "Allow Self Insert" on public.profiles;
-- Create simple, permissive policies
create policy "Read All" on public.profiles for select using (true);
create policy "Manage All" on public.profiles for all using (auth.uid() = id or is_admin());

-- 3. RESET OTHER TABLE POLICIES
-- Invitation Permissions
alter table public.invitations enable row level security;
drop policy if exists "Manage Invitations" on public.invitations;
drop policy if exists "Read Invitations" on public.invitations;
create policy "Manage Invitations" on public.invitations for all using (is_admin());
create policy "Read Invitations" on public.invitations for select using (true);

-- Team Permissions
alter table public.teams enable row level security;
drop policy if exists "Manage Teams" on public.teams;
drop policy if exists "Read Teams" on public.teams;
create policy "Manage Teams" on public.teams for all using (is_admin());
create policy "Read Teams" on public.teams for select using (true);

-- 4. EMERGENCY ADMIN RESTORE
-- Force update existing profile
update public.profiles 
set role = 'admin', status = 'active'
where email = 'pluvisoto@gmail.com';

-- Ensure profile exists (insert if missing)
insert into public.profiles (id, email, role, status, full_name)
select id, email, 'admin', 'active', 'Paulo (Admin)'
from auth.users
where email = 'pluvisoto@gmail.com'
on conflict (id) do update 
set role = 'admin', status = 'active';
