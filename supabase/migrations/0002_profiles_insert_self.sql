-- Allow a signed-in user to create their own profile row once (e.g. if the
-- auth trigger did not run or the account predates the trigger).
drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert with check (auth.uid() = id);
