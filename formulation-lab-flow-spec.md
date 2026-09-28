# Formulation Lab — Interaction & Build Spec

> **Who this document is for.** A coding agent implementing the Formulation Lab redesign.
> Every rule below is decision-complete: field names, endpoints, thresholds, and copy
> strings are given exactly so no further design choices are required.
>
> **Relationship to other docs.** `formulation-lab-redesign.md` is the audit (what is wrong
> today). This file is the specification (what to build). Where they conflict, this file wins.
> The design system section (§10) is binding and supersedes the rejected "v1" mockups.

---

## 1. Product statement

The Formulation Lab is a **what-if simulator that stress-tests an Ayurvedic formulation
against Indian IP statute before money is spent filing**.

It answers one question, and every screen must make that question obvious:

> **"Will the IPO grant this, and what must I change?"**

Three things are triangulated in one live loop: **efficacy** (is it a good medicine),
**legality** (§3(e) synergy, §3(p) traditional knowledge, BDA benefit-share, patient safety),
and **economics** (royalty bracket, cost per unit). A §3(e) or §3(p) rejection is normally
discovered months after filing fees are paid. The Lab compresses that into seconds.

### 1.1 The flow in plain language (shared mental model — read this first)

1. **You arrive and pick a starting point**, not a blank screen. Four questions, each
   answering something the user already knows: which condition, which hero herb, which
   classical recipe, or "show me the strongest one for patenting". A full base formula
   loads with sensible percentages. The user is ~70% done before touching anything.
2. **You move a slider and see what it does immediately.** Each ingredient gets its own
   row showing what it contributes — quality, synergy, royalty, cost.
3. **One sentence tells the truth**, in plain words, under the quality number. Deeper
   legal detail is available but never required.
4. **One button shows the single most important next action.** Click it and the sliders
   move for you. One level of undo.
5. **You check the patent before spending money** — a simulated First Examination Report
   with objections, each carrying "apply remedy" that jumps back and fixes it.
6. **Export unlocks at zero fatal objections**, and any later edit re-locks it.
7. **The same screen serves different people** via a Medicine · Law · Money lens switch
   that re-orders emphasis but never hides data.
8. **Nothing gets lost** (autosave), and any point can hand off to the Legal Advisor chat.

Analogy to hold onto: **a kitchen that grades your recipe while you cook** — you start
from a known recipe, and it says "this tastes better, but you've now broken a safety
rule; here's one click to fix it."

---

## 2. Current state vs target (do not skip)

| Behaviour | Today | Target |
|---|---|---|
| Landing | `isGenesisLanding` boolean, "Open Active Workbench →" | four entry doors with computed preset cards |
| Simulation | client-only `simulateClientFormulation` in a `useMemo` | client for instant feedback + debounced `/simulate` as authority |
| Herb catalog | 10 herbs bundled in `defaults.ts` | ~30 herbs fetched from `/herbs`, bundled copy as flagged offline fallback |
| Presets | 4 hand-declared entries, `target_tier` wrong 3 of 4 times | 12–16 entries with **build-time computed** chips |
| Directives apply | `toastMessage.includes("Pippali")` string match | structured `Directive` objects driving existing handlers |
| Pre-FER | modal, fabricated offline report with fake application number | full view; offline clearly badged, no fabricated numbers |
| Export | modal, omits Pre-FER + safety + trajectory, gated on nothing | gated on 0 FATAL, includes all artifacts |
| Persistence | none — refresh destroys work | autosave to SQLite; "continue recent work" |
| Next action | seven equal-weight stacked panels | one adaptive CTA from the lowest unmet gate |
| Per-ingredient attribution | does not exist | new `contributions` field in the engine |

**Verified fact that shapes the design:** all four current presets score quality 97–99,
patentability 98, and clear §3(e). There is no spread, so "pick the best one" is currently
impossible. Two of them (including the flagship `rev_3_2_benchmark`) sit at **TKDL
concordance 92 — above the §3(p) 90 line** — which is invisible on the card. See §15.

---

## 3. Screen anatomy

```
┌ app shell: Government ribbon (A- A A+ · English | हिन्दी) + navy sidebar ┐
│ white header band: Ministry of Ayush · IP-SAKTI Sahayak                  │
│ ── 3px saffron→green hairline ───────────────────────────────────────────│
│ sub-header saffron gradient banner: <formulation name> · CI 0.71 · Tier  │
│ [ Medicine ● | Law ○ | Money ○ ]      next: ▸ <adaptive action> [Apply]  │
│ KPI strip: Quality · Synergy CI · TKDL · ABS Royalty                     │
│   (each: big numeral → one-line plain meaning → (i) popover)             │
│ ┌ LEFT: composition ────────────────┐  ┌ RIGHT: verdict ───────────────┐ │
│ │ stacked 100% composition bar      │  │ verdict line (always on)      │ │
│ │ per-ingredient contribution rows  │  │ quadrant mini-map (optional)  │ │
│ │ sliders + ± + lock + Add herb     │  │ safety bars                   │ │
│ │ sum chip · Auto-Balance · Undo    │  │                               │ │
│ └───────────────────────────────────┘  └───────────────────────────────┘ │
│ full-width: sensitivity curve                                            │
│ [ Guided ⟷ Free ]                    [ Run Pre-FER → ]  [ Licence path → ]│
└──────────────────────────────────────────────────────────────────────────┘
```

View state is `view: "doors" | "bench" | "examine" | "dossier"` in `page.tsx`, replacing
the `isGenesisLanding` boolean. Doors → bench → examine → dossier, with one mandatory
return loop: **objection → bench (apply remedy)**.

---

## 4. Stage 1 — Entry doors (replaces `GenesisOrbLanding`)

Ask the user for a **concrete object**, never for a persona or an abstraction. Each
question is only answerable by someone who already knows their intent, so choosing the
question *is* the routing.

| Door | Question shown | Source | Primary user |
|---|---|---|---|
| Condition | "What are you treating?" | `data/ayurveda/conditions.json` → `modern_equivalents` + `related_plants` | Vaidya, founder |
| Hero herb | "What is your formula built around?" | `/herbs` grouped by `category` | R&D |
| Classical yoga | "Start from a known recipe" | `data/ayurveda/formulations.json` | ASU licence seeker |
| Ranked best | "Show me the strongest patent position" | presets sorted by computed scores | patent attorney |

Requirements:
1. Index the condition search by **`modern_equivalents`** ("Type 2 diabetes",
   "Osteoarthritis", "Asthma") while displaying both the English name and
   `sanskrit_name` (*Prameha*, *Sandhivata*). Two language communities, two expertise
   levels, one door.
2. Every card carries **computed** chips (§8.3), never hand-declared values.
3. Every card names **one known weakness** (§4.1) — this is mandatory.
4. `＋ New from scratch` is a tertiary text link, not a card.
5. Show "Continue recent work" first when saved scenarios exist.
6. No persona survey. No "what are you optimizing for?" gate before the bench.

### 4.1 The preset-must-be-incomplete rule

A preset that starts all-green teaches nothing and leaves the user nowhere to go. The
preset's job is to produce a **well-formed problem**, not a finished answer, so that the
first thing the user does is press an Apply-fix button.

- Card copy pattern: `"Strong medicine, but TKDL 92 reads as §3(p) prior art — add
  Guduchi 6% to drop below 90."`
- The library must contain a deliberate spread: some presets that fail §3(e), some that
  trip a safety ceiling, some cheap-but-weak, some clean. Do not ship a library where
  everything clears everything.
- Presets load as **editable starting states**. Never ship `is_locked: true` inside a
  preset (the current `rev_3_2_benchmark` locks haridra, silently breaking Auto-Balance).
  Never ship `baseline_ratios` that differ from `ingredients` — a freshly loaded preset
  must not display deltas against a baseline the user never saw.

---

## 5. Stage 2 — The bench: composition and contribution rows

### 5.1 Composition (input side)

- **Stacked 100% composition bar** above the rows, fed by `ingredients` — the ingredient
  percentage is shown at the point of input, not at the end of the flow.
- Per row: `common_name` + `sanskrit_name` + `marker_compound` chip + category chip +
  safety ceiling inline; slider + ± stepper + numeric input; lock toggle.
- **Add herb** = Cmd-K searchable drawer grouped by `BotanicalCategory`. Replaces the
  current bare `<select>` in `RatioMatrixBoard`.
- **Auto-Balance** normalises unlocked rows to 100.0 respecting locks
  (`handleAutoBalance` already implements the math), with animated tweens so the user
  sees which rows absorbed the change.
- **Entity type** segmented control (domestic / foreign) lives on the bench, not at
  export: it moves `nba_abs_royalty_percentage` (3.0–5.0%) and flips `nba_form_tier`
  Form III ↔ Form I. `FormulationSimulateRequest.entity_type` already exists and is
  currently hard-coded to `"domestic"` in the page's `useMemo`.

### 5.2 Contribution rows (the new output object — replaces three panels)

One row per ingredient:

| Cell | Content | Source |
|---|---|---|
| Identity | Ashwagandha · *Withania somnifera* · withanolides 5.2% | `BotanicalItem` |
| Layer | Arthin (hero) / Yogavāhī (bio-enhancer) / Anupana (carrier) / Sah-caraka (counter-toxic) / Resin-Bhasma | new `layer` field, §8.2 |
| Contribution | Quality **+7.2** · CI −0.04 · Patent +3 · Royalty ±0.0 · Cost ₹0.42 | new `contributions`, §8.1 |
| Spine | green = net positive · saffron = net negative · rose = breaches statute or safety ceiling | derived |
| Action | `Apply fix` when negative, with projected impact on the row | `Directive` |

**Collapse these three panels into the contribution list:** `ProsAndConsPanel`,
`PatientSafetyPanel`, `OptimizationDirectivesPanel`. Rationale: `pros`/`cons` are prose
about the *composite* ("Super-Additive Synergy (CI: 0.61)…" — no herb named, no
contribution quantified, rendered as inert `<span>` text), whereas
`patient_safety_warnings` already carries `herb_id`, `current_dose_percent`, `safe_limit`
and slots into rows unchanged. Safety warnings must be **sorted to the top of the list**.

### 5.3 Two-speed feedback contract

1. Every drag re-scores **client-side instantly**; show a small "live" dot.
2. **Debounce 400 ms → POST `/simulate`** with current `ingredients` + `entity_type`;
   on return flip the verdict card chip to "server-verified ✓" and treat server values
   as authoritative.
3. Any client/server mismatch is **displayed, never hidden**. A legal instrument cannot
   silently disagree with itself.
4. Add a **pytest parity guard**: run N fixed ratio vectors through `engine.py`, dump to
   a JSON fixture, and assert `engine.ts` produces identical outputs. `engine.ts`
   (~602 LOC) is a manual fork of `engine.py` (~714 LOC) and nothing currently prevents
   drift.

---

## 6. Stage 3 — The verdict line

One always-visible sentence directly under the quality KPI. This is the **only**
patentability surface in the main flow: a sentence, not a second axis the user must learn.

Pattern: `Quality <n> — but <plain-language statutory consequence>. <Named remedy>.`

Worked examples (all copy must name the herb and the threshold):

- `Quality 99 — but at these ratios the patent office will read this as a mere mixture
  of known herbs (§3(e)). Adding Pippali above 3% fixes it.`
- `Quality 99 — this composition sits at TKDL concordance 92, so it is likely already
  documented traditional knowledge (§3(p)). Add Guduchi 6% to drop below 90.`
- `Quality 91 — Brahmi at 32% exceeds the 25% safe ceiling and can slow heart rate.
  Reduce to 25%.`
- `Quality 99 · clears §3(e) · clears §3(p) · royalty 5.0% (Guggulu is a threatened
  species) — ready for examination.`

Hard rules:
- The verdict line **must derive from the same gate function** as the adaptive next-action
  button (§7). They can never state different problems.
- Jargon never renders naked. Chou-Talalay CI, Yogavāhī, Ojas, TKDL concordance, Srotoshodhaka
  each require the depth ladder (§9).

---

## 7. Stage 4 — Adaptive next action (single primary CTA)

Route on the **formulation's state**, not the user's identity. One button on screen: the
highest-consequence unmet gate. Deterministic, ordered — first match wins.

| # | Condition (exact) | Button label | Action fired |
|---|---|---|---|
| 1 | `ingredients.length === 0` | Add your first herb | open herb drawer |
| 2 | `abs(total_ratio - 100.0) > 0.05` | Normalise to 100.0% w/w | `handleAutoBalance` |
| 3 | any `patient_safety_warnings[].severity === "CRITICAL"` | Reduce `{herb_name}` to `{safe_limit}` | increase/decrease directive |
| 4 | `entity_type` not explicitly chosen | Declare entity type — moves royalty 3.0% → 5.0% | focus the control |
| 5 | `sec_3e_status !== "CLEARED"` | Add Pippali 5.0% → CI {ci} → 0.71 clears §3(e) | `add` directive |
| 6 | `tkdl_concordance_score >= 90` | Add Guduchi 6.0% → drop TKDL {score} → {score-6} under §3(p) | `add` directive |
| 7 | `bioavailability_multiplier < 2.0` | Add Ghrita 15.0% → carrier layer | `add` directive |
| 8 | all above pass and no Pre-FER run yet | Run Pre-FER → | POST `/pre-fer` |
| 9 | Pre-FER run with `objections[severity=FATAL].length > 0` | Apply remedy: {first fatal remedy} | remedy directive + jump |
| 10 | zero FATAL | Export dossier | switch to dossier view |

Requirements:
- Clicking Apply must **re-normalise or flag**. Any add/remove/increase pushes the sum off
  100: unlocked rows absorb the delta automatically; if locks make that impossible, the
  sum chip goes saffron with a one-click normalise. Never leave a silently broken composition.
- **One-level Undo**, always adjacent to the sum chip. Cascade-through-auto-balance edits
  are otherwise unrecoverable, and an unrecoverable edit teaches users not to press Apply.
- Each Apply plots a point in a **trajectory trail** (last ~20 coordinates in memory).
- The label must show the **projected impact before clicking**, computed from
  `contributions` — Apply is an informed act, not a leap.
- **Guided mode narrates from this same function.** One source of truth.

Anti-pattern being fixed: seven equal-weight panels force every user to self-rank, which
is exactly what a beginner cannot do and an expert should not have to.

---

## 8. Preset system and the new data contract

### 8.1 New engine field: `contributions`

Per-ingredient attribution does not exist in any form today and is the single new
computation this redesign requires.

```
IngredientContribution {
  herb_id, herb_name, ratio, layer,
  quality_delta, ci_delta, patentability_delta, royalty_delta, cost_delta,
  state: "positive" | "negative" | "blocking",
  blocking_reason: Optional[str],   # statute or safety-ceiling identifier
  fix: Optional[Directive]
}
Directive { action_type: "add"|"increase"|"decrease"|"remove", herb_id, target_ratio, projected_impact }
```

- Add `contributions: List[IngredientContribution]` to `SimulationResponse`
  (`backend/app/models/formulation.py`) and mirror into
  `frontend/src/lib/formulation/types.ts`.
- **Method:** perturb each ingredient by ±1.0% w/w, re-score, take the delta. Prefer
  analytic decomposition where the score is already additive — `quality_base` is a sum of
  independent terms, and `quality_base += len(active_buffs)*3.0 - len(active_debuffs)*4.0`
  is literally per-herb (gated on `pippali >= 3.0`, `ghee >= 10.0`, `shilajit <= 10.0` /
  `> 25.0`, `guduchi >= 5.0`), just never attributed. Keep it deterministic and cached.
- Extend `how_to_improve` / `what_to_remove` entries so each carries `action_type`,
  `herb_id`, `target_ratio` (they already do partially) and `projected_impact`.

### 8.2 Layer taxonomy (deterministic mapping from `category`)

| Layer | Rule | Herbs | Engine gate it trips |
|---|---|---|---|
| Arthin (hero) | `category ∈ adaptogen, anti_inflammatory, medhya` | ashwagandha, haridra, brahmi | drives ED50 → CI, `anti_inflammatory_suppression` |
| Yogavāhī (bio-enhancer) | `category = bio_enhancer` | pippali | `pippali >= 3.0` → Yogavāhī Bio-Ignition buff |
| Anupana (carrier) | `category = carrier` | ghee | `ghee >= 10.0` → Lipid Carrier Samskara cleared |
| Sah-caraka (counter-toxic) | `category = digestive` or explicit list | guduchi, amla | `guduchi >= 5.0` → Rasayana Prameha Toxicity Shield |
| Resin / Bhasma | `is_mineral_resin = true` | shilajit, guggulu | `shilajit <= 10.0` exempt, `> 25.0` → +1.5% royalty; `is_threatened` → 5.0% bracket |

Why this matters: when a layer is missing the UI can say **"your carrier layer is
missing"** instead of **"quality went down"**. That is an actionable diagnosis in the
user's own vocabulary, and it uses the same vocabulary the Apply fixes use.

### 8.3 Build-time computed chips (no hand-declared values)

Every preset must be scored by `simulate_formulation` and the results written back into
`presets.json` (`quality`, `ci`, `sec_3e_status`, `tkdl_concordance_score`, `tier`,
`nba_abs_royalty_percentage`, `cost_per_unit`). Add a **CI check that fails when a
declared value differs from the computed one** — this automatically kills the current
mislabelling, where 3 of 4 presets advertise a `target_tier` the engine does not produce.

### 8.4 Catalog expansion — the real prerequisite

`backend/data/formulation/botanicals.json` holds **10 herbs**. A 10-herb catalog cannot
generate meaningfully different starting points, which is why all four current presets
are the same shape (one hero + pippali 5 + ghee 10–15) and all score ~identically.

1. Expand to **~30 herbs**. Add the 7 species referenced by the Ayurveda dataset but
   absent from the catalog: neem (`azadirachta-indica`), shallaki (`boswellia-serrata`),
   yashti (`glycyrrhiza-glabra`), tulsi (`ocimum-sanctum`), arjuna (`terminalia-arjuna`),
   methi (`trigonella-foenum-graecum`), dantaka (`plumbago-zeylanica`), plus
   bilva/ballataka/vidari as needed. All required schema fields already exist:
   `single_agent_ed50`, `marker_compound`, `standardized_percentage`, `is_threatened`,
   `is_mineral_resin`, `is_cultivated`, `classical_reference`, `category`.
2. Add a **synonym map** `ayurveda plant id ↔ lab herb_id`. The two datasets use
   different keys (`emblica-officinalis` vs `amla`); only 3 of 11 referenced plants
   currently resolve, and one of those is a synonym miss, not a real match.
3. Seed new presets from **NLEAM ∩ the 7 `conditions.json` entries**. Ministry of AYUSH
   has published 2,799 ASU formulary specifications and 426 quality standards — the
   preset library needs curation, not invention. Target **12–16 presets**, each varying
   at least one layer relative to its neighbour.
4. **Fetch `/herbs` and `/presets` in the frontend.** Today the page reads a hand-copied
   `STARTER_PRESETS` array from `defaults.ts`, so adding one herb requires a frontend
   redeploy. Keep `defaults.ts` only as an offline fallback, visibly badged
   "static catalog".

---

## 9. Depth ladder (one screen, two audiences, no mode switch)

Each of the four rungs is one tap from the previous. Novices stop at rung 2, experts
never leave rung 1.

| Rung | Content | Interaction |
|---|---|---|
| 1 | Numeral (`0.61`) | passive |
| 2 | Plain-language caption — **always on, zero clicks**, one line | passive |
| 3 | Statute + mechanism + confidence chip | `(i)` popover |
| 4 | Actual corpus source | "Open the source" → `/rules` or `/chat` with citation |

- **Rung 3 and 4 must cite.** Reuse `frontend/src/components/ui/ConfidenceIndicator.tsx`
  and the chat's citation-chip convention, pointing at the version-tracked
  `india_ip_law` / `india_tkdl` corpus. This satisfies the project's mandatory-citation
  and confidence-indicator requirements, and makes the explain layer evidence rather
  than copy.
- **`<InfoTip>` is the only new shared primitive required.** `components/ui/` currently
  contains only `ConfidenceIndicator.tsx`, `Disclaimer.tsx`, `interfaces-select.tsx` —
  no tooltip or glossary primitive exists.
- **Type floor is a hard requirement:** explanatory text at 12–13 px minimum, 14 px body.
  A rung-2 caption at 10 px means the layer exists in theory only.

---

## 10. Visual contract (binding)

Bound design system: **"Ayurvedic Scholarly Interface"** — Playfair Display serif
headings, parchment ground, navy portal chrome. This matches the project's own seven
existing Formulation Lab screens. The rejected "v1" theme (teal + dark instrument panels
+ JetBrains Mono) must not be used.

| Token | Value |
|---|---|
| Canvas / card ground | parchment `#F7F4EF` / card `#FFFCF7`, hairline `#E7E0D4`, radius 4–8 px, no heavy shadow |
| Accent — alert / classical / active nav | saffron `#C0392B` |
| Accent — verified / cleared / apply | emerald `#1A7F4E` |
| Chrome, primary button, titles | navy `#00263f` / `#0b3c5d` |
| Rose | reserved **exclusively** for FATAL / statutory / safety failure |
| Type | Playfair Display 600 navy titles 22–28 px; Inter body 14/22; uppercase tracked labels; tabular numerals for the KPI strip only |
| Sub-header banner | saffron/amber gradient strip with live formulation name + CI + tier — the lab's signature element, keep it |

State choreography: count-up on KPI numerals, pin eases across quadrant zones, directive
rows slide. Empty state teaches with a worked example. Loading = hairline shimmer on
cards, no spinner in blank space.
**Colour is never the only signal** — every rose/saffron/green state also carries an
icon and a text label, for colour-blind users and greyscale PDF print.

---

## 11. Routing layer (who gets what without being asked)

| Device | Routes on | Cost |
|---|---|---|
| Four doors | what object they're holding | restyle existing landing |
| Three lenses | what question they're answering | 1 control, ordering only |
| Adaptive next action | formulation state | 1 derived function |
| Depth ladder | how much they already know | 1 new primitive |

### 11.1 Lens switch — `Medicine · Law · Money`

A segmented control over the same bench. Reuse the existing dual-mode tab idiom from
`frontend/src/app/patents/page.tsx` (formulation matcher vs advanced boolean search) so
it feels native to the app.

- **Medicine** → `medicine_quality_score`, `chou_talalay_ci`,
  `bioavailability_multiplier`, `tridosha_balance`, `tier`
- **Law** → `sec_3e_status`, `tkdl_concordance_score`, `tkdl_shloka_match`,
  Pre-FER `objections[]`, `recommended_claim_draft`
- **Money** → `nba_abs_royalty_percentage`, `nba_form_tier`, `cost_waterfall`,
  `entity_type`

**Hard rule: the lens changes order and emphasis, never availability.** Every panel stays
reachable within one scroll under every lens. Hiding statutory data in a legal tool
creates the blind spots §3(p) exists to punish, and **the exported dossier must contain
the same facts under every lens** so two users never file different evidence.

Persona map: Vaidya → Condition door + Medicine. Attorney → Ranked door + Law. Founder →
Classical door + Money. Researcher → Hero door + Medicine→Law, wants deltas, A/B compare,
JSON export. Student → Guided mode + worked example.

### 11.2 Guided ⟷ Free

Upgrade the existing `isGenesisLanding` boolean rather than adding a second toggle.
Guided dims non-relevant panels and narrates the next action from §7; Free shows the
whole bench. Default guided only when no saved scenario exists. Session-persistent,
one-click reversible, **no questionnaire**.

### 11.3 Handoff rails

- **"Discuss in Legal Advisor"** → `/chat` payload handoff (exists; needs scenario-id
  round-trip so a chat answer can reopen the exact bench state).
- **"Licence path →"** → existing `/wizard` (Udyam · Form III · Schedule T · GST) — the
  Money lens' natural exit, currently unreachable from the Lab.
- **Researcher** → JSON export + A/B delta table.
- **Escalate to IP facilitator** — this project's escalation route is still an open gap.

### 11.4 Deliberately NOT adaptive-by-identity

Do not build a recommender that changes what statutory risk looks prominent per user
type. It produces two screen states for one formulation, is indefensible when an
examiner reads the dossier, and makes support tickets unreproducible. State-driven (§7)
and explicitly user-chosen (lens, doors) routing are both inspectable and exportable.

---

## 12. Stage 5 — Examine (Pre-FER)

Promote from modal to a **document view**. Letterhead "Simulated First Examination
Report · IPO Group 14", circular patentability gauge from `overall_patentability_score`,
objection cards spined by severity (`FATAL` rose / `OVERCOME` green / `ADVISORY` saffron).

Each objection carries exactly two actions:
1. **`Apply remedy in Bench`** — jumps back with the fix staged, using the *same*
   directive mechanism as §7. Build Apply before Pre-FER; the objection→bench loop is
   the point of the screen.
2. **`Discuss in Legal Advisor`** — chat handoff.

Plus a Recommended Claim Draft panel (`recommended_claim_draft`, Form 2).

**Entry gate:** sum = 100% and ≥3 constituents. Running is an explicit user action, never
auto-fired.

**AI boundary:** NIM may write `summary` and `recommended_claim_draft` with RAG citations
from `india_ip_law` + `india_tkdl`. **The LLM must never move a FATAL/OVERCOME verdict** —
objections stay deterministic.

---

## 13. Stage 6 — Export (dossier)

- Checklist of §7 gates with pass/fail; **export disabled until zero FATAL objections**,
  each failing gate linking to its remedy.
- "What's included" preview before download.
- Contents must include: formulation table, Pre-FER report, safety panel, quadrant
  trajectory, applied-directives log, ABS/Form I-III status, citations. The current
  modal omits all four of the first items, and print is `window.print()` of the whole
  app shell — replace with a server-rendered PDF.
- **Re-validation nudge:** any edit after export re-opens the gate and marks the dossier
  stale ("re-check needed") rather than letting a stale artifact be filed.

---

## 14. Honesty rules — non-negotiable

1. **No fabricated legal artifacts.** The offline `/pre-fer` fallback currently invents
   `application_no: "IN/2026/AYUSH/049812"` and a filing date with no provenance label.
   Offline reports must read **"CLIENT-ESTIMATED — examiner service unreachable"** and
   must carry **no** application number.
2. **Client vs server is always visible.** Provisional values carry a "live" dot, server
   values carry "server-verified ✓", and mismatches are surfaced.
3. **Never silently normalise into a broken composition.** Unbalanced state is saffron,
   never rose.
4. **Rose = legal or safety failure only.** If rose is used for UI warnings, the verdict
   colour language is destroyed.
5. **Every number explains itself** or links to the statute that does.
6. **The lens never hides data**, and the dossier is identical under every lens.
7. **Nothing is lost** — autosave, and refresh must not destroy a working formulation.

---

## 15. Appendix — measured current presets

Run of `simulate_formulation` over `backend/data/formulation/presets.json`:

| preset | quality | pat | CI | §3(e) | TKDL | royalty | declared tier | computed tier |
|---|---|---|---|---|---|---|---|---|
| rev_3_2_benchmark | 99 | 98 | 0.57 | CLEARED | **92** | 3.0 | vriddha | **divya_rasayana** |
| rasayana_matrix | 99 | 98 | 0.63 | CLEARED | **92** | 3.0 | siddha | siddha ✓ |
| anti_inflammatory_catalyst | 99 | 98 | 0.71 | CLEARED | 75 | **5.0** | divya_rasayana | **siddha** |
| medhya_neuro_enhancer | 97 | 98 | 0.71 | CLEARED | 75 | 3.0 | siddha | **vriddha** |

Conclusions: no score spread (§4.1), 3 of 4 tier labels wrong, one hidden §3(p) trap on
the flagship preset, and the only real differentiators (royalty 3.0 vs 5.0, TKDL 92 vs 75)
are not on the card.

---

## 16. Build order

**Phase 0 — honesty + wiring, frontend only, ~1 day.** Fetch `/herbs` + `/presets` with
badged offline fallback. Replace `handleApplyToastSuggestion`'s string match with
structured directives. Add the entity-type control. Badge the offline Pre-FER and drop the
fake application number. Delete `LivingRasaCard`'s fake tier-preview control (its
`onPreviewTierChange` prop is never passed).

**Phase 1 — authority + memory, ~2–3 days.** Debounced `/simulate` with live/verified
chips + pytest engine-parity fixture. `POST /formulation-lab/save` on `sqlite_service`
with list/restore. Scenario A/B pin + delta table.

**Phase 2 — attribution, ~2–3 days.** Catalog 10 → ~30, synonym map, `contributions` in
`engine.py`/`engine.ts` + `types.ts`, `layer` mapping, build-time preset scoring script +
CI check, preset library rebuilt with deliberate spread and incomplete-by-design cards.

**Phase 3 — routing + the fix loop, ~3–4 days.** `<InfoTip>` + rung 2 captions + type
floor. Gate-priority function (§7) and the single next-action CTA with Apply + Undo +
trajectory. Contribution rows replacing three panels. Lens switch. Doors replacing
`GenesisOrbLanding`. Guided ⟷ Free.

**Phase 4 — finish, ~3 days.** Pre-FER as a view with objection→bench. Dossier v2 with the
0-FATAL gate and server-rendered PDF. Chat scenario-id round-trip. `/optimize` real
implementation (today it is two hard-coded `if`s).

**Delete:** `GenesisOrbLanding` intent explainer, `ProsAndConsPanel`,
`PatientSafetyPanel` as standalone panels, `OptimizationToast` +
`handleApplyToastSuggestion`, `LivingRasaCard` fake tier control, `QualityPatentabilityMatrix`
hero treatment (→ verdict line + optional mini-map), dark/mono styling.

---

## 17. Definition of done

- [ ] A first-time user reaches a non-obvious insight within 15 seconds, without adding
      5 herbs by hand.
- [ ] Every preset card's numbers were computed by the engine, not written by a human.
- [ ] At least one preset in the library fails §3(e) and at least one trips a safety
      ceiling — the gallery has a real spread.
- [ ] Exactly one primary action button is visible on the bench at any moment, and its
      projected impact matches the result after Apply.
- [ ] Every ingredient row names its own contribution to quality.
- [ ] Refreshing the page never loses a formulation.
- [ ] With the backend stopped, no legal identifier is invented anywhere on screen.
- [ ] Switching lens re-orders but never removes a statutory panel; the exported dossier
      is byte-identical under all three lenses.
- [ ] Every metric is readable at 4 depths; captions and popovers are ≥12 px.
- [ ] The offline Pre-FER path is visibly badged CLIENT-ESTIMATED and prints no
      application number.
- [ ] Engine parity test passes, and CI fails on any preset label mismatch.

---

## 18. Open decisions needing a human

1. **PDF rendering** — server-side weasyprint (new dependency, Docker image change) vs
   client print stylesheet. Affects Phase 4 scope.
2. **Where saved scenarios live** — local SQLite (`data/ipsakti.db`, matches existing
   session storage) vs Supabase. Affects multi-device and the chat round-trip.
3. **Final herb list** for the 10 → ~30 expansion — needs someone with Ayurvedic
   formulary knowledge to confirm ED50 and safety ceilings, since those numbers drive
   CI and the safety panel and must not be guessed.
4. **Whether Pre-FER `summary` uses NIM at all** — the deterministic text is already
   defensible; adding generation adds a citation-verification burden.
