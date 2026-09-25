"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FundingMatcher } from "@/components/business/FundingMatcher";
import { SupplierDirectory } from "@/components/business/SupplierDirectory";
import { LabelChecker } from "@/components/business/LabelChecker";

type Tab = "funding" | "suppliers" | "label";

const TABS: { id: Tab; label: string; hint: string }[] = [
  { id: "funding", label: "Funding & Loans", hint: "Mudra · PMEGP · Stand-Up India · CGTMSE" },
  { id: "suppliers", label: "Supplier Sourcing", hint: "Verified & GI-tagged raw-material suppliers" },
  { id: "label", label: "Label Compliance", hint: "AYUSH & FSSAI label validation" },
];

function BusinessHub() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = (params.get("tab") as Tab) || "funding";
  const [tab, setTabState] = useState<Tab>(
    TABS.some((t) => t.id === initial) ? initial : "funding"
  );

  // Keep the URL in sync so tabs are shareable and the back button works.
  const setTab = (next: Tab) => {
    setTabState(next);
    router.replace(`/business?tab=${next}`, { scroll: false });
  };

  return (
    <div className="w-full min-h-[calc(100vh-95px)] bg-[#F4F6F9] text-[#111c2d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Breadcrumb / context bar */}
        <div className="pb-4 border-b border-slate-200">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
            Ministry of Ayush · Business Enablement
          </span>
          <h1 className="text-2xl font-bold text-[#00263f] mt-0.5">
            Grow Your Ayush Enterprise
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Funding eligibility, legitimate raw-material sourcing, and statutory label
            validation — the practical next steps after you register.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex flex-wrap gap-1 border-b border-[#D2D9E2]">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                  active
                    ? "border-[#0b3c5d] text-[#0b3c5d]"
                    : "border-transparent text-slate-500 hover:text-[#0b3c5d]"
                }`}
              >
                {t.label}
                <span className="block text-[10px] font-normal text-slate-400 mt-0.5">{t.hint}</span>
              </button>
            );
          })}
        </div>

        {/* Active module */}
        <div>
          {tab === "funding" && <FundingMatcher />}
          {tab === "suppliers" && <SupplierDirectory />}
          {tab === "label" && <LabelChecker />}
        </div>
      </div>
    </div>
  );
}

export default function BusinessPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading Business Enablement…</div>}>
      <BusinessHub />
    </Suspense>
  );
}
