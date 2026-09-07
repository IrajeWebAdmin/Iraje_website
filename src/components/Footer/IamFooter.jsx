import Image from "next/image";
import Link from "next/link";

import footerLinks from "@/data/footerLinks";

// Dark navy footer for the IAM product page — the same lockup PamFooter uses,
// so the three product pages close identically.
export default function IamFooter() {
  return (
    <footer className="bg-[#0D1C41] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* Logo Section */}
          <div>
            <Image
              src="/icons/company-logo-footer.svg"
              alt="Iraje Identity Security Logo"
              width={140}
              height={40}
            />

            <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/70">
              One platform to secure
              <br />
              every identity.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="mb-5 text-xs font-semibold tracking-[3px] text-white/50 uppercase">
              Platform
            </h3>

            <ul className="space-y-3">
              {footerLinks.platform.map((item) => (
                <li key={item.name}>
                  {item.disabled ? (
                    <span
                      aria-disabled="true"
                      className="cursor-not-allowed text-sm text-white/40 select-none"
                    >
                      {item.name}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-sm text-white/80 transition hover:text-white"
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Learn */}
          <div>
            <h3 className="mb-5 text-xs font-semibold tracking-[3px] text-white/50 uppercase">
              Learn
            </h3>

            <ul className="space-y-3">
              {footerLinks.learn.map((item) => (
                <li key={item.name}>
                  {item.disabled ? (
                    <span
                      aria-disabled="true"
                      className="cursor-not-allowed text-sm text-white/40 select-none"
                    >
                      {item.name}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-sm text-white/80 transition hover:text-white"
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-5 text-xs font-semibold tracking-[3px] text-white/50 uppercase">
              Company
            </h3>

            <ul className="space-y-3">
              {footerLinks.company.map((item) => (
                <li key={item.name}>
                  {item.disabled ? (
                    <span
                      aria-disabled="true"
                      className="cursor-not-allowed text-sm text-white/40 select-none"
                    >
                      {item.name}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-sm text-white/80 transition hover:text-white"
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-white/10" />

        {/* Bottom Footer */}
        <div className="flex flex-col gap-4 text-xs text-white/40 md:flex-row md:justify-between">
          <p>© Iraje Software. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
