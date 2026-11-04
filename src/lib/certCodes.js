// Certification codes appear in several spellings in requests — "PAM 101",
// "CyberTantra 101", "CT201" — but Sanity and every learning table use the
// canonical form "PAM101". Everything that stores or compares a code goes
// through normalizeCertCode() first.

const ALIASES = { CYBERTANTRA: "CT" };

// CyberTantra used to be two certifications (CT101, CT201); since 2026-10-17
// it is one, CT100. Old requests that name either old code count as CT100.
const RETIRED = { CT101: "CT100", CT201: "CT100", CYBERTANTRA: "CT100" };

/** "PAM 101" -> "PAM101", "CyberTantra 101" / "CT201" / "CyberTantra" -> "CT100". */
export function normalizeCertCode(raw) {
  const compact = String(raw ?? "")
    .toUpperCase()
    .replace(/[\s_-]+/g, "");
  if (RETIRED[compact]) return RETIRED[compact];
  const match = compact.match(/^([A-Z]+)(\d{3})$/);
  if (!match) return null;
  const [, letters, digits] = match;
  const code = (ALIASES[letters] ?? letters) + digits;
  return RETIRED[code] ?? code;
}

/** "PAM 101, EPM 201, CyberTantra 101" -> ["PAM101", "EPM201", "CT100"] */
export function parseCertList(value) {
  const codes = String(value ?? "")
    .split(",")
    .map(normalizeCertCode)
    .filter(Boolean);
  return [...new Set(codes)];
}

/** "PAM101" -> "PAM 101" for display only; anything unrecognised comes back as is. */
export function displayCertCode(code) {
  return String(code ?? "").replace(/^([A-Z]+)(\d+)$/i, "$1 $2");
}
