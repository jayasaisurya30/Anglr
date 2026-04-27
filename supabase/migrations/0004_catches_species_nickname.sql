-- Optional user label for a catch (e.g. nickname). Canonical species stays in `species`.
alter table public.catches
  add column if not exists species_nickname text;
