import Image from "next/image";
import epm from "@/data/epm";

export default function EpmArchitecture() {
  const { eyebrow, heading, body, nodes } = epm.architecture;

  return (
    <section className="bg-[#F4F8FF] py-15">
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
            <p className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
              {eyebrow}
            </p>

            <h2 className="mx-auto mt-4 max-w-6xl epm-heading leading-[1.05] font-medium tracking-[-2px] text-black">
              {heading}
            </h2>

            <p className="mt-8 epm-body leading-relaxed text-[#8E8E93] ">
              {body}
            </p>

            <div className="mt-10 space-y-8">
              {nodes.map((node) => (
                <div key={node.name} className="flex gap-5">
                  
                  {/* Blue square placeholder */}
                  <div className="h-11 w-11 shrink-0 rounded-lg bg-[#0451CC]" />

                  <div>
                    <h3 className="text-xl font-medium text-black">
                      {node.name}
                    </h3>

                    <p className="mt-2 text-base leading-relaxed text-[#737373]">
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