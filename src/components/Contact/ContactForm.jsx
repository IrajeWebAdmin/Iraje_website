"use client";

import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import HoneypotField from "@/components/HoneypotField";
import { HONEYPOT_FIELD } from "@/lib/honeypot";
import { validateEmail, validatePhone } from "@/lib/validation";

const EMPTY = {
  name: "",
  contactNo: "",
  email: "",
  message: "",
  [HONEYPOT_FIELD]: "",
};

export default function ContactForm() {
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

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-mist bg-[#F6F8FD] p-8 text-center">
        <h3 className="font-display text-2xl font-semibold text-ink">
          Thanks — we’ve got your message.
        </h3>
        <p className="mt-3 text-slate-soft">
          Our team will get back to you shortly.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-mist px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white"
        >
          Send another message
        </button>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <HoneypotField
        value={values[HONEYPOT_FIELD]}
        onChange={update(HONEYPOT_FIELD)}
      />

      <Field label="Name" error={errors.name}>
        <input
          type="text"
          name="name"
          value={values.name}
          onChange={update("name")}
          required
          autoComplete="name"
          placeholder="Your full name"
          className={inputClass(errors.name)}
        />
      </Field>

      <Field label="Contact number" error={errors.contactNo}>
        <input
          type="tel"
          name="contactNo"
          value={values.contactNo}
          onChange={update("contactNo")}
          required
          autoComplete="tel"
          placeholder="e.g. +91 98765 43210"
          className={inputClass(errors.contactNo)}
        />
      </Field>

      <Field label="Email" error={errors.email}>
        <input
          type="email"
          name="email"
          value={values.email}
          onChange={update("email")}
          required
          autoComplete="email"
          placeholder="you@company.com"
          className={inputClass(errors.email)}
        />
      </Field>

      <Field label="Message" error={errors.message}>
        <textarea
          name="message"
          value={values.message}
          onChange={update("message")}
          required
          rows={5}
          placeholder="How can we help?"
          className={`${inputClass(errors.message)} resize-y`}
        />
      </Field>

      {status === "error" && serverError && (
        <p className="text-sm text-red-600" aria-live="polite">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-2 rounded-xl bg-brand px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Send message"}
        {!submitting && <FiArrowRight className="h-4 w-4" />}
      </button>
    </form>
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
    "w-full rounded-xl border bg-white px-4 py-3 text-ink outline-none transition",
    "placeholder:text-slate-soft/70",
    "focus:border-brand focus:ring-2 focus:ring-brand/20",
    error ? "border-red-400" : "border-mist",
  ].join(" ");
}
