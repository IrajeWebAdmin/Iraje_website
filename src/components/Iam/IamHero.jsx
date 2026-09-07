import Link from "next/link";
import iam from "@/data/iam";

export default function IamHero() {
  const { eyebrow, titleLead, titleAccent, subtitle, ctas } = iam.hero;

  return (
    // Same navy radial as the PAM hero — the two product pages share one
    // hero ground in the design system.
    <section className="relative overflow-hidden bg-[radial-gradient(120%_130%_at_85%_0%,#19347F_0%,#0D214A_38%,#0A1733_100%)] text-white">
      {/* Blue glow bleeding off the top-right corner (div.hero-glow in Figma). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-56 -right-40 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(47,107,255,0.45)_0%,rgba(47,107,255,0)_65%)] blur-[10px]"
      />

      <div className="container-global relative pt-32 pb-32 md:pt-40 md:pb-44">
        <div className="grid items-center gap-12">
          {/* Copy. Single column at every width: the diagram card is gone, so the
              headline and body are held by their own max-widths (660/540) rather
              than by a grid track. That keeps the wrap identical from phone
              through 13" laptop, where a second track would have squeezed the
              copy narrower than it is on tablet. */}
          <div>
            <p className="text-base font-normal text-gold">{eyebrow}</p>

            <h1 className="mt-6 max-w-[660px] text-4xl leading-[1.08] font-semibold md:text-5xl lg:text-[48px]">
              {titleLead}
              <span className="text-gold">{titleAccent}</span>
            </h1>

            <p className="mt-8 max-w-[540px] text-base leading-relaxed text-white/56">
              {subtitle}
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
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
        </div>
      </div>
    </section>
  );
}
