-- Ajout colonne premium_data dans profiles
-- Permet de persister l'abonnement Premium en base plutôt qu'en localStorage
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS premium_data JSONB DEFAULT NULL;
