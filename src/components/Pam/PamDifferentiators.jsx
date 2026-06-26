import PamSection from "./PamSection";
import { FiStar } from "react-icons/fi";
import pam from "@/data/pam";

export default function PamDifferentiators() {
  const { eyebrow, heading, body, items, note } = pam.differentiators;

  return (
    <PamSection center eyebrow={eyebrow} heading={heading} intro={body}>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex flex-col rounded-3xl border border-mist bg-white p-7 text-left"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E3E9FF] text-brand">
                <FiStar className="h-5 w-5" />
              </span>
              <span className="rounded-full bg-brand px-3 py-1 text-[10px] font-semibold tracking-[0.08em] text-white uppercase">
                {item.badge}
              </span>
            </div>
            <h3 className="mt-5 font-display text-base font-semibold text-ink">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-soft">
              {item.body}
            </p>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-10 max-w-4xl rounded-3xl bg-[linear-gradient(120deg,#022966_0%,#1d5bff_100%)] px-8 py-6 text-center text-sm leading-relaxed text-white/90 md:text-base">
        {note}
      </p>
    </PamSection>
  );
}
