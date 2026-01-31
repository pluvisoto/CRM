-- FIX MANAGER PERMISSIONS RELIABLY
-- 1. Helper Function to check Admin status WITHOUT triggering RLS recursion
create or replace function public.is_admin()
returns boolean
language sql
security definer -- Bypass RLS
set search_path = public -- Secure search path
stable
as $$
  select exists (
    select 1 
    from public.profiles 
    where id = auth.uid() 
    and role = 'admin'
  );
$$;

-- 2. FIX PROFILES (Allow Admins to edit everyone)
alter table public.profiles disable row level security;
alter table public.profiles enable row level security;

drop policy if exists "Allow Public Read" on public.profiles;
drop policy if exists "Allow Self Update" on public.profiles;
drop policy if exists "Allow Self Insert" on public.profiles;
drop policy if exists "Allow Self Delete" on public.profiles;
-- Drop any leftovers
drop policy if exists "Admins Update All" on public.profiles;

-- New READ: Public
create policy "Read Profiles" on public.profiles for select using (true);

-- New INSERT: Self or Admin
create policy "Manage Profiles Insert" on public.profiles for insert 
with check ( auth.uid() = id or is_admin() );

-- New UPDATE: Self or Admin (Crucial for changing teams/roles)
create policy "Manage Profiles Update" on public.profiles for update 
using ( auth.uid() = id or is_admin() );

-- New DELETE: Self or Admin
create policy "Manage Profiles Delete" on public.profiles for delete 
using ( auth.uid() = id or is_admin() );


-- 3. FIX INVITATIONS (Allow Admins to do everything)
alter table public.invitations disable row level security;
alter table public.invitations enable row level security;

-- Clear old policies
drop policy if exists "Admins manage invitations" on public.invitations;
drop policy if exists "Users can see their own invitations" on public.invitations;
drop policy if exists "Everyone insert invites" on public.invitations;
drop policy if exists "Everyone delete invites" on public.invitations;

-- READ: Own email OR Admin
create policy "Read Invitations" on public.invitations for select 
using ( 
  email = (select email from public.profiles where id = auth.uid()) 
  or is_admin() 
);

-- WRITE/DELETE: Admin Only (or Manager, but let's stick to Admin for now)
create policy "Manage Invitations" on public.invitations for all 
using ( is_admin() );


-- 4. FIX TEAMS (Allow Admins/Supervisors to manage)
alter table public.teams disable row level security;
alter table public.teams enable row level security;

create policy "Read Teams" on public.teams for select using (true);

create policy "Manage Teams" on public.teams for all 
using ( is_admin() );

