"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";

// Review · Approve · Reject at the end of a "new" request's row. Approve asks
// for confirmation and submits straight away; it is bound to the request on
// the server by the page and ends with a redirect back to the list, which
// shows the outcome as a banner. Reject opens the reason page.
const BUTTON =
  "inline-flex h-8 items-center justify-center rounded-full px-3.5 text-xs font-semibold whitespace-nowrap transition disabled:opacity-60";

function Submit({ className, children, busyLabel }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? busyLabel : children}
    </button>
  );
}

export default function RowActions({ name, reviewHref, approveAction }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={reviewHref}
        className={`${BUTTON} border-mist text-ink hover:border-brand hover:text-brand border bg-white`}
      >
        Review
      </Link>

      <form
        action={approveAction}
        onSubmit={(event) => {
          if (
            !window.confirm(
              `Approve ${name}? An account will be created and login details emailed to them.`,
            )
          ) {
            event.preventDefault();
          }
        }}
      >
        <Submit
          busyLabel="Approving…"
          className={`${BUTTON} bg-brand hover:bg-navy px-4 text-white`}
        >
          Approve
        </Submit>
      </form>

      <Link
        href={`${reviewHref}/reject`}
        className={`${BUTTON} border border-red-200 bg-white text-red-600 hover:border-red-400 hover:bg-red-50`}
      >
        Reject
      </Link>
    </div>
  );
}
