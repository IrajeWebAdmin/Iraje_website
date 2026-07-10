"use client";

import Link from "next/link";
import { useState } from "react";
import epm from "@/data/epm";
import Image from "next/image";

export default function EpmNavbar() {
  const [open, setOpen] = useState(false);
  const { links, cta } = epm.nav;

  return (
    <header className="absolute top-0 left-0 z-50 w-full bg-white backdrop-blur-lg">
      <div className="epm-container">
        <nav className="relative flex h-14 items-center">
          {/* Logo */}
          <Link href="/" aria-label="Iraje Home">
            <Image
              src="/images/navbar/company-logo-nav.png"
              alt="Iraje Identity Security Platform Logo"
              width={90}
              height={32}
              priority
            />
          </Link>

          {/* Center links */}
          <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-12 lg:flex">
            {links.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="relative font-medium text-black transition-all duration-300 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-black after:transition-all after:duration-300 hover:after:w-full"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="bg-navy/95 border-t border-white/10 backdrop-blur-lg lg:hidden">
          <ul className="epm-container flex flex-col gap-1 py-4">
            {links.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-sm font-medium text-white/80 hover:text-white"
                >
                  {link.name}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                href={cta.href}
                onClick={() => setOpen(false)}
                className="text-navy inline-block rounded-full bg-white px-5 py-2 text-sm font-semibold"
              >
                {cta.label}
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
