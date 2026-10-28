"use client";

import { usePathname } from "next/navigation";

// Renders its children everywhere except on the listed paths (exact match) or
// under the listed prefixes — lets a shared layout drop its navbar/footer on
// the learner-portal pages. An optional `fallback` is rendered in their place.
export default function HideOnPaths({
  paths = [],
  prefixes = [],
  fallback = null,
  children,
}) {
  const pathname = usePathname();
  const hidden =
    paths.includes(pathname) || prefixes.some((p) => pathname.startsWith(p));
  return hidden ? fallback : children;
}
