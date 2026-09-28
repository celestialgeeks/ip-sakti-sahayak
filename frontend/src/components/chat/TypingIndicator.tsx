"use client";

import AIThinking from "@/components/ui/ai-thinking";

export function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4 w-full">
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-xs"
        style={{ background: "var(--saffron-light)", border: "1px solid var(--saffron)" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            fill="var(--saffron)"
          />
        </svg>
      </div>

      {/* Thinking animation */}
      <div className="flex-1 max-w-xl">
        <AIThinking title="IP Sakti is thinking..." />
      </div>
    </div>
  );
}

