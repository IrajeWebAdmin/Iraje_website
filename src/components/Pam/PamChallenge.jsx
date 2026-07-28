import Image from "next/image";
import PamSection from "./PamSection";
import pam from "@/data/pam";

export default function PamChallenge() {
  const { eyebrow, heading, body, problems } = pam.challenge;

  return (
    <PamSection paddingClassName="py-15" className="bg-[#BDD1FE]/16!">
      {/* Section header — global epm-* classes, matching the other sections. */}
      <div className="mx-auto max-w-6xl text-center">
        <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
          {eyebrow}
        </span>
        <h2 className="mx-auto mt-4 max-w-6xl epm-heading leading-[1.05] font-medium tracking-[-2px] text-black lg:text-nowrap">
          {heading}
        </h2>
        <p className="mx-auto mt-8 max-w-3xl epm-body leading-relaxed text-[#8E8E93]">
          {body}
        </p>
      </div>

      {/* Cards fill their columns so the grid spans the full container-global
          width and the gap stays exactly gap-6 at every size. Capping the card
          width instead would turn the leftover column space into extra,
          viewport-dependent gap. */}
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {problems.map((problem) => (
          <div
            key={problem.tag}
            className="flex min-h-107.5 w-full flex-col rounded-3xl border border-mist bg-white p-7 text-left shadow-[0px_3.05px_6.09px_-0.76px_#00000014]"
          >
            {/* Figma: alert glyph (~32px) centered inside a ~49x44 rounded badge */}
            <span className="mb-5 flex h-11 w-[49px] shrink-0 items-center justify-center rounded-xl bg-[#E00000]/10">
              <Image src={problem.icon} alt="" width={32} height={32} />
            </span>
            <span className="text-xl font-normal  text-[#E00000] uppercase">
              {problem.tag}
            </span>
            <h3 className="mt-4 font-display text-2xl font-medium text-ink">
              {problem.title}
            </h3>
            <p className="mt-3 text-lg leading-relaxed text-[#8E8E93] ">
              {problem.body}
            </p>
          </div>
        ))}
      </div>
    </PamSection>
  );
}
