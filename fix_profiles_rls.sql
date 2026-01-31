-- 1. Enable RLS on profiles (just in case it wasn't)
alter table public.profiles enable row level security;

-- 2. Allow Admins to see ALL profiles (so they can approve/manage users)
create policy "Admins can view all profiles"
on public.profiles for select
using (
  auth.uid() in (select id from public.profiles where role = 'admin')
);

-- 3. Allow Admins to update ALL profiles (to change roles/teams)
create policy "Admins can update all profiles"
on public.profiles for update
using (
  auth.uid() in (select id from public.profiles where role = 'admin')
);

-- 4. Allow users to view their own profile
create policy "Users can view own profile"
on public.profiles for select
using (
  auth.uid() = id
);

-- 5. Allow users to update their own profile (e.g. name, avatar)
create policy "Users can update own profile"
on public.profiles for update
using (
  auth.uid() = id
);

-- 6. Allow public read access to basic info? (Optional, maybe for Team Listings)
-- For now, let's stick to strict rules. If everyone needs to see teammates:
create policy "Users can view profiles in their team"
on public.profiles for select
using (
  team_id in (select team_id from public.profiles where id = auth.uid())
);
