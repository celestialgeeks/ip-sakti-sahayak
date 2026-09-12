/**
 * Application constants and design tokens.
 */

export const JURISDICTIONS = [
  { value: "india" as const, label: "IPO (India)", shortLabel: "IPO" },
  { value: "international" as const, label: "EPO, USPTO, WIPO", shortLabel: "International" },
  { value: "both" as const, label: "All Jurisdictions", shortLabel: "All" },
];

export const SUGGESTED_QUERIES = [
  {
    icon: "🌿",
    color: "saffron" as const,
    title: "Curcuma longa",
    description:
      "Verify patent novelty for Haridrā (Curcuma longa) formulation under TKDL guidelines",
    tags: ["IPC A61K 36/9068", "Ayurvedic Prior Art"],
  },
  {
    icon: "🔍",
    color: "emerald" as const,
    title: "WIPO & USPTO",
    description:
      "Prior art search for Ashwagandha-based anti-inflammatory extracts in WIPO databases",
    tags: ["Withania somnifera", "Bioactive Synergies"],
  },
  {
    icon: "📖",
    color: "saffron" as const,
    title: "Brihat Trayi Text",
    description:
      "Formulation cross-reference with Charaka Samhita Chikitsa Sthana Chapter 4",
    tags: ["Rasksadhya Adhyaya", "Sanskrit Shloka Lookup"],
  },
  {
    icon: "🛡️",
    color: "emerald" as const,
    title: "Statutory Defence",
    description:
      "Draft Section 3(p) Indian Patent Act objection response for traditional ayurvedic preparation",
    tags: ["Non-Patentable Subject Matter", "Legal Precedent"],
  },
];

export const DISCLAIMER_TEXT =
  "Verified against Ministry of Ayush & TKDL digital archives. Validate with registered patent attorneys.";

export const CONFIDENCE_LABELS = {
  high: { emoji: "🟢", label: "High confidence", description: "Grounded in primary legislation" },
  medium: { emoji: "🟡", label: "Medium confidence", description: "Grounded in rules/commentary" },
  low: { emoji: "🔴", label: "Low confidence", description: "Consider human expert review" },
};
