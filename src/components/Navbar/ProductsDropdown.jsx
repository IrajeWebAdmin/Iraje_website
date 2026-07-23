"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FiLock, FiMonitor, FiUser, FiChevronDown } from "react-icons/fi";

// Products shown in the navbar dropdown. Edit here to change the menu.
const PRODUCTS = [
  { name: "Privileged Access Manager", href: "/products/pam", Icon: FiLock },
  { name: "Endpoint Privilege Manager", href: "/products/epm", Icon: FiMonitor },
  { name: "Identity & Access Manager", href: "/products/iam", Icon: FiUser },
];

// Shared "Products" nav item: a click-toggled dropdown that links to each
// product page. `linkClassName` matches the trigger to the host navbar's other
// links (default = the black underline-on-hover style used site-wide).
const DEFAULT_LINK_CLASS =
  "relative font-medium text-black transition-all duration-300 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-black after:transition-all after:duration-300 hover:after:w-full";

export default function ProductsDropdown({
  linkClassName = DEFAULT_LINK_CLASS,
  label = "Products",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`inline-flex items-center gap-1 ${linkClassName}`}
      >
        {label}
        <FiChevronDown
          aria-hidden="true"
          className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 mt-4 w-[340px] rounded-2xl border border-[#E8ECF4] bg-white p-2 shadow-[0px_20px_50px_-24px_rgba(12,30,58,0.35)]"
        >
          {PRODUCTS.map(({ name, href, Icon }) => (
            <Link
              key={name}
              href={href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-medium text-ink transition hover:bg-[#F4F8FF]"
            >
              <Icon className="h-5 w-5 shrink-0 text-brand" />
              {name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
