import Link from "next/link";
import about from "@/data/about";

export default function AboutCta() {
  const { eyebrow, heading, body, ctas } = about.cta;

  return (
    <section className="bg-brand py-20 text-center text-white md:py-28">
      <div className="container-global">
        <p className="epm-eyebrow epm-eyebrow-normal text-white/80">{eyebrow}</p>
        <h2 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-semibold leading-[1.12] md:text-5xl lg:max-w-none lg:whitespace-nowrap">
          {heading}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/80 md:text-xl">
          {body}
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          {ctas.map((cta) => (
            <Link
              key={cta.label}
              href={cta.href}
              className={
                cta.primary
                  ? "rounded-4xl bg-white px-7 py-3.5 text-sm font-medium text-black transition hover:bg-white/90"
                  : "rounded-4xl border border-white/40 px-7 py-3.5 text-sm font-medium text-white transition hover:bg-white/10"
              }
            >
              {cta.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
