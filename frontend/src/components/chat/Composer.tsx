"use client";

import { useState, FormEvent } from "react";

interface ComposerProps {
  onSend: (message: string) => void;
  jurisdiction: string;
  onJurisdictionChange: (j: string) => void;
  disabled?: boolean;
}

const jurisdictions = [
  { value: "india", label: "IPO" },
  { value: "international", label: "EPO" },
  { value: "both", label: "USPTO" },
];

export function Composer({
  onSend,
  jurisdiction,
  onJurisdictionChange,
  disabled = false,
}: ComposerProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;
    onSend(message.trim());
    setMessage("");
  };

  return (
    <div
      className="border-t p-4"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border-hairline)",
      }}
    >
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        {/* Input Row */}
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-lg border"
          style={{
            background: "var(--canvas)",
            borderColor: "var(--border-hairline)",
          }}
        >
          {/* Text Input */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask regarding Ayush patents, classical formulations, TKDL prior-art, or compliance..."
            className="flex-1 bg-transparent border-none outline-none body-md"
            style={{ color: "var(--ink-primary)" }}
            disabled={disabled}
          />

          {/* Jurisdiction Toggle */}
          <div className="flex-shrink-0 hidden sm:flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
            <span className="label-md" style={{ color: "var(--ink-muted)" }}>
              Patent Jurisdiction
            </span>
            <select
              value={jurisdiction}
              onChange={(e) => onJurisdictionChange(e.target.value)}
              className="bg-transparent border-none outline-none label-md cursor-pointer"
              style={{ color: "var(--saffron)" }}
            >
              <option value="india">IPO</option>
              <option value="international">EPO, USPTO, WIPO</option>
              <option value="both">All</option>
            </select>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="flex-shrink-0 px-5 py-2 rounded font-semibold text-sm transition-all disabled:opacity-40"
            style={{
              background: message.trim() ? "var(--saffron)" : "var(--surface-dim)",
              color: message.trim() ? "white" : "var(--ink-muted)",
            }}
          >
            Analyze →
          </button>
        </div>

        {/* Bottom meta row */}
        <div className="flex items-center justify-between mt-2 px-1">
          <div className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="label-md" style={{ color: "var(--ink-muted)" }}>
              Verified against Ministry of Ayush & TKDL digital archives. Validate with registered patent attorneys.
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
