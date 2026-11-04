"use client";

import { useState } from "react";
import CertSection from "./CertSection";
import certification from "@/data/certification";
import { formatDate } from "@/lib/formatDate";

// Verification Portal: type a certificate number, press Verify, and see whether
// it is valid, expired, revoked or unknown. Calls /api/certificates/verify.
const STATUS = {
  valid: { tone: "bg-green-50 text-green-900", title: "✓ Verified — this certificate is valid" },
  expired: { tone: "bg-amber-50 text-amber-900", title: "This certificate was genuine but has expired" },
  revoked: { tone: "bg-red-50 text-red-900", title: "This certificate has been revoked" },
  not_found: { tone: "bg-red-50 text-red-900", title: "No certificate with this number exists" },
};

export default function CertVerify() {
  const { eyebrow, heading, intro, placeholder, cta, hint } = certification.verify;
  const [number, setNumber] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function verify(event) {
    event.preventDefault();
    if (!number.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/certificates/verify?number=${encodeURIComponent(number.trim())}`);
      setResult(await res.json());
    } catch {
      setResult({ status: "error", message: "Could not reach the server. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  const look = result && STATUS[result.status];

  return (
    <CertSection id="verify" tone="light">
      <div className="rounded-[55px] bg-[linear-gradient(180deg,#0451CC_0%,#022966_100%)] p-10 md:p-14">
        {/* Header — global epm-* classes, recoloured for the dark card */}
        <span className="epm-eyebrow epm-eyebrow-normal font-medium text-white/70">
          {eyebrow}
        </span>
        <h2 className="mt-4 epm-heading leading-[1.05] font-medium tracking-[-2px] text-white">
          {heading}
        </h2>
        <p className="mt-6 max-w-xl epm-body leading-relaxed text-white/80">
          {intro}
        </p>

        {/* Search + verify */}
        <form onSubmit={verify} className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder={placeholder}
            aria-label="Certificate number"
            className="flex-1 rounded-xl bg-white px-5 py-3.5 text-sm text-ink uppercase outline-none placeholder:text-slate-soft/70 placeholder:normal-case"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-brand transition hover:bg-white/90 disabled:opacity-60"
          >
            {loading ? "Checking…" : cta}
          </button>
        </form>
        <p className="mt-4 text-xs text-white/60">{hint}</p>

        {result && (
          <div role="status" className={`mt-6 max-w-xl rounded-2xl p-5 text-sm ${look?.tone ?? "bg-white text-ink"}`}>
            <p className="font-semibold">{look?.title ?? result.message}</p>
            {result.holderName && (
              <dl className="mt-3 grid grid-cols-3 gap-y-1">
                <dt className="opacity-70">Holder</dt>
                <dd className="col-span-2 font-medium">{result.holderName}</dd>
                <dt className="opacity-70">Certification</dt>
                <dd className="col-span-2">
                  {result.certificationCode} — {result.certificationTitle}
                </dd>
                <dt className="opacity-70">Number</dt>
                <dd className="col-span-2 font-mono">{result.number}</dd>
                <dt className="opacity-70">Issued</dt>
                <dd className="col-span-2">{formatDate(result.issuedAt)}</dd>
                <dt className="opacity-70">Valid until</dt>
                <dd className="col-span-2">{formatDate(result.expiresAt)}</dd>
              </dl>
            )}
          </div>
        )}
      </div>
    </CertSection>
  );
}
