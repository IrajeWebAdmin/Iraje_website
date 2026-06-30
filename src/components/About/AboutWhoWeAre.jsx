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
        {/* Single blue container: Who we are + cards + timeline */}
        <div className="relative rounded-[3.8rem] bg-brand px-8 py-12 text-white md:px-12 md:py-16">
          {/* Who we are: text left, image right (image overflows the top) */}
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

            <div className="self-start lg:-mt-20">
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

          {/* Three equal cards — Vision & Values raised above Mission, cutting past the blue edges */}
          <div className="relative z-10 mt-10 grid items-start gap-6 md:-mx-16 md:grid-cols-3">
            {cards.map((card) => {
              const Icon = ICONS[card.title] ?? FiAward;
              const raised = card.title !== "Our Mission";
              return (
                <div
                  key={card.title}
                  className={`${raised ? "md:-translate-y-10" : ""} rounded-[2.5rem] bg-white p-9 text-left shadow-[0_24px_50px_-22px_rgba(2,18,54,0.45)]`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E3E9FF] text-brand">
                      <Icon className="h-4 w-4" />
                    </span>
                    <h3 className="font-display text-base font-semibold text-ink">
                      {card.title}
                    </h3>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-slate-soft">
                    {card.body}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Timeline: Origins → Today */}
          <div className="mt-12">
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
      </div>
    </section>
  );
}
