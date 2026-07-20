import { FiEye, FiMonitor, FiStar, FiMapPin, FiCheck } from "react-icons/fi";
import university from "@/data/university";

// Item icons keyed by title, matching the design.
const ITEM_ICONS = {
  "Online Training Programs": FiEye,
  "Classroom Training Programs": FiMonitor,
  "Masterclass Trainings": FiStar,
  "Onsite Training": FiMapPin,
};

export default function UniversityFormats() {
  const { eyebrow, heading, body, groups } = university.formats;

  return (
    <section className="bg-[#EEF4FF] py-15">
      <div className="container-global">
        {/* Heading */}
        <div className="mx-auto max-w-6xl text-center">
          <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
            {eyebrow}
          </span>
          <h2 className="mx-auto mt-4 max-w-6xl epm-heading leading-[1.05] font-medium tracking-[-2px] text-black lg:whitespace-nowrap">
            {heading}
          </h2>
          <p className="mx-auto mt-6 max-w-3xl epm-body leading-relaxed text-[#5b6c84]">
            {body}
          </p>
        </div>

        {/* Program columns — span the full container-global width. */}
        <div className="mt-12 grid gap-10 md:grid-cols-2">
          {groups.map((group) => (
            <article
              key={group.title}
              className="flex min-h-140 flex-col rounded-2xl border border-ink/10 bg-white p-8 shadow-[0px_1px_2px_0px_#0C1E3A0D]"
            >
              <p className=" text-azure text-base uppercase ">{group.label}</p>
              <h3 className="mt-3 font-display text-2xl font-semibold text-ink">
                {group.title}
              </h3>

              <ul className="mt-6">
                {group.items.map((item) => {
                  const Icon = ITEM_ICONS[item.title] ?? FiCheck;
                  return (
                    <li
                      key={item.title}
                      className="flex items-start gap-4 border-b border-ink/10 py-4 first:pt-0 last:border-b-0 last:pb-0"
                    >
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E6EDFF] text-brand">
                        <Icon className="h-6 w-6" />
                      </span>
                      <span>
                        <span className="block  text-xl font-semibold text-ink">{item.title}</span>
                        <span className="mt-0.5 block text-[15px] leading-6 text-[#5b6c84]">
                          {item.desc}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>

              {group.note && (
                <p className="mt-8 border-t border-ink/10 pt-6 text-[15px] leading-6 text-[#5b6c84]">
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
