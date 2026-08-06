"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import pam from "@/data/pam";
import ProductsDropdown from "./ProductsDropdown";
import MobileProductsMenu from "./MobileProductsMenu";

export default function PamNavbar() {
  const [open, setOpen] = useState(false);
  // `pam.nav.cta` ("Get in touch") is intentionally not read: the button it fed
  // was the last item of the phone menu and has been dropped. The data is left
  // in place so the CTA can be restored without re-authoring the copy.
  const { links } = pam.nav;

  return (
    <header className="absolute top-0 left-0 z-50 w-full bg-white backdrop-blur-lg">
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

         
        
          {/* Phone-only toggle: below 640px the logo and five links cannot share
              one line, so the menu drops into the panel below. */}
          <button
            type="button"
            aria-label="Toggle Menu"
            aria-expanded={open}
            className="ml-auto text-3xl text-black sm:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? <HiX /> : <HiMenu />}
          </button>
        </nav>

        {/* Phone menu — deliberately a copy of HomeNavbar's: white panel, black
            links, same container, same hairline. The brand-blue panel this used
            to render was the only thing that made the mobile navbar look
            different on this route. Keep the two in step when either changes. */}
        {open && (
          <ul className="flex flex-col gap-1 border-t border-mist pb-4 sm:hidden">
            {links.map((link) => (
              <li key={link.name}>
                {/* Products expands in place — its href has no page behind it. */}
                {link.name === "Products" ? (
                  <MobileProductsMenu onNavigate={() => setOpen(false)} />
                ) : link.disabled ? (
                  <span
                    aria-disabled="true"
                    className="block cursor-not-allowed px-2 py-2.5 font-medium text-black/40 select-none"
                  >
                    {link.name}
                  </span>
                ) : (
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block px-2 py-2.5 font-medium text-black"
                  >
                    {link.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  );
}
