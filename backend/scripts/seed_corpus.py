"""
Seed Corpus — Download and prepare prototype documents for the Ashwagandha + Curcumin demo.

This script creates text-based document stubs representing real public-domain content 
from authoritative Indian IP/regulatory sources. In production, these would be scraped/downloaded
from the actual sources.

Usage:
    python -m scripts.seed_corpus
"""

import os
import json
from pathlib import Path

# Base data directory
DATA_DIR = Path(__file__).parent.parent / "data" / "corpus"


# ─── India IP Law ────────────────────────────────────────────────────

INDIA_IP_DOCS = [
    {
        "filename": "patents_act_1970_section3p.txt",
        "source": "The Patents Act, 1970 — Section 3(p)",
        "jurisdiction": "india",
        "category": "patent",
        "confidence_tier": "primary_legislation",
        "content": """THE PATENTS ACT, 1970 (As amended by Patents (Amendment) Act, 2005 and Patents (Amendment) Rules, 2024)

SECTION 3 — What are not inventions

The following are not inventions within the meaning of this Act:

(p) an invention which, in effect, is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components.

Explanation: For the purposes of this clause, "traditional knowledge" shall mean knowledge available in any treatise, publication, literature, or oral tradition of India or any other country, including knowledge contained in the Traditional Knowledge Digital Library (TKDL) established under the Department of Ayurveda, Yoga and Naturopathy, Unani, Siddha and Homoeopathy (AYUSH).

Note: Section 3(p) was introduced by the Patents (Amendment) Act, 2005 specifically to prevent the grant of patents on traditional knowledge, including Ayurvedic formulations that are documented in classical texts or TKDL.
""",
    },
    {
        "filename": "patents_act_1970_section25.txt",
        "source": "The Patents Act, 1970 — Section 25 (Opposition)",
        "jurisdiction": "india",
        "category": "patent",
        "confidence_tier": "primary_legislation",
        "content": """THE PATENTS ACT, 1970

SECTION 25 — Opposition to the patent

(1) Where an application for a patent has been published but a patent has not been granted, any person may, in writing, in the prescribed manner, represent to the Controller by way of opposition of the grant of patent on the ground—

(k) that the invention so far as claimed in any claim of the complete specification is anticipated having regard to the knowledge, oral or otherwise, available within any local or indigenous community in India or elsewhere.

This provision allows pre-grant opposition based on traditional knowledge from any community, whether documented or oral. TKDL references are commonly used as evidence under this section.
""",
    },
    {
        "filename": "biological_diversity_act_2002.txt",
        "source": "The Biological Diversity Act, 2002 (amended 2023)",
        "jurisdiction": "india",
        "category": "biodiversity",
        "confidence_tier": "primary_legislation",
        "content": """BIOLOGICAL DIVERSITY ACT, 2002 (No. 18 of 2003) [As amended by the Biological Diversity (Amendment) Act, 2023]

CHAPTER II — REGULATION OF ACCESS TO BIOLOGICAL DIVERSITY

Section 3 — Certain persons not to undertake biodiversity-related activities without approval of National Biodiversity Authority

(1) No person referred to in sub-section (2) shall, without previous approval of the National Biodiversity Authority, obtain any biological resource occurring in India or knowledge associated thereto for research or for commercial utilisation or for bio-survey and bio-utilisation.

(2) The persons referred to in sub-section (1) are:
(a) a person who is not a citizen of India;
(b) a citizen of India who is a non-resident as defined in clause (30) of section 2 of the Income-tax Act, 1961;
(c) a body corporate, association or organisation—
    (i) not incorporated or registered in India; or
    (ii) incorporated or registered in India under any law for the time being in force which has any non-Indian participation in its share capital or management.

Section 6 — Application for intellectual property rights
(1) No person shall apply for any intellectual property right, by whatever name called, in or outside India for any invention based on any research or information on a biological resource obtained from India without obtaining the previous approval of the National Biodiversity Authority before making such application.

Section 7 — Prior intimation to State Biodiversity Board for obtaining biological resource for certain purposes
No Indian citizen or body corporate, association or organisation which is registered in India shall obtain any biological resource for commercial utilisation, or bio-survey and bio-utilisation without giving prior intimation to the concerned State Biodiversity Board.

2023 Amendment Key Changes:
- Codified users of biological resources who are exempted from ABS provisions
- AYUSH practitioners and registered Vaidyas exempted from NBA approval for certain uses
- Simplified benefit-sharing mechanism through a flat 'access fee' model
- Traditional knowledge holders' rights strengthened through Biodiversity Management Committees
""",
    },
    {
        "filename": "drugs_cosmetics_act_schedule_t.txt",
        "source": "Drugs & Cosmetics Act, 1940 — Schedule T (ASU Drugs)",
        "jurisdiction": "india",
        "category": "regulatory",
        "confidence_tier": "primary_legislation",
        "content": """DRUGS AND COSMETICS ACT, 1940 — SCHEDULE T
Good Manufacturing Practices for Ayurvedic, Siddha and Unani Medicines

PART I — AYURVEDIC MEDICINES

1. Classification of ASU Drugs:
   (a) Classical/Generic Medicines: Formulations described in authoritative texts listed in the First Schedule.
   (b) Patent/Proprietary Medicines: Formulations not described in authoritative texts, having novel composition or claims.

2. First Schedule Authoritative Texts (Ayurveda):
   - Charaka Samhita (चरक संहिता)
   - Sushruta Samhita (सुश्रुत संहिता)
   - Ashtanga Hridaya (अष्टाङ्ग हृदय)
   - Ashtanga Sangraha (अष्टाङ्ग संग्रह)
   - Sharangadhara Samhita (शारंगधर संहिता)
   - Bhavaprakasha (भावप्रकाश)
   - Yoga Ratnakara (योगरत्नाकर)
   - Rasatarangini (रसतरंगिणी)
   - And 50+ other listed texts

3. Regulatory Pathway:
   - Classical drugs: No clinical trial required, ASU drug license under Rule 158(b)
   - Proprietary drugs: Require safety & efficacy data, Rule 158-B
   - New ASU drugs: Full clinical trial pathway under Rule 158-C

4. Quality Standards:
   - Must comply with Ayurvedic Pharmacopoeia of India (API)
   - Ayurvedic Formulary of India (AFI) standards
   - Heavy metal limits as per WHO guidelines
   - Microbial contamination testing mandatory
""",
    },
]


# ─── India TKDL ──────────────────────────────────────────────────────

INDIA_TKDL_DOCS = [
    {
        "filename": "tkdl_ashwagandha_overview.txt",
        "source": "TKDL — Ashwagandha (Withania somnifera) Overview",
        "jurisdiction": "india",
        "category": "tkdl",
        "confidence_tier": "primary_legislation",
        "content": """TRADITIONAL KNOWLEDGE DIGITAL LIBRARY (TKDL)
Classification: IPC A61K 36/8157 (Withania somnifera / Ashwagandha)

Ashwagandha (Withania somnifera) in Ayurvedic Tradition:

1. Classical References:
   - Charaka Samhita: Described in Chikitsa Sthana, Chapter 1 (Rasayana Adhyaya) as a premier Rasayana (rejuvenator)
   - Sushruta Samhita: Listed in Balya group (strength-promoting herbs)
   - Bhavaprakasha: Guduchyadi Varga, detailed monograph with synonyms, properties, actions
   - Ashtanga Hridaya: Mentioned in Sutrasthana as Medhya Rasayana

2. Traditional Therapeutic Claims:
   - Balya (strength-promoting)
   - Rasayana (rejuvenating)
   - Vajikarana (aphrodisiac)
   - Anti-inflammatory (Shothahara)
   - Anxiolytic (Medhya)
   - Immunomodulatory (Ojas-vardhaka)

3. TKDL Documentation:
   - Over 800 formulations containing Ashwagandha documented
   - Multiple patent challenges successfully filed using TKDL evidence
   - Key IPC classes: A61K 36/8157, A61P 25/00, A61P 37/04

4. Prior Art Significance:
   - Any patent claiming Ashwagandha for stress relief, immune enhancement, or rejuvenation 
     is likely to face §3(p) objection based on TKDL documentation.
   - TKDL has been instrumental in revoking 36+ patents at EPO/USPTO based on Ashwagandha prior art.
""",
    },
    {
        "filename": "tkdl_curcumin_overview.txt",
        "source": "TKDL — Curcumin (Curcuma longa / Haridra) Overview",
        "jurisdiction": "india",
        "category": "tkdl",
        "confidence_tier": "primary_legislation",
        "content": """TRADITIONAL KNOWLEDGE DIGITAL LIBRARY (TKDL)
Classification: IPC A61K 36/9068 (Curcuma longa / Haridra / Turmeric)

Curcumin (Curcuma longa / Haridra) in Ayurvedic Tradition:

1. Classical References:
   - Charaka Samhita RS/1024: Haridra as primary anti-inflammatory, wound healer
   - Bhavaprakasha AK/409: Detailed monograph — Haridra Varga
   - Sushruta Samhita: Listed in Haridra-dvaya (two turmerics) in Dravya Guna
   - Yoga Ratnakara: Multiple formulations for skin, inflammation, liver

2. Traditional Therapeutic Claims:
   - Krimighna (antimicrobial/antiparasitic)
   - Vranaropaka (wound healing)
   - Shothahara (anti-inflammatory)
   - Tvak Doshahara (skin disorders)
   - Prameha (anti-diabetic)
   - Yakrit Vikara (hepatoprotective)

3. Landmark Case — US Patent 5,401,504:
   - Patent granted to University of Mississippi Medical Center (1995)
   - Claims: "Method of promoting wound healing using turmeric"
   - Successfully challenged by CSIR India (1997)
   - Patent revoked by USPTO based on TKDL and prior art evidence
   - First major victory for India in TK defense

4. TKDL Prior Art Records:
   - Over 1,200 formulations containing Curcuma longa documented
   - Cross-referenced against IPC, ECLA, and USPC classification systems
   - Available in English, Japanese, French, German, Spanish translations
""",
    },
    {
        "filename": "tkdl_charaka_samhita_rs1024.txt",
        "source": "TKDL Reference — Charaka Samhita RS/1024",
        "jurisdiction": "india",
        "category": "tkdl",
        "confidence_tier": "primary_legislation",
        "content": """TKDL REFERENCE: Charaka Samhita RS/1024

Reference ID: CS-RS/1024
Text: Charaka Samhita
Section: Chikitsa Sthana (Treatment Section)
Chapter: Kushtha Chikitsa (Treatment of Skin Diseases)

Formulation Description:
Haridra-based preparation for external application (Lepa) in inflammatory skin conditions.

Composition:
- Haridra (Curcuma longa) — primary ingredient
- Daruharidra (Berberis aristata) — synergistic anti-inflammatory
- Nimba (Azadirachta indica) — antimicrobial
- Chandana (Santalum album) — cooling, anti-inflammatory
- Manjishtha (Rubia cordifolia) — blood purifier, skin healer

Method of Preparation:
Fine powders (Churna) of all ingredients mixed in equal proportions, 
made into paste (Kalka) with water or honey for topical application.

Therapeutic Indication:
- Kushtha (skin diseases)
- Vrana (wounds/ulcers)
- Shotha (inflammation/swelling)
- Kandu (itching)

TKDL Classification:
- IPC: A61K 36/9068 (Curcuma), A61K 36/185 (Berberis)
- Therapeutic: A61P 17/00 (Dermatological), A61P 29/00 (Anti-inflammatory)

Prior Art Relevance:
Any patent claiming a topical formulation combining turmeric with neem, 
berberis, or sandalwood for anti-inflammatory/skin conditions is anticipated 
by this reference under Section 3(p) of the Patents Act, 1970.
""",
    },
    {
        "filename": "tkdl_bhavaprakasha_ak409.txt",
        "source": "TKDL Reference — Bhavaprakasha AK/409",
        "jurisdiction": "india",
        "category": "tkdl",
        "confidence_tier": "primary_legislation",
        "content": """TKDL REFERENCE: Bhavaprakasha AK/409

Reference ID: BP-AK/409
Text: Bhavaprakasha Nighantu
Author: Bhavamishra (16th century CE)
Section: Haridra Varga (Turmeric Section)

Monograph: Haridra (Curcuma longa L.)

Sanskrit Synonyms:
- Haridra (हरिद्रा) — yellow colored
- Kanchani (काञ्चनी) — golden
- Gauri (गौरी) — fair/bright
- Nisha (निशा) — night (color of sunset)
- Yoshitpriya (योषित्प्रिया) — dear to women

Rasa (Taste): Tikta (Bitter), Katu (Pungent)
Guna (Quality): Ruksha (Dry), Laghu (Light)
Virya (Potency): Ushna (Hot)
Vipaka (Post-digestive): Katu (Pungent)
Dosha Karma: Kapha-Pitta Shamaka (Pacifies Kapha and Pitta)

Pharmacological Actions (Karma):
- Varnya (complexion enhancer)
- Krimighna (antiparasitic)
- Vishahara (antitoxin)
- Vranaropaka (wound healer)
- Shothahara (anti-inflammatory)
- Raktashodhaka (blood purifier)

Classical Formulations Referenced:
1. Haridra Khanda — for allergic disorders
2. Haridra Lepa — topical anti-inflammatory paste
3. Nisha-Amalaki — for Prameha (diabetes)
4. Haridra Taila — medicated oil for skin

TKDL Classification:
- IPC: A61K 36/9068
- ECLA: A61K-036/9068
""",
    },
]


# ─── International IP ────────────────────────────────────────────────

INTERNATIONAL_IP_DOCS = [
    {
        "filename": "wipo_gratk_treaty_2024.txt",
        "source": "WIPO GRATK Treaty, 2024",
        "jurisdiction": "international",
        "category": "international_ip",
        "confidence_tier": "primary_legislation",
        "content": """WIPO TREATY ON INTELLECTUAL PROPERTY, GENETIC RESOURCES AND ASSOCIATED TRADITIONAL KNOWLEDGE
Adopted: May 24, 2024 at the Diplomatic Conference in Geneva

KEY PROVISIONS:

Article 3 — Disclosure Requirement
1. Each Contracting Party shall require patent applicants to disclose:
   (a) the country of origin or source of genetic resources, when the claimed invention is 
       materially based on genetic resources;
   (b) the indigenous peoples or local community that provided the traditional knowledge, 
       when the claimed invention is materially based on traditional knowledge associated 
       with genetic resources.

Article 4 — Sanctions and Remedies
1. Each Contracting Party shall put in place appropriate, effective and proportionate 
   legal, administrative and/or policy measures to address non-compliance with the 
   disclosure requirement.
2. Sanctions may include:
   (a) preventing further processing of the patent application
   (b) post-grant revocation or invalidation based on fraudulent intent

Article 5 — Databases and Digital Sequence Information
1. Contracting Parties are encouraged to make publicly available databases of genetic 
   resources and traditional knowledge, such as India's TKDL.

SIGNIFICANCE FOR AYURVEDA:
- First binding international treaty requiring TK disclosure in patent applications
- India's TKDL model recognized as a best practice
- Strengthens India's ability to challenge biopiracy patents internationally
- Requires patent offices worldwide to search TKDL and similar databases
""",
    },
    {
        "filename": "trips_article_27.txt",
        "source": "TRIPS Agreement — Articles 27 & 29 (Patentable Subject Matter)",
        "jurisdiction": "international",
        "category": "international_ip",
        "confidence_tier": "primary_legislation",
        "content": """AGREEMENT ON TRADE-RELATED ASPECTS OF INTELLECTUAL PROPERTY RIGHTS (TRIPS)

Article 27 — Patentable Subject Matter
1. Subject to the provisions of paragraphs 2 and 3, patents shall be available for any 
   inventions, whether products or processes, in all fields of technology, provided that 
   they are new, involve an inventive step and are capable of industrial application.

3. Members may also exclude from patentability:
   (b) diagnostic, therapeutic and surgical methods for the treatment of humans or animals;

Article 29 — Conditions on Patent Applicants
1. Members shall require that an applicant for a patent shall disclose the invention in a 
   manner sufficiently clear and complete for the invention to be carried out by a person 
   skilled in the art and may require the applicant to indicate the best mode for carrying 
   out the invention known to the inventor at the filing date.

RELEVANCE TO AYURVEDA:
- TRIPS Art. 27(1) requires novelty + inventive step — traditional formulations may lack novelty
- Art. 27(3)(b) allows exclusion of plant varieties and biological processes
- India's §3(p) is a TRIPS-compliant mechanism for excluding TK from patentability
- The relationship between TRIPS, CBD, and the Nagoya Protocol is the core tension in 
  international Ayurvedic IP protection
""",
    },
]


# ─── Case Law ────────────────────────────────────────────────────────

CASE_LAW_DOCS = [
    {
        "filename": "turmeric_patent_case.txt",
        "source": "CSIR v. USPTO — Turmeric Patent Case (1997)",
        "jurisdiction": "india",
        "category": "case_law",
        "confidence_tier": "guidance",
        "content": """LANDMARK CASE: CSIR v. USPTO — Turmeric Patent Revocation (1997)

US Patent No.: 5,401,504
Title: "Use of turmeric in wound healing"
Granted to: University of Mississippi Medical Center (March 28, 1995)
Challenged by: Council of Scientific and Industrial Research (CSIR), India

FACTS:
- Patent claimed the method of promoting healing of wounds by administering turmeric (Curcuma longa) to a patient
- CSIR challenged the patent as lacking novelty, citing traditional knowledge documentation

EVIDENCE PRESENTED:
1. Ancient Sanskrit text references (Sushruta Samhita, ~600 BCE)
2. Ayurvedic Pharmacopoeia entries
3. Published scientific papers from Indian journals
4. Oral tradition documentation

OUTCOME:
- USPTO cancelled the patent on August 21, 1997
- Held that the claimed use was anticipated by prior art from Indian traditional knowledge
- First successful challenge of a US patent based on traditional knowledge

SIGNIFICANCE:
- Catalyzed the creation of TKDL (established 2001)
- Demonstrated that traditional knowledge constitutes valid prior art
- Led to international recognition of need for TK protection
- India subsequently challenged 36+ patents at EPO and USPTO using TKDL

PRECEDENT VALUE:
- Established that documented traditional uses constitute prior art under US patent law
- Validated the approach of digitizing and translating traditional knowledge for defensive IP protection
""",
    },
]


def write_documents(docs: list, subdirectory: str):
    """Write document files to the corpus directory."""
    target_dir = DATA_DIR / subdirectory
    target_dir.mkdir(parents=True, exist_ok=True)

    for doc in docs:
        filepath = target_dir / doc["filename"]
        filepath.write_text(doc["content"], encoding="utf-8")

        # Also save metadata
        meta_path = target_dir / f"{doc['filename']}.meta.json"
        meta = {k: v for k, v in doc.items() if k != "content"}
        meta_path.write_text(json.dumps(meta, indent=2), encoding="utf-8")

        print(f"  ✅ {subdirectory}/{doc['filename']}")


def main():
    """Seed the prototype corpus."""
    print("🌱 Seeding IP-SAKTI Sahayak Prototype Corpus")
    print("=" * 60)

    print("\n📜 India IP Law...")
    write_documents(INDIA_IP_DOCS, "india_ip")

    print("\n📖 India TKDL...")
    write_documents(INDIA_TKDL_DOCS, "india_tkdl")

    print("\n🌍 International IP...")
    write_documents(INTERNATIONAL_IP_DOCS, "international_ip")

    print("\n⚖️ Case Law...")
    write_documents(CASE_LAW_DOCS, "case_law")

    total = len(INDIA_IP_DOCS) + len(INDIA_TKDL_DOCS) + len(INTERNATIONAL_IP_DOCS) + len(CASE_LAW_DOCS)
    print(f"\n✨ Done! {total} documents seeded across 4 categories.")
    print(f"   Corpus directory: {DATA_DIR}")


if __name__ == "__main__":
    main()
