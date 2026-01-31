-- HARD RESET TEAM DATA
-- Keeps ONLY 'pluvisoto@gmail.com'
-- Deletes everyone else.

-- 1. Delete all invitations
delete from public.invitations;

-- 2. Delete all teams
delete from public.teams;

-- 3. Delete all profiles EXCEPT the owner
delete from public.profiles 
where email <> 'pluvisoto@gmail.com';

-- 4. Ensure owner is Admin and Active
update public.profiles
set role = 'admin', status = 'active', team_id = null
where email = 'pluvisoto@gmail.com';

select * from public.profiles;
