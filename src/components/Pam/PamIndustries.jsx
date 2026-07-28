"use client";

import useEmblaCarousel from "embla-carousel-react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import {
  FaLandmark,
  FaDollarSign,
  FaHandHoldingMedical,
  FaBriefcaseMedical,
  FaLaptopCode,
  FaPlane,
  FaFlask,
  FaCapsules,
  FaIndustry,
  FaFilm,
  FaStore,
  FaShieldAlt,
  FaEllipsisH,
} from "react-icons/fa";
import PamSection from "./PamSection";
import pam from "@/data/pam";

// White glyph shown inside each industry's blue circle, keyed by industry name.
const INDUSTRY_ICONS = {
  Banks: FaLandmark,
  "Financial Services": FaDollarSign,
  Insurance: FaHandHoldingMedical,
  Healthcare: FaBriefcaseMedical,
  "IT / ITES": FaLaptopCode,
  "Hospitality & Travel": FaPlane,
  Chemical: FaFlask,
  Pharmaceuticals: FaCapsules,
  Manufacturing: FaIndustry,
  Media: FaFilm,
  Retail: FaStore,
  Defence: FaShieldAlt,
  Others: FaEllipsisH,
};

export default function PamIndustries() {
  const { eyebrow, heading, body, items } = pam.industries;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 3,
  });

  return (
    <PamSection  paddingClassName="py-15">
      {/* Section header — global epm-* classes, matching the other sections. */}
      <div className="mx-auto max-w-6xl text-center">
        <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
          {eyebrow}
        </span>
        <h2 className="mx-auto mt-4 max-w-6xl epm-heading leading-[1.05] font-medium tracking-[-2px] text-black ">
          {heading}
        </h2>
        <p className="mx-auto mt-8 max-w-3xl epm-body leading-relaxed text-[#8E8E93] lg:text-nowrap">
          {body}
        </p>
      </div>

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
            {items.map((industry) => {
              const Icon = INDUSTRY_ICONS[industry];
              return (
                <div
                  key={industry}
                  className="min-w-[16.66%] flex-shrink-0 px-4"
                >
                  <div className="flex flex-col items-center">
                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#0451CC] text-white">
                      {Icon && <Icon className="h-12 w-12" />}
                    </div>

                    <h3 className="mt-6 text-center text-lg font-semibold">
                      {industry}
                    </h3>
                  </div>
                </div>
              );
            })}
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