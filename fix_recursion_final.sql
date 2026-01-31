-- NUCLEAR OPTION: DROP EVERYTHING ON PROFILES
alter table public.profiles disable row level security;

-- Drop every conceivable policy name we tried
drop policy if exists "Admins view all" on public.profiles;
drop policy if exists "Admins update all" on public.profiles;
drop policy if exists "Admins Insert All" on public.profiles;
drop policy if exists "Users view own" on public.profiles;
drop policy if exists "Users update own" on public.profiles;
drop policy if exists "Users insert own" on public.profiles;
drop policy if exists "Public Read" on public.profiles;
drop policy if exists "Self Update" on public.profiles;
drop policy if exists "Self Insert" on public.profiles;
drop policy if exists "Enable read access for all users" on public.profiles;
drop policy if exists "Enable insert for users based on user_id" on public.profiles;
drop policy if exists "Enable update for users based on email" on public.profiles;

-- Re-enable RLS
alter table public.profiles enable row level security;

-- 1. READ: Allow ANYONE to read profiles (Absolute safest against recursion)
create policy "Allow Public Read" 
on public.profiles for select 
using (true);

-- 2. UPDATE: Allow users to update ONLY their own ID
create policy "Allow Self Update" 
on public.profiles for update 
using (auth.uid() = id);

-- 3. INSERT: Allow users to insert ONLY their own ID
create policy "Allow Self Insert" 
on public.profiles for insert 
with check (auth.uid() = id);

-- 4. DELETE: Allow users to delete ONLY their own ID
create policy "Allow Self Delete" 
on public.profiles for delete 
using (auth.uid() = id);
