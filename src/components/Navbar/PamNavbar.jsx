"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import pam from "@/data/pam";

export default function PamNavbar() {
  const [open, setOpen] = useState(false);
  const { links, cta } = pam.nav;

  return (
    <header className="absolute top-0 left-0 z-50 w-full bg-white/60 backdrop-blur-lg">
      <div className="container-global">
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

         
        
          {/* Mobile toggle */}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="text-white lg:hidden"
          >
            {open ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
          </button>
        </nav>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/10 bg-[#0451CC]/95 backdrop-blur-lg lg:hidden">
          <ul className="container-global flex flex-col gap-1 py-4">
            {links.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-sm font-medium text-white/85 hover:text-white"
                >
                  {link.name}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                href={cta.href}
                onClick={() => setOpen(false)}
                className="inline-block rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#0451CC]"
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
