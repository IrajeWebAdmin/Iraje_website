"use client";

import Link from "next/link";
import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import Image from "next/image";
import ProductsDropdown from "./ProductsDropdown";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "University", href: "/university" },
  { name: "Certification", href: "/certification" },
  // No partners page yet — rendered as plain, unclickable text.
  // { name: "Partners", disabled: true },
  // { name: "Customers", href: "/customers" },
  { name: "About", href: "/about" },
];

export default function Navbar() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
   
    <header className="absolute top-0 left-0 z-50 w-full bg-white backdrop-blur-lg">
      <div className="container-global">
  <nav className="relative flex items-center h-14">
      {/* <nav className="relative flex items-center px-12 py-2"> */}
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
{/* ashdsghj */}

        {/* Center Menu — spacing tightens as the viewport narrows so the full
            nav stays on one line instead of collapsing to a hamburger. */}
        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-3 text-sm sm:flex md:gap-6 md:text-base lg:gap-12">
          {navLinks.map((link) => (
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
          aria-label="Toggle Menu"
          aria-expanded={mobileMenu}
          className="ml-auto text-3xl text-black sm:hidden"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          {mobileMenu ? <HiX /> : <HiMenu />}
        </button>
      </nav>

      {/* Phone menu */}
      {mobileMenu && (
        <ul className="flex flex-col gap-1 border-t border-mist pb-4 sm:hidden">
          {navLinks.map((link) => (
            <li key={link.name}>
              {link.disabled ? (
                <span
                  aria-disabled="true"
                  className="block cursor-not-allowed px-2 py-2.5 font-medium text-black/40 select-none"
                >
                  {link.name}
                </span>
              ) : (
                <Link
                  href={link.href}
                  onClick={() => setMobileMenu(false)}
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
