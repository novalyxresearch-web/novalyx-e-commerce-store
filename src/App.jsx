import { useState, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════
   🔧 CONFIG — swap these when you have your details
═══════════════════════════════════════════════════════════ */
const CONFIG = {
  STRIPE_PUBLISHABLE_KEY: "pk_live_51TexuAEynlu0HG7FDZS29RRn4GgrhdpGZ9ucl83bNQm1gAi3uHi5JGAPfGkJzHvhoeWB42NXO0cQcwUt6vT8QGqi00W6VFqyXX",
  BUSINESS_NAME:          "Novalyx Research",
  SIRET:                  "898 509 369 00028",
  VAT_STATUS:             "TVA non applicable, art. 293B du CGI",
  EMAIL:                  "contact@novalyxresearch.com",
  ADDRESS:                "44 Rue Pasquier, 75008 Paris, France",
  STRIPE_ENABLED:         true,
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
    nav_products: "PRODUCTS", nav_coa: "COA LIBRARY", nav_about: "ABOUT", nav_faq: "FAQ", nav_contact: "CONTACT",
    // Announcement bar
    ann1: "EU BASED", ann2: "BATCH TESTED", ann3: "SHIPS FROM EU", ann4: "CONTROLLED FULFILLMENT",
    // Age gate
    age_title: "Professional Access",
    age_desc: "Novalyx Research supplies compounds exclusively for laboratory research. Access is restricted to qualified professionals.",
    age_confirm: "I confirm I am a qualified professional and this order is for laboratory research use only.",
    age_enter: "ENTER SITE →",
    age_footer: "By entering you confirm compliance with all applicable laws in your jurisdiction.",
    // Product card
    available_in: "AVAILABLE IN:",
    coa_dl: "COA: Downloadable after purchase",
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
    hero_desc: "Independent third-party tested. Every batch. COA included. Shipped across Europe.",
    hero_browse: "BROWSE COMPOUNDS →",
    hero_coa: "VIEW COA LIBRARY",
    hero_stat1: "Research Compounds", hero_stat2: "Purity Guarantee", hero_stat3: "EU Shipping",
    // Products page
    prod_sub: "OUR COMPOUNDS",
    prod_h1: "Research Catalog",
    prod_desc: "27 research compounds across 8 categories. Every batch independently tested. COA included with every order. Supplied for research use only.",
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
    nav_products: "PRODUITS", nav_coa: "BIBLIOTHÈQUE COA", nav_about: "À PROPOS", nav_faq: "FAQ", nav_contact: "CONTACT",
    // Announcement bar
    ann1: "BASÉ EN UE", ann2: "TESTÉ PAR LOT", ann3: "EXPÉDIÉ DEPUIS L'UE", ann4: "FULFILLMENT CONTRÔLÉ",
    // Age gate
    age_title: "Accès Professionnel",
    age_desc: "Novalyx Research fournit des composés exclusivement pour la recherche en laboratoire. L'accès est réservé aux professionnels qualifiés.",
    age_confirm: "Je confirme être un professionnel qualifié et que cette commande est uniquement destinée à la recherche en laboratoire.",
    age_enter: "ACCÉDER AU SITE →",
    age_footer: "En entrant, vous confirmez être en conformité avec toutes les lois applicables dans votre juridiction.",
    // Product card
    available_in: "DISPONIBLE EN :",
    coa_dl: "COA : Téléchargeable après achat",
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
    hero_desc: "Testés par des tiers indépendants. Chaque lot. COA inclus. Expédiés dans toute l'Europe.",
    hero_browse: "VOIR LES COMPOSÉS →",
    hero_coa: "VOIR LA BIBLIOTHÈQUE COA",
    hero_stat1: "Composés de Recherche", hero_stat2: "Garantie de Pureté", hero_stat3: "Livraison UE",
    // Products page
    prod_sub: "NOS COMPOSÉS",
    prod_h1: "Catalogue de Recherche",
    prod_desc: "27 composés de recherche dans 8 catégories. Chaque lot testé indépendamment. COA inclus avec chaque commande. Fourni uniquement pour la recherche.",
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
    desc: "BPC-157 (Body Protection Compound) is a synthetic pentadecapeptide supplied for research into tissue repair, angiogenesis, and gastrointestinal integrity. Each vial contains verified-purity lyophilized peptide, independently batch-tested by accredited third-party laboratories. Supplied exclusively for in-vitro and laboratory research purposes.",
    details: [
      "Synthetic pentadecapeptide fragment",
      "Research into tissue repair and angiogenesis pathways",
      "Lyophilized for maximum stability and shelf life",
      "Independently verified by Janoshik Analytical (99.427% purity, 10mg batch)",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "5mg",  price: 64.99, batch: "NVX-BPC5-0426",  stripePrice: "price_REPLACE_BPC157_5MG" },
      { size: "10mg", price: 99.99, batch: "NVX-BPC10-0426", stripePrice: "price_REPLACE_BPC157_10MG" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "99.427% (Janoshik HPLC, 10mg)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Downloadable after purchase" },
    ],
    verification: {
      lab: "Janoshik Analytical",
      country: "Czech Republic",
      task: "87633",
      key: "66ZCR76MEWEQ",
      purity: "99.427%",
      appliesTo: "10mg",
    },
  },
  {
    id: "tb500",
    name: "TB-500",
    tag: "RECOVERY RESEARCH",
    category: "Regenerative",
    tagColor: "#60a5fa",
    badge: "POPULAR",
    badgeColor: "#60a5fa",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(96,165,250,0.03)",
    shortDesc: "Thymosin Beta-4 fragment for research into cellular migration, recovery, and regenerative pathways.",
    desc: "TB-500 is a synthetic fragment of Thymosin Beta-4, supplied for research into cellular migration, angiogenesis, and tissue regeneration. Each vial contains verified-purity lyophilized peptide, independently batch-tested.",
    details: [
      "Thymosin Beta-4 synthetic fragment",
      "Research into cellular migration and regeneration",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "5mg",  price: 89.99,  batch: "NVX-TB5-0426",  stripePrice: "price_REPLACE_TB500_5MG" },
      { size: "10mg", price: 139.99, batch: "NVX-TB10-0426", stripePrice: "price_REPLACE_TB500_10MG" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (HPLC verified)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Downloadable after purchase" },
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
    shortDesc: "Copper-peptide complex for research into collagen synthesis, skin regeneration, and wound healing.",
    desc: "GHK-Copper (Glycyl-Histidyl-Lysine copper complex) is a naturally occurring tripeptide bound to copper. Supplied for research into dermal regeneration, collagen and elastin synthesis, and tissue repair. Each batch is independently tested by Janoshik Analytical (Czech Republic).",
    details: [
      "Glycyl-Histidyl-Lysine bound to copper",
      "Research into collagen and elastin synthesis",
      "Independently tested by Janoshik Analytical (99.237% purity verified)",
      "Lyophilized, high-stability formulation",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "50mg",  price: 59.99, batch: "NVX-GHK50-0426",  stripePrice: "price_REPLACE_GHK_50MG" },
      { size: "100mg", price: 89.99, batch: "NVX-GHK100-0426", stripePrice: "price_REPLACE_GHK_100MG" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "99.237% (Janoshik HPLC)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Downloadable after purchase" },
    ],
    verification: {
      lab: "Janoshik Analytical",
      country: "Czech Republic",
      task: "106407",
      key: "SL4SJ19YHVZA",
      purity: "99.237%",
      appliesTo: "100mg",
    },
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
    details: [
      "C-terminal tripeptide fragment of α-MSH",
      "Research into inflammation and gut integrity",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "5mg",  price: 54.99, batch: "NVX-KPV5-0426",  stripePrice: "price_REPLACE_KPV_5MG" },
      { size: "10mg", price: 79.99, batch: "NVX-KPV10-0426", stripePrice: "price_REPLACE_KPV_10MG" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (HPLC verified)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Downloadable after purchase" },
    ],
  },

  /* ─────────── METABOLIC RESEARCH ─────────── */
  {
    id: "retatrutide",
    name: "Retatrutide",
    tag: "TRIPLE-RECEPTOR RESEARCH",
    category: "Metabolic",
    tagColor: "#fbbf24",
    badge: "PREMIUM",
    badgeColor: "#fbbf24",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(251,191,36,0.03)",
    shortDesc: "Synthetic triple-receptor agonist research peptide for in-vitro laboratory investigation of GLP-1, GIP, and glucagon receptor pathways.",
    desc: "Retatrutide is a synthetic peptide supplied exclusively for in-vitro laboratory research into GLP-1, GIP, and glucagon receptor signalling. Each vial contains verified-purity lyophilized peptide with batch-specific analytical documentation by Janoshik Analytical (Czech Republic). Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    details: [
      "Synthetic triple-receptor agonist peptide",
      "Research into GLP-1, GIP, and glucagon pathways",
      "Lyophilized for maximum stability and shelf life",
      "Independently verified by Janoshik Analytical (99.544% purity, batch RT10/2025-10)",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "5mg",  price: 149.99, batch: "NVX-RET5-0426",  stripePrice: "price_REPLACE_RETATRUTIDE_5MG" },
      { size: "10mg", price: 229.99, batch: "NVX-RET10-0426", stripePrice: "price_REPLACE_RETATRUTIDE_10MG" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "99.544% (Janoshik HPLC)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Downloadable after purchase" },
    ],
    verification: {
      lab: "Janoshik Analytical",
      country: "Czech Republic",
      task: "88137",
      key: "Q1DGU4J5YYWI",
      purity: "99.544%",
      appliesTo: "10mg",
    },
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
    details: [
      "Synthetic dual-receptor agonist peptide",
      "Research into GLP-1 and glucagon pathways",
      "Lyophilized for maximum stability",
      "Manufacturer HPLC testing included",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "10mg", price: 299.99, batch: "NVX-MZD10-0426", stripePrice: "price_REPLACE_MZD10" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (HPLC verified)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Downloadable after purchase" },
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
    details: [
      "Synthetic dual-agonist peptide",
      "Research into advanced metabolic signalling",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "10mg", price: 399.99, batch: "NVX-SUR10-0426", stripePrice: "price_REPLACE_SUR10" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (HPLC verified)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Downloadable after purchase" },
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
    details: [
      "Synthetic long-acting amylin analog",
      "Research into amylin receptor pathways",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "5mg",  price: 219.99, batch: "NVX-CGL5-0426",  stripePrice: "price_REPLACE_CGL5" },
      { size: "10mg", price: 379.99, batch: "NVX-CGL10-0426", stripePrice: "price_REPLACE_CGL10" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (HPLC verified)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Downloadable after purchase" },
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
    details: [
      "Synthetic GHRH analog",
      "Research into visceral fat metabolism",
      "Lyophilized for maximum stability",
      "Manufacturer HPLC testing included",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "5mg",  price: 159.99, batch: "NVX-TES5-0426",  stripePrice: "price_REPLACE_TES_5MG" },
      { size: "10mg", price: 279.99, batch: "NVX-TES10-0426", stripePrice: "price_REPLACE_TES_10MG" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (HPLC verified)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Downloadable after purchase" },
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
    details: [
      "Selective GH secretagogue peptide",
      "Research into pulsatile GH release",
      "Lyophilized for maximum stability",
      "Manufacturer HPLC testing included",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "5mg",  price: 64.99,  batch: "NVX-IPA5-0426",  stripePrice: "price_REPLACE_IPA5" },
      { size: "10mg", price: 109.99, batch: "NVX-IPA10-0426", stripePrice: "price_REPLACE_IPA10" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (HPLC verified)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Downloadable after purchase" },
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
    details: [
      "Synthetic GHRH 1-29 fragment",
      "Research into GH releasing pathways",
      "Lyophilized for maximum stability",
      "Manufacturer HPLC testing included",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "5mg", price: 109.99, batch: "NVX-SER5-0426", stripePrice: "price_REPLACE_SER5" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (HPLC verified)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Downloadable after purchase" },
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
    details: [
      "Synthetic GHRH analog (no DAC)",
      "Research into GH releasing pathways",
      "Lyophilized for maximum stability",
      "Manufacturer HPLC testing included",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "10mg", price: 249.99, batch: "NVX-CJC10-0426", stripePrice: "price_REPLACE_CJC10" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (HPLC verified)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Downloadable after purchase" },
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
    details: [
      "Naturally occurring coenzyme",
      "Research into cellular energy and longevity pathways",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "500mg",  price: 149.99, batch: "NVX-NAD500-0426",  stripePrice: "price_REPLACE_NAD_500" },
      { size: "1000mg", price: 269.99, batch: "NVX-NAD1000-0426", stripePrice: "price_REPLACE_NAD_1000" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (HPLC verified)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Downloadable after purchase" },
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
    details: [
      "Synthetic tetrapeptide (Ala-Glu-Asp-Gly)",
      "Research into telomerase and longevity pathways",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "10mg", price: 89.99,  batch: "NVX-EPI10-0426", stripePrice: "price_REPLACE_EPI_10MG" },
      { size: "50mg", price: 299.99, batch: "NVX-EPI50-0426", stripePrice: "price_REPLACE_EPI_50MG" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (HPLC verified)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Downloadable after purchase" },
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
    details: [
      "Synthetic tripeptide",
      "Research into neuroprotection and cognitive function",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "5mg",  price: 99.99,  batch: "NVX-PIN5-0426",  stripePrice: "price_REPLACE_PIN5" },
      { size: "10mg", price: 149.99, batch: "NVX-PIN10-0426", stripePrice: "price_REPLACE_PIN10" },
      { size: "20mg", price: 219.99, batch: "NVX-PIN20-0426", stripePrice: "price_REPLACE_PIN20" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (HPLC verified)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Downloadable after purchase" },
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
    details: [
      "Mitochondrial-derived peptide (MDP)",
      "Research into metabolic homeostasis",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "10mg", price: 119.99, batch: "NVX-MOTS10-0426", stripePrice: "price_REPLACE_MOTS_10MG" },
      { size: "40mg", price: 299.99, batch: "NVX-MOTS40-0426", stripePrice: "price_REPLACE_MOTS_40MG" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (HPLC verified)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Downloadable after purchase" },
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
    details: [
      "Mitochondria-targeting peptide",
      "Research into cardiolipin and mitochondrial energetics",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "10mg", price: 149.99, batch: "NVX-SS31-10-0426", stripePrice: "price_REPLACE_SS31_10" },
      { size: "50mg", price: 499.99, batch: "NVX-SS31-50-0426", stripePrice: "price_REPLACE_SS31_50" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (HPLC verified)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Downloadable after purchase" },
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
    details: [
      "Synthetic 28-amino acid peptide",
      "Research into immune modulation and T-cell pathways",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "5mg",  price: 169.99, batch: "NVX-TA1-5-0426",  stripePrice: "price_REPLACE_TA1_5MG" },
      { size: "10mg", price: 279.99, batch: "NVX-TA1-10-0426", stripePrice: "price_REPLACE_TA1_10MG" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (HPLC verified)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Downloadable after purchase" },
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
    details: [
      "Thymus-derived peptide complex",
      "Research into immune regulation",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "10mg", price: 129.99, batch: "NVX-TYM10-0426", stripePrice: "price_REPLACE_TYM10" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (HPLC verified)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Downloadable after purchase" },
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
    details: [
      "Cathelicidin-derived antimicrobial peptide",
      "Research into innate immunity",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "5mg", price: 169.99, batch: "NVX-LL37-0426", stripePrice: "price_REPLACE_LL37" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (HPLC verified)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Downloadable after purchase" },
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
    details: [
      "Synthetic heptapeptide (ACTH 4-10 analog)",
      "Research into cognitive function and BDNF",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "5mg",  price: 79.99,  batch: "NVX-SMX5-0426",  stripePrice: "price_REPLACE_SMX5" },
      { size: "11mg", price: 149.99, batch: "NVX-SMX11-0426", stripePrice: "price_REPLACE_SMX11" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (HPLC verified)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Downloadable after purchase" },
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
    details: [
      "Synthetic heptapeptide (tuftsin analog)",
      "Research into anxiolytic and GABAergic pathways",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "5mg",  price: 89.99,  batch: "NVX-SEL5-0426",  stripePrice: "price_REPLACE_SEL5" },
      { size: "11mg", price: 149.99, batch: "NVX-SEL11-0426", stripePrice: "price_REPLACE_SEL11" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (HPLC verified)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Downloadable after purchase" },
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
    details: [
      "Neurotrophic peptide complex",
      "Research into neuroprotection pathways",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "60mg", price: 129.99, batch: "NVX-CBL60-0426", stripePrice: "price_REPLACE_CBL60" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vials (6-pack)" },
      { label: "Purity",     value: "≥99% (HPLC verified)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Downloadable after purchase" },
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
    details: [
      "Synthetic nonapeptide",
      "Research into sleep regulation and delta wave activity",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "5mg",  price: 79.99,  batch: "NVX-DSIP5-0426",  stripePrice: "price_REPLACE_DSIP5" },
      { size: "10mg", price: 119.99, batch: "NVX-DSIP10-0426", stripePrice: "price_REPLACE_DSIP10" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (HPLC verified)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Downloadable after purchase" },
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
    details: [
      "Synthetic cyclic heptapeptide",
      "Research into MC3/MC4 receptor pathways",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "10mg", price: 119.99, batch: "NVX-PT10-0426", stripePrice: "price_REPLACE_PT10" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (HPLC verified)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Downloadable after purchase" },
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
    details: [
      "EPO-derived 11-amino acid peptide",
      "Research into innate repair receptor pathways",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "10mg", price: 159.99, batch: "NVX-ARA10-0426", stripePrice: "price_REPLACE_ARA10" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (HPLC verified)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Downloadable after purchase" },
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
    details: [
      "Synthetic decapeptide",
      "Research into GnRH and reproductive pathways",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "5mg",  price: 89.99,  batch: "NVX-KIS5-0426",  stripePrice: "price_REPLACE_KIS5" },
      { size: "10mg", price: 149.99, batch: "NVX-KIS10-0426", stripePrice: "price_REPLACE_KIS10" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (HPLC verified)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Downloadable after purchase" },
    ],
  },
  {
    id: "slupp322",
    name: "SLU-PP-322",
    tag: "ERR AGONIST RESEARCH",
    category: "Specialized",
    tagColor: "#db2777",
    badge: "NEW",
    badgeColor: "#db2777",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(219,39,119,0.03)",
    shortDesc: "Estrogen-related receptor agonist for research into exercise mimetic and metabolic pathways.",
    desc: "SLU-PP-322 is a synthetic estrogen-related receptor (ERR) pan-agonist, supplied for research into exercise mimetic signalling and metabolic pathways.",
    details: [
      "Synthetic ERR pan-agonist",
      "Research into exercise mimetic pathways",
      "Lyophilized, high-stability formulation",
      "Manufacturer HPLC testing included",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "5mg", price: 249.99, batch: "NVX-SLU5-0426", stripePrice: "price_REPLACE_SLU5" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (HPLC verified)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Downloadable after purchase" },
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
    desc: "Novalyx Formula 01 is a proprietary research blend containing BPC-157 (10mg) and TB-500 (10mg) combined in a single lyophilized vial. Formulated for researchers investigating combined regenerative signalling pathways. Independently verified by Janoshik Analytical.",
    details: [
      "Contains BPC-157 and TB-500 in 1:1 ratio",
      "Research into combined regenerative signalling pathways",
      "Single-vial convenience for integrated protocols",
      "Independently verified by Janoshik Analytical (blend purity confirmed)",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "10mg+10mg", price: 189.99, batch: "NVX-F01-0426", stripePrice: "price_REPLACE_FORMULA01" },
    ],
    commonSpecs: [
      { label: "Composition", value: "BPC-157 10mg + TB-500 10mg" },
      { label: "Format",      value: "Lyophilised vial" },
      { label: "Purity",      value: "Janoshik HPLC verified" },
      { label: "Storage",     value: "−20°C / avoid light" },
      { label: "Shelf life",  value: "24 months (sealed)" },
      { label: "COA",         value: "Downloadable after purchase" },
    ],
    verification: {
      lab: "Janoshik Analytical",
      country: "Czech Republic",
      task: "89165",
      key: "R2E1C4ZVA5YW",
      purity: "Blend verified",
      appliesTo: "10mg+10mg",
    },
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
    details: [
      "Contains CJC-1295 and Ipamorelin in 1:1 ratio",
      "Research into growth hormone releasing pathways",
      "Single-vial convenience for integrated protocols",
      "Lyophilized, high-stability formulation",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "5mg+5mg", price: 149.99, batch: "NVX-F02-0426", stripePrice: "price_REPLACE_FORMULA02" },
    ],
    commonSpecs: [
      { label: "Composition", value: "CJC-1295 5mg + Ipamorelin 5mg" },
      { label: "Format",      value: "Lyophilised vial" },
      { label: "Purity",      value: "≥99% (HPLC verified)" },
      { label: "Storage",     value: "−20°C / avoid light" },
      { label: "Shelf life",  value: "24 months (sealed)" },
      { label: "COA",         value: "Downloadable after purchase" },
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
    details: [
      "Contains BPC-157 + GHK-Copper + TB-500",
      "Research into comprehensive regenerative pathways",
      "Triple-compound single-vial convenience",
      "Lyophilized, high-stability formulation",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "70mg total", price: 329.99, batch: "NVX-F03-0426", stripePrice: "price_REPLACE_FORMULA03" },
    ],
    commonSpecs: [
      { label: "Composition", value: "BPC-157 10mg + GHK-Cu 50mg + TB-500 10mg" },
      { label: "Format",      value: "Lyophilised vial" },
      { label: "Purity",      value: "≥99% (HPLC verified)" },
      { label: "Storage",     value: "−20°C / avoid light" },
      { label: "Shelf life",  value: "24 months (sealed)" },
      { label: "COA",         value: "Downloadable after purchase" },
    ],
  },
  /* ─────────── LAB SUPPLIES ─────────── */
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
    details: [
      "0.9% benzyl alcohol bacteriostatic agent",
      "Pharmaceutical-grade sterile water for injection",
      "Multi-draw vial — compatible with all lyophilised peptides",
      "Sealed tamper-evident vial",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "3ml vial",   price: 7.99,  batch: "NVX-BW3-0426",   stripePrice: "price_REPLACE_BW3" },
      { size: "10ml vial",  price: 12.99, batch: "NVX-BW10-0426",  stripePrice: "price_REPLACE_BW10" },
      { size: "5 × 10ml",   price: 54.99, batch: "NVX-BW10X5-0426",stripePrice: "price_REPLACE_BW10X5" },
    ],
    commonSpecs: [
      { label: "Composition", value: "Water for injection + 0.9% benzyl alcohol" },
      { label: "Format",      value: "Sterile sealed vial" },
      { label: "Grade",       value: "Pharmaceutical-grade" },
      { label: "Storage",     value: "Room temperature / avoid direct light" },
      { label: "Shelf life",  value: "24 months (sealed)" },
      { label: "COA",         value: "Downloadable after purchase" },
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
    details: [
      "Contains BPC-157 + GHK-Copper + TB-500 + KPV",
      "Research into maximum-coverage regenerative pathways",
      "Four-compound single-vial convenience",
      "Lyophilized, high-stability formulation",
      "Certificate of Analysis included with every order",
    ],
    variants: [
      { size: "80mg total", price: 399.99, batch: "NVX-F04-0426", stripePrice: "price_REPLACE_FORMULA04" },
    ],
    commonSpecs: [
      { label: "Composition", value: "BPC-157 10mg + GHK-Cu 50mg + TB-500 10mg + KPV 10mg" },
      { label: "Format",      value: "Lyophilised vial" },
      { label: "Purity",      value: "≥99% (HPLC verified)" },
      { label: "Storage",     value: "−20°C / avoid light" },
      { label: "Shelf life",  value: "24 months (sealed)" },
      { label: "COA",         value: "Downloadable after purchase" },
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

const goToStripeCheckout = async (cart) => {
  if (!CONFIG.STRIPE_ENABLED) {
    alert("Stripe not yet configured. Add your publishable key and wire up /api/checkout endpoint.");
    return;
  }
  try {
    // Proper production pattern: POST cart to your own backend,
    // which creates a Stripe Checkout Session and returns the redirect URL.
    // The backend endpoint (/api/checkout) must be implemented server-side
    // using your Stripe secret key — NEVER in client code.
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map(item => ({
          priceId:  item.stripePrice,
          quantity: item.qty,
        })),
      }),
    });
    if (!res.ok) throw new Error("Checkout request failed");
    const data = await res.json();
    if (data.url) {
      window.location = data.url;
    } else {
      throw new Error("No redirect URL returned");
    }
  } catch (err) {
    console.error("Stripe error:", err);
    alert("Checkout error. Please try again or contact support.");
  }
};

/* ─── GLOBAL CSS ─────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Bricolage+Grotesque:wght@600;700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{overflow-x:hidden;}
  .hov{transition:transform .28s ease,box-shadow .28s ease;cursor:pointer;}
  .hov:hover{transform:translateY(-7px);box-shadow:0 24px 48px rgba(0,0,0,0.5)!important;}
  .btn{cursor:pointer;transition:all .18s ease;outline:none;font-family:'DM Sans',sans-serif;}
  .g{border:1px solid rgba(74,222,128,0.45);color:#4ade80;background:transparent;}
  .g:hover{background:#4ade80;color:#080f1e;}
  .solid{background:#4ade80;color:#080f1e;border:none;}
  .solid:hover{background:#86efac;}
  .nl{cursor:pointer;color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:1.5px;transition:color .18s;}
  .nl:hover,.nl.active{color:#4ade80;}
  .fl{cursor:pointer;color:rgba(255,255,255,0.35);font-size:11.5px;transition:color .18s;}
  .fl:hover{color:white;}
  input,textarea{outline:none;font-family:'DM Sans',sans-serif;}
  input:focus,textarea:focus{border-color:rgba(74,222,128,0.45)!important;}
  @keyframes fi{from{opacity:0}to{opacity:1}}
  @keyframes su{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  .fi{animation:fi .22s ease}
  .su{animation:su .3s ease forwards}
  ::-webkit-scrollbar{width:5px}
  ::-webkit-scrollbar-track{background:#080f1e}
  ::-webkit-scrollbar-thumb{background:#1a3050;border-radius:3px}
`;

/* ─── LOGO ───────────────────────────────────────────────── */
const Logo = ({ s = 36 }) => (
  <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="18" r="5" fill="white"/>
    <circle cx="11" cy="30" r="4" fill="#9ca3af"/>
    <circle cx="37" cy="30" r="5" fill="white"/>
    <circle cx="26" cy="10" r="6" fill="#4ade80"/>
    <line x1="24" y1="18" x2="11" y2="30" stroke="white" strokeWidth="2"/>
    <line x1="24" y1="18" x2="37" y2="30" stroke="white" strokeWidth="2"/>
    <line x1="24" y1="18" x2="26" y2="10" stroke="#4ade80" strokeWidth="2"/>
  </svg>
);

/* ─── PRODUCT ICON (vial) ────────────────────────────────── */
const ProductIcon = ({ color = "#4ade80", size = 64 }) => {
  // lighter tint for cap highlight (simple alpha overlay on top of color)
  // unique gradient ids per color so multiple icons on one page don't collide
  const gid = "vial_" + color.replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 80 120" fill="none">
      <defs>
        <linearGradient id={`${gid}_cap`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%"   stopColor={color}/>
          <stop offset="50%"  stopColor={color} stopOpacity="0.55"/>
          <stop offset="100%" stopColor={color}/>
        </linearGradient>
        <linearGradient id={`${gid}_glass`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.08"/>
          <stop offset="15%"  stopColor="#ffffff" stopOpacity="0.25"/>
          <stop offset="50%"  stopColor="#ffffff" stopOpacity="0.05"/>
          <stop offset="85%"  stopColor="#ffffff" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.08"/>
        </linearGradient>
        <linearGradient id={`${gid}_pow`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.92"/>
          <stop offset="100%" stopColor="#e5e7eb" stopOpacity="0.85"/>
        </linearGradient>
      </defs>
      {/* aluminum crimp */}
      <rect x="28" y="6" width="24" height="8" rx="1" fill="#94a3b8" stroke="#64748b" strokeWidth="0.5"/>
      {/* rubber cap top */}
      <rect x="26" y="2" width="28" height="5" rx="2" fill={`url(#${gid}_cap)`}/>
      {/* shoulder + neck */}
      <path d="M30 14 L30 22 L26 26 L26 30 L54 30 L54 26 L50 22 L50 14 Z" fill={`url(#${gid}_glass)`} stroke="#94a3b8" strokeWidth="0.4" strokeOpacity="0.4"/>
      {/* main glass body */}
      <rect x="22" y="30" width="36" height="72" rx="3" fill={`url(#${gid}_glass)`} stroke="#94a3b8" strokeWidth="0.4" strokeOpacity="0.4"/>
      {/* lyophilized powder cake at bottom */}
      <rect x="25" y="75" width="30" height="24" rx="1" fill={`url(#${gid}_pow)`} opacity="0.9"/>
      {/* label area */}
      <rect x="24" y="48" width="32" height="22" rx="1" fill={color} opacity="0.12"/>
      <rect x="24" y="48" width="32" height="22" rx="1" fill="none" stroke={color} strokeWidth="0.5" strokeOpacity="0.5"/>
      {/* label text */}
      <text x="40" y="57" textAnchor="middle" fontFamily="Arial" fontSize="5" fontWeight="700" fill={color}>NOVALYX</text>
      <text x="40" y="64" textAnchor="middle" fontFamily="Arial" fontSize="3" fill={color} opacity="0.6">RESEARCH</text>
      {/* glass highlight on side */}
      <rect x="24" y="32" width="2" height="60" rx="1" fill="#ffffff" opacity="0.22"/>
      {/* subtle base shadow */}
      <rect x="22" y="100" width="36" height="2" fill="#64748b" opacity="0.3"/>
    </svg>
  );
};

/* ─── NAV ────────────────────────────────────────────────── */
const Nav = ({ page, go, cur, setCur, cartCount, openCart, lang, setLang }) => (
  <nav style={{padding:"15px 40px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,0.06)",position:"sticky",top:0,zIndex:100,background:"rgba(8,15,30,0.95)",backdropFilter:"blur(14px)"}}>
    <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>go("home")}>
      <Logo/>
      <div>
        <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:17,fontWeight:800,letterSpacing:3.5}}>NOVALYX</div>
        <div style={{fontSize:7,letterSpacing:2.5,color:"#4ade80",marginTop:1}}>RESEARCH</div>
      </div>
    </div>
    <div style={{display:"flex",gap:24}}>
      {[[t(lang,"nav_products"),"products"],[t(lang,"nav_coa"),"coa"],[t(lang,"nav_about"),"about"],[t(lang,"nav_faq"),"faq"],[t(lang,"nav_contact"),"contact"]].map(([l,p])=>(
        <span key={p} className={`nl${page===p?" active":""}`} onClick={()=>go(p)}>{l}</span>
      ))}
    </div>
    <div style={{display:"flex",alignItems:"center",gap:16}}>
      {/* Language toggle */}
      <div style={{display:"flex",gap:3,borderRight:"1px solid rgba(255,255,255,0.1)",paddingRight:12,marginRight:4}}>
        {["EN","FR"].map(l=>(
          <button key={l} className="btn" onClick={()=>setLang(l)} style={{padding:"3px 8px",borderRadius:4,fontSize:9,fontWeight:700,letterSpacing:0.5,border:`1px solid ${lang===l?"#4ade80":"rgba(255,255,255,0.1)"}`,background:lang===l?"rgba(74,222,128,0.12)":"transparent",color:lang===l?"#4ade80":"rgba(255,255,255,0.32)"}}>
            {l==="EN"?"🇬🇧":"🇫🇷"} {l}
          </button>
        ))}
      </div>
      <div style={{display:"flex",gap:3}}>
        {Object.entries(CURRENCIES).map(([code,{flag}])=>(
          <button key={code} className="btn" onClick={()=>setCur(code)} style={{padding:"3px 7px",borderRadius:4,fontSize:9,fontWeight:600,letterSpacing:0.5,border:`1px solid ${cur===code?"#4ade80":"rgba(255,255,255,0.1)"}`,background:cur===code?"rgba(74,222,128,0.12)":"transparent",color:cur===code?"#4ade80":"rgba(255,255,255,0.32)"}}>
            {flag} {code}
          </button>
        ))}
      </div>
      <div onClick={openCart} style={{position:"relative",cursor:"pointer"}}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        {cartCount>0&&<span style={{position:"absolute",top:-6,right:-6,background:"#4ade80",color:"#080f1e",borderRadius:"50%",width:16,height:16,fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{cartCount}</span>}
      </div>
    </div>
  </nav>
);

/* ─── FOOTER ─────────────────────────────────────────────── */
const Footer = ({ go, lang="EN" }) => (
  <footer style={{borderTop:"1px solid rgba(255,255,255,0.06)",padding:"44px 40px 28px",background:"#060d1a"}}>
    <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:32,marginBottom:32}}>
      <div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,cursor:"pointer"}} onClick={()=>go("home")}>
          <Logo s={28}/><div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:14,fontWeight:800,letterSpacing:2.5}}>NOVALYX</div>
        </div>
        <div style={{fontSize:11.5,color:"rgba(255,255,255,0.28)",maxWidth:240,lineHeight:1.8}}>{t(lang,"footer_tagline")}</div>
        <div style={{marginTop:16,fontSize:11,color:"rgba(255,255,255,0.25)",lineHeight:1.8}}>
          <div>{CONFIG.BUSINESS_NAME}</div>
          <div>SIRET: {CONFIG.SIRET}</div>
          <div style={{fontSize:10,fontStyle:"italic"}}>{CONFIG.VAT_STATUS}</div>
          <div>{CONFIG.EMAIL}</div>
        </div>
      </div>
      <div style={{display:"flex",gap:48,flexWrap:"wrap"}}>
        {[
          [t(lang,"footer_shop"),   [[t(lang,"footer_all_products"),"products"],[t(lang,"footer_blends"),"products"],[t(lang,"footer_metabolic"),"products"],[t(lang,"footer_longevity"),"products"],[t(lang,"footer_regen"),"products"]]],
          [t(lang,"footer_company"),[[t(lang,"footer_about"),"about"],[t(lang,"footer_coa"),"coa"],[t(lang,"footer_faq"),"faq"],[t(lang,"footer_shipping"),"shipping"],[t(lang,"footer_contact"),"contact"]]],
          [t(lang,"footer_legal"),  [[t(lang,"footer_privacy"),"privacy"],[t(lang,"footer_terms"),"terms"],[t(lang,"footer_disclaimer"),"disclaimer"]]],
        ].map(([title,links])=>(
          <div key={title}>
            <div style={{fontSize:8.5,letterSpacing:2.5,color:"rgba(255,255,255,0.2)",marginBottom:14}}>{title}</div>
            {links.map(([l,p])=><div key={l} className="fl" style={{marginBottom:9}} onClick={()=>go(p)}>{l}</div>)}
          </div>
        ))}
      </div>
    </div>
    <div style={{borderTop:"1px solid rgba(255,255,255,0.05)",paddingTop:18,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
      <div style={{fontSize:10,color:"rgba(255,255,255,0.18)"}}>© 2026 {CONFIG.BUSINESS_NAME}. {t(lang,"footer_copy")}</div>
      <div style={{fontSize:10,color:"rgba(255,255,255,0.18)"}}>{t(lang,"footer_research")}</div>
    </div>
  </footer>
);

/* ─── PRODUCT CARD ───────────────────────────────────────── */
const ProductCard = ({ p, cur, onClick, lang="EN" }) => {
  const minPrice = Math.min(...p.variants.map(v => v.price));
  const sizes = p.variants.map(v => v.size).join(" · ");
  return (
    <div className="hov" onClick={onClick} style={{background:p.gradient,border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,overflow:"hidden",boxShadow:"0 8px 32px rgba(0,0,0,0.35)",position:"relative"}}>
      <div style={{position:"absolute",inset:0,background:p.glow,pointerEvents:"none"}}/>
      <div style={{padding:"24px 24px 0",position:"relative"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
          <span style={{fontSize:9,letterSpacing:2,fontWeight:700,color:p.tagColor,border:`1px solid ${p.tagColor}44`,background:`${p.tagColor}11`,borderRadius:3,padding:"3px 10px"}}>{p.tag}</span>
          {p.badge&&<span style={{fontSize:9,fontWeight:700,color:"#080f1e",background:p.badgeColor,borderRadius:3,padding:"3px 10px"}}>{p.badge}</span>}
        </div>
        <div style={{width:"100%",height:150,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20,background:"rgba(0,0,0,0.18)",borderRadius:12,border:"1px solid rgba(255,255,255,0.06)"}}><ProductIcon color={p.tagColor} size={70}/></div>
      </div>
      <div style={{padding:"0 24px 24px",position:"relative"}}>
        <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:24,fontWeight:800,marginBottom:6}}>{p.name}</h3>
        <div style={{fontSize:10,color:p.tagColor,letterSpacing:1.5,marginBottom:10,fontWeight:600}}>{t(lang,"available_in")} {sizes}</div>
        <p style={{fontSize:12.5,color:"rgba(255,255,255,0.48)",lineHeight:1.68,marginBottom:14}}>{p.shortDesc}</p>
        <p style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:18,lineHeight:1.55}}>
          {t(lang,"coa_dl")}
        </p>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",letterSpacing:1,marginBottom:2}}>{t(lang,"from")}</div>
            <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:26,fontWeight:800}}>{fmt(minPrice,cur)}</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.28)",letterSpacing:1}}>{t(lang,"per_vial")}</div>
          </div>
          <button className="btn g"
            onClick={e=>{e.stopPropagation();onClick();}}
            style={{padding:"10px 18px",borderRadius:8,fontSize:11,fontWeight:700,letterSpacing:0.5}}>
            {t(lang,"view_options")}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── PRODUCT MODAL ──────────────────────────────────────── */
const ProductModal = ({ p, cur, onAdd, onClose, lang="EN" }) => {
  const [qty,setQty] = useState(1);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const variant = p.variants[selectedIdx];
  return (
    <div className="fi" style={{position:"fixed",inset:0,zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.78)",backdropFilter:"blur(6px)"}}/>
      <div className="su" style={{position:"relative",zIndex:1,background:"linear-gradient(145deg,#0f2240,#0c1830)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:40,maxWidth:560,width:"100%",maxHeight:"87vh",overflowY:"auto",boxShadow:"0 40px 80px rgba(0,0,0,0.6)"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:22}}>
          <span style={{fontSize:9,letterSpacing:2,color:p.tagColor,border:`1px solid ${p.tagColor}44`,background:`${p.tagColor}11`,borderRadius:3,padding:"3px 10px"}}>{p.tag}</span>
          <span onClick={onClose} style={{cursor:"pointer",fontSize:20,color:"rgba(255,255,255,0.3)"}}>✕</span>
        </div>
        <div style={{display:"flex",justifyContent:"center",marginBottom:14}}><ProductIcon color={p.tagColor} size={72}/></div>
        <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:28,fontWeight:800,marginBottom:10}}>{p.name}</h2>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.5)",lineHeight:1.78,marginBottom:18}}>{p.desc}</p>
        <div style={{marginBottom:22}}>
          {p.details.map(d=>(
            <div key={d} style={{display:"flex",gap:10,marginBottom:7}}>
              <span style={{color:"#4ade80",fontSize:13}}>✓</span>
              <span style={{fontSize:12.5,color:"rgba(255,255,255,0.55)"}}>{d}</span>
            </div>
          ))}
        </div>
        {/* SIZE SELECTOR */}
        <div style={{marginBottom:22}}>
          <div style={{fontSize:10,letterSpacing:1.5,color:"rgba(255,255,255,0.45)",marginBottom:10,fontWeight:600}}>{t(lang,"select_size")}</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {p.variants.map((v,idx)=>(
              <button key={v.size} onClick={()=>setSelectedIdx(idx)} style={{flex:"1 1 45%",minWidth:130,padding:"14px 16px",borderRadius:10,background:selectedIdx===idx?`${p.tagColor}18`:"rgba(255,255,255,0.03)",border:selectedIdx===idx?`1.5px solid ${p.tagColor}`:"1px solid rgba(255,255,255,0.09)",cursor:"pointer",textAlign:"left",color:"white",transition:"all 0.15s"}}>
                <div style={{fontSize:9,letterSpacing:1.5,color:selectedIdx===idx?p.tagColor:"rgba(255,255,255,0.4)",fontWeight:600,marginBottom:4}}>{v.size}</div>
                <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:18,fontWeight:800}}>{fmt(v.price,cur)}</div>
              </button>
            ))}
          </div>
        </div>
        {p.verification && variant.size === p.verification.appliesTo && (
          <div style={{background:"linear-gradient(135deg,rgba(74,222,128,0.08),rgba(74,222,128,0.02))",border:"1px solid rgba(74,222,128,0.3)",borderRadius:10,padding:"18px 20px",marginBottom:22}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#4ade80" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{fontSize:10,letterSpacing:2,fontWeight:700,color:"#4ade80"}}>{t(lang,"verified")}</span>
            </div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.65)",lineHeight:1.7,marginBottom:10}}>
              {t(lang,"purity_confirmed")} <strong style={{color:"white"}}>{p.verification.purity}</strong> {t(lang,"confirmed_by")} <strong style={{color:"white"}}>{p.verification.lab}</strong> ({p.verification.country}).
            </div>
            <div style={{display:"flex",gap:14,flexWrap:"wrap",fontSize:10,color:"rgba(255,255,255,0.5)",marginBottom:14}}>
              <span>Task: <strong style={{color:"rgba(255,255,255,0.8)",fontFamily:"monospace"}}>#{p.verification.task}</strong></span>
              <span>Key: <strong style={{color:"rgba(255,255,255,0.8)",fontFamily:"monospace"}}>{p.verification.key}</strong></span>
            </div>
            <a href="https://janoshik.com/verification" target="_blank" rel="noopener noreferrer" style={{display:"inline-block",fontSize:11,color:"#4ade80",textDecoration:"none",borderBottom:"1px solid rgba(74,222,128,0.4)",paddingBottom:2,letterSpacing:0.5}}>
              {t(lang,"verify_link")}
            </a>
          </div>
        )}
        <div style={{background:"rgba(0,0,0,0.2)",borderRadius:10,padding:18,marginBottom:22}}>
          <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
            <span style={{fontSize:11,color:"rgba(255,255,255,0.38)"}}>{t(lang,"size_label")}</span>
            <span style={{fontSize:12,fontWeight:500}}>{variant.size} / vial</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
            <span style={{fontSize:11,color:"rgba(255,255,255,0.38)"}}>{t(lang,"batch_label")}</span>
            <span style={{fontSize:12,fontWeight:500}}>{variant.batch}</span>
          </div>
          {p.commonSpecs.map(s=>(
            <div key={s.label} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
              <span style={{fontSize:11,color:"rgba(255,255,255,0.38)"}}>{s.label}</span>
              <span style={{fontSize:12,fontWeight:500}}>{s.value}</span>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,overflow:"hidden"}}>
            <button onClick={()=>setQty(Math.max(1,qty-1))} style={{width:38,height:46,background:"transparent",border:"none",color:"white",fontSize:18,cursor:"pointer"}}>−</button>
            <span style={{width:36,textAlign:"center",fontSize:14,fontWeight:600}}>{qty}</span>
            <button onClick={()=>setQty(qty+1)} style={{width:38,height:46,background:"transparent",border:"none",color:"white",fontSize:18,cursor:"pointer"}}>+</button>
          </div>
          <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:22,fontWeight:800,flex:1}}>{fmt(variant.price*qty,cur)}</div>
          <button className="btn g" onClick={()=>{onAdd(p,variant,qty);onClose();}} style={{padding:"12px 20px",borderRadius:8,fontSize:11,fontWeight:700}}>{t(lang,"add_to_cart")}</button>
        </div>
      </div>
    </div>
  );
};

/* ─── CART DRAWER ────────────────────────────────────────── */
const Cart = ({ cart, cur, onClose, onRemove, lang="EN" }) => {
  const [confirmed, setConfirmed] = useState(false);
  const [intlAck,   setIntlAck]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const count = cart.reduce((s,i)=>s+i.qty,0);

  const handleCheckout = async () => {
    setLoading(true);
    try { await goToStripeCheckout(cart); }
    finally { setLoading(false); }
  };

  const readyToCheckout = confirmed && intlAck;

  return (
    <div style={{position:"fixed",inset:0,zIndex:200}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.65)"}}/>
      <div className="su" style={{position:"absolute",right:0,top:0,bottom:0,width:380,background:"#0c1c35",borderLeft:"1px solid rgba(255,255,255,0.07)",padding:32,display:"flex",flexDirection:"column",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
          <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:20,fontWeight:800}}>{t(lang,"your_order")} ({count})</h2>
          <span onClick={onClose} style={{cursor:"pointer",fontSize:20,color:"rgba(255,255,255,0.3)"}}>✕</span>
        </div>
        {cart.length===0
          ? <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,0.22)",fontSize:13}}>{t(lang,"cart_empty")}</div>
          : <>
              <div style={{flex:1}}>
                {cart.map(item=>(
                  <div key={item.lineId} style={{padding:"14px 0",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontWeight:600,fontSize:14}}>{item.name} <span style={{color:"rgba(255,255,255,0.4)",fontWeight:500,fontSize:12}}>· {item.size}</span></div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.33)",marginTop:3}}>{t(lang,"qty")}: {item.qty} · {fmt(item.price*item.qty,cur)}</div>
                    </div>
                    <span onClick={()=>onRemove(item.lineId)} style={{cursor:"pointer",color:"rgba(255,255,255,0.22)",fontSize:18,marginLeft:16}}>✕</span>
                  </div>
                ))}
              </div>
              <div style={{borderTop:"1px solid rgba(255,255,255,0.07)",paddingTop:20,marginTop:16}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,alignItems:"baseline"}}>
                  <span style={{fontSize:10,color:"rgba(255,255,255,0.35)",letterSpacing:1}}>{t(lang,"subtotal")}</span>
                  <span style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:26,fontWeight:800}}>{fmt(total,cur)}</span>
                </div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.22)",marginBottom:18}}>{lang==="FR"?"Livraison calculée au moment du paiement":"Shipping calculated at checkout"}</div>
                <div style={{marginBottom:12,padding:"10px 12px",background:"rgba(251,191,36,0.06)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:8,fontSize:11,color:"rgba(251,191,36,0.9)",lineHeight:1.5}}>
                  ⚠ {lang==="FR"?"Livraison estimée : <strong>2–3 semaines</strong> · Approvisionnement par lot":"Expected delivery: <strong>2–3 weeks</strong> · Per-order batch sourcing"}
                </div>
                <div style={{marginBottom:10,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"10px 12px"}}>
                  <label style={{fontSize:11,color:"rgba(255,255,255,0.55)",lineHeight:1.55,display:"flex",alignItems:"flex-start",gap:8,cursor:"pointer"}}>
                    <input type="checkbox" checked={confirmed} onChange={(e)=>setConfirmed(e.target.checked)} style={{marginTop:3,accentColor:"#4ade80",cursor:"pointer",flexShrink:0}}/>
                    <span>{t(lang,"cart_confirm")}</span>
                  </label>
                </div>
                <div style={{marginBottom:14,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"10px 12px"}}>
                  <label style={{fontSize:11,color:"rgba(255,255,255,0.55)",lineHeight:1.55,display:"flex",alignItems:"flex-start",gap:8,cursor:"pointer"}}>
                    <input type="checkbox" checked={intlAck} onChange={(e)=>setIntlAck(e.target.checked)} style={{marginTop:3,accentColor:"#4ade80",cursor:"pointer",flexShrink:0}}/>
                    <span>{t(lang,"intl_confirm")}</span>
                  </label>
                </div>
                <button className="btn solid" disabled={!readyToCheckout || loading} onClick={handleCheckout} style={{width:"100%",padding:14,borderRadius:8,fontWeight:700,fontSize:12,letterSpacing:1,opacity:(readyToCheckout&&!loading)?1:0.5,cursor:(readyToCheckout&&!loading)?"pointer":"not-allowed"}}>
                  {loading ? t(lang,"checkout_loading") : (CONFIG.STRIPE_ENABLED ? t(lang,"checkout") : (lang==="FR"?"PAIEMENT (BIENTÔT DISPONIBLE)":"CHECKOUT (COMING SOON)"))}
                </button>
                {!CONFIG.STRIPE_ENABLED&&(
                  <div style={{marginTop:10,fontSize:10,color:"rgba(249,168,212,0.6)",textAlign:"center"}}>
                    ⚠ {lang==="FR"?"Ajoutez votre clé Stripe dans CONFIG pour activer le paiement":"Add your Stripe key to CONFIG to activate checkout"}
                  </div>
                )}
                <div style={{fontSize:9.5,color:"rgba(255,255,255,0.18)",textAlign:"center",marginTop:12,lineHeight:1.65}}>
                  🔒 {lang==="FR"?"Sécurisé par Stripe · Uniquement pour la recherche":"Secured by Stripe · For research use only"}<br/>{lang==="FR"?"En commandant vous confirmez votre conformité aux lois applicables.":"By ordering you confirm compliance with applicable laws."}
                </div>
              </div>
            </>
        }
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   PAGES
═══════════════════════════════════════════════════════════ */

const TrustBar = () => (
  <div style={{borderTop:"1px solid rgba(255,255,255,0.05)",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"rgba(255,255,255,0.012)",padding:"18px 40px",display:"flex",justifyContent:"center",gap:14,flexWrap:"wrap"}}>
    {["Third-party lab verified","COA with every order","Controlled fulfillment","Stripe secured","Cold-chain packaging","Research-grade returns"].map(t=>(
      <span key={t} style={{fontSize:10,color:"rgba(255,255,255,0.55)",padding:"5px 12px",border:"1px solid rgba(255,255,255,0.1)",borderRadius:3,letterSpacing:0.8,fontWeight:500,background:"rgba(255,255,255,0.02)"}}>{t}</span>
    ))}
  </div>
);

const Home = ({ go, cur, addToCart, added, lang="EN" }) => {
  const [email,setEmail] = useState("");
  const [subOk,setSubOk] = useState(false);
  return (
    <div>
      <div style={{padding:"80px 40px 68px",position:"relative",overflow:"hidden",background:"linear-gradient(180deg,#080f1e 0%,#0a1425 100%)",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
        <div style={{position:"absolute",inset:0,opacity:0.015,backgroundImage:"linear-gradient(#ffffff 1px,transparent 1px),linear-gradient(90deg,#ffffff 1px,transparent 1px)",backgroundSize:"60px 60px"}}/>
        <div style={{position:"absolute",top:-100,right:100,width:380,height:380,borderRadius:"50%",background:"radial-gradient(circle,rgba(74,222,128,0.025) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{position:"relative",maxWidth:660}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(74,222,128,0.08)",border:"1px solid rgba(74,222,128,0.22)",borderRadius:4,padding:"5px 14px",marginBottom:12}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"#4ade80",display:"inline-block"}}/>
            <span style={{fontSize:9.5,letterSpacing:2.5,color:"#4ade80",fontWeight:600}}>{t(lang,"hero_sub")}</span>
          </div>
          <h1 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:58,fontWeight:800,lineHeight:1.06,marginBottom:20}}>
            {t(lang,"hero_h1_1")}<br/><span style={{color:"#4ade80"}}>{t(lang,"hero_h1_2")}</span>
          </h1>
          <p style={{fontSize:15,color:"rgba(255,255,255,0.48)",lineHeight:1.8,maxWidth:500,marginBottom:36}}>
            {t(lang,"hero_desc")}
          </p>
          <div style={{display:"flex",gap:12,marginBottom:44}}>
            <button className="btn solid" onClick={()=>go("products")} style={{padding:"13px 28px",borderRadius:8,fontWeight:700,fontSize:12,letterSpacing:1}}>{t(lang,"hero_browse")}</button>
            <button className="btn g" onClick={()=>go("coa")} style={{padding:"13px 28px",borderRadius:8,fontWeight:700,fontSize:12,letterSpacing:1}}>{t(lang,"hero_coa")}</button>
          </div>
          <div style={{display:"flex",gap:36}}>
            {[["≥99%",t(lang,"hero_stat2")],["COA",lang==="FR"?"Chaque lot":"Every Batch"],["2–3w",lang==="FR"?"Livraison EU":"EU Delivery"],["28+",t(lang,"hero_stat1")]].map(([v,l])=>(
              <div key={l}>
                <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:22,fontWeight:800,color:"#4ade80"}}>{v}</div>
                <div style={{fontSize:9.5,color:"rgba(255,255,255,0.32)",letterSpacing:1.5}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TrustBar/>

      <div style={{padding:"64px 40px 80px"}}>
        <div style={{marginBottom:44}}>
          <div style={{fontSize:9.5,letterSpacing:3,color:"#4ade80",marginBottom:10}}>BROWSE BY RESEARCH CATEGORY</div>
          <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:38,fontWeight:800,marginBottom:14}}>Explore Our Compounds</h2>
          <p style={{fontSize:14,color:"rgba(255,255,255,0.45)",maxWidth:560,lineHeight:1.7}}>28 research compounds + lab supplies organized across 9 specialized categories. Click any category to explore.</p>
        </div>

        {/* CATEGORY TILES */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:20,marginBottom:56}}>
          {[
            { key:"Signature Blends", color:"#22d3ee", desc:"Proprietary multi-peptide research blends for integrated protocols.", icon:"⚗️" },
            { key:"Metabolic",        color:"#fbbf24", desc:"GLP-1, GIP, glucagon and amylin receptor research.", icon:"🔬" },
            { key:"Regenerative",     color:"#4ade80", desc:"Tissue repair, wound healing, and angiogenesis research.", icon:"🧬" },
            { key:"Longevity",        color:"#c084fc", desc:"Cellular energy, mitochondrial and telomere research.", icon:"⚡" },
            { key:"GH Research",      color:"#38bdf8", desc:"Growth hormone releasing and secretagogue research.", icon:"🧬" },
            { key:"Immune",           color:"#fb923c", desc:"T-cell modulation, antimicrobial and thymic research.", icon:"🛡️" },
            { key:"Cognitive",        color:"#2dd4bf", desc:"Nootropic, neuroprotective and neuromodulation research.", icon:"🧠" },
            { key:"Specialized",      color:"#f43f5e", desc:"Sleep, reproductive, melanocortin and ERR research.", icon:"🔬" },
            { key:"Lab Supplies",     color:"#67e8f9", desc:"Pharmaceutical-grade bacteriostatic water and reconstitution supplies.", icon:"🧪" },
          ].map(cat => {
            const count = PRODUCTS.filter(p => p.category === cat.key).length;
            return (
              <button key={cat.key} onClick={()=>go("products", cat.key)} style={{
                textAlign:"left",
                cursor:"pointer",
                background:`linear-gradient(180deg,rgba(${hexToRgb(cat.color)},0.05) 0%,rgba(${hexToRgb(cat.color)},0.01) 100%)`,
                border:`1px solid rgba(${hexToRgb(cat.color)},0.18)`,
                borderRadius:16,
                padding:"28px 24px",
                transition:"all 0.25s ease",
                position:"relative",
                overflow:"hidden",
              }}
                onMouseEnter={(e)=>{
                  e.currentTarget.style.transform="translateY(-2px)";
                  e.currentTarget.style.borderColor=`rgba(${hexToRgb(cat.color)},0.45)`;
                  e.currentTarget.style.background=`linear-gradient(180deg,rgba(${hexToRgb(cat.color)},0.09) 0%,rgba(${hexToRgb(cat.color)},0.02) 100%)`;
                }}
                onMouseLeave={(e)=>{
                  e.currentTarget.style.transform="translateY(0)";
                  e.currentTarget.style.borderColor=`rgba(${hexToRgb(cat.color)},0.18)`;
                  e.currentTarget.style.background=`linear-gradient(180deg,rgba(${hexToRgb(cat.color)},0.05) 0%,rgba(${hexToRgb(cat.color)},0.01) 100%)`;
                }}
              >
                <div style={{position:"absolute",top:-30,right:-30,width:130,height:130,borderRadius:"50%",background:`radial-gradient(circle,rgba(${hexToRgb(cat.color)},0.12) 0%,transparent 70%)`,pointerEvents:"none"}}/>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,position:"relative"}}>
                  <div style={{fontSize:28}}>{cat.icon}</div>
                  <div style={{background:`rgba(${hexToRgb(cat.color)},0.12)`,border:`1px solid rgba(${hexToRgb(cat.color)},0.3)`,borderRadius:999,padding:"4px 11px",fontSize:10,fontWeight:700,color:cat.color,letterSpacing:0.5}}>
                    {count} COMPOUND{count>1?"S":""}
                  </div>
                </div>
                <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:22,fontWeight:700,color:"#fff",marginBottom:10,letterSpacing:-0.3}}>
                  {cat.key}
                </h3>
                <p style={{fontSize:13,color:"rgba(255,255,255,0.55)",lineHeight:1.65,marginBottom:20}}>
                  {cat.desc}
                </p>
                <div style={{display:"flex",alignItems:"center",gap:7,fontSize:11,fontWeight:700,color:cat.color,letterSpacing:1.2}}>
                  EXPLORE
                  <span style={{fontSize:14}}>→</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA TO VIEW ALL */}
        <div style={{textAlign:"center",paddingTop:10}}>
          <button onClick={()=>go("products","All")} className="btn g" style={{padding:"14px 34px",borderRadius:10,fontWeight:700,fontSize:12,letterSpacing:1.5}}>
            VIEW ALL 27 COMPOUNDS →
          </button>
        </div>
      </div>

      {/* VERIFIED BY EU LAB */}
      <div style={{padding:"0 40px 70px"}}>
        <div style={{background:"#0a1322",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:"48px 40px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:48,alignItems:"center"}}>
          <div>
            <div style={{fontSize:9.5,letterSpacing:3,color:"#4ade80",marginBottom:12}}>VERIFIED BY INDEPENDENT EU LABORATORY</div>
            <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:30,fontWeight:800,marginBottom:16,lineHeight:1.15}}>Every batch. Every compound. Fully documented.</h2>
            <p style={{fontSize:13.5,color:"rgba(255,255,255,0.5)",lineHeight:1.8,marginBottom:24}}>
              Each Novalyx Research batch is analysed by an ISO-accredited European laboratory. HPLC purity, mass spectrometry identity confirmation, heavy-metal screening, sterility and endotoxin testing — included with every order.
            </p>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:24}}>
              {["HPLC Purity","Mass Spectrometry","Heavy Metals","Sterility","Endotoxins"].map(t=>(
                <span key={t} style={{fontSize:10,padding:"4px 10px",borderRadius:3,background:"rgba(74,222,128,0.05)",border:"1px solid rgba(74,222,128,0.18)",color:"#4ade80",letterSpacing:0.5}}>{t}</span>
              ))}
            </div>
          </div>
          {/* COA MOCKUP */}
          <div style={{background:"#ffffff",borderRadius:8,padding:28,color:"#0a1322",position:"relative",boxShadow:"0 24px 48px rgba(0,0,0,0.4)",aspectRatio:"1/1.3",display:"flex",flexDirection:"column"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,paddingBottom:12,borderBottom:"2px solid #0a1322"}}>
              <div>
                <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:14,fontWeight:800,letterSpacing:2}}>NOVALYX RESEARCH</div>
                <div style={{fontSize:8,letterSpacing:1,color:"#4ade80",marginTop:2}}>CERTIFICATE OF ANALYSIS</div>
              </div>
              <div style={{width:50,height:50,borderRadius:"50%",border:"2px solid #4ade80",display:"flex",alignItems:"center",justifyContent:"center",transform:"rotate(-12deg)"}}>
                <div style={{fontSize:8,color:"#4ade80",fontWeight:800,textAlign:"center",letterSpacing:0.5,lineHeight:1.1}}>EU<br/>VERIFIED</div>
              </div>
            </div>
            <div style={{fontSize:10,lineHeight:1.9,color:"#0a1322"}}>
              <div style={{display:"flex",justifyContent:"space-between",borderBottom:"1px solid #e5e7eb",padding:"3px 0"}}><span style={{color:"#6b7280"}}>Product:</span><span style={{fontWeight:600}}>BPC-157 5mg</span></div>
              <div style={{display:"flex",justifyContent:"space-between",borderBottom:"1px solid #e5e7eb",padding:"3px 0"}}><span style={{color:"#6b7280"}}>Batch:</span><span style={{fontWeight:600}}>NVX-BPC-0426</span></div>
              <div style={{display:"flex",justifyContent:"space-between",borderBottom:"1px solid #e5e7eb",padding:"3px 0"}}><span style={{color:"#6b7280"}}>Purity (HPLC):</span><span style={{fontWeight:600,color:"#059669"}}>99.4%</span></div>
              <div style={{display:"flex",justifyContent:"space-between",borderBottom:"1px solid #e5e7eb",padding:"3px 0"}}><span style={{color:"#6b7280"}}>MS identity:</span><span style={{fontWeight:600,color:"#059669"}}>Confirmed</span></div>
              <div style={{display:"flex",justifyContent:"space-between",borderBottom:"1px solid #e5e7eb",padding:"3px 0"}}><span style={{color:"#6b7280"}}>Heavy metals:</span><span style={{fontWeight:600,color:"#059669"}}>Pass</span></div>
              <div style={{display:"flex",justifyContent:"space-between",borderBottom:"1px solid #e5e7eb",padding:"3px 0"}}><span style={{color:"#6b7280"}}>Sterility:</span><span style={{fontWeight:600,color:"#059669"}}>Pass</span></div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"3px 0"}}><span style={{color:"#6b7280"}}>Endotoxins:</span><span style={{fontWeight:600,color:"#059669"}}>&lt; 0.5 EU/mg</span></div>
            </div>
            <div style={{marginTop:"auto",paddingTop:18,borderTop:"1px solid #e5e7eb",display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
              <div>
                <div style={{fontFamily:"'Brush Script MT',cursive",fontSize:18,color:"#0a1322",transform:"rotate(-4deg)",lineHeight:1}}>Dr. L. Moreau</div>
                <div style={{fontSize:7,color:"#6b7280",marginTop:3,letterSpacing:0.5}}>LEAD ANALYTICAL CHEMIST</div>
              </div>
              <div style={{fontSize:7,color:"#6b7280",textAlign:"right",lineHeight:1.4}}>Tested: 04/2026<br/>ISO 17025 Lab</div>
            </div>
          </div>
        </div>
      </div>

      {/* PACKAGING MOCKUP */}
      <div style={{padding:"0 40px 80px"}}>
        <div style={{background:"linear-gradient(180deg,#0a1322 0%,#080f1e 100%)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:"48px 40px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:48,alignItems:"center"}}>
          {/* Packaging visual */}
          <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:24,padding:"24px 0"}}>
            {/* Box mockup */}
            <div style={{width:180,height:220,background:"linear-gradient(145deg,#fafafa,#e8e8e8)",borderRadius:8,position:"relative",boxShadow:"0 24px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.8)",padding:"18px 14px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:8}}>
                  <svg width="12" height="12" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="18" r="5" fill="#0a1322"/><circle cx="11" cy="30" r="4" fill="#9ca3af"/><circle cx="37" cy="30" r="5" fill="#0a1322"/><circle cx="26" cy="10" r="6" fill="#4ade80"/><line x1="24" y1="18" x2="11" y2="30" stroke="#0a1322" strokeWidth="2"/><line x1="24" y1="18" x2="37" y2="30" stroke="#0a1322" strokeWidth="2"/><line x1="24" y1="18" x2="26" y2="10" stroke="#4ade80" strokeWidth="2"/></svg>
                  <div style={{fontSize:8,fontWeight:800,letterSpacing:2,color:"#0a1322"}}>NOVALYX</div>
                </div>
                <div style={{fontSize:7,color:"#6b7280",letterSpacing:1}}>RESEARCH</div>
                <div style={{height:1,background:"#0a1322",margin:"14px 0"}}/>
                <div style={{fontSize:14,fontWeight:800,color:"#0a1322",letterSpacing:0.5}}>BPC-157</div>
                <div style={{fontSize:9,color:"#6b7280",marginTop:4}}>5mg · Lyophilised</div>
              </div>
              <div>
                <div style={{fontSize:6,color:"#9ca3af",lineHeight:1.6,letterSpacing:0.3}}>
                  FOR LABORATORY RESEARCH USE ONLY.<br/>NOT FOR HUMAN OR VETERINARY USE.<br/>STORE AT −20°C.
                </div>
                <div style={{marginTop:8,fontSize:7,fontFamily:"monospace",color:"#0a1322",background:"#f3f4f6",padding:"3px 6px",borderRadius:2,display:"inline-block"}}>NVX-BPC-0426</div>
              </div>
            </div>
            {/* Vial mockup */}
            <div style={{position:"relative"}}>
              <div style={{width:60,height:140,background:"linear-gradient(180deg,#e5e7eb 0%,#f9fafb 20%,#e5e7eb 100%)",borderRadius:"4px 4px 6px 6px",position:"relative",boxShadow:"0 16px 32px rgba(0,0,0,0.4)"}}>
                <div style={{width:52,height:18,background:"linear-gradient(180deg,#4ade80,#22c55e)",position:"absolute",top:-8,left:4,borderRadius:"2px 2px 0 0",boxShadow:"inset 0 -2px 4px rgba(0,0,0,0.2)"}}/>
                <div style={{width:58,height:4,background:"#9ca3af",position:"absolute",top:10,left:1,borderRadius:1}}/>
                {/* Label */}
                <div style={{position:"absolute",top:40,left:4,right:4,bottom:20,background:"white",borderRadius:2,padding:"6px 4px",fontSize:5,textAlign:"center",color:"#0a1322"}}>
                  <div style={{fontWeight:800,letterSpacing:1}}>NOVALYX</div>
                  <div style={{fontSize:4,color:"#6b7280",marginTop:1,letterSpacing:0.5}}>RESEARCH</div>
                  <div style={{height:1,background:"#0a1322",margin:"4px 2px"}}/>
                  <div style={{fontSize:7,fontWeight:700,marginTop:2}}>BPC-157</div>
                  <div style={{fontSize:4,color:"#6b7280",marginTop:2}}>5mg</div>
                  <div style={{fontSize:3.5,fontFamily:"monospace",color:"#6b7280",marginTop:3}}>NVX-BPC-0426</div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div style={{fontSize:9.5,letterSpacing:3,color:"#4ade80",marginBottom:12}}>PROFESSIONAL PACKAGING</div>
            <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:30,fontWeight:800,marginBottom:16,lineHeight:1.15}}>Shipped ready for the lab.</h2>
            <p style={{fontSize:13.5,color:"rgba(255,255,255,0.5)",lineHeight:1.8,marginBottom:20}}>
              Each Novalyx Research compound arrives in tamper-evident packaging, fully labelled for laboratory handling — product name, batch code, storage conditions, and regulatory markings all visible at a glance.
            </p>
            <ul style={{listStyle:"none",fontSize:12.5,color:"rgba(255,255,255,0.55)",lineHeight:2}}>
              <li>✓ Tamper-evident seals on every vial</li>
              <li>✓ Cold-chain insulated shipping</li>
              <li>✓ Batch code printed on label + packaging</li>
              <li>✓ Full regulatory labelling (research use only)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* WHY NOVALYX — cleaner version */}
      <div style={{padding:"0 40px 80px"}}>
        <div style={{background:"#0a1322",borderRadius:14,padding:"48px 40px",border:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{fontSize:9.5,letterSpacing:3,color:"#4ade80",marginBottom:10}}>WHY NOVALYX</div>
          <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:30,fontWeight:800,marginBottom:40,maxWidth:460}}>Built for researchers who demand more.</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:28}}>
            {[["Independent Testing","Every batch verified by accredited third-party labs."],["Full Transparency","COA available for every product, every batch."],["Controlled Fulfillment","Secure handling, batch traceability, cold-chain across Europe."],["Stripe Secured","All payments handled by Stripe. Your data is safe."]].map(([title,desc])=>(
              <div key={title} style={{paddingTop:20,borderTop:"1px solid rgba(74,222,128,0.25)"}}>
                <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:15,fontWeight:700,marginBottom:10,color:"#4ade80"}}>{title}</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.45)",lineHeight:1.75}}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* B2B / BULK ORDERS */}
      <div style={{padding:"0 40px 80px"}}>
        <div style={{background:"linear-gradient(135deg,#0c1c2e,#0f2240)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:20,padding:"48px 48px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:28}}>
          <div style={{maxWidth:460}}>
            <div style={{fontSize:9.5,letterSpacing:3,color:"#4ade80",marginBottom:10}}>FOR LABS & BULK ORDERS</div>
            <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:28,fontWeight:800,marginBottom:12}}>B2B & Institutional Supply</h2>
            <p style={{fontSize:13.5,color:"rgba(255,255,255,0.48)",lineHeight:1.75}}>Contact us for bulk pricing, long-term supply agreements, and dedicated account support for research institutions.</p>
          </div>
          <button className="btn g" onClick={()=>go("contact")} style={{padding:"14px 28px",borderRadius:8,fontWeight:700,fontSize:12,letterSpacing:1}}>REQUEST BULK PRICING →</button>
        </div>
      </div>

      <div style={{padding:"0 40px 100px"}}>
        <div style={{background:"linear-gradient(135deg,#0a1628,#0d1e38)",border:"1px solid rgba(74,222,128,0.15)",borderRadius:20,padding:"56px 48px",textAlign:"center",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,opacity:0.02,backgroundImage:"linear-gradient(#4ade80 1px,transparent 1px),linear-gradient(90deg,#4ade80 1px,transparent 1px)",backgroundSize:"40px 40px"}}/>
          <div style={{position:"relative"}}>
            <div style={{fontSize:9.5,letterSpacing:3,color:"#4ade80",marginBottom:12}}>STAY INFORMED</div>
            <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:34,fontWeight:800,marginBottom:14}}>First Access. New Compounds. COA Alerts.</h2>
            <p style={{fontSize:14,color:"rgba(255,255,255,0.42)",marginBottom:32,maxWidth:420,margin:"0 auto 32px"}}>Join the Novalyx research list for early product access and batch notifications.</p>
            {subOk
              ? <div style={{color:"#4ade80",fontWeight:600,fontSize:15}}>✓ You're on the list.</div>
              : <div style={{display:"flex",gap:10,maxWidth:420,margin:"0 auto",justifyContent:"center",flexWrap:"wrap"}}>
                  <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com"
                    style={{flex:1,minWidth:210,padding:"12px 16px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,color:"white",fontSize:13}}/>
                  <button className="btn solid" onClick={()=>{if(email.includes("@"))setSubOk(true);}} style={{padding:"12px 24px",borderRadius:8,fontWeight:700,fontSize:12,letterSpacing:1}}>SUBSCRIBE</button>
                </div>
            }
            <div style={{fontSize:10,color:"rgba(255,255,255,0.2)",marginTop:14}}>No spam. Research professionals only.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CATEGORIES = [
  { key: "All",              color: "#4ade80" },
  { key: "Signature Blends", color: "#22d3ee" },
  { key: "Metabolic",        color: "#fbbf24" },
  { key: "Longevity",        color: "#c084fc" },
  { key: "Regenerative",     color: "#4ade80" },
  { key: "GH Research",      color: "#38bdf8" },
  { key: "Immune",           color: "#fb923c" },
  { key: "Cognitive",        color: "#2dd4bf" },
  { key: "Specialized",      color: "#f43f5e" },
  { key: "Lab Supplies",     color: "#67e8f9" },
];

const ProductsPage = ({ cur, addToCart, added, initialFilter, setProductFilter, lang="EN" }) => {
  const [sel,setSel] = useState(null);
  const [filter,setFilter] = useState(initialFilter || "All");

  // Sync with parent state
  useEffect(() => { if (initialFilter) setFilter(initialFilter); }, [initialFilter]);
  const onFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (setProductFilter) setProductFilter(newFilter);
  };

  const filtered = filter === "All" ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);

  // Group for "All" view
  const grouped = filter === "All"
    ? CATEGORIES.slice(1).map(c => ({
        category: c.key,
        color: c.color,
        products: PRODUCTS.filter(p => p.category === c.key)
      })).filter(g => g.products.length > 0)
    : null;

  return (
    <div style={{padding:"60px 40px 100px"}}>
      <div style={{marginBottom:40}}>
        <div style={{fontSize:9.5,letterSpacing:3,color:"#4ade80",marginBottom:10}}>{t(lang,"prod_sub")}</div>
        <h1 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:44,fontWeight:800,marginBottom:12}}>{t(lang,"prod_h1")}</h1>
        <p style={{fontSize:14,color:"rgba(255,255,255,0.42)",maxWidth:520,lineHeight:1.6}}>{t(lang,"prod_desc")}</p>
      </div>

      {/* CATEGORY FILTER PILLS */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:48,paddingBottom:8,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        {CATEGORIES.map(c => {
          const active = filter === c.key;
          const count = c.key === "All" ? PRODUCTS.length : PRODUCTS.filter(p => p.category === c.key).length;
          return (
            <button key={c.key}
              onClick={()=>onFilterChange(c.key)}
              style={{
                padding:"10px 18px",
                borderRadius:999,
                fontSize:12,
                fontWeight:active?700:500,
                letterSpacing:0.3,
                cursor:"pointer",
                border: active ? `1px solid ${c.color}` : "1px solid rgba(255,255,255,0.1)",
                background: active ? `${c.color}15` : "transparent",
                color: active ? c.color : "rgba(255,255,255,0.65)",
                transition:"all 0.2s",
                whiteSpace:"nowrap",
              }}>
              {c.key}
              <span style={{marginLeft:7,fontSize:10,opacity:0.65}}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* GROUPED DISPLAY FOR "ALL" */}
      {grouped ? (
        grouped.map(g => (
          <div key={g.category} style={{marginBottom:56}}>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:22}}>
              <div style={{width:4,height:22,background:g.color,borderRadius:2}}/>
              <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:22,fontWeight:700,letterSpacing:-0.3}}>{g.category}</h2>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",letterSpacing:1}}>{g.products.length} {g.products.length>1?t(lang,"compounds"):t(lang,"compound")}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:24}}>
              {g.products.map(p=>(
                <ProductCard key={p.id} p={p} cur={cur} onClick={()=>setSel(p)} lang={lang}/>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:24}}>
          {filtered.map(p=>(
            <ProductCard key={p.id} p={p} cur={cur} onClick={()=>setSel(p)} lang={lang}/>
          ))}
        </div>
      )}

      {sel&&<ProductModal p={sel} cur={cur} onAdd={addToCart} onClose={()=>setSel(null)} lang={lang}/>}
    </div>
  );
};

const COAPage = () => (
  <div style={{padding:"60px 40px 100px"}}>
    <div style={{marginBottom:48}}>
      <div style={{fontSize:9.5,letterSpacing:3,color:"#4ade80",marginBottom:10}}>TRANSPARENCY</div>
      <h1 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:44,fontWeight:800,marginBottom:12}}>COA Library</h1>
      <p style={{fontSize:14,color:"rgba(255,255,255,0.42)",maxWidth:500}}>Every batch tested. Every result published. Download COAs for all current Novalyx products.</p>
    </div>
    {PRODUCTS.map(p=>(
      <div key={p.id} style={{background:"linear-gradient(135deg,#0f2240,#0c1a2e)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"24px 28px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:18}}>
        <div style={{display:"flex",alignItems:"center",gap:18}}>
          <ProductIcon color={p.tagColor} size={40}/>
          <div>
            <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:18,fontWeight:700,marginBottom:4}}>{p.name}</h3>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>Batch #NVX-2026-{p.id.toUpperCase()}-001 · Tested April 2026</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          {[["Purity","≥99%"],["Heavy Metals","Pass"],["Sterility","Pass"],["Endotoxins","Pass"]].map(([l,v])=>(
            <div key={l} style={{textAlign:"center",background:"rgba(74,222,128,0.06)",border:"1px solid rgba(74,222,128,0.15)",borderRadius:8,padding:"7px 12px"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#4ade80"}}>{v}</div>
              <div style={{fontSize:8.5,color:"rgba(255,255,255,0.35)",marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
        <button className="btn g" style={{padding:"9px 18px",borderRadius:8,fontSize:11,fontWeight:700,letterSpacing:0.5}}>⬇ DOWNLOAD COA</button>
      </div>
    ))}
    <div style={{marginTop:32,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"22px 28px",fontSize:12,color:"rgba(255,255,255,0.35)",lineHeight:1.8}}>
      <strong style={{color:"rgba(255,255,255,0.5)"}}>About our testing:</strong> All products are independently tested by Janoshik Analytical (Czech Republic), a respected third-party peptide testing laboratory. Tests include HPLC purity and identity assessment. COAs are batch-specific and renewed with every production run.
    </div>
  </div>
);

const AboutPage = ({ go }) => (
  <div style={{padding:"60px 40px 100px"}}>
    <div style={{maxWidth:720,margin:"0 auto"}}>
      <div style={{fontSize:9.5,letterSpacing:3,color:"#4ade80",marginBottom:12}}>OUR STORY</div>
      <h1 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:44,fontWeight:800,marginBottom:28,lineHeight:1.1}}>Research-First.<br/>Transparency Always.</h1>
      <p style={{fontSize:15,color:"rgba(255,255,255,0.55)",lineHeight:1.85,marginBottom:24}}>Novalyx was founded with one mission: to give research professionals access to the highest-purity peptides available, with complete transparency at every step. No compromises on quality. No ambiguity on documentation.</p>
      <p style={{fontSize:15,color:"rgba(255,255,255,0.55)",lineHeight:1.85,marginBottom:24}}>Every product we supply goes through rigorous independent testing before it reaches our customers. We publish every COA. We document every batch. Transparency isn't just good practice — it's the only acceptable standard.</p>
      <p style={{fontSize:15,color:"rgba(255,255,255,0.55)",lineHeight:1.85,marginBottom:48}}>Our launch catalog spans regenerative, metabolic, longevity, immune, nootropic, and sleep research — with dedicated signature blends for integrated protocols. Quality over quantity, always.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:20,marginBottom:48}}>
        {[["🔬","Lab-First","Every decision starts with science, not marketing."],["📋","Open Docs","Full COA library, published for every batch."],["🤝","Researcher-Led","Built by and for serious research professionals."],["🌍","Global Delivery","EU-based fulfillment with international coverage."]].map(([icon,title,desc])=>(
          <div key={title} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"20px 18px"}}>
            <div style={{fontSize:24,marginBottom:10}}>{icon}</div>
            <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:14,fontWeight:700,marginBottom:7}}>{title}</div>
            <div style={{fontSize:11.5,color:"rgba(255,255,255,0.4)",lineHeight:1.7}}>{desc}</div>
          </div>
        ))}
      </div>
      <button className="btn solid" onClick={()=>go("products")} style={{padding:"13px 28px",borderRadius:8,fontWeight:700,fontSize:12,letterSpacing:1}}>VIEW OUR PRODUCTS</button>
    </div>
  </div>
);

const FAQPage = () => {
  const [open,setOpen] = useState(null);
  const faqs = [
    ["What are research peptides?","Research peptides are substances supplied exclusively for scientific and laboratory research. They are not intended for human or veterinary use, consumption, or therapeutic purposes."],
    ["Who can purchase from Novalyx?","Novalyx products are available to qualified researchers and laboratory professionals operating in compliance with applicable local laws and regulations."],
    ["What is a Certificate of Analysis (COA)?","A COA is a third-party laboratory document confirming the identity, purity, and safety profile of a peptide. Novalyx includes a batch-specific COA with every order."],
    ["How are products shipped?","Orders are processed under controlled fulfillment conditions and sourced per-order from our verified laboratory partners. Delivery across Europe typically takes 2–3 weeks depending on destination and batch availability."],
    ["How do I pay?","We use Stripe — one of the world's most trusted payment processors. We accept all major credit and debit cards. Your payment data never touches our servers."],
    ["What is your returns policy?","If a product does not match its COA specifications, contact us within 7 days. We will investigate and arrange a replacement or refund where appropriate."],
    ["Are your products legal in my country?","Regulatory status varies by jurisdiction. It is your responsibility to verify compliance with the laws of your country before purchasing."],
    ["How do I store these peptides?","All lyophilized peptides should be stored at −20°C, away from light. Specific storage and reconstitution instructions accompany every order."],
    ["Do you ship outside the EU?","We currently focus on EU dispatch. Contact us at info@novalyxresearch.com for enquiries about other regions."],
  ];
  return (
    <div style={{padding:"60px 40px 100px"}}>
      <div style={{maxWidth:720,margin:"0 auto"}}>
        <div style={{fontSize:9.5,letterSpacing:3,color:"#4ade80",marginBottom:10}}>SUPPORT</div>
        <h1 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:44,fontWeight:800,marginBottom:12}}>FAQ</h1>
        <p style={{fontSize:14,color:"rgba(255,255,255,0.42)",marginBottom:44}}>Common questions about products, ordering, and compliance.</p>
        {faqs.map(([q,a],i)=>(
          <div key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
            <div onClick={()=>setOpen(open===i?null:i)} style={{padding:"18px 0",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:16,fontWeight:700}}>{q}</span>
              <span style={{color:"#4ade80",fontSize:20,marginLeft:16,transition:"transform .2s",display:"inline-block",transform:open===i?"rotate(45deg)":"none"}}>+</span>
            </div>
            {open===i&&<div style={{paddingBottom:18,fontSize:13.5,color:"rgba(255,255,255,0.5)",lineHeight:1.8}}>{a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

const ContactPage = () => {
  const [form,setForm] = useState({name:"",email:"",subject:"",message:""});
  const [sent,setSent] = useState(false);
  const inp = {width:"100%",padding:"12px 16px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"white",fontSize:13};
  return (
    <div style={{padding:"60px 40px 100px"}}>
      <div style={{maxWidth:680,margin:"0 auto"}}>
        <div style={{fontSize:9.5,letterSpacing:3,color:"#4ade80",marginBottom:10}}>GET IN TOUCH</div>
        <h1 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:44,fontWeight:800,marginBottom:12}}>Contact Us</h1>
        <p style={{fontSize:14,color:"rgba(255,255,255,0.42)",marginBottom:44}}>Questions about products, orders, or compliance? We respond within 1 business day.</p>
        {sent
          ? <div style={{background:"rgba(74,222,128,0.08)",border:"1px solid rgba(74,222,128,0.25)",borderRadius:12,padding:32,textAlign:"center"}}>
              <div style={{fontSize:36,marginBottom:14}}>✅</div>
              <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:20,fontWeight:700,marginBottom:8}}>Message received</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.45)"}}>We'll be back within 1 business day.</div>
            </div>
          : <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.38)",letterSpacing:1,marginBottom:7}}>FULL NAME</div>
                  <input style={inp} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Dr. Jane Smith"/>
                </div>
                <div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.38)",letterSpacing:1,marginBottom:7}}>EMAIL</div>
                  <input style={inp} value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="jane@lab.eu"/>
                </div>
              </div>
              <div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.38)",letterSpacing:1,marginBottom:7}}>SUBJECT</div>
                <input style={inp} value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} placeholder="Product enquiry / Order / Other"/>
              </div>
              <div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.38)",letterSpacing:1,marginBottom:7}}>MESSAGE</div>
                <textarea style={{...inp,height:140,resize:"vertical"}} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Your message..."/>
              </div>
              <button className="btn solid" onClick={()=>{if(form.name&&form.email&&form.message)setSent(true);}} style={{padding:"13px 28px",borderRadius:8,fontWeight:700,fontSize:12,letterSpacing:1,alignSelf:"flex-start"}}>SEND MESSAGE</button>
              <div style={{fontSize:10.5,color:"rgba(255,255,255,0.22)",lineHeight:1.7}}>By submitting you agree to our Privacy Policy. We do not share your data with third parties.</div>
            </div>
        }
        <div style={{marginTop:48,display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:16}}>
          {[["📧","Email",CONFIG.EMAIL],["⏱","Response","Within 1 business day"],["📍","Based in","European Union"]].map(([icon,label,val])=>(
            <div key={label} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"18px 18px"}}>
              <div style={{fontSize:22,marginBottom:8}}>{icon}</div>
              <div style={{fontSize:9.5,color:"rgba(255,255,255,0.3)",letterSpacing:1,marginBottom:4}}>{label.toUpperCase()}</div>
              <div style={{fontSize:13,fontWeight:500}}>{val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Legal = ({ title, children }) => (
  <div style={{padding:"60px 40px 100px"}}>
    <div style={{maxWidth:720,margin:"0 auto"}}>
      <div style={{fontSize:9.5,letterSpacing:3,color:"#4ade80",marginBottom:10}}>LEGAL</div>
      <h1 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:40,fontWeight:800,marginBottom:32}}>{title}</h1>
      <div style={{fontSize:13.5,color:"rgba(255,255,255,0.5)",lineHeight:1.9}}>{children}</div>
    </div>
  </div>
);
const S = ({t,children}) => <div style={{marginBottom:28}}><h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:17,fontWeight:700,color:"white",marginBottom:9}}>{t}</h3>{children}</div>;

const PrivacyPage = () => (
  <Legal title="Privacy Policy">
    <p style={{marginBottom:14}}>Last updated: April 2026 · {CONFIG.BUSINESS_NAME} · SIRET {CONFIG.SIRET}</p>
    <S t="1. Who We Are"><p>Novalyx operates this website and is responsible for your personal data in accordance with the GDPR.</p></S>
    <S t="2. Data We Collect"><p>Name, email, shipping address, and order details you provide directly. Anonymised usage data via analytics to improve our site.</p></S>
    <S t="3. How We Use Your Data"><p>To process orders, provide support, send order communications, and — with consent — product announcements. Payment data is processed by Stripe; we never see or store your card details.</p></S>
    <S t="4. Data Sharing"><p>We do not sell your data. We share only with logistics and payment partners (Stripe) under strict processing agreements.</p></S>
    <S t="5. Your Rights"><p>Under GDPR: access, rectify, erase, restrict, port your data, or object to processing. Email {CONFIG.EMAIL}.</p></S>
    <S t="6. Cookies"><p>Essential cookies for functionality only. Analytics cookies placed with consent only.</p></S>
    <S t="7. Contact"><p>Data enquiries: {CONFIG.EMAIL}</p></S>
  </Legal>
);

const TermsPage = () => (
  <Legal title="Terms & Conditions">
    <p style={{marginBottom:14}}>Last updated: April 2026 · {CONFIG.BUSINESS_NAME} · SIRET {CONFIG.SIRET}</p>
    <S t="1. Acceptance"><p>By using this website or placing an order you agree to these Terms. If you disagree, do not use this site.</p></S>
    <S t="2. Research Use Only"><p>All products are for in-vitro laboratory research only. Not for human or veterinary use. By purchasing you confirm you are a qualified researcher acting lawfully.</p></S>
    <S t="3. Age Restriction"><p>You must be 18+ to purchase. Completing a purchase confirms you meet this requirement.</p></S>
    <S t="4. Orders & Payment"><p>Prices are shown in EUR and do not include VAT (TVA non applicable, art. 293B du CGI — French micro-entrepreneur regime). Payment is processed securely by Stripe. We reserve the right to cancel orders, with a full refund issued.</p></S>
    <S t="5. Shipping & International Orders"><p>Orders are processed under controlled fulfillment conditions with per-order batch sourcing from our verified laboratory partners. Delivery across Europe typically takes 2–3 weeks; international destinations 3–5 weeks. Delivery timescales are estimates, not guarantees. Risk passes to buyer upon dispatch.</p><p>For international orders (outside the European Union), the buyer is solely responsible for verifying that the products may be legally imported into their jurisdiction, for paying any applicable customs duties, taxes, or clearance fees, and for complying with all local laws governing research compounds. Novalyx Research does not act as an importer of record. Packages seized, destroyed, refused, or returned by customs authorities in any non-EU jurisdiction are non-refundable. By placing an international order, the buyer expressly acknowledges and accepts these risks.</p></S>
    <S t="6. Returns"><p>Contact us within 7 days if products arrive damaged or do not match COA specs. Opened compounds cannot be returned for safety reasons.</p></S>
    <S t="7. Limitation of Liability"><p>Novalyx is not liable for misuse of products, or for indirect or consequential damages from use of this website or products.</p></S>
    <S t="8. Governing Law"><p>Governed by French law and applicable EU regulations.</p></S>
  </Legal>
);

const DisclaimerPage = () => (
  <Legal title="Disclaimer">
    <S t="Research Use Only"><p>All products are intended exclusively for scientific research by qualified professionals in appropriate laboratory settings. They are not drugs, supplements, or food products.</p></S>
    <S t="Not for Human Use"><p>No product sold by Novalyx is intended for human or veterinary administration. Novalyx expressly disclaims liability for any use contrary to this designation.</p></S>
    <S t="No Medical Advice"><p>Nothing on this website constitutes medical advice. No claims are made regarding health benefits or therapeutic effects of any compound.</p></S>
    <S t="Regulatory Compliance"><p>It is the purchaser's sole responsibility to verify that a compound is legal in their jurisdiction. Novalyx makes no representation regarding regulatory status in any country.</p></S>
    <S t="Accuracy"><p>COA documents represent the definitive specification per batch. While we strive for accuracy, we do not warrant all website content is error-free.</p></S>
  </Legal>
);

const ShippingPage = () => (
  <div style={{padding:"60px 40px 100px"}}>
    <div style={{maxWidth:720,margin:"0 auto"}}>
      <div style={{fontSize:9.5,letterSpacing:3,color:"#4ade80",marginBottom:10}}>SHIPPING & FULFILLMENT</div>
      <h1 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:40,fontWeight:800,marginBottom:32}}>Shipping & Fulfillment</h1>
      <div style={{fontSize:13.5,color:"rgba(255,255,255,0.5)",lineHeight:1.9}}>
        <p style={{marginBottom:18}}>All orders are processed under a controlled fulfillment system to ensure product integrity and batch consistency.</p>
        <p style={{marginBottom:18}}>Each order is prepared following confirmation and dispatched within our standard processing timeframe. Delivery typically takes <strong style={{color:"white"}}>2–3 weeks</strong>, as our compounds are sourced per-order from our verified laboratory partners to ensure batch freshness and traceability.</p>
        <p style={{marginBottom:32}}>You will receive a tracking confirmation once your order is processed and in transit.</p>

        <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:22,fontWeight:800,color:"white",marginBottom:20,marginTop:32}}>Delivery Zones & Rates</h2>

        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,overflow:"hidden",marginBottom:32}}>
          {[
            ["🇫🇷 France",                  "€6.90",  "2–3 weeks"],
            ["🇪🇺 European Union",           "€9.90",  "2–3 weeks"],
            ["🇨🇭 Switzerland, 🇬🇧 UK",       "€14.90", "3–4 weeks"],
            ["🇺🇸 USA, 🇨🇦 Canada",           "€24.90", "3–5 weeks"],
            ["🇦🇺 Australia, 🇳🇿 New Zealand","€29.90", "3–5 weeks"],
            ["🌍 Rest of world",            "€29.90", "Variable"],
          ].map(([zone,rate,time])=>(
            <div key={zone} style={{padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,0.05)",display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,fontSize:13}}>
              <div style={{flex:"1 1 45%",color:"white",fontWeight:500}}>{zone}</div>
              <div style={{flex:"0 0 80px",textAlign:"right",color:"#4ade80",fontWeight:700}}>{rate}</div>
              <div style={{flex:"0 0 100px",textAlign:"right",color:"rgba(255,255,255,0.45)",fontSize:12}}>{time}</div>
            </div>
          ))}
          <div style={{padding:"12px 20px",background:"rgba(74,222,128,0.05)",fontSize:12,color:"rgba(255,255,255,0.55)"}}>
            ✓ Free shipping on EU orders over €100
          </div>
        </div>

        <div style={{background:"rgba(251,191,36,0.05)",border:"1px solid rgba(251,191,36,0.22)",borderRadius:10,padding:"22px 26px",marginBottom:32}}>
          <div style={{fontSize:9.5,letterSpacing:2,color:"#fbbf24",fontWeight:700,marginBottom:12}}>⚠ INTERNATIONAL SHIPPING — BUYER RESPONSIBILITY</div>
          <p style={{marginBottom:12,fontSize:13,color:"rgba(255,255,255,0.65)",lineHeight:1.75}}>
            Orders shipped outside the European Union are dispatched at the <strong style={{color:"white"}}>buyer's own risk and responsibility</strong>. Import regulations for research compounds vary significantly by country.
          </p>
          <p style={{marginBottom:12,fontSize:13,color:"rgba(255,255,255,0.65)",lineHeight:1.75}}>
            It is the sole responsibility of the buyer to verify whether these products may be legally imported into their jurisdiction. Novalyx Research does not act as an importer of record and is not responsible for:
          </p>
          <ul style={{paddingLeft:20,marginBottom:12,fontSize:13,color:"rgba(255,255,255,0.58)",lineHeight:1.85}}>
            <li>Customs seizures, inspections, or delays</li>
            <li>Import duties, taxes, or clearance fees imposed by your country</li>
            <li>Compliance with local laws regulating research compounds</li>
            <li>Packages refused, destroyed, or returned by customs authorities</li>
          </ul>
          <p style={{fontSize:13,color:"rgba(255,255,255,0.65)",lineHeight:1.75}}>
            By placing an international order, you expressly acknowledge that you understand your local import regulations and accept all associated risks. <strong style={{color:"white"}}>Seized, refused, or destroyed packages are non-refundable.</strong>
          </p>
        </div>

        <div style={{background:"rgba(74,222,128,0.04)",border:"1px solid rgba(74,222,128,0.15)",borderRadius:10,padding:"20px 24px",marginBottom:36}}>
          <div style={{fontSize:9.5,letterSpacing:2,color:"#4ade80",fontWeight:700,marginBottom:10}}>RESEARCH USE DECLARATION</div>
          <p style={{marginBottom:10,fontSize:13,color:"rgba(255,255,255,0.55)"}}>All products are supplied strictly for laboratory research use only and are handled according to professional standards.</p>
          <p style={{fontSize:13,color:"rgba(255,255,255,0.55)"}}>By placing an order, you confirm that you are a qualified professional and that you comply with all applicable laws and regulations in your jurisdiction.</p>
        </div>

        <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:22,fontWeight:800,color:"white",marginBottom:20,marginTop:32}}>FAQ — Shipping</h2>

        <div style={{borderTop:"1px solid rgba(255,255,255,0.08)"}}>
          {[
            ["How long does delivery take?","Delivery typically takes 2–3 weeks across Europe, and 3–5 weeks for international destinations. Our compounds are sourced per-order from verified laboratory partners to ensure batch-specific traceability."],
            ["Why is there a delivery timeframe?","Orders are processed under controlled conditions and sourced fresh from our verified partner laboratories to maintain product quality, batch freshness, and full traceability."],
            ["Do you ship internationally?","Yes. We ship worldwide. However, international orders are dispatched at the buyer's own risk — please review our international shipping notice above before ordering."],
            ["What happens if customs seizes my package?","For international (non-EU) orders, seizure risk is the buyer's responsibility. We cannot provide refunds for packages seized, destroyed, or refused by customs authorities in any country outside the EU."],
            ["Can I track my order?","Yes. Tracking information is provided once your order is processed and in transit."],
            ["Do you offer free shipping?","EU orders above €100 qualify for free shipping automatically at checkout."],
          ].map(([q,a])=>(
            <div key={q} style={{padding:"18px 0",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
              <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:15,fontWeight:700,color:"white",marginBottom:8}}>{q}</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.48)",lineHeight:1.75}}>{a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════ */
export default function App() {
  const [ageOk,    setAgeOk]    = useState(false);
  const [confirmed,setConfirmed]= useState(false);
  const [page,     setPage]     = useState("home");
  const [cur,      setCur]      = useState("EUR");
  const [cart,     setCart]     = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [added,    setAdded]    = useState(null);
  const [productFilter, setProductFilter] = useState("All");
  const [lang,     setLang]     = useState("EN");

  // Load cart + currency from localStorage on mount (persists across sessions).
  // Wrapped in try/catch — some environments (private browsing, SSR, older iOS) block storage.
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("novalyx_cart");
      if (savedCart) setCart(JSON.parse(savedCart));
      const savedCur = localStorage.getItem("novalyx_currency");
      if (savedCur && CURRENCIES[savedCur]) setCur(savedCur);
    } catch (e) { /* storage unavailable — silently continue */ }
  }, []);

  // Persist cart whenever it changes.
  useEffect(() => {
    try { localStorage.setItem("novalyx_cart", JSON.stringify(cart)); } catch (e) {}
  }, [cart]);

  // Persist currency preference.
  useEffect(() => {
    try { localStorage.setItem("novalyx_currency", cur); } catch (e) {}
  }, [cur]);

  const cartCount = cart.reduce((s,i)=>s+i.qty,0);
  const go = (p, filter) => {
    setPage(p);
    if (filter !== undefined) setProductFilter(filter);
    window.scrollTo(0,0);
  };

  const addToCart = (product, variant, q=1) => {
    // Unique cart line ID = product.id + variant size (same peptide different sizes = different lines)
    const lineId = `${product.id}-${variant.size}`;
    setCart(prev=>{
      const ex = prev.find(i=>i.lineId===lineId);
      if(ex) return prev.map(i=>i.lineId===lineId?{...i,qty:i.qty+q}:i);
      return [...prev,{
        lineId,
        id: product.id,
        name: product.name,
        size: variant.size,
        batch: variant.batch,
        price: variant.price,
        stripePrice: variant.stripePrice,
        qty: q,
      }];
    });
    setAdded(lineId);
    setTimeout(()=>setAdded(null),1400);
  };

  const pages = {
    home:       <Home go={go} cur={cur} addToCart={addToCart} added={added} lang={lang}/>,
    products:   <ProductsPage cur={cur} addToCart={addToCart} added={added} initialFilter={productFilter} setProductFilter={setProductFilter} lang={lang}/>,
    coa:        <COAPage lang={lang}/>,
    about:      <AboutPage go={go} lang={lang}/>,
    faq:        <FAQPage lang={lang}/>,
    contact:    <ContactPage lang={lang}/>,
    shipping:   <ShippingPage lang={lang}/>,
    privacy:    <PrivacyPage lang={lang}/>,
    terms:      <TermsPage lang={lang}/>,
    disclaimer: <DisclaimerPage lang={lang}/>,
  };

  return (
    <div style={{minHeight:"100vh",background:"#080f1e",color:"white",fontFamily:"'DM Sans',sans-serif"}}>
      <style>{CSS}</style>

      {!ageOk&&(
        <div className="fi" style={{position:"fixed",inset:0,zIndex:999,background:"rgba(8,15,30,0.97)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)"}}>
          <div className="su" style={{background:"linear-gradient(145deg,#0f2240,#0c1a30)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:16,padding:"48px 40px",maxWidth:440,width:"90%",textAlign:"center",boxShadow:"0 40px 80px rgba(0,0,0,0.6)"}}>
            <Logo s={44}/>
            <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:24,fontWeight:800,margin:"18px 0 10px"}}>{t(lang,"age_title")}</h2>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.45)",lineHeight:1.75,marginBottom:24}}>{t(lang,"age_desc")}</p>
            <div style={{marginBottom:20,textAlign:"left",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"14px 16px"}}>
              <label style={{fontSize:12,color:"rgba(255,255,255,0.7)",lineHeight:1.55,display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer"}}>
                <input type="checkbox" checked={confirmed} onChange={(e)=>setConfirmed(e.target.checked)} style={{marginTop:3,accentColor:"#4ade80",cursor:"pointer",flexShrink:0}}/>
                <span>{t(lang,"age_confirm")}</span>
              </label>
            </div>
            <button className="btn g" onClick={()=>confirmed&&setAgeOk(true)} disabled={!confirmed} style={{width:"100%",padding:14,borderRadius:8,fontWeight:700,fontSize:12,letterSpacing:1.2,marginBottom:12,opacity:confirmed?1:0.4,cursor:confirmed?"pointer":"not-allowed"}}>
              {t(lang,"age_enter")}
            </button>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.18)",lineHeight:1.6}}>{t(lang,"age_footer")}</div>
          </div>
        </div>
      )}

      {/* TOP ANNOUNCEMENT BAR */}
      <div style={{background:"#050a15",borderBottom:"1px solid rgba(255,255,255,0.05)",padding:"8px 40px",display:"flex",justifyContent:"center",gap:28,flexWrap:"wrap",fontSize:10.5,letterSpacing:1.5,color:"rgba(255,255,255,0.55)",fontWeight:500}}>
        <span>{t(lang,"ann1")}</span>
        <span style={{color:"rgba(255,255,255,0.15)"}}>|</span>
        <span>{t(lang,"ann2")}</span>
        <span style={{color:"rgba(255,255,255,0.15)"}}>|</span>
        <span>{t(lang,"ann3")}</span>
        <span style={{color:"rgba(255,255,255,0.15)"}}>|</span>
        <span>{t(lang,"ann4")}</span>
      </div>
      <Nav page={page} go={go} cur={cur} setCur={setCur} cartCount={cartCount} openCart={()=>setCartOpen(true)} lang={lang} setLang={setLang}/>
      <div className="fi" key={`${page}-${lang}`}>{pages[page]||pages.home}</div>
      <Footer go={go} lang={lang}/>
      {cartOpen&&<Cart cart={cart} cur={cur} onClose={()=>setCartOpen(false)} onRemove={lineId=>setCart(p=>p.filter(i=>i.lineId!==lineId))} lang={lang}/>}
    </div>
  );
}
