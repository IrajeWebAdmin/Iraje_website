"use client";

import { useState } from "react";
import Link from "next/link";
import { FiChevronDown } from "react-icons/fi";
import { PRODUCTS } from "./ProductsDropdown";

// Phone-menu counterpart to ProductsDropdown.
//
// Every navbar special-cased "Products" into the dropdown on desktop but not
// in its phone panel, where it stayed a plain <Link href="/products">. There
// is no /products route (only /products/pam and /products/epm), so tapping it
// landed on the 404 page. This renders the row as a toggle instead: tapping it
// expands the same PRODUCTS list in place and navigates nowhere.
//
// The classes are props because the phone panels differ per navbar — white
// with black text on Home/About/Certification, brand blue on PAM, navy on EPM.
// The defaults are the light panel.

const DEFAULT_TRIGGER =
  "flex w-full items-center justify-between px-2 py-2.5 font-medium text-black";
const DEFAULT_ITEM =
  "flex items-center gap-2.5 py-2 pr-2 pl-6 font-medium text-black/70";
const DEFAULT_ICON = "h-4 w-4 shrink-0 text-brand";

export default function MobileProductsMenu({
  label = "Products",
  triggerClassName = DEFAULT_TRIGGER,
  itemClassName = DEFAULT_ITEM,
  iconClassName = DEFAULT_ICON,
  onNavigate,
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={triggerClassName}
      >
        {label}
        <FiChevronDown
          aria-hidden="true"
          className={`h-4 w-4 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul>
          {PRODUCTS.map(({ name, href, Icon, disabled }) => (
            <li key={name}>
              {disabled ? (
                <span
                  aria-disabled="true"
                  className={`${itemClassName} cursor-not-allowed opacity-50 select-none`}
                >
                  <Icon aria-hidden="true" className={iconClassName} />
                  {name}
                </span>
              ) : (
                <Link
                  href={href}
                  // Collapses this list *and* the whole phone panel, so the
                  // menu is not left hanging open over the page just landed on.
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  className={itemClassName}
                >
                  <Icon aria-hidden="true" className={iconClassName} />
                  {name}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
