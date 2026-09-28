"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

const SCROLL_CONFIG = {
  SPEED: 5,
  INITIAL_DELAY: 100,
} as const;

const TIMER_CONFIG = {
  INTERVAL: 1000,
} as const;

const DIMENSIONS = {
  CARD_HEIGHT: "150px",
  FADE_HEIGHT: "80px",
} as const;

export const SHIMMER_CONFIG = {
  DURATION: "5s",
  GRADIENT:
    "linear-gradient(110deg, #404040 35%, #fff 50%, #404040 75%, #404040)",
  BACKGROUND_SIZE: "200% 100%",
} as const;

const DEFAULT_IP_SAKTI_THINKING = `Analyzing inquiry through IP-SAKTI Sahayak intelligence framework...

1. Examining jurisdiction and legal context under the Indian Patents Act, 1970 and Patent Rules.
2. Cross-referencing Traditional Knowledge Digital Library (TKDL) and classical texts:
   - Charaka Samhita (Sutra & Chikitsa Sthana)
   - Sushruta Samhita
   - Ashtanga Hridaya
3. Checking statutory patentability exclusions:
   - Section 3(p): Traditional knowledge exclusion analysis
   - Section 3(d): Discovery of a new form of known substance without enhanced therapeutic efficacy
   - Section 3(e): Admixture resulting only in aggregation of properties
4. Inspecting prior art claims and international classification (IPC A61K 36/00, A61P):
   - Identifying published Indian patent applications and granted patents
   - Comparing compositional ranges, extraction methods, and pharmacokinetic enhancers
5. Assessing non-obviousness, synergistic ratio evidence, and experimental enablement.
6. Synthesizing recommendations, statutory cautions, and pre-FER advisory notes for the user.`;

function useTimer() {
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, TIMER_CONFIG.INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return timer;
}

function useAutoScroll(contentRef: React.RefObject<HTMLDivElement | null>) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!contentRef.current || typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    const initializeScroll = () => {
      if (!contentRef.current) return;

      const { scrollHeight, clientHeight } = contentRef.current;
      const maxScroll = scrollHeight - clientHeight;

      if (maxScroll <= 0) return;

      intervalRef.current = setInterval(() => {
        setScrollPosition((prev) => {
          const newPosition = prev + 1;
          return newPosition >= maxScroll ? 0 : newPosition;
        });
      }, SCROLL_CONFIG.SPEED);
    };

    const timeoutId = setTimeout(initializeScroll, SCROLL_CONFIG.INITIAL_DELAY);

    return () => {
      clearTimeout(timeoutId);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [contentRef]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = scrollPosition;
    }
  }, [scrollPosition, contentRef]);

  return scrollPosition;
}

interface ThinkingHeaderProps {
  timer: number;
  title?: string;
}

function ThinkingHeader({ timer, title = "IP Sakti is thinking..." }: ThinkingHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <Spinner aria-hidden="true" className="size-4 text-primary" />
      <span className="relative inline-block animate-pulse text-sm font-medium text-foreground">
        {title}
      </span>
      <span
        aria-label={`${timer} seconds elapsed`}
        className="text-muted-foreground text-sm font-mono"
      >
        {timer}s
      </span>
    </div>
  );
}

interface FadeOverlayProps {
  position: "top" | "bottom";
}

function FadeOverlay({ position }: FadeOverlayProps) {
  const isTop = position === "top";
  const gradientClass = isTop
    ? "bg-gradient-to-b from-background from-30% to-transparent"
    : "bg-gradient-to-t from-background from-30% to-transparent";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 z-10 ${gradientClass}`}
      style={{
        [isTop ? "top" : "bottom"]: 0,
        height: DIMENSIONS.FADE_HEIGHT,
      }}
    />
  );
}

interface ThinkingContentProps {
  contentRef: React.RefObject<HTMLDivElement | null>;
  content: string;
}

function ThinkingContent({ contentRef, content }: ThinkingContentProps) {
  return (
    <div
      aria-label="AI thinking process"
      aria-live="polite"
      className="h-full overflow-hidden p-4 text-foreground/80"
      ref={contentRef}
      role="log"
      style={{ scrollBehavior: "auto" }}
    >
      <p className="whitespace-pre-wrap text-sm leading-relaxed font-mono text-xs">{content}</p>
    </div>
  );
}

interface ContentCardProps {
  contentRef: React.RefObject<HTMLDivElement | null>;
  content: string;
}

function ContentCard({ contentRef, content }: ContentCardProps) {
  return (
    <Card
      className="relative overflow-hidden rounded-xl border border-border bg-card p-2 shadow-xs"
      style={{ height: DIMENSIONS.CARD_HEIGHT }}
    >
      <FadeOverlay position="top" />
      <FadeOverlay position="bottom" />
      <ThinkingContent content={content} contentRef={contentRef} />
    </Card>
  );
}

function ShimmerStyles() {
  return (
    <style>{`
      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        [style*="shimmer"] {
          animation: none;
        }
      }
    `}</style>
  );
}

export interface AIThinkingProps {
  className?: string;
  title?: string;
  content?: string;
}

export default function AIThinking({
  className,
  title = "IP Sakti is thinking...",
  content = DEFAULT_IP_SAKTI_THINKING,
}: AIThinkingProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const timer = useTimer();
  useAutoScroll(contentRef);

  return (
    <div className={cn("flex max-w-xl flex-col gap-4", className)}>
      <ThinkingHeader timer={timer} title={title} />
      <ContentCard content={content} contentRef={contentRef} />
      <ShimmerStyles />
    </div>
  );
}

export { AIThinking, DEFAULT_IP_SAKTI_THINKING };
