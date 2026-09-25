"use client";

import { useState, useEffect, useRef, FormEvent } from "react";

interface ComposerProps {
  onSend: (message: string) => void;
  jurisdiction: string;
  onJurisdictionChange: (j: string) => void;
  disabled?: boolean;
}

/**
 * Composer — the chat input bar.
 *
 * Adopted from the "Radiant Prompt Input" design: a kinetic, continuously
 * rotating conic-gradient border with leading/trailing micro-interactions. The
 * gradient is re-tuned to the IP-SAKTI tricolor palette (saffron → navy →
 * emerald) so the motion reads as an on-brand radiance rather than a generic
 * consumer-AI rainbow. The glow lives *behind* an opaque parchment surface so
 * the interior stays legible and the effect reads as a refined edge halo.
 *
 * We keep the original bar's full contract: a controlled `onSend`, the
 * jurisdiction selector, an auto-resizing textarea (for pasting patent claims)
 * and a `disabled` state used while the assistant is streaming.
 */
export function Composer({
  onSend,
  jurisdiction,
  onJurisdictionChange,
  disabled = false,
}: ComposerProps) {
  const [message, setMessage] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceReady, setVoiceReady] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Native browser speech recognition (Chrome / Edge / Safari). No dependency.
  // Detected after mount so server/client markup stays identical (no hydration
  // mismatch); the mic reveals itself only when the API is actually available.
  useEffect(() => {
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setVoiceReady(Boolean(SpeechRec));
  }, []);

  // Keep the textarea height in sync with its content (and voice transcripts).
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [message]);

  // Stop any active recognition when the bar unmounts.
  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;
    recognitionRef.current?.stop();
    setListening(false);
    onSend(message.trim());
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleVoice = () => {
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec || disabled) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new SpeechRec();
    rec.lang = "en-IN";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setMessage((prev) => (prev ? `${prev.replace(/\s+$/, "")} ${transcript}` : transcript));
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
    textareaRef.current?.focus();
  };

  const hasText = message.trim().length > 0;

  return (
    <div className="w-full max-w-4xl xl:max-w-5xl mx-auto relative">
      {/* Scoped kinetic-gradient styling. @property lets us animate the conic
          angle; older browsers fall back gracefully to a static ring. */}
      <style>{`
        @property --radiant-angle {
          syntax: '<angle>';
          inherits: true;
          initial-value: 0deg;
        }
        @keyframes radiant-spin {
          to { --radiant-angle: 360deg; }
        }
        .ipsakti-radiant {
          --radiant-border: 1.5px;
          --radiant-gradient: conic-gradient(
            from var(--radiant-angle) at 50% 50% in oklab,
            var(--color-tiranga-saffron) 0%,
            var(--color-tiranga-saffron-deep) 16%,
            var(--color-gov-blue-deep) 34%,
            var(--color-gov-blue) 48%,
            var(--color-tiranga-green) 66%,
            var(--color-tiranga-green-deep) 80%,
            var(--color-tiranga-saffron) 100%
          );
          animation: radiant-spin 6s linear infinite;
        }
        /* Soft halo sitting behind the opaque surface — only bleeds at the edge */
        .ipsakti-radiant .radiant-glow {
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          background: var(--radiant-gradient);
          filter: blur(11px);
          opacity: 0.4;
          z-index: 0;
          transition: opacity 0.45s ease;
        }
        /* Crisp masked gradient ring drawn on the surface edge */
        .ipsakti-radiant .radiant-ring {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: var(--radiant-border);
          background: var(--radiant-gradient);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          z-index: 30;
          opacity: 0.7;
          transition: opacity 0.45s ease;
        }
        .ipsakti-radiant:hover .radiant-glow { opacity: 0.55; }
        .ipsakti-radiant:hover .radiant-ring { opacity: 0.95; }
        .ipsakti-radiant:focus-within .radiant-glow { opacity: 0.7; }
        .ipsakti-radiant:focus-within .radiant-ring { opacity: 1; }
        @media (prefers-reduced-motion: reduce) {
          .ipsakti-radiant { animation: none; }
        }
      `}</style>

      <div className="ipsakti-radiant relative rounded-3xl">
        {/* Outer halo (behind surface) */}
        <div className="radiant-glow rounded-3xl" aria-hidden="true" />
        {/* Crisp gradient ring (above surface edge) */}
        <div className="radiant-ring rounded-3xl" aria-hidden="true" />

        <form
          onSubmit={handleSubmit}
          className="relative z-20 flex items-end gap-1.5 rounded-3xl bg-white p-2 sm:p-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
        >
          {/* Attach dossier */}
          <button
            type="button"
            title="Attach Dossier"
            aria-label="Attach dossier"
            disabled={disabled}
            className="p-2.5 shrink-0 text-slate-400 hover:text-[#0b3c5d] hover:bg-slate-100/70 rounded-full transition-colors disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"></path>
            </svg>
          </button>

          {/* Jurisdiction selector */}
          <select
            value={jurisdiction}
            onChange={(e) => onJurisdictionChange(e.target.value)}
            disabled={disabled}
            title="Select Jurisdiction"
            className="self-center shrink-0 bg-transparent border-none text-[12px] font-semibold text-slate-500 uppercase cursor-pointer hover:text-[#0b3c5d] focus:outline-none"
          >
            <option value="india">National (India)</option>
            <option value="international">International</option>
          </select>

          {/* Input */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={listening ? "Listening…" : "Describe the formulation, query TKDL accession, or paste patent claims…"}
            className="flex-1 min-w-0 max-h-[200px] min-h-[40px] bg-transparent border-none outline-none resize-none py-2.5 text-[15px] leading-relaxed text-slate-800 placeholder:text-slate-400 font-sans"
            rows={1}
            disabled={disabled}
            aria-label="Message"
          />

          {/* Voice input */}
          {voiceReady && (
            <button
              type="button"
              onClick={toggleVoice}
              disabled={disabled}
              title={listening ? "Stop listening" : "Voice input"}
              aria-label={listening ? "Stop voice input" : "Start voice input"}
              aria-pressed={listening}
              className={
                "p-2.5 shrink-0 rounded-full transition-all disabled:opacity-50 " +
                (listening
                  ? "text-white bg-[var(--color-tiranga-saffron-deep)] animate-pulse"
                  : "text-slate-400 hover:text-[#0b3c5d] hover:bg-slate-100/70")
              }
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </button>
          )}

          {/* Send */}
          <button
            type="submit"
            disabled={!hasText || disabled}
            aria-label="Send message"
            className="p-2.5 shrink-0 rounded-full transition-all duration-300 shadow-sm flex items-center justify-center cursor-pointer disabled:cursor-not-allowed hover:scale-[1.04] active:scale-95"
            style={{
              background: hasText ? "var(--color-tiranga-saffron)" : "var(--color-portal-border-subtle)",
              color: "white",
              opacity: hasText ? 1 : 0.6,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
