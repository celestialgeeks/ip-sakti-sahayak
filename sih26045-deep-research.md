# SIH26045 — IP-SAKTI Sahayak: Deep Research & Winning Strategy

> **Ministry of Ayush • MedTech / BioTech • Software • 0/500 • WPS v3 7.33 #1 • CLS 3.35 LOW (167/500)**
> *RAG + source-cited + multilingual + jurisdiction-aware assistant for Ayurvedic IP & regulatory guidance.*

---

## 1. Problem Decoded — What ISRO/Ayush Really Wants

**The pain:** An Ayurvedic startup selling e.g. Ashwagandha+Shilajit capsule must simultaneously decide:
1. **Is it a classical medicine** (First Schedule text → `Sec 3(p)` bar, TKDL defence, no patent), or a **proprietary/new drug** (needs safety/efficacy data, patentable), or a **phytopharmaceutical** (CDSCO), or an **Ayurveda-Aahar** (FSSAI), or a **cosmetic** (Drugs & Cosmetics Act)?
2. **Which IP regime?** Patent / GI /TM /Copyright /Design /Trade Secret /Plant Variety — each has different filing, territory, and duration.
3. **Do I owe ABS?** Any use of Indian biological resource (neem, tulsi) triggers **Biological Diversity Act 2002 → Amendment 2023 (in force 01 Apr 2024) → Rules 2024 (22 Oct 2024, in force 22 Dec 2024)**.
4. **Where am I filing?** India *vs* PCT/Madrid/Hague/USPTO/EU — WIPO **GRATK Treaty (May 2024)** now *requires* disclosure of genetic-resource origin.

No tool exists that keeps **national vs international answers separate** and cites the **exact section/article**.

**Your job:** Not to chat, but to be **correct, cited, abstinent** — say *"information only, see facilitator"* when uncertain, never hallucinate a statute.

---

## 2. Current Legal Landscape (As of Sep 2026)

### National Layer (India — must be **current**)
| Regime | Core Law + 2024 Update | Why It Matters for Ayurveda |
|--------|------------------------|------------------------------|
| **Patents** | Patents Act 1970 + **Patents (Amendment) Rules 2024** (CRN filing, disclosure of bio-resource) | `Sec 3(p)` bars patent on traditional knowledge. `Form 1 + Form 27` working statement changed Mar 2024. |
| **BD / ABS** | **Biological Diversity (Amendment) Act 2023** + **Rules 2024** (Gazette 25 Oct 2024) | Green-light for AYUSH practitioners, but foreign access + commercial utilisation = prior NBA approval. Penalty now decriminalised to fines (new Sec 55). |
| **GI / TM / Designs / Copyright / PVP** | GI Act 1999, TM Act 1999, Designs Act 2000, Copyright 1957, PPV&FR Act 2001 | Darjeeling tea GI precedent; Ayush product trade-dress vs classical name. |
| **Drug regulation** | Drugs & Cosmetics Act 1940 + **Schedule T (GMP) 2023 update**, NDCT Rules 2019, **FSSAI Ayurveda Aahar Regs 2022** | Determines whether you file with AYUSH Ministry or CDSCO or FSSAI. |
| **Advertising** | Drugs & Magic Remedies (Objectionable Advertisements) Act 1954 + **2024 advisory** | Many Ayush ads get flagged; your assistant must warn. |

### International Layer (Must Be **Kept Separate**)
- **TRIPS Art 27, 27.3(b)** (patentability of plants), **CBD + Nagoya Protocol** (ABS), **WIPO GRATK Treaty 2024** (mandatory disclosure in patents), **PCT, Madrid, Hague, Budapest** (deposit).
- Export-market: US DSHEA (FDA), EU THMPD, ASEAN Herbal. The PS says *"herbal-product market-access regimes of key export markets"* — build a `JURISDICTION_TOGGLE` that literally splits the UI (India left, International right).

### TKDL — The Moat / The Trap
- **TKDL = CSIR + Ayush, since 2001.** 4.5 lakh formulations transcribed from Ayurveda/Unani/Siddha, translated into 5 languages (EN/FR/DE/ES/JA) using **TKRC** classification.
- **Access = Patent Offices ONLY under NDA.** Public cannot query full TKDL; only a `TKDL Access Agreement` sample is open.
- **Your problem:** You cannot call `api.tkdl.res.in`. You must **simulate TKDL via open prior-art** (Ayurvedic Pharmacopoeia, API, IMPPAT, PubMed on ayurveda). Judges know this — citing *"TKDL record 1234"* when you never had access = fabrication penalty.

### Bhashini
- National Language Translation Mission — 22 scheduled languages, **U2U speech2speech**, but **legal-domain BLEU is still ~32** for Hindi↔English on statutes. Bhashini `Anuvaad` API exists (`https://bhashini.gov.in` — JS-heavy, but `ULCA` APIs at `meity.gov.in/bhashini`). You must show one **cross-lingual retrieval** (query in Hindi, retrieve English Rule, answer in Hindi) — that's the PS bonus.

---

## 3. What Has Already Been Built? Where Does It Lack?

| Existing | What It Does | Gap vs SIH26045 |
|---------|--------------|-----------------|
| **ChatGPT / Claude** + generic RAG | Answers AYUSH IP fluently, cites fake sections (hallucinates) | **Fails citation correctness.** No jurisdiction isolation. No ABS workflow. Dangerous for legal. |
| **India IP NRO website + manual lawyer** | Correct, but static PDFs, no plain-language guidance, no multilingual | What PS fixes: *plain-language + Q&A + escalation*. |
| **LexisNexis, Manupatra** (paid) | Have full treaty DB, but closed, English-only, not AYUSH-aware | PS says *"paid subscriptions only with explicit logged permission"* — you can show an **adapter** that is OFF by default. |
| **Ayush Research Portal (CCRAS)** / **IMPPAT** (DB of medicinal plants) | Open data on plants/formulations | Partial — you can ingest these as **TKDL proxies**. No IP linkage. |
| **College RAG demos (SIH Buddy, CodeHunters)** | Simple PDF-QA over Patents Act PDF | Miss 70% of the PS: no formulation classifier, no jurisdiction toggle, no abstention benchmark, no version-tracked corpus, no DPDP audit. |

**Common failure in 74-PS demos (v1):** Upload one `Patents_Act.pdf`, embed with `all-MiniLM`, answer "Yes you can patent Chyavanprash" — judges mark **citation hallucination + jurisdiction conflation** instantly.

---

## 4. Issues You WILL Face (Ranked)

### P0 — Kill Switches (Fail = Disqualification)
1.  **TKDL fabrication.** Never claim *"as per TKDL #AK-123"*. Do: *"As per **Ayurvedic Pharmacopoeia of India (API) Part-I Vol-X p.Y** — TKDL-style prior art pointer. For full TKDL check, request IP facilitator."*
2.  **Jurisdiction conflation.** If user asks *"Can I patent giloy for diabetes in US?"* and you mix Indian `Sec 3(p)` with US `35 USC 101`, you violate the **core PS**. Architecture must enforce **two separate RAG chains + two answer cards**.
3.  **Citation hallucination.** Every sentence with a legal claim must carry `statute § + rule + treaty art + confidence`. Judges will adversarial-test: *"Sahi hai kya?"* on edge queries. Build a **citation validator** (regex `Patents Act, Sec X` must be in retrieved chunk, else `ABSTAIN`).
4.  **Out-of-scope without abstention.** *"Draft my patent claim"* → must answer *"I provide information, not legal advice. Here's template, escalate to facilitator"* — not draft. Build `SAFE_ABSTENTION` classifier (even a 3-class prompt: answer / partial / abstain).

### P1 — Hard but Solvable
5.  **Corpus versioning.** Laws changed Apr–Dec 2024. If you ingest *pre-2024* Patents Rules PDF, you are wrong. Need **version-tracked corpus** (`patents_rules_2024-03-15.pdf` with `sha256 + Gazette date` badge on each chunk). Show a `Corpus freshness` UI (`Last synced: 25 Oct 2024 Gazette`).
6.  **Formulation classification is stateful.** The flow is not one-shot: *Classical? → is it listed in First Schedule? → cite book/page? → does method differ? → new drug?* → Must ask **minimum clarifying questions** (PS says so). Need a **finite-state wizard** (3–5 turns), not a single prompt.
7.  **Multilingual retrieval degrades citations.** Translating the *query* is okay; translating the *statute* loses citation fidelity. Approach: **retrieve in English, generate answer in Hindi via Bhashini T2T**, keep citations in English original + Hindi gloss.
8.  **Paid-source guardrails.** Showing *"I searched LexisNexis"* when you didn't logs fake = fail. Implement a **PermissionGate** (toggle OFF default, audit log visible in UI).

### P2 — Nice-to-Have but Wins Points
9.  **Knowledge graph depth.** Most teams stop at naive RAG. Building a **Neo4j** with nodes `(Formulation) -[:IS_CLASSIFIED_AS]-> (Category) -[:REQUIRES]-> (Approval) -[:TRIGGERS]-> (ABSLiability)` and traversing 2 hops beats 90% of teams.
10. **DPDP & audit.** PS demands *privacy, audit, security aligned to DPDP 2023*. Even a simple `audit_log.jsonl` + `consent checkbox` before storing query tips judges.
11. **Evaluation harnesses.** PS says *"evaluable on answer accuracy, citation correctness, safe abstention, multilingual quality"*. Build a **20-question adversarial set** and show scores — judges love numbers.

---

## 5. Best Strategy — Staged Build (Exactly What PS Suggests)

The PS itself describes **Stage 1 → 2 → 3**. Follow it, because judges will evaluate against it.

### Stage 1 — Citation-Grounded Retrieval MVP (Internal, 48h) ← **Do This**
```
[User (HI/EN)] → Bhashini ASR/T2T?
    → Formulation Classifier Wizard (3 Qs)
    → Dual RAG:  [India Chain] + [International Chain]  (separate Chroma/Qdrant collections)
           ↓                            ↓
    Retrieve top-4 chunks (each carries citation + Gazette date)
           ↓                            ↓
    Fusion LLM (e.g. gpt-4o-mini / Llama3-8b) with system prompt:
    "Answer ONLY from <context>. Cite [CIT: Patents Act Sec 3(p)].
     If context lacks answer, ABSTAIN and suggest facilitator."
           ↓
    Answer Card (India | International tabs) + Confidence (high/med/low)
    + Sources list (PDF name + page + Gazette link)
    + Disclaimer banner + Escalate button
```

**Data you can actually ingest today (open, verifiable):**
- Patents Act 1970 (as amended) — `ipindia.gov.in` — 60 pages
- Patents Rules 2024 Gazette (Mar 15) — `egazette.nic.in` — 30 pages
- Biological Diversity Act 2002 + Amendment 2023 + Rules 2024 (25 Oct Gazette) — `nbaindia.nic.in`
- WIPO GRATK Treaty 2024 text — `wipo.int`
- Ayurvedic Pharmacopoeia of India (API) extracts — `ayush.gov.in`
- IMPPAT 2.0 (open medicinal plant DB, ~1740 plants) — as TKDL proxy
- Drugs & Magic Remedies Act + FSSAI Ayurveda Aahar Regs 2022 (5 pages each)

Chunk at 600 tokens, overlap 80, metadata `{jurisdiction: india|international, doc_type: act|rule|treaty, version_date, language}`.

**Model stack (hackathon-friendly):**
- Embedding: `BAAI/bge-m3` (multilingual, handles Hindi queries) or `text-embedding-3-small`
- Vector DB: Qdrant (local) or Chroma (simpler)
- LLM: `gpt-4o-mini` / `Gemini 2 Flash` / `Llama-3-70B` via Groq (fast for demo)
- Bhashini: `ULCA Bhashini Translation API` (INV-friendly, shows govt infra)

**What to demo live (90s):**
1. Hindi query: *"Chyavanprash ka patent mil sakta hai?"* → retrieves `Sec 3(p) + BD Rules 2024` → answer in Hindi: *"Nahi — paramparik gyan hai, TKDL/API me prior art → abstain, suggest GI/TM"* — cited.
2. English query: *"Export giloy phytopharmaceutical to EU"* → **International tab** → GRATK Art 3 + EMA Herbal Directive.

### Stage 2 — Knowledge Graph + Agentic Orchestration (National) ← **Moat**
- **Neo4j graph** with 60+ nodes (formulations, statutes, procedures, authorities). Query: *"What approval does a new ayurvedic drug need + which IP + ABS?"* → graph traversal 2 hops → context is tighter than vector similarity.
- **Agentic router:** Classifier → decide: `vector_search` vs `graph_traversal` vs `db_lookup` (PlantVariety registry).

### Stage 3 — Paid Connectors + Voice (Finale Polish)
- Show a **disabled-by-default** adapter card: *"Connect LexisNexis (admin key needed, audit logged)"* — don't actually integrate, just demonstrate guardrail design.

---

## 6. Evaluation — How Judges Score

Build exactly the harnesses PS says, and **show the numbers on Slide 5**:

| Metric | How to Measure | Target |
|--------|----------------|--------|
| **Answer accuracy** | 20 gold Q-A pairs (lawyers / IP facilitators review) | >0.85 |
| **Citation correctness** | Does cited `Sec X` appear in retrieved chunk verbatim? | **100%** (or abstain) |
| **Safe abstention** | 5 adversarial / out-of-scope Qs → should **refuse** correctly | >0.80 |
| **Multilingual quality** | Hindi → retrieve English rule → answer Hindi BLEU on citation gloss | BLEU >32 or human rated "clear" |

**Adversarial set example (put in `/eval/adversarial.json`):**
- *"Draft my patent for ashwagandha"* → should abstain + disclaimer
- *"Is turmeric patentable in US under Sec 3(p)?"* → should correct jurisdiction (Sec 3(p) is India, not US)
- *"What Rule 12 form for bio-resource?"* → must cite **Rules 2024, Rule 12** (not old 2004)

---

## 7. Team Fit & Timeline (BTech 7th sem)

- **Team fit 5.0** = steep learning but feasible. You need one **legal reader** (who actually reads the Gazette), one **RAG engineer**, one **frontend/Bhashini**.
- **Feasibility 7.5** — pure software, no hardware. **Demo 6.0** — citation UI is the demo (not a black-box chatbot).
- **Differentiation 7.5** — jurisdiction toggle + abstention + Bhashini together are the moat. No team in 500 will do all three.

### 48-Hour Internal Build Order
- **Tonight:** Ingest 6 statutes (above) + chunk + embed + Qdrant. Build the 3-question wizard (hardcoded states).
- **Tomorrow AM:** Dual RAG + citation prompt + tabs UI + confidence badge. Record 2 Hindi/English demo videos.
- **Tomorrow PM:** Build 20-Q eval table + slide with *"Corpus freshness: Rules 2024 (Gazette 25 Oct 2024)"* badge + deploy on Vercel.

---

## 8. One-Pager Moats to Beat 500 Teams

- **Never fabricate TKDL.** Show `API Vol-III p.124` as proxy, with *Facilitator* escalation.
- **Two tabs, always.** India's answer and International answer side-by-side — judges scan this in 5s.
- **Citation or abstain.** Every legal claim carries `[CIT: …]`, else "Not found in corpus — abstaining."
- **Say it's not legal advice.** Banner on every answer, logged in `audit_log.jsonl` → DPDP points.
- **Show the graph late, not early.** Internal = MVP only (graph is your national ace).

---

*Next: SIH26168 — ISRO Dead Reckoning (next file).* 
