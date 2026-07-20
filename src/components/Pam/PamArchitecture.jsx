import Image from "next/image";
import PamSection from "./PamSection";
import pam from "@/data/pam";

export default function PamArchitecture() {
  const { eyebrow, heading, body, servers, note } = pam.architecture;

  // Bold the leading label of the note (e.g. "Real Zero Trust:") without
  // altering the copy — split on the first colon.
  const colon = note.indexOf(":");
  const noteLabel = colon >= 0 ? note.slice(0, colon + 1) : "";
  const noteBody = colon >= 0 ? note.slice(colon + 1) : note;

  return (
    <PamSection paddingClassName="py-15">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        {/* Left: header + server tiers + note */}
        <div>
          <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
            {eyebrow}
          </span>
          <h2 className="mt-4 epm-heading leading-[1.05] font-medium tracking-[-2px] text-black">
            {heading}
          </h2>
          <p className="mt-6 epm-body leading-relaxed text-[#8E8E93]">
            {body}
          </p>

          {/* Server tiers — number badge + title + description */}
          <div className="mt-10 space-y-6">
            {servers.map((server) => (
              <div key={server.name} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand text-[15px] font-semibold text-white">
                  {server.num}
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold text-ink">
                    {server.name}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#8E8E93]">
                    {server.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Real Zero Trust note — 1px border compositing the Figma stroke's two
              flat layers (grey 6% over brand-blue 13%) into one solid colour, so
              it still follows the rounded corners (border-image would not). */}
          <div className="mt-8 rounded-2xl border border-[rgba(40,91,174,0.18)] bg-[#EAF1FF] px-6 py-5">
            <p className="text-sm leading-relaxed text-[#8E8E93]">
              <span className="font-medium text-ink">{noteLabel}</span>
              {noteBody}
            </p>
          </div>
        </div>

        {/* Right: architecture diagram */}
        <div className="flex items-center justify-center">
          <Image
            src="/images/pam/pam-solution-architecture.png"
            alt="Iraje PAM solution architecture"
            width={1785}
            height={881}
            className="h-auto w-full"
          />
        </div>
      </div>
    </PamSection>
  );
}
