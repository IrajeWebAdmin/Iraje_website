import Image from "next/image";
import PamSection from "./PamSection";
import pam from "@/data/pam";

export default function PamChallenge() {
  const { eyebrow, heading, body, problems } = pam.challenge;

  return (
    <PamSection
      center
      eyebrow={eyebrow}
      eyebrowClassName="epm-eyebrow-normal"
      heading={heading}
      intro={body}
      className="bg-[#BDD1FE]/16!"
    >
      <div className="mt-12 grid justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {problems.map((problem) => (
          <div
            key={problem.tag}
            className="flex h-[362px] w-full max-w-[300px] flex-col rounded-3xl border border-mist bg-white p-7 text-left"
          >
            {/* Figma: alert glyph (~32px) centered inside a ~49x44 rounded badge */}
            <span className="mb-5 flex h-11 w-[49px] shrink-0 items-center justify-center rounded-xl bg-[#E00000]/10">
              <Image src={problem.icon} alt="" width={32} height={32} />
            </span>
            <span className="text-base font-medium tracking-[0.14em] text-[#E00000] uppercase">
              {problem.tag}
            </span>
            <h3 className="mt-4 font-display text-xl font-semibold text-ink">
              {problem.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-soft">
              {problem.body}
            </p>
          </div>
        ))}
      </div>
    </PamSection>
  );
}
