"use client";

import { FaStar } from "react-icons/fa";
import { FaQuoteLeft } from "react-icons/fa";

export default function TestimonialCard({
  name,
  company,
  rating,
  review,
}) {
  return (
   <div className="group min-h-[460px] rounded-[32px] border border-gray-200 bg-white p-10 text-center shadow-sm transition-all duration-300 hover:bg-[#373B55] hover:text-white hover:shadow-xl hover:-translate-y-2">
      {/* Stars */}
      <div className="flex justify-center gap-2">
        {[...Array(rating)].map((_, index) => (
          <FaStar
            key={index}
            className=" text-blue-600 group-hover:text-white "
          />
        ))}
      </div>

      {/* Name */}
      <h3 className="mt-6 epm-heading font-semibold">
        {name}
      </h3>

      {/* Company */}
      <p className=" mt-2 text-gray-500 group-hover:text-gray-300 ">
        {company}
      </p>

      {/* Quote */}
      <div className="mt-6 flex justify-center">
        <FaQuoteLeft
          className=" text-4xl text-blue-600 group-hover:text-white"
        />
      </div>

      {/* Review */}
      <p className="epm-body mt-6 leading-relaxed text-gray-500 group-hover:text-gray-200 ">
        {review}
      </p>
    </div>
  );
}