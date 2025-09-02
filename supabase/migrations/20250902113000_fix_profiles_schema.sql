-- Reconcile inconsistent profiles schema & fix signup trigger
-- This migration is idempotent: uses IF EXISTS / IF NOT EXISTS guards

-- 1. Ensure required columns exist (some earlier migrations created a minimal table, later ones added columns)
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists lmp_date date;
alter table public.profiles add column if not exists due_date date;
alter table public.profiles add column if not exists is_premium boolean not null default false;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
alter table public.profiles add column if not exists avatar_url text;

-- Optional cleanup: drop unused columns introduced by alternative schema drafts
do $$ begin
  if exists(select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'username') then
    alter table public.profiles drop column username;
  end if;
  if exists(select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'website') then
    alter table public.profiles drop column website;
  end if;
  if exists(select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'name') then
    -- Consolidate legacy 'name' into 'full_name' if full_name empty
    update public.profiles set full_name = coalesce(full_name, name) where full_name is null;
    alter table public.profiles drop column name;
  end if;
end $$;

-- 2. Unique & primary keys (guard against duplicates)
-- Add a unique constraint on email if not already (ignore null emails)
do $$ begin
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    where t.relname = 'profiles' and c.conname = 'profiles_email_key') then
      alter table public.profiles add constraint profiles_email_key unique (email);
  end if;
end $$;

-- 3. updated_at trigger (recreate safely)
create or replace function public.update_profiles_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.update_profiles_updated_at();

-- 4. Replace signup trigger function with robust version
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_lmp text;
  meta_due text;
  lmp_date_val date;
  due_date_val date;
begin
  meta_lmp := new.raw_user_meta_data->>'lmp_date';
  meta_due := new.raw_user_meta_data->>'due_date';
  if meta_lmp is not null then
    begin
      lmp_date_val := meta_lmp::date;
    exception when others then
      lmp_date_val := null;
    end;
  end if;
  if meta_due is not null then
    begin
      due_date_val := meta_due::date;
    exception when others then
      due_date_val := null;
    end;
  end if;
  if due_date_val is null and lmp_date_val is not null then
    due_date_val := (lmp_date_val + interval '280 days')::date;
  end if;

  insert into public.profiles (id, email, full_name, avatar_url, lmp_date, due_date)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name',''),
    new.raw_user_meta_data->>'avatar_url',
    lmp_date_val,
    due_date_val
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    lmp_date = excluded.lmp_date,
    due_date = excluded.due_date;
  return new;
end;$$;

-- 5. Ensure trigger exists (recreate)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 6. RLS Policies (idempotent reassert)
alter table public.profiles enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='profiles' and policyname = 'Profiles Select Own'
  ) then
    create policy "Profiles Select Own" on public.profiles for select using (auth.uid() = id);
  end if;
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='profiles' and policyname = 'Profiles Update Own'
  ) then
    create policy "Profiles Update Own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
  end if;
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='profiles' and policyname = 'Profiles Insert Own'
  ) then
    create policy "Profiles Insert Own" on public.profiles for insert with check (auth.uid() = id);
  end if;
end $$;

-- 7. Backfill due_date where possible
update public.profiles
set due_date = (lmp_date + interval '280 days')::date
where lmp_date is not null and due_date is null;

-- Done.