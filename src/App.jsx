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
/* Liens Stripe encore utilisés tant que le paiement Bitcoin n'est pas activé (GLP-3RT et eau). */
const STRIPE_LINKS = {
  "retatrutide_5mg": "https://buy.stripe.com/3cIfZhfcv5p03zo1FG2Ry19",
  "retatrutide_5mg · Pack de 2": "https://buy.stripe.com/cNi14naWf18Kgmadoo2Ry1a",
  "retatrutide_5mg · Pack de 3": "https://buy.stripe.com/00wbJ1d4n5p0fi6gAA2Ry1b",
  "bac-water_3ml vial": "https://buy.stripe.com/dRm14nfcvdVw8TIckk2Ry16",
  "bac-water_3ml · Pack de 2": "https://buy.stripe.com/3cI9ATc0j2cO8TI7002Ry17",
  "bac-water_3ml · Pack de 3": "https://buy.stripe.com/28E7sL0hBcRs4Ds2JK2Ry18",
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
  // Paiement Bitcoin (BTCPay) : passe à true quand le serveur est synchronisé et testé.
  // false = le site fonctionne comme avant (Stripe + virement).
  BTC_ON:                 false,
  /* Apparence : "classic" (crème, titres à empattements) ou "modern" (fond blanc, police du logo, animations). */
  THEME:                  "modern",
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
    age_desc: "Novalyx Research supplies compounds exclusively for laboratory research. Access is restricted to qualified professionals.",
    age_enter: "ENTER SITE →",
    age_footer: "By entering you confirm compliance with all applicable laws in your jurisdiction.",
    age_org_label: "Laboratory / Organization (optional)",
    age_org_placeholder: "Your organization's name",
    age_check_age: "I confirm I am 18 years of age or older.",
    age_check_pro: "I am a qualified professional (researcher, laboratory, institution).",
    age_check_use: "This order is strictly for laboratory research — not for human or animal use.",
    cart_confirm: "I confirm this order is strictly for laboratory research purposes only.",
    intl_confirm: "I acknowledge this shipment may be subject to customs inspection and I am responsible for compliance with local regulations.",
  },
  FR: {
    age_desc: "Novalyx Research fournit des composés exclusivement pour la recherche en laboratoire. L'accès est réservé aux professionnels qualifiés.",
    age_enter: "ACCÉDER AU SITE →",
    age_footer: "En entrant, vous confirmez être en conformité avec toutes les lois applicables dans votre juridiction.",
    age_org_label: "Laboratoire / Organisation (optionnel)",
    age_org_placeholder: "Nom de votre structure",
    age_check_age: "Je certifie avoir 18 ans ou plus.",
    age_check_pro: "Je suis un professionnel qualifié (chercheur, laboratoire, institution).",
    age_check_use: "Cette commande est strictement destinée à la recherche en laboratoire — non à un usage humain ou animal.",
    cart_confirm: "Je confirme que cette commande est strictement destinée à des fins de recherche en laboratoire uniquement.",
    intl_confirm: "Je reconnais que cet envoi peut être soumis à une inspection douanière et que je suis responsable du respect des réglementations locales.",
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
  "GROWTH FACTOR RESEARCH": "RECHERCHE FACTEURS DE CROISSANCE",
  "GH RESEARCH": "RECHERCHE GH",
  "LONGEVITY RESEARCH": "RECHERCHE LONGÉVITÉ",
  "MULTI-RECEPTOR RESEARCH": "RECHERCHE MULTI-RÉCEPTEURS",
  "COSMETIC PEPTIDE RESEARCH": "RECHERCHE PEPTIDES COSMÉTIQUES",
  "BIOREGULATOR RESEARCH": "RECHERCHE BIORÉGULATEURS",
  "ANTI-AGING RESEARCH": "RECHERCHE ANTI-ÂGE",
  "NEUROPEPTIDE RESEARCH": "RECHERCHE NEUROPEPTIDE",
  // Categories
  "Regenerative": "Régénératif",
  "Metabolic": "Métabolique",
  "GH Research": "Recherche GH",
  "Growth & Cellular": "Croissance & Cellulaire",
  "Longevity": "Longévité",
  "Immune": "Immunité",
  "Cognitive": "Recherche cognitive",
  "Bioregulators": "Biorégulateurs peptidiques",
  "Cosmetic Peptides": "Peptides dermo-cosmétiques",
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
  "Published reports. Public verification keys.": "Rapports publiés. Clés de vérification publiques.",
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
  "Every published report can be verified with its key. Products without a published report are marked “analysis pending”.": "Chaque rapport publié se vérifie avec sa clé. Les produits sans rapport publié sont signalés « analyse à venir ».",
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
    desc: "BPC-157 (Body Protection Compound) is a synthetic pentadecapeptide supplied for research into tissue repair, angiogenesis, and gastrointestinal integrity. Each vial contains lyophilized peptide. Supplied exclusively for in-vitro and laboratory research purposes.",
    desc_fr: "Le BPC-157 (Body Protection Compound) est un pentadécapeptide synthétique fourni pour la recherche sur la réparation tissulaire, l'angiogenèse et l'intégrité gastro-intestinale. Chaque flacon contient un peptide lyophilisé. Fourni exclusivement à des fins de recherche in-vitro et en laboratoire.",
    variants: [
      { size: "5mg",  price: 54.99 },
      { size: "10mg", price: 94.99 },
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
    desc: "TB-500 is a synthetic fragment of Thymosin Beta-4, supplied for research into cellular migration, angiogenesis, and tissue regeneration. Each vial contains lyophilized peptide.",
    desc_fr: "Le TB-500 est un fragment synthétique de la Thymosine Bêta-4, fourni pour la recherche sur la migration cellulaire, l'angiogenèse et la régénération tissulaire. Chaque flacon contient un peptide lyophilisé.",
    variants: [
      { size: "5mg",  price: 59.99 },
      { size: "10mg", price: 99.99 },
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
    desc: "GHK-Copper (Glycyl-Histidyl-Lysine copper complex) is a naturally occurring tripeptide bound to copper. Supplied for research into dermal regeneration, collagen and elastin synthesis, and tissue repair. New batches are submitted for independent analysis by Janoshik.",
    desc_fr: "Le GHK-Cuivre (complexe Glycyl-Histidyl-Lysine cuivre) est un tripeptide naturel lié au cuivre. Fourni pour la recherche sur la régénération cutanée, la synthèse du collagène et de l'élastine, et la réparation tissulaire. Les nouveaux lots sont soumis à une analyse indépendante par Janoshik.",
    variants: [
      { size: "50mg",  price: 52.99 },
      { size: "100mg", price: 89.99 },
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
    desc: "KPV (Lysine-Proline-Valine) is the C-terminal tripeptide fragment of alpha-MSH. Supplied for research into inflammatory signalling, intestinal barrier function, and dermal health.",
    desc_fr: "Le KPV (Lysine-Proline-Valine) est le fragment tripeptide C-terminal de l'alpha-MSH. Fourni pour la recherche sur la signalisation inflammatoire, la fonction de barrière intestinale et la santé dermique.",
    variants: [
      { size: "5mg",  price: 54.99 },
      { size: "10mg", price: 94.99 },
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
    desc: "GLP-3RT is a synthetic peptide supplied exclusively for in-vitro laboratory research into GLP-1, GIP, and glucagon receptor signalling. Each vial contains lyophilized peptide with batch-specific analytical documentation by Janoshik Analytical (Czech Republic). Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Le GLP-3RT est un peptide synthétique fourni exclusivement pour la recherche in-vitro en laboratoire sur la signalisation des récepteurs GLP-1, GIP et glucagon. Chaque flacon contient un peptide lyophilisé avec documentation analytique spécifique au lot par Janoshik Analytical (République tchèque). Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "5mg",  price: 59.99 },
      { size: "5mg · Pack de 2", price: 104.99 },
      { size: "5mg · Pack de 3", price: 149.99 },
      { size: "10mg", price: 89.99 },
      { size: "20mg", price: 149.99 },
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
    desc: "Mazdutide is a synthetic dual-agonist peptide targeting both GLP-1 and glucagon receptors. Supplied exclusively for in-vitro laboratory research. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Le Mazdutide est un peptide double-agoniste synthétique ciblant les récepteurs GLP-1 et glucagon. Fourni exclusivement pour la recherche in-vitro en laboratoire. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "10mg", price: 84.99 },
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
    desc: "Survodutide is a synthetic dual-agonist research peptide targeting GLP-1 and glucagon receptors. Supplied exclusively for in-vitro laboratory research. Not a medicine, supplement, or cosmetic.",
    desc_fr: "Le Survodutide est un peptide de recherche double-agoniste synthétique ciblant les récepteurs GLP-1 et glucagon. Fourni exclusivement pour la recherche in-vitro en laboratoire. Pas un médicament, complément ou cosmétique.",
    variants: [
      { size: "10mg", price: 99.99 },
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
    desc: "Cagrilintide is a synthetic long-acting amylin analog, supplied for research into amylin receptor pathways and satiety signalling. Each vial contains lyophilized peptide for in-vitro laboratory investigation.",
    desc_fr: "Le Cagrilintide est un analogue d'amyline synthétique à action prolongée, fourni pour la recherche sur les voies des récepteurs de l'amyline et la signalisation de la satiété. Chaque flacon contient un peptide lyophilisé pour l'investigation in-vitro en laboratoire.",
    variants: [
      { size: "5mg",  price: 69.99 },
      { size: "10mg", price: 119.99 },
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
    desc: "Tesamorelin is a synthetic analog of growth hormone-releasing hormone (GHRH), supplied for research into visceral fat metabolism and the GH/IGF-1 axis.",
    desc_fr: "Le Tesamorelin est un analogue synthétique de l'hormone de libération de l'hormone de croissance (GHRH), fourni pour la recherche sur le métabolisme des graisses viscérales et l'axe GH/IGF-1.",
    variants: [
      { size: "5mg",  price: 64.99 },
      { size: "10mg", price: 109.99 },
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
    desc: "Ipamorelin is a selective synthetic growth hormone secretagogue, supplied for research into pulsatile GH release pathways. Lyophilized, high-stability formulation.",
    desc_fr: "L'Ipamorelin est un sécrétagogue synthétique sélectif de l'hormone de croissance, fourni pour la recherche sur les voies de libération pulsatile de GH. Formulation lyophilisée haute stabilité.",
    variants: [
      { size: "5mg",  price: 54.99 },
      { size: "10mg", price: 94.99 },
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
    desc: "Sermorelin Acetate is a synthetic GHRH 1-29 fragment, supplied for research into growth hormone releasing pathways. Lyophilized, high-stability formulation.",
    desc_fr: "Le Sermorelin Acétate est un fragment synthétique GHRH 1-29, fourni pour la recherche sur les voies de libération de l'hormone de croissance. Formulation lyophilisée haute stabilité.",
    variants: [
      { size: "5mg", price: 58.99 },
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
    desc: "CJC-1295 without DAC is a synthetic GHRH analog supplied for research into extended-duration GH release pathways. Lyophilized, high-stability formulation.",
    desc_fr: "Le CJC-1295 sans DAC est un analogue synthétique de GHRH fourni pour la recherche sur les voies de libération de GH à durée prolongée. Formulation lyophilisée haute stabilité.",
    variants: [
      { size: "10mg", price: 69.99 },
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
    desc: "NAD+ (Nicotinamide Adenine Dinucleotide) is a coenzyme present in all living cells, supplied for research into cellular energy metabolism, sirtuin activity, and longevity pathways.",
    desc_fr: "Le NAD+ (Nicotinamide Adénine Dinucléotide) est une coenzyme présente dans toutes les cellules vivantes, fournie pour la recherche sur le métabolisme énergétique cellulaire, l'activité des sirtuines et les voies de longévité.",
    variants: [
      { size: "500mg",  price: 58.99 },
      { size: "1000mg", price: 99.99 },
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
    desc: "Epitalon is a synthetic tetrapeptide (Ala-Glu-Asp-Gly), supplied for research into telomerase activation, pineal gland signalling, and longevity pathways.",
    desc_fr: "L'Epitalon est un tétrapeptide synthétique (Ala-Glu-Asp-Gly), fourni pour la recherche sur l'activation de la télomérase, la signalisation de la glande pinéale et les voies de longévité.",
    variants: [
      { size: "10mg", price: 54.99 },
      { size: "50mg", price: 209.99 },
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
    desc: "Pinealon is a synthetic tripeptide, supplied for research into neuroprotection and cognitive longevity signalling pathways.",
    desc_fr: "Le Pinealon est un tripeptide synthétique, fourni pour la recherche sur la neuroprotection et les voies de signalisation de la longévité cognitive.",
    variants: [
      { size: "5mg",  price: 54.99 },
      { size: "10mg", price: 94.99 },
      { size: "20mg", price: 159.99 },
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
    desc: "MOTS-c is a 16-amino acid mitochondrial-derived peptide, supplied for research into metabolic homeostasis, insulin sensitivity, and cellular stress response pathways.",
    desc_fr: "Le MOTS-c est un peptide de 16 acides aminés d'origine mitochondriale, fourni pour la recherche sur l'homéostasie métabolique, la sensibilité à l'insuline et les voies de réponse au stress cellulaire.",
    variants: [
      { size: "10mg", price: 57.99 },
      { size: "40mg", price: 179.99 },
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
    desc: "SS-31 (Elamipretide) is a mitochondria-targeting peptide, supplied for research into cardiolipin binding and mitochondrial energetics pathways.",
    desc_fr: "Le SS-31 (Elamipretide) est un peptide ciblant les mitochondries, fourni pour la recherche sur la liaison à la cardiolipine et les voies énergétiques mitochondriales.",
    variants: [
      { size: "10mg", price: 65.99 },
      { size: "50mg", price: 249.99 },
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
    desc: "Thymosin Alpha-1 (TA1) is a synthetic 28-amino acid peptide, supplied for research into immune system modulation, T-cell signalling, and thymic function.",
    desc_fr: "La Thymosine Alpha-1 (TA1) est un peptide synthétique de 28 acides aminés, fourni pour la recherche sur la modulation du système immunitaire, la signalisation des lymphocytes T et la fonction thymique.",
    variants: [
      { size: "5mg",  price: 65.99 },
      { size: "10mg", price: 109.99 },
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
    desc: "Thymalin is a thymus-derived peptide complex, supplied for research into immune function, thymic regulation, and age-related immunology.",
    desc_fr: "Le Thymalin est un complexe peptidique d'origine thymique, fourni pour la recherche sur la fonction immunitaire, la régulation thymique et l'immunologie liée à l'âge.",
    variants: [
      { size: "10mg", price: 57.99 },
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
    desc: "LL-37 is a cathelicidin-derived antimicrobial peptide, supplied for research into innate immunity pathways and host defense mechanisms.",
    desc_fr: "Le LL-37 est un peptide antimicrobien dérivé de la cathélicidine, fourni pour la recherche sur les voies de l'immunité innée et les mécanismes de défense de l'hôte.",
    variants: [
      { size: "5mg", price: 64.99 },
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
    desc: "Semax is a synthetic heptapeptide analog of ACTH(4-10), supplied for research into cognitive function, BDNF expression, and neuroprotective signalling.",
    desc_fr: "Le Semax est un analogue heptapeptide synthétique de l'ACTH(4-10), fourni pour la recherche sur la fonction cognitive, l'expression du BDNF et la signalisation neuroprotectrice.",
    variants: [
      { size: "5mg",  price: 53.99 },
      { size: "11mg", price: 99.99 },
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
    desc: "Selank is a synthetic heptapeptide analog of tuftsin, supplied for research into anxiolytic mechanisms and GABAergic signalling pathways.",
    desc_fr: "Le Selank est un analogue heptapeptide synthétique de la tuftsine, fourni pour la recherche sur les mécanismes anxiolytiques et les voies de signalisation GABAergiques.",
    variants: [
      { size: "5mg",  price: 54.99 },
      { size: "11mg", price: 99.99 },
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
    desc: "Cerebrolysin is a neurotrophic peptide complex, supplied for research into neuroprotection, BDNF modulation, and cognitive signalling pathways.",
    desc_fr: "Le Cerebrolysin est un complexe peptidique neurotrophique, fourni pour la recherche sur la neuroprotection, la modulation du BDNF et les voies de signalisation cognitive.",
    variants: [
      { size: "60mg", price: 79.99 },
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
    desc: "DSIP (Delta Sleep-Inducing Peptide) is a synthetic nonapeptide, supplied for research into sleep regulation, delta wave activity, and circadian signalling pathways.",
    desc_fr: "Le DSIP (Delta Sleep-Inducing Peptide) est un nonapeptide synthétique, fourni pour la recherche sur la régulation du sommeil, l'activité des ondes delta et les voies de signalisation circadienne.",
    variants: [
      { size: "5mg",  price: 53.99 },
      { size: "10mg", price: 89.99 },
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
    desc: "PT-141 (Bremelanotide) is a synthetic cyclic heptapeptide, supplied for research into melanocortin MC3 and MC4 receptor pathways and central nervous system signalling.",
    desc_fr: "Le PT-141 (Bremelanotide) est un heptapeptide cyclique synthétique, fourni pour la recherche sur les voies des récepteurs de la mélanocortine MC3 et MC4 et la signalisation du système nerveux central.",
    variants: [
      { size: "10mg", price: 56.99 },
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
    desc: "Ara-290 is an 11-amino acid peptide derived from erythropoietin, supplied for research into innate repair receptor signalling and neuroprotection.",
    desc_fr: "L'Ara-290 est un peptide de 11 acides aminés dérivé de l'érythropoïétine, fourni pour la recherche sur la signalisation du récepteur de réparation innée et la neuroprotection.",
    variants: [
      { size: "10mg", price: 58.99 },
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
    desc: "Kisspeptin-10 is a synthetic decapeptide, supplied for research into GnRH regulation and reproductive endocrinology signalling pathways.",
    desc_fr: "Le Kisspeptin-10 est un décapeptide synthétique, fourni pour la recherche sur la régulation de la GnRH et les voies de signalisation de l'endocrinologie de la reproduction.",
    variants: [
      { size: "5mg",  price: 55.99 },
      { size: "10mg", price: 94.99 },
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
    desc: "Tirzepatide is a synthetic peptide supplied exclusively for in-vitro laboratory research into GLP-1 and GIP receptor signalling. Each vial contains a lyophilised compound. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    variants: [
      { size: "5mg",  price: 52.99 },
      { size: "10mg", price: 89.99 },
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
    desc: "Semaglutide is a synthetic peptide supplied exclusively for in-vitro laboratory research into GLP-1 receptor signalling. Each vial contains a lyophilised compound. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Le Semaglutide est un peptide synthétique fourni exclusivement pour la recherche in-vitro en laboratoire sur la signalisation du récepteur GLP-1. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "5mg",  price: 51.99 },
      { size: "10mg", price: 89.99 },
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
    desc: "AOD-9604 is a synthetic modified fragment of growth hormone (amino acids 176-191), supplied exclusively for in-vitro laboratory research into lipid metabolism signalling. Each vial contains a lyophilised compound. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "L'AOD-9604 est un fragment modifié synthétique de l'hormone de croissance (acides aminés 176-191), fourni exclusivement pour la recherche in-vitro en laboratoire sur la signalisation du métabolisme lipidique. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "5mg",  price: 64.99 },
      { size: "10mg", price: 109.99 },
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
    desc: "GHRP-2 is a synthetic growth hormone-releasing peptide supplied exclusively for in-vitro laboratory research into GH secretagogue receptor pathways. Each vial contains a lyophilised compound. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Le GHRP-2 est un peptide synthétique libérateur d'hormone de croissance fourni exclusivement pour la recherche in-vitro en laboratoire sur les voies du récepteur sécrétagogue GH. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "5mg",  price: 55.99 },
      { size: "10mg", price: 94.99 },
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
    desc: "GHRP-6 is a synthetic growth hormone-releasing peptide supplied exclusively for in-vitro laboratory research into GH secretagogue receptor pathways. Each vial contains a lyophilised compound. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Le GHRP-6 est un peptide synthétique libérateur d'hormone de croissance fourni exclusivement pour la recherche in-vitro en laboratoire sur les voies du récepteur sécrétagogue GH. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "5mg",  price: 55.99 },
      { size: "10mg", price: 94.99 },
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
    desc: "5-Amino-1MQ is a synthetic small molecule NNMT inhibitor supplied exclusively for in-vitro laboratory research into cellular metabolism and adipocyte signalling. Each vial contains a lyophilised compound. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Le 5-Amino-1MQ est un inhibiteur NNMT synthétique petite molécule fourni exclusivement pour la recherche in-vitro en laboratoire sur le métabolisme cellulaire et la signalisation des adipocytes. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "5mg", price: 53.99 },
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
    desc: "Hexarelin is a synthetic growth hormone-releasing hexapeptide supplied exclusively for in-vitro laboratory research into GH secretagogue receptor pathways. Each vial contains a lyophilised compound. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "L'Hexarelin est un hexapeptide synthétique libérateur d'hormone de croissance fourni exclusivement pour la recherche in-vitro en laboratoire sur les voies du récepteur sécrétagogue GH. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "5mg", price: 69.99 },
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
    desc: "Novalyx Formula 01 is a proprietary research blend containing BPC-157 (10mg) and TB-500 (10mg) combined in a single lyophilized vial. Formulated for researchers investigating combined regenerative signalling pathways. New batches are submitted for independent analysis by Janoshik.",
    desc_fr: "Novalyx Formula 01 est un mélange de recherche propriétaire contenant BPC-157 (10mg) et TB-500 (10mg) combinés dans un seul flacon lyophilisé. Formulé pour les chercheurs étudiant les voies de signalisation régénératives combinées. Les nouveaux lots sont soumis à une analyse indépendante par Janoshik.",
    variants: [
      { size: "10mg+10mg", price: 79.99 },
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
    desc: "Novalyx Formula 02 is a proprietary research blend containing CJC-1295 (5mg, no DAC) and Ipamorelin (5mg) in a single lyophilized vial. Formulated for researchers investigating GH-releasing pathways in an integrated protocol.",
    desc_fr: "Novalyx Formula 02 est un mélange de recherche propriétaire contenant CJC-1295 (5mg, sans DAC) et Ipamorelin (5mg) dans un seul flacon lyophilisé. Formulé pour les chercheurs étudiant les voies de libération de GH dans un protocole intégré.",
    variants: [
      { size: "5mg+5mg", price: 64.99 },
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
    desc: "Novalyx Formula 03 is our flagship triple-peptide research blend containing BPC-157 (10mg), GHK-Copper (50mg), and TB-500 (10mg) in a single lyophilized vial. Formulated for researchers investigating comprehensive regenerative signalling across multiple pathways simultaneously.",
    desc_fr: "Novalyx Formula 03 est notre mélange de recherche phare à triple peptide contenant BPC-157 (10mg), GHK-Cuivre (50mg) et TB-500 (10mg) dans un seul flacon lyophilisé. Formulé pour les chercheurs étudiant la signalisation régénérative complète à travers plusieurs voies simultanément.",
    variants: [
      { size: "70mg total", price: 79.99 },
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
    desc: "Novalyx Research Bacteriostatic Water is pharmaceutical-grade sterile water containing 0.9% benzyl alcohol as a bacteriostatic agent. Supplied exclusively for laboratory use in the reconstitution of lyophilised research peptides. Each vial is sealed, sterile, and ready for immediate laboratory use.",
    desc_fr: "L'Eau Bactériostatique Novalyx Research est une eau stérile de qualité pharmaceutique contenant 0,9% d'alcool benzylique comme agent bactériostatique. Fournie exclusivement pour usage en laboratoire dans la reconstitution des peptides de recherche lyophilisés. Chaque flacon est scellé, stérile et prêt à l'emploi immédiat en laboratoire.",
    variants: [
      { size: "3ml vial",        price: 6.99 },
      { size: "3ml · Pack de 2", price: 12.99 },
      { size: "3ml · Pack de 3", price: 18.99 },
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
    desc: "Novalyx Formula 04 is our premium four-peptide research complex containing BPC-157 (10mg), GHK-Copper (50mg), TB-500 (10mg), and KPV (10mg) in a single lyophilized vial. The most comprehensive regenerative research blend in our catalog.",
    desc_fr: "Novalyx Formula 04 est notre complexe de recherche premium à quatre peptides contenant BPC-157 (10mg), GHK-Cuivre (50mg), TB-500 (10mg) et KPV (10mg) dans un seul flacon lyophilisé. Le mélange de recherche régénératif le plus complet de notre catalogue.",
    variants: [
      { size: "80mg total", price: 84.99 },
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
    desc: "Melanotan II is supplied exclusively for in-vitro laboratory research. Each vial contains lyophilized compound. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Le Melanotan II est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "10mg", price: 54.99 },
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
    desc: "Melanotan I is supplied exclusively for in-vitro laboratory research. Each vial contains lyophilized compound. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Le Melanotan I est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "10mg", price: 55.99 },
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
    desc: "Snap-8 is supplied exclusively for in-vitro laboratory research. Each vial contains lyophilized compound. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Le Snap-8 est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "10mg", price: 54.99 },
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
    desc: "VIP is supplied exclusively for in-vitro laboratory research. Each vial contains lyophilized compound. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Le VIP est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "5mg", price: 60.99 },
      { size: "10mg", price: 104.99 },
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
    desc: "IGF-1 LR3 is supplied exclusively for in-vitro laboratory research. Each vial contains lyophilized compound. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Le IGF-1 LR3 est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "1mg", price: 79.99 },
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
    desc: "IGF-DES is supplied exclusively for in-vitro laboratory research. Each vial contains lyophilized compound. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Le IGF-DES est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "2mg", price: 56.99 },
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
    desc: "Novalyx Formula 06 is supplied exclusively for in-vitro laboratory research. Each vial contains lyophilized compound. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Le Novalyx Formula 06 est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "10mg total (BPC5+TB5)", price: 64.99 },
      { size: "20mg total (BPC10+TB10)", price: 109.99 },
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
    desc: "Novalyx Formula 07 (Cagri+Sema) is supplied exclusively for in-vitro laboratory research. Each vial contains lyophilized compound. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Le Novalyx Formula 07 (Cagri+Sema) est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "2.5mg+2.5mg", price: 64.99 },
      { size: "5mg+5mg", price: 109.99 },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },

  {
    id: "novalyxformula08semaxselank",
    name: "Novalyx Formula 08 (Semax + Selank)",
    tag: "NEUROPEPTIDE RESEARCH",
    category: "Signature Blends",
    desc: "Novalyx Formula 08 (Semax + Selank) is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised peptide. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Novalyx Formula 08 (Semax + Selank) est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "10mg+10mg", price: 69.99 },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "novalyxformula09glp3rtcagri",
    name: "Novalyx Formula 09 (GLP-3RT + Cagrilintide)",
    tag: "MULTI-RECEPTOR RESEARCH",
    category: "Signature Blends",
    desc: "Novalyx Formula 09 (GLP-3RT + Cagrilintide) is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised peptide. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Novalyx Formula 09 (GLP-3RT + Cagrilintide) est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "5mg+5mg", price: 74.99 },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "dihexa",
    name: "Dihexa",
    tag: "NEUROPEPTIDE RESEARCH",
    category: "Cognitive",
    desc: "Dihexa is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised peptide. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Dihexa est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "10mg", price: 64.99 },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "pe2228",
    name: "PE-22-28",
    tag: "NEUROPEPTIDE RESEARCH",
    category: "Cognitive",
    desc: "PE-22-28 is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised peptide. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "PE-22-28 est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "10mg", price: 60.99 },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "adamax",
    name: "Adamax",
    tag: "NEUROPEPTIDE RESEARCH",
    category: "Cognitive",
    desc: "Adamax is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised peptide. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Adamax est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "5mg", price: 74.99 },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "nasemaxamidate",
    name: "NA-Semax Amidate",
    tag: "NEUROPEPTIDE RESEARCH",
    category: "Cognitive",
    desc: "NA-Semax Amidate is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised peptide. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "NA-Semax Amidate est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "30mg", price: 79.99 },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "naselankamidate",
    name: "NA-Selank Amidate",
    tag: "NEUROPEPTIDE RESEARCH",
    category: "Cognitive",
    desc: "NA-Selank Amidate is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised peptide. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "NA-Selank Amidate est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "30mg", price: 79.99 },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "cardiogen",
    name: "Cardiogen",
    tag: "BIOREGULATOR RESEARCH",
    category: "Bioregulators",
    desc: "Cardiogen is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised peptide. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Cardiogen est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "20mg", price: 69.99 },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "cortagen",
    name: "Cortagen",
    tag: "BIOREGULATOR RESEARCH",
    category: "Bioregulators",
    desc: "Cortagen is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised peptide. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Cortagen est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "20mg", price: 69.99 },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "pancragen",
    name: "Pancragen",
    tag: "BIOREGULATOR RESEARCH",
    category: "Bioregulators",
    desc: "Pancragen is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised peptide. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Pancragen est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "20mg", price: 69.99 },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "cartalax",
    name: "Cartalax",
    tag: "BIOREGULATOR RESEARCH",
    category: "Bioregulators",
    desc: "Cartalax is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised peptide. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Cartalax est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "20mg", price: 69.99 },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "chonluten",
    name: "Chonluten",
    tag: "BIOREGULATOR RESEARCH",
    category: "Bioregulators",
    desc: "Chonluten is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised peptide. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Chonluten est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "20mg", price: 69.99 },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "ovagen",
    name: "Ovagen",
    tag: "BIOREGULATOR RESEARCH",
    category: "Bioregulators",
    desc: "Ovagen is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised peptide. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Ovagen est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "20mg", price: 69.99 },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "vesugen",
    name: "Vesugen",
    tag: "BIOREGULATOR RESEARCH",
    category: "Bioregulators",
    desc: "Vesugen is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised peptide. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Vesugen est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "20mg", price: 69.99 },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "testagen",
    name: "Testagen",
    tag: "BIOREGULATOR RESEARCH",
    category: "Bioregulators",
    desc: "Testagen is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised peptide. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Testagen est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "20mg", price: 74.99 },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "prostamax",
    name: "Prostamax",
    tag: "BIOREGULATOR RESEARCH",
    category: "Bioregulators",
    desc: "Prostamax is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised peptide. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Prostamax est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "20mg", price: 69.99 },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "foxo4dri",
    name: "FOXO4-DRI",
    tag: "LONGEVITY RESEARCH",
    category: "Longevity",
    desc: "FOXO4-DRI is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised peptide. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "FOXO4-DRI est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "10mg", price: 104.99 },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "humanin",
    name: "Humanin",
    tag: "LONGEVITY RESEARCH",
    category: "Longevity",
    desc: "Humanin is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised peptide. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Humanin est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "10mg", price: 99.99 },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "aicar",
    name: "AICAR",
    tag: "LONGEVITY RESEARCH",
    category: "Longevity",
    desc: "AICAR is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised compound. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "AICAR est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "50mg", price: 57.99 },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "cjc1295dac",
    name: "CJC-1295 (with DAC)",
    tag: "GH RESEARCH",
    category: "GH Research",
    desc: "CJC-1295 (with DAC) is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised peptide. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "CJC-1295 (with DAC) est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "5mg", price: 74.99 },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "pegmgf",
    name: "PEG-MGF",
    tag: "GROWTH FACTOR RESEARCH",
    category: "Growth & Cellular",
    desc: "PEG-MGF is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised peptide. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "PEG-MGF est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "2mg", price: 64.99 },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "hghfrag176191",
    name: "HGH Fragment 176-191",
    tag: "GH RESEARCH",
    category: "GH Research",
    desc: "HGH Fragment 176-191 is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised peptide. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "HGH Fragment 176-191 est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "5mg", price: 74.99 },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "ace031",
    name: "ACE-031",
    tag: "GROWTH FACTOR RESEARCH",
    category: "Growth & Cellular",
    desc: "ACE-031 is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised peptide. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "ACE-031 est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "1mg", price: 56.99 },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "eloralintide",
    name: "Eloralintide",
    tag: "METABOLIC RESEARCH",
    category: "Metabolic",
    desc: "Eloralintide is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised peptide. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Eloralintide est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "5mg", price: 99.99 },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "adipotide",
    name: "Adipotide",
    tag: "METABOLIC RESEARCH",
    category: "Metabolic",
    desc: "Adipotide is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised peptide. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Adipotide est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "2mg", price: 65.99 },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "ahkcu",
    name: "AHK-Cu",
    tag: "COSMETIC PEPTIDE RESEARCH",
    category: "Cosmetic Peptides",
    desc: "AHK-Cu is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised peptide. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "AHK-Cu est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "50mg", price: 54.99 },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "matrixyl",
    name: "Matrixyl (Palmitoyl Pentapeptide-4)",
    tag: "COSMETIC PEPTIDE RESEARCH",
    category: "Cosmetic Peptides",
    desc: "Matrixyl (Palmitoyl Pentapeptide-4) is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised peptide. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.",
    desc_fr: "Matrixyl (Palmitoyl Pentapeptide-4) est fourni exclusivement pour la recherche in-vitro en laboratoire. Chaque flacon contient un composé lyophilisé. Le rapport d'analyse Janoshik est publié dès que le lot a été testé. Pas un médicament, complément ou cosmétique. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "10mg", price: 54.99 },
    ],
    commonSpecs: [
      { label: "Format",     value: "Lyophilised vial" },
      { label: "Purity",     value: "≥99% target (HPLC)" },
      { label: "Storage",    value: "Dry, room temperature, away from light before reconstitution; 2–8°C after reconstitution" },
      { label: "COA",        value: "Janoshik (per batch)" },
    ],
  },
  {
    id: "aceticwater",
    name: "Acetic Acid Water 0.6%",
    tag: "LAB SUPPLY",
    category: "Lab Supplies",
    desc: "Acetic Acid Water 0.6% is a laboratory reconstitution solvent. Not for human or veterinary use.",
    desc_fr: "Eau acidifiée (acide acétique 0,6 %) : solvant de reconstitution pour le laboratoire. Pas pour usage humain ou vétérinaire.",
    variants: [
      { size: "3ml", price: 6.99 },
    ],
    commonSpecs: [
      { label: "Format",     value: "3 ml sealed vial" },
      { label: "Composition", value: "Sterile water, 0.6% acetic acid" },
      { label: "Storage",    value: "Room temperature, away from light" },
    ],
  },
];

/* ─── HELPERS ────────────────────────────────────────────── */


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
/* Vente additionnelle « Souvent acheté avec : eau bactériostatique ».
   Laisse false tant que le paiement se fait par liens Stripe (un seul produit par paiement).
   Passe à true quand le paiement Bitcoin encaisse tout le panier d'un coup. */
const XSELL_BAC = CONFIG.BTC_ON;
/* Produits achetables en ligne. Pour en ouvrir un nouveau : ajoute son id ici. */
const AVAILABLE = ["retatrutide", "bac-water"];
const isAvail = (p) => AVAILABLE.includes(p.id);
/* Stock au niveau du FORMAT : seuls ces formats sont physiquement en stock (les autres formats = sur commande). */
const STOCK_SIZES = { retatrutide: ["5mg", "5mg · Pack de 2", "5mg · Pack de 3"] };
const inStock = (p, size) => isAvail(p) && (!STOCK_SIZES[p.id] || STOCK_SIZES[p.id].includes(size));
/* Formats vendables uniquement avec le paiement Bitcoin (pas de lien Stripe) : cachés tant que BTC_ON est faux. */
const BTC_ONLY_SIZES = { retatrutide: ["10mg", "20mg"] };
const visVariants = (p) => CONFIG.BTC_ON ? p.variants.filter(v => !isPackSize(v.size)) : p.variants.filter(v => !(BTC_ONLY_SIZES[p.id] || []).includes(v.size));
/* Avec le paiement Bitcoin, tout le catalogue devient commandable :
   en stock (AVAILABLE) = expédié sous 24 h ; le reste = sur commande (~3 semaines). */
const canBuy = (p) => CONFIG.BTC_ON || isAvail(p);
const STOCK_LEFT = { retatrutide: 17 };
/* Minimum de flacons pour un produit SUR COMMANDE : la commande rembourse au moins les 2 boîtes
   achetées au fournisseur (+ part de livraison). Le test Janoshik reste avancé par Novalyx.
   Recalculé à partir du fichier novalyx-calcul-prix.xlsx — à garder identique dans api/checkout.mjs. */
const MIN_QTY = {"bpc157_5mg": 2, "bpc157_10mg": 2, "tb500_5mg": 3, "tb500_10mg": 3, "ghk_50mg": 2, "ghk_100mg": 2, "kpv_5mg": 2, "kpv_10mg": 2, "retatrutide_10mg": 2, "retatrutide_20mg": 2, "mazdutide_10mg": 4, "survodutide_10mg": 4, "cagrilintide_5mg": 4, "cagrilintide_10mg": 3, "tesamorelin_5mg": 4, "tesamorelin_10mg": 4, "ipamorelin_5mg": 2, "ipamorelin_10mg": 2, "sermorelin_5mg": 3, "cjc1295_10mg": 4, "nad_500mg": 3, "nad_1000mg": 3, "epitalon_10mg": 2, "epitalon_50mg": 2, "pinealon_5mg": 2, "pinealon_10mg": 2, "pinealon_20mg": 2, "motsc_10mg": 3, "motsc_40mg": 3, "ss31_10mg": 3, "ss31_50mg": 3, "thymosinalpha1_5mg": 3, "thymosinalpha1_10mg": 3, "thymalin_10mg": 3, "ll37_5mg": 3, "semax_5mg": 2, "semax_11mg": 2, "selank_5mg": 2, "selank_11mg": 2, "cerebrolysin_60mg": 2, "dsip_5mg": 2, "dsip_10mg": 2, "pt141_10mg": 3, "ara290_10mg": 3, "kisspeptin_5mg": 3, "kisspeptin_10mg": 2, "slupp322_5mg": 2, "slupp322_10mg": 2, "semaglutide_5mg": 2, "semaglutide_10mg": 2, "aod9604_5mg": 4, "aod9604_10mg": 4, "ghrp2_5mg": 2, "ghrp2_10mg": 2, "ghrp6_5mg": 2, "ghrp6_10mg": 2, "amino1mq_5mg": 2, "hexarelin_5mg": 4, "formula01_10mg+10mg": 4, "formula02_5mg+5mg": 4, "formula03_70mg total": 4, "formula04_80mg total": 4, "melanotanii_10mg": 2, "melanotani_10mg": 3, "snap8_10mg": 2, "vip_5mg": 3, "vip_10mg": 3, "igf1lr3_1mg": 4, "igfdes_2mg": 3, "novalyxformula06_10mg total (BPC5+TB5)": 4, "novalyxformula06_20mg total (BPC10+TB10)": 4, "novalyxformula07cagrisema_2.5mg+2.5mg": 3, "novalyxformula07cagrisema_5mg+5mg": 4, "novalyxformula08semaxselank_10mg+10mg": 4, "novalyxformula09glp3rtcagri_5mg+5mg": 4, "dihexa_10mg": 4, "pe2228_10mg": 3, "adamax_5mg": 4, "nasemaxamidate_30mg": 4, "naselankamidate_30mg": 4, "cardiogen_20mg": 4, "cortagen_20mg": 4, "pancragen_20mg": 4, "cartalax_20mg": 4, "chonluten_20mg": 4, "ovagen_20mg": 4, "vesugen_20mg": 4, "testagen_20mg": 4, "prostamax_20mg": 4, "foxo4dri_10mg": 4, "humanin_10mg": 4, "aicar_50mg": 3, "cjc1295dac_5mg": 4, "pegmgf_2mg": 4, "hghfrag176191_5mg": 4, "ace031_1mg": 3, "eloralintide_5mg": 4, "adipotide_2mg": 3, "ahkcu_50mg": 2, "matrixyl_10mg": 2, "aceticwater_3ml": 4};
const minQty = (p, size) => (CONFIG.BTC_ON && !inStock(p, size) && !isPackSize(size)) ? (MIN_QTY[p.id + "_" + size] || 2) : 1;            // flacons restants du lot analysé (à mettre à jour à la main)
const isPackSize = (s) => /pack/i.test(String(s));
/* Remises par quantité (paiement Bitcoin). Les anciens « packs » du GLP-3RT et de l'eau sont remplacés par des
   paliers aux MÊMES prix (TIER_TOTALS). Règle identique dans api/checkout.mjs. */
const TIER_TOTALS = { "retatrutide|5mg": { 2: 104.99, 3: 149.99 }, "bac-water|3ml vial": { 2: 12.99, 3: 18.99 } };
const baseDisc = (q) => q >= 5 ? 0.2 : q >= 3 ? 0.15 : q >= 2 ? 0.1 : 0;
const lineTotal = (unit, q, size, id) => {
  if (!CONFIG.BTC_ON || isPackSize(size)) return Math.round(unit * q * 100) / 100;
  const t = TIER_TOTALS[id + "|" + size];
  if (t && t[q]) return t[q];
  let d = baseDisc(q);
  if (t && q >= 4) d = Math.max(d, ...Object.keys(t).map(k => 1 - t[k] / (unit * Number(k))));
  return Math.round(unit * q * (1 - d) * 100) / 100;
};
const qtyDiscount = (q, size, id, unit) => {
  if (!CONFIG.BTC_ON || isPackSize(size)) return 0;
  if (id && unit) return 1 - lineTotal(unit, q, size, id) / (unit * q);
  return baseDisc(q);
};
const FREE_SHIP_MIN = 100;                         // livraison offerte dès 100 € en France et dans l'UE
const cartShipping = (cart, zone, subtotal) => {
  if (!cart.length) return 0;
  const eu = zone === "FR" || zone === "EU";
  if (eu && subtotal >= FREE_SHIP_MIN) return 0;
  if (eu && cart.some(i => isPackSize(i.size))) return 0;
  if (cart.every(i => i.id === "bac-water")) return eu ? 3.99 : ZONE_RATE[zone];
  return ZONE_RATE[zone];
};
const JANOSHIK_VERIFY = "https://janoshik.com/verify/";

/* Couleur de capsule par catégorie — sobre, façon étiquette de labo */
const CAT_TONE = {
  "Metabolic":"#A8792A", "Regenerative":"#1E6A43", "Longevity":"#5A4B86", "GH Research":"#2E5A86",
  "Immune":"#9A4B2C", "Cognitive":"#26706E", "Specialized":"#86394A", "Signature Blends":"#0B1B2E",
  "Growth & Cellular":"#3E6B4E", "Lab Supplies":"#5B7A99", "Bioregulators":"#8A6D2F", "Cosmetic Peptides":"#9A4B6E",
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
  "Lab Supplies":     ["Solvants de reconstitution pour laboratoire.","Laboratory reconstitution solvents."],
  "Bioregulators":    ["Peptides courts issus des travaux de V. Khavinson.","Short peptides from V. Khavinson's research."],
  "Cosmetic Peptides":["Ingrédients peptidiques dermo-cosmétiques.","Dermo-cosmetic peptide ingredients."],
};
const CATEGORY_ORDER = ["Metabolic","Lab Supplies","Regenerative","Signature Blends","Longevity","GH Research","Growth & Cellular","Immune","Cognitive","Bioregulators","Cosmetic Peptides","Specialized"];

/* ─── LANGUES : FR et EN sont écrites dans le code ; DE et NL sont traduites à l'affichage ───
   En DE / NL, le site prépare la version anglaise, puis chaque texte affiché est remplacé par sa
   traduction (dictionnaires XL_DE et XL_NL, en fin de fichier). Les nombres sont remplacés par {#}
   dans les clés, puis réinsérés : « Only 17 vials left » → clé « Only {#} vials left ». */
const LANGS = ["FR", "EN", "DE", "NL"];
const LANG_NAMES = { FR: "Français", EN: "English", DE: "Deutsch", NL: "Nederlands" };
const COMMA_LANGS = ["FR", "DE", "NL"];
const XL_NUM = /\d+(?:[.,]\d+)*/g;
// clé canonique : nombres → {#}, et « €12.50 » / « 12,50 € » / « 12 % » ramenés à une seule forme
const xlKey = (s) => s.replace(XL_NUM, "{#}").replace(/€\s?\{#\}|\{#\}\s?€/g, "{#}€").replace(/\{#\}\s?%/g, "{#}%");
let XL_NAME_RX = null;   // noms de produits, reconnus tels quels (« {N} » dans les clés)
const xlNameRx = () => XL_NAME_RX || (XL_NAME_RX = new RegExp([...new Set(PRODUCTS.map(p => p.name))].sort((a, b) => b.length - a.length).map(n => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "g"));
const xlOne = (core, dict) => {
  let v = dict[xlKey(core)], src = core, names = [];
  if (v == null) {
    const k2 = core.replace(xlNameRx(), (m) => { names.push(m); return "\u0000"; });
    if (names.length) { v = dict[xlKey(k2).replace(/\u0000/g, "{N}")]; src = k2; }
  }
  if (v == null) return null;
  const nums = src.match(XL_NUM) || []; let i = 0, j = 0;
  return v.replace(/\{#\}|\{N\}/g, (t) => (t === "{#}" ? (nums[i++] ?? "") : (names[j++] ?? "")));
};
const xlText = (txt, dict) => {
  const core = txt.trim();
  if (!core || !/[A-Za-z]/.test(core)) return null;
  let out = xlOne(core, dict);
  if (out == null && core.includes("\n")) {
    const lines = core.split("\n").map(l => (l.trim() ? (xlOne(l.trim(), dict) ?? l) : l)).join("\n");
    if (lines !== core) out = lines;
  }
  if (out == null) return null;
  return txt.slice(0, txt.length - txt.trimStart().length) + out + txt.slice(txt.trimEnd().length);
};
const XL_ATTRS = ["placeholder", "aria-label", "title", "alt"];
const useDomTranslate = (lang) => {
  useEffect(() => {
    const dict = lang === "DE" ? XL_DE : lang === "NL" ? XL_NL : null;
    if (!dict || typeof document === "undefined") return;
    const doText = (n) => { const out = xlText(n.nodeValue, dict); if (out != null && out !== n.nodeValue) n.nodeValue = out; };
    const doAttrs = (el) => { for (const a of XL_ATTRS) { const v = el.getAttribute && el.getAttribute(a); if (v) { const out = xlText(v, dict); if (out != null && out !== v) el.setAttribute(a, out); } } };
    const walk = (root) => {
      if (root.nodeType === 3) return doText(root);
      if (root.nodeType !== 1 || root.tagName === "SCRIPT" || root.tagName === "STYLE") return;
      doAttrs(root);
      const it = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
      let n; while ((n = it.nextNode())) { if (n.nodeType === 3) { const pt = n.parentNode && n.parentNode.tagName; if (pt !== "SCRIPT" && pt !== "STYLE") doText(n); } else doAttrs(n); }
    };
    walk(document.body);
    const mo = new MutationObserver((recs) => {
      for (const r of recs) {
        if (r.type === "characterData") doText(r.target);
        else if (r.type === "attributes") doAttrs(r.target);
        else r.addedNodes.forEach(walk);
      }
    });
    mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: XL_ATTRS });
    return () => mo.disconnect();
  }, [lang]);
};

const price = (eur, cur, lang) => {
  const c = CURRENCIES[cur]; const n = (eur * c.rate).toFixed(2);
  if (cur === "EUR") return COMMA_LANGS.includes(lang) ? `${n.replace(".", ",")} €` : `€${n}`;
  return `${c.symbol}${n}`;
};
const fmtDate = (iso, lang) => {
  if (!iso) return "—";
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString({ FR: "fr-FR", DE: "de-DE", NL: "nl-NL" }[lang] || "en-GB", { day:"2-digit", month:"short", year:"numeric" });
};
const pct = (v, lang) => !v ? "—" : (COMMA_LANGS.includes(lang) ? `${v.replace(".", ",")} %` : `${v}%`);
const num = (v, lang) => !v ? "—" : (COMMA_LANGS.includes(lang) ? v.replace(".", ",") : v);
const coaFor = (p, size) => { const c = COAS[p.id]; return c && (!size || c.size === size) ? c : null; };
const coaLink = (c) => c.url || JANOSHIK_VERIFY;
const shortName = (n) => n.replace("Novalyx Formula ", "FORMULA ").replace(" (no DAC)", "");

/* ─── GLOBAL CSS ─────────────────────────────────────────── */
/* ─── THÈME « MODERNE » (actif si CONFIG.THEME === "modern") ───────────────
   Fond blanc, police géométrique du logo (Poppins) pour les titres, vert du logo
   pour les actions d'achat, cartes arrondies avec ombres, animations douces. */
const MODERN_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,500;0,600;0,700;1,600&family=Inter:wght@400;500;600&display=swap');
:root{
  --paper:#FFFFFF; --surface:#FFFFFF; --soft:#F5F7FA; --ink:#09193B; --ink2:#3A4659; --mute:#667085;
  --line:#E4E8EE; --line2:#EEF1F5; --green:#2E7D32; --green-soft:#EAF5E4; --leaf:#78B752;
  --serif:'Poppins',system-ui,-apple-system,sans-serif; --sans:'Inter',system-ui,-apple-system,sans-serif;
  --mono:'Inter',system-ui,-apple-system,sans-serif;
}
.cart-btn{border-radius:10px;border-width:1.5px}
.display em,.h2 em{font-style:italic;font-weight:600;color:var(--green)}
.pcard-sizes,.fact-k,.fact-v{letter-spacing:.01em}
input[type=text],input[type=email],input[type=search],input:not([type]),select,textarea{border-radius:12px}
.gate label,label.check{border-radius:12px}
html,body{background:#fff}
.display{font-weight:600;letter-spacing:-.035em;line-height:1.04}
.h2{font-weight:600;letter-spacing:-.025em}
.pcard-name{font-weight:600;font-size:21px;letter-spacing:-.02em}
.pcard-price{font-weight:600;font-size:21px}
.prose h3{font-weight:600}
.eyebrow{font-family:var(--sans);font-weight:600;font-size:11.5px;letter-spacing:.12em;color:var(--green)}
.tag{font-family:var(--sans);font-weight:600;font-size:10.5px;letter-spacing:.08em}
.link{font-family:var(--sans);font-weight:600;font-size:13px;letter-spacing:.01em;text-transform:none;border-bottom-width:2px}
.lead{color:var(--ink2)}
.btn{border-radius:12px;font-weight:600;transition:transform .15s ease,box-shadow .2s ease,background .2s ease,color .2s ease}
.btn:hover{transform:translateY(-1px)}
.btn:active{transform:translateY(0) scale(.98)}
.btn-ink{background:var(--ink);box-shadow:0 8px 20px rgba(9,25,59,.18)}
.btn-ink:hover{background:#142a5c}
.btn-line{border:1.5px solid var(--line);background:#fff}
.btn-line:hover{border-color:var(--ink)}
.buy-btn.btn-ink,.hero-cta .btn-ink,.drawer-in .btn-ink:last-child,.mbar .btn-ink{background:var(--leaf);color:var(--ink);box-shadow:0 8px 22px rgba(120,183,82,.35)}
.buy-btn.btn-ink:hover,.hero-cta .btn-ink:hover,.drawer-in .btn-ink:last-child:hover,.mbar .btn-ink:hover{background:#6aa947}
.nav{background:rgba(255,255,255,.86);border-bottom-color:var(--line2)}
.nav-links button.on,.nav-links button:hover{border-color:var(--leaf)}
.hero{background:radial-gradient(60% 50% at 88% 8%,rgba(120,183,82,.16),transparent 70%),radial-gradient(50% 45% at 6% 92%,rgba(9,25,59,.06),transparent 70%)}
.grid{gap:16px;background:transparent;border:0}
.pcard{border:1px solid var(--line);border-radius:18px;box-shadow:0 1px 2px rgba(9,25,59,.04);transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}
.pcard:hover{background:#fff;transform:translateY(-4px);box-shadow:0 16px 36px rgba(9,25,59,.10);border-color:#d6dce6}
.pcard-vial img{border-radius:14px}
.sheet{border-radius:22px;border-color:var(--line);box-shadow:0 12px 34px rgba(9,25,59,.07)}
.facts{border:0;gap:12px}
.fact{border:1px solid var(--line);border-radius:16px;background:var(--soft)}
.fchip{border-radius:999px;font-family:var(--sans);font-weight:500;font-size:12.5px;letter-spacing:0;padding:9px 14px}
.fchip.on{background:var(--ink);border-color:var(--ink)}
.qty{border-radius:12px;overflow:hidden}
.tier{border-radius:16px}
.modal{border-radius:24px 24px 0 0;border:0;box-shadow:0 -10px 40px rgba(9,25,59,.18)}
@media(min-width:760px){.modal{border-radius:24px}}
.drawer-in{background:#fff;border-left:0;box-shadow:-20px 0 50px rgba(9,25,59,.15)}
.gate{background:radial-gradient(70% 60% at 85% 0%,rgba(120,183,82,.18),transparent 70%),linear-gradient(180deg,#F5F7FA,#fff)}
.gate-card{border-radius:24px;border-color:var(--line);box-shadow:0 24px 60px rgba(9,25,59,.12)}
.foot{background:var(--soft);border-top:0}
.btc-callout,.help-cta{border-radius:22px;box-shadow:0 12px 34px rgba(9,25,59,.06)}
.cookie > div{border-radius:18px}
/* Apparition douce au défilement */
.rv{opacity:0;transform:translateY(18px);transition:opacity .6s ease,transform .6s cubic-bezier(.2,.7,.2,1)}
.rv.in{opacity:1;transform:none}
@media (prefers-reduced-motion: reduce){.rv{opacity:1;transform:none;transition:none}.btn:hover,.pcard:hover{transform:none}}
`;
/* Révèle en douceur les blocs quand ils entrent à l'écran (thème moderne uniquement). */
const useReveal = (on) => {
  useEffect(() => {
    if (!on || typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    const SEL = ".sec .wrap > *:not(.grid):not(.filters), .grid > .pcard, .sheet, .fact, .btc-callout, .help-cta";
    let raf = 0;
    const tag = () => { raf = 0; document.querySelectorAll(SEL).forEach(el => { if (el.classList.contains("rv") || el.closest(".modal, .gate, .drawer, .menu, .cookie")) return; el.classList.add("rv"); io.observe(el); }); };
    tag();
    const mo = new MutationObserver(() => { if (!raf) raf = requestAnimationFrame(tag); });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { mo.disconnect(); io.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, [on]);
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,300;6..72,400;6..72,500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
:root{
  --paper:#F5F3EE; --surface:#FFFFFF; --ink:#0B1B2E; --ink2:#34404F; --mute:#6A7380;
  --line:#DCD7CC; --line2:#EAE6DD; --green:#1E6A43; --green-soft:#E4EEE7; --leaf:#62B94A;
  --serif:'Newsreader',Georgia,serif; --sans:'IBM Plex Sans',system-ui,sans-serif; --mono:'IBM Plex Mono',ui-monospace,monospace;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
/* Langues à mots longs (allemand, néerlandais) : coupure propre avec trait d'union, colonnes jamais plus larges que l'écran. */
h1,h2,h3,.display,.h2,.pcard-name,.hero-prod-name,.lead,.eyebrow,.btn,p{overflow-wrap:break-word;hyphens:auto;-webkit-hyphens:auto}
.hero-grid > *,.grid > *,.facts > *,.wrap > *{min-width:0}
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
.ticker{overflow:hidden;white-space:nowrap;padding:8px 0;position:relative}
.ticker-static{display:none;padding:0 16px;white-space:normal}
.ticker-track{display:inline-flex;animation:nvx-tick 48s linear infinite;will-change:transform}
.ticker:hover .ticker-track{animation-play-state:paused}
.ticker-set{display:inline-flex}
.ticker-item{display:inline-flex;align-items:center;padding:0 22px}
.ticker-item:before{content:"";width:5px;height:5px;border-radius:50%;background:#7FCB68;margin-right:22px;flex-shrink:0}
@keyframes nvx-tick{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@media (prefers-reduced-motion: reduce){.ticker-track{display:none}.ticker-static{display:block}}
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
@media(min-width:1180px){.nav-links{display:flex}.lang,.cur{display:flex}.burger{display:none}}
.nav-links{flex-shrink:0}.nav-links button,.cart-btn{white-space:nowrap}
@media(min-width:1180px) and (max-width:1499px){.nav-links{gap:14px}.nav-links button{font-size:12.5px}.nav-tools{gap:10px}.brand-sub{display:none}.cart-btn{padding:7px 10px}}
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
.hero-stack{position:relative;display:block;width:100%;max-width:560px;height:200px;margin:0 auto;background:none;border:0;padding:0;cursor:pointer}
.hs{position:absolute;bottom:6px;width:31%;aspect-ratio:1/1;border-radius:18px;overflow:hidden;background:#fff;border:3px solid #fff;box-shadow:0 14px 32px rgba(9,25,59,.14);transition:transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .35s ease;animation:nvx-fan .9s cubic-bezier(.2,.8,.2,1) backwards;animation-play-state:paused}
.hero-stack.play .hs{animation-play-state:running}
.hs img{width:100% !important;height:100% !important;object-fit:cover;border-radius:0 !important}
.hs0{left:0;--r:-6deg;--s:.8;--dx:111%;z-index:1;animation-delay:.32s}.hs1{left:17%;--r:-3deg;--s:.9;--dx:56%;z-index:2;animation-delay:.2s}
.hs2{left:34.5%;--r:0deg;--s:1;--dx:0%;z-index:5;animation-delay:.05s}.hs3{right:17%;--r:3deg;--s:.9;--dx:-56%;z-index:2;animation-delay:.2s}.hs4{right:0;--r:6deg;--s:.8;--dx:-111%;z-index:1;animation-delay:.32s}
.hs{transform:rotate(var(--r)) scale(var(--s))}
/* Entrée en scène : les flacons partent du centre et se déploient en éventail, une seule fois, puis restent immobiles. */
@keyframes nvx-fan{from{opacity:0;transform:translateX(var(--dx)) rotate(0deg) scale(.72)}to{opacity:1;transform:rotate(var(--r)) scale(var(--s))}}
@media (hover:hover){.hero-stack .hs:hover{transform:rotate(var(--r)) scale(calc(var(--s) * 1.06)) translateY(-10px);box-shadow:0 26px 50px rgba(9,25,59,.22);z-index:6}}
.hero-vials{padding-top:6px}
@media(max-width:979px){.hero-stack{height:150px}.hero-grid{gap:28px}}
@media(min-width:980px){.hero-vials{margin-top:0}.hero-stack{height:170px;margin:0;max-width:520px}.hero-stack-cap{text-align:left;max-width:520px}}
.hero-stack:hover .hs2{box-shadow:0 24px 50px rgba(9,25,59,.22)}
.hero-stack-cap{margin-top:12px;font-size:13px;color:var(--mute);text-align:center}
.row-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:22px;flex-wrap:wrap}
.best-row{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(230px,1fr);gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:8px;scrollbar-width:none}
.best-row::-webkit-scrollbar{display:none}
.best-row > *{scroll-snap-align:start;border:1px solid var(--line)}
@media(min-width:980px){.best-row{grid-auto-flow:row;grid-template-columns:repeat(4,1fr);overflow:visible}}
@media (prefers-reduced-motion: reduce){.hs{animation:none}}
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
.index-row{display:grid;grid-template-columns:34px minmax(0,1fr) auto;column-gap:14px;row-gap:4px;align-items:baseline;padding:20px 0;border-bottom:1px solid var(--line);cursor:pointer;text-align:left;width:100%;transition:padding .2s}
.index-row > :nth-child(1){grid-column:1;grid-row:1}
.index-row > :nth-child(2){grid-column:2;grid-row:1}
.index-row > :nth-child(4){grid-column:3;grid-row:1;white-space:nowrap}
.index-row:hover{padding-left:8px}
.index-row:hover .index-name{color:var(--green)}
.index-name{font-family:var(--serif);font-size:26px;font-weight:400;letter-spacing:-.01em;line-height:1.2}
.index-desc{font-size:13.5px;color:var(--mute);grid-column:2 / 4;grid-row:2}
.index-name,.index-desc{overflow-wrap:break-word;hyphens:auto;-webkit-hyphens:auto}
@media(min-width:900px){.index-row{grid-template-columns:60px minmax(0,1fr) minmax(0,1fr) auto;row-gap:0}.index-desc{grid-column:3;grid-row:1}.index-row > :nth-child(4){grid-column:4}}

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
.search{display:flex;align-items:center;gap:12px;margin-bottom:16px}
.search input{flex:1;max-width:520px;min-height:46px;padding:0 16px;border:1px solid var(--line);border-radius:12px;background:#fff;font:inherit;font-size:16px;color:var(--ink)}
.search input:focus{outline:none;border-color:var(--green);box-shadow:0 0 0 3px rgba(30,106,67,.12)}
.search-n{font-family:var(--mono);font-size:12px;color:var(--mute)}
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
.gate{position:fixed;inset:0;z-index:100;background:var(--paper);display:flex;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:20px;transition:opacity .35s ease}
.gate-title{font-size:30px;margin-bottom:10px}
.gate-seal{width:40px;height:40px}
@media (max-width:480px){.gate{padding:10px}.gate-card{padding:20px 16px}.gate-title{font-size:23px;margin-bottom:8px}.gate-desc{font-size:12.5px!important;line-height:1.55!important;margin-bottom:14px!important}.gate-seal{width:32px;height:32px}.gate .check{padding:9px 10px;margin-bottom:6px;font-size:12px;line-height:1.45}.gate .field{margin-bottom:10px!important}.gate .field input{padding:10px 12px}.gate-foot{margin-top:10px!important}}
@media (max-width:820px){.field input,.field textarea,.field select{font-size:16px}}
.gate.closing{opacity:0;pointer-events:none}
.hero-prod{display:grid;grid-template-columns:auto minmax(0,1fr);gap:16px;align-items:center;width:100%;margin-top:14px;padding:12px;border:1px solid var(--line);background:var(--paper);cursor:pointer;text-align:left;font:inherit;color:inherit;border-radius:2px;transition:border-color .2s}
.hero-prod:hover{border-color:var(--ink)}
.hero-cta{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}
.btc-callout{display:grid;gap:22px;padding:28px;border:1px solid var(--line);border-radius:20px;background:var(--surface,#fff);align-items:center}
@media(min-width:980px){.btc-callout{grid-template-columns:1.2fr 1fr auto}}
.btc-mini{list-style:none;margin:0;padding:0;display:grid;gap:12px}
.btc-mini li{display:flex;gap:12px;align-items:flex-start;font-size:14.5px;line-height:1.45}
.btc-mini-n{font-family:var(--serif);font-size:26px;line-height:1;color:var(--green);min-width:34px}
@media (min-width:860px){.btc-steps{grid-template-columns:1fr 1fr}.btc-after{grid-template-columns:1fr 1.4fr}}
.buy-btn{flex:1 1 170px;justify-content:center}
.zoom-btn{position:relative;display:block;background:none;border:0;padding:0;cursor:zoom-in;border-radius:14px}
.zoom-hint{position:absolute;right:10px;bottom:10px;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.92);color:var(--ink);display:flex;align-items:center;justify-content:center;font-size:17px;box-shadow:0 4px 12px rgba(9,25,59,.15)}
.zoom{position:fixed;inset:0;z-index:200;background:rgba(9,25,59,.92);display:flex;align-items:center;justify-content:center;padding:calc(16px + env(safe-area-inset-top,0px)) 16px calc(16px + env(safe-area-inset-bottom,0px));cursor:zoom-out;touch-action:pinch-zoom}
.zoom img{max-width:100%;max-height:100%;width:auto;height:auto;border-radius:16px;box-shadow:0 30px 80px rgba(0,0,0,.4);cursor:default}
.zoom-x{position:absolute;top:calc(14px + env(safe-area-inset-top,0px));right:14px;width:44px;height:44px;border-radius:50%;border:0;background:rgba(255,255,255,.95);color:var(--ink);font-size:18px;cursor:pointer}
.mbar{display:none}
@media(max-width:759px){.mbar{display:flex;align-items:center;gap:8px;position:fixed;left:0;right:0;bottom:0;z-index:120;background:rgba(245,243,238,.97);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-top:1px solid var(--line);padding:10px 14px calc(10px + env(safe-area-inset-bottom,0px))}
.mbar .btn{min-height:44px;padding:0 14px}.mbar-info{flex:1;display:flex;flex-direction:column;line-height:1.2}.mbar-info b{font-family:var(--serif);font-weight:400;font-size:20px}.mbar-info span{font-family:var(--mono);font-size:11px;color:var(--mute)}
.modal-body{padding-bottom:96px}}
.help-cta{display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between;margin-top:44px;padding:24px;border:1px solid var(--line);border-radius:16px;background:var(--surface,#fff)}
.tiers{margin-top:22px}
.tiers-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:8px}
.tier{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:3px;padding:12px 12px 10px;border:1px solid var(--line);background:var(--paper);border-radius:12px;cursor:pointer;font:inherit;color:inherit;text-align:left;min-height:44px}
.tier.on{border-color:var(--green);background:#EEF5EF;box-shadow:0 0 0 1px var(--green) inset}
.tier-n{font-weight:600;font-size:14px}
.tier-p{font-family:var(--mono);font-size:12.5px;color:var(--ink2)}
.tier-d{font-family:var(--mono);font-size:11.5px;color:#fff;background:var(--green);padding:2px 7px;border-radius:999px;margin-top:2px}
.tier-pop{position:absolute;top:-9px;right:8px;font-family:var(--mono);font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;background:var(--ink);color:#fff;padding:2px 7px;border-radius:999px}
.saving{margin-top:12px;font-size:13.5px;color:var(--green)}
.pcard-deal{margin-top:4px;font-family:var(--mono);font-size:11px;color:var(--green)}
.ship-note{margin-top:14px;padding:9px 12px;border-radius:8px;background:#FBF3E4;color:#7A4E0E;font-size:13px;line-height:1.45}
.ship-note.ok{background:#EEF5EF;color:var(--green)}
.freebar{margin:8px 0 6px}
.freebar-txt{font-size:12.5px;color:var(--ink2);margin-bottom:6px}
.freebar-track{height:6px;border-radius:6px;background:var(--line);overflow:hidden}
.freebar-track i{display:block;height:100%;background:var(--green);border-radius:6px;transition:width .4s}
.paid-banner{position:sticky;top:0;z-index:60;display:flex;gap:14px;align-items:flex-start;justify-content:space-between;padding:14px 20px;background:#EEF5EF;border-bottom:1px solid var(--green);color:var(--ink);font-size:14px;line-height:1.5}
@media (max-width:480px){.packs{grid-template-columns:repeat(2,minmax(0,1fr))}}
.xsell{display:grid;grid-template-columns:auto auto minmax(0,1fr) auto;gap:12px;align-items:center;margin-top:22px;padding:10px 12px;border:1px solid var(--line);background:var(--paper);cursor:pointer}
.xsell.on{border-color:var(--green);background:#EEF5EF}
.xsell input{accent-color:var(--green);width:18px;height:18px}
.xsell img{width:52px!important;height:52px!important;border-radius:8px!important}
.xsell-txt{display:grid;gap:2px;font-size:14px;color:var(--ink)}
.xsell-price{font-family:var(--mono);font-size:13px;color:var(--ink)}
.added{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:14px;padding:10px 12px;background:#EEF5EF;border:1px solid var(--green);color:var(--green);font-size:13.5px}
.added .link{background:none;border:0;padding:0;cursor:pointer;font:inherit;font-size:13px}
.hero-cta .btn{flex:1 1 170px;justify-content:center;text-align:center;text-decoration:none}
@media (max-width:480px){.hero-prod{gap:12px;padding:10px}.hero-prod img{width:96px!important;height:96px!important}.hero-prod-name{font-size:24px!important}}
@media (max-width:979px){.hero-grid > .sheet{order:-1}.hero-grid > .hero-vials{order:-2}}
@media(min-width:980px){.hero-grid{grid-template-areas:"vials sheet" "text sheet";align-items:start;row-gap:26px}.hero-text{grid-area:text}.hero-grid > .sheet{grid-area:sheet}.hero-vials{grid-area:vials}}

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
.gate-card{max-width:460px;width:100%;margin:auto;border:1px solid var(--line);background:var(--surface);padding:34px 28px}
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
  ...(CONFIG.BTC_ON ? [["bitcoin", "Payer en Bitcoin", "Pay with Bitcoin"]] : []),
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
              {LANGS.map(l => <button key={l} className={lang === l ? "on" : ""} onClick={() => setLang(l)} lang={l.toLowerCase()} aria-label={LANG_NAMES[l]}>{l}</button>)}
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
            <button className="x" onClick={() => setOpen(false)} aria-label={FR ? "Fermer" : "Close"}>✕</button>
          </div>
          {NAV_ITEMS.map(([p, fr, en]) => (
            <button key={p} className="mi" onClick={() => nav(p)}>{FR ? fr : en}</button>
          ))}
          <div className="menu-foot">
            <div className="lang" style={{ display: "flex" }}>
              {LANGS.map(l => <button key={l} className={lang === l ? "on" : ""} onClick={() => setLang(l)} lang={l.toLowerCase()} aria-label={LANG_NAMES[l]}>{l}</button>)}
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
            <button onClick={() => go("learning")}>{FR ? "Fiches composés" : "Compound notes"}</button>
            <button onClick={() => go("about")}>{FR ? "Méthode" : "Method"}</button>
            <button onClick={() => go("shipping")}>{FR ? "Livraison" : "Shipping"}</button>
            {CONFIG.BTC_ON && <button onClick={() => go("bitcoin")}>{FR ? "Payer en Bitcoin" : "Pay with Bitcoin"}</button>}
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
          <span>{CONFIG.BTC_ON ? (FR ? "Paiement direct en Bitcoin · facturé en euros" : "Direct Bitcoin payment · billed in euros") : (FR ? "Paiement sécurisé par Stripe · Visa · Mastercard · Apple Pay" : "Secure payment by Stripe · Visa · Mastercard · Apple Pay")}</span>
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
/* Chiffre qui défile jusqu'à sa valeur quand il apparaît à l'écran (ex. 99,008 % de pureté). */
const CountUp = ({ value, lang }) => {
  const target = parseFloat(value); const dec = (String(value).split(".")[1] || "").length;
  const [v, setV] = useState(value); const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el || isNaN(target)) return;
    if (typeof window === "undefined" || !("IntersectionObserver" in window) || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    let raf = 0; let done = false;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || done) return; done = true; io.disconnect();
      const from = Math.max(0, target - 9), t0 = performance.now(), D = 1400;
      const step = (t) => { const k = Math.min(1, (t - t0) / D); const ease = 1 - Math.pow(1 - k, 3); setV((from + (target - from) * ease).toFixed(dec)); if (k < 1) raf = requestAnimationFrame(step); };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.5 });
    io.observe(el); return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value]);
  return <span ref={ref}>{num(String(v), lang)}</span>;
};

/* Produits mis en avant sur l'accueil (vitrine de flacons + rangée « Les plus demandés »). */
const HERO_STACK = ["bpc157", "ghk", "retatrutide", "tb500", "nad"];
const BESTSELLERS = ["retatrutide", "bpc157", "tb500", "ghk", "slupp322", "semaglutide", "nad", "novalyxformula06"];

/* Photos produits « à la façon d'Apple » : le navigateur choisit la bonne taille (WebP 480 px pour les cartes,
   1200 px pour la fiche et le zoom), et reprend automatiquement la photo JPG d'origine si un fichier WebP manque. */
const webpFor = (jpg, w) => jpg ? jpg.replace(PHOTO_BASE, PHOTO_BASE + "w" + w + "/").replace(/\.jpg$/, ".webp") : "";
const ProductPhoto = ({ p, size, h = 180, eager = false }) => {
  const src = photoFor(p.id, size);
  const [mode, setMode] = useState("webp"); // webp → jpg → vial
  useEffect(() => { setMode("webp"); }, [src]);
  if (!src || mode === "vial") return <Vial name={p.name} size={size} tone={CAT_TONE[p.category]} h={h} />;
  const style = { width: h, height: h, objectFit: "cover", borderRadius: 14, display: "block" };
  const alt = `${p.name} ${size || ""} — Novalyx Research`;
  if (mode === "jpg") return <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" width={h} height={h} onError={() => setMode("vial")} style={style} />;
  return (
    <img src={webpFor(src, h > 240 ? 1200 : 480)} srcSet={`${webpFor(src, 480)} 480w, ${webpFor(src, 1200)} 1200w`} sizes={`${h}px`}
      alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" width={h} height={h} onError={() => setMode("jpg")} style={style} />
  );
};

/* Zoom plein écran sur la photo du flacon (fiche produit). Pincer pour agrandir sur téléphone. */
const PhotoZoom = ({ p, size, onClose, lang }) => {
  const src = photoFor(p.id, size); const [jpg, setJpg] = useState(false);
  useEffect(() => { const k = (e) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  return (
    <div className="zoom" role="dialog" aria-label={lang === "FR" ? "Photo agrandie" : "Enlarged photo"} onClick={onClose}>
      <img src={jpg ? src : webpFor(src, 1200)} onError={() => setJpg(true)} alt={`${p.name} ${size || ""} — Novalyx Research`} onClick={(e) => e.stopPropagation()} />
      <button className="zoom-x" onClick={onClose} aria-label={lang === "FR" ? "Fermer" : "Close"}>✕</button>
    </div>
  );
};

const ProductCard = ({ p, cur, onClick, lang }) => {
  const FR = lang === "FR";
  const min = Math.min(...visVariants(p).map(v => v.price));
  const coa = COAS[p.id];
  const main = visVariants(p).find(v => inStock(p, v.size)) || visVariants(p)[visVariants(p).length - 1];
  return (
    <button className="pcard" onClick={onClick}>
      <div className="pcard-top">
        <span className="tag">{tp(lang, p.category)}</span>
        {coa ? <span className="chip-coa">COA {coa.size}{coa.purity ? ` · ${pct(coa.purity, lang)}` : ""}</span> : !isAvail(p) && <span className="chip-soon">{CONFIG.BTC_ON ? (FR ? "Sur commande" : "Made to order") : (FR ? "Bientôt" : "Soon")}</span>}
      </div>
      <div className="pcard-vial"><ProductPhoto p={p} size={main.size} h={190} /></div>
      <div className="pcard-name">{p.name}</div>
      <div className="pcard-sizes">{visVariants(p).map(v => v.size).join(" · ")} · {FR ? "lyophilisé" : "lyophilised"}</div>
      <div className="pcard-foot">
        <div>
          <div className="tag" style={{ marginBottom: 2 }}>{canBuy(p) ? (FR ? "À partir de" : "From") : (FR ? "Bientôt disponible" : "Coming soon")}</div>
          <div className="pcard-price">{price(min, cur, lang)}</div>
          {CONFIG.BTC_ON && canBuy(p) && <div className="pcard-deal">{FR ? "Jusqu'à −20 % dès 2 flacons" : "Up to −20% from 2 vials"}</div>}
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
const ProductModal = ({ p, cur, onAdd, onOpenCart, onClose, lang }) => {
  const FR = lang === "FR";
  const [qty, setQty] = useState(1);
  const [withBac, setWithBac] = useState(false);
  const [added, setAdded] = useState(false);
  const bac = PRODUCTS.find(x => x.id === "bac-water");
  const bacV = bac && bac.variants.find(x => !/pack/i.test(x.size));
  const [idx, setIdx] = useState(Math.max(0, p.variants.findIndex(x => COAS[p.id] && x.size === COAS[p.id].size)));
  const v = visVariants(p)[idx] || visVariants(p)[0];
  const coa = coaFor(p, v.size);
  const coaOther = !coa && COAS[p.id];
  const showBac = XSELL_BAC && canBuy(p) && p.id !== "bac-water" && !!bac && !!bacV && isAvail(bac);
  const total = lineTotal(v.price, qty, v.size, p.id) + (showBac && withBac ? bacV.price : 0);
  const [zoom, setZoom] = useState(false);
  useEffect(() => { setAdded(false); }, [idx, qty, withBac]);
  useEffect(() => { const m = minQty(p, v.size); if (qty < m) setQty(m); }, [idx]); // eslint-disable-line
  const addAll = (buyNow) => {
    onAdd(p, v, qty, false);
    if (showBac && withBac) onAdd(bac, bacV, 1, false);
    if (buyNow) onOpenCart(); else setAdded(true);
  };
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k); document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-label={p.name}>
        <div className="modal-grid">
          <div className="modal-vial" style={{ flexDirection: "column", gap: 10 }}><button className="zoom-btn" onClick={() => setZoom(true)} aria-label={FR ? "Agrandir la photo" : "Enlarge the photo"}><ProductPhoto p={p} size={v.size} h={300} eager /><span className="zoom-hint" aria-hidden="true">⤢</span></button>{zoom && <PhotoZoom p={p} size={v.size} lang={lang} onClose={() => setZoom(false)} />}<div style={{ fontSize: 11.5, lineHeight: 1.45, color: "var(--mute)", textAlign: "center", maxWidth: 300 }}>{lang === "FR" ? "Visuel du produit. Le numéro de lot figure sur chaque flacon livré." : "Product visual. The batch number is printed on every vial shipped."}</div></div>
          <div className="modal-body">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <span className="tag">{tp(lang, p.category)} · {tp(lang, p.tag)}</span>
              <button className="x" onClick={onClose} aria-label={FR ? "Fermer" : "Close"}>✕</button>
            </div>
            <h2 className="h2" style={{ fontSize: 40, margin: "6px 0 14px" }}>{p.name}</h2>
            <p style={{ color: "var(--ink2)", fontSize: 14.5, lineHeight: 1.75 }}>{FR && p.desc_fr ? p.desc_fr : p.desc}</p>

            <div className="eyebrow" style={{ margin: "26px 0 10px" }}>{FR ? "Conditionnement" : "Size"}</div>
            <div className="sizes">
              {visVariants(p).map((x, i) => (
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
              {p.commonSpecs.map(s => (
                <div className="spec" key={s.label}><span>{tp(lang, s.label)}</span><span>{tp(lang, s.value)}</span></div>
              ))}
            </div>

            {CONFIG.BTC_ON && canBuy(p) && (
              <div className={"ship-note" + (inStock(p, v.size) ? " ok" : "")}>
                {inStock(p, v.size) ? (FR ? "En stock · expédié sous 24 h" : "In stock · ships within 24 h") : (FR ? "Sur commande · 3 à 4 semaines · lot analysé par Janoshik avant expédition · suivi à chaque étape" : "Made to order · 3–4 weeks · batch analysed by Janoshik before shipping · tracked at every step")}
                {!inStock(p, v.size) && minQty(p, v.size) > 1 ? (FR ? ` · format recherche : ${minQty(p, v.size)} flacons minimum (−${Math.round(qtyDiscount(minQty(p, v.size), v.size, p.id, v.price) * 100)} %)` : ` · research format: ${minQty(p, v.size)} vials minimum (−${Math.round(qtyDiscount(minQty(p, v.size), v.size, p.id, v.price) * 100)} %)`) : ""}
                {inStock(p, v.size) && STOCK_LEFT[p.id] ? (FR ? ` · plus que ${STOCK_LEFT[p.id]} flacons du lot analysé` : ` · only ${STOCK_LEFT[p.id]} vials left from the analysed batch`) : ""}
              </div>
            )}
            {showBac && (
              <label className={`xsell${withBac ? " on" : ""}`}>
                <input type="checkbox" checked={withBac} onChange={e => setWithBac(e.target.checked)} />
                <ProductPhoto p={bac} size={bacV.size} h={52} />
                <span className="xsell-txt">
                  <span className="tag">{FR ? "Souvent acheté avec" : "Frequently bought with"}</span>
                  <span>{FR ? "Eau bactériostatique 3 ml" : "Bacteriostatic water 3 ml"}</span>
                </span>
                <span className="xsell-price">+ {price(bacV.price, cur, lang)}</span>
              </label>
            )}
            {CONFIG.BTC_ON && canBuy(p) && !isPackSize(v.size) && (
              <div className="tiers">
                <div className="tag" style={{ marginBottom: 8 }}>{FR ? "Prix dégressif : plus vous en prenez, moins c'est cher" : "Volume pricing: the more you take, the less you pay"}</div>
                <div className="tiers-row">
                  {[1, 2, 3, 5].filter(n => n >= minQty(p, v.size)).map(n => {
                    const d = qtyDiscount(n, v.size, p.id, v.price); const on = qty === n || (n === 5 && qty > 5) || (n === 3 && qty === 4);
                    return (
                      <button key={n} type="button" className={"tier" + (on ? " on" : "")} onClick={() => setQty(n)}>
                        {n === 3 && <span className="tier-pop">{FR ? "Le plus choisi" : "Most popular"}</span>}
                        <span className="tier-n">{n} {FR ? (n > 1 ? "flacons" : "flacon") : (n > 1 ? "vials" : "vial")}</span>
                        <span className="tier-p">{price(Math.round(lineTotal(v.price, n, v.size, p.id) / n * 100) / 100, cur, lang)}{FR ? " / flacon" : " / vial"}</span>
                        {d > 0 && <span className="tier-d">−{Math.round(d * 100)} %</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 26, flexWrap: "wrap" }}>
              {canBuy(p) && <div className="qty">
                <button onClick={() => setQty(Math.max(minQty(p, v.size), qty - 1))} aria-label="-">−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(qty + 1)} aria-label="+">+</button>
              </div>}
              {canBuy(p) ? (
                <>
                  <button className="btn btn-line buy-btn" onClick={() => addAll(false)}>{FR ? "Ajouter au panier" : "Add to cart"}</button>
                  <button className="btn btn-ink buy-btn" onClick={() => addAll(true)}>{FR ? "Acheter maintenant" : "Buy now"} — {price(total, cur, lang)}</button>
                  <div className="mbar" role="region" aria-label={FR ? "Achat rapide" : "Quick buy"}>
                    <div className="mbar-info"><b>{price(total, cur, lang)}</b><span>{v.size}{qty > 1 ? ` · ×${qty}` : ""}</span></div>
                    <button className="btn btn-line" onClick={() => addAll(false)}>{FR ? "Ajouter" : "Add"}</button>
                    <button className="btn btn-ink" onClick={() => addAll(true)}>{FR ? "Acheter" : "Buy"}</button>
                  </div>
                </>
              ) : (
                <a className="btn btn-line" style={{ flex: 1 }} href={`mailto:${CONFIG.EMAIL}?subject=${encodeURIComponent((FR ? "Disponibilité " : "Availability ") + p.name + " " + v.size)}`}>
                  {FR ? "Bientôt disponible — me prévenir" : "Coming soon — notify me"}
                </a>
              )}
            </div>
            {CONFIG.BTC_ON && canBuy(p) && (
              <p style={{ fontSize: 13, marginTop: 12 }}>
                <a href="#" onClick={e => { e.preventDefault(); onClose(); window.dispatchEvent(new CustomEvent("nvx-go", { detail: "bitcoin" })); }}>{FR ? "Paiement en Bitcoin : comment ça marche ? (3 étapes)" : "Bitcoin payment: how does it work? (3 steps)"}</a>
              </p>
            )}
            {CONFIG.BTC_ON && canBuy(p) && qtyDiscount(qty, v.size, p.id, v.price) > 0.0001 && (
              <div className="saving">{FR ? "Vous économisez " : "You save "}<b>{price(Math.round((v.price * qty - lineTotal(v.price, qty, v.size, p.id)) * 100) / 100, cur, lang)}</b>{FR ? ` · au lieu de ${price(v.price * qty, cur, lang)}` : ` · instead of ${price(v.price * qty, cur, lang)}`}</div>
            )}
            {added && (
              <div className="added" role="status">
                <span>✓ {FR ? "Ajouté au panier" : "Added to cart"}</span>
                <span style={{ flex: 1 }} />
                <button className="link" onClick={onClose}>{FR ? "Continuer mes achats" : "Keep shopping"}</button>
                <button className="link" onClick={onOpenCart}>{FR ? "Voir le panier" : "View cart"}</button>
              </div>
            )}
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
  const [btcErr, setBtcErr] = useState("");
  const total = cart.reduce((s, i) => s + lineTotal(i.price, i.qty, i.size, i.id), 0);
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
  const ship = cartShipping(cart, zone, total);
  const grand = Math.round((total + ship) * 100) / 100;
  const euZone = zone === "FR" || zone === "EU";
  const freeLeft = euZone && ship > 0 ? Math.max(0, FREE_SHIP_MIN - total) : 0;
  const allStock = cart.every(i => AVAILABLE.includes(i.id) && (!STOCK_SIZES[i.id] || STOCK_SIZES[i.id].includes(i.size)));
  const payBtc = async () => {
    setLoading(true); setBtcErr("");
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart.map(i => ({ id: i.id, size: i.size, qty: i.qty })), zone, lang }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.url) throw new Error(d.error || "checkout");
      window.location.href = d.url;
    } catch (e) {
      setBtcErr(FR ? "Le paiement Bitcoin est momentanément indisponible. Réessayez dans un instant ou écrivez-nous." : "Bitcoin payment is temporarily unavailable. Please try again shortly or contact us.");
      setLoading(false);
    }
  };
  return (
    <div className="drawer" onClick={onClose}>
      <div className="drawer-in" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div className="h3">{FR ? "Panier" : "Cart"} <span className="mono muted" style={{ fontSize: 13 }}>({count})</span></div>
          <button className="x" onClick={onClose} aria-label={FR ? "Fermer" : "Close"}>✕</button>
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
                    <div className="mono muted" style={{ fontSize: 11.5 }}>{i.size} · {FR ? "Qté" : "Qty"} {i.qty} · {price(lineTotal(i.price, i.qty, i.size, i.id), cur, lang)}{qtyDiscount(i.qty, i.size, i.id, i.price) > 0.0001 && <span style={{ color: "var(--green)" }}> · −{Math.round(qtyDiscount(i.qty, i.size, i.id, i.price) * 100)} %</span>}</div>
                  </div>
                  <button className="x" style={{ width: 28, height: 28, fontSize: 16 }} onClick={() => onRemove(i.lineId)} aria-label={FR ? "Retirer" : "Remove"}>✕</button>
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
              {CONFIG.BTC_ON ? (<>
                <div className="spec"><span>{FR ? "Livraison" : "Shipping"}</span><span>{ship === 0 ? (FR ? "Offerte" : "Free") : price(ship, cur, lang)}</span></div>
                {freeLeft > 0 && (
                  <div className="freebar">
                    <div className="freebar-txt">{FR ? <>Plus que <b>{price(freeLeft, cur, lang)}</b> pour la livraison offerte</> : <>Only <b>{price(freeLeft, cur, lang)}</b> away from free shipping</>}</div>
                    <div className="freebar-track"><i style={{ width: Math.min(100, (total / FREE_SHIP_MIN) * 100) + "%" }} /></div>
                  </div>
                )}
                <div className="spec" style={{ borderBottom: "none" }}><span><b>Total</b></span><span style={{ fontFamily: "var(--serif)", fontSize: 24 }}>{price(grand, cur, lang)}</span></div>
                <p className="muted" style={{ fontSize: 12, margin: "6px 0 14px" }}>
                  {allStock ? (FR ? "En stock · expédié sous 24 h · livraison en 2 à 3 jours en France" : "In stock · ships within 24 h · 2–3 day delivery in France") : (FR ? "Votre panier contient des articles sur commande : 3 à 4 semaines, lot analysé avant expédition, avec un email à chaque étape." : "Your cart contains made-to-order items: 3–4 weeks, batch analysed before shipping, with an email at every step.")}
                </p>
                <label className="check"><input type="checkbox" checked={ok1} onChange={e => setOk1(e.target.checked)} /><span>{t(lang, "cart_confirm")}</span></label>
                <label className="check"><input type="checkbox" checked={ok2} onChange={e => setOk2(e.target.checked)} /><span>{t(lang, "intl_confirm")}</span></label>
                <button className="btn btn-ink" style={{ width: "100%", marginTop: 10 }} disabled={!ready} onClick={payBtc}>
                  {loading ? (FR ? "Création de la facture…" : "Creating invoice…") : <>{FR ? "Payer en Bitcoin" : "Pay with Bitcoin"} — {price(grand, "EUR", lang)}</>}
                </button>
                {btcErr && <p role="alert" style={{ color: "#9B2C2C", fontSize: 12.5, marginTop: 10, lineHeight: 1.5 }}>{btcErr}</p>}
                <p className="mono muted" style={{ fontSize: 10.5, textAlign: "center", marginTop: 12, letterSpacing: ".05em" }}>
                  {FR ? "PAIEMENT BITCOIN DIRECT · FACTURÉ EN EUROS · FACTURE VALABLE 60 MIN" : "DIRECT BITCOIN PAYMENT · BILLED IN EUROS · INVOICE VALID 60 MIN"}
                </p>
                <p style={{ textAlign: "center", fontSize: 13, marginTop: 8 }}>
                  <a href="#" onClick={e => { e.preventDefault(); onClose(); window.dispatchEvent(new CustomEvent("nvx-go", { detail: "bitcoin" })); }}>{FR ? "Première fois ? Comment payer en Bitcoin" : "First time? How to pay with Bitcoin"}</a>
                </p>
              </>) : (<>
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
              </>)}
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
  // L'éventail de flacons ne se joue que lorsque l'accueil est vraiment visible (page d'accès refermée, vitrine à l'écran).
  const stackRef = useRef(null);
  useEffect(() => {
    const el = stackRef.current; if (!el) return;
    let seen = false; const io = "IntersectionObserver" in window ? new IntersectionObserver(([e]) => { seen = e.isIntersecting; }, { threshold: 0.4 }) : null;
    if (io) io.observe(el); else seen = true;
    const play = () => el.classList.add("play");
    const t = setInterval(() => { if (seen && !document.querySelector(".gate")) { clearInterval(t); setTimeout(play, 120); } }, 120);
    const safety = setTimeout(() => { clearInterval(t); play(); }, 15000);
    return () => { clearInterval(t); clearTimeout(safety); if (io) io.disconnect(); };
  }, []);
  const heroP = PRODUCTS.find(p => p.id === "retatrutide");
  const heroMin = heroP ? Math.min(...heroP.variants.map(v => v.price)) : 0;
  const withCoa = PRODUCTS.filter(p => COAS[p.id]);
  const cats = CATEGORY_ORDER.filter(c => PRODUCTS.some(p => p.category === c));
  return (
    <div>
      {/* HERO */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-vials">
            <button ref={stackRef} className="hero-stack" onClick={() => go("products", "All")} aria-label={FR ? "Voir tout le catalogue" : "View the whole catalogue"}>
              {HERO_STACK.map((id, i) => { const sp = PRODUCTS.find(x => x.id === id); return sp ? <span key={id} className={"hs hs" + i}><ProductPhoto p={sp} size={visVariants(sp)[0].size} h={200} /></span> : null; })}
            </button>
            <div className="hero-stack-cap">{FR ? `${PRODUCTS.length} composés lyophilisés · un rapport d'analyse par lot` : `${PRODUCTS.length} lyophilised compounds · one analysis report per batch`}</div>
          </div>
          <div className="hero-text">
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div className="eyebrow" style={{ color: "var(--green)" }}>{FR ? "Produit analysé · lot publié" : "Analysed product · published batch"}</div>
              <div className="mono muted" style={{ fontSize: 11 }}>#{hero.task}</div>
            </div>
            {heroP && (
              <button className="hero-prod" onClick={() => openProduct(heroP)} aria-label={FR ? "Voir le produit GLP-3RT 5 mg" : "View GLP-3RT 5 mg"}>
                <ProductPhoto p={heroP} size={hero.size} h={124} eager />
                <div>
                  <div className="hero-prod-name" style={{ fontFamily: "var(--serif)", fontSize: 30, lineHeight: 1.05, whiteSpace: "nowrap" }}>GLP-3RT 5 mg</div>
                  <div className="mono muted" style={{ fontSize: 11.5, marginTop: 5 }}>{FR ? "Peptide lyophilisé · usage recherche" : "Lyophilised peptide · research use"}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    <span className="tag">{FR ? "À partir de" : "From"}</span>
                    <span className="pcard-price">{price(heroMin, cur, lang)}</span>
                  </div>
                </div>
              </button>
            )}
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: "20px 0 8px" }}>
              <span className="big-num">{hero.purity ? <CountUp value={hero.purity} lang={lang} /> : "—"}</span>
              <span className="mono" style={{ fontSize: 14 }}>% {FR ? "pureté HPLC" : "HPLC purity"}</span>
            </div>
            <div className="sheet-row"><span>{FR ? "Quantité mesurée" : "Measured content"}</span><span>{num(hero.measured, lang)} / 5 mg</span></div>
            <div className="sheet-row"><span>{FR ? "Laboratoire" : "Laboratory"}</span><span>Janoshik Analytical</span></div>
            <div className="sheet-row"><span>{FR ? "Lot" : "Batch"}</span><span>{hero.batch}</span></div>
            <div className="sheet-row"><span>{FR ? "Date" : "Date"}</span><span>{fmtDate(hero.date, lang)}</span></div>
            <div className="sheet-row"><span>{FR ? "Clé de vérification" : "Verification key"}</span><span>{hero.key}</span></div>
            <div className="hero-cta">
              {heroP && <button className="btn btn-ink" onClick={() => openProduct(heroP)}>{FR ? "Voir le produit" : "View product"} →</button>}
              <a className="btn btn-line" href={coaLink(hero)} target="_blank" rel="noopener noreferrer">{FR ? "Vérifier sur Janoshik" : "Verify on Janoshik"} ↗</a>
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
            [FR ? "Paiement" : "Payment", CONFIG.BTC_ON ? (FR ? "Bitcoin, facturé en euros" : "Bitcoin, billed in euros") : (FR ? "Stripe, carte bancaire" : "Stripe, card")],
            [FR ? "Expédition" : "Shipping", CONFIG.BTC_ON ? (FR ? "En stock : 24 h · sur commande : 3 à 4 semaines" : "In stock: 24 h · made to order: 3–4 weeks") : (FR ? "Sous 24 h, suivie, emballage neutre" : "Within 24 h, tracked, plain packaging")],
          ].map(([k, v]) => <div className="fact" key={k}><div className="fact-k">{k}</div><div className="fact-v">{v}</div></div>)}
        </div>
      </div>

      {/* LES PLUS DEMANDÉS */}
      <section className="sec" style={{ paddingTop: 48, paddingBottom: 8 }}>
        <div className="wrap">
          <div className="row-head">
            <div>
              <div className="eyebrow">{FR ? "Les plus demandés" : "Most requested"}</div>
              <h2 className="h2" style={{ fontSize: "clamp(26px,4vw,38px)", marginTop: 8 }}>{FR ? "Commencez par l'essentiel." : "Start with the essentials."}</h2>
            </div>
            <button className="link" onClick={() => go("products", "All")}>{FR ? "Tout le catalogue" : "Full catalogue"} →</button>
          </div>
          <div className="best-row">
            {BESTSELLERS.map(id => PRODUCTS.find(x => x.id === id)).filter(Boolean).map(bp => <ProductCard key={bp.id} p={bp} cur={cur} lang={lang} onClick={() => openProduct(bp)} />)}
          </div>
        </div>
      </section>

      {CONFIG.BTC_ON && (
        <section className="sec" style={{ paddingTop: 34, paddingBottom: 10 }}>
          <div className="wrap">
            <div className="btc-callout">
              <div>
                <div className="eyebrow" style={{ color: "var(--green)" }}>{FR ? "Paiement Bitcoin" : "Bitcoin payment"}</div>
                <h2 className="h2" style={{ fontSize: "clamp(26px,4vw,38px)", margin: "8px 0 10px" }}>{FR ? "Payer en Bitcoin, plus simple qu'il n'y paraît." : "Paying with Bitcoin is easier than it sounds."}</h2>
                <p className="muted" style={{ fontSize: 15, lineHeight: 1.6, maxWidth: 560 }}>{FR ? "Si vous savez faire un achat en ligne, vous savez payer en Bitcoin : 10 minutes la première fois, 2 minutes ensuite. Le montant est toujours calculé en euros." : "If you can shop online, you can pay with Bitcoin: 10 minutes the first time, 2 minutes after that. The amount is always calculated in euros."}</p>
              </div>
              <ol className="btc-mini">
                {(FR ? [["01", "Achetez du Bitcoin", "Revolut, Kraken ou Coinbase"], ["02", "Passez commande", "une facture avec QR code s'affiche"], ["03", "Envoyez le paiement", "scannez, vérifiez, validez"]]
                     : [["01", "Buy Bitcoin", "Revolut, Kraken or Coinbase"], ["02", "Place your order", "an invoice with a QR code appears"], ["03", "Send the payment", "scan, check, confirm"]]).map(([n, t, d]) => (
                  <li key={n}><span className="btc-mini-n">{n}</span><span><b>{t}</b><br /><span className="muted">{d}</span></span></li>
                ))}
              </ol>
              <button className="btn btn-ink" onClick={() => go("bitcoin")}>{FR ? "Voir le guide en 3 étapes" : "See the 3-step guide"} →</button>
            </div>
          </div>
        </section>
      )}

      {/* METHOD */}
      <section className="sec">
        <div className="wrap">
          <SecHead n="01" label={FR ? "Méthode" : "Method"} title={FR ? "Quatre étapes, aucune zone d'ombre." : "Four steps, nothing hidden."}>
            {FR ? "La confiance ne se décrète pas, elle se documente. Voici exactement ce qui se passe entre la production et votre laboratoire." : "Trust isn't claimed, it's documented. Here is exactly what happens between production and your laboratory."}
          </SecHead>
          <div className="steps">
            {(FR ? [
              ["01", "Sélection du lot", "Chaque lot est sélectionné auprès de notre fabricant partenaire, avec son certificat d'analyse."],
              ["02", "Analyse indépendante", "Un échantillon est envoyé à Janoshik Analytical : identité, pureté HPLC, quantité mesurée."],
              ["03", "Publication", "Le rapport et sa clé de vérification sont publiés. Tout le monde peut le contrôler."],
              ["04", "Expédition", "Flacons lyophilisés, étiquetés, scellés, envoi suivi. Les produits sans rapport publié sont signalés « analyse à venir »."],
            ] : [
              ["01", "Batch selection", "Each batch is selected from our manufacturing partner, with its certificate of analysis."],
              ["02", "Independent analysis", "A sample goes to Janoshik Analytical: identity, HPLC purity, measured content."],
              ["03", "Publication", "The report and its verification key are published. Anyone can check it."],
              ["04", "Dispatch", "Lyophilised, labelled, sealed vials, tracked shipping. Products without a published report are marked “analysis pending”."],
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
                  <span className="index-desc">{CAT_DESC[c] ? CAT_DESC[c][FR ? 0 : 1] : ""}</span>
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

/* ─── ADRESSES DES PAGES ─────────────────────────────────────
   Une adresse par page (/payer-en-bitcoin, /catalogue…) et par produit (/produit/bpc157) :
   un lien copié ouvre directement la bonne page. Actif uniquement sur le vrai domaine (et en test local). */
const ROUTES = { home: "/", products: "/catalogue", coa: "/analyses", learning: "/fiches-composes", about: "/methode", faq: "/faq",
  ambassador: "/ambassadeurs", contact: "/contact", shipping: "/livraison", privacy: "/confidentialite", terms: "/cgv",
  disclaimer: "/avertissement", bitcoin: "/payer-en-bitcoin" };
const ROUTING_OK = typeof window !== "undefined" && /(^|\.)novalyxresearch\.com$|\.vercel\.app$|^localhost$|^127\.0\.0\.1$/.test(window.location.hostname);
const parsePath = (path) => {
  const clean = (path || "/").replace(/\/+$/, "") || "/";
  const m = clean.match(/^\/produit\/([^/]+)$/);
  if (m) { const prod = PRODUCTS.find(x => x.id === decodeURIComponent(m[1])); return { page: "products", product: prod || null }; }
  const page = Object.keys(ROUTES).find(k => ROUTES[k] === clean);
  return { page: page || "home", product: null };
};
const pushPath = (path, replace, state) => {
  if (!ROUTING_OK || window.location.pathname === path) return;
  try { window.history[replace ? "replaceState" : "pushState"](state || { nvx: 1 }, "", path); } catch (e) {}
};

const ProductsPage = ({ cur, openProduct, initialFilter, setProductFilter, lang }) => {
  const FR = lang === "FR";
  const [filter, setFilter] = useState(initialFilter || "All");
  useEffect(() => { if (initialFilter) setFilter(initialFilter); }, [initialFilter]);
  const change = (f) => { setFilter(f); setProductFilter && setProductFilter(f); };
  const cats = CATEGORY_ORDER.filter(c => PRODUCTS.some(p => p.category === c));
  const [q, setQ] = useState("");
  const norm = (t) => (t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
  const nq = norm(q);
  const base = filter === "All" ? cats.flatMap(c => PRODUCTS.filter(p => p.category === c)) : PRODUCTS.filter(p => p.category === filter);
  const list = nq ? cats.flatMap(c => PRODUCTS.filter(p => p.category === c)).filter(p => norm(p.name + " " + p.id + " " + p.tag + " " + ((BOT_KB[p.id] || {}).aliases || []).join(" ") + " " + (((BOT_KB[p.id] || {})[FR ? "fr" : "en"] || [])[0] || "")).includes(nq)) : base;
  return (
    <section className="sec" style={{ paddingTop: 56 }}>
      <div className="wrap">
        <div className="eyebrow" style={{ marginBottom: 14 }}>{FR ? "Catalogue de recherche" : "Research catalogue"}</div>
        <h1 className="display" style={{ fontSize: "clamp(38px,6vw,64px)", marginBottom: 18 }}>{filter === "All" ? (FR ? "Tous les composés" : "All compounds") : tp(lang, filter)}</h1>
        <p className="lead" style={{ marginBottom: 36 }}>{FR ? "Peptides lyophilisés, fournis exclusivement pour la recherche in-vitro. Les rapports d'analyse publiés sont signalés par la mention COA." : "Lyophilised peptides supplied exclusively for in-vitro research. Published analysis reports are marked COA."}</p>
        <div className="search">
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={FR ? "Rechercher un composé (ex. BPC-157, Semax…)" : "Search a compound (e.g. BPC-157, Semax…)"} aria-label={FR ? "Rechercher un composé" : "Search a compound"} />
          {q && <span className="search-n">{list.length} {FR ? (list.length > 1 ? "résultats" : "résultat") : (list.length === 1 ? "result" : "results")}</span>}
        </div>
        {!nq && <div className="filters">
          <button className={`fchip ${filter === "All" ? "on" : ""}`} onClick={() => change("All")}>{FR ? "Tout" : "All"} ({PRODUCTS.length})</button>
          {cats.map(c => (
            <button key={c} className={`fchip ${filter === c ? "on" : ""}`} onClick={() => change(c)}>
              {tp(lang, c)} ({PRODUCTS.filter(p => p.category === c).length})
            </button>
          ))}
        </div>}
        {nq && list.length === 0 && <p className="muted" style={{ margin: "10px 0 30px" }}>{FR ? "Aucun composé ne correspond. Essayez un autre nom, ou écrivez-nous." : "No compound matches. Try another name, or write to us."}</p>}
        <div className="grid">
          {list.map(p => <ProductCard key={p.id} p={p} cur={cur} lang={lang} onClick={() => openProduct(p)} />)}
        </div>
      </div>
    </section>
  );
};
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
const LearningPage = ({ lang, openProduct }) => {
  const FR = lang === "FR";
  const [cat, setCat] = useState("All");
  // Une fiche par produit du catalogue, générée à partir des fiches scientifiques de l'assistant (BOT_KB) :
  // tout nouveau produit apparaît ici automatiquement.
  const items = PRODUCTS.filter(p => BOT_KB[p.id]).map(p => ({ p, kb: BOT_KB[p.id] }));
  const cats = CATEGORY_ORDER.filter(c => items.some(i => i.p.category === c));
  const shown = cat === "All" ? items : items.filter(i => i.p.category === cat);
  return (
    <section className="sec" style={{ paddingTop: 56 }}>
      <div className="wrap">
        <div className="eyebrow" style={{ marginBottom: 14 }}>{FR ? "Ressources" : "Resources"}</div>
        <h1 className="display" style={{ fontSize: "clamp(38px,6vw,64px)", marginBottom: 18 }}>{FR ? "Fiches composés" : "Compound notes"}</h1>
        <p className="lead" style={{ marginBottom: 28 }}>{FR ? `Informations factuelles et strictement scientifiques sur les ${items.length} composés du catalogue : nature de la molécule et statut réglementaire. Aucune allégation de santé.` : `Factual, strictly scientific information on the ${items.length} compounds in the catalogue: what each molecule is and its regulatory status. No health claims.`}</p>
        <div className="filters" style={{ marginBottom: 28 }}>
          {["All", ...cats].map(c => (
            <button key={c} className={"fchip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>
              {c === "All" ? (FR ? "Tous" : "All") : tp(lang, c)} ({c === "All" ? items.length : items.filter(i => i.p.category === c).length})
            </button>
          ))}
        </div>
        <div className="grid">
          {shown.map(({ p, kb }) => {
            const [nature, status] = FR ? kb.fr : kb.en;
            return (
              <div key={p.id} className="pcard" style={{ cursor: "default", display: "flex", flexDirection: "column" }}>
                <span className="tag">{tp(lang, p.category)}</span>
                <div className="pcard-name" style={{ margin: "14px 0 10px" }}>{p.name}</div>
                <p style={{ fontSize: 14, color: "var(--ink2)", lineHeight: 1.7, margin: 0 }}>{nature}</p>
                {status && <p style={{ fontSize: 12.5, color: "var(--mute)", lineHeight: 1.6, margin: "12px 0 0" }}><b>{FR ? "Statut : " : "Status: "}</b>{status}</p>}
                {openProduct && <button className="link" style={{ marginTop: "auto", paddingTop: 16, alignSelf: "flex-start" }} onClick={() => openProduct(p)}>{FR ? "Voir le produit" : "View product"} →</button>}
              </div>
            );
          })}
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
const FAQPage = ({ lang, go }) => {
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
  if (CONFIG.BTC_ON) {
    const fix = (qStart, a) => { const i = faqs.findIndex(([q]) => q.startsWith(qStart)); if (i >= 0) faqs[i] = [faqs[i][0], a]; };
    if (FR) {
      fix("Quel est le délai", "Produits en stock : expédiés sous 24 h après confirmation du paiement, livrés en 2 à 3 jours en France. Produits sur commande : 3 à 4 semaines, car le lot est d'abord reçu puis analysé par Janoshik avant de vous être expédié. Vous recevez un email à chaque étape, puis votre numéro de suivi.");
      fix("Comment payer", "Uniquement en Bitcoin, directement depuis le panier. Le montant est calculé en euros et la facture reste valable 60 minutes. Première fois ? Notre page « Payer en Bitcoin » explique tout en 3 étapes (Revolut, Kraken ou Coinbase).");
      faqs.splice(5, 0,
        ["Que signifie « sur commande » ?", "Le produit est commandé auprès de notre fabricant dès votre paiement. À réception, nous envoyons un échantillon de ce lot chez Janoshik : votre flacon ne part qu'une fois l'analyse validée. Délai total : 3 à 4 semaines."],
        ["Pourquoi un minimum de flacons sur certains produits ?", "Pour les produits sur commande, chaque lot est acheté et analysé spécialement. Le minimum (2 à 4 flacons selon le produit) permet de lancer ce lot ; il vous fait aussi bénéficier automatiquement de nos remises par quantité (−10 à −20 %)."],
        ["Comment suivre ma commande ?", "Vous recevez un email à chaque étape : commande reçue, commandée auprès du fabricant, lot en analyse chez Janoshik, analyse validée (avec le lien du rapport), puis expédition avec votre numéro de suivi."]);
    } else {
      fix("How long is delivery", "In-stock products ship within 24 h of payment confirmation and arrive in 2–3 days in France. Made-to-order products take 3–4 weeks: the batch is received, then analysed by Janoshik before it ships to you. You get an email at every step, then your tracking number.");
      fix("How do I pay", "Bitcoin only, straight from the cart. The amount is calculated in euros and the invoice is valid for 60 minutes. First time? Our \"Pay with Bitcoin\" page explains everything in 3 steps (Revolut, Kraken or Coinbase).");
      faqs.splice(5, 0,
        ["What does \"made to order\" mean?", "The product is ordered from our manufacturer as soon as you pay. On arrival, we send a sample of that batch to Janoshik: your vial only ships once the analysis is approved. Total time: 3–4 weeks."],
        ["Why is there a minimum on some products?", "Made-to-order products are bought and analysed batch by batch. The minimum (2 to 4 vials depending on the product) lets us launch that batch, and automatically gives you our quantity discounts (−10 to −20%)."],
        ["How do I track my order?", "You receive an email at every step: order received, ordered from the manufacturer, batch under analysis at Janoshik, analysis approved (with the report link), then shipped with your tracking number."]);
    }
  }
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
        {go && (
          <div className="help-cta">
            <div>
              <div className="pcard-name" style={{ margin: 0 }}>{FR ? "Une autre question ?" : "Another question?"}</div>
              <p className="muted" style={{ margin: "6px 0 0", fontSize: 14.5 }}>{FR ? "Écrivez-nous : réponse sous un jour ouvré." : "Write to us: reply within one business day."}</p>
            </div>
            <button className="btn btn-ink" onClick={() => go("contact")}>{FR ? "Nous contacter" : "Contact us"}</button>
          </div>
        )}
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

          {!CONFIG.BTC_ON && (
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
          )}
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
  novalyxformula08semaxselank: K(["formula 08", "formule 08", "semax selank", "semax + selank", "selank semax"],
    ["Mélange de deux heptapeptides : le Semax, analogue du fragment ACTH(4-10), et le Selank, analogue de la tuftsine. Chacun est étudié pour ses effets sur la neuromodulation.",
     "Le Semax et le Selank sont autorisés comme médicaments en Russie (voie nasale) ; ni l'un ni l'autre n'est autorisé dans l'Union européenne ou aux États-Unis."],
    ["Blend of two heptapeptides: Semax, an analogue of the ACTH(4-10) fragment, and Selank, an analogue of tuftsin. Each is studied for its neuromodulatory effects.",
     "Semax and Selank are authorised as medicines in Russia (nasal route); neither is authorised in the European Union or the United States."]),
  novalyxformula09glp3rtcagri: K(["formula 09", "formule 09", "glp-3rt cagrilintide", "retatrutide cagrilintide", "reta cagri"],
    ["Mélange de GLP-3RT (agoniste des récepteurs GLP-1, GIP et glucagon) et de cagrilintide (analogue de l'amyline à longue durée d'action), deux molécules en développement clinique.",
     "Les deux composants sont des molécules expérimentales, non autorisées comme médicaments."],
    ["Blend of GLP-3RT (GLP-1, GIP and glucagon receptor agonist) and cagrilintide (long-acting amylin analogue), two molecules in clinical development.",
     "Both components are investigational molecules, not authorised as medicines."]),
  dihexa: K(["dihexa", "pnb-0408"],
    ["Petit peptide dérivé de l'angiotensine IV, étudié dans des modèles précliniques pour son action sur la voie HGF/c-Met et la formation de synapses.",
     "Composé de recherche préclinique ; aucune autorisation de médicament."],
    ["Small peptide derived from angiotensin IV, studied in preclinical models for its action on the HGF/c-Met pathway and synapse formation.",
     "Preclinical research compound; no medicine authorisation."]),
  pe2228: K(["pe-22-28", "pe 22-28", "pe2228", "pe 22 28"],
    ["Peptide de 7 acides aminés dérivé de la spadine, étudié chez l'animal comme inhibiteur du canal potassique TREK-1.",
     "Composé de recherche préclinique ; aucune autorisation de médicament."],
    ["7-amino-acid peptide derived from spadin, studied in animals as an inhibitor of the TREK-1 potassium channel.",
     "Preclinical research compound; no medicine authorisation."]),
  adamax: K(["adamax", "adamantyl semax", "adamantyl-semax"],
    ["Dérivé synthétique du Semax portant un groupement adamantane. La littérature scientifique indépendante à son sujet est encore très limitée.",
     "Aucune autorisation de médicament, dans aucun pays ; pas de données cliniques publiées."],
    ["Synthetic derivative of Semax carrying an adamantane group. Independent scientific literature on it is still very limited.",
     "No medicine authorisation in any country; no published clinical data."]),
  nasemaxamidate: K(["na-semax", "na semax", "n-acetyl semax", "na-semax amidate", "semax amidate"],
    ["Variante du Semax acétylée à une extrémité (N-acétyl) et amidée à l'autre, modifications destinées à le rendre plus stable. Peu d'études indépendantes publiées.",
     "Aucune autorisation de médicament."],
    ["Semax variant acetylated at one end (N-acetyl) and amidated at the other, modifications intended to make it more stable. Few independent published studies.",
     "No medicine authorisation."]),
  naselankamidate: K(["na-selank", "na selank", "n-acetyl selank", "na-selank amidate", "selank amidate"],
    ["Variante du Selank acétylée à une extrémité (N-acétyl) et amidée à l'autre, modifications destinées à le rendre plus stable. Peu d'études indépendantes publiées.",
     "Aucune autorisation de médicament."],
    ["Selank variant acetylated at one end (N-acetyl) and amidated at the other, modifications intended to make it more stable. Few independent published studies.",
     "No medicine authorisation."]),
  cardiogen: K(["cardiogen", "ala-glu-asp-arg"],
    ["Peptide court synthétique (Ala-Glu-Asp-Arg) issu des travaux de V. Khavinson sur les « biorégulateurs » (Institut de biorégulation et de gérontologie de Saint-Pétersbourg), étudié en lien avec le tissu cardiaque. Les données publiées proviennent surtout de cette équipe.",
     "Aucune autorisation de médicament dans l'Union européenne ni aux États-Unis."],
    ["Short synthetic peptide (Ala-Glu-Asp-Arg) from V. Khavinson's work on \"bioregulators\" (St Petersburg Institute of Bioregulation and Gerontology), studied in relation to heart tissue. Published data come mostly from this team.",
     "No medicine authorisation in the European Union or the United States."]),
  cortagen: K(["cortagen", "ala-glu-asp-pro"],
    ["Peptide court synthétique (Ala-Glu-Asp-Pro) issu des travaux de V. Khavinson sur les « biorégulateurs » (Institut de biorégulation et de gérontologie de Saint-Pétersbourg), étudié en lien avec le tissu cérébral. Les données publiées proviennent surtout de cette équipe.",
     "Aucune autorisation de médicament dans l'Union européenne ni aux États-Unis."],
    ["Short synthetic peptide (Ala-Glu-Asp-Pro) from V. Khavinson's work on \"bioregulators\" (St Petersburg Institute of Bioregulation and Gerontology), studied in relation to brain tissue. Published data come mostly from this team.",
     "No medicine authorisation in the European Union or the United States."]),
  pancragen: K(["pancragen", "lys-glu-asp-trp"],
    ["Peptide court synthétique (Lys-Glu-Asp-Trp) issu des travaux de V. Khavinson sur les « biorégulateurs » (Institut de biorégulation et de gérontologie de Saint-Pétersbourg), étudié en lien avec le tissu pancréatique. Les données publiées proviennent surtout de cette équipe.",
     "Aucune autorisation de médicament dans l'Union européenne ni aux États-Unis."],
    ["Short synthetic peptide (Lys-Glu-Asp-Trp) from V. Khavinson's work on \"bioregulators\" (St Petersburg Institute of Bioregulation and Gerontology), studied in relation to pancreas tissue. Published data come mostly from this team.",
     "No medicine authorisation in the European Union or the United States."]),
  cartalax: K(["cartalax", "ala-glu-asp"],
    ["Peptide court synthétique (Ala-Glu-Asp) issu des travaux de V. Khavinson sur les « biorégulateurs » (Institut de biorégulation et de gérontologie de Saint-Pétersbourg), étudié en lien avec le tissu cartilagineux. Les données publiées proviennent surtout de cette équipe.",
     "Aucune autorisation de médicament dans l'Union européenne ni aux États-Unis."],
    ["Short synthetic peptide (Ala-Glu-Asp) from V. Khavinson's work on \"bioregulators\" (St Petersburg Institute of Bioregulation and Gerontology), studied in relation to cartilage tissue. Published data come mostly from this team.",
     "No medicine authorisation in the European Union or the United States."]),
  chonluten: K(["chonluten", "glu-asp-gly"],
    ["Peptide court synthétique (Glu-Asp-Gly) issu des travaux de V. Khavinson sur les « biorégulateurs » (Institut de biorégulation et de gérontologie de Saint-Pétersbourg), étudié en lien avec le tissu bronchique. Les données publiées proviennent surtout de cette équipe.",
     "Aucune autorisation de médicament dans l'Union européenne ni aux États-Unis."],
    ["Short synthetic peptide (Glu-Asp-Gly) from V. Khavinson's work on \"bioregulators\" (St Petersburg Institute of Bioregulation and Gerontology), studied in relation to bronchi tissue. Published data come mostly from this team.",
     "No medicine authorisation in the European Union or the United States."]),
  ovagen: K(["ovagen", "glu-asp-leu"],
    ["Peptide court synthétique (Glu-Asp-Leu) issu des travaux de V. Khavinson sur les « biorégulateurs » (Institut de biorégulation et de gérontologie de Saint-Pétersbourg), étudié en lien avec le tissu hépatique. Les données publiées proviennent surtout de cette équipe.",
     "Aucune autorisation de médicament dans l'Union européenne ni aux États-Unis."],
    ["Short synthetic peptide (Glu-Asp-Leu) from V. Khavinson's work on \"bioregulators\" (St Petersburg Institute of Bioregulation and Gerontology), studied in relation to liver tissue. Published data come mostly from this team.",
     "No medicine authorisation in the European Union or the United States."]),
  vesugen: K(["vesugen", "lys-glu-asp"],
    ["Peptide court synthétique (Lys-Glu-Asp) issu des travaux de V. Khavinson sur les « biorégulateurs » (Institut de biorégulation et de gérontologie de Saint-Pétersbourg), étudié en lien avec le tissu vasculaire. Les données publiées proviennent surtout de cette équipe.",
     "Aucune autorisation de médicament dans l'Union européenne ni aux États-Unis."],
    ["Short synthetic peptide (Lys-Glu-Asp) from V. Khavinson's work on \"bioregulators\" (St Petersburg Institute of Bioregulation and Gerontology), studied in relation to blood vessels tissue. Published data come mostly from this team.",
     "No medicine authorisation in the European Union or the United States."]),
  testagen: K(["testagen", "lys-glu-asp-gly"],
    ["Peptide court synthétique (Lys-Glu-Asp-Gly) issu des travaux de V. Khavinson sur les « biorégulateurs » (Institut de biorégulation et de gérontologie de Saint-Pétersbourg), étudié en lien avec le tissu testiculaire. Les données publiées proviennent surtout de cette équipe.",
     "Aucune autorisation de médicament dans l'Union européenne ni aux États-Unis."],
    ["Short synthetic peptide (Lys-Glu-Asp-Gly) from V. Khavinson's work on \"bioregulators\" (St Petersburg Institute of Bioregulation and Gerontology), studied in relation to testes tissue. Published data come mostly from this team.",
     "No medicine authorisation in the European Union or the United States."]),
  prostamax: K(["prostamax", "lys-glu-asp-pro"],
    ["Peptide court synthétique (Lys-Glu-Asp-Pro) issu des travaux de V. Khavinson sur les « biorégulateurs » (Institut de biorégulation et de gérontologie de Saint-Pétersbourg), étudié en lien avec le tissu prostatique. Les données publiées proviennent surtout de cette équipe.",
     "Aucune autorisation de médicament dans l'Union européenne ni aux États-Unis."],
    ["Short synthetic peptide (Lys-Glu-Asp-Pro) from V. Khavinson's work on \"bioregulators\" (St Petersburg Institute of Bioregulation and Gerontology), studied in relation to prostate tissue. Published data come mostly from this team.",
     "No medicine authorisation in the European Union or the United States."]),
  foxo4dri: K(["foxo4", "foxo4-dri", "foxo4 dri", "foxo 4"],
    ["Peptide « D-rétro-inverso » conçu pour perturber l'interaction entre les protéines FOXO4 et p53, étudié dans des modèles de cellules sénescentes (recherche dite sénolytique).",
     "Composé de recherche préclinique ; aucune autorisation de médicament."],
    ["\"D-retro-inverso\" peptide designed to disrupt the interaction between the FOXO4 and p53 proteins, studied in senescent-cell models (so-called senolytic research).",
     "Preclinical research compound; no medicine authorisation."]),
  humanin: K(["humanin", "hn"],
    ["Peptide de 24 acides aminés codé par l'ADN mitochondrial, étudié pour ses voies de signalisation cytoprotectrices dans des modèles cellulaires et animaux.",
     "Peptide de recherche ; aucune autorisation de médicament."],
    ["24-amino-acid peptide encoded by mitochondrial DNA, studied for its cytoprotective signalling pathways in cell and animal models.",
     "Research peptide; no medicine authorisation."]),
  aicar: K(["aicar", "acadesine", "acadésine"],
    ["Nucléoside (et non un peptide) utilisé en recherche comme activateur de l'AMPK, une enzyme clé du métabolisme énergétique cellulaire.",
     "Réactif de recherche ; aucune autorisation de médicament. Figure sur la liste des substances interdites de l'Agence mondiale antidopage."],
    ["Nucleoside (not a peptide) used in research as an activator of AMPK, a key enzyme of cellular energy metabolism.",
     "Research reagent; no medicine authorisation. Listed on the World Anti-Doping Agency prohibited list."]),
  cjc1295dac: K(["cjc-1295 dac", "cjc 1295 dac", "cjc with dac", "cjc-1295 with dac", "cjc avec dac"],
    ["Analogue de la GHRH(1-29) muni d'un « DAC » (complexe d'affinité) qui se lie à l'albumine et allonge fortement sa durée d'action. Son développement clinique a été arrêté au milieu des années 2000.",
     "Aucune autorisation de médicament ; développement clinique interrompu."],
    ["GHRH(1-29) analogue fitted with a \"DAC\" (drug affinity complex) that binds albumin and greatly extends its duration of action. Its clinical development was stopped in the mid-2000s.",
     "No medicine authorisation; clinical development discontinued."]),
  pegmgf: K(["peg-mgf", "peg mgf", "pegmgf", "mgf"],
    ["Forme pégylée du peptide MGF (« mechano growth factor »), issu d'un variant d'épissage de l'IGF-1, étudié dans des modèles de cellules musculaires.",
     "Peptide de recherche ; aucune autorisation de médicament."],
    ["PEGylated form of the MGF peptide (\"mechano growth factor\"), derived from an IGF-1 splice variant, studied in muscle-cell models.",
     "Research peptide; no medicine authorisation."]),
  hghfrag176191: K(["hgh fragment", "hgh frag", "fragment 176-191", "frag 176-191", "176-191"],
    ["Fragment C-terminal (acides aminés 176 à 191) de l'hormone de croissance humaine, étudié pour son activité sur le métabolisme des graisses sans les effets de croissance de l'hormone entière. L'AOD-9604 en est une version modifiée.",
     "Peptide de recherche ; aucune autorisation de médicament."],
    ["C-terminal fragment (amino acids 176 to 191) of human growth hormone, studied for its activity on fat metabolism without the growth effects of the whole hormone. AOD-9604 is a modified version of it.",
     "Research peptide; no medicine authorisation."]),
  ace031: K(["ace-031", "ace 031", "ace031", "ramatercept"],
    ["Protéine de fusion (récepteur soluble de l'activine de type IIB couplé à un fragment d'anticorps) qui capte la myostatine et des molécules apparentées. Ses essais cliniques ont été arrêtés en 2011.",
     "Aucune autorisation de médicament ; développement clinique arrêté."],
    ["Fusion protein (soluble activin type IIB receptor coupled to an antibody fragment) that captures myostatin and related molecules. Its clinical trials were stopped in 2011.",
     "No medicine authorisation; clinical development stopped."]),
  eloralintide: K(["eloralintide", "éloralintide"],
    ["Agoniste sélectif du récepteur de l'amyline à longue durée d'action, en développement clinique.",
     "Molécule expérimentale en essais cliniques ; non autorisée comme médicament."],
    ["Long-acting selective amylin receptor agonist, in clinical development.",
     "Investigational molecule in clinical trials; not authorised as a medicine."]),
  adipotide: K(["adipotide", "ftpp"],
    ["Peptidomimétique conçu pour cibler la prohibitine des vaisseaux sanguins du tissu adipeux blanc, étudié chez le rongeur et le primate.",
     "Composé expérimental ; aucune autorisation de médicament."],
    ["Peptidomimetic designed to target prohibitin on the blood vessels of white adipose tissue, studied in rodents and primates.",
     "Experimental compound; no medicine authorisation."]),
  ahkcu: K(["ahk-cu", "ahk cu", "ahkcu", "ahk copper"],
    ["Complexe de cuivre du tripeptide Ala-His-Lys, utilisé comme ingrédient cosmétique et étudié dans des modèles de cellules de la peau et du follicule pileux.",
     "Ingrédient cosmétique ; aucun statut de médicament."],
    ["Copper complex of the tripeptide Ala-His-Lys, used as a cosmetic ingredient and studied in skin and hair-follicle cell models.",
     "Cosmetic ingredient; no medicine status."]),
  matrixyl: K(["matrixyl", "palmitoyl pentapeptide-4", "palmitoyl pentapeptide", "pal-kttks"],
    ["Pentapeptide KTTKS couplé à un acide palmitique, ingrédient cosmétique étudié pour la synthèse du collagène dans des modèles cutanés.",
     "Ingrédient cosmétique ; aucun statut de médicament."],
    ["KTTKS pentapeptide coupled to palmitic acid, a cosmetic ingredient studied for collagen synthesis in skin models.",
     "Cosmetic ingredient; no medicine status."]),
  aceticwater: K(["acetic acid water", "eau acidifiée", "eau acide acétique", "acide acétique", "acetic water"],
    ["Eau stérile contenant 0,6 % d'acide acétique, utilisée comme solvant de reconstitution pour les peptides peu solubles à pH neutre.",
     "Réactif de laboratoire."],
    ["Sterile water containing 0.6% acetic acid, used as a reconstitution solvent for peptides that dissolve poorly at neutral pH.",
     "Laboratory reagent."]),
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
  const sizes = visVariants(p).map((v) => v.size + " : " + price(v.price, cur, lang)).join("\n");
  const avail = isAvail(p)
    ? (lang === "FR" ? "Disponible à l'achat en ligne." : "Available to order online.")
    : CONFIG.BTC_ON
      ? (lang === "FR" ? "Disponible sur commande : 3 à 4 semaines, lot analysé par Janoshik avant expédition, suivi à chaque étape." : "Available to order: 3–4 weeks, batch analysed by Janoshik before shipping, tracked at every step.")
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
  const note = BOT_NOTE[lang] || BOT_NOTE.EN; // allemand et néerlandais : texte anglais traduit à l'affichage
  if (!t) return botGreeting(lang);

  // 1) refus : usage humain / dose / conseil médical
  if (botHas(t, BOT_BLOCK)) return BOT_REFUSE[lang] || BOT_REFUSE.EN;

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
/* ─── Page « Payer en Bitcoin » (affichée quand CONFIG.BTC_ON est vrai) ─── */
const BtcIco = ({ d, c = "var(--green)", s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: d }} />
);
const ICO = {
  bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z"/>',
  eye: '<path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><path d="M4 4l16 16"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  alert: '<path d="M12 4l9 16H3L12 4z"/><path d="M12 10v4.5"/><path d="M12 17.5v.5"/>',
  mail: '<rect x="3.5" y="6" width="17" height="12" rx="2"/><path d="M4 7l8 6 8-6"/>',
};
const BitcoinGuide = ({ lang, go }) => {
  const FR = lang === "FR";
  const T = (fr, en) => (FR ? fr : en);
  const card = { display: "flex", flexDirection: "column", gap: 14, padding: 22, border: "1px solid var(--line)", borderRadius: 18, background: "var(--surface, #fff)" };
  const head = (n, title, dur) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
        <span style={{ fontFamily: "var(--serif)", fontSize: 44, lineHeight: 0.9, color: "var(--green)" }}>{n}</span>
        <span style={{ fontFamily: "var(--serif)", fontSize: 24, lineHeight: 1.15 }}>{title}</span>
      </div>
      <span className="mono" style={{ flexShrink: 0, marginTop: 4, padding: "4px 9px", borderRadius: 999, background: "#E8F1EA", fontSize: 11, color: "var(--green)" }}>{dur}</span>
    </div>
  );
  const p = { fontSize: 15, lineHeight: 1.6, color: "var(--ink2)", margin: 0 };
  const after = FR
    ? [["Paiement envoyé", "depuis votre application"], ["Paiement confirmé", "en général en 10 à 60 minutes"], ["Email de confirmation", "votre commande est validée"],
       ["Produit sur commande ?", "lot reçu puis analysé par Janoshik : un email à chaque étape"], ["Expédition", "avec votre numéro de suivi"]]
    : [["Payment sent", "from your app"], ["Payment confirmed", "usually within 10 to 60 minutes"], ["Confirmation email", "your order is approved"],
       ["Made-to-order product?", "batch received, then analysed by Janoshik: an email at every step"], ["Shipped", "with your tracking number"]];
  const faq = FR ? [
    ["J'ai payé un peu moins, à cause des frais.", "Un petit écart, jusqu'à 1 %, est accepté automatiquement. S'il manque davantage, la facture vous indique le complément à envoyer."],
    ["Ma facture a expiré.", "Repassez simplement la commande. Si vous aviez déjà envoyé le paiement, écrivez-nous avec l'heure de l'envoi : nous le retrouverons."],
    ["Pourquoi le Bitcoin ?", "C'est un paiement direct, sans intermédiaire bancaire. Sur votre relevé de banque n'apparaît que l'achat de Bitcoin chez votre plateforme. Le montant est toujours calculé en euros."],
    ["Combien de temps prend la confirmation ?", "En général de 10 à 60 minutes, selon l'activité du réseau Bitcoin. Vous recevez un email dès que c'est confirmé."],
  ] : [
    ["I paid slightly less because of fees.", "A small difference, up to 1%, is accepted automatically. If more is missing, the invoice shows the remaining amount to send."],
    ["My invoice expired.", "Simply place the order again. If you had already sent the payment, email us with the time it was sent: we will find it."],
    ["Why Bitcoin?", "It's a direct payment with no banking intermediary. Your bank statement only shows the Bitcoin purchase on your platform. The amount is always calculated in euros."],
    ["How long does confirmation take?", "Usually 10 to 60 minutes, depending on Bitcoin network activity. You get an email as soon as it's confirmed."],
  ];
  return (
    <section className="wrap" style={{ padding: "44px 20px 72px", maxWidth: 1120 }}>
      <div className="eyebrow" style={{ color: "var(--green)" }}>{T("Paiement Bitcoin", "Bitcoin payment")}</div>
      <h1 className="display" style={{ fontSize: "clamp(38px,6vw,64px)", margin: "10px 0 0", lineHeight: 1.04 }}>{T("Payer en Bitcoin, en trois étapes.", "Pay with Bitcoin in three steps.")}</h1>
      <p className="lead" style={{ marginTop: 14, maxWidth: 680 }}>{T("Si vous savez faire un achat en ligne, vous savez payer en Bitcoin. Comptez ", "If you can shop online, you can pay with Bitcoin. Allow ")}<b>{T("10 minutes", "10 minutes")}</b>{T(" la première fois, ", " the first time, ")}<b>{T("2 minutes", "2 minutes")}</b>{T(" ensuite.", " after that.")}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
        {[["bolt", T("Paiement direct", "Direct payment")], ["eye", T("Discret", "Discreet")], ["clock", T("Confirmé en 10 à 60 min", "Confirmed in 10–60 min")]].map(([i, t]) => (
          <span key={t} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", border: "1px solid var(--line)", background: "var(--surface, #fff)", borderRadius: 999, fontSize: 13, color: "var(--ink2)" }}><BtcIco d={ICO[i]} s={15} />{t}</span>
        ))}
      </div>
      <div className="btc-steps" style={{ display: "grid", gap: 18, marginTop: 28 }}>
        <div style={card}>
          {head("01", T("Achetez du Bitcoin", "Buy Bitcoin"), "~5 min")}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 18, borderRadius: 14, background: "var(--ink)", color: "#fff" }}>
            <span className="mono" style={{ fontSize: 11, letterSpacing: ".14em", color: "#7FCB68" }}>{T("LE PLUS RAPIDE", "THE FASTEST WAY")}</span>
            <span style={{ fontFamily: "var(--serif)", fontSize: 21 }}>{T("Vous avez Revolut ?", "Got Revolut?")}</span>
            <span style={{ fontSize: 14.5, lineHeight: 1.6, color: "#D6DEE7" }}>{T("Onglet ", "Open the ")}<b style={{ color: "#fff" }}>Crypto</b>{T(", puis ", " tab, then ")}<b style={{ color: "#fff" }}>Bitcoin</b>{T(". Achetez le montant de votre commande, plus 2 à 3 € pour les frais d'envoi.", ". Buy your order amount, plus €2–3 for sending fees.")}</span>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 16px", borderRadius: 12, background: "#FBF3E4", color: "#7A4E0E", fontSize: 14, lineHeight: 1.55 }}>
            <BtcIco d={ICO.alert} c="#7A4E0E" s={18} />
            <span><b>{T("Sinon : Kraken ou Coinbase.", "Otherwise: Kraken or Coinbase.")}</b> {T("À la première inscription, la plateforme vérifie votre identité : de quelques minutes à un jour. Faites-le avant de commander.", "On first sign-up the platform verifies your identity: from a few minutes to a day. Do it before ordering.")}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={card}>
            {head("02", T("Passez votre commande", "Place your order"), "1 min")}
            <p style={p}>{T("Au panier, choisissez ", "In the cart, choose ")}<b style={{ color: "var(--ink)" }}>{T("« Payer en Bitcoin »", "“Pay with Bitcoin”")}</b>{T(". Une facture s'affiche avec un QR code et le montant exact, valable 60 minutes.", ". An invoice appears with a QR code and the exact amount, valid for 60 minutes.")}</p>
          </div>
          <div style={card}>
            {head("03", T("Envoyez le paiement", "Send the payment"), "1 min")}
            <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {(FR ? ["Dans votre appli, touchez « Envoyer » ou « Retirer ».", "Scannez le QR code de la facture.", "Vérifiez que le montant reçu correspond.", "Validez. C'est tout."]
                   : ["In your app, tap “Send” or “Withdraw”.", "Scan the invoice QR code.", "Check that the amount received matches.", "Confirm. That's it."]).map(t => (
                <li key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start", ...p }}><span style={{ marginTop: 3 }}><BtcIco d={ICO.check} s={17} /></span><span>{t}</span></li>
              ))}
            </ol>
          </div>
        </div>
      </div>
      <div className="btc-after" style={{ display: "grid", gap: 34, marginTop: 42 }}>
        <div>
          <h2 className="h3" style={{ fontFamily: "var(--serif)", fontSize: 28, margin: "0 0 16px" }}>{T("Et ensuite ?", "What happens next?")}</h2>
          {after.map(([t, d], i) => (
            <div key={t} style={{ display: "flex", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid var(--green)", background: i < 2 ? "var(--green)" : "var(--surface, #fff)", flexShrink: 0 }} />
                {i < after.length - 1 && <div style={{ width: 2, flexGrow: 1, minHeight: 28, background: "var(--line)" }} />}
              </div>
              <div style={{ paddingBottom: i < after.length - 1 ? 14 : 0 }}><b style={{ display: "block", fontSize: 15 }}>{t}</b><span style={{ fontSize: 13.5, color: "var(--mute)" }}>{d}</span></div>
            </div>
          ))}
        </div>
        <div>
          <h2 className="h3" style={{ fontFamily: "var(--serif)", fontSize: 28, margin: "0 0 10px" }}>{T("Questions fréquentes", "Frequently asked questions")}</h2>
          {faq.map(([q, a], i) => (
            <details key={q} open={i === 0} style={{ borderTop: "1px solid var(--line)", padding: "14px 0" }}>
              <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: 15 }}>{q}</summary>
              <p style={{ ...p, marginTop: 8 }}>{a}</p>
            </details>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 22, borderRadius: 18, background: "#E8F1EA", marginTop: 36, maxWidth: 560 }}>
        <span style={{ fontFamily: "var(--serif)", fontSize: 22 }}>{T("Bloqué à une étape ?", "Stuck at a step?")}</span>
        <p style={p}>{T("Écrivez-nous, nous vous guidons pas à pas, la première fois comme les suivantes.", "Email us and we'll guide you step by step, the first time and every time after.")}</p>
        <a className="btn btn-ink" href={"mailto:" + CONFIG.EMAIL} style={{ justifyContent: "center", textDecoration: "none" }}><BtcIco d={ICO.mail} c="#fff" s={17} />&nbsp;{CONFIG.EMAIL}</a>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}>
        <button className="btn btn-ink" onClick={() => go("products", "All")}>{T("Voir le catalogue", "View catalogue")} →</button>
      </div>
    </section>
  );
};

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
    bitcoin: FR ? ["Payer en Bitcoin | Novalyx Research", "Comment payer votre commande en Bitcoin en trois étapes : acheter du Bitcoin, passer commande, envoyer le paiement. Montant facturé en euros."]
                : ["Pay with Bitcoin | Novalyx Research", "How to pay for your order with Bitcoin in three steps: buy Bitcoin, place your order, send the payment. Billed in euros."],
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
      const c = localStorage.getItem("novalyx_cart"); if (c) setCart(JSON.parse(c).filter(i => CONFIG.BTC_ON || AVAILABLE.includes(i.id)));
      const k = localStorage.getItem("novalyx_currency"); if (k && CURRENCIES[k]) setCur(k);
      const l = localStorage.getItem("novalyx_lang"); if (LANGS.includes(l)) setLang(l);
      if (sessionStorage.getItem("novalyx_gate") === "1") setAgeOk(true);
    } catch (e) {}
  }, []);
  useEffect(() => { try { localStorage.setItem("novalyx_cart", JSON.stringify(cart)); } catch (e) {} }, [cart]);
  useEffect(() => { try { localStorage.setItem("novalyx_currency", cur); } catch (e) {} }, [cur]);
  useEffect(() => { try { localStorage.setItem("novalyx_lang", lang); } catch (e) {} ; document.documentElement.lang = lang.toLowerCase(); }, [lang]);
  useDomTranslate(lang);
  useReveal(CONFIG.THEME === "modern");

  const go = (p, filter) => { setPage(p); setProduct(null); if (filter !== undefined) setProductFilter(filter); pushPath(ROUTES[p] || "/"); window.scrollTo(0, 0); };
  const openProduct = (prod) => { setProduct(prod); if (prod) pushPath("/produit/" + encodeURIComponent(prod.id), false, { nvx: 1, modal: 1 }); };
  // Fermer une fiche ouverte depuis le site = revenir en arrière (pas de doublon dans l'historique) ;
  // fiche ouverte par un lien direct = remplacer l'adresse par celle de la page.
  const closeProduct = () => {
    setProduct(null);
    if (ROUTING_OK && window.history.state && window.history.state.modal) { try { window.history.back(); return; } catch (e) {} }
    pushPath(ROUTES[page] || "/", true);
  };
  // Adresse ouverte directement (lien partagé) + bouton « retour » du navigateur
  useEffect(() => {
    if (!ROUTING_OK) return;
    const apply = () => { const r = parsePath(window.location.pathname); setPage(r.page); setProduct(r.product); };
    apply();
    window.addEventListener("popstate", apply);
    return () => window.removeEventListener("popstate", apply);
  }, []);
  // Lien « Comment payer en Bitcoin » du panier
  useEffect(() => {
    const h = (e) => go(e.detail);
    window.addEventListener("nvx-go", h);
    return () => window.removeEventListener("nvx-go", h);
  }, []);
  // Retour de BTCPay après paiement : ?paid=NVX-XXXXXX
  const [paidRef, setPaidRef] = useState(null);
  useEffect(() => {
    try {
      const ref = new URLSearchParams(window.location.search).get("paid");
      if (ref && /^NVX-[A-Z0-9]{6}$/.test(ref)) {
        setPaidRef(ref); setCart([]);
        window.history.replaceState(null, "", window.location.pathname);
      }
    } catch (e) {}
  }, []);
  const addToCart = (p, v, q = 1, open = true) => {
    if (!canBuy(p)) return;
    const lineId = `${p.id}-${v.size}`;
    setCart(prev => {
      const ex = prev.find(i => i.lineId === lineId);
      if (ex) return prev.map(i => i.lineId === lineId ? { ...i, qty: i.qty + q } : i);
      return [...prev, { lineId, id: p.id, name: p.name, size: v.size, price: v.price, stripeLink: getStripeLink(p.id, v.size), qty: q }];
    });
    if (open) setCartOpen(true);
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
    home: <Home go={go} cur={cur} lang={lang} openProduct={openProduct} />,
    products: <ProductsPage cur={cur} lang={lang} openProduct={openProduct} initialFilter={productFilter} setProductFilter={setProductFilter} />,
    coa: <COAPage lang={lang} openProduct={openProduct} />,
    learning: <LearningPage lang={lang} openProduct={openProduct} />,
    about: <AboutPage go={go} lang={lang} />,
    faq: <FAQPage lang={lang} go={go} />,
    ambassador: <AmbassadorPage lang={lang} />,
    contact: <ContactPage lang={lang} />,
    shipping: <ShippingPage lang={lang} />,
    privacy: <PrivacyPage lang={lang} />,
    terms: <TermsPage lang={lang} />,
    disclaimer: <DisclaimerPage lang={lang} />,
    bitcoin: <BitcoinGuide lang={lang} go={go} />,
  };

  return (
    <div key={lang} style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <style>{CSS}</style>
      {CONFIG.THEME === "modern" && <style>{MODERN_CSS}</style>}
      {paidRef && (
        <div className="paid-banner" role="status">
          <div>
            <b>{lang === "FR" ? "Merci pour votre commande !" : "Thank you for your order!"}</b>
            <span> {lang === "FR" ? `Commande ${paidRef} : votre paiement est en cours de confirmation sur le réseau Bitcoin (10 à 60 minutes). Vous recevrez un email dès que c'est confirmé.` : `Order ${paidRef}: your payment is being confirmed on the Bitcoin network (10 to 60 minutes). You will receive an email once it's confirmed.`}</span>
          </div>
          <button className="x" onClick={() => setPaidRef(null)} aria-label={lang === "FR" ? "Fermer" : "Close"}>✕</button>
        </div>
      )}

      {!ageOk && (
        <div className={`gate${gateClosing ? " closing" : ""}`}>
          <div className="gate-card fade">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div className="gate-seal" style={{ borderRadius: "50%", border: "1.5px solid var(--green)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#1E6A43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="eyebrow">{FR ? "Accès professionnel" : "Professional access"}</div>
            </div>
            <h2 className="h2 gate-title">{FR ? "Réservé à la recherche en laboratoire." : "Reserved for laboratory research."}</h2>
            <p className="muted gate-desc" style={{ fontSize: 13.5, marginBottom: 22, lineHeight: 1.7 }}>{t(lang, "age_desc")}</p>

            <div className="field" style={{ marginBottom: 16 }}>
              <label>{t(lang, "age_org_label")}</label>
              <input type="text" value={gateOrg} onChange={e => setGateOrg(e.target.value)} placeholder={t(lang, "age_org_placeholder")} />
            </div>

            <label className="check"><input type="checkbox" checked={gateAge} onChange={e => setGateAge(e.target.checked)} /><span>{t(lang, "age_check_age")}</span></label>
            <label className="check"><input type="checkbox" checked={gatePro} onChange={e => setGatePro(e.target.checked)} /><span>{t(lang, "age_check_pro")}</span></label>
            <label className="check"><input type="checkbox" checked={gateUse} onChange={e => setGateUse(e.target.checked)} /><span>{t(lang, "age_check_use")}</span></label>

            <button className="btn btn-ink" style={{ width: "100%", marginTop: 8 }} disabled={!gateReady} onClick={enter}>{t(lang, "age_enter")}</button>
            <p className="muted gate-foot" style={{ fontSize: 10, marginTop: 14, lineHeight: 1.6, textAlign: "center" }}>{t(lang, "age_footer")}</p>
            <div className="lang" style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
              {LANGS.map(l => <button key={l} className={lang === l ? "on" : ""} onClick={() => setLang(l)} lang={l.toLowerCase()} aria-label={LANG_NAMES[l]}>{l}</button>)}
            </div>
          </div>
        </div>
      )}

      <div className="notice ticker" role="note" aria-label={FR ? "Produits destinés exclusivement à la recherche en laboratoire, pas pour usage humain ou vétérinaire" : "Products for laboratory research use only, not for human or veterinary use"}>
        <div className="ticker-static">{FR ? "Produits destinés exclusivement à la recherche en laboratoire — pas pour usage humain ou vétérinaire" : "Products for laboratory research use only — not for human or veterinary use"}</div>
        <div className="ticker-track" aria-hidden="true">
          {[0, 1].map(k => (
            <span className="ticker-set" key={k}>
              {(FR ? [
                "Usage recherche uniquement — pas pour usage humain ou vétérinaire",
                "GLP-3RT · lot NLR-2026-001 analysé par Janoshik : 99,008 %",
                "Livraison offerte dès 100 €",
                CONFIG.BTC_ON ? "Jusqu'à −20 % dès 2 flacons" : "Rapports d'analyse vérifiables",
                CONFIG.BTC_ON ? "Paiement Bitcoin, facturé en euros" : "Paiement sécurisé",
                "En stock : expédié sous 24 h",
                "Entreprise française · Paris",
              ] : [
                "Research use only — not for human or veterinary use",
                "GLP-3RT · batch NLR-2026-001 analysed by Janoshik: 99.008%",
                "Free shipping from €100",
                CONFIG.BTC_ON ? "Up to −20% from 2 vials" : "Verifiable analysis reports",
                CONFIG.BTC_ON ? "Bitcoin payment, billed in euros" : "Secure payment",
                "In stock: ships within 24 h",
                "French company · Paris",
              ]).map((m, i) => <span className="ticker-item" key={i}>{m}</span>)}
            </span>
          ))}
        </div>
      </div>
      <Nav page={page} go={go} cur={cur} setCur={setCur} cartCount={cartCount} openCart={() => setCartOpen(true)} lang={lang} setLang={setLang} />
      <main className="fade" key={`${page}-${lang}`}>{pages[page] || pages.home}</main>
      <Footer go={go} lang={lang} onCookies={() => setCookieOpen(true)} />

      {product && <ProductModal p={product} cur={cur} lang={lang} onAdd={addToCart} onOpenCart={() => { closeProduct(); setCartOpen(true); }} onClose={closeProduct} />}
      {cartOpen && <Cart cart={cart} cur={cur} lang={lang} onClose={() => setCartOpen(false)} onRemove={id => setCart(c => c.filter(i => i.lineId !== id))} />}
      {ageOk && consent !== undefined && (consent === null || cookieOpen) && (
        <CookieBanner lang={lang} initial={consent} onSave={saveConsent} go={(p) => { setCookieOpen(false); go(p); }} />
      )}
      {ageOk && consent && !cookieOpen && <Chatbot lang={lang} cur={cur} />}
    </div>
  );
}

/* ─── DICTIONNAIRES DE TRADUCTION (clé = texte anglais affiché) ─── */
/* Dictionnaire allemand : clé = texte anglais affiché (nombres → {#}, noms de produits → {N}). */
const XL_DE = {
"Help": "Hilfe",
"Another question?": "Noch eine Frage?",
"Write to us: reply within one business day.": "Schreiben Sie uns: Antwort innerhalb eines Werktags.",
"Contact us": "Kontakt aufnehmen",
"Add": "Hinzufügen",
"Buy": "Kaufen",
"Quick buy": "Schnellkauf",
"Australia, New Zealand, other countries": "Australien, Neuseeland, andere Länder",
"DIRECT BITCOIN PAYMENT · BILLED IN EUROS · INVOICE VALID {#} MIN": "DIREKTE BITCOIN-ZAHLUNG · ABRECHNUNG IN EURO · RECHNUNG {#} MIN GÜLTIG",
"Delivery country": "Lieferland",
"European Union (excl. France)": "Europäische Union (ohne Frankreich)",
"First time? How to pay with Bitcoin": "Zum ersten Mal? So bezahlen Sie mit Bitcoin",
"I acknowledge this shipment may be subject to customs inspection and I am responsible for compliance with local regulations.": "Ich nehme zur Kenntnis, dass diese Sendung einer Zollkontrolle unterliegen kann, und bin für die Einhaltung der örtlichen Vorschriften verantwortlich.",
"I confirm this order is strictly for laboratory research purposes only.": "Ich bestätige, dass diese Bestellung ausschließlich für Laborforschungszwecke bestimmt ist.",
"In stock · ships within {#} h · {#}–{#} day delivery in France": "Auf Lager · Versand innerhalb von {#} h · Lieferung in {#}–{#} Tagen in Frankreich",
"Only": "Nur noch",
"Qty": "Menge",
"Remove": "Entfernen",
"Close": "Schließen",
"Subtotal": "Zwischensumme",
"Switzerland, United Kingdom": "Schweiz, Vereinigtes Königreich",
"Total": "Gesamt",
"United States, Canada": "Vereinigte Staaten, Kanada",
"away from free shipping": "bis zum kostenlosen Versand",
"Accept all": "Alle akzeptieren",
"Customise": "Anpassen",
"Learn more": "Mehr erfahren",
"Refuse all": "Alle ablehnen",
"We use cookies that are essential for the site to work (cart, language). With your consent, we also use audience-measurement and advertising cookies to improve the site and measure our campaigns. You can refuse or change your choice at any time.": "Wir verwenden Cookies, die für das Funktionieren der Website notwendig sind (Warenkorb, Sprache). Mit Ihrer Zustimmung verwenden wir außerdem Cookies zur Reichweitenmessung und für Werbung, um die Website zu verbessern und unsere Kampagnen zu messen. Sie können jederzeit ablehnen oder Ihre Wahl ändern.",
"A report issued by a third-party laboratory confirming a compound's identity and purity. Our Janoshik reports carry a public verification key at janoshik.com/verify.": "Ein von einem unabhängigen Labor ausgestellter Bericht, der Identität und Reinheit einer Verbindung bestätigt. Unsere Janoshik-Berichte tragen einen öffentlichen Prüfschlüssel unter janoshik.com/verify.",
"Adult researchers and laboratory professionals acting in compliance with the laws of their jurisdiction.": "Volljährige Forschende und Laborfachleute, die im Einklang mit den Gesetzen ihres Landes handeln.",
"Before reconstitution: dry, room temperature, away from light, vial sealed. After reconstitution: between {#} and {#} °C (refrigerated).": "Vor der Rekonstitution: trocken, bei Raumtemperatur, lichtgeschützt, Fläschchen versiegelt. Nach der Rekonstitution: zwischen {#} und {#} °C (gekühlt).",
"Bitcoin only, straight from the cart. The amount is calculated in euros and the invoice is valid for {#} minutes. First time? Our \"Pay with Bitcoin\" page explains everything in {#} steps (Revolut, Kraken or Coinbase).": "Nur mit Bitcoin, direkt aus dem Warenkorb. Der Betrag wird in Euro berechnet, und die Rechnung ist {#} Minuten gültig. Zum ersten Mal? Unsere Seite „Mit Bitcoin bezahlen“ erklärt alles in {#} Schritten (Revolut, Kraken oder Coinbase).",
"Each report states the product and strength analysed. A report covers one specific batch: each new batch is analysed in turn and published here.": "Jeder Bericht nennt das analysierte Produkt und die Dosierung. Ein Bericht gilt für eine bestimmte Charge: Jede neue Charge wird ihrerseits analysiert und hier veröffentlicht.",
"If a product does not match its report specifications, contact us within {#} days. We review each case and arrange a replacement or refund where appropriate.": "Wenn ein Produkt nicht den Spezifikationen seines Berichts entspricht, kontaktieren Sie uns innerhalb von {#} Tagen. Wir prüfen jeden Fall und veranlassen gegebenenfalls Ersatz oder Erstattung.",
"In-stock products ship within {#} h of payment confirmation and arrive in {#}–{#} days in France. Made-to-order products take {#}–{#} weeks: the batch is received, then analysed by Janoshik before it ships to you. You get an email at every step, then your tracking number.": "Lagerprodukte werden innerhalb von {#} h nach Zahlungsbestätigung versandt und sind in Frankreich in {#}–{#} Tagen da. Produkte auf Bestellung brauchen {#}–{#} Wochen: Die Charge wird zuerst empfangen und von Janoshik analysiert, bevor sie an Sie versandt wird. Sie erhalten bei jedem Schritt eine E-Mail und anschließend Ihre Sendungsnummer.",
"Made-to-order products are bought and analysed batch by batch. The minimum ({#} to {#} vials depending on the product) lets us launch that batch, and automatically gives you our quantity discounts (−{#} to −{#}%).": "Produkte auf Bestellung werden Charge für Charge eingekauft und analysiert. Die Mindestmenge ({#} bis {#} Fläschchen je nach Produkt) ermöglicht den Start dieser Charge und gibt Ihnen automatisch unsere Mengenrabatte (−{#} bis −{#} %).",
"Regulatory status varies by jurisdiction. It is your responsibility to check the applicable rules before ordering.": "Der rechtliche Status unterscheidet sich je nach Land. Es liegt in Ihrer Verantwortung, die geltenden Vorschriften vor der Bestellung zu prüfen.",
"The product is ordered from our manufacturer as soon as you pay. On arrival, we send a sample of that batch to Janoshik: your vial only ships once the analysis is approved. Total time: {#}–{#} weeks.": "Das Produkt wird sofort nach Ihrer Zahlung bei unserem Hersteller bestellt. Bei Eingang senden wir eine Probe dieser Charge an Janoshik: Ihr Fläschchen wird erst nach bestandener Analyse versandt. Gesamtdauer: {#}–{#} Wochen.",
"You receive an email at every step: order received, ordered from the manufacturer, batch under analysis at Janoshik, analysis approved (with the report link), then shipped with your tracking number.": "Sie erhalten bei jedem Schritt eine E-Mail: Bestellung eingegangen, beim Hersteller bestellt, Charge in Analyse bei Janoshik, Analyse bestanden (mit Link zum Bericht), dann versandt mit Ihrer Sendungsnummer.",
"All products are for in-vitro laboratory research only. Not for human or veterinary use. By purchasing you confirm you are a qualified researcher acting lawfully.": "Alle Produkte sind ausschließlich für die In-vitro-Laborforschung bestimmt. Nicht zur Anwendung am Menschen oder Tier. Mit dem Kauf bestätigen Sie, eine qualifizierte Fachperson zu sein, die rechtmäßig handelt.",
"By using this website or placing an order you agree to these Terms. If you disagree, do not use this site.": "Durch die Nutzung dieser Website oder eine Bestellung stimmen Sie diesen Bedingungen zu. Wenn Sie nicht einverstanden sind, nutzen Sie diese Website nicht.",
"Contact us within {#} days if products arrive damaged or do not match COA specs. Opened compounds cannot be returned for safety reasons.": "Kontaktieren Sie uns innerhalb von {#} Tagen, wenn Produkte beschädigt ankommen oder nicht den COA-Spezifikationen entsprechen. Geöffnete Verbindungen können aus Sicherheitsgründen nicht zurückgegeben werden.",
"For international orders (outside the European Union), the buyer is solely responsible for verifying that the products may be legally imported into their jurisdiction, for paying any applicable customs duties, taxes, or clearance fees, and for complying with all local laws governing research compounds. Novalyx Research does not act as an importer of record. Packages seized, destroyed, refused, or returned by customs authorities in any non-EU jurisdiction are non-refundable. By placing an international order, the buyer expressly acknowledges and accepts these risks.": "Bei internationalen Bestellungen (außerhalb der Europäischen Union) ist allein der Käufer dafür verantwortlich, zu prüfen, ob die Produkte rechtmäßig in sein Land eingeführt werden dürfen, etwaige Zölle, Steuern oder Abfertigungsgebühren zu zahlen und alle örtlichen Gesetze für Forschungsverbindungen einzuhalten. Novalyx Research tritt nicht als Importeur auf. Sendungen, die von Zollbehörden außerhalb der EU beschlagnahmt, vernichtet, abgelehnt oder zurückgesandt werden, werden nicht erstattet. Mit einer internationalen Bestellung erkennt der Käufer diese Risiken ausdrücklich an und akzeptiert sie.",
"Governed by French law and applicable EU regulations.": "Es gilt französisches Recht sowie die anwendbaren EU-Vorschriften.",
"Last updated: April {#}": "Zuletzt aktualisiert: April {#}",
"Novalyx is not liable for misuse of products, or for indirect or consequential damages from use of this website or products.": "Novalyx haftet nicht für eine missbräuchliche Verwendung der Produkte oder für indirekte oder Folgeschäden aus der Nutzung dieser Website oder der Produkte.",
"Orders are processed under controlled fulfillment conditions with per-order batch sourcing from our verified laboratory partners. Orders are shipped within {#} h of payment confirmation. Delivery within France typically takes {#}–{#} days; the rest of the EU {#}–{#} business days; international destinations {#}–{#} business days. Delivery timescales are estimates, not guarantees. Risk passes to buyer upon dispatch.": "Bestellungen werden unter kontrollierten Bedingungen bearbeitet, mit Chargenbezug je Bestellung von unseren geprüften Laborpartnern. Bestellungen werden innerhalb von {#} h nach Zahlungsbestätigung versandt. Die Lieferung innerhalb Frankreichs dauert in der Regel {#}–{#} Tage, in die übrige EU {#}–{#} Werktage, international {#}–{#} Werktage. Lieferzeiten sind Schätzungen, keine Garantien. Die Gefahr geht mit dem Versand auf den Käufer über.",
"Prices are shown in EUR and do not include VAT (TVA non applicable, art. {#}B du CGI — French micro-entrepreneur regime). Card payment is processed securely by Stripe; payment by bank transfer is also available, in which case the order is shipped once the transfer is received. We reserve the right to cancel orders, with a full refund issued.": "Die Preise werden in EUR angezeigt und enthalten keine Mehrwertsteuer (TVA non applicable, art. {#}B du CGI — französische Kleinunternehmerregelung). Die Kartenzahlung wird sicher über Stripe abgewickelt; eine Zahlung per Banküberweisung ist ebenfalls möglich, in diesem Fall wird die Bestellung nach Zahlungseingang versandt. Wir behalten uns das Recht vor, Bestellungen gegen vollständige Erstattung zu stornieren.",
"You must be {#}+ to purchase. Completing a purchase confirms you meet this requirement.": "Sie müssen mindestens {#} Jahre alt sein, um zu kaufen. Mit dem Abschluss eines Kaufs bestätigen Sie, diese Voraussetzung zu erfüllen.",
"{#}. Acceptance": "{#}. Annahme",
"{#}. Age Restriction": "{#}. Altersbeschränkung",
"{#}. Governing Law": "{#}. Anwendbares Recht",
"{#}. Limitation of Liability": "{#}. Haftungsbeschränkung",
"{#}. Orders & Payment": "{#}. Bestellungen & Zahlung",
"{#}. Research Use Only": "{#}. Nur für Forschungszwecke",
"{#}. Returns": "{#}. Rücksendungen",
"{#}. Shipping & International Orders": "{#}. Versand & internationale Bestellungen",
"Data enquiries:": "Datenanfragen:",
"Essential cookies for functionality only. Analytics cookies placed with consent only.": "Nur für die Funktion notwendige Cookies. Analyse-Cookies nur mit Einwilligung.",
"Name, email, shipping address, and order details you provide directly. Anonymised usage data via analytics to improve our site.": "Name, E-Mail, Lieferadresse und Bestelldaten, die Sie uns direkt mitteilen. Anonymisierte Nutzungsdaten über Analysewerkzeuge zur Verbesserung unserer Website.",
"Novalyx operates this website and is responsible for your personal data in accordance with the GDPR.": "Novalyx betreibt diese Website und ist gemäß DSGVO für Ihre personenbezogenen Daten verantwortlich.",
"Privacy Policy": "Datenschutzerklärung",
"To process orders, provide support, send order communications, and — with consent — product announcements. Payment data is processed by Stripe; we never see or store your card details.": "Zur Bearbeitung von Bestellungen, für den Support, für Bestellmitteilungen und — mit Einwilligung — für Produktneuheiten. Zahlungsdaten werden von Stripe verarbeitet; wir sehen oder speichern Ihre Kartendaten nie.",
"Under GDPR: access, rectify, erase, restrict, port your data, or object to processing. Email": "Nach der DSGVO: Auskunft, Berichtigung, Löschung, Einschränkung, Übertragbarkeit Ihrer Daten oder Widerspruch gegen die Verarbeitung. E-Mail",
"We do not sell your data. We share only with logistics and payment partners (Stripe) under strict processing agreements.": "Wir verkaufen Ihre Daten nicht. Wir geben sie nur an Logistik- und Zahlungspartner (Stripe) im Rahmen strenger Auftragsverarbeitungsverträge weiter.",
"{#}. Contact": "{#}. Kontakt",
"{#}. Data Sharing": "{#}. Datenweitergabe",
"{#}. Data We Collect": "{#}. Welche Daten wir erheben",
"{#}. How We Use Your Data": "{#}. Wie wir Ihre Daten verwenden",
"{#}. Who We Are": "{#}. Wer wir sind",
"{#}. Your Rights": "{#}. Ihre Rechte",
"Accuracy": "Genauigkeit",
"All products are intended exclusively for scientific research by qualified professionals in appropriate laboratory settings. They are not drugs, supplements, or food products.": "Alle Produkte sind ausschließlich für die wissenschaftliche Forschung durch qualifizierte Fachleute in geeigneten Laborumgebungen bestimmt. Sie sind weder Arzneimittel noch Nahrungsergänzungsmittel noch Lebensmittel.",
"COA documents represent the definitive specification per batch. While we strive for accuracy, we do not warrant all website content is error-free.": "COA-Dokumente stellen die maßgebliche Spezifikation je Charge dar. Wir bemühen uns um Genauigkeit, garantieren aber nicht, dass alle Inhalte der Website fehlerfrei sind.",
"It is the purchaser's sole responsibility to verify that a compound is legal in their jurisdiction. Novalyx makes no representation regarding regulatory status in any country.": "Es liegt allein in der Verantwortung des Käufers, zu prüfen, ob eine Verbindung in seinem Land legal ist. Novalyx gibt keine Zusicherung zum rechtlichen Status in irgendeinem Land.",
"No Medical Advice": "Keine medizinische Beratung",
"No product sold by Novalyx is intended for human or veterinary administration. Novalyx expressly disclaims liability for any use contrary to this designation.": "Kein von Novalyx verkauftes Produkt ist zur Anwendung am Menschen oder Tier bestimmt. Novalyx lehnt ausdrücklich jede Haftung für eine dieser Bestimmung widersprechende Verwendung ab.",
"Not for Human Use": "Nicht zur Anwendung am Menschen",
"Nothing on this website constitutes medical advice. No claims are made regarding health benefits or therapeutic effects of any compound.": "Nichts auf dieser Website stellt eine medizinische Beratung dar. Es werden keine Aussagen über gesundheitliche Vorteile oder therapeutische Wirkungen einer Verbindung gemacht.",
"Regulatory Compliance": "Einhaltung der Vorschriften",
"Research Use Only": "Nur für Forschungszwecke",
"All products are supplied exclusively for laboratory research. By ordering you confirm you are a qualified professional acting in compliance with applicable laws.": "Alle Produkte werden ausschließlich für die Laborforschung geliefert. Mit Ihrer Bestellung bestätigen Sie, eine qualifizierte Fachperson zu sein, die im Einklang mit den geltenden Gesetzen handelt.",
"Australia, New Zealand and other countries": "Australien, Neuseeland und andere Länder",
"Each order is shipped from Paris within {#} h of payment confirmation. Delivery in {#}–{#} days maximum within France, {#}–{#} business days for the rest of the EU. A tracking number is sent on dispatch.": "Jede Bestellung wird innerhalb von {#} h nach Zahlungsbestätigung aus Paris versandt. Lieferung in maximal {#}–{#} Tagen innerhalb Frankreichs, {#}–{#} Werktage in die übrige EU. Eine Sendungsnummer wird beim Versand mitgeteilt.",
"European Union": "Europäische Union",
"France": "Frankreich",
"Free shipping in France and the EU on {N} Packs of {#} and {#}. Bacteriostatic water: {#}€ in France and the EU. We do not ship to Russia or Belarus.": "Kostenloser Versand in Frankreich und der EU für {N} im {#}er- und {#}er-Pack. Bakteriostatisches Wasser: {#}€ in Frankreich und der EU. Wir liefern nicht nach Russland oder Belarus.",
"Orders outside the European Union": "Bestellungen außerhalb der Europäischen Union",
"Shipments outside the EU are at the buyer's risk. The buyer must check that the products may be lawfully imported and pay any duties or taxes. Novalyx Research does not act as importer of record. Parcels seized, refused or destroyed by customs outside the EU are non-refundable.": "Sendungen außerhalb der EU erfolgen auf Gefahr des Käufers. Der Käufer muss prüfen, ob die Produkte rechtmäßig eingeführt werden dürfen, und etwaige Zölle oder Steuern zahlen. Novalyx Research tritt nicht als Importeur auf. Vom Zoll außerhalb der EU beschlagnahmte, abgelehnte oder vernichtete Pakete werden nicht erstattet.",
"Shipping & delivery": "Versand & Lieferung",
"Switzerland, UK": "Schweiz, Vereinigtes Königreich",
"USA, Canada": "USA, Kanada",
"Use declaration": "Verwendungserklärung",
"Zones and rates": "Zonen und Tarife",
"{#}–{#} business days": "{#}–{#} Werktage",
"{#}–{#} business days (variable)": "{#}–{#} Werktage (variabel)",
"{#}–{#} days max.": "max. {#}–{#} Tage",
", documented, verifiable.": ", dokumentiert, überprüfbar.",
"A sample goes to Janoshik Analytical: identity, HPLC purity, measured content.": "Eine Probe geht an Janoshik Analytical: Identität, HPLC-Reinheit, gemessener Gehalt.",
"Ambassadors": "Botschafter",
"Analysed": "Analysiert",
"Analysed and published.": "Analysiert und veröffentlicht.",
"Analysed product · published batch": "Analysiertes Produkt · veröffentlichte Charge",
"Analyses": "Analysen",
"Batch": "Charge",
"Batch selection": "Chargenauswahl",
"Bioregulators": "Bioregulatoren",
"Bitcoin payment": "Bitcoin-Zahlung",
"Bitcoin payment, billed in euros": "Bitcoin-Zahlung, abgerechnet in Euro",
"Bitcoin, billed in euros": "Bitcoin, abgerechnet in Euro",
"Buy Bitcoin": "Bitcoin kaufen",
"By entering you confirm compliance with all applicable laws in your jurisdiction.": "Mit dem Betreten bestätigen Sie die Einhaltung aller in Ihrem Land geltenden Gesetze.",
"Cart": "Warenkorb",
"Catalogue": "Katalog",
"Cellular energy, mitochondria, telomeres.": "Zelluläre Energie, Mitochondrien, Telomere.",
"Cognitive": "Kognitive Forschung",
"Company": "Unternehmen",
"Compound notes": "Hinweise zur Verbindung",
"Compounds supplied exclusively for in-vitro laboratory research. Not medicines or dietary supplements.": "Verbindungen ausschließlich für die In-vitro-Laborforschung. Keine Arzneimittel oder Nahrungsergänzungsmittel.",
"Contact": "Kontakt",
"Cosmetic Peptides": "Dermokosmetische Peptide",
"Currency": "Währung",
"Date": "Datum",
"Dermo-cosmetic peptide ingredients.": "Dermokosmetische Peptid-Wirkstoffe.",
"Direct Bitcoin payment · billed in euros": "Direkte Bitcoin-Zahlung · abgerechnet in Euro",
"Disclaimer": "Haftungsausschluss",
"Dispatch": "Versand",
"ENTER SITE →": "SEITE BETRETEN →",
"Each batch is selected from our manufacturing partner, with its certificate of analysis.": "Jede Charge wird bei unserem Herstellungspartner ausgewählt, mit ihrem Analysezertifikat.",
"For volume orders, recurring supply or a specific document request, write to us. Reply within one business day.": "Für Mengenbestellungen, regelmäßige Lieferungen oder eine bestimmte Dokumentenanfrage schreiben Sie uns. Antwort innerhalb eines Werktags.",
"Four steps, nothing hidden.": "Vier Schritte, nichts verborgen.",
"Free shipping from {#}€": "Kostenloser Versand ab {#}€",
"French company · Paris": "Französisches Unternehmen · Paris",
"French · SIRET {#} {#} {#}": "Französisch · SIRET {#} {#} {#}",
"From": "Ab",
"Full catalogue": "Gesamter Katalog",
"GH Research": "GH-Forschung",
"GH secretagogue receptor research.": "Forschung zum GH-Sekretagog-Rezeptor.",
"GH-releasing and secretagogue research.": "Forschung zu GH-Freisetzung und Sekretagogen.",
"GLP-{#}, GIP, glucagon and amylin receptors.": "GLP-{#}-, GIP-, Glukagon- und Amylin-Rezeptoren.",
"Growth & Cellular": "Wachstum & Zellulär",
"HPLC purity": "HPLC-Reinheit",
"I am a qualified professional (researcher, laboratory, institution).": "Ich bin eine qualifizierte Fachperson (Forschung, Labor, Einrichtung).",
"I confirm I am {#} years of age or older.": "Ich bestätige, dass ich mindestens {#} Jahre alt bin.",
"If you can shop online, you can pay with Bitcoin: {#} minutes the first time, {#} minutes after that. The amount is always calculated in euros.": "Wer online einkaufen kann, kann auch mit Bitcoin bezahlen: {#} Minuten beim ersten Mal, danach {#} Minuten. Der Betrag wird immer in Euro berechnet.",
"Immune": "Immunsystem",
"Immune modulation, thymic pathways.": "Immunmodulation, Thymus-Signalwege.",
"In stock: ships within {#} h": "Auf Lager: Versand innerhalb von {#} h",
"In stock: {#} h · made to order: {#}–{#} weeks": "Auf Lager: {#} h · auf Bestellung: {#}–{#} Wochen",
"Independent analysis": "Unabhängige Analyse",
"Janoshik, public key": "Janoshik, öffentlicher Schlüssel",
"Lab Supplies": "Laborbedarf",
"Laboratories and resellers: volume pricing, reports included.": "Labore und Wiederverkäufer: Mengenpreise, Berichte inklusive.",
"Laboratory": "Labor",
"Laboratory / Organization (optional)": "Labor / Organisation (optional)",
"Laboratory reconstitution solvents.": "Lösungsmittel zur Rekonstitution im Labor.",
"Legal": "Rechtliches",
"Longevity": "Langlebigkeit",
"Lyophilised peptide · research use": "Lyophilisiertes Peptid · Forschungszwecke",
"Lyophilised peptides for laboratories and researchers. Analyses are performed by an independent laboratory, and every report can be verified publicly with its key.": "Lyophilisierte Peptide für Labore und Forschende. Die Analysen werden von einem unabhängigen Labor durchgeführt, und jeder Bericht lässt sich mit seinem Schlüssel öffentlich überprüfen.",
"Lyophilised, labelled, sealed vials, tracked shipping. Products without a published report are marked “analysis pending”.": "Lyophilisierte, etikettierte, versiegelte Fläschchen, Versand mit Sendungsverfolgung. Produkte ohne veröffentlichten Bericht sind als „Analyse ausstehend“ gekennzeichnet.",
"Manage cookies": "Cookies verwalten",
"Measured content": "Gemessener Gehalt",
"Menu": "Menü",
"Metabolic": "Stoffwechsel",
"Method": "Methode",
"Multi-peptide blends in a single vial.": "Multi-Peptid-Mischungen in einem einzigen Fläschchen.",
"Neuromodulation and neuroprotection.": "Neuromodulation und Neuroprotektion.",
"Novalyx Research supplies compounds exclusively for laboratory research. Access is restricted to qualified professionals.": "Novalyx Research liefert Verbindungen ausschließlich für die Laborforschung. Der Zugang ist qualifizierten Fachleuten vorbehalten.",
"PDF catalogue": "PDF-Katalog",
"Pay with Bitcoin": "Mit Bitcoin bezahlen",
"Paying with Bitcoin is easier than it sounds.": "Mit Bitcoin bezahlen ist einfacher, als es klingt.",
"Payment": "Zahlung",
"Place your order": "Bestellung aufgeben",
"Privacy": "Datenschutz",
"Products for laboratory research use only — not for human or veterinary use": "Produkte ausschließlich für die Laborforschung — nicht zur Anwendung am Menschen oder Tier",
"Products for laboratory research use only, not for human or veterinary use": "Produkte ausschließlich für die Laborforschung, nicht zur Anwendung am Menschen oder Tier",
"Professional access": "Fachzugang",
"Professionals": "Fachkunden",
"Publication": "Veröffentlichung",
"Regenerative": "Regenerativ",
"Request pricing": "Preise anfragen",
"Research compounds,": "Forschungsverbindungen,",
"Research use only": "Nur für Forschungszwecke",
"Research use only — not for human or veterinary use": "Nur für Forschungszwecke — nicht zur Anwendung am Menschen oder Tier",
"Reserved for laboratory research.": "Der Laborforschung vorbehalten.",
"Revolut, Kraken or Coinbase": "Revolut, Kraken oder Coinbase",
"See the analyses": "Analysen ansehen",
"See the {#}-step guide": "Zur Anleitung in {#} Schritten",
"Send the payment": "Zahlung senden",
"Shipping": "Versand",
"Short peptides from V. Khavinson's research.": "Kurze Peptide aus der Forschung von V. Khavinson.",
"Signature Blends": "Signature-Mischungen",
"Sleep, reproductive, melanocortin.": "Schlaf, Fortpflanzung, Melanocortin.",
"Specialized": "Spezialisiert",
"Terms & Conditions": "Allgemeine Geschäftsbedingungen",
"The report and its verification key are published. Anyone can check it.": "Der Bericht und sein Prüfschlüssel sind veröffentlicht. Jeder kann ihn überprüfen.",
"This order is strictly for laboratory research — not for human or animal use.": "Diese Bestellung ist ausschließlich für die Laborforschung bestimmt — nicht zur Anwendung am Menschen oder Tier.",
"Tissue-repair and angiogenesis research.": "Forschung zu Geweberegeneration und Angiogenese.",
"Trust isn't claimed, it's documented. Here is exactly what happens between production and your laboratory.": "Vertrauen wird nicht behauptet, sondern belegt. Genau das passiert zwischen der Herstellung und Ihrem Labor.",
"Up to −{#}% from {#} vials": "Bis zu −{#} % ab {#} Fläschchen",
"Verification key": "Prüfschlüssel",
"Verify on Janoshik": "Auf Janoshik überprüfen",
"View catalogue": "Katalog ansehen",
"View product": "Produkt ansehen",
"View {N} {#} mg": "{N} {#} mg ansehen",
"Your organization's name": "Name Ihrer Organisation",
"an invoice with a QR code appears": "eine Rechnung mit QR-Code erscheint",
"analysed": "analysiert",
"lyophilised": "lyophilisiert",
"scan, check, confirm": "scannen, prüfen, bestätigen",
"{#} Rue Pasquier, {#} Paris, France": "{#} Rue Pasquier, {#} Paris, Frankreich",
"{#} Sept {#}": "{#}. Sept. {#}",
"{#} compounds, {#} research areas.": "{#} Verbindungen, {#} Forschungsbereiche.",
"{N} · batch NLR-{#}-{#} analysed by Janoshik: {#}%": "{N} · Charge NLR-{#}-{#} von Janoshik analysiert: {#}%",
"Assistant": "Assistent",
"Open the assistant": "Assistenten öffnen",
"/ vial": "/ Fläschchen",
"AMYLIN RECEPTOR RESEARCH": "AMYLIN-REZEPTOR-FORSCHUNG",
"ANTI-AGING RESEARCH": "ANTI-AGING-FORSCHUNG",
"ANTI-INFLAMMATORY RESEARCH": "ENTZÜNDUNGSFORSCHUNG",
"ANTIMICROBIAL RESEARCH": "ANTIMIKROBIELLE FORSCHUNG",
"Add to cart": "In den Warenkorb",
"Analysis date": "Analysedatum",
"Analysis ordered by Novalyx on its {#}mg batch. The original report can be viewed at any time on Janoshik's website.": "Von Novalyx in Auftrag gegebene Analyse der {#}mg-Charge. Der Originalbericht ist jederzeit auf der Website von Janoshik einsehbar.",
"Analysis report available for the {#}mg — select it to view.": "Analysebericht für {#}mg verfügbar — wählen Sie diese Dosierung, um ihn anzuzeigen.",
"BIOREGULATOR RESEARCH": "BIOREGULATOR-FORSCHUNG",
"Bacteriostatic water {#} ml": "Bakteriostatisches Wasser {#} ml",
"Bitcoin payment: how does it work? ({#} steps)": "Bitcoin-Zahlung: Wie funktioniert das? ({#} Schritte)",
"Buy now": "Jetzt kaufen",
"CELLULAR ENERGY RESEARCH": "ZELLENERGIE-FORSCHUNG",
"CELLULAR RESEARCH": "ZELLFORSCHUNG",
"CJC-{#} without DAC is a synthetic GHRH analog supplied for research into extended-duration GH release pathways. Lyophilized, high-stability formulation.": "CJC-{#} ohne DAC ist ein synthetisches GHRH-Analogon für die Forschung zu länger anhaltenden GH-Freisetzungswegen. Lyophilisierte, sehr stabile Formulierung.",
"COMPLETE RESEARCH COMPLEX": "UMFASSENDER FORSCHUNGSKOMPLEX",
"COSMETIC PEPTIDE RESEARCH": "FORSCHUNG ZU KOSMETISCHEN PEPTIDEN",
"Composition": "Zusammensetzung",
"DUAL-AGONIST RESEARCH": "DUAL-AGONIST-FORSCHUNG",
"DUAL-RECEPTOR RESEARCH": "DUAL-REZEPTOR-FORSCHUNG",
"Dry, room temperature, away from light before reconstitution; {#}–{#}°C after reconstitution": "Vor der Rekonstitution trocken, bei Raumtemperatur und lichtgeschützt; nach der Rekonstitution {#}–{#} °C",
"Fermer": "Schließen",
"For in-vitro laboratory research only. Not for human or veterinary use.": "Nur für die In-vitro-Laborforschung. Nicht zur Anwendung am Menschen oder Tier.",
"Frequently bought with": "Häufig zusammen gekauft",
"GH RESEARCH": "GH-FORSCHUNG",
"GH SECRETAGOGUE RESEARCH": "GH-SEKRETAGOG-FORSCHUNG",
"GH-RELEASING RESEARCH BLEND": "FORSCHUNGSMISCHUNG ZUR GH-FREISETZUNG",
"GH-SECRETAGOGUE RESEARCH": "GH-SEKRETAGOG-FORSCHUNG",
"GHRH ANALOG RESEARCH": "GHRH-ANALOGON-FORSCHUNG",
"GHRH RESEARCH": "GHRH-FORSCHUNG",
"GLP-{#} RECEPTOR RESEARCH": "GLP-{#}-REZEPTOR-FORSCHUNG",
"GROWTH FACTOR RESEARCH": "WACHSTUMSFAKTOR-FORSCHUNG",
"GROWTH HORMONE RESEARCH": "WACHSTUMSHORMON-FORSCHUNG",
"Grade": "Qualität",
"IMMUNE MODULATION RESEARCH": "IMMUNMODULATIONS-FORSCHUNG",
"In stock · ships within {#} h": "Auf Lager · Versand innerhalb von {#} h",
"Independent analysis · Janoshik": "Unabhängige Analyse · Janoshik",
"Janoshik (per batch)": "Janoshik (je Charge)",
"Janoshik HPLC (per batch)": "Janoshik HPLC (je Charge)",
"LAB SUPPLY": "LABORBEDARF",
"LONGEVITY RESEARCH": "LANGLEBIGKEITSFORSCHUNG",
"Lyophilised vial": "Lyophilisiertes Fläschchen",
"Lyophilised vials ({#}-pack)": "Lyophilisierte Fläschchen ({#}er-Pack)",
"MELANOCORTIN RECEPTOR RESEARCH": "MELANOCORTIN-REZEPTOR-FORSCHUNG",
"METABOLIC FRAGMENT RESEARCH": "STOFFWECHSEL-FRAGMENT-FORSCHUNG",
"METABOLIC RESEARCH": "STOFFWECHSELFORSCHUNG",
"MITOCHONDRIAL RESEARCH": "MITOCHONDRIENFORSCHUNG",
"MULTI-RECEPTOR RESEARCH": "MULTI-REZEPTOR-FORSCHUNG",
"Made to order · {#}–{#} weeks · batch analysed by Janoshik before shipping · tracked at every step": "Auf Bestellung · {#}–{#} Wochen · Charge vor dem Versand von Janoshik analysiert · Verfolgung bei jedem Schritt",
"Most popular": "Am beliebtesten",
"NEUROMODULATION RESEARCH": "NEUROMODULATIONS-FORSCHUNG",
"NEUROPEPTIDE RESEARCH": "NEUROPEPTID-FORSCHUNG",
"NEUROPROTECTIVE RESEARCH": "NEUROPROTEKTIONS-FORSCHUNG",
"NEUROTROPHIC RESEARCH": "NEUROTROPHE FORSCHUNG",
"NOOTROPIC RESEARCH": "NOOTROPIKA-FORSCHUNG",
"Novalyx Research {N} is pharmaceutical-grade sterile water containing {#}% benzyl alcohol as a bacteriostatic agent. Supplied exclusively for laboratory use in the reconstitution of lyophilised research peptides. Each vial is sealed, sterile, and ready for immediate laboratory use.": "Novalyx Research {N} ist steriles Wasser in pharmazeutischer Qualität mit {#} % Benzylalkohol als bakteriostatischem Wirkstoff. Ausschließlich für den Laborgebrauch zur Rekonstitution lyophilisierter Forschungspeptide geliefert. Jedes Fläschchen ist versiegelt, steril und sofort einsatzbereit.",
"Open report (Janoshik)": "Bericht öffnen (Janoshik)",
"Pharmaceutical-grade": "Pharmazeutische Qualität",
"Product visual. The batch number is printed on every vial shipped.": "Produktabbildung. Die Chargennummer ist auf jedem versandten Fläschchen aufgedruckt.",
"Purity": "Reinheit",
"REGENERATIVE RESEARCH": "REGENERATIONSFORSCHUNG",
"REGENERATIVE RESEARCH BLEND": "REGENERATIVE FORSCHUNGSMISCHUNG",
"REGENERATIVE TRIPLE BLEND": "REGENERATIVE DREIFACHMISCHUNG",
"REPRODUCTIVE RESEARCH": "REPRODUKTIONSFORSCHUNG",
"Room temperature / avoid direct light": "Raumtemperatur / direktes Licht vermeiden",
"Room temperature, away from light": "Raumtemperatur, lichtgeschützt",
"SLEEP RESEARCH": "SCHLAFFORSCHUNG",
"Sample (as on report)": "Probe (wie im Bericht)",
"Size": "Größe",
"Sterile reconstitution solvent + {#}% benzyl alcohol": "Steriles Rekonstitutionslösungsmittel + {#} % Benzylalkohol",
"Sterile sealed vial": "Steriles versiegeltes Fläschchen",
"Sterile water, {#}% acetic acid": "Steriles Wasser, {#} % Essigsäure",
"Storage": "Lagerung",
"TELOMERE RESEARCH": "TELOMER-FORSCHUNG",
"TISSUE REPAIR RESEARCH": "GEWEBEREPARATUR-FORSCHUNG",
"TRIPLE-RECEPTOR RESEARCH": "TRIPLE-REZEPTOR-FORSCHUNG",
"Task no.": "Auftrag Nr.",
"Volume pricing: the more you take, the less you pay": "Staffelpreise: Je mehr Sie nehmen, desto weniger zahlen Sie",
"You save": "Sie sparen",
"vial": "Fläschchen",
"vials": "Fläschchen",
"{#} ml sealed vial": "Versiegeltes {#}-ml-Fläschchen",
"{#}mg total (BPC{#}+TB{#})": "{#}mg gesamt (BPC{#}+TB{#})",
"{N} (Body Protection Compound) is a synthetic pentadecapeptide supplied for research into tissue repair, angiogenesis, and gastrointestinal integrity. Each vial contains lyophilized peptide. Supplied exclusively for in-vitro and laboratory research purposes.": "{N} (Body Protection Compound) ist ein synthetisches Pentadecapeptid für die Forschung zu Gewebereparatur, Angiogenese und Integrität des Magen-Darm-Trakts. Jedes Fläschchen enthält lyophilisiertes Peptid. Ausschließlich für die In-vitro- und Laborforschung geliefert.",
"{N} (Bremelanotide) is a synthetic cyclic heptapeptide, supplied for research into melanocortin MC{#} and MC{#} receptor pathways and central nervous system signalling.": "{N} (Bremelanotid) ist ein synthetisches zyklisches Heptapeptid für die Forschung zu den Melanocortin-Rezeptoren MC{#} und MC{#} und zur Signalübertragung im Zentralnervensystem.",
"{N} (Delta Sleep-Inducing Peptide) is a synthetic nonapeptide, supplied for research into sleep regulation, delta wave activity, and circadian signalling pathways.": "{N} (Delta Sleep-Inducing Peptide) ist ein synthetisches Nonapeptid für die Forschung zu Schlafregulation, Delta-Wellen-Aktivität und zirkadianen Signalwegen.",
"{N} (Elamipretide) is a mitochondria-targeting peptide, supplied for research into cardiolipin binding and mitochondrial energetics pathways.": "{N} (Elamipretid) ist ein auf Mitochondrien ausgerichtetes Peptid für die Forschung zur Cardiolipin-Bindung und zu mitochondrialen Energiewegen.",
"{N} (Glycyl-Histidyl-Lysine copper complex) is a naturally occurring tripeptide bound to copper. Supplied for research into dermal regeneration, collagen and elastin synthesis, and tissue repair. New batches are submitted for independent analysis by Janoshik.": "{N} (Glycyl-Histidyl-Lysin-Kupferkomplex) ist ein natürlich vorkommendes, an Kupfer gebundenes Tripeptid. Geliefert für die Forschung zu Hautregeneration, Kollagen- und Elastinsynthese sowie Gewebereparatur. Neue Chargen werden von Janoshik unabhängig analysiert.",
"{N} (Lysine-Proline-Valine) is the C-terminal tripeptide fragment of alpha-MSH. Supplied for research into inflammatory signalling, intestinal barrier function, and dermal health.": "{N} (Lysin-Prolin-Valin) ist das C-terminale Tripeptid-Fragment von Alpha-MSH. Geliefert für die Forschung zu Entzündungssignalen, Darmbarrierefunktion und Hautgesundheit.",
"{N} (Nicotinamide Adenine Dinucleotide) is a coenzyme present in all living cells, supplied for research into cellular energy metabolism, sirtuin activity, and longevity pathways.": "{N} (Nicotinamid-Adenin-Dinukleotid) ist ein in allen lebenden Zellen vorkommendes Coenzym, geliefert für die Forschung zu zellulärem Energiestoffwechsel, Sirtuin-Aktivität und Langlebigkeitswegen.",
"{N} (TA{#}) is a synthetic {#}-amino acid peptide, supplied for research into immune system modulation, T-cell signalling, and thymic function.": "{N} (TA{#}) ist ein synthetisches Peptid aus {#} Aminosäuren für die Forschung zu Immunmodulation, T-Zell-Signalen und Thymusfunktion.",
"{N} Acetate is a synthetic GHRH {#}-{#} fragment, supplied for research into growth hormone releasing pathways. Lyophilized, high-stability formulation.": "{N}-Acetat ist ein synthetisches GHRH-{#}-{#}-Fragment für die Forschung zu den Freisetzungswegen des Wachstumshormons. Lyophilisierte, sehr stabile Formulierung.",
"{N} is a cathelicidin-derived antimicrobial peptide, supplied for research into innate immunity pathways and host defense mechanisms.": "{N} ist ein von Cathelicidin abgeleitetes antimikrobielles Peptid für die Forschung zu angeborener Immunität und Abwehrmechanismen des Wirts.",
"{N} is a laboratory reconstitution solvent. Not for human or veterinary use.": "{N} ist ein Lösungsmittel zur Rekonstitution im Labor. Nicht zur Anwendung am Menschen oder Tier.",
"{N} is a neurotrophic peptide complex, supplied for research into neuroprotection, BDNF modulation, and cognitive signalling pathways.": "{N} ist ein neurotropher Peptidkomplex für die Forschung zu Neuroprotektion, BDNF-Modulation und kognitiven Signalwegen.",
"{N} is a proprietary research blend containing CJC-{#} ({#}mg, no DAC) and {N} ({#}mg) in a single lyophilized vial. Formulated for researchers investigating GH-releasing pathways in an integrated protocol.": "{N} ist eine eigene Forschungsmischung aus CJC-{#} ({#}mg, ohne DAC) und {N} ({#}mg) in einem einzigen lyophilisierten Fläschchen. Entwickelt für Forschende, die GH-Freisetzungswege in einem integrierten Protokoll untersuchen.",
"{N} is a proprietary research blend containing {N} ({#}mg) and {N} ({#}mg) combined in a single lyophilized vial. Formulated for researchers investigating combined regenerative signalling pathways. New batches are submitted for independent analysis by Janoshik.": "{N} ist eine eigene Forschungsmischung aus {N} ({#}mg) und {N} ({#}mg) in einem einzigen lyophilisierten Fläschchen. Entwickelt für Forschende, die kombinierte regenerative Signalwege untersuchen. Neue Chargen werden von Janoshik unabhängig analysiert.",
"{N} is a selective synthetic growth hormone secretagogue, supplied for research into pulsatile GH release pathways. Lyophilized, high-stability formulation.": "{N} ist ein selektiver synthetischer Wachstumshormon-Sekretagog für die Forschung zu pulsatilen GH-Freisetzungswegen. Lyophilisierte, sehr stabile Formulierung.",
"{N} is a synthetic analog of growth hormone-releasing hormone (GHRH), supplied for research into visceral fat metabolism and the GH/IGF-{#} axis.": "{N} ist ein synthetisches Analogon des Growth-Hormone-Releasing-Hormons (GHRH) für die Forschung zum viszeralen Fettstoffwechsel und zur GH/IGF-{#}-Achse.",
"{N} is a synthetic decapeptide, supplied for research into GnRH regulation and reproductive endocrinology signalling pathways.": "{N} ist ein synthetisches Decapeptid für die Forschung zur GnRH-Regulation und zu reproduktionsendokrinologischen Signalwegen.",
"{N} is a synthetic dual-agonist peptide targeting both GLP-{#} and glucagon receptors. Supplied exclusively for in-vitro laboratory research. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.": "{N} ist ein synthetisches Dual-Agonist-Peptid, das sowohl GLP-{#}- als auch Glukagon-Rezeptoren anspricht. Ausschließlich für die In-vitro-Laborforschung geliefert. Kein Arzneimittel, Nahrungsergänzungsmittel oder Kosmetikum. Nicht zur Anwendung am Menschen oder Tier.",
"{N} is a synthetic dual-agonist research peptide targeting GLP-{#} and glucagon receptors. Supplied exclusively for in-vitro laboratory research. Not a medicine, supplement, or cosmetic.": "{N} ist ein synthetisches Dual-Agonist-Forschungspeptid, das GLP-{#}- und Glukagon-Rezeptoren anspricht. Ausschließlich für die In-vitro-Laborforschung geliefert. Kein Arzneimittel, Nahrungsergänzungsmittel oder Kosmetikum.",
"{N} is a synthetic fragment of Thymosin Beta-{#}, supplied for research into cellular migration, angiogenesis, and tissue regeneration. Each vial contains lyophilized peptide.": "{N} ist ein synthetisches Fragment von Thymosin Beta-{#} für die Forschung zu Zellmigration, Angiogenese und Geweberegeneration. Jedes Fläschchen enthält lyophilisiertes Peptid.",
"{N} is a synthetic growth hormone-releasing hexapeptide supplied exclusively for in-vitro laboratory research into GH secretagogue receptor pathways. Each vial contains a lyophilised compound. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.": "{N} ist ein synthetisches wachstumshormonfreisetzendes Hexapeptid, ausschließlich für die In-vitro-Laborforschung zu GH-Sekretagog-Rezeptorwegen geliefert. Jedes Fläschchen enthält eine lyophilisierte Verbindung. Der Janoshik-Analysebericht wird veröffentlicht, sobald die Charge getestet ist. Kein Arzneimittel, Nahrungsergänzungsmittel oder Kosmetikum. Nicht zur Anwendung am Menschen oder Tier.",
"{N} is a synthetic growth hormone-releasing peptide supplied exclusively for in-vitro laboratory research into GH secretagogue receptor pathways. Each vial contains a lyophilised compound. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.": "{N} ist ein synthetisches wachstumshormonfreisetzendes Peptid, ausschließlich für die In-vitro-Laborforschung zu GH-Sekretagog-Rezeptorwegen geliefert. Jedes Fläschchen enthält eine lyophilisierte Verbindung. Der Janoshik-Analysebericht wird veröffentlicht, sobald die Charge getestet ist. Kein Arzneimittel, Nahrungsergänzungsmittel oder Kosmetikum. Nicht zur Anwendung am Menschen oder Tier.",
"{N} is a synthetic heptapeptide analog of ACTH({#}-{#}), supplied for research into cognitive function, BDNF expression, and neuroprotective signalling.": "{N} ist ein synthetisches Heptapeptid-Analogon von ACTH({#}-{#}) für die Forschung zu kognitiver Funktion, BDNF-Expression und neuroprotektiven Signalen.",
"{N} is a synthetic heptapeptide analog of tuftsin, supplied for research into anxiolytic mechanisms and GABAergic signalling pathways.": "{N} ist ein synthetisches Heptapeptid-Analogon von Tuftsin für die Forschung zu anxiolytischen Mechanismen und GABAergen Signalwegen.",
"{N} is a synthetic long-acting amylin analog, supplied for research into amylin receptor pathways and satiety signalling. Each vial contains lyophilized peptide for in-vitro laboratory investigation.": "{N} ist ein synthetisches, lang wirkendes Amylin-Analogon für die Forschung zu Amylin-Rezeptorwegen und Sättigungssignalen. Jedes Fläschchen enthält lyophilisiertes Peptid für die In-vitro-Laboruntersuchung.",
"{N} is a synthetic modified fragment of growth hormone (amino acids {#}-{#}), supplied exclusively for in-vitro laboratory research into lipid metabolism signalling. Each vial contains a lyophilised compound. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.": "{N} ist ein synthetisches, modifiziertes Fragment des Wachstumshormons (Aminosäuren {#}-{#}), ausschließlich für die In-vitro-Laborforschung zu Signalen des Fettstoffwechsels geliefert. Jedes Fläschchen enthält eine lyophilisierte Verbindung. Der Janoshik-Analysebericht wird veröffentlicht, sobald die Charge getestet ist. Kein Arzneimittel, Nahrungsergänzungsmittel oder Kosmetikum. Nicht zur Anwendung am Menschen oder Tier.",
"{N} is a synthetic peptide supplied exclusively for in-vitro laboratory research into GLP-{#} and GIP receptor signalling. Each vial contains a lyophilised compound. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.": "{N} ist ein synthetisches Peptid, ausschließlich für die In-vitro-Laborforschung zur GLP-{#}- und GIP-Rezeptor-Signalübertragung geliefert. Jedes Fläschchen enthält eine lyophilisierte Verbindung. Der Janoshik-Analysebericht wird veröffentlicht, sobald die Charge getestet ist. Kein Arzneimittel, Nahrungsergänzungsmittel oder Kosmetikum. Nicht zur Anwendung am Menschen oder Tier.",
"{N} is a synthetic peptide supplied exclusively for in-vitro laboratory research into GLP-{#} receptor signalling. Each vial contains a lyophilised compound. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.": "{N} ist ein synthetisches Peptid, ausschließlich für die In-vitro-Laborforschung zur GLP-{#}-Rezeptor-Signalübertragung geliefert. Jedes Fläschchen enthält eine lyophilisierte Verbindung. Der Janoshik-Analysebericht wird veröffentlicht, sobald die Charge getestet ist. Kein Arzneimittel, Nahrungsergänzungsmittel oder Kosmetikum. Nicht zur Anwendung am Menschen oder Tier.",
"{N} is a synthetic peptide supplied exclusively for in-vitro laboratory research into GLP-{#}, GIP, and glucagon receptor signalling. Each vial contains lyophilized peptide with batch-specific analytical documentation by Janoshik Analytical (Czech Republic). Not a medicine, supplement, or cosmetic. Not for human or veterinary use.": "{N} ist ein synthetisches Peptid, ausschließlich für die In-vitro-Laborforschung zur Signalübertragung über GLP-{#}-, GIP- und Glukagon-Rezeptoren geliefert. Jedes Fläschchen enthält lyophilisiertes Peptid mit chargenspezifischer Analysedokumentation von Janoshik Analytical (Tschechische Republik). Kein Arzneimittel, Nahrungsergänzungsmittel oder Kosmetikum. Nicht zur Anwendung am Menschen oder Tier.",
"{N} is a synthetic small molecule NNMT inhibitor supplied exclusively for in-vitro laboratory research into cellular metabolism and adipocyte signalling. Each vial contains a lyophilised compound. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.": "{N} ist ein synthetischer niedermolekularer NNMT-Hemmer, ausschließlich für die In-vitro-Laborforschung zu Zellstoffwechsel und Adipozyten-Signalen geliefert. Jedes Fläschchen enthält eine lyophilisierte Verbindung. Der Janoshik-Analysebericht wird veröffentlicht, sobald die Charge getestet ist. Kein Arzneimittel, Nahrungsergänzungsmittel oder Kosmetikum. Nicht zur Anwendung am Menschen oder Tier.",
"{N} is a synthetic tetrapeptide (Ala-Glu-Asp-Gly), supplied for research into telomerase activation, pineal gland signalling, and longevity pathways.": "{N} ist ein synthetisches Tetrapeptid (Ala-Glu-Asp-Gly) für die Forschung zu Telomerase-Aktivierung, Signalen der Zirbeldrüse und Langlebigkeitswegen.",
"{N} is a synthetic tripeptide, supplied for research into neuroprotection and cognitive longevity signalling pathways.": "{N} ist ein synthetisches Tripeptid für die Forschung zu Neuroprotektion und Signalwegen der kognitiven Langlebigkeit.",
"{N} is a thymus-derived peptide complex, supplied for research into immune function, thymic regulation, and age-related immunology.": "{N} ist ein aus dem Thymus gewonnener Peptidkomplex für die Forschung zu Immunfunktion, Thymusregulation und altersbedingter Immunologie.",
"{N} is a {#}-amino acid mitochondrial-derived peptide, supplied for research into metabolic homeostasis, insulin sensitivity, and cellular stress response pathways.": "{N} ist ein mitochondrial kodiertes Peptid aus {#} Aminosäuren für die Forschung zu Stoffwechselhomöostase, Insulinsensitivität und zellulären Stressreaktionen.",
"{N} is an {#}-amino acid peptide derived from erythropoietin, supplied for research into innate repair receptor signalling and neuroprotection.": "{N} ist ein von Erythropoetin abgeleitetes Peptid aus {#} Aminosäuren für die Forschung zur Signalübertragung über den angeborenen Reparaturrezeptor und zur Neuroprotektion.",
"{N} is our flagship triple-peptide research blend containing {N} ({#}mg), {N} ({#}mg), and {N} ({#}mg) in a single lyophilized vial. Formulated for researchers investigating comprehensive regenerative signalling across multiple pathways simultaneously.": "{N} ist unsere Flaggschiff-Forschungsmischung aus drei Peptiden: {N} ({#}mg), {N} ({#}mg) und {N} ({#}mg) in einem einzigen lyophilisierten Fläschchen. Entwickelt für Forschende, die regenerative Signale über mehrere Wege gleichzeitig untersuchen.",
"{N} is our premium four-peptide research complex containing {N} ({#}mg), {N} ({#}mg), {N} ({#}mg), and {N} ({#}mg) in a single lyophilized vial. The most comprehensive regenerative research blend in our catalog.": "{N} ist unser Premium-Forschungskomplex aus vier Peptiden: {N} ({#}mg), {N} ({#}mg), {N} ({#}mg) und {N} ({#}mg) in einem einzigen lyophilisierten Fläschchen. Die umfassendste regenerative Forschungsmischung unseres Katalogs.",
"{N} is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised compound. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.": "{N} wird ausschließlich für die In-vitro-Laborforschung geliefert. Jedes Fläschchen enthält eine lyophilisierte Verbindung. Der Janoshik-Analysebericht wird veröffentlicht, sobald die Charge getestet ist. Kein Arzneimittel, Nahrungsergänzungsmittel oder Kosmetikum. Nicht zur Anwendung am Menschen oder Tier.",
"{N} is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised peptide. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.": "{N} wird ausschließlich für die In-vitro-Laborforschung geliefert. Jedes Fläschchen enthält ein lyophilisiertes Peptid. Der Janoshik-Analysebericht wird veröffentlicht, sobald die Charge getestet ist. Kein Arzneimittel, Nahrungsergänzungsmittel oder Kosmetikum. Nicht zur Anwendung am Menschen oder Tier.",
"{N} is supplied exclusively for in-vitro laboratory research. Each vial contains lyophilized compound. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.": "{N} wird ausschließlich für die In-vitro-Laborforschung geliefert. Jedes Fläschchen enthält eine lyophilisierte Verbindung. Kein Arzneimittel, Nahrungsergänzungsmittel oder Kosmetikum. Nicht zur Anwendung am Menschen oder Tier.",
"· instead of {#}€": "· statt {#}€",
"· only {#} vials left from the analysed batch": "· nur noch {#} Fläschchen aus der analysierten Charge",
"· research format: {#} vials minimum (−{#}%)": "· Forschungsformat: mindestens {#} Fläschchen (−{#} %)",
"≥{#}% target (HPLC)": "≥{#} % Zielwert (HPLC)",
"Acetic Acid Water {#}%": "Essigsäure-Wasser {#} %",
"All": "Alle",
"All compounds": "Alle Verbindungen",
"Bacteriostatic Water": "Bakteriostatisches Wasser",
"CJC-{#} (no DAC)": "CJC-{#} (ohne DAC)",
"CJC-{#} (with DAC)": "CJC-{#} (mit DAC)",
"GHK-Copper": "GHK-Kupfer",
"HGH Fragment {#}-{#}": "HGH-Fragment {#}-{#}",
"Lyophilised peptides supplied exclusively for in-vitro research. Published analysis reports are marked COA.": "Lyophilisierte Peptide ausschließlich für die In-vitro-Forschung. Veröffentlichte Analyseberichte sind mit COA gekennzeichnet.",
"Made to order": "Auf Bestellung",
"Research catalogue": "Forschungskatalog",
"{#}mg total": "{#}mg gesamt",
"{#}mg total (BPC{#}+TB{#}) · {#}mg total (BPC{#}+TB{#})": "{#}mg gesamt (BPC{#}+TB{#}) · {#}mg gesamt (BPC{#}+TB{#})",
"{#}ml vial": "{#}-ml-Fläschchen",
"{N} {#}mg total (BPC{#}+TB{#}) — Novalyx Research": "{N} {#}mg gesamt (BPC{#}+TB{#}) — Novalyx Research",
"{N} {#}mg total — Novalyx Research": "{N} {#}mg gesamt — Novalyx Research",
"{N} {#}ml vial — Novalyx Research": "{N} {#}-ml-Fläschchen — Novalyx Research",
"Analyses ordered by Novalyx on its own batches. Each new batch is analysed in turn and its report is published here.": "Von Novalyx für die eigenen Chargen in Auftrag gegebene Analysen. Jede neue Charge wird ihrerseits analysiert und ihr Bericht hier veröffentlicht.",
"Analysis pending": "Analyse ausstehend",
"Each report below was issued by Janoshik Analytical (Czech Republic). Each link opens the original report on Janoshik's website: it cannot be altered.": "Jeder der folgenden Berichte wurde von Janoshik Analytical (Tschechische Republik) ausgestellt. Jeder Link öffnet den Originalbericht auf der Website von Janoshik: Er kann nicht verändert werden.",
"Measured": "Gemessen",
"Name on report": "Name im Bericht",
"Published analyses": "Veröffentlichte Analysen",
"Reports for these compounds will be published once the first batch has been analysed. Questions are welcome.": "Die Berichte zu diesen Verbindungen werden veröffentlicht, sobald die erste Charge analysiert ist. Fragen sind willkommen.",
"Task · key": "Auftrag · Schlüssel",
"Transparency": "Transparenz",
"View report": "Bericht ansehen",
"A coenzyme central to cellular-energy and mitochondrial research, used in a wide range of biochemical assays.": "Ein zentrales Coenzym in der Forschung zu Zellenergie und Mitochondrien, eingesetzt in zahlreichen biochemischen Assays.",
"A copper-binding tripeptide investigated in skin-biology and extracellular-matrix research models.": "Ein kupferbindendes Tripeptid, untersucht in Forschungsmodellen der Hautbiologie und der extrazellulären Matrix.",
"A dual-receptor research peptide used as a reference compound in metabolic signalling studies.": "Ein Dual-Rezeptor-Forschungspeptid, das als Referenzverbindung in Studien zur Stoffwechselsignalisierung dient.",
"A mitochondrial-derived peptide investigated in metabolic and cellular-energy research.": "Ein mitochondrial kodiertes Peptid, untersucht in der Stoffwechsel- und Zellenergieforschung.",
"A multi-receptor research compound studied in metabolic-pathway investigations. Of interest in laboratory studies examining receptor signalling.": "Eine Multi-Rezeptor-Forschungsverbindung, untersucht in Studien zu Stoffwechselwegen. Von Interesse für Laborstudien zur Rezeptor-Signalübertragung.",
"A peptide studied in immune-modulation and T-cell research models.": "Ein Peptid, untersucht in Forschungsmodellen zu Immunmodulation und T-Zellen.",
"A research peptide referenced in growth-hormone secretagogue and receptor-signalling studies.": "Ein Forschungspeptid, referenziert in Studien zu Wachstumshormon-Sekretagogen und Rezeptor-Signalübertragung.",
"A research peptide widely referenced in receptor-binding and metabolic-pathway laboratory studies.": "Ein Forschungspeptid, das in Laborstudien zu Rezeptorbindung und Stoffwechselwegen häufig referenziert wird.",
"A synthetic peptide fragment studied in laboratory models for its role in tissue-repair and angiogenesis research. Frequently used as a reference compound in tissue-repair assays.": "Ein synthetisches Peptidfragment, in Labormodellen zu Gewebereparatur und Angiogenese untersucht. Häufig als Referenzverbindung in Gewebereparatur-Assays eingesetzt.",
"A synthetic peptide investigated in neuromodulation and neuroprotection research.": "Ein synthetisches Peptid, untersucht in der Forschung zu Neuromodulation und Neuroprotektion.",
"A synthetic tetrapeptide studied in telomere-biology and cellular-ageing research models.": "Ein synthetisches Tetrapeptid, untersucht in Forschungsmodellen zu Telomerbiologie und Zellalterung.",
"A synthetic version of a naturally occurring peptide region studied for cell-migration and actin-regulation research in controlled settings.": "Eine synthetische Version einer natürlich vorkommenden Peptidregion, untersucht in der Forschung zu Zellmigration und Aktinregulation unter kontrollierten Bedingungen.",
"Cognitive research": "Kognitive Forschung",
"Factual, strictly scientific information on catalogue compounds. No health claims.": "Sachliche, rein wissenschaftliche Informationen zu den Verbindungen des Katalogs. Keine gesundheitsbezogenen Aussagen.",
"GH research": "GH-Forschung",
"GHK-Cu (GHK-Cuivre)": "GHK-Cu (GHK-Kupfer)",
"Immune research": "Immunforschung",
"Longevity research": "Langlebigkeitsforschung",
"Metabolic research": "Stoffwechselforschung",
"Regenerative research": "Regenerationsforschung",
"Resources": "Ressourcen",
"Novalyx Research is a French company registered in Paris. It supplies lyophilised research peptides to laboratories, researchers and professionals.": "Novalyx Research ist ein in Paris eingetragenes französisches Unternehmen. Es liefert lyophilisierte Forschungspeptide an Labore, Forschende und Fachleute.",
"Our products are not medicines, dietary supplements or cosmetics. They are supplied exclusively for in-vitro research.": "Unsere Produkte sind weder Arzneimittel noch Nahrungsergänzungsmittel noch Kosmetika. Sie werden ausschließlich für die In-vitro-Forschung geliefert.",
"Paris, France": "Paris, Frankreich",
"Registered": "Eingetragen",
"Testing lab": "Prüflabor",
"The rigour of a laboratory,": "Die Sorgfalt eines Labors,",
"The sector is full of unverifiable promises. Our position is simple: claim nothing that cannot be checked. Analyses are entrusted to an independent laboratory, and every published report carries a key that lets anyone verify it at the source.": "Die Branche ist voller unüberprüfbarer Versprechen. Unsere Haltung ist einfach: nichts behaupten, was sich nicht überprüfen lässt. Die Analysen werden einem unabhängigen Labor anvertraut, und jeder veröffentlichte Bericht trägt einen Schlüssel, mit dem ihn jeder an der Quelle überprüfen kann.",
"not the noise": "nicht der Lärm",
"of a shop.": "eines Ladens.",
"Are these products legal in my country?": "Sind diese Produkte in meinem Land legal?",
"Do the published reports match my vial?": "Entsprechen die veröffentlichten Berichte meinem Fläschchen?",
"Frequently asked questions": "Häufig gestellte Fragen",
"How do I pay?": "Wie bezahle ich?",
"How do I track my order?": "Wie verfolge ich meine Bestellung?",
"How long is delivery?": "Wie lange dauert die Lieferung?",
"How should compounds be stored?": "Wie sollten die Verbindungen gelagert werden?",
"Substances supplied exclusively for scientific laboratory research. They are not intended for human or veterinary use, consumption or therapeutic purposes.": "Substanzen, die ausschließlich für die wissenschaftliche Laborforschung geliefert werden. Sie sind nicht zur Anwendung am Menschen oder Tier, zum Verzehr oder für therapeutische Zwecke bestimmt.",
"What are research peptides?": "Was sind Forschungspeptide?",
"What does \"made to order\" mean?": "Was bedeutet „auf Bestellung“?",
"What is a certificate of analysis (COA)?": "Was ist ein Analysezertifikat (COA)?",
"What is your returns policy?": "Wie sieht Ihre Rückgaberegelung aus?",
"Who can order from Novalyx?": "Wer kann bei Novalyx bestellen?",
"Why is there a minimum on some products?": "Warum gibt es bei manchen Produkten eine Mindestmenge?",
". An invoice appears with a QR code and the exact amount, valid for {#} minutes.": ". Eine Rechnung mit QR-Code und dem genauen Betrag erscheint, {#} Minuten gültig.",
". Buy your order amount, plus {#}€–{#} for sending fees.": ". Kaufen Sie den Betrag Ihrer Bestellung plus {#}€–{#} für die Versandgebühren.",
"A small difference, up to {#}%, is accepted automatically. If more is missing, the invoice shows the remaining amount to send.": "Eine kleine Abweichung bis {#} % wird automatisch akzeptiert. Fehlt mehr, zeigt die Rechnung den noch zu sendenden Betrag an.",
"Check that the amount received matches.": "Prüfen Sie, ob der empfangene Betrag übereinstimmt.",
"Confirm. That's it.": "Bestätigen. Das war's.",
"Confirmation email": "Bestätigungs-E-Mail",
"Confirmed in {#}–{#} min": "Bestätigt in {#}–{#} Min.",
"Crypto": "Krypto",
"Direct payment": "Direkte Zahlung",
"Discreet": "Diskret",
"Email us and we'll guide you step by step, the first time and every time after.": "Schreiben Sie uns, wir führen Sie Schritt für Schritt — beim ersten Mal und auch danach.",
"Got Revolut?": "Sie haben Revolut?",
"How long does confirmation take?": "Wie lange dauert die Bestätigung?",
"I paid slightly less because of fees.": "Ich habe wegen der Gebühren etwas weniger bezahlt.",
"If you can shop online, you can pay with Bitcoin. Allow": "Wer online einkaufen kann, kann auch mit Bitcoin bezahlen. Rechnen Sie mit",
"In the cart, choose": "Wählen Sie im Warenkorb",
"In your app, tap “Send” or “Withdraw”.": "Tippen Sie in Ihrer App auf „Senden“ oder „Auszahlen“.",
"It's a direct payment with no banking intermediary. Your bank statement only shows the Bitcoin purchase on your platform. The amount is always calculated in euros.": "Es ist eine direkte Zahlung ohne Bank als Vermittler. Auf Ihrem Kontoauszug erscheint nur der Bitcoin-Kauf auf Ihrer Plattform. Der Betrag wird immer in Euro berechnet.",
"Made-to-order product?": "Produkt auf Bestellung?",
"My invoice expired.": "Meine Rechnung ist abgelaufen.",
"On first sign-up the platform verifies your identity: from a few minutes to a day. Do it before ordering.": "Bei der ersten Anmeldung prüft die Plattform Ihre Identität: einige Minuten bis ein Tag. Erledigen Sie das vor der Bestellung.",
"Open the": "Öffnen Sie den Tab",
"Otherwise: Kraken or Coinbase.": "Sonst: Kraken oder Coinbase.",
"Pay with Bitcoin in three steps.": "Mit Bitcoin bezahlen in drei Schritten.",
"Payment confirmed": "Zahlung bestätigt",
"Payment sent": "Zahlung gesendet",
"Scan the invoice QR code.": "Scannen Sie den QR-Code der Rechnung.",
"Shipped": "Versandt",
"Simply place the order again. If you had already sent the payment, email us with the time it was sent: we will find it.": "Geben Sie die Bestellung einfach erneut auf. Falls Sie die Zahlung schon gesendet hatten, schreiben Sie uns mit der Uhrzeit des Versands: Wir finden sie.",
"Stuck at a step?": "Bei einem Schritt hängen geblieben?",
"THE FASTEST WAY": "DER SCHNELLSTE WEG",
"Usually {#} to {#} minutes, depending on Bitcoin network activity. You get an email as soon as it's confirmed.": "Meist {#} bis {#} Minuten, je nach Auslastung des Bitcoin-Netzwerks. Sie erhalten eine E-Mail, sobald die Zahlung bestätigt ist.",
"What happens next?": "Wie geht es weiter?",
"Why Bitcoin?": "Warum Bitcoin?",
"after that.": "danach.",
"batch received, then analysed by Janoshik: an email at every step": "Charge empfangen, dann von Janoshik analysiert: bei jedem Schritt eine E-Mail",
"from your app": "aus Ihrer App",
"tab, then": ", dann",
"the first time,": "beim ersten Mal,",
"usually within {#} to {#} minutes": "meist innerhalb von {#} bis {#} Minuten",
"with your tracking number": "mit Ihrer Sendungsnummer",
"your order is approved": "Ihre Bestellung ist bestätigt",
"{#} min": "{#} Min.",
"{#} minutes": "{#} Minuten",
"~{#} min": "~{#} Min.",
"“Pay with Bitcoin”": "„Mit Bitcoin bezahlen“",
"A commission on every order placed with your code.": "Eine Provision auf jede Bestellung mit Ihrem Code.",
"A monthly email recap of the sales your code generated.": "Eine monatliche E-Mail-Übersicht der Verkäufe über Ihren Code.",
"A unique promo code under your name, valid across the catalogue.": "Ein persönlicher Rabattcode auf Ihren Namen, gültig im ganzen Katalog.",
"Ambassador Program": "Botschafterprogramm",
"An instant discount at checkout.": "Ein sofortiger Rabatt an der Kasse.",
"Audience size (optional)": "Reichweite (optional)",
"Do you create content around research, laboratories, or scientific wellness? Novalyx offers a personal code giving your audience a discount, and a commission on the sales it generates.": "Sie erstellen Inhalte rund um Forschung, Labore oder wissenschaftliches Wohlbefinden? Novalyx bietet einen persönlichen Code mit Rabatt für Ihr Publikum und eine Provision auf die damit erzielten Verkäufe.",
"Each application is reviewed individually. The program is aimed at creators covering scientific, laboratory and research content. As with the rest of the catalogue, all communication must stay within a laboratory-research framework — research use only.": "Jede Bewerbung wird einzeln geprüft. Das Programm richtet sich an Creator mit wissenschaftlichen, Labor- und Forschungsinhalten. Wie beim gesamten Katalog muss jede Kommunikation im Rahmen der Laborforschung bleiben — nur für Forschungszwecke.",
"For you": "Für Sie",
"For your audience": "Für Ihr Publikum",
"Handle / account link": "Profilname / Link zum Konto",
"How it works": "So funktioniert es",
"Message": "Nachricht",
"Partnerships": "Partnerschaften",
"Platform (Instagram, TikTok, YouTube…)": "Plattform (Instagram, TikTok, YouTube…)",
"Send application": "Bewerbung senden",
"Tell us about your audience and your interest in research.": "Erzählen Sie uns von Ihrem Publikum und Ihrem Interesse an Forschung.",
"Terms": "Bedingungen",
"Tracking": "Auswertung",
"Address": "Adresse",
"Bank transfer is available for all orders, even small ones. The simplest way: \"Pay by bank transfer\" in the cart, or write to us at contact@novalyxresearch.com to confirm the amount (delivery included) and the order reference.": "Banküberweisung ist für alle Bestellungen möglich, auch für kleine. Am einfachsten: „Per Banküberweisung bezahlen“ im Warenkorb, oder schreiben Sie uns an contact@novalyxresearch.com, um den Betrag (inklusive Versand) und die Bestellreferenz zu bestätigen.",
"Email": "E-Mail",
"Legal account holder": "Rechtlicher Kontoinhaber",
"Payment by bank transfer": "Zahlung per Banküberweisung",
"Products, orders, documents, professional pricing: reply within one business day.": "Produkte, Bestellungen, Dokumente, Fachpreise: Antwort innerhalb eines Werktags.",
"Reply": "Antwort",
"Send": "Senden",
"Subject": "Betreff",
"The legal holder name must match what your bank shows when you initiate the transfer (mandatory beneficiary verification requirement).": "Der Name des rechtlichen Kontoinhabers muss mit dem übereinstimmen, was Ihre Bank bei der Überweisung anzeigt (gesetzlich vorgeschriebene Empfängerüberprüfung).",
"Within {#} business day": "Innerhalb von {#} Werktag",
"Write to us.": "Schreiben Sie uns.",
"\"D-retro-inverso\" peptide designed to disrupt the interaction between the FOXO{#} and p{#} proteins, studied in senescent-cell models (so-called senolytic research).": "„D-Retro-Inverso“-Peptid, das die Wechselwirkung zwischen den Proteinen FOXO{#} und p{#} stören soll, untersucht in Modellen seneszenter Zellen (sogenannte senolytische Forschung).",
"/ {#} mg": "/ {#} mg",
"Acetylated octapeptide (acetyl octapeptide-{#}) used as a cosmetic ingredient; its sequence mimics part of the SNAP-{#} protein, involved in the SNARE complex of neurotransmitter release.": "Acetyliertes Octapeptid (Acetyl-Octapeptid-{#}), als kosmetischer Wirkstoff verwendet; seine Sequenz ahmt einen Teil des Proteins SNAP-{#} nach, das am SNARE-Komplex beteiligt ist.",
"Afamelanotide is authorised as an implant (brand Scenesse) for a specific indication (erythropoietic protoporphyria) in the EU and the United States. The Novalyx product is a research compound, not that medicine.": "Afamelanotid ist als Implantat (Marke Scenesse) für eine bestimmte Indikation (erythropoetische Protoporphyrie) in der EU und den USA zugelassen. Das Novalyx-Produkt ist eine Forschungsverbindung, nicht dieses Arzneimittel.",
"Approved in China (NMPA, June {#}) for chronic weight management in adults; to our knowledge not approved in the EU or the United States.": "In China zugelassen (NMPA, Juni {#}) für das chronische Gewichtsmanagement bei Erwachsenen; unseres Wissens in der EU und den USA nicht zugelassen.",
"Authorised in the United States (brand Egrifta) for a specific indication (HIV-associated abdominal lipodystrophy). The Novalyx product is a research compound, not that medicine.": "In den USA (Marke Egrifta) für eine bestimmte Indikation zugelassen (HIV-assoziierte abdominale Lipodystrophie). Das Novalyx-Produkt ist eine Forschungsverbindung, nicht dieses Arzneimittel.",
"Authorised in the United States (brand Vyleesi) for a specific indication. The Novalyx product is a research compound, not that medicine.": "In den USA (Marke Vyleesi) für eine bestimmte Indikation zugelassen. Das Novalyx-Produkt ist eine Forschungsverbindung, nicht dieses Arzneimittel.",
"Authorised medicine (FDA and EMA) under the brands Mounjaro and Zepbound. The Novalyx product is a research compound and is not that medicine.": "Zugelassenes Arzneimittel (FDA und EMA) unter den Marken Mounjaro und Zepbound. Das Novalyx-Produkt ist eine Forschungsverbindung und nicht dieses Arzneimittel.",
"Authorised medicine under the brands Ozempic, Wegovy and Rybelsus. The Novalyx product is a research compound and is not that medicine.": "Zugelassenes Arzneimittel unter den Marken Ozempic, Wegovy und Rybelsus. Das Novalyx-Produkt ist eine Forschungsverbindung und nicht dieses Arzneimittel.",
"Blend of two heptapeptides: {N}, an analogue of the ACTH({#}-{#}) fragment, and {N}, an analogue of tuftsin. Each is studied for its neuromodulatory effects.": "Mischung aus zwei Heptapeptiden: {N}, einem Analogon des ACTH({#}-{#})-Fragments, und {N}, einem Analogon von Tuftsin. Beide werden auf ihre neuromodulatorischen Wirkungen untersucht.",
"Blend of {N} (GLP-{#}, GIP and glucagon receptor agonist) and cagrilintide (long-acting amylin analogue), two molecules in clinical development.": "Mischung aus {N} (Agonist der GLP-{#}-, GIP- und Glukagon-Rezeptoren) und Cagrilintid (lang wirkendes Amylin-Analogon), zwei Moleküle in klinischer Entwicklung.",
"Both components are investigational molecules, not authorised as medicines.": "Beide Bestandteile sind Prüfsubstanzen, nicht als Arzneimittel zugelassen.",
"By card through Stripe (your payment data never touches our servers), or by bank transfer, even for a small order: choose \"Pay by bank transfer\" in the cart. The order is shipped once the transfer is received.": "Per Karte über Stripe (Ihre Zahlungsdaten berühren nie unsere Server) oder per Banküberweisung, auch bei kleinen Bestellungen: Wählen Sie „Per Banküberweisung bezahlen“ im Warenkorb.",
"C-terminal fragment (amino acids {#} to {#}) of human growth hormone, studied for its activity on fat metabolism without the growth effects of the whole hormone. {N} is a modified version of it.": "C-terminales Fragment (Aminosäuren {#} bis {#}) des menschlichen Wachstumshormons, untersucht auf seine Wirkung auf den Fettstoffwechsel ohne die Wachstumseffekte des ganzen Hormons. {N} ist eine modifizierte Version davon.",
"Coenzyme (nicotinamide adenine dinucleotide) present in all cells: cofactor of redox reactions in energy metabolism and substrate of enzymes such as sirtuins and PARPs.": "Coenzym (Nicotinamid-Adenin-Dinukleotid), in allen Zellen vorhanden: Cofaktor der Redoxreaktionen im Energiestoffwechsel und Substrat von Enzymen wie den Sirtuinen.",
"Coming soon": "Demnächst",
"Coming soon — notify me": "Demnächst — benachrichtigen Sie mich",
"Complex of polypeptides extracted from (calf) thymus, studied mainly in the Russian literature for immune regulation and ageing.": "Aus dem (Kälber-)Thymus gewonnener Polypeptidkomplex, vor allem in der russischen Fachliteratur zu Immunregulation und Alterung untersucht.",
"Copper complex of the tripeptide Ala-His-Lys, used as a cosmetic ingredient and studied in skin and hair-follicle cell models.": "Kupferkomplex des Tripeptids Ala-His-Lys, als kosmetischer Wirkstoff verwendet und in Haut- und Haarfollikel-Zellmodellen untersucht.",
"Cosmetic ingredient (topical use); efficacy data come mostly from manufacturers. No medicine status.": "Kosmetischer Wirkstoff (topische Anwendung); Wirksamkeitsdaten stammen überwiegend von Herstellern. Kein Arzneimittelstatus.",
"Cosmetic ingredient; no medicine status.": "Kosmetischer Wirkstoff; kein Arzneimittelstatus.",
"Cyclic peptide (bremelanotide), agonist of melanocortin receptors (notably MC{#}R), related to melanotan II.": "Zyklisches Peptid (Bremelanotid), Agonist der Melanocortin-Rezeptoren (insbesondere MC{#}R), verwandt mit Melanotan II.",
"Details": "Details",
"Dual agonist of the GIP and GLP-{#} receptors ({#}-amino-acid peptide, Eli Lilly).": "Dualer Agonist der GIP- und GLP-{#}-Rezeptoren ({#}-Aminosäuren-Peptid, Eli Lilly).",
"Dual agonist of the GLP-{#} and glucagon receptors (IBI{#} / LY{#}), developed by Innovent (China) under licence from Eli Lilly.": "Dualer Agonist der GLP-{#}- und Glukagon-Rezeptoren (IBI{#} / LY{#}), entwickelt von Innovent (China) unter Lizenz von Eli Lilly.",
"Dual agonist of the glucagon and GLP-{#} receptors, developed by Boehringer Ingelheim (BI {#}).": "Dualer Agonist der Glukagon- und GLP-{#}-Rezeptoren, entwickelt von Boehringer Ingelheim (BI {#}).",
"Elamipretide is approved in the United States (FDA, accelerated approval, September {#}, brand Forzinity) only for Barth syndrome. The Novalyx product is a research compound, not that medicine.": "Elamipretid ist in den USA (FDA, beschleunigte Zulassung, September {#}, Marke Forzinity) nur für das Barth-Syndrom zugelassen. Das Novalyx-Produkt ist eine Forschungsverbindung, nicht dieses Arzneimittel.",
"Endogenous molecule studied in the laboratory. No authorisation as a medicine for the forms sold here; associated health claims are not validated by authorities.": "Körpereigenes Molekül, im Labor untersucht. Keine Arzneimittelzulassung für die hier verkauften Formen; damit verbundene gesundheitsbezogene Aussagen sind von Behörden nicht bestätigt.",
"Enlarge the photo": "Foto vergrößern",
"Experimental compound; no medicine authorisation.": "Experimentelle Verbindung; keine Arzneimittelzulassung.",
"Factual, strictly scientific information on the {#} compounds in the catalogue: what each molecule is and its regulatory status. No health claims.": "Sachliche, streng wissenschaftliche Informationen zu den {#} Verbindungen des Katalogs: was jedes Molekül ist und welchen regulatorischen Status es hat. Keine gesundheitsbezogenen Aussagen.",
"Format": "Format",
"Fragment {#}-{#} of human GHRH (sermorelin), which activates the GHRH receptor.": "Fragment {#}-{#} des menschlichen GHRH (Sermorelin), das den GHRH-Rezeptor aktiviert.",
"Fusion protein (soluble activin type IIB receptor coupled to an antibody fragment) that captures myostatin and related molecules. Its clinical trials were stopped in {#}.": "Fusionsprotein (löslicher Aktivin-Rezeptor Typ IIB, gekoppelt an ein Antikörperfragment), das Myostatin und verwandte Moleküle bindet. Seine klinischen Studien wurden {#} gestoppt.",
"GHRH analogue (\"no DAC\" version: modified {#}-{#} sequence, also called modified GRF {#}-{#}), designed for better stability.": "GHRH-Analogon (Version „ohne DAC“: modifizierte {#}-{#}-Sequenz, auch modifiziertes GRF {#}-{#} genannt), auf bessere Stabilität ausgelegt.",
"GHRH({#}-{#}) analogue fitted with a \"DAC\" (drug affinity complex) that binds albumin and greatly extends its duration of action. Its clinical development was stopped in the mid-{#}s.": "GHRH({#}-{#})-Analogon mit einem „DAC“ (Drug Affinity Complex), der an Albumin bindet und die Wirkdauer stark verlängert. Seine klinische Entwicklung wurde Mitte der {#}er-Jahre eingestellt.",
"GLP-{#} receptor agonist (acylated analogue of human GLP-{#}), developed by Novo Nordisk.": "GLP-{#}-Rezeptoragonist (acyliertes Analogon des menschlichen GLP-{#}), entwickelt von Novo Nordisk.",
"Index": "Index",
"Investigational drug (phase {#} clinical trials); not authorised.": "Prüfpräparat (klinische Studien der Phase {#}); nicht zugelassen.",
"Investigational drug in advanced development, alone and in combination with semaglutide (CagriSema). Status is evolving: refer to health authorities for the current situation.": "Prüfpräparat in fortgeschrittener Entwicklung, allein und in Kombination mit Semaglutid (CagriSema). Der Status entwickelt sich: Für die aktuelle Lage wenden Sie sich an die Gesundheitsbehörden.",
"Investigational drug, in phase {#} clinical trials; to our knowledge not authorised.": "Prüfpräparat in klinischen Studien der Phase {#}; unseres Wissens nicht zugelassen.",
"Investigational drug: in phase {#} clinical trials, not authorised to date. According to the company's announcements, a US marketing application is targeted for early {#}. The Novalyx product is a research compound, not a medicine.": "Prüfpräparat: in klinischen Studien der Phase {#}, bislang nicht zugelassen. Laut Unternehmensangaben ist ein US-Zulassungsantrag für Anfang {#} geplant. Das Novalyx-Produkt ist eine Forschungsverbindung, kein Arzneimittel.",
"Investigational molecule in clinical trials; not authorised as a medicine.": "Prüfsubstanz in klinischen Studien; nicht als Arzneimittel zugelassen.",
"Its pharmaceutical form (thymalfasin, brand Zadaxin) is authorised in several countries, mainly in Asia, for certain indications; it is not authorised in the United States. The Novalyx product is a research compound.": "Seine pharmazeutische Form (Thymalfasin, Marke Zadaxin) ist in mehreren Ländern, vor allem in Asien, für bestimmte Indikationen zugelassen; in den USA ist sie nicht zugelassen. Das Novalyx-Produkt ist eine Forschungsverbindung.",
"KTTKS pentapeptide coupled to palmitic acid, a cosmetic ingredient studied for collagen synthesis in skin models.": "Pentapeptid KTTKS, gekoppelt an Palmitinsäure, ein kosmetischer Wirkstoff, der in Hautmodellen zur Kollagensynthese untersucht wird.",
"Laboratory reagent.": "Laborreagenz.",
"Laboratory solvent: it contains no active substance.": "Laborlösungsmittel: Es enthält keinen Wirkstoff.",
"Long-acting amylin analogue (amylin is a hormone co-secreted with insulin), developed by Novo Nordisk. It acts on amylin and calcitonin receptors.": "Lang wirkendes Amylin-Analogon (Amylin ist ein zusammen mit Insulin ausgeschüttetes Hormon), entwickelt von Novo Nordisk. Es wirkt auf Amylin- und Calcitonin-Rezeptoren.",
"Long-acting selective amylin receptor agonist, in clinical development.": "Lang wirkender selektiver Amylin-Rezeptoragonist in klinischer Entwicklung.",
"Marketed as a medicine in some countries (including Austria, Russia, China); not authorised in the United States. Clinical evidence of efficacy remains debated.": "In einigen Ländern als Arzneimittel vermarktet (darunter Österreich, Russland, China); in den USA nicht zugelassen. Der klinische Wirksamkeitsnachweis bleibt umstritten.",
"Modified fragment of human growth hormone (amino acids {#}-{#}, with an added tyrosine), studied for its link with lipid metabolism.": "Modifiziertes Fragment des menschlichen Wachstumshormons (Aminosäuren {#}-{#}, mit zusätzlichem Tyrosin), untersucht auf seinen Zusammenhang mit dem Fettstoffwechsel.",
"Most requested": "Am meisten gefragt",
"Name": "Name",
"Naturally occurring tripeptide (glycyl-histidyl-lysine) that forms a complex with copper(II). Present in human plasma, it is studied in the laboratory for its role in the extracellular matrix, collagen synthesis and skin biology.": "Natürlich vorkommendes Tripeptid (Glycyl-Histidyl-Lysin), das mit Kupfer(II) einen Komplex bildet. Es kommt im menschlichen Plasma vor und wird im Labor in Modellen zu Gewebereparatur und Hautbiologie untersucht.",
"No authorisation; preclinical data only.": "Keine Zulassung; nur präklinische Daten.",
"No medicine authorisation in any country; no published clinical data.": "Keine Arzneimittelzulassung, in keinem Land; keine veröffentlichten klinischen Daten.",
"No medicine authorisation in the European Union or the United States.": "Keine Arzneimittelzulassung in der Europäischen Union oder den USA.",
"No medicine authorisation.": "Keine Arzneimittelzulassung.",
"No medicine authorisation; clinical development discontinued.": "Keine Arzneimittelzulassung; klinische Entwicklung eingestellt.",
"No medicine authorisation; clinical development stopped.": "Keine Arzneimittelzulassung; klinische Entwicklung gestoppt.",
"Nonapeptide ({#} amino acids) isolated from rabbit brain in {#}, studied for its link with slow-wave sleep. Its exact mechanism remains poorly established.": "Nonapeptid ({#} Aminosäuren), {#} aus Kaninchenhirn isoliert, untersucht auf seinen Zusammenhang mit dem Tiefschlaf. Sein genauer Mechanismus ist weiterhin wenig geklärt.",
"Not authorised as a medicine in any country. Published data come mostly from preclinical (animal) studies; controlled human data are very limited. Listed as prohibited by the World Anti-Doping Agency (WADA).": "In keinem Land als Arzneimittel zugelassen. Veröffentlichte Daten stammen überwiegend aus präklinischen (Tier-)Studien; kontrollierte Humandaten sind sehr begrenzt. Von der Welt-Anti-Doping-Agentur (WADA) als verboten gelistet.",
"Not authorised as a medicine in the EU or the United States; as pralmorelin it has been used in Japan as a diagnostic agent, to our knowledge. Prohibited by WADA.": "In der EU und den USA nicht als Arzneimittel zugelassen; als Pralmorelin wurde es unseres Wissens in Japan als Diagnostikum verwendet. Von der WADA verboten.",
"Not authorised as a medicine in the EU or the United States; limited data, mostly from a small number of laboratories.": "In der EU und den USA nicht als Arzneimittel zugelassen; begrenzte Daten, überwiegend aus wenigen Laboren.",
"Not authorised as a medicine in the United States; aviptadil has been the subject of clinical trials and very limited authorisations depending on the country.": "In den USA nicht als Arzneimittel zugelassen; Aviptadil war Gegenstand klinischer Studien und je nach Land sehr begrenzter Zulassungen.",
"Not authorised as a medicine. Controlled human data are almost non-existent. Prohibited by WADA.": "Nicht als Arzneimittel zugelassen. Kontrollierte Humandaten sind nahezu nicht vorhanden. Von der WADA verboten.",
"Not authorised as a medicine. Prohibited by WADA.": "Nicht als Arzneimittel zugelassen. Von der WADA verboten.",
"Not authorised as a medicine; clinical trials in obesity did not lead to an authorisation.": "Nicht als Arzneimittel zugelassen; klinische Studien zu Adipositas führten zu keiner Zulassung.",
"Not authorised as a medicine; exploratory clinical trials have taken place without authorisation. Prohibited by WADA.": "Nicht als Arzneimittel zugelassen; explorative klinische Studien fanden ohne Zulassung statt. Von der WADA verboten.",
"Not authorised as a medicine; research is essentially in vitro and preclinical.": "Nicht als Arzneimittel zugelassen; die Forschung ist im Wesentlichen in vitro und präklinisch.",
"Not authorised as a medicine; research is essentially preclinical.": "Nicht als Arzneimittel zugelassen; die Forschung ist im Wesentlichen präklinisch.",
"Not authorised as a medicine; research use. Prohibited by WADA.": "Nicht als Arzneimittel zugelassen; Forschungsverwendung. Von der WADA verboten.",
"Not authorised as a medicine; several health authorities (for example in the United Kingdom and Australia) have issued warnings about products sold under this name.": "Nicht als Arzneimittel zugelassen; mehrere Gesundheitsbehörden (zum Beispiel im Vereinigten Königreich und in Australien) haben vor unter diesem Namen verkauften Produkten gewarnt.",
"Not authorised as a medicine; the literature is old and results have been inconsistent.": "Nicht als Arzneimittel zugelassen; die Literatur ist alt und die Ergebnisse waren uneinheitlich.",
"Not authorised as a medicine; used in research studies in reproductive endocrinology.": "Nicht als Arzneimittel zugelassen; in Forschungsstudien der Reproduktionsendokrinologie verwendet.",
"Not authorised in the EU or the United States; data come mostly from the Russian literature.": "In der EU und den USA nicht zugelassen; die Daten stammen überwiegend aus der russischen Fachliteratur.",
"Not authorised in the EU or the United States; the literature is limited and rarely independently replicated.": "In der EU und den USA nicht zugelassen; die Literatur ist begrenzt und selten unabhängig repliziert.",
"Novalyx research blend of four compounds: {N} ({#} mg) + GHK-Cu ({#} mg) + {N} ({#} mg) + {N} ({#} mg) in a single lyophilised vial. See their entries for the nature of each component.": "Novalyx-Forschungsmischung aus vier Verbindungen: {N} ({#} mg) + GHK-Cu ({#} mg) + {N} ({#} mg) + {N} ({#} mg) in einem einzigen lyophilisierten Fläschchen. Siehe deren Einträge zur Natur der einzelnen Bestandteile.",
"Novalyx research blend of three compounds: {N} ({#} mg) + GHK-Cu ({#} mg) + {N} ({#} mg) in a single lyophilised vial. See their entries for the nature of each component.": "Novalyx-Forschungsmischung aus drei Verbindungen: {N} ({#} mg) + GHK-Cu ({#} mg) + {N} ({#} mg) in einem einzigen lyophilisierten Fläschchen. Siehe deren Einträge zur Natur der einzelnen Bestandteile.",
"Novalyx research blend of two compounds: CJC-{#} no DAC ({#} mg) + ipamorelin ({#} mg) in a single lyophilised vial. See their entries for the nature of each component.": "Novalyx-Forschungsmischung aus zwei Verbindungen: CJC-{#} ohne DAC ({#} mg) + Ipamorelin ({#} mg) in einem einzigen lyophilisierten Fläschchen. Siehe deren Einträge zur Natur der einzelnen Bestandteile.",
"Novalyx research blend of two compounds: cagrilintide + semaglutide, in two sizes ({#} mg + {#} mg; {#} mg + {#} mg). See the {N} and {N} entries.": "Novalyx-Forschungsmischung aus zwei Verbindungen: Cagrilintid + Semaglutid, in zwei Größen ({#} mg + {#} mg; {#} mg + {#} mg). Siehe die Einträge {N} und {N}.",
"Novalyx research blend of two compounds: {N} ({#} mg) + {N} ({#} mg) in a single lyophilised vial. See the {N} and {N} entries for the nature of each component.": "Novalyx-Forschungsmischung aus zwei Verbindungen: {N} ({#} mg) + {N} ({#} mg) in einem einzigen lyophilisierten Fläschchen. Siehe die Einträge {N} und {N} zur Natur der einzelnen Bestandteile.",
"Novalyx research blend of two compounds: {N} + {N}, in two sizes ({#} mg total: {#} mg + {#} mg; {#} mg total: {#} mg + {#} mg). See the {N} and {N} entries.": "Novalyx-Forschungsmischung aus zwei Verbindungen: {N} + {N}, in zwei Größen ({#} mg gesamt: {#} mg + {#} mg; {#} mg gesamt: {#} mg + {#} mg). Siehe die Einträge {N} und {N}.",
"Nucleoside (not a peptide) used in research as an activator of AMPK, a key enzyme of cellular energy metabolism.": "Nukleosid (kein Peptid), in der Forschung als Aktivator der AMPK eingesetzt, eines Schlüsselenzyms des zellulären Energiestoffwechsels.",
"Orders are shipped within {#} h of payment confirmation, then delivered in {#}–{#} days maximum within France. Allow {#}–{#} business days for the rest of the EU, and longer outside the EU depending on destination. A tracking number is sent on dispatch.": "Bestellungen werden innerhalb von {#} h nach Zahlungsbestätigung versandt und in Frankreich in maximal {#}–{#} Tagen geliefert. Rechnen Sie für die übrige Welt mit {#}–{#} Werktagen.",
"PEGylated form of the MGF peptide (\"mechano growth factor\"), derived from an IGF-{#} splice variant, studied in muscle-cell models.": "PEGylierte Form des MGF-Peptids („Mechano Growth Factor“), abgeleitet von einer IGF-{#}-Spleißvariante, untersucht in Muskelzellmodellen.",
"Pay by bank transfer": "Per Banküberweisung bezahlen",
"Peptidomimetic designed to target prohibitin on the blood vessels of white adipose tissue, studied in rodents and primates.": "Peptidomimetikum, das auf Prohibitin in den Blutgefäßen des weißen Fettgewebes abzielt, untersucht an Nagetieren und Primaten.",
"Preclinical research (cells, animals); a few very limited human studies on analogues. No authorisation.": "Präklinische Forschung (Zellen, Tiere); einige sehr begrenzte Humanstudien zu Analoga. Keine Zulassung.",
"Preclinical research compound; no medicine authorisation.": "Präklinische Forschungsverbindung; keine Arzneimittelzulassung.",
"Preparation of peptides and amino acids obtained by enzymatic hydrolysis of pig-brain proteins. It is a mixture, not a single molecule.": "Zubereitung aus Peptiden und Aminosäuren, gewonnen durch enzymatische Hydrolyse von Schweinehirnproteinen. Es ist ein Gemisch, kein einzelnes Molekül.",
"Proceed to checkout": "Zur Kasse",
"Proprietary blend of research compounds; it is not a medicine. The status of its components is as described in their own entries.": "Eigene Mischung aus Forschungsverbindungen; sie ist kein Arzneimittel. Der Status ihrer Bestandteile entspricht deren eigenen Einträgen.",
"Proprietary blend of research compounds; no medicine status. The status of its components is as described in their own entries.": "Eigene Mischung aus Forschungsverbindungen; kein Arzneimittelstatus. Der Status ihrer Bestandteile entspricht deren eigenen Einträgen.",
"Registered as a medicine in Russia; not authorised in the EU or the United States.": "In Russland als Arzneimittel registriert; in der EU und den USA nicht zugelassen.",
"Research peptide; no medicine authorisation.": "Forschungspeptid; keine Arzneimittelzulassung.",
"Research reagent (cell culture); not authorised as a medicine.": "Forschungsreagenz (Zellkultur); nicht als Arzneimittel zugelassen.",
"Research reagent; no medicine authorisation. Listed on the World Anti-Doping Agency prohibited list.": "Forschungsreagenz; keine Arzneimittelzulassung. Auf der Verbotsliste der Welt-Anti-Doping-Agentur.",
"Research reagent; not authorised as a medicine.": "Forschungsreagenz; nicht als Arzneimittel zugelassen.",
"Retatrutide (product name on this site: {N}) is a triple agonist of the GIP, GLP-{#} and glucagon receptors, developed by Eli Lilly (code LY{#}). It activates three receptors involved in energy and glucose metabolism at the same time.": "Retatrutid (Produktname auf dieser Website: {N}) ist ein Dreifach-Agonist der GIP-, GLP-{#}- und Glukagon-Rezeptoren, entwickelt von Eli Lilly (Code LY{#}). Es wird in klinischen Studien zu Adipositas und Typ-2-Diabetes untersucht.",
"SECURE PAYMENT BY STRIPE": "SICHERE ZAHLUNG ÜBER STRIPE",
"Search a compound": "Verbindung suchen",
"Search a compound (e.g. {N}, {N}…)": "Verbindung suchen (z. B. {N}, {N}…)",
"Secure payment": "Sichere Zahlung",
"Secure payment by Stripe · Visa · Mastercard · Apple Pay": "Sichere Zahlung über Stripe · Visa · Mastercard · Apple Pay",
"Shipped within {#} h · delivery in {#}–{#} days maximum in France": "Versand innerhalb von {#} h · Lieferung in maximal {#}–{#} Tagen in Frankreich",
"Shipping:": "Versand:",
"Short synthetic peptide (Ala-Glu-Asp) from V. Khavinson's work on \"bioregulators\" (St Petersburg Institute of Bioregulation and Gerontology), studied in relation to cartilage tissue. Published data come mostly from this team.": "Kurzes synthetisches Peptid (Ala-Glu-Asp) aus V. Khavinsons Arbeiten zu „Bioregulatoren“ (Institut für Bioregulation und Gerontologie in Sankt Petersburg), untersucht im Zusammenhang mit Knorpelgewebe. Die veröffentlichten Daten stammen überwiegend von diesem Team.",
"Short synthetic peptide (Ala-Glu-Asp-Arg) from V. Khavinson's work on \"bioregulators\" (St Petersburg Institute of Bioregulation and Gerontology), studied in relation to heart tissue. Published data come mostly from this team.": "Kurzes synthetisches Peptid (Ala-Glu-Asp-Arg) aus V. Khavinsons Arbeiten zu „Bioregulatoren“ (Institut für Bioregulation und Gerontologie in Sankt Petersburg), untersucht im Zusammenhang mit Herzgewebe. Die veröffentlichten Daten stammen überwiegend von diesem Team.",
"Short synthetic peptide (Ala-Glu-Asp-Pro) from V. Khavinson's work on \"bioregulators\" (St Petersburg Institute of Bioregulation and Gerontology), studied in relation to brain tissue. Published data come mostly from this team.": "Kurzes synthetisches Peptid (Ala-Glu-Asp-Pro) aus V. Khavinsons Arbeiten zu „Bioregulatoren“ (Institut für Bioregulation und Gerontologie in Sankt Petersburg), untersucht im Zusammenhang mit Hirngewebe. Die veröffentlichten Daten stammen überwiegend von diesem Team.",
"Short synthetic peptide (Glu-Asp-Gly) from V. Khavinson's work on \"bioregulators\" (St Petersburg Institute of Bioregulation and Gerontology), studied in relation to bronchi tissue. Published data come mostly from this team.": "Kurzes synthetisches Peptid (Glu-Asp-Gly) aus V. Khavinsons Arbeiten zu „Bioregulatoren“ (Institut für Bioregulation und Gerontologie in Sankt Petersburg), untersucht im Zusammenhang mit Bronchialgewebe. Die veröffentlichten Daten stammen überwiegend von diesem Team.",
"Short synthetic peptide (Glu-Asp-Leu) from V. Khavinson's work on \"bioregulators\" (St Petersburg Institute of Bioregulation and Gerontology), studied in relation to liver tissue. Published data come mostly from this team.": "Kurzes synthetisches Peptid (Glu-Asp-Leu) aus V. Khavinsons Arbeiten zu „Bioregulatoren“ (Institut für Bioregulation und Gerontologie in Sankt Petersburg), untersucht im Zusammenhang mit Lebergewebe. Die veröffentlichten Daten stammen überwiegend von diesem Team.",
"Short synthetic peptide (Lys-Glu-Asp) from V. Khavinson's work on \"bioregulators\" (St Petersburg Institute of Bioregulation and Gerontology), studied in relation to blood vessels tissue. Published data come mostly from this team.": "Kurzes synthetisches Peptid (Lys-Glu-Asp) aus V. Khavinsons Arbeiten zu „Bioregulatoren“ (Institut für Bioregulation und Gerontologie in Sankt Petersburg), untersucht im Zusammenhang mit Gefäßgewebe. Die veröffentlichten Daten stammen überwiegend von diesem Team.",
"Short synthetic peptide (Lys-Glu-Asp-Gly) from V. Khavinson's work on \"bioregulators\" (St Petersburg Institute of Bioregulation and Gerontology), studied in relation to testes tissue. Published data come mostly from this team.": "Kurzes synthetisches Peptid (Lys-Glu-Asp-Gly) aus V. Khavinsons Arbeiten zu „Bioregulatoren“ (Institut für Bioregulation und Gerontologie in Sankt Petersburg), untersucht im Zusammenhang mit Hodengewebe. Die veröffentlichten Daten stammen überwiegend von diesem Team.",
"Short synthetic peptide (Lys-Glu-Asp-Pro) from V. Khavinson's work on \"bioregulators\" (St Petersburg Institute of Bioregulation and Gerontology), studied in relation to prostate tissue. Published data come mostly from this team.": "Kurzes synthetisches Peptid (Lys-Glu-Asp-Pro) aus V. Khavinsons Arbeiten zu „Bioregulatoren“ (Institut für Bioregulation und Gerontologie in Sankt Petersburg), untersucht im Zusammenhang mit Prostatagewebe. Die veröffentlichten Daten stammen überwiegend von diesem Team.",
"Short synthetic peptide (Lys-Glu-Asp-Trp) from V. Khavinson's work on \"bioregulators\" (St Petersburg Institute of Bioregulation and Gerontology), studied in relation to pancreas tissue. Published data come mostly from this team.": "Kurzes synthetisches Peptid (Lys-Glu-Asp-Trp) aus V. Khavinsons Arbeiten zu „Bioregulatoren“ (Institut für Bioregulation und Gerontologie in Sankt Petersburg), untersucht im Zusammenhang mit Pankreasgewebe. Die veröffentlichten Daten stammen überwiegend von diesem Team.",
"Small molecule ({#}-amino-{#}-methylquinolinium), not a peptide: inhibitor of NNMT (nicotinamide N-methyltransferase), an enzyme of cellular metabolism. Studied in cells and mouse models.": "Kleines Molekül ({#}-Amino-{#}-methylchinolinium), kein Peptid: Hemmer der NNMT (Nicotinamid-N-Methyltransferase), eines Enzyms des Zellstoffwechsels.",
"Small peptide derived from angiotensin IV, studied in preclinical models for its action on the HGF/c-Met pathway and synapse formation.": "Kleines Peptid, abgeleitet von Angiotensin IV, in präklinischen Modellen auf seine Wirkung auf den HGF/c-Met-Signalweg und die Synapsenbildung untersucht.",
"Soon": "Bald",
"Start with the essentials.": "Beginnen Sie mit dem Wesentlichen.",
"Status:": "Status:",
"Sterile water containing {#}% acetic acid, used as a reconstitution solvent for peptides that dissolve poorly at neutral pH.": "Steriles Wasser mit {#} % Essigsäure, als Rekonstitutionslösungsmittel für Peptide verwendet, die sich bei neutralem pH schlecht lösen.",
"Sterile water containing {#}% benzyl alcohol as a bacteriostatic agent, intended for laboratory reconstitution of lyophilised compounds, in a multi-draw vial.": "Steriles Wasser mit {#} % Benzylalkohol als bakteriostatischem Wirkstoff, zur Rekonstitution lyophilisierter Verbindungen im Labor, in einem Mehrfachentnahme-Fläschchen.",
"Stripe, card": "Stripe, Karte",
"Support": "Support",
"Synthetic analogue of α-MSH, known as afamelanotide ([Nle{#}, D-Phe{#}]-α-MSH), an agonist of the MC{#}R receptor.": "Synthetisches Analogon von α-MSH, bekannt als Afamelanotid ([Nle{#}, D-Phe{#}]-α-MSH), ein Agonist des MC{#}R-Rezeptors.",
"Synthetic cyclic peptide analogue of α-MSH, a non-selective agonist of melanocortin receptors.": "Synthetisches zyklisches Peptid-Analogon von α-MSH, ein nicht selektiver Agonist der Melanocortin-Rezeptoren.",
"Synthetic derivative of {N} carrying an adamantane group. Independent scientific literature on it is still very limited.": "Synthetisches Derivat von {N} mit einer Adamantan-Gruppe. Die unabhängige wissenschaftliche Literatur dazu ist noch sehr begrenzt.",
"Synthetic heptapeptide analogue of an ACTH({#}-{#}) fragment, stabilised by a Pro-Gly-Pro tail. Studied for the expression of neurotrophic factors such as BDNF.": "Synthetisches Heptapeptid-Analogon eines ACTH({#}-{#})-Fragments, stabilisiert durch einen Pro-Gly-Pro-Schwanz. Untersucht auf die Expression neurotropher Faktoren wie BDNF.",
"Synthetic heptapeptide derived from tuftsin (an immunoglobulin fragment), stabilised by a Pro-Gly-Pro tail; studied for modulation of neurotransmitters, including the GABAergic system.": "Synthetisches Heptapeptid, abgeleitet von Tuftsin (einem Immunglobulin-Fragment), stabilisiert durch einen Pro-Gly-Pro-Schwanz; untersucht auf die Modulation von Neurotransmittern.",
"Synthetic hexapeptide agonist of the ghrelin receptor (GHS-R{#}a): a growth-hormone secretagogue (GHRP = growth hormone-releasing peptide).": "Synthetisches Hexapeptid, Agonist des Ghrelin-Rezeptors (GHS-R{#}a): ein Wachstumshormon-Sekretagog (GHRP = Growth Hormone-Releasing Peptide).",
"Synthetic hexapeptide, a growth-hormone secretagogue acting on the ghrelin receptor; it also binds CD{#}, which has been studied in cardiac models.": "Synthetisches Hexapeptid, ein Wachstumshormon-Sekretagog mit Wirkung auf den Ghrelin-Rezeptor; es bindet auch an CD{#}, was in Herzmodellen untersucht wurde.",
"Synthetic hexapeptide, one of the first growth-hormone secretagogues, agonist of the ghrelin receptor (GHS-R{#}a).": "Synthetisches Hexapeptid, einer der ersten Wachstumshormon-Sekretagoge, Agonist des Ghrelin-Rezeptors (GHS-R{#}a).",
"Synthetic pentapeptide agonist of the ghrelin receptor (GHS-R{#}a), classed among growth-hormone secretagogues.": "Synthetisches Pentapeptid, Agonist des Ghrelin-Rezeptors (GHS-R{#}a), zu den Wachstumshormon-Sekretagogen gezählt.",
"Synthetic peptide related to thymosin beta-{#}, a {#}-amino-acid protein that binds actin (a cytoskeleton component). \"{N}\" usually refers to a synthetic fragment; definitions vary between suppliers. Studied in vitro and in animals for cell migration and tissue repair.": "Synthetisches Peptid, verwandt mit Thymosin Beta-{#}, einem Protein aus {#} Aminosäuren, das Aktin (einen Bestandteil des Zytoskeletts) bindet. „{N}“ bezeichnet meist ein synthetisches Fragment davon.",
"Synthetic tetrapeptide (Ala-Glu-Asp-Gly) designed from epithalamin, a pineal-gland extract. Studied, mainly by a Russian research group, for effects on telomerase and cellular ageing.": "Synthetisches Tetrapeptid (Ala-Glu-Asp-Gly), entwickelt nach Epithalamin, einem Extrakt der Zirbeldrüse. Vor allem von einer russischen Forschungsgruppe auf Wirkungen auf Telomere und Alterung untersucht.",
"Synthetic tripeptide (Glu-Asp-Arg) belonging to the \"peptide bioregulators\" studied by Khavinson's group; examined in cell culture and animals for neuroprotective effects.": "Synthetisches Tripeptid (Glu-Asp-Arg) aus der Gruppe der „Peptid-Bioregulatoren“ der Khavinson-Gruppe; in Zellkultur und an Tieren auf neuroprotektive Wirkungen untersucht.",
"Synthetic {#}-amino-acid peptide derived from a sequence of the BPC protein found in human gastric juice. In the laboratory it is studied in cell and animal models for its interactions with angiogenesis (blood-vessel formation) and tissue-repair pathways.": "Synthetisches Peptid aus {#} Aminosäuren, abgeleitet von einer Sequenz des Proteins BPC aus dem menschlichen Magensaft. Im Labor wird es in Zell- und Tiermodellen zu Gewebereparatur und Angiogenese untersucht.",
"Tetrapeptide (also called elamipretide) that binds cardiolipin, a phospholipid of the inner mitochondrial membrane, and is studied for its effect on mitochondrial function.": "Tetrapeptid (auch Elamipretid genannt), das an Cardiolipin bindet, ein Phospholipid der inneren Mitochondrienmembran, und auf seine Wirkung auf die mitochondriale Funktion untersucht wird.",
"Tripeptide (lysine-proline-valine) matching the C-terminal end of α-MSH (melanocyte-stimulating hormone). Studied in vitro and in animals for its effects on inflammatory signalling, notably in the intestinal epithelium.": "Tripeptid (Lysin-Prolin-Valin), das dem C-terminalen Ende von α-MSH (Melanozyten-stimulierendes Hormon) entspricht. In vitro und an Tieren auf seine entzündungsbezogenen Wirkungen untersucht.",
"Truncated form of IGF-{#} (des({#}-{#})IGF-{#}) lacking the first three amino acids, with reduced affinity for IGFBPs and enhanced activity at the IGF-{#} receptor in culture. It occurs naturally in some tissues, including the brain.": "Verkürzte Form von IGF-{#} (des({#}-{#})IGF-{#}) ohne die ersten drei Aminosäuren, mit verringerter Affinität zu IGFBPs und verstärkter Aktivität am IGF-{#}-Rezeptor in Zellkultur. Sie kommt in einigen Geweben natürlich vor, darunter im Gehirn.",
"Used in cosmetics (topical application); no authorisation as an injectable medicine. Research mainly involves cell models and topical applications.": "In der Kosmetik verwendet (topische Anwendung); keine Zulassung als injizierbares Arzneimittel. Die Forschung betrifft hauptsächlich Zellmodelle und topische Anwendungen.",
"Verifiable analysis reports": "Überprüfbare Analyseberichte",
"View the whole catalogue": "Gesamten Katalog ansehen",
"Was authorised in the United States (brand Geref) and later withdrawn for commercial reasons. Prohibited by WADA.": "War in den USA zugelassen (Marke Geref) und wurde später aus kommerziellen Gründen zurückgezogen. Von der WADA verboten.",
"Within {#} h, tracked, plain packaging": "Innerhalb von {#} h, mit Sendungsverfolgung, neutrale Verpackung",
"{#} lyophilised compounds · one analysis report per batch": "{#} lyophilisierte Verbindungen · ein Analysebericht pro Charge",
"{#}-amino-acid analogue of GHRH (growth-hormone-releasing hormone), modified to resist degradation.": "GHRH-Analogon (Growth-Hormone-Releasing-Hormon) aus {#} Aminosäuren, gegen Abbau modifiziert.",
"{#}-amino-acid analogue of human IGF-{#} (Arg{#} substitution and {#}-amino-acid N-terminal extension) with low binding to IGF-binding proteins (IGFBPs). It is mostly used as a cell-culture supplement.": "Analogon des menschlichen IGF-{#} aus {#} Aminosäuren (Arg{#}-Substitution und N-terminale Verlängerung um {#} Aminosäuren) mit geringer Bindung an IGF-Bindungsproteine (IGFBPs).",
"{#}-amino-acid antimicrobial peptide, the only human member of the cathelicidin family, released by cleavage of the hCAP{#} protein. Studied for its role in innate immunity.": "Antimikrobielles Peptid aus {#} Aminosäuren, das einzige menschliche Mitglied der Cathelicidin-Familie, freigesetzt durch Spaltung des Proteins hCAP{#}. Untersucht auf seine Rolle in der angeborenen Immunität.",
"{#}-amino-acid fragment of kisspeptin, ligand of the KISS{#}R receptor (GPR{#}), which controls GnRH release and therefore the reproductive axis.": "Fragment von Kisspeptin aus {#} Aminosäuren, Ligand des Rezeptors KISS{#}R (GPR{#}), der die GnRH-Freisetzung und damit die Reproduktionsachse steuert.",
"{#}-amino-acid neuropeptide acting on VPAC{#} and VPAC{#} receptors, involved in vasodilation, immunity and digestive function. Its synthetic drug form is called aviptadil.": "Neuropeptid aus {#} Aminosäuren mit Wirkung auf die Rezeptoren VPAC{#} und VPAC{#}, beteiligt an Gefäßerweiterung, Immunität und Verdauungsfunktion. Seine synthetische Arzneimittelform heißt Aviptadil.",
"{#}-amino-acid peptide derived from erythropoietin (helix B), which binds selectively to the \"innate repair receptor\" (EPOR/CD{#} heterodimer) without stimulating erythropoiesis. Also called cibinetide.": "Peptid aus {#} Aminosäuren, abgeleitet von Erythropoetin (Helix B), das selektiv an den „angeborenen Reparaturrezeptor“ (EPOR/CD{#}-Heterodimer) bindet, ohne die Bildung roter Blutkörperchen anzuregen.",
"{#}-amino-acid peptide derived from prothymosin alpha, studied for modulation of the immune response (T-cell maturation).": "Peptid aus {#} Aminosäuren, abgeleitet von Prothymosin Alpha, untersucht auf die Modulation der Immunantwort (T-Zell-Reifung).",
"{#}-amino-acid peptide derived from spadin, studied in animals as an inhibitor of the TREK-{#} potassium channel.": "Peptid aus {#} Aminosäuren, abgeleitet von Spadin, am Tier als Hemmer des Kaliumkanals TREK-{#} untersucht.",
"{#}-amino-acid peptide encoded by mitochondrial DNA ({#}S rRNA gene): a \"mitochondrial-derived peptide\". Studied for its role in metabolic homeostasis and cellular stress response.": "Peptid aus {#} Aminosäuren, kodiert von der mitochondrialen DNA ({#}S-rRNA-Gen): ein „mitochondrial abgeleitetes Peptid“. Untersucht auf seine Rolle in der Stoffwechselhomöostase.",
"{#}-amino-acid peptide encoded by mitochondrial DNA, studied for its cytoprotective signalling pathways in cell and animal models.": "Peptid aus {#} Aminosäuren, kodiert von der mitochondrialen DNA, untersucht auf seine zytoprotektiven Signalwege in Zell- und Tiermodellen.",
"{#}mg · Pack de {#}": "{#}mg · {#}er-Pack",
"{#}ml · Pack de {#}": "{#}ml · {#}er-Pack",
"{N} and {N} are authorised as medicines in Russia (nasal route); neither is authorised in the European Union or the United States.": "{N} und {N} sind in Russland als Arzneimittel zugelassen (nasale Anwendung); keines von beiden ist in der Europäischen Union oder den USA zugelassen.",
"{N} variant acetylated at one end (N-acetyl) and amidated at the other, modifications intended to make it more stable. Few independent published studies.": "{N}-Variante, an einem Ende acetyliert (N-Acetyl) und am anderen amidiert, Modifikationen zur Erhöhung der Stabilität. Wenige unabhängige veröffentlichte Studien.",
"{N} {#}mg · Pack de {#} — Novalyx Research": "{N} {#}mg · {#}er-Pack — Novalyx Research",
"{N} {#}ml · Pack de {#} — Novalyx Research": "{N} {#}ml · {#}er-Pack — Novalyx Research",
"— or —": "— oder —",
"All Novalyx products are compounds supplied exclusively for laboratory research (in vitro): not medicines, dietary supplements or cosmetics, with no human or animal use. Orders are reserved for adults and qualified professionals. It is your responsibility to check the regulations applicable in your country.": "Alle Novalyx-Produkte sind Verbindungen, die ausschließlich für die Laborforschung (in vitro) geliefert werden: keine Arzneimittel, Nahrungsergänzungsmittel oder Kosmetika, keine Anwendung am Menschen oder Tier. Bestellungen sind Volljährigen und qualifizierten Fachleuten vorbehalten. Es liegt in Ihrer Verantwortung, die in Ihrem Land geltenden Vorschriften zu prüfen.",
"Analyses are performed by Janoshik Analytical (Czech Republic), an independent laboratory. The {N} {#}mg report is published (HPLC purity {#}%) with its verification key: see the Analyses page. For other compounds, the report will be published once the first batch has been analysed.": "Die Analysen werden von Janoshik Analytical (Tschechische Republik) durchgeführt, einem unabhängigen Labor. Der Bericht zu {N} {#}mg ist veröffentlicht (HPLC-Reinheit {#} %) mit seinem Prüfschlüssel: siehe die Seite Analysen. Für andere Verbindungen wird der Bericht veröffentlicht, sobald die erste Charge analysiert ist.",
"Before reconstitution: dry, at room temperature, away from light, vial sealed. After reconstitution: between {#} and {#} °C (refrigerated).": "Vor der Rekonstitution: trocken, bei Raumtemperatur, lichtgeschützt, Fläschchen versiegelt. Nach der Rekonstitution: zwischen {#} und {#} °C (gekühlt).",
"COA analyses": "COA-Analysen",
"Currently available to order online: {N}, {N}. Other items are shown as \"coming soon\".": "Derzeit online bestellbar: {N}, {N}. Andere Artikel sind als „demnächst“ gekennzeichnet.",
"Educational information only": "Nur Bildungsinformationen",
"Hello, I'm the Novalyx assistant. I can tell you about our research compounds (nature, mechanism, regulatory status), prices, shipping, payment, storage and COA analyses.": "Hallo, ich bin der Novalyx-Assistent. Ich kann Ihnen etwas über unsere Forschungsverbindungen (Natur, Mechanismus, regulatorischer Status), Preise, Versand, Zahlung, Lagerung und COA-Analysen sagen.",
"I can't answer that question. Novalyx products are compounds supplied exclusively for laboratory research (no human or animal use), and this assistant gives no dose, protocol or medical advice. For any health question, please consult a healthcare professional.": "Diese Frage kann ich nicht beantworten. Novalyx-Produkte sind Verbindungen, die ausschließlich für die Laborforschung geliefert werden (keine Anwendung am Menschen oder Tier), und dieser Assistent gibt keine Dosierungs-, Protokoll- oder medizinischen Ratschläge. Bei Gesundheitsfragen wenden Sie sich bitte an eine medizinische Fachkraft.",
"I don't have reliable information on this and I prefer not to improvise. Write to us at contact@novalyxresearch.com (reply within one business day), or pick a question below.": "Dazu habe ich keine verlässlichen Informationen, und ich improvisiere lieber nicht. Schreiben Sie uns an contact@novalyxresearch.com (Antwort innerhalb eines Werktags) oder wählen Sie unten eine Frage.",
"I give no dose, protocol or medical advice.": "Ich gebe keine Dosierungs-, Protokoll- oder medizinischen Ratschläge.",
"Note: educational information only. No medical advice, no dose, no usage recommendation. Product reserved for laboratory research.": "Hinweis: nur Bildungsinformationen. Keine medizinische Beratung, keine Dosierung, keine Anwendungsempfehlung. Produkt der Laborforschung vorbehalten.",
"Novalyx assistant": "Novalyx-Assistent",
"On Novalyx: available to order.": "Bei Novalyx: bestellbar.",
"On Novalyx: coming soon (not yet available to order).": "Bei Novalyx: demnächst (noch nicht bestellbar).",
"Orders are shipped from Paris within {#} h of payment confirmation. Delivery in {#} to {#} days maximum within France; longer for the rest of the world (see the Shipping page). Shipping by country: France {#}€, EU {#}€, Switzerland/UK {#}€, USA/Canada {#}€, Australia, New Zealand and other countries {#}€ (free in France and the EU on {N} Packs; bacteriostatic water {#}€ in France and the EU). A tracking number is sent on dispatch. Outside the European Union, the buyer is responsible for customs duties and local compliance.": "Bestellungen werden innerhalb von {#} h nach Zahlungsbestätigung aus Paris versandt. Lieferung in maximal {#} bis {#} Tagen innerhalb Frankreichs; länger für die übrige Welt (siehe Seite Versand). Versand nach Land: Frankreich {#}€, EU {#}€, Schweiz/Vereinigtes Königreich {#}€, USA/Kanada {#}€, Australien, Neuseeland und andere Länder {#}€ (kostenlos in Frankreich und der EU für {N}-Packs; bakteriostatisches Wasser {#}€ in Frankreich und der EU). Beim Versand wird eine Sendungsnummer mitgeteilt. Außerhalb der Europäischen Union ist der Käufer für Zölle und die Einhaltung örtlicher Vorschriften verantwortlich.",
"Payment by card through Stripe (your banking data never touch our servers), or by bank transfer, even for a small order: choose \"Pay by bank transfer\" in the cart. The order is shipped once the transfer is received. Any question: contact@novalyxresearch.com.": "Zahlung per Karte über Stripe (Ihre Bankdaten berühren nie unsere Server) oder per Banküberweisung, auch bei kleinen Bestellungen: Wählen Sie „Per Banküberweisung bezahlen“ im Warenkorb. Die Bestellung wird nach Zahlungseingang versandt. Fragen: contact@novalyxresearch.com.",
"What is {N}?": "Was ist {N}?",
"Which product do you mean? Give its name (for example \"price of {N}\").": "Welches Produkt meinen Sie? Nennen Sie seinen Namen (zum Beispiel „Preis von {N}“).",
"Which products are available?": "Welche Produkte sind verfügbar?",
"Your question": "Ihre Frage",
"Your question…": "Ihre Frage…",
"Status (checked October {#}): Afamelanotide is authorised as an implant (brand Scenesse) for a specific indication (erythropoietic protoporphyria) in the EU and the United States. The Novalyx product is a research compound, not that medicine.": "Status (geprüft im Oktober {#}): Afamelanotid ist als Implantat (Marke Scenesse) für eine bestimmte Indikation (erythropoetische Protoporphyrie) in der EU und den USA zugelassen. Das Novalyx-Produkt ist eine Forschungsverbindung, nicht dieses Arzneimittel.",
"Status (checked October {#}): Approved in China (NMPA, June {#}) for chronic weight management in adults; to our knowledge not approved in the EU or the United States.": "Status (geprüft im Oktober {#}): In China zugelassen (NMPA, Juni {#}) für das chronische Gewichtsmanagement bei Erwachsenen; unseres Wissens in der EU und den USA nicht zugelassen.",
"Status (checked October {#}): Authorised in the United States (brand Egrifta) for a specific indication (HIV-associated abdominal lipodystrophy). The Novalyx product is a research compound, not that medicine.": "Status (geprüft im Oktober {#}): In den USA (Marke Egrifta) für eine bestimmte Indikation zugelassen (HIV-assoziierte abdominale Lipodystrophie). Das Novalyx-Produkt ist eine Forschungsverbindung, nicht dieses Arzneimittel.",
"Status (checked October {#}): Authorised in the United States (brand Vyleesi) for a specific indication. The Novalyx product is a research compound, not that medicine.": "Status (geprüft im Oktober {#}): In den USA (Marke Vyleesi) für eine bestimmte Indikation zugelassen. Das Novalyx-Produkt ist eine Forschungsverbindung, nicht dieses Arzneimittel.",
"Status (checked October {#}): Authorised medicine (FDA and EMA) under the brands Mounjaro and Zepbound. The Novalyx product is a research compound and is not that medicine.": "Status (geprüft im Oktober {#}): Zugelassenes Arzneimittel (FDA und EMA) unter den Marken Mounjaro und Zepbound. Das Novalyx-Produkt ist eine Forschungsverbindung und nicht dieses Arzneimittel.",
"Status (checked October {#}): Authorised medicine under the brands Ozempic, Wegovy and Rybelsus. The Novalyx product is a research compound and is not that medicine.": "Status (geprüft im Oktober {#}): Zugelassenes Arzneimittel unter den Marken Ozempic, Wegovy und Rybelsus. Das Novalyx-Produkt ist eine Forschungsverbindung und nicht dieses Arzneimittel.",
"Status (checked October {#}): Both components are investigational molecules, not authorised as medicines.": "Status (geprüft im Oktober {#}): Beide Bestandteile sind Prüfsubstanzen, nicht als Arzneimittel zugelassen.",
"Status (checked October {#}): Cosmetic ingredient (topical use); efficacy data come mostly from manufacturers. No medicine status.": "Status (geprüft im Oktober {#}): Kosmetischer Wirkstoff (topische Anwendung); Wirksamkeitsdaten stammen überwiegend von Herstellern. Kein Arzneimittelstatus.",
"Status (checked October {#}): Cosmetic ingredient; no medicine status.": "Status (geprüft im Oktober {#}): Kosmetischer Wirkstoff; kein Arzneimittelstatus.",
"Status (checked October {#}): Elamipretide is approved in the United States (FDA, accelerated approval, September {#}, brand Forzinity) only for Barth syndrome. The Novalyx product is a research compound, not that medicine.": "Status (geprüft im Oktober {#}): Elamipretid ist in den USA (FDA, beschleunigte Zulassung, September {#}, Marke Forzinity) nur für das Barth-Syndrom zugelassen. Das Novalyx-Produkt ist eine Forschungsverbindung, nicht dieses Arzneimittel.",
"Status (checked October {#}): Endogenous molecule studied in the laboratory. No authorisation as a medicine for the forms sold here; associated health claims are not validated by authorities.": "Status (geprüft im Oktober {#}): Körpereigenes Molekül, im Labor untersucht. Keine Arzneimittelzulassung für die hier verkauften Formen; damit verbundene gesundheitsbezogene Aussagen sind von Behörden nicht bestätigt.",
"Status (checked October {#}): Experimental compound; no medicine authorisation.": "Status (geprüft im Oktober {#}): Experimentelle Verbindung; keine Arzneimittelzulassung.",
"Status (checked October {#}): Investigational drug (phase {#} clinical trials); not authorised.": "Status (geprüft im Oktober {#}): Prüfpräparat (klinische Studien der Phase {#}); nicht zugelassen.",
"Status (checked October {#}): Investigational drug in advanced development, alone and in combination with semaglutide (CagriSema). Status is evolving: refer to health authorities for the current situation.": "Status (geprüft im Oktober {#}): Prüfpräparat in fortgeschrittener Entwicklung, allein und in Kombination mit Semaglutid (CagriSema). Der Status entwickelt sich: Für die aktuelle Lage wenden Sie sich an die Gesundheitsbehörden.",
"Status (checked October {#}): Investigational drug, in phase {#} clinical trials; to our knowledge not authorised.": "Status (geprüft im Oktober {#}): Prüfpräparat in klinischen Studien der Phase {#}; unseres Wissens nicht zugelassen.",
"Status (checked October {#}): Investigational drug: in phase {#} clinical trials, not authorised to date. According to the company's announcements, a US marketing application is targeted for early {#}. The Novalyx product is a research compound, not a medicine.": "Status (geprüft im Oktober {#}): Prüfpräparat: in klinischen Studien der Phase {#}, bislang nicht zugelassen. Laut Unternehmensangaben ist ein US-Zulassungsantrag für Anfang {#} geplant. Das Novalyx-Produkt ist eine Forschungsverbindung, kein Arzneimittel.",
"Status (checked October {#}): Investigational molecule in clinical trials; not authorised as a medicine.": "Status (geprüft im Oktober {#}): Prüfsubstanz in klinischen Studien; nicht als Arzneimittel zugelassen.",
"Status (checked October {#}): Its pharmaceutical form (thymalfasin, brand Zadaxin) is authorised in several countries, mainly in Asia, for certain indications; it is not authorised in the United States. The Novalyx product is a research compound.": "Status (geprüft im Oktober {#}): Seine pharmazeutische Form (Thymalfasin, Marke Zadaxin) ist in mehreren Ländern, vor allem in Asien, für bestimmte Indikationen zugelassen; in den USA ist sie nicht zugelassen. Das Novalyx-Produkt ist eine Forschungsverbindung.",
"Status (checked October {#}): Laboratory reagent.": "Status (geprüft im Oktober {#}): Laborreagenz.",
"Status (checked October {#}): Laboratory solvent: it contains no active substance.": "Status (geprüft im Oktober {#}): Laborlösungsmittel: Es enthält keinen Wirkstoff.",
"Status (checked October {#}): Marketed as a medicine in some countries (including Austria, Russia, China); not authorised in the United States. Clinical evidence of efficacy remains debated.": "Status (geprüft im Oktober {#}): In einigen Ländern als Arzneimittel vermarktet (darunter Österreich, Russland, China); in den USA nicht zugelassen. Der klinische Wirksamkeitsnachweis bleibt umstritten.",
"Status (checked October {#}): No authorisation; preclinical data only.": "Status (geprüft im Oktober {#}): Keine Zulassung; nur präklinische Daten.",
"Status (checked October {#}): No medicine authorisation in any country; no published clinical data.": "Status (geprüft im Oktober {#}): Keine Arzneimittelzulassung, in keinem Land; keine veröffentlichten klinischen Daten.",
"Status (checked October {#}): No medicine authorisation in the European Union or the United States.": "Status (geprüft im Oktober {#}): Keine Arzneimittelzulassung in der Europäischen Union oder den USA.",
"Status (checked October {#}): No medicine authorisation.": "Status (geprüft im Oktober {#}): Keine Arzneimittelzulassung.",
"Status (checked October {#}): No medicine authorisation; clinical development discontinued.": "Status (geprüft im Oktober {#}): Keine Arzneimittelzulassung; klinische Entwicklung eingestellt.",
"Status (checked October {#}): No medicine authorisation; clinical development stopped.": "Status (geprüft im Oktober {#}): Keine Arzneimittelzulassung; klinische Entwicklung gestoppt.",
"Status (checked October {#}): Not authorised as a medicine in any country. Published data come mostly from preclinical (animal) studies; controlled human data are very limited. Listed as prohibited by the World Anti-Doping Agency (WADA).": "Status (geprüft im Oktober {#}): In keinem Land als Arzneimittel zugelassen. Veröffentlichte Daten stammen überwiegend aus präklinischen (Tier-)Studien; kontrollierte Humandaten sind sehr begrenzt. Von der Welt-Anti-Doping-Agentur (WADA) als verboten gelistet.",
"Status (checked October {#}): Not authorised as a medicine in the EU or the United States; as pralmorelin it has been used in Japan as a diagnostic agent, to our knowledge. Prohibited by WADA.": "Status (geprüft im Oktober {#}): In der EU und den USA nicht als Arzneimittel zugelassen; als Pralmorelin wurde es unseres Wissens in Japan als Diagnostikum verwendet. Von der WADA verboten.",
"Status (checked October {#}): Not authorised as a medicine in the EU or the United States; limited data, mostly from a small number of laboratories.": "Status (geprüft im Oktober {#}): In der EU und den USA nicht als Arzneimittel zugelassen; begrenzte Daten, überwiegend aus wenigen Laboren.",
"Status (checked October {#}): Not authorised as a medicine in the United States; aviptadil has been the subject of clinical trials and very limited authorisations depending on the country.": "Status (geprüft im Oktober {#}): In den USA nicht als Arzneimittel zugelassen; Aviptadil war Gegenstand klinischer Studien und je nach Land sehr begrenzter Zulassungen.",
"Status (checked October {#}): Not authorised as a medicine. Controlled human data are almost non-existent. Prohibited by WADA.": "Status (geprüft im Oktober {#}): Nicht als Arzneimittel zugelassen. Kontrollierte Humandaten sind nahezu nicht vorhanden. Von der WADA verboten.",
"Status (checked October {#}): Not authorised as a medicine. Prohibited by WADA.": "Status (geprüft im Oktober {#}): Nicht als Arzneimittel zugelassen. Von der WADA verboten.",
"Status (checked October {#}): Not authorised as a medicine; clinical trials in obesity did not lead to an authorisation.": "Status (geprüft im Oktober {#}): Nicht als Arzneimittel zugelassen; klinische Studien zu Adipositas führten zu keiner Zulassung.",
"Status (checked October {#}): Not authorised as a medicine; exploratory clinical trials have taken place without authorisation. Prohibited by WADA.": "Status (geprüft im Oktober {#}): Nicht als Arzneimittel zugelassen; explorative klinische Studien fanden ohne Zulassung statt. Von der WADA verboten.",
"Status (checked October {#}): Not authorised as a medicine; research is essentially in vitro and preclinical.": "Status (geprüft im Oktober {#}): Nicht als Arzneimittel zugelassen; die Forschung ist im Wesentlichen in vitro und präklinisch.",
"Status (checked October {#}): Not authorised as a medicine; research is essentially preclinical.": "Status (geprüft im Oktober {#}): Nicht als Arzneimittel zugelassen; die Forschung ist im Wesentlichen präklinisch.",
"Status (checked October {#}): Not authorised as a medicine; research use. Prohibited by WADA.": "Status (geprüft im Oktober {#}): Nicht als Arzneimittel zugelassen; Forschungsverwendung. Von der WADA verboten.",
"Status (checked October {#}): Not authorised as a medicine; several health authorities (for example in the United Kingdom and Australia) have issued warnings about products sold under this name.": "Status (geprüft im Oktober {#}): Nicht als Arzneimittel zugelassen; mehrere Gesundheitsbehörden (zum Beispiel im Vereinigten Königreich und in Australien) haben vor unter diesem Namen verkauften Produkten gewarnt.",
"Status (checked October {#}): Not authorised as a medicine; the literature is old and results have been inconsistent.": "Status (geprüft im Oktober {#}): Nicht als Arzneimittel zugelassen; die Literatur ist alt und die Ergebnisse waren uneinheitlich.",
"Status (checked October {#}): Not authorised as a medicine; used in research studies in reproductive endocrinology.": "Status (geprüft im Oktober {#}): Nicht als Arzneimittel zugelassen; in Forschungsstudien der Reproduktionsendokrinologie verwendet.",
"Status (checked October {#}): Not authorised in the EU or the United States; data come mostly from the Russian literature.": "Status (geprüft im Oktober {#}): In der EU und den USA nicht zugelassen; die Daten stammen überwiegend aus der russischen Fachliteratur.",
"Status (checked October {#}): Not authorised in the EU or the United States; the literature is limited and rarely independently replicated.": "Status (geprüft im Oktober {#}): In der EU und den USA nicht zugelassen; die Literatur ist begrenzt und selten unabhängig repliziert.",
"Status (checked October {#}): Preclinical research (cells, animals); a few very limited human studies on analogues. No authorisation.": "Status (geprüft im Oktober {#}): Präklinische Forschung (Zellen, Tiere); einige sehr begrenzte Humanstudien zu Analoga. Keine Zulassung.",
"Status (checked October {#}): Preclinical research compound; no medicine authorisation.": "Status (geprüft im Oktober {#}): Präklinische Forschungsverbindung; keine Arzneimittelzulassung.",
"Status (checked October {#}): Proprietary blend of research compounds; it is not a medicine. The status of its components is as described in their own entries.": "Status (geprüft im Oktober {#}): Eigene Mischung aus Forschungsverbindungen; sie ist kein Arzneimittel. Der Status ihrer Bestandteile entspricht deren eigenen Einträgen.",
"Status (checked October {#}): Proprietary blend of research compounds; no medicine status. The status of its components is as described in their own entries.": "Status (geprüft im Oktober {#}): Eigene Mischung aus Forschungsverbindungen; kein Arzneimittelstatus. Der Status ihrer Bestandteile entspricht deren eigenen Einträgen.",
"Status (checked October {#}): Registered as a medicine in Russia; not authorised in the EU or the United States.": "Status (geprüft im Oktober {#}): In Russland als Arzneimittel registriert; in der EU und den USA nicht zugelassen.",
"Status (checked October {#}): Research peptide; no medicine authorisation.": "Status (geprüft im Oktober {#}): Forschungspeptid; keine Arzneimittelzulassung.",
"Status (checked October {#}): Research reagent (cell culture); not authorised as a medicine.": "Status (geprüft im Oktober {#}): Forschungsreagenz (Zellkultur); nicht als Arzneimittel zugelassen.",
"Status (checked October {#}): Research reagent; no medicine authorisation. Listed on the World Anti-Doping Agency prohibited list.": "Status (geprüft im Oktober {#}): Forschungsreagenz; keine Arzneimittelzulassung. Auf der Verbotsliste der Welt-Anti-Doping-Agentur.",
"Status (checked October {#}): Research reagent; not authorised as a medicine.": "Status (geprüft im Oktober {#}): Forschungsreagenz; nicht als Arzneimittel zugelassen.",
"Status (checked October {#}): Used in cosmetics (topical application); no authorisation as an injectable medicine. Research mainly involves cell models and topical applications.": "Status (geprüft im Oktober {#}): In der Kosmetik verwendet (topische Anwendung); keine Zulassung als injizierbares Arzneimittel. Die Forschung betrifft hauptsächlich Zellmodelle und topische Anwendungen.",
"Status (checked October {#}): Was authorised in the United States (brand Geref) and later withdrawn for commercial reasons. Prohibited by WADA.": "Status (geprüft im Oktober {#}): War in den USA zugelassen (Marke Geref) und wurde später aus kommerziellen Gründen zurückgezogen. Von der WADA verboten.",
"Status (checked October {#}): {N} and {N} are authorised as medicines in Russia (nasal route); neither is authorised in the European Union or the United States.": "Status (geprüft im Oktober {#}): {N} und {N} sind in Russland als Arzneimittel zugelassen (nasale Anwendung); keines von beiden ist in der Europäischen Union oder den USA zugelassen."
};
/* Dictionnaire néerlandais : même principe que XL_DE. */
const XL_NL = {
", documented, verifiable.": ", gedocumenteerd, verifieerbaar.",
". An invoice appears with a QR code and the exact amount, valid for {#} minutes.": ". Er verschijnt een factuur met een QR-code en het exacte bedrag, {#} minuten geldig.",
". Buy your order amount, plus {#}€–{#} for sending fees.": ". Koop het bedrag van uw bestelling, plus {#}€–{#} voor de verzendkosten.",
"/ vial": "/ flacon",
"/ {#} mg": "/ {#} mg",
"A coenzyme central to cellular-energy and mitochondrial research, used in a wide range of biochemical assays.": "Een co-enzym dat centraal staat in onderzoek naar cellulaire energie en mitochondriën, gebruikt in uiteenlopende biochemische assays.",
"A commission on every order placed with your code.": "Een commissie op elke bestelling met uw code.",
"A copper-binding tripeptide investigated in skin-biology and extracellular-matrix research models.": "Een koperbindend tripeptide, onderzocht in onderzoeksmodellen van huidbiologie en de extracellulaire matrix.",
"A dual-receptor research peptide used as a reference compound in metabolic signalling studies.": "Een dual-receptor-onderzoekspeptide, gebruikt als referentieverbinding in studies naar metabole signalering.",
"A mitochondrial-derived peptide investigated in metabolic and cellular-energy research.": "Een van mitochondriën afgeleid peptide, onderzocht in metabool onderzoek en onderzoek naar cellulaire energie.",
"A monthly email recap of the sales your code generated.": "Een maandelijks e-mailoverzicht van de verkopen via uw code.",
"A peptide studied in immune-modulation and T-cell research models.": "Een peptide, bestudeerd in onderzoeksmodellen van immuunmodulatie en T-cellen.",
"A research peptide referenced in growth-hormone secretagogue and receptor-signalling studies.": "Een onderzoekspeptide, aangehaald in studies naar groeihormoon-secretagogen en receptorsignalering.",
"A research peptide widely referenced in receptor-binding and metabolic-pathway laboratory studies.": "Een onderzoekspeptide dat veel wordt aangehaald in laboratoriumstudies naar receptorbinding en metabole routes.",
"A sample goes to Janoshik Analytical: identity, HPLC purity, measured content.": "Een monster gaat naar Janoshik Analytical: identiteit, HPLC-zuiverheid, gemeten gehalte.",
"A synthetic peptide investigated in neuromodulation and neuroprotection research.": "Een synthetisch peptide, onderzocht in onderzoek naar neuromodulatie en neuroprotectie.",
"A synthetic tetrapeptide studied in telomere-biology and cellular-ageing research models.": "Een synthetisch tetrapeptide, bestudeerd in onderzoeksmodellen van telomeerbiologie en cellulaire veroudering.",
"A unique promo code under your name, valid across the catalogue.": "Een persoonlijke kortingscode op uw naam, geldig voor de hele catalogus.",
"AMYLIN RECEPTOR RESEARCH": "ONDERZOEK AMYLINERECEPTOR",
"ANTI-AGING RESEARCH": "ANTI-AGING-ONDERZOEK",
"ANTI-INFLAMMATORY RESEARCH": "ONTSTEKINGSONDERZOEK",
"ANTIMICROBIAL RESEARCH": "ANTIMICROBIEEL ONDERZOEK",
"Accept all": "Alles accepteren",
"Accuracy": "Nauwkeurigheid",
"Acetic Acid Water {#}%": "Azijnzuurwater {#}%",
"Add": "Toevoegen",
"Add to cart": "In winkelwagen",
"Address": "Adres",
"Adult researchers and laboratory professionals acting in compliance with the laws of their jurisdiction.": "Volwassen onderzoekers en laboratoriumprofessionals die handelen in overeenstemming met de wetten van hun land.",
"All": "Alles",
"All compounds": "Alle verbindingen",
"Ambassador Program": "Ambassadeursprogramma",
"Ambassadors": "Ambassadeurs",
"An instant discount at checkout.": "Directe korting bij het afrekenen.",
"Analysed": "Geanalyseerd",
"Analysed and published.": "Geanalyseerd en gepubliceerd.",
"Analysed product · published batch": "Geanalyseerd product · gepubliceerde batch",
"Analyses": "Analyses",
"Analyses ordered by Novalyx on its own batches. Each new batch is analysed in turn and its report is published here.": "Analyses die Novalyx op zijn eigen batches laat uitvoeren. Elke nieuwe batch wordt op zijn beurt geanalyseerd en het rapport wordt hier gepubliceerd.",
"Analysis date": "Analysedatum",
"Analysis ordered by Novalyx on its {#}mg batch. The original report can be viewed at any time on Janoshik's website.": "Analyse die Novalyx op zijn batch van {#}mg liet uitvoeren. Het originele rapport is altijd in te zien op de website van Janoshik.",
"Analysis pending": "Analyse in behandeling",
"Analysis report available for the {#}mg — select it to view.": "Analyserapport beschikbaar voor {#}mg — selecteer het om het te bekijken.",
"Another question?": "Nog een vraag?",
"Are these products legal in my country?": "Zijn deze producten legaal in mijn land?",
"Assistant": "Assistent",
"Audience size (optional)": "Bereik (optioneel)",
"Australia, New Zealand and other countries": "Australië, Nieuw-Zeeland en andere landen",
"Australia, New Zealand, other countries": "Australië, Nieuw-Zeeland, andere landen",
"BIOREGULATOR RESEARCH": "ONDERZOEK BIOREGULATOREN",
"Bacteriostatic Water": "Bacteriostatisch water",
"Bacteriostatic water {#} ml": "Bacteriostatisch water {#} ml",
"Batch": "Batch",
"Batch selection": "Batchselectie",
"Bioregulators": "Bioregulatoren",
"Bitcoin payment": "Bitcoin-betaling",
"Bitcoin payment, billed in euros": "Bitcoin-betaling, gefactureerd in euro",
"Bitcoin payment: how does it work? ({#} steps)": "Bitcoin-betaling: hoe werkt het? ({#} stappen)",
"Bitcoin, billed in euros": "Bitcoin, gefactureerd in euro",
"Both components are investigational molecules, not authorised as medicines.": "Beide componenten zijn onderzoeksmoleculen, niet als geneesmiddel toegelaten.",
"Buy": "Kopen",
"Buy Bitcoin": "Bitcoin kopen",
"Buy now": "Nu kopen",
"By entering you confirm compliance with all applicable laws in your jurisdiction.": "Door verder te gaan bevestigt u dat u alle geldende wetten in uw land naleeft.",
"By using this website or placing an order you agree to these Terms. If you disagree, do not use this site.": "Door deze website te gebruiken of een bestelling te plaatsen, gaat u akkoord met deze voorwaarden. Als u niet akkoord gaat, gebruik deze site dan niet.",
"CELLULAR ENERGY RESEARCH": "ONDERZOEK CELLULAIRE ENERGIE",
"CELLULAR RESEARCH": "CELLULAIR ONDERZOEK",
"CJC-{#} (no DAC)": "CJC-{#} (zonder DAC)",
"CJC-{#} (with DAC)": "CJC-{#} (met DAC)",
"COA analyses": "COA-analyses",
"COMPLETE RESEARCH COMPLEX": "COMPLEET ONDERZOEKSCOMPLEX",
"COSMETIC PEPTIDE RESEARCH": "ONDERZOEK COSMETISCHE PEPTIDEN",
"Cart": "Winkelwagen",
"Catalogue": "Catalogus",
"Cellular energy, mitochondria, telomeres.": "Cellulaire energie, mitochondriën, telomeren.",
"Check that the amount received matches.": "Controleer of het ontvangen bedrag overeenkomt.",
"Close": "Sluiten",
"Cognitive": "Cognitief",
"Cognitive research": "Cognitief onderzoek",
"Coming soon": "Binnenkort",
"Coming soon — notify me": "Binnenkort — breng mij op de hoogte",
"Company": "Bedrijf",
"Composition": "Samenstelling",
"Compound notes": "Productfiches",
"Compounds supplied exclusively for in-vitro laboratory research. Not medicines or dietary supplements.": "Verbindingen uitsluitend geleverd voor in-vitro laboratoriumonderzoek. Geen geneesmiddelen of voedingssupplementen.",
"Confirm. That's it.": "Bevestigen. Klaar.",
"Confirmation email": "Bevestigingsmail",
"Confirmed in {#}–{#} min": "Bevestigd in {#}–{#} min",
"Contact": "Contact",
"Contact us": "Contact opnemen",
"Cosmetic Peptides": "Dermocosmetische peptiden",
"Cosmetic ingredient (topical use); efficacy data come mostly from manufacturers. No medicine status.": "Cosmetisch ingrediënt (topisch gebruik); werkzaamheidsgegevens komen vooral van fabrikanten. Geen geneesmiddelstatus.",
"Cosmetic ingredient; no medicine status.": "Cosmetisch ingrediënt; geen geneesmiddelstatus.",
"Crypto": "Crypto",
"Currency": "Valuta",
"Currently available to order online: {N}, {N}. Other items are shown as \"coming soon\".": "Momenteel online te bestellen: {N}, {N}. Andere artikelen staan als „binnenkort” vermeld.",
"Customise": "Aanpassen",
"Cyclic peptide (bremelanotide), agonist of melanocortin receptors (notably MC{#}R), related to melanotan II.": "Cyclisch peptide (bremelanotide), agonist van melanocortinereceptoren (met name MC{#}R), verwant aan melanotan II.",
"DIRECT BITCOIN PAYMENT · BILLED IN EUROS · INVOICE VALID {#} MIN": "DIRECTE BITCOIN-BETALING · GEFACTUREERD IN EURO · FACTUUR {#} MIN GELDIG",
"DUAL-AGONIST RESEARCH": "ONDERZOEK DUALE AGONISTEN",
"DUAL-RECEPTOR RESEARCH": "ONDERZOEK DUALE RECEPTOREN",
"Data enquiries:": "Vragen over gegevens:",
"Date": "Datum",
"Delivery country": "Land van levering",
"Dermo-cosmetic peptide ingredients.": "Dermocosmetische peptide-ingrediënten.",
"Details": "Details",
"Direct Bitcoin payment · billed in euros": "Directe Bitcoin-betaling · gefactureerd in euro",
"Direct payment": "Directe betaling",
"Disclaimer": "Disclaimer",
"Discreet": "Discreet",
"Dispatch": "Verzending",
"Do the published reports match my vial?": "Komen de gepubliceerde rapporten overeen met mijn flacon?",
"Dry, room temperature, away from light before reconstitution; {#}–{#}°C after reconstitution": "Droog, kamertemperatuur, beschermd tegen licht vóór reconstitutie; {#}–{#}°C na reconstitutie",
"Dual agonist of the GIP and GLP-{#} receptors ({#}-amino-acid peptide, Eli Lilly).": "Duale agonist van de GIP- en GLP-{#}-receptoren (peptide van {#} aminozuren, Eli Lilly).",
"Dual agonist of the glucagon and GLP-{#} receptors, developed by Boehringer Ingelheim (BI {#}).": "Duale agonist van de glucagon- en GLP-{#}-receptoren, ontwikkeld door Boehringer Ingelheim (BI {#}).",
"ENTER SITE →": "SITE BETREDEN →",
"Each batch is selected from our manufacturing partner, with its certificate of analysis.": "Elke batch wordt geselecteerd bij onze productiepartner, met zijn analysecertificaat.",
"Educational information only": "Uitsluitend educatieve informatie",
"Email": "E-mail",
"Email us and we'll guide you step by step, the first time and every time after.": "Schrijf ons en we begeleiden u stap voor stap, de eerste keer en alle volgende keren.",
"Enlarge the photo": "Foto vergroten",
"Essential cookies for functionality only. Analytics cookies placed with consent only.": "Alleen cookies die nodig zijn voor de werking. Analysecookies alleen met toestemming.",
"European Union": "Europese Unie",
"European Union (excl. France)": "Europese Unie (zonder Frankrijk)",
"Experimental compound; no medicine authorisation.": "Experimentele verbinding; geen geneesmiddelvergunning.",
"Factual, strictly scientific information on catalogue compounds. No health claims.": "Feitelijke, strikt wetenschappelijke informatie over de verbindingen uit de catalogus. Geen gezondheidsclaims.",
"Fermer": "Sluiten",
"First time? How to pay with Bitcoin": "Eerste keer? Zo betaalt u met Bitcoin",
"For in-vitro laboratory research only. Not for human or veterinary use.": "Uitsluitend voor in-vitro laboratoriumonderzoek. Niet voor gebruik bij mens of dier.",
"For volume orders, recurring supply or a specific document request, write to us. Reply within one business day.": "Voor volumebestellingen, regelmatige levering of een specifiek documentverzoek kunt u ons schrijven. Antwoord binnen één werkdag.",
"For you": "Voor u",
"For your audience": "Voor uw publiek",
"Format": "Formaat",
"Four steps, nothing hidden.": "Vier stappen, niets verborgen.",
"Fragment {#}-{#} of human GHRH (sermorelin), which activates the GHRH receptor.": "Fragment {#}-{#} van menselijk GHRH (sermorelin), dat de GHRH-receptor activeert.",
"France": "Frankrijk",
"Free shipping from {#}€": "Gratis verzending vanaf {#}€",
"French company · Paris": "Frans bedrijf · Parijs",
"French · SIRET {#} {#} {#}": "Frans · SIRET {#} {#} {#}",
"Frequently asked questions": "Veelgestelde vragen",
"Frequently bought with": "Vaak samen gekocht",
"From": "Vanaf",
"Full catalogue": "Volledige catalogus",
"GH RESEARCH": "GH-ONDERZOEK",
"GH Research": "GH-onderzoek",
"GH SECRETAGOGUE RESEARCH": "ONDERZOEK GH-SECRETAGOGEN",
"GH research": "GH-onderzoek",
"GH secretagogue receptor research.": "Onderzoek naar de GH-secretagoogreceptor.",
"GH-RELEASING RESEARCH BLEND": "ONDERZOEKSMENGSEL GH-AFGIFTE",
"GH-SECRETAGOGUE RESEARCH": "ONDERZOEK GH-SECRETAGOGEN",
"GH-releasing and secretagogue research.": "Onderzoek naar GH-afgifte en secretagogen.",
"GHK-Copper": "GHK-Koper",
"GHK-Cu (GHK-Cuivre)": "GHK-Cu (GHK-Koper)",
"GHRH ANALOG RESEARCH": "ONDERZOEK GHRH-ANALOGEN",
"GHRH RESEARCH": "GHRH-ONDERZOEK",
"GLP-{#} RECEPTOR RESEARCH": "ONDERZOEK GLP-{#}-RECEPTOR",
"GLP-{#} receptor agonist (acylated analogue of human GLP-{#}), developed by Novo Nordisk.": "GLP-{#}-receptoragonist (geacyleerd analoog van menselijk GLP-{#}), ontwikkeld door Novo Nordisk.",
"GLP-{#}, GIP, glucagon and amylin receptors.": "GLP-{#}-, GIP-, glucagon- en amylinereceptoren.",
"GROWTH FACTOR RESEARCH": "ONDERZOEK GROEIFACTOREN",
"GROWTH HORMONE RESEARCH": "ONDERZOEK GROEIHORMOON",
"Got Revolut?": "Heeft u Revolut?",
"Governed by French law and applicable EU regulations.": "Beheerst door het Franse recht en de toepasselijke EU-regelgeving.",
"Grade": "Kwaliteit",
"Growth & Cellular": "Groei & cellulair",
"HGH Fragment {#}-{#}": "HGH-fragment {#}-{#}",
"HPLC purity": "HPLC-zuiverheid",
"Handle / account link": "Profielnaam / accountlink",
"Help": "Hulp",
"How do I pay?": "Hoe betaal ik?",
"How do I track my order?": "Hoe volg ik mijn bestelling?",
"How it works": "Hoe het werkt",
"How long does confirmation take?": "Hoe lang duurt de bevestiging?",
"How long is delivery?": "Hoe lang duurt de levering?",
"How should compounds be stored?": "Hoe moeten de verbindingen worden bewaard?",
"I am a qualified professional (researcher, laboratory, institution).": "Ik ben een gekwalificeerde professional (onderzoeker, laboratorium, instelling).",
"I confirm I am {#} years of age or older.": "Ik bevestig dat ik {#} jaar of ouder ben.",
"I confirm this order is strictly for laboratory research purposes only.": "Ik bevestig dat deze bestelling uitsluitend bestemd is voor laboratoriumonderzoek.",
"I give no dose, protocol or medical advice.": "Ik geef geen dosering, protocol of medisch advies.",
"I paid slightly less because of fees.": "Ik heb door de kosten iets minder betaald.",
"IMMUNE MODULATION RESEARCH": "ONDERZOEK IMMUUNMODULATIE",
"If you can shop online, you can pay with Bitcoin. Allow": "Als u online kunt winkelen, kunt u met Bitcoin betalen. Reken op",
"Immune": "Immuunsysteem",
"Immune modulation, thymic pathways.": "Immuunmodulatie, thymusroutes.",
"Immune research": "Immuunonderzoek",
"In stock · ships within {#} h": "Op voorraad · verzending binnen {#} u",
"In stock · ships within {#} h · {#}–{#} day delivery in France": "Op voorraad · verzending binnen {#} u · levering in {#}–{#} dagen in Frankrijk",
"In stock: ships within {#} h": "Op voorraad: verzending binnen {#} u",
"In stock: {#} h · made to order: {#}–{#} weeks": "Op voorraad: {#} u · op bestelling: {#}–{#} weken",
"In the cart, choose": "Kies in de winkelwagen",
"In your app, tap “Send” or “Withdraw”.": "Tik in uw app op „Verzenden” of „Opnemen”.",
"Independent analysis": "Onafhankelijke analyse",
"Independent analysis · Janoshik": "Onafhankelijke analyse · Janoshik",
"Index": "Index",
"Investigational drug (phase {#} clinical trials); not authorised.": "Onderzoeksgeneesmiddel (klinische studies fase {#}); niet toegelaten.",
"Investigational drug, in phase {#} clinical trials; to our knowledge not authorised.": "Onderzoeksgeneesmiddel in klinische studies fase {#}; voor zover wij weten niet toegelaten.",
"Investigational molecule in clinical trials; not authorised as a medicine.": "Onderzoeksmolecuul in klinische studies; niet als geneesmiddel toegelaten.",
"Janoshik (per batch)": "Janoshik (per batch)",
"Janoshik HPLC (per batch)": "Janoshik HPLC (per batch)",
"Janoshik, public key": "Janoshik, openbare sleutel",
"KTTKS pentapeptide coupled to palmitic acid, a cosmetic ingredient studied for collagen synthesis in skin models.": "Pentapeptide KTTKS gekoppeld aan palmitinezuur, een cosmetisch ingrediënt dat in huidmodellen wordt onderzocht op collageensynthese.",
"LAB SUPPLY": "LABORATORIUMBENODIGDHEDEN",
"LONGEVITY RESEARCH": "ONDERZOEK LEVENSDUUR",
"Lab Supplies": "Laboratoriumbenodigdheden",
"Laboratories and resellers: volume pricing, reports included.": "Laboratoria en wederverkopers: volumeprijzen, rapporten inbegrepen.",
"Laboratory": "Laboratorium",
"Laboratory / Organization (optional)": "Laboratorium / organisatie (optioneel)",
"Laboratory reagent.": "Laboratoriumreagens.",
"Laboratory reconstitution solvents.": "Oplosmiddelen voor reconstitutie in het laboratorium.",
"Laboratory solvent: it contains no active substance.": "Laboratoriumoplosmiddel: het bevat geen werkzame stof.",
"Last updated: April {#}": "Laatst bijgewerkt: april {#}",
"Learn more": "Meer informatie",
"Legal": "Juridisch",
"Legal account holder": "Wettelijke rekeninghouder",
"Long-acting selective amylin receptor agonist, in clinical development.": "Langwerkende selectieve amylinereceptoragonist, in klinische ontwikkeling.",
"Longevity": "Levensduur",
"Longevity research": "Onderzoek naar levensduur",
"Lyophilised peptide · research use": "Gelyofiliseerd peptide · onderzoeksgebruik",
"Lyophilised peptides supplied exclusively for in-vitro research. Published analysis reports are marked COA.": "Gelyofiliseerde peptiden uitsluitend voor in-vitro-onderzoek. Gepubliceerde analyserapporten zijn gemarkeerd met COA.",
"Lyophilised vial": "Gelyofiliseerde flacon",
"Lyophilised vials ({#}-pack)": "Gelyofiliseerde flacons ({#}-pack)",
"MELANOCORTIN RECEPTOR RESEARCH": "ONDERZOEK MELANOCORTINERECEPTOR",
"METABOLIC FRAGMENT RESEARCH": "ONDERZOEK METABOLE FRAGMENTEN",
"METABOLIC RESEARCH": "METABOOL ONDERZOEK",
"MITOCHONDRIAL RESEARCH": "MITOCHONDRIAAL ONDERZOEK",
"MULTI-RECEPTOR RESEARCH": "ONDERZOEK MEERDERE RECEPTOREN",
"Made to order": "Op bestelling",
"Made to order · {#}–{#} weeks · batch analysed by Janoshik before shipping · tracked at every step": "Op bestelling · {#}–{#} weken · batch vóór verzending door Janoshik geanalyseerd · gevolgd bij elke stap",
"Made-to-order product?": "Product op bestelling?",
"Manage cookies": "Cookies beheren",
"Measured": "Gemeten",
"Measured content": "Gemeten gehalte",
"Menu": "Menu",
"Message": "Bericht",
"Metabolic": "Metabool",
"Metabolic research": "Metabool onderzoek",
"Method": "Methode",
"Most popular": "Meest gekozen",
"Most requested": "Meest gevraagd",
"Multi-peptide blends in a single vial.": "Multi-peptidemengsels in één flacon.",
"My invoice expired.": "Mijn factuur is verlopen.",
"NEUROMODULATION RESEARCH": "ONDERZOEK NEUROMODULATIE",
"NEUROPEPTIDE RESEARCH": "ONDERZOEK NEUROPEPTIDEN",
"NEUROPROTECTIVE RESEARCH": "ONDERZOEK NEUROPROTECTIE",
"NEUROTROPHIC RESEARCH": "NEUROTROOF ONDERZOEK",
"NOOTROPIC RESEARCH": "ONDERZOEK NOOTROPICA",
"Name": "Naam",
"Name on report": "Naam in het rapport",
"Neuromodulation and neuroprotection.": "Neuromodulatie en neuroprotectie.",
"No Medical Advice": "Geen medisch advies",
"No authorisation; preclinical data only.": "Geen vergunning; alleen preklinische gegevens.",
"No medicine authorisation in any country; no published clinical data.": "Geen geneesmiddelvergunning, in geen enkel land; geen gepubliceerde klinische gegevens.",
"No medicine authorisation in the European Union or the United States.": "Geen geneesmiddelvergunning in de Europese Unie of de Verenigde Staten.",
"No medicine authorisation.": "Geen geneesmiddelvergunning.",
"No medicine authorisation; clinical development discontinued.": "Geen geneesmiddelvergunning; klinische ontwikkeling stopgezet.",
"No medicine authorisation; clinical development stopped.": "Geen geneesmiddelvergunning; klinische ontwikkeling gestopt.",
"Not authorised as a medicine in the EU or the United States; limited data, mostly from a small number of laboratories.": "Niet als geneesmiddel toegelaten in de EU of de Verenigde Staten; beperkte gegevens, grotendeels van een klein aantal laboratoria.",
"Not authorised as a medicine. Controlled human data are almost non-existent. Prohibited by WADA.": "Niet als geneesmiddel toegelaten. Gecontroleerde gegevens bij mensen zijn vrijwel onbestaand. Verboden door het WADA.",
"Not authorised as a medicine. Prohibited by WADA.": "Niet als geneesmiddel toegelaten. Verboden door het WADA.",
"Not authorised as a medicine; clinical trials in obesity did not lead to an authorisation.": "Niet als geneesmiddel toegelaten; klinische studies naar obesitas hebben niet tot een vergunning geleid.",
"Not authorised as a medicine; exploratory clinical trials have taken place without authorisation. Prohibited by WADA.": "Niet als geneesmiddel toegelaten; verkennende klinische studies hebben zonder vergunning plaatsgevonden. Verboden door het WADA.",
"Not authorised as a medicine; research is essentially in vitro and preclinical.": "Niet als geneesmiddel toegelaten; het onderzoek is in wezen in vitro en preklinisch.",
"Not authorised as a medicine; research is essentially preclinical.": "Niet als geneesmiddel toegelaten; het onderzoek is in wezen preklinisch.",
"Not authorised as a medicine; research use. Prohibited by WADA.": "Niet als geneesmiddel toegelaten; gebruik voor onderzoek. Verboden door het WADA.",
"Not authorised as a medicine; the literature is old and results have been inconsistent.": "Niet als geneesmiddel toegelaten; de literatuur is oud en de resultaten waren wisselend.",
"Not authorised as a medicine; used in research studies in reproductive endocrinology.": "Niet als geneesmiddel toegelaten; gebruikt in onderzoeksstudies in de reproductieve endocrinologie.",
"Not authorised in the EU or the United States; data come mostly from the Russian literature.": "Niet toegelaten in de EU of de Verenigde Staten; de gegevens komen grotendeels uit de Russische literatuur.",
"Not authorised in the EU or the United States; the literature is limited and rarely independently replicated.": "Niet toegelaten in de EU of de Verenigde Staten; de literatuur is beperkt en zelden onafhankelijk herhaald.",
"Not for Human Use": "Niet voor menselijk gebruik",
"Novalyx assistant": "Novalyx-assistent",
"Novalyx operates this website and is responsible for your personal data in accordance with the GDPR.": "Novalyx beheert deze website en is verantwoordelijk voor uw persoonsgegevens volgens de AVG.",
"Nucleoside (not a peptide) used in research as an activator of AMPK, a key enzyme of cellular energy metabolism.": "Nucleoside (geen peptide), in onderzoek gebruikt als activator van AMPK, een sleutelenzym van het cellulaire energiemetabolisme.",
"On Novalyx: available to order.": "Bij Novalyx: te bestellen.",
"On Novalyx: coming soon (not yet available to order).": "Bij Novalyx: binnenkort (nog niet te bestellen).",
"On first sign-up the platform verifies your identity: from a few minutes to a day. Do it before ordering.": "Bij de eerste aanmelding controleert het platform uw identiteit: van enkele minuten tot een dag. Doe dit vóór het bestellen.",
"Only": "Nog maar",
"Open report (Janoshik)": "Rapport openen (Janoshik)",
"Open the": "Open het tabblad",
"Open the assistant": "Assistent openen",
"Orders outside the European Union": "Bestellingen buiten de Europese Unie",
"Otherwise: Kraken or Coinbase.": "Anders: Kraken of Coinbase.",
"Our products are not medicines, dietary supplements or cosmetics. They are supplied exclusively for in-vitro research.": "Onze producten zijn geen geneesmiddelen, voedingssupplementen of cosmetica. Ze worden uitsluitend geleverd voor in-vitro-onderzoek.",
"PDF catalogue": "PDF-catalogus",
"Paris, France": "Parijs, Frankrijk",
"Partnerships": "Partnerschappen",
"Pay by bank transfer": "Betalen per bankoverschrijving",
"Pay with Bitcoin": "Betalen met Bitcoin",
"Pay with Bitcoin in three steps.": "Betalen met Bitcoin in drie stappen.",
"Paying with Bitcoin is easier than it sounds.": "Betalen met Bitcoin is eenvoudiger dan het klinkt.",
"Payment": "Betaling",
"Payment by bank transfer": "Betaling per bankoverschrijving",
"Payment confirmed": "Betaling bevestigd",
"Payment sent": "Betaling verzonden",
"Pharmaceutical-grade": "Farmaceutische kwaliteit",
"Place your order": "Bestelling plaatsen",
"Platform (Instagram, TikTok, YouTube…)": "Platform (Instagram, TikTok, YouTube…)",
"Preclinical research (cells, animals); a few very limited human studies on analogues. No authorisation.": "Preklinisch onderzoek (cellen, dieren); enkele zeer beperkte studies bij mensen op analogen. Geen vergunning.",
"Preclinical research compound; no medicine authorisation.": "Preklinische onderzoeksverbinding; geen geneesmiddelvergunning.",
"Privacy": "Privacy",
"Privacy Policy": "Privacybeleid",
"Proceed to checkout": "Afrekenen",
"Product visual. The batch number is printed on every vial shipped.": "Productafbeelding. Het batchnummer staat op elke verzonden flacon.",
"Products for laboratory research use only — not for human or veterinary use": "Producten uitsluitend voor laboratoriumonderzoek — niet voor gebruik bij mens of dier",
"Products for laboratory research use only, not for human or veterinary use": "Producten uitsluitend voor laboratoriumonderzoek, niet voor gebruik bij mens of dier",
"Products, orders, documents, professional pricing: reply within one business day.": "Producten, bestellingen, documenten, professionele prijzen: antwoord binnen één werkdag.",
"Professional access": "Professionele toegang",
"Professionals": "Professionals",
"Publication": "Publicatie",
"Published analyses": "Gepubliceerde analyses",
"Purity": "Zuiverheid",
"Qty": "Aantal",
"Quick buy": "Snel kopen",
"REGENERATIVE RESEARCH": "REGENERATIEF ONDERZOEK",
"REGENERATIVE RESEARCH BLEND": "REGENERATIEF ONDERZOEKSMENGSEL",
"REGENERATIVE TRIPLE BLEND": "REGENERATIEF DRIEVOUDIG MENGSEL",
"REPRODUCTIVE RESEARCH": "REPRODUCTIEF ONDERZOEK",
"Refuse all": "Alles weigeren",
"Regenerative": "Regeneratief",
"Regenerative research": "Regeneratief onderzoek",
"Registered": "Ingeschreven",
"Registered as a medicine in Russia; not authorised in the EU or the United States.": "In Rusland als geneesmiddel geregistreerd; niet toegelaten in de EU of de Verenigde Staten.",
"Regulatory Compliance": "Naleving van de regelgeving",
"Regulatory status varies by jurisdiction. It is your responsibility to check the applicable rules before ordering.": "De wettelijke status verschilt per land. Het is uw verantwoordelijkheid de geldende regels vóór het bestellen te controleren.",
"Remove": "Verwijderen",
"Reply": "Antwoord",
"Reports for these compounds will be published once the first batch has been analysed. Questions are welcome.": "De rapporten voor deze verbindingen worden gepubliceerd zodra de eerste batch is geanalyseerd. Vragen zijn welkom.",
"Request pricing": "Prijzen aanvragen",
"Research Use Only": "Uitsluitend voor onderzoek",
"Research catalogue": "Onderzoekscatalogus",
"Research compounds,": "Onderzoeksverbindingen,",
"Research peptide; no medicine authorisation.": "Onderzoekspeptide; geen geneesmiddelvergunning.",
"Research reagent (cell culture); not authorised as a medicine.": "Onderzoeksreagens (celkweek); niet als geneesmiddel toegelaten.",
"Research reagent; no medicine authorisation. Listed on the World Anti-Doping Agency prohibited list.": "Onderzoeksreagens; geen geneesmiddelvergunning. Op de verboden lijst van het Wereldantidopingagentschap.",
"Research reagent; not authorised as a medicine.": "Onderzoeksreagens; niet als geneesmiddel toegelaten.",
"Research use only": "Uitsluitend voor onderzoek",
"Research use only — not for human or veterinary use": "Uitsluitend voor onderzoek — niet voor gebruik bij mens of dier",
"Reserved for laboratory research.": "Voorbehouden aan laboratoriumonderzoek.",
"Resources": "Bronnen",
"Revolut, Kraken or Coinbase": "Revolut, Kraken of Coinbase",
"Room temperature / avoid direct light": "Kamertemperatuur / direct licht vermijden",
"Room temperature, away from light": "Kamertemperatuur, beschermd tegen licht",
"SECURE PAYMENT BY STRIPE": "VEILIGE BETALING VIA STRIPE",
"SLEEP RESEARCH": "SLAAPONDERZOEK",
"Sample (as on report)": "Monster (zoals in het rapport)",
"Scan the invoice QR code.": "Scan de QR-code van de factuur.",
"Search a compound": "Verbinding zoeken",
"Search a compound (e.g. {N}, {N}…)": "Verbinding zoeken (bijv. {N}, {N}…)",
"Secure payment": "Veilige betaling",
"Secure payment by Stripe · Visa · Mastercard · Apple Pay": "Veilige betaling via Stripe · Visa · Mastercard · Apple Pay",
"See the analyses": "Analyses bekijken",
"See the {#}-step guide": "Bekijk de gids in {#} stappen",
"Send": "Verzenden",
"Send application": "Aanvraag verzenden",
"Send the payment": "De betaling verzenden",
"Shipped": "Verzonden",
"Shipped within {#} h · delivery in {#}–{#} days maximum in France": "Verzending binnen {#} u · levering in maximaal {#}–{#} dagen in Frankrijk",
"Shipping": "Verzending",
"Shipping & delivery": "Verzending & levering",
"Shipping:": "Verzending:",
"Short peptides from V. Khavinson's research.": "Korte peptiden uit het onderzoek van V. Khavinson.",
"Signature Blends": "Signature-mengsels",
"Simply place the order again. If you had already sent the payment, email us with the time it was sent: we will find it.": "Plaats de bestelling gewoon opnieuw. Had u de betaling al verzonden, mail ons dan met het tijdstip van verzending: wij vinden haar terug.",
"Size": "Formaat",
"Sleep, reproductive, melanocortin.": "Slaap, voortplanting, melanocortine.",
"Soon": "Binnenkort",
"Specialized": "Gespecialiseerd",
"Start with the essentials.": "Begin met de basis.",
"Status:": "Status:",
"Sterile reconstitution solvent + {#}% benzyl alcohol": "Steriel reconstitutie-oplosmiddel + {#}% benzylalcohol",
"Sterile sealed vial": "Steriele verzegelde flacon",
"Sterile water, {#}% acetic acid": "Steriel water, {#}% azijnzuur",
"Storage": "Bewaring",
"Stripe, card": "Stripe, kaart",
"Stuck at a step?": "Vastgelopen bij een stap?",
"Subject": "Onderwerp",
"Subtotal": "Subtotaal",
"Support": "Support",
"Switzerland, UK": "Zwitserland, VK",
"Switzerland, United Kingdom": "Zwitserland, Verenigd Koninkrijk",
"Synthetic analogue of α-MSH, known as afamelanotide ([Nle{#}, D-Phe{#}]-α-MSH), an agonist of the MC{#}R receptor.": "Synthetisch analoog van α-MSH, bekend als afamelanotide ([Nle{#}, D-Phe{#}]-α-MSH), een agonist van de MC{#}R-receptor.",
"Synthetic cyclic peptide analogue of α-MSH, a non-selective agonist of melanocortin receptors.": "Synthetisch cyclisch peptide-analoog van α-MSH, een niet-selectieve agonist van melanocortinereceptoren.",
"Synthetic derivative of {N} carrying an adamantane group. Independent scientific literature on it is still very limited.": "Synthetisch derivaat van {N} met een adamantaangroep. De onafhankelijke wetenschappelijke literatuur erover is nog zeer beperkt.",
"Synthetic hexapeptide, one of the first growth-hormone secretagogues, agonist of the ghrelin receptor (GHS-R{#}a).": "Synthetisch hexapeptide, een van de eerste groeihormoon-secretagogen, agonist van de ghrelinereceptor (GHS-R{#}a).",
"Synthetic pentapeptide agonist of the ghrelin receptor (GHS-R{#}a), classed among growth-hormone secretagogues.": "Synthetisch pentapeptide, agonist van de ghrelinereceptor (GHS-R{#}a), gerekend tot de groeihormoon-secretagogen.",
"TELOMERE RESEARCH": "TELOMEERONDERZOEK",
"THE FASTEST WAY": "DE SNELSTE WEG",
"TISSUE REPAIR RESEARCH": "ONDERZOEK WEEFSELHERSTEL",
"TRIPLE-RECEPTOR RESEARCH": "ONDERZOEK DRIEVOUDIGE RECEPTOREN",
"Task no.": "Opdracht nr.",
"Task · key": "Opdracht · sleutel",
"Tell us about your audience and your interest in research.": "Vertel ons over uw publiek en uw interesse in onderzoek.",
"Terms": "Voorwaarden",
"Terms & Conditions": "Algemene voorwaarden",
"Testing lab": "Testlaboratorium",
"The report and its verification key are published. Anyone can check it.": "Het rapport en de verificatiesleutel zijn gepubliceerd. Iedereen kan het controleren.",
"The rigour of a laboratory,": "De nauwgezetheid van een laboratorium,",
"This order is strictly for laboratory research — not for human or animal use.": "Deze bestelling is uitsluitend bestemd voor laboratoriumonderzoek — niet voor gebruik bij mens of dier.",
"Tissue-repair and angiogenesis research.": "Onderzoek naar weefselherstel en angiogenese.",
"Total": "Totaal",
"Tracking": "Tracking",
"Transparency": "Transparantie",
"Trust isn't claimed, it's documented. Here is exactly what happens between production and your laboratory.": "Vertrouwen wordt niet beweerd, het wordt gedocumenteerd. Dit gebeurt er precies tussen de productie en uw laboratorium.",
"USA, Canada": "VS, Canada",
"Under GDPR: access, rectify, erase, restrict, port your data, or object to processing. Email": "Volgens de AVG: inzage, rectificatie, wissing, beperking, overdraagbaarheid van uw gegevens of bezwaar tegen de verwerking. E-mail",
"United States, Canada": "Verenigde Staten, Canada",
"Up to −{#}% from {#} vials": "Tot −{#}% vanaf {#} flacons",
"Use declaration": "Gebruiksverklaring",
"Usually {#} to {#} minutes, depending on Bitcoin network activity. You get an email as soon as it's confirmed.": "Meestal {#} tot {#} minuten, afhankelijk van de drukte op het Bitcoin-netwerk. U krijgt een e-mail zodra de betaling bevestigd is.",
"Verifiable analysis reports": "Verifieerbare analyserapporten",
"Verification key": "Verificatiesleutel",
"Verify on Janoshik": "Controleren op Janoshik",
"View catalogue": "Catalogus bekijken",
"View product": "Product bekijken",
"View report": "Rapport bekijken",
"View the whole catalogue": "Volledige catalogus bekijken",
"View {N} {#} mg": "{N} {#} mg bekijken",
"Volume pricing: the more you take, the less you pay": "Staffelprijzen: hoe meer u neemt, hoe minder u betaalt",
"Was authorised in the United States (brand Geref) and later withdrawn for commercial reasons. Prohibited by WADA.": "Was toegelaten in de Verenigde Staten (merk Geref) en later om commerciële redenen teruggetrokken. Verboden door het WADA.",
"We do not sell your data. We share only with logistics and payment partners (Stripe) under strict processing agreements.": "Wij verkopen uw gegevens niet. Wij delen ze alleen met logistieke en betaalpartners (Stripe) onder strikte verwerkersovereenkomsten.",
"What are research peptides?": "Wat zijn onderzoekspeptiden?",
"What does \"made to order\" mean?": "Wat betekent „op bestelling”?",
"What happens next?": "Wat gebeurt er daarna?",
"What is a certificate of analysis (COA)?": "Wat is een analysecertificaat (COA)?",
"What is your returns policy?": "Wat is uw retourbeleid?",
"What is {N}?": "Wat is {N}?",
"Which product do you mean? Give its name (for example \"price of {N}\").": "Welk product bedoelt u? Noem de naam (bijvoorbeeld „prijs van {N}”).",
"Which products are available?": "Welke producten zijn beschikbaar?",
"Who can order from Novalyx?": "Wie kan bij Novalyx bestellen?",
"Why Bitcoin?": "Waarom Bitcoin?",
"Why is there a minimum on some products?": "Waarom is er bij sommige producten een minimum?",
"Within {#} business day": "Binnen {#} werkdag",
"Within {#} h, tracked, plain packaging": "Binnen {#} u, met tracking, neutrale verpakking",
"Write to us.": "Schrijf ons.",
"Write to us: reply within one business day.": "Schrijf ons: antwoord binnen één werkdag.",
"You must be {#}+ to purchase. Completing a purchase confirms you meet this requirement.": "U moet {#}+ zijn om te kopen. Met een aankoop bevestigt u dat u aan deze voorwaarde voldoet.",
"You save": "U bespaart",
"Your organization's name": "Naam van uw organisatie",
"Your question": "Uw vraag",
"Your question…": "Uw vraag…",
"Zones and rates": "Zones en tarieven",
"after that.": "daarna.",
"an invoice with a QR code appears": "er verschijnt een factuur met een QR-code",
"analysed": "geanalyseerd",
"away from free shipping": "tot gratis verzending",
"batch received, then analysed by Janoshik: an email at every step": "batch ontvangen en daarna door Janoshik geanalyseerd: bij elke stap een e-mail",
"from your app": "vanuit uw app",
"lyophilised": "gelyofiliseerd",
"not the noise": "niet het lawaai",
"of a shop.": "van een winkel.",
"scan, check, confirm": "scannen, controleren, bevestigen",
"tab, then": ", daarna",
"the first time,": "de eerste keer,",
"usually within {#} to {#} minutes": "meestal binnen {#} tot {#} minuten",
"vial": "flacon",
"vials": "flacons",
"with your tracking number": "met uw trackingnummer",
"your order is approved": "uw bestelling is goedgekeurd",
"{#} Rue Pasquier, {#} Paris, France": "{#} Rue Pasquier, {#} Parijs, Frankrijk",
"{#} Sept {#}": "{#} sep. {#}",
"{#} compounds, {#} research areas.": "{#} verbindingen, {#} onderzoeksgebieden.",
"{#} lyophilised compounds · one analysis report per batch": "{#} gelyofiliseerde verbindingen · één analyserapport per batch",
"{#} min": "{#} min",
"{#} minutes": "{#} minuten",
"{#} ml sealed vial": "Verzegelde flacon van {#} ml",
"{#}-amino-acid analogue of GHRH (growth-hormone-releasing hormone), modified to resist degradation.": "Analoog van GHRH (groeihormoon-releasing hormoon) van {#} aminozuren, aangepast om afbraak te weerstaan.",
"{#}-amino-acid peptide derived from spadin, studied in animals as an inhibitor of the TREK-{#} potassium channel.": "Peptide van {#} aminozuren, afgeleid van spadine, bij dieren bestudeerd als remmer van het kaliumkanaal TREK-{#}.",
"{#}. Acceptance": "{#}. Aanvaarding",
"{#}. Age Restriction": "{#}. Leeftijdsgrens",
"{#}. Contact": "{#}. Contact",
"{#}. Data Sharing": "{#}. Delen van gegevens",
"{#}. Data We Collect": "{#}. Welke gegevens wij verzamelen",
"{#}. Governing Law": "{#}. Toepasselijk recht",
"{#}. How We Use Your Data": "{#}. Hoe wij uw gegevens gebruiken",
"{#}. Limitation of Liability": "{#}. Beperking van aansprakelijkheid",
"{#}. Orders & Payment": "{#}. Bestellingen & betaling",
"{#}. Research Use Only": "{#}. Uitsluitend voor onderzoek",
"{#}. Returns": "{#}. Retouren",
"{#}. Shipping & International Orders": "{#}. Verzending & internationale bestellingen",
"{#}. Who We Are": "{#}. Wie wij zijn",
"{#}. Your Rights": "{#}. Uw rechten",
"{#}mg total": "{#}mg totaal",
"{#}mg total (BPC{#}+TB{#})": "{#}mg totaal (BPC{#}+TB{#})",
"{#}mg total (BPC{#}+TB{#}) · {#}mg total (BPC{#}+TB{#})": "{#}mg totaal (BPC{#}+TB{#}) · {#}mg totaal (BPC{#}+TB{#})",
"{#}mg · Pack de {#}": "{#}mg · {#}-pack",
"{#}ml vial": "Flacon van {#}ml",
"{#}ml · Pack de {#}": "{#}ml · {#}-pack",
"{#}–{#} business days": "{#}–{#} werkdagen",
"{#}–{#} business days (variable)": "{#}–{#} werkdagen (variabel)",
"{#}–{#} days max.": "max. {#}–{#} dagen",
"{N} is a laboratory reconstitution solvent. Not for human or veterinary use.": "{N} is een oplosmiddel voor reconstitutie in het laboratorium. Niet voor gebruik bij mens of dier.",
"{N} is a synthetic tripeptide, supplied for research into neuroprotection and cognitive longevity signalling pathways.": "{N} is een synthetisch tripeptide, geleverd voor onderzoek naar neuroprotectie en signaalroutes van cognitieve levensduur.",
"{N} {#}mg total (BPC{#}+TB{#}) — Novalyx Research": "{N} {#}mg totaal (BPC{#}+TB{#}) — Novalyx Research",
"{N} {#}mg total — Novalyx Research": "{N} {#}mg totaal — Novalyx Research",
"{N} {#}mg · Pack de {#} — Novalyx Research": "{N} {#}mg · {#}-pack — Novalyx Research",
"{N} {#}ml vial — Novalyx Research": "{N} flacon van {#}ml — Novalyx Research",
"{N} {#}ml · Pack de {#} — Novalyx Research": "{N} {#}ml · {#}-pack — Novalyx Research",
"{N} · batch NLR-{#}-{#} analysed by Janoshik: {#}%": "{N} · batch NLR-{#}-{#} geanalyseerd door Janoshik: {#}%",
"~{#} min": "~{#} min",
"· instead of {#}€": "· in plaats van {#}€",
"· only {#} vials left from the analysed batch": "· nog maar {#} flacons uit de geanalyseerde batch",
"· research format: {#} vials minimum (−{#}%)": "· onderzoeksformaat: minimaal {#} flacons (−{#}%)",
"— or —": "— of —",
"“Pay with Bitcoin”": "„Betalen met Bitcoin”",
"≥{#}% target (HPLC)": "≥{#}% streefwaarde (HPLC)",
"\"D-retro-inverso\" peptide designed to disrupt the interaction between the FOXO{#} and p{#} proteins, studied in senescent-cell models (so-called senolytic research).": "„D-retro-inverso”-peptide, ontworpen om de interactie tussen de eiwitten FOXO{#} en p{#} te verstoren, bestudeerd in modellen van senescente cellen (zogenoemd senolytisch onderzoek).",
"A multi-receptor research compound studied in metabolic-pathway investigations. Of interest in laboratory studies examining receptor signalling.": "Een onderzoeksverbinding voor meerdere receptoren, bestudeerd in onderzoek naar metabole routes. Van belang voor laboratoriumstudies naar receptorsignalering.",
"A report issued by a third-party laboratory confirming a compound's identity and purity. Our Janoshik reports carry a public verification key at janoshik.com/verify.": "Een rapport van een onafhankelijk laboratorium dat de identiteit en zuiverheid van een verbinding bevestigt. Onze Janoshik-rapporten hebben een openbare verificatiesleutel op janoshik.com/verify.",
"A small difference, up to {#}%, is accepted automatically. If more is missing, the invoice shows the remaining amount to send.": "Een klein verschil, tot {#}%, wordt automatisch geaccepteerd. Ontbreekt er meer, dan toont de factuur het nog te verzenden bedrag.",
"A synthetic peptide fragment studied in laboratory models for its role in tissue-repair and angiogenesis research. Frequently used as a reference compound in tissue-repair assays.": "Een synthetisch peptidefragment, in laboratoriummodellen bestudeerd voor onderzoek naar weefselherstel en angiogenese. Vaak gebruikt als referentieverbinding in assays naar weefselherstel.",
"A synthetic version of a naturally occurring peptide region studied for cell-migration and actin-regulation research in controlled settings.": "Een synthetische versie van een van nature voorkomend peptidegebied, bestudeerd voor onderzoek naar celmigratie en actineregulatie onder gecontroleerde omstandigheden.",
"Acetylated octapeptide (acetyl octapeptide-{#}) used as a cosmetic ingredient; its sequence mimics part of the SNAP-{#} protein, involved in the SNARE complex of neurotransmitter release.": "Geacetyleerd octapeptide (acetyl-octapeptide-{#}), gebruikt als cosmetisch ingrediënt; de sequentie bootst een deel van het eiwit SNAP-{#} na, dat betrokken is bij het SNARE-complex van de afgifte van neurotransmitters.",
"Afamelanotide is authorised as an implant (brand Scenesse) for a specific indication (erythropoietic protoporphyria) in the EU and the United States. The Novalyx product is a research compound, not that medicine.": "Afamelanotide is als implantaat (merk Scenesse) toegelaten voor een specifieke indicatie (erytropoëtische protoporfyrie) in de EU en de Verenigde Staten. Het Novalyx-product is een onderzoeksverbinding, niet dat geneesmiddel.",
"All Novalyx products are compounds supplied exclusively for laboratory research (in vitro): not medicines, dietary supplements or cosmetics, with no human or animal use. Orders are reserved for adults and qualified professionals. It is your responsibility to check the regulations applicable in your country.": "Alle Novalyx-producten zijn verbindingen die uitsluitend worden geleverd voor laboratoriumonderzoek (in vitro): geen geneesmiddelen, voedingssupplementen of cosmetica, zonder gebruik bij mens of dier. Bestellingen zijn voorbehouden aan volwassenen en gekwalificeerde professionals. Het is uw verantwoordelijkheid de regelgeving in uw land te controleren.",
"All products are for in-vitro laboratory research only. Not for human or veterinary use. By purchasing you confirm you are a qualified researcher acting lawfully.": "Alle producten zijn uitsluitend voor in-vitro laboratoriumonderzoek. Niet voor gebruik bij mens of dier. Met uw aankoop bevestigt u dat u een gekwalificeerde onderzoeker bent die rechtmatig handelt.",
"All products are intended exclusively for scientific research by qualified professionals in appropriate laboratory settings. They are not drugs, supplements, or food products.": "Alle producten zijn uitsluitend bestemd voor wetenschappelijk onderzoek door gekwalificeerde professionals in geschikte laboratoriumomgevingen. Het zijn geen geneesmiddelen, supplementen of voedingsmiddelen.",
"All products are supplied exclusively for laboratory research. By ordering you confirm you are a qualified professional acting in compliance with applicable laws.": "Alle producten worden uitsluitend geleverd voor laboratoriumonderzoek. Met uw bestelling bevestigt u dat u een gekwalificeerde professional bent die handelt in overeenstemming met de geldende wetten.",
"Analyses are performed by Janoshik Analytical (Czech Republic), an independent laboratory. The {N} {#}mg report is published (HPLC purity {#}%) with its verification key: see the Analyses page. For other compounds, the report will be published once the first batch has been analysed.": "De analyses worden uitgevoerd door Janoshik Analytical (Tsjechië), een onafhankelijk laboratorium. Het rapport van {N} {#}mg is gepubliceerd (HPLC-zuiverheid {#}%) met de verificatiesleutel: zie de pagina Analyses. Voor andere verbindingen wordt het rapport gepubliceerd zodra de eerste batch is geanalyseerd.",
"Approved in China (NMPA, June {#}) for chronic weight management in adults; to our knowledge not approved in the EU or the United States.": "In China goedgekeurd (NMPA, juni {#}) voor chronisch gewichtsbeheer bij volwassenen; voor zover wij weten niet goedgekeurd in de EU of de Verenigde Staten.",
"Authorised in the United States (brand Egrifta) for a specific indication (HIV-associated abdominal lipodystrophy). The Novalyx product is a research compound, not that medicine.": "Toegelaten in de Verenigde Staten (merk Egrifta) voor een specifieke indicatie (hiv-gerelateerde abdominale lipodystrofie). Het Novalyx-product is een onderzoeksverbinding, niet dat geneesmiddel.",
"Authorised in the United States (brand Vyleesi) for a specific indication. The Novalyx product is a research compound, not that medicine.": "Toegelaten in de Verenigde Staten (merk Vyleesi) voor een specifieke indicatie. Het Novalyx-product is een onderzoeksverbinding, niet dat geneesmiddel.",
"Authorised medicine (FDA and EMA) under the brands Mounjaro and Zepbound. The Novalyx product is a research compound and is not that medicine.": "Toegelaten geneesmiddel (FDA en EMA) onder de merken Mounjaro en Zepbound. Het Novalyx-product is een onderzoeksverbinding en niet dat geneesmiddel.",
"Authorised medicine under the brands Ozempic, Wegovy and Rybelsus. The Novalyx product is a research compound and is not that medicine.": "Toegelaten geneesmiddel onder de merken Ozempic, Wegovy en Rybelsus. Het Novalyx-product is een onderzoeksverbinding en niet dat geneesmiddel.",
"Bank transfer is available for all orders, even small ones. The simplest way: \"Pay by bank transfer\" in the cart, or write to us at contact@novalyxresearch.com to confirm the amount (delivery included) and the order reference.": "Bankoverschrijving is mogelijk voor alle bestellingen, ook kleine. Het eenvoudigst: „Betalen per bankoverschrijving” in de winkelwagen, of schrijf ons op contact@novalyxresearch.com om het bedrag (inclusief verzending) en de bestelreferentie te bevestigen.",
"Before reconstitution: dry, at room temperature, away from light, vial sealed. After reconstitution: between {#} and {#} °C (refrigerated).": "Vóór reconstitutie: droog, op kamertemperatuur, beschermd tegen licht, flacon verzegeld. Na reconstitutie: tussen {#} en {#} °C (gekoeld).",
"Before reconstitution: dry, room temperature, away from light, vial sealed. After reconstitution: between {#} and {#} °C (refrigerated).": "Vóór reconstitutie: droog, kamertemperatuur, beschermd tegen licht, flacon verzegeld. Na reconstitutie: tussen {#} en {#} °C (gekoeld).",
"Bitcoin only, straight from the cart. The amount is calculated in euros and the invoice is valid for {#} minutes. First time? Our \"Pay with Bitcoin\" page explains everything in {#} steps (Revolut, Kraken or Coinbase).": "Alleen met Bitcoin, rechtstreeks vanuit de winkelwagen. Het bedrag wordt in euro berekend en de factuur is {#} minuten geldig. Eerste keer? Onze pagina „Betalen met Bitcoin” legt alles uit in {#} stappen (Revolut, Kraken of Coinbase).",
"Blend of two heptapeptides: {N}, an analogue of the ACTH({#}-{#}) fragment, and {N}, an analogue of tuftsin. Each is studied for its neuromodulatory effects.": "Mengsel van twee heptapeptiden: {N}, een analoog van het ACTH({#}-{#})-fragment, en {N}, een analoog van tuftsine. Elk wordt bestudeerd op zijn neuromodulerende effecten.",
"Blend of {N} (GLP-{#}, GIP and glucagon receptor agonist) and cagrilintide (long-acting amylin analogue), two molecules in clinical development.": "Mengsel van {N} (agonist van de GLP-{#}-, GIP- en glucagonreceptoren) en cagrilintide (langwerkend amyline-analoog), twee moleculen in klinische ontwikkeling.",
"By card through Stripe (your payment data never touches our servers), or by bank transfer, even for a small order: choose \"Pay by bank transfer\" in the cart. The order is shipped once the transfer is received.": "Met een kaart via Stripe (uw betaalgegevens komen nooit op onze servers), of per bankoverschrijving, ook voor een kleine bestelling: kies „Betalen per bankoverschrijving” in de winkelwagen. De bestelling wordt verzonden zodra de overschrijving is ontvangen.",
"C-terminal fragment (amino acids {#} to {#}) of human growth hormone, studied for its activity on fat metabolism without the growth effects of the whole hormone. {N} is a modified version of it.": "C-terminaal fragment (aminozuren {#} tot {#}) van menselijk groeihormoon, bestudeerd op zijn werking op het vetmetabolisme zonder de groei-effecten van het volledige hormoon. {N} is er een gewijzigde versie van.",
"CJC-{#} without DAC is a synthetic GHRH analog supplied for research into extended-duration GH release pathways. Lyophilized, high-stability formulation.": "CJC-{#} zonder DAC is een synthetisch GHRH-analoog, geleverd voor onderzoek naar routes van langdurige GH-afgifte. Gelyofiliseerde formulering met hoge stabiliteit.",
"COA documents represent the definitive specification per batch. While we strive for accuracy, we do not warrant all website content is error-free.": "COA-documenten vormen de bindende specificatie per batch. Wij streven naar nauwkeurigheid, maar garanderen niet dat alle inhoud van de website foutloos is.",
"Coenzyme (nicotinamide adenine dinucleotide) present in all cells: cofactor of redox reactions in energy metabolism and substrate of enzymes such as sirtuins and PARPs.": "Co-enzym (nicotinamide-adenine-dinucleotide) aanwezig in alle cellen: cofactor van redoxreacties in het energiemetabolisme en substraat van enzymen zoals sirtuïnes en PARP's.",
"Complex of polypeptides extracted from (calf) thymus, studied mainly in the Russian literature for immune regulation and ageing.": "Complex van polypeptiden gewonnen uit de thymus (van kalveren), vooral in de Russische literatuur bestudeerd op immuunregulatie en veroudering.",
"Contact us within {#} days if products arrive damaged or do not match COA specs. Opened compounds cannot be returned for safety reasons.": "Neem binnen {#} dagen contact met ons op als producten beschadigd aankomen of niet overeenkomen met de COA-specificaties. Geopende verbindingen kunnen om veiligheidsredenen niet worden geretourneerd.",
"Copper complex of the tripeptide Ala-His-Lys, used as a cosmetic ingredient and studied in skin and hair-follicle cell models.": "Koperkomplex van het tripeptide Ala-His-Lys, gebruikt als cosmetisch ingrediënt en bestudeerd in celmodellen van huid en haarzakjes.",
"Do you create content around research, laboratories, or scientific wellness? Novalyx offers a personal code giving your audience a discount, and a commission on the sales it generates.": "Maakt u content over onderzoek, laboratoria of wetenschappelijk welzijn? Novalyx biedt een persoonlijke code met korting voor uw publiek en een commissie op de verkopen die deze oplevert.",
"Dual agonist of the GLP-{#} and glucagon receptors (IBI{#} / LY{#}), developed by Innovent (China) under licence from Eli Lilly.": "Duale agonist van de GLP-{#}- en glucagonreceptoren (IBI{#} / LY{#}), ontwikkeld door Innovent (China) onder licentie van Eli Lilly.",
"Each application is reviewed individually. The program is aimed at creators covering scientific, laboratory and research content. As with the rest of the catalogue, all communication must stay within a laboratory-research framework — research use only.": "Elke aanvraag wordt afzonderlijk beoordeeld. Het programma richt zich op makers van wetenschappelijke, laboratorium- en onderzoekscontent. Zoals voor de hele catalogus moet alle communicatie binnen het kader van laboratoriumonderzoek blijven — uitsluitend voor onderzoek.",
"Each order is shipped from Paris within {#} h of payment confirmation. Delivery in {#}–{#} days maximum within France, {#}–{#} business days for the rest of the EU. A tracking number is sent on dispatch.": "Elke bestelling wordt binnen {#} u na betalingsbevestiging vanuit Parijs verzonden. Levering in maximaal {#}–{#} dagen in Frankrijk, {#}–{#} werkdagen voor de rest van de EU. Bij verzending ontvangt u een trackingnummer.",
"Each report below was issued by Janoshik Analytical (Czech Republic). Each link opens the original report on Janoshik's website: it cannot be altered.": "Elk onderstaand rapport is uitgegeven door Janoshik Analytical (Tsjechië). Elke link opent het originele rapport op de website van Janoshik: het kan niet worden gewijzigd.",
"Each report states the product and strength analysed. A report covers one specific batch: each new batch is analysed in turn and published here.": "Elk rapport vermeldt het geanalyseerde product en de sterkte. Een rapport geldt voor één specifieke batch: elke nieuwe batch wordt op zijn beurt geanalyseerd en hier gepubliceerd.",
"Elamipretide is approved in the United States (FDA, accelerated approval, September {#}, brand Forzinity) only for Barth syndrome. The Novalyx product is a research compound, not that medicine.": "Elamipretide is in de Verenigde Staten goedgekeurd (FDA, versnelde goedkeuring, september {#}, merk Forzinity) uitsluitend voor het syndroom van Barth. Het Novalyx-product is een onderzoeksverbinding, niet dat geneesmiddel.",
"Endogenous molecule studied in the laboratory. No authorisation as a medicine for the forms sold here; associated health claims are not validated by authorities.": "Lichaamseigen molecuul, bestudeerd in het laboratorium. Geen vergunning als geneesmiddel voor de hier verkochte vormen; bijbehorende gezondheidsclaims zijn niet door de autoriteiten bevestigd.",
"Factual, strictly scientific information on the {#} compounds in the catalogue: what each molecule is and its regulatory status. No health claims.": "Feitelijke, strikt wetenschappelijke informatie over de {#} verbindingen uit de catalogus: wat elk molecuul is en wat de wettelijke status ervan is. Geen gezondheidsclaims.",
"For international orders (outside the European Union), the buyer is solely responsible for verifying that the products may be legally imported into their jurisdiction, for paying any applicable customs duties, taxes, or clearance fees, and for complying with all local laws governing research compounds. Novalyx Research does not act as an importer of record. Packages seized, destroyed, refused, or returned by customs authorities in any non-EU jurisdiction are non-refundable. By placing an international order, the buyer expressly acknowledges and accepts these risks.": "Bij internationale bestellingen (buiten de Europese Unie) is de koper als enige verantwoordelijk om na te gaan of de producten legaal in zijn land mogen worden ingevoerd, voor het betalen van eventuele douanerechten, belastingen of inklaringskosten, en voor het naleven van alle lokale wetten over onderzoeksverbindingen. Novalyx Research treedt niet op als importeur. Pakketten die door douaneautoriteiten buiten de EU in beslag worden genomen, vernietigd, geweigerd of teruggestuurd, worden niet terugbetaald. Met een internationale bestelling erkent en aanvaardt de koper uitdrukkelijk deze risico's.",
"Free shipping in France and the EU on {N} Packs of {#} and {#}. Bacteriostatic water: {#}€ in France and the EU. We do not ship to Russia or Belarus.": "Gratis verzending in Frankrijk en de EU voor {N}-packs van {#} en {#}. Bacteriostatisch water: {#}€ in Frankrijk en de EU. Wij verzenden niet naar Rusland of Belarus.",
"Fusion protein (soluble activin type IIB receptor coupled to an antibody fragment) that captures myostatin and related molecules. Its clinical trials were stopped in {#}.": "Fusie-eiwit (oplosbare activinereceptor type IIB gekoppeld aan een antilichaamfragment) dat myostatine en verwante moleculen bindt. De klinische studies werden in {#} stopgezet.",
"GHRH analogue (\"no DAC\" version: modified {#}-{#} sequence, also called modified GRF {#}-{#}), designed for better stability.": "GHRH-analoog (versie „zonder DAC”: gewijzigde {#}-{#}-sequentie, ook gewijzigd GRF {#}-{#} genoemd), ontworpen voor betere stabiliteit.",
"GHRH({#}-{#}) analogue fitted with a \"DAC\" (drug affinity complex) that binds albumin and greatly extends its duration of action. Its clinical development was stopped in the mid-{#}s.": "GHRH({#}-{#})-analoog met een „DAC” (drug affinity complex) dat aan albumine bindt en de werkingsduur sterk verlengt. De klinische ontwikkeling werd halverwege de jaren {#} stopgezet.",
"Hello, I'm the Novalyx assistant. I can tell you about our research compounds (nature, mechanism, regulatory status), prices, shipping, payment, storage and COA analyses.": "Hallo, ik ben de Novalyx-assistent. Ik kan u vertellen over onze onderzoeksverbindingen (aard, mechanisme, wettelijke status), prijzen, verzending, betaling, bewaring en COA-analyses.",
"I acknowledge this shipment may be subject to customs inspection and I am responsible for compliance with local regulations.": "Ik erken dat deze zending aan een douanecontrole kan worden onderworpen en dat ik verantwoordelijk ben voor de naleving van de lokale regelgeving.",
"I can't answer that question. Novalyx products are compounds supplied exclusively for laboratory research (no human or animal use), and this assistant gives no dose, protocol or medical advice. For any health question, please consult a healthcare professional.": "Die vraag kan ik niet beantwoorden. Novalyx-producten zijn verbindingen die uitsluitend worden geleverd voor laboratoriumonderzoek (geen gebruik bij mens of dier), en deze assistent geeft geen dosering, protocol of medisch advies. Raadpleeg voor elke gezondheidsvraag een zorgprofessional.",
"I don't have reliable information on this and I prefer not to improvise. Write to us at contact@novalyxresearch.com (reply within one business day), or pick a question below.": "Hierover heb ik geen betrouwbare informatie en ik improviseer liever niet. Schrijf ons op contact@novalyxresearch.com (antwoord binnen één werkdag), of kies hieronder een vraag.",
"If a product does not match its report specifications, contact us within {#} days. We review each case and arrange a replacement or refund where appropriate.": "Als een product niet overeenkomt met de specificaties van zijn rapport, neem dan binnen {#} dagen contact met ons op. Wij bekijken elk geval en zorgen waar nodig voor vervanging of terugbetaling.",
"If you can shop online, you can pay with Bitcoin: {#} minutes the first time, {#} minutes after that. The amount is always calculated in euros.": "Als u online kunt winkelen, kunt u met Bitcoin betalen: {#} minuten de eerste keer, daarna {#} minuten. Het bedrag wordt altijd in euro berekend.",
"In-stock products ship within {#} h of payment confirmation and arrive in {#}–{#} days in France. Made-to-order products take {#}–{#} weeks: the batch is received, then analysed by Janoshik before it ships to you. You get an email at every step, then your tracking number.": "Producten op voorraad worden binnen {#} u na betalingsbevestiging verzonden en zijn in {#}–{#} dagen in Frankrijk. Producten op bestelling duren {#}–{#} weken: de batch wordt ontvangen en daarna door Janoshik geanalyseerd voordat hij naar u wordt verzonden. U krijgt bij elke stap een e-mail en daarna uw trackingnummer.",
"Investigational drug in advanced development, alone and in combination with semaglutide (CagriSema). Status is evolving: refer to health authorities for the current situation.": "Onderzoeksgeneesmiddel in vergevorderde ontwikkeling, alleen en in combinatie met semaglutide (CagriSema). De status verandert: raadpleeg de gezondheidsautoriteiten voor de actuele situatie.",
"Investigational drug: in phase {#} clinical trials, not authorised to date. According to the company's announcements, a US marketing application is targeted for early {#}. The Novalyx product is a research compound, not a medicine.": "Onderzoeksgeneesmiddel: in klinische studies fase {#}, tot nu toe niet toegelaten. Volgens aankondigingen van het bedrijf is een Amerikaanse handelsvergunning gepland voor begin {#}. Het Novalyx-product is een onderzoeksverbinding, geen geneesmiddel.",
"It is the purchaser's sole responsibility to verify that a compound is legal in their jurisdiction. Novalyx makes no representation regarding regulatory status in any country.": "Het is uitsluitend de verantwoordelijkheid van de koper om na te gaan of een verbinding legaal is in zijn land. Novalyx doet geen uitspraak over de wettelijke status in welk land dan ook.",
"It's a direct payment with no banking intermediary. Your bank statement only shows the Bitcoin purchase on your platform. The amount is always calculated in euros.": "Het is een directe betaling zonder bank als tussenpersoon. Op uw bankafschrift staat alleen de aankoop van Bitcoin op uw platform. Het bedrag wordt altijd in euro berekend.",
"Its pharmaceutical form (thymalfasin, brand Zadaxin) is authorised in several countries, mainly in Asia, for certain indications; it is not authorised in the United States. The Novalyx product is a research compound.": "De farmaceutische vorm (thymalfasine, merk Zadaxin) is in verschillende landen, vooral in Azië, voor bepaalde indicaties toegelaten; in de Verenigde Staten is ze niet toegelaten. Het Novalyx-product is een onderzoeksverbinding.",
"Long-acting amylin analogue (amylin is a hormone co-secreted with insulin), developed by Novo Nordisk. It acts on amylin and calcitonin receptors.": "Langwerkend amyline-analoog (amyline is een hormoon dat samen met insuline wordt afgegeven), ontwikkeld door Novo Nordisk. Het werkt op amyline- en calcitoninereceptoren.",
"Lyophilised peptides for laboratories and researchers. Analyses are performed by an independent laboratory, and every report can be verified publicly with its key.": "Gelyofiliseerde peptiden voor laboratoria en onderzoekers. De analyses worden door een onafhankelijk laboratorium uitgevoerd en elk rapport is openbaar te controleren met zijn sleutel.",
"Lyophilised, labelled, sealed vials, tracked shipping. Products without a published report are marked “analysis pending”.": "Gelyofiliseerde, geëtiketteerde, verzegelde flacons, verzending met tracking. Producten zonder gepubliceerd rapport zijn gemarkeerd als „analyse in behandeling”.",
"Made-to-order products are bought and analysed batch by batch. The minimum ({#} to {#} vials depending on the product) lets us launch that batch, and automatically gives you our quantity discounts (−{#} to −{#}%).": "Producten op bestelling worden batch per batch ingekocht en geanalyseerd. Het minimum ({#} tot {#} flacons, afhankelijk van het product) maakt het mogelijk die batch te starten en geeft u automatisch onze volumekortingen (−{#} tot −{#}%).",
"Marketed as a medicine in some countries (including Austria, Russia, China); not authorised in the United States. Clinical evidence of efficacy remains debated.": "In sommige landen als geneesmiddel op de markt gebracht (waaronder Oostenrijk, Rusland, China); niet toegelaten in de Verenigde Staten. Het klinische bewijs van werkzaamheid blijft omstreden.",
"Modified fragment of human growth hormone (amino acids {#}-{#}, with an added tyrosine), studied for its link with lipid metabolism.": "Gewijzigd fragment van menselijk groeihormoon (aminozuren {#}-{#}, met een toegevoegd tyrosine), bestudeerd op het verband met het lipidenmetabolisme.",
"Name, email, shipping address, and order details you provide directly. Anonymised usage data via analytics to improve our site.": "Naam, e-mail, verzendadres en bestelgegevens die u ons rechtstreeks verstrekt. Geanonimiseerde gebruiksgegevens via analysetools om onze site te verbeteren.",
"Naturally occurring tripeptide (glycyl-histidyl-lysine) that forms a complex with copper(II). Present in human plasma, it is studied in the laboratory for its role in the extracellular matrix, collagen synthesis and skin biology.": "Van nature voorkomend tripeptide (glycyl-histidyl-lysine) dat een complex vormt met koper(II). Het komt voor in menselijk plasma en wordt in het laboratorium bestudeerd op zijn rol in de extracellulaire matrix, collageensynthese en huidbiologie.",
"No product sold by Novalyx is intended for human or veterinary administration. Novalyx expressly disclaims liability for any use contrary to this designation.": "Geen enkel door Novalyx verkocht product is bestemd voor toediening bij mens of dier. Novalyx wijst uitdrukkelijk elke aansprakelijkheid af voor gebruik in strijd met deze bestemming.",
"Nonapeptide ({#} amino acids) isolated from rabbit brain in {#}, studied for its link with slow-wave sleep. Its exact mechanism remains poorly established.": "Nonapeptide ({#} aminozuren), in {#} geïsoleerd uit konijnenhersenen, bestudeerd op het verband met de diepe slaap. Het precieze mechanisme is nog slecht opgehelderd.",
"Not authorised as a medicine in any country. Published data come mostly from preclinical (animal) studies; controlled human data are very limited. Listed as prohibited by the World Anti-Doping Agency (WADA).": "In geen enkel land als geneesmiddel toegelaten. Gepubliceerde gegevens komen vooral uit preklinische (dier)studies; gecontroleerde gegevens bij mensen zijn zeer beperkt. Op de verboden lijst van het Wereldantidopingagentschap (WADA).",
"Not authorised as a medicine in the EU or the United States; as pralmorelin it has been used in Japan as a diagnostic agent, to our knowledge. Prohibited by WADA.": "Niet als geneesmiddel toegelaten in de EU of de Verenigde Staten; als pralmorelin is het voor zover wij weten in Japan gebruikt als diagnostisch middel. Verboden door het WADA.",
"Not authorised as a medicine in the United States; aviptadil has been the subject of clinical trials and very limited authorisations depending on the country.": "Niet als geneesmiddel toegelaten in de Verenigde Staten; aviptadil is onderwerp geweest van klinische studies en, afhankelijk van het land, zeer beperkte vergunningen.",
"Not authorised as a medicine; several health authorities (for example in the United Kingdom and Australia) have issued warnings about products sold under this name.": "Niet als geneesmiddel toegelaten; verschillende gezondheidsautoriteiten (bijvoorbeeld in het Verenigd Koninkrijk en Australië) hebben gewaarschuwd voor producten die onder deze naam worden verkocht.",
"Note: educational information only. No medical advice, no dose, no usage recommendation. Product reserved for laboratory research.": "Let op: uitsluitend educatieve informatie. Geen medisch advies, geen dosering, geen gebruiksaanbeveling. Product voorbehouden aan laboratoriumonderzoek.",
"Nothing on this website constitutes medical advice. No claims are made regarding health benefits or therapeutic effects of any compound.": "Niets op deze website vormt medisch advies. Er worden geen beweringen gedaan over gezondheidsvoordelen of therapeutische effecten van welke verbinding dan ook.",
"Novalyx Research is a French company registered in Paris. It supplies lyophilised research peptides to laboratories, researchers and professionals.": "Novalyx Research is een Frans bedrijf, ingeschreven in Parijs. Het levert gelyofiliseerde onderzoekspeptiden aan laboratoria, onderzoekers en professionals.",
"Novalyx Research supplies compounds exclusively for laboratory research. Access is restricted to qualified professionals.": "Novalyx Research levert verbindingen uitsluitend voor laboratoriumonderzoek. De toegang is voorbehouden aan gekwalificeerde professionals.",
"Novalyx Research {N} is pharmaceutical-grade sterile water containing {#}% benzyl alcohol as a bacteriostatic agent. Supplied exclusively for laboratory use in the reconstitution of lyophilised research peptides. Each vial is sealed, sterile, and ready for immediate laboratory use.": "Novalyx Research {N} is steriel water van farmaceutische kwaliteit met {#}% benzylalcohol als bacteriostatisch middel. Uitsluitend geleverd voor laboratoriumgebruik bij de reconstitutie van gelyofiliseerde onderzoekspeptiden. Elke flacon is verzegeld, steriel en direct klaar voor gebruik in het laboratorium.",
"Novalyx is not liable for misuse of products, or for indirect or consequential damages from use of this website or products.": "Novalyx is niet aansprakelijk voor misbruik van de producten, of voor indirecte schade of gevolgschade door het gebruik van deze website of de producten.",
"Novalyx research blend of four compounds: {N} ({#} mg) + GHK-Cu ({#} mg) + {N} ({#} mg) + {N} ({#} mg) in a single lyophilised vial. See their entries for the nature of each component.": "Novalyx-onderzoeksmengsel van vier verbindingen: {N} ({#} mg) + GHK-Cu ({#} mg) + {N} ({#} mg) + {N} ({#} mg) in één gelyofiliseerde flacon. Zie hun eigen fiches voor de aard van elke component.",
"Novalyx research blend of three compounds: {N} ({#} mg) + GHK-Cu ({#} mg) + {N} ({#} mg) in a single lyophilised vial. See their entries for the nature of each component.": "Novalyx-onderzoeksmengsel van drie verbindingen: {N} ({#} mg) + GHK-Cu ({#} mg) + {N} ({#} mg) in één gelyofiliseerde flacon. Zie hun eigen fiches voor de aard van elke component.",
"Novalyx research blend of two compounds: CJC-{#} no DAC ({#} mg) + ipamorelin ({#} mg) in a single lyophilised vial. See their entries for the nature of each component.": "Novalyx-onderzoeksmengsel van twee verbindingen: CJC-{#} zonder DAC ({#} mg) + ipamorelin ({#} mg) in één gelyofiliseerde flacon. Zie hun eigen fiches voor de aard van elke component.",
"Novalyx research blend of two compounds: cagrilintide + semaglutide, in two sizes ({#} mg + {#} mg; {#} mg + {#} mg). See the {N} and {N} entries.": "Novalyx-onderzoeksmengsel van twee verbindingen: cagrilintide + semaglutide, in twee formaten ({#} mg + {#} mg; {#} mg + {#} mg). Zie de fiches van {N} en {N}.",
"Novalyx research blend of two compounds: {N} ({#} mg) + {N} ({#} mg) in a single lyophilised vial. See the {N} and {N} entries for the nature of each component.": "Novalyx-onderzoeksmengsel van twee verbindingen: {N} ({#} mg) + {N} ({#} mg) in één gelyofiliseerde flacon. Zie de fiches van {N} en {N} voor de aard van elke component.",
"Novalyx research blend of two compounds: {N} + {N}, in two sizes ({#} mg total: {#} mg + {#} mg; {#} mg total: {#} mg + {#} mg). See the {N} and {N} entries.": "Novalyx-onderzoeksmengsel van twee verbindingen: {N} + {N}, in twee formaten ({#} mg totaal: {#} mg + {#} mg; {#} mg totaal: {#} mg + {#} mg). Zie de fiches van {N} en {N}.",
"Orders are processed under controlled fulfillment conditions with per-order batch sourcing from our verified laboratory partners. Orders are shipped within {#} h of payment confirmation. Delivery within France typically takes {#}–{#} days; the rest of the EU {#}–{#} business days; international destinations {#}–{#} business days. Delivery timescales are estimates, not guarantees. Risk passes to buyer upon dispatch.": "Bestellingen worden onder gecontroleerde omstandigheden verwerkt, met batchtoewijzing per bestelling bij onze gecontroleerde laboratoriumpartners. Bestellingen worden binnen {#} u na betalingsbevestiging verzonden. Levering in Frankrijk duurt doorgaans {#}–{#} dagen; in de rest van de EU {#}–{#} werkdagen; internationale bestemmingen {#}–{#} werkdagen. Levertijden zijn schattingen, geen garanties. Het risico gaat bij verzending over op de koper.",
"Orders are shipped from Paris within {#} h of payment confirmation. Delivery in {#} to {#} days maximum within France; longer for the rest of the world (see the Shipping page). Shipping by country: France {#}€, EU {#}€, Switzerland/UK {#}€, USA/Canada {#}€, Australia, New Zealand and other countries {#}€ (free in France and the EU on {N} Packs; bacteriostatic water {#}€ in France and the EU). A tracking number is sent on dispatch. Outside the European Union, the buyer is responsible for customs duties and local compliance.": "Bestellingen worden binnen {#} u na betalingsbevestiging vanuit Parijs verzonden. Levering in maximaal {#} tot {#} dagen in Frankrijk; langer voor de rest van de wereld (zie de pagina Verzending). Verzending per land: Frankrijk {#}€, EU {#}€, Zwitserland/VK {#}€, VS/Canada {#}€, Australië, Nieuw-Zeeland en andere landen {#}€ (gratis in Frankrijk en de EU voor {N}-packs; bacteriostatisch water {#}€ in Frankrijk en de EU). Bij verzending ontvangt u een trackingnummer. Buiten de Europese Unie is de koper verantwoordelijk voor douanerechten en lokale naleving.",
"Orders are shipped within {#} h of payment confirmation, then delivered in {#}–{#} days maximum within France. Allow {#}–{#} business days for the rest of the EU, and longer outside the EU depending on destination. A tracking number is sent on dispatch.": "Bestellingen worden binnen {#} u na betalingsbevestiging verzonden en daarna in maximaal {#}–{#} dagen in Frankrijk geleverd. Reken op {#}–{#} werkdagen voor de rest van de EU, en langer buiten de EU afhankelijk van de bestemming. Bij verzending ontvangt u een trackingnummer.",
"PEGylated form of the MGF peptide (\"mechano growth factor\"), derived from an IGF-{#} splice variant, studied in muscle-cell models.": "Gepegyleerde vorm van het MGF-peptide („mechano growth factor”), afgeleid van een splicevariant van IGF-{#}, bestudeerd in modellen van spiercellen.",
"Payment by card through Stripe (your banking data never touch our servers), or by bank transfer, even for a small order: choose \"Pay by bank transfer\" in the cart. The order is shipped once the transfer is received. Any question: contact@novalyxresearch.com.": "Betaling met een kaart via Stripe (uw bankgegevens komen nooit op onze servers), of per bankoverschrijving, ook voor een kleine bestelling: kies „Betalen per bankoverschrijving” in de winkelwagen. De bestelling wordt verzonden zodra de overschrijving is ontvangen. Vragen: contact@novalyxresearch.com.",
"Peptidomimetic designed to target prohibitin on the blood vessels of white adipose tissue, studied in rodents and primates.": "Peptidomimeticum, ontworpen om zich te richten op prohibitine in de bloedvaten van wit vetweefsel, bestudeerd bij knaagdieren en primaten.",
"Preparation of peptides and amino acids obtained by enzymatic hydrolysis of pig-brain proteins. It is a mixture, not a single molecule.": "Preparaat van peptiden en aminozuren, verkregen door enzymatische hydrolyse van eiwitten uit varkenshersenen. Het is een mengsel, geen afzonderlijk molecuul.",
"Prices are shown in EUR and do not include VAT (TVA non applicable, art. {#}B du CGI — French micro-entrepreneur regime). Card payment is processed securely by Stripe; payment by bank transfer is also available, in which case the order is shipped once the transfer is received. We reserve the right to cancel orders, with a full refund issued.": "De prijzen worden in EUR weergegeven, zonder btw (TVA non applicable, art. {#}B du CGI — Franse micro-ondernemersregeling). Kaartbetaling wordt veilig verwerkt door Stripe; betaling per bankoverschrijving is ook mogelijk, in dat geval wordt de bestelling verzonden zodra de overschrijving is ontvangen. Wij behouden ons het recht voor bestellingen te annuleren, met volledige terugbetaling.",
"Proprietary blend of research compounds; it is not a medicine. The status of its components is as described in their own entries.": "Eigen mengsel van onderzoeksverbindingen; het is geen geneesmiddel. De status van de componenten is zoals beschreven in hun eigen fiches.",
"Proprietary blend of research compounds; no medicine status. The status of its components is as described in their own entries.": "Eigen mengsel van onderzoeksverbindingen; geen geneesmiddelstatus. De status van de componenten is zoals beschreven in hun eigen fiches.",
"Retatrutide (product name on this site: {N}) is a triple agonist of the GIP, GLP-{#} and glucagon receptors, developed by Eli Lilly (code LY{#}). It activates three receptors involved in energy and glucose metabolism at the same time.": "Retatrutide (productnaam op deze site: {N}) is een drievoudige agonist van de GIP-, GLP-{#}- en glucagonreceptoren, ontwikkeld door Eli Lilly (code LY{#}). Het activeert tegelijk drie receptoren die betrokken zijn bij het energie- en glucosemetabolisme.",
"Shipments outside the EU are at the buyer's risk. The buyer must check that the products may be lawfully imported and pay any duties or taxes. Novalyx Research does not act as importer of record. Parcels seized, refused or destroyed by customs outside the EU are non-refundable.": "Zendingen buiten de EU gebeuren op risico van de koper. De koper moet nagaan of de producten rechtmatig mogen worden ingevoerd en eventuele rechten of belastingen betalen. Novalyx Research treedt niet op als importeur. Pakketten die buiten de EU door de douane in beslag worden genomen, geweigerd of vernietigd, worden niet terugbetaald.",
"Short synthetic peptide (Ala-Glu-Asp) from V. Khavinson's work on \"bioregulators\" (St Petersburg Institute of Bioregulation and Gerontology), studied in relation to cartilage tissue. Published data come mostly from this team.": "Kort synthetisch peptide (Ala-Glu-Asp) uit het werk van V. Khavinson over „bioregulatoren” (Instituut voor Bioregulatie en Gerontologie in Sint-Petersburg), bestudeerd in verband met kraakbeenweefsel. De gepubliceerde gegevens komen vooral van dit team.",
"Short synthetic peptide (Ala-Glu-Asp-Arg) from V. Khavinson's work on \"bioregulators\" (St Petersburg Institute of Bioregulation and Gerontology), studied in relation to heart tissue. Published data come mostly from this team.": "Kort synthetisch peptide (Ala-Glu-Asp-Arg) uit het werk van V. Khavinson over „bioregulatoren” (Instituut voor Bioregulatie en Gerontologie in Sint-Petersburg), bestudeerd in verband met hartweefsel. De gepubliceerde gegevens komen vooral van dit team.",
"Short synthetic peptide (Ala-Glu-Asp-Pro) from V. Khavinson's work on \"bioregulators\" (St Petersburg Institute of Bioregulation and Gerontology), studied in relation to brain tissue. Published data come mostly from this team.": "Kort synthetisch peptide (Ala-Glu-Asp-Pro) uit het werk van V. Khavinson over „bioregulatoren” (Instituut voor Bioregulatie en Gerontologie in Sint-Petersburg), bestudeerd in verband met hersenweefsel. De gepubliceerde gegevens komen vooral van dit team.",
"Short synthetic peptide (Glu-Asp-Gly) from V. Khavinson's work on \"bioregulators\" (St Petersburg Institute of Bioregulation and Gerontology), studied in relation to bronchi tissue. Published data come mostly from this team.": "Kort synthetisch peptide (Glu-Asp-Gly) uit het werk van V. Khavinson over „bioregulatoren” (Instituut voor Bioregulatie en Gerontologie in Sint-Petersburg), bestudeerd in verband met bronchiaal weefsel. De gepubliceerde gegevens komen vooral van dit team.",
"Short synthetic peptide (Glu-Asp-Leu) from V. Khavinson's work on \"bioregulators\" (St Petersburg Institute of Bioregulation and Gerontology), studied in relation to liver tissue. Published data come mostly from this team.": "Kort synthetisch peptide (Glu-Asp-Leu) uit het werk van V. Khavinson over „bioregulatoren” (Instituut voor Bioregulatie en Gerontologie in Sint-Petersburg), bestudeerd in verband met leverweefsel. De gepubliceerde gegevens komen vooral van dit team.",
"Short synthetic peptide (Lys-Glu-Asp) from V. Khavinson's work on \"bioregulators\" (St Petersburg Institute of Bioregulation and Gerontology), studied in relation to blood vessels tissue. Published data come mostly from this team.": "Kort synthetisch peptide (Lys-Glu-Asp) uit het werk van V. Khavinson over „bioregulatoren” (Instituut voor Bioregulatie en Gerontologie in Sint-Petersburg), bestudeerd in verband met vaatweefsel. De gepubliceerde gegevens komen vooral van dit team.",
"Short synthetic peptide (Lys-Glu-Asp-Gly) from V. Khavinson's work on \"bioregulators\" (St Petersburg Institute of Bioregulation and Gerontology), studied in relation to testes tissue. Published data come mostly from this team.": "Kort synthetisch peptide (Lys-Glu-Asp-Gly) uit het werk van V. Khavinson over „bioregulatoren” (Instituut voor Bioregulatie en Gerontologie in Sint-Petersburg), bestudeerd in verband met testisweefsel. De gepubliceerde gegevens komen vooral van dit team.",
"Short synthetic peptide (Lys-Glu-Asp-Pro) from V. Khavinson's work on \"bioregulators\" (St Petersburg Institute of Bioregulation and Gerontology), studied in relation to prostate tissue. Published data come mostly from this team.": "Kort synthetisch peptide (Lys-Glu-Asp-Pro) uit het werk van V. Khavinson over „bioregulatoren” (Instituut voor Bioregulatie en Gerontologie in Sint-Petersburg), bestudeerd in verband met prostaatweefsel. De gepubliceerde gegevens komen vooral van dit team.",
"Short synthetic peptide (Lys-Glu-Asp-Trp) from V. Khavinson's work on \"bioregulators\" (St Petersburg Institute of Bioregulation and Gerontology), studied in relation to pancreas tissue. Published data come mostly from this team.": "Kort synthetisch peptide (Lys-Glu-Asp-Trp) uit het werk van V. Khavinson over „bioregulatoren” (Instituut voor Bioregulatie en Gerontologie in Sint-Petersburg), bestudeerd in verband met alvleesklierweefsel. De gepubliceerde gegevens komen vooral van dit team.",
"Small molecule ({#}-amino-{#}-methylquinolinium), not a peptide: inhibitor of NNMT (nicotinamide N-methyltransferase), an enzyme of cellular metabolism. Studied in cells and mouse models.": "Klein molecuul ({#}-amino-{#}-methylchinolinium), geen peptide: remmer van NNMT (nicotinamide-N-methyltransferase), een enzym van het celmetabolisme. Bestudeerd in cellen en muismodellen.",
"Small peptide derived from angiotensin IV, studied in preclinical models for its action on the HGF/c-Met pathway and synapse formation.": "Klein peptide afgeleid van angiotensine IV, in preklinische modellen bestudeerd op zijn werking op de HGF/c-Met-route en de vorming van synapsen.",
"Sterile water containing {#}% acetic acid, used as a reconstitution solvent for peptides that dissolve poorly at neutral pH.": "Steriel water met {#}% azijnzuur, gebruikt als reconstitutie-oplosmiddel voor peptiden die slecht oplossen bij neutrale pH.",
"Sterile water containing {#}% benzyl alcohol as a bacteriostatic agent, intended for laboratory reconstitution of lyophilised compounds, in a multi-draw vial.": "Steriel water met {#}% benzylalcohol als bacteriostatisch middel, bestemd voor de reconstitutie van gelyofiliseerde verbindingen in het laboratorium, in een flacon voor meervoudige afname.",
"Substances supplied exclusively for scientific laboratory research. They are not intended for human or veterinary use, consumption or therapeutic purposes.": "Stoffen die uitsluitend worden geleverd voor wetenschappelijk laboratoriumonderzoek. Ze zijn niet bestemd voor gebruik bij mens of dier, consumptie of therapeutische doeleinden.",
"Synthetic heptapeptide analogue of an ACTH({#}-{#}) fragment, stabilised by a Pro-Gly-Pro tail. Studied for the expression of neurotrophic factors such as BDNF.": "Synthetisch heptapeptide-analoog van een ACTH({#}-{#})-fragment, gestabiliseerd door een Pro-Gly-Pro-staart. Bestudeerd op de expressie van neurotrofe factoren zoals BDNF.",
"Synthetic heptapeptide derived from tuftsin (an immunoglobulin fragment), stabilised by a Pro-Gly-Pro tail; studied for modulation of neurotransmitters, including the GABAergic system.": "Synthetisch heptapeptide afgeleid van tuftsine (een immunoglobulinefragment), gestabiliseerd door een Pro-Gly-Pro-staart; bestudeerd op de modulatie van neurotransmitters, waaronder het GABA-erge systeem.",
"Synthetic hexapeptide agonist of the ghrelin receptor (GHS-R{#}a): a growth-hormone secretagogue (GHRP = growth hormone-releasing peptide).": "Synthetisch hexapeptide, agonist van de ghrelinereceptor (GHS-R{#}a): een groeihormoon-secretagoog (GHRP = growth hormone-releasing peptide).",
"Synthetic hexapeptide, a growth-hormone secretagogue acting on the ghrelin receptor; it also binds CD{#}, which has been studied in cardiac models.": "Synthetisch hexapeptide, een groeihormoon-secretagoog die op de ghrelinereceptor werkt; het bindt ook aan CD{#}, wat in hartmodellen is bestudeerd.",
"Synthetic peptide related to thymosin beta-{#}, a {#}-amino-acid protein that binds actin (a cytoskeleton component). \"{N}\" usually refers to a synthetic fragment; definitions vary between suppliers. Studied in vitro and in animals for cell migration and tissue repair.": "Synthetisch peptide verwant aan thymosine bèta-{#}, een eiwit van {#} aminozuren dat actine bindt (een bestanddeel van het cytoskelet). „{N}” verwijst meestal naar een synthetisch fragment; definities verschillen per leverancier. In vitro en bij dieren bestudeerd op celmigratie en weefselherstel.",
"Synthetic tetrapeptide (Ala-Glu-Asp-Gly) designed from epithalamin, a pineal-gland extract. Studied, mainly by a Russian research group, for effects on telomerase and cellular ageing.": "Synthetisch tetrapeptide (Ala-Glu-Asp-Gly), ontworpen op basis van epithalamine, een extract van de pijnappelklier. Vooral door een Russische onderzoeksgroep bestudeerd op effecten op telomerase en cellulaire veroudering.",
"Synthetic tripeptide (Glu-Asp-Arg) belonging to the \"peptide bioregulators\" studied by Khavinson's group; examined in cell culture and animals for neuroprotective effects.": "Synthetisch tripeptide (Glu-Asp-Arg) uit de groep „peptide-bioregulatoren” die de groep van Khavinson bestudeert; in celkweek en bij dieren onderzocht op neuroprotectieve effecten.",
"Synthetic {#}-amino-acid peptide derived from a sequence of the BPC protein found in human gastric juice. In the laboratory it is studied in cell and animal models for its interactions with angiogenesis (blood-vessel formation) and tissue-repair pathways.": "Synthetisch peptide van {#} aminozuren, afgeleid van een sequentie van het eiwit BPC uit menselijk maagsap. In het laboratorium wordt het in cel- en diermodellen bestudeerd op zijn interacties met angiogenese (vorming van bloedvaten) en routes van weefselherstel.",
"Tetrapeptide (also called elamipretide) that binds cardiolipin, a phospholipid of the inner mitochondrial membrane, and is studied for its effect on mitochondrial function.": "Tetrapeptide (ook elamipretide genoemd) dat bindt aan cardiolipine, een fosfolipide van het binnenste mitochondriale membraan, en wordt bestudeerd op zijn effect op de mitochondriale functie.",
"The legal holder name must match what your bank shows when you initiate the transfer (mandatory beneficiary verification requirement).": "De naam van de wettelijke rekeninghouder moet overeenkomen met wat uw bank toont wanneer u de overschrijving start (verplichte controle van de begunstigde).",
"The product is ordered from our manufacturer as soon as you pay. On arrival, we send a sample of that batch to Janoshik: your vial only ships once the analysis is approved. Total time: {#}–{#} weeks.": "Het product wordt bij onze fabrikant besteld zodra u betaalt. Bij ontvangst sturen wij een monster van die batch naar Janoshik: uw flacon wordt pas verzonden als de analyse is goedgekeurd. Totale duur: {#}–{#} weken.",
"The sector is full of unverifiable promises. Our position is simple: claim nothing that cannot be checked. Analyses are entrusted to an independent laboratory, and every published report carries a key that lets anyone verify it at the source.": "De sector staat vol onverifieerbare beloften. Ons standpunt is eenvoudig: niets beweren wat niet kan worden gecontroleerd. De analyses worden toevertrouwd aan een onafhankelijk laboratorium, en elk gepubliceerd rapport heeft een sleutel waarmee iedereen het bij de bron kan verifiëren.",
"To process orders, provide support, send order communications, and — with consent — product announcements. Payment data is processed by Stripe; we never see or store your card details.": "Om bestellingen te verwerken, ondersteuning te bieden, berichten over bestellingen te sturen en — met toestemming — productaankondigingen. Betaalgegevens worden verwerkt door Stripe; wij zien of bewaren uw kaartgegevens nooit.",
"Tripeptide (lysine-proline-valine) matching the C-terminal end of α-MSH (melanocyte-stimulating hormone). Studied in vitro and in animals for its effects on inflammatory signalling, notably in the intestinal epithelium.": "Tripeptide (lysine-proline-valine) dat overeenkomt met het C-terminale uiteinde van α-MSH (melanocytstimulerend hormoon). In vitro en bij dieren bestudeerd op zijn effecten op ontstekingssignalering, met name in het darmepitheel.",
"Truncated form of IGF-{#} (des({#}-{#})IGF-{#}) lacking the first three amino acids, with reduced affinity for IGFBPs and enhanced activity at the IGF-{#} receptor in culture. It occurs naturally in some tissues, including the brain.": "Verkorte vorm van IGF-{#} (des({#}-{#})IGF-{#}) zonder de eerste drie aminozuren, met verminderde affiniteit voor IGFBP's en verhoogde activiteit op de IGF-{#}-receptor in celkweek. Het komt van nature voor in sommige weefsels, waaronder de hersenen.",
"Used in cosmetics (topical application); no authorisation as an injectable medicine. Research mainly involves cell models and topical applications.": "Gebruikt in cosmetica (topische toepassing); geen vergunning als injecteerbaar geneesmiddel. Het onderzoek betreft vooral celmodellen en topische toepassingen.",
"We use cookies that are essential for the site to work (cart, language). With your consent, we also use audience-measurement and advertising cookies to improve the site and measure our campaigns. You can refuse or change your choice at any time.": "Wij gebruiken cookies die nodig zijn voor de werking van de site (winkelwagen, taal). Met uw toestemming gebruiken wij ook cookies voor bezoekersmeting en advertenties om de site te verbeteren en onze campagnes te meten. U kunt op elk moment weigeren of uw keuze wijzigen.",
"You receive an email at every step: order received, ordered from the manufacturer, batch under analysis at Janoshik, analysis approved (with the report link), then shipped with your tracking number.": "U ontvangt bij elke stap een e-mail: bestelling ontvangen, besteld bij de fabrikant, batch in analyse bij Janoshik, analyse goedgekeurd (met de link naar het rapport), daarna verzonden met uw trackingnummer.",
"{#}-amino-acid analogue of human IGF-{#} (Arg{#} substitution and {#}-amino-acid N-terminal extension) with low binding to IGF-binding proteins (IGFBPs). It is mostly used as a cell-culture supplement.": "Analoog van menselijk IGF-{#} van {#} aminozuren (Arg{#}-substitutie en N-terminale verlenging met {#} aminozuren) met weinig binding aan IGF-bindende eiwitten (IGFBP's). Het wordt vooral gebruikt als supplement voor celkweek.",
"{#}-amino-acid antimicrobial peptide, the only human member of the cathelicidin family, released by cleavage of the hCAP{#} protein. Studied for its role in innate immunity.": "Antimicrobieel peptide van {#} aminozuren, het enige menselijke lid van de cathelicidinefamilie, vrijgemaakt door splitsing van het eiwit hCAP{#}. Bestudeerd op zijn rol in de aangeboren immuniteit.",
"{#}-amino-acid fragment of kisspeptin, ligand of the KISS{#}R receptor (GPR{#}), which controls GnRH release and therefore the reproductive axis.": "Fragment van kisspeptine van {#} aminozuren, ligand van de receptor KISS{#}R (GPR{#}), die de afgifte van GnRH en daarmee de voortplantingsas regelt.",
"{#}-amino-acid neuropeptide acting on VPAC{#} and VPAC{#} receptors, involved in vasodilation, immunity and digestive function. Its synthetic drug form is called aviptadil.": "Neuropeptide van {#} aminozuren dat werkt op de receptoren VPAC{#} en VPAC{#}, betrokken bij vaatverwijding, immuniteit en de spijsvertering. De synthetische geneesmiddelvorm heet aviptadil.",
"{#}-amino-acid peptide derived from erythropoietin (helix B), which binds selectively to the \"innate repair receptor\" (EPOR/CD{#} heterodimer) without stimulating erythropoiesis. Also called cibinetide.": "Peptide van {#} aminozuren afgeleid van erytropoëtine (helix B), dat selectief bindt aan de „aangeboren herstelreceptor” (EPOR/CD{#}-heterodimeer) zonder de aanmaak van rode bloedcellen te stimuleren. Ook cibinetide genoemd.",
"{#}-amino-acid peptide derived from prothymosin alpha, studied for modulation of the immune response (T-cell maturation).": "Peptide van {#} aminozuren afgeleid van prothymosine alfa, bestudeerd op de modulatie van de immuunrespons (rijping van T-cellen).",
"{#}-amino-acid peptide encoded by mitochondrial DNA ({#}S rRNA gene): a \"mitochondrial-derived peptide\". Studied for its role in metabolic homeostasis and cellular stress response.": "Peptide van {#} aminozuren, gecodeerd door mitochondriaal DNA ({#}S-rRNA-gen): een „van mitochondriën afgeleid peptide”. Bestudeerd op zijn rol in de metabole homeostase en de cellulaire stressrespons.",
"{#}-amino-acid peptide encoded by mitochondrial DNA, studied for its cytoprotective signalling pathways in cell and animal models.": "Peptide van {#} aminozuren, gecodeerd door mitochondriaal DNA, bestudeerd op zijn cytoprotectieve signaalroutes in cel- en diermodellen.",
"{N} (Body Protection Compound) is a synthetic pentadecapeptide supplied for research into tissue repair, angiogenesis, and gastrointestinal integrity. Each vial contains lyophilized peptide. Supplied exclusively for in-vitro and laboratory research purposes.": "{N} (Body Protection Compound) is een synthetisch pentadecapeptide, geleverd voor onderzoek naar weefselherstel, angiogenese en de integriteit van het maag-darmkanaal. Elke flacon bevat gelyofiliseerd peptide. Uitsluitend geleverd voor in-vitro- en laboratoriumonderzoek.",
"{N} (Bremelanotide) is a synthetic cyclic heptapeptide, supplied for research into melanocortin MC{#} and MC{#} receptor pathways and central nervous system signalling.": "{N} (bremelanotide) is een synthetisch cyclisch heptapeptide, geleverd voor onderzoek naar de routes van de melanocortinereceptoren MC{#} en MC{#} en signalering in het centrale zenuwstelsel.",
"{N} (Delta Sleep-Inducing Peptide) is a synthetic nonapeptide, supplied for research into sleep regulation, delta wave activity, and circadian signalling pathways.": "{N} (Delta Sleep-Inducing Peptide) is een synthetisch nonapeptide, geleverd voor onderzoek naar slaapregulatie, deltagolfactiviteit en circadiane signaalroutes.",
"{N} (Elamipretide) is a mitochondria-targeting peptide, supplied for research into cardiolipin binding and mitochondrial energetics pathways.": "{N} (elamipretide) is een op mitochondriën gericht peptide, geleverd voor onderzoek naar cardiolipinebinding en mitochondriale energieroutes.",
"{N} (Glycyl-Histidyl-Lysine copper complex) is a naturally occurring tripeptide bound to copper. Supplied for research into dermal regeneration, collagen and elastin synthesis, and tissue repair. New batches are submitted for independent analysis by Janoshik.": "{N} (glycyl-histidyl-lysine-kopercomplex) is een van nature voorkomend tripeptide gebonden aan koper. Geleverd voor onderzoek naar huidregeneratie, collageen- en elastinesynthese en weefselherstel. Nieuwe batches worden onafhankelijk geanalyseerd door Janoshik.",
"{N} (Lysine-Proline-Valine) is the C-terminal tripeptide fragment of alpha-MSH. Supplied for research into inflammatory signalling, intestinal barrier function, and dermal health.": "{N} (lysine-proline-valine) is het C-terminale tripeptidefragment van alfa-MSH. Geleverd voor onderzoek naar ontstekingssignalering, de darmbarrière en de gezondheid van de huid.",
"{N} (Nicotinamide Adenine Dinucleotide) is a coenzyme present in all living cells, supplied for research into cellular energy metabolism, sirtuin activity, and longevity pathways.": "{N} (nicotinamide-adenine-dinucleotide) is een co-enzym dat in alle levende cellen voorkomt, geleverd voor onderzoek naar het cellulaire energiemetabolisme, de activiteit van sirtuïnes en routes van levensduur.",
"{N} (TA{#}) is a synthetic {#}-amino acid peptide, supplied for research into immune system modulation, T-cell signalling, and thymic function.": "{N} (TA{#}) is een synthetisch peptide van {#} aminozuren, geleverd voor onderzoek naar immuunmodulatie, T-celsignalering en de thymusfunctie.",
"{N} Acetate is a synthetic GHRH {#}-{#} fragment, supplied for research into growth hormone releasing pathways. Lyophilized, high-stability formulation.": "{N}-acetaat is een synthetisch GHRH-{#}-{#}-fragment, geleverd voor onderzoek naar de afgifteroutes van groeihormoon. Gelyofiliseerde formulering met hoge stabiliteit.",
"{N} and {N} are authorised as medicines in Russia (nasal route); neither is authorised in the European Union or the United States.": "{N} en {N} zijn in Rusland als geneesmiddel toegelaten (via de neus); geen van beide is toegelaten in de Europese Unie of de Verenigde Staten.",
"{N} is a cathelicidin-derived antimicrobial peptide, supplied for research into innate immunity pathways and host defense mechanisms.": "{N} is een van cathelicidine afgeleid antimicrobieel peptide, geleverd voor onderzoek naar routes van de aangeboren immuniteit en afweermechanismen van de gastheer.",
"{N} is a neurotrophic peptide complex, supplied for research into neuroprotection, BDNF modulation, and cognitive signalling pathways.": "{N} is een neurotroof peptidecomplex, geleverd voor onderzoek naar neuroprotectie, BDNF-modulatie en cognitieve signaalroutes.",
"{N} is a proprietary research blend containing CJC-{#} ({#}mg, no DAC) and {N} ({#}mg) in a single lyophilized vial. Formulated for researchers investigating GH-releasing pathways in an integrated protocol.": "{N} is een eigen onderzoeksmengsel met CJC-{#} ({#}mg, zonder DAC) en {N} ({#}mg) in één gelyofiliseerde flacon. Samengesteld voor onderzoekers die routes van GH-afgifte in een geïntegreerd protocol bestuderen.",
"{N} is a proprietary research blend containing {N} ({#}mg) and {N} ({#}mg) combined in a single lyophilized vial. Formulated for researchers investigating combined regenerative signalling pathways. New batches are submitted for independent analysis by Janoshik.": "{N} is een eigen onderzoeksmengsel met {N} ({#}mg) en {N} ({#}mg) in één gelyofiliseerde flacon. Samengesteld voor onderzoekers die gecombineerde regeneratieve signaalroutes bestuderen. Nieuwe batches worden onafhankelijk geanalyseerd door Janoshik.",
"{N} is a selective synthetic growth hormone secretagogue, supplied for research into pulsatile GH release pathways. Lyophilized, high-stability formulation.": "{N} is een selectieve synthetische groeihormoon-secretagoog, geleverd voor onderzoek naar routes van pulsatiele GH-afgifte. Gelyofiliseerde formulering met hoge stabiliteit.",
"{N} is a synthetic analog of growth hormone-releasing hormone (GHRH), supplied for research into visceral fat metabolism and the GH/IGF-{#} axis.": "{N} is een synthetisch analoog van groeihormoon-releasing hormoon (GHRH), geleverd voor onderzoek naar het viscerale vetmetabolisme en de GH/IGF-{#}-as.",
"{N} is a synthetic decapeptide, supplied for research into GnRH regulation and reproductive endocrinology signalling pathways.": "{N} is een synthetisch decapeptide, geleverd voor onderzoek naar GnRH-regulatie en signaalroutes van de reproductieve endocrinologie.",
"{N} is a synthetic dual-agonist peptide targeting both GLP-{#} and glucagon receptors. Supplied exclusively for in-vitro laboratory research. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.": "{N} is een synthetisch peptide met duale agonistwerking op zowel GLP-{#}- als glucagonreceptoren. Uitsluitend geleverd voor in-vitro laboratoriumonderzoek. Geen geneesmiddel, supplement of cosmeticum. Niet voor gebruik bij mens of dier.",
"{N} is a synthetic dual-agonist research peptide targeting GLP-{#} and glucagon receptors. Supplied exclusively for in-vitro laboratory research. Not a medicine, supplement, or cosmetic.": "{N} is een synthetisch onderzoekspeptide met duale agonistwerking op GLP-{#}- en glucagonreceptoren. Uitsluitend geleverd voor in-vitro laboratoriumonderzoek. Geen geneesmiddel, supplement of cosmeticum.",
"{N} is a synthetic fragment of Thymosin Beta-{#}, supplied for research into cellular migration, angiogenesis, and tissue regeneration. Each vial contains lyophilized peptide.": "{N} is een synthetisch fragment van thymosine bèta-{#}, geleverd voor onderzoek naar celmigratie, angiogenese en weefselregeneratie. Elke flacon bevat gelyofiliseerd peptide.",
"{N} is a synthetic growth hormone-releasing hexapeptide supplied exclusively for in-vitro laboratory research into GH secretagogue receptor pathways. Each vial contains a lyophilised compound. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.": "{N} is een synthetisch groeihormoon-releasing hexapeptide, uitsluitend geleverd voor in-vitro laboratoriumonderzoek naar routes van de GH-secretagoogreceptor. Elke flacon bevat een gelyofiliseerde verbinding. Het Janoshik-analyserapport wordt gepubliceerd zodra de batch is getest. Geen geneesmiddel, supplement of cosmeticum. Niet voor gebruik bij mens of dier.",
"{N} is a synthetic growth hormone-releasing peptide supplied exclusively for in-vitro laboratory research into GH secretagogue receptor pathways. Each vial contains a lyophilised compound. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.": "{N} is een synthetisch groeihormoon-releasing peptide, uitsluitend geleverd voor in-vitro laboratoriumonderzoek naar routes van de GH-secretagoogreceptor. Elke flacon bevat een gelyofiliseerde verbinding. Het Janoshik-analyserapport wordt gepubliceerd zodra de batch is getest. Geen geneesmiddel, supplement of cosmeticum. Niet voor gebruik bij mens of dier.",
"{N} is a synthetic heptapeptide analog of ACTH({#}-{#}), supplied for research into cognitive function, BDNF expression, and neuroprotective signalling.": "{N} is een synthetisch heptapeptide-analoog van ACTH({#}-{#}), geleverd voor onderzoek naar cognitieve functie, BDNF-expressie en neuroprotectieve signalering.",
"{N} is a synthetic heptapeptide analog of tuftsin, supplied for research into anxiolytic mechanisms and GABAergic signalling pathways.": "{N} is een synthetisch heptapeptide-analoog van tuftsine, geleverd voor onderzoek naar anxiolytische mechanismen en GABA-erge signaalroutes.",
"{N} is a synthetic long-acting amylin analog, supplied for research into amylin receptor pathways and satiety signalling. Each vial contains lyophilized peptide for in-vitro laboratory investigation.": "{N} is een synthetisch langwerkend amyline-analoog, geleverd voor onderzoek naar routes van de amylinereceptor en verzadigingssignalering. Elke flacon bevat gelyofiliseerd peptide voor in-vitro laboratoriumonderzoek.",
"{N} is a synthetic modified fragment of growth hormone (amino acids {#}-{#}), supplied exclusively for in-vitro laboratory research into lipid metabolism signalling. Each vial contains a lyophilised compound. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.": "{N} is een synthetisch gewijzigd fragment van groeihormoon (aminozuren {#}-{#}), uitsluitend geleverd voor in-vitro laboratoriumonderzoek naar signalering in het lipidenmetabolisme. Elke flacon bevat een gelyofiliseerde verbinding. Het Janoshik-analyserapport wordt gepubliceerd zodra de batch is getest. Geen geneesmiddel, supplement of cosmeticum. Niet voor gebruik bij mens of dier.",
"{N} is a synthetic peptide supplied exclusively for in-vitro laboratory research into GLP-{#} and GIP receptor signalling. Each vial contains a lyophilised compound. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.": "{N} is een synthetisch peptide, uitsluitend geleverd voor in-vitro laboratoriumonderzoek naar GLP-{#}- en GIP-receptorsignalering. Elke flacon bevat een gelyofiliseerde verbinding. Het Janoshik-analyserapport wordt gepubliceerd zodra de batch is getest. Geen geneesmiddel, supplement of cosmeticum. Niet voor gebruik bij mens of dier.",
"{N} is a synthetic peptide supplied exclusively for in-vitro laboratory research into GLP-{#} receptor signalling. Each vial contains a lyophilised compound. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.": "{N} is een synthetisch peptide, uitsluitend geleverd voor in-vitro laboratoriumonderzoek naar GLP-{#}-receptorsignalering. Elke flacon bevat een gelyofiliseerde verbinding. Het Janoshik-analyserapport wordt gepubliceerd zodra de batch is getest. Geen geneesmiddel, supplement of cosmeticum. Niet voor gebruik bij mens of dier.",
"{N} is a synthetic peptide supplied exclusively for in-vitro laboratory research into GLP-{#}, GIP, and glucagon receptor signalling. Each vial contains lyophilized peptide with batch-specific analytical documentation by Janoshik Analytical (Czech Republic). Not a medicine, supplement, or cosmetic. Not for human or veterinary use.": "{N} is een synthetisch peptide, uitsluitend geleverd voor in-vitro laboratoriumonderzoek naar signalering via GLP-{#}-, GIP- en glucagonreceptoren. Elke flacon bevat gelyofiliseerd peptide met batchspecifieke analysedocumentatie van Janoshik Analytical (Tsjechië). Geen geneesmiddel, supplement of cosmeticum. Niet voor gebruik bij mens of dier.",
"{N} is a synthetic small molecule NNMT inhibitor supplied exclusively for in-vitro laboratory research into cellular metabolism and adipocyte signalling. Each vial contains a lyophilised compound. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.": "{N} is een synthetische NNMT-remmer met klein molecuulgewicht, uitsluitend geleverd voor in-vitro laboratoriumonderzoek naar het celmetabolisme en adipocytsignalering. Elke flacon bevat een gelyofiliseerde verbinding. Het Janoshik-analyserapport wordt gepubliceerd zodra de batch is getest. Geen geneesmiddel, supplement of cosmeticum. Niet voor gebruik bij mens of dier.",
"{N} is a synthetic tetrapeptide (Ala-Glu-Asp-Gly), supplied for research into telomerase activation, pineal gland signalling, and longevity pathways.": "{N} is een synthetisch tetrapeptide (Ala-Glu-Asp-Gly), geleverd voor onderzoek naar telomeraseactivering, signalering van de pijnappelklier en routes van levensduur.",
"{N} is a thymus-derived peptide complex, supplied for research into immune function, thymic regulation, and age-related immunology.": "{N} is een uit de thymus afkomstig peptidecomplex, geleverd voor onderzoek naar immuunfunctie, thymusregulatie en leeftijdsgebonden immunologie.",
"{N} is a {#}-amino acid mitochondrial-derived peptide, supplied for research into metabolic homeostasis, insulin sensitivity, and cellular stress response pathways.": "{N} is een van mitochondriën afgeleid peptide van {#} aminozuren, geleverd voor onderzoek naar metabole homeostase, insulinegevoeligheid en routes van de cellulaire stressrespons.",
"{N} is an {#}-amino acid peptide derived from erythropoietin, supplied for research into innate repair receptor signalling and neuroprotection.": "{N} is een peptide van {#} aminozuren afgeleid van erytropoëtine, geleverd voor onderzoek naar signalering via de aangeboren herstelreceptor en neuroprotectie.",
"{N} is our flagship triple-peptide research blend containing {N} ({#}mg), {N} ({#}mg), and {N} ({#}mg) in a single lyophilized vial. Formulated for researchers investigating comprehensive regenerative signalling across multiple pathways simultaneously.": "{N} is ons belangrijkste onderzoeksmengsel van drie peptiden met {N} ({#}mg), {N} ({#}mg) en {N} ({#}mg) in één gelyofiliseerde flacon. Samengesteld voor onderzoekers die regeneratieve signalering via meerdere routes tegelijk bestuderen.",
"{N} is our premium four-peptide research complex containing {N} ({#}mg), {N} ({#}mg), {N} ({#}mg), and {N} ({#}mg) in a single lyophilized vial. The most comprehensive regenerative research blend in our catalog.": "{N} is ons premium onderzoekscomplex van vier peptiden met {N} ({#}mg), {N} ({#}mg), {N} ({#}mg) en {N} ({#}mg) in één gelyofiliseerde flacon. Het meest complete regeneratieve onderzoeksmengsel van onze catalogus.",
"{N} is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised compound. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.": "{N} wordt uitsluitend geleverd voor in-vitro laboratoriumonderzoek. Elke flacon bevat een gelyofiliseerde verbinding. Het Janoshik-analyserapport wordt gepubliceerd zodra de batch is getest. Geen geneesmiddel, supplement of cosmeticum. Niet voor gebruik bij mens of dier.",
"{N} is supplied exclusively for in-vitro laboratory research. Each vial contains a lyophilised peptide. The Janoshik analysis report is published once the batch has been tested. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.": "{N} wordt uitsluitend geleverd voor in-vitro laboratoriumonderzoek. Elke flacon bevat een gelyofiliseerd peptide. Het Janoshik-analyserapport wordt gepubliceerd zodra de batch is getest. Geen geneesmiddel, supplement of cosmeticum. Niet voor gebruik bij mens of dier.",
"{N} is supplied exclusively for in-vitro laboratory research. Each vial contains lyophilized compound. Not a medicine, supplement, or cosmetic. Not for human or veterinary use.": "{N} wordt uitsluitend geleverd voor in-vitro laboratoriumonderzoek. Elke flacon bevat een gelyofiliseerde verbinding. Geen geneesmiddel, supplement of cosmeticum. Niet voor gebruik bij mens of dier.",
"{N} variant acetylated at one end (N-acetyl) and amidated at the other, modifications intended to make it more stable. Few independent published studies.": "{N}-variant, aan het ene uiteinde geacetyleerd (N-acetyl) en aan het andere geamideerd, wijzigingen bedoeld om hem stabieler te maken. Weinig onafhankelijk gepubliceerde studies.",
"Status (checked October {#}): Afamelanotide is authorised as an implant (brand Scenesse) for a specific indication (erythropoietic protoporphyria) in the EU and the United States. The Novalyx product is a research compound, not that medicine.": "Status (gecontroleerd in oktober {#}): Afamelanotide is als implantaat (merk Scenesse) toegelaten voor een specifieke indicatie (erytropoëtische protoporfyrie) in de EU en de Verenigde Staten. Het Novalyx-product is een onderzoeksverbinding, niet dat geneesmiddel.",
"Status (checked October {#}): Approved in China (NMPA, June {#}) for chronic weight management in adults; to our knowledge not approved in the EU or the United States.": "Status (gecontroleerd in oktober {#}): In China goedgekeurd (NMPA, juni {#}) voor chronisch gewichtsbeheer bij volwassenen; voor zover wij weten niet goedgekeurd in de EU of de Verenigde Staten.",
"Status (checked October {#}): Authorised in the United States (brand Egrifta) for a specific indication (HIV-associated abdominal lipodystrophy). The Novalyx product is a research compound, not that medicine.": "Status (gecontroleerd in oktober {#}): Toegelaten in de Verenigde Staten (merk Egrifta) voor een specifieke indicatie (hiv-gerelateerde abdominale lipodystrofie). Het Novalyx-product is een onderzoeksverbinding, niet dat geneesmiddel.",
"Status (checked October {#}): Authorised in the United States (brand Vyleesi) for a specific indication. The Novalyx product is a research compound, not that medicine.": "Status (gecontroleerd in oktober {#}): Toegelaten in de Verenigde Staten (merk Vyleesi) voor een specifieke indicatie. Het Novalyx-product is een onderzoeksverbinding, niet dat geneesmiddel.",
"Status (checked October {#}): Authorised medicine (FDA and EMA) under the brands Mounjaro and Zepbound. The Novalyx product is a research compound and is not that medicine.": "Status (gecontroleerd in oktober {#}): Toegelaten geneesmiddel (FDA en EMA) onder de merken Mounjaro en Zepbound. Het Novalyx-product is een onderzoeksverbinding en niet dat geneesmiddel.",
"Status (checked October {#}): Authorised medicine under the brands Ozempic, Wegovy and Rybelsus. The Novalyx product is a research compound and is not that medicine.": "Status (gecontroleerd in oktober {#}): Toegelaten geneesmiddel onder de merken Ozempic, Wegovy en Rybelsus. Het Novalyx-product is een onderzoeksverbinding en niet dat geneesmiddel.",
"Status (checked October {#}): Both components are investigational molecules, not authorised as medicines.": "Status (gecontroleerd in oktober {#}): Beide componenten zijn onderzoeksmoleculen, niet als geneesmiddel toegelaten.",
"Status (checked October {#}): Cosmetic ingredient (topical use); efficacy data come mostly from manufacturers. No medicine status.": "Status (gecontroleerd in oktober {#}): Cosmetisch ingrediënt (topisch gebruik); werkzaamheidsgegevens komen vooral van fabrikanten. Geen geneesmiddelstatus.",
"Status (checked October {#}): Cosmetic ingredient; no medicine status.": "Status (gecontroleerd in oktober {#}): Cosmetisch ingrediënt; geen geneesmiddelstatus.",
"Status (checked October {#}): Elamipretide is approved in the United States (FDA, accelerated approval, September {#}, brand Forzinity) only for Barth syndrome. The Novalyx product is a research compound, not that medicine.": "Status (gecontroleerd in oktober {#}): Elamipretide is in de Verenigde Staten goedgekeurd (FDA, versnelde goedkeuring, september {#}, merk Forzinity) uitsluitend voor het syndroom van Barth. Het Novalyx-product is een onderzoeksverbinding, niet dat geneesmiddel.",
"Status (checked October {#}): Endogenous molecule studied in the laboratory. No authorisation as a medicine for the forms sold here; associated health claims are not validated by authorities.": "Status (gecontroleerd in oktober {#}): Lichaamseigen molecuul, bestudeerd in het laboratorium. Geen vergunning als geneesmiddel voor de hier verkochte vormen; bijbehorende gezondheidsclaims zijn niet door de autoriteiten bevestigd.",
"Status (checked October {#}): Experimental compound; no medicine authorisation.": "Status (gecontroleerd in oktober {#}): Experimentele verbinding; geen geneesmiddelvergunning.",
"Status (checked October {#}): Investigational drug (phase {#} clinical trials); not authorised.": "Status (gecontroleerd in oktober {#}): Onderzoeksgeneesmiddel (klinische studies fase {#}); niet toegelaten.",
"Status (checked October {#}): Investigational drug in advanced development, alone and in combination with semaglutide (CagriSema). Status is evolving: refer to health authorities for the current situation.": "Status (gecontroleerd in oktober {#}): Onderzoeksgeneesmiddel in vergevorderde ontwikkeling, alleen en in combinatie met semaglutide (CagriSema). De status verandert: raadpleeg de gezondheidsautoriteiten voor de actuele situatie.",
"Status (checked October {#}): Investigational drug, in phase {#} clinical trials; to our knowledge not authorised.": "Status (gecontroleerd in oktober {#}): Onderzoeksgeneesmiddel in klinische studies fase {#}; voor zover wij weten niet toegelaten.",
"Status (checked October {#}): Investigational drug: in phase {#} clinical trials, not authorised to date. According to the company's announcements, a US marketing application is targeted for early {#}. The Novalyx product is a research compound, not a medicine.": "Status (gecontroleerd in oktober {#}): Onderzoeksgeneesmiddel: in klinische studies fase {#}, tot nu toe niet toegelaten. Volgens aankondigingen van het bedrijf is een Amerikaanse handelsvergunning gepland voor begin {#}. Het Novalyx-product is een onderzoeksverbinding, geen geneesmiddel.",
"Status (checked October {#}): Investigational molecule in clinical trials; not authorised as a medicine.": "Status (gecontroleerd in oktober {#}): Onderzoeksmolecuul in klinische studies; niet als geneesmiddel toegelaten.",
"Status (checked October {#}): Its pharmaceutical form (thymalfasin, brand Zadaxin) is authorised in several countries, mainly in Asia, for certain indications; it is not authorised in the United States. The Novalyx product is a research compound.": "Status (gecontroleerd in oktober {#}): De farmaceutische vorm (thymalfasine, merk Zadaxin) is in verschillende landen, vooral in Azië, voor bepaalde indicaties toegelaten; in de Verenigde Staten is ze niet toegelaten. Het Novalyx-product is een onderzoeksverbinding.",
"Status (checked October {#}): Laboratory reagent.": "Status (gecontroleerd in oktober {#}): Laboratoriumreagens.",
"Status (checked October {#}): Laboratory solvent: it contains no active substance.": "Status (gecontroleerd in oktober {#}): Laboratoriumoplosmiddel: het bevat geen werkzame stof.",
"Status (checked October {#}): Marketed as a medicine in some countries (including Austria, Russia, China); not authorised in the United States. Clinical evidence of efficacy remains debated.": "Status (gecontroleerd in oktober {#}): In sommige landen als geneesmiddel op de markt gebracht (waaronder Oostenrijk, Rusland, China); niet toegelaten in de Verenigde Staten. Het klinische bewijs van werkzaamheid blijft omstreden.",
"Status (checked October {#}): No authorisation; preclinical data only.": "Status (gecontroleerd in oktober {#}): Geen vergunning; alleen preklinische gegevens.",
"Status (checked October {#}): No medicine authorisation in any country; no published clinical data.": "Status (gecontroleerd in oktober {#}): Geen geneesmiddelvergunning, in geen enkel land; geen gepubliceerde klinische gegevens.",
"Status (checked October {#}): No medicine authorisation in the European Union or the United States.": "Status (gecontroleerd in oktober {#}): Geen geneesmiddelvergunning in de Europese Unie of de Verenigde Staten.",
"Status (checked October {#}): No medicine authorisation.": "Status (gecontroleerd in oktober {#}): Geen geneesmiddelvergunning.",
"Status (checked October {#}): No medicine authorisation; clinical development discontinued.": "Status (gecontroleerd in oktober {#}): Geen geneesmiddelvergunning; klinische ontwikkeling stopgezet.",
"Status (checked October {#}): No medicine authorisation; clinical development stopped.": "Status (gecontroleerd in oktober {#}): Geen geneesmiddelvergunning; klinische ontwikkeling gestopt.",
"Status (checked October {#}): Not authorised as a medicine in any country. Published data come mostly from preclinical (animal) studies; controlled human data are very limited. Listed as prohibited by the World Anti-Doping Agency (WADA).": "Status (gecontroleerd in oktober {#}): In geen enkel land als geneesmiddel toegelaten. Gepubliceerde gegevens komen vooral uit preklinische (dier)studies; gecontroleerde gegevens bij mensen zijn zeer beperkt. Op de verboden lijst van het Wereldantidopingagentschap (WADA).",
"Status (checked October {#}): Not authorised as a medicine in the EU or the United States; as pralmorelin it has been used in Japan as a diagnostic agent, to our knowledge. Prohibited by WADA.": "Status (gecontroleerd in oktober {#}): Niet als geneesmiddel toegelaten in de EU of de Verenigde Staten; als pralmorelin is het voor zover wij weten in Japan gebruikt als diagnostisch middel. Verboden door het WADA.",
"Status (checked October {#}): Not authorised as a medicine in the EU or the United States; limited data, mostly from a small number of laboratories.": "Status (gecontroleerd in oktober {#}): Niet als geneesmiddel toegelaten in de EU of de Verenigde Staten; beperkte gegevens, grotendeels van een klein aantal laboratoria.",
"Status (checked October {#}): Not authorised as a medicine in the United States; aviptadil has been the subject of clinical trials and very limited authorisations depending on the country.": "Status (gecontroleerd in oktober {#}): Niet als geneesmiddel toegelaten in de Verenigde Staten; aviptadil is onderwerp geweest van klinische studies en, afhankelijk van het land, zeer beperkte vergunningen.",
"Status (checked October {#}): Not authorised as a medicine. Controlled human data are almost non-existent. Prohibited by WADA.": "Status (gecontroleerd in oktober {#}): Niet als geneesmiddel toegelaten. Gecontroleerde gegevens bij mensen zijn vrijwel onbestaand. Verboden door het WADA.",
"Status (checked October {#}): Not authorised as a medicine. Prohibited by WADA.": "Status (gecontroleerd in oktober {#}): Niet als geneesmiddel toegelaten. Verboden door het WADA.",
"Status (checked October {#}): Not authorised as a medicine; clinical trials in obesity did not lead to an authorisation.": "Status (gecontroleerd in oktober {#}): Niet als geneesmiddel toegelaten; klinische studies naar obesitas hebben niet tot een vergunning geleid.",
"Status (checked October {#}): Not authorised as a medicine; exploratory clinical trials have taken place without authorisation. Prohibited by WADA.": "Status (gecontroleerd in oktober {#}): Niet als geneesmiddel toegelaten; verkennende klinische studies hebben zonder vergunning plaatsgevonden. Verboden door het WADA.",
"Status (checked October {#}): Not authorised as a medicine; research is essentially in vitro and preclinical.": "Status (gecontroleerd in oktober {#}): Niet als geneesmiddel toegelaten; het onderzoek is in wezen in vitro en preklinisch.",
"Status (checked October {#}): Not authorised as a medicine; research is essentially preclinical.": "Status (gecontroleerd in oktober {#}): Niet als geneesmiddel toegelaten; het onderzoek is in wezen preklinisch.",
"Status (checked October {#}): Not authorised as a medicine; research use. Prohibited by WADA.": "Status (gecontroleerd in oktober {#}): Niet als geneesmiddel toegelaten; gebruik voor onderzoek. Verboden door het WADA.",
"Status (checked October {#}): Not authorised as a medicine; several health authorities (for example in the United Kingdom and Australia) have issued warnings about products sold under this name.": "Status (gecontroleerd in oktober {#}): Niet als geneesmiddel toegelaten; verschillende gezondheidsautoriteiten (bijvoorbeeld in het Verenigd Koninkrijk en Australië) hebben gewaarschuwd voor producten die onder deze naam worden verkocht.",
"Status (checked October {#}): Not authorised as a medicine; the literature is old and results have been inconsistent.": "Status (gecontroleerd in oktober {#}): Niet als geneesmiddel toegelaten; de literatuur is oud en de resultaten waren wisselend.",
"Status (checked October {#}): Not authorised as a medicine; used in research studies in reproductive endocrinology.": "Status (gecontroleerd in oktober {#}): Niet als geneesmiddel toegelaten; gebruikt in onderzoeksstudies in de reproductieve endocrinologie.",
"Status (checked October {#}): Not authorised in the EU or the United States; data come mostly from the Russian literature.": "Status (gecontroleerd in oktober {#}): Niet toegelaten in de EU of de Verenigde Staten; de gegevens komen grotendeels uit de Russische literatuur.",
"Status (checked October {#}): Not authorised in the EU or the United States; the literature is limited and rarely independently replicated.": "Status (gecontroleerd in oktober {#}): Niet toegelaten in de EU of de Verenigde Staten; de literatuur is beperkt en zelden onafhankelijk herhaald.",
"Status (checked October {#}): Preclinical research (cells, animals); a few very limited human studies on analogues. No authorisation.": "Status (gecontroleerd in oktober {#}): Preklinisch onderzoek (cellen, dieren); enkele zeer beperkte studies bij mensen op analogen. Geen vergunning.",
"Status (checked October {#}): Preclinical research compound; no medicine authorisation.": "Status (gecontroleerd in oktober {#}): Preklinische onderzoeksverbinding; geen geneesmiddelvergunning.",
"Status (checked October {#}): Proprietary blend of research compounds; it is not a medicine. The status of its components is as described in their own entries.": "Status (gecontroleerd in oktober {#}): Eigen mengsel van onderzoeksverbindingen; het is geen geneesmiddel. De status van de componenten is zoals beschreven in hun eigen fiches.",
"Status (checked October {#}): Proprietary blend of research compounds; no medicine status. The status of its components is as described in their own entries.": "Status (gecontroleerd in oktober {#}): Eigen mengsel van onderzoeksverbindingen; geen geneesmiddelstatus. De status van de componenten is zoals beschreven in hun eigen fiches.",
"Status (checked October {#}): Registered as a medicine in Russia; not authorised in the EU or the United States.": "Status (gecontroleerd in oktober {#}): In Rusland als geneesmiddel geregistreerd; niet toegelaten in de EU of de Verenigde Staten.",
"Status (checked October {#}): Research peptide; no medicine authorisation.": "Status (gecontroleerd in oktober {#}): Onderzoekspeptide; geen geneesmiddelvergunning.",
"Status (checked October {#}): Research reagent (cell culture); not authorised as a medicine.": "Status (gecontroleerd in oktober {#}): Onderzoeksreagens (celkweek); niet als geneesmiddel toegelaten.",
"Status (checked October {#}): Research reagent; no medicine authorisation. Listed on the World Anti-Doping Agency prohibited list.": "Status (gecontroleerd in oktober {#}): Onderzoeksreagens; geen geneesmiddelvergunning. Op de verboden lijst van het Wereldantidopingagentschap.",
"Status (checked October {#}): Research reagent; not authorised as a medicine.": "Status (gecontroleerd in oktober {#}): Onderzoeksreagens; niet als geneesmiddel toegelaten.",
"Status (checked October {#}): Used in cosmetics (topical application); no authorisation as an injectable medicine. Research mainly involves cell models and topical applications.": "Status (gecontroleerd in oktober {#}): Gebruikt in cosmetica (topische toepassing); geen vergunning als injecteerbaar geneesmiddel. Het onderzoek betreft vooral celmodellen en topische toepassingen.",
"Status (checked October {#}): Was authorised in the United States (brand Geref) and later withdrawn for commercial reasons. Prohibited by WADA.": "Status (gecontroleerd in oktober {#}): Was toegelaten in de Verenigde Staten (merk Geref) en later om commerciële redenen teruggetrokken. Verboden door het WADA.",
"Status (checked October {#}): {N} and {N} are authorised as medicines in Russia (nasal route); neither is authorised in the European Union or the United States.": "Status (gecontroleerd in oktober {#}): {N} en {N} zijn in Rusland als geneesmiddel toegelaten (via de neus); geen van beide is toegelaten in de Europese Unie of de Verenigde Staten."
};
