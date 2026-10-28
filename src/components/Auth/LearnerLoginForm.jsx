"use client";

import { useActionState } from "react";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import PasswordInput from "./PasswordInput";

// Learner sign-in form for /certification/login (the Figma "Welcome back"
// design). /admin/login keeps the plain card in LoginForm.jsx. `action` is the
// login Server Action with the role already bound by the page.
const INPUT =
  "h-12 w-full rounded-2xl bg-[#F1F6FF] px-4 text-sm text-ink outline-none transition focus:ring-2 focus:ring-brand/30";

export default function LearnerLoginForm({ action }) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="mt-8 max-w-100 space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-ink">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={state?.email ?? ""}
          className={INPUT}
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-ink">
            Password
          </label>
          {/* No self-service reset yet: the team issues a new temporary password. */}
          <a
            href="mailto:contact@iraje.com?subject=Iraje%20University%20password%20reset"
            className="text-xs font-medium text-brand hover:underline"
          >
            Forgot Password?
          </a>
        </div>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          required
          className={INPUT}
        />
      </div>

      <label className="flex items-center gap-2.5 px-1 text-sm text-slate-soft">
        <input type="checkbox" name="remember" className="h-4 w-4 accent-brand" />
        Keep me signed in
      </label>

      {state?.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-sm font-semibold text-white transition hover:bg-brand/90 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
        {!pending && <FiArrowRight className="h-4 w-4" />}
      </button>

      <p className="px-2 text-sm text-shuttle">
        Not registered yet?{" "}
        <Link href="/certification#enroll" className="font-medium text-brand hover:underline">
          Enroll for a certification
        </Link>
      </p>
    </form>
  );
}
