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
  children,
  className = "",
}) {
  const dark = tone === "dark";
  return (
    <section
      id={id}
      className={`${TONES[tone]} py-20 md:py-28 ${className}`}
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
              <h2 className="mt-4 font-display text-3xl leading-[1.12] font-semibold md:text-[2.6rem]">
                {heading}
              </h2>
            )}
            {intro && (
              <p
                className={`mt-5 text-base leading-relaxed md:text-lg ${
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
