import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import certification from "@/data/certification";

// Hero for the Certification page. Two-column layout (copy + illustration),
// mirroring AboutHero so the site keeps a consistent hero rhythm. The navbar
// sits absolutely over the top of this band, so we pad the top generously.
export default function CertHero() {
  const { eyebrow, titleLead, titleAccent, titleTrail, body, ctas } =
    certification.hero;

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-[#f4f8ff] to-white">
      <div className="container-global pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Copy */}
          <div>
            <p className="epm-eyebrow epm-eyebrow-normal font-semibold text-brand">
              {eyebrow}
            </p>
            <span className="mt-3 block h-px w-12 bg-brand" />
            <h1 className="mt-5 font-display text-4xl leading-[1.15] font-semibold tracking-tight text-ink md:text-[55px]">
              {titleLead}{" "}
              <span className="font-normal text-brand italic">{titleAccent}</span>
              <br />
              {titleTrail}
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

          {/* Photo */}
          <div className="flex justify-center lg:justify-end">
            <Image
              src="/images/home/home-certification.webp"
              alt="Security professionals reviewing certification training on screen"
              width={432}
              height={287}
              className="h-auto w-full max-w-160 rounded-[28px] object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
