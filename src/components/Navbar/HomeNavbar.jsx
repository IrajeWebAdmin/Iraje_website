"use client";

import Link from "next/link";
import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import Image from "next/image";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "University", href: "/university" },
  { name: "Certification", href: "/certification" },
  { name: "Partners", href: "/partners" },
  { name: "Customers", href: "/customers" },
  { name: "About", href: "/about" },
];

export default function Navbar() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
   
    <header className="absolute top-0 left-0 z-50 w-full bg-white/60 backdrop-blur-lg">
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


        {/* Center Menu */}
        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-12 lg:flex">
          {navLinks.map((link) => (
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

        {/* Mobile Menu Button */}
        <button
          aria-label="Toggle Menu"
          className="text-3xl text-black lg:hidden"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          {mobileMenu ? <HiX /> : <HiMenu />}
        </button>
      </nav>
      </div>
    </header>
  );
}
