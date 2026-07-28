import { FaCheck } from "react-icons/fa";
import epm from "@/data/epm";

export default function EpmThreat() {
  const {  eyebrow ,heading, body, points } = epm.threat;

  return (
    <section className="bg-[#ffffff] py-3">
      <div className="epm-container">
        {/* Heading */}
        <div className="mx-auto max-w-6xl text-center">
          <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
            {eyebrow}
          </span>

          <h2 className="mx-auto mt-4 max-w-6xl epm-heading leading-[1.05] font-medium tracking-[-2px] text-black lg:whitespace-nowrap">
            {heading}
          </h2>

          <p className="mx-auto mt-8 max-w-4xl epm-body  leading-relaxed text-[#8E8E93]">
            Endpoints are the primary entry point for most cyberattacks and
            modern ransomware almost always begins there before spreading across
            the enterprise.
          </p>

          <p className="mx-auto mt-8 max-w-4xl epm-body  leading-relaxed text-[#8E8E93]">
            That's why endpoint security is now a central pillar of enterprise
            cybersecurity and why preventing privilege misuse at the endpoint
            matters more than ever.
          </p>
        </div>

        {/* White Box */}

        <div className="mt-16 rounded-[28px] border border-[#E6E6E6] bg-white p-10 shadow-sm">
          <h3 className="font-poppins text-3xl font-medium text-[#0451CC]">
            Why endpoints are exposed ?
          </h3>

          <div className="mt-10 space-y-6">
            {points.map((point) => (
              <div key={point} className="flex items-center gap-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E3E9FF]">
                  <FaCheck className="h-4 w-4 text-[#0451CC]" />
                </div>

                <p className="font-poppins text-[18px] text-[#000000]">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
