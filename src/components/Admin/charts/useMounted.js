"use client";

import { useSyncExternalStore } from "react";

// false during server rendering and hydration, true afterwards. Charts wait
// for it so Recharts never measures a zero-width frame on the server and the
// HTML the server sent always matches what the browser renders first.
const subscribe = () => () => {};

export default function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
