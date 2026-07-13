import Link from "next/link";
import {
  FiArrowRight,
  FiCheck,
  FiDollarSign,
  FiHeart,
  FiTool,
  FiHome,
  FiServer,
  FiWifi,
} from "react-icons/fi";
import AboutSection from "./AboutSection";
import about from "@/data/about";

// Industry badge icons — positional to the about.customers.industries order:
// Banking, Healthcare, Manufacturing, Government, IT/ITeS, Telecom.
const INDUSTRY_ICONS = [FiDollarSign, FiHeart, FiTool, FiHome, FiServer, FiWifi];

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
    <AboutSection paddingClassName="py-15">
      {/* Section header — global epm-* classes, matching the other sections. */}
      <div className="mx-auto max-w-6xl text-center">
        <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
          {eyebrow}
        </span>
        <h2 className="mx-auto mt-4 max-w-6xl epm-heading leading-[1.05] font-medium tracking-[-2px] text-black">
          {heading}
        </h2>
        <p className="mx-auto mt-8 max-w-3xl epm-body leading-relaxed text-[#8E8E93]">
          {body}
        </p>
      </div>

      {/* Industry cards — shadow, no border */}
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {industries.map((ind, i) => {
          const Icon = INDUSTRY_ICONS[i] ?? FiCheck;
          return (
            <div
              key={ind.title}
              className="rounded-2xl border-[0.83px] border-[#FFFFFF21] bg-[#F4F8FF] p-6 text-left shadow-[0px_10.57px_26.42px_-15.85px_#0C1E3A47,0px_0.66px_1.32px_0px_#0C1E3A0D]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand">
                <Icon className="h-5.5 w-5.5 text-white" />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold text-ink">
                {ind.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-soft">
                {ind.body}
              </p>
            </div>
          );
        })}
      </div>

      {/* Why customers trust Iraje + testimonials */}
      <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="text-left">
          <h3 className="font-display text-2xl font-semibold text-ink">
            {trustTitle}
          </h3>
          <ul className="mt-6 space-y-4">
            {trustPoints.map((p) => (
              <li key={p.lead} className="flex gap-3">
                <FiCheck className="mt-1 h-4 w-4 shrink-0 text-brand" />
                <span className="text-lg leading-snug text-ink/80">
                  <span className="font-medium text-ink">{p.lead}</span> —{" "}
                  {p.body}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href={link.href}
            className="mt-7 inline-flex items-center gap-2 rounded-4xl border border-mist px-6 py-3 text-sm font-semibold text-ink transition hover:bg-[#F6F8FD]"
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
              <blockquote className="align-middle font-display text-lg font-medium italic leading-[27.74px] tracking-normal text-ink/85">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-3 text-md font-semibold tracking-wide text-[color/azure/44]">
                — {t.author}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </AboutSection>
  );
}
