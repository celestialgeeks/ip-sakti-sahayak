"use client";

import { useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { Message } from "@/lib/types";

interface ChatCanvasProps {
  messages: Message[];
  isLoading?: boolean;
}

export function ChatCanvas({ messages, isLoading = false }: ChatCanvasProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-6"
      style={{ maxWidth: "var(--content-max-width)", margin: "0 auto" }}
    >
      {messages.map((msg, i) => (
        <MessageBubble
          key={i}
          message={msg}
        />
      ))}

      {isLoading && <TypingIndicator />}

      <div ref={bottomRef} />
    </div>
  );
}
