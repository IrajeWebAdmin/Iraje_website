import Link from "next/link";
import iam from "@/data/iam";

// Closing CTA band. Same navy radial and pill buttons as the hero, so the page
// opens and closes on the same ground.
export default function IamCta() {
  const { eyebrow, heading, body, ctas } = iam.cta;

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(120%_150%_at_80%_10%,#1D3AA6_0%,#14296D_30%,#0F2050_45%,#0A1733_60%)] py-20 text-white md:py-24">
      {/* div.hero-grid in Figma: a 62px white grid at 4.3% alpha, dimmed to 60%
          and faded out towards the edges so it never reaches a hard tile line.
          Written as an inline style because the layered gradients do not
          survive Tailwind's arbitrary-value comma parsing. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.043) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.043) 1px, transparent 1px)",
          backgroundSize: "62px 62px",
          maskImage:
            "radial-gradient(120% 120% at 50% 40%, #000 35%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(120% 120% at 50% 40%, #000 35%, transparent 100%)",
        }}
      />

      <div className="container-global relative text-center">
        <p className="text-xl font-medium text-white/46 md:text-2xl">{eyebrow}</p>

        <h2 className="mx-auto mt-5 max-w-[817px] text-3xl leading-[1.223] font-medium md:text-4xl lg:text-[48px]">
          {heading}
        </h2>

        <p className="mx-auto mt-8 max-w-[1200px] text-lg leading-relaxed font-light text-white/70 md:text-[25.688px]">
          {body}
        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-4">
          {ctas.map((cta) =>
            cta.primary ? (
              <Link
                key={cta.label}
                href={cta.href}
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-[15px] font-medium text-black transition hover:bg-mist"
              >
                {cta.label}
              </Link>
            ) : (
              <Link
                key={cta.label}
                href={cta.href}
                className="inline-flex items-center justify-center rounded-full border border-white px-8 py-3 text-[15px] font-medium text-white transition hover:bg-white/10"
              >
                {cta.label}
              </Link>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
