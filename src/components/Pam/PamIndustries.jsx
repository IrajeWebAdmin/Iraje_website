"use client";

import useEmblaCarousel from "embla-carousel-react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import PamSection from "./PamSection";
import pam from "@/data/pam";

export default function PamIndustries() {
  const { eyebrow, heading, body, items } = pam.industries;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 3,
  });

  return (
    <PamSection
      center
      eyebrow={eyebrow}
      heading={heading}
      intro={body}
      eyebrowClassName="epm-eyebrow-normal"
    >
      <div className="relative mt-16">
        {/* Left Arrow */}
        <button
          onClick={() => emblaApi?.scrollPrev()}
          className="absolute -left-6 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg"
        >
          <FiChevronLeft size={24} />
        </button>

        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {items.map((industry) => (
              <div
                key={industry}
                className="min-w-[16.66%] flex-shrink-0 px-4"
              >
                <div className="flex flex-col items-center">
                  <div className="h-32 w-32 rounded-full bg-[#0451CC]" />

                  <h3 className="mt-6 text-center text-lg font-semibold">
                    {industry}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => emblaApi?.scrollNext()}
          className="absolute -right-6 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg"
        >
          <FiChevronRight size={24} />
        </button>
      </div>
    </PamSection>
  );
}