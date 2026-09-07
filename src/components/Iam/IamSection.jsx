// Shared section shell for the IAM page.
//
// The Figma screen uses one header rhythm throughout — a 24px brand-blue
// eyebrow in Title case, a 40px medium heading, then 20px grey intro copy —
// so the sizes here are written as an explicit responsive ramp that lands on
// the design's desktop values at `lg` rather than reusing `.epm-heading`
// (which clamps up to 48px and would overshoot).
//
// `tone` mirrors the two bands the design alternates between:
//   light -> white          tint -> the pale blue wash (#BDD1FE at 16%)
const TONES = {
  light: "bg-white",
  tint: "bg-[#BDD1FE]/16",
};

export default function IamSection({
  id,
  eyebrow,
  heading,
  intro,
  tone = "light",
  center = false,
  headClassName = "",
  eyebrowClassName = "",
  headingClassName = "",
  introClassName = "",
  paddingClassName = "py-20 md:py-28",
  children,
  className = "",
}) {
  return (
    <section
      id={id}
      className={`${TONES[tone]} ${paddingClassName} ${className} text-ink`}
    >
      <div className="container-global">
        {(eyebrow || heading || intro) && (
          <div className={`${center ? "mx-auto text-center" : ""} ${headClassName}`}>
            {eyebrow && (
              <p
                className={`text-xl font-medium text-brand md:text-2xl ${eyebrowClassName}`}
              >
                {eyebrow}
              </p>
            )}
            {heading && (
              <h2
                className={`mt-4 text-3xl leading-[1.223] font-medium text-black md:text-4xl lg:text-[40px] ${headingClassName}`}
              >
                {heading}
              </h2>
            )}
            {intro && (
              <p
                className={`mt-6 text-base leading-relaxed text-[#707070] md:text-xl ${
                  center ? "mx-auto" : ""
                } ${introClassName}`}
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
