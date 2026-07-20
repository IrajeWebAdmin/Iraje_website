// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import { motion } from "framer-motion";

// export default function ResourceCard({
//   title,
//   description,
//   buttonText,
//   image,
//   link,
// }) {
//   return (
//     <motion.div
//       whileHover={{
//         y: -10,
//       }}
//       transition={{
//         duration: 0.3,
//       }}
//       className=" overflow-hidden rounded-[28px] bg-white shadow-lg border-b-4 border-blue-600">
//       {/* Image */}
//       <div className="relative h-[220px]">
//         <Image
//           src={image}
//           alt={title}
//           fill
//           className="object-cover"
//         />
//       </div>

//       {/* Badge */}
//       <div className="relative px-8">
//         <span
//           className=" absolute -top-4 left-8 rounded-full bg-blue-600 px-6 py-2 text-white text-sm font-medium ">
//           {title}
//         </span>
//       </div>

//       {/* Content */}
//       <div className="px-8 pb-8 pt-10">

//         <p className="text-gray-500 leading-relaxed">
//           {description}
//         </p>

//         <Link
//           href={link}
//           className=" mt-6 inline-flex  items-center font-medium text-blue-600 hover:underline ">
//           {buttonText} →
//         </Link>

//       </div>
//     </motion.div>
//   );
// }

// ----------------------------------------------------------------------------

"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

// Emphasize the CyberTantra brand name wherever it appears in the copy,
// keeping the data layer as plain strings.
function withBrandHighlight(text) {
  return text.split(/(CyberTantra)/g).map((part, i) =>
    part === "CyberTantra" ? (
      <strong key={i} className="font-semibold text-gray-700">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

export default function ResourceCard({
  title,
  description,
  buttonText,
  image,
  link,
  comingSoon,
}) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
      className="relative flex h-[489px] w-[424px] max-w-full flex-col rounded-[36px] border border-ink/10 bg-white shadow-lg"
    >
      {/* Image Area — rounds the top corners itself, since the card no longer
          clips (so the title badge can overhang past the left edge). */}
      <div className="relative h-[260px] shrink-0 overflow-hidden rounded-t-[36px]">
        <Image src={image} alt={title} fill className="object-cover" />
      </div>

      {/* Title Badge */}
      <div className="relative shrink-0">
        <span className="absolute -bottom-6 -left-3 z-10 flex h-8.75 w-58.5 items-center rounded-r-[20px] bg-[#1456D9] px-6 text-lg font-medium text-white">
          {title}
        </span>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col px-8 pt-12 pb-8">
        <p className="text-[clamp(0.875rem,0.75rem+0.33vw,1rem)] leading-relaxed text-gray-500">
          {withBrandHighlight(description)}
        </p>

        {comingSoon ? (
          <span
            aria-disabled="true"
            className="mt-auto inline-flex cursor-not-allowed items-center gap-2 font-semibold text-gray-400 select-none"
          >
            {buttonText}
          </span>
        ) : (
          <Link
            href={link}
            className="mt-auto inline-flex items-center gap-2 font-semibold text-[#1456D9]"
          >
            {buttonText}
            <span>→</span>
          </Link>
        )}
      </div>

      {/* Bottom blue curved accent — mirrors the card's exact shape
          (inset-0 + same rounded-[36px]) so the border curves to match the
          container's corners. Only the bottom edge is drawn. */}
      <div className="pointer-events-none absolute inset-0 rounded-[36px] border-b-[6px] border-[#1456D9]" />
    </motion.div>
  );
}
