"use client";

import { useEffect, useState } from "react";
import certification from "@/data/certification";
import { COUNTRIES, COUNTRY_BY_ISO2, COUNTRY_BY_NAME } from "@/data/countries";
import HoneypotField from "@/components/HoneypotField";
import { HONEYPOT_FIELD } from "@/lib/honeypot";
import { validateBusinessEmail } from "@/lib/validation";
import {
  MOBILE_MAX_DIGITS,
  formatPersonName,
  validateCountryName,
  validateMobileForCountry,
  validatePersonName,
} from "@/lib/enrollValidation";

const { detailStep, backgroundStep, certStep } = certification.enroll;
const ALL_FIELDS = [...detailStep.fields, ...backgroundStep.fields];
const DEFAULT_DIAL_COUNTRY = "IN";

// Set to false to reopen enrollment. While true the whole form is disabled:
// every input, select, checkbox and the submit button.
const FORM_DISABLED = false;
//form should not be disable samjhe kaushal sir ky pagal jaise kaam karte ghooo

// Every field starts empty; `name` on each data field is the submitted key.
// `mobileCountry` is the ISO code behind the dialling-code picker — the API
// joins it with `mobile` into one international number.
const EMPTY = {
  ...Object.fromEntries(ALL_FIELDS.map((f) => [f.name, ""])),
  mobileCountry: DEFAULT_DIAL_COUNTRY,
  certifications: [],
  [HONEYPOT_FIELD]: "",
};

const INPUT =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";
const edge = (error) => (error ? "border-red-400" : "border-mist");

function Label({ field }) {
  return (
    <label className="text-ink mb-1.5 block text-xs font-semibold">
      {field.label}
      {field.required && <span className="text-brand"> *</span>}
    </label>
  );
}

function FieldError({ children }) {
  return children ? (
    <span className="mt-1 block text-xs text-red-600">{children}</span>
  ) : null;
}

// Text / email / select fields, driven by data/certification.js.
function Field({ field, value, onChange, onBlur, error }) {
  const cls = `${INPUT} ${edge(error)}`;
  return (
    <div>
      <Label field={field} />
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
          onBlur={onBlur}
          placeholder={field.placeholder}
          className={cls}
        />
      )}
      <FieldError>{error}</FieldError>
    </div>
  );
}

// Country: every country, by name.
function CountryField({ field, value, onChange, error }) {
  return (
    <div>
      <Label field={field} />
      <select
        value={value}
        onChange={onChange}
        className={`${INPUT} ${edge(error)} appearance-none ${value ? "text-ink" : "text-slate-soft"}`}
      >
        <option value="" disabled>
          {field.placeholder}
        </option>
        {COUNTRIES.map((c) => (
          <option key={c.iso2} value={c.name} className="text-ink">
            {c.name}
          </option>
        ))}
      </select>
      <FieldError>{error}</FieldError>
    </div>
  );
}

// Mobile: dialling-code picker + national number, 15 digits in total at most.
function MobileField({
  field,
  country,
  number,
  onCountryChange,
  onNumberChange,
  error,
}) {
  const dial = COUNTRY_BY_ISO2.get(country)?.dial ?? "";
  const maxNational = MOBILE_MAX_DIGITS - dial.length;
  return (
    <div>
      <Label field={field} />
      <div
        className={`focus-within:border-brand focus-within:ring-brand/20 flex overflow-hidden rounded-xl border bg-white transition focus-within:ring-2 ${edge(error)}`}
      >
        <select
          aria-label="Country calling code"
          value={country}
          onChange={onCountryChange}
          className="border-mist text-ink w-28 shrink-0 appearance-none border-r bg-[#F6F8FD] px-3 py-2.5 text-sm outline-none"
        >
          {COUNTRIES.map((c) => (
            <option key={c.iso2} value={c.iso2}>
              {c.iso2} +{c.dial}
            </option>
          ))}
        </select>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={number}
          onChange={onNumberChange}
          placeholder={field.placeholder}
          maxLength={maxNational + 4}
          className="text-ink w-full px-3.5 py-2.5 text-sm outline-none"
        />
      </div>
      <p className="text-slate-soft mt-1 text-[11px]">
        Up to {maxNational} digits after +{dial}.
      </p>
      <FieldError>{error}</FieldError>
    </div>
  );
}

function StepLabel({ children }) {
  return (
    <p className="text-brand text-xs font-semibold tracking-[0.14em] uppercase">
      {children}
    </p>
  );
}

// Enroll: registration request form. Left column = pitch + "what happens
// next" note; right column = the form card (personal details, professional
// background, certification picker, submit). Posts to /api/enroll, which
// stores the request and emails the team.
export default function CertEnroll() {
  const { eyebrow, heading, intro, submit, note } = certification.enroll;

  const [values, setValues] = useState(EMPTY);
  const [dialTouched, setDialTouched] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  // Arriving from the dashboard's "Request access" (?enroll=PAM201): pick that
  // certification in the form.
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("enroll");
    if (code && certStep.options.some((o) => o.code === code)) {
      setValues((v) => ({ ...v, certifications: [code] }));
    }
  }, []);

  function update(field) {
    return (e) => setValues((v) => ({ ...v, [field]: e.target.value }));
  }

  // Full name is kept in Pascal case ("John Smith"); tidy it when the field loses focus.
  function tidyName() {
    setValues((v) => ({ ...v, name: formatPersonName(v.name) }));
  }

  // Choosing a country also sets the dialling code, until the picker is changed by hand.
  function changeCountry(e) {
    const name = e.target.value;
    const iso2 = COUNTRY_BY_NAME.get(name)?.iso2;
    setValues((v) => ({
      ...v,
      country: name,
      mobileCountry: !dialTouched && iso2 ? iso2 : v.mobileCountry,
    }));
  }

  function changeDial(e) {
    setDialTouched(true);
    setValues((v) => ({ ...v, mobileCountry: e.target.value }));
  }

  // Digits and the usual separators only; everything else is dropped as typed.
  function changeMobile(e) {
    const clean = e.target.value.replace(/[^\d\s()+\-]/g, "");
    setValues((v) => ({ ...v, mobile: clean }));
  }

  // One certification per request.
  function chooseCert(code) {
    setValues((v) => ({ ...v, certifications: [code] }));
  }

  // Mirrors the checks in /api/enroll so a mistake is caught before a round
  // trip. The API re-checks everything — this is convenience, not trust.
  function validate() {
    const next = {};
    const nameError = validatePersonName(values.name);
    if (nameError) next.name = nameError;

    const emailError = validateBusinessEmail(values.email);
    if (emailError) next.email = emailError;

    const mobileError = validateMobileForCountry(
      values.mobile,
      values.mobileCountry,
    );
    if (mobileError) next.mobile = mobileError;

    if (!values.organization.trim())
      next.organization = "Organization is required.";

    const countryError = validateCountryName(values.country);
    if (countryError) next.country = countryError;

    if (values.certifications.length !== 1)
      next.certifications = "Select the certification you want to request.";

    return next;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (FORM_DISABLED) return;

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
        body: JSON.stringify({
          ...values,
          name: formatPersonName(values.name),
        }),
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
      setDialTouched(false);
    } catch {
      setServerError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  const submitting = status === "submitting";

  // Submit stays disabled until every required field has a value and at least
  // one certification is picked. Format checks (email, mobile) still run in
  // validate() on submit.
  const incomplete =
    ALL_FIELDS.some((f) => f.required && !values[f.name].trim()) ||
    (certStep.required && values.certifications.length === 0);

  return (
    <section id="enroll" className="bg-[#fff] py-15">
      <div className="container-global">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          {/* Pitch */}
          <div className="lg:pt-6">
            <p className="epm-eyebrow epm-eyebrow-normal text-brand font-semibold">
              {eyebrow}
            </p>
            <h2 className="epm-heading font-display mt-4 leading-[1.12] font-medium">
              {heading}
            </h2>
            <p className="epm-body mt-5 max-w-xl leading-relaxed text-[#8E8E93]">
              {intro}
            </p>

            <div className="border-mist mt-8 max-w-md rounded-2xl border bg-[#E8F5FC] p-5">
              <p className="text-sm leading-relaxed text-black">
                <span className="text-ink font-semibold">
                  What happens next?{" "}
                </span>
                {note.replace("What happens next? ", "")}
              </p>
            </div>
          </div>

          {/* Form card */}
          <div className="card-hover border-mist rounded-3xl border bg-white p-8 shadow-[0px_24px_60px_-32px_rgba(4,81,204,0.4)]">
            {status === "success" ? (
              <div className="flex min-h-100 flex-col items-center justify-center text-center">
                <h3 className="font-display text-ink text-2xl font-semibold">
                  Request received — thank you.
                </h3>
                <p className="text-slate-soft mt-3 max-w-sm">
                  Our team will review your registration and email your login
                  details once it is approved.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="border-mist text-ink mt-6 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition hover:bg-[#F6F8FD]"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {/* `disabled` on a fieldset disables every control inside it. */}
                <fieldset
                  disabled={FORM_DISABLED}
                  className="min-w-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <HoneypotField
                    value={values[HONEYPOT_FIELD]}
                    onChange={update(HONEYPOT_FIELD)}
                  />

                  {/* Step 1 — details */}
                  <StepLabel>{detailStep.label}</StepLabel>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {detailStep.fields.map((f) => {
                      if (f.type === "country") {
                        return (
                          <CountryField
                            key={f.name}
                            field={f}
                            value={values.country}
                            onChange={changeCountry}
                            error={errors.country}
                          />
                        );
                      }
                      if (f.type === "tel") {
                        return (
                          <MobileField
                            key={f.name}
                            field={f}
                            country={values.mobileCountry}
                            number={values.mobile}
                            onCountryChange={changeDial}
                            onNumberChange={changeMobile}
                            error={errors.mobile}
                          />
                        );
                      }
                      return (
                        <Field
                          key={f.name}
                          field={f}
                          value={values[f.name]}
                          onChange={update(f.name)}
                          onBlur={f.name === "name" ? tidyName : undefined}
                          error={errors[f.name]}
                        />
                      );
                    })}
                  </div>

                  <hr className="border-mist my-7" />

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

                  <hr className="border-mist my-7" />

                  {/* Step 2 — choose one certification */}
                  <StepLabel>
                    {certStep.label}
                    {certStep.required && (
                      <span className="text-brand"> *</span>
                    )}
                  </StepLabel>
                  {certStep.hint && (
                    <p className="text-slate-soft mt-1 text-xs">
                      {certStep.hint}
                    </p>
                  )}
                  <div
                    role="radiogroup"
                    aria-label={certStep.label}
                    className="mt-4 grid gap-3 sm:grid-cols-2"
                  >
                    {certStep.options.map((opt) => {
                      const checked = values.certifications[0] === opt.code;
                      return (
                        <label
                          key={opt.code}
                          className={`hover:border-brand flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                            checked
                              ? "border-brand bg-[#E8EEFF]"
                              : "border-mist bg-white"
                          }`}
                        >
                          <input
                            type="radio"
                            name="certification"
                            value={opt.code}
                            checked={checked}
                            onChange={() => chooseCert(opt.code)}
                            className="accent-brand h-4 w-4 shrink-0"
                          />
                          <span className="flex flex-col">
                            <span className="text-ink text-sm font-semibold">
                              {opt.label}
                            </span>
                            <span className="text-slate-soft text-xs">
                              {opt.level}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {errors.certifications && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.certifications}
                    </p>
                  )}

                  {status === "error" && serverError && (
                    <p className="mt-5 text-sm text-red-600" aria-live="polite">
                      {serverError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || incomplete}
                    className="bg-brand hover:bg-brand/90 mt-8 w-full rounded-full px-6 py-3.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Submitting…" : submit}
                  </button>
                </fieldset>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
