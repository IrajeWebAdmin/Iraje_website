import Image from "next/image";
import { FiEye, FiTarget, FiAward } from "react-icons/fi";
import about from "@/data/about";

const ICONS = {
  "Our Vision": FiEye,
  "Our Mission": FiTarget,
  "Our Values": FiAward,
};

export default function AboutWhoWeAre() {
  const { eyebrow, heading, body, cards, timeline } = about.whoWeAre;

  return (
    <section id="who-we-are" className="bg-white py-20 md:py-28">
      <div className="container-global">
        {/* ── Container 1: Who we are ─────────────────────────────────────
            Extra bottom padding leaves blue room for the cards to overlap. */}
        <div className="rounded-[2.25rem] bg-brand px-6 pt-10 pb-24 text-white sm:rounded-[3rem] sm:px-8 md:rounded-[3.8rem] md:px-12 md:pt-16 md:pb-36">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
            <div>
              <p className="epm-eyebrow epm-eyebrow-normal text-white/80">
                {eyebrow}
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
                {heading}
              </h2>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-white/75 md:text-base">
                {body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>

            <div className="self-start">
              <Image
                src="/images/about/About-Iraje.png"
                alt="The Iraje team"
                width={958}
                height={856}
                priority
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>

        {/* ── Three floating cards: bridge the two containers ──────────────
            The row is inset with horizontal padding so it's narrower than the
            containers — the blue boxes show through on the sides, revealing
            container 1's rounded BOTTOM and container 2's rounded TOP. The cards
            still overlap both containers vertically (the bridge). Center card is
            1.5× wider; even spacing; 32–40px corners; soft shadow. 3-across and
            overlapping at every width; the side inset grows with the screen. */}
        <div className="relative z-10 -mt-14 grid grid-cols-[1fr_1.5fr_1fr] gap-3 px-2 sm:gap-6 sm:px-12 md:-mt-24 md:gap-8 md:px-24 lg:px-36">
          {cards.map((card) => {
            const Icon = ICONS[card.title] ?? FiAward;
            return (
              <div
                key={card.title}
                className="rounded-[32px] bg-white p-4 text-left shadow-[0_30px_70px_-30px_rgba(4,20,54,0.45)] sm:rounded-[40px] sm:p-7 md:p-10"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E3E9FF] text-brand sm:h-10 sm:w-10 sm:rounded-xl">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                  <h3 className="font-display text-sm font-semibold text-ink sm:text-base md:text-lg">
                    {card.title}
                  </h3>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-soft sm:mt-4 sm:text-sm md:text-base">
                  {card.body}
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Container 2: Timeline ────────────────────────────────────────
            Extra top padding leaves blue room for the cards to overlap. */}
        <div className="relative -mt-14 rounded-[2.25rem] bg-brand px-6 pt-24 pb-10 text-white sm:rounded-[3rem] sm:px-8 md:-mt-24 md:rounded-[3.8rem] md:px-12 md:pt-36 md:pb-16">
          <ol className="space-y-7">
            {timeline.map((item) => (
              <li
                key={item.stage}
                className="grid gap-2 md:grid-cols-[150px_1fr] md:items-start md:gap-10"
              >
                <span className="font-display text-sm font-semibold tracking-wide text-white/85 md:pt-1 md:text-right">
                  {item.stage}
                </span>
                <div className="relative border-l border-white/30 pl-7">
                  <span className="absolute top-1 -left-[9px] h-4 w-4 rounded-full border-2 border-white/80 bg-brand" />
                  <h4 className="font-display text-base font-semibold">
                    {item.title}
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/70">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
