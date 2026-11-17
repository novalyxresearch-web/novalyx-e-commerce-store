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
      "Le numéro de lot est imprimé sur chaque flacon. Le rapport d'analyse du laboratoire Janoshik pour ce lot est publié sur la fiche du produit, et vous pouvez le vérifier sur le site de Janoshik avec la clé X9RYPGHB1EGS.", "",
      "À réception, nous vous conseillons de conserver les flacons au sec et à l'abri de la lumière.", "",
      "Une petite question, si vous avez une minute : comment avez-vous connu Novalyx Research ? Votre réponse nous aide beaucoup. Et si quelque chose ne va pas avec votre colis, répondez simplement à ce message, nous nous en occupons tout de suite.", "",
      "Merci encore pour votre confiance.", "",
      "L'équipe Novalyx Research", "novalyxresearch.com", "",
      "Produits destinés exclusivement à la recherche en laboratoire.",
    ].join("\n"),
  },
  {
    orderId: "NVX-GYGVMW", from: "2026-11-16T19:00:00Z", until: "2026-11-16T22:00:00Z",
    subject: "Re : Votre colis Novalyx · NVX-GYGVMW",
    text: (m) => [
      `Bonjour Madame ${String(m.name || "").trim().split(/\s+/).slice(-1)[0] || ""},`.replace(" ,", ","), "",
      "Merci beaucoup pour votre message, ça nous fait vraiment plaisir.", "",
      "C'est noté : vous serez prévenue en priorité. Voici ce qui arrive :",
      "• un nouveau lot de GLP-3RT, prévu pour mi-décembre ;",
      "• le GHK-Cu, notre prochaine molécule, prévu pour fin janvier.",
      "Nous vous enverrons un e-mail dès l'ouverture des précommandes.", "",
      "Un petit conseil en attendant : ne vous précipitez pas sur des flacons vendus à l'unité à des prix très élevés. Un peu de patience vaut le coup : chez nous, chaque lot est analysé chez Janoshik avant tout envoi, le rapport est publié sur le site, et le prix reste le même pour tout le monde.", "",
      "Si vous connaissez des personnes qui cherchent une source fiable et des prix justes, n'hésitez pas à partager notre site autour de vous, c'est ce qui nous aide le plus.", "",
      "À noter : nous ne proposons plus l'eau bactériostatique sur Novalyx, nous nous concentrons désormais uniquement sur les peptides.", "",
      "Merci encore pour votre confiance, et à très bientôt.", "",
      "L'équipe Novalyx Research", "novalyxresearch.com",
    ].join("\n"),
  },
  {
    orderId: "NVX-GYGVMW", from: "2026-11-17T09:30:00Z", until: "2026-11-17T12:00:00Z",
    subject: "Re : Votre colis Novalyx · NVX-GYGVMW",
    text: (m) => [
      `Bonjour Madame ${String(m.name || "").trim().split(/\s+/).slice(-1)[0] || ""},`.replace(" ,", ","), "",
      "Merci de nous l'avoir signalé, et toutes nos excuses pour cet oubli.", "",
      "Pouvez-vous simplement nous confirmer que c'est la boîte d'eau bactériostatique qui contient 9 flacons ? Comme nous ne la proposons plus, nous ne pouvons pas vous renvoyer le flacon manquant. Nous vous proposons donc, au choix :",
      "• le remboursement du flacon, soit 3,80 € sur votre moyen de paiement ;",
      "• ou un code de réduction de 10 €, valable sur votre prochaine commande sur le site (GHK-Cu ou autre).",
      "Dites-nous simplement ce que vous préférez.", "",
      "Pour vos autres questions, voici ce qui arrive :",
      "• GLP-3RT : nouveau lot prévu pour mi-décembre ;",
      "• GHK-Cu : fin janvier ;",
      "• MOTS-c, KPV et Semax suivront dans les mois suivants, au rythme d'une nouvelle molécule par mois.",
      "Le Snap-8 et le SLU-PP-332 ne sont pas prévus pour le moment.", "",
      "Vous êtes sur notre liste prioritaire : vous recevrez un e-mail à l'ouverture de chaque précommande.", "",
      "Encore désolés pour ce désagrément, et merci pour votre confiance.", "",
      "L'équipe Novalyx Research", "novalyxresearch.com",
    ].join("\n"),
  },
  {
    orderId: "NVX-GYGVMW", from: "2026-11-17T15:00:00Z", until: "2026-11-17T18:00:00Z",
    subject: "Votre flacon GLP-3RT est en route · NVX-GYGVMW",
    text: (m) => [
      `Bonjour Madame ${String(m.name || "").trim().split(/\s+/).slice(-1)[0] || ""},`.replace(" ,", ","), "",
      "Toutes nos excuses pour la confusion : le flacon manquant était bien le GLP-3RT, et non l'eau bactériostatique.", "",
      "Le flacon manquant, issu du même lot que le reste de votre kit (NLR-2026-001), vient de partir aujourd'hui en Colissimo, à nos frais. Livraison prévue sous 2 jours ouvrés.", "",
      "Numéro de suivi : 8J02330312594",
      "Suivre le colis : https://www.laposte.fr/outils/suivre-vos-envois?code=8J02330312594", "",
      "Encore désolés pour cet oubli, et merci pour votre patience et votre confiance.", "",
      "L'équipe Novalyx Research", "novalyxresearch.com",
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
