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

// A mobile number is always longer than the shortest valid landline, so the
// "Mobile Number" field can be stricter than the general contact field above.
const MIN_MOBILE_DIGITS = 10;

/**
 * Stricter than validatePhone: for a field explicitly asking for a MOBILE.
 * Rejects numbers too short to be one, and the repeated-digit filler people
 * type to get past a required field (9999999999).
 */
export function validateMobile(raw, { required = true } = {}) {
  const value = String(raw ?? "").trim();

  if (!value) return required ? "Mobile number is required." : null;

  const normalized = normalizePhone(value);
  if (!normalized) {
    return "Enter a valid mobile number, with country code if international (e.g. +91 98765 43210).";
  }

  const digits = normalized.replace(/\D/g, "");
  if (digits.length < MIN_MOBILE_DIGITS) {
    return "That number is too short for a mobile — include the country code (e.g. +91).";
  }
  if (/^(\d)\1+$/.test(digits)) {
    return "Enter a real mobile number.";
  }
  return null;
}

// Mailboxes anyone can open for free — a personal address, not a company one.
const CONSUMER_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com",
  "yahoo.com", "yahoo.co.in", "yahoo.co.uk", "yahoo.in", "ymail.com", "rocketmail.com",
  "hotmail.com", "hotmail.co.uk", "hotmail.co.in",
  "outlook.com", "outlook.in", "live.com", "live.co.uk", "msn.com",
  "aol.com", "icloud.com", "me.com", "mac.com",
  "proton.me", "protonmail.com", "pm.me",
  "gmx.com", "gmx.net", "mail.com", "inbox.com",
  "yandex.com", "yandex.ru",
  "rediffmail.com", "sify.com", "indiatimes.com",
]);

// Throwaway inbox services — valid today, gone in ten minutes.
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "sharklasers.com",
  "10minutemail.com", "tempmail.com", "temp-mail.org", "yopmail.com",
  "throwawaymail.com", "trashmail.com", "getnada.com", "dispostable.com",
  "maildrop.cc", "fakeinbox.com", "mailnesia.com", "spam4.me",
]);

/**
 * For fields asking for a WORK address. Applies the normal format rules first,
 * then rejects free consumer mailboxes and disposable inboxes.
 *
 * Domain-list based on purpose: it cannot know whether `acme.com` is a real
 * company, only that `gmail.com` definitely isn't one. That is the right
 * trade-off here — no false rejections of genuine company domains.
 */
export function validateBusinessEmail(raw) {
  const formatError = validateEmail(raw);
  if (formatError) return formatError;

  const domain = String(raw).trim().toLowerCase().split("@").pop();

  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return "Disposable email addresses aren't accepted — please use your work email.";
  }
  if (CONSUMER_EMAIL_DOMAINS.has(domain)) {
    return "Please use your work email address, not a personal one.";
  }
  return null;
}
