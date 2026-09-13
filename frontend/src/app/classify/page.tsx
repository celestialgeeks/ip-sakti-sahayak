"use client";

import { useState } from "react";
import { classifyFormulation } from "@/lib/api";
import { ClassifyResponse } from "@/lib/types";

export default function ClassifyPage() {
  const [formulation, setFormulation] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ClassifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formulation.trim() || !ingredients.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await classifyFormulation({
        formulation_name: formulation,
        description: "Automated classification request",
        ingredients: ingredients.split(",").map(i => i.trim()).filter(Boolean),
        intended_use: "general wellness",
        is_in_authoritative_text: false
      });
      setResult(response);
    } catch (err) {
      setError("Failed to classify formulation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-[var(--canvas)]">
      <div className="flex-shrink-0 p-6 border-b" style={{ borderColor: "var(--border-hairline)", background: "var(--surface)" }}>
        <h1 className="headline-md mb-2" style={{ color: "var(--ink-primary)" }}>Formulation Classifier</h1>
        <p className="body-md" style={{ color: "var(--ink-muted)" }}>Determine the correct statutory classification (Ayurvedic, Proprietary, or Allopathic) based on ingredients.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex justify-center">
        <div className="w-full max-w-2xl flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="p-6 rounded-lg border flex flex-col gap-4 shadow-sm" style={{ background: "var(--surface)", borderColor: "var(--border-hairline)" }}>
            <div>
              <label className="block label-md mb-1" style={{ color: "var(--ink-primary)" }}>Formulation Name</label>
              <input
                type="text"
                value={formulation}
                onChange={(e) => setFormulation(e.target.value)}
                placeholder="e.g., AyurCure Syrup"
                className="w-full px-4 py-2 border rounded-md"
                style={{ borderColor: "var(--border-hairline)", background: "var(--canvas)", color: "var(--ink-primary)" }}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block label-md mb-1" style={{ color: "var(--ink-primary)" }}>Ingredients (comma-separated)</label>
              <textarea
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="e.g., Ashwagandha, Tulsi, Paracetamol"
                className="w-full px-4 py-2 border rounded-md resize-none"
                rows={3}
                style={{ borderColor: "var(--border-hairline)", background: "var(--canvas)", color: "var(--ink-primary)" }}
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isLoading || !formulation.trim() || !ingredients.trim()}
                className="px-6 py-2 rounded-md font-medium text-white transition-opacity disabled:opacity-50"
                style={{ background: "var(--saffron)" }}
              >
                {isLoading ? "Classifying..." : "Classify Formulation"}
              </button>
            </div>
          </form>

          {error && (
            <div className="p-4 rounded-md border-l-4 bg-red-50 text-red-700 border-red-500">
              {error}
            </div>
          )}

          {result && (
            <div className="p-6 rounded-lg border shadow-sm" style={{ background: "var(--surface)", borderColor: "var(--border-hairline)" }}>
              <h2 className="headline-sm mb-4" style={{ color: "var(--ink-primary)" }}>Classification Result</h2>
              
              <div className="flex items-center gap-3 mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  result.category === "Classical Ayurvedic" ? "bg-green-100 text-green-800" :
                  result.category === "Proprietary Ayurvedic" ? "bg-blue-100 text-blue-800" :
                  "bg-amber-100 text-amber-800"
                }`}>
                  {result.category}
                </span>
              </div>

              <div className="mb-4">
                <h3 className="label-md mb-1" style={{ color: "var(--ink-muted)" }}>Description</h3>
                <p className="body-md" style={{ color: "var(--ink-primary)" }}>{result.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="label-md mb-1" style={{ color: "var(--ink-muted)" }}>Regulatory Pathway</h3>
                  <p className="body-sm text-slate-700">{result.regulatory_pathway}</p>
                </div>
                <div>
                  <h3 className="label-md mb-1" style={{ color: "var(--ink-muted)" }}>TKDL Implications</h3>
                  <p className="body-sm text-slate-700">{result.tkdl_implications}</p>
                </div>
                <div>
                  <h3 className="label-md mb-1" style={{ color: "var(--ink-muted)" }}>ABS Obligations</h3>
                  <p className="body-sm text-slate-700">{result.abs_obligations}</p>
                </div>
                <div>
                  <h3 className="label-md mb-1" style={{ color: "var(--ink-muted)" }}>IP Protections</h3>
                  <ul className="list-disc pl-5 flex flex-col gap-1">
                    {result.ip_protections.map((ip, idx) => (
                      <li key={idx} className="body-sm text-slate-700 font-medium">
                        {ip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
