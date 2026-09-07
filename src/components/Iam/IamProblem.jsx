import IamSection from "./IamSection";
import iam from "@/data/iam";

export default function IamProblem() {
  const { eyebrow, heading, body, cards } = iam.problem;

  return (
    <IamSection
      eyebrow={eyebrow}
      heading={heading}
      intro={body}
      center
      headClassName="max-w-[1166px]"
      headingClassName="mx-auto max-w-[1076px]"
      paddingClassName="py-15 "
    >
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="card-hover rounded-[24px] border border-[#707070]/24 px-7 py-8"
          >
            <h3 className="text-2xl font-medium text-black">{card.title}</h3>
            <p className="mt-4 text-[17px] leading-relaxed text-[#707070]">
              {card.body}
            </p>
          </div>
        ))}
      </div>
    </IamSection>
  );
}
