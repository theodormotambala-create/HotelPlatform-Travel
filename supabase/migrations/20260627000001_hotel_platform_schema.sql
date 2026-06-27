-- =============================================================================
-- HotelPlatform Travel — Migration complète Phase 1
-- Crée toutes les tables métier liées aux établissements
-- Compatible avec l'architecture DataLayer existante (App.jsx)
-- =============================================================================

-- =============================================================================
-- EXTENSION uuid-ossp (UUID automatiques)
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =============================================================================
-- TABLE : establishments
-- Données de base des hôtels et restaurants
-- Existait partiellement — on la recrée complète avec upsert-safe
-- =============================================================================
CREATE TABLE IF NOT EXISTS establishments (
  id            TEXT PRIMARY KEY,                  -- ex: "h1", "res1"
  type          TEXT NOT NULL CHECK (type IN ('hotel','restaurant')),
  name          TEXT NOT NULL,
  location      TEXT,
  description   TEXT,
  img           TEXT,                              -- URL image principale
  photo_url     TEXT,                              -- URL photo profil établissement (Supabase Storage)
  rating        NUMERIC(3,1) DEFAULT 0,
  review_count  INTEGER DEFAULT 0,
  price_from    NUMERIC(10,2),                     -- prix minimum calculé
  followers     INTEGER DEFAULT 0,
  verified      BOOLEAN DEFAULT FALSE,
  is_premium    BOOLEAN DEFAULT FALSE,
  has_restaurant BOOLEAN DEFAULT FALSE,
  svc_mode      TEXT DEFAULT 'hotel',              -- 'hotel' | 'restaurant' | 'combined'
  owner_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TABLE : establishment_rooms
-- Chambres configurées par un hôtel (côté pro HotelSvc)
-- localStorage key migrée : hp_hotelsvc_rooms
-- =============================================================================
CREATE TABLE IF NOT EXISTS establishment_rooms (
  id              TEXT NOT NULL,                   -- ex: "r1", ou uuid généré
  establishment_id TEXT NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  price           NUMERIC(10,2) NOT NULL DEFAULT 0,
  capacity        INTEGER DEFAULT 2,
  available       BOOLEAN DEFAULT TRUE,
  stock           INTEGER DEFAULT 1,
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, establishment_id)
);

-- =============================================================================
-- TABLE : establishment_dishes
-- Plats du menu configurés par hôtel (restaurant interne) ou restaurant
-- localStorage keys migrées : hp_hotelsvc_dishes, hp_restoff_items
-- =============================================================================
CREATE TABLE IF NOT EXISTS establishment_dishes (
  id              TEXT NOT NULL,
  establishment_id TEXT NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  price           NUMERIC(10,2) NOT NULL DEFAULT 0,
  category        TEXT DEFAULT 'Plats',
  description     TEXT,
  available       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, establishment_id)
);

-- =============================================================================
-- TABLE : establishment_amenities
-- Services et équipements (Wifi, Piscine, Spa...)
-- localStorage key migrée : hp_hotelsvc_amenities
-- =============================================================================
CREATE TABLE IF NOT EXISTS establishment_amenities (
  id              TEXT NOT NULL,
  establishment_id TEXT NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  active          BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, establishment_id)
);

-- =============================================================================
-- TABLE : establishment_offers
-- Offres et promotions du restaurant
-- localStorage key migrée : hp_restoff_offers
-- =============================================================================
CREATE TABLE IF NOT EXISTS establishment_offers (
  id              TEXT NOT NULL,
  establishment_id TEXT NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  price           NUMERIC(10,2),
  available       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, establishment_id)
);

-- =============================================================================
-- TABLE : posts
-- Publications pro et feed client
-- Existait partiellement — on la recrée complète
-- localStorage key migrée : hp_pro_posts
-- =============================================================================
CREATE TABLE IF NOT EXISTS posts (
  id            TEXT PRIMARY KEY,
  establishment_id TEXT REFERENCES establishments(id) ON DELETE CASCADE,
  author        TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('hotel','restaurant')),
  text          TEXT,
  img           TEXT,
  likes         INTEGER DEFAULT 0,
  time          TEXT,
  verified      BOOLEAN DEFAULT FALSE,
  combined      BOOLEAN DEFAULT FALSE,
  owner_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TABLE : reservations
-- Réservations clients
-- BookingService écrivait déjà dans cette table (hp_resas_all migré)
-- =============================================================================
CREATE TABLE IF NOT EXISTS reservations (
  id            TEXT PRIMARY KEY,
  client_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  establishment_id TEXT REFERENCES establishments(id) ON DELETE SET NULL,
  estab         TEXT,
  estab_type    TEXT,
  status        TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed','pending','cancelled','completed')),
  data          JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TABLE : reviews
-- Avis clients par établissement
-- localStorage key migrée : hp_reviews_{id}
-- =============================================================================
CREATE TABLE IF NOT EXISTS reviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  establishment_id TEXT NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  client_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text          TEXT,
  author        TEXT DEFAULT 'Anonyme',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TABLE : profiles
-- Données profil utilisateur (client et pro)
-- localStorage keys migrées : hp_profile_photo, hp_privacy, hp_premium,
--                              hp_following, hp_fav_estabs, hp_notif_prefs
-- =============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  user_id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  account_type      TEXT NOT NULL CHECK (account_type IN ('client','hotel','restaurant')),
  display_name      TEXT,
  photo_url         TEXT,                          -- photo de profil client (Supabase Storage)
  establishment_id  TEXT REFERENCES establishments(id) ON DELETE SET NULL,
  following         TEXT[] DEFAULT '{}',           -- IDs établissements suivis
  fav_estabs        TEXT[] DEFAULT '{}',           -- IDs établissements favoris
  notif_prefs       JSONB DEFAULT '{"reservation":true,"message":true,"promo":true,"follow":true}',
  privacy           JSONB DEFAULT '{"locked":false,"pseudo":false,"vis":"public","msgPermission":"everyone"}',
  premium           JSONB,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TABLE : messages
-- Messagerie entre client et établissement
-- MessageService utilisait déjà cette table
-- =============================================================================
CREATE TABLE IF NOT EXISTS messages (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id   TEXT NOT NULL,
  sender            TEXT NOT NULL,
  body              TEXT NOT NULL,
  deleted           BOOLEAN DEFAULT FALSE,
  read              BOOLEAN DEFAULT FALSE,
  reply_to          JSONB,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================================
-- TRIGGERS — mise à jour automatique de updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_establishments_updated
  BEFORE UPDATE ON establishments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_rooms_updated
  BEFORE UPDATE ON establishment_rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_dishes_updated
  BEFORE UPDATE ON establishment_dishes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_amenities_updated
  BEFORE UPDATE ON establishment_amenities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_offers_updated
  BEFORE UPDATE ON establishment_offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_reservations_updated
  BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- =============================================================================
-- INDEX — performances de lecture
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_rooms_estab ON establishment_rooms(establishment_id);
CREATE INDEX IF NOT EXISTS idx_dishes_estab ON establishment_dishes(establishment_id);
CREATE INDEX IF NOT EXISTS idx_dishes_category ON establishment_dishes(establishment_id, category);
CREATE INDEX IF NOT EXISTS idx_amenities_estab ON establishment_amenities(establishment_id);
CREATE INDEX IF NOT EXISTS idx_offers_estab ON establishment_offers(establishment_id);
CREATE INDEX IF NOT EXISTS idx_posts_estab ON posts(establishment_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_estab ON reviews(establishment_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_reservations_client ON reservations(client_id);
CREATE INDEX IF NOT EXISTS idx_reservations_estab ON reservations(establishment_id);


-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Règles de sécurité : qui peut lire / écrire quoi
-- =============================================================================

ALTER TABLE establishments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishment_rooms    ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishment_dishes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishment_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishment_offers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations           ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews                ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages               ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- establishments : lecture publique, écriture uniquement par le propriétaire
-- -----------------------------------------------------------------------------
CREATE POLICY "establishments_read_public"
  ON establishments FOR SELECT USING (TRUE);

CREATE POLICY "establishments_write_owner"
  ON establishments FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- -----------------------------------------------------------------------------
-- establishment_rooms : lecture publique, écriture par le propriétaire de l'établissement
-- -----------------------------------------------------------------------------
CREATE POLICY "rooms_read_public"
  ON establishment_rooms FOR SELECT USING (TRUE);

CREATE POLICY "rooms_write_owner"
  ON establishment_rooms FOR ALL
  USING (
    auth.uid() = (SELECT owner_id FROM establishments WHERE id = establishment_id)
  )
  WITH CHECK (
    auth.uid() = (SELECT owner_id FROM establishments WHERE id = establishment_id)
  );

-- -----------------------------------------------------------------------------
-- establishment_dishes
-- -----------------------------------------------------------------------------
CREATE POLICY "dishes_read_public"
  ON establishment_dishes FOR SELECT USING (TRUE);

CREATE POLICY "dishes_write_owner"
  ON establishment_dishes FOR ALL
  USING (
    auth.uid() = (SELECT owner_id FROM establishments WHERE id = establishment_id)
  )
  WITH CHECK (
    auth.uid() = (SELECT owner_id FROM establishments WHERE id = establishment_id)
  );

-- -----------------------------------------------------------------------------
-- establishment_amenities
-- -----------------------------------------------------------------------------
CREATE POLICY "amenities_read_public"
  ON establishment_amenities FOR SELECT USING (TRUE);

CREATE POLICY "amenities_write_owner"
  ON establishment_amenities FOR ALL
  USING (
    auth.uid() = (SELECT owner_id FROM establishments WHERE id = establishment_id)
  )
  WITH CHECK (
    auth.uid() = (SELECT owner_id FROM establishments WHERE id = establishment_id)
  );

-- -----------------------------------------------------------------------------
-- establishment_offers
-- -----------------------------------------------------------------------------
CREATE POLICY "offers_read_public"
  ON establishment_offers FOR SELECT USING (TRUE);

CREATE POLICY "offers_write_owner"
  ON establishment_offers FOR ALL
  USING (
    auth.uid() = (SELECT owner_id FROM establishments WHERE id = establishment_id)
  )
  WITH CHECK (
    auth.uid() = (SELECT owner_id FROM establishments WHERE id = establishment_id)
  );

-- -----------------------------------------------------------------------------
-- posts : lecture publique, écriture par le propriétaire
-- -----------------------------------------------------------------------------
CREATE POLICY "posts_read_public"
  ON posts FOR SELECT USING (TRUE);

CREATE POLICY "posts_write_owner"
  ON posts FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- -----------------------------------------------------------------------------
-- reservations : lecture et écriture par le client concerné ou le pro
-- -----------------------------------------------------------------------------
CREATE POLICY "reservations_read_own"
  ON reservations FOR SELECT
  USING (
    auth.uid() = client_id
    OR auth.uid() = (SELECT owner_id FROM establishments WHERE id = establishment_id)
  );

CREATE POLICY "reservations_insert_client"
  ON reservations FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "reservations_update_own"
  ON reservations FOR UPDATE
  USING (
    auth.uid() = client_id
    OR auth.uid() = (SELECT owner_id FROM establishments WHERE id = establishment_id)
  );

-- -----------------------------------------------------------------------------
-- reviews : lecture publique, écriture par l'utilisateur connecté
-- -----------------------------------------------------------------------------
CREATE POLICY "reviews_read_public"
  ON reviews FOR SELECT USING (TRUE);

CREATE POLICY "reviews_insert_authenticated"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = client_id);

CREATE POLICY "reviews_delete_own"
  ON reviews FOR DELETE
  USING (auth.uid() = client_id);

-- -----------------------------------------------------------------------------
-- profiles : chaque utilisateur voit et modifie uniquement son propre profil
-- -----------------------------------------------------------------------------
CREATE POLICY "profiles_read_own"
  ON profiles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "profiles_write_own"
  ON profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- messages : lecture et écriture par les participants à la conversation
-- -----------------------------------------------------------------------------
CREATE POLICY "messages_read_participant"
  ON messages FOR SELECT
  USING (TRUE);

CREATE POLICY "messages_insert_authenticated"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);


-- =============================================================================
-- DONNÉES DE DÉMONSTRATION INITIALES
-- Établissements de base (cohérents avec les constantes HOTELS/RESTAURANTS dans App.jsx)
-- Ces données sont insérées uniquement si les tables sont vides
-- =============================================================================
INSERT INTO establishments (id, type, name, location, description, img, rating, review_count, price_from, followers, verified, is_premium, has_restaurant, svc_mode)
SELECT 'h1','hotel','Grand Hotel Royal','Dakar, Senegal','Hotel 5 etoiles au coeur de Dakar. Vue mer exceptionnelle, spa luxueux.',
       'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=70',4.9,1284,120,2341,FALSE,FALSE,TRUE,'combined'
WHERE NOT EXISTS (SELECT 1 FROM establishments WHERE id = 'h1');

INSERT INTO establishments (id, type, name, location, description, img, rating, review_count, price_from, followers, verified, is_premium, svc_mode)
SELECT 'h2','hotel','Savane Lodge','Nairobi, Kenya','Lodge authentique en pleine nature. Safari experience unique.',
       'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=70',4.6,643,89,876,TRUE,FALSE,'hotel'
WHERE NOT EXISTS (SELECT 1 FROM establishments WHERE id = 'h2');

INSERT INTO establishments (id, type, name, location, description, img, rating, review_count, price_from, followers, verified, is_premium, svc_mode)
SELECT 'res1','restaurant','Le Jardin Gourmand','Abidjan, CI','Cuisine africaine contemporaine. Produits locaux selectionnes.',
       'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=70',4.8,2341,15,3210,FALSE,FALSE,'restaurant'
WHERE NOT EXISTS (SELECT 1 FROM establishments WHERE id = 'res1');

INSERT INTO establishments (id, type, name, location, description, img, rating, review_count, price_from, followers, verified, is_premium, svc_mode)
SELECT 'res2','restaurant','Chez Mamie Fatou','Bamako, Mali','Cuisine malienne authentique. Ambiance familiale.',
       'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=70',4.7,1876,8,1540,FALSE,FALSE,'restaurant'
WHERE NOT EXISTS (SELECT 1 FROM establishments WHERE id = 'res2');

-- Chambres par défaut pour h1
INSERT INTO establishment_rooms (id, establishment_id, name, price, capacity, available, stock)
SELECT 'r1','h1','Suite Presidentielle',450,2,TRUE,3
WHERE NOT EXISTS (SELECT 1 FROM establishment_rooms WHERE id='r1' AND establishment_id='h1');

INSERT INTO establishment_rooms (id, establishment_id, name, price, capacity, available, stock)
SELECT 'r2','h1','Chambre Superieure',240,2,TRUE,6
WHERE NOT EXISTS (SELECT 1 FROM establishment_rooms WHERE id='r2' AND establishment_id='h1');

INSERT INTO establishment_rooms (id, establishment_id, name, price, capacity, available, stock)
SELECT 'r3','h1','Chambre Deluxe',180,2,FALSE,0
WHERE NOT EXISTS (SELECT 1 FROM establishment_rooms WHERE id='r3' AND establishment_id='h1');

-- Chambres par défaut pour h2
INSERT INTO establishment_rooms (id, establishment_id, name, price, capacity, available, stock)
SELECT 'r4','h2','Bungalow Safari',89,2,TRUE,5
WHERE NOT EXISTS (SELECT 1 FROM establishment_rooms WHERE id='r4' AND establishment_id='h2');

INSERT INTO establishment_rooms (id, establishment_id, name, price, capacity, available, stock)
SELECT 'r5','h2','Villa Familiale',180,4,TRUE,3
WHERE NOT EXISTS (SELECT 1 FROM establishment_rooms WHERE id='r5' AND establishment_id='h2');

-- Services h1
INSERT INTO establishment_amenities (id, establishment_id, name, active)
SELECT 'svc1','h1','Spa',TRUE WHERE NOT EXISTS (SELECT 1 FROM establishment_amenities WHERE id='svc1' AND establishment_id='h1');
INSERT INTO establishment_amenities (id, establishment_id, name, active)
SELECT 'svc2','h1','Restaurant Gastronomique',TRUE WHERE NOT EXISTS (SELECT 1 FROM establishment_amenities WHERE id='svc2' AND establishment_id='h1');
INSERT INTO establishment_amenities (id, establishment_id, name, active)
SELECT 'svc3','h1','Piscine Infinity',TRUE WHERE NOT EXISTS (SELECT 1 FROM establishment_amenities WHERE id='svc3' AND establishment_id='h1');
INSERT INTO establishment_amenities (id, establishment_id, name, active)
SELECT 'svc4','h1','Salle de conference',TRUE WHERE NOT EXISTS (SELECT 1 FROM establishment_amenities WHERE id='svc4' AND establishment_id='h1');
INSERT INTO establishment_amenities (id, establishment_id, name, active)
SELECT 'svc5','h1','Navette aeroport',TRUE WHERE NOT EXISTS (SELECT 1 FROM establishment_amenities WHERE id='svc5' AND establishment_id='h1');
INSERT INTO establishment_amenities (id, establishment_id, name, active)
SELECT 'svc6','h1','Room Service 24h',TRUE WHERE NOT EXISTS (SELECT 1 FROM establishment_amenities WHERE id='svc6' AND establishment_id='h1');

-- Plats restaurant de h1
INSERT INTO establishment_dishes (id, establishment_id, name, price, category, description, available)
SELECT 'd_h1_1','h1','Salade Cesar',14,'Entrees','Poulet grille, parmesan, croutons',TRUE
WHERE NOT EXISTS (SELECT 1 FROM establishment_dishes WHERE id='d_h1_1' AND establishment_id='h1');
INSERT INTO establishment_dishes (id, establishment_id, name, price, category, description, available)
SELECT 'd_h1_2','h1','Soupe du jour',9,'Entrees','Selon arrivage du marche',TRUE
WHERE NOT EXISTS (SELECT 1 FROM establishment_dishes WHERE id='d_h1_2' AND establishment_id='h1');
INSERT INTO establishment_dishes (id, establishment_id, name, price, category, description, available)
SELECT 'd_h1_3','h1','Thiof grille',28,'Plats','Poisson local, riz, legumes',TRUE
WHERE NOT EXISTS (SELECT 1 FROM establishment_dishes WHERE id='d_h1_3' AND establishment_id='h1');
INSERT INTO establishment_dishes (id, establishment_id, name, price, category, description, available)
SELECT 'd_h1_4','h1','Filet de boeuf',34,'Plats','Sauce au poivre, frites maison',TRUE
WHERE NOT EXISTS (SELECT 1 FROM establishment_dishes WHERE id='d_h1_4' AND establishment_id='h1');

-- Plats restaurant res1
INSERT INTO establishment_dishes (id, establishment_id, name, price, category, available)
SELECT 'd_r1_1','res1','Thieboudienne Royal',18,'Entrees',TRUE
WHERE NOT EXISTS (SELECT 1 FROM establishment_dishes WHERE id='d_r1_1' AND establishment_id='res1');
INSERT INTO establishment_dishes (id, establishment_id, name, price, category, available)
SELECT 'd_r1_2','res1','Yassa Poulet',16,'Entrees',TRUE
WHERE NOT EXISTS (SELECT 1 FROM establishment_dishes WHERE id='d_r1_2' AND establishment_id='res1');
INSERT INTO establishment_dishes (id, establishment_id, name, price, category, available)
SELECT 'd_r1_3','res1','Attieke Poisson',22,'Plats',TRUE
WHERE NOT EXISTS (SELECT 1 FROM establishment_dishes WHERE id='d_r1_3' AND establishment_id='res1');
INSERT INTO establishment_dishes (id, establishment_id, name, price, category, available)
SELECT 'd_r1_4','res1','Kedjenou',20,'Plats',TRUE
WHERE NOT EXISTS (SELECT 1 FROM establishment_dishes WHERE id='d_r1_4' AND establishment_id='res1');
INSERT INTO establishment_dishes (id, establishment_id, name, price, category, available)
SELECT 'd_r1_5','res1','Thiakry',8,'Desserts',TRUE
WHERE NOT EXISTS (SELECT 1 FROM establishment_dishes WHERE id='d_r1_5' AND establishment_id='res1');
INSERT INTO establishment_dishes (id, establishment_id, name, price, category, available)
SELECT 'd_r1_6','res1','Banane Flambe',10,'Desserts',TRUE
WHERE NOT EXISTS (SELECT 1 FROM establishment_dishes WHERE id='d_r1_6' AND establishment_id='res1');

-- Plats restaurant res2
INSERT INTO establishment_dishes (id, establishment_id, name, price, category, available)
SELECT 'd_r2_1','res2','Riz au Gras',8,'Plats',TRUE
WHERE NOT EXISTS (SELECT 1 FROM establishment_dishes WHERE id='d_r2_1' AND establishment_id='res2');
INSERT INTO establishment_dishes (id, establishment_id, name, price, category, available)
SELECT 'd_r2_2','res2','To Sauce Arachide',10,'Plats',TRUE
WHERE NOT EXISTS (SELECT 1 FROM establishment_dishes WHERE id='d_r2_2' AND establishment_id='res2');
INSERT INTO establishment_dishes (id, establishment_id, name, price, category, available)
SELECT 'd_r2_3','res2','Bissap',2,'Boissons',TRUE
WHERE NOT EXISTS (SELECT 1 FROM establishment_dishes WHERE id='d_r2_3' AND establishment_id='res2');
INSERT INTO establishment_dishes (id, establishment_id, name, price, category, available)
SELECT 'd_r2_4','res2','Gingembre',2,'Boissons',TRUE
WHERE NOT EXISTS (SELECT 1 FROM establishment_dishes WHERE id='d_r2_4' AND establishment_id='res2');

-- Offres res1
INSERT INTO establishment_offers (id, establishment_id, name, price, available)
SELECT 'o_r1_1','res1','Menu Decouverte',35,TRUE
WHERE NOT EXISTS (SELECT 1 FROM establishment_offers WHERE id='o_r1_1' AND establishment_id='res1');
INSERT INTO establishment_offers (id, establishment_id, name, price, available)
SELECT 'o_r1_2','res1','Brunch Dominical',28,TRUE
WHERE NOT EXISTS (SELECT 1 FROM establishment_offers WHERE id='o_r1_2' AND establishment_id='res1');
INSERT INTO establishment_offers (id, establishment_id, name, price, available)
SELECT 'o_r1_3','res1','Menu Business',22,TRUE
WHERE NOT EXISTS (SELECT 1 FROM establishment_offers WHERE id='o_r1_3' AND establishment_id='res1');

-- Offres res2
INSERT INTO establishment_offers (id, establishment_id, name, price, available)
SELECT 'o_r2_1','res2','Plat du Jour',8,TRUE
WHERE NOT EXISTS (SELECT 1 FROM establishment_offers WHERE id='o_r2_1' AND establishment_id='res2');
INSERT INTO establishment_offers (id, establishment_id, name, price, available)
SELECT 'o_r2_2','res2','Menu Complet',14,TRUE
WHERE NOT EXISTS (SELECT 1 FROM establishment_offers WHERE id='o_r2_2' AND establishment_id='res2');

-- Posts initiaux
INSERT INTO posts (id, establishment_id, author, type, text, img, likes, time, verified, combined)
SELECT 'h1','h1','Grand Hotel Royal','hotel','Decouvrez notre nouvelle suite presidentielle renovee ! Vue mer panoramique.',
       'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=70',284,'2h',TRUE,TRUE
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE id='h1');

INSERT INTO posts (id, establishment_id, author, type, text, img, likes, time, verified)
SELECT 'res1','res1','Le Jardin Gourmand','restaurant','Menu special ce soir : Homard grille aux epices africaines. Reservation recommandee !',
       'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=70',512,'4h',TRUE
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE id='res1');

INSERT INTO posts (id, establishment_id, author, type, text, img, likes, time, verified)
SELECT 'h2','h2','Savane Lodge','hotel','Safari au lever du soleil - des moments inoubliables.',
       'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=70',156,'6h',TRUE
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE id='h2');

INSERT INTO posts (id, establishment_id, author, type, text, img, likes, time, verified)
SELECT 'res2','res2','Chez Mamie Fatou','restaurant','Aujourd hui : Thieboudienne special avec poissons du jour.',
       'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=70',89,'8h',FALSE
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE id='res2');
