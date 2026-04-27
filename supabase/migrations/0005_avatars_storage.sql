-- Public bucket for profile photos: path layout `{user_id}/{filename}`
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

drop policy if exists "avatars read" on storage.objects;
create policy "avatars read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars upload own" on storage.objects;
create policy "avatars upload own" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars update own" on storage.objects;
create policy "avatars update own" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars delete own" on storage.objects;
create policy "avatars delete own" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
