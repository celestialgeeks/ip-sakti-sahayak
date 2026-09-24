import type { IngredientRatio, SimulationResult, RasaTierId, PairwiseSynergy } from "./types.ts";



export function simulateClientFormulation(
  title: string,
  ingredients: IngredientRatio[],
  entityType: "domestic" | "foreign" = "domestic"
): SimulationResult {
  const ratios: Record<string, number> = {};
  let totalRatio = 0.0;

  for (const ing of ingredients) {
    const r = Math.round(ing.ratio * 100) / 100;
    ratios[ing.herb_id] = r;
    totalRatio += r;
  }
  totalRatio = Math.round(totalRatio * 100) / 100;
  const isBalanced = Math.abs(totalRatio - 100.0) < 0.1;

  const ashwa = ratios["ashwagandha"] || 0.0;
  const shilajit = ratios["shilajit"] || 0.0;
  const haridra = ratios["haridra"] || 0.0;
  const pippali = ratios["pippali"] || 0.0;
  const ghee = ratios["ghee"] || 0.0;
  const guduchi = ratios["guduchi"] || 0.0;
  const brahmi = ratios["brahmi"] || 0.0;
  const guggulu = ratios["guggulu"] || 0.0;

  // 1. Chou-Talalay Combination Index (CI)
  let baseCi = 1.15;

  if (pippali > 0.5) {
    const pippaliFactor = Math.min(pippali / 5.0, 1.2) * 0.32;
    baseCi -= pippaliFactor;
  }
  if (ghee >= 8.0) baseCi -= 0.12;
  if (ashwa >= 20.0 && haridra >= 20.0) baseCi -= 0.14;
  if (guduchi >= 5.0) baseCi -= 0.08;


  if (shilajit > 25.0) {
    let mineralPenalty = ((shilajit - 25.0) / 10.0) * 0.15;
    if (guduchi >= 10.0) mineralPenalty *= 0.3;
    baseCi += mineralPenalty;
  }
  if (ashwa < 15.0 && haridra < 15.0 && brahmi < 15.0) baseCi += 0.18;
  if (pippali < 1.0 && ashwa + haridra > 40.0) baseCi += 0.12;

  const ciScore = Math.round(Math.max(0.42, Math.min(1.35, baseCi)) * 100) / 100;

  let sec3eStatus: "CLEARED" | "BORDERLINE" | "REJECTED" = "CLEARED";
  let ciInterpretation = "Super-Additive Synergism (Overcomes Sec 3(e))";
  if (ciScore < 0.75) {
    sec3eStatus = "CLEARED";
    ciInterpretation = "Super-Additive Synergism (Overcomes Sec 3(e))";
  } else if (ciScore <= 0.95) {
    sec3eStatus = "CLEARED";
    ciInterpretation = "Statistically Significant Synergism";
  } else if (ciScore <= 1.05) {
    sec3eStatus = "BORDERLINE";
    ciInterpretation = "Nearly Additive — Sec 3(e) Objection Likely";
  } else {
    sec3eStatus = "REJECTED";
    ciInterpretation = "Sub-Additive / Mere Admixture (Sec 3(e) Bar)";
  }

  // 2. Bioavailability multiplier
  let bioMultiplier = 1.0;
  if (pippali >= 1.0) bioMultiplier += Math.min(pippali * 0.45, 2.2);
  if (ghee >= 5.0) bioMultiplier += Math.min(ghee * 0.04, 0.6);
  bioMultiplier = Math.round(bioMultiplier * 10) / 10;

  // 3. Anti-inflammatory NF-kB suppression
  let antiInflam = haridra * 0.48 + guggulu * 0.42 + ashwa * 0.22;
  if (pippali >= 3.0) antiInflam *= 1.35;
  antiInflam = Math.round(Math.min(antiInflam, 48.5) * 10) / 10;

  // 4. NBA ABS Royalty
  let absRoyalty = 3.5;
  let nbaTier = "Fast-Track Category B (Form III)";
  if (entityType === "foreign") {
    absRoyalty = 5.0;
    nbaTier = "Form I (Prior Approval for Foreign Participation)";
  } else if (shilajit >= 25.0 || guggulu >= 25.0) {
    absRoyalty = 5.0;
    nbaTier = "High-Scrutiny Public Hearing (High Mineral Burden)";
  } else if (shilajit <= 10.0 && guggulu <= 10.0) {
    absRoyalty = 3.0;
    nbaTier = "Fast-Track Form III (Low Mineral Liability)";
  }

  // 5. TKDL Concordance
  let tkdlScore = 75;
  let shlokaMatch = "Charaka Samhita Chikitsasthanam 28 (Vatavyadhi Chikitsa)";
  if (ashwa >= 25.0 && shilajit >= 5.0 && ghee >= 10.0) {
    tkdlScore = 92;
    shlokaMatch = "Charaka Samhita Chikitsa 1.1 / Rasatarangini Taranga 22";
  } else if (ashwa > 45.0) {
    tkdlScore = 68;
    shlokaMatch = "Diverges from classical Rasayana ratio; excess single adaptogen";
  } else if (pippali === 0.0) {
    tkdlScore = 58;
    shlokaMatch = "Lacks classical Deepana-Pachana / Yogavāhī vehicle";
  }

  // 6. Tridosha
  let vata = 35;
  let pitta = 30;
  let kapha = 35;
  if (ashwa >= 30.0) {
    vata -= 10;
    kapha += 10;
  }
  if (haridra >= 30.0 || pippali >= 5.0) {
    pitta += 15;
    kapha -= 10;
  }
  if (ghee >= 15.0) {
    pitta -= 10;
    vata -= 5;
  }
  const tridoshaBalance = {
    vata: Math.max(10, vata),
    pitta: Math.max(10, pitta),
    kapha: Math.max(10, kapha),
  };

  // 7. Buffs & Debuffs
  const activeBuffs: string[] = [];
  const activeDebuffs: string[] = [];

  if (pippali >= 3.0) activeBuffs.push("⚡ Yogavāhī Bio-Ignition Active");
  else activeDebuffs.push("⚠️ Lacks Yogavāhī Bio-Catalyst");

  if (ghee >= 10.0) activeBuffs.push("🌿 Lipid Carrier Samskara Cleared");
  else activeDebuffs.push("⚠️ Missing Liposomal Anupana Carrier");

  if (shilajit <= 10.0) activeBuffs.push("⚖️ Exempt from Artisanal Mineral Penalty");
  else if (shilajit > 25.0) activeDebuffs.push("🛑 High Mineral Surcharge Tier C (+1.5% Royalty)");

  if (guduchi >= 5.0) activeBuffs.push("🛡️ Rasayana Prameha Toxicity Shield");

  if (ciScore < 0.75) activeBuffs.push("🔥 Section 3(e) Synergism Verified");
  else if (ciScore > 1.0) activeDebuffs.push("🛑 Mere Admixture Objection Imminent (IPO §3(e))");

  // 8. Ojas Power Score
  const synergyComp = Math.max(0.0, (1.25 - ciScore) / (1.25 - 0.45)) * 4500;
  const bioComp = (bioMultiplier / 3.5) * 2200;
  const tkdlComp = (tkdlScore / 100.0) * 1800;
  const suppComp = (antiInflam / 48.5) * 1500;
  const buffBonus = activeBuffs.length * 250 - activeDebuffs.length * 400;
  const rawPower = Math.round(synergyComp + bioComp + tkdlComp + suppComp + buffBonus);
  const ojasPower = Math.max(1100, Math.min(9999, rawPower));

  // 9. Tier Assignment
  let tier: RasaTierId = "bala";
  let tierSanskrit = "बाल • BĀLA";
  let tierEnglish = "Infant / Raw Admixture";
  let starRating = 1;

  if (ojasPower >= 9200) {
    tier = "divya_rasayana";
    tierSanskrit = "दिव्य रसायन • DIVYA RASAYANA";
    tierEnglish = "Transcendent Sovereign Rejuvenator";
    starRating = 5;
  } else if (ojasPower >= 8000) {
    tier = "siddha";
    tierSanskrit = "सिद्ध • SIDDHA";
    tierEnglish = "Perfected Masterwork";
    starRating = 5;
  } else if (ojasPower >= 6500) {
    tier = "vriddha";
    tierSanskrit = "वृद्ध • VRIDDHA";
    tierEnglish = "Mature Alchemical Equilibrium";
    starRating = 4;
  } else if (ojasPower >= 5000) {
    tier = "yuvan";
    tierSanskrit = "युवन् • YUVAN";
    tierEnglish = "Active Potency Combination";
    starRating = 3;
  } else if (ojasPower >= 3500) {
    tier = "kumara";
    tierSanskrit = "कुमार • KUMĀRA";
    tierEnglish = "Nascent Combination";
    starRating = 2;
  }

  // 10. Pairwise Synergy
  const pairwiseSynergy: PairwiseSynergy[] = [
    {
      herb_a: "Haridra (Curcuma longa)",
      herb_b: "Pippali (Piper longum)",
      ci_score: pippali >= 3.0 ? 0.54 : 1.05,
      status: pippali >= 3.0 ? "Super-Additive" : "Inactive",
      mechanism: "Piperine downregulates CYP3A4 & P-gp, multiplying curcuminoid bio-absorption by 2000%.",
    },
    {
      herb_a: "Ashwagandha (Withania somnifera)",
      herb_b: "Shilajit (Asphaltum punjabianum)",
      ci_score: shilajit <= 15.0 ? 0.64 : 0.88,
      status: shilajit <= 15.0 ? "Synergistic" : "Moderate",
      mechanism: "Fulvic acid complexes with withanolides, accelerating cellular mitochondrial ATP replenishment.",
    },
    {
      herb_a: "Ashwagandha (Withania somnifera)",
      herb_b: "Cow Ghrita (A2 Lipid)",
      ci_score: ghee >= 10.0 ? 0.69 : 0.98,
      status: ghee >= 10.0 ? "Synergistic" : "Sub-optimal",
      mechanism: "Liposomal encapsulation bypasses gastric acid degradation, enhancing lymphatic uptake.",
    },
  ];

  // 11. HPLC Markers
  const hplcMarkers = [
    {
      marker: "Withanolides (Withaferin-A)",
      botanical: "Withania somnifera",
      detected: `${Math.round(ashwa * 0.13 * 100) / 100}% w/w`,
      api_spec: "Min 0.50% w/w (API Part-I Vol-I)",
      compliance: ashwa * 0.13 >= 0.5 ? "PASS" : "SUB-POTENT",
    },
    {
      marker: "Total Curcuminoids",
      botanical: "Curcuma longa",
      detected: `${Math.round(haridra * 0.95 * 100) / 100}% w/w`,
      api_spec: "Min 90.0% of extract fraction",
      compliance: haridra >= 10.0 ? "PASS" : "DEFICIENT",
    },
    {
      marker: "Piperine Bio-Catalyst",
      botanical: "Piper longum",
      detected: `${Math.round(pippali * 0.98 * 100) / 100}% w/w`,
      api_spec: "3.0% - 8.0% w/w recommended",
      compliance: 2.5 <= pippali && pippali <= 10.0 ? "OPTIMAL" : "ALERT",
    },
    {
      marker: "Fulvic Acid Fraction",
      botanical: "Asphaltum punjabianum",
      detected: `${Math.round(shilajit * 0.5 * 100) / 100}% w/w`,
      api_spec: "Max 15.0% resin burden",
      compliance: shilajit <= 15.0 ? "PASS" : "EXCESS_RESIN",
    },
  ];

  // 12. Cost Waterfall
  const costWaterfall = [
    { stage: "Raw Botanical Procurement", cost_inr: 42.0, unit: "per 500mg dose" },
    { stage: "Classical Shodhana & Samskara Processing", cost_inr: 18.5, unit: "GMP Schedule T" },
    { stage: "Standardization & HPLC Quality Control", cost_inr: 9.2, unit: "NABL Accredited" },
    { stage: `NBA Benefit-Sharing Levy (${absRoyalty}%)`, cost_inr: Math.round(140.0 * (absRoyalty / 100.0) * 100) / 100, unit: "Net Ex-Factory" },
    { stage: "Unit Ex-Factory Realization", cost_inr: 140.0, unit: "Retail MRP ₹299" },
    { stage: "Projected Net Commercial Margin", cost_inr: Math.round((140.0 - (42.0 + 18.5 + 9.2 + 140.0 * (absRoyalty / 100.0))) * 100) / 100, unit: "Healthy 43% EBITDA" },
  ];

  // 13. Patient Clinical Safety & Toxicity Hazard Evaluation
  const patientSafetyWarnings: Array<{
    herb_id: string;
    herb_name: string;
    current_dose_percent: number;
    severity: "CRITICAL" | "WARNING" | "INFO";
    hazard: string;
    clinical_manifestation: string;
    affected_populations: string[];
    safe_limit: string;
  }> = [];

  if (pippali > 8.0) {
    patientSafetyWarnings.push({
      herb_id: "pippali",
      herb_name: "Pippali (Piper longum)",
      current_dose_percent: pippali,
      severity: "CRITICAL",
      hazard: "Gastric Mucosal Hyperacidity & CYP3A4 Hepatic Inhibition",
      clinical_manifestation: "Severe epigastric burning, reflux, and dangerous elevation of co-administered prescription drug serum levels (statins, warfarin, calcium channel blockers).",
      affected_populations: ["Patients with GERD or active peptic ulcers", "Patients on prescription anticoagulants/cardiac drugs"],
      safe_limit: "API Standard: Max 3.0% - 6.0% w/w (<= 500mg/day)",
    });
  } else if (pippali > 6.0) {
    patientSafetyWarnings.push({
      herb_id: "pippali",
      herb_name: "Pippali (Piper longum)",
      current_dose_percent: pippali,
      severity: "WARNING",
      hazard: "Elevated Thermogenic Agni & Minor GI Irritation",
      clinical_manifestation: "Mild heartburn and increased Pitta dosha in susceptible individuals.",
      affected_populations: ["Individuals with Paittika constitution"],
      safe_limit: "Recommended: <= 5.0% w/w",
    });
  }

  if (ashwa > 45.0) {
    patientSafetyWarnings.push({
      herb_id: "ashwagandha",
      herb_name: "Ashwagandha (Withania somnifera)",
      current_dose_percent: ashwa,
      severity: "WARNING",
      hazard: "Excessive CNS Sedation & Thyroid Over-Stimulation",
      clinical_manifestation: "Daytime lethargy, marked somnolence, elevated free T3/T4 thyroid hormone levels, and gastrointestinal cramps.",
      affected_populations: ["Patients with Hyperthyroidism", "Operators of heavy machinery", "Pregnant individuals (uterine spasm risk)"],
      safe_limit: "API Part-I: Max 30.0% - 40.0% w/w in multi-herb compounded extracts",
    });
  }

  if (shilajit > 20.0) {
    patientSafetyWarnings.push({
      herb_id: "shilajit",
      herb_name: "Shilajit (Asphaltum punjabianum)",
      current_dose_percent: shilajit,
      severity: "CRITICAL",
      hazard: "Fulvic-Mineral Surcharge & Hyperuricemia Exacerbation",
      clinical_manifestation: "Elevated serum uric acid triggering acute gout attacks; renal microvascular strain from excessive mineral resin burden.",
      affected_populations: ["Patients with active gout / hyperuricemia", "Renal insufficiency patients", "Patients with hypotensive tendency"],
      safe_limit: "Ayurvedic Pharmacopoeia: Max 10.0% - 15.0% w/w (100 - 250mg per unit dose)",
    });
  }

  if (haridra > 35.0) {
    patientSafetyWarnings.push({
      herb_id: "haridra",
      herb_name: "Haridra (Curcuma longa)",
      current_dose_percent: haridra,
      severity: "WARNING",
      hazard: "Biliary Hyper-Contraction & Antiplatelet Aggregation",
      clinical_manifestation: "Severe biliary colic in patients with undiagnosed gallstones; increased bleeding tendency in perioperative settings.",
      affected_populations: ["Patients with Cholelithiasis (gallstones)", "Patients scheduled for elective surgery (discontinue 14 days prior)"],
      safe_limit: "Max 25.0% - 30.0% w/w in concentrated extracts",
    });
  }

  if (guggulu > 25.0) {
    patientSafetyWarnings.push({
      herb_id: "guggulu",
      herb_name: "Guggulu (Commiphora mukul)",
      current_dose_percent: guggulu,
      severity: "WARNING",
      hazard: "Cutaneous Allergic Dermatitis & Uterine Tone Stimulation",
      clinical_manifestation: "Maculopapular allergic skin eruptions, diarrhea, and mild uterine cramping.",
      affected_populations: ["Pregnant or lactating women", "Individuals with hypersensitive dermatological history"],
      safe_limit: "Max 15.0% - 20.0% w/w",
    });
  }

  if (guduchi > 25.0) {
    patientSafetyWarnings.push({
      herb_id: "guduchi",
      herb_name: "Guduchi (Tinospora cordifolia)",
      current_dose_percent: guduchi,
      severity: "INFO",
      hazard: "Enhanced Hypoglycemic Potentiation",
      clinical_manifestation: "Risk of excessive blood glucose drops when administered alongside oral anti-diabetic agents or insulin.",
      affected_populations: ["Diabetic patients on pharmacological hypoglycemia therapies"],
      safe_limit: "Max 15.0% - 20.0% w/w",
    });
  }

  if (brahmi > 30.0) {
    patientSafetyWarnings.push({
      herb_id: "brahmi",
      herb_name: "Brahmi (Bacopa monnieri)",
      current_dose_percent: brahmi,
      severity: "INFO",
      hazard: "Vagal Autonomic Activation & Bradycardia",
      clinical_manifestation: "Slowed resting heart rate, increased gastrointestinal secretions, occasional nausea on empty stomach.",
      affected_populations: ["Patients with baseline sinus bradycardia or conduction delays"],
      safe_limit: "Max 20.0% - 25.0% w/w",
    });
  }

  let overallSafetyRating: "EXCELLENT" | "MODERATE_CAUTION" | "HIGH_TOXICITY_RISK" = "EXCELLENT";
  if (patientSafetyWarnings.some((w) => w.severity === "CRITICAL")) {
    overallSafetyRating = "HIGH_TOXICITY_RISK";
  } else if (patientSafetyWarnings.some((w) => w.severity === "WARNING")) {
    overallSafetyRating = "MODERATE_CAUTION";
  }

  // 14. Medicine Quality & Patentability Correlation Scores
  // Medicine Quality: 0 - 100
  let qualityBase = 40;
  qualityBase += Math.min(bioMultiplier * 14, 35);
  qualityBase += Math.min((antiInflam / 48.5) * 25, 25);
  if (isBalanced) qualityBase += 8;
  qualityBase += activeBuffs.length * 3 - activeDebuffs.length * 4;
  if (patientSafetyWarnings.some((w) => w.severity === "CRITICAL")) qualityBase -= 14;
  const medicineQualityScore = Math.max(12, Math.min(99, Math.round(qualityBase)));

  // Patentability Scope: 0 - 100
  let patentScore = 30;
  if (ciScore < 0.75) {
    patentScore = 88 + Math.round((0.75 - ciScore) * 30);
  } else if (ciScore <= 0.95) {
    patentScore = 72 + Math.round((0.95 - ciScore) * 40);
  } else if (ciScore <= 1.05) {
    patentScore = 48 + Math.round((1.05 - ciScore) * 50);
  } else {
    patentScore = Math.max(15, 38 - Math.round((ciScore - 1.05) * 40));
  }
  if (ghee >= 8.0) patentScore += 6; // Novel lipid vehicle
  if (pippali >= 3.0 && pippali <= 6.0) patentScore += 4; // Proven bio-catalyst ratio
  const patentabilityScopeScore = Math.max(10, Math.min(98, Math.round(patentScore)));

  // Dynamic Deltas
  const qualityDelta = Math.round((medicineQualityScore - 62) * 10) / 10;
  const patentabilityDelta = Math.round((patentabilityScopeScore - 52) * 10) / 10;
  const qualityTrend: "SURGE" | "STABLE" | "DECLINE" =
    qualityDelta > 4 ? "SURGE" : qualityDelta < -4 ? "DECLINE" : "STABLE";
  const patentabilityTrend: "SURGE" | "STABLE" | "DECLINE" =
    patentabilityDelta > 4 ? "SURGE" : patentabilityDelta < -4 ? "DECLINE" : "STABLE";

  // Strategic Quadrant
  let quadrant: "GOLDEN_SYNERGY" | "CLASSICAL_TRAP" | "MERE_ADMIXTURE" | "NOVEL_DEFICIENT" =
    "MERE_ADMIXTURE";
  let quadrantLabel = "Unpatentable Mere Admixture (§3(e) Bar)";
  let quadrantDescription =
    "Linear addition of known botanicals without synergistic non-obviousness. High likelihood of statutory rejection.";

  if (medicineQualityScore >= 70 && patentabilityScopeScore >= 68) {
    quadrant = "GOLDEN_SYNERGY";
    quadrantLabel = "Golden Quadrant (Novel Synergistic Formulation)";
    quadrantDescription =
      "Super-additive pharmacodynamics legally overcome Section 3(e) with proven clinical bioavailability and high grant probability.";
  } else if (medicineQualityScore >= 70 && patentabilityScopeScore < 68) {
    quadrant = "CLASSICAL_TRAP";
    quadrantLabel = "Classical Prior Art Trap (§3(p) Bar)";
    quadrantDescription =
      "High therapeutic value, but vulnerable to anticipation under Section 3(p) / Traditional Knowledge Digital Library (TKDL) citations.";
  } else if (medicineQualityScore < 70 && patentabilityScopeScore >= 68) {
    quadrant = "NOVEL_DEFICIENT";
    quadrantLabel = "Novel but Clinically Deficient";
    quadrantDescription =
      "Unusual ratio achieves distance from prior art, but lacks balanced botanical co-factors or optimal therapeutic synergy.";
  }

  // 15. Pros and Cons Breakdown
  const pros: string[] = [];
  const cons: string[] = [];

  if (ciScore < 0.75) {
    pros.push(`Super-Additive Synergy (CI: ${ciScore}): Meets strict experimental threshold of Section 3(e) Indian Patent Act.`);
  } else if (ciScore <= 0.95) {
    pros.push(`Statistically Significant Synergy (CI: ${ciScore}): Evidence supports non-obvious biological interaction.`);
  } else {
    cons.push(`Section 3(e) Mere Admixture Risk: Chou-Talalay CI (${ciScore}) indicates linear or sub-additive interaction.`);
  }

  if (bioMultiplier >= 2.0) {
    pros.push(`Bio-Availability Multiplier ${bioMultiplier}x: Active constituents achieve elevated serum absorption via Yogavāhī dynamics.`);
  } else if (pippali === 0) {
    cons.push("Missing Yogavāhī Bio-Catalyst: Lacks Piperine or equivalent driver to maximize intestinal active absorption.");
  }

  if (ghee >= 8.0) {
    pros.push("Liposomal Lipid Delivery Samskara: Protects acid-labile polyphenols against gastric enzymatic degradation.");
  } else {
    cons.push("Lack of Lipid Carrier Vehicle: Unprotected polyphenols face high first-pass hepatic metabolism.");
  }

  if (shilajit <= 15.0 && shilajit > 0) {
    pros.push("Safe Mineral Resin Ratio: Fulvic acid enhances cellular ATP without triggering heavy-metal scrutiny.");
  } else if (shilajit > 20.0) {
    cons.push("Excessive Mineral Resin Burden: High Shilajit concentration incurs 5% NBA ABS royalty and elevated uric acid warning.");
  }

  if (ashwa > 45.0) {
    cons.push("Excess Adaptogenic Load: High Withanolide concentration may induce drowsiness and thyroid hyper-stimulation.");
  }

  if (isBalanced) {
    pros.push("Stoichiometric Equilibrium: Total constituents equal 100.0% w/w with validated batch uniformity.");
  } else {
    cons.push(`Unbalanced Stoichiometry: Total constituent ratio is ${totalRatio}% (target is exactly 100.0%).`);
  }

  // 16. Actionable Optimization Directives: How to Improve / What to Remove
  const howToImprove: Array<{
    text: string;
    action_type: "add" | "increase" | "decrease" | "remove";
    herb_id: string;
    target_ratio: number;
  }> = [];

  const whatToRemove: Array<{
    text: string;
    action_type: "add" | "increase" | "decrease" | "remove";
    herb_id: string;
    target_ratio: number;
  }> = [];

  if (pippali === 0) {
    howToImprove.push({
      text: "Add 5.0% Pippali (Piper longum) to ignite 2.2x Yogavāhī bio-availability and drop CI score into Section 3(e) cleared zone.",
      action_type: "add",
      herb_id: "pippali",
      target_ratio: 5.0,
    });
  } else if (pippali < 3.0) {
    howToImprove.push({
      text: "Increase Pippali to 4.5% to reach full therapeutic bioavailability threshold for Curcuminoids.",
      action_type: "increase",
      herb_id: "pippali",
      target_ratio: 4.5,
    });
  } else if (pippali > 7.0) {
    whatToRemove.push({
      text: "Reduce Pippali to 5.0% to resolve gastric mucosal irritation and prevent CYP3A4 enzyme inhibition.",
      action_type: "decrease",
      herb_id: "pippali",
      target_ratio: 5.0,
    });
  }

  if (ghee < 8.0) {
    howToImprove.push({
      text: "Increase Cow Ghrita to 10.0% to establish lipid-carrier protection against gastric degradation.",
      action_type: "increase",
      herb_id: "ghee",
      target_ratio: 10.0,
    });
  }

  if (shilajit > 18.0) {
    whatToRemove.push({
      text: "Reduce Shilajit to 12.0% to eliminate high uric acid warning and downgrade NBA ABS levy from 5% to 3.5%.",
      action_type: "decrease",
      herb_id: "shilajit",
      target_ratio: 12.0,
    });
  }

  if (ashwa > 40.0) {
    whatToRemove.push({
      text: "Reduce Ashwagandha to 32.0% to prevent adaptogenic receptor saturation and eliminate somnolence warnings.",
      action_type: "decrease",
      herb_id: "ashwagandha",
      target_ratio: 32.0,
    });
  }

  if (guduchi === 0 && shilajit > 10.0) {
    howToImprove.push({
      text: "Add 5.0% Guduchi (Tinospora cordifolia) to act as a Rasayana shield against mineral oxidation.",
      action_type: "add",
      herb_id: "guduchi",
      target_ratio: 5.0,
    });
  }

  // 17. Suggestions
  const suggestions: string[] = [];
  if (howToImprove.length > 0) {
    suggestions.push(howToImprove[0].text);
  }
  if (whatToRemove.length > 0) {
    suggestions.push(whatToRemove[0].text);
  }
  if (suggestions.length === 0) {
    suggestions.push("Formulation has attained optimal stoichiometric balance and statutory Section 3(e) clearance.");
  }

  return {
    title,
    total_ratio: totalRatio,
    is_balanced: isBalanced,
    chou_talalay_ci: ciScore,
    ci_interpretation: ciInterpretation,
    sec_3e_status: sec3eStatus,
    bioavailability_multiplier: bioMultiplier,
    anti_inflammatory_suppression: antiInflam,
    ojas_power_score: ojasPower,
    medicine_quality_score: medicineQualityScore,
    patentability_scope_score: patentabilityScopeScore,
    quality_delta: qualityDelta,
    patentability_delta: patentabilityDelta,
    quality_trend: qualityTrend,
    patentability_trend: patentabilityTrend,
    quadrant,
    quadrant_label: quadrantLabel,
    quadrant_description: quadrantDescription,
    pros,
    cons,
    how_to_improve: howToImprove,
    what_to_remove: whatToRemove,
    patient_safety_warnings: patientSafetyWarnings,
    overall_safety_rating: overallSafetyRating,
    tier,
    tier_sanskrit: tierSanskrit,
    tier_english: tierEnglish,
    star_rating: starRating,
    tkdl_concordance_score: tkdlScore,
    tkdl_shloka_match: shlokaMatch,
    nba_abs_royalty_percentage: absRoyalty,
    nba_form_tier: nbaTier,
    tridosha_balance: tridoshaBalance,
    active_buffs: activeBuffs,
    active_debuffs: activeDebuffs,
    pairwise_synergy: pairwiseSynergy,
    hplc_markers: hplcMarkers,
    cost_waterfall: costWaterfall,
    suggestions,
  };
}
