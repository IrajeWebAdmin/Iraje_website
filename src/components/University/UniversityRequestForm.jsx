"use client";

import { useState } from "react";
import { FiArrowRight, FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import university from "@/data/university";
import HoneypotField from "@/components/HoneypotField";
import { HONEYPOT_FIELD } from "@/lib/honeypot";
import { validateBusinessEmail, validateMobile } from "@/lib/validation";

const { eyebrow, heading, body, contact, audiences, courses, deliveryFormats } =
  university.request;

const CONTACT_ICONS = { mail: FiMail, phone: FiPhone, map: FiMapPin };

const EMPTY = {
  fname: "",
  email: "",
  org: "",
  phone: "",
  audience: "",
  course: "",
  format: "",
  msg: "",
  [HONEYPOT_FIELD]: "",
};

export default function UniversityRequestForm() {
  const [values, setValues] = useState(EMPTY);
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  function update(field) {
    return (e) => setValues((v) => ({ ...v, [field]: e.target.value }));
  }

  function validate() {
    const next = {};
    if (!values.fname.trim()) next.fname = "Your name is required.";

    // The field asks for a WORK email, so a personal or throwaway address is
    // rejected the same way the certification enrolment form does it.
    if (!values.email.trim()) next.email = "A work email is required.";
    else {
      const emailError = validateBusinessEmail(values.email);
      if (emailError) next.email = emailError;
    }

    // Phone is optional on this form, but must be valid when one is given.
    const phoneError = validateMobile(values.phone, { required: false });
    if (phoneError) next.phone = phoneError;

    if (!values.audience) next.audience = "Please tell us who you are.";
    if (!values.course) next.course = "Please choose a course.";
    return next;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrors({});
    setServerError("");

    // No dedicated training table yet — capture the lead through the existing
    // contact pipeline, folding the structured fields into the message body.
    const message = [
      `Organisation: ${values.org.trim() || "—"}`,
      `I am a: ${values.audience}`,
      `Course of interest: ${values.course}`,
      `Preferred delivery format: ${values.format || "No preference"}`,
      "",
      values.msg.trim() || "(no additional notes)",
    ].join("\n");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Tells the API to apply the work-email / mobile rules this form
          // enforces in the browser, rather than the looser Contact Us ones.
          source: "university",
          name: values.fname,
          email: values.email,
          // Left empty when not given — "Not provided" is not a phone number
          // and no longer passes validation.
          contactNo: values.phone.trim(),
          message,
          [HONEYPOT_FIELD]: values[HONEYPOT_FIELD],
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.errors) {
          // Map API field names back onto this form's fields.
          setErrors({
            fname: data.errors.name,
            email: data.errors.email,
            phone: data.errors.contactNo,
          });
        }
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
    <section id="request" className="scroll-mt-24 bg-white py-20 md:py-24">
      <div className="container-global">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
          {/* Info panel */}
          <div>
            <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
              {eyebrow}
            </span>
            <h2 className="mt-4 epm-heading leading-[1.05] font-medium tracking-[-2px] text-black">
              {heading}
            </h2>
            <p className="mt-6 max-w-md epm-body leading-relaxed text-[#5b6c84]">
              {body}
            </p>

            <ul className="mt-8 space-y-4">
              {contact.map((item) => {
                const Icon = CONTACT_ICONS[item.icon] ?? FiMail;
                return (
                  <li key={item.text} className="flex items-center gap-3 text-ink">
                    <Icon className="h-5 w-5 shrink-0 text-brand" />
                    <span className="text-sm">{item.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Form card */}
          {status === "success" ? (
            <div className="flex flex-col justify-center rounded-2xl border border-mist bg-[#F7FAFF] p-10 text-center">
              <h3 className="font-display text-2xl font-semibold text-ink">
                Request received — thank you.
              </h3>
              <p className="mt-3 text-[#5b6c84]">
                Our academy team will follow up within 1–2 business days with
                schedules, formats and enrolment details.
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-mist bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white/70"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-2xl border border-ink/10 bg-white p-8 shadow-[0px_16px_40px_-24px_#0C1E3A47,0px_1px_2px_0px_#0C1E3A0D] md:p-10"
            >
              <HoneypotField
                value={values[HONEYPOT_FIELD]}
                onChange={update(HONEYPOT_FIELD)}
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Full name" required error={errors.fname}>
                  <input
                    type="text"
                    value={values.fname}
                    onChange={update("fname")}
                    autoComplete="name"
                    placeholder="Jane Doe"
                    className={inputClass(errors.fname)}
                  />
                </Field>
                <Field label="Work email" required error={errors.email}>
                  <input
                    type="email"
                    value={values.email}
                    onChange={update("email")}
                    autoComplete="email"
                    placeholder="jane@company.com"
                    className={inputClass(errors.email)}
                  />
                </Field>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <Field label="Organisation">
                  <input
                    type="text"
                    value={values.org}
                    onChange={update("org")}
                    autoComplete="organization"
                    placeholder="Company / institution"
                    className={inputClass()}
                  />
                </Field>
                <Field label="Phone" error={errors.phone}>
                  <input
                    type="tel"
                    value={values.phone}
                    onChange={update("phone")}
                    autoComplete="tel"
                    placeholder="+91 ..."
                    className={inputClass(errors.phone)}
                  />
                </Field>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <Field label="I am a" required error={errors.audience}>
                  <Select
                    value={values.audience}
                    onChange={update("audience")}
                    placeholder="Select…"
                    options={audiences}
                    invalid={errors.audience}
                  />
                </Field>
                <Field label="Course of interest" required error={errors.course}>
                  <Select
                    value={values.course}
                    onChange={update("course")}
                    placeholder="Select…"
                    options={courses}
                    invalid={errors.course}
                  />
                </Field>
              </div>

              <div className="mt-6">
                <Field label="Preferred delivery format">
                  <Select
                    value={values.format}
                    onChange={update("format")}
                    placeholder="No preference"
                    options={deliveryFormats}
                  />
                </Field>
              </div>

              <div className="mt-6">
                <Field label="Anything else we should know?">
                  <textarea
                    value={values.msg}
                    onChange={update("msg")}
                    rows={5}
                    placeholder="Team size, timelines, specific goals…"
                    className={`${inputClass()} resize-y`}
                  />
                </Field>
              </div>

              {status === "error" && serverError && (
                <p className="mt-4 text-sm text-red-600" aria-live="polite">
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-7 py-4 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Submit training request"}
                {!submitting && <FiArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({ label, required, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-brand"> *</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  );
}

function Select({ value, onChange, placeholder, options, invalid }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`${inputClass(invalid)} appearance-none bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10 ${
        value ? "text-ink" : "text-slate-soft/80"
      }`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%235b6c84' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
      }}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt} value={opt} className="text-ink">
          {opt}
        </option>
      ))}
    </select>
  );
}

function inputClass(error) {
  return [
    "w-full rounded-xl border bg-[#F4F6FB] px-4 py-3.5 text-ink outline-none transition",
    "placeholder:text-slate-soft/70",
    "focus:border-brand focus:ring-2 focus:ring-brand/20",
    error ? "border-red-400" : "border-mist",
  ].join(" ");
}
