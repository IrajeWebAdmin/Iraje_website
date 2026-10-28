"use client";

import { useActionState } from "react";

// Email + password card shared by /admin/login and /certification/login.
// `action` is the login Server Action with the role already bound by the page.
export default function LoginForm({ action, title, subtitle }) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-mist bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-shuttle">{subtitle}</p>}

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-ink">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            defaultValue={state?.email ?? ""}
            className="w-full rounded-xl border border-mist px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-ink">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-mist px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
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
          className="w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}