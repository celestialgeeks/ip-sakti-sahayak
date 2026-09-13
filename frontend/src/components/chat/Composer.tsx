"use client";

import { useState, FormEvent, useRef } from "react";

interface ComposerProps {
  onSend: (message: string) => void;
  jurisdiction: string;
  onJurisdictionChange: (j: string) => void;
  disabled?: boolean;
}

export function Composer({
  onSend,
  jurisdiction,
  onJurisdictionChange,
  disabled = false,
}: ComposerProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;
    onSend(message.trim());
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <div className="w-full max-w-[800px] mx-auto bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200 p-2 relative">
      {/* Input Area */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <button 
          type="button" 
          className="p-2.5 text-slate-400 hover:text-[#0b3c5d] hover:bg-slate-50 rounded-lg transition-colors" 
          title="Attach Dossier"
          disabled={disabled}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"></path>
          </svg>
        </button>
        
        <textarea 
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Describe the formulation, query TKDL accession, or paste patent claims..." 
          className="flex-1 max-h-[200px] min-h-[44px] bg-transparent border-none outline-none resize-none py-2.5 text-[15px] text-slate-800 placeholder:text-slate-400 font-sans" 
          rows={1}
          disabled={disabled}
        />
        
        <button 
          type="submit" 
          disabled={!message.trim() || disabled}
          className="p-2.5 rounded-lg transition-all shadow-sm flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: message.trim() ? "var(--color-tiranga-saffron)" : "var(--color-portal-border-subtle)",
            color: "white"
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  );
}
