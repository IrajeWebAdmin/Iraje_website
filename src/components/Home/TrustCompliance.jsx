"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import compliance from "@/data/compliance";

export default function TrustCompliance() {
  return (
    <section className="bg-[#BDD1FE29] py-16">
      {/* <div className="mx-auto max-w-7xl px-6"> */}
      <div className="container-global">

        {/* Header */}
        <div className="mx-auto max-w-6xl text-center">

          <span className="text-[clamp(1.75rem,1.4rem_+_1.6vw,2.25rem)] font-semibold  text-[#0451CC]">
            Trust & Compliance
          </span>

          <h2 className="mt-4 text-[clamp(2.25rem,1.2rem_+_4vw,3.75rem)] font-semibold text-black">
            Security you can verify
          </h2>

          <p className="mx-auto mt-10 max-w-4xl text-center text-[clamp(1.05rem,0.9rem_+_0.85vw,1.5rem)]  text-[#B8B8B8]">
            Iraje security solutions are built to meet the most commonly referenced regulations and frameworks globally. Iraje security solutions emphatically meet compliance requirements and provide mapping to these standards.
          </p>

        </div>

        {/* Compliance Grid */}
        <div className="mt-24 grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-6">

          {compliance.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{
                y: -10,
                scale: 1.05,
              }}
              transition={{
                duration: 0.3,
              }}
              className="flex flex-col items-center text-center"
            >

              {/* Icon Circle */}
              <div className="flex h-34 w-34 items-center justify-center rounded-full bg-[#0451CC] shadow-lg">
                <Image
                  src={item.icon}
                  alt={item.title}
                  width={84}
                  height={84}
                />
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
          ))}

        </div>

      </div>
    </section>
  );
}