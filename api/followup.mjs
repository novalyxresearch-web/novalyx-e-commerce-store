/* ═══════════════════════════════════════════════════════════
   Novalyx Research — e-mails de suivi programmés : /api/followup
   Appelé par la tâche planifiée Vercel (vercel.json > crons). Aucune donnée client dans le code
   (le dépôt est public) : l'adresse est relue chez Stripe à partir du numéro de commande.
   Une copie est envoyée à ORDER_EMAIL (ou SMTP_USER) pour garder une trace.
═══════════════════════════════════════════════════════════ */
import { smtpSend } from "./_smtp.mjs";

/* Chaque suivi : numéro de commande, fenêtre d'envoi (UTC), texte. */
const FOLLOWUPS = [
  {
    orderId: "NVX-GYGVMW", from: "2026-11-16T10:30:00Z", until: "2026-11-16T14:00:00Z",
    subject: "Votre colis Novalyx arrive aujourd'hui · NVX-GYGVMW",
    text: (m) => [
      `Bonjour Madame ${String(m.name || "").trim().split(/\s+/).slice(-1)[0] || ""},`.replace(" ,", ","), "",
      "Votre colis (commande NVX-GYGVMW) doit vous être livré aujourd'hui. Vous pouvez suivre son trajet ici :",
      "https://www.laposte.fr/outils/suivre-vos-envois?code=8J02327842738", "",
      "Le numéro de lot est imprimé sur chaque flacon. Le rapport d'analyse du laboratoire Janoshik pour ce lot est publié sur la fiche du produit, et vous pouvez le vérifier sur le site de Janoshik avec la clé X9RYPGHBIEGS.", "",
      "À réception, nous vous conseillons de conserver les flacons au sec et à l'abri de la lumière.", "",
      "Une petite question, si vous avez une minute : comment avez-vous connu Novalyx Research ? Votre réponse nous aide beaucoup. Et si quelque chose ne va pas avec votre colis, répondez simplement à ce message, nous nous en occupons tout de suite.", "",
      "Merci encore pour votre confiance.", "",
      "L'équipe Novalyx Research", "novalyxresearch.com", "",
      "Produits destinés exclusivement à la recherche en laboratoire.",
    ].join("\n"),
  },
];

export default async function handler(req, res) {
  const { STRIPE_SECRET_KEY, SMTP_USER, SMTP_PASS, ORDER_EMAIL, SMTP_HOST, SMTP_PORT, CRON_SECRET } = process.env;
  const auth = req.headers.authorization || "";
  const fromCron = CRON_SECRET ? auth === "Bearer " + CRON_SECRET : /vercel-cron/i.test(req.headers["user-agent"] || "");
  if (!fromCron) return res.status(401).json({ error: "réservé à la tâche planifiée" });
  if (!STRIPE_SECRET_KEY || !SMTP_USER || !SMTP_PASS) return res.status(503).json({ error: "non configuré" });

  const now = Date.now();
  const due = FOLLOWUPS.filter((f) => now >= Date.parse(f.from) && now <= Date.parse(f.until));
  const done = [];
  for (const f of due) {
    try {
      const q = encodeURIComponent(`metadata['orderId']:'${f.orderId}'`);
      const r = await fetch("https://api.stripe.com/v1/payment_intents/search?query=" + q, { headers: { Authorization: "Bearer " + STRIPE_SECRET_KEY } });
      const pi = r.ok ? ((await r.json()).data || []).find((x) => x.status === "succeeded") : null;
      const m = (pi && pi.metadata) || {};
      const to = m.email || (pi && pi.receipt_email);
      if (!to) { done.push(f.orderId + " : adresse introuvable"); continue; }
      const body = f.text(m);
      await smtpSend({ host: SMTP_HOST || "smtp.hostinger.com", port: Number(SMTP_PORT) || 465, user: SMTP_USER, pass: SMTP_PASS }, [
        { to, replyTo: SMTP_USER, fromName: "Novalyx Research", subject: f.subject, text: body },
        { to: ORDER_EMAIL || SMTP_USER, fromName: "Novalyx Research — suivis", subject: "[Copie envoyée à " + to + "] " + f.subject, text: body },
      ]);
      done.push(f.orderId + " : envoyé");
    } catch (e) { done.push(f.orderId + " : erreur " + String((e && e.message) || e).slice(0, 80)); }
  }
  return res.status(200).json({ due: due.length, done });
}
