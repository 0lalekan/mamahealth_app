create table
  public.profiles (
    id uuid not null,
    updated_at timestamp with time zone null,
    username text null,
    full_name text null,
    avatar_url text null,
    website text null,
    constraint profiles_pkey primary key (id),
    constraint profiles_username_key unique (username),
    constraint username_length check (char_length(username) >= 3)
  ) tablespace pg_default;

create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, lmp_date, due_date)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    (new.raw_user_meta_data->>'lmp_date')::date,
    (new.raw_user_meta_data->>'due_date')::date
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
