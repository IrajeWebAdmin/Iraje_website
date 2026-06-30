import EpmSection from "./EpmSection";
import epm from "@/data/epm";


export default function EpmEightWays() {
  const { eyebrow, heading, body, items } = epm.eightWays;

  return (
    <EpmSection id="how-epm-works" tone="dark" center eyebrow={eyebrow} heading={heading} intro={body} className="bg-[#0451cc]!">

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex flex-col rounded-2xl bg-[#3774d8] p-6"
          >
            {/* Empty icon container — top-left placeholder, matches the Figma card (art to be dropped in later) */}
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-white" />

            <p className="mt-5 text-center font-display text-lg font-semibold text-white">
              {item.title}
            </p>
            <p className="mt-2 text-center text-sm leading-relaxed text-white/70">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </EpmSection>
  );
}
