"use client";

import { useId, useState } from "react";
import { FiChevronDown, FiSliders } from "react-icons/fi";

// The frame of the filter bar. The toolbar row (period presets) is always
// visible; the "Filters" button opens the full panel; `chips` is the line of
// applied filters shown between them. Every control is server-rendered and
// arrives here as a prop, so this file only remembers open/closed.
export default function FilterShell({
  toolbar,
  chips,
  panel,
  count = 0,
  defaultOpen = false,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const lit = open || count > 0;

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5">
        {toolbar}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className={`ml-auto inline-flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition ${
            lit
              ? "border-brand text-brand bg-periwinkle/40"
              : "border-mist text-ink hover:border-brand hover:text-brand"
          }`}
        >
          <FiSliders className="h-3.5 w-3.5" aria-hidden="true" />
          Filters
          {count > 0 ? (
            <span className="bg-brand rounded-full px-1.5 text-[10px] leading-4 text-white">
              {count}
            </span>
          ) : null}
          <FiChevronDown
            className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
      </div>
      {chips}
      <div id={id} hidden={!open} className="border-mist border-t">
        {panel}
      </div>
    </>
  );
}
