"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChatCanvas } from "@/components/chat/ChatCanvas";
import { Composer } from "@/components/chat/Composer";
import { useChat } from "@/hooks/useChat";
import { Jurisdiction } from "@/lib/types";

function ChatPageContent() {
  const searchParams = useSearchParams();
  const { messages, isLoading, send } = useChat();
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>("india");
  const [initialSent, setInitialSent] = useState(false);

  // Send initial query from URL params
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
    send(message, jurisdiction);
  };

  return (
    <div className="flex h-[calc(100vh-56px)] w-full justify-center">
      {/* Full-width Chat Canvas with responsive centered flow */}
      <div className="flex flex-col flex-1 max-w-5xl w-full h-full">
        <ChatCanvas messages={messages} isLoading={isLoading} />
        <Composer
          onSend={handleSend}
          jurisdiction={jurisdiction}
          onJurisdictionChange={(j) => setJurisdiction(j as Jurisdiction)}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[calc(100vh-56px)]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full animate-pulse"
            style={{ background: "var(--saffron-light)" }} />
          <p className="body-md" style={{ color: "var(--ink-muted)" }}>
            Loading chat...
          </p>
        </div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
