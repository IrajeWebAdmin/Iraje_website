import Link from "next/link";
import { FiShield } from "react-icons/fi";
import pam from "@/data/pam";

export default function PamFooter() {
  const { brand, badge, tagline, columns, copyright, tag } = pam.footer;

  return (
    <footer className="bg-[#021B45] text-white">
      <div className="container-global py-16">
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <FiShield className="h-6 w-6 text-azure-bright" />
              <span className="font-display text-xl font-bold tracking-tight">
                {brand}
              </span>
              <span className="font-mono text-[10px] tracking-[0.2em] text-white/50 uppercase">
                {badge}
              </span>
            </div>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/60">
              {tagline}
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h5 className="mb-5 font-mono text-xs tracking-[0.2em] text-white/40 uppercase">
                {col.title}
              </h5>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/75 transition hover:text-white"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="my-10 h-px bg-white/10" />

        <div className="flex flex-col gap-4 text-xs text-white/40 md:flex-row md:justify-between">
          <p>{copyright}</p>
          <p className="font-mono">{tag}</p>
        </div>
      </div>
    </footer>
  );
}
