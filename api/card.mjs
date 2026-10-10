/* ═══════════════════════════════════════════════════════════
   Novalyx Research — paiement par carte bancaire (Stripe Checkout)
   Fonction serveur Vercel : /api/card

   Le navigateur envoie { items: [{ id, size, qty, name }], zone, lang, customer: {...} }.
   Le montant est RECALCULÉ ICI avec les mêmes règles que le Bitcoin et le virement (computeOrder) :
   tout le panier, les remises par quantité et la livraison passent en UN seul paiement.

   Variable d'environnement à créer dans Vercel (Settings → Environment Variables) :
     STRIPE_SECRET_KEY   clé Stripe « rk_live_… » (clé limitée) ou « sk_live_… »   ← en « Secret »
     SITE_URL            https://novalyxresearch.com (déjà créée pour le Bitcoin)
   ⚠ Ne jamais écrire la clé dans ce fichier : il est public sur GitHub.
═══════════════════════════════════════════════════════════ */
import { computeOrder } from "./checkout.mjs";

const clean = (v, max) => String(v == null ? "" : v).replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;
const cents = (n) => String(Math.round(n * 100));

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "méthode non autorisée" }); }
  const { STRIPE_SECRET_KEY, SITE_URL } = process.env;
  if (!STRIPE_SECRET_KEY) return res.status(503).json({ error: "carte non configurée" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};
  if (body.website) return res.status(400).json({ error: "refusé" }); // piège à robots

  const c = body.customer || {};
  const cu = {
    firstName: clean(c.firstName, 60), lastName: clean(c.lastName, 60), email: clean(c.email, 120).toLowerCase(),
    address: clean(c.address, 160), postcode: clean(c.postcode, 16), city: clean(c.city, 80), country: clean(c.country, 60), phone: clean(c.phone, 30),
  };
  if (!cu.firstName || !cu.lastName || !cu.address || !cu.postcode || !cu.city) return res.status(400).json({ error: "adresse incomplète" });
  if (!EMAIL_RE.test(cu.email)) return res.status(400).json({ error: "email invalide" });

  let order;
  try { order = computeOrder(body.items, body.zone); }
  catch (e) { return res.status(400).json({ error: e.message }); }

  const lang = ["EN", "DE", "NL"].includes(body.lang) ? body.lang : "FR";
  const FR = lang === "FR";
  const names = {};
  (Array.isArray(body.items) ? body.items : []).forEach((it) => { if (it && it.id) names[it.id + "|" + it.size] = clean(it.name, 60); });
  const orderId = "NVX-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const site = (SITE_URL || "https://novalyxresearch.com").replace(/\/+$/, "");

  const p = new URLSearchParams();
  p.append("mode", "payment");
  p.append("success_url", site + "/?paid=" + orderId);
  p.append("cancel_url", site + "/catalogue");
  p.append("customer_email", cu.email);
  p.append("client_reference_id", orderId);
  p.append("locale", { FR: "fr", EN: "en", DE: "de", NL: "nl" }[lang]);
  p.append("expires_at", String(Math.floor(Date.now() / 1000) + 60 * 60)); // session valable 1 h

  // Une ligne par article : le total de la ligne inclut déjà la remise par quantité.
  let i = 0;
  for (const l of order.lines) {
    const label = (names[l.id + "|" + l.size] || l.id) + " " + l.size + " × " + l.qty;
    p.append(`line_items[${i}][quantity]`, "1");
    p.append(`line_items[${i}][price_data][currency]`, "eur");
    p.append(`line_items[${i}][price_data][unit_amount]`, cents(l.total));
    p.append(`line_items[${i}][price_data][product_data][name]`, label.slice(0, 120));
    if (l.discount > 0) p.append(`line_items[${i}][price_data][product_data][description]`, (FR ? "Remise quantité −" : "Quantity discount −") + Math.round(l.discount * 100) + " %");
    i++;
  }
  if (order.shipping > 0) {
    p.append(`line_items[${i}][quantity]`, "1");
    p.append(`line_items[${i}][price_data][currency]`, "eur");
    p.append(`line_items[${i}][price_data][unit_amount]`, cents(order.shipping));
    p.append(`line_items[${i}][price_data][product_data][name]`, FR ? "Livraison suivie" : "Tracked shipping");
  }

  // Adresse et commande visibles dans le tableau de bord Stripe (paiement → métadonnées)
  const meta = {
    orderId, zone: String(body.zone), name: cu.firstName + " " + cu.lastName, email: cu.email,
    address: cu.address, postcode: cu.postcode, city: cu.city, country: cu.country, phone: cu.phone,
    summary: order.lines.map((l) => (names[l.id + "|" + l.size] || l.id) + " " + l.size + " x" + l.qty).join(", ").slice(0, 490),
  };
  for (const [k, v] of Object.entries(meta)) {
    if (!v) continue;
    p.append(`metadata[${k}]`, v);
    p.append(`payment_intent_data[metadata][${k}]`, v);
  }
  p.append("payment_intent_data[description]", "Novalyx Research — " + orderId);
  p.append("payment_intent_data[receipt_email]", cu.email);

  try {
    const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: "Bearer " + STRIPE_SECRET_KEY, "Content-Type": "application/x-www-form-urlencoded" },
      body: p.toString(),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.url) {
      const why = data && data.error && data.error.message ? String(data.error.message).slice(0, 160) : "session non créée";
      return res.status(502).json({ error: why });
    }
    return res.status(200).json({ url: data.url, orderId, total: order.total });
  } catch (e) {
    return res.status(502).json({ error: "Stripe injoignable" });
  }
}
