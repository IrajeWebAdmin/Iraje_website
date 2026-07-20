import { FiAlertTriangle, FiCheck } from "react-icons/fi";
import epm from "@/data/epm";

// Keyhole-in-circle mark for the "local admin rights" tile — a ring enclosing a
// keyhole (access / privileges). Inlined because react-icons has no clean
// keyhole-in-circle glyph. Colour comes from the parent via `currentColor`.
function KeyholeIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" strokeWidth="2" />
      <circle cx="12" cy="10.6" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12 12v3.1" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ProblemCard({ tile, title, items }) {
  return (
    <div className="rounded-2xl border-[0.76px] border-[#00000017] bg-white p-8 shadow-[0px_3.05px_6.09px_-0.76px_#00000014]">
      {tile}
      <h3 className="mt-5 text-lg font-semibold text-brand">{title}</h3>
      <ul className="mt-5 space-y-3.5">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-3 text-[15px] text-ink/80">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] bg-[#BBD0F1] text-brand">
              <FiCheck className="h-3.5 w-3.5" />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function EpmCoreProblem() {
  const {
    eyebrow,
    heading,
    body,
    reasonsTitle,
    risksTitle,
    reasons,
    risks,
    banner,
  } = epm.coreProblem;

  return (
    <section className="bg-white py-20 text-ink md:py-15">
      <div className="epm-container">
        {/* Header */}
        <div className="mx-auto max-w-4xl text-center">
          <p className="epm-eyebrow epm-eyebrow-normal font-semibold text-brand">
            {eyebrow}
          </p>
          <h2 className="mt-4 font-display epm-heading leading-[1.1] font-medium text-ink">
            {`"${heading}"`}
          </h2>
        </div>

        {/* Body sits in its own wider wrapper (outside the max-w-4xl header block)
            so it wraps onto two lines rather than three. */}
        <p className="mx-auto mt-6 max-w-5xl text-center epm-body leading-relaxed text-[#8E8E93]">
          {body}
        </p>

        {/* Reasons + risks */}
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <ProblemCard
            tile={
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#BBD0F1]">
                <KeyholeIcon className="h-6 w-6 text-brand" />
              </span>
            }
            title={reasonsTitle}
            items={reasons}
          />
          <ProblemCard
            tile={
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FCE9E9]">
                <FiAlertTriangle className="h-5 w-5 text-[#E00000]" />
              </span>
            }
            title={risksTitle}
            items={risks}
          />
        </div>

        {/* Banner */}
        <div className="mt-6 rounded-2xl border border-[#E8ECF4] bg-white px-8 py-7 text-center shadow-[0_8px_30px_rgba(2,41,102,0.05)]">
          <p className="font-display text-lg font-medium text-ink md:text-xl">
            {banner}
          </p>
        </div>
      </div>
    </section>
  );
}
