import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import AboutSection from "./AboutSection";
import about from "@/data/about";

export default function AboutCustomers() {
  const {
    eyebrow,
    heading,
    body,
    industries,
    trustTitle,
    trustPoints,
    testimonials,
    link,
  } = about.customers;

  return (
    <AboutSection
      eyebrow={eyebrow}
      heading={heading}
      center
      eyebrowClassName="text-lg"
      headClassName="max-w-none"
      headingClassName="whitespace-nowrap"
    >
      {/* Body — kept to two lines, centered under the heading */}
      <p className="mx-auto mt-5 max-w-5xl text-center text-base leading-relaxed text-balance text-slate-soft md:text-lg">
        {body}
      </p>

      {/* Industry cards — shadow, no border */}
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {industries.map((ind) => (
          <div
            key={ind.title}
            className="rounded-2xl bg-[#F4F8FF] p-6 text-left shadow-[0_12px_34px_-14px_rgba(12,30,58,0.22)]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand">
              <Image src={ind.icon} alt="" width={22} height={22} />
            </span>
            <h3 className="mt-4 font-display text-base font-semibold text-ink">
              {ind.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-soft">
              {ind.body}
            </p>
          </div>
        ))}
      </div>

      {/* Why customers trust Iraje + testimonials */}
      <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="text-left">
          <h3 className="font-display text-3xl font-semibold text-ink">
            {trustTitle}
          </h3>
          <ul className="mt-6 space-y-4">
            {trustPoints.map((p) => (
              <li key={p.lead} className="flex gap-3">
                <FiCheck className="mt-1 h-4 w-4 shrink-0 text-brand" />
                <span className="text-lg leading-snug text-ink/80">
                  <span className="font-semibold text-ink">{p.lead}</span> —{" "}
                  {p.body}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href={link.href}
            className="mt-7 inline-flex items-center gap-2 rounded-xl border border-mist px-6 py-3 text-sm font-semibold text-ink transition hover:bg-[#F6F8FD]"
          >
            {link.label}
            <FiArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-5">
          {testimonials.map((t) => (
            <figure
              key={t.author}
              className="rounded-2xl border border-[#E3E8F4] border-l-[3px] border-l-brand bg-[#F6F8FD] p-6 text-left"
            >
              <blockquote className="font-display text-lg leading-relaxed text-ink/85 italic">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-3 text-md font-semibold tracking-wide text-brand">
                — {t.author}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </AboutSection>
  );
}
