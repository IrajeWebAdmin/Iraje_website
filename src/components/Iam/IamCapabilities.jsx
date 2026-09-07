import Image from "next/image";
import IamSection from "./IamSection";
import iam from "@/data/iam";

export default function IamCapabilities() {
  const { eyebrow, heading, body, items } = iam.capabilities;

  return (
    <IamSection
      id="capabilities"
      eyebrow={eyebrow}
      heading={heading}
      intro={body}
      center
      headClassName="max-w-[1029px]"
    >
      <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="card-hover-dark flex min-h-[277px] flex-col rounded-[26px] border border-white/13 bg-cobalt px-10 py-13 shadow-[0px_1px_2px_0px_rgba(12,30,58,0.05),0px_16px_40px_-24px_rgba(12,30,58,0.28)]"
          >
            <span className="flex h-[46px] w-[52px] shrink-0 items-center justify-center rounded-md bg-white">
              <Image src={item.icon} alt="" width={25} height={25} />
            </span>

            <h3 className="mt-6 text-xl leading-[1.223] font-medium text-white">
              {item.title}
            </h3>

            <p className="mt-3 text-[15px] leading-relaxed text-periwinkle">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </IamSection>
  );
}
