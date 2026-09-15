import "server-only";
import { createClient } from "@sanity/client";

// Server-only Sanity client that can WRITE, using the Editor token: it can
// create, patch and delete any document, including the question bank and exam
// rules. Reads belong on getSanityClient() in ./client.js. Keep this client out
// of anything that only reads, so "who can write" stays exactly "who imports
// this file".
//
// Before calling it from a Server Action or Route Handler, verify the caller is
// an authenticated admin. Server Actions are public HTTP endpoints: without that
// check, anyone who finds the endpoint can rewrite course content. There is no
// admin auth yet (Phase 2), so nothing should call this from a request path
// until there is.
//
// Created lazily for the same reason as client.js: the Docker build runs
// without .env.
let client;

export function getSanityWriteClient() {
  if (client) return client;

  const config = {
    SANITY_PROJECT_ID: process.env.SANITY_PROJECT_ID,
    SANITY_DATASET: process.env.SANITY_DATASET,
    SANITY_API_WRITE_TOKEN: process.env.SANITY_API_WRITE_TOKEN,
  };
  const missing = Object.keys(config).filter((key) => !config[key]);
  if (missing.length) {
    throw new Error(
      `Sanity writes are not configured. Missing env: ${missing.join(", ")}`,
    );
  }

  client = createClient({
    projectId: config.SANITY_PROJECT_ID,
    dataset: config.SANITY_DATASET,
    apiVersion: process.env.SANITY_API_VERSION || "2026-02-01",
    token: config.SANITY_API_WRITE_TOKEN,
    // Any read made through this client sees published documents only, the
    // same as the read client, so the two never disagree about what exists.
    perspective: "published",
    // Mutations must go to the live API; the CDN only serves reads.
    useCdn: false,
  });
  return client;
}
