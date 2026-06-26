import PamSection from "./PamSection";
import { FiServer, FiLock, FiTool } from "react-icons/fi";
import pam from "@/data/pam";

const ICONS = [FiServer, FiLock, FiTool];

export default function PamArchitecture() {
  const { eyebrow, heading, body, servers, note } = pam.architecture;

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

        {/* Zero Trust panel */}
        <div className="flex flex-col justify-center rounded-3xl bg-[linear-gradient(135deg,#022966_0%,#0451CC_100%)] p-9 text-white md:p-12">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold tracking-[0.12em] uppercase">
            Real Zero Trust
          </span>
          <p className="mt-6 text-xl leading-relaxed font-medium md:text-2xl">
            {note}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-2xl border border-white/15 bg-white/[0.06] px-5 py-4">
              <p className="font-semibold">Active-Active</p>
              <p className="mt-1 text-white/60">across DC &amp; DR</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/[0.06] px-5 py-4">
              <p className="font-semibold">AES-256 Vault</p>
              <p className="mt-1 text-white/60">credentials encrypted</p>
            </div>
          </div>
        </div>
      </div>
    </PamSection>
  );
}
