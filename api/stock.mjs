/* ═══════════════════════════════════════════════════════════
   Novalyx Research — stock en temps réel du lot analysé
   Fonction serveur Vercel : /api/stock   →   { left: { retatrutide: 17 }, ... }

   Stock affiché = stock de départ − flacons PAYÉS depuis la date de départ :
     • carte bancaire : sessions Stripe Checkout terminées et payées (métadonnée « items ») ;
     • Bitcoin : factures BTCPay « Settled » ou « Processing » (métadonnée « lines »).
   Les virements bancaires ne sont pas payés au moment de la commande :
   ils se retirent à la main avec MANUAL_SOLD ci-dessous.

   Pour un NOUVEAU lot : changer START_STOCK et START_DATE (et remettre MANUAL_SOLD à 0).

   Variables d'environnement utilisées (déjà présentes) : STRIPE_SECRET_KEY, BTCPAY_URL, BTCPAY_STORE_ID, BTCPAY_API_KEY.
   Facultatif : BTCPAY_READ_KEY, une clé BTCPay avec la permission « voir les factures »,
   si la clé principale ne peut que créer des factures.
═══════════════════════════════════════════════════════════ */

export const START_STOCK = { retatrutide: 17 };
export const START_DATE = "2026-10-13T19:30:00Z";            // ventes comptées à partir de ce moment
export const MANUAL_SOLD = { retatrutide: 0 };               // virements payés, ventes hors site…
// Formats qui puisent dans le stock, et combien de flacons chacun retire.
const UNITS = { retatrutide: { "5mg": 1, "5mg · Pack de 2": 2, "5mg · Pack de 3": 3 } };

// Le Kit GLP-3RT retire aussi des flacons de GLP-3RT du stock (garder identique à KIT_UNITS dans src/App.jsx).
const KIT_UNITS = { "kit-glp3rt": { "Kit · 1 + 1": 1, "Kit · 2 + 2": 2 } };
const addSold = (sold, l) => {
  if (UNITS[l.id]) sold[l.id] = (sold[l.id] || 0) + unitsOf(l.id, l.size, l.qty);
  if (KIT_UNITS[l.id]) sold.retatrutide = (sold.retatrutide || 0) + (KIT_UNITS[l.id][l.size] || 0) * (Number(l.qty) || 0);
};

const startUnix = () => Math.floor(Date.parse(START_DATE) / 1000);
const unitsOf = (id, size, qty) => (UNITS[id] && UNITS[id][size] ? UNITS[id][size] * (Number(qty) || 0) : 0);

/* Format compact écrit par /api/card : "retatrutide|5mg|2;bac-water|3ml vial|2" */
export const encodeItems = (lines) => lines.map((l) => [l.id, l.size, l.qty].join("|")).join(";").slice(0, 490);
const decodeItems = (s) => String(s || "").split(";").filter(Boolean).map((x) => { const [id, size, qty] = x.split("|"); return { id, size, qty: Number(qty) }; });

async function soldStripe(key, sold) {
  let after = null, pages = 0;
  do {
    const q = new URLSearchParams({ limit: "100", status: "complete", "created[gte]": String(startUnix()) });
    if (after) q.set("starting_after", after);
    const r = await fetch("https://api.stripe.com/v1/checkout/sessions?" + q, { headers: { Authorization: "Bearer " + key } });
    if (!r.ok) throw new Error("stripe " + r.status);
    const d = await r.json();
    for (const s of d.data || []) {
      if (s.payment_status !== "paid") continue;
      for (const l of decodeItems(s.metadata && s.metadata.items)) addSold(sold, l);
    }
    after = d.has_more && d.data.length ? d.data[d.data.length - 1].id : null;
  } while (after && ++pages < 20);
}

async function soldBtc(env, sold) {
  const key = env.BTCPAY_READ_KEY || env.BTCPAY_API_KEY;
  if (!env.BTCPAY_URL || !env.BTCPAY_STORE_ID || !key) return;
  const base = env.BTCPAY_URL.replace(/\/+$/, "") + "/api/v1/stores/" + encodeURIComponent(env.BTCPAY_STORE_ID) + "/invoices";
  const q = "?status=Settled&status=Processing&take=500&startDate=" + startUnix();
  const r = await fetch(base + q, { headers: { Authorization: "token " + key } });
  if (!r.ok) throw new Error("btcpay " + r.status);
  const list = await r.json();
  for (const inv of Array.isArray(list) ? list : []) {
    const lines = inv.metadata && Array.isArray(inv.metadata.lines) ? inv.metadata.lines : [];
    for (const l of lines) if (l) addSold(sold, l);
  }
}

/* Stock restant, par produit. `ok` = false si une source n'a pas pu être lue (on affiche quand même). */
export async function getStock(env = process.env) {
  const sold = {}, errors = [];
  if (env.STRIPE_SECRET_KEY) { try { await soldStripe(env.STRIPE_SECRET_KEY, sold); } catch (e) { errors.push(String(e.message)); } }
  try { await soldBtc(env, sold); } catch (e) { errors.push(String(e.message)); }
  const left = {};
  for (const id of Object.keys(START_STOCK)) left[id] = Math.max(0, START_STOCK[id] - (sold[id] || 0) - (MANUAL_SOLD[id] || 0));
  return { left, sold, ok: errors.length === 0, errors };
}

/* Vérifie qu'un panier ne dépasse pas le stock. Renvoie un message d'erreur, ou null si c'est bon. */
export async function checkStock(lines, lang = "FR") {
  const need = {};
  for (const l of lines) {
    if (UNITS[l.id] && UNITS[l.id][l.size]) need[l.id] = (need[l.id] || 0) + unitsOf(l.id, l.size, l.qty);
    if (KIT_UNITS[l.id] && KIT_UNITS[l.id][l.size]) need.retatrutide = (need.retatrutide || 0) + KIT_UNITS[l.id][l.size] * (Number(l.qty) || 0);
  }
  if (!Object.keys(need).length) return null;
  const { left } = await getStock();
  for (const id of Object.keys(need)) {
    // Stock à 0 : le produit est passé « sur commande » sur le site, la commande est acceptée normalement.
    if (left[id] > 0 && need[id] > left[id]) {
      return lang === "FR"
        ? `Il ne reste que ${left[id]} flacon${left[id] > 1 ? "s" : ""} en stock. Réduisez la quantité.`
        : `Only ${left[id]} vial${left[id] > 1 ? "s" : ""} left in stock. Please reduce the quantity.`;
    }
  }
  return null;
}

export default async function handler(req, res) {
  const { left, ok } = await getStock();
  res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
  return res.status(200).json({ left, ok });
}
