-- =====================================================================
-- Migration : table profiles + trigger auto-creation
-- A executer dans Supabase > SQL Editor > New query > Run
-- =====================================================================

-- Table profiles liee a auth.users
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  account_type  text not null default 'client',
  account_status text not null default 'active',
  email         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;

-- Chaque utilisateur ne peut lire/modifier que son propre profil
create policy "profiles: lecture par proprietaire"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: modification par proprietaire"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Insertion autorisee uniquement via le trigger (service role)
create policy "profiles: insertion via trigger"
  on public.profiles for insert
  with check (true);

-- Trigger : cree automatiquement un profil lors de l inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  acc_type text;
  acc_status text;
begin
  acc_type := coalesce(new.raw_user_meta_data->>'account_type', 'client');
  acc_status := case when acc_type = 'client' then 'active' else 'pending' end;
  insert into public.profiles (id, account_type, account_status, email)
  values (new.id, acc_type, acc_status, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Attache le trigger sur auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
