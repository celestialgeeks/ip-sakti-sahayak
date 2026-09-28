import type {
  BotanicalItem,
  IngredientRatio,
  SimulationResult,
  RasaTierId,
  PairwiseSynergy,
  HerbLayer,
  IngredientContribution,
  Directive,
  OptimizationDirective,
} from "./types.ts";
import { DEFAULT_BOTANICALS } from "./defaults.ts";

/* ─────────────────────────────────────────────────────────────────────────────
 * MIRROR OF backend/app/core/formulation/engine.py — do not diverge.
 * tests/engine_parity.test.ts asserts this file reproduces the committed
 * fixture generated from the Python engine (spec §5.3.4). Deterministic
 * half-up rounding helpers below behave identically in both languages.
 * ──────────────────────────────────────────────────────────────────────────── */

const r2 = (x: number): number => Math.floor(x * 100 + 0.5) / 100;
const r1 = (x: number): number => Math.floor(x * 10 + 0.5) / 10;
const r0 = (x: number): number => Math.floor(x + 0.5);

/** Python-style float formatting for interpolated display strings (3 -> "3.0"). */
const pyFloat = (x: number): string => (Number.isInteger(x) ? `${x}.0` : `${x}`);

const SAH_CARAKA_EXPLICIT = new Set(["guduchi", "amla"]);

export function layerFor(herb: BotanicalItem | undefined): HerbLayer {
  if (!herb) return "supportive";
  if (herb.is_mineral_resin) return "resin_bhasma";
  if (herb.category === "bio_enhancer") return "yogavahi";
  if (herb.category === "carrier") return "anupana";
  if (SAH_CARAKA_EXPLICIT.has(herb.id) || herb.category === "digestive") return "sah_caraka";
  if (["adaptogen", "anti_inflammatory", "medhya"].includes(herb.category)) return "arthin";
  return "supportive";
}

const LEGACY_SAFETY_IDS = new Set([
  "pippali",
  "ashwagandha",
  "shilajit",
  "haridra",
  "guggulu",
  "guduchi",
  "brahmi",
]);

const LEGACY_SAFE_TARGET: Record<string, number> = {
  pippali: 5.0,
  ashwagandha: 32.0,
  shilajit: 12.0,
  haridra: 30.0,
  guggulu: 20.0,
  guduchi: 20.0,
  brahmi: 25.0,
};

interface SafetyWarning {
  herb_id: string;
  herb_name: string;
  current_dose_percent: number;
  severity: "CRITICAL" | "WARNING" | "INFO";
  hazard: string;
  clinical_manifestation: string;
  affected_populations: string[];
  safe_limit: string;
}

interface CoreScores {
  total_ratio: number;
  is_balanced: boolean;
  chou_talalay_ci: number;
  ci_interpretation: string;
  sec_3e_status: "CLEARED" | "BORDERLINE" | "REJECTED";
  bioavailability_multiplier: number;
  anti_inflammatory_suppression: number;
  nba_abs_royalty_percentage: number;
  nba_form_tier: string;
  tkdl_concordance_score: number;
  tkdl_shloka_match: string;
  tridosha_balance: { vata: number; pitta: number; kapha: number };
  active_buffs: string[];
  active_debuffs: string[];
  layers_present: string[];
  ojas_power_score: number;
  tier: RasaTierId;
  tier_sanskrit: string;
  tier_english: string;
  star_rating: number;
  patient_safety_warnings: SafetyWarning[];
  overall_safety_rating: "EXCELLENT" | "MODERATE_CAUTION" | "HIGH_TOXICITY_RISK";
  medicine_quality_score: number;
  patentability_scope_score: number;
  quadrant: "GOLDEN_SYNERGY" | "CLASSICAL_TRAP" | "MERE_ADMIXTURE" | "NOVEL_DEFICIENT";
  quadrant_label: string;
  quadrant_description: string;
  cost_per_unit: number;
}

export function scoreCore(
  ratios: Record<string, number>,
  entityType: "domestic" | "foreign",
  botanicals: BotanicalItem[]
): CoreScores {
  const herbById = new Map(botanicals.map((b) => [b.id, b]));
  const get = (id: string): number => ratios[id] ?? 0.0;
  const ashwa = get("ashwagandha");
  const shilajit = get("shilajit");
  const haridra = get("haridra");
  const pippali = get("pippali");
  const ghee = get("ghee");
  const guduchi = get("guduchi");
  const brahmi = get("brahmi");
  const guggulu = get("guggulu");
  const shallaki = get("shallaki");
  const neem = get("neem");
  const tulsi = get("tulsi");

  const totalRatio = r2(Object.values(ratios).reduce((s, v) => s + v, 0));
  const isBalanced = Math.abs(totalRatio - 100.0) < 0.1;

  // 1. Chou-Talalay Combination Index (CI)
  let baseCi = 1.15;
  if (pippali > 0.5) baseCi -= Math.min(pippali / 5.0, 1.2) * 0.32;
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

  const ciScore = r2(Math.max(0.42, Math.min(1.35, baseCi)));

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
  bioMultiplier = r1(bioMultiplier);

  // 3. Anti-inflammatory NF-kB suppression
  let antiInflam =
    haridra * 0.48 + guggulu * 0.42 + ashwa * 0.22 + shallaki * 0.4 + neem * 0.3 + tulsi * 0.25;
  if (pippali >= 3.0) antiInflam *= 1.35;
  antiInflam = r1(Math.min(antiInflam, 48.5));

  // 4. NBA ABS Royalty
  let absRoyalty = 3.5;
  let nbaTier = "Fast-Track Category B (Form III)";
  if (entityType === "foreign") {
    absRoyalty = 5.0;
    nbaTier = "Form I (Prior Approval for Foreign Participation)";
  } else if (shilajit >= 25.0 || guggulu >= 25.0) {
    absRoyalty = 5.0;
    nbaTier = "High-Scrutiny Public Hearing (High Mineral/Threatened Burden)";
  } else if (shilajit <= 10.0 && guggulu <= 10.0) {
    absRoyalty = 3.0;
    nbaTier = "Fast-Track Form III (Low Mineral Liability)";
  }

  // 5. TKDL Concordance — Guduchi dilutes concordance
  let tkdlScore = 75;
  let shlokaMatch = "Charaka Samhita Chikitsasthanam 28 (Vatavyadhi Chikitsa)";
  if (ashwa >= 25.0 && shilajit >= 5.0 && ghee >= 10.0) {
    tkdlScore = 92 - Math.min(Math.floor(guduchi * 0.6), 10);
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

  // Layer coverage
  const layersPresent = new Set<string>();
  for (const [hid, r] of Object.entries(ratios)) {
    if (r <= 0) continue;
    const lyr = layerFor(herbById.get(hid));
    if (lyr !== "supportive") layersPresent.add(lyr);
  }
  const layerBonus = (layersPresent.size - 3) * 2.0;

  // 8. Ojas Power Score
  const synergyComp = Math.max(0.0, (1.25 - ciScore) / (1.25 - 0.45)) * 4500;
  const bioComp = (bioMultiplier / 3.5) * 2200;
  const tkdlComp = (tkdlScore / 100.0) * 1800;
  const suppComp = (antiInflam / 48.5) * 1500;
  const buffBonus = activeBuffs.length * 250 - activeDebuffs.length * 400;
  const ojasPower = Math.max(1100, Math.min(9999, r0(synergyComp + bioComp + tkdlComp + suppComp + buffBonus)));

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

  // 13. Patient safety — legacy rules then generic ceiling rules
  const warnings: SafetyWarning[] = [];

  if (pippali > 8.0) {
    warnings.push({
      herb_id: "pippali",
      herb_name: "Pippali (Piper longum)",
      current_dose_percent: pippali,
      severity: "CRITICAL",
      hazard: "Gastric Mucosal Hyperacidity & CYP3A4 Hepatic Inhibition",
      clinical_manifestation:
        "Severe epigastric burning, reflux, and dangerous elevation of co-administered prescription drug serum levels (statins, warfarin, calcium channel blockers).",
      affected_populations: [
        "Patients with GERD or active peptic ulcers",
        "Patients on prescription anticoagulants/cardiac drugs",
      ],
      safe_limit: "API Standard: Max 3.0% - 6.0% w/w (<= 500mg/day)",
    });
  } else if (pippali > 6.0) {
    warnings.push({
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
    warnings.push({
      herb_id: "ashwagandha",
      herb_name: "Ashwagandha (Withania somnifera)",
      current_dose_percent: ashwa,
      severity: "WARNING",
      hazard: "Excessive CNS Sedation & Thyroid Over-Stimulation",
      clinical_manifestation:
        "Daytime lethargy, marked somnolence, elevated free T3/T4 thyroid hormone levels, and gastrointestinal cramps.",
      affected_populations: [
        "Patients with Hyperthyroidism",
        "Operators of heavy machinery",
        "Pregnant individuals (uterine spasm risk)",
      ],
      safe_limit: "API Part-I: Max 30.0% - 40.0% w/w in multi-herb compounded extracts",
    });
  }

  if (shilajit > 20.0) {
    warnings.push({
      herb_id: "shilajit",
      herb_name: "Shilajit (Asphaltum punjabianum)",
      current_dose_percent: shilajit,
      severity: "CRITICAL",
      hazard: "Fulvic-Mineral Surcharge & Hyperuricemia Exacerbation",
      clinical_manifestation:
        "Elevated serum uric acid triggering acute gout attacks; renal microvascular strain from excessive mineral resin burden.",
      affected_populations: [
        "Patients with active gout / hyperuricemia",
        "Renal insufficiency patients",
        "Patients with hypotensive tendency",
      ],
      safe_limit: "Ayurvedic Pharmacopoeia: Max 10.0% - 15.0% w/w (100 - 250mg per unit dose)",
    });
  }

  if (haridra > 35.0) {
    warnings.push({
      herb_id: "haridra",
      herb_name: "Haridra (Curcuma longa)",
      current_dose_percent: haridra,
      severity: "WARNING",
      hazard: "Biliary Hyper-Contraction & Antiplatelet Aggregation",
      clinical_manifestation:
        "Severe biliary colic in patients with undiagnosed gallstones; increased bleeding tendency in perioperative settings.",
      affected_populations: [
        "Patients with Cholelithiasis (gallstones)",
        "Patients scheduled for elective surgery (discontinue 14 days prior)",
      ],
      safe_limit: "Max 25.0% - 30.0% w/w in concentrated extracts",
    });
  }

  if (guggulu > 25.0) {
    warnings.push({
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
    warnings.push({
      herb_id: "guduchi",
      herb_name: "Guduchi (Tinospora cordifolia)",
      current_dose_percent: guduchi,
      severity: "INFO",
      hazard: "Enhanced Hypoglycemic Potentiation",
      clinical_manifestation:
        "Risk of excessive blood glucose drops when administered alongside oral anti-diabetic agents or insulin.",
      affected_populations: ["Diabetic patients on pharmacological hypoglycemia therapies"],
      safe_limit: "Max 15.0% - 20.0% w/w",
    });
  }

  if (brahmi > 30.0) {
    warnings.push({
      herb_id: "brahmi",
      herb_name: "Brahmi (Bacopa monnieri)",
      current_dose_percent: brahmi,
      severity: "WARNING",
      hazard: "Vagal Autonomic Activation & Bradycardia",
      clinical_manifestation:
        "Slowed resting heart rate, increased gastrointestinal secretions, occasional nausea on empty stomach.",
      affected_populations: ["Patients with baseline sinus bradycardia or conduction delays"],
      safe_limit: "Max 20.0% - 25.0% w/w",
    });
  }

  for (const hid of Object.keys(ratios).sort()) {
    const r = ratios[hid];
    if (LEGACY_SAFETY_IDS.has(hid) || r <= 0) continue;
    const herb = herbById.get(hid);
    if (!herb || herb.safety_ceiling_percent == null) continue;
    const ceiling = herb.safety_ceiling_percent;
    if (r > ceiling) {
      const severity: "CRITICAL" | "WARNING" = r > ceiling * 1.5 ? "CRITICAL" : "WARNING";
      const refHead = herb.classical_reference ? herb.classical_reference.split(" / ")[0] : "API";
      warnings.push({
        herb_id: hid,
        herb_name: `${herb.common_name} (${herb.botanical_name})`,
        current_dose_percent: r,
        severity,
        hazard: `Exceeds ${refHead} safety ceiling of ${ceiling}% w/w`,
        clinical_manifestation: `${herb.common_name} above ${ceiling}% w/w risks dose-dependent adverse effects documented in the Ayurvedic Pharmacopoeia of India; reduce toward the ${ceiling}% ceiling.`,
        affected_populations: ["General population at therapeutic dosing"],
        safe_limit: `Max ${ceiling}% w/w`,
      });
    }
  }

  let overallSafetyRating: "EXCELLENT" | "MODERATE_CAUTION" | "HIGH_TOXICITY_RISK" = "EXCELLENT";
  if (warnings.some((w) => w.severity === "CRITICAL")) overallSafetyRating = "HIGH_TOXICITY_RISK";
  else if (warnings.some((w) => w.severity === "WARNING")) overallSafetyRating = "MODERATE_CAUTION";

  // 14. Quality & Patentability
  let qualityBase = 32.0;
  qualityBase += Math.min(bioMultiplier * 10.0, 30.0);
  qualityBase += Math.min((antiInflam / 48.5) * 22.0, 22.0);
  if (isBalanced) qualityBase += 8.0;
  qualityBase += activeBuffs.length * 3.0 - activeDebuffs.length * 5.0;
  qualityBase += layerBonus;
  if (warnings.some((w) => w.severity === "CRITICAL")) qualityBase -= 14.0;
  else if (warnings.some((w) => w.severity === "WARNING")) qualityBase -= 6.0;
  const medicineQualityScore = Math.max(12, Math.min(99, r0(qualityBase)));

  let patentScore = 30.0;
  if (ciScore < 0.75) patentScore = 88.0 + (0.75 - ciScore) * 30.0;
  else if (ciScore <= 0.95) patentScore = 72.0 + (0.95 - ciScore) * 40.0;
  else if (ciScore <= 1.05) patentScore = 48.0 + (1.05 - ciScore) * 50.0;
  else patentScore = Math.max(15.0, 38.0 - (ciScore - 1.05) * 40.0);
  if (ghee >= 8.0) patentScore += 6.0;
  if (pippali >= 3.0 && pippali <= 6.0) patentScore += 4.0;
  const patentabilityScopeScore = Math.max(10, Math.min(98, r0(patentScore)));

  let quadrant: CoreScores["quadrant"] = "MERE_ADMIXTURE";
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

  const costPerUnit = r2(42.0 + 18.5 + 9.2 + 140.0 * (absRoyalty / 100.0));

  return {
    total_ratio: totalRatio,
    is_balanced: isBalanced,
    chou_talalay_ci: ciScore,
    ci_interpretation: ciInterpretation,
    sec_3e_status: sec3eStatus,
    bioavailability_multiplier: bioMultiplier,
    anti_inflammatory_suppression: antiInflam,
    nba_abs_royalty_percentage: absRoyalty,
    nba_form_tier: nbaTier,
    tkdl_concordance_score: tkdlScore,
    tkdl_shloka_match: shlokaMatch,
    tridosha_balance: tridoshaBalance,
    active_buffs: activeBuffs,
    active_debuffs: activeDebuffs,
    layers_present: [...layersPresent].sort(),
    ojas_power_score: ojasPower,
    tier,
    tier_sanskrit: tierSanskrit,
    tier_english: tierEnglish,
    star_rating: starRating,
    patient_safety_warnings: warnings,
    overall_safety_rating: overallSafetyRating,
    medicine_quality_score: medicineQualityScore,
    patentability_scope_score: patentabilityScopeScore,
    quadrant,
    quadrant_label: quadrantLabel,
    quadrant_description: quadrantDescription,
    cost_per_unit: costPerUnit,
  };
}

/* ── Per-ingredient attribution (mirror of compute_contributions) ─────────── */
function computeContributions(
  ratios: Record<string, number>,
  entityType: "domestic" | "foreign",
  botanicals: BotanicalItem[],
  warnings: SafetyWarning[]
): IngredientContribution[] {
  const herbById = new Map(botanicals.map((b) => [b.id, b]));
  const out: IngredientContribution[] = [];
  for (const herbId of Object.keys(ratios).sort()) {
    const r = ratios[herbId];
    if (r <= 0) continue;
    const up: Record<string, number> = { ...ratios, [herbId]: r2(r + 1.0) };
    const down: Record<string, number> = { ...ratios, [herbId]: r2(Math.max(0.0, r - 1.0)) };
    const sUp = scoreCore(up, entityType, botanicals);
    const sDown = scoreCore(down, entityType, botanicals);

    const qDelta = r1((sUp.medicine_quality_score - sDown.medicine_quality_score) / 2.0);
    const ciDelta = r2((sUp.chou_talalay_ci - sDown.chou_talalay_ci) / 2.0);
    const patDelta = r1((sUp.patentability_scope_score - sDown.patentability_scope_score) / 2.0);
    const royDelta = r2((sUp.nba_abs_royalty_percentage - sDown.nba_abs_royalty_percentage) / 2.0);
    const costDelta = r2((sUp.cost_per_unit - sDown.cost_per_unit) / 2.0);

    const herb = herbById.get(herbId);
    const layer = layerFor(herb);
    const herbName = herb ? `${herb.common_name} (${herb.botanical_name})` : herbId;

    const warning = warnings.find((w) => w.herb_id === herbId);
    let state: IngredientContribution["state"] = "positive";
    let blockingReason: string | null = null;
    if (warning && (warning.severity === "CRITICAL" || warning.severity === "WARNING")) {
      state = "blocking";
      blockingReason = "safety_ceiling";
    } else if (qDelta <= -0.1 || ciDelta >= 0.01 || patDelta <= -0.1 || royDelta >= 0.25) {
      state = "negative";
    }

    let fix: Directive | null = null;
    if (state === "blocking" && warning) {
      let target = LEGACY_SAFE_TARGET[herbId];
      if (target == null && herb && herb.safety_ceiling_percent != null) {
        target = herb.safety_ceiling_percent;
      }
      if (target != null && r > target) {
        fix = {
          action_type: "decrease",
          herb_id: herbId,
          target_ratio: target,
          text: `Reduce ${herbName} to ${target}% w/w`,
        };
      }
    } else if (state === "negative" && r > 1.0) {
      fix = {
        action_type: "decrease",
        herb_id: herbId,
        target_ratio: r1(Math.max(0.0, r - 1.0)),
        text: `Reduce ${herbName} by 1.0% w/w`,
      };
    }

    out.push({
      herb_id: herbId,
      herb_name: herbName,
      ratio: r,
      layer,
      quality_delta: qDelta,
      ci_delta: ciDelta,
      patentability_delta: patDelta,
      royalty_delta: royDelta,
      cost_delta: costDelta,
      state,
      blocking_reason: blockingReason,
      fix,
    });
  }
  return out;
}

function projectedImpact(
  ratios: Record<string, number>,
  entityType: "domestic" | "foreign",
  botanicals: BotanicalItem[],
  actionType: string,
  herbId: string,
  targetRatio: number,
  base: CoreScores
): string {
  const trial = { ...ratios };
  if (actionType === "remove") delete trial[herbId];
  else trial[herbId] = targetRatio;
  const s = scoreCore(trial, entityType, botanicals);
  const dq = s.medicine_quality_score - base.medicine_quality_score;
  return (
    `Quality ${base.medicine_quality_score}` +
    (dq ? ` → ${s.medicine_quality_score}` : "") +
    ` · CI ${s.chou_talalay_ci}` +
    ` · §3(e) ${s.sec_3e_status}` +
    ` · TKDL ${s.tkdl_concordance_score}`
  );
}

/* ── Public entry point: instant client re-score ──────────────────────────── */
export function simulateClientFormulation(
  title: string,
  ingredients: IngredientRatio[],
  entityType: "domestic" | "foreign" = "domestic",
  botanicals: BotanicalItem[] = DEFAULT_BOTANICALS
): SimulationResult {
  const ratios: Record<string, number> = {};
  for (const ing of ingredients) {
    ratios[ing.herb_id] = Math.round(ing.ratio * 100) / 100;
  }

  const core = scoreCore(ratios, entityType, botanicals);
  const herbById = new Map(botanicals.map((b) => [b.id, b]));
  const get = (id: string): number => ratios[id] ?? 0.0;
  const ashwa = get("ashwagandha");
  const shilajit = get("shilajit");
  const haridra = get("haridra");
  const pippali = get("pippali");
  const ghee = get("ghee");
  const guduchi = get("guduchi");

  const ciScore = core.chou_talalay_ci;
  const bioMultiplier = core.bioavailability_multiplier;
  const absRoyalty = core.nba_abs_royalty_percentage;
  const tkdlScore = core.tkdl_concordance_score;

  const qualityDelta = Math.round((core.medicine_quality_score - 62) * 10) / 10;
  const patentabilityDelta = Math.round((core.patentability_scope_score - 52) * 10) / 10;
  const qualityTrend: "SURGE" | "STABLE" | "DECLINE" =
    qualityDelta > 4 ? "SURGE" : qualityDelta < -4 ? "DECLINE" : "STABLE";
  const patentabilityTrend: "SURGE" | "STABLE" | "DECLINE" =
    patentabilityDelta > 4 ? "SURGE" : patentabilityDelta < -4 ? "DECLINE" : "STABLE";

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

  const fmt2 = (x: number): string => pyFloat(Math.round(x * 100) / 100);
  const hplcMarkers = [
    {
      marker: "Withanolides (Withaferin-A)",
      botanical: "Withania somnifera",
      detected: `${fmt2(ashwa * 0.13)}% w/w`,
      api_spec: "Min 0.50% w/w (API Part-I Vol-I)",
      compliance: ashwa * 0.13 >= 0.5 ? "PASS" : "SUB-POTENT",
    },
    {
      marker: "Total Curcuminoids",
      botanical: "Curcuma longa",
      detected: `${fmt2(haridra * 0.95)}% w/w`,
      api_spec: "Min 90.0% of extract fraction",
      compliance: haridra >= 10.0 ? "PASS" : "DEFICIENT",
    },
    {
      marker: "Piperine Bio-Catalyst",
      botanical: "Piper longum",
      detected: `${fmt2(pippali * 0.98)}% w/w`,
      api_spec: "3.0% - 8.0% w/w recommended",
      compliance: 2.5 <= pippali && pippali <= 10.0 ? "OPTIMAL" : "ALERT",
    },
    {
      marker: "Fulvic Acid Fraction",
      botanical: "Asphaltum punjabianum",
      detected: `${fmt2(shilajit * 0.5)}% w/w`,
      api_spec: "Max 15.0% resin burden",
      compliance: shilajit <= 15.0 ? "PASS" : "EXCESS_RESIN",
    },
  ];

  const costWaterfall = [
    { stage: "Raw Botanical Procurement", cost_inr: 42.0, unit: "per 500mg dose" },
    { stage: "Classical Shodhana & Samskara Processing", cost_inr: 18.5, unit: "GMP Schedule T" },
    { stage: "Standardization & HPLC Quality Control", cost_inr: 9.2, unit: "NABL Accredited" },
    {
      stage: `NBA Benefit-Sharing Levy (${pyFloat(absRoyalty)}%)`,
      cost_inr: Math.round(140.0 * (absRoyalty / 100.0) * 100) / 100,
      unit: "Net Ex-Factory",
    },
    { stage: "Unit Ex-Factory Realization", cost_inr: 140.0, unit: "Retail MRP ₹299" },
    {
      stage: "Projected Net Commercial Margin",
      cost_inr: Math.round((140.0 - core.cost_per_unit) * 100) / 100,
      unit: "Healthy 43% EBITDA",
    },
  ];

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
  if (shilajit > 0 && shilajit <= 15.0) {
    pros.push("Safe Mineral Resin Ratio: Fulvic acid enhances cellular ATP without triggering heavy-metal scrutiny.");
  } else if (shilajit > 20.0) {
    cons.push("Excessive Mineral Resin Burden: High Shilajit concentration incurs 5% NBA ABS royalty and elevated uric acid warning.");
  }
  if (ashwa > 45.0) {
    cons.push("Excess Adaptogenic Load: High Withanolide concentration may induce drowsiness and thyroid hyper-stimulation.");
  }
  if (core.is_balanced) {
    pros.push("Stoichiometric Equilibrium: Total constituents equal 100.0% w/w with validated batch uniformity.");
  } else {
    cons.push(`Unbalanced Stoichiometry: Total constituent ratio is ${core.total_ratio}% (target is exactly 100.0%).`);
  }

  // Structured directives with projected impact (mirror of simulate_formulation §16)
  const howToImprove: OptimizationDirective[] = [];
  const whatToRemove: OptimizationDirective[] = [];
  const addDirective = (
    target: OptimizationDirective[],
    actionType: OptimizationDirective["action_type"],
    herbId: string,
    targetRatio: number,
    text: string
  ) => {
    target.push({
      text,
      action_type: actionType,
      herb_id: herbId,
      target_ratio: targetRatio,
      projected_impact: projectedImpact(ratios, entityType, botanicals, actionType, herbId, targetRatio, core),
    });
  };

  if (pippali === 0.0) {
    addDirective(howToImprove, "add", "pippali", 5.0,
      "Add 5.0% Pippali (Piper longum) to ignite 2.2x Yogavāhī bio-availability and drop CI score into Section 3(e) cleared zone.");
  } else if (pippali < 3.0) {
    addDirective(howToImprove, "increase", "pippali", 4.5,
      "Increase Pippali to 4.5% to reach full therapeutic bioavailability threshold for Curcuminoids.");
  } else if (pippali > 7.0) {
    addDirective(whatToRemove, "decrease", "pippali", 5.0,
      "Reduce Pippali to 5.0% to resolve gastric mucosal irritation and prevent CYP3A4 enzyme inhibition.");
  }
  if (ghee < 15.0) {
    addDirective(howToImprove, ghee > 0 ? "increase" : "add", "ghee", 15.0,
      "Increase Cow Ghrita to 15.0% to establish the lipid-carrier (Anupana) layer and lift bioavailability above 2x.");
  }
  if (shilajit > 18.0) {
    addDirective(whatToRemove, "decrease", "shilajit", 12.0,
      "Reduce Shilajit to 12.0% to eliminate high uric acid warning and downgrade NBA ABS levy from 5% to 3.5%.");
  }
  if (ashwa > 40.0) {
    addDirective(whatToRemove, "decrease", "ashwagandha", 32.0,
      "Reduce Ashwagandha to 32.0% to prevent adaptogenic receptor saturation and eliminate somnolence warnings.");
  }
  if (guduchi === 0.0 && shilajit > 10.0) {
    addDirective(howToImprove, "add", "guduchi", 5.0,
      "Add 5.0% Guduchi (Tinospora cordifolia) to act as a Rasayana shield against mineral oxidation.");
  }
  if (tkdlScore >= 90) {
    addDirective(howToImprove, guduchi === 0.0 ? "add" : "increase", "guduchi", r1(guduchi + 6.0),
      `Add Guduchi 6.0% → drop TKDL concordance ${tkdlScore} below the §3(p) 90 line.`);
  }
  for (const w of core.patient_safety_warnings) {
    const hid = w.herb_id;
    if (howToImprove.some((d) => d.herb_id === hid) || whatToRemove.some((d) => d.herb_id === hid)) continue;
    let target = LEGACY_SAFE_TARGET[hid];
    if (target == null) {
      const herb = herbById.get(hid);
      if (herb && herb.safety_ceiling_percent != null) target = herb.safety_ceiling_percent;
    }
    if (target != null && w.current_dose_percent > target) {
      addDirective(whatToRemove, "decrease", hid, target,
        `Reduce ${w.herb_name} to ${target}% w/w — ${w.hazard}.`);
    }
  }

  const suggestions: string[] = [];
  if (howToImprove.length > 0) suggestions.push(howToImprove[0].text);
  if (whatToRemove.length > 0) suggestions.push(whatToRemove[0].text);
  if (suggestions.length === 0) {
    suggestions.push("Formulation has attained optimal stoichiometric balance and statutory Section 3(e) clearance.");
  }

  const contributions = computeContributions(ratios, entityType, botanicals, core.patient_safety_warnings);
  for (const c of contributions) {
    if (c.fix) {
      c.fix.projected_impact = projectedImpact(
        ratios, entityType, botanicals, c.fix.action_type, c.fix.herb_id, c.fix.target_ratio, core
      );
    }
  }

  return {
    title,
    total_ratio: core.total_ratio,
    is_balanced: core.is_balanced,
    chou_talalay_ci: core.chou_talalay_ci,
    ci_interpretation: core.ci_interpretation,
    sec_3e_status: core.sec_3e_status,
    bioavailability_multiplier: core.bioavailability_multiplier,
    anti_inflammatory_suppression: core.anti_inflammatory_suppression,
    ojas_power_score: core.ojas_power_score,
    medicine_quality_score: core.medicine_quality_score,
    patentability_scope_score: core.patentability_scope_score,
    quality_delta: qualityDelta,
    patentability_delta: patentabilityDelta,
    quality_trend: qualityTrend,
    patentability_trend: patentabilityTrend,
    quadrant: core.quadrant,
    quadrant_label: core.quadrant_label,
    quadrant_description: core.quadrant_description,
    pros,
    cons,
    how_to_improve: howToImprove,
    what_to_remove: whatToRemove,
    patient_safety_warnings: core.patient_safety_warnings,
    overall_safety_rating: core.overall_safety_rating,
    tier: core.tier,
    tier_sanskrit: core.tier_sanskrit,
    tier_english: core.tier_english,
    star_rating: core.star_rating,
    tkdl_concordance_score: core.tkdl_concordance_score,
    tkdl_shloka_match: core.tkdl_shloka_match,
    nba_abs_royalty_percentage: core.nba_abs_royalty_percentage,
    nba_form_tier: core.nba_form_tier,
    tridosha_balance: core.tridosha_balance,
    active_buffs: core.active_buffs,
    active_debuffs: core.active_debuffs,
    pairwise_synergy: pairwiseSynergy,
    hplc_markers: hplcMarkers,
    cost_waterfall: costWaterfall,
    suggestions,
    entity_type: entityType,
    cost_per_unit: core.cost_per_unit,
    contributions,
  };
}
