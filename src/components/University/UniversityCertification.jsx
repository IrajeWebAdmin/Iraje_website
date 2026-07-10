"use client";

import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import university from "@/data/university";

export default function UniversityCertification() {
  const { eyebrow, heading, body, tracks } = university.certification;
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="certification" className="scroll-mt-24 bg-white py-20 md:py-24">
      <div className="container-global">
        {/* Heading */}
        <div className="max-w-3xl">
          <p className="epm-eyebrow epm-eyebrow-normal text-brand">{eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink md:text-[2.5rem]">
            {heading}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#5b6c84]">{body}</p>
        </div>

        {/* Tab rail */}
        <div className="mt-8 flex flex-wrap gap-3">
          {tracks.map((track, index) => (
            <button
              key={track.code}
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-pressed={openIndex === index}
              className={[
                "rounded-full border px-4 py-2 text-sm font-medium transition",
                openIndex === index
                  ? "border-brand bg-brand text-white"
                  : "border-mist text-ink hover:border-brand/40 hover:bg-[#F6F8FD]",
              ].join(" ")}
            >
              {track.pill}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <div className="mt-8 divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/10">
          {tracks.map((track, index) => {
            const open = openIndex === index;
            return (
              <div key={track.code} className="bg-white">
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? -1 : index)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-4 px-6 py-5 text-left transition hover:bg-[#F7FAFF]"
                >
                  <span
                    className={[
                      "shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold",
                      track.upcoming
                        ? "bg-[#EEF1F6] text-[#5b6c84]"
                        : "bg-[#E6EDFF] text-brand",
                    ].join(" ")}
                  >
                    {track.code}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-base font-semibold text-ink">
                      {track.title}
                      {track.upcoming && (
                        <span className="ml-2 align-middle text-[11px] font-semibold uppercase tracking-wider text-[#5b6c84]">
                          · Upcoming
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-6 text-[#5b6c84]">
                      {track.summary}
                    </span>
                  </span>

                  <FiChevronDown
                    className={[
                      "h-5 w-5 shrink-0 text-[#5b6c84] transition-transform",
                      open ? "rotate-180" : "",
                    ].join(" ")}
                  />
                </button>

                {open && (
                  <div className="px-6 pb-6">
                    {track.modules.length > 0 ? (
                      <ol className="grid gap-x-10 gap-y-1 sm:grid-cols-2">
                        {track.modules.map((module, mi) => (
                          <li
                            key={module}
                            className="flex items-start gap-3 border-b border-dashed border-ink/10 py-2.5 last:border-0"
                          >
                            <span className="mt-px shrink-0 font-display text-xs font-bold text-brand">
                              {String(mi + 1).padStart(2, "0")}
                            </span>
                            <span className="text-[13px] leading-6 text-[#23374f]">
                              {module}
                            </span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="rounded-xl bg-[#F7FAFF] px-4 py-3 text-[13px] leading-6 text-[#5b6c84]">
                        {track.upcoming
                          ? "Curriculum to be announced — register your interest below and we'll notify you when enrolment opens."
                          : "Full module outline is shared on enrolment. Request this track below to receive the detailed syllabus."}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
