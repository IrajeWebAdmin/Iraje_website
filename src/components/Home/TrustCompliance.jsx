"use client";

import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiShield,
  FiCreditCard,
  FiFile,
  FiGlobe,
  FiHome,
  FiClock,
} from "react-icons/fi";
import { BsGraphUp } from "react-icons/bs";
import { LuStethoscope } from "react-icons/lu";
import compliance from "@/data/compliance";

// Per-standard icons, keyed by the `icon` field on each data item — the same
// map PamCompliance and EpmCompliance use, so a standard that appears on more
// than one page carries the same glyph everywhere. This is the union of those
// two maps; keep the three in step when a key is added.
const ICONS = {
  check: FiCheckCircle,
  shield: FiShield,
  card: FiCreditCard,
  file: FiFile,
  health: LuStethoscope,
  globe: FiGlobe,
  chart: BsGraphUp,
  home: FiHome,
  clock: FiClock,
};

// Feather/Lucide glyphs ship with stroke-width 2 on a 24 viewBox — a weight
// drawn for the ~20px they render at on the product pages. Scaled to the 84px
// used here that stroke scales with them, which is why they read as bold. 1.5
// is 1/16th of the glyph box, the same weight-to-size ratio the Bootstrap icon
// below is drawn at, so all twelve discs match.
const STROKE_WIDTH = 1.5;

// `chart` (BsGraphUp) is filled paths rather than strokes: it has no stroke to
// thin, and setting a width would outline the fill and make it heavier. It is
// already at the target weight, so it is left untouched.
const FILL_BASED = new Set(["chart"]);

export default function TrustCompliance() {
  // Same carousel setup as PamIndustries, so both sections scroll identically.
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 3,
  });

  return (
    <section className="bg-[#BDD1FE29] py-15">
      {/* <div className="mx-auto max-w-7xl px-6"> */}
      <div className="container-global">

        {/* Header */}
        <div className="mx-auto max-w-6xl text-center">

          <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-[#0451CC]">
            Trust & Compliance
          </span>

          <h2 className="mx-auto mt-4 max-w-6xl epm-heading leading-[1.05] font-medium tracking-[-2px] text-black">
            Security you can verify
          </h2>

          <p className="mx-auto mt-8 max-w-4xl epm-body leading-relaxed text-[#8E8E93]">
            Iraje security solutions are built to meet the most commonly referenced regulations and frameworks globally. Iraje security solutions emphatically meet compliance requirements and provide mapping to these standards.
          </p>

        </div>

        {/* Compliance Carousel */}
        <div className="relative mt-24">

          {/* Left Arrow */}
          <button
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Previous standards"
            className="absolute -left-6 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg"
          >
            <FiChevronLeft size={24} />
          </button>

          <div className="overflow-hidden" ref={emblaRef}>
            {/* Slide widths mirror the breakpoints the grid used before
                (2 / 3 / 6 across) so the mobile layout is unchanged. */}
            <div className="flex">
              {compliance.map((item) => {
                const Icon = ICONS[item.icon];
                return (
                <div
                  key={item.id}
                  className="min-w-[50%] flex-shrink-0 px-4 py-3 md:min-w-[33.333%] lg:min-w-[16.666%]"
                >
                  <motion.div
                    whileHover={{
                      y: -10,
                      scale: 1.05,
                    }}
                    transition={{
                      duration: 0.3,
                    }}
                    className="flex flex-col items-center text-center"
                  >

                    {/* Icon Circle — the glyph is white against the brand-blue
                        disc. react-icons draw in currentColor, so text-white is
                        all that is needed; h-21/w-21 is the 84px the old <Image>
                        was rendered at. */}
                    <div className="flex h-34 w-34 items-center justify-center rounded-full bg-[#0451CC] shadow-lg">
                      {Icon && (
                        <Icon
                          aria-hidden="true"
                          className="h-21 w-21 text-white"
                          {...(FILL_BASED.has(item.icon)
                            ? {}
                            : { strokeWidth: STROKE_WIDTH })}
                        />
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="mt-6 text-[clamp(1.25rem,1.05rem_+_0.8vw,1.5rem)] font-semibold text-black">
                      {item.title}
                    </h3>

                    {/* Subtitle */}
                    <p className="mt-2 text-sm text-gray-400">
                      {item.subtitle}
                    </p>

                  </motion.div>
                </div>
                );
              })}
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Next standards"
            className="absolute -right-6 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg"
          >
            <FiChevronRight size={24} />
          </button>

        </div>

      </div>
    </section>
  );
}
