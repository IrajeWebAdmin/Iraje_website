import { FaCheck } from "react-icons/fa";
import epm from "@/data/epm";

export default function EpmThreat() {
  const { heading, body, points } = epm.threat;

  return (
    <section className="bg-[#ffffff] py-10">
      <div className="epm-container">
        {/* Heading */}
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-poppins text-[52px] leading-[1.15] font-medium text-black">
            {heading}
          </h2>

          <p className="mx-auto mt-8 max-w-4xl text-[20px] leading-relaxed text-[#737373]">
            Endpoints are the primary entry point for most cyberattacks — and
            modern ransomware almost always begins there before spreading across
            the enterprise.
          </p>

          <p className="mx-auto mt-8 max-w-4xl text-[20px] leading-relaxed text-[#737373]">
            That's why endpoint security is now a central pillar of enterprise
            cybersecurity — and why preventing privilege misuse at the endpoint
            matters more than ever.
          </p>
        </div>

        {/* White Box */}
        
          <div className="mt-16 rounded-[28px] border border-[#E6E6E6] bg-white p-10 shadow-sm">
            <h3 className="font-poppins text-[40px] font-medium text-[#0451CC]">
              Why endpoints are exposed
            </h3>

            <div className="mt-10 space-y-6">
              {points.map((point) => (
                <div key={point} className="flex items-center gap-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#B7C8E8]">
                    <FaCheck className="h-4 w-4  text-[#0451CC]" />
                  </div>

                  <p className="font-poppins text-[24px] text-[#000000]">
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
