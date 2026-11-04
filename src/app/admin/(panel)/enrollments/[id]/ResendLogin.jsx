"use client";

import { useActionState } from "react";
import { FiAlertCircle, FiCheck, FiKey, FiSend } from "react-icons/fi";

// The card under an approved request whose learner has never signed in:
// when the last login email went out, and a button to send a fresh temporary
// password. `action` is resendCredentials with the request id already bound.
export default function ResendLogin({ firstName, lastEmailLabel, action }) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <section
      aria-label="Login details"
      className="border-mist rounded-2xl border bg-white p-5"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600"
        >
          <FiKey className="h-4 w-4" />
        </span>
        <div>
          {/* One string, not {firstName} + text: React keeps it as a single
              piece, so the server and browser versions can't drift apart. */}
          <p className="text-ink text-sm font-medium">{`${firstName} hasn't set their own password yet.`}</p>
          {lastEmailLabel ? (
            <p className="text-slate-soft mt-0.5 text-xs">
              Last login email: {lastEmailLabel}
            </p>
          ) : null}
        </div>
      </div>

      <form
        action={formAction}
        onSubmit={(event) => {
          if (
            !window.confirm(
              `Send ${firstName} a NEW temporary password? The old one will stop working.`,
            )
          ) {
            event.preventDefault();
          }
        }}
        className="mt-4 flex flex-wrap items-center gap-4"
      >
        <button
          type="submit"
          disabled={pending}
          className="border-brand text-brand hover:bg-catskill inline-flex h-9 items-center gap-2 rounded-full border bg-white px-4 text-sm font-semibold transition disabled:opacity-60"
        >
          <FiSend className="h-3.5 w-3.5" aria-hidden="true" />
          {pending ? "Sending…" : "Resend login details"}
        </button>
        {state ? (
          <p
            role="status"
            className={`inline-flex items-center gap-1.5 text-xs ${
              state.error ? "text-red-600" : "text-green-700"
            }`}
          >
            {state.error ? (
              <FiAlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <FiCheck className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {state.error ?? state.message}
          </p>
        ) : null}
      </form>
    </section>
  );
}
