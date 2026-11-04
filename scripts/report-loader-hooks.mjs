// Module hooks that let plain Node run server-side report code outside Next:
// "@/x" resolves to src/x, extension-less relative imports ("./requests")
// get their extension, and the "server-only" guard becomes an empty module.
// Used by the check scripts via scripts/report-loader.mjs.
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SRC = new URL("../src/", import.meta.url);
const EMPTY = new URL("./_empty.mjs", import.meta.url).href;
const CANDIDATES = ["", ".js", ".mjs", ".jsx", "/index.js"];

function withExtension(base) {
  for (const ext of CANDIDATES) {
    const url = new URL(base.href + ext);
    if (existsSync(fileURLToPath(url))) return url.href;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "server-only") return { url: EMPTY, shortCircuit: true };

  if (specifier.startsWith("@/")) {
    const url = withExtension(new URL(specifier.slice(2), SRC));
    if (!url) throw new Error(`report-loader: cannot resolve ${specifier}`);
    return { url, shortCircuit: true };
  }

  if (
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    context.parentURL &&
    !/\.[a-z]+$/i.test(specifier)
  ) {
    const url = withExtension(new URL(specifier, context.parentURL));
    if (url) return { url, shortCircuit: true };
  }

  return nextResolve(specifier, context);
}
