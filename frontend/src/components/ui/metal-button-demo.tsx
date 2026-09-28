"use client";

import { MetalButton } from "@/components/ui/metal-button";
import { ArrowUpRight, Sparkles } from "lucide-react";

export default function MetalButtonDemo() {
  return (
    <div className="flex w-full flex-col items-center gap-6 py-10">
      <div className="flex flex-wrap items-center justify-center gap-5">
        <MetalButton preset="chromatic">
          <Sparkles className="size-4" />
          Upgrade to Pro
        </MetalButton>
        <MetalButton preset="silver">Continue</MetalButton>
        <MetalButton preset="gold" size="lg" href="/wizard">
          Get started
          <ArrowUpRight className="size-4" />
        </MetalButton>
      </div>
      <p className="text-sm text-muted-foreground">
        One shared WebGL shader paints every ring - chromatic, silver and gold
        presets.
      </p>
    </div>
  );
}
