"use client";

import { useActionState, useState } from "react";
import { FiLock } from "react-icons/fi";
import { changePassword } from "@/app/actions/auth";
import PasswordInput from "./PasswordInput";
import AuthCard from "./AuthCard";
import {
  INPUT,
  MIN_LENGTH,
  RuleList,
  StrengthMeter,
  SubmitButton,
} from "./PasswordRules";

// The "Set your password" card (Figma): lock badge, italic title, the current
// and new passwords with show/hide, a strength meter, a live checklist of the
// rules, and a Save button that is grey until every rule is met. Used by
// /certification/change-password (learners, usually their first sign-in with
// a temporary password) and /admin/change-password.
export default function ChangePasswordForm({ firstTime }) {
  const [state, formAction, pending] = useActionState(
    changePassword,
    undefined,
  );
  const [current, setCurrent] = useState("");
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
      label: "Both new passwords match",
      met: next.length > 0 && next === confirm,
    },
    {
      key: "differs",
      label: firstTime
        ? "Different from your temporary password"
        : "Different from your current password",
      met: next.length > 0 && current.length > 0 && next !== current,
    },
  ];
  const ready = rules.every((r) => r.met);

  return (
    <AuthCard
      icon={FiLock}
      title={firstTime ? "Set your" : "Change your"}
      accent="password"
      intro={
        firstTime
          ? "You signed in with a temporary password. Choose your own to continue."
          : "Choose a new password. Any other device you are signed in on will be signed out."
      }
    >
      <form action={formAction} className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="currentPassword"
            className="text-ink mb-1.5 block text-sm font-medium"
          >
            {firstTime ? "Current (or temporary) password" : "Current password"}
          </label>
          <PasswordInput
            id="currentPassword"
            name="currentPassword"
            autoComplete="current-password"
            required
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className={INPUT}
          />
        </div>

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
          </p>
        )}

        <SubmitButton ready={ready} pending={pending} pendingLabel="Saving…">
          Save password
        </SubmitButton>
      </form>
    </AuthCard>
  );
}
