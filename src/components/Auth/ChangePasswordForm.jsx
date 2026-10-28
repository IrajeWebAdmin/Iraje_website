"use client";

import { useActionState } from "react";
import { changePassword } from "@/app/actions/auth";
import PasswordInput from "./PasswordInput";

const FIELDS = [
  { name: "currentPassword", label: "Current (or temporary) password", autoComplete: "current-password" },
  { name: "newPassword", label: "New password (at least 10 characters)", autoComplete: "new-password" },
  { name: "confirmPassword", label: "Type the new password again", autoComplete: "new-password" },
];

// Used by /admin/change-password and /certification/change-password.
export default function ChangePasswordForm({ firstTime }) {
  const [state, formAction, pending] = useActionState(changePassword, undefined);

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-mist bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-ink">
        {firstTime ? "Set your password" : "Change password"}
      </h1>
      {firstTime && (
        <p className="mt-1 text-sm text-shuttle">
          You signed in with a temporary password. Choose your own to continue.
        </p>
      )}

      <form action={formAction} className="mt-6 space-y-4">
        {FIELDS.map((f) => (
          <div key={f.name}>
            <label htmlFor={f.name} className="mb-1.5 block text-xs font-semibold text-ink">
              {f.label}
            </label>
            <PasswordInput
              id={f.name}
              name={f.name}
              autoComplete={f.autoComplete}
              required
              className="w-full rounded-xl border border-mist px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
        ))}

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
          {pending ? "Saving…" : "Save password"}
        </button>
      </form>
    </div>
  );
}