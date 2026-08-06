"use client";

import { useState } from "react";
import { FiMapPin, FiMail, FiPhone } from "react-icons/fi";
import { FaLinkedinIn, FaYoutube } from "react-icons/fa";
import contact from "@/data/contact";
import HoneypotField from "@/components/HoneypotField";
import { HONEYPOT_FIELD } from "@/lib/honeypot";
import { validateEmail, validatePhone } from "@/lib/validation";

const INFO_ICONS = { location: FiMapPin, email: FiMail, contact: FiPhone };
const SOCIAL_ICONS = { linkedin: FaLinkedinIn, youtube: FaYoutube };

const EMPTY = {
  name: "",
  contactNo: "",
  email: "",
  message: "",
  [HONEYPOT_FIELD]: "",
};

// Two-panel contact card: blue info panel (left) + message form (right).
// The form posts to the existing /api/contact endpoint.
export default function ContactCard() {
  const { panel, form } = contact;
  const [values, setValues] = useState(EMPTY);
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  function update(field) {
    return (e) => setValues((v) => ({ ...v, [field]: e.target.value }));
  }

  // Email and phone are checked here so a typo is caught before a round trip.
  // The API re-checks with the same validators — this is convenience, not trust.
  function validate() {
    const next = {};
    const emailError = validateEmail(values.email);
    if (emailError) next.email = emailError;
    const phoneError = validatePhone(values.contactNo);
    if (phoneError) next.contactNo = phoneError;
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
      const res = await fetch("/api/contact", {
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
    <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-[0px_20px_60px_-24px_rgba(4,41,102,0.35)] lg:grid-cols-2">
      {/* Left: info panel */}
      <div className="bg-[linear-gradient(180deg,#0451CC_0%,#022966_100%)] p-10 text-white md:p-12">
        <h2 className="text-3xl font-bold leading-tight md:text-[2rem]">
          {panel.heading}
        </h2>

        <div className="mt-10 space-y-7">
          {panel.info.map((item) => {
            const Icon = INFO_ICONS[item.icon] ?? FiMail;
            return (
              <div key={item.label} className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-brand">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-semibold leading-tight">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-sm text-white/70">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        <hr className="my-9 border-white/20" />

        <p className="text-lg font-semibold">{panel.followLabel}</p>
        <div className="mt-4 flex gap-3">
          {panel.socials.map((s) => {
            const Icon = SOCIAL_ICONS[s.icon] ?? FaLinkedinIn;
            return (
              <a
                key={s.icon}
                href={s.href}
                aria-label={s.label}
                // These leave the site, so they open in a new tab and drop the
                // opener reference along the way.
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand transition hover:bg-white/90"
              >
                <Icon className="h-4 w-4" />
              </a>
            );
          })}
        </div>
      </div>

      {/* Right: message form */}
      <div className="p-10 md:p-12">
        <h2 className="text-2xl font-bold text-ink md:text-3xl">
          {form.heading}
        </h2>

        {status === "success" ? (
          <div className="mt-8 rounded-2xl border border-mist bg-[#F6F8FD] p-8 text-center">
            <h3 className="font-display text-xl font-semibold text-ink">
              Thanks — we&apos;ve got your message.
            </h3>
            <p className="mt-3 text-slate-soft">
              Our team will get back to you shortly.
            </p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-mist px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
            <HoneypotField
              value={values[HONEYPOT_FIELD]}
              onChange={update(HONEYPOT_FIELD)}
            />

            <Field label="Name" error={errors.name}>
              <input
                type="text"
                value={values.name}
                onChange={update("name")}
                autoComplete="name"
                className={inputClass(errors.name)}
              />
            </Field>

            <Field label="Contact NO." error={errors.contactNo}>
              <input
                type="tel"
                value={values.contactNo}
                onChange={update("contactNo")}
                autoComplete="tel"
                className={inputClass(errors.contactNo)}
              />
            </Field>

            <Field label="Email Address" error={errors.email}>
              <input
                type="email"
                value={values.email}
                onChange={update("email")}
                autoComplete="email"
                className={inputClass(errors.email)}
              />
            </Field>

            <Field label="How can we help?" error={errors.message}>
              <textarea
                value={values.message}
                onChange={update("message")}
                rows={4}
                className={`${inputClass(errors.message)} resize-y`}
              />
            </Field>

            {status === "error" && serverError && (
              <p className="text-sm text-red-600" aria-live="polite">
                {serverError}
              </p>
            )}

            <div className="pt-2 text-center">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-md bg-brand px-16 py-3 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Sending…" : form.submitLabel}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  );
}

function inputClass(error) {
  return [
    "w-full rounded-lg border bg-[#EEF2FB] px-4 py-3 text-ink outline-none transition",
    "placeholder:text-slate-400",
    "focus:border-brand focus:ring-2 focus:ring-brand/15",
    error ? "border-red-400" : "border-transparent",
  ].join(" ");
}
