import Image from "next/image";
import Link from "next/link";
import IamSection from "./IamSection";
import iam from "@/data/iam";

// "One platform" — the three Iraje products on a single policy engine.
// Each card carries its own ground from the design (IAM washed blue because it
// is the page you are on) under a shared 4.6px brand rule along the top edge.
export default function IamPlatform() {
  const { eyebrow, heading, body, cards } = iam.platform;

  return (
    <IamSection
      id="platform"
      eyebrow={eyebrow}
      heading={heading}
      intro={body}
      center
      headClassName="max-w-[1275px]"
      headingClassName="epm-heading mx-auto max-w-[877px]"
      eyebrowClassName="epm-eyebrow epm-eyebrow-normal"
      introClassName="epm-body"
      paddingClassName="py-15"
    >
      <div className="mt-14 grid gap-[30px] md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.name}
            className={`card-hover flex min-h-[386px] flex-col rounded-[43px] border-t-[4.6px] border-brand px-[34px] pt-10 pb-8 ${card.ground}`}
          >
            <span className="flex h-[59px] w-[56px] shrink-0 items-center justify-center rounded-md bg-[#E3E6F3]">
              <Image src={card.icon} alt="" width={32} height={32} />
            </span>

            <p className="mt-4 text-base text-[#729CF6]">{card.label}</p>

            <h3 className="mt-2 text-[23px] leading-tight font-medium text-black">
              {card.name}
            </h3>

            <p className="mt-3 text-base leading-relaxed text-[#707070]">
              {card.body}
            </p>

            {/* Pushed to the foot of the card so the three links sit on one
                line even when the bodies differ in length. */}
            <Link
              href={card.href}
              className="mt-auto inline-flex items-center gap-3 pt-8 text-[18.4px] font-medium text-brand hover:underline"
            >
              {card.cta}
              <Image
                src="/icons/iam/iam-arrow-long.svg"
                alt=""
                width={18}
                height={18}
                className="shrink-0"
              />
            </Link>
          </div>
        ))}
      </div>
    </IamSection>
  );
}
