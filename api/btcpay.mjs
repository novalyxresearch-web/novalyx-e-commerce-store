/* ═══════════════════════════════════════════════════════════
   Novalyx Research — confirmation des commandes payées en Bitcoin
   Fonction serveur Vercel : /api/btcpay

   BTCPay appelle cette adresse (webhook « InvoiceSettled ») quand une facture est entièrement payée et confirmée.
   Sécurité : la signature HMAC (en-tête BTCPay-Sig) est vérifiée avec BTCPAY_WEBHOOK_SECRET ; sans elle, rien n'est envoyé.
   Envoie : (1) à toi, la commande à expédier avec l'adresse ; (2) au client, sa confirmation.

   Variables d'environnement : BTCPAY_WEBHOOK_SECRET (nouveau), SMTP_USER, SMTP_PASS (déjà là), SITE_URL (déjà là).
═══════════════════════════════════════════════════════════ */
import crypto from "node:crypto";
import { smtpSend } from "./_smtp.mjs";
import { buildCustomerMail } from "./_mail.mjs";

export const config = { api: { bodyParser: false } };   // la signature se calcule sur le corps brut

const eur = (n) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
const readRaw = (req) => new Promise((resolve, reject) => { const c = []; req.on("data", (d) => c.push(d)); req.on("end", () => resolve(Buffer.concat(c))); req.on("error", reject); });

export function validSig(raw, header, secret) {
  if (!header || !secret) return false;
  const want = "sha256=" + crypto.createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(String(header)), b = Buffer.from(want);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function buildFromInvoice(ev, ownerTo, replyTo, site) {
  const m = ev.metadata || {};
  if (!m.orderId || !m.buyerEmail) return null;
  const lines = Array.isArray(m.lines) ? m.lines : [];
  const rows = lines.map((l) => ({ label: (l.label || l.id) + (l.label && /×|x\d/.test(l.label) ? "" : " " + l.size + " × " + l.qty), amount: Number(l.total) || 0 }));
  const total = (Number(m.subtotal) || 0) + (Number(m.shipping) || 0);
  const addr = [m.buyerName, m.buyerAddress1, [m.buyerZip, m.buyerCity].filter(Boolean).join(" "), m.buyerCountry];
  const customer = buildCustomerMail({ orderId: m.orderId, name: m.buyerName, email: m.buyerEmail, lang: m.lang === "FR" ? "FR" : m.lang ? "EN" : "FR", pay: "btc", rows, promo: m.promo || "", shipping: Number(m.shipping) || 0, total, address: addr, site }, replyTo);
  const owner = {
    to: ownerTo, replyTo: m.buyerEmail, fromName: "Novalyx Research — commandes",
    subject: `Nouvelle commande Bitcoin ${m.orderId} — ${eur(total)}`,
    text: [
      `Nouvelle commande PAYÉE en Bitcoin : ${m.orderId}`, "",
      "Articles : " + (m.summary || "(voir BTCPay)"),
      m.promo ? "Code promo : " + m.promo : null,
      `Zone de livraison : ${m.zone || "?"}`, `TOTAL : ${eur(total)}`, "",
      "À expédier à :", ...addr.filter(Boolean), m.buyerPhone ? "Tél. " + m.buyerPhone : null, `Email : ${m.buyerEmail}`, "",
      "À faire : préparer le colis, expédier, puis envoyer le numéro de suivi au client (répondre à cet e-mail écrit directement au client).",
    ].filter((l) => l !== null).join("\n"),
  };
  return [owner, customer];
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "méthode non autorisée" }); }
  const { BTCPAY_WEBHOOK_SECRET, SMTP_USER, SMTP_PASS, ORDER_EMAIL, SMTP_HOST, SMTP_PORT, SITE_URL } = process.env;
  if (!BTCPAY_WEBHOOK_SECRET || !SMTP_USER || !SMTP_PASS) return res.status(503).json({ error: "non configuré" });
  let raw;
  try { raw = await readRaw(req); } catch (e) { return res.status(400).json({ error: "corps illisible" }); }
  if (!validSig(raw, req.headers["btcpay-sig"], BTCPAY_WEBHOOK_SECRET)) return res.status(401).json({ error: "signature invalide" });
  let ev; try { ev = JSON.parse(raw.toString("utf8")); } catch (e) { return res.status(400).json({ error: "json invalide" }); }
  if (ev.type !== "InvoiceSettled") return res.status(200).json({ ignored: true });
  const site = (SITE_URL || "https://novalyxresearch.com").trim().replace(/[\/.\s]+$/, "");
  const mails = buildFromInvoice(ev, ORDER_EMAIL || SMTP_USER, SMTP_USER, site);
  if (!mails) return res.status(422).json({ error: "métadonnées de commande absentes" });
  try { await smtpSend({ host: SMTP_HOST || "smtp.hostinger.com", port: Number(SMTP_PORT) || 465, user: SMTP_USER, pass: SMTP_PASS }, mails); }
  catch (e) { return res.status(502).json({ error: "email non envoyé" }); }   // BTCPay réessaiera
  return res.status(200).json({ ok: true });
}
