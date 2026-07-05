import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

// Client service : compte Connect de l'etablissement + taux de commission (platform_settings)
function serviceClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function commissionPct(settings, estabType, isPremium) {
  const c = (settings && settings.commission) || {};
  const key = estabType ? estabType + (isPremium ? "_premium" : "") : null;
  const v = (key && c[key] != null) ? c[key] : (estabType && c[estabType] != null ? c[estabType] : c.default);
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n <= 50 ? n : 10;
}

// Origines autorisées — jamais de wildcard en production
const ALLOWED_ORIGINS = (process.env.APP_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

function setCors(req, res) {
  const origin = req.headers.origin || "";
  // Si aucune origine configurée ou si l'origine n'est pas dans la liste → refus CORS
  const isAllowed = ALLOWED_ORIGINS.length > 0 && ALLOWED_ORIGINS.includes(origin);
  if (isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  return isAllowed;
}

export default async function handler(req, res) {
  const originAllowed = setCors(req, res);

  if (req.method === "OPTIONS") {
    return originAllowed ? res.status(200).end() : res.status(403).end();
  }
  if (!originAllowed) return res.status(403).json({ error: "Origine non autorisée" });
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("STRIPE_SECRET_KEY manquante — configurer dans Vercel Environment Variables");
    return res.status(500).json({ error: "Service de paiement non configuré" });
  }

  try {
    const { amount, currency, resaId, estabName, type, plan, months, userId } = req.body;
    const isPremiumPayment = type === "premium";

    // Validation stricte du montant (centimes) : 0.50 EUR min, 99 999.99 EUR max
    const amt = Math.round(Number(amount));
    if (!amt || amt < 50 || amt > 9999999) {
      return res.status(400).json({ error: "Montant invalide (0.50 EUR – 99 999 EUR)" });
    }

    // Validation devise : seulement les devises EUR/USD/GBP/XOF acceptées
    const ALLOWED_CURRENCIES = ["eur", "usd", "gbp", "xof"];
    const cur = (currency || "eur").toLowerCase();
    if (!ALLOWED_CURRENCIES.includes(cur)) {
      return res.status(400).json({ error: "Devise non supportée" });
    }

    // Nettoyage des métadonnées (max 500 chars chacune, conformité Stripe)
    const safeMeta = (v) => String(v || "").slice(0, 500);

    // Marketplace (Stripe Connect) : si l'etablissement a un compte branche,
    // la repartition est AUTOMATIQUE — l'argent part chez lui, la plateforme
    // ne garde que sa commission (taux configurable via le panel admin).
    const piParams = {
      amount: amt,
      currency: cur,
      automatic_payment_methods: { enabled: true },
      metadata: {
        reservation_id: safeMeta(resaId),
        establishment:  safeMeta(estabName),
        platform:       "HotelPlatform Travel",
        type:           isPremiumPayment ? "premium" : "reservation",
        plan:           isPremiumPayment ? safeMeta(plan) : "",
        months:         isPremiumPayment ? safeMeta(months) : "",
        user_id:        isPremiumPayment ? safeMeta(userId) : "",
      },
    };
    try {
      const supa = serviceClient();
      if (supa && estabName && !isPremiumPayment) { // jamais de Connect pour un abonnement (100% plateforme)
        const e = await supa.from("establishments").select("stripe_account_id,type,is_premium").eq("name", String(estabName)).limit(1).maybeSingle();
        if (e.data && e.data.stripe_account_id) {
          const s = await supa.from("platform_settings").select("commission").eq("id", 1).maybeSingle();
          const pct = commissionPct(s.data, e.data.type, e.data.is_premium === true);
          piParams.application_fee_amount = Math.round(amt * pct / 100);
          piParams.transfer_data = { destination: e.data.stripe_account_id };
        }
      }
    } catch (e) { /* repli : encaissement plateforme, repartition tracee par le webhook */ }

    const paymentIntent = await stripe.paymentIntents.create(piParams);

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe error:", err.message);
    // Ne jamais exposer les détails internes en production
    return res.status(500).json({ error: "Erreur lors de la création du paiement" });
  }
}
