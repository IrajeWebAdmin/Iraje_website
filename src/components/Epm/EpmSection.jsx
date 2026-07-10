// Shared section shell for the EPM page: mono eyebrow + display heading + intro.
// `tone` controls the band palette:
//   light -> white            tint -> pale blue            dark -> navy
const TONES = {
  light: "bg-white text-ink",
  tint: "bg-[#f4f7ff] text-ink",
  dark: "bg-navy text-white",
};

export default function EpmSection({
  id,
  eyebrow,
  heading,
  intro,
  tone = "light",
  center = false,
  eyebrowClassName = "",
  paddingClassName = "py-20 md:py-28",
  children,
  className = "",
}) {
  const dark = tone === "dark";
  return (
    <section
      id={id}
      className={`${TONES[tone]} ${paddingClassName} ${className}`}
    >
      <div className="epm-container">
        {(eyebrow || heading || intro) && (
          <div className={`max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
            {eyebrow && (
              <p className={`epm-eyebrow ${eyebrowClassName} ${dark ? "text-azure-bright" : "text-brand"}`}>
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
                className={`epm-body mt-5 leading-relaxed ${
                  dark ? "text-white/65" : "text-slate-soft"
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
