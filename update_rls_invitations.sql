-- POLICY: Allow users to read invitations sent to their email
-- This is crucial for the "Auto-Accept Invite" logic on signup.
-- Without this, the frontend cannot find the invite to claim it.

create policy "Users can see their own invitations" on public.invitations
for select using (
  email = auth.email()
);

-- OPTIONAL: Verify policies
-- select * from pg_policies where table_name = 'invitations';
