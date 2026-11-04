"use client";

import { useRouter } from "next/navigation";

// A <select> whose options are page addresses: choosing one navigates. Used
// for a chart's own setting ("break down by") so the choice sits beside the
// chart it changes. `options`: [{ href, label }]; `value` is the active href.
export default function LinkSelect({ label, options = [], value }) {
  const router = useRouter();
  return (
    <label className="text-shuttle inline-flex items-center gap-2 text-xs">
      {label ? <span>{label}</span> : null}
      <select
        key={value}
        defaultValue={value}
        onChange={(e) => router.push(e.target.value)}
        className="border-mist focus:border-brand focus:ring-brand/20 text-ink h-8 rounded-lg border bg-white px-2 text-xs outline-none focus:ring-2"
      >
        {options.map((o) => (
          <option key={o.href} value={o.href}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
