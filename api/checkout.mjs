/* ═══════════════════════════════════════════════════════════════
   Novalyx Research — création d'une facture Bitcoin (BTCPay Server)
   Fonction serveur Vercel : /api/checkout

   Le navigateur envoie seulement { items: [{ id, size, qty }], zone, lang }.
   LE PRIX EST RECALCULÉ ICI, côté serveur : le client ne peut pas le modifier.

   Variables d'environnement à créer dans Vercel (Settings → Environment Variables) :
     BTCPAY_URL       https://pay.novalyxresearch.com
     BTCPAY_STORE_ID  identifiant de la boutique BTCPay
     BTCPAY_API_KEY   clé API BTCPay (permission : créer des factures uniquement)
     SITE_URL         https://novalyxresearch.com
   ⚠ Ne jamais écrire la clé API dans ce fichier : il est public sur GitHub.

   ⚠ Les prix ci-dessous doivent rester identiques à ceux du site (App.jsx).
═══════════════════════════════════════════════════════════════ */

const PRICES = {
 "bpc157": {
  "5mg": 54.99,
  "10mg": 94.99
 },
 "tb500": {
  "5mg": 59.99,
  "10mg": 99.99
 },
 "ghk": {
  "50mg": 52.99,
  "100mg": 89.99
 },
 "kpv": {
  "5mg": 54.99,
  "10mg": 94.99
 },
 "retatrutide": {
  "5mg": 59.99,
  "10mg": 89.99,
  "20mg": 149.99,
  "5mg · Pack de 2": 104.99,
  "5mg · Pack de 3": 149.99
 },
 "mazdutide": {
  "10mg": 84.99
 },
 "survodutide": {
  "10mg": 99.99
 },
 "cagrilintide": {
  "5mg": 69.99,
  "10mg": 119.99
 },
 "tesamorelin": {
  "5mg": 64.99,
  "10mg": 109.99
 },
 "ipamorelin": {
  "5mg": 54.99,
  "10mg": 94.99
 },
 "sermorelin": {
  "5mg": 58.99
 },
 "cjc1295": {
  "10mg": 69.99
 },
 "nad": {
  "500mg": 58.99,
  "1000mg": 99.99
 },
 "epitalon": {
  "10mg": 54.99,
  "50mg": 209.99
 },
 "pinealon": {
  "5mg": 54.99,
  "10mg": 94.99,
  "20mg": 159.99
 },
 "motsc": {
  "10mg": 57.99,
  "40mg": 179.99
 },
 "ss31": {
  "10mg": 65.99,
  "50mg": 249.99
 },
 "thymosinalpha1": {
  "5mg": 65.99,
  "10mg": 109.99
 },
 "thymalin": {
  "10mg": 57.99
 },
 "ll37": {
  "5mg": 64.99
 },
 "semax": {
  "5mg": 53.99,
  "11mg": 99.99
 },
 "selank": {
  "5mg": 54.99,
  "11mg": 99.99
 },
 "cerebrolysin": {
  "60mg": 79.99
 },
 "dsip": {
  "5mg": 53.99,
  "10mg": 89.99
 },
 "pt141": {
  "10mg": 56.99
 },
 "ara290": {
  "10mg": 58.99
 },
 "kisspeptin": {
  "5mg": 55.99,
  "10mg": 94.99
 },
 "slupp322": {
  "5mg": 52.99,
  "10mg": 89.99
 },
 "semaglutide": {
  "5mg": 51.99,
  "10mg": 89.99
 },
 "aod9604": {
  "5mg": 64.99,
  "10mg": 109.99
 },
 "ghrp2": {
  "5mg": 55.99,
  "10mg": 94.99
 },
 "ghrp6": {
  "5mg": 55.99,
  "10mg": 94.99
 },
 "amino1mq": {
  "5mg": 53.99
 },
 "hexarelin": {
  "5mg": 69.99
 },
 "formula01": {
  "10mg+10mg": 79.99
 },
 "formula02": {
  "5mg+5mg": 64.99
 },
 "formula03": {
  "70mg total": 79.99
 },
 "bac-water": {
  "3ml vial": 6.99,
  "3ml · Pack de 2": 12.99,
  "3ml · Pack de 3": 18.99
 },
 "formula04": {
  "80mg total": 84.99
 },
 "melanotanii": {
  "10mg": 54.99
 },
 "melanotani": {
  "10mg": 55.99
 },
 "snap8": {
  "10mg": 54.99
 },
 "vip": {
  "5mg": 60.99,
  "10mg": 104.99
 },
 "igf1lr3": {
  "1mg": 79.99
 },
 "igfdes": {
  "2mg": 56.99
 },
 "novalyxformula06": {
  "10mg total (BPC5+TB5)": 64.99,
  "20mg total (BPC10+TB10)": 109.99
 },
 "novalyxformula07cagrisema": {
  "2.5mg+2.5mg": 64.99,
  "5mg+5mg": 109.99
 },
 "novalyxformula08semaxselank": {
  "10mg+10mg": 69.99
 },
 "novalyxformula09glp3rtcagri": {
  "5mg+5mg": 74.99
 },
 "dihexa": {
  "10mg": 64.99
 },
 "pe2228": {
  "10mg": 60.99
 },
 "adamax": {
  "5mg": 74.99
 },
 "nasemaxamidate": {
  "30mg": 79.99
 },
 "naselankamidate": {
  "30mg": 79.99
 },
 "cardiogen": {
  "20mg": 69.99
 },
 "cortagen": {
  "20mg": 69.99
 },
 "pancragen": {
  "20mg": 69.99
 },
 "cartalax": {
  "20mg": 69.99
 },
 "chonluten": {
  "20mg": 69.99
 },
 "ovagen": {
  "20mg": 69.99
 },
 "vesugen": {
  "20mg": 69.99
 },
 "testagen": {
  "20mg": 74.99
 },
 "prostamax": {
  "20mg": 69.99
 },
 "foxo4dri": {
  "10mg": 104.99
 },
 "humanin": {
  "10mg": 99.99
 },
 "aicar": {
  "50mg": 57.99
 },
 "cjc1295dac": {
  "5mg": 74.99
 },
 "pegmgf": {
  "2mg": 64.99
 },
 "hghfrag176191": {
  "5mg": 74.99
 },
 "ace031": {
  "1mg": 56.99
 },
 "eloralintide": {
  "5mg": 99.99
 },
 "adipotide": {
  "2mg": 65.99
 },
 "ahkcu": {
  "50mg": 54.99
 },
 "matrixyl": {
  "10mg": 54.99
 },
 "aceticwater": {
  "3ml": 6.99
 }
};

// Produits en stock (pas de minimum). Les autres sont « sur commande » avec un minimum par format.
const IN_STOCK = ["retatrutide", "bac-water"];
const STOCK_SIZES = { retatrutide: ["5mg", "5mg · Pack de 2", "5mg · Pack de 3"] };
const inStock = (id, size) => IN_STOCK.includes(id) && (!STOCK_SIZES[id] || STOCK_SIZES[id].includes(size));
const MIN_QTY = {"bpc157_5mg": 2, "bpc157_10mg": 2, "tb500_5mg": 3, "tb500_10mg": 3, "ghk_50mg": 2, "ghk_100mg": 2, "kpv_5mg": 2, "kpv_10mg": 2, "retatrutide_10mg": 2, "retatrutide_20mg": 2, "mazdutide_10mg": 4, "survodutide_10mg": 4, "cagrilintide_5mg": 4, "cagrilintide_10mg": 3, "tesamorelin_5mg": 4, "tesamorelin_10mg": 4, "ipamorelin_5mg": 2, "ipamorelin_10mg": 2, "sermorelin_5mg": 3, "cjc1295_10mg": 4, "nad_500mg": 3, "nad_1000mg": 3, "epitalon_10mg": 2, "epitalon_50mg": 2, "pinealon_5mg": 2, "pinealon_10mg": 2, "pinealon_20mg": 2, "motsc_10mg": 3, "motsc_40mg": 3, "ss31_10mg": 3, "ss31_50mg": 3, "thymosinalpha1_5mg": 3, "thymosinalpha1_10mg": 3, "thymalin_10mg": 3, "ll37_5mg": 3, "semax_5mg": 2, "semax_11mg": 2, "selank_5mg": 2, "selank_11mg": 2, "cerebrolysin_60mg": 2, "dsip_5mg": 2, "dsip_10mg": 2, "pt141_10mg": 3, "ara290_10mg": 3, "kisspeptin_5mg": 3, "kisspeptin_10mg": 2, "slupp322_5mg": 2, "slupp322_10mg": 2, "semaglutide_5mg": 2, "semaglutide_10mg": 2, "aod9604_5mg": 4, "aod9604_10mg": 4, "ghrp2_5mg": 2, "ghrp2_10mg": 2, "ghrp6_5mg": 2, "ghrp6_10mg": 2, "amino1mq_5mg": 2, "hexarelin_5mg": 4, "formula01_10mg+10mg": 4, "formula02_5mg+5mg": 4, "formula03_70mg total": 4, "formula04_80mg total": 4, "melanotanii_10mg": 2, "melanotani_10mg": 3, "snap8_10mg": 2, "vip_5mg": 3, "vip_10mg": 3, "igf1lr3_1mg": 4, "igfdes_2mg": 3, "novalyxformula06_10mg total (BPC5+TB5)": 4, "novalyxformula06_20mg total (BPC10+TB10)": 4, "novalyxformula07cagrisema_2.5mg+2.5mg": 3, "novalyxformula07cagrisema_5mg+5mg": 4, "novalyxformula08semaxselank_10mg+10mg": 4, "novalyxformula09glp3rtcagri_5mg+5mg": 4, "dihexa_10mg": 4, "pe2228_10mg": 3, "adamax_5mg": 4, "nasemaxamidate_30mg": 4, "naselankamidate_30mg": 4, "cardiogen_20mg": 4, "cortagen_20mg": 4, "pancragen_20mg": 4, "cartalax_20mg": 4, "chonluten_20mg": 4, "ovagen_20mg": 4, "vesugen_20mg": 4, "testagen_20mg": 4, "prostamax_20mg": 4, "foxo4dri_10mg": 4, "humanin_10mg": 4, "aicar_50mg": 3, "cjc1295dac_5mg": 4, "pegmgf_2mg": 4, "hghfrag176191_5mg": 4, "ace031_1mg": 3, "eloralintide_5mg": 4, "adipotide_2mg": 3, "ahkcu_50mg": 2, "matrixyl_10mg": 2, "aceticwater_3ml": 4};

const ZONE_RATE = { FR: 6.9, EU: 9.9, CHUK: 14.9, USCA: 24.9, WORLD: 29.9 };
const FREE_SHIP_MIN = 100;          // livraison offerte dès 100 € (France et UE)
const MAX_LINES = 30;
const MAX_QTY = 20;

const isPack = (size) => /pack/i.test(String(size));
const TIER_TOTALS = { "retatrutide|5mg": { 2: 104.99, 3: 149.99 }, "bac-water|3ml vial": { 2: 12.99, 3: 18.99 } };
const baseDisc = (q) => q >= 5 ? 0.2 : q >= 3 ? 0.15 : q >= 2 ? 0.1 : 0;
const lineTotalFor = (id, size, unit, q) => {
  if (isPack(size)) return round2(unit * q);
  const t = TIER_TOTALS[id + "|" + size];
  if (t && t[q]) return t[q];
  let d = baseDisc(q);
  if (t && q >= 4) d = Math.max(d, ...Object.keys(t).map((k) => 1 - t[k] / (unit * Number(k))));
  return round2(unit * q * (1 - d));
};
const round2 = (n) => Math.round(n * 100) / 100;

export function computeOrder(items, zone) {
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_LINES) throw new Error("panier invalide");
  if (!Object.prototype.hasOwnProperty.call(ZONE_RATE, zone)) throw new Error("zone invalide");
  const lines = items.map((it) => {
    const id = String(it && it.id || ""), size = String(it && it.size || "");
    const qty = Number(it && it.qty);
    const unit = PRICES[id] && PRICES[id][size];
    if (typeof unit !== "number") throw new Error("produit inconnu : " + id + " " + size);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) throw new Error("quantité invalide");
    const min = (inStock(id, size) || isPack(size)) ? 1 : (MIN_QTY[id + "_" + size] || 2);
    if (qty < min) throw new Error("minimum " + min + " flacons pour " + id + " " + size);
    const total = lineTotalFor(id, size, unit, qty);
    return { id, size, qty, unit, discount: round2(1 - total / (unit * qty)), total };
  });
  const subtotal = round2(lines.reduce((s, l) => s + l.total, 0));
  const eu = zone === "FR" || zone === "EU";
  let shipping = ZONE_RATE[zone];
  if (eu && subtotal >= FREE_SHIP_MIN) shipping = 0;
  else if (eu && lines.some((l) => isPack(l.size))) shipping = 0;
  else if (lines.every((l) => l.id === "bac-water")) shipping = eu ? 3.99 : ZONE_RATE[zone];
  return { lines, subtotal, shipping, total: round2(subtotal + shipping) };
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "méthode non autorisée" }); }
  const { BTCPAY_URL, BTCPAY_STORE_ID, BTCPAY_API_KEY, SITE_URL } = process.env;
  if (!BTCPAY_URL || !BTCPAY_STORE_ID || !BTCPAY_API_KEY) return res.status(503).json({ error: "paiement non configuré" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const lang = body && body.lang === "EN" ? "EN" : "FR";

  let order;
  try { order = computeOrder(body && body.items, body && body.zone); }
  catch (e) { return res.status(400).json({ error: e.message }); }

  const orderId = "NVX-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const site = (SITE_URL || "https://novalyxresearch.com").replace(/\/+$/, "");
  const desc = order.lines.map((l) => l.id + " " + l.size + " x" + l.qty).join(", ");

  try {
    const r = await fetch(BTCPAY_URL.replace(/\/+$/, "") + "/api/v1/stores/" + encodeURIComponent(BTCPAY_STORE_ID) + "/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "token " + BTCPAY_API_KEY },
      body: JSON.stringify({
        amount: order.total.toFixed(2),
        currency: "EUR",
        metadata: {
          orderId,
          itemDesc: "Novalyx Research — " + orderId,
          zone: body.zone,
          lines: order.lines,
          subtotal: order.subtotal,
          shipping: order.shipping,
          summary: desc.slice(0, 500),
        },
        checkout: {
          expirationMinutes: 60,
          paymentTolerance: 2,
          redirectURL: site + "/?paid=" + orderId,
          redirectAutomatically: true,
          defaultLanguage: lang === "FR" ? "fr-FR" : "en",
        },
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.checkoutLink) return res.status(502).json({ error: "facture non créée" });
    return res.status(200).json({ url: data.checkoutLink, orderId, total: order.total });
  } catch (e) {
    return res.status(502).json({ error: "serveur de paiement injoignable" });
  }
}
