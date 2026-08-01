import { HONEYPOT_FIELD } from "@/lib/honeypot";

/**
 * A decoy input that automated form fillers populate and people never touch.
 * Submissions that arrive with it set are discarded server-side.
 *
 * Hidden off-screen rather than with `display:none`, which cruder bots skip.
 * `aria-hidden` + `tabIndex={-1}` keep it out of the screen-reader and keyboard
 * paths, and the `data-*` hints stop password managers autofilling it — an
 * autofilled honeypot would silently discard a genuine enquiry.
 */
export default function HoneypotField({ value, onChange }) {
  return (
    <div
      aria-hidden="true"
      className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden"
    >
      <label>
        Website
        <input
          type="text"
          name={HONEYPOT_FIELD}
          value={value}
          onChange={onChange}
          tabIndex={-1}
          autoComplete="off"
          data-lpignore="true"
          data-form-type="other"
        />
      </label>
    </div>
  );
}
