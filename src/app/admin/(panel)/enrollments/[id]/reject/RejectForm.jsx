"use client";

import { useActionState, useId, useState } from "react";
import Link from "next/link";
import { FiAlertCircle, FiInfo } from "react-icons/fi";

// The reason form on /admin/enrollments/42/reject. `templates` are the
// "common reasons": clicking one drops its text into the box, where it can be
// edited. `action` is the reject Server Action with the request id already
// bound; on success it redirects back to the list, on failure it returns
// { error } which is shown above the footer.
const MAX = 500;

export default function RejectForm({ templates = [], action, cancelHref }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [reason, setReason] = useState("");
  const id = useId();

  const insert = (text) => {
    setReason((current) => {
      const base = current.trim();
      const next = base ? `${base}\n\n${text}` : text;
      return next.slice(0, MAX);
    });
  };

  return (
    <form
      action={formAction}
      className="border-mist rounded-2xl border bg-white"
    >
      <div className="space-y-5 p-5">
        {templates.length ? (
          <div>
            <p className="text-ink text-sm font-medium">Common reasons</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {templates.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => insert(t.text)}
                  className="border-mist text-ink hover:border-brand hover:text-brand rounded-full border bg-white px-3.5 py-1.5 text-xs font-medium transition"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div>
          <div className="flex items-baseline justify-between gap-4">
            <label htmlFor={`${id}-reason`} className="text-ink text-sm">
              <span className="font-medium">Reason for rejection</span>{" "}
              <span className="text-shuttle">(optional, but recommended)</span>
            </label>
            <span
              className={`text-xs tabular-nums ${
                reason.length >= MAX ? "text-red-600" : "text-slate-soft"
              }`}
              aria-live="polite"
            >
              {reason.length} / {MAX}
            </span>
          </div>
          <textarea
            id={`${id}-reason`}
            name="reason"
            rows={5}
            maxLength={MAX}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="For example: PAM 201 requires the PAM 101 certification. Please complete PAM 101 first, then submit a new request."
            className="border-mist text-ink placeholder:text-slate-soft focus:border-brand focus:ring-brand/20 mt-2 w-full rounded-xl border px-3.5 py-3 text-sm outline-none focus:ring-2"
          />
        </div>

        <label className="text-ink flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            name="reapply"
            defaultChecked
            className="accent-brand h-4 w-4"
          />
          Tell the applicant they can submit a new request
        </label>

        {state?.error ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800"
          >
            <FiAlertCircle
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            {state.error}
          </p>
        ) : null}
      </div>

      <div className="border-mist flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4">
        <p className="text-shuttle inline-flex items-center gap-1.5 text-xs">
          <FiInfo className="h-3.5 w-3.5" aria-hidden="true" />
          The applicant is emailed as soon as you confirm.
        </p>
        <div className="flex items-center gap-2">
          <Link
            href={cancelHref}
            className="border-mist text-ink hover:bg-catskill inline-flex h-10 items-center rounded-full border bg-white px-5 text-sm font-semibold transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 items-center rounded-full bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {pending ? "Rejecting…" : "Reject & notify applicant"}
          </button>
        </div>
      </div>
    </form>
  );
}
