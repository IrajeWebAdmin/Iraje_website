import Link from "next/link";
import university from "@/data/university";

// Product names the intro body renders in bold black, matching the design.
const BOLD_TERMS = ["Iraje PAM, Iraje EPM", "Iraje IAM"];

function renderBody(text) {
  const escaped = BOLD_TERMS.map((t) =>
    t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  // Bind the last two words with a non-breaking space so the paragraph can
  // never end on a one-word orphan line ("…complementary / domains.").
  return text
    .replace(/\s+(\S+)$/, "\u00A0$1")
    .split(new RegExp(`(${escaped.join("|")})`))
    .map((part, i) =>
      BOLD_TERMS.includes(part) ? (
        <span key={i} className="font-semibold text-ink">
          {part}
        </span>
      ) : (
        part
      ),
    );
}

export default function UniversityIntro() {
  const { heading, body, cards } = university.intro;

  return (
    <section className="bg-white py-10">
      <div className="container-global">
        {/* Intro copy — spans the same width as the cards below (no narrower
            max-width) so the body settles into three lines on desktop. */}
        <div className="text-center">
          <h2 className="mx-auto mt-4 max-w-6xl epm-heading leading-[1.05] font-medium tracking-[-2px] text-black ">
            {heading}
          </h2>
          <p className="mt-5 epm-body leading-relaxed text-[#5b6c84]">
            {renderBody(body)}
          </p>
        </div>

        {/* Two domain cards */}
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {cards.map((card, index) => (
            <article
              key={card.title}
              className="flex flex-col rounded-[1.25rem] border border-ink/10 p-9 text-white shadow-[0px_1.04px_2.08px_0px_#0C1E3A0D] bg-[linear-gradient(118deg,#0451cc_0%,#022966_100%)]"
            >
              <p className="text-[11.5px] font-medium uppercase tracking-[0.2em] text-white/60">
                {card.label}
              </p>
              <h3 className="mt-4 font-display text-[1.75rem] font-semibold leading-tight">
                {card.title}
              </h3>
              <p className="mt-3 mb-8 text-[15px] leading-7 text-white/90">
                {card.body[0]}
                <span className={index === 0 ? "text-[#FFCE0C]" : "text-[#FFCE0C]"}>
                  {card.body[1]}
                </span>
                {card.body[2]}
              </p>
              {/* mt-auto pins the CTA to the card's bottom so both cards' CTAs
                  align on the same line despite differing body lengths. */}
              <Link
                href={card.cta.href}
                className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-ink transition hover:bg-white/90"
              >
                {card.cta.label} <span aria-hidden>→</span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
