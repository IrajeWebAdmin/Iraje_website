import Link from "next/link";
import Image from "next/image";
import { FiArrowRight } from "react-icons/fi";
import university from "@/data/university";

export default function UniversityHero() {
  const { eyebrow, titleLead, titleAccent, titleTrail, body, ctas, image, imageAlt } =
    university.hero;

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="container-global relative pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          {/* Copy */}
          <div className="max-w-2xl">
            <p className="flex items-center gap-3 text-sm font-medium text-brand">
              <span className="h-px w-8 bg-gradient-to-r from-azure to-azure/0" />
              {eyebrow}
            </p>

            <h1 className="mt-5 font-display text-4xl font-medium leading-[1.12] text-ink md:text-[3.4rem]">
              {titleLead} <span className="text-brand italic">{titleAccent}</span>{" "}
              {titleTrail}
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-[#5b6c84] md:text-lg">
              {body[0]}
              <span className="font-semibold text-brand">{body[1]}</span>
              {body[2]}
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              {ctas.map((cta) => (
                <Link
                  key={cta.label}
                  href={cta.href}
                  className={
                    cta.primary
                      ? "inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-brand/90"
                      : "inline-flex items-center gap-2 rounded-full border border-ink/16 bg-white px-7 py-3.5 text-sm font-semibold text-ink transition hover:bg-[#F6F8FD]"
                  }
                >
                  {cta.label}
                  {cta.primary && <FiArrowRight className="h-4 w-4" />}
                </Link>
              ))}
            </div>
          </div>

          {/* Media */}
          <div className="relative">
            <div className="relative aspect-[594/403] w-full overflow-hidden rounded-[1.75rem] bg-[#EEF4FF] shadow-[0_20px_60px_-20px_rgba(12,30,58,0.35)]">
              <Image
                src={image}
                alt={imageAlt}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
