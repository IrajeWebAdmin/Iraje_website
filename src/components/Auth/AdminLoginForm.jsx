"use client";

import { useActionState } from "react";
import { FiArrowRight, FiLock } from "react-icons/fi";
import PasswordInput from "./PasswordInput";

// Staff sign-in card for /admin/login (the Figma "Iraje Admin" design): title,
// work email, password with show/hide and a "forgot" link, one full-width
// button and a note that the page is for the team only. `action` is the login
// Server Action with the "admin" role already bound by the page. No "keep me
// signed in" box here: admin sessions keep their fixed 12-hour life.
const INPUT =
  "h-11 w-full rounded-lg border border-mist bg-white px-4 text-sm text-ink placeholder:text-slate-soft outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

export default function AdminLoginForm({ action }) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <div className="border-mist/60 mx-auto w-full max-w-[440px] rounded-3xl border bg-white p-7 shadow-[0_24px_60px_-28px_rgba(12,30,58,0.28)] sm:p-8">
      <h1 className="font-display text-ink text-[26px] leading-tight font-bold tracking-tight">
        Iraje <span className="text-brand font-medium italic">Admin</span>
      </h1>
      <p className="text-shuttle mt-2 text-sm leading-relaxed">
        Sign in to review certification requests, learners and reports.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="email"
            className="text-ink mb-1.5 block text-sm font-medium"
          >
            Work email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            placeholder="name@iraje.com"
            defaultValue={state?.email ?? ""}
            className={INPUT}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-ink text-sm font-medium">
              Password
            </label>
            {/* No self-service reset: another admin issues a new temporary password. */}
            <a
              href="mailto:contact@iraje.com?subject=Iraje%20Admin%20password%20reset"
              className="text-brand text-xs font-medium hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            required
            placeholder="Enter your password"
            className={INPUT}
          />
        </div>

        {state?.error && (
          <p role="alert" className="text-sm text-red-600">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="bg-brand hover:bg-navy mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-white transition disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
          {!pending && <FiArrowRight className="h-4 w-4" aria-hidden="true" />}
        </button>
      </form>

      <p className="border-mist bg-catskill text-shuttle mt-4 flex items-start gap-3 rounded-lg border px-4 py-3.5 text-xs leading-relaxed">
        <FiLock
          className="text-brand mt-0.5 h-4 w-4 shrink-0"
          aria-hidden="true"
        />
        <span>
          Restricted to authorised Iraje team members. Sign-in activity is
          logged.
        </span>
      </p>
    </div>
  );
}
