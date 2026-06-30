-- Ajout colonne cover_url dans profiles
-- Permet aux établissements (pro) de personnaliser leur photo de couverture
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS cover_url TEXT DEFAULT NULL;
