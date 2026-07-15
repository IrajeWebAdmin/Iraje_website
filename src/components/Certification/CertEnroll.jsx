import certification from "@/data/certification";

// Enroll: registration request form. Left column = pitch + "what happens
// next" note; right column = the form card (personal details, professional
// background, certification picker, submit). Presentational for now — inputs
// are native/uncontrolled and submit is inert until wired to a backend.
function Field({ field }) {
  const label = (
    <label className="mb-1.5 block text-xs font-semibold text-ink">
      {field.label}
      {field.required && <span className="text-brand"> *</span>}
    </label>
  );
  const cls =
    "w-full rounded-xl border border-mist bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <div>
      {label}
      {field.type === "select" ? (
        <select className={`${cls} appearance-none text-slate-soft`} defaultValue="">
          <option value="" disabled>
            {field.placeholder}
          </option>
        </select>
      ) : (
        <input type={field.type || "text"} placeholder={field.placeholder} className={cls} />
      )}
    </div>
  );
}

function StepLabel({ children }) {
  return (
    <p className="text-xs font-semibold tracking-[0.14em] text-brand uppercase">{children}</p>
  );
}

export default function CertEnroll() {
  const { eyebrow, heading, intro, detailStep, backgroundStep, certStep, submit, note } =
    certification.enroll;

  return (
    <section id="enroll" className="bg-[#fff] py-15">
      <div className="container-global">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          {/* Pitch */}
          <div className="lg:pt-6">
            <p className="epm-eyebrow epm-eyebrow-normal font-semibold text-brand">{eyebrow}</p>
            <h2 className="epm-heading mt-4 font-display leading-[1.12] font-semibold">
              {heading}
            </h2>
            <p className="epm-body mt-5 max-w-md leading-relaxed text-slate-soft">{intro}</p>

            <div className="mt-8 max-w-md rounded-2xl border border-mist bg-[#E8F5FC] p-5">
              <p className="text-sm leading-relaxed text-black">
                <span className="font-semibold text-ink">What happens next? </span>
                {note.replace("What happens next? ", "")}
              </p>
            </div>
          </div>

          {/* Form card */}
          <div className="rounded-3xl border border-mist bg-white p-8 shadow-[0px_24px_60px_-32px_rgba(4,81,204,0.4)]">
            {/* Step 1 — details */}
            <StepLabel>{detailStep.label}</StepLabel>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {detailStep.fields.map((f) => (
                <Field key={f.label} field={f} />
              ))}
            </div>

            <hr className="my-7 border-mist" />

            {/* Professional background */}
            <StepLabel>{backgroundStep.label}</StepLabel>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {backgroundStep.fields.map((f) => (
                <Field key={f.label} field={f} />
              ))}
            </div>

            <hr className="my-7 border-mist" />

            {/* Step 2 — choose certifications */}
            <StepLabel>
              {certStep.label}
              {certStep.required && <span className="text-brand"> *</span>}
            </StepLabel>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {certStep.options.map((opt) => (
                <label
                  key={opt.code}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-mist bg-white px-4 py-3 transition hover:border-brand"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 shrink-0 accent-brand"
                  />
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold text-ink">{opt.code}</span>
                    <span className="text-xs text-slate-soft">{opt.level}</span>
                  </span>
                </label>
              ))}
            </div>

            <button
              type="button"
              className="mt-8 w-full rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand/90"
            >
              {submit}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
