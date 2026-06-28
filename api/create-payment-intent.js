import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export default async function handler(req, res) {
  // CORS — autorise uniquement l'origine de l'app
  res.setHeader("Access-Control-Allow-Origin", process.env.APP_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "Stripe non configuré" });
  }

  try {
    const { amount, currency, resaId, estabName } = req.body;

    if (!amount || amount < 50) {
      return res.status(400).json({ error: "Montant invalide (minimum 0.50 EUR)" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),       // en centimes (ex: 12000 = 120.00 EUR)
      currency: currency || "eur",
      automatic_payment_methods: { enabled: true },
      metadata: {
        reservation_id: resaId || "",
        establishment:  estabName || "",
        platform:       "HotelPlatform Travel",
      },
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
