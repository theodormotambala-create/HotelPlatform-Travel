import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// ============================================================================
// WEBHOOK STRIPE — la banque informe le serveur (preuve de paiement signée).
// C'est ICI, et seulement ici, qu'une réservation payée devient "confirmed".
//  1. Vérification de la signature Stripe (personne ne peut forger l'appel)
//  2. Confirmation de la réservation (le client n'a aucun pouvoir dessus)
//  3. Répartition marketplace : commission plateforme (configurable via
//     platform_settings, par type d'établissement et statut premium)
//  4. Registre d'audit "transactions" : montant total, commission, net
//     établissement, frais Stripe, comptes, date, statut
//  5. Notification de prélèvement de commission à l'établissement
// ============================================================================

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

// Stripe exige le corps BRUT pour vérifier la signature
export const config = { api: { bodyParser: false } };

async function rawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks);
}

function serviceClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// Taux de commission selon le type d'établissement et son statut premium
function commissionPct(settings, estabType, isPremium) {
  const c = (settings && settings.commission) || {};
  const key = estabType ? estabType + (isPremium ? "_premium" : "") : null;
  const v = (key && c[key] != null) ? c[key] : (estabType && c[estabType] != null ? c[estabType] : c.default);
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n <= 50 ? n : 10;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!process.env.STRIPE_SECRET_KEY || !whSecret) {
    console.error("Webhook Stripe non configuré (STRIPE_WEBHOOK_SECRET manquant)");
    return res.status(500).json({ error: "Webhook non configuré" });
  }

  let event;
  try {
    const buf = await rawBody(req);
    event = stripe.webhooks.constructEvent(buf, req.headers["stripe-signature"], whSecret);
  } catch (err) {
    console.error("Signature webhook invalide:", err.message);
    return res.status(400).json({ error: "Signature invalide" });
  }

  if (event.type !== "payment_intent.succeeded") {
    return res.status(200).json({ received: true });
  }

  const pi = event.data.object;
  const resaId = pi.metadata && pi.metadata.reservation_id;
  const payKind = (pi.metadata && pi.metadata.type) || "reservation";
  const supa = serviceClient();
  if (!supa) {
    console.error("SUPABASE_SERVICE_ROLE_KEY manquante — confirmation impossible");
    return res.status(500).json({ error: "Service non configuré" });
  }

  try {
    // ---------- CIRCUIT PLATEFORME : ABONNEMENT PREMIUM ----------
    if (payKind === "premium") {
      const plan = pi.metadata.plan;
      const months = parseInt(pi.metadata.months, 10);
      const userId = pi.metadata.user_id;
      // Idempotence
      const dupP = await supa.from("platform_revenues").select("id").eq("payment_intent_id", pi.id).maybeSingle();
      if (dupP.data) return res.status(200).json({ received: true, duplicate: true });
      // Validation du montant contre les TARIFS SERVEUR (le client ne fixe pas les prix)
      const st = await supa.from("platform_settings").select("premium_prices,premium_discounts").eq("id", 1).maybeSingle();
      const prices = (st.data && st.data.premium_prices) || {};
      const discs = (st.data && st.data.premium_discounts) || {};
      const price = Number(prices[plan]);
      const disc = Number(discs[String(months)] || 0);
      const expected = Math.round(price * months * (1 - disc) * 100);
      const paid = pi.amount_received || pi.amount || 0;
      if (!Number.isFinite(price) || ![1,3,6,12].includes(months) || !userId || paid !== expected) {
        await supa.from("platform_revenues").insert([{ kind: "other", amount_cents: paid, currency: pi.currency || "eur", user_id: userId || null, payment_intent_id: pi.id, note: "ANOMALIE premium: montant/plan invalide (attendu " + expected + ")" }]);
        return res.status(200).json({ received: true, anomaly: true });
      }
      // Attribution serveur (prolongation exacte geree en base) + notification
      await supa.rpc("grant_premium", { p_user: userId, p_plan: plan, p_months: months });
      // Revenu 100% plateforme, marque 'subscription' — JAMAIS dans le registre des etablissements
      await supa.from("platform_revenues").insert([{ kind: "subscription", amount_cents: paid, currency: pi.currency || "eur", user_id: userId, plan: plan, duration_months: months, payment_intent_id: pi.id }]);
      return res.status(200).json({ received: true, premium: true });
    }

    // ---------- CIRCUIT ETABLISSEMENTS : RESERVATIONS ----------
    // Idempotence : un même paiement ne produit jamais deux transactions
    const dup = await supa.from("transactions").select("id").eq("payment_intent_id", pi.id).maybeSingle();
    if (dup.data) return res.status(200).json({ received: true, duplicate: true });

    // Réservation concernée
    let resa = null;
    if (resaId) {
      const r = await supa.from("reservations").select("id,client_id,estab_id,estab_owner_id,estab_type,data").eq("id", resaId).maybeSingle();
      resa = r.data || null;
    }

    // Établissement (type + premium + compte Connect) pour le taux de commission
    let estabType = resa ? resa.estab_type : null;
    let isPremium = false;
    let ownerId = resa ? resa.estab_owner_id : null;
    if (ownerId) {
      const e = await supa.from("establishments").select("type,is_premium").eq("owner_id", ownerId).limit(1).maybeSingle();
      if (e.data) { estabType = e.data.type || estabType; isPremium = e.data.is_premium === true; }
    }

    // Réglages plateforme (panel admin)
    const s = await supa.from("platform_settings").select("commission").eq("id", 1).maybeSingle();
    const pct = commissionPct(s.data, estabType, isPremium);

    const total = pi.amount_received || pi.amount || 0;
    const commission = Math.round(total * pct / 100);
    const net = total - commission;

    // Frais Stripe réels (meilleure information disponible)
    let stripeFee = null;
    try {
      if (pi.latest_charge) {
        const ch = await stripe.charges.retrieve(pi.latest_charge, { expand: ["balance_transaction"] });
        if (ch.balance_transaction && typeof ch.balance_transaction.fee === "number") stripeFee = ch.balance_transaction.fee;
      }
    } catch (e) { /* non bloquant */ }

    // 1) Confirmation de la réservation — service role : le verrou serveur l'autorise
    if (resa) {
      await supa.from("reservations").update({ status: "confirmed", payment_intent_id: pi.id, updated_at: new Date().toISOString() }).eq("id", resa.id);
    }

    // 2) Registre d'audit
    await supa.from("transactions").insert([{
      reservation_id: resa ? resa.id : (resaId || null),
      payment_intent_id: pi.id,
      client_id: resa ? resa.client_id : null,
      estab_owner_id: ownerId,
      estab_name: resa ? resa.estab_id : (pi.metadata && pi.metadata.establishment) || null,
      amount_total_cents: total,
      commission_pct: pct,
      commission_cents: commission,
      net_estab_cents: net,
      stripe_fee_cents: stripeFee,
      currency: pi.currency || "eur",
      status: "succeeded",
      kind: "reservation"
    }]);

    // La COMMISSION est un revenu PLATEFORME : tracee separement, marquee 'commission'
    await supa.from("platform_revenues").insert([{
      kind: "commission",
      amount_cents: commission,
      currency: pi.currency || "eur",
      user_id: resa ? resa.client_id : null,
      estab_owner_id: ownerId,
      reservation_id: resa ? resa.id : (resaId || null),
      payment_intent_id: pi.id,
      note: pct + "% de " + total + " cts"
    }]);

    // 3) Notification de prélèvement de commission à l'établissement
    if (ownerId) {
      const fmt = (c) => (c / 100).toFixed(2) + " " + (pi.currency || "eur").toUpperCase();
      await supa.from("notifications").insert([{
        id: "srv_tx_" + pi.id,
        user_id: ownerId,
        icon: "Calendar", color: "#22C55E",
        title: "Paiement reçu",
        body: "Réservation payée " + fmt(total) + " — commission plateforme " + fmt(commission) + " (" + pct + "%) — net établissement " + fmt(net) + (resa ? " (réf. " + resa.id + ")" : ""),
        time: "maintenant", read: false, tab: "reservations",
        pref_key: "reservation", target_id: resa ? resa.id : null
      }]);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook traitement:", err.message);
    // 500 → Stripe re-essaiera automatiquement (aucune transaction perdue)
    return res.status(500).json({ error: "Traitement échoué" });
  }
}
