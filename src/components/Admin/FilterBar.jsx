import Link from "next/link";
import { FiX } from "react-icons/fi";
import { displayCertCode } from "@/lib/certCodes";
import {
  buildHref,
  describeRange,
  DEFAULT_RANGE,
  DEFAULT_PAGE_SIZE,
  GRAINS,
  RANGE_LABELS,
  RANGES,
} from "@/lib/reports/filters";
import FilterShell from "./FilterShell";

// The filter bar: a plain GET form, so every filter is part of the page
// address and nothing needs JavaScript to apply. What is always visible is
// one line: the period presets and a "Filters" button. The button opens the
// panel with everything else (custom dates, trend step, certification and
// status chips, country, organisation, search). Applied filters show as
// removable chips under the toolbar. `fields` says which controls a report
// has; the breakdown choice is not here, it sits on the chart it changes.
const INPUT =
  "border-mist focus:border-brand focus:ring-brand/20 h-9 rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2";
const LABEL =
  "text-shuttle mb-1.5 block text-[11px] font-semibold tracking-wide uppercase";
const CHIP =
  "border-mist text-ink hover:border-brand hover:text-brand has-[:checked]:border-brand has-[:checked]:bg-brand has-[:checked]:text-white has-[:focus-visible]:ring-brand/30 inline-flex cursor-pointer items-center rounded-full border bg-white px-3 py-1 text-xs font-medium transition select-none has-[:focus-visible]:ring-2";
const PRESETS = RANGES.filter((r) => r !== "custom");
const GRAIN_LABELS = {
  auto: "Auto",
  day: "Daily",
  week: "Weekly",
  month: "Monthly",
};

// Options may be strings or { value | code, label }.
const optionList = (items = []) =>
  items.map((it) =>
    typeof it === "string"
      ? { value: it, label: it }
      : {
          value: it.value ?? it.code,
          label: it.label ?? it.value ?? it.code,
        },
  );

function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <span className={LABEL}>{label}</span>
      {children}
    </div>
  );
}

// A row of toggle chips backed by checkboxes: none ticked means "all".
function ChipGroup({ name, options, selected, title }) {
  return (
    <fieldset>
      <legend className={LABEL}>{title}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <label key={o.value} className={CHIP} title={o.title ?? o.label}>
            <input
              type="checkbox"
              name={name}
              value={o.value}
              defaultChecked={selected.includes(o.value)}
              className="sr-only"
            />
            {o.short ?? o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function FilterBar({
  pathname,
  filters,
  fields = ["range"],
  options = {},
}) {
  const has = (f) => fields.includes(f);
  const certs = optionList(options.certifications).map((o) => ({
    ...o,
    short: displayCertCode(o.value),
    title: o.label,
  }));
  const statuses = optionList(options.statuses);
  const countries = optionList(options.countries);
  const labelOf = (list, value) =>
    list.find((o) => o.value === value)?.label ?? value;
  const patch = (p) => buildHref(pathname, filters, { ...p, page: 1 });

  // Applied filters as removable chips. The period is not one (the toolbar
  // shows it) and neither is the breakdown choice (the chart shows it).
  const chips = [];
  if (filters.grainParam && filters.grainParam !== "auto") {
    chips.push({
      key: "grain",
      label: `Trend: ${GRAIN_LABELS[filters.grainParam]}`,
      href: patch({ grainParam: "auto" }),
    });
  }
  for (const code of filters.certs ?? []) {
    chips.push({
      key: `cert-${code}`,
      label: `Certification: ${displayCertCode(code)}`,
      href: patch({ certs: filters.certs.filter((c) => c !== code) }),
    });
  }
  for (const s of filters.statuses ?? []) {
    chips.push({
      key: `status-${s}`,
      label: `Status: ${labelOf(statuses, s)}`,
      href: patch({ statuses: filters.statuses.filter((x) => x !== s) }),
    });
  }
  if (filters.org) {
    chips.push({
      key: "org",
      label: `Organisation: ${filters.org}`,
      href: patch({ org: "" }),
    });
  }
  if (filters.country) {
    chips.push({
      key: "country",
      label: `Country: ${labelOf(countries, filters.country)}`,
      href: patch({ country: "" }),
    });
  }
  if (filters.q) {
    chips.push({
      key: "q",
      label: `Search: “${filters.q}”`,
      href: patch({ q: "" }),
    });
  }
  const clearHref = patch({
    certs: [],
    statuses: [],
    org: "",
    country: "",
    q: "",
    grainParam: "auto",
  });

  // Carried through Apply unchanged; `page` is left out so Apply returns to
  // page 1. `range` keeps the chosen preset when the date boxes stay blank;
  // typed dates win over it (see parseReportFilters).
  const hidden = [["range", filters.range === "custom" ? "" : filters.range]];
  if (filters.pageSize && filters.pageSize !== DEFAULT_PAGE_SIZE)
    hidden.push(["pageSize", filters.pageSize]);
  if (filters.sort && filters.sort !== filters.defaults?.sort)
    hidden.push(["sort", filters.sort]);
  if (filters.dir && filters.dir !== (filters.defaults?.dir ?? "desc"))
    hidden.push(["dir", filters.dir]);

  const custom = filters.range === "custom";

  const toolbar = has("range") ? (
    <>
      <div
        className="bg-catskill inline-flex rounded-full p-1"
        role="group"
        aria-label="Period presets"
      >
        {PRESETS.map((r) => {
          const active = filters.range === r;
          return (
            <Link
              key={r}
              href={patch({ range: r, from: null, to: null })}
              aria-current={active ? "true" : undefined}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                active
                  ? "bg-brand text-white"
                  : "text-ink hover:text-brand hover:bg-white"
              }`}
            >
              {RANGE_LABELS[r]}
            </Link>
          );
        })}
      </div>
      <span className="text-shuttle text-xs">
        {custom ? "Custom period: " : "Showing "}
        {describeRange(filters)}
      </span>
    </>
  ) : null;

  const chipsLine =
    chips.length > 0 ? (
      <div className="border-mist bg-catskill/40 flex flex-wrap items-center gap-1.5 border-t px-4 py-2">
        <span className="text-shuttle mr-1 text-xs">Filtering by</span>
        <ul className="flex flex-wrap gap-1.5" aria-label="Applied filters">
          {chips.map((c) => (
            <li key={c.key}>
              <Link
                href={c.href}
                aria-label={`Remove ${c.label}`}
                className="bg-periwinkle text-brand hover:bg-brand inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition hover:text-white"
              >
                {c.label}
                <FiX className="h-3 w-3" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href={clearHref}
          className="text-shuttle hover:text-brand ml-1 text-xs underline-offset-2 hover:underline"
        >
          Clear all
        </Link>
      </div>
    ) : null;

  const panel = (
    <>
      <div className="grid gap-x-6 gap-y-4 px-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
        {has("range") && (
          <Field label="Custom period">
            <div className="flex items-center gap-2">
              <input
                type="date"
                name="from"
                defaultValue={custom ? (filters.from ?? "") : ""}
                aria-label="From date"
                className={`${INPUT} min-w-0 flex-1`}
              />
              <span className="text-shuttle text-xs">to</span>
              <input
                type="date"
                name="to"
                defaultValue={custom ? (filters.to ?? "") : ""}
                aria-label="To date"
                className={`${INPUT} min-w-0 flex-1`}
              />
            </div>
          </Field>
        )}
        {has("grain") && (
          <Field label="Trend step">
            <select
              name="grain"
              defaultValue={filters.grainParam ?? "auto"}
              className={`${INPUT} w-full`}
            >
              {GRAINS.map((g) => (
                <option key={g} value={g}>
                  {g === "auto"
                    ? `Auto (${(GRAIN_LABELS[filters.grain] ?? "").toLowerCase() || "by period"})`
                    : GRAIN_LABELS[g]}
                </option>
              ))}
            </select>
          </Field>
        )}
        {has("cert") && certs.length > 0 && (
          <div className="sm:col-span-2 lg:col-span-3">
            <ChipGroup
              name="cert"
              title="Certification"
              options={certs}
              selected={filters.certs ?? []}
            />
          </div>
        )}
        {has("status") && statuses.length > 0 && (
          <div className="sm:col-span-2 lg:col-span-3">
            <ChipGroup
              name="status"
              title="Status"
              options={statuses}
              selected={filters.statuses ?? []}
            />
          </div>
        )}
        {has("country") && (
          <Field label="Country">
            <select
              name="country"
              defaultValue={filters.country ?? ""}
              className={`${INPUT} w-full`}
            >
              <option value="">All countries</option>
              {countries.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        )}
        {has("org") && (
          <Field label="Organisation">
            <input
              type="text"
              name="org"
              defaultValue={filters.org ?? ""}
              placeholder="e.g. Infosys"
              maxLength={100}
              className={`${INPUT} w-full`}
            />
          </Field>
        )}
        {has("q") && (
          <Field label="Search">
            <input
              type="search"
              name="q"
              defaultValue={filters.q ?? ""}
              placeholder={options.qPlaceholder ?? "Name or email"}
              maxLength={80}
              className={`${INPUT} w-full`}
            />
          </Field>
        )}
      </div>
      <div className="border-mist bg-catskill/60 flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
        <p className="text-slate-soft text-xs">
          Filters apply to the figures, charts and table below. Leave a group
          empty to include everything.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href={pathname}
            className="text-shuttle hover:text-brand text-sm"
          >
            Reset
          </Link>
          <button
            type="submit"
            className="bg-brand hover:bg-navy rounded-lg px-4 py-2 text-sm font-semibold text-white transition"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );

  return (
    <section className="border-mist rounded-xl border bg-white">
      <form method="get" action={pathname}>
        <FilterShell
          toolbar={toolbar}
          chips={chipsLine}
          panel={panel}
          count={chips.length}
        />
        {hidden.map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
      </form>
    </section>
  );
}
