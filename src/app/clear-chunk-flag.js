"use client";

import { useEffect } from "react";

// Once a page has rendered fine, clear the one-time auto-reload flag set by
// global-error.js, so a later deploy can trigger the auto-reload again.
export function ClearChunkFlag() {
  useEffect(() => {
    try {
      sessionStorage.removeItem("chunk-error-reloaded");
    } catch {}
  }, []);
  return null;
}
