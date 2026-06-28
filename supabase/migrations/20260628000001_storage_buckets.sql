-- =============================================================================
-- SUPABASE STORAGE — Buckets photos
-- A appliquer UNE SEULE FOIS depuis le dashboard Supabase
-- ou via : supabase db push
-- =============================================================================

-- Bucket photos de profil (client + pro) — public, 5 MB max
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true,
  5242880,
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public            = true,
  file_size_limit   = 5242880,
  allowed_mime_types = ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif'];

-- Bucket photos etablissements — public, 10 MB max
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'establishment-photos',
  'establishment-photos',
  true,
  10485760,
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public            = true,
  file_size_limit   = 10485760,
  allowed_mime_types = ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif'];

-- =============================================================================
-- RLS Storage — profile-photos
-- =============================================================================

-- Lecture publique (CDN)
DROP POLICY IF EXISTS "Public read profile-photos" ON storage.objects;
CREATE POLICY "Public read profile-photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-photos');

-- Upload : utilisateur authentifie dans son propre dossier (userId/)
DROP POLICY IF EXISTS "Auth upload profile-photos" ON storage.objects;
CREATE POLICY "Auth upload profile-photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Mise a jour : proprietaire uniquement
DROP POLICY IF EXISTS "Owner update profile-photos" ON storage.objects;
CREATE POLICY "Owner update profile-photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Suppression : proprietaire uniquement
DROP POLICY IF EXISTS "Owner delete profile-photos" ON storage.objects;
CREATE POLICY "Owner delete profile-photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================================================
-- RLS Storage — establishment-photos
-- =============================================================================

DROP POLICY IF EXISTS "Public read establishment-photos" ON storage.objects;
CREATE POLICY "Public read establishment-photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'establishment-photos');

DROP POLICY IF EXISTS "Auth upload establishment-photos" ON storage.objects;
CREATE POLICY "Auth upload establishment-photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'establishment-photos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Owner update establishment-photos" ON storage.objects;
CREATE POLICY "Owner update establishment-photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'establishment-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Owner delete establishment-photos" ON storage.objects;
CREATE POLICY "Owner delete establishment-photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'establishment-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
