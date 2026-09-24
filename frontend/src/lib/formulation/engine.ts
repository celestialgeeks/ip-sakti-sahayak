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

  // 13. Suggestions
  const suggestions: string[] = [];
  if (pippali === 0.0) {
    suggestions.push("Add Pippali (Piper longum) 5% → Ignites Yogavāhī bio-availability & cuts Section 3(e) CI score by -0.32.");
  }
  if (shilajit > 20.0 && guduchi < 5.0) {
    suggestions.push("Add Guduchi (Tinospora cordifolia) 5% → Neutralizes Shilajit mineral burden & grants NBA Fast-Track tier.");
  }
  if (ashwa > 40.0 && ghee < 10.0) {
    suggestions.push("Increase Cow Ghrita to 15% → Balances high Withanolide agni and fulfills Charaka Samhita vehicle requirement.");
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
