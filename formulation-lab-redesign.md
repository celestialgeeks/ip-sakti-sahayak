# Formulation Lab — Audit & Redesign Plan

> Structured report covering purpose, value proposition, feature gaps, implementation
> strategy, revised user flow, and high-fidelity mockups for the Formulation Lab module.
> Audited surfaces: `backend/app/models/formulation.py`, `backend/app/core/formulation/engine.py`,
> `backend/app/api/routes/formulation_lab.py`, `frontend/src/app/formulation-lab/page.tsx`,
> `frontend/src/lib/formulation/*`, `frontend/src/components/formulation-lab/*`.

---

## 1. Purpose & Value Proposition

### 1.1 What it is

The Formulation Lab is a **what-if simulator that stress-tests an Ayurvedic formulation
against Indian IP statute before money is spent filing**. It sits at the intersection of
three user intents:

| Intent | Engine output the user cares about |
|---|---|
| **"Can I patent this?"** | Chou-Talalay Combination Index → §3(e) mere-admixture bar; TKDL concordance score → §3(p) traditional-knowledge bar; Pre-FER mock examination report with objections + remedies |
| **"Is this legal to make/sell?"** | NBA ABS royalty bracket (BD Act 2002 → 2023 Amendment → ABS Regs 2024, Form I/III), HPLC marker compliance vs API monograph limits, patient dose-ceiling hazards, Schedule T cost waterfall |
| **"Is this actually a good medicine?"** | Bioavailability (Yogavāhī) multiplier, NF-κB suppression, Tridosha equilibrium, Rasa tier progression (Bāla → Divya Rasayana), Golden-Synergy quadrant placement |

### 1.2 Why a user should care (the pitch the UI currently fails to make)

A §3(e) or §3(p) rejection is **discovered months after filing fees are paid**. The Lab
compresses that discovery loop into seconds: every slider drag re-scores synergy,
royalty liability, and toxicity risk simultaneously, and the Quality × Patentability
plane tells the user *which kind of failure* they are drifting toward (Mere Admixture,
Classical Prior-Art Trap, Novel-Deficient) with one-click corrective directives.
That triangulation — **efficacy, legality, and economics in one live loop** — is the
product. The redesign must make this obvious within five seconds of landing.

### 1.3 Contract between tiers (verified, no drift today)

- `backend/app/models/formulation.py` ↔ `frontend/src/lib/formulation/types.ts` are in sync
  (`SimulationResult` mirrors `SimulationResponse`, incl. quadrant, deltas, directives,
  safety warnings, `pairwise_synergy`, `hplc_markers`, `cost_waterfall`).
- **But** `frontend/src/lib/formulation/engine.ts` (602 LOC) is a manual fork of
  `backend/app/core/formulation/engine.py` (714 LOC). They agree today only by discipline.

---

## 2. Feature Gap Analysis

### 2.1 Findings from the current implementation

**A. Architecture / correctness**

1. **Dead backend.** The UI calls only `/api/formulation-lab/pre-fer`. `/simulate`,
   `/optimize`, `/herbs`, `/presets` are unreferenced in `frontend/src`. All simulation
   is client-side (`simulateClientFormulation` in a `useMemo`), and the botanical
   catalog + presets are statically bundled from `defaults.ts` — adding one herb
   requires a frontend redeploy.
2. **Forked-engine drift risk** (see 1.3). No parity test guards `engine.ts` vs `engine.py`.
3. **String-matched suggestions.** `handleApplyToastSuggestion` applies toast advice via
   `toastMessage.includes("Pippali")` — breaks the moment engine copy changes. Backend
   `/optimize` already returns **structured** directives (`action`, `herb_id`,
   `recommended_ratio`) that the UI ignores.
4. **Fabricated offline Pre-FER.** When `/pre-fer` fails, the catch block renders a
   realistic-looking fake report (application no., filing date) without any
   "server offline — client-estimated" label. Trust hazard for a legal tool.
5. **Fake interactivity.** `LivingRasaCard`'s tier segmented control only swaps badge
   copy (`previewTier` local state); the `onPreviewTierChange` prop is never passed.
   It implies a tier preview/solve capability that doesn't exist.

**B. Missing capabilities the models already support**

6. **`entity_type` (domestic/foreign) never exposed** — yet it moves the NBA royalty
   from 3.0–5.0 % and flips Form III → Form I. `FormulationSimulateRequest.entity_type`
   and `baseline_id` exist server-side and are unused.
7. **No persistence** — nothing saved to `sqlite_service`/`ipsakti.db` or Supabase; a
   refresh destroys the working formulation. No named versions, no comparison of
   scenario A vs B, no trajectory history.
8. **`/optimize` target-tier solving not surfaced** — the request schema takes
   `target_tier` (default Divya Rasayana) and the backend has tier logic, so
   "reverse-solve my formula to Tier V/VI" is ~80 % built.
9. **Dossier omits the most important artifacts** — the export modal skips Pre-FER
   report, safety warnings, quadrant diagnosis, and pros/cons; print = `window.print()`
   of the whole app shell.

**C. Interactivity / engagement**

10. **Quadrant map is display-only.** The pin animates but can't be dragged, has no
    trajectory trail of prior edits, and no "safe/golden zone" boundary legend.
    Pairwise synergy, cost waterfall, HPLC data hide inside accordions at page bottom.
11. **No explanation layer.** Chou-Talalay CI, Yogavāhī, Ojas, TKDL concordance render
    as naked jargon; no tooltips, glossary, or empty-state teaching moments. Type is
    10–11 px almost everywhere.
12. **No guided goal.** Landing → "Open Active Workbench →" dumps ~7 stacked panels
    with no stated destination; "Setup Hub" vs the "Genesis Orb" name (there is no orb)
    confuses orientation. Nothing tracks progress toward the only real finish line:
    a filing-ready dossier.
13. **No AI layer**, despite NIM/RAG infrastructure existing in the same backend
    (the platform's chat already cites the `india_ip_law` / `india_tkdl` collections).

### 2.2 Roadmap (phased, each item decision-complete)

**P0 — Honesty + quick wins (frontend-only, ~1 day)**
- Fetch `/herbs` + `/presets` into state; keep `defaults.ts` as offline fallback with a
  "static catalog" chip (one `useEffect` + existing `getApiUrl()`).
- Replace string-matched toast with structured suggestions: extend `suggestions`
  consumption to directives already present in `how_to_improve`/`what_to_remove`
  (`action_type` + `herb_id` + `target_ratio`), and call `/optimize` for toast actions.
- Add entity-type segmented control (domestic/foreign) to the title card; pass through
  to the (existing) simulate call path.
- Badge offline Pre-FER: "Client-estimated preview — examiner service unreachable",
  and drop the fabricated application number.
- Delete or wire `onPreviewTierChange`: wire = clicking a future tier calls `/optimize`
  with `target_tier` and previews returned recommendations (see P1.4).

**P1 — Server-authoritative simulation + scenarios (~2–3 days)**
- **Dual-engine contract:** keep client engine for 0 ms slider feedback, tag values
  "provisional"; debounce (400 ms) a `/simulate` POST for the authoritative numbers
  ("verified" tag flips). Add a pytest that runs N fixed ratio vectors through
  `engine.py` and asserts `engine.ts` parity via a JSON fixture (prevents drift).
- **Persistence**: `POST /formulation-lab/save` storing title + ingredients +
  simulation snapshot via `sqlite_service` (ipsakti.db) — same pattern as existing
  session storage. List/restore UI in the toolbar.
- **Scenario A/B**: pin current ratios as "Scenario A"; quadrant map renders a ghost
  pin + delta table (CI, quality, patentability, royalty, cost/unit) — pure frontend
  state over existing simulation outputs.
- **Target-tier solve**: `/optimize` gains real implementation (replace the two
  hard-coded `if`s by reusing `simulate_formulation` in a small grid search over the
  existing directives vocabulary: add/remove/±ratio, ≤ 3 moves).

**P2 — Guided workflow + quadrant as the hero (~3–4 days)**
- 4-step workspace rail: **Compose → Balance → Examine → Export** (§3 below). Steps are
  anchors over the existing components, not new pages — refactor `page.tsx` section
  order behind a stepper that scrolls/filters panels by step.
- **Draggable quadrant pin = inverse simulate**: drag → target (quality, patentability)
  → `/optimize` grid search minimizing distance to target → proposed moves surface in
  the directives panel ("3 moves to reach Golden Quadrant"). Trajectory trail = last 20
  simulation coordinates in memory.
- **Live composition donut/stacked bar** in RatioMatrixBoard header (one SVG, fed by
  `ingredients`) + lock-aware rebalancing already exists (`handleAutoBalance`) — expose
  as "normalize" with animated slider tweens.
- Tooltips + mini-glossary popover on every metric label (`<InfoTip>` shared primitive
  in `components/ui/`); raise base type from 10–11 px to 12–13 px.

**P3 — AI + export grade (~3 days)**
- Pre-FER `summary` and `recommended_claim_draft` generated by NVIDIA NIM
  (`app/services/nim.py`) with rag_pipeline citations from `india_ip_law` +
  `india_tkdl` collections; objections stay deterministic (never let the LLM move a
  FATAL/OVERCOME verdict).
- **Dossier v2**: include Pre-FER report, safety panel, quadrant trajectory, directives
  applied; server-rendered PDF endpoint (weasyprint) + the existing JSON package;
  Export gated on "zero FATAL objections" checklist.
- Chat handoff already ships the formulation payload — have the chat answer stream back
  a link to restore the exact lab scenario (session id round-trip).

---

## 3. UX/UI Flow Redesign

### 3.1 Current flow (as coded)

```
Landing "Setup Hub" (GenesisOrbLanding)
 ├─ banner + 3 static explainer cards + preset grid + herb grid + statute notes
 ├─ "Open Active Workbench →"  ──► Workbench (one 6-panel scroll)
 │      ├─ QualityPatentabilityMatrix (hero, but buried mid-scroll? — no, top ✓)
 │      ├─ RatioMatrixBoard ⟷ LivingRasaCard (sticky)
 │      ├─ PatientSafetyPanel → ProsAndConsPanel → OptimizationDirectivesPanel
 │      ├─ StatutoryAccordions (6 accordions + Pre-FER / Dossier / Chat buttons)
 │      └─ toolbar select ↔ preset switching, "← Setup Hub" toggle back
 └─ preset card click ─────────► Workbench (preset loaded)
```

**Problems:** binary mode-switch (Setup ↔ Workbench) with no sense of progress; the
"destination" (dossier) is reachable only via a tertiary button inside an accordion
toolbar; the explainer promises "The 'What-If' Matrix" but never says *why* I'm here;
7 stacked panels of near-uniform white cards + 10 px text read as one gray wall;
back-navigation is a literal `←`; the quadrant — the single best idea in the module —
shares visual weight with everything else.

### 3.2 Proposed journey

**Frame the whole module around one question shown at every stage:
"Will the IPO grant this, and what must change?"**

```
0 · INTENT (landing, redesigned)
    "What are you optimizing for?" → [Patent strength] [Classical ASU licence]
                                     [Lowest benefit-share]  → sets score weights
    recent saved scenarios · preset archetypes · 30-sec "how the score works"
        │
1 · COMPOSE                      stepper: ● 1 ─ 2 ─ 3 ─ 4
    searchable herb drawer (from /herbs) · drag-drop chips onto a live
    100 % donut · per-herb slider + lock · "auto-normalize" ·
    catalog cards show marker + category + safety ceiling inline
        │
2 · BALANCE (hero stage)
    quadrant map, larger, with golden-zone legend, trajectory trail,
    ghost pin for scenario A, and DRAG-TO-SOLVE (inverse sim ⇒ move list)
    LivingRasaCard rail: tier, CI, bioavailability, royalty, cost/unit
    directives = "3 moves to Golden Quadrant" (apply / preview-on-hover)
        │
3 · EXAMINE
    Pre-FER as a full work-stage, not a modal: objections as cards
    (FATAL red / OVERCOME green / ADVISORY amber), each with
    "apply remedy" deep-link back into COMPOSE/BALANCE
    claim draft panel · "consult legal AI" hands payload to /chat
        │
4 · EXPORT
    dossier checklist gates on 0 FATAL objections ·
    what's-included preview · PDF · JSON · share-link ·
    "re-exam after any change" nudge (re-validation state)
```

Flow guarantees: **first useful signal within 1 s of the first slider drag** (client
engine), **server truth within 400 ms** (debounced `/simulate`), **a visible progress
rail toward a filing-ready dossier**, and **every verdict is explainable** (tooltip →
statute → corpus).

### 3.3 Visual direction (fixes "poor appeal" by extending the lab's own good parts)

- **Stay on-theme**: the existing lab already has the right ingredients — a saffron
  gradient sub-header banner, a 4-tile KPI strip, Playfair serif page titles, and the
  two-column bench. The problem is these are under-used and the shipped React page
  renders none of them (it uses a flat `#F4F6F9` + `#00263f` card stack). Bring the
  in-project lab look into the real app.
- Give the **quadrant + optimization curve** real visual weight (they are the hero
  data-viz), on parchment/white cards — never a dark panel.
- Type scale: Playfair 22–28 px titles, 14 px Inter body minimum, tabular numerals for
  the KPI strip only.
- State choreography: count-up on KPI numerals, pin eases across quadrant zones,
  directive rows slide. Empty states teach with a worked example.
- Consistent card headers: name → value → one-line plain meaning
  ("CI 0.61 — the combo is 39 % stronger than the sum of its parts").

---

## 4. Design Direction v2 — Re-anchor to the IP-SAKTI Sahayak Chat UI

> **v1 mockups (§5) are rejected and superseded.** They were generated against the
> wrong design system ("Ayush IP Intelligence" — teal + dark instrument panels +
> JetBrains Mono), which does not match the shipped product.

### 4.1 The theme of record (verified against the project's OWN prior Formulation Lab screens)

The Chat UI project (`3641030747099172044`) already contains **seven** previously
generated Formulation Lab screens — "Ratio Impact Simulator", "Interactive Ignition
Reactor", "Genesis Interactive Workspace", "High Power Upgrade (Divya Rasayana)",
"Low Power Decrement (Bala Kashaya)", "Diagnostic Web Console", "Dynamic Web Studio".
I inspected them. The redesign must extend **this** established language, not invent a
new one. Bound design system = the project's active theme
**`assets/40018462882841c0867bacd689e72cf1` — "Ayurvedic Scholarly Interface"**
(Playfair Display serif headings, saffron `#C0392B`, emerald `#1A7F4E`, parchment
`#F7F4EF`/`#FFFCF7` cards) layered on the shared **navy portal chrome**.

The observed, non-negotiable recipe (from the existing lab screens):

| Region | Spec (as it already renders in-project) |
|---|---|
| Top ribbon | Navy `#002855`; bilingual "भारत सरकार \| GOVERNMENT OF INDIA · आयुष मंत्रालय \| Ministry of Ayush"; right: FONT SIZE A- A A+, English \| हिन्दी; 3px saffron→green hairline at the very top |
| App header | White band, Ashoka emblem + "आयुष मंत्रालय / Ministry of Ayush \| IP-SAKTI Sahayak", download/help/avatar/Sign In |
| Left sidebar | Dark navy `#00263f`: Dashboard, Ayurveda Library, Patent Gazette & Prior Art, **Formulation Lab (active = saffron fill/spine)**, Latest Rules & Regulations; session search; QUICK ACTIONS; Login/Sign Up footer |
| **Sub-header banner** | A **saffron/amber gradient strip** directly under the header carrying the live formulation name + "Chou-Talalay CI 0.68 · Clears §3(e)" + "Rasa Tier IV · 8,240 Ojas" — this is the lab's signature element; keep it |
| Page title | **Playfair Display serif**, deep navy, e.g. "Formulation Alchemical Reactor", with a green `TIER IV · YUVAN` chip beside it |
| **KPI strip** | Four stat tiles under the title: `100.0% BALANCED` (navy) · `0.68 SYNERGY / CLEARED` (green) · `92% TKDL` (navy) · `3.5% ABS ROYALTY` (saffron) — big colored numerals, small-caps labels |
| Canvas / cards | Parchment `#F7F4EF` ground; `#FFFCF7` white cards, 1px `#E7E0D4` hairline, 4–8px radius, no heavy shadow; 3–4px left spine: saffron=alert, green=verified/cleared, rose=fatal |
| Chips | 4px radius (not pills), 11–12px semibold Public Sans/Inter small-caps; green=cleared/verified, saffron=classical/flagged, rose=bar/hazard, navy=classification |
| Type | Headlines **Playfair Display 600** navy; body Inter 14/22; labels Inter/Public Sans uppercase tracked; numerals tabular — **serif titles are on-brand here, do not remove them** |
| Primary button | Navy `#00263f`/`#0b3c5d` fill white text 4px radius (e.g. "Lock & Examine / Generate Pre-FER"); green `#1B5E20` for verify/apply; saffron reserved for the banner + active nav |

> Correction to earlier draft: v1 said "no serif, no dark panels, bind National Portal
> DS". Wrong — the shipped lab screens use Playfair serif titles, a saffron gradient
> banner, and the Scholarly Interface DS. This section now matches the real pixels.

### 4.2 How the Formulation Lab works — end-to-end (extends the existing bench)

The existing "Ratio Impact Simulator / Ignition Reactor" bench is good and should be
**kept and completed**, not replaced. Four surfaces inside the same shell:

```
Sidebar ▸ Formulation Lab
   │
   L0 · LAB HOME / PICKER
   │   Reuse the "Genesis Interactive Workspace" idiom: Playfair title +
   │   bilingual subtitle, "CONTINUE RECENT WORK" (saved scenarios as cards
   │   with tier + CI chips), "VALIDATED ARCHETYPES" grid (preset cards with
   │   target-tier + §3(e) status chips), and a "＋ New Formulation" card.
   │
   L1 · BENCH  (the existing two-column lab — keep this layout)
   │   Sub-header saffron banner: live formulation name · CI · Rasa tier
   │   KPI strip: BALANCED / SYNERGY-CLEARED / TKDL / ABS ROYALTY
   │   LEFT column:
   │     · "Ingredient & Stoichiometric Modifier Matrix" card — stacked 100%
   │       composition bar on top, then herb rows (Ashwagandha, Shilajit,
   │       Haridra, Pippali, Ghrita): name + Sanskrit + marker chip, slider,
   │       ±chips, lock, green/rose delta chip; footer sum chip + Auto-Balance
   │       + Reset baseline + "+ Add constituent" (searchable /herbs drawer)
   │     · "Phytochemical Fingerprint & HPLC Assay Markers" card (peak chart)
   │   RIGHT column:
   │     · "Synergy Reaction Map" card — pairwise nodes (Yogavāhī amplifier),
   │       Potency/Ojas meter bar, Tier progression (बाल→दिव्य)
   │     · "Section 3(e) Patent Analysis" card — OVERCOME/CLEARED green chip
   │       or rose "MERE ADMIXTURE" bar + plain-language line + light quadrant
   │       mini-map (white, tinted zones, navy dot + dotted trail — never dark)
   │     · "Patient Safety" card — dose-vs-API-ceiling bars, saffron/rose spines
   │     · "Directives" — How to improve / What to remove rows, each with green
   │       [Apply] + outline [Preview] (drives the same handlers as today)
   │   Full-width footer: "Multi-Herb Ratio Sensitivity & Benefit Optimization
   │       Curve" line chart + navy [Run Pre-FER Examination →] CTA
   │
   L2 · EXAMINATION (Pre-FER) — promote from modal to a document view
   │   letterhead "Simulated First Examination Report · IPO Group 14",
   │   patentability scorecard, objection cards (spine = FATAL rose /
   │   OVERCOME green / ADVISORY saffron), each with [Apply remedy in Bench]
   │   + [Discuss in Legal Advisor] (existing /chat payload handoff);
   │   "Recommended Claim Draft (Form 2)" panel; offline = "CLIENT-ESTIMATED"
   │
   L3 · DOSSIER — A4 preview card + checklist gate (export enabled at 0 FATAL),
   │   [Download JSON] [Print / Save PDF] [Hand to Legal Assistant →]
```

Cross-link: a chat answer that references a formulation renders a
"Formulation: <title> · CI x.xx" citation chip that reopens the Lab at that saved
scenario (round-trip via scenario id in the existing chat handoff params).

### 4.3 Behavioral rules

1. **Instant + verified**: client engine re-scores on every drag (labelled with a
   subtle "live" dot); debounced 400 ms `/simulate` flips the verdict card's chip to
   "server-verified ✓". Any client/server mismatch is shown, never hidden.
2. **Never lose work**: bench autosaves to the scenario store (sqlite `formulations`
   table); L0 "Continue recent work" lists them with tier + CI chips.
3. **Every verdict explains itself**: metric labels carry an (i) popover → statute,
   plain-language meaning, and corpus source (TKDL/API/BDA), matching the chat's
   citation-chip convention.
4. **Bilingual + GIGW**: ribbon font-size and English/हिन्दी controls apply to lab
   chrome and card headers (Sanskrit names always shown inline, per current data).
5. **States are first-class**: empty bench (teaching state with a worked example),
   loading (hairline shimmer on cards, no spinners-in-blank-space), offline
   (clearly-badged client estimates), unbalanced 100% (saffron, never red — red is
   reserved for FATAL/legal failures).

### 4.4 Component mapping (what changes in code)

| Existing | Action |
|---|---|
| `page.tsx` shell, breadcrumb bar | Render inside the shared app shell (Header + navy Sidebar already exist) with the Formulation Lab nav item active; add the saffron sub-header banner + 4-tile KPI strip; switch `view: home \| bench \| examine \| dossier` |
| `GenesisOrbLanding` | Restyle as L0 picker using the "Genesis Workspace" idiom (Playfair title, continue-recent + archetype cards with tier/§3(e) chips); drop the 3 gray explainer boxes |
| `RatioMatrixBoard` | Keep logic; restyle rows (chips, hairline spines), add stacked composition bar |
| `QualityPatentabilityMatrix` | Split: verdict headline + light quadrant mini-map into the Verdict card; delete dark/mono styling |
| `LivingRasaCard` | Fold tier badge + Ojas bar into Verdict card; remove fake tier-preview control (replace with real target-tier solve, P1) |
| `PatientSafetyPanel`, `ProsAndConsPanel`, `OptimizationDirectivesPanel` | Merge into the right-rail Directives + Safety cards; Apply buttons keep current handler wiring |
| `StatutoryAccordions` | Convert section titles to citation-chip row; accordion bodies keep content |
| `PreFERModal` | Demote modal → L2 full view (keeps fetch + fallback logic; add offline badge) |
| `DossierExportModal` | Move to L3 view; add checklist gate from `objections[].severity` |

## 5. Mockups — GENERATED (v2, on-theme, visualization-heavy)

Generated **in the IP-SAKTI Sahayak Chat UI project (`3641030747099172044`) bound to the
"Ayurvedic Scholarly Interface" design system
(`assets/40018462882841c0867bacd689e72cf1`)** — the same theme the project's seven
existing Formulation Lab screens already use, so these are visually consistent with them.

Two mandates from the brief are built into every screen:
- **Visualization-heavy**: the Bench carries a stacked 100% composition bar, an HPLC
  phytochemical fingerprint area-chart, a Quality × Patentability **quadrant map** with
  trajectory pin + dashed goal ring, and a full-width **Ratio-Sensitivity & Benefit
  Optimization Curve**; the Examination carries a circular patentability gauge.
- **Goal assistance**: a persistent **"Patent Readiness %" rail** with pass/fail gate
  chips (✓ Sum 100% · ✓ §3(e) Cleared · ✓ Safety · ⚠ §3(p) with a concrete
  "add Guduchi to drop below 90%" action), a **dashed goal ring** on the quadrant
  ("stay above 80/75"), and a **"Next Best Moves — Path to Golden Quadrant"** card whose
  rows each show projected impact (+% synergy, CI delta) and a one-click **Apply**.

| # | Screen | Status | Preview |
|---|---|---|---|
| M2 | L1 Bench — live (flagship) | ✅ generated + visually verified | [screenshot](https://lh3.googleusercontent.com/aida/AEtjO1Wm5PcqOlCNhwryHwbnzgEpJokZden4m3Ip_0FakEThk1-yVMu2IkY1pFyYYcoksFETn9euY513rn7t9w-EtKBTrR5-_-cF9999Terl-AH_EmH6E3C4cbf_5r5rayepNCkAxCEdgowojfkt_N4KuFmCq-qigknJAvX-B4VRdNyUegM2yUtOC8XzMGZnvHTN1pOSVZ8DC7xCflSclJb12NjsbAinT9ioihAbJ1iH73PqDNiN3BH2KvwW0bg) |
| M1 | L0 Home / starter picker (goal explainer + archetypes) | ✅ generated | open in [Stitch project](https://stitch.withgoogle.com/p/3641030747099172044) → "Formulation Lab: Home & Starter Picker" |
| M4 | L2 Pre-FER Examination (gauge + gate rail + objection spines) | ✅ generated | [screenshot](https://lh3.googleusercontent.com/aida/AEtjO1WcLj-BozRgTkI0DovG_jtk8593QlwkAFLQCpYFBxU4XzKa0l-iuf5Z6Q1U9Rj8UXkkztHJWs6j6qeI0C77eQBvvuqOnpTDrZxabr_DeDki1bBO_1n7ONBdtqjUReIiCRGkVIfzN7fIYRblIkf3TjfGyeA9zs1nnEvjfYRyjHTadeEn2eclkRTvhcxqBP5d7TuWyaVlXTekU9JnY4CGNesPhvIC6nkDHVICQAk33zYOtYCQFHFobJnez4E) |
| M5 | L3 Dossier export (A4 preview + gated checklist) | ✅ generated | open in [Stitch project](https://stitch.withgoogle.com/p/3641030747099172044) → "Regulatory Submission Dossier" |
| M3 | Bench §3(e)-bar / hazard variant | queued (reuse M2, flip verdict spine to rose + hazard rows) | — |
| M6 | Tablet 2-panel slide-over | queued | — |

All editable HTML for each screen is in the Stitch project. **Next step:** review M2/M1/M4/M5
there; on approval, start P0 (frontend honesty fixes + catalog fetch) then implement the
Bench to match M2.

### v1 mockups (rejected — wrong design system, kept for reference only)

Generated in project `12403772305399348861` against "Ayush IP Intelligence" (teal/dark
instrument theme): Start/Intent landing, Balance Workbench, Examine & Export.
They are **off-brand** vs the shipped app and must not guide implementation.

---

## 6. Design vision, working model & component sourcing (21st.dev + Superdesign)

Context source: the user's own **IP-SAKTI Sahayak Chat UI** Stitch project
(`3641030747099172044`) — its 7 existing Formulation Lab screens + the "Ayurvedic
Scholarly Interface" design system. Recommendations below are cross-checked against
that theme so anything we build stays on-brand.

### 6.1 The vision (what the Lab is *for*, in one line)

> **A patent chemist's cockpit**: a single screen where an Ayurvedic formulation is
> tuned like an instrument while its statutory fate — §3(e) synergy, §3(p) prior art,
> BDA benefit-share, patient safety — updates live, and the shortest path to a
> filing-ready dossier is always visible and one click away.

Three design pillars, derived from the existing chat screens' "Analytical High-Density
Precision / Scholarly Authority" language:

1. **Legibility over decoration** — parchment ground, hairline cards, Playfair titles,
   tabular numerals. No dark panels, no glow-for-glow's-sake.
2. **The verdict is the hero** — the Quality × Patentability quadrant + a plain-language
   §3(e) line are the most prominent objects; everything else supports them.
3. **Always show the next right action** — a persistent goal rail + "Next Best Moves"
   so the user is never staring at numbers wondering "so what do I change?"

### 6.2 Desired working model (how it behaves, not just looks)

| Layer | Behaviour |
|---|---|
| **Input** | Add herbs via a command-search drawer; tune each % with a slider + ±stepper + lock; Auto-Balance normalises to 100.0% w/w respecting locks. |
| **Live recompute** | Client engine re-scores on every drag (sub-second, "live" dot); a debounced 400 ms `/simulate` flips the verdict to "server-verified ✓". Client/server mismatch is surfaced, never hidden. |
| **Goal rail** | "Patent Readiness %" meter with discrete gates: Sum=100 · §3(e) CI<0.75 · §3(p) concordance<90 · Safety 0 critical · BDA classified. Each unmet gate renders one concrete action. |
| **Directives** | "Next Best Moves" ranks the ≤3 edits that most raise readiness, each with projected impact (CI −0.08, TKDL −6%) and one-click Apply that drives the same handlers as the sliders. |
| **Examine** | Pre-FER as a document stage (gauge + severity-spine objection cards); every objection offers *Apply remedy in Bench* (jumps back with the fix staged) or *Discuss in Legal Advisor* (chat handoff). |
| **Export** | Dossier gated on 0 FATAL objections; JSON / print-PDF / chat round-trip. Any later edit re-opens the gate ("re-validate" nudge). |
| **Persistence** | Autosave to the scenario store; Home shows "Continue recent work"; a chat citation chip can reopen the exact saved scenario. |

### 6.3 Flow (screen-to-screen)

`Home/picker → Bench (Compose ⇄ Balance, live) → Examination → Dossier`, with two
return loops that make it feel like an instrument, not a form: **objection → Bench**
(apply remedy) and **Bench/Dossier → Chat** (legal assistant), plus **Chat → Bench**
(restore scenario). The stepper is navigation *and* progress *and* a gate checklist.

### 6.4 Component recommendations — 21st.dev (verify before adopting)

21st.dev is a React + Tailwind + shadcn-compatible registry (copy TSX, or
`npx shadcn@latest add <registry-url>`, or pull via the 21st MCP/CLI) — a direct fit
for our Next.js 16 / Tailwind v4 frontend. Best match per Lab surface (author · slug):

| Lab surface | Recommended 21st.dev component(s) | Why / how to theme |
|---|---|---|
| **Composition bar** (stacked 100% w/w) | Partition Bar `@8starlabs/components/partition-bar`; Share Strip `@eugeneshilow/components/share-strip` | Segmented ratio bar; feed herb colors from the DS palette. |
| **Herb ratio slider** | Slider/range `@coss.com/components/slider/range`; Slider with plus-minus `@originui/components/slider/slider-with-plus-munis`; Slider/tooltip `@sean0205/components/slider/tooltip` | Range + stepper + value tooltip; set accent to saffron `#C0392B`. |
| **KPI tiles** (CI, TKDL, royalty, readiness) | Statistics Card 7 `@sean0205`; Stats card with progress `@ephraimduncan`; Progress Metric Card `@makviesainte`; Badge Delta `@serafimcloud/components/badge-delta/solid` | Big numeral + trend delta chip; matches the 4-tile strip in M2. |
| **Patentability gauge** (92/100) | Animated Circular Progress Bar `@dillionverma`; Circular Progress Card `@kavikatiyar`; Apple Activity Ring `@kokonutd/components/apple-activity-ring` | Pre-FER score dial; ring color = verdict state. |
| **Quality × Patentability quadrant** | No drop-in 4-quadrant scatter — build on ReUI chart `@sean0205` or visx `@airbnb-visx/components/glyphs`; borrow axes from Indicator Chart `@arihantcodes…/indicator-chart` | The signature viz; custom SVG zones + a draggable pin (inverse-sim). |
| **Tridosha balance** | Radar Score Chart `@sean0205/components/c-chart-24` | Vata/Pitta/Kapha as a 3-axis radar. |
| **HPLC fingerprint** | Area Chart `@reaviz/components/area-chart-1`; Area Chart w/ glowing markers `@sean0205/components/c-chart-16` | Marker peaks with PASS chips. |
| **Optimization curve** | SMA Chart `@ssychui/components/sma-chart`; Line Charts `@sean0205/components/line-charts-9` | Dual CI-vs-royalty lines + current marker. |
| **Goal rail / stepper** | Animated Progress Stepper `@shadcnspace/components/stepper-03`; Segmented Progress Pill Stepper `@shadcnspace/components/stepper-04`; Onboarding Checklist `@chowlol202/components/onboarding-checklist` | The gate checklist doubles as the Compose→…→Export stepper. |
| **Herb search drawer** | Command `@shadcn/components/command`; Apple Spotlight `@samitkapoor`; Autocomplete fuzzy `@prebuiltui/components/autocomplete/fuzzy-matching`; ReUI Autocomplete search-results `@sean0205` | Cmd-K herb picker with category groups. |
| **Stoichiometric matrix table** | Data Grid Table (sticky header / column controls) `@sean0205/components/data-grid-table/sticky-header`; Excel-Style Table `@ravikatiyar162` | Editable rows with inline sliders. |
| **Objection cards** | Comparison `@hirael/components/comparison-02`; The Item `@felipemenezes098` | Severity-spine cards. |
| **Glossary tooltips** | Tooltip with chart `@originui`; shadcn tooltip | Explain CI, Yogavāhī, Ojas inline. |
| **Empty/teaching state** | EmptyState no-data `@uniquesonu`; Cnippet Empty `@cnippet-dev/components/cnippet-empty/no-results` | First-run worked example. |
| **Shell / sidebar** | Dashboard with Collapsible Sidebar `@uniquesonu`; App Dashboard Layout `@shadcnstore/components/app-1` | Matches the navy chrome + active saffron item. |

Adoption rule: pull the TSX, then **re-map every color/radius token to the Ayurvedic
Scholarly Interface DS** (parchment `#F7F4EF`, saffron `#C0392B`, emerald `#1A7F4E`,
4px radius, Playfair/Inter). Never ship a component with its default palette.

### 6.5 Superdesign — what it is and how to use it here

**Superdesign (superdesign.dev) is an AI product-design *agent*, not a component
registry** — closest analogue to the Stitch tool we're already using: prompt → UI on an
infinite canvas, with codebase awareness, IDE/MCP integration, a **DESIGN.md** spec, and
a curated design-prompt library. So it does not supply drop-in components like 21st.dev.
Recommended role for us:
- **Divergent exploration**: run the Bench/quadrant prompts through Superdesign to get
  alternative layouts we can lift structural ideas from, then rebuild on our DS.
- **DESIGN.md discipline**: mirror its "one design spec file drives generation" pattern —
  our §4.1 token table is effectively that spec; keep it authoritative so any tool
  (Stitch, Superdesign, 21st) renders the same theme.
- **Not** a source of truth for components — that stays 21st.dev + our own shadcn/ui.

### 6.6 Recommendation summary (decision-ready)

1. Keep the **Stitch Chat UI theme** (Ayurvedic Scholarly Interface) as the single design
   contract; the M1/M2/M4/M5 mockups already conform.
2. Implement the Lab with **21st.dev components** from §6.4 (sliders, stats cards,
   circular gauge, radar, stepper, command search, data-grid) — fastest path, shadcn-native,
   theme-re-mappable — except the **quadrant map + synergy network**, which we build custom
   on visx/ReUI because no drop-in matches.
3. Use **Superdesign** only for structural ideation + to reinforce the DESIGN.md workflow.
4. Next concrete step: a **combined-component Bench mockup** (this pass) that stages the
   recommended pieces together on-theme, then P0 code once approved.

### 6.7 Combined-component Bench (assembly view) — status

A dedicated "assembly" Bench that stages the recommended 21st.dev pieces together
(animated stepper goal-rail · 4 KPI stat cards w/ sparkline+delta · partition-bar
composition + slider+stepper rows · Cmd-K command-search herb picker open · circular
92/100 patentability gauge · 3-axis Tridosha radar · Next-Best-Moves card) was submitted
to Stitch project `3641030747099172044` on the Scholarly Interface DS. Both submissions
hit the **known Stitch MCP call timeout** (generation continues server-side; the
`list_screens` endpoint is capped and did not echo it back for verification). It is
queued, not lost — re-run on demand or check the Stitch canvas.

Note: the already-verified **M2 Bench** mockup demonstrates this combined-component
approach in practice (partition composition bar, per-herb sliders with lock/delta,
4-tile KPI strip, quadrant map with goal ring, HPLC area chart, sensitivity curve,
Next-Best-Moves with Apply) — so the assembly screen is a redundancy, not a gap.

Component → mockup → code traceability:

| Recommended 21st.dev | Appears in mockup | Frontend target |
|---|---|---|
| Partition Bar / Share Strip | M2 composition bar | new `<CompositionBar>` in `RatioMatrixBoard` |
| Slider/range + plus-minus | M2 herb rows | restyled `RatioMatrixBoard` rows |
| Statistics Card + Badge Delta | M2 KPI strip | new `<KpiTile>` |
| Animated Circular Progress | M4 gauge | Pre-FER `<PatentabilityGauge>` |
| Radar Score Chart | assembly Tridosha | new `<TridoshaRadar>` (replaces bar) |
| Animated Progress Stepper | M2/M4 goal rail | new `<GoalRail>` |
| Command / Autocomplete | assembly herb picker | `<HerbDrawer>` for `/herbs` |
| Data Grid Table | M2 matrix | `RatioMatrixBoard` |
| Area Chart (glowing markers) | M2 HPLC | `StatutoryAccordions` HPLC panel |
