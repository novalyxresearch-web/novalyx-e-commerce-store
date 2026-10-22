/* Mail de confirmation de commande envoyé au CLIENT (carte et Bitcoin).
   Helper partagé (préfixe _ : pas une route Vercel). HTML en tableaux + styles en ligne, pour tenir dans Gmail, Outlook et Apple Mail. */

const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const eur = (n, FR) => new Intl.NumberFormat(FR ? "fr-FR" : "en-GB", { style: "currency", currency: "EUR" }).format(n);

const T = {
  FR: {
    subject: (id) => `Commande confirmée ${id} · Novalyx Research`,
    tag: "COMMANDE CONFIRMÉE", title: "Merci, ta commande est bien reçue.",
    intro: "Ton paiement est confirmé. Ta commande est préparée à Paris et part sous 24 h. Tu recevras un second mail avec ton numéro de suivi dès l'expédition.",
    order: "NUMÉRO DE COMMANDE", paid: "PAYÉ PAR", card: "Carte bancaire", btc: "Bitcoin",
    code: (c) => `Code ${c} appliqué`, shipping: "Livraison", free: "Offerte", total: "Total",
    to: "LIVRAISON", lot: "VÉRIFIE TON LOT",
    lotTxt: "Le rapport d'analyse du laboratoire Janoshik de ton lot est publié sur notre site, avec le numéro de lot imprimé sur le flacon.",
    btn: "Voir les rapports d'analyse", help: "Une question ? Réponds simplement à ce mail.",
    foot: "Produits destinés exclusivement à la recherche en laboratoire. Ne pas utiliser sur l'humain ni l'animal.",
  },
  EN: {
    subject: (id) => `Order confirmed ${id} · Novalyx Research`,
    tag: "ORDER CONFIRMED", title: "Thank you, your order is in.",
    intro: "Your payment is confirmed. Your order is prepared in Paris and ships within 24 h. You will get a second email with your tracking number as soon as it ships.",
    order: "ORDER NUMBER", paid: "PAID WITH", card: "Credit card", btc: "Bitcoin",
    code: (c) => `Code ${c} applied`, shipping: "Shipping", free: "Free", total: "Total",
    to: "SHIPPING TO", lot: "CHECK YOUR BATCH",
    lotTxt: "The Janoshik laboratory analysis report for your batch is published on our site, with the batch number printed on the vial.",
    btn: "View the analysis reports", help: "A question? Just reply to this email.",
    foot: "Products intended exclusively for laboratory research. Not for human or animal use.",
  },
};

/* o : { orderId, name, email, lang, pay: "card"|"btc", rows: [{label, sub?, amount}], promo?, shipping, total, address: [lignes], site } */
export function buildCustomerMail(o, replyTo) {
  const FR = o.lang === "FR" || !o.lang;
  const t = FR ? T.FR : T.EN;
  const site = (o.site || "https://novalyxresearch.com").replace(/\/+$/, "");
  const payLabel = o.pay === "btc" ? t.btc : t.card;
  const rows = (o.rows || []).map((r) => ({ ...r, amountTxt: eur(r.amount, FR) }));
  const shipTxt = o.shipping > 0 ? eur(o.shipping, FR) : t.free;
  const addr = (o.address || []).filter(Boolean);

  const td = "padding:12px 0;border-bottom:1px solid #EFE3E7;font-size:14px;color:#2A0F1C;";
  const rowHtml = rows.map((r) => `<tr><td style="${td}"><b>${esc(r.label)}</b>${r.sub ? `<br><span style="font-size:12px;color:#7a6471">${esc(r.sub)}</span>` : ""}</td><td style="${td}text-align:right;white-space:nowrap">${esc(r.amountTxt)}</td></tr>`).join("")
    + (o.promo ? `<tr><td colspan="2" style="${td}color:#7F2F51">${esc(t.code(o.promo))}</td></tr>` : "")
    + `<tr><td style="${td}">${esc(t.shipping)}</td><td style="${td}text-align:right;white-space:nowrap">${esc(shipTxt)}</td></tr>`
    + `<tr><td style="padding:16px 0 0;font-size:17px;font-weight:700;color:#2A0F1C">${esc(t.total)}</td><td style="padding:16px 0 0;text-align:right;font-size:17px;font-weight:700;color:#7F2F51;white-space:nowrap">${esc(eur(o.total, FR))}</td></tr>`;

  const box = "background:#F9F0F3;border-radius:14px;padding:16px 18px;font-size:12px;line-height:1.6;color:#4a3340;vertical-align:top;";
  const lab = "display:block;font-size:11px;font-weight:600;letter-spacing:.1em;color:#7F2F51;margin-bottom:4px;";

  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F6EDEF;font-family:Poppins,'Helvetica Neue',Arial,sans-serif;color:#2A0F1C">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6EDEF"><tr><td align="center" style="padding:20px 10px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden">
<tr><td style="background:#2A0F1C;padding:28px 34px"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="padding-right:14px"><img src="${esc(site)}/icon-192.png" width="44" height="44" alt="" style="display:block;border-radius:10px"></td>
<td><div style="color:#ffffff;letter-spacing:.32em;font-size:18px;font-weight:600">NOVALYX</div><div style="color:#B2557D;letter-spacing:.3em;font-size:9px;font-weight:600;margin-top:3px">RESEARCH · PARIS</div></td></tr></table></td></tr>
<tr><td style="padding:34px">
<span style="display:inline-block;background:#F7E3EA;color:#7F2F51;font-size:11px;font-weight:600;letter-spacing:.14em;padding:6px 12px;border-radius:99px">${esc(t.tag)}</span>
<h1 style="font-size:26px;line-height:1.25;margin:16px 0 8px;font-weight:700;color:#2A0F1C">${esc(t.title)}</h1>
<p style="font-size:14px;line-height:1.6;margin:0 0 20px;color:#4a3340">${esc(t.intro)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F9F0F3;border-radius:14px;margin-bottom:22px"><tr>
<td style="padding:16px 20px"><div style="font-size:11px;color:#7a6471;letter-spacing:.08em">${esc(t.order)}</div><div style="font-size:18px;font-weight:700;color:#7F2F51">${esc(o.orderId)}</div></td>
<td style="padding:16px 20px;text-align:right"><div style="font-size:11px;color:#7a6471;letter-spacing:.08em">${esc(t.paid)}</div><div style="font-size:14px;font-weight:700;color:#2A0F1C">${esc(payLabel)}</div></td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rowHtml}</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:26px"><tr>
<td width="50%" style="${box}"><span style="${lab}">${esc(t.to)}</span>${addr.map(esc).join("<br>")}</td>
<td width="12" style="font-size:0">&nbsp;</td>
<td width="50%" style="${box}"><span style="${lab}">${esc(t.lot)}</span>${esc(t.lotTxt)}</td></tr></table>
<a href="${esc(site)}/analyses" style="display:block;background:#7F2F51;color:#ffffff;text-align:center;text-decoration:none;font-weight:600;font-size:14px;padding:15px;border-radius:12px;margin:26px 0 8px">${esc(t.btn)}</a>
<p style="font-size:12px;text-align:center;color:#7a6471;margin:0">${esc(t.help)}</p>
</td></tr>
<tr><td style="background:#2A0F1C;color:#c9aebb;font-size:11px;line-height:1.6;padding:22px 34px;text-align:center"><b style="color:#ffffff">Novalyx Research</b> · Paris, France<br>${esc(t.foot)}<br>contact@novalyxresearch.com</td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    t.tag, "", t.title, t.intro, "",
    `${t.order} : ${o.orderId}`, `${t.paid} : ${payLabel}`, "",
    ...rows.map((r) => `- ${r.label}${r.sub ? " (" + r.sub + ")" : ""} : ${r.amountTxt}`),
    o.promo ? t.code(o.promo) : null,
    `${t.shipping} : ${shipTxt}`, `${t.total} : ${eur(o.total, FR)}`, "",
    t.to + " :", ...addr, "",
    `${t.btn} : ${site}/analyses`, "", t.help, "", t.foot,
  ].filter((l) => l !== null).join("\n");

  return { to: o.email, replyTo, fromName: "Novalyx Research", subject: t.subject(o.orderId), text, html };
}
