"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// The centre links of the admin top bar. The current section sits in a soft
// pill; a link may carry a `count` badge (the number of new requests).
// Client-side only so it can read the current path; the layout passes the data.
export default function AdminNav({ items = [] }) {
  const pathname = usePathname() ?? "";

  return (
    <nav
      aria-label="Admin sections"
      className="flex items-center gap-1 sm:gap-2"
    >
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm whitespace-nowrap transition sm:px-4 sm:text-[15px] ${
              active
                ? "bg-catskill text-brand font-semibold"
                : "text-ink hover:bg-catskill/70 hover:text-brand font-medium"
            }`}
          >
            {item.label}
            {item.count ? (
              <span
                className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${
                  active ? "bg-brand text-white" : "bg-mist text-ink"
                }`}
              >
                {item.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
