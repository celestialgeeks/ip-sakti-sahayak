"use client";

import React from "react";
import { FeatureCardDemo, SavingsPlanItem } from "@/components/ui/feature-card-demo";
import Component from "@/components/ui/ai-sources";

export default FeatureCardDemo;
export { FeatureCardDemo, SavingsPlanItem };

export function DemoOne() {
  return (
    <div className="flex min-h-[440px] w-full items-center justify-center bg-background p-10">
      <div className="w-full max-w-lg rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-foreground text-sm leading-relaxed">
          Only <strong>transform</strong> and <strong>opacity</strong> are
          composited, so everything else forces layout on every frame.
        </p>
        <div className="mt-5 border-t pt-5">
          <Component
            defaultOpen
            label="Sources"
            sources={[
              {
                id: "1",
                favicon: (
                  <img
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&auto=format&fit=crop&q=80"
                    alt="Motion"
                    className="size-full object-cover"
                  />
                ),
                snippet:
                  "Springs stay interruptible: a new target mid-flight keeps the current velocity.",
                title: "Transitions — Motion",
                url: "https://motion.dev/docs/react-transitions",
              },
              {
                id: "2",
                favicon: (
                  <img
                    src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=64&auto=format&fit=crop&q=80"
                    alt="web.dev"
                    className="size-full object-cover"
                  />
                ),
                snippet:
                  "Compositor-only properties skip layout and paint entirely.",
                title: "Animations guide — web.dev",
                url: "https://web.dev/animations-guide",
              },
              {
                id: "3",
                favicon: (
                  <img
                    src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=64&auto=format&fit=crop&q=80"
                    alt="MDN"
                    className="size-full object-cover"
                  />
                ),
                snippet:
                  "prefers-reduced-motion should soften motion, not remove all feedback.",
                title: "prefers-reduced-motion — MDN",
                url: "https://developer.mozilla.org/docs/Web/CSS/@media/prefers-reduced-motion",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
