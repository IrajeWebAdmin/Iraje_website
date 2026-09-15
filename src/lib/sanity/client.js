import "server-only";
import { createClient } from "@sanity/client";

// Server-only, READ-ONLY Sanity client. The dataset is private (it holds the
// exam question bank), so every read needs the Viewer token — which is why this
// module must never reach the browser. The `server-only` import above turns any
// attempt to use it from a Client Component into a build error. For writes, use
// getSanityWriteClient() in ./writeClient.js.
//
// Created lazily on first use rather than at import time: the Docker build runs
// without .env, and an eager createClient() would throw during `next build` for
// any page that merely imports this file. Callers should read at request time
// (`await connection()`), so Cloud Run supplies the env vars at runtime.
let client;

export function getSanityClient() {
  if (client) return client;

  const config = {
    SANITY_PROJECT_ID: process.env.SANITY_PROJECT_ID,
    SANITY_DATASET: process.env.SANITY_DATASET,
    SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN,
  };
  const missing = Object.keys(config).filter((key) => !config[key]);
  if (missing.length) {
    throw new Error(
      `Sanity is not configured. Missing env: ${missing.join(", ")}`,
    );
  }

  client = createClient({
    projectId: config.SANITY_PROJECT_ID,
    dataset: config.SANITY_DATASET,
    apiVersion: process.env.SANITY_API_VERSION || "2026-02-01",
    token: config.SANITY_API_READ_TOKEN,
    // Published documents only. The token can read drafts, and an editor's
    // half-written draft must never appear on the site.
    perspective: "published",
    // Fresh reads: exam rules and the question bank must not be served stale.
    // Revisit with a caching strategy once real pages read from Sanity.
    useCdn: false,
  });
  return client;
}
