import Link from "next/link";
import university from "@/data/university";

export default function UniversityIntro() {
  const { heading, body, cards } = university.intro;

  return (
    <section className="bg-white py-20 md:py-24">
      <div className="container-global">
        {/* Intro copy */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-semibold text-ink md:text-[2.5rem]">
            {heading}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#5b6c84]">{body}</p>
        </div>

        {/* Two domain cards */}
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {cards.map((card, index) => (
            <article
              key={card.title}
              className="flex flex-col rounded-[1.25rem] border border-ink/10 p-9 text-white shadow-[0_1px_2px_0_rgba(12,30,58,0.05)] bg-[linear-gradient(118deg,#0451cc_0%,#022966_100%)]"
            >
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.2em] text-white/60">
                {card.label}
              </p>
              <h3 className="mt-4 font-display text-[1.75rem] font-semibold leading-tight">
                {card.title}
              </h3>
              <p className="mt-3 text-[15px] leading-7 text-white/90">
                {card.body[0]}
                <span className={index === 0 ? "text-[#5cc6e8]" : "text-[#729cf6]"}>
                  {card.body[1]}
                </span>
                {card.body[2]}
              </p>
              <Link
                href={card.cta.href}
                className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-ink transition hover:bg-white/90"
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
