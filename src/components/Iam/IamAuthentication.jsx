import IamSection from "./IamSection";
import IamPanel from "./IamPanel";
import iam from "@/data/iam";

export default function IamAuthentication() {
  const { eyebrow, heading, body, points, panel } = iam.authentication;

  return (
    // Shares the tinted band with IamGovernance below — in Figma the two sit
    // on one continuous pale-blue rectangle, so neither adds a bottom pad
    // that would break the band in half.
    <IamSection id="authentication" tone="tint" paddingClassName="pt-20 pb-14 md:pt-28 md:pb-16">
      <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Copy + checklist */}
        <div>
          <p className="text-xl font-medium text-brand md:text-2xl">{eyebrow}</p>

          <h2 className="mt-4 max-w-[728px] text-3xl leading-[1.223] font-medium text-black md:text-4xl lg:text-[40px]">
            {heading}
          </h2>

          <p className="mt-6 text-base leading-relaxed text-[#707070] md:text-xl">
            {body}
          </p>

          <ul className="mt-8 space-y-4">
            {points.map((point) => (
              <li
                key={point}
                className="list-disc text-base leading-relaxed text-black md:text-xl ms-7"
              >
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Decision ladder */}
        <IamPanel eyebrow={panel.eyebrow}>
          <ol>
            {panel.steps.map((step, i) => (
              <li
                key={step.title}
                className="flex gap-[22px] border-b border-botticelli py-4 last:border-b-0"
              >
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded bg-brand text-[15px] font-semibold text-white">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div>
                  <p className="text-[15px] font-semibold text-brand">
                    {step.title}
                  </p>
                  <p className="mt-1 text-[13.5px] leading-[21.6px] text-shuttle">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </IamPanel>
      </div>
    </IamSection>
  );
}
