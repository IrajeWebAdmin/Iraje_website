"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { logout } from "@/app/actions/auth";

// Avatar initial + name that opens a small menu. Closes on outside click or
// Escape. Logout stays a POST form (see LogoutButton) — never a plain link.
export default function UserMenu({ name }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const displayName = String(name ?? "").trim();
  const initial = displayName.charAt(0).toUpperCase() || "?";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="text-ink hover:bg-catskill flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition"
      >
        <span className="bg-brand flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white">
          {initial}
        </span>
        <span className="hidden sm:inline">{displayName}</span>
        <FiChevronDown
          className={`text-shuttle h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="border-mist absolute top-full right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border bg-white py-1.5 shadow-[0_18px_40px_-20px_rgba(12,30,58,0.35)]"
        >
          <Link
            role="menuitem"
            href="/certification/change-password"
            onClick={() => setOpen(false)}
            className="text-ink hover:bg-catskill block px-4 py-2 text-sm transition"
          >
            Change password
          </Link>
          <form action={logout}>
            <button
              role="menuitem"
              type="submit"
              className="text-ink hover:bg-catskill block w-full px-4 py-2 text-left text-sm transition"
            >
              Logout
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
