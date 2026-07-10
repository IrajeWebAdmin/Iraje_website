import university from "@/data/university";

export default function UniversitySkills() {
  const { eyebrow, heading, left, quote, right, stats } = university.skills;

  return (
    <section className="bg-[#F7FAFF] py-20 md:py-24">
      <div className="container-global">
        {/* Heading — centered, sized to sit on one line like the design */}
        <div className="mx-auto max-w-5xl text-center">
          <p className="epm-eyebrow epm-eyebrow-normal text-brand">{eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.15] text-ink md:text-[2.5rem] lg:whitespace-nowrap">
            {heading}
          </h2>
        </div>

        {/* Two-column body */}
        <div className="mx-auto mt-12 grid max-w-6xl gap-10 md:grid-cols-2 md:gap-16">
          <div className="space-y-5 text-[15px] leading-7 text-[#23374f]">
            {left.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="space-y-5">
            <blockquote className="border-l-[3px] border-azure pl-6 text-xl font-medium italic leading-8 text-[#1240b8]">
              &ldquo;{quote}&rdquo;
            </blockquote>
            {right.map((p, i) => (
              <p key={i} className="text-[15px] leading-7 text-[#23374f]">
                {p}
              </p>
            ))}
          </div>
        </div>

        {/* Stats — exact Figma card shape (267.26 × 224.35) */}
        <div className="mt-14 flex flex-wrap justify-center gap-[27.61px]">
          {stats.map((stat) => (
            <div
              key={stat.value}
              className="relative flex h-[224.35px] w-[267.26px] max-w-full flex-col gap-[11.51px] overflow-hidden rounded-[18.41px] border-[1.15px] border-ink/10 bg-white px-[25.31px] py-[27.61px] shadow-[0_1px_2px_0_rgba(12,30,58,0.05)]"
            >
              <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-azure to-[#0e9bd6]" />
              <p className="font-display text-5xl font-semibold text-azure">{stat.value}</p>
              <p className="text-sm leading-relaxed text-[#5b6c84]">{stat.caption}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
