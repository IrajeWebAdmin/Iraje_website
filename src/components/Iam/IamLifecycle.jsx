import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import IamSection from "./IamSection";
import iam from "@/data/iam";

export default function IamLifecycle() {
  const { eyebrow, heading, body, stages, callout } = iam.lifecycle;

  return (
    <IamSection
      id="identity-lifecycle"
      tone="tint"
      eyebrow={eyebrow}
      heading={heading}
      intro={body}
      center
      headClassName="max-w-[1166px]"
      headingClassName="mx-auto max-w-[1076px]"
    >
      {/* pt-8 leaves room for the badge that overhangs each card's top edge. */}
      <div className="mt-16 grid gap-8 pt-6 md:grid-cols-3">
        {stages.map((stage) => (
          <div
            key={stage.tag}
            className="card-hover relative rounded-[26px] border border-black/9 bg-white px-8 pt-12 pb-9 shadow-[0px_4px_8px_-1px_rgba(0,0,0,0.08)]"
          >
            {/* Stage badge, straddling the top edge of the card. */}
            <span className="absolute -top-7 left-8 inline-flex h-14 w-[62px] items-center justify-center rounded-[52px] bg-brand text-[15px] font-light text-white">
              {stage.tag}
            </span>

            <p className="text-xl font-light text-brand">{stage.when}</p>

            <h3 className="mt-3 text-[25px] leading-[1.223] font-medium text-black">
              {stage.title}
            </h3>

            <p className="mt-4 text-[15px] leading-relaxed font-light text-[#020111]/66">
              {stage.body}
            </p>

            <ul className="mt-6 space-y-2.5">
              {stage.points.map((point) => (
                <li
                  key={point}
                  className="list-disc text-[15px] leading-relaxed font-light text-[#020111]/66 ms-5"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Closing callout bar. */}
      <div className="mt-14 flex flex-col gap-5 rounded-md border border-[#235AB2]/18 bg-brand px-8 py-7 text-white lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <p className="max-w-[842px] text-sm leading-relaxed">
          <span className="font-semibold">{callout.lead}</span>
          {callout.body}
        </p>

        <Link
          href={callout.cta.href}
          className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-white"
        >
          {callout.cta.label}
          <FiArrowRight
            aria-hidden="true"
            className="h-[17px] w-[17px] transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </div>
    </IamSection>
  );
}
