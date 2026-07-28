import Image from "next/image";
import epm from "@/data/epm";

export default function EpmArchitecture() {
  const { eyebrow, heading, body, nodes } = epm.architecture;

  return (
    <section className="bg-[#F4F8FF] py-15">
      <div className="epm-container">
        {/* Centred section header — spans the full width above the
            diagram/nodes grid, matching the other EPM sections. */}
        <div className="text-center">
          <p className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
            {eyebrow}
          </p>

          <h2 className="mx-auto mt-4 max-w-6xl epm-heading leading-[1.05] font-medium tracking-[-2px] text-black">
            {heading}
          </h2>

          <p className="mx-auto mt-6 max-w-5xl epm-body leading-relaxed text-[#8E8E93]">
            {body}
          </p>
        </div>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left: architecture diagram */}
          <div className="overflow-hidden rounded-[32px] bg-white shadow-sm">
            <Image
              src="/images/epm/Solution-architecture.jpg"
              alt="EPM Architecture"
              width={900}
              height={700}
              className="h-auto w-full"
            />
          </div>

          {/* Right: numbered node list — vertically centred against the card */}
          <div className="space-y-8">
            {nodes.map((node, i) => (
              <div key={node.name} className="flex gap-5">
                {/* Step badge — 01, 02, 03 */}
                <div className="flex h-13 w-13  shrink-0 items-center justify-center rounded-lg bg-[#0451CC] text-lg font-medium text-white">
                  {String(i + 1).padStart(2, "0")}
                </div>

                <div>
                  <h3 className="text-xl font-medium text-black">{node.name}</h3>

                  <p className="mt-2 text-base leading-relaxed text-[#737373]">
                    {node.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
