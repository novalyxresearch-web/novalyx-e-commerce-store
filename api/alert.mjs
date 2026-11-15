/* ═══════════════════════════════════════════════════════════
   Novalyx Research — « Me prévenir » : /api/alert
   Le visiteur laisse son e-mail sur un produit à venir. On envoie la demande
   à ORDER_EMAIL (ou SMTP_USER) par SMTP ; la liste est ensuite tenue dans Hostinger Reach.
   Variables d'environnement déjà présentes : SMTP_USER, SMTP_PASS (facultatif : ORDER_EMAIL, SMTP_HOST, SMTP_PORT).
═══════════════════════════════════════════════════════════ */
import { smtpSend } from "./_smtp.mjs";

const clean = (v, n) => String(v == null ? "" : v).replace(/[\r\n<>]/g, " ").trim().slice(0, n);

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "méthode non autorisée" }); }
  const { SMTP_USER, SMTP_PASS, ORDER_EMAIL, SMTP_HOST, SMTP_PORT } = process.env;
  if (!SMTP_USER || !SMTP_PASS) return res.status(503).json({ error: "non configuré" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};
  if (body.website) return res.status(200).json({ ok: true });            // champ piège : un robot l'a rempli, on ignore sans rien dire
  const email = clean(body.email, 120).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ error: "adresse e-mail invalide" });
  if (body.consent !== true) return res.status(400).json({ error: "consentement requis" });
  const product = clean(body.product, 80) || "(produit non précisé)";
  const size = clean(body.size, 30);
  const lang = body.lang === "EN" ? "EN" : "FR";

  try {
    await smtpSend({ host: SMTP_HOST || "smtp.hostinger.com", port: Number(SMTP_PORT) || 465, user: SMTP_USER, pass: SMTP_PASS }, [{
      to: ORDER_EMAIL || SMTP_USER, replyTo: email, fromName: "Novalyx Research — alertes",
      subject: `Me prévenir : ${product}${size ? " " + size : ""} — ${email}`,
      text: [
        "Nouvelle demande « Me prévenir » depuis le site.", "",
        `E-mail : ${email}`, `Produit : ${product}${size ? " " + size : ""}`, `Langue : ${lang}`,
        `Date : ${new Date().toISOString()}`, "",
        "La personne a coché la case : elle accepte de recevoir un e-mail à l'arrivée du lot.",
        "À faire : l'ajouter à la liste « Prévenez-moi » dans Hostinger Reach.",
      ].join("\n"),
    }]);
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ error: "envoi impossible" });
  }
}
