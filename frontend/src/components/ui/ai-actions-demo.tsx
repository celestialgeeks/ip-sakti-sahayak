import { Example } from "@/components/ui/ai-actions";

/**
 * Showcase entry for the action row.
 *
 * A separate file rather than an addition to `ui/demo.tsx`: that module already
 * carries the feature-card showcase, and two demos in one file means whichever
 * page wants one has to import both.
 */
export default function DemoOne() {
  return <Example />;
}
