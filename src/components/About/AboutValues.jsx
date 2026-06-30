import AboutSection from "./AboutSection";
import about from "@/data/about";

export default function AboutValues() {
  const { eyebrow, heading, body, items } = about.values;

  return (
    <AboutSection center eyebrow={eyebrow} heading={heading} intro={body}>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <div
            key={item.title}
            className="flex flex-col rounded-3xl border border-mist bg-white p-7 text-left"
          >
            <span className="font-display text-sm font-semibold text-brand">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold text-ink">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-soft">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </AboutSection>
  );
}
