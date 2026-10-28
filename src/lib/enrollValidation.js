// Validation for the certification enrolment form, imported by both the form
// and /api/enroll so the browser and the server can never disagree. Each
// validator returns an error string, or null when the value is acceptable.
import { COUNTRY_BY_ISO2, COUNTRY_BY_NAME } from "@/data/countries";

// ---- Full name ------------------------------------------------------------

const NAME_WORD = "[\\p{L}][\\p{L}'’.\\-]*";
const NAME_RE = new RegExp(`^${NAME_WORD}( ${NAME_WORD})*$`, "u");

/** "  john   o'brien-SMITH " -> "John O'Brien-Smith": Pascal case, one space between words. */
export function formatPersonName(raw) {
  return String(raw ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/(^|[ '’.\-])(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase());
}

export function validatePersonName(raw) {
  const value = formatPersonName(raw);
  if (!value) return "Full name is required.";
  if (value.length > 120) return "Full name is too long.";
  if (!NAME_RE.test(value))
    return "Enter your name with letters only, e.g. John Smith.";
  if (value.replace(/[^\p{L}]/gu, "").length < 2)
    return "Enter your full name.";
  return null;
}

// ---- Country --------------------------------------------------------------

export function validateCountryName(raw) {
  const value = String(raw ?? "").trim();
  if (!value) return "Country is required.";
  if (!COUNTRY_BY_NAME.has(value)) return "Choose your country from the list.";
  return null;
}

// ---- Mobile number with country code ---------------------------------------

/** E.164: country code + national number is at most 15 digits. */
export const MOBILE_MAX_DIGITS = 15;

// Where the national number has a fixed, well-known shape it is checked; for
// every other country only the E.164 length rule applies. Country code 1 is
// the North American plan: ten digits, area code first.
const NATIONAL_RULES = {
  IN: { length: 10, first: /^[6-9]/, example: "98765 43210" },
  NANP: { length: 10, first: /^[2-9]/, example: "415 555 0132" },
};
const ruleFor = (country) =>
  NATIONAL_RULES[country.iso2] ??
  (country.dial === "1" ? NATIONAL_RULES.NANP : null);

/**
 * The national number as digits: separators removed, a leading "+<code>" or
 * "00<code>" for the chosen country dropped, trunk zeros dropped.
 * "+91 098765 43210" with IN -> "9876543210".
 */
export function nationalDigits(raw, iso2) {
  const country = COUNTRY_BY_ISO2.get(String(iso2 ?? "").toUpperCase());
  const typed = String(raw ?? "").trim();
  let digits = typed.replace(/\D/g, "");
  const international = typed.startsWith("+")
    ? digits
    : typed.startsWith("00")
      ? digits.slice(2)
      : null;
  if (
    country &&
    international !== null &&
    international.startsWith(country.dial)
  ) {
    digits = international.slice(country.dial.length);
  }
  return digits.replace(/^0+/, "");
}

export function validateMobileForCountry(raw, iso2, { required = true } = {}) {
  const typed = String(raw ?? "").trim();
  if (!typed) return required ? "Mobile number is required." : null;

  const country = COUNTRY_BY_ISO2.get(String(iso2 ?? "").toUpperCase());
  if (!country) return "Choose the country code for your mobile number.";
  if (/[^\d\s+().\-]/.test(typed))
    return "Use digits only in the mobile number.";

  const digits = nationalDigits(typed, country.iso2);
  if (!digits) return "Mobile number is required.";

  const maxNational = MOBILE_MAX_DIGITS - country.dial.length;
  if (digits.length > maxNational) {
    return `A mobile number has at most ${MOBILE_MAX_DIGITS} digits including the +${country.dial} code — that is ${maxNational} after it.`;
  }

  const rule = ruleFor(country);
  if (rule) {
    if (digits.length !== rule.length || !rule.first.test(digits)) {
      return `Enter a valid ${country.name} mobile number: ${rule.length} digits after +${country.dial}, e.g. ${rule.example}.`;
    }
  } else if (digits.length < 6) {
    return "That number is too short for a mobile.";
  }

  if (/^(\d)\1+$/.test(digits)) return "Enter a real mobile number.";
  return null;
}

/** "+919876543210" — the stored form — or null when the number is not valid. */
export function toE164(raw, iso2) {
  if (validateMobileForCountry(raw, iso2)) return null;
  const country = COUNTRY_BY_ISO2.get(String(iso2).toUpperCase());
  return `+${country.dial}${nationalDigits(raw, country.iso2)}`;
}
