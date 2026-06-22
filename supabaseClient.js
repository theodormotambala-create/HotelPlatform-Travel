// =====================================================================
// Client Supabase — point de connexion unique a la base de donnees
// ---------------------------------------------------------------------
// Installe la dependance avec :  npm install @supabase/supabase-js
// =====================================================================
import { createClient } from "@supabase/supabase-js";

// URL et cle publique du projet (la cle "publishable" est faite pour le front-end)
const SUPABASE_URL = "https://zptnfhmufxjrrkknqlle.supabase.co";
const SUPABASE_KEY = "sb_publishable_GJBKtE245VFPGf17LbYa_w_zZ3uPgcG";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Indicateur simple : la connexion est-elle configuree ?
export const SUPABASE_READY =
  SUPABASE_URL.indexOf("http") === 0 && SUPABASE_KEY.length > 10;
