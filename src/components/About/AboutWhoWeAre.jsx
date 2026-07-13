import { FiEye, FiTarget, FiAward } from "react-icons/fi";
import about from "@/data/about";
import Image from "next/image";

const ICONS = {
  "Our Vision": FiEye,
  "Our Mission": FiTarget,
  "Our Values": FiAward,
};

export default function AboutWhoWeAre() {
  const { eyebrow, heading, body, cards, timeline } = about.whoWeAre;

  return (
    <section id="who-we-are" className="bg-white py-5">
      <div className="container-global relative">
        {/* ===========================
            TOP BLUE SECTION
        ============================ */}
        <div className="rounded-[5rem] bg-brand px-8 pt-16 pb-20 text-white md:px-16 md:pt-20 md:pb-24">
          <div>
            <p className="epm-eyebrow epm-eyebrow-normal text-white/75">
              {eyebrow}
            </p>

            <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
              {heading}
            </h2>

            <div className="mt-8 space-y-5 text-sm leading-relaxed text-white/75 md:text-base">
              {body.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {/* <div className="relative -mt-16 self-start md:-mt-24 lg:-mt-32">
              <Image
                src={"/images/about/About-Iraje.png"}
                alt={"Team collaborating on Iraje"}
                width={958}
                height={856}
                priority
                className="h-auto w-full"
              />
            </div> */}
          </div>
        </div>

        {/* ===========================
            CARDS
        ============================ */}
        <div className="relative z-20 bg-blue">
          <div className="mx-8 md:mx-10">
            <div className="grid gap-8 rounded-[5rem] bg-brand md:grid-cols-[1fr_1.45fr_1fr]">
              {cards.map((card) => {
                const Icon = ICONS[card.title] ?? FiAward;

                return (
                  <div
                    key={card.title}
                    className="h-full rounded-[4rem] bg-white p-10 "
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6EBFF] text-brand">
                        <Icon className="h-5 w-5" />
                      </span>

                      <h3 className="font-display text-xl font-semibold text-ink">
                        {card.title}
                      </h3>
                    </div>

                    <p className="mt-5 text-[15px] leading-7 text-slate-soft">
                      {card.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ===========================
            BOTTOM BLUE SECTION
        ============================ */}
        <div className="rounded-[5rem] bg-brand px-8 pt-36 pb-24 text-white md:px-16">
          <ol className="space-y-12">
            {timeline.map((item) => (
              <li
                key={item.stage}
                className="grid gap-5 md:grid-cols-[190px_1fr] md:gap-14"
              >
                <div className="font-display text-lg font-medium text-white/90 md:pt-1 md:text-right">
                  {item.stage}
                </div>

                <div className="relative border-l border-white/20 pl-9">
                  <span className="absolute left-0 top-2 h-5 w-5 -translate-x-1/2 rounded-full border-[3px] border-white bg-brand" />

                  <h4 className="font-display text-xl font-semibold">
                    {item.title}
                  </h4>

                  <p className="mt-2 max-w-4xl text-[15px] leading-7 text-white/70">
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