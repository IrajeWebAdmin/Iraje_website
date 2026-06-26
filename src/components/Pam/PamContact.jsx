import Link from "next/link";
import { FiArrowRight, FiMail, FiGlobe } from "react-icons/fi";
import pam from "@/data/pam";

export default function PamContact() {
  const { heading, body, cta, email, website } = pam.contact;

  return (
    <section className="relative overflow-hidden bg-navy py-20 text-white md:py-28">
      {/* Brand gradient wash — from Figma closing band */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,#022966_0%,#1d5bff_100%)] opacity-90" />

      <div className="container-global relative text-center">
        <h2 className="mx-auto max-w-3xl font-display text-3xl leading-[1.12] font-semibold md:text-5xl">
          {heading}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
          {body}
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={cta.href}
            className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-navy transition hover:bg-mist"
          >
            {cta.label}
            <FiArrowRight className="transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/80">
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-2 transition hover:text-white"
          >
            <FiMail className="h-4 w-4" />
            {email}
          </a>
          <a
            href={`https://${website}`}
            className="inline-flex items-center gap-2 transition hover:text-white"
          >
            <FiGlobe className="h-4 w-4" />
            {website}
          </a>
        </div>
      </div>
    </section>
  );
}
