"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ChatCanvas } from "@/components/chat/ChatCanvas";
import { Composer } from "@/components/chat/Composer";
import { SignInModal } from "@/components/auth/SignInModal";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { Jurisdiction } from "@/lib/types";

function ChatPageContent() {
  const searchParams = useSearchParams();
  const sessionParam = searchParams.get("session") || undefined;
  const { messages, isLoading, send, loadSession } = useChat(sessionParam);
  const { isAuthenticated } = useAuth();

  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>("india");
  const [initialSent, setInitialSent] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const pendingMessageRef = useRef<string | null>(null);

  // Load session if URL changes to a different session
  useEffect(() => {
    if (sessionParam) {
      loadSession(sessionParam);
    }
  }, [sessionParam, loadSession]);

  // Handle initial query from URL parameters
  useEffect(() => {
    if (initialSent) return;
    const q = searchParams.get("q");
    const j = searchParams.get("j") as Jurisdiction | null;
    if (q) {
      if (j) setJurisdiction(j);
      send(q, j || "india");
      setInitialSent(true);
    }
  }, [searchParams, send, initialSent]);

  const handleSend = (message: string) => {
    if (!isAuthenticated) {
      pendingMessageRef.current = message;
      setShowSignInModal(true);
      return;
    }
    send(message, jurisdiction);
  };

  const handleAuthSuccess = () => {
    if (pendingMessageRef.current) {
      const msg = pendingMessageRef.current;
      pendingMessageRef.current = null;
      send(msg, jurisdiction);
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] w-full justify-center px-2 sm:px-4">
      {/* Full-width Chat Canvas with responsive wide centered flow */}
      <div className="flex flex-col flex-1 max-w-4xl xl:max-w-5xl 2xl:max-w-6xl w-full h-full pb-3">
        {messages.length === 0 && !isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8 overflow-y-auto">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#002855] mb-4 shadow-xs">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM7 21h10M12 3v18M3 7h18" />
              </svg>
            </div>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#002855] tracking-tight mb-2">
              Legal Advisor & Classical Prior Art
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mb-8 leading-relaxed font-sans">
              Query the Classical Sanskrit concordance, verify Section 3(p) patent bars, or formulate patent defense responses.
            </p>

            {/* Recommended Query Cards for empty advisor state */}
            <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-4">
              <button
                type="button"
                onClick={() => handleSend("Verify patent novelty for Haridra (Curcuma longa) formulation under TKDL guidelines")}
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-[#195280] hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200/80 text-[#0b3c5d] text-[10px] font-semibold flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-[#0b3c5d]"></span>
                    TKDL Accession: Haridra
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 group-hover:text-[#0b3c5d]">
                    <path d="M7 17l9.2-9.2M17 17V7H7" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-slate-800 group-hover:text-[#0b3c5d] leading-snug">
                  Verify patent novelty for Haridra (Curcuma longa) formulation
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSend("Prior art search for Ashwagandha-based anti-inflammatory extracts in WIPO databases")}
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-[#195280] hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[10px] font-semibold flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-600"></span>
                    WIPO Gazettes
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 group-hover:text-[#0b3c5d]">
                    <path d="M7 17l9.2-9.2M17 17V7H7" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-slate-800 group-hover:text-[#0b3c5d] leading-snug">
                  Prior art search for Ashwagandha anti-inflammatory extracts
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSend("Formulation cross-reference with Charaka Samhita Chikitsa Sthana Chapter 4")}
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-[#195280] hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200/80 text-amber-900 text-[10px] font-semibold flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-amber-600"></span>
                    Classical Formulation
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 group-hover:text-[#0b3c5d]">
                    <path d="M7 17l9.2-9.2M17 17V7H7" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-slate-800 group-hover:text-[#0b3c5d] leading-snug">
                  Formulation cross-reference with Charaka Samhita Chikitsa
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSend("Draft Section 3(p) Indian Patent Act objection response for traditional ayurvedic preparation")}
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-[#195280] hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200/80 text-indigo-900 text-[10px] font-semibold flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-indigo-600"></span>
                    Section 3(p) Defense
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 group-hover:text-[#0b3c5d]">
                    <path d="M7 17l9.2-9.2M17 17V7H7" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-slate-800 group-hover:text-[#0b3c5d] leading-snug">
                  Draft Section 3(p) Indian Patent Act objection response
                </p>
              </button>
            </div>
          </div>
        ) : (
          <ChatCanvas messages={messages} isLoading={isLoading} />
        )}

        <Composer
          onSend={handleSend}
          jurisdiction={jurisdiction}
          onJurisdictionChange={(j) => setJurisdiction(j as Jurisdiction)}
          disabled={isLoading}
        />
      </div>

      {/* Sign-In Modal Gate */}
      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
          <div className="text-center">
            <div
              className="w-12 h-12 mx-auto mb-4 rounded-full animate-pulse"
              style={{ background: "var(--saffron-light)" }}
            />
            <p className="body-md" style={{ color: "var(--ink-muted)" }}>
              Loading legal intelligence canvas...
            </p>
          </div>
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
