"use client";

import { useId, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

// A "show more" toggle and the content it reveals. The content is
// server-rendered JSX passed as children and is mounted only while open, so
// charts inside measure a visible box. Two looks: `text` (a small inline
// link-like button) and `bar` (a full-width hairline row).
export default function Disclosure({
  label,
  openLabel,
  detail,
  variant = "text",
  defaultOpen = false,
  className = "",
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const chevron = (
    <FiChevronDown
      className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden="true"
    />
  );

  return (
    <div className={className}>
      {variant === "bar" ? (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="border-mist text-ink hover:border-brand hover:text-brand flex w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-2.5 text-left text-sm transition"
        >
          <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
            <span className="font-medium">
              {open ? (openLabel ?? label) : label}
            </span>
            {detail && !open ? (
              <span className="text-shuttle truncate text-xs">{detail}</span>
            ) : null}
          </span>
          {chevron}
        </button>
      ) : (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="text-shuttle hover:text-brand inline-flex items-center gap-1 text-xs font-medium"
        >
          {open ? (openLabel ?? label) : label}
          {chevron}
        </button>
      )}
      {open ? (
        <div id={id} className="mt-3">
          {children}
        </div>
      ) : null}
    </div>
  );
}
