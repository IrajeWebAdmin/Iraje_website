import Link from "next/link";

// One headline number: the label as a small eyebrow, the value
// beneath it, then an optional hint line. `value` arrives already formatted
// by the server ("1,284", "72%", "—"); this only lays it out. With `href` the
// whole tile is a link into the matching report, inside the admin panel.
// `size="sm"` is the quieter tile used for the secondary figures behind
// "more figures".
const TONES = {
  brand: "text-brand",
  ink: "text-ink",
  green: "text-[#1B8A4B]",
  amber: "text-[#B86E00]",
  red: "text-red-600",
};

export default function StatTile({
  label,
  value,
  hint,
  href,
  tone = "brand",
  size = "md",
}) {
  const small = size === "sm";
  // Most values are short figures ("1,284", "72%"), but some are names
  // ("Iraje Software (6)"). Step the size down as the text gets longer so a
  // name sits in the tile at a readable size instead of wrapping in giant type.
  const text = String(value ?? "—");
  const valueSize = small
    ? text.length > 14
      ? "text-sm"
      : "text-lg"
    : text.length > 20
      ? "text-base"
      : text.length > 10
        ? "text-lg"
        : "text-2xl";
  const body = (
    <>
      <p className="text-shuttle text-sm font-semibold">
        {label}
      </p>
      <p
        title={text}
        className={`leading-snug font-semibold break-words ${small ? "mt-1" : "mt-2"} ${valueSize} ${
          TONES[tone] ?? TONES.brand
        }`}
      >
        {value ?? "—"}
      </p>
      {hint ? <p className="text-shuttle mt-1 text-xs">{hint}</p> : null}
    </>
  );
  const base = small
    ? "border-mist bg-catskill/60 block h-full rounded-xl border px-4 py-3"
    : "border-mist block h-full rounded-2xl border bg-white px-5 py-4";

  if (href) {
    return (
      <Link href={href} className={`${base} hover:border-brand transition`}>
        {body}
      </Link>
    );
  }
  return <div className={base}>{body}</div>;
}
