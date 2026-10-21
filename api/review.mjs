/* ═══════════════════════════════════════════════════════════
   Novalyx Research — dépôt d'un avis client : /api/review
   Le client saisit son numéro de commande (NVX-XXXXXX) + son email + sa note + son texte.
   On vérifie chez Stripe qu'une commande PAYÉE existe avec ce numéro ET cet email → « achat vérifié ».
   (Virement / Bitcoin : pas vérifiable chez Stripe → marqué « à contrôler ».)
   L'avis n'est JAMAIS publié automatiquement : il arrive par email chez le vendeur, qui décide
   (les bons comme les mauvais) ; la ligne prête à ajouter dans public/reviews.json est dans l'email.
═══════════════════════════════════════════════════════════ */
import { smtpSend } from "./_smtp.mjs";

const clean = (s, max) => String(s || "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "méthode non autorisée" }); }
  const { STRIPE_SECRET_KEY, SMTP_USER, SMTP_PASS, ORDER_EMAIL, SMTP_HOST, SMTP_PORT } = process.env;
  if (!SMTP_USER || !SMTP_PASS) return res.status(503).json({ error: "non configuré" });
  let b = req.body; if (typeof b === "string") { try { b = JSON.parse(b); } catch (e) { b = {}; } } b = b || {};
  if (b.website) return res.status(200).json({ ok: true });            // champ piège anti-robots
  const orderId = clean(b.orderId, 20).toUpperCase(), email = clean(b.email, 120).toLowerCase();
  const name = clean(b.name, 40), text = clean(b.text, 700), rating = Math.round(Number(b.rating));
  if (!/^NVX-[A-Z0-9]{6}$/.test(orderId) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !(rating >= 1 && rating <= 5) || text.length < 15 || !name)
    return res.status(400).json({ error: "invalid" });

  let verified = false;
  if (STRIPE_SECRET_KEY) {
    try {
      const q = encodeURIComponent(`metadata['orderId']:'${orderId}'`);
      const r = await fetch("https://api.stripe.com/v1/payment_intents/search?limit=3&query=" + q, { headers: { Authorization: "Bearer " + STRIPE_SECRET_KEY } });
      if (r.ok) { const d = await r.json(); verified = (d.data || []).some((pi) => pi.status === "succeeded" && String((pi.metadata && pi.metadata.email) || "").toLowerCase() === email); }
    } catch (e) { /* vérification impossible : l'avis reste « à contrôler » */ }
  }
  const date = new Date().toISOString().slice(0, 10);
  const entry = { name, rating, text, date, verified };
  const mail = {
    to: ORDER_EMAIL || SMTP_USER, replyTo: email, fromName: "Novalyx Research — avis",
    subject: `Nouvel avis ${rating}/5 — ${orderId} — ${verified ? "achat vérifié" : "À CONTRÔLER"}`,
    text: [
      verified ? "ACHAT VÉRIFIÉ : commande payée par carte trouvée chez Stripe avec cet email." : "À CONTRÔLER : commande introuvable chez Stripe avec cet email (virement, Bitcoin ou numéro/email différent). Vérifie avant de publier.",
      "", `Commande : ${orderId}`, `Email : ${email}`, `Nom affiché : ${name}`, `Note : ${rating}/5`, "", "Avis :", text, "",
      "Pour le publier : dis-le moi et j'ajoute cette ligne au site (publie les avis honnêtes, bons ou moins bons) :",
      JSON.stringify(entry),
    ].join("\n"),
  };
  try { await smtpSend({ host: SMTP_HOST || "smtp.hostinger.com", port: Number(SMTP_PORT) || 465, user: SMTP_USER, pass: SMTP_PASS }, [mail]); }
  catch (e) { return res.status(502).json({ error: "mail" }); }
  return res.status(200).json({ ok: true, verified });
}
