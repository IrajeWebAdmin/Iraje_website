// Grey placeholders in the shape of a report page (title row, tabs, filter
// toolbar, key tiles, one wide trend beside one breakdown, table) so nothing
// jumps when the real data arrives. Used by loading.js.
const BLOCK = "border-mist animate-pulse rounded-xl border bg-catskill";

export default function ReportSkeleton({ tiles = 5, charts = 2 }) {
  return (
    <div className="space-y-5" aria-busy="true" aria-live="polite">
      <div className="flex items-center justify-between">
        <div className={`${BLOCK} h-8 w-64`} />
        <div className={`${BLOCK} h-10 w-28`} />
      </div>
      <div
        className={`${BLOCK} h-9 w-full rounded-none border-x-0 border-t-0`}
      />
      <div className={`${BLOCK} h-[52px]`} />
      <ul
        className={`grid grid-cols-2 gap-3 ${
          tiles <= 4 ? "md:grid-cols-4" : "md:grid-cols-3 lg:grid-cols-5"
        }`}
      >
        {Array.from({ length: tiles }, (_, i) => (
          <li key={i} className={`${BLOCK} h-[84px] rounded-2xl`} />
        ))}
      </ul>
      {charts > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: Math.min(charts, 2) }, (_, i) => (
            <div key={i} className={`${BLOCK} h-[300px]`} />
          ))}
        </div>
      ) : null}
      <div className={`${BLOCK} h-[360px]`} />
    </div>
  );
}
