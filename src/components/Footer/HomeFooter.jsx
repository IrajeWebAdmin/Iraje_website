 import Image from "next/image";
import Link from "next/link";
import footerLinks from "@/data/footerLinks";

export default function HomeFooter() {
  return (
    <footer className="bg-[#3A3D51] text-white">
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

            <p className="mt-3 max-w-xs text-base leading-relaxed text-white">
             One platform to secure<br />every identity.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-[3px] text-white">
              Platform
            </h3>

            <ul className="space-y-3">
              {footerLinks.platform.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-white transition hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn */}
          <div>
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-[3px] text-white">
              Learn
            </h3>

            <ul className="space-y-3">
              {footerLinks.learn.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-white transition hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-[3px] text-white">
              Company
            </h3>

            <ul className="space-y-3">
              {footerLinks.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-white transition hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-white" />

        {/* Bottom Footer */}
        <div className="flex flex-col gap-4 text-xs text-white/40 md:flex-row md:justify-between">
          <p>© Iraje Software. All rights reserved.</p>

         
        </div>

      </div>
    </footer>
  );
}