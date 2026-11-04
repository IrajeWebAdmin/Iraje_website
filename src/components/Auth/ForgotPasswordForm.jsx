"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiArrowRight, FiKey, FiMail } from "react-icons/fi";
import { requestPasswordReset } from "@/app/actions/auth";
import HoneypotField from "@/components/HoneypotField";
import AuthCard from "./AuthCard";
import { INPUT } from "./PasswordRules";

const BACK = (
  <Link
    href="/certification/login"
    className="text-shuttle hover:text-brand mt-6 inline-flex items-center gap-1.5 text-xs font-medium transition"
  >
    <FiArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
    Back to sign in
  </Link>
);

// /certification/forgot-password: ask for the email, then show the "check
// your inbox" card. The server answers the same way whether or not an account
// exists, so the page never says which emails are registered. `minutes` is
// how long the emailed link works.
export default function ForgotPasswordForm({ minutes }) {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    undefined,
  );
  const [honeypot, setHoneypot] = useState("");
  // "Send it again" brings the form back without losing the typed email.
  const [dismissed, setDismissed] = useState(null);
  const sent = state?.sent && state !== dismissed;

  if (sent) {
    return (
      <AuthCard
        icon={FiMail}
        title="Check your"
        accent="inbox"
        intro={
          <>
            If there is a learner account for{" "}
            <strong className="text-ink font-semibold">{state.email}</strong>,
            we have emailed it a link to set a new password. The link works for{" "}
            {minutes} minutes.
          </>
        }
      >
        <p className="text-shuttle mt-4 text-xs leading-relaxed">
          Nothing after a few minutes? Look in your spam folder, or{" "}
          <button
            type="button"
            onClick={() => setDismissed(state)}
            className="text-brand font-medium hover:underline"
          >
            send it again
          </button>
          .
        </p>
        {BACK}
      </AuthCard>
    );
  }

  return (
    <AuthCard
      icon={FiKey}
      title="Forgot your"
      accent="password?"
      intro="Enter the email you registered with and we'll send you a link to set a new one."
    >
      <form action={formAction} className="mt-6 space-y-5">
        <HoneypotField
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
        <div>
          <label
            htmlFor="email"
            className="text-ink mb-1.5 block text-sm font-medium"
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

        {state?.error && (
          <p role="alert" className="text-sm text-red-600">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="bg-brand hover:bg-navy inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-white transition disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send reset link"}
          {!pending && <FiArrowRight className="h-4 w-4" aria-hidden="true" />}
        </button>
      </form>
      {BACK}
    </AuthCard>
  );
}
