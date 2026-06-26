import PamSection from "./PamSection";
import { FiLock } from "react-icons/fi";
import pam from "@/data/pam";

export default function PamPillars() {
  const { eyebrow, heading, body, items } = pam.pillars;

  return (
    <PamSection center eyebrow={eyebrow} heading={heading} intro={body}>
      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((pillar) => (
          <div
            key={pillar.name}
            className="flex flex-col rounded-3xl border border-mist bg-white p-7 text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-[41px] w-[41px] shrink-0 items-center justify-center rounded-xl bg-brand text-white">
                  <FiLock className="h-5 w-5" />
                </span>
                <h3 className="font-display text-2xl font-medium text-ink">
                  {pillar.name}
                </h3>
              </div>
              <span className="rounded-full bg-[#E3E9FF] px-3 py-1 text-[10px] font-semibold tracking-[0.1em] text-brand uppercase">
                {pillar.team}
              </span>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {pillar.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#E3E8F4] bg-[#F6F8FD] px-3 py-1.5 text-xs font-medium text-ink/75"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PamSection>
  );
}
