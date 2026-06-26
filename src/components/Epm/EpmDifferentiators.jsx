import EpmSection from "./EpmSection";
import { FiShield } from "react-icons/fi";
import epm from "@/data/epm";

export default function EpmDifferentiators() {
  const { eyebrow, heading, body, items } = epm.differentiators;

  return (
    <EpmSection
      center
      eyebrow={eyebrow}
      heading={heading}
      intro={body}
      eyebrowClassName="epm-eyebrow-normal text-[#0451CC]"
    >
      <div className="mt-14 space-y-6">
        {items.map((item) => (
          <div
            key={item.num}
            className="flex min-h-[120px] items-center gap-6 rounded-[20px] border border-[#707070]/20 bg-white px-8 py-6"
          >
            <div className="flex shrink-0 items-center gap-4">
              <span className="font-display text-4xl leading-none font-bold text-[#0451CC] sm:text-5xl">
                {item.num}
              </span>

              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0451CC] text-white">
                <FiShield className="h-6 w-6" />
              </span>
            </div>

            <div>
              <h3 className="text-ink text-lg font-medium">{item.title}</h3>

              <p className="text-ink/65 mt-1 text-sm leading-relaxed">
                {item.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </EpmSection>
  );
}
