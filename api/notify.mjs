/* ═══════════════════════════════════════════════════════════
   Novalyx Research — e-mail « nouvelle commande par carte »
   Fonction serveur Vercel : /api/notify

   Stripe appelle cette adresse (webhook « checkout.session.completed »).
   Pour ne pas dépendre d'un secret de signature, on NE FAIT PAS confiance au contenu reçu :
   on lit l'identifiant de la session, puis on la RELIT chez Stripe avec STRIPE_SECRET_KEY.
   Seule une commande réellement payée, passée sur ce site (métadonnée orderId) et récente
   déclenche un e-mail vers ORDER_EMAIL (ou SMTP_USER), avec l'adresse de livraison.

   Variables d'environnement déjà présentes : STRIPE_SECRET_KEY, SMTP_USER, SMTP_PASS
   (facultatif : ORDER_EMAIL, SMTP_HOST, SMTP_PORT).
═══════════════════════════════════════════════════════════ */
import { smtpSend } from "./_smtp.mjs";
import { buildCustomerMail } from "./_mail.mjs";

const eur = (n) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
const MAX_AGE_S = 24 * 3600;

/* Construit l'e-mail destiné au vendeur à partir d'une session Stripe payée. */
export function buildOwnerMail(s, to) {
  const m = s.metadata || {};
  const total = (s.amount_total || 0) / 100;
  const addr = [m.name, m.address, [m.postcode, m.city].filter(Boolean).join(" "), m.country, m.phone ? "Tél. " + m.phone : null].filter(Boolean);
  return {
    to, replyTo: m.email || undefined, fromName: "Novalyx Research — commandes",
    subject: `Nouvelle commande par carte ${m.orderId} — ${eur(total)}`,
    text: [
      `Nouvelle commande PAYÉE par carte : ${m.orderId}`, "",
      "Articles : " + (m.summary || "(voir Stripe)"),
      m.promo ? "Code promo : " + m.promo : null,
      `Zone de livraison : ${m.zone || "?"}`,
      `TOTAL ENCAISSÉ : ${eur(total)}`, "",
      "À expédier à :", ...addr, `Email : ${m.email || (s.customer_details && s.customer_details.email) || "?"}`, "",
      "À faire : préparer le colis, expédier, puis envoyer le numéro de suivi au client (répondre à cet e-mail écrit directement au client).",
      "Détail du paiement : Stripe → Paiements → " + m.orderId,
    ].filter((l) => l !== null).join("\n"),
  };
}

/* Mail de confirmation pour le client, à partir d'une session Stripe payée (lignes lues chez Stripe, pas dans le navigateur). */
const SHIP_NAMES = ["Livraison suivie", "Tracked shipping"];
export function buildCustomerFromSession(s, replyTo, site) {
  const m = s.metadata || {};
  const items = (s.line_items && s.line_items.data) || [];
  const rows = items.filter((l) => !SHIP_NAMES.includes(l.description)).map((l) => ({ label: l.description || "Article", amount: (l.amount_total || 0) / 100 }));
  const ship = items.filter((l) => SHIP_NAMES.includes(l.description)).reduce((a, l) => a + (l.amount_total || 0) / 100, 0);
  const email = m.email || (s.customer_details && s.customer_details.email);
  if (!email) return null;
  return buildCustomerMail({
    orderId: m.orderId, name: m.name, email, lang: String(s.locale || "fr").toLowerCase() === "fr" ? "FR" : "EN", pay: "card",
    rows, promo: m.promo || "", shipping: ship, total: (s.amount_total || 0) / 100, site,
    address: [m.name, m.address, [m.postcode, m.city].filter(Boolean).join(" "), m.country],
  }, replyTo);
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "méthode non autorisée" }); }
  const { STRIPE_SECRET_KEY, SMTP_USER, SMTP_PASS, ORDER_EMAIL, SMTP_HOST, SMTP_PORT } = process.env;
  if (!STRIPE_SECRET_KEY || !SMTP_USER || !SMTP_PASS) return res.status(503).json({ error: "non configuré" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};
  const id = body.data && body.data.object && body.data.object.id;
  if (body.type !== "checkout.session.completed" && body.type !== "checkout.session.async_payment_succeeded") return res.status(200).json({ ignored: true });
  if (typeof id !== "string" || !/^cs_(live|test)_[A-Za-z0-9]+$/.test(id)) return res.status(200).json({ ignored: true });

  let s;
  try {
    const r = await fetch("https://api.stripe.com/v1/checkout/sessions/" + id + "?expand[]=line_items", { headers: { Authorization: "Bearer " + STRIPE_SECRET_KEY } });
    if (!r.ok) return res.status(502).json({ error: "stripe " + r.status });
    s = await r.json();
  } catch (e) { return res.status(502).json({ error: "Stripe injoignable" }); }

  const fresh = Math.floor(Date.now() / 1000) - (s.created || 0) < MAX_AGE_S;
  if (s.payment_status !== "paid" || !(s.metadata && s.metadata.orderId) || !fresh) return res.status(200).json({ ignored: true });

  try {
    const mails = [buildOwnerMail(s, ORDER_EMAIL || SMTP_USER)];
    const site = (process.env.SITE_URL || "https://novalyxresearch.com").trim().replace(/[\/.\s]+$/, "");
    const cm = buildCustomerFromSession(s, SMTP_USER, site);   // confirmation au client, envoyée depuis la boîte contact@
    if (cm) mails.push(cm);
    await smtpSend({ host: SMTP_HOST || "smtp.hostinger.com", port: Number(SMTP_PORT) || 465, user: SMTP_USER, pass: SMTP_PASS }, mails);
  } catch (e) { return res.status(502).json({ error: "email non envoyé" }); }   // Stripe réessaiera
  return res.status(200).json({ ok: true });
}
