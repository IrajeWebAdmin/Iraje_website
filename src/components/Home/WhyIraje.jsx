"use client";

import Image from "next/image";
import whyIraje from "@/data/whyIraje";
import { motion } from "framer-motion";

export default function WhyIraje() {
  return (
    <section className="bg-[#f8f8f8] py-14">
      {/* <div className="mx-auto max-w-7xl px-6"> */}
      <div className="container-global">
        {/* Heading */}
        <div className="mb-20 text-center">
          <span className="epm-eyebrow epm-eyebrow-normal font-medium text-blue-600">
            Why Iraje?
          </span>

          <h2 className="mx-auto mt-4 max-w-6xl epm-heading leading-[1.05] font-medium tracking-[-2px] text-black">
            Your Trusted Partner
            <br />
            in Identity Security.
          </h2>

          <p className="mx-auto mt-8 max-w-4xl epm-body font-medium leading-relaxed text-[#8E8E93]">
            Designed for enterprises. Aligned with global standards. Trusted for
            Mission-Critical Security.
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

                <h3 className="mb-3 epm-heading font-semibold text-black">
                  {item.title}
                </h3>

                <p className="epm-body leading-relaxed text-gray-500">
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
