import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { formatTileValue } from "@/lib/reports/format";

// The overview: one card per report. Each leads with that report's headline
// number for the period, lists one or two supporting figures, and opens the
// full report. Everything arrives computed from overview.report().
export default function OverviewCards({ cards = [] }) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => {
        const [lead, ...rest] = card.tiles ?? [];
        if (!lead) return null;
        return (
          <li key={card.key}>
            <Link
              href={card.href}
              className="border-mist hover:border-brand group flex h-full flex-col rounded-2xl border bg-white px-5 py-4 transition"
            >
              <p className="text-shuttle text-[11px] font-semibold tracking-wide uppercase">
                {card.title}
              </p>
              <p className="text-brand mt-2 text-3xl font-semibold">
                {formatTileValue(lead.value, lead.format)}
              </p>
              <p className="text-ink text-xs">
                {lead.label}
                {lead.hint ? (
                  <span className="text-slate-soft"> · {lead.hint}</span>
                ) : null}
              </p>
              {rest.length > 0 ? (
                <dl className="border-mist mt-3 space-y-1 border-t pt-3 text-xs">
                  {rest.map((t) => (
                    <div
                      key={t.key ?? t.label}
                      className="flex items-baseline justify-between gap-2"
                    >
                      <dt className="text-shuttle">
                        {t.label}
                        {t.hint ? (
                          <span className="text-slate-soft"> · {t.hint}</span>
                        ) : null}
                      </dt>
                      <dd className="text-ink font-medium">
                        {formatTileValue(t.value, t.format)}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              <span className="text-brand mt-auto inline-flex items-center gap-1 pt-3 text-xs font-medium group-hover:underline">
                Open report
                <FiArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
