import Image from "next/image";
import PamSection from "./PamSection";
import { FiServer, FiLock, FiTool } from "react-icons/fi";
import pam from "@/data/pam";

const ICONS = [FiServer, FiLock, FiTool];

export default function PamArchitecture() {
  const { eyebrow, heading, body, servers } = pam.architecture;

  return (
    <PamSection tone="tint" eyebrow={eyebrow} heading={heading} intro={body}>
      <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Server tiers */}
        <div className="flex flex-col gap-5">
          {servers.map((server, i) => {
            const Icon = ICONS[i] ?? FiServer;
            return (
              <div
                key={server.name}
                className="flex gap-5 rounded-3xl bg-white p-7"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-brand">
                      {server.num}
                    </span>
                    <h3 className="font-display text-lg font-semibold text-ink">
                      {server.name}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-soft">
                    {server.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Architecture diagram */}
        <div className="flex items-center justify-center">
          <Image
            src="/images/pam/pam-solution-architecture.png"
            alt="Iraje PAM solution architecture"
            width={637}
            height={538}
            className="h-auto w-full"
          />
        </div>
      </div>
    </PamSection>
  );
}
