import Image from "next/image";
import EpmSection from "./EpmSection";
import epm from "@/data/epm";

export default function EpmDifferentiators() {
  const { eyebrow, heading, body, items } = epm.differentiators;

  return (
    <EpmSection paddingClassName="py-15">
      <div className="mx-auto max-w-6xl text-center">
        <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
          {eyebrow}
        </span>
        <h2 className="mx-auto mt-4 max-w-6xl epm-heading leading-[1.05] font-medium tracking-[-2px] text-black">
          {heading}
        </h2>
        <p className="mt-8 epm-body leading-relaxed text-[#8E8E93] lg:whitespace-nowrap">
          {body}
        </p>
      </div>

      <div className="mt-14 space-y-6">
        {items.map((item) => (
          <div
            key={item.num}
            className="card-hover flex min-h-[120px] items-center gap-6 rounded-[20px] border border-[#707070]/20 bg-white px-8 py-6"
          >
            <div className="flex shrink-0 items-center gap-4">
              {/* Fixed width + tabular figures so every row's number occupies the
                  same space — otherwise Poppins' proportional digits ("1" is
                  narrower than "3") shift the icon tile out of vertical line. */}
              <span className="w-14 shrink-0 font-display text-4xl leading-none font-semibold tabular-nums text-[#0451CC] sm:w-16 sm:text-5xl">
                {item.num}
              </span>

              {/* Icon tile — the source SVGs are already white, so no filter. */}
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0451CC]">
                <Image src={item.icon} alt="" width={26} height={26} />
              </span>
            </div>

            <div>
              <h3 className="text-ink text-lg font-medium">{item.title}</h3>

              <p className="text-[#707070] mt-1 text-base leading-relaxed">
                {item.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </EpmSection>
  );
}
