export type RasaTierId =
  | "bala"
  | "kumara"
  | "yuvan"
  | "vriddha"
  | "siddha"
  | "divya_rasayana";

export type BotanicalCategoryId =
  | "adaptogen"
  | "bio_enhancer"
  | "anti_inflammatory"
  | "medhya"
  | "carrier"
  | "mineral_resin"
  | "digestive";

export type HerbLayer =
  | "arthin"
  | "yogavahi"
  | "anupana"
  | "sah_caraka"
  | "resin_bhasma"
  | "supportive";

export interface BotanicalItem {
  id: string;
  common_name: string;
  sanskrit_name: string;
  botanical_name: string;
  family: string;
  part_used: string;
  marker_compound: string;
  standardized_percentage: string;
  category: BotanicalCategoryId;
  single_agent_ed50: number;
  safety_ceiling_percent?: number | null;
  is_mineral_resin: boolean;
  is_threatened: boolean;
  is_cultivated: boolean;
  classical_reference: string;
  description: string;
}

export interface IngredientRatio {
  herb_id: string;
  ratio: number;
  is_locked?: boolean;
}

export interface PresetComputedChips {
  quality: number;
  ci: number;
  sec_3e_status: string;
  tkdl_concordance_score: number;
  tier: RasaTierId;
  nba_abs_royalty_percentage: number;
  cost_per_unit: number;
}

export interface PresetFormulation {
  id: string;
  title: string;
  description: string;
  target_tier: RasaTierId;
  ingredients: IngredientRatio[];
  baseline_ratios: Record<string, number>;
  /** Build-time engine output (spec §8.3) — never hand-declared. */
  computed?: PresetComputedChips;
}

export interface Directive {
  action_type: "add" | "increase" | "decrease" | "remove";
  herb_id: string;
  target_ratio: number;
  text?: string;
  projected_impact?: string;
}

export interface IngredientContribution {
  herb_id: string;
  herb_name: string;
  ratio: number;
  layer: HerbLayer;
  quality_delta: number;
  ci_delta: number;
  patentability_delta: number;
  royalty_delta: number;
  cost_delta: number;
  state: "positive" | "negative" | "blocking";
  blocking_reason?: string | null;
  fix?: Directive | null;
}

export interface PairwiseSynergy {
  herb_a: string;
  herb_b: string;
  ci_score: number;
  status: string;
  mechanism: string;
}

export interface HplcMarker {
  marker: string;
  botanical: string;
  detected: string;
  api_spec: string;
  compliance: string;
}

export interface CostWaterfallItem {
  stage: string;
  cost_inr: number;
  unit: string;
}

export interface PatientSafetyHazard {
  herb_id: string;
  herb_name: string;
  current_dose_percent: number;
  severity: "CRITICAL" | "WARNING" | "INFO";
  hazard: string;
  clinical_manifestation: string;
  affected_populations: string[];
  safe_limit: string;
}

export interface OptimizationDirective {
  text: string;
  action_type: "add" | "increase" | "decrease" | "remove";
  herb_id: string;
  target_ratio: number;
  projected_impact?: string;
}

export interface SimulationResult {
  title: string;
  total_ratio: number;
  is_balanced: boolean;
  chou_talalay_ci: number;
  ci_interpretation: string;
  sec_3e_status: "CLEARED" | "BORDERLINE" | "REJECTED";
  bioavailability_multiplier: number;
  anti_inflammatory_suppression: number;
  ojas_power_score: number;
  medicine_quality_score: number;
  patentability_scope_score: number;
  quality_delta: number;
  patentability_delta: number;
  quality_trend: "SURGE" | "STABLE" | "DECLINE";
  patentability_trend: "SURGE" | "STABLE" | "DECLINE";
  quadrant: "GOLDEN_SYNERGY" | "CLASSICAL_TRAP" | "MERE_ADMIXTURE" | "NOVEL_DEFICIENT";
  quadrant_label: string;
  quadrant_description: string;
  pros: string[];
  cons: string[];
  how_to_improve: OptimizationDirective[];
  what_to_remove: OptimizationDirective[];
  patient_safety_warnings: PatientSafetyHazard[];
  overall_safety_rating: "EXCELLENT" | "MODERATE_CAUTION" | "HIGH_TOXICITY_RISK";
  tier: RasaTierId;
  tier_sanskrit: string;
  tier_english: string;
  star_rating: number;
  tkdl_concordance_score: number;
  tkdl_shloka_match: string;
  nba_abs_royalty_percentage: number;
  nba_form_tier: string;
  tridosha_balance: {
    vata: number;
    pitta: number;
    kapha: number;
  };
  active_buffs: string[];
  active_debuffs: string[];
  pairwise_synergy: PairwiseSynergy[];
  hplc_markers: HplcMarker[];
  cost_waterfall: CostWaterfallItem[];
  suggestions: string[];
  entity_type?: "domestic" | "foreign";
  cost_per_unit?: number;
  contributions?: IngredientContribution[];
}

export interface PreFERObjection {
  section: string;
  statute: string;
  severity: "FATAL" | "OVERCOME" | "ADVISORY";
  finding: string;
  remedy: string;
}

export interface PreFERReport {
  /** §14.1: a simulated report carries no application number unless a real
   *  examiner service supplies one. Null renders as "no application on file". */
  application_no: string | null;
  filing_date: string | null;
  provenance?: string;
  examiner_group: string;
  overall_patentability_score: number;
  summary: string;
  sec_3e_synergy_verified: boolean;
  sec_3p_tkdl_conflict: boolean;
  objections: PreFERObjection[];
  wipo_gratk_status: Record<string, string>;
  recommended_claim_draft: string[];
}

export interface ScenarioSummary {
  id: string;
  title: string;
  herb_count: number;
  total_ratio: number;
  entity_type: "domestic" | "foreign";
  updated_at: string;
}

export interface ScenarioDetail {
  id: string;
  title: string;
  ingredients: IngredientRatio[];
  entity_type: "domestic" | "foreign";
  updated_at: string;
}
