import { FiCheck } from "react-icons/fi";
import university from "@/data/university";

export default function UniversityFormats() {
  const { eyebrow, heading, body, groups } = university.formats;

  return (
    <section className="bg-[#EEF4FF] py-20 md:py-24">
      <div className="container-global">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="epm-eyebrow epm-eyebrow-normal text-brand">{eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink md:text-[2.5rem]">
            {heading}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#5b6c84]">{body}</p>
        </div>

        {/* Program columns */}
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
          {groups.map((group) => (
            <article
              key={group.title}
              className="flex flex-col rounded-2xl border border-ink/10 bg-white p-8 shadow-[0_1px_2px_0_rgba(12,30,58,0.05)]"
            >
              <p className="epm-eyebrow text-azure text-[11.5px]">{group.label}</p>
              <h3 className="mt-3 font-display text-xl font-semibold text-ink">
                {group.title}
              </h3>

              <ul className="mt-6 space-y-5">
                {group.items.map((item) => (
                  <li key={item.title} className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E6EDFF] text-brand">
                      <FiCheck className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block font-medium text-ink">{item.title}</span>
                      <span className="mt-0.5 block text-[13px] leading-6 text-[#5b6c84]">
                        {item.desc}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              {group.note && (
                <p className="mt-auto pt-6 text-[13px] leading-6 text-[#5b6c84]">
                  {group.note}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
