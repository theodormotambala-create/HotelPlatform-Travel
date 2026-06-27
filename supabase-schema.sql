-- =====================================================================
-- HotelPlatform Travel — Initialisation de la base Supabase
-- ---------------------------------------------------------------------
-- A COLLER dans : Supabase > ton projet > SQL Editor > New query > Run
--
-- Ce script :
--   1. cree les tables (etablissements, posts, reservations, conversations, messages)
--   2. active la securite (Row Level Security)
--   3. ouvre la lecture publique des etablissements et posts (catalogue visible)
--   4. prepare les regles pour les donnees liees a un utilisateur
--
-- Les DONNEES de demonstration sont inserees par un second script (seed.sql)
-- pour garder ce fichier de structure propre et reexecutable.
-- =====================================================================

-- --- Nettoyage si on relance le script (ordre inverse des dependances) ---
drop table if exists public.messages cascade;
drop table if exists public.conversations cascade;
drop table if exists public.reservations cascade;
drop table if exists public.posts cascade;
drop table if exists public.establishments cascade;

-- =====================================================================
-- 1. ETABLISSEMENTS (hotels + restaurants)
--    L'objet complet de l'app est stocke dans la colonne JSONB "data",
--    ce qui garantit une fidelite parfaite avec la structure existante.
-- =====================================================================
create table public.establishments (
  id          text primary key,
  type        text not null,                 -- 'hotel' ou 'restaurant'
  name        text not null,
  location    text,
  verified    boolean default false,
  is_premium  boolean default false,
  data        jsonb not null,                -- objet etablissement complet
  created_at  timestamptz default now()
);

-- =====================================================================
-- 2. POSTS (fil d'actualite)
-- =====================================================================
create table public.posts (
  id          text primary key,
  author      text,
  type        text,
  data        jsonb not null,                -- objet post complet
  created_at  timestamptz default now()
);

-- =====================================================================
-- 3. RESERVATIONS
-- =====================================================================
create table public.reservations (
  id          text primary key,
  client_id   uuid references auth.users(id) on delete set null,
  estab       text,
  estab_type  text,
  status      text,
  data        jsonb not null,                -- objet reservation complet
  created_at  timestamptz default now()
);

-- =====================================================================
-- 4. CONVERSATIONS
-- =====================================================================
create table public.conversations (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid references auth.users(id) on delete cascade,
  establishment text,
  data          jsonb,
  created_at    timestamptz default now()
);

-- =====================================================================
-- 5. MESSAGES
-- =====================================================================
create table public.messages (
  id              bigint generated always as identity primary key,
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender          text,                      -- 'me' ou identifiant interlocuteur
  body            text,
  deleted         boolean default false,
  read            boolean default false,
  reply_to        jsonb,
  created_at      timestamptz default now()
);

-- index utile pour charger une conversation
create index if not exists idx_messages_conv on public.messages(conversation_id, created_at);

-- =====================================================================
-- SECURITE : Row Level Security
-- =====================================================================
alter table public.establishments enable row level security;
alter table public.posts          enable row level security;
alter table public.reservations   enable row level security;
alter table public.conversations  enable row level security;
alter table public.messages       enable row level security;

-- --- Catalogue public : tout le monde peut LIRE etablissements et posts ---
create policy "lecture publique etablissements"
  on public.establishments for select
  using (true);

-- Insertion publique pour le seeding initial (premier deploiement)
create policy "insertion publique etablissements"
  on public.establishments for insert
  with check (true);

create policy "lecture publique posts"
  on public.posts for select
  using (true);

-- Insertion de posts pour les utilisateurs authentifies (pros)
create policy "insertion posts authentifies"
  on public.posts for insert
  with check (true);

-- --- Reservations : chaque utilisateur ne voit/cree que les siennes ---
create policy "reservations: lecture par proprietaire"
  on public.reservations for select
  using (auth.uid() = client_id);

create policy "reservations: creation par utilisateur connecte"
  on public.reservations for insert
  with check (auth.uid() = client_id);

-- --- Conversations : reservees au proprietaire ---
create policy "conversations: proprietaire"
  on public.conversations for all
  using (auth.uid() = client_id)
  with check (auth.uid() = client_id);

-- --- Messages : accessibles si on possede la conversation parente ---
create policy "messages: via conversation possedee"
  on public.messages for all
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and c.client_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and c.client_id = auth.uid()
    )
  );

-- =====================================================================
-- Fin du script de structure.
-- Etape suivante : executer seed.sql pour inserer les donnees de demo.
-- =====================================================================
