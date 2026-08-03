"use client";

import { useState } from "react";
import certification from "@/data/certification";
import HoneypotField from "@/components/HoneypotField";
import { HONEYPOT_FIELD } from "@/lib/honeypot";
import { validateBusinessEmail, validateMobile } from "@/lib/validation";

const { detailStep, backgroundStep, certStep } = certification.enroll;
const ALL_FIELDS = [...detailStep.fields, ...backgroundStep.fields];

// Every field starts empty; `name` on each data field is the submitted key.
const EMPTY = {
  ...Object.fromEntries(ALL_FIELDS.map((f) => [f.name, ""])),
  certifications: [],
  [HONEYPOT_FIELD]: "",
};

// Enroll: registration request form. Left column = pitch + "what happens
// next" note; right column = the form card (personal details, professional
// background, certification picker, submit). Posts to /api/enroll, which
// stores the request and emails the team.
function Field({ field, value, onChange, error }) {
  const cls = [
    "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition",
    "focus:border-brand focus:ring-2 focus:ring-brand/20",
    error ? "border-red-400" : "border-mist",
  ].join(" ");

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-ink">
        {field.label}
        {field.required && <span className="text-brand"> *</span>}
      </label>
      {field.type === "select" ? (
        <select
          value={value}
          onChange={onChange}
          className={`${cls} appearance-none ${value ? "text-ink" : "text-slate-soft"}`}
        >
          <option value="" disabled>
            {field.placeholder}
          </option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt} className="text-ink">
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={field.type || "text"}
          value={value}
          onChange={onChange}
          placeholder={field.placeholder}
          className={cls}
        />
      )}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </div>
  );
}

function StepLabel({ children }) {
  return (
    <p className="text-xs font-semibold tracking-[0.14em] text-brand uppercase">{children}</p>
  );
}

export default function CertEnroll() {
  const { eyebrow, heading, intro, submit, note } = certification.enroll;

  const [values, setValues] = useState(EMPTY);
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  function update(field) {
    return (e) => setValues((v) => ({ ...v, [field]: e.target.value }));
  }

  function toggleCert(code) {
    setValues((v) => ({
      ...v,
      certifications: v.certifications.includes(code)
        ? v.certifications.filter((c) => c !== code)
        : [...v.certifications, code],
    }));
  }

  // Mirrors the checks in /api/enroll so a mistake is caught before a round
  // trip. The API re-checks everything — this is convenience, not trust.
  function validate() {
    const next = {};
    if (!values.name.trim()) next.name = "Full name is required.";

    const emailError = validateBusinessEmail(values.email);
    if (emailError) next.email = emailError;

    const mobileError = validateMobile(values.mobile);
    if (mobileError) next.mobile = mobileError;

    if (!values.organization.trim())
      next.organization = "Organization is required.";
    if (!values.country.trim()) next.country = "Country is required.";
    if (values.certifications.length === 0)
      next.certifications = "Select at least one certification.";

    return next;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setServerError("Please fix the highlighted fields.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrors({});
    setServerError("");

    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        setServerError(data.error || "Please fix the highlighted fields.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setValues(EMPTY);
    } catch {
      setServerError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  const submitting = status === "submitting";

  return (
    <section id="enroll" className="bg-[#fff] py-15">
      <div className="container-global">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          {/* Pitch */}
          <div className="lg:pt-6">
            <p className="epm-eyebrow epm-eyebrow-normal font-semibold text-brand">{eyebrow}</p>
            <h2 className="epm-heading mt-4 font-display leading-[1.12] font-medium">
              {heading}
            </h2>
            <p className="epm-body mt-5 max-w-xl leading-relaxed text-[#8E8E93]">{intro}</p>

            <div className="mt-8 max-w-md rounded-2xl border border-mist bg-[#E8F5FC] p-5">
              <p className="text-sm leading-relaxed text-black">
                <span className="font-semibold text-ink">What happens next? </span>
                {note.replace("What happens next? ", "")}
              </p>
            </div>
          </div>

          {/* Form card */}
          <div className="card-hover rounded-3xl border border-mist bg-white p-8 shadow-[0px_24px_60px_-32px_rgba(4,81,204,0.4)]">
            {status === "success" ? (
              <div className="flex min-h-100 flex-col items-center justify-center text-center">
                <h3 className="font-display text-2xl font-semibold text-ink">
                  Request received — thank you.
                </h3>
                <p className="mt-3 max-w-sm text-slate-soft">
                  Our team will review your registration and email your login
                  details once it is approved.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-mist px-6 py-3 text-sm font-semibold text-ink transition hover:bg-[#F6F8FD]"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <HoneypotField
                  value={values[HONEYPOT_FIELD]}
                  onChange={update(HONEYPOT_FIELD)}
                />

                {/* Step 1 — details */}
                <StepLabel>{detailStep.label}</StepLabel>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {detailStep.fields.map((f) => (
                    <Field
                      key={f.name}
                      field={f}
                      value={values[f.name]}
                      onChange={update(f.name)}
                      error={errors[f.name]}
                    />
                  ))}
                </div>

                <hr className="my-7 border-mist" />

                {/* Professional background */}
                <StepLabel>{backgroundStep.label}</StepLabel>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {backgroundStep.fields.map((f) => (
                    <Field
                      key={f.name}
                      field={f}
                      value={values[f.name]}
                      onChange={update(f.name)}
                      error={errors[f.name]}
                    />
                  ))}
                </div>

                <hr className="my-7 border-mist" />

                {/* Step 2 — choose certifications */}
                <StepLabel>
                  {certStep.label}
                  {certStep.required && <span className="text-brand"> *</span>}
                </StepLabel>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {certStep.options.map((opt) => {
                    const checked = values.certifications.includes(opt.code);
                    return (
                      <label
                        key={opt.code}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border bg-white px-4 py-3 transition hover:border-brand ${
                          checked ? "border-brand" : "border-mist"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCert(opt.code)}
                          className="h-4 w-4 shrink-0 accent-brand"
                        />
                        <span className="flex flex-col">
                          <span className="text-sm font-semibold text-ink">{opt.code}</span>
                          <span className="text-xs text-slate-soft">{opt.level}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
                {errors.certifications && (
                  <p className="mt-2 text-xs text-red-600">{errors.certifications}</p>
                )}

                {status === "error" && serverError && (
                  <p className="mt-5 text-sm text-red-600" aria-live="polite">
                    {serverError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-8 w-full rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Submitting…" : submit}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
