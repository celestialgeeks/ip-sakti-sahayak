import { test } from "node:test";
import assert from "node:assert";
import type { AISource, AISourcesProps } from "../src/components/ui/ai-sources.tsx";

test("AISources Suite: Component prop contracts and source model", () => {
  const sources: AISource[] = [
    {
      id: "1",
      title: "The Patents Act, 1970 (Section 3(p))",
      snippet: "Traditional knowledge exclusion for patentability",
      url: "https://ipindia.gov.in",
    },
    {
      id: "2",
      title: "Traditional Knowledge Digital Library (TKDL)",
      snippet: "Prior art documentation of classical formulations",
      url: "https://tkdl.res.in",
    },
  ];

  const props: AISourcesProps = {
    defaultOpen: true,
    label: "Referenced Primary Documents",
    sources,
  };

  assert.strictEqual(props.defaultOpen, true);
  assert.strictEqual(props.label, "Referenced Primary Documents");
  assert.strictEqual(props.sources.length, 2);
  assert.strictEqual(props.sources[0].id, "1");
  assert.strictEqual(props.sources[0].url, "https://ipindia.gov.in");
});
