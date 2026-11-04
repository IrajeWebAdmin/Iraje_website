"use client";

import Link from "next/link";

// Shown when a report cannot be loaded: a short card with a retry, and a way
// back to the overview. One boundary covers the overview, every report and
// the organisation pages.
export default function ReportsError({ error, reset }) {
  return (
    <div className="border-mist rounded-xl border bg-white p-6">
      <h1 className="text-ink text-lg font-semibold">
        Couldn&apos;t load this report
      </h1>
      <p className="text-shuttle mt-1 text-sm">
        Something went wrong while putting the numbers together. Try again, or
        narrow the period if the report is large.
      </p>
      {error?.digest && (
        <p className="text-slate-soft mt-2 text-xs">
          Reference: {error.digest}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="bg-brand hover:bg-navy rounded-xl px-4 py-2 text-sm font-semibold text-white transition"
        >
          Try again
        </button>
        <Link
          href="/admin/reports"
          className="border-mist text-ink hover:border-brand hover:text-brand rounded-xl border bg-white px-4 py-2 text-sm font-semibold transition"
        >
          Back to overview
        </Link>
      </div>
    </div>
  );
}
