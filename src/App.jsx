import { useState, useEffect } from "react";

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
  // Retatrutide
  "retatrutide_5mg": "https://buy.stripe.com/cNi14nd4n3gS2vk7002Ry04",
  "retatrutide_10mg": "https://buy.stripe.com/9B65kDd4n8Bc1rg9882Ry03",
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
  // Bacteriostatic Water
  "bac-water_3ml vial": "https://buy.stripe.com/fZu14n8O72cO4Ds4RS2Ry0Z",
  "bac-water_10ml vial": "https://buy.stripe.com/cNieVd5BV2cOb1Q2JK2Ry10",
  "bac-water_5 × 10ml": "https://buy.stripe.com/aFa3cve8r04Ggma1FG2Ry11",
  // Novalyx Formula 04
  "formula04_80mg total": "https://buy.stripe.com/eVq3cv7K3aJk7PEckk2Ry0Y",
};
const getStripeLink = (id, size) => STRIPE_LINKS[`${id}_${size}`] || "";

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
    nav_products: "PRODUCTS", nav_coa: "COA LIBRARY", nav_calc: "CALCULATOR", nav_about: "ABOUT", nav_faq: "FAQ", nav_contact: "CONTACT",
    // Announcement bar
    ann1: "FRANCE BASED", ann2: "BATCH TESTED", ann3: "WORLDWIDE SHIPPING", ann4: "CONTROLLED FULFILLMENT",
    // Age gate
    age_title: "Professional Access",
    age_desc: "Novalyx Research supplies compounds exclusively for laboratory research. Access is restricted to qualified professionals.",
    age_confirm: "I confirm I am a qualified professional and this order is for laboratory research use only.",
    age_enter: "ENTER SITE →",
    age_footer: "By entering you confirm compliance with all applicable laws in your jurisdiction.",
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
    nav_products: "PRODUITS", nav_coa: "BIBLIOTHÈQUE COA", nav_calc: "CALCULATEUR", nav_about: "À PROPOS", nav_faq: "FAQ", nav_contact: "CONTACT",
    // Announcement bar
    ann1: "ENTREPRISE FRANÇAISE", ann2: "TESTÉ PAR LOT", ann3: "LIVRAISON INTERNATIONALE", ann4: "FULFILLMENT CONTRÔLÉ",
    // Age gate
    age_title: "Accès Professionnel",
    age_desc: "Novalyx Research fournit des composés exclusivement pour la recherche en laboratoire. L'accès est réservé aux professionnels qualifiés.",
    age_confirm: "Je confirme être un professionnel qualifié et que cette commande est uniquement destinée à la recherche en laboratoire.",
    age_enter: "ACCÉDER AU SITE →",
    age_footer: "En entrant, vous confirmez être en conformité avec toutes les lois applicables dans votre juridiction.",
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
  "RECOVERY RESEARCH": "RECHERCHE RÉCUPÉRATION",
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
  // Categories
  "Regenerative": "Régénératif",
  "Metabolic": "Métabolique",
  "GH Research": "Recherche GH",
  "Growth & Recovery": "Croissance & Récupération",
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
  "Shelf life": "Durée de conservation",
  "COA": "COA",
  "Composition": "Composition",
  // Spec values
  "Lyophilised vial": "Flacon lyophilisé",
  "Janoshik (par lot)": "Janoshik (par lot)",
  "24 months (sealed)": "24 mois (scellé)",
  "−20°C / avoid light": "−20°C / à l'abri de la lumière",
  "Janoshik HPLC (per batch)": "Janoshik HPLC (par lot)",
  "≥99% (HPLC verified)": "≥99% (vérifié HPLC)",
  "≥99% (Janoshik HPLC)": "≥99% (Janoshik HPLC)",
  "Blend verified": "Mélange vérifié",
  "Proprietary multi-peptide research blends for integrated protocols.": "Mélanges de recherche propriétaires multi-peptides pour protocoles intégrés.",
  "GLP-1, GIP, glucagon and amylin receptor research.": "Recherche sur les récepteurs GLP-1, GIP, glucagon et amyline.",
  "Tissue repair, wound healing, and angiogenesis research.": "Recherche sur la réparation tissulaire, la cicatrisation et l'angiogenèse.",
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
    desc: "BPC-157 (Body Protection Compound) is a synthetic pentadecapeptide supplied for research into tissue repair, angiogenesis, and gastrointestinal integrity. Each vial contains verified-purity lyophilized peptide, independently batch-tested by accredited third-party laboratories. Supplied exclusively for in-vitro and laboratory research purposes.",
    shortDesc_fr: "Fragment pentadécapeptide pour la recherche sur la réparation tissulaire, l'intégrité intestinale et les voies de l'angiogenèse.",
    desc_fr: "Le BPC-157 (Body Protection Compound) est un pentadécapeptide synthétique fourni pour la recherche sur la réparation tissulaire, l'angiogenèse et l'intégrité gastro-intestinale. Chaque flacon contient un peptide lyophilisé de pureté vérifiée, testé par lot de manière indépendante par des laboratoires tiers accrédités. Fourni exclusivement à des fins de recherche in-vitro et en laboratoire.",
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
      { size: "5mg",  price: 64.99, batch: "NVX-BPC5-0426",  stripeLink: "https://buy.stripe.com/3cI28r8O73gS6LA8442Ry01" },
      { size: "10mg", price: 99.99, batch: "NVX-BPC10-0426", stripeLink: "https://buy.stripe.com/00w00jc0j2cO4Ds5VW2Ry02" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
    ],
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
    shortDesc_fr: "Fragment de Thymosine Bêta-4 pour la recherche sur la migration cellulaire, la récupération et les voies régénératives.",
    desc_fr: "Le TB-500 est un fragment synthétique de la Thymosine Bêta-4, fourni pour la recherche sur la migration cellulaire, l'angiogenèse et la régénération tissulaire. Chaque flacon contient un peptide lyophilisé de pureté vérifiée, testé par lot de manière indépendante.",
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
      { size: "5mg",  price: 89.99,  batch: "NVX-TB5-0426",  stripeLink: "https://buy.stripe.com/dRm5kD1lF4kW0ncfww2Ry09" },
      { size: "10mg", price: 139.99, batch: "NVX-TB10-0426", stripeLink: "https://buy.stripe.com/aFa5kDe8r6t44Ds5VW2Ry0a" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
      { size: "50mg",  price: 59.99, batch: "NVX-GHK50-0426",  stripeLink: "https://buy.stripe.com/5kQ7sL8O72cO6LAbgg2Ry0g" },
      { size: "100mg", price: 89.99, batch: "NVX-GHK100-0426", stripeLink: "https://buy.stripe.com/00w4gz4xReZAgma8442Ry0h" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
      { size: "5mg",  price: 54.99, batch: "NVX-KPV5-0426",  stripeLink: "https://buy.stripe.com/6oUeVd5BVdVw9XM5VW2Ry12" },
      { size: "10mg", price: 79.99, batch: "NVX-KPV10-0426", stripeLink: "https://buy.stripe.com/bJedR9c0j9Fg9XMdoo2Ry13" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
    shortDesc_fr: "Peptide de recherche triple-agoniste synthétique pour l'investigation in-vitro en laboratoire des voies des récepteurs GLP-1, GIP et glucagon.",
    desc_fr: "Le Retatrutide est un peptide synthétique fourni exclusivement pour la recherche in-vitro en laboratoire sur la signalisation des récepteurs GLP-1, GIP et glucagon. Chaque flacon contient un peptide lyophilisé de pureté vérifiée avec documentation analytique spécifique au lot par Janoshik Analytical (République tchèque). Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
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
      { size: "5mg",  price: 149.99, batch: "NVX-RET5-0426",  stripeLink: "https://buy.stripe.com/cNi14nd4n3gS2vk7002Ry04" },
      { size: "10mg", price: 229.99, batch: "NVX-RET10-0426", stripeLink: "https://buy.stripe.com/9B65kDd4n8Bc1rg9882Ry03" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
      { size: "10mg", price: 299.99, batch: "NVX-MZD10-0426", stripeLink: "https://buy.stripe.com/cNi5kD5BV04Gb1Q8442Ry14" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
      "Synthétique : dual-agonist peptide",
      "Recherche sur advanced metabolic signalling",
      "Formulation lyophilisée haute stabilité",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "10mg", price: 399.99, batch: "NVX-SUR10-0426", stripeLink: "https://buy.stripe.com/8x2aEX4xRbNo6LA3NO2Ry15" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
      "Synthétique : long-acting amylin analog",
      "Recherche sur amylin receptor pathways",
      "Formulation lyophilisée haute stabilité",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg",  price: 219.99, batch: "NVX-CGL5-0426",  stripeLink: "https://buy.stripe.com/4gM28r4xR2cOfi6ess2Ry0c" },
      { size: "10mg", price: 379.99, batch: "NVX-CGL10-0426", stripeLink: "https://buy.stripe.com/28E28r5BV9Fg5HwgAA2Ry0d" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
      "Synthétique : GHRH analog",
      "Recherche sur visceral fat metabolism",
      "Lyophilized for maximum stability",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg",  price: 159.99, batch: "NVX-TES5-0426",  stripeLink: "https://buy.stripe.com/fZu5kD1lF18K7PE1FG2Ry0e" },
      { size: "10mg", price: 279.99, batch: "NVX-TES10-0426", stripeLink: "https://buy.stripe.com/6oU4gzc0jg3E4Dsdoo2Ry0f" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
      { size: "5mg",  price: 64.99,  batch: "NVX-IPA5-0426",  stripeLink: "https://buy.stripe.com/28E6oH2pJaJk5Hwess2Ry0i" },
      { size: "10mg", price: 109.99, batch: "NVX-IPA10-0426", stripeLink: "https://buy.stripe.com/6oU9ATd4n18K2vkbgg2Ry0j" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
      "Synthétique : GHRH 1-29 fragment",
      "Recherche sur GH releasing pathways",
      "Lyophilized for maximum stability",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg", price: 109.99, batch: "NVX-SER5-0426", stripeLink: "https://buy.stripe.com/4gM8wP4xR6t49XMbgg2Ry0l" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
      "Synthétique : GHRH analog (no DAC)",
      "Recherche sur GH releasing pathways",
      "Lyophilized for maximum stability",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "10mg", price: 249.99, batch: "NVX-CJC10-0426", stripeLink: "https://buy.stripe.com/4gMfZh6FZbNo5Hwbgg2Ry0k" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
      { size: "500mg",  price: 149.99, batch: "NVX-NAD500-0426",  stripeLink: "https://buy.stripe.com/28E00j0hB5p0d9Yess2Ry0m" },
      { size: "1000mg", price: 269.99, batch: "NVX-NAD1000-0426", stripeLink: "https://buy.stripe.com/cNi28re8r2cO2vkgAA2Ry0n" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
      "Synthétique : tetrapeptide (Ala-Glu-Asp-Gly)",
      "Recherche sur telomerase and longevity pathways",
      "Formulation lyophilisée haute stabilité",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "10mg", price: 89.99,  batch: "NVX-EPI10-0426", stripeLink: "https://buy.stripe.com/4gM6oH5BVaJk2vkckk2Ry0o" },
      { size: "50mg", price: 299.99, batch: "NVX-EPI50-0426", stripeLink: "https://buy.stripe.com/aFa5kD1lF7x8b1Q3NO2Ry0p" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
      "Synthétique : tripeptide",
      "Recherche sur neuroprotection and cognitive function",
      "Formulation lyophilisée haute stabilité",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg",  price: 99.99,  batch: "NVX-PIN5-0426",  stripeLink: "https://buy.stripe.com/eVq9AT5BV18K1rg4RS2Ry0q" },
      { size: "10mg", price: 149.99, batch: "NVX-PIN10-0426", stripeLink: "https://buy.stripe.com/14A4gze8r6t41rgckk2Ry0r" },
      { size: "20mg", price: 219.99, batch: "NVX-PIN20-0426", stripeLink: "https://buy.stripe.com/aFaaEX1lF18Kb1Q4RS2Ry0s" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
      { size: "10mg", price: 119.99, batch: "NVX-MOTS10-0426", stripeLink: "https://buy.stripe.com/28E8wP7K3g3E4Ds9882Ry0t" },
      { size: "40mg", price: 299.99, batch: "NVX-MOTS40-0426", stripeLink: "https://buy.stripe.com/6oUcN50hB3gS1rgckk2Ry0u" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
      { size: "10mg", price: 149.99, batch: "NVX-SS31-10-0426", stripeLink: "https://buy.stripe.com/4gMeVde8r3gS6LAgAA2Ry0v" },
      { size: "50mg", price: 499.99, batch: "NVX-SS31-50-0426", stripeLink: "https://buy.stripe.com/6oU3cv2pJdVwee20BC2Ry0w" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
      "Synthétique : 28-amino acid peptide",
      "Recherche sur immune modulation and T-cell pathways",
      "Formulation lyophilisée haute stabilité",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg",  price: 169.99, batch: "NVX-TA1-5-0426",  stripeLink: "https://buy.stripe.com/6oU6oH8O79Fg8TIbgg2Ry0x" },
      { size: "10mg", price: 279.99, batch: "NVX-TA1-10-0426", stripeLink: "https://buy.stripe.com/eVq28r8O79Fgee23NO2Ry0y" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
      { size: "10mg", price: 129.99, batch: "NVX-TYM10-0426", stripeLink: "https://buy.stripe.com/5kQ4gzggz18K3zobgg2Ry0z" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
      { size: "5mg", price: 169.99, batch: "NVX-LL37-0426", stripeLink: "https://buy.stripe.com/4gMaEXaWf2cOd9Yckk2Ry0A" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
      "Synthétique : heptapeptide (ACTH 4-10 analog)",
      "Recherche sur cognitive function and BDNF",
      "Formulation lyophilisée haute stabilité",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg",  price: 79.99,  batch: "NVX-SMX5-0426",  stripeLink: "https://buy.stripe.com/cNifZhggz18K9XMgAA2Ry0B" },
      { size: "11mg", price: 149.99, batch: "NVX-SMX11-0426", stripeLink: "https://buy.stripe.com/6oU6oHfcv7x8ee29882Ry0C" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
      "Synthétique : heptapeptide (tuftsin analog)",
      "Recherche sur anxiolytic and GABAergic pathways",
      "Formulation lyophilisée haute stabilité",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg",  price: 89.99,  batch: "NVX-SEL5-0426",  stripeLink: "https://buy.stripe.com/9B6aEX4xRaJkgma3NO2Ry0D" },
      { size: "11mg", price: 149.99, batch: "NVX-SEL11-0426", stripeLink: "https://buy.stripe.com/14AcN5aWf18K1rg8442Ry0E" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
      { size: "60mg", price: 129.99, batch: "NVX-CBL60-0426", stripeLink: "https://buy.stripe.com/14A5kD8O704G4Ds1FG2Ry0F" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vials (6-pack)" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
      "Synthétique : nonapeptide",
      "Recherche sur sleep regulation and delta wave activity",
      "Formulation lyophilisée haute stabilité",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg",  price: 79.99,  batch: "NVX-DSIP5-0426",  stripeLink: "https://buy.stripe.com/28E3cvaWf3gSd9Y4RS2Ry0G" },
      { size: "10mg", price: 119.99, batch: "NVX-DSIP10-0426", stripeLink: "https://buy.stripe.com/cNifZhe8r04G7PE1FG2Ry0H" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
      "Synthétique : cyclic heptapeptide",
      "Recherche sur MC3/MC4 receptor pathways",
      "Formulation lyophilisée haute stabilité",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "10mg", price: 119.99, batch: "NVX-PT10-0426", stripeLink: "https://buy.stripe.com/9B6dR9ggz04G8TI1FG2Ry0I" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
      { size: "10mg", price: 159.99, batch: "NVX-ARA10-0426", stripeLink: "https://buy.stripe.com/9B6dR95BV8Bcb1Qacc2Ry0J" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
      "Synthétique : decapeptide",
      "Recherche sur GnRH and reproductive pathways",
      "Formulation lyophilisée haute stabilité",
      "Test HPLC du fabricant inclus",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "5mg",  price: 89.99,  batch: "NVX-KIS5-0426",  stripeLink: "https://buy.stripe.com/eVq3cv6FZeZA8TIgAA2Ry0K" },
      { size: "10mg", price: 149.99, batch: "NVX-KIS10-0426", stripeLink: "https://buy.stripe.com/7sYfZhe8raJk1rgbgg2Ry0L" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
    desc: "Tirzepatide is a synthetic peptide supplied exclusively for in-vitro laboratory research into GLP-1 and GIP receptor signalling. Each vial contains verified-purity lyophilized peptide with batch-specific analytical documentation by Janoshik Analytical (Czech Republic). Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
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
      { size: "5mg",  price: 129.99, batch: "NVX-TIRZ5-0426",  stripeLink: "https://buy.stripe.com/6oUaEX0hB4kW6LA7002Ry05" },
      { size: "10mg", price: 189.99, batch: "NVX-TIRZ10-0426", stripeLink: "https://buy.stripe.com/00w3cv7K3bNo7PE7002Ry06" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
    desc: "Semaglutide is a synthetic peptide supplied exclusively for in-vitro laboratory research into GLP-1 receptor signalling. Each vial contains verified-purity lyophilized peptide with batch-specific analytical documentation by Janoshik Analytical (Czech Republic). Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    shortDesc_fr: "Peptide de recherche agoniste du récepteur GLP-1 synthétique pour l'investigation in-vitro en laboratoire des voies de signalisation de l'incrétine.",
    desc_fr: "Le Semaglutide est un peptide synthétique fourni exclusivement pour la recherche in-vitro en laboratoire sur la signalisation du récepteur GLP-1. Chaque flacon contient un peptide lyophilisé de pureté vérifiée avec documentation analytique spécifique au lot par Janoshik Analytical (République tchèque). Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
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
      { size: "5mg",  price: 119.99, batch: "NVX-SEMA5-0426",  stripeLink: "https://buy.stripe.com/8x2fZh0hB18K0nc5VW2Ry07" },
      { size: "10mg", price: 169.99, batch: "NVX-SEMA10-0426", stripeLink: "https://buy.stripe.com/8x2cN5e8r18Kd9Y3NO2Ry08" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
    desc: "AOD-9604 is a synthetic modified fragment of growth hormone (amino acids 176-191), supplied exclusively for in-vitro laboratory research into lipid metabolism signalling. Each vial contains verified-purity lyophilized peptide with batch-specific analytical documentation by Janoshik Analytical (Czech Republic). Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    shortDesc_fr: "Peptide de recherche fragment modifié d'hormone de croissance (176-191) pour l'investigation in-vitro des voies du métabolisme lipidique.",
    desc_fr: "L'AOD-9604 est un fragment modifié synthétique de l'hormone de croissance (acides aminés 176-191), fourni exclusivement pour la recherche in-vitro en laboratoire sur la signalisation du métabolisme lipidique. Chaque flacon contient un peptide lyophilisé de pureté vérifiée avec documentation analytique spécifique au lot par Janoshik Analytical (République tchèque). Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
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
      { size: "5mg",  price: 99.99,  batch: "NVX-AOD5-0426",  stripeLink: "https://buy.stripe.com/00w6oH8O77x82vkacc2Ry0M" },
      { size: "10mg", price: 159.99, batch: "NVX-AOD10-0426", stripeLink: "https://buy.stripe.com/cNifZh6FZ4kWb1Q0BC2Ry0N" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
    ],
  },
  {
    id: "ghrp2",
    name: "GHRP-2",
    tag: "GH SECRETAGOGUE RESEARCH",
    category: "Growth & Recovery",
    tagColor: "#34d399",
    badge: "NEW",
    badgeColor: "#34d399",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(52,211,153,0.03)",
    shortDesc: "Growth hormone-releasing peptide for in-vitro research into GH secretagogue receptor signalling.",
    desc: "GHRP-2 is a synthetic growth hormone-releasing peptide supplied exclusively for in-vitro laboratory research into GH secretagogue receptor pathways. Each vial contains verified-purity lyophilized peptide with batch-specific analytical documentation by Janoshik Analytical (Czech Republic). Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    shortDesc_fr: "Peptide libérateur d'hormone de croissance pour la recherche in-vitro sur la signalisation du récepteur sécrétagogue GH.",
    desc_fr: "Le GHRP-2 est un peptide synthétique libérateur d'hormone de croissance fourni exclusivement pour la recherche in-vitro en laboratoire sur les voies du récepteur sécrétagogue GH. Chaque flacon contient un peptide lyophilisé de pureté vérifiée avec documentation analytique spécifique au lot par Janoshik Analytical (République tchèque). Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
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
      { size: "5mg",  price: 59.99, batch: "NVX-GHRP2-5-0426",  stripeLink: "https://buy.stripe.com/fZucN53tN9Fg2vk4RS2Ry0O" },
      { size: "10mg", price: 89.99, batch: "NVX-GHRP2-10-0426", stripeLink: "https://buy.stripe.com/28E14nc0j3gSc5Ubgg2Ry0P" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
    ],
  },
  {
    id: "ghrp6",
    name: "GHRP-6",
    tag: "GH SECRETAGOGUE RESEARCH",
    category: "Growth & Recovery",
    tagColor: "#34d399",
    badge: "NEW",
    badgeColor: "#34d399",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(52,211,153,0.03)",
    shortDesc: "Growth hormone-releasing peptide for in-vitro research into GH secretagogue receptor and appetite signalling.",
    desc: "GHRP-6 is a synthetic growth hormone-releasing peptide supplied exclusively for in-vitro laboratory research into GH secretagogue receptor pathways. Each vial contains verified-purity lyophilized peptide with batch-specific analytical documentation by Janoshik Analytical (Czech Republic). Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    shortDesc_fr: "Peptide libérateur d'hormone de croissance pour la recherche in-vitro sur le récepteur sécrétagogue GH et la signalisation de l'appétit.",
    desc_fr: "Le GHRP-6 est un peptide synthétique libérateur d'hormone de croissance fourni exclusivement pour la recherche in-vitro en laboratoire sur les voies du récepteur sécrétagogue GH. Chaque flacon contient un peptide lyophilisé de pureté vérifiée avec documentation analytique spécifique au lot par Janoshik Analytical (République tchèque). Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
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
      { size: "5mg",  price: 59.99, batch: "NVX-GHRP6-5-0426",  stripeLink: "https://buy.stripe.com/00w8wP1lF8Bcee23NO2Ry0Q" },
      { size: "10mg", price: 89.99, batch: "NVX-GHRP6-10-0426", stripeLink: "https://buy.stripe.com/fZu6oH9Sb2cO6LAacc2Ry0R" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
    desc: "5-Amino-1MQ is a synthetic small molecule NNMT inhibitor supplied exclusively for in-vitro laboratory research into cellular metabolism and adipocyte signalling. Each vial contains verified-purity lyophilized compound with batch-specific analytical documentation by Janoshik Analytical (Czech Republic). Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    shortDesc_fr: "Inhibiteur NNMT petite molécule pour la recherche in-vitro sur le métabolisme cellulaire et les voies des adipocytes.",
    desc_fr: "Le 5-Amino-1MQ est un inhibiteur NNMT synthétique petite molécule fourni exclusivement pour la recherche in-vitro en laboratoire sur le métabolisme cellulaire et la signalisation des adipocytes. Chaque flacon contient un composé lyophilisé de pureté vérifiée avec documentation analytique spécifique au lot par Janoshik Analytical (République tchèque). Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
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
      { size: "5mg", price: 129.99, batch: "NVX-5AMQ5-0426", stripeLink: "https://buy.stripe.com/aFa00j7K32cOgma0BC2Ry0S" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
    ],
  },
  {
    id: "hexarelin",
    name: "Hexarelin",
    tag: "GH SECRETAGOGUE RESEARCH",
    category: "Growth & Recovery",
    tagColor: "#34d399",
    badge: "NEW",
    badgeColor: "#34d399",
    gradient: "linear-gradient(180deg,#0c1526 0%,#0a121f 100%)",
    glow: "rgba(52,211,153,0.03)",
    shortDesc: "Potent growth hormone-releasing hexapeptide for in-vitro research into GH secretagogue receptor signalling.",
    desc: "Hexarelin is a synthetic growth hormone-releasing hexapeptide supplied exclusively for in-vitro laboratory research into GH secretagogue receptor pathways. Each vial contains verified-purity lyophilized peptide with batch-specific analytical documentation by Janoshik Analytical (Czech Republic). Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    shortDesc_fr: "Hexapeptide puissant libérateur d'hormone de croissance pour la recherche in-vitro sur la signalisation du récepteur sécrétagogue GH.",
    desc_fr: "L'Hexarelin est un hexapeptide synthétique libérateur d'hormone de croissance fourni exclusivement pour la recherche in-vitro en laboratoire sur les voies du récepteur sécrétagogue GH. Chaque flacon contient un peptide lyophilisé de pureté vérifiée avec documentation analytique spécifique au lot par Janoshik Analytical (République tchèque). Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
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
      { size: "2mg", price: 69.99, batch: "NVX-HEX2-0426",  stripeLink: "https://buy.stripe.com/4gMbJ13tN18K9XM4RS2Ry0T" },
      { size: "5mg", price: 99.99, batch: "NVX-HEX5-0426", stripeLink: "https://buy.stripe.com/28E00jggzbNo8TIbgg2Ry0U" },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% (test par lot à venir)" },
      { label: "Storage",    value: "−20°C / avoid light" },
      { label: "Shelf life", value: "24 months (sealed)" },
      { label: "COA",        value: "Janoshik (par lot)" },
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
      { size: "10mg+10mg", price: 189.99, batch: "NVX-F01-0426", stripeLink: "https://buy.stripe.com/aFa4gzfcv5p0b1Q3NO2Ry0V" },
    ],
    commonSpecs: [
      { label: "Composition", value: "BPC-157 10mg + TB-500 10mg" },
      { label: "Format",      value: "Lyophilised vial" },
      { label: "Purity",      value: "Janoshik HPLC (per batch)" },
      { label: "Storage",     value: "−20°C / avoid light" },
      { label: "Shelf life",  value: "24 months (sealed)" },
      { label: "COA",         value: "Janoshik (par lot)" },
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
      { size: "5mg+5mg", price: 149.99, batch: "NVX-F02-0426", stripeLink: "https://buy.stripe.com/dRm00jd4n4kW9XM7002Ry0W" },
    ],
    commonSpecs: [
      { label: "Composition", value: "CJC-1295 5mg + Ipamorelin 5mg" },
      { label: "Format",      value: "Lyophilised vial" },
      { label: "Purity",      value: "≥99% (test par lot à venir)" },
      { label: "Storage",     value: "−20°C / avoid light" },
      { label: "Shelf life",  value: "24 months (sealed)" },
      { label: "COA",         value: "Janoshik (par lot)" },
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
      { size: "70mg total", price: 329.99, batch: "NVX-F03-0426", stripeLink: "https://buy.stripe.com/28EaEXggz5p0ee2gAA2Ry0X" },
    ],
    commonSpecs: [
      { label: "Composition", value: "BPC-157 10mg + GHK-Cu 50mg + TB-500 10mg" },
      { label: "Format",      value: "Lyophilised vial" },
      { label: "Purity",      value: "≥99% (test par lot à venir)" },
      { label: "Storage",     value: "−20°C / avoid light" },
      { label: "Shelf life",  value: "24 months (sealed)" },
      { label: "COA",         value: "Janoshik (par lot)" },
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
    shortDesc_fr: "Eau bactériostatique de qualité pharmaceutique (alcool benzylique 0,9%) pour la reconstitution des peptides de recherche lyophilisés.",
    desc_fr: "L'Eau Bactériostatique Novalyx Research est une eau stérile de qualité pharmaceutique contenant 0,9% d'alcool benzylique comme agent bactériostatique. Fournie exclusivement pour usage en laboratoire dans la reconstitution des peptides de recherche lyophilisés. Chaque flacon est scellé, stérile et prêt à l'emploi immédiat en laboratoire.",
    details: [
      "0.9% benzyl alcohol bacteriostatic agent",
      "Pharmaceutical-grade sterile water for injection",
      "Multi-draw vial — compatible with all lyophilised peptides",
      "Sealed tamper-evident vial",
      "COA published once the batch is independently validated",
    ],
    details_fr: [
      "0.9% benzyl alcohol bacteriostatic agent",
      "Pharmaceutical-grade sterile water for injection",
      "Multi-draw vial — compatible with all lyophilised peptides",
      "Sealed tamper-evident vial",
      "COA publié dès la validation indépendante du lot",
    ],
    variants: [
      { size: "3ml vial",   price: 7.99,  batch: "NVX-BW3-0426",   stripeLink: "https://buy.stripe.com/fZu14n8O72cO4Ds4RS2Ry0Z" },
      { size: "10ml vial",  price: 12.99, batch: "NVX-BW10-0426",  stripeLink: "https://buy.stripe.com/cNieVd5BV2cOb1Q2JK2Ry10" },
      { size: "5 × 10ml",   price: 54.99, batch: "NVX-BW10X5-0426",stripeLink: "https://buy.stripe.com/aFa3cve8r04Ggma1FG2Ry11" },
    ],
    commonSpecs: [
      { label: "Composition", value: "Water for injection + 0.9% benzyl alcohol" },
      { label: "Format",      value: "Sterile sealed vial" },
      { label: "Grade",       value: "Pharmaceutical-grade" },
      { label: "Storage",     value: "Room temperature / avoid direct light" },
      { label: "Shelf life",  value: "24 months (sealed)" },
      { label: "COA",         value: "Janoshik (par lot)" },
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
      { size: "80mg total", price: 399.99, batch: "NVX-F04-0426", stripeLink: "https://buy.stripe.com/eVq3cv7K3aJk7PEckk2Ry0Y" },
    ],
    commonSpecs: [
      { label: "Composition", value: "BPC-157 10mg + GHK-Cu 50mg + TB-500 10mg + KPV 10mg" },
      { label: "Format",      value: "Lyophilised vial" },
      { label: "Purity",      value: "≥99% (test par lot à venir)" },
      { label: "Storage",     value: "−20°C / avoid light" },
      { label: "Shelf life",  value: "24 months (sealed)" },
      { label: "COA",         value: "Janoshik (par lot)" },
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
  if (!cart || cart.length === 0) return;

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

/* ─── GLOBAL CSS ─────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Bricolage+Grotesque:wght@600;700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html,body{overflow-x:hidden;max-width:100%;width:100%;}
  #root{overflow-x:hidden;max-width:100vw;}
  img,video,svg{max-width:100%;height:auto;}
  .hov{transition:transform .28s ease,box-shadow .28s ease;cursor:pointer;}
  .hov:hover{transform:translateY(-7px);box-shadow:0 24px 48px rgba(0,0,0,0.5)!important;}
  .btn{cursor:pointer;transition:all .18s ease;outline:none;font-family:'DM Sans',sans-serif;}
  .g{border:1px solid rgba(74,222,128,0.45);color:#4ade80;background:transparent;}
  .g:hover{background:#4ade80;color:#080f1e;}
  .announce-bar::-webkit-scrollbar{display:none;}
  .announce-bar{-ms-overflow-style:none;scrollbar-width:none;}
  @media (max-width:600px){
    [style*="repeat(auto-fill,minmax(280px"]{grid-template-columns:1fr!important;}
    [style*="repeat(auto-fill,minmax(300px"]{grid-template-columns:1fr!important;}
    .nav-bar{padding:12px 16px!important;}
    .nav-controls{order:2;}
    .nav-links{position:static!important;transform:none!important;width:100%;order:3;justify-content:center;gap:14px!important;font-size:12px;}
    .nl{font-size:12px!important;}
    .coa-showcase{grid-template-columns:1fr!important;padding:32px 20px!important;gap:28px!important;}
    .calc-grid{grid-template-columns:1fr!important;gap:20px!important;}
  }
  @media (max-width:850px){
    [style*="padding:\\"80px 40px"]{padding:48px 20px!important;}
    [style*="padding:\\"60px 40px"]{padding:40px 18px!important;}
    [style*="padding:\\"64px 40px"]{padding:40px 18px!important;}
    [style*="padding:\\"48px 48px"]{padding:32px 20px!important;}
    [style*="padding:\\"48px 40px"]{padding:32px 18px!important;}
    [style*="padding:\\"56px 48px"]{padding:36px 20px!important;}
  }
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
  <nav className="nav-bar" style={{padding:"15px 40px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,0.06)",position:"sticky",top:0,zIndex:100,background:"rgba(8,15,30,0.95)",backdropFilter:"blur(14px)",flexWrap:"wrap",gap:10}}>
    <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>go("home")}>
      <Logo/>
      <div>
        <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:17,fontWeight:800,letterSpacing:3.5}}>NOVALYX</div>
        <div style={{fontSize:7,letterSpacing:2.5,color:"#4ade80",marginTop:1}}>RESEARCH</div>
      </div>
    </div>
    <div className="nav-links" style={{display:"flex",gap:24,flexWrap:"wrap",position:"absolute",left:"50%",transform:"translateX(-50%)"}}>
      {[[t(lang,"nav_products"),"products"],[t(lang,"nav_coa"),"coa"],[t(lang,"nav_calc"),"calculator"],[t(lang,"nav_about"),"about"],[t(lang,"nav_faq"),"faq"],[t(lang,"nav_contact"),"contact"]].map(([l,p])=>(
        <span key={p} className={`nl${page===p?" active":""}`} onClick={()=>go(p)}>{l}</span>
      ))}
    </div>
    <div className="nav-controls" style={{display:"flex",alignItems:"center",gap:10,flexWrap:"nowrap"}}>
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
          <div>{CONFIG.ADDRESS}</div>
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
    <div style={{borderTop:"1px solid rgba(255,255,255,0.05)",paddingTop:22,paddingBottom:18,display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
      <div style={{fontSize:9,letterSpacing:2,color:"rgba(255,255,255,0.3)",display:"flex",alignItems:"center",gap:6}}>
        <span style={{color:"#4ade80"}}>🔒</span> {lang==="FR"?"PAIEMENT 100% SÉCURISÉ":"100% SECURE PAYMENT"}
      </div>
      <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap",justifyContent:"center"}}>
        {/* VISA */}
        <div style={{background:"#fff",borderRadius:5,padding:"6px 10px",display:"flex",alignItems:"center",height:30,boxSizing:"border-box"}}>
          <span style={{color:"#1a1f71",fontWeight:800,fontStyle:"italic",fontSize:14,letterSpacing:0.5,fontFamily:"Arial,sans-serif"}}>VISA</span>
        </div>
        {/* Mastercard */}
        <div style={{background:"#fff",borderRadius:5,padding:"6px 10px",display:"flex",alignItems:"center",gap:-4,height:30,boxSizing:"border-box"}}>
          <span style={{width:16,height:16,borderRadius:"50%",background:"#eb001b",display:"inline-block"}}></span>
          <span style={{width:16,height:16,borderRadius:"50%",background:"#f79e1b",display:"inline-block",marginLeft:-6,opacity:0.9}}></span>
        </div>
        {/* Amex */}
        <div style={{background:"#006fcf",borderRadius:5,padding:"6px 10px",display:"flex",alignItems:"center",height:30,boxSizing:"border-box"}}>
          <span style={{color:"#fff",fontWeight:800,fontSize:9,letterSpacing:0.3,fontFamily:"Arial,sans-serif"}}>AMEX</span>
        </div>
        {/* Apple Pay */}
        <div style={{background:"#000",border:"1px solid rgba(255,255,255,0.2)",borderRadius:5,padding:"6px 10px",display:"flex",alignItems:"center",height:30,boxSizing:"border-box"}}>
          <span style={{color:"#fff",fontWeight:600,fontSize:12,fontFamily:"Arial,sans-serif"}}> Pay</span>
        </div>
        {/* Google Pay */}
        <div style={{background:"#fff",borderRadius:5,padding:"6px 10px",display:"flex",alignItems:"center",height:30,boxSizing:"border-box"}}>
          <span style={{fontWeight:600,fontSize:12,fontFamily:"Arial,sans-serif"}}><span style={{color:"#4285f4"}}>G</span><span style={{color:"#ea4335"}}>o</span><span style={{color:"#fbbc04"}}>o</span><span style={{color:"#4285f4"}}>g</span><span style={{color:"#34a853"}}>l</span><span style={{color:"#ea4335"}}>e</span> <span style={{color:"#5f6368"}}>Pay</span></span>
        </div>
        {/* Stripe */}
        <div style={{background:"#635bff",borderRadius:5,padding:"6px 10px",display:"flex",alignItems:"center",height:30,boxSizing:"border-box"}}>
          <span style={{color:"#fff",fontWeight:700,fontSize:11,fontStyle:"italic",fontFamily:"Arial,sans-serif"}}>stripe</span>
        </div>
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
          <span style={{fontSize:9,letterSpacing:2,fontWeight:700,color:p.tagColor,border:`1px solid ${p.tagColor}44`,background:`${p.tagColor}11`,borderRadius:3,padding:"3px 10px"}}>{tp(lang,p.tag)}</span>
          {p.badge&&<span style={{fontSize:9,fontWeight:700,color:"#080f1e",background:p.badgeColor,borderRadius:3,padding:"3px 10px"}}>{tp(lang,p.badge)}</span>}
        </div>
        <div style={{width:"100%",height:150,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20,background:"rgba(0,0,0,0.18)",borderRadius:12,border:"1px solid rgba(255,255,255,0.06)"}}><ProductIcon color={p.tagColor} size={70}/></div>
      </div>
      <div style={{padding:"0 24px 24px",position:"relative"}}>
        <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:24,fontWeight:800,marginBottom:6}}>{p.name}</h3>
        <div style={{fontSize:10,color:p.tagColor,letterSpacing:1.5,marginBottom:10,fontWeight:600}}>{t(lang,"available_in")} {sizes}</div>
        <p style={{fontSize:12.5,color:"rgba(255,255,255,0.48)",lineHeight:1.68,marginBottom:14}}>{lang==="FR"&&p.shortDesc_fr?p.shortDesc_fr:p.shortDesc}</p>
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
          <span style={{fontSize:9,letterSpacing:2,color:p.tagColor,border:`1px solid ${p.tagColor}44`,background:`${p.tagColor}11`,borderRadius:3,padding:"3px 10px"}}>{tp(lang,p.tag)}</span>
          <span onClick={onClose} style={{cursor:"pointer",fontSize:20,color:"rgba(255,255,255,0.3)"}}>✕</span>
        </div>
        <div style={{display:"flex",justifyContent:"center",marginBottom:14}}><ProductIcon color={p.tagColor} size={72}/></div>
        <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:28,fontWeight:800,marginBottom:10}}>{p.name}</h2>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.5)",lineHeight:1.78,marginBottom:18}}>{lang==="FR"&&p.desc_fr?p.desc_fr:p.desc}</p>
        <div style={{marginBottom:22}}>
          {(lang==="FR"&&p.details_fr?p.details_fr:p.details).map(d=>(
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
              <span>{lang==="FR"?"Tâche : ":"Task: "}<strong style={{color:"rgba(255,255,255,0.8)",fontFamily:"monospace"}}>#{p.verification.task}</strong></span>
              <span>{lang==="FR"?"Clé : ":"Key: "}<strong style={{color:"rgba(255,255,255,0.8)",fontFamily:"monospace"}}>{p.verification.key}</strong></span>
            </div>
            <a href="https://janoshik.com/verification" target="_blank" rel="noopener noreferrer" style={{display:"inline-block",fontSize:11,color:"#4ade80",textDecoration:"none",borderBottom:"1px solid rgba(74,222,128,0.4)",paddingBottom:2,letterSpacing:0.5}}>
              {t(lang,"verify_link")}
            </a>
          </div>
        )}
        <div style={{background:"rgba(0,0,0,0.2)",borderRadius:10,padding:18,marginBottom:22}}>
          <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
            <span style={{fontSize:11,color:"rgba(255,255,255,0.38)"}}>{t(lang,"size_label")}</span>
            <span style={{fontSize:12,fontWeight:500}}>{variant.size} / {lang==="FR"?"flacon":"vial"}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
            <span style={{fontSize:11,color:"rgba(255,255,255,0.38)"}}>{t(lang,"batch_label")}</span>
            <span style={{fontSize:12,fontWeight:500}}>{variant.batch}</span>
          </div>
          {p.commonSpecs.map(s=>({label:tp(lang,s.label),value:tp(lang,s.value)})).map(s=>(
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
      <div className="su" style={{position:"absolute",right:0,top:0,bottom:0,width:380,maxWidth:"90vw",boxSizing:"border-box",background:"#0c1c35",borderLeft:"1px solid rgba(255,255,255,0.07)",padding:32,display:"flex",flexDirection:"column",overflowY:"auto"}}>
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

const TrustBar = ({ lang="EN" }) => {
  const items = lang === "FR"
    ? ["Vérifié par labo tiers","COA avec chaque commande","Expédition contrôlée","Sécurisé par Stripe","Emballage professionnel","Retours qualité recherche"]
    : ["Third-party lab verified","COA with every order","Controlled fulfillment","Stripe secured","Professional packaging","Research-grade returns"];
  return (
  <div style={{borderTop:"1px solid rgba(255,255,255,0.05)",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"rgba(255,255,255,0.012)",padding:"16px 20px",display:"flex",justifyContent:"center",alignItems:"center",gap:10,flexWrap:"wrap",textAlign:"center"}}>
    {items.map(txt=>(
      <span key={txt} style={{fontSize:10,color:"rgba(255,255,255,0.55)",padding:"6px 12px",border:"1px solid rgba(255,255,255,0.1)",borderRadius:4,letterSpacing:0.5,fontWeight:500,background:"rgba(255,255,255,0.02)",whiteSpace:"nowrap",display:"inline-flex",alignItems:"center"}}>{txt}</span>
    ))}
  </div>
  );
};

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
          <h1 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:"clamp(32px,8vw,58px)",fontWeight:800,lineHeight:1.06,marginBottom:20,wordBreak:"break-word"}}>
            {t(lang,"hero_h1_1")}<br/><span style={{color:"#4ade80"}}>{t(lang,"hero_h1_2")}</span>
          </h1>
          <p style={{fontSize:15,color:"rgba(255,255,255,0.48)",lineHeight:1.8,maxWidth:520,marginBottom:14}}>
            {t(lang,"hero_desc")}
          </p>
          <p style={{fontSize:12.5,color:"#4ade80",lineHeight:1.6,maxWidth:480,marginBottom:32,fontWeight:500}}>
            {t(lang,"hero_tagline")}
          </p>
          <div style={{display:"flex",gap:12,marginBottom:44,flexWrap:"wrap"}}>
            <button className="btn solid" onClick={()=>go("products")} style={{padding:"13px 28px",borderRadius:8,fontWeight:700,fontSize:12,letterSpacing:1}}>{t(lang,"hero_browse")}</button>
            <button className="btn g" onClick={()=>go("coa")} style={{padding:"13px 28px",borderRadius:8,fontWeight:700,fontSize:12,letterSpacing:1}}>{t(lang,"hero_coa")}</button>
            <button className="btn" onClick={()=>go("contact")} style={{padding:"13px 28px",borderRadius:8,fontWeight:700,fontSize:12,letterSpacing:1,border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.7)",background:"transparent"}}>{t(lang,"hero_contact")}</button>
          </div>
          <div style={{display:"flex",gap:36}}>
            {[["≥99%",t(lang,"hero_stat2")],["COA",lang==="FR"?"Chaque lot":"Every Batch"],["2–3w",lang==="FR"?"Livraison Int.":"Intl. Delivery"],["28+",t(lang,"hero_stat1")]].map(([v,l])=>(
              <div key={l}>
                <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:22,fontWeight:800,color:"#4ade80"}}>{v}</div>
                <div style={{fontSize:9.5,color:"rgba(255,255,255,0.32)",letterSpacing:1.5}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TrustBar lang={lang}/>

      {/* ─── POURQUOI CHOISIR NOVALYX ─── */}
      <div style={{padding:"64px 40px 24px",maxWidth:1200,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:44}}>
          <div style={{fontSize:9.5,letterSpacing:3,color:"#4ade80",marginBottom:10}}>{lang==="FR"?"POURQUOI NOVALYX":"WHY NOVALYX"}</div>
          <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:"clamp(26px,5.5vw,36px)",fontWeight:800,marginBottom:12}}>{lang==="FR"?"Pourquoi choisir Novalyx Research ?":"Why choose Novalyx Research?"}</h2>
          <p style={{fontSize:14,color:"rgba(255,255,255,0.45)",maxWidth:560,margin:"0 auto",lineHeight:1.7}}>{lang==="FR"?"La transparence et la qualité au cœur de chaque commande.":"Transparency and quality at the heart of every order."}</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:18}}>
          {(lang==="FR"?[
            ["🇫🇷","Société basée à Paris","Novalyx Research est une entreprise française, immatriculée et basée à Paris (SIRET 898 509 369 00028)."],
            ["🔒","Paiement sécurisé","Paiements traités par Stripe, leader mondial. Vos données bancaires ne touchent jamais nos serveurs."],
            ["🔬","Contrôle qualité indépendant","Chaque lot soumis à une analyse indépendante par Janoshik Analytical — laboratoire tiers reconnu."],
            ["💬","Support client réactif","Une équipe disponible et réactive, réponse sous 1 jour ouvré à contact@novalyxresearch.com."],
            ["📦","Expédition internationale suivie","Expédition internationale avec numéro de suivi et emballage professionnel inviolable."],
            ["📋","Transparence des analyses","Certificats d'analyse (COA) publiés au fur et à mesure de la validation indépendante des lots."],
          ]:[
            ["🇫🇷","Paris-Based Company","Novalyx Research is a French company, registered and based in Paris (SIRET 898 509 369 00028)."],
            ["🔒","Secure Payment","Payments handled by Stripe, a global leader. Your card data never touches our servers."],
            ["🔬","Independent Quality Control","Every batch submitted for independent analysis by Janoshik Analytical — a recognised third-party lab."],
            ["💬","Responsive Support","An available, responsive team — reply within 1 business day at contact@novalyxresearch.com."],
            ["📦","Tracked International Shipping","Worldwide shipping with tracking number and professional tamper-evident packaging."],
            ["📋","Transparent Analysis","Certificates of Analysis (COA) published as batches are independently validated."],
          ]).map(([icon,title,desc])=>(
            <div key={title} style={{background:"linear-gradient(145deg,#0f2240,#0c1830)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"26px 24px"}}>
              <div style={{fontSize:30,marginBottom:14}}>{icon}</div>
              <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:17,fontWeight:700,marginBottom:8}}>{title}</h3>
              <p style={{fontSize:13,color:"rgba(255,255,255,0.5)",lineHeight:1.7}}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:"64px 40px 80px"}}>
        <div style={{marginBottom:44}}>
          <div style={{fontSize:9.5,letterSpacing:3,color:"#4ade80",marginBottom:10}}>{tg(lang,"BROWSE BY RESEARCH CATEGORY")}</div>
          <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:38,fontWeight:800,marginBottom:14}}>{tg(lang,"Explore Our Compounds")}</h2>
          <p style={{fontSize:14,color:"rgba(255,255,255,0.45)",maxWidth:560,lineHeight:1.7}}>{lang==="FR"?`${PRODUCTS.length} composés de recherche + fournitures de labo organisés en 9 catégories spécialisées. Cliquez sur une catégorie pour explorer.`:`${PRODUCTS.length} research compounds + lab supplies organized across 9 specialized categories. Click any category to explore.`}</p>
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
                  {tp(lang,cat.key)}
                </h3>
                <p style={{fontSize:13,color:"rgba(255,255,255,0.55)",lineHeight:1.65,marginBottom:20}}>
                  {tp(lang,cat.desc)}
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
            {lang==="FR"?`VOIR TOUS LES ${PRODUCTS.length} COMPOSÉS →`:`VIEW ALL ${PRODUCTS.length} COMPOUNDS →`}
          </button>
        </div>
      </div>

      {/* VERIFIED BY EU LAB */}
      <div style={{padding:"0 40px 70px"}}>
        <div className="coa-showcase" style={{background:"#0a1322",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:"48px 40px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:48,alignItems:"center"}}>
          <div>
            <div style={{fontSize:9.5,letterSpacing:3,color:"#4ade80",marginBottom:12}}>{lang==="FR"?"VALIDATION PAR LABORATOIRE INDÉPENDANT":"INDEPENDENT LABORATORY VALIDATION"}</div>
            <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:30,fontWeight:800,marginBottom:16,lineHeight:1.15}}>{lang==="FR"?"Chaque lot. Analysé. Documenté.":"Every batch. Analysed. Documented."}</h2>
            <p style={{fontSize:13.5,color:"rgba(255,255,255,0.5)",lineHeight:1.8,marginBottom:24}}>
              {lang==="FR"?"Chaque nouveau lot Novalyx Research est soumis à une analyse indépendante par Janoshik Analytical : pureté HPLC, confirmation d'identité par spectrométrie de masse. Les certificats d'analyse (COA) sont publiés au fur et à mesure de la validation indépendante des lots.":"Each new Novalyx Research batch is submitted for independent analysis by Janoshik Analytical: HPLC purity, mass spectrometry identity confirmation. Certificates of Analysis (COA) are published as batches are independently validated."}
            </p>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:24}}>
              {["HPLC Purity","Mass Spectrometry","Janoshik Verified"].map(t=>(
                <span key={t} style={{fontSize:10,padding:"4px 10px",borderRadius:3,background:"rgba(74,222,128,0.05)",border:"1px solid rgba(74,222,128,0.18)",color:"#4ade80",letterSpacing:0.5}}>{t}</span>
              ))}
            </div>
          </div>
          {/* COA MOCKUP */}
          <div style={{background:"#ffffff",borderRadius:8,padding:24,color:"#0a1322",position:"relative",boxShadow:"0 24px 48px rgba(0,0,0,0.4)",display:"flex",flexDirection:"column",minHeight:340,width:"100%",boxSizing:"border-box"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,paddingBottom:12,borderBottom:"2px solid #0a1322"}}>
              <div>
                <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:14,fontWeight:800,letterSpacing:2}}>NOVALYX RESEARCH</div>
                <div style={{fontSize:8,letterSpacing:1,color:"#4ade80",marginTop:2}}>{tg(lang,"CERTIFICATE OF ANALYSIS")}</div>
                <div style={{fontSize:7,letterSpacing:1,color:"#9ca3af",marginTop:2,fontWeight:700}}>{lang==="FR"?"EXEMPLE ILLUSTRATIF":"ILLUSTRATIVE SAMPLE"}</div>
              </div>
              <div style={{width:50,height:50,borderRadius:"50%",border:"2px solid #4ade80",display:"flex",alignItems:"center",justifyContent:"center",transform:"rotate(-12deg)"}}>
                <div style={{fontSize:8,color:"#4ade80",fontWeight:800,textAlign:"center",letterSpacing:0.5,lineHeight:1.1}}>EU<br/>VERIFIED</div>
              </div>
            </div>
            <div style={{fontSize:10,lineHeight:1.9,color:"#0a1322"}}>
              <div style={{display:"flex",justifyContent:"space-between",gap:12,borderBottom:"1px solid #e5e7eb",padding:"4px 0"}}><span style={{color:"#6b7280"}}>{tg(lang,"Product:")}</span><span style={{fontWeight:600,textAlign:"right"}}>BPC-157 5mg</span></div>
              <div style={{display:"flex",justifyContent:"space-between",gap:12,borderBottom:"1px solid #e5e7eb",padding:"4px 0"}}><span style={{color:"#6b7280"}}>{tg(lang,"Batch:")}</span><span style={{fontWeight:600,textAlign:"right"}}>{lang==="FR"?"exemple":"sample"}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",gap:12,borderBottom:"1px solid #e5e7eb",padding:"4px 0"}}><span style={{color:"#6b7280"}}>{tg(lang,"Purity (HPLC):")}</span><span style={{fontWeight:600,color:"#059669",textAlign:"right"}}>≥ 99%</span></div>
              <div style={{display:"flex",justifyContent:"space-between",gap:12,padding:"4px 0"}}><span style={{color:"#6b7280"}}>{tg(lang,"MS identity:")}</span><span style={{fontWeight:600,color:"#059669",textAlign:"right"}}>{tg(lang,"Confirmed")}</span></div>
            </div>
            <div style={{marginTop:"auto",paddingTop:18,borderTop:"1px solid #e5e7eb",display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
              <div>
                <div style={{fontFamily:"'Brush Script MT',cursive",fontSize:18,color:"#0a1322",transform:"rotate(-4deg)",lineHeight:1}}>Dr. L. Moreau</div>
                <div style={{fontSize:7,color:"#6b7280",marginTop:3,letterSpacing:0.5}}>{tg(lang,"LEAD ANALYTICAL CHEMIST")}</div>
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
            <div style={{fontSize:9.5,letterSpacing:3,color:"#4ade80",marginBottom:12}}>{tg(lang,"PROFESSIONAL PACKAGING")}</div>
            <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:30,fontWeight:800,marginBottom:16,lineHeight:1.15}}>{tg(lang,"Shipped ready for the lab.")}</h2>
            <p style={{fontSize:13.5,color:"rgba(255,255,255,0.5)",lineHeight:1.8,marginBottom:20}}>
              {lang==="FR"?"Chaque composé Novalyx Research arrive dans un emballage inviolable, entièrement étiqueté pour la manipulation en laboratoire — nom du produit, code de lot, conditions de stockage et marquages réglementaires visibles en un coup d'œil.":"Each Novalyx Research compound arrives in tamper-evident packaging, fully labelled for laboratory handling — product name, batch code, storage conditions, and regulatory markings all visible at a glance."}
            </p>
            <ul style={{listStyle:"none",fontSize:12.5,color:"rgba(255,255,255,0.55)",lineHeight:2}}>
              <li>{lang==="FR"?"✓ Sceaux inviolables sur chaque flacon":"✓ Tamper-evident seals on every vial"}</li>
              <li>{lang==="FR"?"✓ Emballage professionnel inviolable":"✓ Professional tamper-evident packaging"}</li>
              <li>{lang==="FR"?"✓ Code de lot imprimé sur l'étiquette + emballage":"✓ Batch code printed on label + packaging"}</li>
              <li>{lang==="FR"?"✓ Étiquetage réglementaire complet (usage recherche uniquement)":"✓ Full regulatory labelling (research use only)"}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* WHY NOVALYX — cleaner version */}
      <div style={{padding:"0 40px 80px"}}>
        <div style={{background:"#0a1322",borderRadius:14,padding:"48px 40px",border:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{fontSize:9.5,letterSpacing:3,color:"#4ade80",marginBottom:10}}>{tg(lang,"WHY NOVALYX")}</div>
          <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:30,fontWeight:800,marginBottom:40,maxWidth:460}}>{tg(lang,"Built for researchers who demand more.")}</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:28}}>
            {[["Independent Testing","Every batch verified by accredited third-party labs."],["Full Transparency","COA available for every product, every batch."],["Controlled Fulfillment","Secure handling, batch traceability, professional packaging."],["Stripe Secured","All payments handled by Stripe. Your data is safe."]].map(([title,desc])=>(
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
            <div style={{fontSize:9.5,letterSpacing:3,color:"#4ade80",marginBottom:10}}>{tg(lang,"FOR LABS & BULK ORDERS")}</div>
            <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:28,fontWeight:800,marginBottom:12}}>B2B & Institutional Supply</h2>
            <p style={{fontSize:13.5,color:"rgba(255,255,255,0.48)",lineHeight:1.75}}>{tg(lang,"Contact us for bulk pricing, long-term supply agreements, and dedicated account support for research institutions.")}</p>
          </div>
          <button className="btn g" onClick={()=>go("contact")} style={{padding:"14px 28px",borderRadius:8,fontWeight:700,fontSize:12,letterSpacing:1}}>REQUEST BULK PRICING →</button>
        </div>
      </div>

      <div style={{padding:"0 40px 100px"}}>
        <div style={{background:"linear-gradient(135deg,#0a1628,#0d1e38)",border:"1px solid rgba(74,222,128,0.15)",borderRadius:20,padding:"56px 48px",textAlign:"center",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,opacity:0.02,backgroundImage:"linear-gradient(#4ade80 1px,transparent 1px),linear-gradient(90deg,#4ade80 1px,transparent 1px)",backgroundSize:"40px 40px"}}/>
          <div style={{position:"relative"}}>
            <div style={{fontSize:9.5,letterSpacing:3,color:"#4ade80",marginBottom:12}}>{tg(lang,"STAY INFORMED")}</div>
            <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:34,fontWeight:800,marginBottom:14}}>{tg(lang,"First Access. New Compounds. COA Alerts.")}</h2>
            <p style={{fontSize:14,color:"rgba(255,255,255,0.42)",marginBottom:32,maxWidth:420,margin:"0 auto 32px"}}>{tg(lang,"Join the Novalyx research list for early product access and batch notifications.")}</p>
            {subOk
              ? <div style={{color:"#4ade80",fontWeight:600,fontSize:15}}>✓ You're on the list.</div>
              : <div style={{display:"flex",gap:10,maxWidth:420,margin:"0 auto",justifyContent:"center",flexWrap:"wrap"}}>
                  <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com"
                    style={{flex:1,minWidth:210,padding:"12px 16px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,color:"white",fontSize:13}}/>
                  <button className="btn solid" onClick={()=>{if(email.includes("@"))setSubOk(true);}} style={{padding:"12px 24px",borderRadius:8,fontWeight:700,fontSize:12,letterSpacing:1}}>{tg(lang,"SUBSCRIBE")}</button>
                </div>
            }
            <div style={{fontSize:10,color:"rgba(255,255,255,0.2)",marginTop:14}}>{tg(lang,"No spam. Research professionals only.")}</div>
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
        <h1 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:"clamp(28px,6vw,44px)",fontWeight:800,marginBottom:12}}>{t(lang,"prod_h1")}</h1>
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
              <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:22,fontWeight:700,letterSpacing:-0.3}}>{tp(lang,g.category)}</h2>
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

const CalculatorPage = ({ lang="EN" }) => {
  const [peptideMg, setPeptideMg] = useState(10);
  const [waterMl, setWaterMl] = useState(2);
  const [doseMcg, setDoseMcg] = useState(250);
  const [syringeType, setSyringeType] = useState(100); // 100 = U-100 (1ml=100u)

  const FR = lang === "FR";

  // Concentration in mcg per ml
  const totalMcg = peptideMg * 1000;
  const concMcgPerMl = waterMl > 0 ? totalMcg / waterMl : 0;
  // Volume to draw for the target dose (ml)
  const drawMl = concMcgPerMl > 0 ? doseMcg / concMcgPerMl : 0;
  // Units on insulin syringe
  const units = drawMl * syringeType;
  // Number of doses in the vial
  const totalDoses = doseMcg > 0 ? totalMcg / doseMcg : 0;

  const L = (fr, en) => FR ? fr : en;
  const inp = {width:"100%",padding:"12px 14px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,color:"white",fontSize:15,boxSizing:"border-box",outline:"none"};
  const lbl = {fontSize:10,letterSpacing:1,color:"rgba(255,255,255,0.45)",marginBottom:7,display:"block",textTransform:"uppercase"};

  return (
    <div style={{padding:"60px 40px 100px",maxWidth:1000,margin:"0 auto"}}>
      <div style={{marginBottom:40}}>
        <div style={{fontSize:9.5,letterSpacing:3,color:"#4ade80",marginBottom:10}}>{L("OUTIL LABORATOIRE","LABORATORY TOOL")}</div>
        <h1 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:"clamp(28px,6vw,44px)",fontWeight:800,marginBottom:12}}>{L("Calculateur de reconstitution","Reconstitution Calculator")}</h1>
        <p style={{fontSize:14,color:"rgba(255,255,255,0.45)",maxWidth:600,lineHeight:1.7}}>{L("Outil de calcul pour cadrer les volumes et concentrations en contexte laboratoire. Usage recherche uniquement.","Calculation tool to determine volumes and concentrations in a laboratory context. Research use only.")}</p>
      </div>

      <div className="calc-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:32,alignItems:"start"}}>
        {/* INPUTS */}
        <div style={{background:"linear-gradient(145deg,#0f2240,#0c1830)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:"28px 26px"}}>
          <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:16,fontWeight:700,marginBottom:22}}>{L("Paramètres","Parameters")}</h3>

          <div style={{marginBottom:18}}>
            <label style={lbl}>{L("Quantité de peptide dans le flacon (mg)","Peptide amount in vial (mg)")}</label>
            <input style={inp} type="number" min="0" step="0.5" value={peptideMg} onChange={e=>setPeptideMg(parseFloat(e.target.value)||0)}/>
          </div>

          <div style={{marginBottom:18}}>
            <label style={lbl}>{L("Eau bactériostatique ajoutée (ml)","Bacteriostatic water added (ml)")}</label>
            <input style={inp} type="number" min="0" step="0.1" value={waterMl} onChange={e=>setWaterMl(parseFloat(e.target.value)||0)}/>
          </div>

          <div style={{marginBottom:18}}>
            <label style={lbl}>{L("Dose cible souhaitée (mcg)","Target dose (mcg)")}</label>
            <input style={inp} type="number" min="0" step="10" value={doseMcg} onChange={e=>setDoseMcg(parseFloat(e.target.value)||0)}/>
          </div>

          <div>
            <label style={lbl}>{L("Type de seringue","Syringe type")}</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {[[100,"U-100 (1ml)"],[50,"U-50 (0.5ml)"],[30,"U-30 (0.3ml)"]].map(([v,label])=>(
                <button key={v} onClick={()=>setSyringeType(v)} style={{flex:"1 1 auto",padding:"10px 8px",borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer",border:syringeType===v?"1px solid #4ade80":"1px solid rgba(255,255,255,0.12)",background:syringeType===v?"rgba(74,222,128,0.12)":"transparent",color:syringeType===v?"#4ade80":"rgba(255,255,255,0.6)"}}>{label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* RESULTS */}
        <div style={{background:"#0a1322",border:"1px solid rgba(74,222,128,0.18)",borderRadius:16,padding:"28px 26px"}}>
          <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:16,fontWeight:700,marginBottom:22}}>{L("Résultats","Results")}</h3>

          <div style={{marginBottom:18,paddingBottom:18,borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
            <div style={{fontSize:10,letterSpacing:1,color:"rgba(255,255,255,0.4)",marginBottom:6,textTransform:"uppercase"}}>{L("Concentration","Concentration")}</div>
            <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:26,fontWeight:800,color:"#4ade80"}}>{concMcgPerMl>0?Math.round(concMcgPerMl).toLocaleString():"—"} <span style={{fontSize:13,color:"rgba(255,255,255,0.4)"}}>mcg/ml</span></div>
          </div>

          <div style={{marginBottom:18,paddingBottom:18,borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
            <div style={{fontSize:10,letterSpacing:1,color:"rgba(255,255,255,0.4)",marginBottom:6,textTransform:"uppercase"}}>{L("Volume à prélever","Volume to draw")}</div>
            <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:26,fontWeight:800,color:"white"}}>{drawMl>0?drawMl.toFixed(3):"—"} <span style={{fontSize:13,color:"rgba(255,255,255,0.4)"}}>ml</span></div>
          </div>

          <div style={{marginBottom:18,paddingBottom:18,borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
            <div style={{fontSize:10,letterSpacing:1,color:"rgba(255,255,255,0.4)",marginBottom:6,textTransform:"uppercase"}}>{L("Sur la seringue","On the syringe")}</div>
            <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:26,fontWeight:800,color:"#4ade80"}}>{units>0?Math.round(units):"—"} <span style={{fontSize:13,color:"rgba(255,255,255,0.4)"}}>{L("unités","units")}</span></div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:4}}>{L(`Tirez jusqu'au trait ${units>0?Math.round(units):"—"} (seringue U-${syringeType})`,`Draw to the ${units>0?Math.round(units):"—"} mark (U-${syringeType} syringe)`)}</div>
          </div>

          <div>
            <div style={{fontSize:10,letterSpacing:1,color:"rgba(255,255,255,0.4)",marginBottom:6,textTransform:"uppercase"}}>{L("Nombre de doses par flacon","Doses per vial")}</div>
            <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:26,fontWeight:800,color:"white"}}>{totalDoses>0?Math.floor(totalDoses):"—"} <span style={{fontSize:13,color:"rgba(255,255,255,0.4)"}}>{L("doses","doses")}</span></div>
          </div>
        </div>
      </div>

      <div style={{marginTop:28,background:"rgba(251,191,36,0.06)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:12,padding:"18px 22px",fontSize:12,color:"rgba(255,255,255,0.5)",lineHeight:1.7}}>
        ⚠️ {L("Cet outil est fourni à titre indicatif pour le cadrage de calculs en laboratoire de recherche uniquement. Les produits ne sont pas destinés à une utilisation humaine ou animale.","This tool is provided for reference, to assist with calculations in a research laboratory context only. Products are not intended for human or animal use.")}
      </div>
    </div>
  );
};

const COAPage = ({ lang="EN" }) => (
  <div style={{padding:"60px 40px 100px"}}>
    <div style={{marginBottom:48}}>
      <div style={{fontSize:9.5,letterSpacing:3,color:"#4ade80",marginBottom:10}}>{tg(lang,"TRANSPARENCY")}</div>
      <h1 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:"clamp(28px,6vw,44px)",fontWeight:800,marginBottom:12}}>{tg(lang,"COA Library")}</h1>
      <p style={{fontSize:14,color:"rgba(255,255,255,0.42)",maxWidth:540}}>{lang==="FR"?"Chaque lot est testé indépendamment par Janoshik Analytical. Le certificat d'analyse de chaque lot est publié ici avec son numéro de vérification unique, consultable sur le portail Janoshik.":"Every batch is independently tested by Janoshik Analytical. Each batch's Certificate of Analysis is published here with its unique verification number, checkable on the Janoshik portal."}</p>
    </div>
    {PRODUCTS.map(p=>(
      <div key={p.id} style={{background:"linear-gradient(135deg,#0f2240,#0c1a2e)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"24px 28px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:18}}>
        <div style={{display:"flex",alignItems:"center",gap:18}}>
          <ProductIcon color={p.tagColor} size={40}/>
          <div>
            <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:18,fontWeight:700,marginBottom:4}}>{p.name}</h3>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>{lang==="FR"?"COA Janoshik publié par lot — vérification incluse":"Janoshik COA published per batch — verification included"}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          {[[lang==="FR"?"Pureté":"Purity","HPLC"],[lang==="FR"?"Identité":"Identity","MS"],[lang==="FR"?"Labo":"Lab","Janoshik"]].map(([l,v])=>(
            <div key={l} style={{textAlign:"center",background:"rgba(74,222,128,0.06)",border:"1px solid rgba(74,222,128,0.15)",borderRadius:8,padding:"7px 12px"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#4ade80"}}>{v}</div>
              <div style={{fontSize:8.5,color:"rgba(255,255,255,0.35)",marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center",background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.25)",borderRadius:8,padding:"9px 18px",fontSize:11,fontWeight:700,letterSpacing:0.3,color:"#fbbf24"}}>{lang==="FR"?"⏱ Disponible avec votre lot":"⏱ Available with your batch"}</div>
      </div>
    ))}
    <div style={{marginTop:32,background:"rgba(74,222,128,0.05)",border:"1px solid rgba(74,222,128,0.18)",borderRadius:12,padding:"22px 28px",fontSize:13,color:"rgba(255,255,255,0.6)",lineHeight:1.8}}>
      <strong style={{color:"#4ade80"}}>{lang==="FR"?"Comment ça marche :":"How it works:"}</strong> {lang==="FR"?"Chaque lot est testé individuellement par Janoshik avant expédition. Le COA correspondant à VOTRE lot, avec son numéro de vérification unique, vous est fourni avec votre commande et publié sur cette page. Vous pouvez vérifier l'authenticité directement sur le portail Janoshik.":"Each batch is tested individually by Janoshik before dispatch. The COA matching YOUR batch, with its unique verification number, is provided with your order and published on this page. You can verify authenticity directly on the Janoshik portal."}
    </div>
    <div style={{marginTop:16,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"22px 28px",fontSize:12,color:"rgba(255,255,255,0.35)",lineHeight:1.8}}>
      <strong style={{color:"rgba(255,255,255,0.5)"}}>{lang==="FR"?"À propos de nos tests :":"About our testing:"}</strong> {lang==="FR"?"Tous les produits sont testés indépendamment par Janoshik Analytical (République tchèque), un laboratoire tiers reconnu de test de peptides. Les tests incluent la pureté HPLC et l'évaluation de l'identité. Les COA sont spécifiques au lot et renouvelés à chaque production.":"All products are independently tested by Janoshik Analytical (Czech Republic), a respected third-party peptide testing laboratory. Tests include HPLC purity and identity assessment. COAs are batch-specific and renewed with every production run."}
    </div>
  </div>
);

const AboutPage = ({ go, lang="EN" }) => (
  <div style={{padding:"60px 40px 100px"}}>
    <div style={{maxWidth:720,margin:"0 auto"}}>
      <div style={{fontSize:9.5,letterSpacing:3,color:"#4ade80",marginBottom:12}}>{tg(lang,"OUR STORY")}</div>
      <h1 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:"clamp(28px,6vw,44px)",fontWeight:800,marginBottom:28,lineHeight:1.1}}>{tg(lang,"Research-First.")}<br/>{tg(lang,"Transparency Always.")}</h1>
      <p style={{fontSize:15,color:"rgba(255,255,255,0.55)",lineHeight:1.85,marginBottom:24}}>{lang==="FR"?"Novalyx a été fondé avec une mission : donner aux professionnels de la recherche accès aux peptides de plus haute pureté disponibles, avec une transparence totale à chaque étape. Aucun compromis sur la qualité. Aucune ambiguïté sur la documentation.":"Novalyx was founded with one mission: to give research professionals access to the highest-purity peptides available, with complete transparency at every step. No compromises on quality. No ambiguity on documentation."}</p>
      <p style={{fontSize:15,color:"rgba(255,255,255,0.55)",lineHeight:1.85,marginBottom:24}}>{lang==="FR"?"Chaque produit que nous fournissons passe par des tests indépendants rigoureux avant d'atteindre nos clients. Nous publions chaque COA. Nous documentons chaque lot. La transparence n'est pas seulement une bonne pratique — c'est la seule norme acceptable.":"Every product we supply goes through rigorous independent testing before it reaches our customers. We publish every COA. We document every batch. Transparency isn't just good practice — it's the only acceptable standard."}</p>
      <p style={{fontSize:15,color:"rgba(255,255,255,0.55)",lineHeight:1.85,marginBottom:48}}>{lang==="FR"?"Notre catalogue de lancement couvre la recherche régénérative, métabolique, de longévité, immunitaire, nootropique et sur le sommeil — avec des mélanges signature dédiés pour des protocoles intégrés. La qualité avant la quantité, toujours.":"Our launch catalog spans regenerative, metabolic, longevity, immune, nootropic, and sleep research — with dedicated signature blends for integrated protocols. Quality over quantity, always."}</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:20,marginBottom:48}}>
        {[["🔬","Lab-First","Every decision starts with science, not marketing."],["📋","Open Docs","Full COA library, published for every batch."],["🤝","Researcher-Led","Built by and for serious research professionals."],["🌍","Worldwide Delivery","Professional fulfillment with international shipping and tracking."]].map(([icon,title,desc])=>(
          <div key={title} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"20px 18px"}}>
            <div style={{fontSize:24,marginBottom:10}}>{icon}</div>
            <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:14,fontWeight:700,marginBottom:7}}>{title}</div>
            <div style={{fontSize:11.5,color:"rgba(255,255,255,0.4)",lineHeight:1.7}}>{desc}</div>
          </div>
        ))}
      </div>
      <button className="btn solid" onClick={()=>go("products")} style={{padding:"13px 28px",borderRadius:8,fontWeight:700,fontSize:12,letterSpacing:1}}>{tg(lang,"VIEW OUR PRODUCTS")}</button>
    </div>
  </div>
);

const FAQPage = ({ lang="EN" }) => {
  const [open,setOpen] = useState(null);
  const faqs = lang === "FR" ? [
    ["Que sont les peptides de recherche ?","Les peptides de recherche sont des substances fournies exclusivement pour la recherche scientifique et en laboratoire. Ils ne sont pas destinés à un usage humain ou vétérinaire, à la consommation ou à des fins thérapeutiques."],
    ["Qui peut acheter chez Novalyx ?","Les produits Novalyx sont disponibles pour les chercheurs qualifiés et les professionnels de laboratoire opérant en conformité avec les lois et réglementations locales applicables."],
    ["Qu'est-ce qu'un Certificat d'Analyse (COA) ?","Un COA est un document de laboratoire tiers confirmant l'identité, la pureté et le profil de sécurité d'un peptide. Novalyx inclut un COA spécifique au lot avec chaque commande."],
    ["Comment les produits sont-ils expédiés ?","Les commandes sont traitées dans des conditions d'expédition contrôlées et approvisionnées par commande auprès de nos partenaires de laboratoire vérifiés. La livraison en Europe prend généralement 2 à 3 semaines selon la destination et la disponibilité du lot."],
    ["Comment payer ?","Nous utilisons Stripe — l'un des processeurs de paiement les plus fiables au monde. Nous acceptons toutes les principales cartes de crédit et de débit. Vos données de paiement ne touchent jamais nos serveurs."],
    ["Quelle est votre politique de retour ?","Si un produit ne correspond pas aux spécifications de son COA, contactez-nous dans les 7 jours. Nous enquêterons et organiserons un remplacement ou un remboursement le cas échéant."],
    ["Vos produits sont-ils légaux dans mon pays ?","Le statut réglementaire varie selon la juridiction. Il est de votre responsabilité de vérifier la conformité avec les lois de votre pays avant d'acheter."],
    ["Comment stocker ces peptides ?","Tous les peptides lyophilisés doivent être stockés à −20°C, à l'abri de la lumière. Des instructions spécifiques de stockage et de reconstitution accompagnent chaque commande."],
    ["Expédiez-vous hors UE ?","Nous nous concentrons actuellement sur l'expédition UE. Contactez-nous à contact@novalyxresearch.com pour les demandes concernant d'autres régions."],
  ] : [
    ["What are research peptides?","Research peptides are substances supplied exclusively for scientific and laboratory research. They are not intended for human or veterinary use, consumption, or therapeutic purposes."],
    ["Who can purchase from Novalyx?","Novalyx products are available to qualified researchers and laboratory professionals operating in compliance with applicable local laws and regulations."],
    ["What is a Certificate of Analysis (COA)?","A COA is a third-party laboratory document confirming the identity, purity, and safety profile of a peptide. Novalyx includes a batch-specific COA with every order."],
    ["How are products shipped?","Orders are processed under controlled fulfillment conditions and sourced per-order from our verified laboratory partners. Delivery across Europe typically takes 2–3 weeks depending on destination and batch availability."],
    ["How do I pay?","We use Stripe — one of the world's most trusted payment processors. We accept all major credit and debit cards. Your payment data never touches our servers."],
    ["What is your returns policy?","If a product does not match its COA specifications, contact us within 7 days. We will investigate and arrange a replacement or refund where appropriate."],
    ["Are your products legal in my country?","Regulatory status varies by jurisdiction. It is your responsibility to verify compliance with the laws of your country before purchasing."],
    ["How do I store these peptides?","All lyophilized peptides should be stored at −20°C, away from light. Specific storage and reconstitution instructions accompany every order."],
    ["Do you ship outside the EU?","We currently focus on EU dispatch. Contact us at contact@novalyxresearch.com for enquiries about other regions."],
  ];
  return (
    <div style={{padding:"60px 40px 100px"}}>
      <div style={{maxWidth:720,margin:"0 auto"}}>
        <div style={{fontSize:9.5,letterSpacing:3,color:"#4ade80",marginBottom:10}}>{tg(lang,"SUPPORT")}</div>
        <h1 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:"clamp(28px,6vw,44px)",fontWeight:800,marginBottom:12}}>FAQ</h1>
        <p style={{fontSize:14,color:"rgba(255,255,255,0.42)",marginBottom:44}}>{tg(lang,"Common questions about products, ordering, and compliance.")}</p>
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

const ContactPage = ({ lang="EN" }) => {
  const [form,setForm] = useState({name:"",email:"",subject:"",message:""});
  const [sent,setSent] = useState(false);
  const inp = {width:"100%",padding:"12px 16px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"white",fontSize:13};
  return (
    <div style={{padding:"60px 40px 100px"}}>
      <div style={{maxWidth:680,margin:"0 auto"}}>
        <div style={{fontSize:9.5,letterSpacing:3,color:"#4ade80",marginBottom:10}}>{tg(lang,"GET IN TOUCH")}</div>
        <h1 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:"clamp(28px,6vw,44px)",fontWeight:800,marginBottom:12}}>{tg(lang,"Contact Us")}</h1>
        <p style={{fontSize:14,color:"rgba(255,255,255,0.42)",marginBottom:44}}>{tg(lang,"Questions about products, orders, or compliance? We respond within 1 business day.")}</p>
        {sent
          ? <div style={{background:"rgba(74,222,128,0.08)",border:"1px solid rgba(74,222,128,0.25)",borderRadius:12,padding:32,textAlign:"center"}}>
              <div style={{fontSize:36,marginBottom:14}}>✅</div>
              <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:20,fontWeight:700,marginBottom:8}}>{tg(lang,"Message received")}</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.45)"}}>We'll be back within 1 business day.</div>
            </div>
          : <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.38)",letterSpacing:1,marginBottom:7}}>{tg(lang,"FULL NAME")}</div>
                  <input style={inp} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder={lang==="FR"?"Dr. Jean Dupont":"Dr. Jane Smith"}/>
                </div>
                <div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.38)",letterSpacing:1,marginBottom:7}}>{tg(lang,"EMAIL")}</div>
                  <input style={inp} value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="jane@lab.eu"/>
                </div>
              </div>
              <div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.38)",letterSpacing:1,marginBottom:7}}>{tg(lang,"SUBJECT")}</div>
                <input style={inp} value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} placeholder={lang==="FR"?"Demande produit / Commande / Autre":"Product enquiry / Order / Other"}/>
              </div>
              <div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.38)",letterSpacing:1,marginBottom:7}}>{tg(lang,"MESSAGE")}</div>
                <textarea style={{...inp,height:140,resize:"vertical"}} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder={lang==="FR"?"Votre message...":"Your message..."}/>
              </div>
              <button className="btn solid" onClick={()=>{if(form.name&&form.email&&form.message)setSent(true);}} style={{padding:"13px 28px",borderRadius:8,fontWeight:700,fontSize:12,letterSpacing:1,alignSelf:"flex-start"}}>{tg(lang,"SEND MESSAGE")}</button>
              <div style={{fontSize:10.5,color:"rgba(255,255,255,0.22)",lineHeight:1.7}}>{tg(lang,"By submitting you agree to our Privacy Policy. We do not share your data with third parties.")}</div>
            </div>
        }
        <div style={{marginTop:48,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:16}}>
          {[["📧",lang==="FR"?"EMAIL":"EMAIL",CONFIG.EMAIL],["⏱",lang==="FR"?"RÉPONSE":"RESPONSE",lang==="FR"?"Sous 1 jour ouvré":"Within 1 business day"],["📍",lang==="FR"?"ADRESSE":"ADDRESS",CONFIG.ADDRESS]].map(([icon,label,val])=>(
            <div key={label} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"18px 18px",wordBreak:"break-word"}}>
              <div style={{fontSize:22,marginBottom:8}}>{icon}</div>
              <div style={{fontSize:9.5,color:"rgba(255,255,255,0.3)",letterSpacing:1,marginBottom:4}}>{label}</div>
              <div style={{fontSize:13,fontWeight:500,wordBreak:"break-word"}}>{val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Legal = ({ title, children, lang="EN" }) => (
  <div style={{padding:"60px 40px 100px"}}>
    <div style={{maxWidth:720,margin:"0 auto"}}>
      <div style={{fontSize:9.5,letterSpacing:3,color:"#4ade80",marginBottom:10}}>{tg(lang,"LEGAL")}</div>
      <h1 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:"clamp(26px,5.5vw,40px)",fontWeight:800,marginBottom:32}}>{title}</h1>
      <div style={{fontSize:13.5,color:"rgba(255,255,255,0.5)",lineHeight:1.9}}>{children}</div>
    </div>
  </div>
);
const S = ({t,children}) => <div style={{marginBottom:28}}><h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:17,fontWeight:700,color:"white",marginBottom:9}}>{t}</h3>{children}</div>;

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
    <S t={FR ? "4. Commandes & Paiement" : "4. Orders & Payment"}><p>{FR ? "Les prix sont affichés en EUR et n'incluent pas la TVA (TVA non applicable, art. 293B du CGI — régime micro-entrepreneur français). Le paiement est traité de manière sécurisée par Stripe. Nous nous réservons le droit d'annuler des commandes, avec remboursement intégral." : "Prices are shown in EUR and do not include VAT (TVA non applicable, art. 293B du CGI — French micro-entrepreneur regime). Payment is processed securely by Stripe. We reserve the right to cancel orders, with a full refund issued."}</p></S>
    <S t={FR ? "5. Livraison & Commandes Internationales" : "5. Shipping & International Orders"}><p>{FR ? "Les commandes sont traitées dans des conditions d'expédition contrôlées avec approvisionnement par lot et par commande auprès de nos partenaires de laboratoire vérifiés. La livraison en Europe prend généralement 2 à 3 semaines ; les destinations internationales 3 à 5 semaines. Les délais de livraison sont des estimations, pas des garanties. Le risque est transféré à l'acheteur dès l'expédition." : "Orders are processed under controlled fulfillment conditions with per-order batch sourcing from our verified laboratory partners. Delivery across Europe typically takes 2–3 weeks; international destinations 3–5 weeks. Delivery timescales are estimates, not guarantees. Risk passes to buyer upon dispatch."}</p><p>{FR ? "Pour les commandes internationales (hors Union Européenne), l'acheteur est seul responsable de vérifier que les produits peuvent être légalement importés dans sa juridiction, de payer les droits de douane, taxes ou frais de dédouanement applicables, et de respecter toutes les lois locales régissant les composés de recherche. Novalyx Research n'agit pas en tant qu'importateur officiel. Les colis saisis, détruits, refusés ou retournés par les autorités douanières dans toute juridiction hors UE ne sont pas remboursables. En passant une commande internationale, l'acheteur reconnaît et accepte expressément ces risques." : "For international orders (outside the European Union), the buyer is solely responsible for verifying that the products may be legally imported into their jurisdiction, for paying any applicable customs duties, taxes, or clearance fees, and for complying with all local laws governing research compounds. Novalyx Research does not act as an importer of record. Packages seized, destroyed, refused, or returned by customs authorities in any non-EU jurisdiction are non-refundable. By placing an international order, the buyer expressly acknowledges and accepts these risks."}</p></S>
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

const ShippingPage = ({ lang="EN" }) => (
  <div style={{padding:"60px 40px 100px"}}>
    <div style={{maxWidth:720,margin:"0 auto"}}>
      <div style={{fontSize:9.5,letterSpacing:3,color:"#4ade80",marginBottom:10}}>{tg(lang,"SHIPPING & FULFILLMENT")}</div>
      <h1 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:"clamp(26px,5.5vw,40px)",fontWeight:800,marginBottom:32}}>{tg(lang,"Shipping & Fulfillment")}</h1>
      <div style={{fontSize:13.5,color:"rgba(255,255,255,0.5)",lineHeight:1.9}}>
        <p style={{marginBottom:18}}>{tg(lang,"All orders are processed under a controlled fulfillment system to ensure product integrity and batch consistency.")}</p>
        <p style={{marginBottom:18}}>{lang==="FR"?<>Chaque commande est préparée après confirmation et expédiée dans notre délai de traitement standard. La livraison prend généralement <strong style={{color:"white"}}>2 à 3 semaines</strong>, car nos composés sont approvisionnés par commande auprès de nos partenaires de laboratoire vérifiés pour garantir la fraîcheur et la traçabilité des lots.</>:<>Each order is prepared following confirmation and dispatched within our standard processing timeframe. Delivery typically takes <strong style={{color:"white"}}>2–3 weeks</strong>, as our compounds are sourced per-order from our verified laboratory partners to ensure batch freshness and traceability.</>}</p>
        <p style={{marginBottom:32}}>{tg(lang,"You will receive a tracking confirmation once your order is processed and in transit.")}</p>

        <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:22,fontWeight:800,color:"white",marginBottom:20,marginTop:32}}>{tg(lang,"Delivery Zones & Rates")}</h2>

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
              <div style={{flex:"1 1 45%",color:"white",fontWeight:500}}>{lang==="FR"?zone.replace("European Union","Union Européenne").replace("Switzerland","Suisse").replace("New Zealand","Nouvelle-Zélande").replace("Rest of world","Reste du monde"):zone}</div>
              <div style={{flex:"0 0 80px",textAlign:"right",color:"#4ade80",fontWeight:700}}>{rate}</div>
              <div style={{flex:"0 0 100px",textAlign:"right",color:"rgba(255,255,255,0.45)",fontSize:12}}>{lang==="FR"?time.replace("weeks","semaines").replace("Variable","Variable"):time}</div>
            </div>
          ))}
          <div style={{padding:"12px 20px",background:"rgba(74,222,128,0.05)",fontSize:12,color:"rgba(255,255,255,0.55)"}}>
            {lang==="FR"?"✓ Livraison gratuite pour les commandes UE de plus de €100":"✓ Free shipping on EU orders over €100"}
          </div>
        </div>

        <div style={{background:"rgba(251,191,36,0.05)",border:"1px solid rgba(251,191,36,0.22)",borderRadius:10,padding:"22px 26px",marginBottom:32}}>
          <div style={{fontSize:9.5,letterSpacing:2,color:"#fbbf24",fontWeight:700,marginBottom:12}}>{lang==="FR"?"⚠ EXPÉDITION INTERNATIONALE — RESPONSABILITÉ DE L'ACHETEUR":"⚠ INTERNATIONAL SHIPPING — BUYER RESPONSIBILITY"}</div>
          <p style={{marginBottom:12,fontSize:13,color:"rgba(255,255,255,0.65)",lineHeight:1.75}}>
            {lang==="FR"?<>Les commandes expédiées hors de l'Union Européenne sont envoyées aux <strong style={{color:"white"}}>risques et responsabilités de l'acheteur</strong>. Les réglementations d'importation des composés de recherche varient considérablement selon les pays.</>:<>Orders shipped outside the European Union are dispatched at the <strong style={{color:"white"}}>buyer's own risk and responsibility</strong>. Import regulations for research compounds vary significantly by country.</>}
          </p>
          <p style={{marginBottom:12,fontSize:13,color:"rgba(255,255,255,0.65)",lineHeight:1.75}}>
            {lang==="FR"?"Il incombe au seul acheteur de vérifier si ces produits peuvent être légalement importés dans sa juridiction. Novalyx Research n'agit pas en tant qu'importateur officiel et n'est pas responsable de :":"It is the sole responsibility of the buyer to verify whether these products may be legally imported into their jurisdiction. Novalyx Research does not act as an importer of record and is not responsible for:"}
          </p>
          <ul style={{paddingLeft:20,marginBottom:12,fontSize:13,color:"rgba(255,255,255,0.58)",lineHeight:1.85}}>
            <li>{tg(lang,"Customs seizures, inspections, or delays")}</li>
            <li>{tg(lang,"Import duties, taxes, or clearance fees imposed by your country")}</li>
            <li>{tg(lang,"Compliance with local laws regulating research compounds")}</li>
            <li>{tg(lang,"Packages refused, destroyed, or returned by customs authorities")}</li>
          </ul>
          <p style={{fontSize:13,color:"rgba(255,255,255,0.65)",lineHeight:1.75}}>
            {lang==="FR"?<>En passant une commande internationale, vous reconnaissez expressément comprendre vos réglementations d'importation locales et acceptez tous les risques associés. <strong style={{color:"white"}}>Les colis saisis, refusés ou détruits ne sont pas remboursables.</strong></>:<>By placing an international order, you expressly acknowledge that you understand your local import regulations and accept all associated risks. <strong style={{color:"white"}}>Seized, refused, or destroyed packages are non-refundable.</strong></>}
          </p>
        </div>

        <div style={{background:"rgba(74,222,128,0.04)",border:"1px solid rgba(74,222,128,0.15)",borderRadius:10,padding:"20px 24px",marginBottom:36}}>
          <div style={{fontSize:9.5,letterSpacing:2,color:"#4ade80",fontWeight:700,marginBottom:10}}>{tg(lang,"RESEARCH USE DECLARATION")}</div>
          <p style={{marginBottom:10,fontSize:13,color:"rgba(255,255,255,0.55)"}}>{tg(lang,"All products are supplied strictly for laboratory research use only and are handled according to professional standards.")}</p>
          <p style={{fontSize:13,color:"rgba(255,255,255,0.55)"}}>{tg(lang,"By placing an order, you confirm that you are a qualified professional and that you comply with all applicable laws and regulations in your jurisdiction.")}</p>
        </div>

        <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:22,fontWeight:800,color:"white",marginBottom:20,marginTop:32}}>{lang==="FR"?"FAQ — Livraison":"FAQ — Shipping"}</h2>

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
        stripeLink: getStripeLink(product.id, variant.size),
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
    calculator: <CalculatorPage lang={lang}/>,
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
      <div className="announce-bar" style={{background:"#050a15",borderBottom:"1px solid rgba(255,255,255,0.05)",padding:"8px 20px",display:"flex",justifyContent:"center",alignItems:"center",gap:16,fontSize:10,letterSpacing:1,color:"rgba(255,255,255,0.55)",fontWeight:500,overflowX:"auto",whiteSpace:"nowrap"}}>
        <span style={{whiteSpace:"nowrap"}}>{t(lang,"ann1")}</span>
        <span style={{color:"rgba(255,255,255,0.15)"}}>|</span>
        <span style={{whiteSpace:"nowrap"}}>{t(lang,"ann2")}</span>
        <span style={{color:"rgba(255,255,255,0.15)"}}>|</span>
        <span style={{whiteSpace:"nowrap"}}>{t(lang,"ann3")}</span>
        <span style={{color:"rgba(255,255,255,0.15)"}}>|</span>
        <span style={{whiteSpace:"nowrap"}}>{t(lang,"ann4")}</span>
      </div>
      <Nav page={page} go={go} cur={cur} setCur={setCur} cartCount={cartCount} openCart={()=>setCartOpen(true)} lang={lang} setLang={setLang}/>
      <div className="fi" key={`${page}-${lang}`}>{pages[page]||pages.home}</div>
      <Footer go={go} lang={lang}/>
      {cartOpen&&<Cart cart={cart} cur={cur} onClose={()=>setCartOpen(false)} onRemove={lineId=>setCart(p=>p.filter(i=>i.lineId!==lineId))} lang={lang}/>}
    </div>
  );
}
