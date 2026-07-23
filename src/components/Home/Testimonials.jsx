"use client";

import { useState, useEffect } from "react";
import testimonials from "@/data/testimonials";
import TestimonialCard from "./TestimonialCard";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(3);

  // Cards shown per view, responsive: 1 (mobile) / 2 (tablet) / 3 (desktop).
  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      setPerView(w < 640 ? 1 : w < 1024 ? 2 : 3);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = Math.max(0, testimonials.length - perView);

  // Keep the index in range when perView changes (e.g. on resize).
  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(maxIndex, i + 1));

  return (
    <section className="bg-[#F8F9FC] py-16">
      <div className="container-global">
        {/* Heading */}
        <div className="text-center">
          <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-[#0451CC]">
            Testimonials
          </span>

          <h2 className="mt-4 epm-heading font-medium">
            Trusted By Our Clients
          </h2>
        </div>

        {/* Carousel — a single row of cards, slid one at a time by the arrows.
            Vertical padding leaves room for each card's hover lift/shadow, which
            the overflow-hidden viewport would otherwise clip. */}
        <div className="mt-20 overflow-hidden py-8">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${index * (100 / perView)}%)` }}
          >
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="shrink-0 px-4"
                style={{ width: `${100 / perView}%` }}
              >
                <TestimonialCard {...item} />
              </div>
            ))}
          </div>
        </div>

        {/* Arrows */}
        <div className="mt-10 flex justify-center gap-8">
          <button
            type="button"
            onClick={prev}
            disabled={index === 0}
            aria-label="Previous testimonials"
            className="text-2xl transition hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <FaChevronLeft />
          </button>

          <button
            type="button"
            onClick={next}
            disabled={index >= maxIndex}
            aria-label="Next testimonials"
            className="text-2xl transition hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
}
