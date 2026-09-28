// Minimal ESM hooks so `node --test` can import the hook under test, which:
//   1. uses the Next.js `@/` path alias (mapped to `src/` in tsconfig.json), and
//   2. value-imports type-only names from `@/lib/types`. Node's TS stripping
//      keeps such imports (unlike Next/SWC, which erase them), so ESM linking
//      fails because `types.ts` exports no runtime bindings. The `load` hook
//      rewrites that import to `import type`, mirroring the bundler.
import { fileURLToPath, pathToFileURL } from "node:url";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const SRC_ROOT = path.resolve(fileURLToPath(import.meta.url), "..", "..", "src");

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const abs = path.resolve(SRC_ROOT, specifier.slice(2));
    const target = existsSync(abs + ".ts") ? abs + ".ts" : abs;
    return nextResolve(pathToFileURL(target).href, context);
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith("/src/hooks/useChat.ts")) {
    const text = readFileSync(fileURLToPath(url), "utf8").replace(
      /import\s*\{([^}]*)\}\s*from\s*"@\/lib\/types"/,
      'import type {$1} from "@/lib/types"'
    );
    return { format: "module-typescript", source: text, shortCircuit: true };
  }
  return nextLoad(url, context);
}
