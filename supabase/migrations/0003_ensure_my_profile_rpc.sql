-- Reliable profile bootstrap for authenticated users when client INSERT is blocked
-- by RLS or when the auth trigger did not run. Uses SECURITY DEFINER so it does
-- not depend on profiles_insert_self policy being present.

create or replace function public.ensure_my_profile(
  p_username text,
  p_handle text,
  p_display_name text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid := auth.uid();
  v_username citext;
  v_handle citext;
  v_display text;
begin
  if v_id is null then
    raise exception 'Not authenticated';
  end if;

  v_username := trim(p_username)::citext;
  v_handle := lower(trim(p_handle))::citext;
  v_display := coalesce(nullif(trim(p_display_name), ''), v_username::text);

  if length(v_username::text) < 1 then
    raise exception 'Username is required';
  end if;
  if length(v_handle::text) < 2 or length(v_handle::text) > 24 then
    raise exception 'Handle must be between 2 and 24 characters';
  end if;

  insert into public.profiles (id, username, handle, display_name)
  values (v_id, v_username, v_handle, v_display)
  on conflict (id) do nothing;

  insert into public.settings (user_id)
  values (v_id)
  on conflict (user_id) do nothing;
end;
$$;

revoke all on function public.ensure_my_profile(text, text, text) from public;
grant execute on function public.ensure_my_profile(text, text, text) to authenticated;
