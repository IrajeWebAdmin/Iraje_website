"use client";

import { useActionState } from "react";

// Result message under the buttons: green for done, red for a problem.
function Result({ state }) {
  if (!state) return null;
  return (
    <p role="status" className={`mt-3 text-sm ${state.error ? "text-red-600" : "text-green-700"}`}>
      {state.error ?? state.message}
    </p>
  );
}

// Ask "are you sure?" before submitting; Cancel stops the action.
function confirmFirst(message) {
  return (event) => {
    if (!window.confirm(message)) event.preventDefault();
  };
}

export default function ReviewActions({
  name,
  status,
  canResend,
  approveAction,
  rejectAction,
  resendAction,
}) {
  const [approveState, approve, approving] = useActionState(approveAction, undefined);
  const [rejectState, reject, rejecting] = useActionState(rejectAction, undefined);
  const [resendState, resend, resending] = useActionState(resendAction, undefined);
  const busy = approving || rejecting || resending;

  if (status === "approved") {
    return (
      <section className="mt-8 rounded-xl border border-mist bg-white p-5">
        <Result state={approveState} />
        {canResend ? (
          <form action={resend} onSubmit={confirmFirst(`Send ${name} a NEW temporary password? The old one will stop working.`)}>
            {/* One string, not {name} + text: React keeps it as a single piece,
                so the server and browser versions can't drift apart. */}
            <p className="text-sm text-shuttle">{`${name} hasn't set their own password yet.`}</p>
            <button
              type="submit"
              disabled={busy}
              className="mt-3 rounded-xl border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-catskill disabled:opacity-60"
            >
              {resending ? "Sending…" : "Resend login details"}
            </button>
            <Result state={resendState} />
          </form>
        ) : (
          <p className="text-sm text-shuttle">{`${name} has signed in and set their own password.`}</p>
        )}
      </section>
    );
  }

  if (status !== "new") {
    return <Result state={rejectState} />;
  }

  return (
    <section className="mt-8 grid gap-4 sm:grid-cols-2">
      <form
        action={approve}
        onSubmit={confirmFirst(`Approve ${name}? An account will be created and login details emailed to them.`)}
        className="rounded-xl border border-mist bg-white p-5"
      >
        <h2 className="font-semibold">Accept</h2>
        <p className="mt-1 text-sm text-shuttle">
          Creates a learner account and emails the login ID and a temporary password.
        </p>
        <button
          type="submit"
          disabled={busy}
          className="mt-4 w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
        >
          {approving ? "Approving…" : "Accept request"}
        </button>
        <Result state={approveState} />
      </form>

      <form
        action={reject}
        onSubmit={confirmFirst(`Reject ${name}'s request? They will be emailed.`)}
        className="rounded-xl border border-mist bg-white p-5"
      >
        <h2 className="font-semibold">Reject</h2>
        <label htmlFor="reason" className="mt-1 block text-sm text-shuttle">
          Reason (optional — included in the email to the applicant)
        </label>
        <textarea
          id="reason"
          name="reason"
          rows={3}
          maxLength={500}
          className="mt-2 w-full rounded-xl border border-mist px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <button
          type="submit"
          disabled={busy}
          className="mt-3 w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {rejecting ? "Rejecting…" : "Reject request"}
        </button>
        <Result state={rejectState} />
      </form>
    </section>
  );
}