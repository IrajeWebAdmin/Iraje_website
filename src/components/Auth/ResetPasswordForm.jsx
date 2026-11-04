"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { FiLock } from "react-icons/fi";
import PasswordInput from "./PasswordInput";
import AuthCard from "./AuthCard";
import {
  INPUT,
  MIN_LENGTH,
  RuleList,
  StrengthMeter,
  SubmitButton,
} from "./PasswordRules";

// /certification/reset-password, reached from the emailed link: choose a new
// password, then land on the dashboard signed in. `action` is resetPassword
// with the link's token already bound by the page; `email` is only shown.
export default function ResetPasswordForm({ action, email }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const rules = [
    {
      key: "length",
      label: `At least ${MIN_LENGTH} characters`,
      met: next.length >= MIN_LENGTH,
    },
    {
      key: "match",
      label: "Both passwords match",
      met: next.length > 0 && next === confirm,
    },
  ];
  const ready = rules.every((r) => r.met);

  return (
    <AuthCard
      icon={FiLock}
      title="Set a new"
      accent="password"
      intro={
        <>
          For <strong className="text-ink font-semibold">{email}</strong>.
          Choose a new password and you will be signed in straight away.
        </>
      }
    >
      <form action={formAction} className="mt-6 space-y-5">
        {/* Lets password managers save the new password against the email. */}
        <input
          type="email"
          name="username"
          value={email}
          readOnly
          autoComplete="username"
          tabIndex={-1}
          className="sr-only"
        />
        <div>
          <label
            htmlFor="newPassword"
            className="text-ink mb-1.5 block text-sm font-medium"
          >
            New password{" "}
            <span className="text-shuttle font-normal">
              (at least {MIN_LENGTH} characters)
            </span>
          </label>
          <PasswordInput
            id="newPassword"
            name="newPassword"
            autoComplete="new-password"
            required
            minLength={MIN_LENGTH}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className={INPUT}
          />
          <StrengthMeter password={next} />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="text-ink mb-1.5 block text-sm font-medium"
          >
            Type the new password again
          </label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={INPUT}
          />
        </div>

        <RuleList rules={rules} />

        {state?.error && (
          <p role="alert" className="text-sm text-red-600">
            {state.error}
            {state.expired && (
              <>
                {" "}
                <Link
                  href="/certification/forgot-password"
                  className="font-medium underline underline-offset-2"
                >
                  Request a new link
                </Link>
                .
              </>
            )}
          </p>
        )}

        <SubmitButton ready={ready} pending={pending} pendingLabel="Saving…">
          Save and sign in
        </SubmitButton>
      </form>
    </AuthCard>
  );
}
