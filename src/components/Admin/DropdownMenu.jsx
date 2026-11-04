"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

// A button that opens a small menu of links. Closes on an outside click, on
// Escape and after choosing an item. `items`: [{ href, label, hint }]; every
// item is a download link, so the browser saves the file and stays here.
export default function DropdownMenu({ label, icon, items = [], note }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const id = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="border-mist text-ink hover:border-brand hover:text-brand inline-flex items-center gap-1.5 rounded-xl border bg-white px-4 py-2 text-sm font-semibold transition"
      >
        {icon}
        {label}
        <FiChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <div
          id={id}
          role="menu"
          className="border-mist absolute right-0 z-20 mt-1 w-60 rounded-xl border bg-white p-1 shadow-lg"
        >
          {items.map((it) => (
            <a
              key={it.href}
              role="menuitem"
              href={it.href}
              download=""
              onClick={() => setOpen(false)}
              className="hover:bg-catskill block rounded-lg px-3 py-2"
            >
              <span className="text-ink block text-sm font-medium">
                {it.label}
              </span>
              {it.hint ? (
                <span className="text-shuttle block text-xs">{it.hint}</span>
              ) : null}
            </a>
          ))}
          {note ? (
            <p className="text-slate-soft border-mist mt-1 border-t px-3 pt-2 pb-1 text-[11px]">
              {note}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
