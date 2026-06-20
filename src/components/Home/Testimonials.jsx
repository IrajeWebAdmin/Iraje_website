"use client";

import testimonials from "@/data/testimonials";
import TestimonialCard from "./TestimonialCard";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function Testimonials() {
  return (
    <section className="bg-[#F8F9FC] py-16">
      {/* <div className="mx-auto max-w-7xl px-6"> */}
      <div className="container-global">
        {/* Heading */}

        <div className="text-center">
          <span className="text-4xl font-medium text-[#0451CC]">
            Testimonials
          </span>

          <h2 className="mt-4 text-6xl font-semibold">Trusted By Our Clients</h2>
        </div>

        {/* Cards */}

        <div className="mt-20 grid gap-8 lg:grid-cols-3">
          {testimonials.map((item) => (
            <TestimonialCard key={item.id} {...item} />
          ))}
        </div>

        {/* Arrows */}

        <div className="mt-10 flex justify-center gap-8">
          <button className="text-2xl transition hover:text-blue-600">
            <FaChevronLeft />
          </button>

          <button className="text-2xl transition hover:text-blue-600">
            <FaChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
}
