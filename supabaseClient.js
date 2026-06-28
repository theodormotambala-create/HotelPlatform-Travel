// =====================================================================
// Client Supabase — point de connexion unique a la base de donnees
// ---------------------------------------------------------------------
// Installe la dependance avec :  npm install @supabase/supabase-js
// =====================================================================
import { createClient } from "@supabase/supabase-js";

// URL et cle publique du projet — lues depuis les variables d'environnement Vercel
// Ne jamais mettre de valeurs en dur ici — configurer dans le dashboard Vercel
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_KEY;

// Indicateur simple : la connexion est-elle configuree ?
export const SUPABASE_READY =
  typeof SUPABASE_URL === "string" && SUPABASE_URL.startsWith("http") &&
  typeof SUPABASE_KEY === "string" && SUPABASE_KEY.length > 10;

export const supabase = SUPABASE_READY
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;
