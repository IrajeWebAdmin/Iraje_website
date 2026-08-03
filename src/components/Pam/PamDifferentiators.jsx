import PamSection from "./PamSection";
import {
  FiLayers,
  FiFileText,
  FiAlertOctagon,
  FiSearch,
  FiAlertTriangle,
  FiTrendingUp,
  FiShield,
  FiClock,
} from "react-icons/fi";
import pam from "@/data/pam";

// Per-card icons, keyed by the `icon` field on each differentiator item.
const ICONS = {
  layers: FiLayers,
  watermark: FiFileText,
  bypass: FiAlertOctagon,
  search: FiSearch,
  unauthorized: FiAlertTriangle,
  analytics: FiTrendingUp,
  shield: FiShield,
  risk: FiClock,
};

// Bold the highlighted phrases within the note (listed in the data) without
// altering the copy.
function highlightNote(text, phrases) {
  if (!phrases?.length) return text;
  const escaped = phrases.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${escaped.join("|")})`, "g");
  return text.split(re).map((part, i) =>
    phrases.includes(part) ? (
      <strong key={i} className="font-semibold text-ink">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

export default function PamDifferentiators() {
  const { eyebrow, heading, body, items, note, noteHighlights } =
    pam.differentiators;

  return (
    <PamSection paddingClassName="py-15">
      {/* Section header — global epm-* classes, matching the other sections. */}
      <div className="mx-auto max-w-6xl text-center">
        <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
          {eyebrow}
        </span>
        <h2 className="mx-auto mt-4 max-w-6xl epm-heading leading-[1.05] font-medium tracking-[-2px] text-black">
          {heading}
        </h2>
        <p className="mt-8 epm-body leading-relaxed text-[#8E8E93] lg:whitespace-nowrap">
          {body}
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          return (
          <div
            key={item.title}
            className="card-hover flex flex-col rounded-3xl border border-mist bg-white p-6 text-left"
          >
            {/* Icon tile — brand-blue glyph on a light-blue square */}
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E4EAFB] text-brand">
              {Icon && <Icon className="h-5 w-5" />}
            </span>
            <span className="mt-5 text-xs font-semibold text-[#0451CC]">
              {item.badge}
            </span>
            <h3 className="mt-1 font-display text-lg font-semibold text-ink">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#8E8E93]">
              {item.body}
            </p>
          </div>
          );
        })}
      </div>

      <p className="mx-auto mt-12 max-w-5xl text-center text-sm leading-relaxed text-slate-soft md:text-base">
        {highlightNote(note, noteHighlights)}
      </p>
    </PamSection>
  );
}
