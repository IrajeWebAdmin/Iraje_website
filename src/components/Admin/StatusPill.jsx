// Coloured status label shared by every admin table: request, learning,
// exam and certificate statuses all read from one map.
const STYLES = {
  new: "bg-amber-100 text-amber-800",
  pending: "bg-amber-100 text-amber-800",
  timed_out: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  passed: "bg-green-100 text-green-800",
  valid: "bg-green-100 text-green-800",
  certified: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  failed: "bg-red-100 text-red-800",
  revoked: "bg-red-100 text-red-800",
  in_progress: "bg-periwinkle text-brand",
  exam_ready: "bg-periwinkle text-brand",
  not_started: "bg-mist text-shuttle",
  no_content: "bg-mist text-shuttle",
  expired: "bg-mist text-shuttle",
};

export default function StatusPill({ status }) {
  if (!status) return <span className="text-slate-soft">—</span>;
  const key = String(status).toLowerCase();
  const label = key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${
        STYLES[key] ?? "bg-mist text-shuttle"
      }`}
    >
      {label}
    </span>
  );
}
