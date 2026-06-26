import Image from "next/image";
import epm from "@/data/epm";

export default function EpmArchitecture() {
  const { eyebrow, heading, body, nodes } = epm.architecture;

  return (
    <section className="bg-[#F5F8FF] py-24">
      <div className="epm-container">
        <div className="grid items-center gap-16 lg:grid-cols-[1.15fr_0.85fr]">
          
          {/* Left Diagram */}
          <div className="overflow-hidden rounded-[32px] bg-white p-8 shadow-sm">
            <Image
              src="/images/epm/Solution-architecture.webp" // your image
              alt="EPM Architecture"
              width={900}
              height={700}
              className="h-auto w-full"
            />
          </div>

          {/* Right Content */}
          <div>
            <p className="mb-3 text-[18px] font-medium text-[#0451CC]">
              {eyebrow}
            </p>

            <h2 className="text-[48px] leading-[1.1] font-medium text-black">
              {heading}
            </h2>

            <p className="mt-8 text-[20px] leading-relaxed text-[#737373]">
              {body}
            </p>

            <div className="mt-10 space-y-8">
              {nodes.map((node) => (
                <div key={node.name} className="flex gap-5">
                  
                  {/* Blue square placeholder */}
                  <div className="h-11 w-11 shrink-0 rounded-lg bg-[#0451CC]" />

                  <div>
                    <h3 className="text-[24px] font-medium text-black">
                      {node.name}
                    </h3>

                    <p className="mt-2 text-[18px] leading-relaxed text-[#737373]">
                      {node.body}
                    </p>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}