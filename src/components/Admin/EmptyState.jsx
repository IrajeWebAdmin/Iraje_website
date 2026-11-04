import Link from "next/link";

// Shown in place of a table or chart when the filters match nothing.
export default function EmptyState({
  title = "Nothing to show",
  message,
  resetHref,
}) {
  return (
    <div className="border-mist text-shuttle rounded-xl border border-dashed bg-white p-8 text-center text-sm">
      <p className="text-ink font-semibold">{title}</p>
      {message ? <p className="mt-1">{message}</p> : null}
      {resetHref ? (
        <Link
          href={resetHref}
          className="text-brand mt-3 inline-block font-medium hover:underline"
        >
          Clear filters
        </Link>
      ) : null}
    </div>
  );
}
