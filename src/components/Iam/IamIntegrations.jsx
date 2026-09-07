import IamSection from "./IamSection";
import iam from "@/data/iam";

// "Connects to what you already run" — a 4-across pill grid of the directories,
// protocols and systems IAM federates with. Listed in the design's reading
// order, so the grid reproduces the Figma rows left to right.
export default function IamIntegrations() {
  const { eyebrow, heading, body, chips } = iam.integrations;

  return (
    <IamSection
      id="integrations"
      tone="tint"
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
      <div className="mx-auto mt-14 grid max-w-[1169px] grid-cols-2 gap-x-[47px] gap-y-[37px] md:grid-cols-4">
        {chips.map((chip) => (
          <span
            key={chip}
            className="card-hover flex min-h-[66px] items-center justify-center rounded-[44px] border-[0.893px] border-[#707070]/24 bg-white px-4 text-center text-[18.622px] font-medium text-black"
          >
            {chip}
          </span>
        ))}
      </div>
    </IamSection>
  );
}
