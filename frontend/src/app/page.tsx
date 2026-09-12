"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WelcomeHero } from "@/components/welcome/WelcomeHero";
import { StatsBar } from "@/components/welcome/StatsBar";
import { QuerySuggestion } from "@/components/cards/QuerySuggestion";
import { Composer } from "@/components/chat/Composer";
import { SUGGESTED_QUERIES } from "@/lib/constants";

export default function HomePage() {
  const router = useRouter();
  const [jurisdiction, setJurisdiction] = useState("india");

  const handleSend = (message: string) => {
    // Navigate to chat page with the query
    const params = new URLSearchParams({
      q: message,
      j: jurisdiction,
    });
    router.push(`/chat?${params.toString()}`);
  };

  const handleSuggestionClick = (description: string) => {
    handleSend(description);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-56px)]">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Hero */}
        <WelcomeHero />

        {/* Stats */}
        <StatsBar />

        {/* Suggested Queries Section */}
        <div className="w-full max-w-3xl mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="label-sm" style={{ color: "var(--ink-muted)" }}>
              📋 RECOMMENDED ANALYTICAL QUERIES
            </span>
            <span className="label-md cursor-pointer" style={{ color: "var(--saffron)" }}>
              Click to populate workbench ↗
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SUGGESTED_QUERIES.map((query) => (
              <QuerySuggestion
                key={query.title}
                icon={query.icon}
                color={query.color}
                title={query.title}
                description={query.description}
                tags={query.tags}
                onClick={() => handleSuggestionClick(query.description)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Composer Bar (fixed at bottom) */}
      <Composer
        onSend={handleSend}
        jurisdiction={jurisdiction}
        onJurisdictionChange={setJurisdiction}
      />
    </div>
  );
}
