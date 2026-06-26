import EpmSection from "./EpmSection";
import epm from "@/data/epm";


export default function EpmEightWays() {
  const { eyebrow, heading, body, items } = epm.eightWays;

  return (
    <EpmSection id="how-epm-works" tone="dark" eyebrow={eyebrow} heading={heading} intro={body} className="bg-[#0451cc]">

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 bg-[#0451CC]" >
        {items.map((item, i) => {
          // const Icon = icons[i % icons.length];
          return (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-azure-bright/40 hover:bg-white/[0.06]"
            >
              {/* <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-azure-bright/15 text-azure-bright">
                <Icon className="h-5 w-5" />
              </span> */}
              <p className="mt-4 font-display text-5xl font-semibold text-white">
                {item.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                {item.body}
              </p>
            </div>
          );
        })}
      </div>
    </EpmSection>
  );
}
