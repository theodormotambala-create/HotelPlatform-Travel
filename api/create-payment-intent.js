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
    const { amount, currency, resaId, estabName, type, plan, months, userId, campaignId, trialDays } = req.body;
    const isPremiumPayment = type === "premium";
    const isAdPayment = type === "ad_campaign";

    // ---------- CIRCUIT SPONSOR & BOOST (separe du Premium et des reservations) ----------
    // Le montant est IMPOSE par le serveur depuis la campagne (prix fixe par la config admin
    // au moment de la creation) — le client ne transmet que l'identifiant de SA campagne.
    if (isAdPayment) {
      const supaAds = serviceClient();
      if (!supaAds) return res.status(500).json({ error: "Service non configuré" });
      const c = await supaAds.from("ad_campaigns")
        .select("id,advertiser_id,price,currency,status")
        .eq("id", String(campaignId || "")).maybeSingle();
      if (!c.data) return res.status(404).json({ error: "Campagne introuvable" });
      if (!userId || c.data.advertiser_id !== String(userId)) return res.status(403).json({ error: "Non autorisé" });
      if (c.data.status !== "pending_payment") return res.status(400).json({ error: "Campagne déjà traitée" });
      const adAmt = Math.round(Number(c.data.price) * 100);
      if (!adAmt || adAmt < 50) return res.status(400).json({ error: "Montant de campagne invalide" });
      const adPi = await stripe.paymentIntents.create({
        amount: adAmt,
        currency: String(c.data.currency || "EUR").toLowerCase(),
        automatic_payment_methods: { enabled: true },
        metadata: {
          platform: "HotelPlatform Travel",
          type: "ad_campaign",
          campaign_id: String(c.data.id),
          user_id: String(c.data.advertiser_id),
        },
      });
      return res.status(200).json({ clientSecret: adPi.client_secret, amount: adAmt });
    }

    // ---------- MONTANT D'UNE RESERVATION : IMPOSE PAR LE SERVEUR ----------
    // Le montant transmis par le navigateur n'est jamais une source de verite :
    // il suffisait d'appeler cette route a la main pour payer 0,50 EUR une suite.
    // La reservation porte desormais son propre total (colonne total_price,
    // elle-meme controlee en base par enforce_reservation_price) : c'est lui
    // qui fait foi des qu'il existe.
    let amt = Math.round(Number(amount));
    // Identifiant REEL de l'etablissement, lu sur la reservation. C'est
    // protect_reservation_status qui le resout et l'ecrit cote serveur : il ne
    // peut pas etre dicte par le navigateur, contrairement au nom transmis
    // dans le corps de la requete.
    let estabIdReel = null;
    if (!isPremiumPayment && resaId) {
      try {
        const supaR = serviceClient();
        if (supaR) {
          const rr = await supaR.from("reservations")
            .select("id,total_price,status,establishment_id").eq("id", String(resaId)).maybeSingle();
          if (rr.data) {
            estabIdReel = rr.data.establishment_id || null;
            if (rr.data.total_price != null) {
              const serveur = Math.round(Number(rr.data.total_price) * 100);
              if (!Number.isFinite(serveur) || serveur < 50) {
                return res.status(400).json({ error: "Montant de réservation invalide" });
              }
              amt = serveur;
            }
          }
        }
      } catch (e) { /* repli sur la validation ci-dessous */ }
    }

    // ---------- MONTANT D'UN ABONNEMENT PREMIUM : IMPOSE PAR LE SERVEUR ----------
    // La relecture serveur ci-dessus exclut explicitement le premium
    // (« !isPremiumPayment ») : le montant preleve etait donc celui transmis par
    // le navigateur. Le webhook le verifie bien, mais APRES l'encaissement : un
    // montant arbitraire etait preleve, l'abonnement refuse, et un remboursement
    // restait a instruire. Le meme ecart se produisait sans aucune malveillance,
    // quand la tarification serveur devenait indisponible cote navigateur : il
    // retombait sur des tarifs par defaut ecrits en dur et le client payait
    // l'ancien prix sans rien recevoir.
    // Le prix est desormais calcule ICI, depuis la MEME source
    // (platform_settings, id 1) et avec EXACTEMENT les memes formules que
    // stripe-webhook.js : essai 15 jours l.92, abonnement mensuel l.104. Les
    // deux cotes ne peuvent donc plus diverger. Si le tarif ne peut pas etre
    // etabli, la demande est refusee : rien n'est preleve.
    if (isPremiumPayment) {
      const supaP = serviceClient();
      if (!supaP) return res.status(500).json({ error: "Service non configuré" });
      // Le webhook exige l'identifiant du compte pour attribuer l'abonnement :
      // sans lui, le paiement serait encaisse sans beneficiaire possible.
      if (!userId) return res.status(403).json({ error: "Non autorisé" });
      const stP = await supaP.from("platform_settings")
        .select("premium_prices,premium_discounts").eq("id", 1).maybeSingle();
      const pricesP = (stP.data && stP.data.premium_prices) || {};
      const discsP = (stP.data && stP.data.premium_discounts) || {};
      const joursEssai = parseInt(trialDays || "0", 10);
      let attendu;
      if (joursEssai === 15) {
        // Essai 15 jours : meme repli que le webhook (4,99) si trial15 n'est pas configure.
        if (!["std", "plus", "biz"].includes(plan)) {
          return res.status(400).json({ error: "Offre Premium invalide" });
        }
        const prixEssai = Number(pricesP.trial15);
        attendu = Math.round((Number.isFinite(prixEssai) ? prixEssai : 4.99) * 100);
      } else {
        const mois = parseInt(months, 10);
        const prix = Number(pricesP[plan]);
        const remise = Number(discsP[String(mois)] || 0);
        // Memes refus que le webhook : plan sans tarif configure, duree hors
        // des quatre durees servies. Aucun repli en dur cote mensuel — le
        // webhook n'en a pas non plus.
        if (!Number.isFinite(prix) || ![1, 3, 6, 12].includes(mois) || !Number.isFinite(remise)) {
          return res.status(400).json({ error: "Offre Premium invalide" });
        }
        attendu = Math.round(prix * mois * (1 - remise) * 100);
      }
      if (!Number.isFinite(attendu) || attendu < 50) {
        return res.status(400).json({ error: "Tarif Premium indisponible" });
      }
      amt = attendu;
    }

    // Validation stricte du montant (centimes) : 0.50 EUR min, 99 999.99 EUR max
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
        premium_days:   isPremiumPayment ? safeMeta(trialDays || "") : "",
        user_id:        isPremiumPayment ? safeMeta(userId) : "",
      },
    };
    try {
      const supa = serviceClient();
      // La DESTINATION DES FONDS est resolue par l'IDENTIFIANT de
      // l'etablissement porte par la reservation, jamais par le nom transmis
      // par le navigateur. « establishments.name » n'a aucune contrainte
      // d'unicite : deux etablissements homonymes faisaient partir l'argent
      // sur le mauvais compte Connect, et ce nom venait du corps de la requete.
      // Sans identifiant fiable, aucun Connect n'est pose : la plateforme
      // encaisse et le webhook trace la repartition — comportement deja prevu
      // lorsque l'etablissement n'a pas de compte branche.
      if (supa && estabIdReel && !isPremiumPayment) { // jamais de Connect pour un abonnement (100% plateforme)
        const e = await supa.from("establishments").select("stripe_account_id,type,is_premium").eq("id", estabIdReel).maybeSingle();
        if (e.data && e.data.stripe_account_id) {
          const s = await supa.from("platform_settings").select("commission").eq("id", 1).maybeSingle();
          const pct = commissionPct(s.data, e.data.type, e.data.is_premium === true);
          piParams.application_fee_amount = Math.round(amt * pct / 100);
          piParams.transfer_data = { destination: e.data.stripe_account_id };
        }
      }
    } catch (e) { /* repli : encaissement plateforme, repartition tracee par le webhook */ }

    const paymentIntent = await stripe.paymentIntents.create(piParams);

    // Le montant RETENU est renvoye, comme le fait deja la branche campagne
    // ci-dessus : l'ecran annonce ce qui est reellement preleve, et non un
    // total recalcule dans le navigateur.
    return res.status(200).json({ clientSecret: paymentIntent.client_secret, amount: amt });
  } catch (err) {
    console.error("Stripe error:", err.message);
    // Ne jamais exposer les détails internes en production
    return res.status(500).json({ error: "Erreur lors de la création du paiement" });
  }
}
