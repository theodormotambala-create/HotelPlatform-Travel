-- =============================================================================
-- HotelPlatform Travel — Installation complète base de données
-- =============================================================================
-- COMMENT UTILISER :
--   1. Aller sur dashboard.supabase.com → ton projet → SQL Editor
--   2. Cliquer "New query"
--   3. Copier-coller tout ce fichier
--   4. Cliquer "Run"
--   C'est tout — base de données, storage, sécurité et données de démo inclus.
-- =============================================================================


-- =============================================================================
-- 0. EXTENSIONS
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =============================================================================
-- 1. TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS establishments (
  id            TEXT PRIMARY KEY,
  type          TEXT NOT NULL CHECK (type IN ('hotel','restaurant')),
  name          TEXT NOT NULL,
  location      TEXT,
  description   TEXT,
  img           TEXT,
  photo_url     TEXT,
  rating        NUMERIC(3,1) DEFAULT 0,
  review_count  INTEGER DEFAULT 0,
  price_from    NUMERIC(10,2),
  followers     INTEGER DEFAULT 0,
  verified      BOOLEAN DEFAULT FALSE,
  is_premium    BOOLEAN DEFAULT FALSE,
  has_restaurant BOOLEAN DEFAULT FALSE,
  svc_mode      TEXT DEFAULT 'hotel',
  owner_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS establishment_rooms (
  id              TEXT NOT NULL,
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

CREATE TABLE IF NOT EXISTS establishment_amenities (
  id              TEXT NOT NULL,
  establishment_id TEXT NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  active          BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, establishment_id)
);

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

CREATE TABLE IF NOT EXISTS reviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  establishment_id TEXT NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  client_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text          TEXT,
  author        TEXT DEFAULT 'Anonyme',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  account_type      TEXT NOT NULL CHECK (account_type IN ('client','hotel','restaurant')),
  display_name      TEXT,
  photo_url         TEXT,
  establishment_id  TEXT REFERENCES establishments(id) ON DELETE SET NULL,
  following         TEXT[] DEFAULT '{}',
  fav_estabs        TEXT[] DEFAULT '{}',
  notif_prefs       JSONB DEFAULT '{"reservation":true,"message":true,"promo":true,"follow":true}',
  privacy           JSONB DEFAULT '{"locked":false,"pseudo":false,"vis":"public","msgPermission":"everyone"}',
  premium           JSONB,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

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
-- 2. TRIGGERS updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_establishments_updated  ON establishments;
DROP TRIGGER IF EXISTS trg_rooms_updated           ON establishment_rooms;
DROP TRIGGER IF EXISTS trg_dishes_updated          ON establishment_dishes;
DROP TRIGGER IF EXISTS trg_amenities_updated       ON establishment_amenities;
DROP TRIGGER IF EXISTS trg_offers_updated          ON establishment_offers;
DROP TRIGGER IF EXISTS trg_reservations_updated    ON reservations;
DROP TRIGGER IF EXISTS trg_profiles_updated        ON profiles;

CREATE TRIGGER trg_establishments_updated  BEFORE UPDATE ON establishments         FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_rooms_updated           BEFORE UPDATE ON establishment_rooms    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_dishes_updated          BEFORE UPDATE ON establishment_dishes   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_amenities_updated       BEFORE UPDATE ON establishment_amenities FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_offers_updated          BEFORE UPDATE ON establishment_offers   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_reservations_updated    BEFORE UPDATE ON reservations           FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_profiles_updated        BEFORE UPDATE ON profiles               FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- =============================================================================
-- 3. INDEX performances
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_rooms_estab         ON establishment_rooms(establishment_id);
CREATE INDEX IF NOT EXISTS idx_dishes_estab        ON establishment_dishes(establishment_id);
CREATE INDEX IF NOT EXISTS idx_dishes_category     ON establishment_dishes(establishment_id, category);
CREATE INDEX IF NOT EXISTS idx_amenities_estab     ON establishment_amenities(establishment_id);
CREATE INDEX IF NOT EXISTS idx_offers_estab        ON establishment_offers(establishment_id);
CREATE INDEX IF NOT EXISTS idx_posts_estab         ON posts(establishment_id);
CREATE INDEX IF NOT EXISTS idx_posts_created       ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_estab       ON reviews(establishment_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv       ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_reservations_client ON reservations(client_id);
CREATE INDEX IF NOT EXISTS idx_reservations_estab  ON reservations(establishment_id);


-- =============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE establishments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishment_rooms     ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishment_dishes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishment_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishment_offers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations            ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages                ENABLE ROW LEVEL SECURITY;

-- Establishments
DROP POLICY IF EXISTS "establishments_read_public"  ON establishments;
DROP POLICY IF EXISTS "establishments_write_owner"  ON establishments;
CREATE POLICY "establishments_read_public" ON establishments FOR SELECT USING (TRUE);
CREATE POLICY "establishments_write_owner" ON establishments FOR ALL
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- Rooms
DROP POLICY IF EXISTS "rooms_read_public"  ON establishment_rooms;
DROP POLICY IF EXISTS "rooms_write_owner"  ON establishment_rooms;
CREATE POLICY "rooms_read_public" ON establishment_rooms FOR SELECT USING (TRUE);
CREATE POLICY "rooms_write_owner" ON establishment_rooms FOR ALL
  USING (auth.uid() = (SELECT owner_id FROM establishments WHERE id = establishment_id))
  WITH CHECK (auth.uid() = (SELECT owner_id FROM establishments WHERE id = establishment_id));

-- Dishes
DROP POLICY IF EXISTS "dishes_read_public"  ON establishment_dishes;
DROP POLICY IF EXISTS "dishes_write_owner"  ON establishment_dishes;
CREATE POLICY "dishes_read_public" ON establishment_dishes FOR SELECT USING (TRUE);
CREATE POLICY "dishes_write_owner" ON establishment_dishes FOR ALL
  USING (auth.uid() = (SELECT owner_id FROM establishments WHERE id = establishment_id))
  WITH CHECK (auth.uid() = (SELECT owner_id FROM establishments WHERE id = establishment_id));

-- Amenities
DROP POLICY IF EXISTS "amenities_read_public"  ON establishment_amenities;
DROP POLICY IF EXISTS "amenities_write_owner"  ON establishment_amenities;
CREATE POLICY "amenities_read_public" ON establishment_amenities FOR SELECT USING (TRUE);
CREATE POLICY "amenities_write_owner" ON establishment_amenities FOR ALL
  USING (auth.uid() = (SELECT owner_id FROM establishments WHERE id = establishment_id))
  WITH CHECK (auth.uid() = (SELECT owner_id FROM establishments WHERE id = establishment_id));

-- Offers
DROP POLICY IF EXISTS "offers_read_public"  ON establishment_offers;
DROP POLICY IF EXISTS "offers_write_owner"  ON establishment_offers;
CREATE POLICY "offers_read_public" ON establishment_offers FOR SELECT USING (TRUE);
CREATE POLICY "offers_write_owner" ON establishment_offers FOR ALL
  USING (auth.uid() = (SELECT owner_id FROM establishments WHERE id = establishment_id))
  WITH CHECK (auth.uid() = (SELECT owner_id FROM establishments WHERE id = establishment_id));

-- Posts
DROP POLICY IF EXISTS "posts_read_public"  ON posts;
DROP POLICY IF EXISTS "posts_write_owner"  ON posts;
CREATE POLICY "posts_read_public" ON posts FOR SELECT USING (TRUE);
CREATE POLICY "posts_write_owner" ON posts FOR ALL
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- Reservations
DROP POLICY IF EXISTS "reservations_read_own"       ON reservations;
DROP POLICY IF EXISTS "reservations_insert_client"  ON reservations;
DROP POLICY IF EXISTS "reservations_update_own"     ON reservations;
CREATE POLICY "reservations_read_own" ON reservations FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = (SELECT owner_id FROM establishments WHERE id = establishment_id));
CREATE POLICY "reservations_insert_client" ON reservations FOR INSERT
  WITH CHECK (auth.uid() = client_id);
CREATE POLICY "reservations_update_own" ON reservations FOR UPDATE
  USING (auth.uid() = client_id OR auth.uid() = (SELECT owner_id FROM establishments WHERE id = establishment_id));

-- Reviews
DROP POLICY IF EXISTS "reviews_read_public"          ON reviews;
DROP POLICY IF EXISTS "reviews_insert_authenticated" ON reviews;
DROP POLICY IF EXISTS "reviews_delete_own"           ON reviews;
CREATE POLICY "reviews_read_public" ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "reviews_insert_authenticated" ON reviews FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = client_id);
CREATE POLICY "reviews_delete_own" ON reviews FOR DELETE
  USING (auth.uid() = client_id);

-- Profiles
DROP POLICY IF EXISTS "profiles_read_own"   ON profiles;
DROP POLICY IF EXISTS "profiles_write_own"  ON profiles;
CREATE POLICY "profiles_read_own"  ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "profiles_write_own" ON profiles FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Messages — lecture restreinte aux participants de la conversation uniquement
DROP POLICY IF EXISTS "messages_read_participant"    ON messages;
DROP POLICY IF EXISTS "messages_insert_authenticated" ON messages;
DROP POLICY IF EXISTS "messages_delete_own"           ON messages;
CREATE POLICY "messages_read_participant" ON messages FOR SELECT
  USING (sender = auth.uid()::text OR conversation_id IN (
    SELECT DISTINCT conversation_id FROM messages WHERE sender = auth.uid()::text
  ));
CREATE POLICY "messages_insert_authenticated" ON messages FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND sender = auth.uid()::text);
CREATE POLICY "messages_delete_own" ON messages FOR DELETE
  USING (sender = auth.uid()::text);


-- =============================================================================
-- 5. STORAGE — buckets photos
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('profile-photos', 'profile-photos', true, 5242880,
        ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif'];

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('establishment-photos', 'establishment-photos', true, 10485760,
        ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif'];

-- RLS Storage : profile-photos
DROP POLICY IF EXISTS "Public read profile-photos"   ON storage.objects;
DROP POLICY IF EXISTS "Auth upload profile-photos"   ON storage.objects;
DROP POLICY IF EXISTS "Owner update profile-photos"  ON storage.objects;
DROP POLICY IF EXISTS "Owner delete profile-photos"  ON storage.objects;
CREATE POLICY "Public read profile-photos"  ON storage.objects FOR SELECT USING (bucket_id = 'profile-photos');
CREATE POLICY "Auth upload profile-photos"  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile-photos' AND auth.role() = 'authenticated'
              AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owner update profile-photos" ON storage.objects FOR UPDATE
  USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Owner delete profile-photos" ON storage.objects FOR DELETE
  USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS Storage : establishment-photos
DROP POLICY IF EXISTS "Public read establishment-photos"   ON storage.objects;
DROP POLICY IF EXISTS "Auth upload establishment-photos"   ON storage.objects;
DROP POLICY IF EXISTS "Owner update establishment-photos"  ON storage.objects;
DROP POLICY IF EXISTS "Owner delete establishment-photos"  ON storage.objects;
CREATE POLICY "Public read establishment-photos"  ON storage.objects FOR SELECT USING (bucket_id = 'establishment-photos');
CREATE POLICY "Auth upload establishment-photos"  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'establishment-photos' AND auth.role() = 'authenticated'
              AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owner update establishment-photos" ON storage.objects FOR UPDATE
  USING (bucket_id = 'establishment-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Owner delete establishment-photos" ON storage.objects FOR DELETE
  USING (bucket_id = 'establishment-photos' AND auth.uid()::text = (storage.foldername(name))[1]);


-- =============================================================================
-- 6. FONCTION RGPD — suppression compte utilisateur (Art. 17)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _uid UUID;
BEGIN
  _uid := auth.uid();
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  DELETE FROM public.reviews      WHERE client_id = _uid;
  DELETE FROM public.reservations WHERE client_id = _uid;
  DELETE FROM public.profiles     WHERE user_id   = _uid;
  DELETE FROM public.posts        WHERE owner_id   = _uid;
  DELETE FROM public.messages     WHERE sender     = _uid::text;
  DELETE FROM auth.users          WHERE id         = _uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;


-- =============================================================================
-- 7. DONNÉES DE DÉMONSTRATION
-- Insérées uniquement si les tables sont vides (idempotent)
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

-- Chambres h1
INSERT INTO establishment_rooms (id, establishment_id, name, price, capacity, available, stock) SELECT 'r1','h1','Suite Presidentielle',450,2,TRUE,3  WHERE NOT EXISTS (SELECT 1 FROM establishment_rooms WHERE id='r1' AND establishment_id='h1');
INSERT INTO establishment_rooms (id, establishment_id, name, price, capacity, available, stock) SELECT 'r2','h1','Chambre Superieure',240,2,TRUE,6    WHERE NOT EXISTS (SELECT 1 FROM establishment_rooms WHERE id='r2' AND establishment_id='h1');
INSERT INTO establishment_rooms (id, establishment_id, name, price, capacity, available, stock) SELECT 'r3','h1','Chambre Deluxe',180,2,FALSE,0       WHERE NOT EXISTS (SELECT 1 FROM establishment_rooms WHERE id='r3' AND establishment_id='h1');

-- Chambres h2
INSERT INTO establishment_rooms (id, establishment_id, name, price, capacity, available, stock) SELECT 'r4','h2','Bungalow Safari',89,2,TRUE,5        WHERE NOT EXISTS (SELECT 1 FROM establishment_rooms WHERE id='r4' AND establishment_id='h2');
INSERT INTO establishment_rooms (id, establishment_id, name, price, capacity, available, stock) SELECT 'r5','h2','Villa Familiale',180,4,TRUE,3       WHERE NOT EXISTS (SELECT 1 FROM establishment_rooms WHERE id='r5' AND establishment_id='h2');

-- Services h1
INSERT INTO establishment_amenities (id, establishment_id, name, active) SELECT 'svc1','h1','Spa',TRUE                       WHERE NOT EXISTS (SELECT 1 FROM establishment_amenities WHERE id='svc1' AND establishment_id='h1');
INSERT INTO establishment_amenities (id, establishment_id, name, active) SELECT 'svc2','h1','Restaurant Gastronomique',TRUE  WHERE NOT EXISTS (SELECT 1 FROM establishment_amenities WHERE id='svc2' AND establishment_id='h1');
INSERT INTO establishment_amenities (id, establishment_id, name, active) SELECT 'svc3','h1','Piscine Infinity',TRUE          WHERE NOT EXISTS (SELECT 1 FROM establishment_amenities WHERE id='svc3' AND establishment_id='h1');
INSERT INTO establishment_amenities (id, establishment_id, name, active) SELECT 'svc4','h1','Salle de conference',TRUE       WHERE NOT EXISTS (SELECT 1 FROM establishment_amenities WHERE id='svc4' AND establishment_id='h1');
INSERT INTO establishment_amenities (id, establishment_id, name, active) SELECT 'svc5','h1','Navette aeroport',TRUE          WHERE NOT EXISTS (SELECT 1 FROM establishment_amenities WHERE id='svc5' AND establishment_id='h1');
INSERT INTO establishment_amenities (id, establishment_id, name, active) SELECT 'svc6','h1','Room Service 24h',TRUE          WHERE NOT EXISTS (SELECT 1 FROM establishment_amenities WHERE id='svc6' AND establishment_id='h1');

-- Plats h1
INSERT INTO establishment_dishes (id, establishment_id, name, price, category, description, available) SELECT 'd_h1_1','h1','Salade Cesar',14,'Entrees','Poulet grille, parmesan, croutons',TRUE WHERE NOT EXISTS (SELECT 1 FROM establishment_dishes WHERE id='d_h1_1' AND establishment_id='h1');
INSERT INTO establishment_dishes (id, establishment_id, name, price, category, description, available) SELECT 'd_h1_2','h1','Soupe du jour',9,'Entrees','Selon arrivage du marche',TRUE          WHERE NOT EXISTS (SELECT 1 FROM establishment_dishes WHERE id='d_h1_2' AND establishment_id='h1');
INSERT INTO establishment_dishes (id, establishment_id, name, price, category, description, available) SELECT 'd_h1_3','h1','Thiof grille',28,'Plats','Poisson local, riz, legumes',TRUE         WHERE NOT EXISTS (SELECT 1 FROM establishment_dishes WHERE id='d_h1_3' AND establishment_id='h1');
INSERT INTO establishment_dishes (id, establishment_id, name, price, category, description, available) SELECT 'd_h1_4','h1','Filet de boeuf',34,'Plats','Sauce au poivre, frites maison',TRUE    WHERE NOT EXISTS (SELECT 1 FROM establishment_dishes WHERE id='d_h1_4' AND establishment_id='h1');

-- Plats res1
INSERT INTO establishment_dishes (id, establishment_id, name, price, category, available) SELECT 'd_r1_1','res1','Thieboudienne Royal',18,'Entrees',TRUE WHERE NOT EXISTS (SELECT 1 FROM establishment_dishes WHERE id='d_r1_1' AND establishment_id='res1');
INSERT INTO establishment_dishes (id, establishment_id, name, price, category, available) SELECT 'd_r1_2','res1','Yassa Poulet',16,'Entrees',TRUE        WHERE NOT EXISTS (SELECT 1 FROM establishment_dishes WHERE id='d_r1_2' AND establishment_id='res1');
INSERT INTO establishment_dishes (id, establishment_id, name, price, category, available) SELECT 'd_r1_3','res1','Attieke Poisson',22,'Plats',TRUE       WHERE NOT EXISTS (SELECT 1 FROM establishment_dishes WHERE id='d_r1_3' AND establishment_id='res1');
INSERT INTO establishment_dishes (id, establishment_id, name, price, category, available) SELECT 'd_r1_4','res1','Kedjenou',20,'Plats',TRUE               WHERE NOT EXISTS (SELECT 1 FROM establishment_dishes WHERE id='d_r1_4' AND establishment_id='res1');
INSERT INTO establishment_dishes (id, establishment_id, name, price, category, available) SELECT 'd_r1_5','res1','Thiakry',8,'Desserts',TRUE              WHERE NOT EXISTS (SELECT 1 FROM establishment_dishes WHERE id='d_r1_5' AND establishment_id='res1');
INSERT INTO establishment_dishes (id, establishment_id, name, price, category, available) SELECT 'd_r1_6','res1','Banane Flambe',10,'Desserts',TRUE       WHERE NOT EXISTS (SELECT 1 FROM establishment_dishes WHERE id='d_r1_6' AND establishment_id='res1');

-- Plats res2
INSERT INTO establishment_dishes (id, establishment_id, name, price, category, available) SELECT 'd_r2_1','res2','Riz au Gras',8,'Plats',TRUE            WHERE NOT EXISTS (SELECT 1 FROM establishment_dishes WHERE id='d_r2_1' AND establishment_id='res2');
INSERT INTO establishment_dishes (id, establishment_id, name, price, category, available) SELECT 'd_r2_2','res2','To Sauce Arachide',10,'Plats',TRUE      WHERE NOT EXISTS (SELECT 1 FROM establishment_dishes WHERE id='d_r2_2' AND establishment_id='res2');
INSERT INTO establishment_dishes (id, establishment_id, name, price, category, available) SELECT 'd_r2_3','res2','Bissap',2,'Boissons',TRUE               WHERE NOT EXISTS (SELECT 1 FROM establishment_dishes WHERE id='d_r2_3' AND establishment_id='res2');
INSERT INTO establishment_dishes (id, establishment_id, name, price, category, available) SELECT 'd_r2_4','res2','Gingembre',2,'Boissons',TRUE            WHERE NOT EXISTS (SELECT 1 FROM establishment_dishes WHERE id='d_r2_4' AND establishment_id='res2');

-- Offres res1
INSERT INTO establishment_offers (id, establishment_id, name, price, available) SELECT 'o_r1_1','res1','Menu Decouverte',35,TRUE WHERE NOT EXISTS (SELECT 1 FROM establishment_offers WHERE id='o_r1_1' AND establishment_id='res1');
INSERT INTO establishment_offers (id, establishment_id, name, price, available) SELECT 'o_r1_2','res1','Brunch Dominical',28,TRUE WHERE NOT EXISTS (SELECT 1 FROM establishment_offers WHERE id='o_r1_2' AND establishment_id='res1');
INSERT INTO establishment_offers (id, establishment_id, name, price, available) SELECT 'o_r1_3','res1','Menu Business',22,TRUE   WHERE NOT EXISTS (SELECT 1 FROM establishment_offers WHERE id='o_r1_3' AND establishment_id='res1');

-- Offres res2
INSERT INTO establishment_offers (id, establishment_id, name, price, available) SELECT 'o_r2_1','res2','Plat du Jour',8,TRUE   WHERE NOT EXISTS (SELECT 1 FROM establishment_offers WHERE id='o_r2_1' AND establishment_id='res2');
INSERT INTO establishment_offers (id, establishment_id, name, price, available) SELECT 'o_r2_2','res2','Menu Complet',14,TRUE  WHERE NOT EXISTS (SELECT 1 FROM establishment_offers WHERE id='o_r2_2' AND establishment_id='res2');

-- Posts
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
