"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Composer } from "@/components/chat/Composer";
import { SignInModal } from "@/components/auth/SignInModal";
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [jurisdiction, setJurisdiction] = useState("india");
  const [showSignInModal, setShowSignInModal] = useState(false);
  const pendingQueryRef = useRef<string | null>(null);

  // Wake up the backend service on load (useful for Render free tier)
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${apiUrl}/api/health`).catch(() => {
      // Silently fail if there's an error, this is just a wake-up ping
    });
  }, []);

  const executeSend = (message: string) => {
    const newSessionId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `session_${Date.now()}`;
    localStorage.setItem("chat_session", newSessionId);
    localStorage.removeItem("chat_messages");
    const params = new URLSearchParams({
      q: message,
      j: jurisdiction,
      session: newSessionId,
    });
    router.push(`/chat?${params.toString()}`);
  };

  const handleSend = (message: string) => {
    if (!isAuthenticated) {
      pendingQueryRef.current = message;
      setShowSignInModal(true);
      return;
    }
    executeSend(message);
  };

  const handleSuggestionClick = (description: string) => {
    handleSend(description);
  };

  const handleAuthSuccess = () => {
    if (pendingQueryRef.current) {
      const q = pendingQueryRef.current;
      pendingQueryRef.current = null;
      executeSend(q);
    }
  };

  return (
    <main className="flex-1 relative flex flex-col items-center h-full">
      {/* Subtle Government Geometric Pattern Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-35">
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-amber-50/50 rounded-full blur-3xl"></div>
      </div>

      {/* Centered Content Canvas - Generous Desktop Layout */}
      <div className="relative z-10 w-full max-w-4xl xl:max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-4 flex flex-col items-center flex-1">
        {/* Top Official Ayush Portal Welcome Header */}
        <div className="flex flex-col items-center text-center w-full mb-10">
          {/* Dignified Portal Title */}
          <h1 className="font-heading font-bold text-3xl sm:text-4xl text-[#002855] tracking-tight mb-2">
            IP-SAKTI Sahayak
          </h1>
          {/* Institutional Subtitle */}
          <p className="text-[14px] sm:text-[16px] text-slate-600 max-w-[720px] leading-relaxed font-sans">
            National AI Assistant for Ayurvedic Intellectual Property • Prior Art Discovery & Classical Research
            <span className="block text-slate-800 font-semibold text-[13px] mt-1">
              आयुष मंत्रालय, भारत सरकार • Ministry of Ayush, Govt. of India
            </span>
          </p>
        </div>

        {/* Analytical Queries Section Header */}
        <div className="w-full flex items-center justify-start mb-3 px-1">
          <span className="font-label text-[11px] uppercase tracking-wider text-[#0b3c5d] font-bold flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            Recommended Analytical Queries
          </span>
        </div>

        {/* 4 Recommended Queries in Clean Gov White Cards */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-6">
          {/* Query Card 1 */}
          <button 
            className="text-left p-4 rounded-xl bg-white border border-slate-200 hover:border-[#195280] hover:shadow-md transition-all duration-150 group flex flex-col justify-between cursor-pointer" 
            onClick={() => handleSuggestionClick("Verify patent novelty for Haridra (Curcuma longa) formulation under TKDL guidelines")}
            type="button"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200/80 text-[#0b3c5d] font-label text-[10px] font-semibold flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  TKDL Accession: Haridra
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-[#0b3c5d] transition-colors">
                  <path d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
              </div>
              <p className="text-[13px] text-slate-800 font-medium group-hover:text-[#0b3c5d] leading-snug">
                Verify patent novelty for Haridra (Curcuma longa) formulation
              </p>
            </div>
            <span className="text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#138808]"></span>
              IPC A61K 36/9066
            </span>
          </button>

          {/* Query Card 2 */}
          <button 
            className="text-left p-4 rounded-xl bg-white border border-slate-200 hover:border-[#195280] hover:shadow-md transition-all duration-150 group flex flex-col justify-between cursor-pointer" 
            onClick={() => handleSuggestionClick("Prior art search for Ashwagandha-based anti-inflammatory extracts in WIPO databases")}
            type="button"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200/80 text-emerald-800 font-label text-[10px] font-semibold flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                  </svg>
                  WIPO Gazettes
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-[#0b3c5d] transition-colors">
                  <path d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
              </div>
              <p className="text-[13px] text-slate-800 font-medium group-hover:text-[#0b3c5d] leading-snug">
                Prior art search for Ashwagandha anti-inflammatory extracts
              </p>
            </div>
            <span className="text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#138808]"></span>
              Withania somnifera
            </span>
          </button>

          {/* Query Card 3 */}
          <button 
            className="text-left p-4 rounded-xl bg-white border border-slate-200 hover:border-[#195280] hover:shadow-md transition-all duration-150 group flex flex-col justify-between cursor-pointer" 
            onClick={() => handleSuggestionClick("Formulation cross-reference with Charaka Samhita Chikitsa Sthana Chapter 4")}
            type="button"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200/80 text-amber-900 font-label text-[10px] font-semibold flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                  </svg>
                  Classical Formulation
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-[#0b3c5d] transition-colors">
                  <path d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
              </div>
              <p className="text-[13px] text-slate-800 font-medium group-hover:text-[#0b3c5d] leading-snug">
                Formulation cross-reference with Charaka Samhita Chikitsa
              </p>
            </div>
            <span className="text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#138808]"></span>
              Raktapitta Adhyaya
            </span>
          </button>

          {/* Query Card 4 */}
          <button 
            className="text-left p-4 rounded-xl bg-white border border-slate-200 hover:border-[#195280] hover:shadow-md transition-all duration-150 group flex flex-col justify-between cursor-pointer" 
            onClick={() => handleSuggestionClick("Draft Section 3(p) Indian Patent Act objection response for traditional ayurvedic preparation")}
            type="button"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200/80 text-indigo-900 font-label text-[10px] font-semibold flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="9" y1="3" x2="9" y2="21" />
                  </svg>
                  Section 3(p) Defense
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-[#0b3c5d] transition-colors">
                  <path d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
              </div>
              <p className="text-[13px] text-slate-800 font-medium group-hover:text-[#0b3c5d] leading-snug">
                Draft Section 3(p) Indian Patent Act objection response
              </p>
            </div>
            <span className="text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E65100]"></span>
              Non-Patentable Subject Matter
            </span>
          </button>
        </div>
      </div>

      {/* Composer Bar */}
      <div className="w-full mt-auto relative z-20 px-4 sm:px-6 pb-6">
        <Composer
          onSend={handleSend}
          jurisdiction={jurisdiction}
          onJurisdictionChange={setJurisdiction}
        />
      </div>

      {/* Authentication Required Modal Gate */}
      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </main>
  );
}
