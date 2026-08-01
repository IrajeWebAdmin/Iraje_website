"use client";

import Link from "next/link";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import epm from "@/data/epm";
import Image from "next/image";
import ProductsDropdown from "./ProductsDropdown";

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

          {/* Center links — spacing tightens as the viewport narrows so the full
              nav stays on one line instead of collapsing to a hamburger. */}
          <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-3 text-sm sm:flex md:gap-6 md:text-base lg:gap-12">
            {links.map((link) => (
              <li key={link.name}>
                {link.name === "Products" ? (
                  <ProductsDropdown />
                ) : link.disabled ? (
                  <span
                    aria-disabled="true"
                    className="cursor-not-allowed font-medium text-black/40 select-none"
                  >
                    {link.name}
                  </span>
                ) : (
                  <Link
                    href={link.href}
                    className="relative font-medium text-black transition-all duration-300 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-black after:transition-all after:duration-300 hover:after:w-full"
                  >
                    {link.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Phone-only toggle: below 640px the logo and links cannot share one
              line, so the menu drops into the panel below. */}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="ml-auto text-black sm:hidden"
          >
            {open ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
          </button>
        </nav>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="bg-navy/95 border-t border-white/10 backdrop-blur-lg sm:hidden">
          <ul className="epm-container flex flex-col gap-1 py-4">
            {links.map((link) => (
              <li key={link.name}>
                {link.disabled ? (
                  <span
                    aria-disabled="true"
                    className="block cursor-not-allowed py-2 text-sm font-medium text-white/40 select-none"
                  >
                    {link.name}
                  </span>
                ) : (
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block py-2 text-sm font-medium text-white/80 hover:text-white"
                  >
                    {link.name}
                  </Link>
                )}
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
