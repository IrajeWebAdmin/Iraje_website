// The bordered panel shared by the Authentication and Governance sections
// ("div.panel" in Figma): a hairline card with a small, wide-tracked uppercase
// eyebrow above its content. Only the ground differs between the two — the
// sign-in ladder sits on white, the auditor's report list on Catskill White.
export default function IamPanel({
  eyebrow,
  eyebrowClassName = "text-[11.5px] tracking-[1.84px] text-denim",
  className = "bg-white",
  children,
}) {
  return (
    <div className={`rounded-md border border-botticelli p-7 ${className}`}>
      <p className={`uppercase ${eyebrowClassName}`}>{eyebrow}</p>
      <div className="mt-4.5">{children}</div>
    </div>
  );
}
