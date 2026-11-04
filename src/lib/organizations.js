// Organisation names are typed by hand on the enrol form, so "Infosys",
// "Infosys Ltd." and "INFOSYS, Limited" arrive as three different strings.
// organizationKey() reduces them to one key that reports group by. Pure, no
// imports: the enrol API, the backfill script and the report queries all use it.

// Legal suffixes dropped from the END of the name only, one at a time, so
// "Tata Co-operative" keeps its "co" and "Infosys Pvt Ltd" loses both words.
const SUFFIXES = new Set([
  "private",
  "pvt",
  "limited",
  "ltd",
  "llp",
  "llc",
  "inc",
  "incorporated",
  "corp",
  "corporation",
  "co",
  "company",
  "plc",
  "gmbh",
  "pte",
  "bv",
  "ag",
  "sa",
]);

export const ORGANIZATION_KEY_MAX = 150;

/**
 * "  Infosys Ltd. " -> "infosys", "Tata Consultancy Services" ->
 * "tata consultancy services", "AT&T Inc" -> "at and t". Lower-case, accents
 * and punctuation removed, a leading "the" and trailing legal suffixes dropped.
 * Never empty: falls back to the trimmed lower-case input, then "unknown".
 */
export function organizationKey(raw) {
  const cleaned = String(raw ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const words = cleaned.split(" ").filter(Boolean);
  if (words.length > 1 && words[0] === "the") words.shift();
  while (words.length > 1 && SUFFIXES.has(words[words.length - 1])) words.pop();
  const key = words.join(" ");
  const fallback = String(raw ?? "").trim().toLowerCase();
  return (key || fallback || "unknown").slice(0, ORGANIZATION_KEY_MAX);
}
