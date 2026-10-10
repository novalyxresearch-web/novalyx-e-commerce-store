/* ═══════════════════════════════════════════════════════════
   Novalyx Research — commande payée par virement bancaire
   Fonction serveur Vercel : /api/order

   Le navigateur envoie { items: [{ id, size, qty, name }], zone, lang, customer: {...} }.
   Le montant est RECALCULÉ ICI avec les mêmes règles que le paiement Bitcoin (computeOrder).
   Deux emails partent de votre adresse Hostinger :
     1. à vous : la commande complète (articles, montant, adresse de livraison) ;
     2. au client : le montant, l'IBAN, le BIC, le titulaire et la référence à indiquer.

   Variables d'environnement à créer dans Vercel (Settings → Environment Variables) :
     SMTP_USER     votre adresse pro Hostinger (ex. contact@novalyxresearch.com)
     SMTP_PASS     le mot de passe de cette boîte mail          ← en « Secret »
     ORDER_EMAIL   (facultatif) l'adresse qui reçoit les commandes ; par défaut SMTP_USER
     SMTP_HOST     (facultatif) par défaut smtp.hostinger.com
     SMTP_PORT     (facultatif) par défaut 465
   ⚠ Ne jamais écrire le mot de passe dans ce fichier : il est public sur GitHub.
═══════════════════════════════════════════════════════════ */
import tls from "node:tls";
import { computeOrder } from "./checkout.mjs";

// Coordonnées bancaires (déjà affichées publiquement sur le site, identiques à CONFIG.BANK dans App.jsx).
const BANK = {
  holder: "JALLOH TCHIERMO",
  trading: "Novalyx Research",
  iban: "FR76 1741 8000 0100 0121 0470 797",
  bic: "SNNNFR22XXX",
};
const PAY_WITHIN_HOURS = 48;

const clean = (v, max) => String(v == null ? "" : v).replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
const eur = (n) => n.toFixed(2).replace(".", ",") + " €";
const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;

/* ── Envoi d'email en SMTP (TLS direct, port 465), sans dépendance externe ── */
const b64 = (s) => Buffer.from(s, "utf8").toString("base64");
const encHeader = (s) => /^[\x20-\x7E]*$/.test(s) ? s : "=?UTF-8?B?" + b64(s) + "?=";
function buildMessage({ from, fromName, to, replyTo, subject, text }) {
  const body = b64(text.replace(/\r?\n/g, "\r\n")).replace(/.{1,76}/g, "$&\r\n");
  const domain = from.split("@")[1] || "localhost";
  return [
    `From: ${encHeader(fromName)} <${from}>`,
    `To: <${to}>`,
    replyTo ? `Reply-To: <${replyTo}>` : null,
    `Subject: ${encHeader(subject)}`,
    `Date: ${new Date().toUTCString().replace("GMT", "+0000")}`,
    `Message-ID: <${Date.now().toString(36)}.${Math.random().toString(36).slice(2)}@${domain}>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    body,
  ].filter((l) => l !== null).join("\r\n");
}
export function smtpSend(cfg, mails, connect = tls.connect) {
  return new Promise((resolve, reject) => {
    const sock = connect({ host: cfg.host, port: cfg.port, servername: cfg.host });
    let buf = "", waiting = null, done = false;
    const fail = (e) => { if (done) return; done = true; try { sock.destroy(); } catch (x) {} reject(e instanceof Error ? e : new Error(String(e))); };
    const timer = setTimeout(() => fail(new Error("délai SMTP dépassé")), 20000);
    sock.setEncoding("utf8");
    sock.on("error", fail);
    sock.on("data", (d) => {
      buf += d;
      let m;
      while ((m = buf.match(/^(\d{3})([ -])(.*)\r?\n/m)) && waiting) {
        const idx = buf.indexOf(m[0]); buf = buf.slice(idx + m[0].length);
        if (m[2] === " ") { const w = waiting; waiting = null; w(Number(m[1]), m[3]); }
      }
    });
    const expect = (codes) => new Promise((res, rej) => { waiting = (code, msg) => codes.includes(code) ? res(code) : rej(new Error("SMTP " + code + " " + msg)); if (buf) sock.emit("data", ""); });
    const cmd = (line, codes) => { const p = expect(codes); sock.write(line + "\r\n"); return p; };
    (async () => {
      await expect([220]);
      await cmd("EHLO novalyxresearch.com", [250]);
      await cmd("AUTH LOGIN", [334]);
      await cmd(b64(cfg.user), [334]);
      await cmd(b64(cfg.pass), [235]);
      for (const m of mails) {
        await cmd(`MAIL FROM:<${cfg.user}>`, [250]);
        await cmd(`RCPT TO:<${m.to}>`, [250, 251]);
        await cmd("DATA", [354]);
        await cmd(buildMessage({ ...m, from: cfg.user }) + "\r\n.", [250]);
      }
      sock.write("QUIT\r\n");
      done = true; clearTimeout(timer); sock.end(); resolve();
    })().catch((e) => { clearTimeout(timer); fail(e); });
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "méthode non autorisée" }); }
  const { SMTP_USER, SMTP_PASS, ORDER_EMAIL, SMTP_HOST, SMTP_PORT } = process.env;
  if (!SMTP_USER || !SMTP_PASS) return res.status(503).json({ error: "virement non configuré" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};
  const FR = body.lang !== "EN" && body.lang !== "DE" && body.lang !== "NL";
  if (body.website) return res.status(200).json({ ok: true }); // piège à robots : on ignore sans rien envoyer

  const c = body.customer || {};
  const cu = {
    firstName: clean(c.firstName, 60), lastName: clean(c.lastName, 60), email: clean(c.email, 120).toLowerCase(),
    address: clean(c.address, 160), postcode: clean(c.postcode, 16), city: clean(c.city, 80), country: clean(c.country, 60), phone: clean(c.phone, 30),
  };
  if (!cu.firstName || !cu.lastName || !cu.address || !cu.postcode || !cu.city || !cu.country) return res.status(400).json({ error: "adresse incomplète" });
  if (!EMAIL_RE.test(cu.email)) return res.status(400).json({ error: "email invalide" });

  let order;
  try { order = computeOrder(body.items, body.zone); }
  catch (e) { return res.status(400).json({ error: e.message }); }

  const names = {};
  (Array.isArray(body.items) ? body.items : []).forEach((it) => { if (it && it.id) names[it.id + "|" + it.size] = clean(it.name, 60); });
  const label = (l) => (names[l.id + "|" + l.size] || l.id) + " " + l.size;
  const orderId = "NVX-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const lines = order.lines.map((l) => `- ${label(l)} × ${l.qty} : ${eur(l.total)}${l.discount > 0 ? ` (−${Math.round(l.discount * 100)} %)` : ""}`);
  const ship = order.shipping === 0 ? (FR ? "offerte" : "free") : eur(order.shipping);
  const addr = [`${cu.firstName} ${cu.lastName}`, cu.address, `${cu.postcode} ${cu.city}`, cu.country, cu.phone ? (FR ? "Tél. " : "Phone ") + cu.phone : null].filter(Boolean);

  const toOwner = {
    to: ORDER_EMAIL || SMTP_USER, replyTo: cu.email, fromName: "Novalyx Research — commandes",
    subject: `Nouvelle commande par virement ${orderId} — ${eur(order.total)}`,
    text: [
      `Nouvelle commande par virement : ${orderId}`, "",
      "Articles :", ...lines,
      `Sous-total : ${eur(order.subtotal)}`, `Livraison (${body.zone}) : ${order.shipping === 0 ? "offerte" : eur(order.shipping)}`, `TOTAL À RECEVOIR : ${eur(order.total)}`, "",
      "Client :", ...addr, `Email : ${cu.email}`, `Langue : ${body.lang || "FR"}`, "",
      `À faire : vérifier sur Shine la réception de ${eur(order.total)} avec la référence ${orderId}, puis expédier.`,
      `Le client a été invité à payer sous ${PAY_WITHIN_HOURS} h. Répondre à cet email écrit directement au client.`,
    ].join("\n"),
  };
  const toCustomer = {
    to: cu.email, replyTo: ORDER_EMAIL || SMTP_USER, fromName: "Novalyx Research",
    subject: FR ? `Votre commande ${orderId} — coordonnées de virement` : `Your order ${orderId} — bank transfer details`,
    text: (FR ? [
      `Bonjour ${cu.firstName},`, "",
      `Merci pour votre commande ${orderId}. Elle est réservée ${PAY_WITHIN_HOURS} heures : il vous reste à effectuer le virement.`, "",
      "Montant à virer : " + eur(order.total),
      "Référence à indiquer dans le libellé : " + orderId, "",
      "Titulaire : " + BANK.holder + " (" + BANK.trading + ")",
      "IBAN : " + BANK.iban, "BIC : " + BANK.bic, "",
      "Votre commande :", ...lines, `Livraison : ${ship}`, `Total : ${eur(order.total)}`, "",
      "Adresse de livraison :", ...addr, "",
      "Le titulaire indiqué est le nom légal du compte : c'est lui que votre banque affichera lors de la vérification du bénéficiaire.",
      "Dès réception du virement (souvent immédiate avec un virement instantané), nous préparons votre colis et vous envoyons le numéro de suivi.",
      "Une question ? Répondez simplement à cet email.", "",
      "Produits destinés exclusivement à la recherche en laboratoire. Pas pour usage humain ou vétérinaire.",
      "Novalyx Research — novalyxresearch.com",
    ] : [
      `Hello ${cu.firstName},`, "",
      `Thank you for your order ${orderId}. It is reserved for ${PAY_WITHIN_HOURS} hours: all that is left is the bank transfer.`, "",
      "Amount to transfer: " + eur(order.total),
      "Reference to quote in the payment label: " + orderId, "",
      "Account holder: " + BANK.holder + " (" + BANK.trading + ")",
      "IBAN: " + BANK.iban, "BIC: " + BANK.bic, "",
      "Your order:", ...lines, `Shipping: ${ship}`, `Total: ${eur(order.total)}`, "",
      "Delivery address:", ...addr, "",
      "The holder shown is the legal name on the account: it is the name your bank will display when it checks the beneficiary.",
      "As soon as the transfer arrives (often immediately with an instant transfer), we prepare your parcel and send you the tracking number.",
      "Any question? Just reply to this email.", "",
      "Products for laboratory research use only. Not for human or veterinary use.",
      "Novalyx Research — novalyxresearch.com",
    ]).join("\n"),
  };

  try {
    await smtpSend({ host: SMTP_HOST || "smtp.hostinger.com", port: Number(SMTP_PORT) || 465, user: SMTP_USER, pass: SMTP_PASS }, [toOwner, toCustomer]);
  } catch (e) {
    return res.status(502).json({ error: "email non envoyé" });
  }
  return res.status(200).json({ ok: true, orderId, total: order.total, bank: BANK, payWithinHours: PAY_WITHIN_HOURS });
}
