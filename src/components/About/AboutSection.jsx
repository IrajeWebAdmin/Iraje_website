// Shared section shell for the About page: eyebrow + display heading + intro.
// Mirrors PamSection so the About page matches the site's section rhythm.
// `tone` controls the band palette:
//   light -> white      tint -> pale blue      grey -> light grey      dark -> navy
const TONES = {
  light: "bg-white text-ink",
  tint: "bg-[#f4f8ff] text-ink",
  grey: "bg-[#EBEDF3] text-ink",
  dark: "bg-navy text-white",
};

export default function AboutSection({
  id,
  eyebrow,
  heading,
  intro,
  tone = "light",
  center = false,
  eyebrowClassName = "",
  headingClassName = "",
  headClassName = "max-w-3xl",
  children,
  className = "",
}) {
  const dark = tone === "dark";
  return (
    <section id={id} className={`${TONES[tone]} py-20 md:py-28 ${className}`}>
      <div className="container-global">
        {(eyebrow || heading || intro) && (
          <div className={`${headClassName} ${center ? "mx-auto text-center" : ""}`}>
            {eyebrow && (
              <p
                className={`epm-eyebrow epm-eyebrow-normal ${eyebrowClassName} ${
                  dark ? "text-azure-bright" : "text-brand"
                }`}
              >
                {eyebrow}
              </p>
            )}
            {heading && (
              <h2
                className={`mt-4 font-display text-3xl leading-[1.12] font-semibold md:text-[2.6rem] ${headingClassName}`}
              >
                {heading}
              </h2>
            )}
            {intro && (
              <p
                className={`mt-5 max-w-3xl text-base leading-relaxed md:text-lg ${
                  center ? "mx-auto " : ""
                }${dark ? "text-white/65" : "text-slate-soft"}`}
              >
                {intro}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
