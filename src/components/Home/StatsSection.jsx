"use client";

import { motion } from "framer-motion";
import stats from "@/data/stats";

export default function StatsSection() {
  return (
    <section className="bg-[#F8F9FC] py-12 inset-shadow-sm inset-shadow-grey-500/50">
      {/* <div className="mx-auto max-w-7xl px-6"> */}
      <div className="container-global">
        <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              //   initial={{
              //     opacity: 0,
              //     y: 30,
              //   }}
              initial={false}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
            >
              <h2 className="text-[clamp(3rem,1.5rem_+_5vw,4.5rem)] font-semibold text-[#0F5BE8]">
                {stat.value}
              </h2>

              <p className="mt-3 text-[clamp(1rem,0.9rem_+_0.5vw,1.25rem)] text-gray-500">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
