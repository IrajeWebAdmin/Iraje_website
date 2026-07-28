import Link from "next/link";
import { FiGlobe, FiMail } from "react-icons/fi";
import pam from "@/data/pam";

export default function PamContact() {
  const { eyebrow, heading, body, email, website, cta } = pam.contact;

  return (
    <section className="bg-[radial-gradient(120%_150%_at_80%_10%,#1D3AA6_0%,#0A1733_60%)] py-15 text-white">
      <div className="container-global text-center">
        <p className="epm-eyebrow epm-eyebrow-normal font-semibold text-white/70">
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
          {/* Display-only — the site address is shown, not linked. */}
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-medium text-white">
            <FiGlobe className="h-4 w-4" />
            {website}
          </span>
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
