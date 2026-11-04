"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { FiChevronDown } from "react-icons/fi";
import { logout } from "@/app/actions/auth";

// The signed-in admin at the right of the top bar: initial, name and a small
// menu headed by their name and login email, then "Change password" and
// "Logout". Closes on an outside click, on
// Escape and after choosing. Logout is a form, not a link, because signing
// out changes data and must be a POST another site cannot trigger.
export default function UserMenu({ name, email }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const id = useId();
  const label = name?.trim() || email || "Account";
  const initial = label.charAt(0).toUpperCase();

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="text-ink hover:text-brand inline-flex items-center gap-2 rounded-full py-1 pr-1 pl-1 text-sm font-semibold transition"
      >
        <span
          aria-hidden="true"
          className="bg-brand flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white"
        >
          {initial}
        </span>
        <span className="hidden max-w-40 truncate sm:inline">{label}</span>
        <FiChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <div
          id={id}
          role="menu"
          className="border-mist absolute right-0 z-30 mt-2 w-60 rounded-xl border bg-white p-1.5 shadow-lg"
        >
          <div className="border-mist mb-1 border-b px-3 pt-1.5 pb-2.5">
            <p className="text-ink truncate text-sm font-semibold">{label}</p>
            <p className="text-shuttle mt-0.5 truncate text-xs" title={email}>
              {email}
            </p>
          </div>
          <Link
            role="menuitem"
            href="/admin/change-password"
            onClick={() => setOpen(false)}
            className="text-ink hover:bg-catskill block rounded-lg px-3 py-2 text-sm"
          >
            Change password
          </Link>
          <form action={logout}>
            <button
              type="submit"
              role="menuitem"
              className="text-ink hover:bg-catskill block w-full rounded-lg px-3 py-2 text-left text-sm"
            >
              Logout
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
