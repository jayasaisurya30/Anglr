-- ============================================================
-- ANGLR initial schema
-- Run against your Supabase project (SQL Editor or supabase db push).
-- ============================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ------------------------------------------------------------
-- Enums
-- ------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'catch_visibility') then
    create type catch_visibility as enum ('private', 'friends', 'public');
  end if;

  if not exists (select 1 from pg_type where typname = 'follow_request_status') then
    create type follow_request_status as enum ('pending', 'accepted', 'declined');
  end if;

  if not exists (select 1 from pg_type where typname = 'notification_type') then
    create type notification_type as enum (
      'follow_request',
      'follow_accept',
      'like',
      'comment'
    );
  end if;
end$$;

-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username citext unique not null,
  handle citext unique not null check (char_length(handle) between 2 and 24),
  display_name text,
  bio text,
  avatar_url text,
  biggest_fish_lbs numeric(7,2) default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_handle_idx on public.profiles (handle);
create index if not exists profiles_username_idx on public.profiles (username);

-- ------------------------------------------------------------
-- settings (1-1 with profiles)
-- ------------------------------------------------------------
create table if not exists public.settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  share_private_map boolean not null default false,
  notify_likes boolean not null default true,
  notify_comments boolean not null default true,
  notify_follows boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- catches
-- ------------------------------------------------------------
create table if not exists public.catches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  species text,
  weight_lbs numeric(7,2),
  caught_at timestamptz not null default now(),
  lat double precision not null,
  lng double precision not null,
  notes text,
  bait text,
  visibility catch_visibility not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists catches_user_id_idx on public.catches (user_id);
create index if not exists catches_visibility_idx on public.catches (visibility);
create index if not exists catches_caught_at_idx on public.catches (caught_at desc);
create index if not exists catches_geo_idx on public.catches (lat, lng);

-- ------------------------------------------------------------
-- catch_images
-- ------------------------------------------------------------
create table if not exists public.catch_images (
  id uuid primary key default gen_random_uuid(),
  catch_id uuid not null references public.catches(id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists catch_images_catch_id_idx on public.catch_images (catch_id);

-- ------------------------------------------------------------
-- likes
-- ------------------------------------------------------------
create table if not exists public.likes (
  catch_id uuid not null references public.catches(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (catch_id, user_id)
);

create index if not exists likes_user_idx on public.likes (user_id);

-- ------------------------------------------------------------
-- comments
-- ------------------------------------------------------------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  catch_id uuid not null references public.catches(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 800),
  created_at timestamptz not null default now()
);

create index if not exists comments_catch_idx on public.comments (catch_id, created_at desc);

-- ------------------------------------------------------------
-- follows (directional; a -> b means a follows b)
-- ------------------------------------------------------------
create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create index if not exists follows_following_idx on public.follows (following_id);

-- ------------------------------------------------------------
-- follow_requests
-- ------------------------------------------------------------
create table if not exists public.follow_requests (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references public.profiles(id) on delete cascade,
  to_user uuid not null references public.profiles(id) on delete cascade,
  status follow_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (from_user <> to_user),
  unique (from_user, to_user)
);

create index if not exists fr_to_idx on public.follow_requests (to_user, status);

-- ------------------------------------------------------------
-- notifications
-- ------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type notification_type not null,
  catch_id uuid references public.catches(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx
  on public.notifications (user_id, created_at desc);

-- ============================================================
-- Helper functions
-- ============================================================

-- True iff viewer and owner follow each other (mutual = "friends")
create or replace function public.is_mutual_follow(viewer uuid, owner uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.follows f1
    join public.follows f2
      on f1.follower_id = f2.following_id
     and f1.following_id = f2.follower_id
    where f1.follower_id = viewer and f1.following_id = owner
  );
$$;

-- ============================================================
-- Triggers
-- ============================================================

-- updated_at bumping
create or replace function public.tg_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch before update on public.profiles
  for each row execute function public.tg_touch_updated_at();

drop trigger if exists trg_settings_touch on public.settings;
create trigger trg_settings_touch before update on public.settings
  for each row execute function public.tg_touch_updated_at();

drop trigger if exists trg_catches_touch on public.catches;
create trigger trg_catches_touch before update on public.catches
  for each row execute function public.tg_touch_updated_at();

-- Keep profiles.biggest_fish_lbs in sync
create or replace function public.tg_update_biggest_fish()
returns trigger language plpgsql as $$
begin
  update public.profiles p
  set biggest_fish_lbs = coalesce((
    select max(c.weight_lbs)
    from public.catches c
    where c.user_id = coalesce(new.user_id, old.user_id)
  ), 0)
  where p.id = coalesce(new.user_id, old.user_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_catches_biggest on public.catches;
create trigger trg_catches_biggest
  after insert or update of weight_lbs or delete on public.catches
  for each row execute function public.tg_update_biggest_fish();

-- Auto-create profile + settings rows when a new auth.user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_username text;
  v_handle text;
  v_display text;
begin
  v_username := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  );
  v_handle := coalesce(
    new.raw_user_meta_data->>'handle',
    v_username
  );
  v_display := coalesce(new.raw_user_meta_data->>'display_name', v_username);

  -- Handle collisions: append short suffix
  while exists(select 1 from public.profiles where handle = v_handle) loop
    v_handle := v_handle || floor(random() * 9)::text;
  end loop;
  while exists(select 1 from public.profiles where username = v_username) loop
    v_username := v_username || floor(random() * 9)::text;
  end loop;

  insert into public.profiles (id, username, handle, display_name)
    values (new.id, v_username, v_handle, v_display);
  insert into public.settings (user_id) values (new.id);
  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Notification emitters
create or replace function public.tg_notify_like()
returns trigger language plpgsql security definer as $$
declare owner_id uuid;
begin
  select user_id into owner_id from public.catches where id = new.catch_id;
  if owner_id is not null and owner_id <> new.user_id then
    insert into public.notifications (user_id, actor_id, type, catch_id)
    values (owner_id, new.user_id, 'like', new.catch_id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_likes_notify on public.likes;
create trigger trg_likes_notify after insert on public.likes
  for each row execute function public.tg_notify_like();

create or replace function public.tg_notify_comment()
returns trigger language plpgsql security definer as $$
declare owner_id uuid;
begin
  select user_id into owner_id from public.catches where id = new.catch_id;
  if owner_id is not null and owner_id <> new.user_id then
    insert into public.notifications (user_id, actor_id, type, catch_id, comment_id)
    values (owner_id, new.user_id, 'comment', new.catch_id, new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_comments_notify on public.comments;
create trigger trg_comments_notify after insert on public.comments
  for each row execute function public.tg_notify_comment();

create or replace function public.tg_notify_follow_request()
returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then
    insert into public.notifications (user_id, actor_id, type)
    values (new.to_user, new.from_user, 'follow_request');
  elsif tg_op = 'UPDATE' and new.status = 'accepted' and old.status <> 'accepted' then
    -- Create mutual follow rows
    insert into public.follows (follower_id, following_id)
      values (new.from_user, new.to_user) on conflict do nothing;
    -- Notify the requester
    insert into public.notifications (user_id, actor_id, type)
    values (new.from_user, new.to_user, 'follow_accept');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_fr_insert on public.follow_requests;
create trigger trg_fr_insert after insert on public.follow_requests
  for each row execute function public.tg_notify_follow_request();

drop trigger if exists trg_fr_update on public.follow_requests;
create trigger trg_fr_update after update on public.follow_requests
  for each row execute function public.tg_notify_follow_request();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.settings enable row level security;
alter table public.catches enable row level security;
alter table public.catch_images enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;
alter table public.follow_requests enable row level security;
alter table public.notifications enable row level security;

-- profiles
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles
  for select using (true);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- settings
drop policy if exists settings_select_self on public.settings;
create policy settings_select_self on public.settings
  for select using (auth.uid() = user_id);

drop policy if exists settings_upsert_self on public.settings;
create policy settings_upsert_self on public.settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- catches
drop policy if exists catches_select on public.catches;
create policy catches_select on public.catches
  for select using (
    visibility = 'public'
    or auth.uid() = user_id
    or (
      visibility = 'friends'
      and auth.uid() is not null
      and public.is_mutual_follow(auth.uid(), user_id)
    )
    or (
      -- owner opted in to "share private map" + friends
      exists (
        select 1 from public.settings s
        where s.user_id = catches.user_id
          and s.share_private_map = true
      )
      and auth.uid() is not null
      and public.is_mutual_follow(auth.uid(), user_id)
    )
  );

drop policy if exists catches_insert_self on public.catches;
create policy catches_insert_self on public.catches
  for insert with check (auth.uid() = user_id);

drop policy if exists catches_update_self on public.catches;
create policy catches_update_self on public.catches
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists catches_delete_self on public.catches;
create policy catches_delete_self on public.catches
  for delete using (auth.uid() = user_id);

-- catch_images: inherit visibility from parent catch via subquery
drop policy if exists catch_images_select on public.catch_images;
create policy catch_images_select on public.catch_images
  for select using (
    exists (
      select 1 from public.catches c
      where c.id = catch_images.catch_id
        and (
          c.visibility = 'public'
          or c.user_id = auth.uid()
          or (
            c.visibility = 'friends'
            and auth.uid() is not null
            and public.is_mutual_follow(auth.uid(), c.user_id)
          )
        )
    )
  );

drop policy if exists catch_images_write_owner on public.catch_images;
create policy catch_images_write_owner on public.catch_images
  for all using (
    exists (select 1 from public.catches c where c.id = catch_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.catches c where c.id = catch_id and c.user_id = auth.uid())
  );

-- likes
drop policy if exists likes_select on public.likes;
create policy likes_select on public.likes
  for select using (
    exists (
      select 1 from public.catches c
      where c.id = likes.catch_id
        and (c.visibility = 'public' or c.user_id = auth.uid())
    )
  );

drop policy if exists likes_insert_self on public.likes;
create policy likes_insert_self on public.likes
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.catches c
      where c.id = catch_id and c.visibility = 'public'
    )
  );

drop policy if exists likes_delete_self on public.likes;
create policy likes_delete_self on public.likes
  for delete using (auth.uid() = user_id);

-- comments
drop policy if exists comments_select on public.comments;
create policy comments_select on public.comments
  for select using (
    exists (
      select 1 from public.catches c
      where c.id = comments.catch_id
        and (c.visibility = 'public' or c.user_id = auth.uid())
    )
  );

drop policy if exists comments_insert_self on public.comments;
create policy comments_insert_self on public.comments
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.catches c
      where c.id = catch_id and c.visibility = 'public'
    )
  );

drop policy if exists comments_delete_self on public.comments;
create policy comments_delete_self on public.comments
  for delete using (auth.uid() = user_id);

-- follows
drop policy if exists follows_select on public.follows;
create policy follows_select on public.follows for select using (true);

drop policy if exists follows_insert_self on public.follows;
create policy follows_insert_self on public.follows
  for insert with check (auth.uid() = follower_id);

drop policy if exists follows_delete_self on public.follows;
create policy follows_delete_self on public.follows
  for delete using (auth.uid() = follower_id);

-- follow_requests
drop policy if exists fr_select on public.follow_requests;
create policy fr_select on public.follow_requests
  for select using (auth.uid() in (from_user, to_user));

drop policy if exists fr_insert_self on public.follow_requests;
create policy fr_insert_self on public.follow_requests
  for insert with check (auth.uid() = from_user);

drop policy if exists fr_update_recipient on public.follow_requests;
create policy fr_update_recipient on public.follow_requests
  for update using (auth.uid() = to_user) with check (auth.uid() = to_user);

drop policy if exists fr_delete_any_party on public.follow_requests;
create policy fr_delete_any_party on public.follow_requests
  for delete using (auth.uid() in (from_user, to_user));

-- notifications
drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
  for select using (auth.uid() = user_id);

drop policy if exists notifications_update_self on public.notifications;
create policy notifications_update_self on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists notifications_delete_self on public.notifications;
create policy notifications_delete_self on public.notifications
  for delete using (auth.uid() = user_id);

-- ============================================================
-- Storage: catch-images bucket
-- ============================================================

insert into storage.buckets (id, name, public)
values ('catch-images', 'catch-images', true)
on conflict (id) do update set public = true;

drop policy if exists "catch-images read" on storage.objects;
create policy "catch-images read" on storage.objects
  for select using (bucket_id = 'catch-images');

drop policy if exists "catch-images upload own" on storage.objects;
create policy "catch-images upload own" on storage.objects
  for insert with check (
    bucket_id = 'catch-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "catch-images update own" on storage.objects;
create policy "catch-images update own" on storage.objects
  for update using (
    bucket_id = 'catch-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "catch-images delete own" on storage.objects;
create policy "catch-images delete own" on storage.objects
  for delete using (
    bucket_id = 'catch-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- Realtime publications
-- ============================================================

do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.likes;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.comments;
exception when duplicate_object then null; end $$;
