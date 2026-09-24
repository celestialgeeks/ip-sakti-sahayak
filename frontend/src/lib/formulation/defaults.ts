import type { BotanicalItem, PresetFormulation } from "./types.ts";



export const DEFAULT_BOTANICALS: BotanicalItem[] = [
  {
    id: "ashwagandha",
    common_name: "Ashwagandha",
    sanskrit_name: "अश्वगन्धा (Aśvagandhā)",
    botanical_name: "Withania somnifera",
    family: "Solanaceae",
    part_used: "Dried Root",
    marker_compound: "Withanolides / Withaferin-A",
    standardized_percentage: "5.2% Withanolides",
    category: "adaptogen",
    single_agent_ed50: 40.0,
    is_mineral_resin: false,
    is_threatened: false,
    is_cultivated: true,
    classical_reference: "Charaka Samhita Chikitsasthanam 1.1 / API Part-I Vol-I",
    description: "Potent Balya (strength-promoting) and Rasayana adaptogen. Modulates HPA axis and suppresses cortisol."
  },
  {
    id: "shilajit",
    common_name: "Shodhit Shilajit",
    sanskrit_name: "शिलाजतु (Śilājatu)",
    botanical_name: "Asphaltum punjabianum",
    family: "Mineral Pitch / Bitumen",
    part_used: "Exudate / Purified Resin",
    marker_compound: "Fulvic Acid & DBP",
    standardized_percentage: "50.0% Fulvic Acid",
    category: "mineral_resin",

    single_agent_ed50: 25.0,
    is_mineral_resin: true,
    is_threatened: false,
    is_cultivated: false,
    classical_reference: "Charaka Samhita Chikitsa 1.3 / Rasatarangini Taranga 22",
    description: "Herbo-mineral catalyst. Cellular ATP rejuvenator and mitochondrial bio-energetic activator. High mineral sourcing scrutiny under BDA."
  },
  {
    id: "haridra",
    common_name: "Haridra (Turmeric)",
    sanskrit_name: "हरिद्रा (Haridrā)",
    botanical_name: "Curcuma longa",
    family: "Zingiberaceae",
    part_used: "Rhizome",
    marker_compound: "Curcuminoids",
    standardized_percentage: "95.0% Curcuminoids",
    category: "anti_inflammatory",
    single_agent_ed50: 50.0,
    is_mineral_resin: false,
    is_threatened: false,
    is_cultivated: true,
    classical_reference: "Charaka Samhita Sutrasthanam 4 / API Part-I Vol-I",
    description: "Varnya and Lekhana anti-inflammatory botanical. Suppresses NF-κB, TNF-α, and COX-2 cascades."
  },
  {
    id: "pippali",
    common_name: "Pippali (Long Pepper)",
    sanskrit_name: "पिप्पली (Pippalī)",
    botanical_name: "Piper longum",
    family: "Piperaceae",
    part_used: "Dried Fruit Spike",
    marker_compound: "Piperine",
    standardized_percentage: "98.0% Piperine",
    category: "bio_enhancer",
    single_agent_ed50: 10.0,
    is_mineral_resin: false,
    is_threatened: false,
    is_cultivated: true,
    classical_reference: "Charaka Samhita Chikitsa 1.3 / Bhavaprakasha Nighantu",
    description: "Prime Yogavāhī (bio-enhancer) and Deepana-Pachana catalyst. Downregulates CYP3A4 and P-glycoprotein to multiply systemic bioavailability by 2x-4x."
  },
  {
    id: "ghee",
    common_name: "Vedic Cow Ghrita",
    sanskrit_name: "गोघृत (Goghṛta)",
    botanical_name: "Clarified Cow Butter Liposomes",
    family: "Lipid Vehicle / Anupana",
    part_used: "A2 Cow Milk Lipid Fraction",
    marker_compound: "Butyric Acid & CLA",
    standardized_percentage: "99.5% Triglyceride Lipids",
    category: "carrier",
    single_agent_ed50: 80.0,
    is_mineral_resin: false,
    is_threatened: false,
    is_cultivated: true,
    classical_reference: "Sushruta Samhita Sutrasthanam 45 / Charaka Sutra 27",
    description: "Liposomal lipid carrier (Sneha Samskara). Facilitates crossing of the blood-brain barrier and enhances mucosal lymphatic transport."
  },
  {
    id: "guduchi",
    common_name: "Guduchi (Giloy)",
    sanskrit_name: "गुडूची (Guḍūcī)",
    botanical_name: "Tinospora cordifolia",
    family: "Menispermaceae",
    part_used: "Stem",
    marker_compound: "Cordifolioside A / Berberine",
    standardized_percentage: "3.5% Bitter Glycosides",
    category: "adaptogen",
    single_agent_ed50: 35.0,
    is_mineral_resin: false,
    is_threatened: false,
    is_cultivated: true,
    classical_reference: "Charaka Samhita Chikitsasthanam 1.2 / API Part-I Vol-I",
    description: "Amrita (nectar). Potent immunomodulator, Rasayana, and hepatoprotective shield that neutralizes mineral toxicity."
  },
  {
    id: "brahmi",
    common_name: "Brahmi",
    sanskrit_name: "ब्राह्मी (Brāhmī)",
    botanical_name: "Bacopa monnieri",
    family: "Plantaginaceae",
    part_used: "Whole Plant",
    marker_compound: "Bacosides A & B",
    standardized_percentage: "55.0% Bacosides",
    category: "medhya",
    single_agent_ed50: 30.0,
    is_mineral_resin: false,
    is_threatened: false,
    is_cultivated: true,
    classical_reference: "Charaka Samhita Sharirasthanam 8 / API Part-I Vol-II",
    description: "Medhya Rasayana for synaptic plasticity, acetylcholine transmission, and neuroprotection."
  },
  {
    id: "shankhpushpi",
    common_name: "Shankhpushpi",
    sanskrit_name: "शङ्खपुष्पी (Śaṅkhapuṣpī)",
    botanical_name: "Convolvulus pluricaulis",
    family: "Convolvulaceae",
    part_used: "Whole Plant",
    marker_compound: "Scopoletin / Microphylic Acid",
    standardized_percentage: "2.5% Alkaloids",
    category: "medhya",
    single_agent_ed50: 45.0,
    is_mineral_resin: false,
    is_threatened: false,
    is_cultivated: true,
    classical_reference: "Charaka Samhita Chikitsa 1.3 / Bhavaprakasha Nighantu",
    description: "Supreme Medhya botanical, pacifies Pitta and Vata, calms neuro-excitation and supports sleep."
  },
  {
    id: "amla",
    common_name: "Amalaki (Indian Gooseberry)",
    sanskrit_name: "आमलकी (Āmalakī)",
    botanical_name: "Phyllanthus emblica",
    family: "Phyllanthaceae",
    part_used: "Pericarp of Fruit",
    marker_compound: "Emblicanin A & B / Gallic Acid",
    standardized_percentage: "45.0% Tannins",
    category: "adaptogen",
    single_agent_ed50: 40.0,
    is_mineral_resin: false,
    is_threatened: false,
    is_cultivated: true,
    classical_reference: "Charaka Samhita Chikitsasthanam 1.1 / API Part-I Vol-I",
    description: "Vayasthapana (anti-aging) cornerstone of Chyawanprash. Rich in natural antioxidant polymers."
  },
  {
    id: "guggulu",
    common_name: "Shodhit Guggulu",
    sanskrit_name: "गुग्गुलु (Guggulu)",
    botanical_name: "Commiphora mukul",
    family: "Burseraceae",
    part_used: "Oleoresin",
    marker_compound: "Guggulsterones E & Z",
    standardized_percentage: "2.5% Guggulsterones",
    category: "anti_inflammatory",
    single_agent_ed50: 30.0,
    is_mineral_resin: true,
    is_threatened: true,
    is_cultivated: false,
    classical_reference: "Sushruta Samhita Sutrasthanam 38 / Bhavaprakasha Nighantu",
    description: "Deep-tissue penetrator (Srotoshodhaka). Lowers lipids, combats arthritic swelling. BDA threatened status."
  }
];

export const STARTER_PRESETS: PresetFormulation[] = [
  {
    id: "rasayana_matrix",
    title: "⚡ Rejuvenative Rasayana Matrix",
    description: "Ojas-building classical rejuvenation compound with immunomodulating adaptogens and lipid liposomal carrier.",
    target_tier: "siddha",
    ingredients: [
      { herb_id: "ashwagandha", ratio: 35.0, is_locked: false },
      { herb_id: "amla", ratio: 25.0, is_locked: false },
      { herb_id: "guduchi", ratio: 15.0, is_locked: false },
      { herb_id: "shilajit", ratio: 10.0, is_locked: false },
      { herb_id: "pippali", ratio: 5.0, is_locked: false },
      { herb_id: "ghee", ratio: 10.0, is_locked: false }
    ],
    baseline_ratios: {
      ashwagandha: 30.0,
      amla: 25.0,
      guduchi: 15.0,
      shilajit: 15.0,
      pippali: 5.0,
      ghee: 10.0
    }
  },
  {
    id: "anti_inflammatory_catalyst",
    title: "🛡️ Anti-Inflammatory Haridra-Pippali Catalyst",
    description: "Targeted COX-2 and NF-κB inflammatory cascade inhibitor combining standardized Curcuminoids with Piperine bio-enhancement.",
    target_tier: "divya_rasayana",
    ingredients: [
      { herb_id: "haridra", ratio: 45.0, is_locked: false },
      { herb_id: "guggulu", ratio: 25.0, is_locked: false },
      { herb_id: "ashwagandha", ratio: 15.0, is_locked: false },
      { herb_id: "pippali", ratio: 5.0, is_locked: false },
      { herb_id: "ghee", ratio: 10.0, is_locked: false }
    ],
    baseline_ratios: {
      haridra: 40.0,
      guggulu: 30.0,
      ashwagandha: 15.0,
      pippali: 5.0,
      ghee: 10.0
    }
  },
  {
    id: "medhya_neuro_enhancer",
    title: "🧠 Medhya Cognitive Neuro-Enhancer",
    description: "Nootropic brain tonic designed for synaptic plasticity, memory retention, and mental fatigue mitigation.",
    target_tier: "siddha",
    ingredients: [
      { herb_id: "brahmi", ratio: 40.0, is_locked: false },
      { herb_id: "shankhpushpi", ratio: 30.0, is_locked: false },
      { herb_id: "ashwagandha", ratio: 15.0, is_locked: false },
      { herb_id: "pippali", ratio: 5.0, is_locked: false },
      { herb_id: "ghee", ratio: 10.0, is_locked: false }
    ],
    baseline_ratios: {
      brahmi: 35.0,
      shankhpushpi: 30.0,
      ashwagandha: 20.0,
      pippali: 5.0,
      ghee: 10.0
    }
  },
  {
    id: "rev_3_2_benchmark",
    title: "Synergistic Ashwagandha-Shilajit-Curcumin Compound (Rev. 3.2)",
    description: "High-potency benchmark formulation designed to overcome Indian Patents Act Section 3(e) with proven NF-κB inhibition and BDA compliance.",
    target_tier: "vriddha",
    ingredients: [
      { herb_id: "ashwagandha", ratio: 40.0, is_locked: false },
      { herb_id: "shilajit", ratio: 10.0, is_locked: false },
      { herb_id: "haridra", ratio: 30.0, is_locked: true },
      { herb_id: "pippali", ratio: 5.0, is_locked: false },
      { herb_id: "ghee", ratio: 15.0, is_locked: false }
    ],
    baseline_ratios: {
      ashwagandha: 30.0,
      shilajit: 20.0,
      haridra: 30.0,
      pippali: 5.0,
      ghee: 15.0
    }
  }
];
