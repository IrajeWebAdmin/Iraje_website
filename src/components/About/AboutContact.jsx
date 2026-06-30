import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import about from "@/data/about";

export default function AboutContact() {
  const { heading, body, cta, email, website } = about.cta;

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container-global">
        <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(120deg,#022966_0%,#0451CC_100%)] px-8 py-14 text-center text-white md:px-16 md:py-20">
          <h2 className="mx-auto max-w-3xl font-display text-3xl font-semibold leading-[1.12] md:text-[2.4rem]">
            {heading}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
            {body}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Link
              href={cta.href}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-navy transition hover:bg-white/90"
            >
              {cta.label}
              <FiArrowRight className="h-4 w-4" />
            </Link>
            <div className="flex flex-col gap-1 text-sm text-white/70 sm:flex-row sm:items-center sm:gap-4">
              <a href={`mailto:${email}`} className="transition hover:text-white">
                {email}
              </a>
              <span className="hidden text-white/30 sm:inline">•</span>
              <a href={`https://${website}`} className="transition hover:text-white">
                {website}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
