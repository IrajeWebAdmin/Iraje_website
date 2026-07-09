// Shared section shell for the PAM page: brand eyebrow + display heading + intro.
// `tone` controls the band palette (matches the Figma section rhythm):
//   light -> white      tint -> pale blue      grey -> light grey      dark -> navy
const TONES = {
  light: "bg-white text-ink",
  tint: "bg-[#f4f8ff] text-ink",
  grey: "bg-[#EBEDF3] text-ink",
  dark: "bg-navy text-white",
};

export default function PamSection({
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
                className={`epm-eyebrow ${eyebrowClassName} ${dark ? "text-azure-bright" : "text-brand"}`}
              >
                {eyebrow}
              </p>
            )}
            {heading && (
              <h2
                className={`epm-heading mt-4 font-display leading-[1.12] font-semibold ${headingClassName}`}
              >
                {heading}
              </h2>
            )}
            {intro && (
              <p
                className={`epm-body mt-5 max-w-3xl leading-relaxed ${
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
