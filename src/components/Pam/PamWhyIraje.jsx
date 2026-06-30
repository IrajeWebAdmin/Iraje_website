import PamSection from "./PamSection";
import { FiAward } from "react-icons/fi";
import pam from "@/data/pam";

export default function PamWhyIraje() {
  const { eyebrow, heading, body, items } = pam.whyIraje;

  return (
    <PamSection tone="tint" center eyebrow={eyebrow} heading={heading} intro={body}  eyebrowClassName="epm-eyebrow-normal">
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((item) => (
          <div key={item.title} className="rounded-3xl bg-white p-7 text-left">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white">
              <FiAward className="h-5 w-5" />
            </span>
            <h3 className="mt-5 font-display text-base font-semibold text-ink">
              {item.title}
            </h3>
            {/* <p className="mt-2 text-sm leading-relaxed text-slate-soft">
              {item.body}
            </p> */}
          </div>
        ))}
      </div>
    </PamSection>
  );
}


