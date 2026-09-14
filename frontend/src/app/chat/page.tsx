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
        <ChatCanvas messages={messages} isLoading={isLoading} />
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
