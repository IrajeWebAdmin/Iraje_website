import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import about from "@/data/about";

export default function AboutHero() {
  const { eyebrow, titleLead, titleAccent, body, ctas } = about.hero;

  return (
    <section className="bg-white">
      <div className="container-global pt-24 pb-12 md:pt-28 md:pb-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.55fr]">
          {/* Copy */}
          <div>
            <p className="epm-eyebrow epm-eyebrow-normal flex items-center gap-3 font-semibold text-brand">
              <span className="h-px w-8 bg-brand" />
              {eyebrow}
            </p>
            <h1 className="mt-5 font-display text-4xl leading-[1.23] font-semibold tracking-normal text-ink md:text-[55px]">
              {titleLead}{" "}
              <span className="font-normal text-brand italic">{titleAccent}</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-soft md:text-lg">
              {body}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              {ctas.map((cta) => (
                <Link
                  key={cta.label}
                  href={cta.href}
                  className={
                    cta.primary
                      ? "inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-brand/90"
                      : "inline-flex items-center gap-2 rounded-full border border-mist px-7 py-3.5 text-sm font-semibold text-ink transition hover:bg-[#F6F8FD]"
                  }
                >
                  {cta.label}
                  {cta.primary && <FiArrowRight className="h-4 w-4" />}
                </Link>
              ))}
            </div>
          </div>

          {/* Laptop image */}
          <div className="flex justify-center lg:justify-end">
            <Image
              src="/images/about/About-home.png"
              alt="Iraje team collaborating on enterprise security"
              width={904}
              height={776}
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="h-auto w-full max-w-280"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
