// The small white card the password pages share (change, forgot and reset):
// an icon badge, a title with one word in italic blue, an intro line, then
// whatever the page puts inside. `icon` is a react-icons component.
export default function AuthCard({
  icon: Icon,
  tone = "bg-periwinkle text-brand",
  title,
  accent,
  intro,
  children,
}) {
  return (
    <div className="border-mist/60 mx-auto w-full max-w-[400px] rounded-3xl border bg-white p-7 shadow-[0_24px_60px_-28px_rgba(12,30,58,0.28)] sm:p-8">
      <span
        aria-hidden="true"
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <h1 className="font-display text-ink mt-5 text-[26px] leading-tight font-bold tracking-tight">
        {title} <span className="text-brand font-medium italic">{accent}</span>
      </h1>
      {intro ? (
        <p className="text-shuttle mt-2 text-sm leading-relaxed">{intro}</p>
      ) : null}
      {children}
    </div>
  );
}
