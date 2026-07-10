"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function ProductCard({
  shortName,
  title,
  description,
  icon,
  link,
  active,
  onMouseEnter,
  activeCard,
  comingSoon,
}) {
  // The middle card (EPM) borders both gaps, so nudging it by a small
  // percentage of its own width keeps the two visible gaps equal when a
  // side card scales up. 3.25% = (activeScale - inactiveScale) / 4.
  let x = 0;
  if (shortName === "EPM") {
    if (activeCard === "pam") x = "3.25%";
    else if (activeCard === "iam") x = "-3.25%";
  }

  return (
    <motion.div
      onMouseEnter={onMouseEnter}
      animate={{
        scale: active ? 1.08 : 0.95,
        x,
      }}
      transition={{
        duration: 0.35,
        ease: "easeOut",
      }}
      className={`relative aspect-[10/9] w-full rounded-[40px] border-b-4 border-[#0451CC] bg-white p-5 shadow-lg sm:aspect-square sm:p-8 ${
        comingSoon ? "cursor-default" : "cursor-pointer"
      } ${active ? "z-30 shadow-2xl" : ""}`}
      style={{
        transformOrigin: "bottom center",
      }}
    >
      {/* <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-[#EEF2FF]">
        <Image src={icon} alt={`${title} icon`} width={28} height={28} />
      </div>

      <span className="text-sm text-[#6A8DFF]">{shortName}</span>

      <h3 className="mt-3 text-2xl leading-snug font-semibold text-black">
        {title}
      </h3>

      <p className="mt-5 leading-relaxed text-gray-500">{description}</p> */}

      <motion.div
        animate={{
          scale: active ? 1.15 : 1,
        }}
        transition={{ duration: 0.3 }}
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-[#EEF2FF]"
      >
        <Image src={icon} alt={`${title} icon`} width={28} height={28} />
      </motion.div>

      <span className="text-sm text-[#6A8DFF]">{shortName}</span>

      <motion.h3
        animate={{
          scale: active ? 1.05 : 1,
        }}
        transition={{ duration: 0.3 }}
        className="mt-3 origin-left text-[clamp(1.5rem,1.1rem_+_1.6vw,1.875rem)] leading-snug font-semibold text-black"
      >
        {title}
      </motion.h3>

      <motion.p
        animate={{
          scale: active ? 1.02 : 1,
        }}
        transition={{ duration: 0.3 }}
        className="mt-5 origin-left text-[clamp(0.9375rem,0.85rem_+_0.4vw,1.125rem)] leading-relaxed text-gray-500"
      >
        {description}
      </motion.p>

      {comingSoon ? (
        <span
          aria-disabled="true"
          className="mt-6 inline-flex cursor-not-allowed items-center text-xl font-medium text-gray-400 select-none"
        >
          Explore {shortName} (Coming Soon)
        </span>
      ) : (
        <Link
          href={link}
          aria-label={`Explore ${title}`}
          className="mt-6 inline-flex items-center text-xl font-medium text-[#0451CC] after:absolute after:inset-0 after:rounded-[40px] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0451CC]"
        >
          Explore {shortName} →
        </Link>
      )}
    </motion.div>
  );
}
