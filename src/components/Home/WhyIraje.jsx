"use client";

import Image from "next/image";
import whyIraje from "@/data/whyIraje";
import { motion } from "framer-motion";

export default function WhyIraje() {
  return (
    <section className="relative overflow-hidden bg-[#fff] py-15">
      {/* Decorative overlapping circles (bottom-right, clipped by section edges) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -bottom-20 z-0 h-105 w-105"
      >
        <span className="absolute top-[18%] left-[22%] h-60 w-60 rounded-full bg-[#0451CC]/15" />
        <span className="absolute top-[28%] right-[1%] h-60 w-60 rounded-full bg-[#0451CC]/15" />
        <span className="absolute bottom-[1%] right-[1%] h-60 w-60 -translate-x-1/2 rounded-full bg-[#0451CC]/15" />
      </div>

      {/* <div className="mx-auto max-w-7xl px-6"> */}
      <div className="container-global relative z-10">
        {/* Heading */}
        <div className="mb-20 text-center">
          <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
            Why Iraje?
          </span>

          <h2 className="mx-auto mt-4 max-w-6xl epm-heading leading-[1.05] font-medium tracking-[-2px] text-black">
            Your Trusted Partner in Identity Security.
          </h2>

          <p className="mx-auto mt-8 max-w-4xl epm-body leading-relaxed text-[#8E8E93] lg:text-nowrap">
            Designed for enterprises. Aligned with global standards. Trusted for Mission-Critical Security.
          </p>
        </div>

        {/* Content */}
        <div className="grid gap-16 lg:grid-cols-[1.45fr_1fr]  lg:items-center">
          {/* Left Image */}
          <div className="overflow-hidden rounded-[40px]">
            <Image
              src="/images/home/home-trusted-patner.webp"
              alt="Iraje team discussing enterprise identity security solutions"
              width={800}
              height={1000}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Features */}
          <div className="grid gap-8 sm:grid-cols-2">
            {whyIraje.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#0451CC]">
                  <Image
                    src={item.icon}
                    alt={item.title}
                    width={24}
                    height={24}
                  />
                </div>

                <h3 className="mb-3 text-xl font-semibold text-black">
                  {item.title}
                </h3>

                <p className="text-[clamp(0.875rem,0.75rem+0.33vw,1rem)] leading-relaxed text-gray-500">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
