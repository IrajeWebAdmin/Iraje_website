// Shared honeypot definition, imported by both the forms and the API route so
// the field name can never drift apart between them.

// Named like a plausible form field so automated fillers take the bait. Real
// visitors never see it — see `HoneypotField` for how it is hidden.
export const HONEYPOT_FIELD = "website";

/** True when a submission filled the hidden field, i.e. it is almost certainly a bot. */
export function isHoneypotTripped(body) {
  return String(body?.[HONEYPOT_FIELD] ?? "").trim().length > 0;
}
