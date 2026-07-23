import Image from "next/image";
import Link from "next/link";

import about from "@/data/about";

export default function AboutFooter() {
  const { description, columns, copyright, note } = about.footer;

  return (
    <footer className="bg-[#F4F7FD] text-ink">
      <div className="container-global py-16">
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Image
              src="/icons/company-logo-footerb.svg"
              alt="Iraje Identity Security Logo"
              width={140}
              height={40}
            />

            <p className="mt-3 max-w-xs text-base leading-relaxed text-black">
                       One platform to secure<br />every identity.
                      </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3.5">
                {col.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-[15px] text-[#3A4A63] transition hover:text-brand"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 border-t border-ink/10 pt-6">
          <div className="flex flex-col gap-3 text-[13px] text-[#8A97AD] md:flex-row md:items-center md:justify-between">
            <p>{copyright}</p>
            {/* Explicit monospace stack: the theme collapses font-mono to Poppins,
                but this line reads as monospace in the design. */}
            <p className="tracking-wide [font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace]">
              {note}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
