"use client";

import { useEffect } from "react";

// Replaces Next's default "This page couldn't load" screen.
//
// After a deploy, a visitor holding a page from the previous build can ask for
// JS chunks that no longer exist (ChunkLoadError). A full reload fetches the
// current build and fixes it, so do that once automatically. The sessionStorage
// flag stops a reload loop; clear-chunk-flag.js clears it once a page renders.
const RELOAD_FLAG = "chunk-error-reloaded";

function isChunkError(error) {
  if (!(error instanceof Error)) return false;
  return (
    error.name === "ChunkLoadError" ||
    /Failed to load chunk|Loading chunk .* failed|Failed to fetch dynamically imported module/i.test(
      error.message,
    )
  );
}

export default function GlobalError({ error, unstable_retry }) {
  const chunkError = isChunkError(error);

  useEffect(() => {
    if (!chunkError) return;
    try {
      if (sessionStorage.getItem(RELOAD_FLAG)) return; // already retried once
      sessionStorage.setItem(RELOAD_FLAG, "1");
    } catch {}
    window.location.reload();
  }, [chunkError]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          margin: 0,
        }}
      >
        {chunkError ? (
          <p>Updating to the latest version…</p>
        ) : (
          <div style={{ textAlign: "center" }}>
            <h2>Something went wrong</h2>
            <button type="button" onClick={() => unstable_retry?.()}>
              Try again
            </button>{" "}
            <button type="button" onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        )}
      </body>
    </html>
  );
}
