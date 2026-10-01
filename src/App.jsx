import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════
   🔧 CONFIG — swap these when you have your details
═══════════════════════════════════════════════════════════ */
// ============================================================
//  MAPPING CENTRALISÉ DES LIENS DE PAIEMENT STRIPE
//  Pour modifier un lien : change juste l'URL ici, rien d'autre.
//  Clé = "idproduit_dosage". Vide "" = bouton "contactez-nous".
//  Le SITE affiche les vrais noms ; Stripe peut afficher des codes.
// ============================================================
const STRIPE_LINKS = {
  // BPC-157
  "bpc157_5mg": "https://buy.stripe.com/3cI28r8O73gS6LA8442Ry01",
  "bpc157_10mg": "https://buy.stripe.com/00w00jc0j2cO4Ds5VW2Ry02",
  // TB-500
  "tb500_5mg": "https://buy.stripe.com/dRm5kD1lF4kW0ncfww2Ry09",
  "tb500_10mg": "https://buy.stripe.com/aFa5kDe8r6t44Ds5VW2Ry0a",
  // GHK-Copper
  "ghk_50mg": "https://buy.stripe.com/5kQ7sL8O72cO6LAbgg2Ry0g",
  "ghk_100mg": "https://buy.stripe.com/00w4gz4xReZAgma8442Ry0h",
  // KPV
  "kpv_5mg": "https://buy.stripe.com/6oUeVd5BVdVw9XM5VW2Ry12",
  "kpv_10mg": "https://buy.stripe.com/bJedR9c0j9Fg9XMdoo2Ry13",
  // GLP-3RT (Retatrutide) — packs
  "retatrutide_5mg": "https://buy.stripe.com/3cIfZhfcv5p03zo1FG2Ry19",
  "retatrutide_5mg · Pack de 2": "https://buy.stripe.com/cNi14naWf18Kgmadoo2Ry1a",
  "retatrutide_5mg · Pack de 3": "https://buy.stripe.com/00wbJ1d4n5p0fi6gAA2Ry1b",
  // Mazdutide
  "mazdutide_10mg": "https://buy.stripe.com/cNi5kD5BV04Gb1Q8442Ry14",
  // Survodutide
  "survodutide_10mg": "https://buy.stripe.com/8x2aEX4xRbNo6LA3NO2Ry15",
  // Cagrilintide
  "cagrilintide_5mg": "https://buy.stripe.com/4gM28r4xR2cOfi6ess2Ry0c",
  "cagrilintide_10mg": "https://buy.stripe.com/28E28r5BV9Fg5HwgAA2Ry0d",
  // Tesamorelin
  "tesamorelin_5mg": "https://buy.stripe.com/fZu5kD1lF18K7PE1FG2Ry0e",
  "tesamorelin_10mg": "https://buy.stripe.com/6oU4gzc0jg3E4Dsdoo2Ry0f",
  // Ipamorelin
  "ipamorelin_5mg": "https://buy.stripe.com/28E6oH2pJaJk5Hwess2Ry0i",
  "ipamorelin_10mg": "https://buy.stripe.com/6oU9ATd4n18K2vkbgg2Ry0j",
  // Sermorelin
  "sermorelin_5mg": "https://buy.stripe.com/4gM8wP4xR6t49XMbgg2Ry0l",
  // CJC-1295 (no DAC)
  "cjc1295_10mg": "https://buy.stripe.com/4gMfZh6FZbNo5Hwbgg2Ry0k",
  // NAD+
  "nad_500mg": "https://buy.stripe.com/28E00j0hB5p0d9Yess2Ry0m",
  "nad_1000mg": "https://buy.stripe.com/cNi28re8r2cO2vkgAA2Ry0n",
  // Epitalon
  "epitalon_10mg": "https://buy.stripe.com/4gM6oH5BVaJk2vkckk2Ry0o",
  "epitalon_50mg": "https://buy.stripe.com/aFa5kD1lF7x8b1Q3NO2Ry0p",
  // Pinealon
  "pinealon_5mg": "https://buy.stripe.com/eVq9AT5BV18K1rg4RS2Ry0q",
  "pinealon_10mg": "https://buy.stripe.com/14A4gze8r6t41rgckk2Ry0r",
  "pinealon_20mg": "https://buy.stripe.com/aFaaEX1lF18Kb1Q4RS2Ry0s",
  // MOTS-c
  "motsc_10mg": "https://buy.stripe.com/28E8wP7K3g3E4Ds9882Ry0t",
  "motsc_40mg": "https://buy.stripe.com/6oUcN50hB3gS1rgckk2Ry0u",
  // SS-31
  "ss31_10mg": "https://buy.stripe.com/4gMeVde8r3gS6LAgAA2Ry0v",
  "ss31_50mg": "https://buy.stripe.com/6oU3cv2pJdVwee20BC2Ry0w",
  // Thymosin Alpha-1
  "thymosinalpha1_5mg": "https://buy.stripe.com/6oU6oH8O79Fg8TIbgg2Ry0x",
  "thymosinalpha1_10mg": "https://buy.stripe.com/eVq28r8O79Fgee23NO2Ry0y",
  // Thymalin
  "thymalin_10mg": "https://buy.stripe.com/5kQ4gzggz18K3zobgg2Ry0z",
  // LL-37
  "ll37_5mg": "https://buy.stripe.com/4gMaEXaWf2cOd9Yckk2Ry0A",
  // Semax
  "semax_5mg": "https://buy.stripe.com/cNifZhggz18K9XMgAA2Ry0B",
  "semax_11mg": "https://buy.stripe.com/6oU6oHfcv7x8ee29882Ry0C",
  // Selank
  "selank_5mg": "https://buy.stripe.com/9B6aEX4xRaJkgma3NO2Ry0D",
  "selank_11mg": "https://buy.stripe.com/14AcN5aWf18K1rg8442Ry0E",
  // Cerebrolysin
  "cerebrolysin_60mg": "https://buy.stripe.com/14A5kD8O704G4Ds1FG2Ry0F",
  // DSIP
  "dsip_5mg": "https://buy.stripe.com/28E3cvaWf3gSd9Y4RS2Ry0G",
  "dsip_10mg": "https://buy.stripe.com/cNifZhe8r04G7PE1FG2Ry0H",
  // PT-141
  "pt141_10mg": "https://buy.stripe.com/9B6dR9ggz04G8TI1FG2Ry0I",
  // Ara-290
  "ara290_10mg": "https://buy.stripe.com/9B6dR95BV8Bcb1Qacc2Ry0J",
  // Kisspeptin-10
  "kisspeptin_5mg": "https://buy.stripe.com/eVq3cv6FZeZA8TIgAA2Ry0K",
  "kisspeptin_10mg": "https://buy.stripe.com/7sYfZhe8raJk1rgbgg2Ry0L",
  // Tirzepatide
  "slupp322_5mg": "https://buy.stripe.com/6oUaEX0hB4kW6LA7002Ry05",
  "slupp322_10mg": "https://buy.stripe.com/00w3cv7K3bNo7PE7002Ry06",
  // Semaglutide
  "semaglutide_5mg": "https://buy.stripe.com/8x2fZh0hB18K0nc5VW2Ry07",
  "semaglutide_10mg": "https://buy.stripe.com/8x2cN5e8r18Kd9Y3NO2Ry08",
  // AOD-9604
  "aod9604_5mg": "https://buy.stripe.com/00w6oH8O77x82vkacc2Ry0M",
  "aod9604_10mg": "https://buy.stripe.com/cNifZh6FZ4kWb1Q0BC2Ry0N",
  // GHRP-2
  "ghrp2_5mg": "https://buy.stripe.com/fZucN53tN9Fg2vk4RS2Ry0O",
  "ghrp2_10mg": "https://buy.stripe.com/28E14nc0j3gSc5Ubgg2Ry0P",
  // GHRP-6
  "ghrp6_5mg": "https://buy.stripe.com/00w8wP1lF8Bcee23NO2Ry0Q",
  "ghrp6_10mg": "https://buy.stripe.com/fZu6oH9Sb2cO6LAacc2Ry0R",
  // 5-Amino-1MQ
  "amino1mq_5mg": "https://buy.stripe.com/aFa00j7K32cOgma0BC2Ry0S",
  // Hexarelin
  "hexarelin_2mg": "https://buy.stripe.com/4gMbJ13tN18K9XM4RS2Ry0T",
  "hexarelin_5mg": "https://buy.stripe.com/28E00jggzbNo8TIbgg2Ry0U",
  // Novalyx Formula 01
  "formula01_10mg+10mg": "https://buy.stripe.com/aFa4gzfcv5p0b1Q3NO2Ry0V",
  // Novalyx Formula 02
  "formula02_5mg+5mg": "https://buy.stripe.com/dRm00jd4n4kW9XM7002Ry0W",
  // Novalyx Formula 03
  "formula03_70mg total": "https://buy.stripe.com/28EaEXggz5p0ee2gAA2Ry0X",
  // Bacteriostatic Water — packs
  "bac-water_3ml vial": "https://buy.stripe.com/dRm14nfcvdVw8TIckk2Ry16",
  "bac-water_3ml · Pack de 2": "https://buy.stripe.com/3cI9ATc0j2cO8TI7002Ry17",
  "bac-water_3ml · Pack de 3": "https://buy.stripe.com/28E7sL0hBcRs4Ds2JK2Ry18",
  // Novalyx Formula 04
  "formula04_80mg total": "https://buy.stripe.com/eVq3cv7K3aJk7PEckk2Ry0Y",
};
const getStripeLink = (id, size) => STRIPE_LINKS[`${id}_${size}`] || "";

/* ─── LIVRAISON PAR ZONE ─────────────────────────────────────
   Un lien de paiement Stripe PAR zone (pays autorisés + frais de livraison propres).
   Le panier envoie le client vers le lien de sa zone. Zones :
   FR France · EU Union européenne (hors France) · CHUK Suisse/Royaume-Uni/Liechtenstein
   USCA États-Unis/Canada · WORLD Australie, Nouvelle-Zélande et autres pays (Russie/Biélorussie exclues). */
const SHIP_ZONES = [
  ["FR", "France", "France"],
  ["EU", "Union européenne (hors France)", "European Union (excl. France)"],
  ["CHUK", "Suisse, Royaume-Uni", "Switzerland, United Kingdom"],
  ["USCA", "États-Unis, Canada", "United States, Canada"],
  ["WORLD", "Australie, Nouvelle-Zélande, autres pays", "Australia, New Zealand, other countries"],
];
const ZONE_RATE = { FR: 6.9, EU: 9.9, CHUK: 14.9, USCA: 24.9, WORLD: 29.9 };
const ZONE_LINKS = {
  "retatrutide_5mg": {
    FR: "https://buy.stripe.com/3cIcN55BV9Fgb1QgAA2Ry1c",
    EU: "https://buy.stripe.com/4gM8wP0hBcRsfi65VW2Ry1d",
    CHUK: "https://buy.stripe.com/5kQeVd6FZ9Fg3zo1FG2Ry1e",
    USCA: "https://buy.stripe.com/6oU00jd4neZA9XM7002Ry1f",
    WORLD: "https://buy.stripe.com/6oUdR9c0j3gS0ncckk2Ry1g",
  },
  "retatrutide_5mg · Pack de 2": {
    FR: "https://buy.stripe.com/9B68wPe8reZAd9Y9882Ry1h",
    EU: "https://buy.stripe.com/00w6oHaWf8Bc5Hw5VW2Ry1i",
    CHUK: "https://buy.stripe.com/4gM14nc0j18K2vkckk2Ry1j",
    USCA: "https://buy.stripe.com/7sYdR97K37x88TI4RS2Ry1k",
    WORLD: "https://buy.stripe.com/4gM14n4xR8Bc2vk3NO2Ry1l",
  },
  "retatrutide_5mg · Pack de 3": {
    FR: "https://buy.stripe.com/8x214nc0j9Fgd9Yfww2Ry1m",
    EU: "https://buy.stripe.com/4gMcN5c0j4kWgma4RS2Ry1n",
    CHUK: "https://buy.stripe.com/eVqfZh1lF18Kfi69882Ry1o",
    USCA: "https://buy.stripe.com/00wfZh8O718K7PEfww2Ry1p",
    WORLD: "https://buy.stripe.com/4gM28r4xR7x8fi60BC2Ry1q",
  },
  "bac-water_3ml vial": {
    FR: "https://buy.stripe.com/00wdR97K36t40ncess2Ry1r",
    EU: "https://buy.stripe.com/5kQbJ19Sbg3E4Ds4RS2Ry1s",
    CHUK: "https://buy.stripe.com/bJe3cv0hB04G2vk0BC2Ry1t",
    USCA: "https://buy.stripe.com/6oU8wP2pJ18Kee28442Ry1u",
    WORLD: "https://buy.stripe.com/7sYdR9c0j2cO2vkbgg2Ry1v",
  },
  "bac-water_3ml · Pack de 2": {
    FR: "https://buy.stripe.com/fZu3cv2pJ6t47PEbgg2Ry1w",
    EU: "https://buy.stripe.com/aFa6oHe8reZA1rg7002Ry1x",
    CHUK: "https://buy.stripe.com/5kQdR9fcv4kW1rg4RS2Ry1y",
    USCA: "https://buy.stripe.com/28E00jc0j5p0gmackk2Ry1z",
    WORLD: "https://buy.stripe.com/aFa4gz0hBdVw3zo0BC2Ry1A",
  },
  "bac-water_3ml · Pack de 3": {
    FR: "https://buy.stripe.com/bJe28r3tNaJkb1Qckk2Ry1B",
    EU: "https://buy.stripe.com/aFaaEXe8r4kWd9Y9882Ry1C",
    CHUK: "https://buy.stripe.com/7sYaEX0hB4kW1rg5VW2Ry1D",
    USCA: "https://buy.stripe.com/fZu9ATe8raJk1rg1FG2Ry1E",
    WORLD: "https://buy.stripe.com/5kQ5kDaWfeZA2vk4RS2Ry1F",
  },
};
const linkFor = (item, zone) => ((ZONE_LINKS[item.id + "_" + item.size] || {})[zone]) || item.stripeLink || "";
// Frais de livraison (indicatifs, identiques à ceux de Stripe) : packs offerts en France/UE, eau 3,99 € en France/UE
const shipCost = (item, zone) => {
  const eu = zone === "FR" || zone === "EU";
  if (item.id === "bac-water") return eu ? 3.99 : ZONE_RATE[zone];
  if (String(item.size).indexOf("Pack") >= 0) return eu ? 0 : ZONE_RATE[zone];
  return ZONE_RATE[zone];
};



const CONFIG = {
  STRIPE_PUBLISHABLE_KEY: "pk_live_51TexuAEynlu0HG7FDZS29RRn4GgrhdpGZ9ucl83bNQm1gAi3uHi5JGAPfGkJzHvhoeWB42NXO0cQcwUt6vT8QGqi00W6VFqyXX",
  BUSINESS_NAME:          "Novalyx Research",
  SIRET:                  "898 509 369 00028",
  VAT_STATUS:             "TVA non applicable, art. 293B du CGI",
  EMAIL:                  "contact@novalyxresearch.com",
  ADDRESS:                "44 Rue Pasquier, 75008 Paris, France",
  STRIPE_ENABLED:         true,
  SITE_URL:               "https://novalyxresearch.com/",
  // Coordonnées bancaires pour les commandes professionnelles / grosses commandes par virement.
  // Le titulaire légal (raison sociale d'un auto-entrepreneur = nom/prénom) doit être affiché
  // tel quel pour passer la vérification du bénéficiaire (VoP) des banques.
  BANK: {
    holder:  "JALLOH TCHIERMO",
    trading: "Novalyx Research", // nom commercial, affiché en complément du titulaire légal
    iban:    "FR76 1741 8000 0100 0121 0470 797",
    bic:     "SNNNFR22XXX",
  },
};

/* ─── CURRENCIES ─────────────────────────────────────────── */
const CURRENCIES = {
  EUR: { symbol: "€",    rate: 1,    flag: "🇪🇺" },
  USD: { symbol: "$",    rate: 1.09, flag: "🇺🇸" },
  GBP: { symbol: "£",    rate: 0.86, flag: "🇬🇧" },
  CHF: { symbol: "CHF ", rate: 0.98, flag: "🇨🇭" },
};

/* ─── TRANSLATIONS ───────────────────────────────────────── */
const TRANSLATIONS = {
  EN: {
    // Nav
    nav_products: "PRODUCTS", nav_coa: "COA LIBRARY", nav_calc: "CALCULATOR", nav_learn: "LEARNING CENTER", nav_about: "ABOUT", nav_faq: "FAQ", nav_contact: "CONTACT",
    // Announcement bar
    ann1: "FRANCE BASED", ann2: "BATCH TESTED", ann3: "WORLDWIDE SHIPPING", ann4: "CONTROLLED FULFILLMENT",
    // Age gate
    age_title: "Professional Access",
    age_desc: "Novalyx Research supplies compounds exclusively for laboratory research. Access is restricted to qualified professionals.",
    age_confirm: "I confirm I am a qualified professional and this order is for laboratory research use only.",
    age_enter: "ENTER SITE →",
    age_footer: "By entering you confirm compliance with all applicable laws in your jurisdiction.",
    age_org_label: "Laboratory / Organization (optional)",
    age_org_placeholder: "Your organization's name",
    age_check_age: "I confirm I am 18 years of age or older.",
    age_check_pro: "I am a qualified professional (researcher, laboratory, institution).",
    age_check_use: "This order is strictly for laboratory research — not for human or animal use.",
    // Product card
    available_in: "AVAILABLE IN:",
    coa_dl: "COA: published upon batch validation",
    from: "FROM", per_vial: "PER VIAL",
    view_options: "VIEW OPTIONS →",
    // Product modal
    select_size: "SELECT SIZE",
    verified: "INDEPENDENTLY VERIFIED",
    purity_confirmed: "Purity",
    confirmed_by: "confirmed by",
    verify_link: "VERIFY AT JANOSHIK.COM →",
    size_label: "Size", batch_label: "Batch",
    add_to_cart: "ADD TO CART →",
    // Cart
    your_order: "Your Order",
    cart_empty: "Your cart is empty",
    qty: "Qty",
    subtotal: "SUBTOTAL",
    cart_confirm: "I confirm this order is strictly for laboratory research purposes only.",
    intl_confirm: "I acknowledge this shipment may be subject to customs inspection and I am responsible for compliance with local regulations.",
    checkout: "PROCEED TO CHECKOUT →",
    checkout_loading: "PROCESSING...",
    cart_disclaimer: "Research compounds only. Not for human use.",
    // Home
    hero_sub: "ADVANCED RESEARCH COMPOUNDS",
    hero_h1_1: "Peptides engineered",
    hero_h1_2: "for science.",
    hero_desc: "Novalyx Research supplies high-purity research peptides and laboratory compounds to researchers, laboratories, and biohackers across Europe. Each new batch is submitted for independent analysis by Janoshik — Certificates of Analysis are published as batches are validated.",
    hero_tagline: "For researchers, laboratories & serious professionals — research use only.",
    hero_browse: "BROWSE COMPOUNDS →",
    hero_coa: "VIEW COA LIBRARY",
    hero_contact: "CONTACT US",
    hero_stat1: "Research Compounds", hero_stat2: "Purity Guarantee", hero_stat3: "International Shipping",
    // Products page
    prod_sub: "OUR COMPOUNDS",
    prod_h1: "Research Catalog",
    prod_desc: "Research compounds across specialized categories. Each new batch is submitted for independent analysis — COA published upon validation. Supplied for research use only.",
    compound: "COMPOUND", compounds: "COMPOUNDS",
    // COA page
    coa_sub: "TRANSPARENCY",
    coa_h1: "COA Library",
    coa_desc: "Every batch tested. Every result published. Download COAs for all current Novalyx products.",
    download_coa: "DOWNLOAD COA →",
    // About
    about_sub: "OUR MISSION",
    about_h1: "Research-grade compounds. Uncompromised standards.",
    // FAQ
    faq_h1: "Frequently Asked Questions",
    // Contact
    contact_h1: "Contact Us",
    // Shipping
    shipping_h1: "Shipping & Delivery",
    // Footer
    footer_tagline: "Advanced research compounds, third-party verified. Not for human or veterinary use.",
    footer_shop: "SHOP", footer_company: "COMPANY", footer_legal: "LEGAL",
    footer_all_products: "All Products", footer_blends: "Signature Blends",
    footer_metabolic: "Metabolic", footer_longevity: "Longevity", footer_regen: "Regenerative",
    footer_about: "About", footer_coa: "COA Library", footer_faq: "FAQ",
    footer_shipping: "Shipping", footer_contact: "Contact",
    footer_privacy: "Privacy Policy", footer_terms: "Terms & Conditions", footer_disclaimer: "Disclaimer",
    footer_copy: "All rights reserved.",
    footer_research: "All products for research use only. Not for human or veterinary use.",
    // Subscribe
    subscribe_sub: "STAY INFORMED",
    subscribe_h2: "First Access. New Compounds. COA Alerts.",
    subscribe_desc: "Join the Novalyx research list for early product access and batch notifications.",
    subscribe_placeholder: "your@email.com",
    subscribe_btn: "SUBSCRIBE",
    subscribe_done: "✓ You're on the list.",
    subscribe_note: "No spam. Research professionals only.",
    // B2B
    b2b_sub: "FOR LABS & BULK ORDERS",
    b2b_h2: "B2B & Institutional Supply",
    b2b_desc: "Contact us for bulk pricing, long-term supply agreements, and dedicated account support for research institutions.",
    b2b_btn: "REQUEST BULK PRICING →",
    // Why Novalyx
    why_sub: "WHY NOVALYX",
    why_h2: "Built for researchers who demand more.",
    // Packaging
    pack_sub: "PROFESSIONAL PACKAGING",
    pack_h2: "Shipped ready for the lab.",
    pack_desc: "Each Novalyx Research compound arrives in tamper-evident packaging, fully labelled for laboratory handling — product name, batch code, storage conditions, and regulatory markings all visible at a glance.",
  },
  FR: {
    // Nav
    nav_products: "PRODUITS", nav_coa: "BIBLIOTHÈQUE COA", nav_calc: "CALCULATEUR", nav_learn: "CENTRE D'APPRENTISSAGE", nav_about: "À PROPOS", nav_faq: "FAQ", nav_contact: "CONTACT",
    // Announcement bar
    ann1: "ENTREPRISE FRANÇAISE", ann2: "TESTÉ PAR LOT", ann3: "LIVRAISON INTERNATIONALE", ann4: "FULFILLMENT CONTRÔLÉ",
    // Age gate
    age_title: "Accès Professionnel",
    age_desc: "Novalyx Research fournit des composés exclusivement pour la recherche en laboratoire. L'accès est réservé aux professionnels qualifiés.",
    age_confirm: "Je confirme être un professionnel qualifié et que cette commande est uniquement destinée à la recherche en laboratoire.",
    age_enter: "ACCÉDER AU SITE →",
    age_footer: "En entrant, vous confirmez être en conformité avec toutes les lois applicables dans votre juridiction.",
    age_org_label: "Laboratoire / Organisation (optionnel)",
    age_org_placeholder: "Nom de votre structure",
    age_check_age: "Je certifie avoir 18 ans ou plus.",
    age_check_pro: "Je suis un professionnel qualifié (chercheur, laboratoire, institution).",
    age_check_use: "Cette commande est strictement destinée à la recherche en laboratoire — non à un usage humain ou animal.",
    // Product card
    available_in: "DISPONIBLE EN :",
    coa_dl: "COA : publié dès validation du lot",
    from: "À PARTIR DE", per_vial: "PAR FIOLE",
    view_options: "VOIR LES OPTIONS →",
    // Product modal
    select_size: "CHOISIR LA TAILLE",
    verified: "VÉRIFIÉ INDÉPENDAMMENT",
    purity_confirmed: "Pureté",
    confirmed_by: "confirmée par",
    verify_link: "VÉRIFIER SUR JANOSHIK.COM →",
    size_label: "Taille", batch_label: "Lot",
    add_to_cart: "AJOUTER AU PANIER →",
    // Cart
    your_order: "Votre Commande",
    cart_empty: "Votre panier est vide",
    qty: "Qté",
    subtotal: "SOUS-TOTAL",
    cart_confirm: "Je confirme que cette commande est strictement destinée à des fins de recherche en laboratoire uniquement.",
    intl_confirm: "Je reconnais que cet envoi peut être soumis à une inspection douanière et que je suis responsable du respect des réglementations locales.",
    checkout: "PASSER LA COMMANDE →",
    checkout_loading: "TRAITEMENT...",
    cart_disclaimer: "Composés de recherche uniquement. Pas à usage humain.",
    // Home
    hero_sub: "COMPOSÉS DE RECHERCHE AVANCÉS",
    hero_h1_1: "Peptides conçus",
    hero_h1_2: "pour la science.",
    hero_desc: "Novalyx Research fournit des peptides de recherche et composés de laboratoire haute pureté aux chercheurs, laboratoires et biohackers à travers l'Europe. Chaque nouveau lot est soumis à une analyse indépendante par Janoshik — les certificats sont publiés dès validation.",
    hero_tagline: "Pour chercheurs, laboratoires & professionnels exigeants — usage recherche uniquement.",
    hero_contact: "NOUS CONTACTER",
    hero_browse: "VOIR LES COMPOSÉS →",
    hero_coa: "VOIR LA BIBLIOTHÈQUE COA",
    hero_stat1: "Composés de Recherche", hero_stat2: "Garantie de Pureté", hero_stat3: "Livraison Internationale",
    // Products page
    prod_sub: "NOS COMPOSÉS",
    prod_h1: "Catalogue de Recherche",
    prod_desc: "Composés de recherche dans des catégories spécialisées. Chaque nouveau lot est soumis à une analyse indépendante — COA publié dès validation. Fourni uniquement pour la recherche.",
    compound: "COMPOSÉ", compounds: "COMPOSÉS",
    // COA page
    coa_sub: "TRANSPARENCE",
    coa_h1: "Bibliothèque COA",
    coa_desc: "Chaque lot testé. Chaque résultat publié. Téléchargez les COA pour tous les produits Novalyx actuels.",
    download_coa: "TÉLÉCHARGER COA →",
    // About
    about_sub: "NOTRE MISSION",
    about_h1: "Composés de qualité recherche. Standards sans compromis.",
    // FAQ
    faq_h1: "Questions Fréquentes",
    // Contact
    contact_h1: "Nous Contacter",
    // Shipping
    shipping_h1: "Livraison & Expédition",
    // Footer
    footer_tagline: "Composés de recherche avancés, vérifiés par des tiers. Pas à usage humain ou vétérinaire.",
    footer_shop: "BOUTIQUE", footer_company: "ENTREPRISE", footer_legal: "LÉGAL",
    footer_all_products: "Tous les Produits", footer_blends: "Mélanges Signature",
    footer_metabolic: "Métabolique", footer_longevity: "Longévité", footer_regen: "Régénératif",
    footer_about: "À Propos", footer_coa: "Bibliothèque COA", footer_faq: "FAQ",
    footer_shipping: "Livraison", footer_contact: "Contact",
    footer_privacy: "Politique de Confidentialité", footer_terms: "Conditions Générales", footer_disclaimer: "Avertissement",
    footer_copy: "Tous droits réservés.",
    footer_research: "Tous les produits sont réservés à la recherche. Pas à usage humain ou vétérinaire.",
    // Subscribe
    subscribe_sub: "RESTEZ INFORMÉ",
    subscribe_h2: "Accès Prioritaire. Nouveaux Composés. Alertes COA.",
    subscribe_desc: "Rejoignez la liste de recherche Novalyx pour un accès anticipé aux produits et aux notifications de lots.",
    subscribe_placeholder: "votre@email.com",
    subscribe_btn: "S'ABONNER",
    subscribe_done: "✓ Vous êtes sur la liste.",
    subscribe_note: "Pas de spam. Professionnels de la recherche uniquement.",
    // B2B
    b2b_sub: "POUR LABORATOIRES & COMMANDES EN GROS",
    b2b_h2: "Approvisionnement B2B & Institutionnel",
    b2b_desc: "Contactez-nous pour les tarifs en gros, les accords d'approvisionnement à long terme et le support dédié pour les institutions de recherche.",
    b2b_btn: "DEMANDER UN DEVIS →",
    // Why Novalyx
    why_sub: "POURQUOI NOVALYX",
    why_h2: "Conçu pour les chercheurs qui exigent le meilleur.",
    // Packaging
    pack_sub: "EMBALLAGE PROFESSIONNEL",
    pack_h2: "Expédié prêt pour le laboratoire.",
    pack_desc: "Chaque composé Novalyx Research arrive dans un emballage inviolable, entièrement étiqueté pour la manipulation en laboratoire — nom du produit, code de lot, conditions de stockage et marquages réglementaires visibles en un coup d'œil.",
  },
};

const t = (lang, key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS.EN[key] || key;

/* ─── PRODUCT TRANSLATION DICTIONARY (EN → FR) ───────────── */
/* Traduit automatiquement les tags, catégories, specs et termes techniques des produits */
const PRODUCT_FR = {
  // Tags
  "TISSUE REPAIR RESEARCH": "RECHERCHE RÉPARATION TISSULAIRE",
  "CELLULAR RESEARCH": "RECHERCHE CELLULAIRE",
  "REGENERATIVE RESEARCH": "RECHERCHE RÉGÉNÉRATIVE",
  "ANTI-INFLAMMATORY RESEARCH": "RECHERCHE ANTI-INFLAMMATOIRE",
  "TRIPLE-RECEPTOR RESEARCH": "RECHERCHE TRIPLE-RÉCEPTEUR",
  "DUAL-AGONIST RESEARCH": "RECHERCHE DOUBLE-AGONISTE",
  "DUAL-RECEPTOR RESEARCH": "RECHERCHE DOUBLE-RÉCEPTEUR",
  "AMYLIN RECEPTOR RESEARCH": "RECHERCHE RÉCEPTEUR AMYLINE",
  "GROWTH HORMONE RESEARCH": "RECHERCHE HORMONE DE CROISSANCE",
  "GH-SECRETAGOGUE RESEARCH": "RECHERCHE SÉCRÉTAGOGUE GH",
  "GH SECRETAGOGUE RESEARCH": "RECHERCHE SÉCRÉTAGOGUE GH",
  "GHRH RESEARCH": "RECHERCHE GHRH",
  "GHRH ANALOG RESEARCH": "RECHERCHE ANALOGUE GHRH",
  "CELLULAR ENERGY RESEARCH": "RECHERCHE ÉNERGIE CELLULAIRE",
  "TELOMERE RESEARCH": "RECHERCHE TÉLOMÈRES",
  "NEUROPROTECTIVE RESEARCH": "RECHERCHE NEUROPROTECTRICE",
  "MITOCHONDRIAL RESEARCH": "RECHERCHE MITOCHONDRIALE",
  "IMMUNE MODULATION RESEARCH": "RECHERCHE MODULATION IMMUNITAIRE",
  "ANTIMICROBIAL RESEARCH": "RECHERCHE ANTIMICROBIENNE",
  "NOOTROPIC RESEARCH": "RECHERCHE NOOTROPIQUE",
  "NEUROMODULATION RESEARCH": "RECHERCHE NEUROMODULATION",
  "NEUROTROPHIC RESEARCH": "RECHERCHE NEUROTROPHIQUE",
  "SLEEP RESEARCH": "RECHERCHE SOMMEIL",
  "MELANOCORTIN RECEPTOR RESEARCH": "RECHERCHE RÉCEPTEUR MÉLANOCORTINE",
  "REPRODUCTIVE RESEARCH": "RECHERCHE REPRODUCTION",
  "GLP-1 RECEPTOR RESEARCH": "RECHERCHE RÉCEPTEUR GLP-1",
  "METABOLIC FRAGMENT RESEARCH": "RECHERCHE FRAGMENT MÉTABOLIQUE",
  "METABOLIC RESEARCH": "RECHERCHE MÉTABOLIQUE",
  "REGENERATIVE RESEARCH BLEND": "MÉLANGE RECHERCHE RÉGÉNÉRATIVE",
  "GH-RELEASING RESEARCH BLEND": "MÉLANGE RECHERCHE LIBÉRATION GH",
  "REGENERATIVE TRIPLE BLEND": "MÉLANGE TRIPLE RÉGÉNÉRATIF",
  "COMPLETE RESEARCH COMPLEX": "COMPLEXE DE RECHERCHE COMPLET",
  "LAB SUPPLY": "FOURNITURE LABORATOIRE",
  "ANTI-AGING RESEARCH": "RECHERCHE ANTI-ÂGE",
  "NEUROPEPTIDE RESEARCH": "RECHERCHE NEUROPEPTIDE",
  // Categories
  "Regenerative": "Régénératif",
  "Metabolic": "Métabolique",
  "GH Research": "Recherche GH",
  "Growth & Cellular": "Croissance & Cellulaire",
  "Longevity": "Longévité",
  "Immune": "Immunité",
  "Cognitive": "Cognitif",
  "Specialized": "Spécialisé",
  "Signature Blends": "Mélanges Signature",
  "Lab Supplies": "Fournitures Labo",
  // Badges
  "BESTSELLER": "MEILLEURE VENTE",
  "BEST SELLER": "MEILLEURE VENTE",
  "POPULAR": "POPULAIRE",
  "PREMIUM": "PREMIUM",
  "NEW": "NOUVEAU",
  "SIGNATURE": "SIGNATURE",
  "ESSENTIAL": "ESSENTIEL",
  // Spec labels
  "Format": "Format",
  "Purity": "Pureté",
  "Storage": "Stockage",
  "COA": "COA",
  "Composition": "Composition",
  // Spec values
  "Lyophilised vial": "Flacon lyophilisé",
  "Janoshik (per batch)": "Janoshik (par lot)",
  "≥99% target (HPLC)": "≥99% visé (HPLC)",
  "Lyophilised vials (6-pack)": "Flacons lyophilisés (lot de 6)",
  "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution": "Sec, température ambiante, à l'abri de la lumière avant reconstitution ; 2–8°C après reconstitution",
  "Janoshik HPLC (per batch)": "Janoshik HPLC (par lot)",
  "≥99% (HPLC verified)": "≥99% (vérifié HPLC)",
  "≥99% (Janoshik HPLC)": "≥99% (Janoshik HPLC)",
  "Blend verified": "Mélange vérifié",
  "Proprietary multi-peptide research blends for integrated protocols.": "Mélanges de recherche propriétaires multi-peptides pour protocoles intégrés.",
  "GLP-1, GIP, glucagon and amylin receptor research.": "Recherche sur les récepteurs GLP-1, GIP, glucagon et amyline.",
  "Tissue-repair and angiogenesis research applications.": "Applications de recherche sur la réparation tissulaire et l'angiogenèse.",
  "Cellular energy, mitochondrial and telomere research.": "Recherche sur l'énergie cellulaire, mitochondriale et les télomères.",
  "Growth hormone releasing and secretagogue research.": "Recherche sur la libération d'hormone de croissance et les sécrétagogues.",
  "T-cell modulation, antimicrobial and thymic research.": "Recherche sur la modulation des lymphocytes T, antimicrobienne et thymique.",
  "Nootropic, neuroprotective and neuromodulation research.": "Recherche nootropique, neuroprotectrice et de neuromodulation.",
  "Sleep, reproductive, melanocortin and ERR research.": "Recherche sur le sommeil, la reproduction, la mélanocortine et ERR.",
  "Pharmaceutical-grade bacteriostatic water and reconstitution supplies.": "Eau bactériostatique de qualité pharmaceutique et fournitures de reconstitution.",
};

const tp = (lang, txt) => (lang === "FR" && txt ? (PRODUCT_FR[txt] || txt) : txt);

const GLOBAL_FR = {
  "Explore Our Compounds": "Explorez Nos Composés",
  "VERIFIED BY INDEPENDENT EU LABORATORY": "VÉRIFIÉ PAR UN LABORATOIRE INDÉPENDANT UE",
  "Every batch. Every compound. Fully documented.": "Chaque lot. Chaque composé. Entièrement documenté.",
  "CERTIFICATE OF ANALYSIS": "CERTIFICAT D'ANALYSE",
  "Product:": "Produit :",
  "Batch:": "Lot :",
  "MS identity:": "Identité MS :",
  "Confirmed": "Confirmé",
  "Heavy metals:": "Métaux lourds :",
  "Sterility:": "Stérilité :",
  "Pass": "Conforme",
  "LEAD ANALYTICAL CHEMIST": "CHIMISTE ANALYTIQUE PRINCIPAL",
  "PROFESSIONAL PACKAGING": "EMBALLAGE PROFESSIONNEL",
  "Shipped ready for the lab.": "Expédié prêt pour le laboratoire.",
  "Built for researchers who demand more.": "Conçu pour les chercheurs qui exigent plus.",
  "FOR LABS & BULK ORDERS": "POUR LABOS & COMMANDES EN GROS",
  "Contact us for bulk pricing, long-term supply agreements, and dedicated account support for research institutions.": "Contactez-nous pour les tarifs en gros, les accords d'approvisionnement à long terme et un support dédié pour les institutions de recherche.",
  "STAY INFORMED": "RESTEZ INFORMÉ",
  "First Access. New Compounds. COA Alerts.": "Accès Prioritaire. Nouveaux Composés. Alertes COA.",
  "Join the Novalyx research list for early product access and batch notifications.": "Rejoignez la liste de recherche Novalyx pour un accès anticipé aux produits et les notifications de lot.",
  "SUBSCRIBE": "S'ABONNER",
  "No spam. Research professionals only.": "Pas de spam. Professionnels de la recherche uniquement.",
  "TRANSPARENCY": "TRANSPARENCE",
  "COA Library": "Bibliothèque COA",
  "Every batch tested. Every result published. Download COAs for all current Novalyx products.": "Chaque lot testé. Chaque résultat publié. Téléchargez les COA de tous les produits Novalyx actuels.",
  "OUR STORY": "NOTRE HISTOIRE",
  "VIEW OUR PRODUCTS": "VOIR NOS PRODUITS",
  "SUPPORT": "SUPPORT",
  "Common questions about products, ordering, and compliance.": "Questions fréquentes sur les produits, les commandes et la conformité.",
  "GET IN TOUCH": "CONTACTEZ-NOUS",
  "Contact Us": "Nous Contacter",
  "Questions about products, orders, or compliance? We respond within 1 business day.": "Questions sur les produits, commandes ou conformité ? Nous répondons sous 1 jour ouvré.",
  "Message received": "Message reçu",
  "FULL NAME": "NOM COMPLET",
  "EMAIL": "EMAIL",
  "SUBJECT": "SUJET",
  "MESSAGE": "MESSAGE",
  "SEND MESSAGE": "ENVOYER LE MESSAGE",
  "By submitting you agree to our Privacy Policy. We do not share your data with third parties.": "En soumettant, vous acceptez notre Politique de Confidentialité. Nous ne partageons pas vos données avec des tiers.",
  "LEGAL": "LÉGAL",
  "Within 1 business day": "Sous 1 jour ouvré",
  "European Union": "Union Européenne",
  "Email": "Email",
  "Response": "Réponse",
  "Based in": "Basé en",
  "SHIPPING & FULFILLMENT": "LIVRAISON & EXPÉDITION",
  "Shipping & Fulfillment": "Livraison & Expédition",
  "All orders are processed under a controlled fulfillment system to ensure product integrity and batch consistency.": "Toutes les commandes sont traitées dans un système d'expédition contrôlé pour garantir l'intégrité du produit et la cohérence des lots.",
  "You will receive a tracking confirmation once your order is processed and in transit.": "Vous recevrez une confirmation de suivi une fois votre commande traitée et expédiée.",
  "Delivery Zones & Rates": "Zones de Livraison & Tarifs",
  "Customs seizures, inspections, or delays": "Saisies douanières, inspections ou retards",
  "Import duties, taxes, or clearance fees imposed by your country": "Droits d'importation, taxes ou frais de dédouanement imposés par votre pays",
  "Compliance with local laws regulating research compounds": "Conformité aux lois locales régissant les composés de recherche",
  "Packages refused, destroyed, or returned by customs authorities": "Colis refusés, détruits ou retournés par les autorités douanières",
  "All products are supplied strictly for laboratory research use only and are handled according to professional standards.": "Tous les produits sont fournis strictement pour usage en recherche en laboratoire uniquement et sont manipulés selon les normes professionnelles.",
  "By placing an order, you confirm that you are a qualified professional and that you comply with all applicable laws and regulations in your jurisdiction.": "En passant commande, vous confirmez que vous êtes un professionnel qualifié et que vous respectez toutes les lois et réglementations applicables dans votre juridiction.",
  "Research-First.": "La Recherche d'Abord.",
  "Transparency Always.": "Transparence Toujours.",
};
const tg = (lang, txt) => (lang === "FR" && txt && GLOBAL_FR[txt]) ? GLOBAL_FR[txt] : txt;
GLOBAL_FR["BROWSE BY RESEARCH CATEGORY"] = "PARCOURIR PAR CATÉGORIE DE RECHERCHE";
GLOBAL_FR["WHY NOVALYX"] = "POURQUOI NOVALYX";
GLOBAL_FR["Purity (HPLC):"] = "Pureté (HPLC) :";
GLOBAL_FR["Endotoxins:"] = "Endotoxines :";
GLOBAL_FR["RESEARCH USE DECLARATION"] = "DÉCLARATION D'USAGE RECHERCHE";
GLOBAL_FR["RESEARCH USE ONLY"] = "USAGE RECHERCHE UNIQUEMENT";


/* ─── PRODUCTS ───────────────────────────────────────────── */
const PRODUCTS = [
  /* ─────────── REGENERATIVE RESEARCH ─────────── */
  {
    id: "bpc157",
    name: "BPC-157",
    tag: "TISSUE REPAIR RESEARCH",
    category: "Regenerative",
    tagColor: "#4ade80",
    badge: "BESTSELLER",
    badgeColor: "#4ade80",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(74,222,128,0.03)",
    shortDesc: "Pentadecapeptide fragment for research into tissue repair, gut integrity, and angiogenesis pathways.",
    desc: "BPC-157 (Body Protection Compound) is a synthetic pentadecapeptide supplied for research into tissue repair, angiogenesis, and gastrointestinal integrity. Each vial contains lyophilized peptide. Supplied exclusively for in-vitro and laboratory research purposes.",
    shortDesc_fr: "Fragment pentadécapeptide pour la recherche sur la réparation tissulaire, l'intégrité intestinale et les voies de l'angiogenèse.",
    desc_fr: "Le BPC-157 (Body Protection Compound) est un pentadécapeptide synthétique fourni pour la recherche sur la réparation tissulaire, l'angiogenèse et l'intégrité gastro-intestinale. Chaque flacon contient un peptide lyophilisé. Fourni exclusivement à des fins de recherche in-vitro et en laboratoire.",
    details: [
      "Synthetic pentadecapeptide fragment",
      "Research into tissue repair and angiogenesis pathways",
      "Lyophilized for maximum stability and shelf life",
      "New batches are submitted for independent analysis by Janoshik. Certificates of Analysis (COAs) are published upon validation.",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Fragment pentadécapeptide synthétique",
      "Recherche sur les voies de réparation tissulaire et d'angiogenèse",
      "Lyophilisé pour une stabilité et une durée de conservation maximales",
      "Les nouveaux lots sont soumis à une analyse indépendante par Janoshik. Les certificats d'analyse (COA) sont publiés après validation.",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg",  price: 30.99, batch: "NVX-BPC5-0426",  stripeLink: "https://buy.stripe.com/3cI28r8O73gS6LA8442Ry01" },
      { size: "10mg", price: 49.99, batch: "NVX-BPC10-0426", stripeLink: "https://buy.stripe.com/00w00jc0j2cO4Ds5VW2Ry02" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "tb500",
    name: "TB-500",
    tag: "CELLULAR RESEARCH",
    category: "Regenerative",
    tagColor: "#60a5fa",
    badge: "POPULAR",
    badgeColor: "#60a5fa",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(96,165,250,0.03)",
    shortDesc: "Thymosin Beta-4 fragment for research into cellular migration and regenerative pathways.",
    desc: "TB-500 is a synthetic fragment of Thymosin Beta-4, supplied for research into cellular migration, angiogenesis, and tissue regeneration. Each vial contains lyophilized peptide.",
    shortDesc_fr: "Fragment de Thymosine Bêta-4 pour la recherche sur la migration cellulaire et les voies régénératives.",
    desc_fr: "Le TB-500 est un fragment synthétique de la Thymosine Bêta-4, fourni pour la recherche sur la migration cellulaire, l'angiogenèse et la régénération tissulaire. Chaque flacon contient un peptide lyophilisé.",
    details: [
      "Thymosin Beta-4 synthetic fragment",
      "Research into cellular migration and regeneration",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Fragment synthétique de Thymosine Bêta-4",
      "Recherche sur la migration cellulaire et la régénération",
      "Formulation lyophilisée haute stabilité",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg",  price: 45.99, batch: "NVX-TB5-0426",  stripeLink: "https://buy.stripe.com/dRm5kD1lF4kW0ncfww2Ry09" },
      { size: "10mg", price: 76.99, batch: "NVX-TB10-0426", stripeLink: "https://buy.stripe.com/aFa5kDe8r6t44Ds5VW2Ry0a" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "ghk",
    name: "GHK-Copper",
    tag: "REGENERATIVE RESEARCH",
    category: "Regenerative",
    tagColor: "#f9a8d4",
    badge: null,
    badgeColor: "#f9a8d4",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(249,168,212,0.03)",
    shortDesc: "Copper-peptide complex for research into collagen synthesis and skin-biology pathways.",
    desc: "GHK-Copper (Glycyl-Histidyl-Lysine copper complex) is a naturally occurring tripeptide bound to copper. Supplied for research into dermal regeneration, collagen and elastin synthesis, and tissue repair. New batches are submitted for independent analysis by Janoshik.",
    shortDesc_fr: "Complexe cuivre-peptide pour la recherche sur la synthèse du collagène, la régénération cutanée et la cicatrisation.",
    desc_fr: "Le GHK-Cuivre (complexe Glycyl-Histidyl-Lysine cuivre) est un tripeptide naturel lié au cuivre. Fourni pour la recherche sur la régénération cutanée, la synthèse du collagène et de l'élastine, et la réparation tissulaire. Les nouveaux lots sont soumis à une analyse indépendante par Janoshik.",
    details: [
      "Glycyl-Histidyl-Lysine bound to copper",
      "Research into collagen and elastin synthesis",
      "New batches are submitted for independent analysis by Janoshik. Certificates of Analysis (COAs) are published upon validation.",
      "Lyophilized, high-stability formulation",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Glycyl-Histidyl-Lysine bound to copper",
      "Recherche sur collagen and elastin synthesis",
      "New batches are submitted for independent analysis by Janoshik. Certificates of Analysis (COAs) are published upon validation.",
      "Formulation lyophilisée haute stabilité",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "50mg",  price: 22.99, batch: "NVX-GHK50-0426",  stripeLink: "https://buy.stripe.com/5kQ7sL8O72cO6LAbgg2Ry0g" },
      { size: "100mg", price: 35.99, batch: "NVX-GHK100-0426", stripeLink: "https://buy.stripe.com/00w4gz4xReZAgma8442Ry0h" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "kpv",
    name: "KPV",
    tag: "ANTI-INFLAMMATORY RESEARCH",
    category: "Regenerative",
    tagColor: "#a78bfa",
    badge: null,
    badgeColor: "#a78bfa",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(167,139,250,0.03)",
    shortDesc: "Tripeptide α-MSH fragment for research into inflammation, gut integrity, and dermal pathways.",
    desc: "KPV (Lysine-Proline-Valine) is the C-terminal tripeptide fragment of alpha-MSH. Supplied for research into inflammatory signalling, intestinal barrier function, and dermal health.",
    shortDesc_fr: "Fragment tripeptide α-MSH pour la recherche sur l'inflammation, l'intégrité intestinale et les voies dermiques.",
    desc_fr: "Le KPV (Lysine-Proline-Valine) est le fragment tripeptide C-terminal de l'alpha-MSH. Fourni pour la recherche sur la signalisation inflammatoire, la fonction de barrière intestinale et la santé dermique.",
    details: [
      "C-terminal tripeptide fragment of α-MSH",
      "Research into inflammation and gut integrity",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "C-terminal tripeptide fragment of α-MSH",
      "Recherche sur inflammation and gut integrity",
      "Formulation lyophilisée haute stabilité",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg",  price: 27.99, batch: "NVX-KPV5-0426",  stripeLink: "https://buy.stripe.com/6oUeVd5BVdVw9XM5VW2Ry12" },
      { size: "10mg", price: 38.99, batch: "NVX-KPV10-0426", stripeLink: "https://buy.stripe.com/bJedR9c0j9Fg9XMdoo2Ry13" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },

  /* ─────────── METABOLIC RESEARCH ─────────── */
  {
    id: "retatrutide",
    name: "GLP-3RT",
    tag: "TRIPLE-RECEPTOR RESEARCH",
    category: "Metabolic",
    tagColor: "#fbbf24",
    badge: "PREMIUM",
    badgeColor: "#fbbf24",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(251,191,36,0.03)",
    shortDesc: "Synthetic triple-receptor agonist research peptide for in-vitro laboratory investigation of GLP-1, GIP, and glucagon receptor pathways.",
    desc: "GLP-3RT is a synthetic peptide supplied exclusively for in-vitro laboratory research into GLP-1, GIP, and glucagon receptor signalling. Each vial contains lyophilized peptide with batch-specific analytical documentation by Janoshik Analytical (Czech Republic). Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    shortDesc_fr: "Peptide de recherche triple-agoniste synthétique pour l'investigation in-vitro en laboratoire des voies des récepteurs GLP-1, GIP et glucagon.",
    desc_fr: "Le GLP-3RT est un peptide synthétique fourni exclusivement pour la recherche in-vitro en laboratoire sur la signalisation des récepteurs GLP-1, GIP et glucagon. Chaque flacon contient un peptide lyophilisé avec documentation analytique spécifique au lot par Janoshik Analytical (République tchèque). Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    details: [
      "Synthetic triple-receptor agonist peptide",
      "Research into GLP-1, GIP, and glucagon pathways",
      "Lyophilized for maximum stability and shelf life",
      "New batches are submitted for independent analysis by Janoshik. Certificates of Analysis (COAs) are published upon validation.",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Peptide triple-agoniste synthétique",
      "Recherche sur les voies GLP-1, GIP et glucagon",
      "Lyophilisé pour une stabilité et une durée de conservation maximales",
      "Les nouveaux lots sont soumis à une analyse indépendante par Janoshik. Les certificats d'analyse (COA) sont publiés après validation.",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg",  price: 59.99,  batch: "NVX-RET5-0426",  stripeLink: "https://buy.stripe.com/3cIfZhfcv5p03zo1FG2Ry19" },
      { size: "5mg · Pack de 2", price: 104.99, batch: "NVX-RET5-PACK2-0526", stripeLink: "https://buy.stripe.com/cNi14naWf18Kgmadoo2Ry1a" },
      { size: "5mg · Pack de 3", price: 149.99, batch: "NVX-RET5-PACK3-0526", stripeLink: "https://buy.stripe.com/00wbJ1d4n5p0fi6gAA2Ry1b" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "mazdutide",
    name: "Mazdutide",
    tag: "DUAL-AGONIST RESEARCH",
    category: "Metabolic",
    tagColor: "#fb923c",
    badge: "NEW",
    badgeColor: "#fb923c",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(251,146,60,0.03)",
    shortDesc: "Synthetic GLP-1/glucagon dual-agonist peptide for research into integrated metabolic signalling pathways.",
    desc: "Mazdutide is a synthetic dual-agonist peptide targeting both GLP-1 and glucagon receptors. Supplied exclusively for in-vitro laboratory research. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    shortDesc_fr: "Peptide double-agoniste GLP-1/glucagon synthétique pour la recherche sur les voies de signalisation métabolique intégrée.",
    desc_fr: "Le Mazdutide est un peptide double-agoniste synthétique ciblant les récepteurs GLP-1 et glucagon. Fourni exclusivement pour la recherche in-vitro en laboratoire. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    details: [
      "Synthetic dual-receptor agonist peptide",
      "Research into GLP-1 and glucagon pathways",
      "Lyophilized for maximum stability",
      "Manufacturer HPLC testing included",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Peptide double-agoniste synthétique",
      "Recherche sur GLP-1 and glucagon pathways",
      "Lyophilized for maximum stability",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "10mg", price: 114.99, batch: "NVX-MZD10-0426", stripeLink: "https://buy.stripe.com/cNi5kD5BV04Gb1Q8442Ry14" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "survodutide",
    name: "Survodutide",
    tag: "DUAL-AGONIST RESEARCH",
    category: "Metabolic",
    tagColor: "#f59e0b",
    badge: "PREMIUM",
    badgeColor: "#f59e0b",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(245,158,11,0.03)",
    shortDesc: "Synthetic GLP-1/glucagon dual-agonist peptide for research into advanced metabolic pathways.",
    desc: "Survodutide is a synthetic dual-agonist research peptide targeting GLP-1 and glucagon receptors. Supplied exclusively for in-vitro laboratory research. Not a medicine, supplement, or cosmetic.",
    shortDesc_fr: "Peptide double-agoniste GLP-1/glucagon synthétique pour la recherche sur les voies métaboliques avancées.",
    desc_fr: "Le Survodutide est un peptide de recherche double-agoniste synthétique ciblant les récepteurs GLP-1 et glucagon. Fourni exclusivement pour la recherche in-vitro en laboratoire. Pas un médicament, complément ou cosmétique.",
    details: [
      "Synthetic dual-agonist peptide",
      "Research into advanced metabolic signalling",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Synthetic dual-agonist peptide",
      "Recherche sur advanced metabolic signalling",
      "Formulation lyophilisée haute stabilité",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "10mg", price: 151.99, batch: "NVX-SUR10-0426", stripeLink: "https://buy.stripe.com/8x2aEX4xRbNo6LA3NO2Ry15" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "cagrilintide",
    name: "Cagrilintide",
    tag: "AMYLIN RECEPTOR RESEARCH",
    category: "Metabolic",
    tagColor: "#eab308",
    badge: null,
    badgeColor: "#eab308",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(234,179,8,0.03)",
    shortDesc: "Synthetic amylin analog for research into appetite regulation and satiety signalling pathways.",
    desc: "Cagrilintide is a synthetic long-acting amylin analog, supplied for research into amylin receptor pathways and satiety signalling. Each vial contains lyophilized peptide for in-vitro laboratory investigation.",
    shortDesc_fr: "Analogue d'amyline synthétique pour la recherche sur la régulation de l'appétit et les voies de signalisation de la satiété.",
    desc_fr: "Le Cagrilintide est un analogue d'amyline synthétique à action prolongée, fourni pour la recherche sur les voies des récepteurs de l'amyline et la signalisation de la satiété. Chaque flacon contient un peptide lyophilisé pour l'investigation in-vitro en laboratoire.",
    details: [
      "Synthetic long-acting amylin analog",
      "Research into amylin receptor pathways",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Synthetic long-acting amylin analog",
      "Recherche sur amylin receptor pathways",
      "Formulation lyophilisée haute stabilité",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg",  price: 81.99, batch: "NVX-CGL5-0426",  stripeLink: "https://buy.stripe.com/4gM28r4xR2cOfi6ess2Ry0c" },
      { size: "10mg", price: 141.99, batch: "NVX-CGL10-0426", stripeLink: "https://buy.stripe.com/28E28r5BV9Fg5HwgAA2Ry0d" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },

  /* ─────────── GROWTH HORMONE RESEARCH ─────────── */
  {
    id: "tesamorelin",
    name: "Tesamorelin",
    tag: "GROWTH HORMONE RESEARCH",
    category: "GH Research",
    tagColor: "#38bdf8",
    badge: null,
    badgeColor: "#38bdf8",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(56,189,248,0.03)",
    shortDesc: "Synthetic GHRH analog for research into visceral adiposity and growth hormone axis signalling.",
    desc: "Tesamorelin is a synthetic analog of growth hormone-releasing hormone (GHRH), supplied for research into visceral fat metabolism and the GH/IGF-1 axis.",
    shortDesc_fr: "Analogue de GHRH synthétique pour la recherche sur l'adiposité viscérale et la signalisation de l'axe de l'hormone de croissance.",
    desc_fr: "Le Tesamorelin est un analogue synthétique de l'hormone de libération de l'hormone de croissance (GHRH), fourni pour la recherche sur le métabolisme des graisses viscérales et l'axe GH/IGF-1.",
    details: [
      "Synthetic GHRH analog",
      "Research into visceral fat metabolism",
      "Lyophilized for maximum stability",
      "Manufacturer HPLC testing included",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Synthetic GHRH analog",
      "Recherche sur visceral fat metabolism",
      "Lyophilized for maximum stability",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg",  price: 59.99, batch: "NVX-TES5-0426",  stripeLink: "https://buy.stripe.com/fZu5kD1lF18K7PE1FG2Ry0e" },
      { size: "10mg", price: 108.99, batch: "NVX-TES10-0426", stripeLink: "https://buy.stripe.com/6oU4gzc0jg3E4Dsdoo2Ry0f" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "ipamorelin",
    name: "Ipamorelin",
    tag: "GH-SECRETAGOGUE RESEARCH",
    category: "GH Research",
    tagColor: "#22d3ee",
    badge: null,
    badgeColor: "#22d3ee",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(34,211,238,0.03)",
    shortDesc: "Selective GH secretagogue for research into pulsatile growth hormone release pathways.",
    desc: "Ipamorelin is a selective synthetic growth hormone secretagogue, supplied for research into pulsatile GH release pathways. Lyophilized, high-stability formulation.",
    shortDesc_fr: "Sécrétagogue GH sélectif pour la recherche sur les voies de libération pulsatile de l'hormone de croissance.",
    desc_fr: "L'Ipamorelin est un sécrétagogue synthétique sélectif de l'hormone de croissance, fourni pour la recherche sur les voies de libération pulsatile de GH. Formulation lyophilisée haute stabilité.",
    details: [
      "Selective GH secretagogue peptide",
      "Research into pulsatile GH release",
      "Lyophilized for maximum stability",
      "Manufacturer HPLC testing included",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Selective GH secretagogue peptide",
      "Recherche sur pulsatile GH release",
      "Lyophilized for maximum stability",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg",  price: 25.99, batch: "NVX-IPA5-0426",  stripeLink: "https://buy.stripe.com/28E6oH2pJaJk5Hwess2Ry0i" },
      { size: "10mg", price: 41.99, batch: "NVX-IPA10-0426", stripeLink: "https://buy.stripe.com/6oU9ATd4n18K2vkbgg2Ry0j" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "sermorelin",
    name: "Sermorelin",
    tag: "GHRH RESEARCH",
    category: "GH Research",
    tagColor: "#06b6d4",
    badge: null,
    badgeColor: "#06b6d4",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(6,182,212,0.03)",
    shortDesc: "Synthetic GHRH 1-29 fragment for research into growth hormone releasing pathways.",
    desc: "Sermorelin Acetate is a synthetic GHRH 1-29 fragment, supplied for research into growth hormone releasing pathways. Lyophilized, high-stability formulation.",
    shortDesc_fr: "Fragment GHRH 1-29 synthétique pour la recherche sur les voies de libération de l'hormone de croissance.",
    desc_fr: "Le Sermorelin Acétate est un fragment synthétique GHRH 1-29, fourni pour la recherche sur les voies de libération de l'hormone de croissance. Formulation lyophilisée haute stabilité.",
    details: [
      "Synthetic GHRH 1-29 fragment",
      "Research into GH releasing pathways",
      "Lyophilized for maximum stability",
      "Manufacturer HPLC testing included",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Synthetic GHRH 1-29 fragment",
      "Recherche sur GH releasing pathways",
      "Lyophilized for maximum stability",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg", price: 43.99, batch: "NVX-SER5-0426", stripeLink: "https://buy.stripe.com/4gM8wP4xR6t49XMbgg2Ry0l" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "cjc1295",
    name: "CJC-1295 (no DAC)",
    tag: "GHRH ANALOG RESEARCH",
    category: "GH Research",
    tagColor: "#0ea5e9",
    badge: null,
    badgeColor: "#0ea5e9",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(14,165,233,0.03)",
    shortDesc: "Synthetic GHRH analog for research into extended growth hormone releasing pathways.",
    desc: "CJC-1295 without DAC is a synthetic GHRH analog supplied for research into extended-duration GH release pathways. Lyophilized, high-stability formulation.",
    shortDesc_fr: "Analogue de GHRH synthétique pour la recherche sur les voies prolongées de libération de l'hormone de croissance.",
    desc_fr: "Le CJC-1295 sans DAC est un analogue synthétique de GHRH fourni pour la recherche sur les voies de libération de GH à durée prolongée. Formulation lyophilisée haute stabilité.",
    details: [
      "Synthetic GHRH analog (no DAC)",
      "Research into GH releasing pathways",
      "Lyophilized for maximum stability",
      "Manufacturer HPLC testing included",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Synthetic GHRH analog (no DAC)",
      "Recherche sur GH releasing pathways",
      "Lyophilized for maximum stability",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "10mg", price: 103.99, batch: "NVX-CJC10-0426", stripeLink: "https://buy.stripe.com/4gMfZh6FZbNo5Hwbgg2Ry0k" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },

  /* ─────────── LONGEVITY RESEARCH ─────────── */
  {
    id: "nad",
    name: "NAD+",
    tag: "CELLULAR ENERGY RESEARCH",
    category: "Longevity",
    tagColor: "#c084fc",
    badge: "LONGEVITY",
    badgeColor: "#c084fc",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(192,132,252,0.03)",
    shortDesc: "Nicotinamide adenine dinucleotide for research into cellular energy metabolism, mitochondrial function and longevity pathways.",
    desc: "NAD+ (Nicotinamide Adenine Dinucleotide) is a coenzyme present in all living cells, supplied for research into cellular energy metabolism, sirtuin activity, and longevity pathways.",
    shortDesc_fr: "Nicotinamide adénine dinucléotide pour la recherche sur le métabolisme énergétique cellulaire, la fonction mitochondriale et les voies de longévité.",
    desc_fr: "Le NAD+ (Nicotinamide Adénine Dinucléotide) est une coenzyme présente dans toutes les cellules vivantes, fournie pour la recherche sur le métabolisme énergétique cellulaire, l'activité des sirtuines et les voies de longévité.",
    details: [
      "Naturally occurring coenzyme",
      "Research into cellular energy and longevity pathways",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Naturally occurring coenzyme",
      "Recherche sur cellular energy and longevity pathways",
      "Formulation lyophilisée haute stabilité",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "500mg",  price: 54.99, batch: "NVX-NAD500-0426",  stripeLink: "https://buy.stripe.com/28E00j0hB5p0d9Yess2Ry0m" },
      { size: "1000mg", price: 99.99, batch: "NVX-NAD1000-0426", stripeLink: "https://buy.stripe.com/cNi28re8r2cO2vkgAA2Ry0n" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "epitalon",
    name: "Epitalon",
    tag: "TELOMERE RESEARCH",
    category: "Longevity",
    tagColor: "#a3e635",
    badge: null,
    badgeColor: "#a3e635",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(163,230,53,0.03)",
    shortDesc: "Synthetic tetrapeptide for research into telomerase activation, pineal signalling, and longevity pathways.",
    desc: "Epitalon is a synthetic tetrapeptide (Ala-Glu-Asp-Gly), supplied for research into telomerase activation, pineal gland signalling, and longevity pathways.",
    shortDesc_fr: "Tétrapeptide synthétique pour la recherche sur l'activation de la télomérase, la signalisation pinéale et les voies de longévité.",
    desc_fr: "L'Epitalon est un tétrapeptide synthétique (Ala-Glu-Asp-Gly), fourni pour la recherche sur l'activation de la télomérase, la signalisation de la glande pinéale et les voies de longévité.",
    details: [
      "Synthetic tetrapeptide (Ala-Glu-Asp-Gly)",
      "Research into telomerase and longevity pathways",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Synthetic tetrapeptide (Ala-Glu-Asp-Gly)",
      "Recherche sur telomerase and longevity pathways",
      "Formulation lyophilisée haute stabilité",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "10mg", price: 30.99, batch: "NVX-EPI10-0426", stripeLink: "https://buy.stripe.com/4gM6oH5BVaJk2vkckk2Ry0o" },
      { size: "50mg", price: 116.99, batch: "NVX-EPI50-0426", stripeLink: "https://buy.stripe.com/aFa5kD1lF7x8b1Q3NO2Ry0p" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "pinealon",
    name: "Pinealon",
    tag: "NEUROPROTECTIVE RESEARCH",
    category: "Longevity",
    tagColor: "#84cc16",
    badge: null,
    badgeColor: "#84cc16",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(132,204,22,0.03)",
    shortDesc: "Synthetic tripeptide for research into neuroprotection and cognitive longevity pathways.",
    desc: "Pinealon is a synthetic tripeptide, supplied for research into neuroprotection and cognitive longevity signalling pathways.",
    shortDesc_fr: "Tripeptide synthétique pour la recherche sur la neuroprotection et les voies de longévité cognitive.",
    desc_fr: "Le Pinealon est un tripeptide synthétique, fourni pour la recherche sur la neuroprotection et les voies de signalisation de la longévité cognitive.",
    details: [
      "Synthetic tripeptide",
      "Research into neuroprotection and cognitive function",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Synthetic tripeptide",
      "Recherche sur neuroprotection and cognitive function",
      "Formulation lyophilisée haute stabilité",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg",  price: 38.99, batch: "NVX-PIN5-0426",  stripeLink: "https://buy.stripe.com/eVq9AT5BV18K1rg4RS2Ry0q" },
      { size: "10mg", price: 49.99, batch: "NVX-PIN10-0426", stripeLink: "https://buy.stripe.com/14A4gze8r6t41rgckk2Ry0r" },
      { size: "20mg", price: 65.99, batch: "NVX-PIN20-0426", stripeLink: "https://buy.stripe.com/aFaaEX1lF18Kb1Q4RS2Ry0s" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "motsc",
    name: "MOTS-c",
    tag: "MITOCHONDRIAL RESEARCH",
    category: "Longevity",
    tagColor: "#f472b6",
    badge: null,
    badgeColor: "#f472b6",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(244,114,182,0.03)",
    shortDesc: "Mitochondrial-derived peptide for research into metabolic homeostasis and cellular stress response.",
    desc: "MOTS-c is a 16-amino acid mitochondrial-derived peptide, supplied for research into metabolic homeostasis, insulin sensitivity, and cellular stress response pathways.",
    shortDesc_fr: "Peptide d'origine mitochondriale pour la recherche sur l'homéostasie métabolique et la réponse au stress cellulaire.",
    desc_fr: "Le MOTS-c est un peptide de 16 acides aminés d'origine mitochondriale, fourni pour la recherche sur l'homéostasie métabolique, la sensibilité à l'insuline et les voies de réponse au stress cellulaire.",
    details: [
      "Mitochondrial-derived peptide (MDP)",
      "Research into metabolic homeostasis",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Mitochondrial-derived peptide (MDP)",
      "Recherche sur metabolic homeostasis",
      "Formulation lyophilisée haute stabilité",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "10mg", price: 41.99, batch: "NVX-MOTS10-0426", stripeLink: "https://buy.stripe.com/28E8wP7K3g3E4Ds9882Ry0t" },
      { size: "40mg", price: 114.99, batch: "NVX-MOTS40-0426", stripeLink: "https://buy.stripe.com/6oUcN50hB3gS1rgckk2Ry0u" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "ss31",
    name: "SS-31",
    tag: "MITOCHONDRIAL RESEARCH",
    category: "Longevity",
    tagColor: "#ec4899",
    badge: "PREMIUM",
    badgeColor: "#ec4899",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(236,72,153,0.03)",
    shortDesc: "Mitochondria-targeting peptide for research into cardiolipin binding and mitochondrial energetics.",
    desc: "SS-31 (Elamipretide) is a mitochondria-targeting peptide, supplied for research into cardiolipin binding and mitochondrial energetics pathways.",
    shortDesc_fr: "Peptide ciblant les mitochondries pour la recherche sur la liaison à la cardiolipine et l'énergétique mitochondriale.",
    desc_fr: "Le SS-31 (Elamipretide) est un peptide ciblant les mitochondries, fourni pour la recherche sur la liaison à la cardiolipine et les voies énergétiques mitochondriales.",
    details: [
      "Mitochondria-targeting peptide",
      "Research into cardiolipin and mitochondrial energetics",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Mitochondria-targeting peptide",
      "Recherche sur cardiolipin and mitochondrial energetics",
      "Formulation lyophilisée haute stabilité",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "10mg", price: 51.99, batch: "NVX-SS31-10-0426", stripeLink: "https://buy.stripe.com/4gMeVde8r3gS6LAgAA2Ry0v" },
      { size: "50mg", price: 189.99, batch: "NVX-SS31-50-0426", stripeLink: "https://buy.stripe.com/6oU3cv2pJdVwee20BC2Ry0w" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },

  /* ─────────── IMMUNE RESEARCH ─────────── */
  {
    id: "thymosinalpha1",
    name: "Thymosin Alpha-1",
    tag: "IMMUNE MODULATION RESEARCH",
    category: "Immune",
    tagColor: "#fb923c",
    badge: null,
    badgeColor: "#fb923c",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(251,146,60,0.03)",
    shortDesc: "Synthetic 28-amino acid peptide for research into immune modulation and T-cell maturation pathways.",
    desc: "Thymosin Alpha-1 (TA1) is a synthetic 28-amino acid peptide, supplied for research into immune system modulation, T-cell signalling, and thymic function.",
    shortDesc_fr: "Peptide synthétique de 28 acides aminés pour la recherche sur la modulation immunitaire et les voies de maturation des lymphocytes T.",
    desc_fr: "La Thymosine Alpha-1 (TA1) est un peptide synthétique de 28 acides aminés, fourni pour la recherche sur la modulation du système immunitaire, la signalisation des lymphocytes T et la fonction thymique.",
    details: [
      "Synthetic 28-amino acid peptide",
      "Research into immune modulation and T-cell pathways",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Synthetic 28-amino acid peptide",
      "Recherche sur immune modulation and T-cell pathways",
      "Formulation lyophilisée haute stabilité",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg",  price: 62.99, batch: "NVX-TA1-5-0426",  stripeLink: "https://buy.stripe.com/6oU6oH8O79Fg8TIbgg2Ry0x" },
      { size: "10mg", price: 103.99, batch: "NVX-TA1-10-0426", stripeLink: "https://buy.stripe.com/eVq28r8O79Fgee23NO2Ry0y" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "thymalin",
    name: "Thymalin",
    tag: "IMMUNE MODULATION RESEARCH",
    category: "Immune",
    tagColor: "#f97316",
    badge: null,
    badgeColor: "#f97316",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(249,115,22,0.03)",
    shortDesc: "Thymus-derived peptide complex for research into immune function and thymic regulation.",
    desc: "Thymalin is a thymus-derived peptide complex, supplied for research into immune function, thymic regulation, and age-related immunology.",
    shortDesc_fr: "Complexe peptidique d'origine thymique pour la recherche sur la fonction immunitaire et la régulation thymique.",
    desc_fr: "Le Thymalin est un complexe peptidique d'origine thymique, fourni pour la recherche sur la fonction immunitaire, la régulation thymique et l'immunologie liée à l'âge.",
    details: [
      "Thymus-derived peptide complex",
      "Research into immune regulation",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Thymus-derived peptide complex",
      "Recherche sur immune regulation",
      "Formulation lyophilisée haute stabilité",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "10mg", price: 43.99, batch: "NVX-TYM10-0426", stripeLink: "https://buy.stripe.com/5kQ4gzggz18K3zobgg2Ry0z" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "ll37",
    name: "LL-37",
    tag: "ANTIMICROBIAL RESEARCH",
    category: "Immune",
    tagColor: "#ea580c",
    badge: null,
    badgeColor: "#ea580c",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(234,88,12,0.03)",
    shortDesc: "Cathelicidin-derived antimicrobial peptide for research into innate immunity and host defense.",
    desc: "LL-37 is a cathelicidin-derived antimicrobial peptide, supplied for research into innate immunity pathways and host defense mechanisms.",
    shortDesc_fr: "Peptide antimicrobien dérivé de la cathélicidine pour la recherche sur l'immunité innée et la défense de l'hôte.",
    desc_fr: "Le LL-37 est un peptide antimicrobien dérivé de la cathélicidine, fourni pour la recherche sur les voies de l'immunité innée et les mécanismes de défense de l'hôte.",
    details: [
      "Cathelicidin-derived antimicrobial peptide",
      "Research into innate immunity",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Cathelicidin-derived antimicrobial peptide",
      "Recherche sur innate immunity",
      "Formulation lyophilisée haute stabilité",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg", price: 54.99, batch: "NVX-LL37-0426", stripeLink: "https://buy.stripe.com/4gMaEXaWf2cOd9Yckk2Ry0A" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },

  /* ─────────── COGNITIVE RESEARCH ─────────── */
  {
    id: "semax",
    name: "Semax",
    tag: "NOOTROPIC RESEARCH",
    category: "Cognitive",
    tagColor: "#2dd4bf",
    badge: null,
    badgeColor: "#2dd4bf",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(45,212,191,0.03)",
    shortDesc: "Synthetic heptapeptide for research into cognitive function, BDNF expression, and neuroprotection.",
    desc: "Semax is a synthetic heptapeptide analog of ACTH(4-10), supplied for research into cognitive function, BDNF expression, and neuroprotective signalling.",
    shortDesc_fr: "Heptapeptide synthétique pour la recherche sur la fonction cognitive, l'expression du BDNF et la neuroprotection.",
    desc_fr: "Le Semax est un analogue heptapeptide synthétique de l'ACTH(4-10), fourni pour la recherche sur la fonction cognitive, l'expression du BDNF et la signalisation neuroprotectrice.",
    details: [
      "Synthetic heptapeptide (ACTH 4-10 analog)",
      "Research into cognitive function and BDNF",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Synthetic heptapeptide (ACTH 4-10 analog)",
      "Recherche sur cognitive function and BDNF",
      "Formulation lyophilisée haute stabilité",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg",  price: 35.99, batch: "NVX-SMX5-0426",  stripeLink: "https://buy.stripe.com/cNifZhggz18K9XMgAA2Ry0B" },
      { size: "11mg", price: 57.99, batch: "NVX-SMX11-0426", stripeLink: "https://buy.stripe.com/6oU6oHfcv7x8ee29882Ry0C" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "selank",
    name: "Selank",
    tag: "NEUROMODULATION RESEARCH",
    category: "Cognitive",
    tagColor: "#818cf8",
    badge: null,
    badgeColor: "#818cf8",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(129,140,248,0.03)",
    shortDesc: "Synthetic heptapeptide for research into anxiolytic mechanisms and GABAergic signalling pathways.",
    desc: "Selank is a synthetic heptapeptide analog of tuftsin, supplied for research into anxiolytic mechanisms and GABAergic signalling pathways.",
    shortDesc_fr: "Heptapeptide synthétique pour la recherche sur les mécanismes anxiolytiques et les voies de signalisation GABAergiques.",
    desc_fr: "Le Selank est un analogue heptapeptide synthétique de la tuftsine, fourni pour la recherche sur les mécanismes anxiolytiques et les voies de signalisation GABAergiques.",
    details: [
      "Synthetic heptapeptide (tuftsin analog)",
      "Research into anxiolytic and GABAergic pathways",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Synthetic heptapeptide (tuftsin analog)",
      "Recherche sur anxiolytic and GABAergic pathways",
      "Formulation lyophilisée haute stabilité",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg",  price: 41.99, batch: "NVX-SEL5-0426",  stripeLink: "https://buy.stripe.com/9B6aEX4xRaJkgma3NO2Ry0D" },
      { size: "11mg", price: 59.99, batch: "NVX-SEL11-0426", stripeLink: "https://buy.stripe.com/14AcN5aWf18K1rg8442Ry0E" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "cerebrolysin",
    name: "Cerebrolysin",
    tag: "NEUROTROPHIC RESEARCH",
    category: "Cognitive",
    tagColor: "#6366f1",
    badge: null,
    badgeColor: "#6366f1",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(99,102,241,0.03)",
    shortDesc: "Neurotrophic peptide complex for research into neuroprotection and cognitive function.",
    desc: "Cerebrolysin is a neurotrophic peptide complex, supplied for research into neuroprotection, BDNF modulation, and cognitive signalling pathways.",
    shortDesc_fr: "Complexe peptidique neurotrophique pour la recherche sur la neuroprotection et la fonction cognitive.",
    desc_fr: "Le Cerebrolysin est un complexe peptidique neurotrophique, fourni pour la recherche sur la neuroprotection, la modulation du BDNF et les voies de signalisation cognitive.",
    details: [
      "Neurotrophic peptide complex",
      "Research into neuroprotection pathways",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Neurotrophic peptide complex",
      "Recherche sur neuroprotection pathways",
      "Formulation lyophilisée haute stabilité",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "60mg", price: 41.99, batch: "NVX-CBL60-0426", stripeLink: "https://buy.stripe.com/14A5kD8O704G4Ds1FG2Ry0F" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vials (6-pack)" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },

  /* ─────────── SPECIALIZED RESEARCH ─────────── */
  {
    id: "dsip",
    name: "DSIP",
    tag: "SLEEP RESEARCH",
    category: "Specialized",
    tagColor: "#4f46e5",
    badge: null,
    badgeColor: "#4f46e5",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(79,70,229,0.03)",
    shortDesc: "Delta sleep-inducing peptide for research into sleep regulation, delta wave activity, and circadian signalling.",
    desc: "DSIP (Delta Sleep-Inducing Peptide) is a synthetic nonapeptide, supplied for research into sleep regulation, delta wave activity, and circadian signalling pathways.",
    shortDesc_fr: "Peptide inducteur du sommeil delta pour la recherche sur la régulation du sommeil, l'activité des ondes delta et la signalisation circadienne.",
    desc_fr: "Le DSIP (Delta Sleep-Inducing Peptide) est un nonapeptide synthétique, fourni pour la recherche sur la régulation du sommeil, l'activité des ondes delta et les voies de signalisation circadienne.",
    details: [
      "Synthetic nonapeptide",
      "Research into sleep regulation and delta wave activity",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Synthetic nonapeptide",
      "Recherche sur sleep regulation and delta wave activity",
      "Formulation lyophilisée haute stabilité",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg",  price: 30.99, batch: "NVX-DSIP5-0426",  stripeLink: "https://buy.stripe.com/28E3cvaWf3gSd9Y4RS2Ry0G" },
      { size: "10mg", price: 43.99, batch: "NVX-DSIP10-0426", stripeLink: "https://buy.stripe.com/cNifZhe8r04G7PE1FG2Ry0H" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "pt141",
    name: "PT-141",
    tag: "MELANOCORTIN RECEPTOR RESEARCH",
    category: "Specialized",
    tagColor: "#f43f5e",
    badge: null,
    badgeColor: "#f43f5e",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(244,63,94,0.03)",
    shortDesc: "Synthetic melanocortin receptor agonist for research into MC3/MC4 receptor pathways and central nervous system signalling.",
    desc: "PT-141 (Bremelanotide) is a synthetic cyclic heptapeptide, supplied for research into melanocortin MC3 and MC4 receptor pathways and central nervous system signalling.",
    shortDesc_fr: "Agoniste des récepteurs de la mélanocortine synthétique pour la recherche sur les voies des récepteurs MC3/MC4 et la signalisation du système nerveux central.",
    desc_fr: "Le PT-141 (Bremelanotide) est un heptapeptide cyclique synthétique, fourni pour la recherche sur les voies des récepteurs de la mélanocortine MC3 et MC4 et la signalisation du système nerveux central.",
    details: [
      "Synthetic cyclic heptapeptide",
      "Research into MC3/MC4 receptor pathways",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Synthetic cyclic heptapeptide",
      "Recherche sur MC3/MC4 receptor pathways",
      "Formulation lyophilisée haute stabilité",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "10mg", price: 43.99, batch: "NVX-PT10-0426", stripeLink: "https://buy.stripe.com/9B6dR9ggz04G8TI1FG2Ry0I" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "ara290",
    name: "Ara-290",
    tag: "NEUROPROTECTIVE RESEARCH",
    category: "Specialized",
    tagColor: "#e11d48",
    badge: null,
    badgeColor: "#e11d48",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(225,29,72,0.03)",
    shortDesc: "EPO-derived peptide for research into innate repair receptor pathways and neuroprotection.",
    desc: "Ara-290 is an 11-amino acid peptide derived from erythropoietin, supplied for research into innate repair receptor signalling and neuroprotection.",
    shortDesc_fr: "Peptide dérivé de l'EPO pour la recherche sur les voies du récepteur de réparation innée et la neuroprotection.",
    desc_fr: "L'Ara-290 est un peptide de 11 acides aminés dérivé de l'érythropoïétine, fourni pour la recherche sur la signalisation du récepteur de réparation innée et la neuroprotection.",
    details: [
      "EPO-derived 11-amino acid peptide",
      "Research into innate repair receptor pathways",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "EPO-derived 11-amino acid peptide",
      "Recherche sur innate repair receptor pathways",
      "Formulation lyophilisée haute stabilité",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "10mg", price: 45.99, batch: "NVX-ARA10-0426", stripeLink: "https://buy.stripe.com/9B6dR95BV8Bcb1Qacc2Ry0J" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "kisspeptin",
    name: "Kisspeptin-10",
    tag: "REPRODUCTIVE RESEARCH",
    category: "Specialized",
    tagColor: "#be185d",
    badge: null,
    badgeColor: "#be185d",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(190,24,93,0.03)",
    shortDesc: "Synthetic decapeptide for research into GnRH regulation and reproductive endocrinology pathways.",
    desc: "Kisspeptin-10 is a synthetic decapeptide, supplied for research into GnRH regulation and reproductive endocrinology signalling pathways.",
    shortDesc_fr: "Décapeptide synthétique pour la recherche sur la régulation de la GnRH et les voies de l'endocrinologie de la reproduction.",
    desc_fr: "Le Kisspeptin-10 est un décapeptide synthétique, fourni pour la recherche sur la régulation de la GnRH et les voies de signalisation de l'endocrinologie de la reproduction.",
    details: [
      "Synthetic decapeptide",
      "Research into GnRH and reproductive pathways",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Synthetic decapeptide",
      "Recherche sur GnRH and reproductive pathways",
      "Formulation lyophilisée haute stabilité",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg",  price: 27.99, batch: "NVX-KIS5-0426",  stripeLink: "https://buy.stripe.com/eVq3cv6FZeZA8TIgAA2Ry0K" },
      { size: "10mg", price: 51.99, batch: "NVX-KIS10-0426", stripeLink: "https://buy.stripe.com/7sYfZhe8raJk1rgbgg2Ry0L" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "slupp322",
    name: "Tirzepatide",
    tag: "DUAL-RECEPTOR RESEARCH",
    category: "Metabolic",
    tagColor: "#fbbf24",
    badge: "BEST SELLER",
    badgeColor: "#fbbf24",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(251,191,36,0.03)",
    shortDesc: "Synthetic dual-receptor agonist research peptide for in-vitro laboratory investigation of GLP-1 and GIP receptor pathways.",
    desc: "Tirzepatide is a synthetic peptide supplied exclusively for in-vitro laboratory research into GLP-1 and GIP receptor signalling. Each vial contains lyophilized peptide with batch-specific analytical documentation by Janoshik Analytical (Czech Republic). Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    details: [
      "Synthetic dual-receptor agonist peptide",
      "Research into GLP-1 and GIP pathways",
      "Lyophilized for maximum stability and shelf life",
      "New batches are submitted for independent analysis by Janoshik. Certificates of Analysis (COAs) are published upon validation.",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Peptide double-agoniste synthétique",
      "Recherche sur les voies GLP-1 et GIP",
      "Lyophilisé pour une stabilité et une durée de conservation maximales",
      "Les nouveaux lots sont soumis à une analyse indépendante par Janoshik. Les certificats d'analyse (COA) sont publiés après validation.",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg",  price: 45.99, batch: "NVX-TIRZ5-0426",  stripeLink: "https://buy.stripe.com/6oUaEX0hB4kW6LA7002Ry05" },
      { size: "10mg", price: 51.99, batch: "NVX-TIRZ10-0426", stripeLink: "https://buy.stripe.com/00w3cv7K3bNo7PE7002Ry06" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "semaglutide",
    name: "Semaglutide",
    tag: "GLP-1 RECEPTOR RESEARCH",
    category: "Metabolic",
    tagColor: "#fbbf24",
    badge: "BEST SELLER",
    badgeColor: "#fbbf24",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(251,191,36,0.03)",
    shortDesc: "Synthetic GLP-1 receptor agonist research peptide for in-vitro laboratory investigation of incretin signalling pathways.",
    desc: "Semaglutide is a synthetic peptide supplied exclusively for in-vitro laboratory research into GLP-1 receptor signalling. Each vial contains lyophilized peptide with batch-specific analytical documentation by Janoshik Analytical (Czech Republic). Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    shortDesc_fr: "Peptide de recherche agoniste du récepteur GLP-1 synthétique pour l'investigation in-vitro en laboratoire des voies de signalisation de l'incrétine.",
    desc_fr: "Le Semaglutide est un peptide synthétique fourni exclusivement pour la recherche in-vitro en laboratoire sur la signalisation du récepteur GLP-1. Chaque flacon contient un peptide lyophilisé avec documentation analytique spécifique au lot par Janoshik Analytical (République tchèque). Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    details: [
      "Synthetic GLP-1 receptor agonist peptide",
      "Research into incretin and metabolic pathways",
      "Lyophilized for maximum stability and shelf life",
      "New batches are submitted for independent analysis by Janoshik. Certificates of Analysis (COAs) are published upon validation.",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Peptide agoniste du récepteur GLP-1 synthétique",
      "Recherche sur les voies de l'incrétine et métaboliques",
      "Lyophilisé pour une stabilité et une durée de conservation maximales",
      "Les nouveaux lots sont soumis à une analyse indépendante par Janoshik. Les certificats d'analyse (COA) sont publiés après validation.",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg",  price: 44.99, batch: "NVX-SEMA5-0426",  stripeLink: "https://buy.stripe.com/8x2fZh0hB18K0nc5VW2Ry07" },
      { size: "10mg", price: 49.99, batch: "NVX-SEMA10-0426", stripeLink: "https://buy.stripe.com/8x2cN5e8r18Kd9Y3NO2Ry08" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "aod9604",
    name: "AOD-9604",
    tag: "METABOLIC FRAGMENT RESEARCH",
    category: "Metabolic",
    tagColor: "#fbbf24",
    badge: "NEW",
    badgeColor: "#fbbf24",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(251,191,36,0.03)",
    shortDesc: "Modified growth hormone fragment (176-191) research peptide for in-vitro investigation of lipid metabolism pathways.",
    desc: "AOD-9604 is a synthetic modified fragment of growth hormone (amino acids 176-191), supplied exclusively for in-vitro laboratory research into lipid metabolism signalling. Each vial contains lyophilized peptide with batch-specific analytical documentation by Janoshik Analytical (Czech Republic). Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    shortDesc_fr: "Peptide de recherche fragment modifié d'hormone de croissance (176-191) pour l'investigation in-vitro des voies du métabolisme lipidique.",
    desc_fr: "L'AOD-9604 est un fragment modifié synthétique de l'hormone de croissance (acides aminés 176-191), fourni exclusivement pour la recherche in-vitro en laboratoire sur la signalisation du métabolisme lipidique. Chaque flacon contient un peptide lyophilisé avec documentation analytique spécifique au lot par Janoshik Analytical (République tchèque). Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    details: [
      "Modified GH fragment (176-191)",
      "Research into lipid metabolism pathways",
      "Lyophilized for maximum stability and shelf life",
      "New batches are submitted for independent analysis by Janoshik. Certificates of Analysis (COAs) are published upon validation.",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Fragment GH modifié (176-191)",
      "Recherche sur les voies du métabolisme lipidique",
      "Lyophilisé pour une stabilité et une durée de conservation maximales",
      "Les nouveaux lots sont soumis à une analyse indépendante par Janoshik. Les certificats d'analyse (COA) sont publiés après validation.",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg",  price: 57.99, batch: "NVX-AOD5-0426",  stripeLink: "https://buy.stripe.com/00w6oH8O77x82vkacc2Ry0M" },
      { size: "10mg", price: 114.99, batch: "NVX-AOD10-0426", stripeLink: "https://buy.stripe.com/cNifZh6FZ4kWb1Q0BC2Ry0N" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "ghrp2",
    name: "GHRP-2",
    tag: "GH SECRETAGOGUE RESEARCH",
    category: "Growth & Cellular",
    tagColor: "#34d399",
    badge: "NEW",
    badgeColor: "#34d399",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(52,211,153,0.03)",
    shortDesc: "Growth hormone-releasing peptide for in-vitro research into GH secretagogue receptor signalling.",
    desc: "GHRP-2 is a synthetic growth hormone-releasing peptide supplied exclusively for in-vitro laboratory research into GH secretagogue receptor pathways. Each vial contains lyophilized peptide with batch-specific analytical documentation by Janoshik Analytical (Czech Republic). Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    shortDesc_fr: "Peptide libérateur d'hormone de croissance pour la recherche in-vitro sur la signalisation du récepteur sécrétagogue GH.",
    desc_fr: "Le GHRP-2 est un peptide synthétique libérateur d'hormone de croissance fourni exclusivement pour la recherche in-vitro en laboratoire sur les voies du récepteur sécrétagogue GH. Chaque flacon contient un peptide lyophilisé avec documentation analytique spécifique au lot par Janoshik Analytical (République tchèque). Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    details: [
      "Synthetic GH-releasing peptide",
      "Research into GH secretagogue receptor pathways",
      "Lyophilized for maximum stability and shelf life",
      "New batches are submitted for independent analysis by Janoshik. Certificates of Analysis (COAs) are published upon validation.",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Peptide synthétique libérateur de GH",
      "Recherche sur les voies du récepteur sécrétagogue GH",
      "Lyophilisé pour une stabilité et une durée de conservation maximales",
      "Les nouveaux lots sont soumis à une analyse indépendante par Janoshik. Les certificats d'analyse (COA) sont publiés après validation.",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg",  price: 18.99, batch: "NVX-GHRP2-5-0426",  stripeLink: "https://buy.stripe.com/fZucN53tN9Fg2vk4RS2Ry0O" },
      { size: "10mg", price: 30.99, batch: "NVX-GHRP2-10-0426", stripeLink: "https://buy.stripe.com/28E14nc0j3gSc5Ubgg2Ry0P" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "ghrp6",
    name: "GHRP-6",
    tag: "GH SECRETAGOGUE RESEARCH",
    category: "Growth & Cellular",
    tagColor: "#34d399",
    badge: "NEW",
    badgeColor: "#34d399",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(52,211,153,0.03)",
    shortDesc: "Growth hormone-releasing peptide for in-vitro research into GH secretagogue receptor and appetite signalling.",
    desc: "GHRP-6 is a synthetic growth hormone-releasing peptide supplied exclusively for in-vitro laboratory research into GH secretagogue receptor pathways. Each vial contains lyophilized peptide with batch-specific analytical documentation by Janoshik Analytical (Czech Republic). Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    shortDesc_fr: "Peptide libérateur d'hormone de croissance pour la recherche in-vitro sur le récepteur sécrétagogue GH et la signalisation de l'appétit.",
    desc_fr: "Le GHRP-6 est un peptide synthétique libérateur d'hormone de croissance fourni exclusivement pour la recherche in-vitro en laboratoire sur les voies du récepteur sécrétagogue GH. Chaque flacon contient un peptide lyophilisé avec documentation analytique spécifique au lot par Janoshik Analytical (République tchèque). Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    details: [
      "Synthetic GH-releasing peptide",
      "Research into GH secretagogue and appetite pathways",
      "Lyophilized for maximum stability and shelf life",
      "New batches are submitted for independent analysis by Janoshik. Certificates of Analysis (COAs) are published upon validation.",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Peptide synthétique libérateur de GH",
      "Recherche sur les voies sécrétagogue GH et de l'appétit",
      "Lyophilisé pour une stabilité et une durée de conservation maximales",
      "Les nouveaux lots sont soumis à une analyse indépendante par Janoshik. Les certificats d'analyse (COA) sont publiés après validation.",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg",  price: 18.99, batch: "NVX-GHRP6-5-0426",  stripeLink: "https://buy.stripe.com/00w8wP1lF8Bcee23NO2Ry0Q" },
      { size: "10mg", price: 30.99, batch: "NVX-GHRP6-10-0426", stripeLink: "https://buy.stripe.com/fZu6oH9Sb2cO6LAacc2Ry0R" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "amino1mq",
    name: "5-Amino-1MQ",
    tag: "METABOLIC RESEARCH",
    category: "Metabolic",
    tagColor: "#fbbf24",
    badge: "NEW",
    badgeColor: "#fbbf24",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(251,191,36,0.03)",
    shortDesc: "Small molecule NNMT inhibitor for in-vitro research into cellular metabolism and adipocyte pathways.",
    desc: "5-Amino-1MQ is a synthetic small molecule NNMT inhibitor supplied exclusively for in-vitro laboratory research into cellular metabolism and adipocyte signalling. Each vial contains lyophilized compound with batch-specific analytical documentation by Janoshik Analytical (Czech Republic). Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    shortDesc_fr: "Inhibiteur NNMT petite molécule pour la recherche in-vitro sur le métabolisme cellulaire et les voies des adipocytes.",
    desc_fr: "Le 5-Amino-1MQ est un inhibiteur NNMT synthétique petite molécule fourni exclusivement pour la recherche in-vitro en laboratoire sur le métabolisme cellulaire et la signalisation des adipocytes. Chaque flacon contient un composé lyophilisé avec documentation analytique spécifique au lot par Janoshik Analytical (République tchèque). Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    details: [
      "Small molecule NNMT inhibitor",
      "Research into cellular metabolism pathways",
      "Lyophilized for maximum stability and shelf life",
      "New batches are submitted for independent analysis by Janoshik. Certificates of Analysis (COAs) are published upon validation.",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Inhibiteur NNMT petite molécule",
      "Recherche sur les voies du métabolisme cellulaire",
      "Lyophilisé pour une stabilité et une durée de conservation maximales",
      "Les nouveaux lots sont soumis à une analyse indépendante par Janoshik. Les certificats d'analyse (COA) sont publiés après validation.",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg", price: 43.99, batch: "NVX-5AMQ5-0426", stripeLink: "https://buy.stripe.com/aFa00j7K32cOgma0BC2Ry0S" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "hexarelin",
    name: "Hexarelin",
    tag: "GH SECRETAGOGUE RESEARCH",
    category: "Growth & Cellular",
    tagColor: "#34d399",
    badge: "NEW",
    badgeColor: "#34d399",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(52,211,153,0.03)",
    shortDesc: "Potent growth hormone-releasing hexapeptide for in-vitro research into GH secretagogue receptor signalling.",
    desc: "Hexarelin is a synthetic growth hormone-releasing hexapeptide supplied exclusively for in-vitro laboratory research into GH secretagogue receptor pathways. Each vial contains lyophilized peptide with batch-specific analytical documentation by Janoshik Analytical (Czech Republic). Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    shortDesc_fr: "Hexapeptide puissant libérateur d'hormone de croissance pour la recherche in-vitro sur la signalisation du récepteur sécrétagogue GH.",
    desc_fr: "L'Hexarelin est un hexapeptide synthétique libérateur d'hormone de croissance fourni exclusivement pour la recherche in-vitro en laboratoire sur les voies du récepteur sécrétagogue GH. Chaque flacon contient un peptide lyophilisé avec documentation analytique spécifique au lot par Janoshik Analytical (République tchèque). Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    details: [
      "Synthetic GH-releasing hexapeptide",
      "Research into GH secretagogue receptor pathways",
      "Lyophilized for maximum stability and shelf life",
      "New batches are submitted for independent analysis by Janoshik. Certificates of Analysis (COAs) are published upon validation.",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Hexapeptide synthétique libérateur de GH",
      "Recherche sur les voies du récepteur sécrétagogue GH",
      "Lyophilisé pour une stabilité et une durée de conservation maximales",
      "Les nouveaux lots sont soumis à une analyse indépendante par Janoshik. Les certificats d'analyse (COA) sont publiés après validation.",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "2mg", price: 32.99, batch: "NVX-HEX2-0426",  stripeLink: "https://buy.stripe.com/4gMbJ13tN18K9XM4RS2Ry0T" },
      { size: "5mg", price: 51.99, batch: "NVX-HEX5-0426", stripeLink: "https://buy.stripe.com/28E00jggzbNo8TIbgg2Ry0U" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },

  /* ─────────── NOVALYX SIGNATURE BLENDS ─────────── */
  {
    id: "formula01",
    name: "Novalyx Formula 01",
    tag: "REGENERATIVE RESEARCH BLEND",
    category: "Signature Blends",
    tagColor: "#22d3ee",
    badge: "SIGNATURE",
    badgeColor: "#22d3ee",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(34,211,238,0.03)",
    shortDesc: "Proprietary dual-peptide research blend combining BPC-157 and TB-500 for integrated research into tissue repair and regenerative signalling pathways.",
    desc: "Novalyx Formula 01 is a proprietary research blend containing BPC-157 (10mg) and TB-500 (10mg) combined in a single lyophilized vial. Formulated for researchers investigating combined regenerative signalling pathways. New batches are submitted for independent analysis by Janoshik.",
    shortDesc_fr: "Mélange de recherche propriétaire à double peptide combinant BPC-157 et TB-500 pour la recherche intégrée sur la réparation tissulaire et les voies de signalisation régénératives.",
    desc_fr: "Novalyx Formula 01 est un mélange de recherche propriétaire contenant BPC-157 (10mg) et TB-500 (10mg) combinés dans un seul flacon lyophilisé. Formulé pour les chercheurs étudiant les voies de signalisation régénératives combinées. Les nouveaux lots sont soumis à une analyse indépendante par Janoshik.",
    details: [
      "Contains BPC-157 and TB-500 in 1:1 ratio",
      "Research into combined regenerative signalling pathways",
      "Single-vial convenience for integrated protocols",
      "New batches are submitted for independent analysis by Janoshik. Certificates of Analysis (COAs) are published upon validation.",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Contains BPC-157 and TB-500 in 1:1 ratio",
      "Recherche sur combined regenerative signalling pathways",
      "Single-vial convenience for integrated protocols",
      "Les nouveaux lots sont soumis à une analyse indépendante par Janoshik. Les certificats d'analyse (COA) sont publiés après validation.",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "10mg+10mg", price: 59.99, batch: "NVX-F01-0426", stripeLink: "https://buy.stripe.com/aFa4gzfcv5p0b1Q3NO2Ry0V" },
    ],
    commonSpecs: [
      { label: "Composition", value: "BPC-157 10mg + TB-500 10mg" },
      { label: "Format",      value: "Lyophilised vial" },
      { label: "Purity",      value: "Janoshik HPLC (per batch)" },
      { label: "Storage",     value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",         value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "formula02",
    name: "Novalyx Formula 02",
    tag: "GH-RELEASING RESEARCH BLEND",
    category: "Signature Blends",
    tagColor: "#34d399",
    badge: "SIGNATURE",
    badgeColor: "#34d399",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(52,211,153,0.03)",
    shortDesc: "Proprietary dual-peptide research blend combining CJC-1295 and Ipamorelin for integrated research into growth-hormone releasing pathways.",
    desc: "Novalyx Formula 02 is a proprietary research blend containing CJC-1295 (5mg, no DAC) and Ipamorelin (5mg) in a single lyophilized vial. Formulated for researchers investigating GH-releasing pathways in an integrated protocol.",
    shortDesc_fr: "Mélange de recherche propriétaire à double peptide combinant CJC-1295 et Ipamorelin pour la recherche intégrée sur les voies de libération de l'hormone de croissance.",
    desc_fr: "Novalyx Formula 02 est un mélange de recherche propriétaire contenant CJC-1295 (5mg, sans DAC) et Ipamorelin (5mg) dans un seul flacon lyophilisé. Formulé pour les chercheurs étudiant les voies de libération de GH dans un protocole intégré.",
    details: [
      "Contains CJC-1295 and Ipamorelin in 1:1 ratio",
      "Research into growth hormone releasing pathways",
      "Single-vial convenience for integrated protocols",
      "Lyophilized, high-stability formulation",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Contains CJC-1295 and Ipamorelin in 1:1 ratio",
      "Recherche sur growth hormone releasing pathways",
      "Single-vial convenience for integrated protocols",
      "Formulation lyophilisée haute stabilité",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg+5mg", price: 65.99, batch: "NVX-F02-0426", stripeLink: "https://buy.stripe.com/dRm00jd4n4kW9XM7002Ry0W" },
    ],
    commonSpecs: [
      { label: "Composition", value: "CJC-1295 5mg + Ipamorelin 5mg" },
      { label: "Format",      value: "Lyophilised vial" },
      { label: "Purity",      value: "≥99% target (HPLC)" },
      { label: "Storage",     value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",         value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "formula03",
    name: "Novalyx Formula 03",
    tag: "REGENERATIVE TRIPLE BLEND",
    category: "Signature Blends",
    tagColor: "#14b8a6",
    badge: "FLAGSHIP",
    badgeColor: "#14b8a6",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(20,184,166,0.04)",
    shortDesc: "Flagship triple-peptide research blend combining BPC-157, GHK-Copper, and TB-500 for comprehensive regenerative research protocols.",
    desc: "Novalyx Formula 03 is our flagship triple-peptide research blend containing BPC-157 (10mg), GHK-Copper (50mg), and TB-500 (10mg) in a single lyophilized vial. Formulated for researchers investigating comprehensive regenerative signalling across multiple pathways simultaneously.",
    shortDesc_fr: "Mélange de recherche phare à triple peptide combinant BPC-157, GHK-Cuivre et TB-500 pour des protocoles de recherche régénérative complets.",
    desc_fr: "Novalyx Formula 03 est notre mélange de recherche phare à triple peptide contenant BPC-157 (10mg), GHK-Cuivre (50mg) et TB-500 (10mg) dans un seul flacon lyophilisé. Formulé pour les chercheurs étudiant la signalisation régénérative complète à travers plusieurs voies simultanément.",
    details: [
      "Contains BPC-157 + GHK-Copper + TB-500",
      "Research into comprehensive regenerative pathways",
      "Triple-compound single-vial convenience",
      "Lyophilized, high-stability formulation",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Contains BPC-157 + GHK-Copper + TB-500",
      "Recherche sur comprehensive regenerative pathways",
      "Triple-compound single-vial convenience",
      "Formulation lyophilisée haute stabilité",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "70mg total", price: 135.99, batch: "NVX-F03-0426", stripeLink: "https://buy.stripe.com/28EaEXggz5p0ee2gAA2Ry0X" },
    ],
    commonSpecs: [
      { label: "Composition", value: "BPC-157 10mg + GHK-Cu 50mg + TB-500 10mg" },
      { label: "Format",      value: "Lyophilised vial" },
      { label: "Purity",      value: "≥99% target (HPLC)" },
      { label: "Storage",     value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",         value: "Janoshik (per batch)" },
    ],
  },
  /* ─────────── LAB SUPPLIES ─────────── */
  /* BAC WATER — réactivé à la demande (achetable) */
  {
    id: "bac-water",
    name: "Bacteriostatic Water",
    tag: "LAB SUPPLY",
    category: "Lab Supplies",
    tagColor: "#67e8f9",
    badge: "ESSENTIAL",
    badgeColor: "#67e8f9",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(103,232,249,0.03)",
    shortDesc: "Pharmaceutical-grade bacteriostatic water (0.9% benzyl alcohol) for reconstitution of lyophilised research peptides.",
    desc: "Novalyx Research Bacteriostatic Water is pharmaceutical-grade sterile water containing 0.9% benzyl alcohol as a bacteriostatic agent. Supplied exclusively for laboratory use in the reconstitution of lyophilised research peptides. Each vial is sealed, sterile, and ready for immediate laboratory use.",
    shortDesc_fr: "Eau bactériostatique de qualité pharmaceutique (alcool benzylique 0,9%) pour la reconstitution des peptides de recherche lyophilisés.",
    desc_fr: "L'Eau Bactériostatique Novalyx Research est une eau stérile de qualité pharmaceutique contenant 0,9% d'alcool benzylique comme agent bactériostatique. Fournie exclusivement pour usage en laboratoire dans la reconstitution des peptides de recherche lyophilisés. Chaque flacon est scellé, stérile et prêt à l'emploi immédiat en laboratoire.",
    details: [
      "0.9% benzyl alcohol bacteriostatic agent",
      "Laboratory-grade sterile reconstitution solvent",
      "Multi-draw vial — compatible with all lyophilised peptides",
      "Sealed tamper-evident vial",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "0.9% benzyl alcohol bacteriostatic agent",
      "Laboratory-grade sterile reconstitution solvent",
      "Multi-draw vial — compatible with all lyophilised peptides",
      "Sealed tamper-evident vial",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "3ml vial",        price: 6.99,  batch: "NVX-BW3-0426",        stripeLink: "https://buy.stripe.com/dRm14nfcvdVw8TIckk2Ry16" },
      { size: "3ml · Pack de 2", price: 12.99, batch: "NVX-BW3-PACK2-0526",  stripeLink: "https://buy.stripe.com/3cI9ATc0j2cO8TI7002Ry17" },
      { size: "3ml · Pack de 3", price: 18.99, batch: "NVX-BW3-PACK3-0526",  stripeLink: "https://buy.stripe.com/28E7sL0hBcRs4Ds2JK2Ry18" },
    ],
    commonSpecs: [
      { label: "Composition", value: "Sterile reconstitution solvent + 0.9% benzyl alcohol" },
      { label: "Format",      value: "Sterile sealed vial" },
      { label: "Grade",       value: "Pharmaceutical-grade" },
      { label: "Storage",     value: "Room temperature / avoid direct light" },
      { label: "COA",         value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "formula04",
    name: "Novalyx Formula 04",
    tag: "COMPLETE RESEARCH COMPLEX",
    category: "Signature Blends",
    tagColor: "#0d9488",
    badge: "FLAGSHIP",
    badgeColor: "#0d9488",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(13,148,136,0.04)",
    shortDesc: "Premium four-peptide research complex combining BPC-157, GHK-Copper, TB-500, and KPV for maximum-coverage regenerative protocols.",
    desc: "Novalyx Formula 04 is our premium four-peptide research complex containing BPC-157 (10mg), GHK-Copper (50mg), TB-500 (10mg), and KPV (10mg) in a single lyophilized vial. The most comprehensive regenerative research blend in our catalog.",
    shortDesc_fr: "Complexe de recherche premium à quatre peptides combinant BPC-157, GHK-Cuivre, TB-500 et KPV pour des protocoles régénératifs à couverture maximale.",
    desc_fr: "Novalyx Formula 04 est notre complexe de recherche premium à quatre peptides contenant BPC-157 (10mg), GHK-Cuivre (50mg), TB-500 (10mg) et KPV (10mg) dans un seul flacon lyophilisé. Le mélange de recherche régénératif le plus complet de notre catalogue.",
    details: [
      "Contains BPC-157 + GHK-Copper + TB-500 + KPV",
      "Research into maximum-coverage regenerative pathways",
      "Four-compound single-vial convenience",
      "Lyophilized, high-stability formulation",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Contains BPC-157 + GHK-Copper + TB-500 + KPV",
      "Recherche sur maximum-coverage regenerative pathways",
      "Four-compound single-vial convenience",
      "Formulation lyophilisée haute stabilité",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "80mg total", price: 164.99, batch: "NVX-F04-0426", stripeLink: "https://buy.stripe.com/eVq3cv7K3aJk7PEckk2Ry0Y" },
    ],
    commonSpecs: [
      { label: "Composition", value: "BPC-157 10mg + GHK-Cu 50mg + TB-500 10mg + KPV 10mg" },
      { label: "Format",      value: "Lyophilised vial" },
      { label: "Purity",      value: "≥99% target (HPLC)" },
      { label: "Storage",     value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",         value: "Janoshik (per batch)" },
    ],
  },

  {
    id: "melanotanii",
    name: "Melanotan II",
    tag: "MELANOCORTIN RECEPTOR RESEARCH",
    category: "Specialized",
    tagColor: "#f43f5e",
    badge: "NEW",
    badgeColor: "#f43f5e",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "#f43f5e0A",
    shortDesc: "Research compound supplied exclusively for in-vitro laboratory investigation.",
    shortDesc_fr: "Composé de recherche fourni exclusivement pour l'investigation in-vitro en laboratoire.",
    desc: "Melanotan II is supplied exclusively for in-vitro laboratory research. Each vial contains lyophilized compound. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Le Melanotan II est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    details: [
      "Supplied for in-vitro laboratory research only",
      "Lyophilized for maximum stability and shelf life",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Fourni pour la recherche in-vitro en laboratoire uniquement",
      "Lyophilisé pour une stabilité et une durée de conservation maximales",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "10mg", price: 24.99, batch: "NVX-ML10-0526", stripeLink: "" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "melanotani",
    name: "Melanotan I",
    tag: "MELANOCORTIN RECEPTOR RESEARCH",
    category: "Specialized",
    tagColor: "#f43f5e",
    badge: "NEW",
    badgeColor: "#f43f5e",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "#f43f5e0A",
    shortDesc: "Research compound supplied exclusively for in-vitro laboratory investigation.",
    shortDesc_fr: "Composé de recherche fourni exclusivement pour l'investigation in-vitro en laboratoire.",
    desc: "Melanotan I is supplied exclusively for in-vitro laboratory research. Each vial contains lyophilized compound. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Le Melanotan I est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    details: [
      "Supplied for in-vitro laboratory research only",
      "Lyophilized for maximum stability and shelf life",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Fourni pour la recherche in-vitro en laboratoire uniquement",
      "Lyophilisé pour une stabilité et une durée de conservation maximales",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "10mg", price: 27.99, batch: "NVX-MT1-0526", stripeLink: "" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "snap8",
    name: "Snap-8",
    tag: "ANTI-AGING RESEARCH",
    category: "Specialized",
    tagColor: "#a78bfa",
    badge: "NEW",
    badgeColor: "#a78bfa",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "#a78bfa0A",
    shortDesc: "Research compound supplied exclusively for in-vitro laboratory investigation.",
    shortDesc_fr: "Composé de recherche fourni exclusivement pour l'investigation in-vitro en laboratoire.",
    desc: "Snap-8 is supplied exclusively for in-vitro laboratory research. Each vial contains lyophilized compound. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Le Snap-8 est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    details: [
      "Supplied for in-vitro laboratory research only",
      "Lyophilized for maximum stability and shelf life",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Fourni pour la recherche in-vitro en laboratoire uniquement",
      "Lyophilisé pour une stabilité et une durée de conservation maximales",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "10mg", price: 30.99, batch: "NVX-NP810-0526", stripeLink: "" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "vip",
    name: "VIP",
    tag: "NEUROPEPTIDE RESEARCH",
    category: "Specialized",
    tagColor: "#f43f5e",
    badge: "NEW",
    badgeColor: "#f43f5e",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "#f43f5e0A",
    shortDesc: "Research compound supplied exclusively for in-vitro laboratory investigation.",
    shortDesc_fr: "Composé de recherche fourni exclusivement pour l'investigation in-vitro en laboratoire.",
    desc: "VIP is supplied exclusively for in-vitro laboratory research. Each vial contains lyophilized compound. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Le VIP est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    details: [
      "Supplied for in-vitro laboratory research only",
      "Lyophilized for maximum stability and shelf life",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Fourni pour la recherche in-vitro en laboratoire uniquement",
      "Lyophilisé pour une stabilité et une durée de conservation maximales",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg", price: 51.99, batch: "NVX-VIP5-0526", stripeLink: "" },
      { size: "10mg", price: 95.99, batch: "NVX-VIP10-0526", stripeLink: "" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "igf1lr3",
    name: "IGF-1 LR3",
    tag: "GROWTH HORMONE RESEARCH",
    category: "Growth & Cellular",
    tagColor: "#38bdf8",
    badge: "NEW",
    badgeColor: "#38bdf8",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "#38bdf80A",
    shortDesc: "Research compound supplied exclusively for in-vitro laboratory investigation.",
    shortDesc_fr: "Composé de recherche fourni exclusivement pour l'investigation in-vitro en laboratoire.",
    desc: "IGF-1 LR3 is supplied exclusively for in-vitro laboratory research. Each vial contains lyophilized compound. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Le IGF-1 LR3 est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    details: [
      "Supplied for in-vitro laboratory research only",
      "Lyophilized for maximum stability and shelf life",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Fourni pour la recherche in-vitro en laboratoire uniquement",
      "Lyophilisé pour une stabilité et une durée de conservation maximales",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "1mg", price: 108.99, batch: "NVX-IG1-0526", stripeLink: "" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "igfdes",
    name: "IGF-DES",
    tag: "GROWTH HORMONE RESEARCH",
    category: "Growth & Cellular",
    tagColor: "#38bdf8",
    badge: "NEW",
    badgeColor: "#38bdf8",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "#38bdf80A",
    shortDesc: "Research compound supplied exclusively for in-vitro laboratory investigation.",
    shortDesc_fr: "Composé de recherche fourni exclusivement pour l'investigation in-vitro en laboratoire.",
    desc: "IGF-DES is supplied exclusively for in-vitro laboratory research. Each vial contains lyophilized compound. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Le IGF-DES est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    details: [
      "Supplied for in-vitro laboratory research only",
      "Lyophilized for maximum stability and shelf life",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Fourni pour la recherche in-vitro en laboratoire uniquement",
      "Lyophilisé pour une stabilité et une durée de conservation maximales",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "0.1mg", price: 35.99, batch: "NVX-IGD-0526", stripeLink: "" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "novalyxformula06",
    name: "Novalyx Formula 06",
    tag: "REGENERATIVE RESEARCH BLEND",
    category: "Signature Blends",
    tagColor: "#22d3ee",
    badge: "NEW",
    badgeColor: "#22d3ee",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "#22d3ee0A",
    shortDesc: "Research compound supplied exclusively for in-vitro laboratory investigation.",
    shortDesc_fr: "Composé de recherche fourni exclusivement pour l'investigation in-vitro en laboratoire.",
    desc: "Novalyx Formula 06 is supplied exclusively for in-vitro laboratory research. Each vial contains lyophilized compound. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Le Novalyx Formula 06 est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    details: [
      "Supplied for in-vitro laboratory research only",
      "Lyophilized for maximum stability and shelf life",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Fourni pour la recherche in-vitro en laboratoire uniquement",
      "Lyophilisé pour une stabilité et une durée de conservation maximales",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "10mg total (BPC5+TB5)", price: 59.99, batch: "NVX-BB10-0526", stripeLink: "" },
      { size: "20mg total (BPC10+TB10)", price: 99.99, batch: "NVX-BB20-0526", stripeLink: "" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "novalyxformula07cagrisema",
    name: "Novalyx Formula 07 (Cagri+Sema)",
    tag: "REGENERATIVE RESEARCH BLEND",
    category: "Signature Blends",
    tagColor: "#22d3ee",
    badge: "NEW",
    badgeColor: "#22d3ee",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "#22d3ee0A",
    shortDesc: "Research compound supplied exclusively for in-vitro laboratory investigation.",
    shortDesc_fr: "Composé de recherche fourni exclusivement pour l'investigation in-vitro en laboratoire.",
    desc: "Novalyx Formula 07 (Cagri+Sema) is supplied exclusively for in-vitro laboratory research. Each vial contains lyophilized compound. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Le Novalyx Formula 07 (Cagri+Sema) est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    details: [
      "Supplied for in-vitro laboratory research only",
      "Lyophilized for maximum stability and shelf life",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Fourni pour la recherche in-vitro en laboratoire uniquement",
      "Lyophilisé pour une stabilité et une durée de conservation maximales",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "2.5mg+2.5mg", price: 51.99, batch: "NVX-CS5-0526", stripeLink: "" },
      { size: "5mg+5mg", price: 124.99, batch: "NVX-CS10-0526", stripeLink: "" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "novalyxformula08cjcipa",
    name: "Novalyx Formula 08 (CJC+IPA)",
    tag: "REGENERATIVE RESEARCH BLEND",
    category: "Signature Blends",
    tagColor: "#22d3ee",
    badge: "NEW",
    badgeColor: "#22d3ee",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "#22d3ee0A",
    shortDesc: "Research compound supplied exclusively for in-vitro laboratory investigation.",
    shortDesc_fr: "Composé de recherche fourni exclusivement pour l'investigation in-vitro en laboratoire.",
    desc: "Novalyx Formula 08 (CJC+IPA) is supplied exclusively for in-vitro laboratory research. Each vial contains lyophilized compound. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Le Novalyx Formula 08 (CJC+IPA) est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    details: [
      "Supplied for in-vitro laboratory research only",
      "Lyophilized for maximum stability and shelf life",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "Fourni pour la recherche in-vitro en laboratoire uniquement",
      "Lyophilisé pour une stabilité et une durée de conservation maximales",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg+5mg", price: 65.99, batch: "NVX-CP10-0526", stripeLink: "" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
];

/* ─── HELPERS ────────────────────────────────────────────── */
const fmt = (eurPrice, cur) => {
  const c = CURRENCIES[cur];
  return `${c.symbol}${(eurPrice * c.rate).toFixed(2)}`;
};

const hexToRgb = (hex) => {
  const h = hex.replace("#","");
  const r = parseInt(h.substring(0,2),16);
  const g = parseInt(h.substring(2,4),16);
  const b = parseInt(h.substring(4,6),16);
  return `${r},${g},${b}`;
};

const goToStripeCheckout = async (cartIn, zone = "FR") => {
  if (!cartIn || cartIn.length === 0) return;
  // Chaque article pointe vers le lien Stripe de la zone de livraison choisie
  const cart = cartIn.map(it => ({ ...it, stripeLink: linkFor(it, zone) }));

  // Find items that have a Stripe payment link
  const withLink = cart.filter(item => item.stripeLink && item.stripeLink.startsWith("https"));
  const withoutLink = cart.filter(item => !item.stripeLink || !item.stripeLink.startsWith("https"));

  if (withLink.length === 0) {
    alert("Ce produit n'est pas encore disponible à l'achat en ligne. Contactez-nous à contact@novalyxresearch.com / This product is not yet available for online purchase. Contact us at contact@novalyxresearch.com");
    return;
  }

  // Payment Links handle one product each. If the cart has a single distinct product, go straight to it.
  if (cart.length === 1 && withLink.length === 1) {
    const item = withLink[0];
    let url = item.stripeLink;
    // Pass quantity via URL param supported by Stripe Payment Links
    if (item.qty && item.qty > 1) {
      url += (url.includes("?") ? "&" : "?") + "quantity=" + item.qty;
    }
    window.location = url;
    return;
  }

  // Multiple distinct products: Stripe Payment Links can't combine them in one link.
  // Open the first product's link and inform the user to check out remaining items after.
  if (withoutLink.length > 0) {
    alert("Certains articles ne sont pas encore disponibles en ligne. / Some items are not yet available online. Contact: contact@novalyxresearch.com");
  }
  const first = withLink[0];
  let url = first.stripeLink;
  if (first.qty && first.qty > 1) {
    url += (url.includes("?") ? "&" : "?") + "quantity=" + first.qty;
  }
  if (withLink.length > 1) {
    alert("Pour le moment, merci de régler un produit à la fois. Vous allez payer : " + first.name + ". / Please check out one product at a time for now. You'll pay for: " + first.name);
  }
  window.location = url;
};


/* ═══════════════════════════════════════════════════════════
   ANALYSES JANOSHIK — rapports réels, vérifiables publiquement
   Ce sont des analyses du lot FABRICANT de référence (pas de ton
   stock à toi). Libellé honnête sur le site.
   file : chemin du PDF dans /public (ex. "/coa/retatrutide-10mg.pdf").
   Laisse "" si tu n'as pas le fichier : le bouton "Vérifier" reste.
═══════════════════════════════════════════════════════════ */
const COAS = {
  retatrutide: {
    size: "5mg",                 // le rapport ne concerne QUE le 5mg
    sample: "GLP-3RT",           // nom exact écrit sur le rapport, ne pas modifier
    batch: "NLR-2026-001",
    task: "230722",
    key: "X9RYPGHB1EGS",
    url: "https://verify.janoshik.com/tests/230722-GLP3RT_X9RYPGHB1EGS",
    purity: "99.008",
    measured: "5.25 mg",
    date: "2026-09-16",
    file: "",
  },
};
/* Produits achetables en ligne. Pour en ouvrir un nouveau : ajoute son id ici. */
const AVAILABLE = ["retatrutide", "bac-water"];
const isAvail = (p) => AVAILABLE.includes(p.id);
const JANOSHIK_VERIFY = "https://janoshik.com/verify/";

/* Couleur de capsule par catégorie — sobre, façon étiquette de labo */
const CAT_TONE = {
  "Metabolic":"#A8792A", "Regenerative":"#1E6A43", "Longevity":"#5A4B86", "GH Research":"#2E5A86",
  "Immune":"#9A4B2C", "Cognitive":"#26706E", "Specialized":"#86394A", "Signature Blends":"#0B1B2E",
  "Growth & Cellular":"#3E6B4E", "Lab Supplies":"#5B7A99",
};
const CAT_DESC = {
  "Signature Blends": ["Mélanges multi-peptides en un seul flacon.","Multi-peptide blends in a single vial."],
  "Metabolic":        ["Récepteurs GLP-1, GIP, glucagon et amyline.","GLP-1, GIP, glucagon and amylin receptors."],
  "Regenerative":     ["Réparation tissulaire et angiogenèse.","Tissue-repair and angiogenesis research."],
  "Longevity":        ["Énergie cellulaire, mitochondries, télomères.","Cellular energy, mitochondria, telomeres."],
  "GH Research":      ["Libération de GH et sécrétagogues.","GH-releasing and secretagogue research."],
  "Growth & Cellular":["Récepteur sécrétagogue GH.","GH secretagogue receptor research."],
  "Immune":           ["Modulation immunitaire, voies thymiques.","Immune modulation, thymic pathways."],
  "Cognitive":        ["Neuromodulation et neuroprotection.","Neuromodulation and neuroprotection."],
  "Specialized":      ["Sommeil, reproduction, mélanocortine.","Sleep, reproductive, melanocortin."],
  "Lab Supplies":     ["Solvant de reconstitution pour laboratoire.","Laboratory reconstitution solvent."],
};
const CATEGORY_ORDER = ["Metabolic","Lab Supplies","Regenerative","Signature Blends","Longevity","GH Research","Growth & Cellular","Immune","Cognitive","Specialized"];

const price = (eur, cur, lang) => {
  const c = CURRENCIES[cur]; const n = (eur * c.rate).toFixed(2);
  if (cur === "EUR") return lang === "FR" ? `${n.replace(".", ",")} €` : `€${n}`;
  return `${c.symbol}${n}`;
};
const fmtDate = (iso, lang) => {
  if (!iso) return "—";
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString(lang === "FR" ? "fr-FR" : "en-GB", { day:"2-digit", month:"short", year:"numeric" });
};
const pct = (v, lang) => !v ? "—" : (lang === "FR" ? `${v.replace(".", ",")} %` : `${v}%`);
const num = (v, lang) => !v ? "—" : (lang === "FR" ? v.replace(".", ",") : v);
const coaFor = (p, size) => { const c = COAS[p.id]; return c && (!size || c.size === size) ? c : null; };
const coaLink = (c) => c.url || JANOSHIK_VERIFY;
const shortName = (n) => n.replace("Novalyx Formula ", "FORMULA ").replace(" (no DAC)", "");

/* ─── GLOBAL CSS ─────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,300;6..72,400;6..72,500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
:root{
  --paper:#F5F3EE; --surface:#FFFFFF; --ink:#0B1B2E; --ink2:#34404F; --mute:#6A7380;
  --line:#DCD7CC; --line2:#EAE6DD; --green:#1E6A43; --green-soft:#E4EEE7; --leaf:#62B94A;
  --serif:'Newsreader',Georgia,serif; --sans:'IBM Plex Sans',system-ui,sans-serif; --mono:'IBM Plex Mono',ui-monospace,monospace;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{background:var(--paper);color:var(--ink);overflow-x:hidden}
body{font-family:var(--sans);font-size:15px;line-height:1.6;-webkit-font-smoothing:antialiased}
img,svg{max-width:100%;display:block}
button{font-family:inherit;cursor:pointer;background:none;border:none;color:inherit}
input,textarea,select{font-family:inherit;font-size:15px;color:var(--ink)}
a{color:inherit}
.wrap{max-width:1180px;margin:0 auto;padding:0 20px}
@media(min-width:900px){.wrap{padding:0 40px}}
.eyebrow{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--mute)}
.eyebrow b{color:var(--green);font-weight:500}
.display{font-family:var(--serif);font-weight:300;font-size:clamp(40px,7.2vw,80px);line-height:1.02;letter-spacing:-.025em}
.display em{font-style:italic;color:var(--green)}
.h2{font-family:var(--serif);font-weight:400;font-size:clamp(30px,4.6vw,48px);line-height:1.08;letter-spacing:-.02em}
.h3{font-family:var(--serif);font-weight:400;font-size:24px;line-height:1.2;letter-spacing:-.01em}
.lead{font-size:17px;color:var(--ink2);line-height:1.7;max-width:560px}
.mono{font-family:var(--mono)}
.muted{color:var(--mute)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:14px 22px;font-size:14px;font-weight:500;letter-spacing:.01em;border-radius:2px;transition:background .18s,color .18s,border-color .18s;text-decoration:none;white-space:nowrap}
.btn-ink{background:var(--ink);color:#fff}
.btn-ink:hover{background:var(--green)}
.btn-line{border:1px solid var(--ink);color:var(--ink)}
.btn-line:hover{background:var(--ink);color:#fff}
.btn-light{border:1px solid rgba(255,255,255,.4);color:#fff}
.btn-light:hover{background:#fff;color:var(--ink)}
.btn:disabled{opacity:.4;cursor:not-allowed}
.link{font-family:var(--mono);font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--green);text-decoration:none;border-bottom:1px solid currentColor;padding-bottom:2px}
.sec{padding:72px 0}
@media(min-width:900px){.sec{padding:112px 0}}
.sec-head{display:grid;gap:18px;margin-bottom:44px}
@media(min-width:900px){.sec-head{grid-template-columns:200px 1fr;gap:40px;margin-bottom:64px}}
.rule{border-top:1px solid var(--line)}
.fade{animation:fade .35s ease}
@keyframes fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}

/* top notice + nav */
.notice{background:var(--ink);color:#C9D1DB;font-family:var(--mono);font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;text-align:center;padding:8px 16px;line-height:1.5}
.nav{position:sticky;top:0;z-index:50;background:rgba(245,243,238,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.nav-in{display:flex;align-items:center;justify-content:space-between;height:66px;gap:16px}
.brand{display:flex;align-items:center;gap:10px;cursor:pointer}
.brand-name{font-family:var(--sans);font-weight:600;font-size:15px;letter-spacing:.32em}
.brand-sub{font-family:var(--mono);font-size:8.5px;letter-spacing:.22em;color:var(--green);margin-top:1px}
.nav-links{display:none;gap:30px}
.nav-links button{font-size:13.5px;color:var(--ink2);padding:6px 0;border-bottom:1px solid transparent}
.nav-links button:hover,.nav-links button.on{color:var(--ink);border-color:var(--ink)}
.nav-tools{display:flex;align-items:center;gap:14px}
.lang{display:none;font-family:var(--mono);font-size:11px;letter-spacing:.08em}
.lang button{padding:4px 3px;color:var(--mute)} .lang button.on{color:var(--ink);text-decoration:underline;text-underline-offset:4px}
.cur{display:none;font-family:var(--mono);font-size:11px;border:1px solid var(--line);background:transparent;padding:5px 6px;border-radius:2px}
.cart-btn{font-family:var(--mono);font-size:12px;letter-spacing:.06em;border:1px solid var(--ink);padding:8px 12px;border-radius:2px}
.burger{width:40px;height:40px;display:flex;flex-direction:column;justify-content:center;gap:5px;align-items:center}
.burger span{width:20px;height:1.5px;background:var(--ink);display:block}
@media(min-width:980px){.nav-links{display:flex}.lang,.cur{display:flex}.burger{display:none}}
.menu{position:fixed;inset:0;z-index:80;background:var(--paper);display:flex;flex-direction:column;padding:20px}
.menu-top{display:flex;justify-content:space-between;align-items:center;height:46px;margin-bottom:28px}
.menu a,.menu .mi{font-family:var(--serif);font-size:36px;font-weight:300;text-align:left;padding:10px 0;border-bottom:1px solid var(--line2);letter-spacing:-.01em}
.menu-foot{margin-top:auto;display:flex;gap:18px;align-items:center;padding-top:20px}

/* hero */
.hero{padding:56px 0 72px}
@media(min-width:900px){.hero{padding:88px 0 110px}}
.hero-grid{display:grid;gap:52px;align-items:end}
@media(min-width:980px){.hero-grid{grid-template-columns:1.15fr .85fr;gap:64px}}
.hero-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:34px}
.sheet{background:var(--surface);border:1px solid var(--line);padding:26px 24px;position:relative}
.sheet::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--green)}
.sheet-row{display:flex;justify-content:space-between;gap:14px;padding:11px 0;border-bottom:1px solid var(--line2);font-size:13.5px}
.sheet-row:last-of-type{border-bottom:none}
.sheet-row span:first-child{color:var(--mute)}
.sheet-row span:last-child{font-family:var(--mono);text-align:right}
.big-num{font-family:var(--serif);font-weight:300;font-size:64px;line-height:1;letter-spacing:-.03em}

/* facts strip */
.facts{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
@media(min-width:900px){.facts{grid-template-columns:repeat(4,1fr)}}
.fact{padding:22px 18px;border-right:1px solid var(--line);border-bottom:1px solid var(--line)}
@media(min-width:900px){.fact{border-bottom:none}.fact:last-child{border-right:none}}
.fact:nth-child(2n){border-right:none}
@media(min-width:900px){.fact:nth-child(2n){border-right:1px solid var(--line)}.fact:last-child{border-right:none}}
.fact-k{font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--mute);margin-bottom:6px}
.fact-v{font-size:14px;color:var(--ink)}

/* method */
.steps{display:grid;gap:0;border-top:1px solid var(--line)}
@media(min-width:900px){.steps{grid-template-columns:repeat(4,1fr)}}
.step{padding:28px 0;border-bottom:1px solid var(--line)}
@media(min-width:900px){.step{padding:32px 28px 32px 0;border-bottom:none;border-right:1px solid var(--line);margin-right:28px}.step:last-child{border-right:none;margin-right:0}}
.step-n{font-family:var(--mono);font-size:12px;color:var(--green);margin-bottom:18px}
.step p{font-size:14px;color:var(--ink2);margin-top:10px}

/* category index */
.index-row{display:grid;grid-template-columns:34px 1fr auto;gap:14px;align-items:baseline;padding:20px 0;border-bottom:1px solid var(--line);cursor:pointer;text-align:left;width:100%;transition:padding .2s}
.index-row:hover{padding-left:8px}
.index-row:hover .index-name{color:var(--green)}
.index-name{font-family:var(--serif);font-size:26px;font-weight:400;letter-spacing:-.01em;line-height:1.2}
.index-desc{font-size:13.5px;color:var(--mute);margin-top:3px}
@media(min-width:900px){.index-row{grid-template-columns:60px 1fr 1fr auto}.index-desc{margin-top:0}}

/* product grid */
.grid{display:grid;grid-template-columns:1fr;gap:1px;background:var(--line);border:1px solid var(--line)}
@media(min-width:620px){.grid{grid-template-columns:1fr 1fr}}
@media(min-width:1000px){.grid{grid-template-columns:repeat(3,1fr)}}
.pcard{background:var(--surface);padding:22px 22px 24px;display:flex;flex-direction:column;cursor:pointer;transition:background .2s;text-align:left}
.pcard:hover{background:#FBFAF7}
.pcard:hover .pcard-name{color:var(--green)}
.pcard-top{display:flex;justify-content:space-between;align-items:center;gap:10px}
.tag{font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--mute)}
.chip-soon{font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--mute);border:1px solid var(--line);padding:2px 7px;border-radius:2px;white-space:nowrap}
.chip-coa{font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--green);background:var(--green-soft);padding:3px 7px;border-radius:2px;white-space:nowrap}
.pcard-vial{height:190px;display:flex;align-items:center;justify-content:center;margin:14px 0 10px}
.pcard-name{font-family:var(--serif);font-size:26px;font-weight:400;letter-spacing:-.015em;line-height:1.15;transition:color .2s}
.pcard-sizes{font-family:var(--mono);font-size:11.5px;color:var(--mute);margin-top:6px}
.pcard-foot{display:flex;justify-content:space-between;align-items:flex-end;margin-top:18px;padding-top:16px;border-top:1px solid var(--line2)}
.pcard-price{font-family:var(--serif);font-size:22px}

/* filters */
.filters{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;margin-bottom:28px;scrollbar-width:none}
.filters::-webkit-scrollbar{display:none}
.fchip{font-family:var(--mono);font-size:11.5px;letter-spacing:.04em;padding:8px 12px;border:1px solid var(--line);border-radius:2px;white-space:nowrap;color:var(--ink2);background:var(--surface)}
.fchip.on{background:var(--ink);color:#fff;border-color:var(--ink)}

/* modal + drawer */
.overlay{position:fixed;inset:0;z-index:90;background:rgba(11,27,46,.45);display:flex;align-items:flex-end;justify-content:center}
@media(min-width:760px){.overlay{align-items:center;padding:24px}}
.modal{background:var(--paper);width:100%;max-width:920px;max-height:92vh;overflow-y:auto;border:1px solid var(--line);animation:fade .25s ease}
.modal-grid{display:grid}
@media(min-width:760px){.modal-grid{grid-template-columns:.8fr 1.2fr}}
.modal-vial{background:var(--surface);display:flex;align-items:center;justify-content:center;padding:36px 20px;border-bottom:1px solid var(--line)}
@media(min-width:760px){.modal-vial{border-bottom:none;border-right:1px solid var(--line)}}
.modal-body{padding:26px 22px 28px}
@media(min-width:760px){.modal-body{padding:34px 34px 36px}}
.sizes{display:flex;gap:8px;flex-wrap:wrap}
.size{flex:1 1 120px;text-align:left;padding:12px 14px;border:1px solid var(--line);background:var(--surface);border-radius:2px}
.size.on{border-color:var(--ink);box-shadow:inset 0 0 0 1px var(--ink)}
.spec{display:flex;justify-content:space-between;gap:14px;padding:9px 0;border-bottom:1px solid var(--line2);font-size:13px}
.spec span:first-child{color:var(--mute)}
.spec span:last-child{font-family:var(--mono);text-align:right}
.coa-box{border:1px solid var(--green);background:var(--green-soft);padding:16px 18px;margin:22px 0}
.qty{display:flex;align-items:center;border:1px solid var(--line);background:var(--surface)}
.qty button{width:40px;height:46px;font-size:18px}
.qty span{width:34px;text-align:center;font-family:var(--mono)}
.x{width:40px;height:40px;font-size:22px;line-height:1;color:var(--mute)}
.drawer{position:fixed;inset:0;z-index:90;background:rgba(11,27,46,.45)}
.drawer-in{position:absolute;right:0;top:0;bottom:0;width:420px;max-width:100%;background:var(--paper);border-left:1px solid var(--line);display:flex;flex-direction:column;padding:22px;overflow-y:auto;animation:fade .25s ease}
.check{display:flex;gap:10px;align-items:flex-start;font-size:12.5px;color:var(--ink2);line-height:1.55;padding:12px;border:1px solid var(--line);background:var(--surface);margin-bottom:8px;cursor:pointer}
.check input{margin-top:3px;accent-color:var(--green);flex-shrink:0}

/* coa table */
.coa-row{display:grid;gap:10px;padding:22px 0;border-bottom:1px solid var(--line)}
@media(min-width:900px){.coa-row{grid-template-columns:1.2fr .7fr .7fr 1fr auto;align-items:center;gap:20px}}
.coa-label{font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--mute)}

/* dark band */
.band{background:var(--ink);color:#fff}
.band .lead{color:#AEB8C4}
.band .eyebrow{color:#8E9AA8}

/* forms */
.field{display:grid;gap:6px}
.field label{font-family:var(--mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--mute)}
.field input,.field textarea{width:100%;padding:13px 14px;border:1px solid var(--line);background:var(--surface);border-radius:2px;outline:none}
.field input:focus,.field textarea:focus{border-color:var(--ink)}

/* prose / legal */
.prose{max-width:720px}
.prose h3{font-family:var(--serif);font-weight:400;font-size:22px;margin:34px 0 10px;letter-spacing:-.01em}
.prose p,.prose li{color:var(--ink2);font-size:15px;line-height:1.8;margin-bottom:12px}
.prose ul{padding-left:20px}
.faq-q{width:100%;display:flex;justify-content:space-between;gap:16px;text-align:left;padding:22px 0;font-family:var(--serif);font-size:21px;letter-spacing:-.01em;line-height:1.3}
.faq-a{padding:0 0 22px;color:var(--ink2);font-size:15px;line-height:1.8;max-width:680px}

/* footer */
.foot{border-top:1px solid var(--line);padding:56px 0 30px;background:var(--paper)}
.foot-grid{display:grid;gap:36px}
@media(min-width:900px){.foot-grid{grid-template-columns:1.4fr 1fr 1fr 1fr}}
.foot h4{font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--mute);font-weight:400;margin-bottom:14px}
.foot button{display:block;font-size:14px;color:var(--ink2);padding:4px 0;text-align:left}
.foot button:hover{color:var(--green)}
.foot-legal{margin-top:44px;padding-top:22px;border-top:1px solid var(--line);display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;font-family:var(--mono);font-size:10.5px;letter-spacing:.06em;color:var(--mute);text-transform:uppercase}

/* gate */
.gate{position:fixed;inset:0;z-index:100;background:var(--paper);display:flex;align-items:center;justify-content:center;padding:20px;transition:opacity .35s ease}
.gate.closing{opacity:0;pointer-events:none}

/* cookies */
.cookie{position:fixed;left:0;right:0;bottom:0;z-index:95;padding:12px;padding-bottom:calc(12px + env(safe-area-inset-bottom,0px));display:flex;justify-content:center;pointer-events:none}
.cookie-in{pointer-events:auto;max-width:720px;width:100%;background:var(--surface);border:1px solid var(--line);box-shadow:0 12px 40px rgba(11,27,46,.18);padding:18px 20px}
.cookie-in p{font-size:13px;color:var(--ink2);line-height:1.6;margin:6px 0 12px}
.cookie-actions{display:flex;flex-wrap:wrap;gap:8px}
.cookie-actions .btn{padding:11px 16px;font-size:13px;flex:1 1 auto}
.cookie-row{display:flex;gap:10px;align-items:flex-start;font-size:12.5px;color:var(--ink2);line-height:1.5;padding:10px 0;border-top:1px solid var(--line2)}
.cookie-row input{margin-top:3px;accent-color:var(--green);flex-shrink:0}
.field select{width:100%;padding:12px 13px;border:1px solid var(--line);background:var(--surface);border-radius:2px;font-size:14px;color:var(--ink);outline:none}

/* chatbot */
.bot-fab{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:85;background:var(--ink);color:#fff;border-radius:999px;padding:13px 20px;font-size:13.5px;font-weight:500;box-shadow:0 8px 24px rgba(11,27,46,.25);transition:background .18s}
.bot-fab:hover{background:var(--green)}
.bot-panel{position:fixed;right:16px;bottom:calc(72px + env(safe-area-inset-bottom,0px));z-index:85;width:min(390px,calc(100vw - 32px));height:min(540px,calc(100vh - 150px));background:var(--surface);border:1px solid var(--line);box-shadow:0 16px 48px rgba(11,27,46,.22);display:flex;flex-direction:column}
.bot-head{display:flex;justify-content:space-between;align-items:center;padding:12px 10px 12px 16px;border-bottom:1px solid var(--line)}
.bot-title{font-family:var(--serif);font-size:19px;line-height:1.2}
.bot-sub{font-family:var(--mono);font-size:10px;letter-spacing:.08em;color:var(--mute);text-transform:uppercase}
.bot-body{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:var(--paper)}
.bot-msg{max-width:88%;padding:10px 12px;font-size:13.5px;line-height:1.55;white-space:pre-wrap;border:1px solid var(--line);background:var(--surface);color:var(--ink2)}
.bot-msg.user{align-self:flex-end;background:var(--ink);color:#fff;border-color:var(--ink)}
.bot-msg.bot{align-self:flex-start}
.bot-chips{display:flex;gap:6px;overflow-x:auto;padding:8px 12px;border-top:1px solid var(--line);scrollbar-width:none}
.bot-chips::-webkit-scrollbar{display:none}
.bot-chips .fchip{flex-shrink:0}
.bot-form{display:flex;gap:8px;padding:10px 12px;border-top:1px solid var(--line)}
.bot-form input{flex:1;min-width:0;padding:11px 12px;border:1px solid var(--line);background:var(--paper);outline:none;border-radius:2px}
.bot-form .btn{padding:11px 16px;font-size:13px}
.gate-card{max-width:460px;width:100%;border:1px solid var(--line);background:var(--surface);padding:34px 28px}
`;

/* ─── LOGO (reprend ton logo : nœuds + A vert) ───────────── */
const Logo = ({ s = 34, light = false }) => {
  const node = light ? "#FFFFFF" : "#0B1B2E";
  return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <line x1="19" y1="20" x2="31" y2="15" stroke="#62B94A" strokeWidth="2.2"/>
      <line x1="34" y1="14" x2="35" y2="28" stroke="#62B94A" strokeWidth="2.2"/>
      <line x1="19" y1="20" x2="33" y2="30" stroke={node} strokeWidth="2.2"/>
      <line x1="17" y1="21" x2="12" y2="30" stroke="#A9B3C1" strokeWidth="2.2"/>
      <circle cx="34" cy="12" r="5.5" fill="#62B94A"/>
      <circle cx="18" cy="19" r="5" fill={node}/>
      <circle cx="34" cy="31" r="5" fill={node}/>
      <circle cx="11" cy="32" r="3.8" fill="#A9B3C1"/>
    </svg>
  );
};

/* ─── FLACON dessiné par produit (étiquette propre, sans dosage d'usage) ── */
const Vial = ({ name, size, tone = "#1E6A43", h = 180 }) => {
  const label = shortName(name).toUpperCase();
  const fs = Math.min(8.6, 46 / (label.length * 0.62));
  const id = "g" + label.replace(/[^A-Z0-9]/g, "") + (size || "").replace(/[^a-z0-9]/gi, "");
  return (
    <svg height={h} viewBox="0 0 100 180" style={{ width: "auto", height: h }} aria-label={`${name} ${size || ""}`}>
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0" stopColor="#E9EEF2"/><stop offset=".18" stopColor="#FFFFFF"/>
          <stop offset=".55" stopColor="#F3F6F8"/><stop offset=".85" stopColor="#FFFFFF"/><stop offset="1" stopColor="#E3E8EC"/>
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="172" rx="30" ry="3.5" fill="#0B1B2E" opacity=".08"/>
      <rect x="31" y="6" width="38" height="13" rx="2" fill={tone}/>
      <rect x="31" y="6" width="38" height="4" rx="2" fill="#fff" opacity=".18"/>
      <rect x="33" y="19" width="34" height="12" fill="#C4CBD3"/>
      <path d="M36 31 h28 v8 c0 4 10 6 10 12 v112 c0 5 -3 8 -8 8 h-32 c-5 0 -8 -3 -8 -8 v-112 c0 -6 10 -8 10 -12 z" fill={`url(#${id})`} stroke="#9AA6B2" strokeWidth=".8"/>
      <rect x="31" y="40" width="3" height="120" rx="1.5" fill="#fff" opacity=".7"/>
      <rect x="29" y="142" width="42" height="24" rx="2" fill="#FAFAF8" opacity=".95"/>
      <rect x="25" y="66" width="50" height="64" fill="#FFFFFF" stroke="#D5D9DE" strokeWidth=".6"/>
      <rect x="25" y="66" width="50" height="3" fill={tone}/>
      <text x="50" y="80" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="4.6" letterSpacing="1.4" fill="#0B1B2E">NOVALYX</text>
      <line x1="32" y1="84" x2="68" y2="84" stroke="#E1E4E8" strokeWidth=".5"/>
      <text x="50" y="97" textAnchor="middle" fontFamily="IBM Plex Sans, sans-serif" fontWeight="600" fontSize={fs} fill="#0B1B2E">{label}</text>
      <text x="50" y="108" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="6" fill={tone}>{size || ""}</text>
      <text x="50" y="121" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="3.3" letterSpacing=".6" fill="#6A7380">RESEARCH USE ONLY</text>
    </svg>
  );
};

/* ─── NAV ────────────────────────────────────────────────── */
const NAV_ITEMS = [
  ["products", "Catalogue", "Catalogue"],
  ["coa", "Analyses", "Analyses"],
  ["learning", "Fiches composés", "Compound notes"],
  ["about", "Méthode", "Method"],
  ["faq", "FAQ", "FAQ"],
  ["ambassador", "Ambassadeurs", "Ambassadors"],
  ["contact", "Contact", "Contact"],
];

const Nav = ({ page, go, cur, setCur, cartCount, openCart, lang, setLang }) => {
  const [open, setOpen] = useState(false);
  const FR = lang === "FR";
  const nav = (p) => { setOpen(false); go(p); };
  return (
    <>
      <nav className="nav">
        <div className="wrap nav-in">
          <div className="brand" onClick={() => nav("home")}>
            <Logo />
            <div>
              <div className="brand-name">NOVALYX</div>
              <div className="brand-sub">RESEARCH · PARIS</div>
            </div>
          </div>
          <div className="nav-links">
            {NAV_ITEMS.map(([p, fr, en]) => (
              <button key={p} className={page === p ? "on" : ""} onClick={() => nav(p)}>{FR ? fr : en}</button>
            ))}
          </div>
          <div className="nav-tools">
            <div className="lang">
              {["FR", "EN"].map(l => <button key={l} className={lang === l ? "on" : ""} onClick={() => setLang(l)}>{l}</button>)}
            </div>
            <select className="cur" value={cur} onChange={e => setCur(e.target.value)} aria-label="Currency">
              {Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="cart-btn" onClick={openCart}>{FR ? "Panier" : "Cart"} ({cartCount})</button>
            <button className="burger" onClick={() => setOpen(true)} aria-label="Menu"><span/><span/></button>
          </div>
        </div>
      </nav>
      {open && (
        <div className="menu fade">
          <div className="menu-top">
            <div className="brand" onClick={() => nav("home")}><Logo /><div className="brand-name">NOVALYX</div></div>
            <button className="x" onClick={() => setOpen(false)} aria-label="Fermer">✕</button>
          </div>
          {NAV_ITEMS.map(([p, fr, en]) => (
            <button key={p} className="mi" onClick={() => nav(p)}>{FR ? fr : en}</button>
          ))}
          <div className="menu-foot">
            <div className="lang" style={{ display: "flex" }}>
              {["FR", "EN"].map(l => <button key={l} className={lang === l ? "on" : ""} onClick={() => setLang(l)}>{l}</button>)}
            </div>
            <select className="cur" style={{ display: "block" }} value={cur} onChange={e => setCur(e.target.value)}>
              {Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      )}
    </>
  );
};

/* ─── FOOTER ─────────────────────────────────────────────── */
const Footer = ({ go, lang, onCookies }) => {
  const FR = lang === "FR";
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="brand" style={{ marginBottom: 16 }} onClick={() => go("home")}>
              <Logo s={30} /><div><div className="brand-name">NOVALYX</div><div className="brand-sub">ADVANCED RESEARCH COMPOUNDS</div></div>
            </div>
            <p className="muted" style={{ fontSize: 13.5, maxWidth: 320, lineHeight: 1.7 }}>
              {FR ? "Composés destinés exclusivement à la recherche in-vitro en laboratoire. Ni médicaments, ni compléments alimentaires." : "Compounds supplied exclusively for in-vitro laboratory research. Not medicines or dietary supplements."}
            </p>
            <div className="mono muted" style={{ fontSize: 11.5, lineHeight: 1.9, marginTop: 18 }}>
              <div>{CONFIG.BUSINESS_NAME} — {CONFIG.ADDRESS}</div>
              <div>SIRET {CONFIG.SIRET}</div>
              <div>{CONFIG.VAT_STATUS}</div>
              <div>{CONFIG.EMAIL}</div>
            </div>
          </div>
          <div>
            <h4>{FR ? "Catalogue" : "Catalogue"}</h4>
            {CATEGORY_ORDER.slice(0, 5).map(c => <button key={c} onClick={() => go("products", c)}>{tp(lang, c)}</button>)}
            <button onClick={() => go("products", "All")}>{FR ? "Tout le catalogue" : "Full catalogue"}</button>
          </div>
          <div>
            <h4>Novalyx</h4>
            <button onClick={() => go("coa")}>{FR ? "Analyses" : "Analyses"}</button>
            <button onClick={() => go("about")}>{FR ? "Méthode" : "Method"}</button>
            <button onClick={() => go("shipping")}>{FR ? "Livraison" : "Shipping"}</button>
            <button onClick={() => go("faq")}>FAQ</button>
            <button onClick={() => go("ambassador")}>{FR ? "Ambassadeurs" : "Ambassadors"}</button>
            <button onClick={() => go("contact")}>Contact</button>
          </div>
          <div>
            <h4>{FR ? "Légal" : "Legal"}</h4>
            <button onClick={() => go("terms")}>{FR ? "Conditions générales" : "Terms & Conditions"}</button>
            <button onClick={() => go("privacy")}>{FR ? "Confidentialité" : "Privacy"}</button>
            <button onClick={() => go("disclaimer")}>{FR ? "Avertissement" : "Disclaimer"}</button>
            <button onClick={onCookies}>{FR ? "Gérer les cookies" : "Manage cookies"}</button>
          </div>
        </div>
        <div className="foot-legal">
          <span>© 2026 {CONFIG.BUSINESS_NAME}</span>
          <span>{FR ? "Paiement sécurisé par Stripe · Visa · Mastercard · Apple Pay" : "Secure payment by Stripe · Visa · Mastercard · Apple Pay"}</span>
          <span>{FR ? "Usage recherche uniquement" : "Research use only"}</span>
        </div>
      </div>
    </footer>
  );
};

/* ─── PRODUCT CARD ───────────────────────────────────────── */

/* ─── PRODUCT PHOTOS (fichiers dans public/products/) ─── */
const PHOTO_BASE = "/products/";
const photoDose = (s = "") => {
  let m;
  if ((m = s.match(/^(\d+(?:\.\d+)?)mg total \(BPC(\d+)\+TB(\d+)\)/))) return `${m[2]}-${m[3]}-mg`;
  if ((m = s.match(/^(\d+(?:\.\d+)?)mg\+(\d+(?:\.\d+)?)mg/))) return `${m[1]}-${m[2]}-mg`.replace(/\./g, "-");
  if ((m = s.match(/^(\d+(?:\.\d+)?)mg/))) return `${m[1]}-mg`.replace(/\./g, "-");
  if (/^3ml/.test(s)) return "3-ml";
  return null;
};
const photoFor = (id, size) => { const d = photoDose(size); return d ? `${PHOTO_BASE}${id}-${d}.jpg` : null; };
const ProductPhoto = ({ p, size, h = 180 }) => {
  const src = photoFor(p.id, size);
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [src]);
  if (!src || failed) return <Vial name={p.name} size={size} tone={CAT_TONE[p.category]} h={h} />;
  return (
    <img src={src} alt={`${p.name} ${size || ""} — Novalyx Research`} loading="lazy" decoding="async"
      width={h} height={h} onError={() => setFailed(true)}
      style={{ width: h, height: h, objectFit: "cover", borderRadius: 14, display: "block" }} />
  );
};

const ProductCard = ({ p, cur, onClick, lang }) => {
  const FR = lang === "FR";
  const min = Math.min(...p.variants.map(v => v.price));
  const coa = COAS[p.id];
  const main = p.variants[p.variants.length - 1];
  return (
    <button className="pcard" onClick={onClick}>
      <div className="pcard-top">
        <span className="tag">{tp(lang, p.category)}</span>
        {coa ? <span className="chip-coa">COA {coa.size}{coa.purity ? ` · ${pct(coa.purity, lang)}` : ""}</span> : !isAvail(p) && <span className="chip-soon">{FR ? "Bientôt" : "Soon"}</span>}
      </div>
      <div className="pcard-vial"><ProductPhoto p={p} size={main.size} h={190} /></div>
      <div className="pcard-name">{p.name}</div>
      <div className="pcard-sizes">{p.variants.map(v => v.size).join(" · ")} · {FR ? "lyophilisé" : "lyophilised"}</div>
      <div className="pcard-foot">
        <div>
          <div className="tag" style={{ marginBottom: 2 }}>{isAvail(p) ? (FR ? "À partir de" : "From") : (FR ? "Bientôt disponible" : "Coming soon")}</div>
          <div className="pcard-price">{price(min, cur, lang)}</div>
        </div>
        <span className="link">{FR ? "Détails" : "Details"}</span>
      </div>
    </button>
  );
};

/* ─── BLOC COA (fiche + accueil) ─────────────────────────── */
const CoaBlock = ({ coa, lang, compact = false }) => {
  const FR = lang === "FR";
  return (
    <div className="coa-box">
      <div className="eyebrow" style={{ color: "var(--green)", marginBottom: 10 }}>
        {FR ? "Analyse indépendante · Janoshik" : "Independent analysis · Janoshik"}
      </div>
      <div className="spec"><span>{FR ? "Pureté HPLC" : "HPLC purity"}</span><span>{pct(coa.purity, lang)}</span></div>
      <div className="spec"><span>{FR ? "Quantité mesurée" : "Measured content"}</span><span>{num(coa.measured, lang)}</span></div>
      <div className="spec"><span>{FR ? "Échantillon (nom du rapport)" : "Sample (as on report)"}</span><span>{coa.sample}</span></div>
      {coa.batch && <div className="spec"><span>{FR ? "Lot" : "Batch"}</span><span>{coa.batch}</span></div>}
      <div className="spec"><span>{FR ? "N° de tâche" : "Task no."}</span><span>#{coa.task}</span></div>
      <div className="spec"><span>{FR ? "Date d'analyse" : "Analysis date"}</span><span>{fmtDate(coa.date, lang)}</span></div>
      <div className="spec" style={{ borderBottom: "none" }}><span>{FR ? "Clé de vérification" : "Verification key"}</span><span>{coa.key}</span></div>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 12 }}>
        <a className="link" href={coaLink(coa)} target="_blank" rel="noopener noreferrer">{FR ? "Ouvrir le rapport (Janoshik)" : "Open report (Janoshik)"}</a>
        {coa.file && <a className="link" href={coa.file} target="_blank" rel="noopener noreferrer">{FR ? "Télécharger le rapport" : "Download report"}</a>}
      </div>
      <p className="muted" style={{ fontSize: 12, marginTop: 12, lineHeight: 1.6 }}>
        {FR ? `Analyse commandée par Novalyx sur son lot de ${coa.size}. Le rapport original est consultable à tout moment sur le site de Janoshik.` : `Analysis ordered by Novalyx on its ${coa.size} batch. The original report can be viewed at any time on Janoshik's website.`}
      </p>
    </div>
  );
};

/* ─── PRODUCT MODAL ──────────────────────────────────────── */
const ProductModal = ({ p, cur, onAdd, onClose, lang }) => {
  const FR = lang === "FR";
  const [qty, setQty] = useState(1);
  const [idx, setIdx] = useState(Math.max(0, p.variants.findIndex(x => COAS[p.id] && x.size === COAS[p.id].size)));
  const v = p.variants[idx];
  const coa = coaFor(p, v.size);
  const coaOther = !coa && COAS[p.id];
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k); document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-label={p.name}>
        <div className="modal-grid">
          <div className="modal-vial" style={{ flexDirection: "column", gap: 10 }}><ProductPhoto p={p} size={v.size} h={300} /><div style={{ fontSize: 11.5, lineHeight: 1.45, color: "var(--mute)", textAlign: "center", maxWidth: 300 }}>{lang === "FR" ? "Visuel du produit. Le numéro de lot figure sur chaque flacon livré, avec son rapport d\u2019analyse." : "Product visual. The batch number is printed on every vial shipped, with its analysis report."}</div></div>
          <div className="modal-body">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <span className="tag">{tp(lang, p.category)} · {tp(lang, p.tag)}</span>
              <button className="x" onClick={onClose} aria-label="Fermer">✕</button>
            </div>
            <h2 className="h2" style={{ fontSize: 40, margin: "6px 0 14px" }}>{p.name}</h2>
            <p style={{ color: "var(--ink2)", fontSize: 14.5, lineHeight: 1.75 }}>{FR && p.desc_fr ? p.desc_fr : p.desc}</p>

            <div className="eyebrow" style={{ margin: "26px 0 10px" }}>{FR ? "Conditionnement" : "Size"}</div>
            <div className="sizes">
              {p.variants.map((x, i) => (
                <button key={x.size} className={`size ${i === idx ? "on" : ""}`} onClick={() => setIdx(i)}>
                  <div className="mono" style={{ fontSize: 12, color: "var(--mute)" }}>{x.size}</div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 21 }}>{price(x.price, cur, lang)}</div>
                </button>
              ))}
            </div>

            {coa && <CoaBlock coa={coa} lang={lang} compact />}
            {coaOther && (
              <p className="mono" style={{ fontSize: 11.5, color: "var(--green)", margin: "18px 0 0" }}>
                {FR ? `Rapport d'analyse disponible pour le ${coaOther.size} — sélectionnez-le pour l'afficher.` : `Analysis report available for the ${coaOther.size} — select it to view.`}
              </p>
            )}

            <div style={{ marginTop: coa ? 0 : 22 }}>
              <div className="spec"><span>{FR ? "Référence de lot" : "Batch reference"}</span><span>{v.batch}</span></div>
              {p.commonSpecs.map(s => (
                <div className="spec" key={s.label}><span>{tp(lang, s.label)}</span><span>{tp(lang, s.value)}</span></div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 26, flexWrap: "wrap" }}>
              {isAvail(p) && <div className="qty">
                <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="-">−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(qty + 1)} aria-label="+">+</button>
              </div>}
              {isAvail(p) ? (
                <button className="btn btn-ink" style={{ flex: 1 }} onClick={() => { onAdd(p, v, qty); onClose(); }}>
                  {FR ? "Ajouter au panier" : "Add to cart"} — {price(v.price * qty, cur, lang)}
                </button>
              ) : (
                <a className="btn btn-line" style={{ flex: 1 }} href={`mailto:${CONFIG.EMAIL}?subject=${encodeURIComponent((FR ? "Disponibilité " : "Availability ") + p.name + " " + v.size)}`}>
                  {FR ? "Bientôt disponible — me prévenir" : "Coming soon — notify me"}
                </a>
              )}
            </div>
            <p className="muted" style={{ fontSize: 11.5, marginTop: 14, lineHeight: 1.6 }}>
              {FR ? "Destiné exclusivement à la recherche in-vitro en laboratoire. Pas pour usage humain ou vétérinaire." : "For in-vitro laboratory research only. Not for human or veterinary use."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── CART ───────────────────────────────────────────────── */
const Cart = ({ cart, cur, onClose, onRemove, lang }) => {
  const FR = lang === "FR";
  const [ok1, setOk1] = useState(false);
  const [ok2, setOk2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bankRef, setBankRef] = useState(null);
  const [copied, setCopied] = useState("");
  const [zone, setZone] = useState("FR");
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const ready = ok1 && ok2 && !loading;
  // Virement : le montant est toujours en euros (compte en EUR) ; la livraison est confirmée par email
  const eur = (n) => price(n, "EUR", lang);
  const openBank = () => setBankRef("NVX-" + Math.random().toString(36).slice(2, 8).toUpperCase());
  const copy = (label, text) => { try { navigator.clipboard.writeText(text); setCopied(label); setTimeout(() => setCopied(""), 1500); } catch (e) {} };
  const shipEst = cart.length === 1 ? shipCost(cart[0], zone) : null;
  const zoneRow = SHIP_ZONES.find(z => z[0] === zone) || SHIP_ZONES[0];
  const mailHref = !bankRef ? "#" : "mailto:" + CONFIG.EMAIL + "?subject=" + encodeURIComponent((FR ? "Commande par virement — " : "Bank transfer order — ") + bankRef) + "&body=" + encodeURIComponent([
    FR ? "Bonjour," : "Hello,", "",
    FR ? "Je souhaite régler ma commande par virement bancaire." : "I would like to pay for my order by bank transfer.", "",
    (FR ? "Référence : " : "Reference: ") + bankRef, "",
    FR ? "Articles :" : "Items:",
    ...cart.map(i => "- " + i.name + " " + i.size + " x" + i.qty + " : " + eur(i.price * i.qty)),
    (FR ? "Sous-total articles : " : "Items subtotal: ") + eur(total),
    (FR ? "Zone de livraison : " : "Delivery zone: ") + (FR ? zoneRow[1] : zoneRow[2]),
    shipEst !== null ? (FR ? "Livraison estimée : " : "Estimated shipping: ") + (shipEst === 0 ? (FR ? "offerte" : "free") : eur(shipEst)) : "", "",
    FR ? "Nom :" : "Name:",
    FR ? "Adresse de livraison :" : "Delivery address:",
    FR ? "Pays :" : "Country:",
    FR ? "Téléphone :" : "Phone:", "",
    FR ? "Merci de me confirmer le montant total, livraison incluse." : "Please confirm the total amount, delivery included.", "",
    FR ? "Je confirme que cette commande est strictement destinée à la recherche en laboratoire." : "I confirm this order is strictly for laboratory research purposes only.",
  ].join("\n"));
  const checkout = async () => { setLoading(true); try { await goToStripeCheckout(cart, zone); } finally { setLoading(false); } };
  return (
    <div className="drawer" onClick={onClose}>
      <div className="drawer-in" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div className="h3">{FR ? "Panier" : "Cart"} <span className="mono muted" style={{ fontSize: 13 }}>({count})</span></div>
          <button className="x" onClick={onClose} aria-label="Fermer">✕</button>
        </div>
        {cart.length === 0 ? (
          <div className="muted" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
            {FR ? "Votre panier est vide." : "Your cart is empty."}
          </div>
        ) : (
          <>
            <div style={{ flex: 1 }}>
              {cart.map(i => (
                <div key={i.lineId} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "14px 0", borderBottom: "1px solid var(--line)" }}>
                  <div>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 19 }}>{i.name}</div>
                    <div className="mono muted" style={{ fontSize: 11.5 }}>{i.size} · {FR ? "Qté" : "Qty"} {i.qty} · {price(i.price * i.qty, cur, lang)}</div>
                  </div>
                  <button className="x" style={{ width: 28, height: 28, fontSize: 16 }} onClick={() => onRemove(i.lineId)} aria-label="Retirer">✕</button>
                </div>
              ))}
            </div>
            <div style={{ paddingTop: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                <span className="eyebrow">{FR ? "Sous-total" : "Subtotal"}</span>
                <span style={{ fontFamily: "var(--serif)", fontSize: 28 }}>{price(total, cur, lang)}</span>
              </div>
              <div className="field" style={{ marginBottom: 10 }}>
                <label>{FR ? "Pays de livraison" : "Delivery country"}</label>
                <select value={zone} onChange={e => setZone(e.target.value)}>
                  {SHIP_ZONES.map(z => <option key={z[0]} value={z[0]}>{FR ? z[1] : z[2]}</option>)}
                </select>
              </div>
              <p className="muted" style={{ fontSize: 12, marginBottom: 16 }}>
                {FR ? "Expédié sous 24 h · livraison en 2 à 3 jours maximum en France" : "Shipped within 24 h · delivery in 2–3 days maximum in France"}
                {shipEst !== null && <> · <b>{FR ? "Livraison : " : "Shipping: "}{shipEst === 0 ? (FR ? "offerte" : "free") : eur(shipEst)}</b></>}
              </p>
              <label className="check"><input type="checkbox" checked={ok1} onChange={e => setOk1(e.target.checked)} /><span>{t(lang, "cart_confirm")}</span></label>
              <label className="check"><input type="checkbox" checked={ok2} onChange={e => setOk2(e.target.checked)} /><span>{t(lang, "intl_confirm")}</span></label>
              <button className="btn btn-ink" style={{ width: "100%", marginTop: 10 }} disabled={!ready} onClick={checkout}>
                {loading ? (FR ? "Redirection…" : "Redirecting…") : (FR ? "Passer au paiement" : "Proceed to checkout")}
              </button>
              <p className="mono muted" style={{ fontSize: 10.5, textAlign: "center", marginTop: 12, letterSpacing: ".05em" }}>
                {FR ? "PAIEMENT SÉCURISÉ PAR STRIPE" : "SECURE PAYMENT BY STRIPE"}
              </p>
              <div className="mono muted" style={{ textAlign: "center", margin: "12px 0 10px", fontSize: 11 }}>{FR ? "— ou —" : "— or —"}</div>
              <button className="btn btn-line" style={{ width: "100%" }} disabled={!(ok1 && ok2)} onClick={openBank}>
                {FR ? "Payer par virement bancaire" : "Pay by bank transfer"}
              </button>
              {bankRef && (
                <div className="sheet" style={{ marginTop: 14, padding: "20px 18px" }}>
                  <div className="eyebrow" style={{ marginBottom: 6 }}>{FR ? "Virement bancaire" : "Bank transfer"}</div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 22, marginBottom: 10 }}>{CONFIG.BANK.trading}</div>
                  <ol style={{ paddingLeft: 18, fontSize: 12.5, lineHeight: 1.65, color: "var(--ink2)", marginBottom: 14 }}>
                    <li>{FR ? "Envoyez-nous votre commande par email (bouton ci-dessous) : nous confirmons le montant total, livraison incluse." : "Send us your order by email (button below): we confirm the total amount, delivery included."}</li>
                    <li>{FR ? "Effectuez le virement en euros en indiquant la référence ci-dessous dans le libellé." : "Make the transfer in euros, quoting the reference below in the payment label."}</li>
                    <li>{FR ? "Votre commande est expédiée à réception du virement." : "Your order is shipped once the transfer is received."}</li>
                  </ol>
                  <div className="spec"><span>{FR ? "Articles" : "Items"}</span><span>{eur(total)}</span></div>
                  <div className="spec"><span>{FR ? "Référence" : "Reference"}</span><span>{bankRef} <button className="link" onClick={() => copy("ref", bankRef)}>{copied === "ref" ? "✓" : (FR ? "Copier" : "Copy")}</button></span></div>
                  <div className="spec"><span>IBAN</span><span style={{ fontSize: 12 }}>{CONFIG.BANK.iban} <button className="link" onClick={() => copy("iban", CONFIG.BANK.iban.replace(/ /g, ""))}>{copied === "iban" ? "✓" : (FR ? "Copier" : "Copy")}</button></span></div>
                  <div className="spec"><span>BIC</span><span>{CONFIG.BANK.bic} <button className="link" onClick={() => copy("bic", CONFIG.BANK.bic)}>{copied === "bic" ? "✓" : (FR ? "Copier" : "Copy")}</button></span></div>
                  <div className="spec" style={{ borderBottom: "none" }}><span>{FR ? "Titulaire légal" : "Legal holder"}</span><span style={{ fontSize: 12 }}>{CONFIG.BANK.holder}</span></div>
                  <p className="muted" style={{ fontSize: 10.5, margin: "6px 0 12px", lineHeight: 1.5 }}>
                    {FR ? "Le titulaire légal doit correspondre au nom affiché par votre banque (vérification du bénéficiaire)." : "The legal holder must match the name shown by your bank (beneficiary verification)."}
                  </p>
                  <a className="btn btn-ink" style={{ width: "100%" }} href={mailHref}>{FR ? "Envoyer ma commande par email" : "Send my order by email"}</a>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   PAGES
═══════════════════════════════════════════════════════════ */
const SecHead = ({ n, label, title, children }) => (
  <div className="sec-head">
    <div className="eyebrow"><b>§ {n}</b> — {label}</div>
    <div>
      <h2 className="h2">{title}</h2>
      {children && <p className="lead" style={{ marginTop: 16 }}>{children}</p>}
    </div>
  </div>
);

const Home = ({ go, cur, openProduct, lang }) => {
  const FR = lang === "FR";
  const hero = COAS.retatrutide;
  const withCoa = PRODUCTS.filter(p => COAS[p.id]);
  const cats = CATEGORY_ORDER.filter(c => PRODUCTS.some(p => p.category === c));
  return (
    <div>
      {/* HERO */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="eyebrow" style={{ marginBottom: 22 }}>Novalyx Research — Paris</div>
            <h1 className="display">
              {FR ? <>Des composés de recherche <em>analysés</em>, documentés, vérifiables.</> : <>Research compounds, <em>analysed</em>, documented, verifiable.</>}
            </h1>
            <p className="lead" style={{ marginTop: 26 }}>
              {FR ? "Peptides lyophilisés destinés aux laboratoires et aux chercheurs. Les analyses sont réalisées par un laboratoire indépendant et chaque rapport se vérifie publiquement, avec sa clé." : "Lyophilised peptides for laboratories and researchers. Analyses are performed by an independent laboratory, and every report can be verified publicly with its key."}
            </p>
            <div className="hero-actions">
              <button className="btn btn-ink" onClick={() => go("products", "All")}>{FR ? "Voir le catalogue" : "View catalogue"} →</button>
              <button className="btn btn-line" onClick={() => go("coa")}>{FR ? "Consulter les analyses" : "See the analyses"}</button>
            </div>
          </div>
          <div className="sheet">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div>
                <div className="eyebrow">{FR ? "Fiche d'analyse" : "Analysis sheet"}</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 28, marginTop: 6 }}>GLP-3RT 5 mg</div>
                <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{FR ? "Réf. rapport" : "Report ref."} : {hero.sample}</div>
              </div>
              <div className="mono muted" style={{ fontSize: 11, textAlign: "right" }}>#{hero.task}</div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: "22px 0 8px" }}>
              <span className="big-num">{hero.purity ? num(hero.purity, lang) : "—"}</span>
              <span className="mono" style={{ fontSize: 14 }}>% {FR ? "pureté HPLC" : "HPLC purity"}</span>
            </div>
            <div className="sheet-row"><span>{FR ? "Quantité mesurée" : "Measured content"}</span><span>{num(hero.measured, lang)} / 5 mg</span></div>
            <div className="sheet-row"><span>{FR ? "Laboratoire" : "Laboratory"}</span><span>Janoshik Analytical</span></div>
            <div className="sheet-row"><span>{FR ? "Date" : "Date"}</span><span>{fmtDate(hero.date, lang)}</span></div>
            <div className="sheet-row"><span>{FR ? "Clé" : "Key"}</span><span>{hero.key}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
              <a className="link" href={coaLink(hero)} target="_blank" rel="noopener noreferrer">{FR ? "Voir le rapport original" : "View original report"}</a>
              <span className="mono muted" style={{ fontSize: 10.5 }}>{FR ? "LOT NOVALYX" : "NOVALYX BATCH"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* FACTS */}
      <div className="wrap">
        <div className="facts">
          {[
            [FR ? "Entreprise" : "Company", FR ? "Française · SIRET 898 509 369" : "French · SIRET 898 509 369"],
            [FR ? "Analyses" : "Analyses", FR ? "Janoshik, clé publique" : "Janoshik, public key"],
            [FR ? "Paiement" : "Payment", FR ? "Stripe, carte bancaire" : "Stripe, card"],
            [FR ? "Expédition" : "Shipping", FR ? "Sous 24 h, suivie, emballage neutre" : "Within 24 h, tracked, plain packaging"],
          ].map(([k, v]) => <div className="fact" key={k}><div className="fact-k">{k}</div><div className="fact-v">{v}</div></div>)}
        </div>
      </div>

      {/* METHOD */}
      <section className="sec">
        <div className="wrap">
          <SecHead n="01" label={FR ? "Méthode" : "Method"} title={FR ? "Quatre étapes, aucune zone d'ombre." : "Four steps, nothing hidden."}>
            {FR ? "La confiance ne se décrète pas, elle se documente. Voici exactement ce qui se passe entre la production et votre laboratoire." : "Trust isn't claimed, it's documented. Here is exactly what happens between production and your laboratory."}
          </SecHead>
          <div className="steps">
            {(FR ? [
              ["01", "Sélection du lot", "Chaque lot est commandé en quantité adaptée, puis contrôlé à réception."],
              ["02", "Analyse indépendante", "Un échantillon est envoyé à Janoshik Analytical : identité, pureté HPLC, quantité mesurée."],
              ["03", "Publication", "Le rapport et sa clé de vérification sont publiés. Tout le monde peut le contrôler."],
              ["04", "Expédition", "Flacons lyophilisés, étiquetés, scellés. Envoi suivi, rapport du lot joint."],
            ] : [
              ["01", "Batch selection", "Each batch is ordered in suitable quantity, then checked on arrival."],
              ["02", "Independent analysis", "A sample goes to Janoshik Analytical: identity, HPLC purity, measured content."],
              ["03", "Publication", "The report and its verification key are published. Anyone can check it."],
              ["04", "Dispatch", "Lyophilised, labelled, sealed vials. Tracked shipping, batch report included."],
            ]).map(([n, tt, d]) => (
              <div className="step" key={n}><div className="step-n">{n}</div><div className="h3">{tt}</div><p>{d}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* ANALYSED PRODUCTS */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <SecHead n="02" label={FR ? "Analysés" : "Analysed"} title={FR ? "Analysé et publié." : "Analysed and published."} />
          <div className="grid">
            {withCoa.map(p => <ProductCard key={p.id} p={p} cur={cur} lang={lang} onClick={() => openProduct(p)} />)}
          </div>
        </div>
      </section>

      {/* INDEX */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <SecHead n="03" label={FR ? "Index" : "Index"} title={FR ? `${PRODUCTS.length} composés, ${cats.length} domaines de recherche.` : `${PRODUCTS.length} compounds, ${cats.length} research areas.`} />
          <div className="rule">
            {cats.map((c, i) => {
              const n = PRODUCTS.filter(p => p.category === c).length;
              return (
                <button key={c} className="index-row" onClick={() => go("products", c)}>
                  <span className="mono muted" style={{ fontSize: 12 }}>{String(i + 1).padStart(2, "0")}</span>
                  <span><span className="index-name">{tp(lang, c)}</span></span>
                  <span className="index-desc" style={{ gridColumn: "auto" }}>{CAT_DESC[c] ? CAT_DESC[c][FR ? 0 : 1] : ""}</span>
                  <span className="mono muted" style={{ fontSize: 12 }}>{n} →</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* B2B */}
      <section className="band sec">
        <div className="wrap" style={{ display: "grid", gap: 30 }}>
          <div className="eyebrow">§ 04 — {FR ? "Professionnels" : "Professionals"}</div>
          <h2 className="h2" style={{ maxWidth: 760 }}>{FR ? "Laboratoires et revendeurs : tarifs dégressifs, rapports inclus." : "Laboratories and resellers: volume pricing, reports included."}</h2>
          <p className="lead">{FR ? "Pour les commandes en volume, les approvisionnements réguliers ou une demande de document spécifique, écrivez-nous. Réponse sous un jour ouvré." : "For volume orders, recurring supply or a specific document request, write to us. Reply within one business day."}</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a className="btn btn-light" style={{ background: "#fff", color: "var(--ink)" }} href={`mailto:${CONFIG.EMAIL}?subject=${encodeURIComponent("Demande tarifs professionnels - Novalyx Research")}`}>{FR ? "Demander un tarif" : "Request pricing"}</a>
            <a className="btn btn-light" href="/novalyx-catalogue.pdf" download>{FR ? "Catalogue PDF" : "PDF catalogue"}</a>
          </div>
        </div>
      </section>
    </div>
  );
};

const ProductsPage = ({ cur, openProduct, initialFilter, setProductFilter, lang }) => {
  const FR = lang === "FR";
  const [filter, setFilter] = useState(initialFilter || "All");
  useEffect(() => { if (initialFilter) setFilter(initialFilter); }, [initialFilter]);
  const change = (f) => { setFilter(f); setProductFilter && setProductFilter(f); };
  const cats = CATEGORY_ORDER.filter(c => PRODUCTS.some(p => p.category === c));
  const list = filter === "All" ? cats.flatMap(c => PRODUCTS.filter(p => p.category === c)) : PRODUCTS.filter(p => p.category === filter);
  return (
    <section className="sec" style={{ paddingTop: 56 }}>
      <div className="wrap">
        <div className="eyebrow" style={{ marginBottom: 14 }}>{FR ? "Catalogue de recherche" : "Research catalogue"}</div>
        <h1 className="display" style={{ fontSize: "clamp(38px,6vw,64px)", marginBottom: 18 }}>{filter === "All" ? (FR ? "Tous les composés" : "All compounds") : tp(lang, filter)}</h1>
        <p className="lead" style={{ marginBottom: 36 }}>{FR ? "Peptides lyophilisés, fournis exclusivement pour la recherche in-vitro. Les rapports d'analyse publiés sont signalés par la mention COA." : "Lyophilised peptides supplied exclusively for in-vitro research. Published analysis reports are marked COA."}</p>
        <div className="filters">
          <button className={`fchip ${filter === "All" ? "on" : ""}`} onClick={() => change("All")}>{FR ? "Tout" : "All"} ({PRODUCTS.length})</button>
          {cats.map(c => (
            <button key={c} className={`fchip ${filter === c ? "on" : ""}`} onClick={() => change(c)}>
              {tp(lang, c)} ({PRODUCTS.filter(p => p.category === c).length})
            </button>
          ))}
        </div>
        <div className="grid">
          {list.map(p => <ProductCard key={p.id} p={p} cur={cur} lang={lang} onClick={() => openProduct(p)} />)}
        </div>
      </div>
    </section>
  );
};
const LEARNING_DATA = [
  { id:"bpc157", name:"BPC-157", cat:{EN:"Regenerative research",FR:"Recherche régénérative"},
    en:"A synthetic peptide fragment studied in laboratory models for its role in tissue-repair and angiogenesis research. Frequently used as a reference compound in tissue-repair assays.",
    fr:"Fragment peptidique synthétique étudié en modèles de laboratoire pour son rôle dans la recherche sur la réparation tissulaire et l'angiogenèse. Fréquemment utilisé comme composé de référence dans les essais de réparation tissulaire." },
  { id:"tb500", name:"TB-500", cat:{EN:"Regenerative research",FR:"Recherche régénérative"},
    en:"A synthetic version of a naturally occurring peptide region studied for cell-migration and actin-regulation research in controlled settings.",
    fr:"Version synthétique d'une région peptidique naturelle, étudiée pour la recherche sur la migration cellulaire et la régulation de l'actine en milieu contrôlé." },
  { id:"ghk", name:"GHK-Cu (GHK-Cuivre)", cat:{EN:"Regenerative research",FR:"Recherche régénérative"},
    en:"A copper-binding tripeptide investigated in skin-biology and extracellular-matrix research models.",
    fr:"Tripeptide liant le cuivre, étudié dans les modèles de recherche en biologie cutanée et sur la matrice extracellulaire." },
  { id:"retatrutide", name:"GLP-3RT", cat:{EN:"Metabolic research",FR:"Recherche métabolique"},
    en:"A multi-receptor research compound studied in metabolic-pathway investigations. Of interest in laboratory studies examining receptor signalling.",
    fr:"Composé de recherche multi-récepteurs étudié dans les investigations sur les voies métaboliques. D'intérêt dans les études de laboratoire examinant la signalisation des récepteurs." },
  { id:"tirzepatide", name:"Tirzepatide", cat:{EN:"Metabolic research",FR:"Recherche métabolique"},
    en:"A dual-receptor research peptide used as a reference compound in metabolic signalling studies.",
    fr:"Peptide de recherche à double récepteur utilisé comme composé de référence dans les études de signalisation métabolique." },
  { id:"semaglutide", name:"Semaglutide", cat:{EN:"Metabolic research",FR:"Recherche métabolique"},
    en:"A research peptide widely referenced in receptor-binding and metabolic-pathway laboratory studies.",
    fr:"Peptide de recherche largement référencé dans les études de laboratoire sur la liaison aux récepteurs et les voies métaboliques." },
  { id:"nad", name:"NAD+", cat:{EN:"Longevity research",FR:"Recherche longévité"},
    en:"A coenzyme central to cellular-energy and mitochondrial research, used in a wide range of biochemical assays.",
    fr:"Coenzyme central de la recherche sur l'énergie cellulaire et les mitochondries, utilisé dans de nombreux essais biochimiques." },
  { id:"epitalon", name:"Epitalon", cat:{EN:"Longevity research",FR:"Recherche longévité"},
    en:"A synthetic tetrapeptide studied in telomere-biology and cellular-ageing research models.",
    fr:"Tétrapeptide synthétique étudié dans les modèles de recherche sur la biologie des télomères et le vieillissement cellulaire." },
  { id:"motsc", name:"MOTS-c", cat:{EN:"Longevity research",FR:"Recherche longévité"},
    en:"A mitochondrial-derived peptide investigated in metabolic and cellular-energy research.",
    fr:"Peptide d'origine mitochondriale étudié dans la recherche métabolique et sur l'énergie cellulaire." },
  { id:"ipamorelin", name:"Ipamorelin", cat:{EN:"GH research",FR:"Recherche hormone de croissance"},
    en:"A research peptide referenced in growth-hormone secretagogue and receptor-signalling studies.",
    fr:"Peptide de recherche référencé dans les études sur les sécrétagogues de l'hormone de croissance et la signalisation des récepteurs." },
  { id:"thymosinalpha1", name:"Thymosin Alpha-1", cat:{EN:"Immune research",FR:"Recherche immunitaire"},
    en:"A peptide studied in immune-modulation and T-cell research models.",
    fr:"Peptide étudié dans les modèles de recherche sur la modulation immunitaire et les lymphocytes T." },
  { id:"semax", name:"Semax", cat:{EN:"Cognitive research",FR:"Recherche cognitive"},
    en:"A synthetic peptide investigated in neuromodulation and neuroprotection research.",
    fr:"Peptide synthétique étudié dans la recherche sur la neuromodulation et la neuroprotection." },
];


/* ─── ANALYSES (COA) ─────────────────────────────────────── */
const COAPage = ({ lang, openProduct }) => {
  const FR = lang === "FR";
  const withCoa = PRODUCTS.filter(p => COAS[p.id]);
  const pending = CATEGORY_ORDER.flatMap(c => PRODUCTS.filter(p => p.category === c && !COAS[p.id]));
  return (
    <section className="sec" style={{ paddingTop: 56 }}>
      <div className="wrap">
        <div className="eyebrow" style={{ marginBottom: 14 }}>{FR ? "Transparence" : "Transparency"}</div>
        <h1 className="display" style={{ fontSize: "clamp(38px,6vw,64px)", marginBottom: 18 }}>{FR ? "Analyses publiées" : "Published analyses"}</h1>
        <p className="lead">{FR ? "Chaque rapport ci-dessous a été émis par Janoshik Analytical (République tchèque). Chaque lien ouvre le rapport original sur le site de Janoshik : il ne peut pas être modifié." : "Each report below was issued by Janoshik Analytical (Czech Republic). Each link opens the original report on Janoshik's website: it cannot be altered."}</p>

        <div className="rule" style={{ marginTop: 44 }}>
          {withCoa.map(p => {
            const c = COAS[p.id];
            return (
              <div className="coa-row" key={p.id}>
                <div>
                  <div className="coa-label">{tp(lang, p.category)}</div>
                  <button style={{ fontFamily: "var(--serif)", fontSize: 26, textAlign: "left" }} onClick={() => openProduct(p)}>{p.name} {c.size.replace("mg", " mg")}</button>
                  <div className="mono muted" style={{ fontSize: 11.5 }}>{FR ? "Nom sur le rapport" : "Name on report"} : {c.sample}</div>
                </div>
                <div><div className="coa-label">{FR ? "Pureté HPLC" : "HPLC purity"}</div><div className="mono">{pct(c.purity, lang)}</div></div>
                <div><div className="coa-label">{FR ? "Mesuré" : "Measured"}</div><div className="mono">{num(c.measured, lang)}</div></div>
                <div><div className="coa-label">{FR ? "Tâche · clé" : "Task · key"}</div><div className="mono" style={{ fontSize: 13 }}>#{c.task} · {c.key}</div></div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <a className="link" href={coaLink(c)} target="_blank" rel="noopener noreferrer">{FR ? "Voir le rapport" : "View report"}</a>
                  {c.file && <a className="link" href={c.file} target="_blank" rel="noopener noreferrer">PDF</a>}
                </div>
              </div>
            );
          })}
        </div>
        <p className="muted" style={{ fontSize: 13, marginTop: 20, maxWidth: 720, lineHeight: 1.7 }}>
          {FR ? "Analyses commandées par Novalyx sur ses propres lots. Chaque nouveau lot est analysé à son tour et son rapport est publié ici." : "Analyses ordered by Novalyx on its own batches. Each new batch is analysed in turn and its report is published here."}
        </p>

        <div style={{ marginTop: 72 }}>
          <div className="eyebrow" style={{ marginBottom: 18 }}>{FR ? "Analyse à venir" : "Analysis pending"} ({pending.length})</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {pending.map(p => (
              <button key={p.id} className="fchip" onClick={() => openProduct(p)}>{p.name}</button>
            ))}
          </div>
          <p className="muted" style={{ fontSize: 13, marginTop: 16, maxWidth: 680, lineHeight: 1.7 }}>
            {FR ? "Le rapport de ces composés sera publié dès l'analyse du premier lot. Pour toute question, écrivez-nous." : "Reports for these compounds will be published once the first batch has been analysed. Questions are welcome."}
          </p>
        </div>
      </div>
    </section>
  );
};

/* ─── FICHES COMPOSÉS ────────────────────────────────────── */
const LearningPage = ({ lang }) => {
  const FR = lang === "FR";
  return (
    <section className="sec" style={{ paddingTop: 56 }}>
      <div className="wrap">
        <div className="eyebrow" style={{ marginBottom: 14 }}>{FR ? "Ressources" : "Resources"}</div>
        <h1 className="display" style={{ fontSize: "clamp(38px,6vw,64px)", marginBottom: 18 }}>{FR ? "Fiches composés" : "Compound notes"}</h1>
        <p className="lead" style={{ marginBottom: 44 }}>{FR ? "Informations factuelles et strictement scientifiques sur les composés du catalogue. Aucune allégation de santé." : "Factual, strictly scientific information on catalogue compounds. No health claims."}</p>
        <div className="grid">
          {LEARNING_DATA.map(i => (
            <div key={i.id} className="pcard" style={{ cursor: "default" }}>
              <span className="tag">{FR ? i.cat.FR : i.cat.EN}</span>
              <div className="pcard-name" style={{ margin: "14px 0 10px" }}>{i.name}</div>
              <p style={{ fontSize: 14, color: "var(--ink2)", lineHeight: 1.7 }}>{FR ? i.fr : i.en}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── MÉTHODE / À PROPOS ─────────────────────────────────── */
const AboutPage = ({ go, lang }) => {
  const FR = lang === "FR";
  return (
    <section className="sec" style={{ paddingTop: 56 }}>
      <div className="wrap">
        <div className="eyebrow" style={{ marginBottom: 14 }}>{FR ? "Méthode" : "Method"}</div>
        <h1 className="display" style={{ fontSize: "clamp(38px,6.5vw,72px)", maxWidth: 900 }}>
          {FR ? <>La rigueur d'un laboratoire, <em>pas le bruit</em> d'une boutique.</> : <>The rigour of a laboratory, <em>not the noise</em> of a shop.</>}
        </h1>
        <div className="prose" style={{ marginTop: 44 }}>
          <p>{FR ? "Novalyx Research est une entreprise française, immatriculée à Paris. Elle fournit des peptides de recherche lyophilisés aux laboratoires, chercheurs et professionnels." : "Novalyx Research is a French company registered in Paris. It supplies lyophilised research peptides to laboratories, researchers and professionals."}</p>
          <p>{FR ? "Le secteur est rempli de promesses invérifiables. Notre parti pris est simple : ne rien affirmer qui ne puisse être contrôlé. Les analyses sont confiées à un laboratoire indépendant, et chaque rapport publié porte une clé qui permet à n'importe qui de le vérifier à la source." : "The sector is full of unverifiable promises. Our position is simple: claim nothing that cannot be checked. Analyses are entrusted to an independent laboratory, and every published report carries a key that lets anyone verify it at the source."}</p>
          <p>{FR ? "Nos produits ne sont ni des médicaments, ni des compléments alimentaires, ni des cosmétiques. Ils sont fournis exclusivement pour la recherche in-vitro." : "Our products are not medicines, dietary supplements or cosmetics. They are supplied exclusively for in-vitro research."}</p>
        </div>
        <div className="facts" style={{ marginTop: 48 }}>
          {[
            [FR ? "Siège" : "Registered", "Paris, France"],
            ["SIRET", CONFIG.SIRET],
            [FR ? "Laboratoire d'analyse" : "Testing lab", "Janoshik Analytical"],
            [FR ? "Contact" : "Contact", CONFIG.EMAIL],
          ].map(([k, v]) => <div className="fact" key={k}><div className="fact-k">{k}</div><div className="fact-v" style={{ wordBreak: "break-word" }}>{v}</div></div>)}
        </div>
        <div style={{ marginTop: 40, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="btn btn-ink" onClick={() => go("coa")}>{FR ? "Voir les analyses" : "See the analyses"}</button>
          <button className="btn btn-line" onClick={() => go("products", "All")}>{FR ? "Catalogue" : "Catalogue"}</button>
        </div>
      </div>
    </section>
  );
};

/* ─── FAQ ────────────────────────────────────────────────── */
const FAQPage = ({ lang }) => {
  const FR = lang === "FR";
  const [open, setOpen] = useState(0);
  const faqs = FR ? [
    ["Que sont les peptides de recherche ?", "Des substances fournies exclusivement pour la recherche scientifique en laboratoire. Elles ne sont destinées ni à l'usage humain ou vétérinaire, ni à la consommation, ni à un usage thérapeutique."],
    ["Qui peut commander chez Novalyx ?", "Les chercheurs et professionnels de laboratoire majeurs, agissant en conformité avec les lois applicables dans leur juridiction."],
    ["Qu'est-ce qu'un certificat d'analyse (COA) ?", "Un rapport émis par un laboratoire tiers qui confirme l'identité et la pureté d'un composé. Nos rapports Janoshik comportent une clé de vérification publique sur janoshik.com/verify."],
    ["Les rapports publiés correspondent-ils à mon flacon ?", "Chaque rapport indique le produit et le dosage analysés. Un rapport concerne un lot précis : chaque nouveau lot est analysé à son tour et publié ici."],
    ["Quel est le délai de livraison ?", "Les commandes sont expédiées sous 24 h après confirmation du paiement, puis livrées en 2 à 3 jours maximum en France. Comptez 3 à 5 jours ouvrés pour le reste de l'Union européenne, et davantage hors UE selon la destination. Un numéro de suivi vous est communiqué à l'expédition."],
    ["Comment payer ?", "Par carte bancaire via Stripe (vos données de paiement ne transitent jamais par nos serveurs), ou par virement bancaire, même pour une petite commande : choisissez « Payer par virement bancaire » dans le panier. La commande est expédiée à réception du virement."],
    ["Quelle est votre politique de retour ?", "Si un produit ne correspond pas aux spécifications de son rapport, contactez-nous sous 7 jours. Nous étudions chaque cas et organisons un remplacement ou un remboursement si nécessaire."],
    ["Comment stocker les composés ?", "Avant reconstitution : à sec, à température ambiante, à l'abri de la lumière, flacon scellé. Après reconstitution : entre 2 et 8 °C (réfrigérateur)."],
    ["Mes produits sont-ils légaux dans mon pays ?", "Le statut réglementaire varie selon les juridictions. Il vous appartient de vérifier la réglementation applicable avant de commander."],
  ] : [
    ["What are research peptides?", "Substances supplied exclusively for scientific laboratory research. They are not intended for human or veterinary use, consumption or therapeutic purposes."],
    ["Who can order from Novalyx?", "Adult researchers and laboratory professionals acting in compliance with the laws of their jurisdiction."],
    ["What is a certificate of analysis (COA)?", "A report issued by a third-party laboratory confirming a compound's identity and purity. Our Janoshik reports carry a public verification key at janoshik.com/verify."],
    ["Do the published reports match my vial?", "Each report states the product and strength analysed. A report covers one specific batch: each new batch is analysed in turn and published here."],
    ["How long is delivery?", "Orders are shipped within 24 h of payment confirmation, then delivered in 2–3 days maximum within France. Allow 3–5 business days for the rest of the EU, and longer outside the EU depending on destination. A tracking number is sent on dispatch."],
    ["How do I pay?", "By card through Stripe (your payment data never touches our servers), or by bank transfer, even for a small order: choose \"Pay by bank transfer\" in the cart. The order is shipped once the transfer is received."],
    ["What is your returns policy?", "If a product does not match its report specifications, contact us within 7 days. We review each case and arrange a replacement or refund where appropriate."],
    ["How should compounds be stored?", "Before reconstitution: dry, room temperature, away from light, vial sealed. After reconstitution: between 2 and 8 °C (refrigerated)."],
    ["Are these products legal in my country?", "Regulatory status varies by jurisdiction. It is your responsibility to check the applicable rules before ordering."],
  ];
  return (
    <section className="sec" style={{ paddingTop: 56 }}>
      <div className="wrap">
        <div className="eyebrow" style={{ marginBottom: 14 }}>Support</div>
        <h1 className="display" style={{ fontSize: "clamp(38px,6vw,64px)", marginBottom: 36 }}>{FR ? "Questions fréquentes" : "Frequently asked questions"}</h1>
        <div className="rule" style={{ maxWidth: 820 }}>
          {faqs.map(([q, a], i) => (
            <div key={i} style={{ borderBottom: "1px solid var(--line)" }}>
              <button className="faq-q" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                <span>{q}</span><span className="mono" style={{ color: "var(--green)" }}>{open === i ? "−" : "+"}</span>
              </button>
              {open === i && <div className="faq-a fade">{a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── CONTACT (envoie réellement via la messagerie) ──────── */
const AmbassadorPage = ({ lang }) => {
  const FR = lang === "FR";
  const [f, setF] = useState({ name: "", platform: "", handle: "", audience: "", message: "" });
  const [sent, setSent] = useState(false);
  const send = () => {
    if (!f.name || !f.handle) return;
    const body =
      (FR ? "Plateforme : " : "Platform: ") + (f.platform || "—") + "\n" +
      (FR ? "Pseudo/compte : " : "Handle: ") + f.handle + "\n" +
      (FR ? "Audience : " : "Audience: ") + (f.audience || "—") + "\n\n" +
      f.message + "\n\n— " + f.name;
    window.location = `mailto:${CONFIG.EMAIL}?subject=${encodeURIComponent(FR ? "Candidature ambassadeur — Novalyx Research" : "Ambassador application — Novalyx Research")}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };
  return (
    <section className="sec" style={{ paddingTop: 56 }}>
      <div className="wrap" style={{ display: "grid", gap: 48 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>{FR ? "Collaborations" : "Partnerships"}</div>
          <h1 className="display" style={{ fontSize: "clamp(38px,6vw,64px)", marginBottom: 18 }}>{FR ? "Programme Ambassadeurs" : "Ambassador Program"}</h1>
          <p className="lead">
            {FR
              ? "Vous créez du contenu autour de la recherche, des laboratoires ou du bien-être scientifique ? Novalyx propose un code personnel donnant une réduction à votre audience, et une commission sur les ventes générées."
              : "Do you create content around research, laboratories, or scientific wellness? Novalyx offers a personal code giving your audience a discount, and a commission on the sales it generates."}
          </p>
        </div>

        <div className="facts">
          {(FR ? [
            ["Comment ça marche", "Un code promo unique à votre nom, valable sur tout le catalogue."],
            ["Pour votre audience", "Une réduction immédiate à la commande."],
            ["Pour vous", "Une commission sur chaque commande passée avec votre code."],
            ["Suivi", "Un point mensuel par email sur les ventes générées."],
          ] : [
            ["How it works", "A unique promo code under your name, valid across the catalogue."],
            ["For your audience", "An instant discount at checkout."],
            ["For you", "A commission on every order placed with your code."],
            ["Tracking", "A monthly email recap of the sales your code generated."],
          ]).map(([k, v]) => <div className="fact" key={k}><div className="fact-k">{k}</div><div className="fact-v">{v}</div></div>)}
        </div>

        <div style={{ display: "grid", gap: 40 }} className="contact-grid">
          {sent ? (
            <div className="sheet"><div className="h3">{FR ? "Votre messagerie s'est ouverte." : "Your mail app has opened."}</div><p className="muted" style={{ marginTop: 8 }}>{FR ? `Envoyez la candidature depuis votre messagerie, ou écrivez directement à ${CONFIG.EMAIL}.` : `Send the application from your mail app, or write directly to ${CONFIG.EMAIL}.`}</p></div>
          ) : (
            <div style={{ display: "grid", gap: 16, maxWidth: 640 }}>
              <div className="field"><label>{FR ? "Nom" : "Name"}</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>
              <div className="field"><label>{FR ? "Plateforme (Instagram, TikTok, YouTube…)" : "Platform (Instagram, TikTok, YouTube…)"}</label><input value={f.platform} onChange={e => setF({ ...f, platform: e.target.value })} /></div>
              <div className="field"><label>{FR ? "Pseudo / lien du compte" : "Handle / account link"}</label><input value={f.handle} onChange={e => setF({ ...f, handle: e.target.value })} /></div>
              <div className="field"><label>{FR ? "Taille d'audience (optionnel)" : "Audience size (optional)"}</label><input value={f.audience} onChange={e => setF({ ...f, audience: e.target.value })} /></div>
              <div className="field"><label>{FR ? "Message" : "Message"}</label><textarea rows={5} value={f.message} onChange={e => setF({ ...f, message: e.target.value })} placeholder={FR ? "Parlez-nous de votre audience et de votre intérêt pour la recherche." : "Tell us about your audience and your interest in research."} /></div>
              <div><button className="btn btn-ink" onClick={send} disabled={!f.name || !f.handle}>{FR ? "Envoyer ma candidature" : "Send application"}</button></div>
            </div>
          )}
          <div className="sheet" style={{ maxWidth: 640 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>{FR ? "Conditions" : "Terms"}</div>
            <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.7 }}>
              {FR
                ? "Chaque candidature est étudiée individuellement. Le programme s'adresse aux créateurs de contenu scientifique, laboratoire et recherche. Comme l'ensemble du catalogue, toute communication doit rester dans le cadre de la recherche en laboratoire — usage recherche uniquement."
                : "Each application is reviewed individually. The program is aimed at creators covering scientific, laboratory and research content. As with the rest of the catalogue, all communication must stay within a laboratory-research framework — research use only."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const ContactPage = ({ lang }) => {
  const FR = lang === "FR";
  const [f, setF] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const send = () => {
    if (!f.name || !f.email || !f.message) return;
    const body = `${f.message}\n\n— ${f.name} (${f.email})`;
    window.location = `mailto:${CONFIG.EMAIL}?subject=${encodeURIComponent(f.subject || "Contact Novalyx Research")}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };
  return (
    <section className="sec" style={{ paddingTop: 56 }}>
      <div className="wrap" style={{ display: "grid", gap: 48 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Contact</div>
          <h1 className="display" style={{ fontSize: "clamp(38px,6vw,64px)", marginBottom: 18 }}>{FR ? "Écrivez-nous." : "Write to us."}</h1>
          <p className="lead">{FR ? "Produits, commandes, documents, tarifs professionnels : réponse sous un jour ouvré." : "Products, orders, documents, professional pricing: reply within one business day."}</p>
        </div>
        <div style={{ display: "grid", gap: 40 }} className="contact-grid">
          {sent ? (
            <div className="sheet"><div className="h3">{FR ? "Votre messagerie s'est ouverte." : "Your mail app has opened."}</div><p className="muted" style={{ marginTop: 8 }}>{FR ? `Envoyez le message depuis votre messagerie. Sinon, écrivez directement à ${CONFIG.EMAIL}.` : `Send the message from your mail app, or write directly to ${CONFIG.EMAIL}.`}</p></div>
          ) : (
            <div style={{ display: "grid", gap: 16, maxWidth: 640 }}>
              <div className="field"><label>{FR ? "Nom" : "Name"}</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>
              <div className="field"><label>Email</label><input type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></div>
              <div className="field"><label>{FR ? "Objet" : "Subject"}</label><input value={f.subject} onChange={e => setF({ ...f, subject: e.target.value })} /></div>
              <div className="field"><label>Message</label><textarea rows={6} value={f.message} onChange={e => setF({ ...f, message: e.target.value })} /></div>
              <div><button className="btn btn-ink" onClick={send} disabled={!f.name || !f.email || !f.message}>{FR ? "Envoyer" : "Send"}</button></div>
            </div>
          )}
          <div className="facts" style={{ maxWidth: 640 }}>
            {[["Email", CONFIG.EMAIL], [FR ? "Réponse" : "Reply", FR ? "Sous 1 jour ouvré" : "Within 1 business day"], [FR ? "Adresse" : "Address", CONFIG.ADDRESS], ["SIRET", CONFIG.SIRET]].map(([k, v]) => (
              <div className="fact" key={k}><div className="fact-k">{k}</div><div className="fact-v" style={{ wordBreak: "break-word" }}>{v}</div></div>
            ))}
          </div>

          <div className="sheet" style={{ maxWidth: 640, marginTop: 8 }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>{FR ? "Paiement par virement bancaire" : "Payment by bank transfer"}</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 24, marginBottom: 14 }}>{CONFIG.BANK.trading}</div>
            <p className="muted" style={{ fontSize: 12.5, marginBottom: 16, lineHeight: 1.6 }}>
              {FR ? "Le virement est possible pour toutes les commandes, même petites. Le plus simple : « Payer par virement bancaire » dans le panier, ou écrivez-nous à " + CONFIG.EMAIL + " pour confirmer le montant (livraison incluse) et la référence de commande." : "Bank transfer is available for all orders, even small ones. The simplest way: \"Pay by bank transfer\" in the cart, or write to us at " + CONFIG.EMAIL + " to confirm the amount (delivery included) and the order reference."}
            </p>
            <div className="spec"><span>IBAN</span><span>{CONFIG.BANK.iban}</span></div>
            <div className="spec"><span>BIC</span><span>{CONFIG.BANK.bic}</span></div>
            <div className="spec" style={{ borderBottom: "none" }}>
              <span>{FR ? "Titulaire légal" : "Legal account holder"}</span>
              <span>{CONFIG.BANK.holder}</span>
            </div>
            <p className="muted" style={{ fontSize: 10.5, marginTop: 10, lineHeight: 1.5 }}>
              {FR ? "Le titulaire légal doit correspondre au nom indiqué par votre banque lors du virement (obligation réglementaire de vérification du bénéficiaire)." : "The legal holder name must match what your bank shows when you initiate the transfer (mandatory beneficiary verification requirement)."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── PAGES LÉGALES ──────────────────────────────────────── */
const Legal = ({ title, children }) => (
  <section className="sec" style={{ paddingTop: 56 }}>
    <div className="wrap">
      <div className="eyebrow" style={{ marginBottom: 14 }}>Legal</div>
      <h1 className="display" style={{ fontSize: "clamp(34px,5.5vw,56px)", marginBottom: 20 }}>{title}</h1>
      <div className="prose">{children}</div>
    </div>
  </section>
);
const S = ({ t, children }) => <div><h3>{t}</h3>{children}</div>;
const PrivacyPage = ({ lang="EN" }) => {
  const FR = lang === "FR";
  return (
  <Legal lang={lang} title={FR ? "Politique de Confidentialité" : "Privacy Policy"}>
    <p style={{marginBottom:14}}>{FR ? "Dernière mise à jour : avril 2026" : "Last updated: April 2026"} · {CONFIG.BUSINESS_NAME} · SIRET {CONFIG.SIRET}</p>
    <S t={FR ? "1. Qui Sommes-Nous" : "1. Who We Are"}><p>{FR ? "Novalyx exploite ce site web et est responsable de vos données personnelles conformément au RGPD." : "Novalyx operates this website and is responsible for your personal data in accordance with the GDPR."}</p></S>
    <S t={FR ? "2. Données Collectées" : "2. Data We Collect"}><p>{FR ? "Nom, email, adresse de livraison et détails de commande que vous fournissez directement. Données d'utilisation anonymisées via les analyses pour améliorer notre site." : "Name, email, shipping address, and order details you provide directly. Anonymised usage data via analytics to improve our site."}</p></S>
    <S t={FR ? "3. Utilisation de Vos Données" : "3. How We Use Your Data"}><p>{FR ? "Pour traiter les commandes, fournir un support, envoyer des communications de commande et — avec consentement — des annonces de produits. Les données de paiement sont traitées par Stripe ; nous ne voyons ni ne stockons jamais les détails de votre carte." : "To process orders, provide support, send order communications, and — with consent — product announcements. Payment data is processed by Stripe; we never see or store your card details."}</p></S>
    <S t={FR ? "4. Partage des Données" : "4. Data Sharing"}><p>{FR ? "Nous ne vendons pas vos données. Nous les partageons uniquement avec les partenaires logistiques et de paiement (Stripe) dans le cadre d'accords de traitement stricts." : "We do not sell your data. We share only with logistics and payment partners (Stripe) under strict processing agreements."}</p></S>
    <S t={FR ? "5. Vos Droits" : "5. Your Rights"}><p>{FR ? "Selon le RGPD : accéder, rectifier, effacer, restreindre, porter vos données ou vous opposer au traitement. Email " : "Under GDPR: access, rectify, erase, restrict, port your data, or object to processing. Email "}{CONFIG.EMAIL}.</p></S>
    <S t={FR ? "6. Cookies" : "6. Cookies"}><p>{FR ? "Cookies essentiels pour la fonctionnalité uniquement. Cookies d'analyse placés avec consentement uniquement." : "Essential cookies for functionality only. Analytics cookies placed with consent only."}</p></S>
    <S t={FR ? "7. Contact" : "7. Contact"}><p>{FR ? "Demandes relatives aux données : " : "Data enquiries: "}{CONFIG.EMAIL}</p></S>
  </Legal>
  );
};

const TermsPage = ({ lang="EN" }) => {
  const FR = lang === "FR";
  return (
  <Legal lang={lang} title={FR ? "Conditions Générales" : "Terms & Conditions"}>
    <p style={{marginBottom:14}}>{FR ? "Dernière mise à jour : avril 2026" : "Last updated: April 2026"} · {CONFIG.BUSINESS_NAME} · SIRET {CONFIG.SIRET}</p>
    <S t={FR ? "1. Acceptation" : "1. Acceptance"}><p>{FR ? "En utilisant ce site web ou en passant une commande, vous acceptez ces Conditions. Si vous n'êtes pas d'accord, n'utilisez pas ce site." : "By using this website or placing an order you agree to these Terms. If you disagree, do not use this site."}</p></S>
    <S t={FR ? "2. Usage Recherche Uniquement" : "2. Research Use Only"}><p>{FR ? "Tous les produits sont destinés exclusivement à la recherche in-vitro en laboratoire. Pas pour usage humain ou vétérinaire. En achetant, vous confirmez être un chercheur qualifié agissant légalement." : "All products are for in-vitro laboratory research only. Not for human or veterinary use. By purchasing you confirm you are a qualified researcher acting lawfully."}</p></S>
    <S t={FR ? "3. Restriction d'Âge" : "3. Age Restriction"}><p>{FR ? "Vous devez avoir 18 ans ou plus pour acheter. Finaliser un achat confirme que vous remplissez cette condition." : "You must be 18+ to purchase. Completing a purchase confirms you meet this requirement."}</p></S>
    <S t={FR ? "4. Commandes & Paiement" : "4. Orders & Payment"}><p>{FR ? "Les prix sont affichés en EUR et n'incluent pas la TVA (TVA non applicable, art. 293B du CGI — régime micro-entrepreneur français). Le paiement par carte est traité de manière sécurisée par Stripe ; le paiement par virement bancaire est également possible, la commande étant alors expédiée à réception du virement. Nous nous réservons le droit d'annuler des commandes, avec remboursement intégral." : "Prices are shown in EUR and do not include VAT (TVA non applicable, art. 293B du CGI — French micro-entrepreneur regime). Card payment is processed securely by Stripe; payment by bank transfer is also available, in which case the order is shipped once the transfer is received. We reserve the right to cancel orders, with a full refund issued."}</p></S>
    <S t={FR ? "5. Livraison & Commandes Internationales" : "5. Shipping & International Orders"}><p>{FR ? "Les commandes sont traitées dans des conditions d'expédition contrôlées avec approvisionnement par lot et par commande auprès de nos partenaires de laboratoire vérifiés. Les commandes sont expédiées sous 24 h après confirmation du paiement. La livraison en France prend généralement 2 à 3 jours ; le reste de l'Union européenne 3 à 5 jours ouvrés ; les destinations internationales 7 à 14 jours ouvrés. Les délais de livraison sont des estimations, pas des garanties. Le risque est transféré à l'acheteur dès l'expédition." : "Orders are processed under controlled fulfillment conditions with per-order batch sourcing from our verified laboratory partners. Orders are shipped within 24 h of payment confirmation. Delivery within France typically takes 2–3 days; the rest of the EU 3–5 business days; international destinations 7–14 business days. Delivery timescales are estimates, not guarantees. Risk passes to buyer upon dispatch."}</p><p>{FR ? "Pour les commandes internationales (hors Union Européenne), l'acheteur est seul responsable de vérifier que les produits peuvent être légalement importés dans sa juridiction, de payer les droits de douane, taxes ou frais de dédouanement applicables, et de respecter toutes les lois locales régissant les composés de recherche. Novalyx Research n'agit pas en tant qu'importateur officiel. Les colis saisis, détruits, refusés ou retournés par les autorités douanières dans toute juridiction hors UE ne sont pas remboursables. En passant une commande internationale, l'acheteur reconnaît et accepte expressément ces risques." : "For international orders (outside the European Union), the buyer is solely responsible for verifying that the products may be legally imported into their jurisdiction, for paying any applicable customs duties, taxes, or clearance fees, and for complying with all local laws governing research compounds. Novalyx Research does not act as an importer of record. Packages seized, destroyed, refused, or returned by customs authorities in any non-EU jurisdiction are non-refundable. By placing an international order, the buyer expressly acknowledges and accepts these risks."}</p></S>
    <S t={FR ? "6. Retours" : "6. Returns"}><p>{FR ? "Contactez-nous dans les 7 jours si les produits arrivent endommagés ou ne correspondent pas aux spécifications du COA. Les composés ouverts ne peuvent pas être retournés pour des raisons de sécurité." : "Contact us within 7 days if products arrive damaged or do not match COA specs. Opened compounds cannot be returned for safety reasons."}</p></S>
    <S t={FR ? "7. Limitation de Responsabilité" : "7. Limitation of Liability"}><p>{FR ? "Novalyx n'est pas responsable de la mauvaise utilisation des produits, ni des dommages indirects ou consécutifs résultant de l'utilisation de ce site web ou des produits." : "Novalyx is not liable for misuse of products, or for indirect or consequential damages from use of this website or products."}</p></S>
    <S t={FR ? "8. Droit Applicable" : "8. Governing Law"}><p>{FR ? "Régi par le droit français et les réglementations européennes applicables." : "Governed by French law and applicable EU regulations."}</p></S>
  </Legal>
  );
};

const DisclaimerPage = ({ lang="EN" }) => {
  const FR = lang === "FR";
  return (
  <Legal lang={lang} title={FR ? "Avertissement" : "Disclaimer"}>
    <S t={FR ? "Usage Recherche Uniquement" : "Research Use Only"}><p>{FR ? "Tous les produits sont destinés exclusivement à la recherche scientifique par des professionnels qualifiés dans des environnements de laboratoire appropriés. Ce ne sont pas des médicaments, compléments ou produits alimentaires." : "All products are intended exclusively for scientific research by qualified professionals in appropriate laboratory settings. They are not drugs, supplements, or food products."}</p></S>
    <S t={FR ? "Pas pour Usage Humain" : "Not for Human Use"}><p>{FR ? "Aucun produit vendu par Novalyx n'est destiné à une administration humaine ou vétérinaire. Novalyx décline expressément toute responsabilité pour tout usage contraire à cette désignation." : "No product sold by Novalyx is intended for human or veterinary administration. Novalyx expressly disclaims liability for any use contrary to this designation."}</p></S>
    <S t={FR ? "Aucun Conseil Médical" : "No Medical Advice"}><p>{FR ? "Rien sur ce site web ne constitue un conseil médical. Aucune allégation n'est faite concernant les bienfaits pour la santé ou les effets thérapeutiques d'un quelconque composé." : "Nothing on this website constitutes medical advice. No claims are made regarding health benefits or therapeutic effects of any compound."}</p></S>
    <S t={FR ? "Conformité Réglementaire" : "Regulatory Compliance"}><p>{FR ? "Il incombe au seul acheteur de vérifier qu'un composé est légal dans sa juridiction. Novalyx ne fait aucune représentation concernant le statut réglementaire dans un quelconque pays." : "It is the purchaser's sole responsibility to verify that a compound is legal in their jurisdiction. Novalyx makes no representation regarding regulatory status in any country."}</p></S>
    <S t={FR ? "Exactitude" : "Accuracy"}><p>{FR ? "Les documents COA représentent la spécification définitive par lot. Bien que nous nous efforcions d'être exacts, nous ne garantissons pas que tout le contenu du site soit exempt d'erreurs." : "COA documents represent the definitive specification per batch. While we strive for accuracy, we do not warrant all website content is error-free."}</p></S>
  </Legal>
  );
};


/* ─── LIVRAISON ──────────────────────────────────────────── */
const ShippingPage = ({ lang }) => {
  const FR = lang === "FR";
  const zones = [
    ["France", "6,90 €", FR ? "2–3 jours max." : "2–3 days max."],
    [FR ? "Union européenne" : "European Union", "9,90 €", FR ? "3–5 j. ouvrés" : "3–5 business days"],
    [FR ? "Suisse, Royaume-Uni" : "Switzerland, UK", "14,90 €", FR ? "5–8 j. ouvrés" : "5–8 business days"],
    [FR ? "États-Unis, Canada" : "USA, Canada", "24,90 €", FR ? "7–12 j. ouvrés" : "7–12 business days"],
    [FR ? "Australie, Nouvelle-Zélande et autres pays" : "Australia, New Zealand and other countries", "29,90 €", FR ? "7–14 j. ouvrés (variable)" : "7–14 business days (variable)"],
  ];
  return (
    <Legal title={FR ? "Livraison & expédition" : "Shipping & delivery"}>
      <p>{FR ? "Chaque commande est expédiée depuis Paris sous 24 h après confirmation du paiement. Livraison en 2 à 3 jours maximum en France, 3 à 5 jours ouvrés pour le reste de l'Union européenne. Un numéro de suivi est communiqué à l'expédition." : "Each order is shipped from Paris within 24 h of payment confirmation. Delivery in 2–3 days maximum within France, 3–5 business days for the rest of the EU. A tracking number is sent on dispatch."}</p>
      <h3>{FR ? "Zones et tarifs" : "Zones and rates"}</h3>
      <div style={{ borderTop: "1px solid var(--line)" }}>
        {zones.map(([z, r, d]) => (
          <div key={z} className="spec" style={{ fontSize: 14 }}>
            <span style={{ color: "var(--ink)" }}>{z}</span>
            <span>{r} · {d}</span>
          </div>
        ))}
      </div>
      <p className="muted" style={{ fontSize: 13, marginTop: 10 }}>{FR ? "Livraison offerte en France et dans l'UE pour les Packs de 2 et de 3 de GLP-3RT. Eau bactériostatique : 3,99 € en France et dans l'UE. Nous n'expédions pas vers la Russie ni la Biélorussie." : "Free shipping in France and the EU on GLP-3RT Packs of 2 and 3. Bacteriostatic water: €3.99 in France and the EU. We do not ship to Russia or Belarus."}</p>
      <h3>{FR ? "Commandes hors Union européenne" : "Orders outside the European Union"}</h3>
      <p>{FR ? "Les envois hors UE se font aux risques de l'acheteur. Il lui appartient de vérifier que les produits peuvent être importés légalement dans son pays et de régler les éventuels droits et taxes. Novalyx Research n'agit pas en tant qu'importateur. Les colis saisis, refusés ou détruits par les autorités douanières hors UE ne sont pas remboursables." : "Shipments outside the EU are at the buyer's risk. The buyer must check that the products may be lawfully imported and pay any duties or taxes. Novalyx Research does not act as importer of record. Parcels seized, refused or destroyed by customs outside the EU are non-refundable."}</p>
      <h3>{FR ? "Déclaration d'usage" : "Use declaration"}</h3>
      <p>{FR ? "Tous les produits sont fournis exclusivement pour la recherche en laboratoire. En commandant, vous confirmez être un professionnel qualifié agissant conformément aux lois applicables." : "All products are supplied exclusively for laboratory research. By ordering you confirm you are a qualified professional acting in compliance with applicable laws."}</p>
    </Legal>
  );
};

/* ─── BANDEAU COOKIES (RGPD / CNIL) ──────────────────────── */
const CookieBanner = ({ lang, initial, onSave, go }) => {
  const FR = lang === "FR";
  const [custom, setCustom] = useState(false);
  const [an, setAn] = useState(!!(initial && initial.analytics));
  const [mk, setMk] = useState(!!(initial && initial.marketing));
  return (
    <div className="cookie fade">
      <div className="cookie-in" role="dialog" aria-label="Cookies">
        <div className="eyebrow">Cookies</div>
        <p>
          {FR
            ? "Nous utilisons des cookies indispensables au fonctionnement du site (panier, langue). Avec votre accord, nous utilisons aussi des cookies de mesure d'audience et de publicité pour améliorer le site et mesurer nos campagnes. Vous pouvez refuser ou modifier votre choix à tout moment. "
            : "We use cookies that are essential for the site to work (cart, language). With your consent, we also use audience-measurement and advertising cookies to improve the site and measure our campaigns. You can refuse or change your choice at any time. "}
          <button className="link" onClick={() => go("privacy")}>{FR ? "En savoir plus" : "Learn more"}</button>
        </p>
        {custom && (
          <div style={{ marginBottom: 12 }}>
            <label className="cookie-row"><input type="checkbox" checked disabled /><span><b>{FR ? "Indispensables" : "Essential"}</b> — {FR ? "panier, langue, devise. Toujours actifs." : "cart, language, currency. Always on."}</span></label>
            <label className="cookie-row"><input type="checkbox" checked={an} onChange={e => setAn(e.target.checked)} /><span><b>{FR ? "Mesure d'audience" : "Analytics"}</b> — {FR ? "statistiques de visite anonymisées." : "anonymised visit statistics."}</span></label>
            <label className="cookie-row"><input type="checkbox" checked={mk} onChange={e => setMk(e.target.checked)} /><span><b>{FR ? "Publicité" : "Advertising"}</b> — {FR ? "mesure de nos campagnes Google et Meta." : "measuring our Google and Meta campaigns."}</span></label>
          </div>
        )}
        <div className="cookie-actions">
          <button className="btn btn-ink" onClick={() => onSave({ analytics: false, marketing: false })}>{FR ? "Tout refuser" : "Refuse all"}</button>
          {custom
            ? <button className="btn btn-line" onClick={() => onSave({ analytics: an, marketing: mk })}>{FR ? "Enregistrer mes choix" : "Save my choices"}</button>
            : <button className="btn btn-line" onClick={() => setCustom(true)}>{FR ? "Personnaliser" : "Customise"}</button>}
          <button className="btn btn-ink" onClick={() => onSave({ analytics: true, marketing: true })}>{FR ? "Tout accepter" : "Accept all"}</button>
        </div>
      </div>
    </div>
  );
};

/* BOT:START */
/* ─── CHATBOT ÉDUCATIF — base de connaissances vérifiée, SANS IA générative ───
   Chaque entrée : K(alias, [FR: nature+mécanisme, FR: statut], [EN: ..., EN: ...]).
   Sources de référence : PubChem, PubMed, EMA, FDA, ClinicalTrials.gov, communiqués officiels.
   Les statuts réglementaires évoluent : mettre à jour BOT_DATE après chaque relecture. */
const BOT_DATE = { FR: "octobre 2026", EN: "October 2026" };
const K = (aliases, fr, en) => ({ aliases, fr, en });
const BOT_KB = {
  bpc157: K(["bpc-157", "bpc 157", "body protection compound"],
    ["Peptide synthétique de 15 acides aminés, dérivé d'une séquence de la protéine BPC présente dans le suc gastrique humain. En laboratoire, il est étudié sur des modèles cellulaires et animaux pour ses interactions avec les voies de l'angiogenèse (formation de vaisseaux) et de la réparation tissulaire.",
     "Non autorisé comme médicament dans aucun pays. Les données publiées proviennent surtout d'études précliniques (animaux) ; les données humaines contrôlées sont très limitées. Figure sur la liste des substances interdites de l'Agence mondiale antidopage (AMA)."],
    ["Synthetic 15-amino-acid peptide derived from a sequence of the BPC protein found in human gastric juice. In the laboratory it is studied in cell and animal models for its interactions with angiogenesis (blood-vessel formation) and tissue-repair pathways.",
     "Not authorised as a medicine in any country. Published data come mostly from preclinical (animal) studies; controlled human data are very limited. Listed as prohibited by the World Anti-Doping Agency (WADA)."]),
  tb500: K(["tb-500", "tb 500", "thymosine beta 4", "thymosin beta 4"],
    ["Peptide synthétique lié à la thymosine bêta-4, une protéine de 43 acides aminés qui lie l'actine (composant du cytosquelette). « TB-500 » désigne en général un fragment synthétique ; les définitions varient selon les fournisseurs. Étudié in vitro et chez l'animal pour la migration cellulaire et la réparation tissulaire.",
     "Non autorisé comme médicament. Données humaines contrôlées quasi inexistantes. Substance interdite par l'AMA."],
    ["Synthetic peptide related to thymosin beta-4, a 43-amino-acid protein that binds actin (a cytoskeleton component). \"TB-500\" usually refers to a synthetic fragment; definitions vary between suppliers. Studied in vitro and in animals for cell migration and tissue repair.",
     "Not authorised as a medicine. Controlled human data are almost non-existent. Prohibited by WADA."]),
  ghk: K(["ghk-cu", "ghk cu", "ghk", "ghk-copper", "ghk copper", "copper peptide", "peptide cuivre"],
    ["Tripeptide naturel (glycyl-histidyl-lysine) qui forme un complexe avec le cuivre(II). Présent dans le plasma humain, il est étudié en laboratoire pour son rôle dans la matrice extracellulaire, la synthèse de collagène et la biologie de la peau.",
     "Utilisé en cosmétique (application cutanée) ; aucune autorisation comme médicament injectable. La recherche porte surtout sur des modèles cellulaires et des applications topiques."],
    ["Naturally occurring tripeptide (glycyl-histidyl-lysine) that forms a complex with copper(II). Present in human plasma, it is studied in the laboratory for its role in the extracellular matrix, collagen synthesis and skin biology.",
     "Used in cosmetics (topical application); no authorisation as an injectable medicine. Research mainly involves cell models and topical applications."]),
  kpv: K(["kpv"],
    ["Tripeptide (lysine-proline-valine) correspondant à l'extrémité C-terminale de l'α-MSH (hormone mélanotrope). Étudié in vitro et chez l'animal pour ses effets sur la signalisation inflammatoire, notamment au niveau de l'épithélium intestinal.",
     "Non autorisé comme médicament ; recherche essentiellement préclinique."],
    ["Tripeptide (lysine-proline-valine) matching the C-terminal end of α-MSH (melanocyte-stimulating hormone). Studied in vitro and in animals for its effects on inflammatory signalling, notably in the intestinal epithelium.",
     "Not authorised as a medicine; research is essentially preclinical."]),
  retatrutide: K(["retatrutide", "glp-3rt", "glp3rt", "glp 3rt", "ly3437943"],
    ["Retatrutide (nom du produit sur ce site : GLP-3RT) est un agoniste triple des récepteurs GIP, GLP-1 et du glucagon, développé par Eli Lilly (code LY3437943). Il active simultanément trois récepteurs impliqués dans le métabolisme énergétique et glucidique.",
     "Médicament expérimental : en phase 3 d'essais cliniques, non autorisé à ce jour. Selon les annonces du laboratoire, un dépôt de dossier d'autorisation aux États-Unis est visé début 2027. Le produit Novalyx est un composé de recherche, pas un médicament."],
    ["Retatrutide (product name on this site: GLP-3RT) is a triple agonist of the GIP, GLP-1 and glucagon receptors, developed by Eli Lilly (code LY3437943). It activates three receptors involved in energy and glucose metabolism at the same time.",
     "Investigational drug: in phase 3 clinical trials, not authorised to date. According to the company's announcements, a US marketing application is targeted for early 2027. The Novalyx product is a research compound, not a medicine."]),
  mazdutide: K(["mazdutide", "ibi362", "ly3305677"],
    ["Agoniste double des récepteurs GLP-1 et du glucagon (IBI362 / LY3305677), développé par Innovent (Chine) sous licence d'Eli Lilly.",
     "Autorisé en Chine (NMPA, juin 2025) pour la gestion chronique du poids chez l'adulte ; non autorisé dans l'UE ni aux États-Unis à notre connaissance."],
    ["Dual agonist of the GLP-1 and glucagon receptors (IBI362 / LY3305677), developed by Innovent (China) under licence from Eli Lilly.",
     "Approved in China (NMPA, June 2025) for chronic weight management in adults; to our knowledge not approved in the EU or the United States."]),
  survodutide: K(["survodutide", "bi 456906", "bi456906"],
    ["Agoniste double des récepteurs du glucagon et du GLP-1, développé par Boehringer Ingelheim (BI 456906).",
     "Médicament expérimental, en phase 3 d'essais cliniques ; non autorisé à notre connaissance."],
    ["Dual agonist of the glucagon and GLP-1 receptors, developed by Boehringer Ingelheim (BI 456906).",
     "Investigational drug, in phase 3 clinical trials; to our knowledge not authorised."]),
  cagrilintide: K(["cagrilintide", "cagri"],
    ["Analogue de l'amyline à action prolongée (l'amyline est une hormone co-sécrétée avec l'insuline), développé par Novo Nordisk. Il agit sur les récepteurs de l'amyline et de la calcitonine.",
     "Médicament expérimental en développement avancé, seul et en association avec le sémaglutide (CagriSema). Le statut évolue : se référer aux autorités sanitaires pour la situation à jour."],
    ["Long-acting amylin analogue (amylin is a hormone co-secreted with insulin), developed by Novo Nordisk. It acts on amylin and calcitonin receptors.",
     "Investigational drug in advanced development, alone and in combination with semaglutide (CagriSema). Status is evolving: refer to health authorities for the current situation."]),
  slupp322: K(["tirzepatide", "tirzepatid", "mounjaro", "zepbound"],
    ["Agoniste double des récepteurs GIP et GLP-1 (peptide de 39 acides aminés, Eli Lilly).",
     "Médicament autorisé (FDA et EMA) sous les marques Mounjaro et Zepbound. Le produit Novalyx est un composé de recherche et n'est pas ce médicament."],
    ["Dual agonist of the GIP and GLP-1 receptors (39-amino-acid peptide, Eli Lilly).",
     "Authorised medicine (FDA and EMA) under the brands Mounjaro and Zepbound. The Novalyx product is a research compound and is not that medicine."]),
  semaglutide: K(["semaglutide", "semaglutid", "ozempic", "wegovy", "rybelsus"],
    ["Agoniste du récepteur GLP-1 (analogue acylé du GLP-1 humain), développé par Novo Nordisk.",
     "Médicament autorisé sous les marques Ozempic, Wegovy et Rybelsus. Le produit Novalyx est un composé de recherche et n'est pas ce médicament."],
    ["GLP-1 receptor agonist (acylated analogue of human GLP-1), developed by Novo Nordisk.",
     "Authorised medicine under the brands Ozempic, Wegovy and Rybelsus. The Novalyx product is a research compound and is not that medicine."]),
  aod9604: K(["aod-9604", "aod 9604", "aod9604"],
    ["Fragment modifié de l'hormone de croissance humaine (acides aminés 176-191, avec une tyrosine ajoutée), étudié pour son lien avec le métabolisme des lipides.",
     "Non autorisé comme médicament ; des essais cliniques dans l'obésité n'ont pas conduit à une autorisation."],
    ["Modified fragment of human growth hormone (amino acids 176-191, with an added tyrosine), studied for its link with lipid metabolism.",
     "Not authorised as a medicine; clinical trials in obesity did not lead to an authorisation."]),
  amino1mq: K(["5-amino-1mq", "5 amino 1mq", "5amino1mq", "5-amino 1mq"],
    ["Petite molécule (5-amino-1-méthylquinolinium), et non un peptide : inhibiteur de la NNMT (nicotinamide N-méthyltransférase), une enzyme du métabolisme cellulaire. Étudié sur cellules et modèles murins.",
     "Aucune autorisation ; données uniquement précliniques."],
    ["Small molecule (5-amino-1-methylquinolinium), not a peptide: inhibitor of NNMT (nicotinamide N-methyltransferase), an enzyme of cellular metabolism. Studied in cells and mouse models.",
     "No authorisation; preclinical data only."]),
  tesamorelin: K(["tesamorelin", "tesamoreline", "egrifta"],
    ["Analogue de la GHRH (hormone de libération de l'hormone de croissance) de 44 acides aminés, modifié pour résister à la dégradation.",
     "Autorisé aux États-Unis (marque Egrifta) pour une indication précise (lipodystrophie abdominale associée au VIH). Le produit Novalyx est un composé de recherche, pas ce médicament."],
    ["44-amino-acid analogue of GHRH (growth-hormone-releasing hormone), modified to resist degradation.",
     "Authorised in the United States (brand Egrifta) for a specific indication (HIV-associated abdominal lipodystrophy). The Novalyx product is a research compound, not that medicine."]),
  ipamorelin: K(["ipamorelin", "ipamoreline", "ipa"],
    ["Pentapeptide synthétique agoniste du récepteur de la ghréline (GHS-R1a), classé parmi les sécrétagogues de l'hormone de croissance.",
     "Non autorisé comme médicament ; des essais cliniques exploratoires ont eu lieu, sans autorisation. Substance interdite par l'AMA."],
    ["Synthetic pentapeptide agonist of the ghrelin receptor (GHS-R1a), classed among growth-hormone secretagogues.",
     "Not authorised as a medicine; exploratory clinical trials have taken place without authorisation. Prohibited by WADA."]),
  sermorelin: K(["sermorelin", "sermoreline", "geref"],
    ["Fragment 1-29 de la GHRH humaine (sermoréline), qui active le récepteur de la GHRH.",
     "A été autorisé aux États-Unis (marque Geref) puis retiré du marché pour des raisons commerciales. Substance interdite par l'AMA."],
    ["Fragment 1-29 of human GHRH (sermorelin), which activates the GHRH receptor.",
     "Was authorised in the United States (brand Geref) and later withdrawn for commercial reasons. Prohibited by WADA."]),
  cjc1295: K(["cjc-1295", "cjc 1295", "cjc1295", "modified grf 1-29", "mod grf"],
    ["Analogue de la GHRH (version « sans DAC » : séquence 1-29 modifiée, aussi appelée modified GRF 1-29), conçu pour une meilleure stabilité.",
     "Non autorisé comme médicament. Substance interdite par l'AMA."],
    ["GHRH analogue (\"no DAC\" version: modified 1-29 sequence, also called modified GRF 1-29), designed for better stability.",
     "Not authorised as a medicine. Prohibited by WADA."]),
  nad: K(["nad+", "nad", "nicotinamide adenine dinucleotide", "nicotinamide adenine dinucleotide", "nicotinamide adenine"],
    ["Coenzyme (nicotinamide adénine dinucléotide) présente dans toutes les cellules : cofacteur des réactions d'oxydoréduction du métabolisme énergétique et substrat d'enzymes comme les sirtuines et les PARP.",
     "Molécule endogène étudiée en laboratoire. Aucune autorisation comme médicament pour les formes vendues ici ; les allégations de santé associées ne sont pas validées par les autorités."],
    ["Coenzyme (nicotinamide adenine dinucleotide) present in all cells: cofactor of redox reactions in energy metabolism and substrate of enzymes such as sirtuins and PARPs.",
     "Endogenous molecule studied in the laboratory. No authorisation as a medicine for the forms sold here; associated health claims are not validated by authorities."]),
  epitalon: K(["epitalon", "epithalon"],
    ["Tétrapeptide synthétique (Ala-Glu-Asp-Gly) conçu à partir de l'épithalamine, un extrait de glande pinéale. Étudié, principalement par une équipe de recherche russe, pour ses effets sur la télomérase et le vieillissement cellulaire.",
     "Non autorisé dans l'UE ni aux États-Unis ; la littérature est limitée et peu répliquée de façon indépendante."],
    ["Synthetic tetrapeptide (Ala-Glu-Asp-Gly) designed from epithalamin, a pineal-gland extract. Studied, mainly by a Russian research group, for effects on telomerase and cellular ageing.",
     "Not authorised in the EU or the United States; the literature is limited and rarely independently replicated."]),
  pinealon: K(["pinealon"],
    ["Tripeptide synthétique (Glu-Asp-Arg) appartenant aux « bio-régulateurs peptidiques » étudiés par l'équipe de Khavinson ; examiné en culture cellulaire et chez l'animal pour des effets neuroprotecteurs.",
     "Non autorisé comme médicament dans l'UE ni aux États-Unis ; données limitées, provenant surtout d'un nombre restreint de laboratoires."],
    ["Synthetic tripeptide (Glu-Asp-Arg) belonging to the \"peptide bioregulators\" studied by Khavinson's group; examined in cell culture and animals for neuroprotective effects.",
     "Not authorised as a medicine in the EU or the United States; limited data, mostly from a small number of laboratories."]),
  motsc: K(["mots-c", "mots c", "motsc"],
    ["Peptide de 16 acides aminés codé par l'ADN mitochondrial (gène de l'ARNr 12S) : un « peptide dérivé des mitochondries ». Étudié pour son rôle dans l'homéostasie métabolique et la réponse au stress cellulaire.",
     "Recherche préclinique (cellules, animaux) ; quelques études humaines très limitées sur des analogues. Aucune autorisation."],
    ["16-amino-acid peptide encoded by mitochondrial DNA (12S rRNA gene): a \"mitochondrial-derived peptide\". Studied for its role in metabolic homeostasis and cellular stress response.",
     "Preclinical research (cells, animals); a few very limited human studies on analogues. No authorisation."]),
  ss31: K(["ss-31", "ss31", "ss 31", "elamipretide", "elamipretide", "forzinity"],
    ["Tétrapeptide (aussi appelé élamipretide) qui se lie à la cardiolipine, un phospholipide de la membrane interne des mitochondries, et qui est étudié pour son effet sur la fonction mitochondriale.",
     "L'élamipretide est autorisé aux États-Unis (FDA, approbation accélérée, septembre 2025, marque Forzinity) uniquement pour le syndrome de Barth. Le produit Novalyx est un composé de recherche, pas ce médicament."],
    ["Tetrapeptide (also called elamipretide) that binds cardiolipin, a phospholipid of the inner mitochondrial membrane, and is studied for its effect on mitochondrial function.",
     "Elamipretide is approved in the United States (FDA, accelerated approval, September 2025, brand Forzinity) only for Barth syndrome. The Novalyx product is a research compound, not that medicine."]),
  thymosinalpha1: K(["thymosin alpha-1", "thymosin alpha 1", "thymosine alpha 1", "thymosine alpha-1", "thymosin alpha1", "ta1", "thymalfasin", "thymalfasine", "zadaxin"],
    ["Peptide de 28 acides aminés dérivé de la prothymosine alpha, étudié pour la modulation de la réponse immunitaire (maturation des lymphocytes T).",
     "Sa forme pharmaceutique (thymalfasine, marque Zadaxin) est autorisée dans plusieurs pays, surtout en Asie, pour certaines indications ; elle n'est pas autorisée aux États-Unis. Le produit Novalyx est un composé de recherche."],
    ["28-amino-acid peptide derived from prothymosin alpha, studied for modulation of the immune response (T-cell maturation).",
     "Its pharmaceutical form (thymalfasin, brand Zadaxin) is authorised in several countries, mainly in Asia, for certain indications; it is not authorised in the United States. The Novalyx product is a research compound."]),
  thymalin: K(["thymalin", "thymaline"],
    ["Complexe de polypeptides extrait du thymus (veau), étudié principalement dans la littérature russe pour la régulation immunitaire et le vieillissement.",
     "Non autorisé dans l'UE ni aux États-Unis ; les données proviennent surtout de la littérature russe."],
    ["Complex of polypeptides extracted from (calf) thymus, studied mainly in the Russian literature for immune regulation and ageing.",
     "Not authorised in the EU or the United States; data come mostly from the Russian literature."]),
  ll37: K(["ll-37", "ll 37", "ll37", "cathelicidin", "cathelicidine"],
    ["Peptide antimicrobien de 37 acides aminés, seul membre humain de la famille des cathélicidines, issu du clivage de la protéine hCAP18. Étudié pour son rôle dans l'immunité innée.",
     "Non autorisé comme médicament ; recherche essentiellement in vitro et préclinique."],
    ["37-amino-acid antimicrobial peptide, the only human member of the cathelicidin family, released by cleavage of the hCAP18 protein. Studied for its role in innate immunity.",
     "Not authorised as a medicine; research is essentially in vitro and preclinical."]),
  semax: K(["semax"],
    ["Heptapeptide synthétique analogue d'un fragment de l'ACTH (4-10), stabilisé par un fragment Pro-Gly-Pro. Étudié pour l'expression de facteurs neurotrophiques comme le BDNF.",
     "Enregistré comme médicament en Russie ; non autorisé dans l'UE ni aux États-Unis."],
    ["Synthetic heptapeptide analogue of an ACTH(4-10) fragment, stabilised by a Pro-Gly-Pro tail. Studied for the expression of neurotrophic factors such as BDNF.",
     "Registered as a medicine in Russia; not authorised in the EU or the United States."]),
  selank: K(["selank"],
    ["Heptapeptide synthétique dérivé de la tuftsine (fragment d'immunoglobuline), stabilisé par un fragment Pro-Gly-Pro ; étudié pour la modulation de neurotransmetteurs, dont le système GABAergique.",
     "Enregistré comme médicament en Russie ; non autorisé dans l'UE ni aux États-Unis."],
    ["Synthetic heptapeptide derived from tuftsin (an immunoglobulin fragment), stabilised by a Pro-Gly-Pro tail; studied for modulation of neurotransmitters, including the GABAergic system.",
     "Registered as a medicine in Russia; not authorised in the EU or the United States."]),
  cerebrolysin: K(["cerebrolysin", "cerebrolysine"],
    ["Préparation de peptides et d'acides aminés obtenue par hydrolyse enzymatique de protéines de cerveau de porc. Il ne s'agit pas d'une molécule unique mais d'un mélange.",
     "Commercialisé comme médicament dans certains pays (notamment en Autriche, en Russie, en Chine) ; non autorisé aux États-Unis. Les preuves cliniques d'efficacité restent débattues."],
    ["Preparation of peptides and amino acids obtained by enzymatic hydrolysis of pig-brain proteins. It is a mixture, not a single molecule.",
     "Marketed as a medicine in some countries (including Austria, Russia, China); not authorised in the United States. Clinical evidence of efficacy remains debated."]),
  dsip: K(["dsip", "delta sleep inducing peptide", "delta sleep-inducing peptide"],
    ["Nonapeptide (9 acides aminés) isolé du cerveau de lapin en 1977, étudié pour son lien avec le sommeil à ondes lentes. Son mécanisme exact reste mal établi.",
     "Non autorisé comme médicament ; la littérature est ancienne et les résultats ont été peu cohérents."],
    ["Nonapeptide (9 amino acids) isolated from rabbit brain in 1977, studied for its link with slow-wave sleep. Its exact mechanism remains poorly established.",
     "Not authorised as a medicine; the literature is old and results have been inconsistent."]),
  pt141: K(["pt-141", "pt 141", "pt141", "bremelanotide", "bremelanotide", "vyleesi"],
    ["Peptide cyclique (bremélanotide), agoniste des récepteurs de la mélanocortine (notamment MC4R), apparenté à la mélanotan II.",
     "Autorisé aux États-Unis (marque Vyleesi) pour une indication précise. Le produit Novalyx est un composé de recherche, pas ce médicament."],
    ["Cyclic peptide (bremelanotide), agonist of melanocortin receptors (notably MC4R), related to melanotan II.",
     "Authorised in the United States (brand Vyleesi) for a specific indication. The Novalyx product is a research compound, not that medicine."]),
  ara290: K(["ara-290", "ara 290", "ara290", "cibinetide", "cibinetide"],
    ["Peptide de 11 acides aminés dérivé de l'érythropoïétine (hélice B), qui se lie sélectivement au « récepteur de réparation innée » (hétérodimère EPOR/CD131) sans stimuler l'érythropoïèse. Aussi appelé cibinétide.",
     "Médicament expérimental (essais cliniques de phase 2) ; non autorisé."],
    ["11-amino-acid peptide derived from erythropoietin (helix B), which binds selectively to the \"innate repair receptor\" (EPOR/CD131 heterodimer) without stimulating erythropoiesis. Also called cibinetide.",
     "Investigational drug (phase 2 clinical trials); not authorised."]),
  kisspeptin: K(["kisspeptin-10", "kisspeptin 10", "kisspeptin", "kisspeptine", "kp-10", "kp10"],
    ["Fragment de 10 acides aminés de la kisspeptine, ligand du récepteur KISS1R (GPR54), qui contrôle la libération de GnRH et donc l'axe reproducteur.",
     "Non autorisé comme médicament ; utilisé dans des études de recherche en endocrinologie de la reproduction."],
    ["10-amino-acid fragment of kisspeptin, ligand of the KISS1R receptor (GPR54), which controls GnRH release and therefore the reproductive axis.",
     "Not authorised as a medicine; used in research studies in reproductive endocrinology."]),
  ghrp2: K(["ghrp-2", "ghrp 2", "ghrp2", "pralmorelin", "pralmoreline"],
    ["Hexapeptide synthétique agoniste du récepteur de la ghréline (GHS-R1a) : sécrétagogue de l'hormone de croissance (GHRP = growth hormone-releasing peptide).",
     "Non autorisé comme médicament dans l'UE ni aux États-Unis ; sous le nom de pralmoréline, il a été utilisé au Japon comme agent diagnostique, à notre connaissance. Substance interdite par l'AMA."],
    ["Synthetic hexapeptide agonist of the ghrelin receptor (GHS-R1a): a growth-hormone secretagogue (GHRP = growth hormone-releasing peptide).",
     "Not authorised as a medicine in the EU or the United States; as pralmorelin it has been used in Japan as a diagnostic agent, to our knowledge. Prohibited by WADA."]),
  ghrp6: K(["ghrp-6", "ghrp 6", "ghrp6"],
    ["Hexapeptide synthétique, l'un des premiers sécrétagogues de l'hormone de croissance, agoniste du récepteur de la ghréline (GHS-R1a).",
     "Non autorisé comme médicament ; recherche. Substance interdite par l'AMA."],
    ["Synthetic hexapeptide, one of the first growth-hormone secretagogues, agonist of the ghrelin receptor (GHS-R1a).",
     "Not authorised as a medicine; research use. Prohibited by WADA."]),
  hexarelin: K(["hexarelin", "hexareline"],
    ["Hexapeptide synthétique, sécrétagogue de l'hormone de croissance agissant sur le récepteur de la ghréline ; il se lie aussi à CD36, ce qui a été étudié dans des modèles cardiaques.",
     "Non autorisé comme médicament ; recherche. Substance interdite par l'AMA."],
    ["Synthetic hexapeptide, a growth-hormone secretagogue acting on the ghrelin receptor; it also binds CD36, which has been studied in cardiac models.",
     "Not authorised as a medicine; research use. Prohibited by WADA."]),
  melanotanii: K(["melanotan ii", "melanotan 2", "melanotan2", "mt-ii", "mt ii", "mt2", "mt-2"],
    ["Peptide cyclique synthétique analogue de l'α-MSH, agoniste non sélectif des récepteurs de la mélanocortine.",
     "Non autorisé comme médicament ; plusieurs autorités sanitaires (par exemple au Royaume-Uni et en Australie) ont mis en garde contre les produits vendus sous ce nom."],
    ["Synthetic cyclic peptide analogue of α-MSH, a non-selective agonist of melanocortin receptors.",
     "Not authorised as a medicine; several health authorities (for example in the United Kingdom and Australia) have issued warnings about products sold under this name."]),
  melanotani: K(["melanotan i", "melanotan 1", "melanotan1", "mt-i", "mt i", "mt1", "mt-1", "afamelanotide", "afamelanotide", "scenesse"],
    ["Analogue synthétique de l'α-MSH, connu sous le nom d'afamélanotide ([Nle4, D-Phe7]-α-MSH), agoniste du récepteur MC1R.",
     "L'afamélanotide est autorisé sous forme d'implant (marque Scenesse) pour une indication précise (protoporphyrie érythropoïétique) dans l'UE et aux États-Unis. Le produit Novalyx est un composé de recherche, pas ce médicament."],
    ["Synthetic analogue of α-MSH, known as afamelanotide ([Nle4, D-Phe7]-α-MSH), an agonist of the MC1R receptor.",
     "Afamelanotide is authorised as an implant (brand Scenesse) for a specific indication (erythropoietic protoporphyria) in the EU and the United States. The Novalyx product is a research compound, not that medicine."]),
  snap8: K(["snap-8", "snap 8", "snap8", "acetyl octapeptide-3", "acetyl octapeptide 3"],
    ["Octapeptide acétylé (acétyl octapeptide-3) utilisé comme ingrédient cosmétique ; sa séquence reproduit une partie de la protéine SNAP-25, impliquée dans le complexe SNARE de libération des neurotransmetteurs.",
     "Ingrédient cosmétique (usage topique) ; les données d'efficacité viennent surtout des fabricants. Aucun statut de médicament."],
    ["Acetylated octapeptide (acetyl octapeptide-3) used as a cosmetic ingredient; its sequence mimics part of the SNAP-25 protein, involved in the SNARE complex of neurotransmitter release.",
     "Cosmetic ingredient (topical use); efficacy data come mostly from manufacturers. No medicine status."]),
  vip: K(["vip", "vasoactive intestinal peptide", "peptide intestinal vasoactif", "aviptadil", "aviptadil"],
    ["Neuropeptide de 28 acides aminés agissant sur les récepteurs VPAC1 et VPAC2, impliqué dans la vasodilatation, l'immunité et la fonction digestive. Sa forme synthétique médicamenteuse porte le nom d'aviptadil.",
     "Non autorisé comme médicament aux États-Unis ; l'aviptadil a fait l'objet d'essais cliniques et d'autorisations très limitées selon les pays."],
    ["28-amino-acid neuropeptide acting on VPAC1 and VPAC2 receptors, involved in vasodilation, immunity and digestive function. Its synthetic drug form is called aviptadil.",
     "Not authorised as a medicine in the United States; aviptadil has been the subject of clinical trials and very limited authorisations depending on the country."]),
  igf1lr3: K(["igf-1 lr3", "igf1 lr3", "igf-1lr3", "igf1lr3", "igf 1 lr3", "long r3 igf-1", "lr3"],
    ["Analogue de l'IGF-1 humain de 83 acides aminés (substitution Arg3 et extension N-terminale de 13 acides aminés) qui se lie peu aux protéines de liaison de l'IGF (IGFBP). Il est surtout utilisé comme supplément de culture cellulaire.",
     "Réactif de recherche (culture cellulaire) ; non autorisé comme médicament."],
    ["83-amino-acid analogue of human IGF-1 (Arg3 substitution and 13-amino-acid N-terminal extension) with low binding to IGF-binding proteins (IGFBPs). It is mostly used as a cell-culture supplement.",
     "Research reagent (cell culture); not authorised as a medicine."]),
  igfdes: K(["igf-des", "igf des", "igfdes", "des(1-3) igf-1", "des 1-3 igf-1", "des igf-1"],
    ["Forme tronquée de l'IGF-1 (des(1-3)IGF-1) dépourvue des trois premiers acides aminés, avec une affinité réduite pour les IGFBP et une activité accrue sur le récepteur de l'IGF-1 en culture. Elle existe naturellement dans certains tissus, dont le cerveau.",
     "Réactif de recherche ; non autorisé comme médicament."],
    ["Truncated form of IGF-1 (des(1-3)IGF-1) lacking the first three amino acids, with reduced affinity for IGFBPs and enhanced activity at the IGF-1 receptor in culture. It occurs naturally in some tissues, including the brain.",
     "Research reagent; not authorised as a medicine."]),
  formula01: K(["formula 01", "formula 1", "formule 01", "formule 1", "f01", "f1"],
    ["Mélange de recherche Novalyx de deux composés : BPC-157 (10 mg) + TB-500 (10 mg) dans un même flacon lyophilisé. Voir les fiches BPC-157 et TB-500 pour la nature de chaque composant.",
     "Mélange propriétaire de composés de recherche ; aucun statut de médicament. Les statuts de ses composants sont ceux décrits dans leurs fiches."],
    ["Novalyx research blend of two compounds: BPC-157 (10 mg) + TB-500 (10 mg) in a single lyophilised vial. See the BPC-157 and TB-500 entries for the nature of each component.",
     "Proprietary blend of research compounds; no medicine status. The status of its components is as described in their own entries."]),
  formula02: K(["formula 02", "formula 2", "formule 02", "formule 2", "f02", "f2"],
    ["Mélange de recherche Novalyx de deux composés : CJC-1295 sans DAC (5 mg) + ipamoréline (5 mg) dans un même flacon lyophilisé. Voir leurs fiches pour la nature de chaque composant.",
     "Mélange propriétaire de composés de recherche ; aucun statut de médicament. Les statuts de ses composants sont ceux décrits dans leurs fiches."],
    ["Novalyx research blend of two compounds: CJC-1295 no DAC (5 mg) + ipamorelin (5 mg) in a single lyophilised vial. See their entries for the nature of each component.",
     "Proprietary blend of research compounds; no medicine status. The status of its components is as described in their own entries."]),
  formula03: K(["formula 03", "formula 3", "formule 03", "formule 3", "f03", "f3"],
    ["Mélange de recherche Novalyx de trois composés : BPC-157 (10 mg) + GHK-Cu (50 mg) + TB-500 (10 mg) dans un même flacon lyophilisé. Voir leurs fiches pour la nature de chaque composant.",
     "Mélange propriétaire de composés de recherche ; aucun statut de médicament. Les statuts de ses composants sont ceux décrits dans leurs fiches."],
    ["Novalyx research blend of three compounds: BPC-157 (10 mg) + GHK-Cu (50 mg) + TB-500 (10 mg) in a single lyophilised vial. See their entries for the nature of each component.",
     "Proprietary blend of research compounds; no medicine status. The status of its components is as described in their own entries."]),
  formula04: K(["formula 04", "formula 4", "formule 04", "formule 4", "f04", "f4"],
    ["Mélange de recherche Novalyx de quatre composés : BPC-157 (10 mg) + GHK-Cu (50 mg) + TB-500 (10 mg) + KPV (10 mg) dans un même flacon lyophilisé. Voir leurs fiches pour la nature de chaque composant.",
     "Mélange propriétaire de composés de recherche ; aucun statut de médicament. Les statuts de ses composants sont ceux décrits dans leurs fiches."],
    ["Novalyx research blend of four compounds: BPC-157 (10 mg) + GHK-Cu (50 mg) + TB-500 (10 mg) + KPV (10 mg) in a single lyophilised vial. See their entries for the nature of each component.",
     "Proprietary blend of research compounds; no medicine status. The status of its components is as described in their own entries."]),
  novalyxformula06: K(["formula 06", "formula 6", "formule 06", "formule 6", "f06", "f6"],
    ["Mélange de recherche Novalyx de deux composés : BPC-157 + TB-500, en deux conditionnements (10 mg au total : 5 mg + 5 mg ; 20 mg au total : 10 mg + 10 mg). Voir les fiches BPC-157 et TB-500.",
     "Mélange propriétaire de composés de recherche ; aucun statut de médicament. Les statuts de ses composants sont ceux décrits dans leurs fiches."],
    ["Novalyx research blend of two compounds: BPC-157 + TB-500, in two sizes (10 mg total: 5 mg + 5 mg; 20 mg total: 10 mg + 10 mg). See the BPC-157 and TB-500 entries.",
     "Proprietary blend of research compounds; no medicine status. The status of its components is as described in their own entries."]),
  novalyxformula07cagrisema: K(["formula 07", "formula 7", "formule 07", "formule 7", "f07", "f7", "cagrisema", "cagri sema"],
    ["Mélange de recherche Novalyx de deux composés : cagrilintide + sémaglutide, en deux conditionnements (2,5 mg + 2,5 mg ; 5 mg + 5 mg). Voir les fiches Cagrilintide et Semaglutide.",
     "Mélange propriétaire de composés de recherche ; ce n'est pas un médicament. Les statuts de ses composants sont ceux décrits dans leurs fiches."],
    ["Novalyx research blend of two compounds: cagrilintide + semaglutide, in two sizes (2.5 mg + 2.5 mg; 5 mg + 5 mg). See the Cagrilintide and Semaglutide entries.",
     "Proprietary blend of research compounds; it is not a medicine. The status of its components is as described in their own entries."]),
  novalyxformula08cjcipa: K(["formula 08", "formula 8", "formule 08", "formule 8", "f08", "f8"],
    ["Mélange de recherche Novalyx de deux composés : CJC-1295 + ipamoréline (5 mg + 5 mg). Voir leurs fiches pour la nature de chaque composant.",
     "Mélange propriétaire de composés de recherche ; aucun statut de médicament. Les statuts de ses composants sont ceux décrits dans leurs fiches."],
    ["Novalyx research blend of two compounds: CJC-1295 + ipamorelin (5 mg + 5 mg). See their entries for the nature of each component.",
     "Proprietary blend of research compounds; no medicine status. The status of its components is as described in their own entries."]),
  "bac-water": K(["bacteriostatic water", "bac water", "bac-water", "eau bacteriostatique", "eau bac", "bacteriostatique"],
    ["Eau stérile contenant 0,9 % d'alcool benzylique comme agent bactériostatique, destinée à la reconstitution en laboratoire de composés lyophilisés, en flacon multi-prélèvement.",
     "Solvant de laboratoire : il ne contient aucune substance active."],
    ["Sterile water containing 0.9% benzyl alcohol as a bacteriostatic agent, intended for laboratory reconstitution of lyophilised compounds, in a multi-draw vial.",
     "Laboratory solvent: it contains no active substance."]),
};

const botNorm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
/* Mots-clés : préfixe de mot (« dose » → dosage), mot exact avec « $ » (« card$ »), expression si espace */
const botHas = (t, list) => {
  const toks = t.split(" "), padded = " " + t + " ";
  return list.some((k) => {
    if (k.endsWith("$")) return toks.includes(k.slice(0, -1));
    if (k.includes(" ")) return k.endsWith("*") ? padded.includes(" " + k.slice(0, -1)) : padded.includes(" " + k + " ");
    return toks.some((w) => w.startsWith(k));
  });
};

/* Questions refusées : usage humain, dose, protocole, effets sur le corps, conseil médical */
const BOT_BLOCK = [
  "dose", "dosag", "dosing", "posologie", "protocol", "cycle de", "inject", "piq", "side effect*", "effet secondaire*", "effets secondaires", "effets indesirables", "effet indesirable*", "adverse effect*", "adverse event*", "contre indication*", "contraindication*",
  "bienfait", "benefit", "guer", "soign", "traitement", "traiter", "treat", "cure de", "heal$", "healing", "perdre du poids",
  "perte de poids", "maigr", "lose weight", "pour moi", "for me", "je veux prendre", "je vais prendre", "i want to take",
  "i m going to take", "combien en prendre", "combien prendre", "how much should", "how much do i", "comment prendre",
  "how to take", "comment s injecter", "comment l utiliser", "how to use it", "how do i use", "combien de mg", "how many mg",
  "par jour", "per day", "par semaine", "per week", "stack$", "stacking", "enceinte", "pregnan", "allaitement", "breastfeed",
  "musculation", "bodybuild", "prise de masse", "dangereu", "is it safe", "safe to", "securite pour", "conseil medical",
  "medical advice", "ordonnance", "prescription", "medecin", "doctor",
];
const BOT_REFUSE = {
  FR: "Je ne peux pas répondre à cette question. Les produits Novalyx sont des composés destinés exclusivement à la recherche en laboratoire (pas d'usage humain ni animal), et cet assistant ne donne ni dose, ni protocole, ni conseil médical. Pour toute question de santé, adressez-vous à un professionnel de santé.",
  EN: "I can't answer that question. Novalyx products are compounds supplied exclusively for laboratory research (no human or animal use), and this assistant gives no dose, protocol or medical advice. For any health question, please consult a healthcare professional.",
};
const BOT_NOTE = {
  FR: "Note : informations éducatives uniquement. Aucun conseil médical, aucune dose, aucune recommandation d'usage. Produit réservé à la recherche en laboratoire.",
  EN: "Note: educational information only. No medical advice, no dose, no usage recommendation. Product reserved for laboratory research.",
};


/* Définitions générales (science de base, sans lien avec un usage) */
const BOT_GLOSS = [
  { keys: ["peptide"], fr: "Un peptide est une courte chaîne d'acides aminés reliés entre eux (en général moins de 50). Au-delà, on parle plutôt de protéine.", en: "A peptide is a short chain of amino acids linked together (generally fewer than 50). Beyond that, it is usually called a protein." },
  { keys: ["lyophili", "freeze dried", "freeze drying"], fr: "La lyophilisation (séchage à froid sous vide) retire l'eau d'un produit congelé. La poudre obtenue est plus stable pour le transport et le stockage qu'une solution.", en: "Lyophilisation (freeze-drying under vacuum) removes water from a frozen product. The resulting powder is more stable for transport and storage than a solution." },
  { keys: ["hplc", "chromatograph"], fr: "La HPLC (chromatographie liquide haute performance) est une technique d'analyse qui sépare les constituants d'un échantillon pour mesurer la pureté d'un composé. Un rapport COA indique le pourcentage de pureté mesuré.", en: "HPLC (high-performance liquid chromatography) is an analytical technique that separates the components of a sample to measure a compound's purity. A COA report states the measured purity percentage." },
  { keys: ["agonist"], fr: "Un agoniste est une molécule qui se lie à un récepteur et l'active, comme le ferait le ligand naturel.", en: "An agonist is a molecule that binds to a receptor and activates it, as the natural ligand would." },
  { keys: ["secretagog"], fr: "Un sécrétagogue est une substance qui stimule la sécrétion d'une hormone. Les sécrétagogues de l'hormone de croissance agissent notamment via le récepteur de la ghréline.", en: "A secretagogue is a substance that stimulates the secretion of a hormone. Growth-hormone secretagogues act notably through the ghrelin receptor." },
  { keys: ["glp 1", "glp1", "incretin"], fr: "Le GLP-1 est une hormone incrétine sécrétée par l'intestin ; elle agit notamment sur la sécrétion d'insuline et la régulation de l'appétit via son récepteur.", en: "GLP-1 is an incretin hormone secreted by the gut; it acts notably on insulin secretion and appetite regulation through its receptor." },
  { keys: ["ghrh"], fr: "La GHRH est une hormone hypothalamique qui stimule la libération d'hormone de croissance par l'hypophyse.", en: "GHRH is a hypothalamic hormone that stimulates the release of growth hormone from the pituitary gland." },
  { keys: ["in vitro"], fr: "In vitro signifie « dans le verre » : des expériences menées hors d'un organisme vivant, en laboratoire (cultures de cellules, tubes à essai).", en: "In vitro means \"in glass\": experiments carried out outside a living organism, in the laboratory (cell cultures, test tubes)." },
  { keys: ["cardiolipin"], fr: "La cardiolipine est un phospholipide caractéristique de la membrane interne des mitochondries, important pour la production d'énergie cellulaire.", en: "Cardiolipin is a phospholipid characteristic of the inner mitochondrial membrane, important for cellular energy production." },
  { keys: ["angiogen"], fr: "L'angiogenèse est la formation de nouveaux vaisseaux sanguins à partir de vaisseaux existants.", en: "Angiogenesis is the formation of new blood vessels from existing ones." },
  { keys: ["telomeras"], fr: "La télomérase est une enzyme qui allonge les télomères, les extrémités protectrices des chromosomes.", en: "Telomerase is an enzyme that lengthens telomeres, the protective ends of chromosomes." },
  { keys: ["bdnf"], fr: "Le BDNF (brain-derived neurotrophic factor) est une protéine impliquée dans la survie et la plasticité des neurones.", en: "BDNF (brain-derived neurotrophic factor) is a protein involved in neuronal survival and plasticity." },
];

const botGreeting = (lang) => lang === "FR"
  ? "Bonjour, je suis l'assistant Novalyx. Je peux vous renseigner sur nos composés de recherche (nature, mécanisme, statut réglementaire), les prix, la livraison, le paiement, la conservation et les analyses COA.\n\nJe ne donne ni dose, ni protocole, ni conseil médical."
  : "Hello, I'm the Novalyx assistant. I can tell you about our research compounds (nature, mechanism, regulatory status), prices, shipping, payment, storage and COA analyses.\n\nI give no dose, protocol or medical advice.";
const botChips = (lang) => lang === "FR"
  ? ["Quels produits sont disponibles ?", "C'est quoi le GLP-3RT ?", "Livraison", "Paiement", "Analyses COA", "Conservation"]
  : ["Which products are available?", "What is GLP-3RT?", "Shipping", "Payment", "COA analyses", "Storage"];

/* Détection de la molécule : on retient l'alias le plus long trouvé (ex. « melanotan ii » l'emporte sur « melanotan i ») */
const botFindProduct = (text) => {
  const padded = " " + botNorm(text) + " ";
  let best = null, bestLen = 0;
  for (const p of PRODUCTS) {
    const kb = BOT_KB[p.id];
    const aliases = [p.name, p.id].concat(kb ? kb.aliases : []);
    for (const a of aliases) {
      const n = botNorm(a);
      for (const v of [n, n.replace(/ /g, "")]) {
        if (v.length > 1 && padded.includes(" " + v + " ") && v.length > bestLen) { best = p; bestLen = v.length; }
      }
    }
  }
  return best;
};

const botStorage = (p, lang) => {
  if (p && p.id === "bac-water") return lang === "FR" ? "Eau bactériostatique : à température ambiante, à l'abri de la lumière directe, flacon scellé." : "Bacteriostatic water: at room temperature, away from direct light, vial sealed.";
  return lang === "FR"
    ? "Avant reconstitution : à sec, à température ambiante, à l'abri de la lumière, flacon scellé. Après reconstitution : entre 2 et 8 °C (réfrigérateur)."
    : "Before reconstitution: dry, at room temperature, away from light, vial sealed. After reconstitution: between 2 and 8 °C (refrigerated).";
};

const botPriceLine = (p, cur, lang) => {
  const sizes = p.variants.map((v) => v.size + " : " + price(v.price, cur, lang)).join("\n");
  const avail = isAvail(p)
    ? (lang === "FR" ? "Disponible à l'achat en ligne." : "Available to order online.")
    : (lang === "FR" ? "Pas encore disponible à l'achat en ligne (bientôt)." : "Not yet available to order online (coming soon).");
  return p.name + "\n" + sizes + "\n\n" + avail;
};

const botCatalogue = (lang) => {
  const lines = CATEGORY_ORDER.map((c) => {
    const names = PRODUCTS.filter((p) => p.category === c).map((p) => p.name).join(", ");
    return names ? tp(lang, c) + " : " + names : null;
  }).filter(Boolean);
  return (lang === "FR" ? "Notre catalogue (" + PRODUCTS.length + " références) :\n\n" : "Our catalogue (" + PRODUCTS.length + " items):\n\n") + lines.join("\n");
};

const botAnswer = (text, ctx) => {
  const lang = ctx.lang, cur = ctx.cur, FR = lang === "FR";
  const t = botNorm(text);
  const note = BOT_NOTE[lang];
  if (!t) return botGreeting(lang);

  // 1) refus : usage humain / dose / conseil médical
  if (botHas(t, BOT_BLOCK)) return BOT_REFUSE[lang];

  const p = botFindProduct(text);
  const email = CONFIG.EMAIL;

  const qPrice = botHas(t, ["prix", "cout", "tarif", "price", "cost$", "costs$", "taille", "conditionnement", "size$", "sizes$", "variante", "format$", "formats$"]);
  const qAvail = botHas(t, ["dispo", "available", "en stock", "in stock", "en vente", "achet", "buy", "command", "order$", "orders$", "purchas", "commercialis"]);
  const qStorage = botHas(t, ["conserv", "stockage", "storage", "store$", "stored$", "storing$", "temperature", "frigo", "refriger", "fridge", "congel", "freez"]);
  const qRecon = botHas(t, ["reconstitu", "dilu", "dissoudre", "dissolve", "melang", "mixing"]);
  const qCoa = botHas(t, ["coa$", "analys", "certificat", "purete", "purity", "janoshik", "batch", "rapport", "report$", "reports$", "verifi"]);
  const qShip = botHas(t, ["livr", "expedi", "delai", "shipping", "ship$", "shipped$", "delivery", "deliver", "douane", "customs", "suivi", "tracking", "colis"]);
  const qPay = botHas(t, ["paiement", "payer", "payment", "pay$", "paying$", "stripe", "carte$", "cartes$", "card$", "cards$", "virement", "transfer$", "transfers$", "iban", "apple pay", "bank"]);
  const qReturn = botHas(t, ["retour", "rembours", "refund", "return$", "returns$", "echange$"]);
  const qAmb = botHas(t, ["ambassad", "affili", "partenariat", "partnership", "code promo", "codes promo", "promo code", "promo codes", "influenc", "createur", "creator"]);
  const qContact = botHas(t, ["contact", "email$", "mail$", "e mail", "joindre", "telephone", "phone$", "support$", "service client"]);
  const qWho = botHas(t, ["qui etes", "who are you", "about you", "about us", "about novalyx", "entreprise", "company$", "siret", "adresse", "address$", "paris$"]);
  const qLegal = botHas(t, ["legal", "loi$", "law$", "reglement", "regulation", "usage", "humain", "human", "animal", "complement", "supplement", "cosmetique", "cosmetic", "recherche seulement", "research use"]);
  const qCat = botHas(t, ["catalogue", "liste$", "quels produits", "what do you sell", "which products", "produit", "product", "gamme", "molecule", "composes$", "compounds$", "compound$"]);
  const qHello = botHas(t, ["bonjour", "salut", "hello", "coucou", "bonsoir", "hi$", "hey$"]);
  const qThanks = botHas(t, ["merci", "thanks", "thank you"]);

  // 2) questions propres à une molécule
  if (p) {
    if (qPrice || qAvail) return botPriceLine(p, cur, lang) + "\n\n" + note;
    if (qStorage) return botStorage(p, lang) + "\n\n" + note;
    if (qRecon) return (FR
      ? "Les composés sont fournis sous forme lyophilisée ; la reconstitution se fait en laboratoire avec un solvant stérile adapté (par exemple notre eau bactériostatique). Nous ne fournissons ni protocole ni volumes. Après reconstitution, conservation entre 2 et 8 °C."
      : "Compounds are supplied lyophilised; reconstitution is done in the laboratory with a suitable sterile solvent (for example our bacteriostatic water). We provide no protocol or volumes. After reconstitution, store between 2 and 8 °C.") + "\n\n" + note;
    if (qCoa) {
      const c = COAS[p.id];
      return (c
        ? (FR ? p.name + " " + c.size + " : analyse Janoshik Analytical, pureté HPLC " + c.purity.replace(".", ",") + " %. Le rapport original et sa clé de vérification sont sur la page Analyses."
              : p.name + " " + c.size + ": Janoshik Analytical analysis, HPLC purity " + c.purity + "%. The original report and its verification key are on the Analyses page.")
        : (FR ? "Le rapport d'analyse de " + p.name + " sera publié dès l'analyse du premier lot par Janoshik Analytical (laboratoire indépendant)."
              : "The analysis report for " + p.name + " will be published once the first batch has been analysed by Janoshik Analytical (independent laboratory)."))
        + "\n\n" + note;
    }
  }

  // 3) sujets généraux
  if (qRecon) return FR
    ? "Les composés sont fournis sous forme lyophilisée ; la reconstitution se fait en laboratoire avec un solvant stérile adapté (par exemple notre eau bactériostatique). Nous ne fournissons ni protocole ni volumes. Après reconstitution, conservation entre 2 et 8 °C."
    : "Compounds are supplied lyophilised; reconstitution is done in the laboratory with a suitable sterile solvent (for example our bacteriostatic water). We provide no protocol or volumes. After reconstitution, store between 2 and 8 °C.";
  if (qStorage) return botStorage(p, lang);
  if (qCoa) {
    const c = COAS.retatrutide;
    return FR
      ? "Les analyses sont réalisées par Janoshik Analytical (République tchèque), laboratoire indépendant. Le rapport du GLP-3RT " + c.size + " est publié (pureté HPLC " + c.purity.replace(".", ",") + " %) avec sa clé de vérification : voir la page Analyses. Pour les autres composés, le rapport sera publié dès l'analyse du premier lot."
      : "Analyses are performed by Janoshik Analytical (Czech Republic), an independent laboratory. The GLP-3RT " + c.size + " report is published (HPLC purity " + c.purity + "%) with its verification key: see the Analyses page. For other compounds, the report will be published once the first batch has been analysed.";
  }
  if (qShip) return FR
    ? "Les commandes sont expédiées depuis Paris sous 24 h après confirmation du paiement. Livraison en 2 à 3 jours maximum en France ; plus long pour le reste du monde (voir la page Livraison). Frais selon le pays : France 6,90 €, UE 9,90 €, Suisse/Royaume-Uni 14,90 €, États-Unis/Canada 24,90 €, Australie, Nouvelle-Zélande et autres pays 29,90 € (offerte en France et dans l'UE sur les Packs de GLP-3RT ; eau bactériostatique 3,99 € en France et dans l'UE). Un numéro de suivi est communiqué à l'expédition. Hors Union européenne, l'acheteur est responsable des droits de douane et de la conformité locale."
    : "Orders are shipped from Paris within 24 h of payment confirmation. Delivery in 2 to 3 days maximum within France; longer for the rest of the world (see the Shipping page). Shipping by country: France €6.90, EU €9.90, Switzerland/UK €14.90, USA/Canada €24.90, Australia, New Zealand and other countries €29.90 (free in France and the EU on GLP-3RT Packs; bacteriostatic water €3.99 in France and the EU). A tracking number is sent on dispatch. Outside the European Union, the buyer is responsible for customs duties and local compliance.";
  if (qPay) return FR
    ? "Paiement par carte bancaire via Stripe (vos données bancaires ne transitent jamais par nos serveurs), ou par virement bancaire, même pour une petite commande : choisissez « Payer par virement bancaire » dans le panier. La commande est expédiée à réception du virement. Une question : " + email + "."
    : "Payment by card through Stripe (your banking data never touch our servers), or by bank transfer, even for a small order: choose \"Pay by bank transfer\" in the cart. The order is shipped once the transfer is received. Any question: " + email + ".";
  if (qReturn) return FR
    ? "Si un produit arrive endommagé ou ne correspond pas aux spécifications de son rapport, contactez-nous dans les 7 jours à " + email + " : nous étudions chaque cas (remplacement ou remboursement si approprié). Les produits ouverts ne peuvent pas être retournés pour des raisons de sécurité."
    : "If a product arrives damaged or does not match its report specifications, contact us within 7 days at " + email + ": we review each case (replacement or refund where appropriate). Opened products cannot be returned for safety reasons.";
  if (!p && qAmb) return FR
    ? "Nous avons un programme Ambassadeurs : un code personnel pour votre audience et une commission sur les ventes générées. Voir la page Ambassadeurs ou écrivez à " + email + "."
    : "We have an Ambassador program: a personal code for your audience and a commission on the sales generated. See the Ambassadors page or write to " + email + ".";
  if (!p && qContact) return FR
    ? "Écrivez-nous à " + email + " : réponse sous un jour ouvré. Vous pouvez aussi utiliser la page Contact."
    : "Write to us at " + email + ": reply within one business day. You can also use the Contact page.";
  if (!p && qWho) return FR
    ? CONFIG.BUSINESS_NAME + " est une entreprise française basée à Paris (SIRET " + CONFIG.SIRET + "), " + CONFIG.ADDRESS + ". Nous fournissons des composés de recherche lyophilisés aux laboratoires et professionnels. Contact : " + email + "."
    : CONFIG.BUSINESS_NAME + " is a French company based in Paris (SIRET " + CONFIG.SIRET + "), " + CONFIG.ADDRESS + ". We supply lyophilised research compounds to laboratories and professionals. Contact: " + email + ".";
  if (!p && qLegal) return FR
    ? "Tous les produits Novalyx sont des composés destinés exclusivement à la recherche en laboratoire (in vitro) : ni médicaments, ni compléments alimentaires, ni cosmétiques, sans usage humain ni animal. Les commandes sont réservées aux adultes et aux professionnels qualifiés. Il vous appartient de vérifier la réglementation applicable dans votre pays."
    : "All Novalyx products are compounds supplied exclusively for laboratory research (in vitro): not medicines, dietary supplements or cosmetics, with no human or animal use. Orders are reserved for adults and qualified professionals. It is your responsibility to check the regulations applicable in your country.";
  if (qAvail) {
    const names = AVAILABLE.map((id) => { const q = PRODUCTS.find((x) => x.id === id); return q ? q.name : id; }).join(", ");
    return FR
      ? "Disponibles à l'achat en ligne actuellement : " + names + ". Les autres références sont affichées « bientôt disponible »."
      : "Currently available to order online: " + names + ". Other items are shown as \"coming soon\".";
  }
  if (!p && qCat) return botCatalogue(lang);
  if (qPrice) return FR ? "De quel produit parlez-vous ? Indiquez son nom (par exemple « prix du GLP-3RT »)." : "Which product do you mean? Give its name (for example \"price of GLP-3RT\").";

  // 4) fiche d'information sur la molécule
  if (p) {
    const kb = BOT_KB[p.id];
    if (kb) {
      const d = kb[FR ? "fr" : "en"];
      const avail = AVAILABLE.indexOf(p.id) >= 0;
      const stock = avail
        ? (FR ? "Sur Novalyx : disponible à l'achat." : "On Novalyx: available to order.")
        : (FR ? "Sur Novalyx : bientôt disponible (non achetable pour le moment)." : "On Novalyx: coming soon (not yet available to order).");
      return p.name + "\n\n" + d[0] + "\n\n" + (FR ? "Statut (vérifié en " + BOT_DATE.FR + ") : " : "Status (checked " + BOT_DATE.EN + "): ") + d[1] + "\n\n" + stock + "\n\n" + note;
    }
  }

  for (const g of BOT_GLOSS) if (botHas(t, g.keys)) return g[FR ? "fr" : "en"] + "\n\n" + note;
  if (qThanks) return FR ? "Avec plaisir. N'hésitez pas si vous avez d'autres questions." : "You're welcome. Feel free to ask anything else.";
  if (qHello) return botGreeting(lang);

  return FR
    ? "Je n'ai pas d'information fiable sur ce point et je préfère ne pas improviser. Écrivez-nous à " + email + " (réponse sous un jour ouvré), ou choisissez une question ci-dessous."
    : "I don't have reliable information on this and I prefer not to improvise. Write to us at " + email + " (reply within one business day), or pick a question below.";
};
/* BOT:END */

/* ─── WIDGET CHATBOT ─────────────────────────────────────── */
const Chatbot = ({ lang, cur }) => {
  const FR = lang === "FR";
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState([]);
  const endRef = useRef(null);
  useEffect(() => { setMsgs([{ from: "bot", text: botGreeting(lang) }]); }, [lang]);
  useEffect(() => { if (open && endRef.current) endRef.current.scrollIntoView({ block: "end" }); }, [msgs, open]);
  const ask = (q) => {
    const text = (q !== undefined ? q : input).trim();
    if (!text) return;
    setMsgs((m) => [...m, { from: "user", text }, { from: "bot", text: botAnswer(text, { lang, cur }) }]);
    setInput("");
  };
  return (
    <>
      {open && (
        <div className="bot-panel fade" role="dialog" aria-label={FR ? "Assistant Novalyx" : "Novalyx assistant"}>
          <div className="bot-head">
            <div>
              <div className="bot-title">{FR ? "Assistant Novalyx" : "Novalyx assistant"}</div>
              <div className="bot-sub">{FR ? "Informations éducatives uniquement" : "Educational information only"}</div>
            </div>
            <button className="x" onClick={() => setOpen(false)} aria-label={FR ? "Fermer" : "Close"}>✕</button>
          </div>
          <div className="bot-body">
            {msgs.map((m, i) => <div key={i} className={"bot-msg " + m.from}>{m.text}</div>)}
            <div ref={endRef} />
          </div>
          <div className="bot-chips">
            {botChips(lang).map((c) => <button key={c} className="fchip" onClick={() => ask(c)}>{c}</button>)}
          </div>
          <form className="bot-form" onSubmit={(e) => { e.preventDefault(); ask(); }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={FR ? "Votre question…" : "Your question…"} aria-label={FR ? "Votre question" : "Your question"} />
            <button className="btn btn-ink" type="submit">{FR ? "Envoyer" : "Send"}</button>
          </form>
        </div>
      )}
      <button className="bot-fab" onClick={() => setOpen((o) => !o)} aria-label={FR ? "Ouvrir l'assistant" : "Open the assistant"}>
        {open ? "✕" : (FR ? "Assistant" : "Assistant")}
      </button>
    </>
  );
};

/* ─── SEO : titre, description, aperçu de partage, favicon (par page et par langue) ───── */
const getSeo = (page, lang) => {
  const FR = lang === "FR";
  const n = PRODUCTS.length;
  const S = {
    home: FR ? ["Novalyx Research | Composés de recherche lyophilisés, Paris", "Composés de recherche lyophilisés pour laboratoires et professionnels, avec analyses indépendantes Janoshik vérifiables. Usage recherche uniquement. Paris."]
             : ["Novalyx Research | Lyophilised research compounds, Paris", "Lyophilised research compounds for laboratories and professionals, with verifiable independent Janoshik analyses. Research use only. Based in Paris."],
    products: FR ? ["Catalogue de composés de recherche | Novalyx Research", n + " composés de recherche lyophilisés par domaine : métabolique, régénératif, longévité, hormone de croissance, immunité, cognitif. Usage recherche uniquement."]
                 : ["Research compound catalogue | Novalyx Research", n + " lyophilised research compounds by area: metabolic, regenerative, longevity, growth hormone, immune, cognitive. Research use only."],
    coa: FR ? ["Analyses indépendantes Janoshik (COA) | Novalyx Research", "Rapports d'analyse Janoshik Analytical publiés avec leur clé de vérification : pureté HPLC et quantité mesurée, vérifiables à la source."]
            : ["Independent Janoshik analyses (COA) | Novalyx Research", "Janoshik Analytical reports published with their verification key: HPLC purity and measured content, verifiable at the source."],
    learning: FR ? ["Fiches composés | Novalyx Research", "Informations factuelles et scientifiques sur les composés du catalogue. Aucune allégation de santé. Usage recherche uniquement."]
                 : ["Compound notes | Novalyx Research", "Factual, scientific information on the compounds in the catalogue. No health claims. Research use only."],
    about: FR ? ["Notre méthode | Novalyx Research", "Analyses indépendantes, rapports vérifiables et traçabilité des lots : la méthode de Novalyx Research, entreprise française basée à Paris."]
              : ["Our method | Novalyx Research", "Independent analyses, verifiable reports and batch traceability: the method of Novalyx Research, a French company based in Paris."],
    faq: FR ? ["Questions fréquentes | Novalyx Research", "Livraison, paiement, analyses COA, conservation et conformité : réponses aux questions fréquentes sur Novalyx Research."]
            : ["Frequently asked questions | Novalyx Research", "Shipping, payment, COA analyses, storage and compliance: answers to frequently asked questions about Novalyx Research."],
    ambassador: FR ? ["Programme Ambassadeurs | Novalyx Research", "Rejoignez le programme ambassadeurs de Novalyx Research : un code personnel pour votre audience et une commission sur les ventes générées."]
                   : ["Ambassador program | Novalyx Research", "Join the Novalyx Research ambassador program: a personal code for your audience and a commission on the sales generated."],
    contact: FR ? ["Contact | Novalyx Research", "Contactez Novalyx Research à Paris : produits, commandes, documents et tarifs professionnels. Réponse sous un jour ouvré."]
                : ["Contact | Novalyx Research", "Contact Novalyx Research in Paris: products, orders, documents and professional pricing. Reply within one business day."],
    shipping: FR ? ["Livraison et expédition | Novalyx Research", "Expédition depuis Paris, suivi de colis, zones et tarifs. Informations pour les commandes hors Union européenne."]
                 : ["Shipping and delivery | Novalyx Research", "Shipping from Paris, parcel tracking, zones and rates. Information for orders outside the European Union."],
    privacy: FR ? ["Politique de confidentialité | Novalyx Research", "Comment Novalyx Research collecte et protège vos données personnelles, conformément au RGPD."]
                : ["Privacy policy | Novalyx Research", "How Novalyx Research collects and protects your personal data, in line with the GDPR."],
    terms: FR ? ["Conditions générales | Novalyx Research", "Conditions générales de vente de Novalyx Research : commandes, paiement, livraison, retours et responsabilité."]
              : ["Terms and conditions | Novalyx Research", "Novalyx Research terms and conditions: orders, payment, shipping, returns and liability."],
    disclaimer: FR ? ["Avertissement | Novalyx Research", "Tous les produits sont destinés exclusivement à la recherche en laboratoire. Ni médicaments, ni compléments, aucun conseil médical."]
                   : ["Disclaimer | Novalyx Research", "All products are intended exclusively for laboratory research. Not medicines or supplements, no medical advice."],
  };
  return S[page] || S.home;
};
const setMeta = (attr, key, val) => {
  let el = document.head.querySelector("meta[" + attr + "=\"" + key + "\"]");
  if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute("content", val);
};
const setLink = (rel, href) => {
  let el = document.head.querySelector("link[rel=\"" + rel + "\"]");
  if (!el) { el = document.createElement("link"); el.setAttribute("rel", rel); document.head.appendChild(el); }
  el.setAttribute("href", href);
};
const FAVICON = "data:image/svg+xml," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'><rect width='48' height='48' rx='10' fill='#F5F3EE'/><line x1='19' y1='20' x2='31' y2='15' stroke='#62B94A' stroke-width='2.2'/><line x1='34' y1='14' x2='35' y2='28' stroke='#62B94A' stroke-width='2.2'/><line x1='19' y1='20' x2='33' y2='30' stroke='#0B1B2E' stroke-width='2.2'/><line x1='17' y1='21' x2='12' y2='30' stroke='#A9B3C1' stroke-width='2.2'/><circle cx='34' cy='12' r='5.5' fill='#62B94A'/><circle cx='18' cy='19' r='5' fill='#0B1B2E'/><circle cx='34' cy='31' r='5' fill='#0B1B2E'/><circle cx='11' cy='32' r='3.8' fill='#A9B3C1'/></svg>");

/* ═══════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════ */
export default function App() {
  const [ageOk, setAgeOk] = useState(false);
  const [gateOrg, setGateOrg] = useState("");
  const [gateAge, setGateAge] = useState(false);
  const [gatePro, setGatePro] = useState(false);
  const [gateUse, setGateUse] = useState(false);
  const [gateClosing, setGateClosing] = useState(false);
  const [consent, setConsent] = useState(undefined); // undefined = pas encore lu, null = pas de choix valide
  const [cookieOpen, setCookieOpen] = useState(false);

  // Lecture du choix cookies (valable 6 mois, recommandation CNIL)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("novalyx_consent");
      const c = raw ? JSON.parse(raw) : null;
      const SIX_MONTHS = 1000 * 60 * 60 * 24 * 182;
      setConsent(c && c.ts && Date.now() - c.ts < SIX_MONTHS ? c : null);
    } catch (e) { setConsent(null); }
  }, []);
  const saveConsent = (c) => {
    const obj = { analytics: !!c.analytics, marketing: !!c.marketing, ts: Date.now() };
    setConsent(obj); setCookieOpen(false);
    try { localStorage.setItem("novalyx_consent", JSON.stringify(obj)); } catch (e) {}
  };
  // Les scripts de suivi ne se chargent QUE si l'utilisateur a accepté.
  useEffect(() => {
    if (consent && consent.analytics) {
      // ICI : coller le script de mesure d'audience (ex. Google Analytics)
    }
    if (consent && consent.marketing) {
      // ICI : coller les pixels publicitaires (Meta Pixel, Google Ads)
    }
  }, [consent]);

  const [page, setPage] = useState("home");
  const [cur, setCur] = useState("EUR");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [productFilter, setProductFilter] = useState("All");
  const [lang, setLang] = useState("FR");
  const [product, setProduct] = useState(null);

  // SEO : titre, description, aperçu de partage, favicon, adresse canonique et données structurées
  useEffect(() => {
    const seo = getSeo(page, lang);
    document.title = seo[0];
    setMeta("name", "description", seo[1]);
    setMeta("name", "robots", "index, follow");
    setMeta("name", "theme-color", "#F5F3EE");
    setMeta("property", "og:title", seo[0]);
    setMeta("property", "og:description", seo[1]);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", CONFIG.SITE_URL);
    setMeta("property", "og:site_name", CONFIG.BUSINESS_NAME);
    setMeta("property", "og:locale", lang === "FR" ? "fr_FR" : "en_GB");
    setMeta("name", "twitter:card", "summary");
    setLink("canonical", CONFIG.SITE_URL);
    setLink("icon", FAVICON);
    let ld = document.getElementById("ld-org");
    if (!ld) { ld = document.createElement("script"); ld.id = "ld-org"; ld.type = "application/ld+json"; document.head.appendChild(ld); }
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org", "@type": "Organization",
      name: CONFIG.BUSINESS_NAME, url: CONFIG.SITE_URL, email: CONFIG.EMAIL, identifier: CONFIG.SIRET,
      address: { "@type": "PostalAddress", streetAddress: "44 Rue Pasquier", postalCode: "75008", addressLocality: "Paris", addressCountry: "FR" },
    });
  }, [page, lang]);

  useEffect(() => {
    try {
      const c = localStorage.getItem("novalyx_cart"); if (c) setCart(JSON.parse(c).filter(i => AVAILABLE.includes(i.id)));
      const k = localStorage.getItem("novalyx_currency"); if (k && CURRENCIES[k]) setCur(k);
      const l = localStorage.getItem("novalyx_lang"); if (l === "FR" || l === "EN") setLang(l);
      if (sessionStorage.getItem("novalyx_gate") === "1") setAgeOk(true);
    } catch (e) {}
  }, []);
  useEffect(() => { try { localStorage.setItem("novalyx_cart", JSON.stringify(cart)); } catch (e) {} }, [cart]);
  useEffect(() => { try { localStorage.setItem("novalyx_currency", cur); } catch (e) {} }, [cur]);
  useEffect(() => { try { localStorage.setItem("novalyx_lang", lang); } catch (e) {} ; document.documentElement.lang = lang === "FR" ? "fr" : "en"; }, [lang]);

  const go = (p, filter) => { setPage(p); if (filter !== undefined) setProductFilter(filter); window.scrollTo(0, 0); };
  const addToCart = (p, v, q = 1) => {
    if (!isAvail(p)) return;
    const lineId = `${p.id}-${v.size}`;
    setCart(prev => {
      const ex = prev.find(i => i.lineId === lineId);
      if (ex) return prev.map(i => i.lineId === lineId ? { ...i, qty: i.qty + q } : i);
      return [...prev, { lineId, id: p.id, name: p.name, size: v.size, batch: v.batch, price: v.price, stripeLink: getStripeLink(p.id, v.size), qty: q }];
    });
    setCartOpen(true);
  };
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const FR = lang === "FR";
  const gateReady = gateAge && gatePro && gateUse;
  const enter = () => {
    if (!gateReady) return;
    setGateClosing(true);
    try { sessionStorage.setItem("novalyx_gate", "1"); } catch (e) {}
    setTimeout(() => setAgeOk(true), 350);
  };

  const pages = {
    home: <Home go={go} cur={cur} lang={lang} openProduct={setProduct} />,
    products: <ProductsPage cur={cur} lang={lang} openProduct={setProduct} initialFilter={productFilter} setProductFilter={setProductFilter} />,
    coa: <COAPage lang={lang} openProduct={setProduct} />,
    learning: <LearningPage lang={lang} />,
    about: <AboutPage go={go} lang={lang} />,
    faq: <FAQPage lang={lang} />,
    ambassador: <AmbassadorPage lang={lang} />,
    contact: <ContactPage lang={lang} />,
    shipping: <ShippingPage lang={lang} />,
    privacy: <PrivacyPage lang={lang} />,
    terms: <TermsPage lang={lang} />,
    disclaimer: <DisclaimerPage lang={lang} />,
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <style>{CSS}</style>

      {!ageOk && (
        <div className={`gate${gateClosing ? " closing" : ""}`}>
          <div className="gate-card fade">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", border: "1.5px solid var(--green)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#1E6A43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="eyebrow">{FR ? "Accès professionnel" : "Professional access"}</div>
            </div>
            <h2 className="h2" style={{ fontSize: 30, marginBottom: 10 }}>{FR ? "Réservé à la recherche en laboratoire." : "Reserved for laboratory research."}</h2>
            <p className="muted" style={{ fontSize: 13.5, marginBottom: 22, lineHeight: 1.7 }}>{t(lang, "age_desc")}</p>

            <div className="field" style={{ marginBottom: 16 }}>
              <label>{t(lang, "age_org_label")}</label>
              <input type="text" value={gateOrg} onChange={e => setGateOrg(e.target.value)} placeholder={t(lang, "age_org_placeholder")} />
            </div>

            <label className="check"><input type="checkbox" checked={gateAge} onChange={e => setGateAge(e.target.checked)} /><span>{t(lang, "age_check_age")}</span></label>
            <label className="check"><input type="checkbox" checked={gatePro} onChange={e => setGatePro(e.target.checked)} /><span>{t(lang, "age_check_pro")}</span></label>
            <label className="check"><input type="checkbox" checked={gateUse} onChange={e => setGateUse(e.target.checked)} /><span>{t(lang, "age_check_use")}</span></label>

            <button className="btn btn-ink" style={{ width: "100%", marginTop: 8 }} disabled={!gateReady} onClick={enter}>{t(lang, "age_enter")}</button>
            <p className="muted" style={{ fontSize: 10, marginTop: 14, lineHeight: 1.6, textAlign: "center" }}>{t(lang, "age_footer")}</p>
            <div className="lang" style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
              {["FR", "EN"].map(l => <button key={l} className={lang === l ? "on" : ""} onClick={() => setLang(l)}>{l}</button>)}
            </div>
          </div>
        </div>
      )}

      <div className="notice">{FR ? "Produits destinés exclusivement à la recherche en laboratoire — pas pour consommation humaine ou animale" : "Products for laboratory research use only — not for human or animal consumption"}</div>
      <Nav page={page} go={go} cur={cur} setCur={setCur} cartCount={cartCount} openCart={() => setCartOpen(true)} lang={lang} setLang={setLang} />
      <main className="fade" key={`${page}-${lang}`}>{pages[page] || pages.home}</main>
      <Footer go={go} lang={lang} onCookies={() => setCookieOpen(true)} />

      {product && <ProductModal p={product} cur={cur} lang={lang} onAdd={addToCart} onClose={() => setProduct(null)} />}
      {cartOpen && <Cart cart={cart} cur={cur} lang={lang} onClose={() => setCartOpen(false)} onRemove={id => setCart(c => c.filter(i => i.lineId !== id))} />}
      {ageOk && consent !== undefined && (consent === null || cookieOpen) && (
        <CookieBanner lang={lang} initial={consent} onSave={saveConsent} go={(p) => { setCookieOpen(false); go(p); }} />
      )}
      {ageOk && consent && !cookieOpen && <Chatbot lang={lang} cur={cur} />}
    </div>
  );
}
