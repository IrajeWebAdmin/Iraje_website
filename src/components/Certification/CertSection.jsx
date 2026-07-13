// Shared section shell for the Certification page: eyebrow + display heading
// + intro, wrapped in the site-wide `.container-global`. Mirrors AboutSection
// so the Certification page matches the site's section rhythm.
// `tone` controls the band palette:
//   light -> white     tint -> pale blue     grey -> light grey
const TONES = {
  light: "bg-white text-ink",
  tint: "bg-[#f4f8ff] text-ink",
  grey: "bg-[#EBEDF3] text-ink",
};

export default function CertSection({
  id,
  eyebrow,
  heading,
  intro,
  tone = "light",
  bg,
  center = false,
  headClassName = "max-w-3xl",
  paddingClassName = "py-20 md:py-28",
  children,
  className = "",
}) {
  return (
    <section
      id={id}
      className={`${bg ? `${bg} text-ink` : TONES[tone]} ${paddingClassName} ${className}`}
    >
      <div className="container-global">
        {(eyebrow || heading || intro) && (
          <div className={`${headClassName} ${center ? "mx-auto text-center" : ""}`}>
            {eyebrow && (
              <p className="epm-eyebrow epm-eyebrow-normal font-semibold text-brand">
                {eyebrow}
              </p>
            )}
            {heading && (
              <h2 className="epm-heading mt-4 font-display leading-[1.12] font-semibold">
                {heading}
              </h2>
            )}
            {intro && (
              <p
                className={`epm-body mt-5 max-w-3xl leading-relaxed text-slate-soft ${
                  center ? "mx-auto" : ""
                }`}
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
