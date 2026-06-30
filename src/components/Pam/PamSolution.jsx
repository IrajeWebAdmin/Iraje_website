import PamSection from "./PamSection";
import { FiShield } from "react-icons/fi";
import pam from "@/data/pam";

export default function PamSolution() {
  const { eyebrow, heading, body, benefits } = pam.solution;

  return (
    <PamSection tone="dark" center eyebrow={eyebrow} heading={heading} intro={body} className="bg-[#0b1a39]!">
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 ">
        {benefits.map((benefit) => (
          <div key={benefit.title} className="rounded-3xl bg-[#0b1a39] p-7 text-left shadow-2xl border-white">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white">
              <FiShield className="h-5 w-5" />
            </span>
            <h3 className="mt-5 font-display text-base font-semibod text-white">
              {benefit.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-soft">
              {benefit.body}
            </p>
          </div>
        ))}
      </div>
    </PamSection>
  );
}
