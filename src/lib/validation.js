// Shared field validation, imported by both the forms and the API route so the
// browser and the server can never disagree about what counts as valid.
//
// Each validator returns an error string, or null when the value is acceptable.

const EMAIL_MAX = 254; // RFC 5321 limit on a full address
const EMAIL_LOCAL_MAX = 64; // RFC 5321 limit on the part before "@"

// Deliberately not RFC 5322 — that grammar permits quoted strings, comments and
// bare IP literals that no contact form should accept. This matches what real
// addresses look like: dot-separated local part, a real domain, an alphabetic
// TLD. Consecutive dots and a leading/trailing dot are impossible by shape.
const EMAIL_RE =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

export function validateEmail(raw) {
  const value = String(raw ?? "").trim();

  if (!value) return "Email is required.";
  if (value.length > EMAIL_MAX) return "Email is too long.";

  const at = value.indexOf("@");
  if (at > EMAIL_LOCAL_MAX) return "Email is too long.";

  if (!EMAIL_RE.test(value)) return "Enter a valid email address.";
  return null;
}

// Punctuation people use to make numbers readable. It carries no information,
// so it is stripped before the digits are examined.
const PHONE_SEPARATORS = /[\s.\-()]/g;

// E.164 caps a full international number at 15 digits. The floor allows for the
// short national numbers still in use in some countries.
const MAX_DIGITS = 15;
const MIN_INTERNATIONAL_DIGITS = 8;
const MIN_NATIONAL_DIGITS = 7;

/**
 * Reduce a typed phone number to a compact, dialable form: an optional leading
 * "+" followed by digits only. Returns null when the input is not a plausible
 * phone number.
 *
 * Accepts international ("+91 98765 43210", "+1 (555) 123-4567", "0091 98765
 * 43210") and national ("9876543210", "022 1234 5678") formats alike.
 */
export function normalizePhone(raw) {
  const compact = String(raw ?? "")
    .trim()
    .replace(PHONE_SEPARATORS, "");
  if (!compact) return null;

  // "+" and the "00" exit code both mean "international number follows".
  let digits = compact;
  let international = false;
  if (compact.startsWith("+")) {
    digits = compact.slice(1);
    international = true;
  } else if (compact.startsWith("00")) {
    digits = compact.slice(2);
    international = true;
  }

  if (!/^\d+$/.test(digits)) return null;

  if (international) {
    // No country calling code begins with 0.
    if (digits.startsWith("0")) return null;
    if (digits.length < MIN_INTERNATIONAL_DIGITS || digits.length > MAX_DIGITS) {
      return null;
    }
    return `+${digits}`;
  }

  // National format — the country is unknown, so only the length can be checked.
  if (digits.length < MIN_NATIONAL_DIGITS || digits.length > MAX_DIGITS) {
    return null;
  }
  return digits;
}

/**
 * @param options.required  Whether an empty value is an error. The Contact Us
 *                          forms require a number; the University form does not.
 */
export function validatePhone(raw, { required = true } = {}) {
  const value = String(raw ?? "").trim();

  if (!value) return required ? "Contact number is required." : null;

  if (!normalizePhone(value)) {
    return "Enter a valid contact number, with country code if international (e.g. +91 98765 43210).";
  }
  return null;
}
