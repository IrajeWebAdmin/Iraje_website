import Link from "next/link";
import { FiGlobe, FiMail } from "react-icons/fi";
import epm from "@/data/epm";

export default function EpmContactCta() {
  const { eyebrow, heading, body, email, website, cta } = epm.contact;

  return (
    <section className="bg-[linear-gradient(108.08deg,#0B2A5B_0%,#1D5BFF_100%)] py-15 text-white shadow-[0px_20.55px_51.38px_-30.83px_#0C1E3A47,0px_1.28px_2.57px_0px_#0C1E3A0D]">
      <div className="epm-container text-center">
        <p className="epm-eyebrow epm-eyebrow-normal font-semibold text-white">
          {eyebrow}
        </p>
        <h2 className="mx-auto mt-4 max-w-3xl epm-heading font-medium leading-[1.1] tracking-tight text-white">
          {heading}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl epm-body leading-relaxed text-white/80">
          {body}
        </p>

        {/* Contact pills */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/20"
          >
            <FiMail className="h-4 w-4" />
            {email}
          </a>
          <a
            href={`https://${website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/20"
          >
            <FiGlobe className="h-4 w-4" />
            {website}
          </a>
        </div>

        {/* Primary CTA */}
        <div className="mt-8">
          <Link
            href={cta.href}
            className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-ink transition hover:bg-white/90"
          >
            {cta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
