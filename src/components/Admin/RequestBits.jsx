import { parseCertList, displayCertCode } from "@/lib/certCodes";

// Small pieces shared by the certification-request list and detail pages:
// the initials avatar, the certification chips and the Yes / No pill.

/** "Priya Sharma" -> "PS"; a single word gives one letter; blank gives "?". */
export function initials(name) {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const text = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return text.toUpperCase() || "?";
}

export function InitialsAvatar({ name, className = "h-9 w-9 text-xs" }) {
  return (
    <span
      aria-hidden="true"
      className={`bg-periwinkle text-brand flex shrink-0 items-center justify-center rounded-full font-semibold ${className}`}
    >
      {initials(name)}
    </span>
  );
}

// Chip colour: CyberTantra in azure, 200-level courses in navy, the rest in
// brand blue; anything unrecognised is plain ink.
function chipTone(code) {
  const m = /^([A-Z]+)(\d)/i.exec(String(code));
  if (!m) return "bg-ink text-white";
  if (m[1].toUpperCase() === "CT") return "bg-azure text-white";
  return Number(m[2]) >= 2 ? "bg-navy text-white" : "bg-brand text-white";
}

/** The certifications field of a request ("PAM 101, EPM 201") as chips. */
export function CertChips({ value }) {
  const codes = parseCertList(value);
  if (codes.length === 0) return <span className="text-slate-soft">—</span>;
  return (
    <span className="flex flex-wrap gap-1.5">
      {codes.map((code) => (
        <span
          key={code}
          className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${chipTone(code)}`}
        >
          {displayCertCode(code)}
        </span>
      ))}
    </span>
  );
}

/**
 * A form answer that starts with Yes or No, as a coloured pill. The full
 * answer is kept ("Yes — using PAM"); anything else is a neutral pill.
 */
export function YesNoPill({ value }) {
  const text = String(value ?? "").trim();
  if (!text) return <span className="text-slate-soft">—</span>;
  const tone = /^yes\b/i.test(text)
    ? "bg-green-100 text-green-800"
    : /^no\b/i.test(text)
      ? "bg-mist text-shuttle"
      : "bg-periwinkle text-brand";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}
    >
      {text}
    </span>
  );
}
