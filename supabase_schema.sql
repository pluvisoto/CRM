-- 1. Create TEAMS table
create table if not exists public.teams (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  supervisor_id uuid references public.profiles(id)
);

-- 2. Create INVITATIONS table
create table if not exists public.invitations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text not null,
  role text not null default 'sales',
  team_id uuid references public.teams(id),
  token text,
  status text default 'pending'
);

-- 3. Update PROFILES table
-- We use 'do' block to avoid errors if columns already exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'team_id') then
        alter table public.profiles add column team_id uuid references public.teams(id);
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'status') then
        alter table public.profiles add column status text default 'pending';
    end if;
end $$;

-- 4. RLS Policies (Secure access)
alter table public.teams enable row level security;
alter table public.invitations enable row level security;

-- Teams: Admins can do all, Supervisors can view their own team (logic to be refined), Everyone can view (for references)
create policy "Enable read access for all users" on public.teams for select using (true);
create policy "Enable insert for admins" on public.teams for insert with check (
  auth.uid() in (select id from public.profiles where role = 'admin')
);
create policy "Enable update for admins" on public.teams for update using (
  auth.uid() in (select id from public.profiles where role = 'admin')
);
create policy "Enable delete for admins" on public.teams for delete using (
  auth.uid() in (select id from public.profiles where role = 'admin')
);

-- Invitations: Admins read/write all
create policy "Admins manage invitations" on public.invitations for all using (
  auth.uid() in (select id from public.profiles where role = 'admin')
);

-- 5. Auto-approve first user (Safety net)
-- Run this if you want the existing users to be 'active'
update public.profiles set status = 'active' where status = 'pending' or status is null;
