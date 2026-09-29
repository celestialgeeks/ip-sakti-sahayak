// Minimal ESM hooks so `node --test` can import modules under test, which:
//   1. use the Next.js `@/` path alias (mapped to `src/` in tsconfig.json), and
//   2. value-import type-only names from `@/lib/types`. Node's TS stripping
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
    // Components live as `.tsx`, hooks and services as `.ts`; try both before
    // handing the bare directory to the next resolver, which cannot read one.
    const target = [abs + ".ts", abs + ".tsx", abs].find((p) => existsSync(p));
    return nextResolve(pathToFileURL(target ?? abs).href, context);
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  // Any module under `src/` that value-imports a type-only name from
  // `@/lib/types` is rewritten to `import type`, matching what the bundler emits.
  if (url.startsWith(pathToFileURL(SRC_ROOT).href) && /\.(ts|tsx)$/.test(url)) {
    const text = readFileSync(fileURLToPath(url), "utf8").replace(
      /import\s*\{([^}]*)\}\s*from\s*"@\/lib\/types"/,
      'import type {$1} from "@/lib/types"'
    );
    return { format: "module-typescript", source: text, shortCircuit: true };
  }
  return nextLoad(url, context);
}
