import IamSection from "./IamSection";
import IamPanel from "./IamPanel";
import iam from "@/data/iam";

export default function IamGovernance() {
  const { eyebrow, heading, body, points, panel } = iam.governance;

  return (
    // Continues the tinted band opened by IamAuthentication.
    <IamSection id="governance" tone="tint" paddingClassName="pt-14 pb-20 md:pt-16 md:pb-28">
      <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Auditor report list — sits left on desktop, but after the copy on
            phones so the section still reads heading-first. */}
        <IamPanel
          eyebrow={panel.eyebrow}
          eyebrowClassName="text-[12.77px] tracking-[2.04px] text-brand"
          className="order-2 bg-catskill lg:order-1"
        >
          <div className="overflow-hidden rounded-md bg-white">
            {panel.rows.map((row, i) => (
              <p
                key={row}
                className={`border-botticelli px-6 py-[18px] text-base font-semibold text-brand ${
                  i > 0 ? "border-t" : ""
                } ${i % 2 === 1 ? "bg-catskill" : ""}`}
              >
                {row}
              </p>
            ))}
          </div>
        </IamPanel>

        {/* Copy + checklist */}
        <div className="order-1 lg:order-2">
          <p className="text-xl font-medium text-brand md:text-2xl">{eyebrow}</p>

          <h2 className="mt-4 max-w-[605px] text-3xl leading-[1.223] font-medium text-black md:text-4xl lg:text-[38px]">
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
      </div>
    </IamSection>
  );
}
