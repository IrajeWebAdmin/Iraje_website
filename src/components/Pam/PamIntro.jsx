import Image from "next/image";
import pam from "@/data/pam";

export default function PamIntro() {
  const { eyebrow, heading, tagline, diagram, points } = pam.intro;

  return (
    <section className="bg-white py-15 text-ink">
      <div className="container-global">
        {/* Centred header */}
        <div className="mx-auto max-w-5xl text-center">
          <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
            {eyebrow}
          </span>
          <h2 className="mt-4 epm-heading leading-[1.05] font-medium tracking-[-2px] text-black">
            {heading}
          </h2>
          <p className="mx-auto mt-6 max-w-4xl epm-body leading-relaxed text-[#8E8E93] lg:text-nowrap">
            {tagline}
          </p>
        </div>

        {/* Diagram left, one explanation per band on the right */}
        <div className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16">
          <Image
            src={diagram.src}
            alt={diagram.alt}
            width={658}
            height={370}
            className="h-auto w-full"
          />

          {/* Three equal rows so each paragraph sits level with its band (A/B/C)
              in the diagram, which is evenly divided the same way. */}
          <div className="grid gap-8 lg:h-full lg:grid-rows-3 lg:gap-0">
            {points.map((point) => (
              <p
                key={point.letter}
                className="flex items-center text-lg leading-relaxed text-[#707070]"
              >
                {point.body}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
