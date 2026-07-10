import university from "@/data/university";

export default function UniversityMasterCourse() {
  const { eyebrow, heading, body, parts } = university.masterCourse;

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
      className="scroll-mt-24 bg-[#F7FAFF] py-20 md:py-24"
    >
      <div className="container-global">
        {/* Banner */}
        <div className="rounded-[1.375rem] border border-ink/16 bg-white px-6 py-12 text-center shadow-[0_4px_14px_0_rgba(0,0,0,0.09)] md:px-16">
          <p className="epm-eyebrow epm-eyebrow-normal text-brand">{eyebrow}</p>
          <h2 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-semibold text-ink md:text-[2.5rem]">
            {heading}
          </h2>
          <p className="mx-auto mt-5 max-w-4xl text-[15px] leading-7 text-[#5b6c84]">
            {body}
          </p>
        </div>

        {/* Curriculum parts */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {parts.map((part, partIndex) => (
            <article
              key={part.label}
              className="overflow-hidden rounded-[1.125rem] border border-ink/10 bg-white shadow-[0_1px_2px_0_rgba(12,30,58,0.05)]"
            >
              <header className="border-b border-ink/10 px-7 pt-7 pb-5">
                <p className="epm-eyebrow text-azure text-[11.5px]">{part.label}</p>
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
