-- Enable extension for UUID generation if not present
create extension if not exists pgcrypto;

-- Function to auto-update updated_at
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Profiles table to store user data
create table if not exists public.profiles (
  id uuid primary key,
  email text not null unique,
  name text not null,
  lmp_date date,
  due_date date,
  is_premium boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

create policy if not exists "Users can view their own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy if not exists "Users can insert their own profile"
on public.profiles
for insert
 to authenticated
with check (auth.uid() = id);

create policy if not exists "Users can update their own profile"
on public.profiles
for update
 to authenticated
using (auth.uid() = id);

create policy if not exists "Users can delete their own profile"
on public.profiles
for delete
 to authenticated
using (auth.uid() = id);

-- Trigger to keep updated_at fresh
drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
before update on public.profiles
for each row
execute function public.update_updated_at_column();

-- Symptoms table to store AI symptom checker history
create table if not exists public.symptoms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  symptoms text not null,
  week integer,
  ai_response jsonb,
  created_at timestamptz not null default now()
);

-- Index for performance
create index if not exists idx_symptoms_user_id on public.symptoms(user_id);

-- Enable RLS on symptoms
alter table public.symptoms enable row level security;

create policy if not exists "Users can view their own symptoms"
on public.symptoms
for select
 to authenticated
using (auth.uid() = user_id);

create policy if not exists "Users can insert their own symptoms"
on public.symptoms
for insert
 to authenticated
with check (auth.uid() = user_id);

create policy if not exists "Users can update their own symptoms"
on public.symptoms
for update
 to authenticated
using (auth.uid() = user_id);

create policy if not exists "Users can delete their own symptoms"
on public.symptoms
for delete
 to authenticated
using (auth.uid() = user_id);
