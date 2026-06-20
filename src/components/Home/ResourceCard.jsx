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

export default function ResourceCard({
  title,
  description,
  buttonText,
  image,
  link,
}) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
      className="relative h-full overflow-hidden rounded-[50px] bg-white shadow-lg"
    >
      {/* Image Area - 60% */}
      <div className="relative h-[320px] lg:h-[340px]">
        <Image src={image} alt={title} fill className="object-cover" />
      </div>

      {/* Title Badge */}
      <div className="relative">
        <span className="absolute -bottom-6 left-8 z-10  flex h-[48px] min-w-[320px] rounded-l-md rounded-r-full bg-[#1456D9] px-6 py-2 text-sm font-semibold text-white">
        {/* <span className="absolute -bottom-6 left-6 z-10 flex h-[48px] min-w-[280px] items-center rounded-full bg-[#1456D9] px-8 text-[22px] font-medium text-white shadow-md"> */}
          {title}
        </span>
      </div>

      {/* Content Area - 40% */}
      <div className="min-h-[220px] px-8 pt-16 pb-10">
        <p className="text-[15px] leading-relaxed text-gray-500">
          {description}
        </p>

        <Link
          href={link}
          className="mt-8 inline-flex items-center gap-2 font-semibold text-[#1456D9]"
        >
          {buttonText}
          <span>→</span>
        </Link>
      </div>

      {/* Bottom Blue Curved Border */}
      <div className="absolute bottom-0 left-0 h-[12px] w-full rounded-b-[28px] border-b-[6px] border-[#1456D9]" />
    </motion.div>
  );
}
