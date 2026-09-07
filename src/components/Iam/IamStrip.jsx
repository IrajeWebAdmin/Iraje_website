import Image from "next/image";
import iam from "@/data/iam";

// The white fact bar that straddles the bottom edge of the hero: where IAM
// deploys, what it converges with, and what it produces evidence for.
// Pulled up into the hero with a negative margin, the same trick
// CapabilityStrip uses on the PAM/EPM pages.
export default function IamStrip() {
  return (
    <div className="container-global relative z-30 -mt-24 mb-4 md:-mt-28">
      <div className="grid divide-y divide-black/8 overflow-hidden rounded-[21px] border-b border-black/8 bg-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.07)] md:grid-cols-3 md:divide-x md:divide-y-0">
        {iam.strip.map((item) => (
          <div
            key={item.name}
            className="group flex min-h-[194px] flex-col items-center justify-center px-8 py-10 text-center"
          >
            <Image
              src={item.icon}
              alt=""
              width={33}
              height={33}
              className="mb-3 transition-transform duration-300 ease-out group-hover:scale-125"
            />

            <h3 className="text-[22px] leading-tight font-bold text-brand transition-transform duration-300 ease-out group-hover:scale-110">
              {item.name}
            </h3>

            <p className="mt-2 text-[17px] tracking-[0.68px] text-nepal">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
