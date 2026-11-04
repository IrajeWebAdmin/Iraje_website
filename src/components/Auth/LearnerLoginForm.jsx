"use client";

import { useActionState } from "react";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import PasswordInput from "./PasswordInput";

// design). /admin/login has its own card in AdminLoginForm.jsx. `action` is
// the login Server Action with the role already bound by the page.
// login Server Action with the role already bound by the page.
const INPUT =
  "h-12 w-full rounded-2xl bg-[#F1F6FF] px-4 text-sm text-ink outline-none transition focus:ring-2 focus:ring-brand/30";

export default function LearnerLoginForm({ action }) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="mt-8 max-w-100 space-y-5">
      <div>
        <label
          htmlFor="email"
          className="text-ink mb-2 block text-sm font-medium"
        >
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
          <label htmlFor="password" className="text-ink text-sm font-medium">
            Password
          </label>
          {/* No self-service reset yet: the team issues a new temporary password. */}
          <Link
            href="/certification/forgot-password"
            className="text-brand text-xs font-medium hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          required
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
        className="bg-brand hover:bg-brand/90 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-white transition disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
        {!pending && <FiArrowRight className="h-4 w-4" />}
      </button>

      <p className="text-shuttle px-2 text-sm">
        Not registered yet?{" "}
        <Link
          href="/certification#enroll"
          className="text-brand font-medium hover:underline"
        >
          Enroll for a certification
        </Link>
      </p>
    </form>
  );
}
