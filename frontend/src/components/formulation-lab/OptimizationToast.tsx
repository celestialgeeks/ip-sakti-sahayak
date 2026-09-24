"use client";

import React from "react";

interface OptimizationToastProps {
  message: string;
  onApply: () => void;
  onDismiss: () => void;
}

export function OptimizationToast({
  message,
  onApply,
  onDismiss,
}: OptimizationToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-md p-4 rounded-lg bg-white border border-slate-300 text-slate-900 shadow-lg flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00263f]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#00263f]">
            Formulation Optimization Notice
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-700 text-xs font-mono"
        >
          ✕
        </button>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">{message}</p>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          onClick={onDismiss}
          className="px-3 py-1.5 rounded text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          Dismiss
        </button>
        <button
          onClick={onApply}
          className="px-3 py-1.5 rounded text-xs font-semibold bg-[#00263f] hover:bg-[#083b5c] text-white transition-colors"
        >
          Apply Recommendation
        </button>
      </div>
    </div>
  );
}
