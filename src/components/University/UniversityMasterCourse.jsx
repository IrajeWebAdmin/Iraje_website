import university from "@/data/university";

export default function UniversityMasterCourse() {
  const { eyebrow, heading, body, parts } = university.masterCourse;

  // "The Sovereign Key" renders as a solid blue highlight inside the heading.
  const HIGHLIGHT = "The Sovereign Key";
  const [headBefore, headAfter] = heading.split(HIGHLIGHT);

  // Modules are numbered continuously (01…18) across all four parts, so each
  // part's list starts where the previous one ended.
  const startAt = [];
  parts.reduce((acc, part, i) => {
    startAt[i] = acc;
    return acc + part.modules.length;
  }, 0);

  return (
    <section
      id="master-course"
      className="scroll-mt-24 bg-[#F7FAFF] py-15"
    >
      <div className="container-global">
        {/* Banner */}
        <div className="card-hover rounded-[1.375rem] border border-ink/16 bg-white px-6 py-12 text-center shadow-[0_4px_14px_0_rgba(0,0,0,0.09)] md:px-16">
          <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
            {eyebrow}
          </span>
          <h2 className="mx-auto mt-4 max-w-4xl epm-heading leading-[1.05] font-medium tracking-[-2px] text-black">
            {headBefore}
            <span className="box-decoration-clone rounded-xl px-3 py-1 text-[#0451CC]">
              {HIGHLIGHT}
            </span>
            {headAfter}
          </h2>
          <p className="mx-auto mt-6 max-w-5xl epm-body leading-relaxed text-[#5b6c84]">
            {body}
          </p>
        </div>

        {/* Curriculum parts */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {parts.map((part, partIndex) => (
            <article
              key={part.label}
              className="card-hover overflow-hidden rounded-[1.125rem] border border-ink/10 bg-white shadow-[0px_4px_14.4px_0px_#00000017]"
            >
              <header className="border-b border-ink/10 px-7 pt-7 pb-5">
                <p className="text-[11.5px] font-semibold uppercase tracking-[0.2em] text-azure">
                  {part.label}
                </p>
                <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-ink">
                  {part.title}
                </h3>
              </header>

              <ol className="px-7 pt-3 pb-6">
                {part.modules.map((module, mi) => {
                  const num = String(startAt[partIndex] + mi + 1).padStart(2, "0");
                  return (
                    <li
                      key={module}
                      className="flex items-start gap-4 border-b border-dashed border-ink/10 py-3 last:border-0"
                    >
                      <span className="mt-px shrink-0 font-display text-xs font-bold text-brand">
                        {num}
                      </span>
                      <span className="text-[13px] leading-6 text-[#23374f]">
                        {module}
                      </span>
                    </li>
                  );
                })}
              </ol>

              {part.note && (
                <p className="px-7 pb-7 text-[13px] leading-6 text-[#5b6c84]">
                  {part.note}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
