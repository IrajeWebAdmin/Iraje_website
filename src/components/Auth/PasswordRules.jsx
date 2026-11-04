import { FiCheck } from "react-icons/fi";

// The pieces a "choose a new password" form is built from: the box style,
// the strength meter, the ticked list of rules and the grey-until-ready
// button. Keep MIN_LENGTH in step with validateNewPassword() in
// src/lib/password.js, which is the rule that counts; these only show it as
// the person types.
export const MIN_LENGTH = 10;

export const INPUT =
  "h-11 w-full rounded-lg border border-mist bg-white px-4 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

// A hint only: one bar for reaching the minimum length, then one each for
// mixed case, a digit, a symbol and 14+ characters, capped at four.
const STRENGTH = [
  { label: "–", bar: "bg-mist", text: "text-ink" },
  { label: "Weak", bar: "bg-red-500", text: "text-red-600" },
  { label: "Fair", bar: "bg-amber-500", text: "text-amber-600" },
  { label: "Good", bar: "bg-brand", text: "text-brand" },
  { label: "Strong", bar: "bg-green-600", text: "text-green-700" },
];

export function strengthOf(password) {
  if (!password) return 0;
  if (password.length < MIN_LENGTH) return 1;
  let score = 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 14) score++;
  return Math.min(4, score);
}

/** Four thin bars and "Strength: Good" under the new-password box. */
export function StrengthMeter({ password }) {
  const strength = strengthOf(password);
  return (
    <>
      <div className="mt-2.5 flex gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className={`h-1 flex-1 rounded-full transition-colors ${
              n <= strength ? STRENGTH[strength].bar : "bg-mist"
            }`}
          />
        ))}
      </div>
      <p className="text-slate-soft mt-1.5 text-[11px]">
        Strength:{" "}
        <span className={`font-medium ${STRENGTH[strength].text}`}>
          {STRENGTH[strength].label}
        </span>
      </p>
    </>
  );
}

/** The grey box of rules, each ticked as it is met. rules: [{ key, label, met }] */
export function RuleList({ rules }) {
  return (
    <ul
      aria-label="Password rules"
      className="border-mist bg-catskill/70 space-y-2 rounded-xl border px-4 py-3.5 text-xs"
    >
      {rules.map((r) => (
        <li
          key={r.key}
          className={`flex items-center gap-2.5 ${
            r.met ? "text-ink" : "text-shuttle"
          }`}
        >
          <span
            aria-hidden="true"
            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border transition-colors ${
              r.met
                ? "border-green-600 bg-green-600 text-white"
                : "border-slate-soft bg-white"
            }`}
          >
            {r.met && <FiCheck className="h-2.5 w-2.5" strokeWidth={3} />}
          </span>
          {r.label}
          <span className="sr-only">{r.met ? ", done" : ", not yet"}</span>
        </li>
      ))}
    </ul>
  );
}

/** Grey and disabled until every rule is met (`ready`), blue after. */
export function SubmitButton({ ready, pending, pendingLabel, children }) {
  return (
    <button
      type="submit"
      disabled={pending || !ready}
      className={`inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-semibold transition ${
        ready
          ? "bg-brand hover:bg-navy text-white disabled:opacity-60"
          : "bg-mist text-shuttle cursor-not-allowed"
      }`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
